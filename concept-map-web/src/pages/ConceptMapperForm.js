import { useState } from "react";
import "../concept-mapper.css";

function ConceptMapperForm() {
  const [status, setStatus] = useState("");
  const [results, setResults] = useState([]);
  const [selectedModels, setSelectedModels] = useState({});
  const [formData, setFormData] = useState({
    domain: "",
    vocabulary: "",
    conceptClass: "",
    conceptColumn: "",
    conceptCsv: null,
    modelPack: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: files[0] }));
  };

  const handleDownload = () => {
    window.open("http://localhost:5001/download", "_blank");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("🛠️ Starting Concept Mapper... This may take a few minutes.");
    setResults([]);

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => form.append(key, value));

    try {
      const response = await fetch("http://localhost:5001/run-mapper", {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        const error = await response.json();
        setStatus(`❌ Error: ${error.error}`);
        return;
      }

      const checkStatus = async () => {
        const res = await fetch("http://localhost:5001/status");
        const data = await res.json();

        if (data.error) {
          setStatus(`❌ Failed: ${data.error}`);
        } else if (data.done) {
          setStatus("✅ Concept mapping complete! Fetching results...");

          const resultRes = await fetch("http://localhost:5001/results");
          const resultData = await resultRes.json();

          if (Array.isArray(resultData)) {
            setResults(resultData);
            const initialSelections = {};
            resultData.forEach((row) => {
              initialSelections[row.searchPhrase] = row.defaultModel;
            });
            setSelectedModels(initialSelections);
            setStatus("🎉 Mapping completed. Results loaded.");
          } else {
            setStatus(`⚠️ Error loading results: ${resultData.error}`);
          }
        } else if (data.processing) {
          setStatus("⏳ Still processing...");
          setTimeout(checkStatus, 5000);
        } else {
          setStatus("⚠️ Unexpected status.");
        }
      };

      setTimeout(checkStatus, 5000);
    } catch (err) {
      console.error(err);
      setStatus("❌ An error occurred while calling the server.");
    }
  };

  const handleSelectChange = (phrase, selectedModel) => {
    setSelectedModels((prev) => ({
      ...prev,
      [phrase]: selectedModel,
    }));
  };

  return (
    <>
      <div className="navbar">
        <div className="navbar-content">
          <h1 className="navbar-title">Concept Mapper</h1>
        </div>
      </div>

      <div className="mapper-container">
        <form className="mapper-form" onSubmit={handleSubmit}>
          <input
            className="input"
            type="text"
            name="domain"
            placeholder="Domain"
            value={formData.domain}
            onChange={handleChange}
          />
          <input
            className="input"
            type="text"
            name="vocabulary"
            placeholder="Vocabulary"
            value={formData.vocabulary}
            onChange={handleChange}
          />
          <input
            className="input"
            type="text"
            name="conceptClass"
            placeholder="Concept Class"
            value={formData.conceptClass}
            onChange={handleChange}
          />
          <input
            className="input"
            type="text"
            name="conceptColumn"
            placeholder="Concept Column"
            value={formData.conceptColumn}
            onChange={handleChange}
          />
          <input
            className="file-input"
            type="file"
            name="conceptCsv"
            onChange={handleFileChange}
          />
          <input
            className="file-input"
            type="file"
            name="modelPack"
            onChange={handleFileChange}
          />
          <button className="submit-btn" type="submit">
            Run Concept Mapper
          </button>
        </form>

        <p className="status">{status}</p>

        {results.length > 0 && (
          <div className="results-container">
            <h2>Results</h2>
            <button className="download-btn" onClick={handleDownload}>
              ⬇️ Download Results (CSV)
            </button>

            <table className="results-table">
              <thead>
                <tr>
                  <th>Search Phrase</th>
                  <th>Model</th>
                  <th>Concept</th>
                  <th>Confidence</th>
                </tr>
              </thead>
              <tbody>
              {results.map((row, i) => {
                const phrase = row.searchPhrase;
                const selectedModel = selectedModels[phrase] || row.defaultModel;
                const modelData = row.models[selectedModel];

                return (
                  <tr key={i}>
                    <td>{phrase}</td>
                    <td>
                      <select
                        value={selectedModel}
                        onChange={(e) => handleSelectChange(phrase, e.target.value)}
                      >
                        {Object.entries(row.models).map(([model, data]) => (
                          <option key={model} value={model}>
                          {model.charAt(0).toUpperCase() + model.slice(1)}
                        </option>
                        ))}
                      </select>
                    </td>
                    <td>{modelData.concept}</td>
                    <td>{modelData.confidence}</td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default ConceptMapperForm;
