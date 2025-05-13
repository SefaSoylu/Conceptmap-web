import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import styles from './ConceptMapperPage.module.scss';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const ConceptMapperPage = () => {
  const [toggle, setToggle] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    domain: '',
    vocabulary: '',
    conceptClass: '',
    conceptColumn: '',
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
    window.open('http://localhost:5001/download', '_blank');
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
    setLoading(true);
    setResults([]); // Clear previous results

    const form = new FormData();
    form.append('domain', formData.domain);
    form.append('vocabulary', formData.vocabulary);
    form.append('conceptClass', formData.conceptClass);
    form.append('conceptColumn', formData.conceptColumn);
    form.append('conceptCsv', formData.conceptCsv);
    form.append('modelPack', formData.modelPack);

    try {
      const response = await fetch('http://localhost:5001/run-mapper', {
        method: 'POST',
        body: form,
      });

      if (!response.ok) {
        const error = await response.json();
        setLoading(false);
        setError(`${error.error}`);
        return;
      }

      // Poll for status
      const checkStatus = async () => {
        const res = await fetch('http://localhost:5001/status');
        const data = await res.json();

        if (data.error) {
          setLoading(false);
          setError(`${data.error}`);
        } else if (data.done) {
          // Now fetch the results
          const resultRes = await fetch('http://localhost:5001/results');
          const resultData = await resultRes.json();

          if (Array.isArray(resultData)) {
            setResults(resultData);
            setLoading(false);
          } else {
            setError(`${resultData.error}`);
            setLoading(false);
          }
        } else if (data.processing) {
          setTimeout(checkStatus, 5000); // check again in 5 sec
        } else {
          setLoading(false);
          setError(
            'Something unexpected happened. Please reload and try again.'
          );
        }
      };
      // Start polling
      setTimeout(checkStatus, 5000);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError(
        'An error occurred while calling the server. Please reload and try again.'
      );
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.inputs}>
        <button onClick={() => setToggle(!toggle)}>
          {toggle ? 'Open' : 'Close'}
        </button>
        {toggle ? (
          <h2 className={styles.inputs__closed__heading}>Inputs</h2>
        ) : (
          <>
            <h2>Inputs</h2>
            <form className={styles.inputs__form} onSubmit={handleSubmit}>
              <div className={styles.inputs__text_inputs}>
                <TextField
                  id="outlined-basic"
                  label="Domain ID"
                  variant="outlined"
                  name="domain"
                  value={formData.domain}
                  onChange={handleChange}
                />
                <TextField
                  id="outlined-basic"
                  label="Vocabulary ID"
                  variant="outlined"
                  name="vocabulary"
                  value={formData.vocabulary}
                  onChange={handleChange}
                />
                <TextField
                  id="outlined-basic"
                  label="Concept class ID"
                  variant="outlined"
                  name="conceptClass"
                  value={formData.conceptClass}
                  onChange={handleChange}
                />
                <TextField
                  id="outlined-basic"
                  label="Concept name row"
                  variant="outlined"
                  name="conceptColumn"
                  value={formData.conceptColumn}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.inputs__file_inputs}>
                <div className={styles.input__file_upload}>
                  <Button
                    component="label"
                    role={undefined}
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon />}
                  >
                    Upload file
                    <VisuallyHiddenInput
                      type="file"
                      name="conceptCsv"
                      onChange={handleFileChange}
                      multiple
                    />
                  </Button>
                  <span className={styles.input__file_upload__description}>
                    Concepts to map
                  </span>
                </div>

                <div className={styles.input__file_upload}>
                  <Button
                    component="label"
                    role={undefined}
                    variant="contained"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon />}
                  >
                    Upload file
                    <VisuallyHiddenInput
                      type="file"
                      name="modelPack"
                      onChange={handleFileChange}
                      multiple
                    />
                  </Button>
                  <span className={styles.input__file_upload__description}>
                    File to save to
                  </span>
                </div>
              </div>
              <div className={styles.inputs__end_buttons}>
                <Button variant="contained">Clear</Button>
                <Button variant="contained" type="submit">
                  Run Concept Mapper
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
      <div className={styles.results}>
        <h2>Results</h2>
        {loading && <p>Loading...</p>}
        {error && !loading && <p>{error}</p>}
        {results.length === 0 ? (
          <p>Results will appear here upon successful concept mapping.</p>
        ) : (
          <>
            <button className="download-btn" onClick={handleDownload}>
              ⬇️ Download Results (CSV)
            </button>
            <table>
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
          </>
        )}
      </div>
    </div>
  );
};

export default ConceptMapperPage;
