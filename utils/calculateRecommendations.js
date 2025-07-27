/**
 * Calculate recommendations based on questionnaire responses
 * Enhanced with AI analysis when available, or falls back to local calculation
 * 
 * @param {Object} formData - The form data from the questionnaire
 * @param {Object} aiAnalysis - The analysis results from OpenAI (optional)
 * @returns {Object} An object containing recommendation information
 */
export const calculateRecommendations = (formData, aiAnalysis = null) => {
  // If we have AI analysis, use it
  if (aiAnalysis) {
    return {
      ...aiAnalysis,
      glucoseInsights: aiAnalysis.glucoseInsights || generateGlucoseInsights(formData.glucoseMonitoring),
      medicationInsights: aiAnalysis.medicationInsights || generateMedicationInsights(formData.medicationFrequency)
    };
  }
  
  // Otherwise, calculate locally
  let score = 0;
  const maxScore = 10;
  const areas = {};
  
  // Assess knowledge
  areas.knowledge = formData.knowledgeAboutDiabetes === 'yes' ? 8 : 4;
  
  // Assess medication adherence
  if (formData.medicationFrequency === 'daily') {
    areas.medication = 9;
  } else if (formData.medicationFrequency === 'almostAlways') {
    areas.medication = 6;
  } else {
    areas.medication = 3;
  }
  
  // Assess glucose monitoring
  if (formData.glucoseMonitoring === 'every12Hours') {
    areas.monitoring = 9;
  } else if (formData.glucoseMonitoring === 'everyDay') {
    areas.monitoring = 7;
  } else {
    areas.monitoring = 3;
  }
  
  // Assess lifestyle based on healthy habits description
  const healthyHabits = formData.healthyHabits || '';
  const healthyHabitsLower = healthyHabits.toLowerCase();
  
  if (
    healthyHabitsLower.includes('ejercicio') || 
    healthyHabitsLower.includes('deporte') || 
    healthyHabitsLower.includes('caminar')
  ) {
    areas.lifestyle = 8;
  } else if (
    healthyHabitsLower.includes('dieta') || 
    healthyHabitsLower.includes('alimentación') ||
    healthyHabitsLower.includes('comer')
  ) {
    areas.lifestyle = 7;
  } else if (healthyHabits.length > 20) {
    areas.lifestyle = 6;
  } else {
    areas.lifestyle = 4;
  }
  
  // Calculate overall score
  score = Math.round(
    (areas.knowledge + areas.medication + areas.monitoring + areas.lifestyle) / 4
  );
  
  // Determine recommendation type based on overall score
  let type, title, message;
  
  if (score >= 8) {
    type = 'positive';
    title = '¡Excelente control de su diabetes!';
    message = 'Está haciendo un gran trabajo en el manejo de su diabetes. Continúe con estos buenos hábitos y manténgase en contacto con su equipo médico para seguir mejorando su calidad de vida.';
  } else if (score >= 5) {
    type = 'warning';
    title = 'Control moderado de su diabetes';
    message = 'Está en el camino correcto, pero hay aspectos que podrían mejorar. Con pequeños ajustes en su rutina diaria, puede lograr un mejor control de su diabetes y prevenir complicaciones futuras.';
  } else {
    type = 'alert';
    title = 'Control insuficiente de su diabetes';
    message = 'Es importante mejorar el control de su diabetes. Los resultados muestran que hay áreas que requieren atención inmediata. No se desanime, con el apoyo adecuado y cambios en sus hábitos, puede mejorar significativamente su salud.';
  }
  
  // Generate specific recommendations based on areas
  const recommendations = [];
  
  // Knowledge recommendations
  if (areas.knowledge < 7) {
    recommendations.push('Considere participar en programas educativos sobre diabetes para ampliar sus conocimientos sobre la enfermedad.');
    recommendations.push('Busque información confiable en asociaciones de diabetes reconocidas y consulte regularmente con su médico para aclarar dudas.');
  }
  
  // Medication recommendations
  if (areas.medication < 7) {
    recommendations.push('Establezca recordatorios diarios para no olvidar tomar su medicación según lo prescrito por su médico.');
    recommendations.push('Utilice un pastillero organizador semanal para facilitar el seguimiento de su medicación.');
  }
  
  // Monitoring recommendations
  if (areas.monitoring < 7) {
    recommendations.push('Monitoree su glucosa con mayor frecuencia, idealmente al menos dos veces al día (mañana y noche).');
    recommendations.push('Lleve un registro detallado de sus niveles de glucosa para identificar patrones y compartirlo con su médico.');
  }
  
  // Lifestyle recommendations
  if (areas.lifestyle < 7) {
    recommendations.push('Incorpore actividad física regular a su rutina, como caminar 30 minutos diarios.');
    recommendations.push('Siga una dieta equilibrada, limitando los carbohidratos refinados y controlando el tamaño de las porciones.');
  }
  
  // If user doesn't use health apps but wants to
  if (formData.usesHealthApp === 'no') {
    recommendations.push('Considere usar aplicaciones móviles específicas para diabetes que le ayuden a registrar y controlar sus niveles de glucosa, medicación y hábitos diarios.');
  }
  
  // Generate personalized insights
  const glucoseInsights = generateGlucoseInsights(formData.glucoseMonitoring);
  const medicationInsights = generateMedicationInsights(formData.medicationFrequency);
  
  return {
    type,
    title,
    message,
    recommendations,
    areas,
    score,
    maxScore,
    glucoseInsights,
    medicationInsights
  };
};

