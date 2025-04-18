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

        output_path = r"C:/Users/golde/OneDrive/Desktop/workspace/EHRQC/data/concepts_out.csv" # change this to your file path

        python_executable = os.path.join(os.getenv("VIRTUAL_ENV"), "Scripts", "python.exe")

        print("VIRTUAL_ENV:", os.getenv("VIRTUAL_ENV"))

        cmd = [
            python_executable,
            "-m", "ehrqc.standardise.migrate_omop.ConceptMapper",
            domain,
            vocab,
            concept_class,
            "data/input_concepts.csv",
            concept_col,
            "data/concepts_out.csv",
            f"--model_pack_path=data/model_pack.zip"
        ]

        print("Running command:", ' '.join(cmd))
        print("Waiting for subprocess to finish...")

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            cwd=r"C:/Users/golde/Onedrive/Desktop/workspace/EHRQC" # change this to your file path
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
        output_path = r"C:/Users/golde/OneDrive/Desktop/workspace/EHRQC/data/concepts_out.csv" # change this to your file path
        if not os.path.exists(output_path):
            return jsonify({"error": "Output file not found."}), 404
        df = pd.read_csv(output_path)
        # Replace NaN with None (which becomes `null` in JSON)
        return jsonify(df.where(pd.notnull(df), None).to_dict(orient="records"))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/download", methods=["GET"])
def download_results():
    try:
        output_path = r"C:/Users/golde/OneDrive/Desktop/workspace/EHRQC/data/concepts_out.csv" # change this to your file path
        if not os.path.exists(output_path):
            return jsonify({"error": "Output file not found."}), 404
        return send_file(output_path, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
