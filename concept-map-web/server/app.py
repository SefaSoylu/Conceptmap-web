import os
import subprocess
import pandas as pd
import threading
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'data'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

status = {"processing": False, "done": False, "error": None}

@app.route("/ping", methods=["GET"])
def ping():
    return {"message": "pong"}, 200

def run_concept_mapper_background(domain, vocab, concept_class, concept_col):
    try:
        status["processing"] = True
        status["done"] = False
        status["error"] = None

        # Absolute path to the folder this script is in (i.e., concept-map-web/server)
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))

        # Absolute paths to the two uploaded files
        INPUT_CSV_PATH = os.path.join(BASE_DIR, 'data', 'input_concepts.csv')
        MODEL_PACK_PATH = os.path.join(BASE_DIR, 'data', 'model_pack.zip')
        OUTPUT_CSV_PATH = os.path.join(BASE_DIR, 'data', 'concepts_out.csv')
        output_path = r"C:/Users/golde/OneDrive/Desktop/Workspace/EHRQC/data/concepts_out.csv" # change this to your file path

        python_executable = os.path.join(os.getenv("VIRTUAL_ENV"), "Scripts", "python.exe")

        print("VIRTUAL_ENV:", os.getenv("VIRTUAL_ENV"))

        cmd = [
        python_executable,
        "-m", "ehrqc.standardise.migrate_omop.ConceptMapper",
        domain,
        vocab,
        concept_class,
        INPUT_CSV_PATH,
        concept_col,
        OUTPUT_CSV_PATH,
        f"--model_pack_path={MODEL_PACK_PATH}"
]

        print("Running command:", ' '.join(cmd))
        print("Waiting for subprocess to finish...")

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            cwd=r"C:/Users/golde/OneDrive/Desktop/Workspace/EHRQC" # change this to your file path
        )

        print("Subprocess finished.")
        print("Return code:", result.returncode)
        print("STDOUT:\n", result.stdout)
        print("STDERR:\n", result.stderr)

        print("Checking for output file at:", output_path)
        if not os.path.exists(output_path):
            print("❌ Output CSV not found at expected location.")
            status["error"] = "Output CSV not found."
        else:
            print("✅ Output CSV found.")
            status["done"] = True

        print("Absolute output path:", os.path.abspath(output_path))


    except Exception as e:
        status["error"] = str(e)
        print("Exception during concept mapping:", e)


    finally:
        status["processing"] = False

@app.route("/run-mapper", methods=["POST"])
def run_mapper():
    try:
        domain = request.form["domain"]
        vocab = request.form["vocabulary"]
        concept_class = request.form["conceptClass"]
        concept_col = request.form["conceptColumn"]

        concept_csv = request.files["conceptCsv"]
        concept_csv.save(os.path.join(UPLOAD_FOLDER, "input_concepts.csv"))

        model_pack = request.files["modelPack"]
        model_pack.save(os.path.join(UPLOAD_FOLDER, "model_pack.zip"))

        # Start background thread
        thread = threading.Thread(
            target=run_concept_mapper_background,
            args=(domain, vocab, concept_class, concept_col)
        )
        thread.start()

        return jsonify({"message": "Processing started"}), 202

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/status", methods=["GET"])
def check_status():
    return jsonify(status)

@app.route("/results", methods=["GET"])
def get_results():
    try:
        output_path = r"C:/Users/golde/OneDrive/Desktop/Workspace/EHRQC/data/concepts_out.csv"
        if not os.path.exists(output_path):
            return jsonify({"error": "Output file not found."}), 404

        df = pd.read_csv(output_path)
        df.fillna("", inplace=True)

        grouped = df.groupby("searchPhrase")
        result = []

        confidence_rank = {"Low": 0, "Medium": 1, "High": 2}

        for phrase, group in grouped:
            model_map = {"medcat": {}, "fuzzy": {}, "reverseIndex": {}}

            for _, row in group.iterrows():
                majority_concept = row["majorityVoting"]
                confidence = row["confidence"]

                for model in model_map:
                    concept = row[f"{model}Concept"]
                    if concept == majority_concept:
                        model_map[model] = {"concept": concept, "confidence": confidence}
                    elif "concept" not in model_map[model]:
                        model_map[model] = {"concept": concept, "confidence": "Low"}

            # Score each model
            conf_scores = {
                model: confidence_rank[data["confidence"]]
                for model, data in model_map.items()
            }

            max_score = max(conf_scores.values())
            top_models = [model for model, score in conf_scores.items() if score == max_score]

            # Rule 1 & 2: All Low or All High → default to fuzzy
            if set(conf_scores.values()) == {0} or set(conf_scores.values()) == {2}:
                default_model = "fuzzy"
            # Rule 3: Tie on Medium or mixed
            elif len(top_models) > 1:
                if "fuzzy" in top_models and conf_scores["fuzzy"] > 0:
                    default_model = "fuzzy"
                else:
                    non_fuzzy = [m for m in top_models if m != "fuzzy"]
                    default_model = non_fuzzy[0] if non_fuzzy else "fuzzy"
            # Rule 4: One model is highest
            else:
                default_model = top_models[0]

            result.append({
                "searchPhrase": phrase,
                "models": model_map,
                "defaultModel": default_model
            })

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/download", methods=["GET"])
def download_results():
    try:
        output_path = r"C:/Users/golde/OneDrive/Desktop/Workspace/EHRQC/data/concepts_out.csv" # change this to your file path
        if not os.path.exists(output_path):
            return jsonify({"error": "Output file not found."}), 404
        return send_file(output_path, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
