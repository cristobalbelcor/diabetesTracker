import React from 'react';
import { getAreaNameInSpanish, getTrendText } from '../utils/dataAnalysis';

/**
 * Component to display history charts for diabetes control
 * Shows trends and historical data
 */
function HistoryChart({ historyData, trendAnalysis }) {
  if (!historyData || historyData.length < 2 || !trendAnalysis) {
    return (
      <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600">
          Complete el cuestionario al menos dos veces para ver gráficos de tendencias.
        </p>
      </div>
    );
  }

  // Get colors for trend indicators
  const getTrendColor = (trend) => {
    switch(trend) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  // Generate bar chart visualization using div heights
  const renderBarChart = () => {
    const scores = trendAnalysis.overallScores;
    const maxScore = 10; // Maximum possible score
    
    return (
      <div className="flex items-end justify-around h-36 mb-4">
        {scores.map((score, index) => {
          const heightPercentage = (score / maxScore) * 100;
          
          return (
            <div key={index} className="flex flex-col items-center mx-1">
              <div 
                className="w-8 md:w-10 bg-blue-600 rounded-t"
                style={{ height: `${heightPercentage}%` }}
              ></div>
              <span className="mt-1 text-xs">{trendAnalysis.dates[index] || ''}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // Generate area strength visualization
  const renderAreaStrengths = () => {
    return (
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(trendAnalysis.areas).map(([areaName, data]) => {
          const latestScore = data.scores[data.scores.length - 1] || 0;
          const barWidth = `${(latestScore / 10) * 100}%`;
          
          return (
            <div key={areaName} className="bg-white p-3 rounded-lg border border-gray-200">
              <div className="flex justify-between mb-1">
                <span className="font-medium text-gray-700">
                  {getAreaNameInSpanish(areaName)}
                </span>
                <span className={`text-sm ${getTrendColor(data.trend)}`}>
                  {getTrendText(data.trend)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${
                    latestScore >= 7 ? 'bg-green-500' : 
                    latestScore >= 4 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: barWidth }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
      <h3 className="text-lg font-semibold text-blue-800 mb-4">
        Evolución de su Control de Diabetes
      </h3>

      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
        <div className="flex justify-between items-center mb-3">
          <span className="font-medium">Puntaje General</span>
          <span className={`px-2 py-1 rounded text-sm ${getTrendColor(trendAnalysis.overallTrend)}`}>
            {getTrendText(trendAnalysis.overallTrend)}
          </span>
        </div>
        
        {renderBarChart()}
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h4 className="font-medium mb-3">Áreas de Control</h4>
        {renderAreaStrengths()}
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-medium text-green-700 mb-2">Áreas Fuertes</h4>
          <ul className="list-disc ml-5">
            {trendAnalysis.strengthAreas.map((area) => (
              <li key={area} className="text-gray-700">
                {getAreaNameInSpanish(area)}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-medium text-red-700 mb-2">Áreas a Mejorar</h4>
          <ul className="list-disc ml-5">
            {trendAnalysis.improvementAreas.map((area) => (
              <li key={area} className="text-gray-700">
                {getAreaNameInSpanish(area)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default HistoryChart;