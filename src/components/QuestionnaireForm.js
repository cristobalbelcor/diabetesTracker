import React, { useState } from 'react';

function QuestionnaireForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    ageRange: '40-45',
    knowledgeAboutDiabetes: 'yes',
    medicationFrequency: 'daily',
    healthyHabits: '',
    glucoseMonitoring: 'everyDay',
    usesHealthApp: 'no',
    appHelpfulReason: '',
    desiredFeatures: ['glucoseTracking', 'medicationReminders']
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    
    setFormData((prev) => {
      const updatedFeatures = [...prev.desiredFeatures];
      
      if (checked && !updatedFeatures.includes(name)) {
        updatedFeatures.push(name);
      } else if (!checked && updatedFeatures.includes(name)) {
        const index = updatedFeatures.indexOf(name);
        updatedFeatures.splice(index, 1);
      }
      
      return {
        ...prev,
        desiredFeatures: updatedFeatures
      };
    });
  };
  
  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  // Render form based on the current step
  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-blue-800 mb-3">Información Personal</h2>
              <p className="text-gray-600">Proporciónenos algunos datos sobre usted para personalizar nuestras recomendaciones.</p>
            </div>
            
            {/* Age Range */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 transition hover:border-blue-300">
              <label className="block text-lg font-medium text-gray-700 mb-3">
                ¿Cuál es su rango de edad?
              </label>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="age40-45"
                    name="ageRange"
                    value="40-45"
                    checked={formData.ageRange === '40-45'}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="age40-45" className="ml-3 text-gray-700">
                    40-45 años
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="age45-50"
                    name="ageRange"
                    value="45-50"
                    checked={formData.ageRange === '45-50'}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="age45-50" className="ml-3 text-gray-700">
                    45-50 años
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="age50-60"
                    name="ageRange"
                    value="50-60"
                    checked={formData.ageRange === '50-60'}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="age50-60" className="ml-3 text-gray-700">
                    50-60 años
                  </label>
                </div>
              </div>
            </div>
            
            {/* Knowledge About Diabetes */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 transition hover:border-blue-300">
              <label className="block text-lg font-medium text-gray-700 mb-3">
                ¿Considera que tiene suficiente conocimiento sobre la diabetes tipo 1?
              </label>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="knowledgeYes"
                    name="knowledgeAboutDiabetes"
                    value="yes"
                    checked={formData.knowledgeAboutDiabetes === 'yes'}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="knowledgeYes" className="ml-3 text-gray-700">
                    Sí, conozco lo suficiente sobre la enfermedad
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="knowledgeNo"
                    name="knowledgeAboutDiabetes"
                    value="no"
                    checked={formData.knowledgeAboutDiabetes === 'no'}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="knowledgeNo" className="ml-3 text-gray-700">
                    No, me gustaría aprender más
                  </label>
                </div>
              </div>
            </div>
            
            {/* Healthy Habits */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 transition hover:border-blue-300">
              <label htmlFor="healthyHabits" className="block text-lg font-medium text-gray-700 mb-3">
                ¿Qué hábitos saludables practica para controlar su diabetes?
              </label>
              
              <textarea
                id="healthyHabits"
                name="healthyHabits"
                value={formData.healthyHabits}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Camino 30 minutos al día, evito azúcares, etc."
              ></textarea>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-blue-800 mb-3">Manejo de la Diabetes</h2>
              <p className="text-gray-600">Estas preguntas nos ayudarán a entender cómo está manejando su condición actualmente.</p>
            </div>
            
            {/* Medication Frequency */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 transition hover:border-blue-300">
              <label className="block text-lg font-medium text-gray-700 mb-3">
                ¿Con qué frecuencia toma su medicación para la diabetes?
              </label>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="medicationDaily"
                    name="medicationFrequency"
                    value="daily"
                    checked={formData.medicationFrequency === 'daily'}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="medicationDaily" className="ml-3 text-gray-700">
                    Todos los días, según lo prescrito
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="medicationAlmost"
                    name="medicationFrequency"
                    value="almostAlways"
                    checked={formData.medicationFrequency === 'almostAlways'}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="medicationAlmost" className="ml-3 text-gray-700">
                    Casi siempre, pero a veces se me olvida
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="medicationRarely"
                    name="medicationFrequency"
                    value="rarely"
                    checked={formData.medicationFrequency === 'rarely'}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="medicationRarely" className="ml-3 text-gray-700">
                    Rara vez la tomo según lo prescrito
                  </label>
                </div>
              </div>
            </div>
            
            {/* Glucose Monitoring */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 transition hover:border-blue-300">
              <label className="block text-lg font-medium text-gray-700 mb-3">
                ¿Con qué frecuencia monitorea sus niveles de glucosa?
              </label>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="glucose12Hours"
                    name="glucoseMonitoring"
                    value="every12Hours"
                    checked={formData.glucoseMonitoring === 'every12Hours'}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="glucose12Hours" className="ml-3 text-gray-700">
                    Cada 12 horas o más frecuentemente
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="glucoseDaily"
                    name="glucoseMonitoring"
                    value="everyDay"
                    checked={formData.glucoseMonitoring === 'everyDay'}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="glucoseDaily" className="ml-3 text-gray-700">
                    Una vez al día
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="glucoseRarely"
                    name="glucoseMonitoring"
                    value="rarely"
                    checked={formData.glucoseMonitoring === 'rarely'}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="glucoseRarely" className="ml-3 text-gray-700">
                    Casi nunca lo hago
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-blue-800 mb-3">Uso de Aplicaciones de Salud</h2>
              <p className="text-gray-600">Sus respuestas nos ayudarán a entender cómo mejorar esta aplicación para apoyar su manejo de la diabetes.</p>
            </div>
            
            {/* Uses Health App */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 transition hover:border-blue-300">
              <label className="block text-lg font-medium text-gray-700 mb-3">
                ¿Utiliza actualmente alguna aplicación móvil para ayudar a manejar su diabetes?
              </label>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="appYes"
                    name="usesHealthApp"
                    value="yes"
                    checked={formData.usesHealthApp === 'yes'}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="appYes" className="ml-3 text-gray-700">
                    Sí
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="appNo"
                    name="usesHealthApp"
                    value="no"
                    checked={formData.usesHealthApp === 'no'}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="appNo" className="ml-3 text-gray-700">
                    No
                  </label>
                </div>
              </div>
            </div>
            
            {/* App Helpful Reason */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 transition hover:border-blue-300">
              <label htmlFor="appHelpfulReason" className="block text-lg font-medium text-gray-700 mb-3">
                ¿Qué espera que una aplicación para el control de diabetes haga por usted?
              </label>
              
              <textarea
                id="appHelpfulReason"
                name="appHelpfulReason"
                value={formData.appHelpfulReason}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Recordatorios de medicación, seguimiento de glucosa, etc."
              ></textarea>
            </div>
            
            {/* Desired Features */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 transition hover:border-blue-300">
              <label className="block text-lg font-medium text-gray-700 mb-3">
                ¿Qué funciones le gustaría ver en una aplicación para diabetes? (Seleccione todas las que apliquen)
              </label>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="glucoseTracking"
                    name="glucoseTracking"
                    checked={formData.desiredFeatures.includes('glucoseTracking')}
                    onChange={handleCheckboxChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="glucoseTracking" className="ml-3 text-gray-700">
                    Registro de niveles de glucosa
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="medicationReminders"
                    name="medicationReminders"
                    checked={formData.desiredFeatures.includes('medicationReminders')}
                    onChange={handleCheckboxChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="medicationReminders" className="ml-3 text-gray-700">
                    Recordatorios de medicación
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="mealPlans"
                    name="mealPlans"
                    checked={formData.desiredFeatures.includes('mealPlans')}
                    onChange={handleCheckboxChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="mealPlans" className="ml-3 text-gray-700">
                    Planes de alimentación
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="exerciseRoutines"
                    name="exerciseRoutines"
                    checked={formData.desiredFeatures.includes('exerciseRoutines')}
                    onChange={handleCheckboxChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="exerciseRoutines" className="ml-3 text-gray-700">
                    Rutinas de ejercicio
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="healthcareContacts"
                    name="healthcareContacts"
                    checked={formData.desiredFeatures.includes('healthcareContacts')}
                    onChange={handleCheckboxChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="healthcareContacts" className="ml-3 text-gray-700">
                    Contacto con profesionales de salud
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-800">
          Control de Diabetes Tipo 1
        </h1>
        <p className="text-gray-600 mt-2">
          Complete este cuestionario para recibir recomendaciones personalizadas
        </p>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Paso {currentStep} de {totalSteps}</span>
          <span>{Math.floor((currentStep / totalSteps) * 100)}% completado</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {renderFormStep()}
        
        <div className="flex justify-between mt-8">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              <i className="fas fa-arrow-left mr-2"></i> Anterior
            </button>
          ) : (
            <div></div>
          )}
          
          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Siguiente <i className="fas fa-arrow-right ml-2"></i>
            </button>
          ) : (
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white rounded-lg text-lg font-medium hover:bg-green-700 transition"
            >
              Enviar Respuestas <i className="fas fa-check ml-2"></i>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default QuestionnaireForm;