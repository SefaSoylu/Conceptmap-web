import { useState } from 'react';
import styles from './ConceptMapperPage.module.scss';

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
            <p>Inputs section open. Form will be here.</p>
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
