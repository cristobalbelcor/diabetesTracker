import React, { useState } from 'react';
import QuestionnaireForm from '../components/QuestionnaireForm';
import Results from '../components/Results';

function App() {
  const [formData, setFormData] = useState(null);
  const [showResults, setShowResults] = useState(false);
  
  const handleFormSubmit = (data) => {
    setFormData(data);
    setShowResults(true);
    window.scrollTo(0, 0);
  };
  
  const handleReset = () => {
    setFormData(null);
    setShowResults(false);
    window.scrollTo(0, 0);
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">DiabetesControl</h1>
          {showResults && (
            <button 
              onClick={handleReset}
              className="px-4 py-2 text-sm bg-white text-blue-800 rounded hover:bg-gray-100 transition"
            >
              <i className="fas fa-redo mr-1"></i> Nuevo Cuestionario
            </button>
          )}
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4">
        {showResults ? (
          <Results formData={formData} onReset={handleReset} />
        ) : (
          <QuestionnaireForm onSubmit={handleFormSubmit} />
        )}
      </main>
      
      <footer className="bg-gray-800 text-gray-300 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-white mb-2">DiabetesControl</h3>
              <p className="text-sm">Una aplicación para ayudar a personas con Diabetes Tipo 1 a mejorar su control y calidad de vida.</p>
            </div>
            
            <div className="text-sm text-center md:text-right">
              <p>© {new Date().getFullYear()} DiabetesControl</p>
              <p className="mt-1">
                <a href="#privacy" className="text-blue-300 hover:text-white mr-4">Política de Privacidad</a>
                <a href="#terms" className="text-blue-300 hover:text-white">Términos de Uso</a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;