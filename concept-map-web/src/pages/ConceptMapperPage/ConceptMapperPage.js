import styles from './ConceptMapperPage.module.scss';

const ConceptMapperPage = () => {
  return (
    <div className={styles.wrapper}>
      <div>
        <p>Input section</p>
      </div>
      <div className={styles.results_wrapper}>
        <p>Results section</p>
      </div>
    </div>
  );
};

export default ConceptMapperPage;
