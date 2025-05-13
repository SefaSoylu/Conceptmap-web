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
  const [results, setResults] = useState(false);

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
            <form className={styles.inputs__form}>
              <div className={styles.inputs__text_inputs}>
                <TextField
                  id="outlined-basic"
                  label="Domain ID"
                  variant="outlined"
                />
                <TextField
                  id="outlined-basic"
                  label="Vocabulary ID"
                  variant="outlined"
                />
                <TextField
                  id="outlined-basic"
                  label="Concept class ID"
                  variant="outlined"
                />
                <TextField
                  id="outlined-basic"
                  label="Concept name row"
                  variant="outlined"
                />
              </div>
              <div>
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
                      onChange={(event) => console.log(event.target.files)}
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
                      onChange={(event) => console.log(event.target.files)}
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
                <Button variant="contained">Run Concept Mapper</Button>
              </div>
            </form>
          </>
        )}
      </div>
      <div className={styles.results}>
        <h2>Results</h2>
        {results ? (
          <p>Results shown.</p>
        ) : (
          <p>Results will appear here upon successful concept mapping.</p>
        )}
      </div>
    </div>
  );
};

export default ConceptMapperPage;
