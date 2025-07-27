/**
 * Utility functions for data analysis and trend detection
 * These functions help analyze user history data and identify trends
 */

/**
 * Analyze user history data to identify trends
 * 
 * @param {Array} historyData - Array of user history entries
 * @returns {Object} Trend analysis object
 */
export const analyzeUserTrends = (historyData) => {
  if (!historyData || historyData.length < 2) {
    return null;
  }
  
  // Extract dates and scores for overall trend
  const dates = historyData.map(entry => {
    const date = new Date(entry.date);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  });
  
  const overallScores = historyData.map(entry => 
    entry.scores.overall || 5
  );
  
  // Determine overall trend (positive, neutral, negative)
  const firstScore = overallScores[0];
  const lastScore = overallScores[overallScores.length - 1];
  const overallTrend = determineOverallTrend(overallScores);
  
  // Analyze trends by area
  const areas = {};
  const areaNames = ['knowledge', 'medication', 'monitoring', 'lifestyle'];
  
  areaNames.forEach(area => {
    const areaScores = historyData.map(entry => 
      entry.scores.areas && entry.scores.areas[area] ? entry.scores.areas[area] : 5
    );
    
    const areaTrend = determineOverallTrend(areaScores);
    const latestScore = areaScores[areaScores.length - 1];
    
    areas[area] = {
      scores: areaScores,
      trend: areaTrend,
      latestScore: latestScore
    };
  });
  
  // Identify strongest and weakest areas
  const latestScores = {};
  Object.keys(areas).forEach(area => {
    latestScores[area] = areas[area].latestScore;
  });
  
  const sortedAreas = Object.entries(latestScores)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
  
  const strengthAreas = sortedAreas.slice(0, 2);  // Top 2 areas
  const improvementAreas = sortedAreas.slice(-2).reverse();  // Bottom 2 areas
  
  return {
    dates,
    overallScores,
    overallTrend,
    areas,
    strengthAreas,
    improvementAreas
  };
};

/**
 * Determine the trend direction based on a series of scores
 * 
 * @param {Array} scores - Array of numerical scores
 * @returns {string} Trend direction ('positive', 'neutral', or 'negative')
 */
const determineOverallTrend = (scores) => {
  if (scores.length < 2) return 'neutral';
  
  // Use linear regression to determine trend
  const n = scores.length;
  const indices = Array.from({ length: n }, (_, i) => i);
  
  // Calculate means
  const meanX = indices.reduce((sum, val) => sum + val, 0) / n;
  const meanY = scores.reduce((sum, val) => sum + val, 0) / n;
  
  // Calculate slope
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    numerator += (indices[i] - meanX) * (scores[i] - meanY);
    denominator += Math.pow(indices[i] - meanX, 2);
  }
  
  const slope = denominator !== 0 ? numerator / denominator : 0;
  
  // Determine trend based on slope
  const THRESHOLD = 0.2;  // Threshold for considering a trend significant
  
  if (slope > THRESHOLD) {
    return 'positive';
  } else if (slope < -THRESHOLD) {
    return 'negative';
  } else {
    return 'neutral';
  }
};

/**
 * Get trend text in Spanish based on trend value
 * 
 * @param {string} trend - Trend direction ('positive', 'neutral', or 'negative')
 * @returns {string} Human-readable trend text in Spanish
 */
export const getTrendText = (trend) => {
  switch (trend) {
    case 'positive':
      return 'Mejorando';
    case 'negative':
      return 'Empeorando';
    case 'neutral':
    default:
      return 'Estable';
  }
};

/**
 * Convert area name to Spanish
 * 
 * @param {string} areaName - Area name in English
 * @returns {string} Area name in Spanish
 */
export const getAreaNameInSpanish = (areaName) => {
  const translations = {
    'knowledge': 'Conocimiento',
    'medication': 'Medicación',
    'monitoring': 'Monitoreo',
    'lifestyle': 'Estilo de vida'
  };
  
  return translations[areaName] || areaName;
};