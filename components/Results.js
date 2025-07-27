import React, { useState, useEffect } from 'react';
import { generatePDF } from '../utils/PDFGenerator';
import { calculateRecommendations } from '../utils/calculateRecommendations';
import { analyzePatientData, saveUserHistoryData, getUserHistoryData } from '../utils/openAIService';
import { analyzeUserTrends } from '../utils/dataAnalysis';
import HistoryChart from './HistoryChart';

function Results({ formData, onReset }) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [trendAnalysis, setTrendAnalysis] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  // Get AI analysis and recommendations
  useEffect(() => {
    const getAnalysis = async () => {
      setIsAnalyzing(true);
      try {
        // Try to get AI analysis
        const aiResult = await analyzePatientData(formData);
        setAiAnalysis(aiResult);
        
        // Calculate recommendations (will use AI if available, fallback otherwise)
        const recs = calculateRecommendations(formData, aiResult);
        setRecommendations(recs);
        
        // Save to history and update trends
        const updatedHistory = saveUserHistoryData(formData, aiResult || recs);
        setHistoryData(updatedHistory);
        
        if (updatedHistory.length >= 2) {
          const trends = analyzeUserTrends(updatedHistory);
          setTrendAnalysis(trends);
        }
      } catch (error) {
        console.error('Error analyzing data:', error);
        // Fallback to local calculation if AI fails
        const localRecs = calculateRecommendations(formData, null);
        setRecommendations(localRecs);
        
        // Still save to history
        const updatedHistory = saveUserHistoryData(formData, localRecs);
        setHistoryData(updatedHistory);
        
        if (updatedHistory.length >= 2) {
          const trends = analyzeUserTrends(updatedHistory);
          setTrendAnalysis(trends);
        }
      } finally {
        setIsAnalyzing(false);
      }
    };

    getAnalysis();
  }, [formData]);

  // Load historical data on component mount
  useEffect(() => {
    const loadHistory = () => {
      const history = getUserHistoryData();
      setHistoryData(history);
      
      if (history.length >= 2) {
        const trends = analyzeUserTrends(history);
        setTrendAnalysis(trends);
      }
    };
    
    loadHistory();
  }, []);

  // Handle PDF download
  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await generatePDF(formData, recommendations);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Hubo un problema al generar el PDF. Por favor, intente nuevamente.');
    }
    setIsGeneratingPDF(false);
  };

  // Sharing functions
  const handleShare = async () => {
    const text = `Recomendaciones para mi diabetes:\n\n${recommendations.title}\n\n${recommendations.message}\n\nRecomendaciones:\n${recommendations.recommendations.join('\n')}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mis Recomendaciones de DiabetesControl',
          text: text,
        });
      } catch (error) {
        console.error('Error al compartir:', error);
        // Fallback for sharing via email
        handleShareViaEmail();
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      handleShareViaEmail();
    }
  };

  const handleShareViaEmail = () => {
    const subject = encodeURIComponent('Mis Recomendaciones de DiabetesControl');
    const body = encodeURIComponent(`Recomendaciones para mi diabetes:\n\n${recommendations.title}\n\n${recommendations.message}\n\nRecomendaciones:\n${recommendations.recommendations.join('\n')}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleShareViaWhatsApp = () => {
    const text = encodeURIComponent(`*Mis Recomendaciones de DiabetesControl*\n\n*${recommendations.title}*\n\n${recommendations.message}\n\n*Recomendaciones:*\n${recommendations.recommendations.join('\n')}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Toggle history view
  const toggleHistoryView = () => {
    setShowHistory(!showHistory);
  };

  // Show loading state while analyzing
  if (isAnalyzing || !recommendations) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 text-center">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">
            Analizando sus respuestas...
          </h2>
          <p className="text-gray-500 mt-2">
            Estamos procesando sus datos para generar recomendaciones personalizadas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-blue-800">
          Resultados y Recomendaciones
        </h2>
        <p className="text-gray-600 mt-2">
          Basado en sus respuestas, hemos generado las siguientes recomendaciones
        </p>
      </div>

      {/* Main recommendation panel */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className={`text-xl font-semibold mb-3 ${
          recommendations.type === 'positive' ? 'text-green-600' : 
          recommendations.type === 'warning' ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {recommendations.title}
        </div>
        <p className="text-gray-700 mb-4">{recommendations.message}</p>
        
        <h3 className="font-semibold text-blue-800 mb-2">Recomendaciones:</h3>
        <ul className="list-disc pl-5 space-y-2">
          {recommendations.recommendations.map((rec, index) => (
            <li key={index} className="text-gray-700">{rec}</li>
          ))}
        </ul>
      </div>

      {/* Insights panels */}
      {(recommendations.glucoseInsights || recommendations.medicationInsights) && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.glucoseInsights && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">
                <i className="fas fa-chart-line mr-2"></i> 
                Sobre su control de glucosa
              </h3>
              <p className="text-gray-700">{recommendations.glucoseInsights}</p>
            </div>
          )}
          
          {recommendations.medicationInsights && (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-800 mb-2">
                <i className="fas fa-pills mr-2"></i> 
                Sobre su medicación
              </h3>
              <p className="text-gray-700">{recommendations.medicationInsights}</p>
            </div>
          )}
        </div>
      )}

      {/* History section */}
      {historyData.length >= 2 && (
        <div className="mb-6">
          <button 
            onClick={toggleHistoryView}
            className="w-full flex items-center justify-between p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 transition"
          >
            <div className="flex items-center">
              <i className="fas fa-history mr-2"></i>
              <span className="font-medium">Historial y Evolución</span>
            </div>
            <i className={`fas fa-chevron-${showHistory ? 'up' : 'down'}`}></i>
          </button>
          
          {showHistory && trendAnalysis && (
            <div className="mt-4">
              <HistoryChart 
                historyData={historyData} 
                trendAnalysis={trendAnalysis} 
              />
            </div>
          )}
        </div>
      )}

      {/* User response summary */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <h3 className="font-semibold text-blue-800 mb-3">Resumen de sus respuestas:</h3>
        <dl className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b border-gray-200">
            <dt className="font-medium text-gray-600">Rango de edad:</dt>
            <dd className="md:col-span-2 text-gray-800">
              {formData.ageRange === '40-45' && '40-45 años'}
              {formData.ageRange === '45-50' && '45-50 años'}
              {formData.ageRange === '50-60' && '50-60 años'}
            </dd>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b border-gray-200">
            <dt className="font-medium text-gray-600">Conocimiento sobre diabetes tipo 1:</dt>
            <dd className="md:col-span-2 text-gray-800">
              {formData.knowledgeAboutDiabetes === 'yes' ? 'Sí' : 'No'}
            </dd>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b border-gray-200">
            <dt className="font-medium text-gray-600">Frecuencia de medicación:</dt>
            <dd className="md:col-span-2 text-gray-800">
              {formData.medicationFrequency === 'daily' && 'Todos los días'}
              {formData.medicationFrequency === 'almostAlways' && 'Casi siempre'}
              {formData.medicationFrequency === 'rarely' && 'Rara vez'}
            </dd>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b border-gray-200">
            <dt className="font-medium text-gray-600">Hábitos saludables:</dt>
            <dd className="md:col-span-2 text-gray-800 whitespace-pre-line">
              {formData.healthyHabits || 'No especificado'}
            </dd>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b border-gray-200">
            <dt className="font-medium text-gray-600">Control de glucosa:</dt>
            <dd className="md:col-span-2 text-gray-800">
              {formData.glucoseMonitoring === 'every12Hours' && 'Cada 12 horas'}
              {formData.glucoseMonitoring === 'everyDay' && 'Cada día'}
              {formData.glucoseMonitoring === 'rarely' && 'Casi nunca lo hago'}
            </dd>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b border-gray-200">
            <dt className="font-medium text-gray-600">Uso de apps de salud:</dt>
            <dd className="md:col-span-2 text-gray-800">
              {formData.usesHealthApp === 'yes' ? 'Sí' : 'No'}
            </dd>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2 border-b border-gray-200">
            <dt className="font-medium text-gray-600">Opinión sobre aplicaciones para diabetes:</dt>
            <dd className="md:col-span-2 text-gray-800 whitespace-pre-line">
              {formData.appHelpfulReason || 'No especificado'}
            </dd>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 py-2">
            <dt className="font-medium text-gray-600">Funciones deseadas en una app:</dt>
            <dd className="md:col-span-2 text-gray-800">
              <ul className="list-disc pl-5">
                {formData.desiredFeatures.includes('glucoseTracking') && (
                  <li>Registro de niveles de glucosa</li>
                )}
                {formData.desiredFeatures.includes('medicationReminders') && (
                  <li>Recordatorios de medicación</li>
                )}
                {formData.desiredFeatures.includes('mealPlans') && (
                  <li>Planes de alimentación</li>
                )}
                {formData.desiredFeatures.includes('exerciseRoutines') && (
                  <li>Rutinas de ejercicio</li>
                )}
                {formData.desiredFeatures.includes('healthcareContacts') && (
                  <li>Contacto de profesionales de salud</li>
                )}
              </ul>
            </dd>
          </div>
        </dl>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-4 justify-center mt-8">
        <button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 transition disabled:bg-blue-400"
        >
          {isGeneratingPDF ? (
            <><i className="fas fa-circle-notch fa-spin mr-2"></i> Generando PDF...</>
          ) : (
            <><i className="fas fa-file-pdf mr-2"></i> Descargar como PDF</>
          )}
        </button>
        
        <button
          onClick={handleShareViaWhatsApp}
          className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg text-lg font-medium hover:bg-green-700 transition"
        >
          <i className="fab fa-whatsapp mr-2"></i> Compartir por WhatsApp
        </button>
        
        <button
          onClick={handleShareViaEmail}
          className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg text-lg font-medium hover:bg-red-700 transition"
        >
          <i className="fas fa-envelope mr-2"></i> Compartir por Email
        </button>
      </div>

      <div className="text-center mt-8">
        <button
          onClick={onReset}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg text-lg font-medium hover:bg-gray-300 transition"
        >
          <i className="fas fa-redo mr-2"></i> Completar nuevo cuestionario
        </button>
      </div>
    </div>
  );
}

export default Results;
