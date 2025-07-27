/**
 * Service for OpenAI API interactions
 * This file handles communication with OpenAI's API for analysis of patient data
 */

// Store historical data in localStorage
const HISTORY_KEY = 'diabetesAppHistory';

/**
 * Analyze patient questionnaire data using OpenAI
 * 
 * @param {Object} formData - The form data from the questionnaire
 * @returns {Promise<Object>} The analysis result from OpenAI
 */
export const analyzePatientData = async (formData) => {
  try {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key is missing');
    }
    
    // Format form data for OpenAI
    const prompt = formatPromptForOpenAI(formData);
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system", 
            content: "Eres un asistente especializado en diabetes tipo 1 que analiza respuestas de cuestionarios para proporcionar recomendaciones personalizadas. Usa un tono empático y comprensivo. Tu objetivo es clasificar los hábitos del paciente en 'buenos hábitos', 'hábitos irregulares' o 'falta de control' basado en sus respuestas. Proporciona recomendaciones específicas y adaptadas. Devuelve tu respuesta en formato JSON con la siguiente estructura: { tipo: 'positive'|'warning'|'alert', titulo: string, mensaje: string, recomendaciones: string[], area_conocimiento: 0-10, area_medicacion: 0-10, area_monitoreo: 0-10, area_estilo_vida: 0-10, glucoseInsights: string, medicationInsights: string }"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      throw new Error('Invalid response format from OpenAI');
    }
    
    // Parse the response content as JSON
    const analysis = JSON.parse(data.choices[0].message.content);
    
    // Format the returned data to match our application's structure
    return {
      type: analysis.tipo || 'warning',
      title: analysis.titulo || 'Análisis de sus respuestas',
      message: analysis.mensaje || 'Basado en sus respuestas, hemos realizado un análisis de sus hábitos y conocimientos sobre diabetes.',
      recommendations: analysis.recomendaciones || [],
      areas: {
        knowledge: analysis.area_conocimiento || 5,
        medication: analysis.area_medicacion || 5,
        monitoring: analysis.area_monitoreo || 5,
        lifestyle: analysis.area_estilo_vida || 5,
      },
      score: calculateOverallScore(analysis),
      maxScore: 10,
      glucoseInsights: analysis.glucoseInsights || null,
      medicationInsights: analysis.medicationInsights || null,
    };
  } catch (error) {
    console.error('Error analyzing patient data with OpenAI:', error);
    throw error;
  }
};

/**
 * Calculate overall score from analysis areas
 */
const calculateOverallScore = (analysis) => {
  if (!analysis) return 5;
  
  const areas = [
    analysis.area_conocimiento || 0,
    analysis.area_medicacion || 0,
    analysis.area_monitoreo || 0,
    analysis.area_estilo_vida || 0
  ];
  
  // Calculate average and round to nearest integer
  return Math.round(areas.reduce((sum, score) => sum + score, 0) / areas.length);
};

/**
 * Format the form data into a prompt for OpenAI
 */
const formatPromptForOpenAI = (formData) => {
  return `
Analiza las siguientes respuestas de un paciente con diabetes tipo 1:

Rango de edad: ${formData.ageRange === '40-45' ? '40-45 años' : formData.ageRange === '45-50' ? '45-50 años' : '50-60 años'}

Conocimiento sobre diabetes tipo 1: ${formData.knowledgeAboutDiabetes === 'yes' ? 'Sí' : 'No'}

Frecuencia de medicación: ${formData.medicationFrequency === 'daily' ? 'Todos los días' : formData.medicationFrequency === 'almostAlways' ? 'Casi siempre' : 'Rara vez'}

Hábitos saludables: ${formData.healthyHabits || 'No especificado'}

Control de glucosa: ${formData.glucoseMonitoring === 'every12Hours' ? 'Cada 12 horas' : formData.glucoseMonitoring === 'everyDay' ? 'Cada día' : 'Casi nunca lo hago'}

Uso de apps de salud: ${formData.usesHealthApp === 'yes' ? 'Sí' : 'No'}

Opinión sobre aplicaciones para diabetes: ${formData.appHelpfulReason || 'No especificado'}

Funciones deseadas en una app:
${formData.desiredFeatures.includes('glucoseTracking') ? '- Registro de niveles de glucosa\n' : ''}${formData.desiredFeatures.includes('medicationReminders') ? '- Recordatorios de medicación\n' : ''}${formData.desiredFeatures.includes('mealPlans') ? '- Planes de alimentación\n' : ''}${formData.desiredFeatures.includes('exerciseRoutines') ? '- Rutinas de ejercicio\n' : ''}${formData.desiredFeatures.includes('healthcareContacts') ? '- Contacto de profesionales de salud\n' : ''}

Proporciona un análisis detallado, califica las áreas en una escala de 0-10 y da recomendaciones personalizadas con un tono empático y comprensivo.
`;
};

/**
 * Save user form data and analysis to history
 * 
 * @param {Object} formData - The form data from the questionnaire
 * @param {Object} analysis - The analysis result (from AI or local calculation)
 * @returns {Array} Updated history array
 */
export const saveUserHistoryData = (formData, analysis) => {
  try {
    // Get existing history from localStorage
    const existingHistory = getUserHistoryData();
    
    // Create a new history entry
    const newEntry = {
      date: new Date().toISOString(),
      formData: formData,
      analysis: analysis,
      scores: {
        overall: analysis.score || 5,
        areas: analysis.areas || {
          knowledge: 5,
          medication: 5,
          monitoring: 5,
          lifestyle: 5
        }
      }
    };
    
    // Add to history
    const updatedHistory = [...existingHistory, newEntry];
    
    // Save to localStorage
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    
    return updatedHistory;
  } catch (error) {
    console.error('Error saving history data:', error);
    return [];
  }
};

/**
 * Get user history data from localStorage
 * 
 * @returns {Array} Array of history entries
 */
export const getUserHistoryData = () => {
  try {
    const historyJson = localStorage.getItem(HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error('Error getting history data:', error);
    return [];
  }
};