/**
 * Generate personalized insights about glucose monitoring
 * 
 * @param {string} glucoseMonitoring - The monitoring frequency
 * @returns {string} Personalized insight text
 */
const generateGlucoseInsights = (glucoseMonitoring) => {
  switch (glucoseMonitoring) {
    case 'every12Hours':
      return 'Su frecuencia de monitoreo de glucosa es excelente. Monitorear cada 12 horas le permite tener un control detallado de sus niveles durante el día y la noche, facilitando ajustes rápidos en su tratamiento cuando sea necesario. Esta práctica es fundamental para prevenir complicaciones a largo plazo.';
    case 'everyDay':
      return 'Monitorear su glucosa diariamente es un buen hábito. Para optimizar su control, considere aumentar la frecuencia a dos veces al día (mañana y noche) para entender mejor cómo su cuerpo responde a los alimentos, actividades y medicamentos a lo largo del día.';
    case 'rarely':
    default:
      return 'El monitoreo poco frecuente de glucosa limita su capacidad para controlar efectivamente su diabetes. Sin información regular sobre sus niveles, es difícil hacer ajustes oportunos en su tratamiento. Recomendamos encarecidamente aumentar la frecuencia a al menos una vez al día, idealmente por la mañana en ayunas.';
  }
};

/**
 * Generate personalized insights about medication adherence
 * 
 * @param {string} medicationFrequency - The medication adherence frequency
 * @returns {string} Personalized insight text
 */
const generateMedicationInsights = (medicationFrequency) => {
  switch (medicationFrequency) {
    case 'daily':
      return 'Su compromiso con la toma diaria de medicación es excelente y fundamental para el control efectivo de la diabetes. Esta adherencia consistente ayuda a mantener niveles estables de glucosa y reduce significativamente el riesgo de complicaciones a largo plazo.';
    case 'almostAlways':
      return 'Aunque toma su medicación con bastante regularidad, las dosis ocasionalmente omitidas pueden afectar el control de su glucosa. Intente identificar las razones de estos olvidos y establezca sistemas (como alarmas o asociación con rutinas diarias) para alcanzar una adherencia completa.';
    case 'rarely':
    default:
      return 'La baja adherencia a la medicación es una preocupación importante. Sin la medicación adecuada, el riesgo de complicaciones aumenta significativamente. Es crucial entender que la medicación para la diabetes no es opcional sino esencial para su salud. Hable con su médico sobre las dificultades que experimenta y explore opciones de tratamiento que puedan ser más fáciles de seguir.';
  }
};