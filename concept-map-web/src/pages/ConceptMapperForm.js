import React, { useState } from "react";

function ConceptMapperForm() {
  const [status, setStatus] = useState("");
  const [results, setResults] = useState([]);
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
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDownload = () => {
    window.open("http://localhost:5001/download", "_blank");
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("🛠️ Starting Concept Mapper... This may take a few minutes.");
    setResults([]); // Clear previous results

    const form = new FormData();
    form.append("domain", formData.domain);
    form.append("vocabulary", formData.vocabulary);
    form.append("conceptClass", formData.conceptClass);
    form.append("conceptColumn", formData.conceptColumn);
    form.append("conceptCsv", formData.conceptCsv);
    form.append("modelPack", formData.modelPack);

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

      // Poll for status
      const checkStatus = async () => {
        const res = await fetch("http://localhost:5001/status");
        const data = await res.json();

        if (data.error) {
          setStatus(`❌ Failed: ${data.error}`);
        } else if (data.done) {
          setStatus("✅ Concept mapping complete! Fetching results...");

          // Now fetch the results
          const resultRes = await fetch("http://localhost:5001/results");
          const resultData = await resultRes.json();

          if (Array.isArray(resultData)) {
            setResults(resultData);
            setStatus("🎉 Mapping completed. Results loaded.");
          } else {
            setStatus(`⚠️ Error loading results: ${resultData.error}`);
          }
        } else if (data.processing) {
          setStatus("⏳ Still processing...");
          setTimeout(checkStatus, 5000); // check again in 5 sec
        } else {
          setStatus("⚠️ Unexpected status.");
        }
      };

      // Start polling
      setTimeout(checkStatus, 5000);
    } catch (err) {
      console.error(err);
      setStatus("❌ An error occurred while calling the server.");
    }
  };

  return (
    <div>
      <h1>Concept Mapper</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="domain"
          placeholder="Domain"
          value={formData.domain}
          onChange={handleChange}
        />
        <input
          type="text"
          name="vocabulary"
          placeholder="Vocabulary"
          value={formData.vocabulary}
          onChange={handleChange}
        />
        <input
          type="text"
          name="conceptClass"
          placeholder="Concept Class"
          value={formData.conceptClass}
          onChange={handleChange}
        />
        <input
          type="text"
          name="conceptColumn"
          placeholder="Concept Column"
          value={formData.conceptColumn}
          onChange={handleChange}
        />
        <input type="file" name="conceptCsv" onChange={handleFileChange} />
        <input type="file" name="modelPack" onChange={handleFileChange} />
        <button type="submit">Run Concept Mapper</button>
      </form>

      <p>Status: {status}</p>

      {results.length > 0 && (
        <div>
          <h2>Results</h2>
            <a href="http://localhost:5001/download" download>
                <button onClick={handleDownload}>⬇️ Download Results (CSV)</button>
            </a>
          <table border="1">
            <thead>
              <tr>
                {Object.keys(results[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((val, i) => (
                    <td key={i}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ConceptMapperForm;
