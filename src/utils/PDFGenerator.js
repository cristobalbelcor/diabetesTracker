import { jsPDF } from 'jspdf';

/**
 * Generate a PDF with the questionnaire results and recommendations
 * Enhanced with insights and personalized recommendations
 * 
 * @param {Object} formData - The form data from the questionnaire
 * @param {Object} recommendations - The recommendations object
 * @returns {Promise} A promise that resolves when the PDF is generated and saved
 */
export const generatePDF = (formData, recommendations) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(0, 70, 171); // Blue color
      doc.text('DiabetesControl', 105, 20, { align: 'center' });
      
      doc.setFontSize(14);
      doc.text('Resultados del Cuestionario y Recomendaciones', 105, 30, { align: 'center' });
      
      // Add current date
      const today = new Date();
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100); // Gray color
      doc.text(`Fecha: ${today.toLocaleDateString()}`, 105, 38, { align: 'center' });
      
      // Add recommendations section
      doc.setFontSize(14);
      doc.setTextColor(0, 70, 171); // Blue color
      doc.text('Recomendaciones', 20, 50);
      
      // Add recommendation title with appropriate color
      doc.setFontSize(12);
      switch(recommendations.type) {
        case 'positive':
          doc.setTextColor(0, 128, 0); // Green
          break;
        case 'warning':
          doc.setTextColor(255, 165, 0); // Orange
          break;
        case 'alert':
          doc.setTextColor(255, 0, 0); // Red
          break;
        default:
          doc.setTextColor(0, 0, 0); // Black
      }
      doc.text(recommendations.title, 20, 60);
      
      // Add recommendation message
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0); // Black
      
      // Split long text into multiple lines
      const messageLines = doc.splitTextToSize(recommendations.message, 170);
      doc.text(messageLines, 20, 70);
      
      // Add recommendation list
      let yPosition = 70 + (messageLines.length * 5);
      
      doc.setFontSize(11);
      doc.text('Recomendaciones específicas:', 20, yPosition);
      yPosition += 8;
      
      doc.setFontSize(10);
      recommendations.recommendations.forEach((rec, index) => {
        const recLines = doc.splitTextToSize(`${index + 1}. ${rec}`, 165);
        doc.text(recLines, 25, yPosition);
        yPosition += recLines.length * 5 + 3;
      });
      
      yPosition += 8;
      
      // Add specialized insights if available
      if (recommendations.glucoseInsights || recommendations.medicationInsights) {
        // Add insights section
        doc.setFontSize(11);
        doc.setTextColor(0, 70, 171); // Blue color
        doc.text('Análisis Personalizado:', 20, yPosition);
        yPosition += 8;
        
        // Add glucose insights if available
        if (recommendations.glucoseInsights) {
          doc.setTextColor(46, 125, 50); // Dark green
          doc.text('Sobre su control de glucosa:', 20, yPosition);
          yPosition += 5;
          
          doc.setTextColor(0, 0, 0); // Black
          doc.setFontSize(9);
          const glucoseLines = doc.splitTextToSize(recommendations.glucoseInsights, 165);
          doc.text(glucoseLines, 25, yPosition);
          yPosition += glucoseLines.length * 4 + 5;
        }
        
        // Add medication insights if available
        if (recommendations.medicationInsights) {
          doc.setTextColor(106, 27, 154); // Deep purple
          doc.setFontSize(10);
          doc.text('Sobre su medicación:', 20, yPosition);
          yPosition += 5;
          
          doc.setTextColor(0, 0, 0); // Black
          doc.setFontSize(9);
          const medicationLines = doc.splitTextToSize(recommendations.medicationInsights, 165);
          doc.text(medicationLines, 25, yPosition);
          yPosition += medicationLines.length * 4 + 10;
        }
      } else {
        yPosition += 10;
      }
      
      // Add score visualization if available
      if (recommendations.score !== undefined && recommendations.areas) {
        // Score section title
        doc.setFontSize(11);
        doc.setTextColor(0, 70, 171); // Blue color
        doc.text('Evaluación por Áreas:', 20, yPosition);
        yPosition += 8;
        
        // Draw area score bars
        const areas = recommendations.areas;
        const areaLabels = {
          'knowledge': 'Conocimiento',
          'medication': 'Medicación',
          'monitoring': 'Monitoreo',
          'lifestyle': 'Estilo de vida'
        };
        
        Object.entries(areas).forEach(([key, value]) => {
          const label = areaLabels[key] || key;
          const score = value; // Score from 0-10
          
          // Draw label
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
          doc.text(label, 25, yPosition);
          
          // Draw bar background
          doc.setDrawColor(200, 200, 200);
          doc.setFillColor(240, 240, 240);
          doc.rect(75, yPosition - 3, 70, 4, 'FD');
          
          // Draw filled bar based on score
          const fillWidth = (score / 10) * 70;
          let fillColor;
          
          if (score >= 7) {
            fillColor = [46, 125, 50]; // Green
          } else if (score >= 4) {
            fillColor = [245, 124, 0]; // Orange
          } else {
            fillColor = [211, 47, 47]; // Red
          }
          
          doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
          doc.rect(75, yPosition - 3, fillWidth, 4, 'F');
          
          // Add score value
          doc.setTextColor(fillColor[0], fillColor[1], fillColor[2]);
          doc.text(`${score}`, 150, yPosition);
          
          yPosition += 8;
        });
        
        // Add overall score
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Puntuación General: ${recommendations.score}/${recommendations.maxScore}`, 25, yPosition);
        
        yPosition += 12;
      } else {
        yPosition += 10;
      }
      
      // Add questionnaire responses
      doc.setFontSize(12);
      doc.setTextColor(0, 70, 171); // Blue color
      doc.text('Resumen de Respuestas', 20, yPosition);
      yPosition += 8;
      
      // Create a table with responses
      const tableData = [
        ['Pregunta', 'Respuesta'],
        ['Rango de edad', 
          formData.ageRange === '40-45' ? '40-45 años' : 
          formData.ageRange === '45-50' ? '45-50 años' : 
          '50-60 años'],
        ['Conocimiento sobre diabetes tipo 1', 
          formData.knowledgeAboutDiabetes === 'yes' ? 'Sí' : 'No'],
        ['Frecuencia de medicación',
          formData.medicationFrequency === 'daily' ? 'Todos los días' :
          formData.medicationFrequency === 'almostAlways' ? 'Casi siempre' :
          'Rara vez'],
        ['Hábitos saludables', formData.healthyHabits || 'No especificado'],
        ['Control de glucosa',
          formData.glucoseMonitoring === 'every12Hours' ? 'Cada 12 horas' :
          formData.glucoseMonitoring === 'everyDay' ? 'Cada día' :
          'Casi nunca lo hago'],
        ['Uso de apps de salud',
          formData.usesHealthApp === 'yes' ? 'Sí' : 'No'],
        ['Opinión sobre aplicaciones para diabetes', 
          formData.appHelpfulReason || 'No especificado'],
      ];
      
      // Add desired features as a formatted string
      let featuresText = '';
      if (formData.desiredFeatures) {
        if (formData.desiredFeatures.includes('glucoseTracking')) {
          featuresText += '- Registro de niveles de glucosa\n';
        }
        if (formData.desiredFeatures.includes('medicationReminders')) {
          featuresText += '- Recordatorios de medicación\n';
        }
        if (formData.desiredFeatures.includes('mealPlans')) {
          featuresText += '- Planes de alimentación\n';
        }
        if (formData.desiredFeatures.includes('exerciseRoutines')) {
          featuresText += '- Rutinas de ejercicio\n';
        }
        if (formData.desiredFeatures.includes('healthcareContacts')) {
          featuresText += '- Contacto de profesionales de salud\n';
        }
      }
      
      tableData.push(['Funciones deseadas en una app', featuresText || 'Ninguna seleccionada']);
      
      // Add the table data manually since we're not using autoTable
      doc.setFontSize(10);
      doc.setDrawColor(0, 70, 171);
      doc.setFillColor(0, 70, 171);
      doc.setTextColor(255, 255, 255);
      
      // Draw header
      doc.rect(20, yPosition, 60, 10, 'F'); // Question column header
      doc.rect(80, yPosition, 100, 10, 'F'); // Answer column header
      doc.text(tableData[0][0], 25, yPosition + 6); // Question header text
      doc.text(tableData[0][1], 85, yPosition + 6); // Answer header text
      
      yPosition += 10;
      
      // Draw rows
      doc.setDrawColor(200, 200, 200);
      doc.setTextColor(0, 0, 0);
      
      tableData.slice(1).forEach((row, index) => {
        // Calculate heights based on content
        const question = row[0];
        const answer = row[1];
        
        const questionLines = doc.splitTextToSize(question, 55);
        const answerLines = doc.splitTextToSize(answer, 95);
        
        const lineHeight = 5;
        const questionHeight = questionLines.length * lineHeight + 5;
        const answerHeight = answerLines.length * lineHeight + 5;
        const rowHeight = Math.max(questionHeight, answerHeight);
        
        // Draw row background and borders
        doc.setFillColor(index % 2 === 0 ? 245 : 255, index % 2 === 0 ? 245 : 255, index % 2 === 0 ? 245 : 255);
        doc.rect(20, yPosition, 60, rowHeight, 'F'); // Question cell background
        doc.rect(80, yPosition, 100, rowHeight, 'F'); // Answer cell background
        doc.rect(20, yPosition, 60, rowHeight, 'S'); // Question cell border
        doc.rect(80, yPosition, 100, rowHeight, 'S'); // Answer cell border
        
        // Draw cell content
        doc.setFontSize(9);
        doc.text(questionLines, 25, yPosition + 5);
        doc.text(answerLines, 85, yPosition + 5);
        
        yPosition += rowHeight;
      });
      
      // Add disclaimer and additional information
      const finalY = yPosition + 10;
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text('Nota importante:', 20, finalY);
      
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      const disclaimerLines = doc.splitTextToSize(
        'Esta información no sustituye el consejo médico profesional. Consulte siempre a su médico para el manejo ' +
        'de su diabetes. Las recomendaciones se basan en sus respuestas y pueden cambiar según su situación médica específica.',
        170
      );
      doc.text(disclaimerLines, 20, finalY + 4);
      
      // Add logo or footer
      doc.setFontSize(8);
      doc.setTextColor(0, 70, 171);
      doc.text('DiabetesControl - Generado el ' + today.toLocaleString(), 105, 285, { align: 'center' });
      
      // Save the PDF with today's date
      const fileName = `DiabetesControl_Recomendaciones_${today.toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};
