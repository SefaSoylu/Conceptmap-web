import styles from './NavigationBar.module.scss';

const NavigationBar = () => {
  return (
    <nav className={styles.nav}>
      <h1 className={styles.nav__title}>Concept Mapper</h1>
    </nav>
  );
};

export default NavigationBar;
