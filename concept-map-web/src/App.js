import './App.css';
import ConceptMapperForm from './pages/ConceptMapperForm';
import NavigationBar from './components/NavigationBar/NavigationBar';
import HomePage from './pages/HomePage/HomePage';
import ConceptMapperPage from './pages/ConceptMapperPage/ConceptMapperPage';

function App() {
  return (
    // <div className="App">
    //   <header className="App-header">
    //     <ConceptMapperForm />
    //   </header>
    // </div>
    <div className="App">
      <NavigationBar />
      {/* <HomePage /> */}
      <ConceptMapperPage />
    </div>
  );
}

export default App;
