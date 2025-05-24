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
    let csvContent = "searchPhrase,selectedModel\n";

    results.forEach((row) => {
      const phrase = row.searchPhrase;
      const selectedModel = selectedModels[phrase] || row.defaultModel;
      const conceptName = row.models[selectedModel]?.concept
      csvContent += `${phrase},${conceptName}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "selected_models.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

            
            <table className="legend">
              <thead>
                <tr>Confidence</tr>
                <tr className="confidence-high">High</tr>
                <tr className="confidence-medium">Medium</tr>
                <tr className="confidence-low">Low</tr>
              </thead>
            </table>

            <table className="results-table">
              <thead>
                <tr>
                  <th>Search Phrase</th>
                  <th>Fuzzy Concept</th>
                  <th>MedCat Concept</th>
                  <th>Reverse Index Concept</th>
                  <th>Selected</th>
                </tr>
              </thead>
              <tbody>
              {results.map((row, i) => {
                const phrase = row.searchPhrase;
                const selectedModel = selectedModels[phrase] || row.defaultModel;
                const modelData = row.models[selectedModel];

                console.log(results);

                return (
                  <tr
                    key={i}
                    className={
                      modelData.confidence === "High"
                        ? "confidence-high"
                        : modelData.confidence === "Medium"
                        ? "confidence-medium"
                        : "confidence-low"
                    }
                  >
                    <td>{phrase}</td>
                    {Object.entries(row.models).map(([model, data]) => (
                      <td key={model}>
                        {data.confidence !== "High" ? (
                          <>
                            {data.concept !== '' ? (
                              <input
                              type="radio"
                              name={`model-select-${i}`} // One selection per row
                              checked={selectedModel === model}
                              value={model}
                              onChange={() => handleSelectChange(phrase, model)}
                            />
                            ): (
                              <p>N/A</p>
                            )}
                            
                            {data.concept}
                          </>
                        ) : (
                          <>{data.concept}</>
                        )}
                      </td>
                    ))}
                    <td>{modelData.concept}</td>
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
