import React, { useState } from 'react';
import { testGeminiConnection, generateRecipesWithGemini } from '../utils/geminiUtils';
import { Recipe } from '../types';

const GeminiDebug: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const testConnection = async () => {
    setIsTesting(true);
    addLog('Starting Gemini connection test...');
    
    try {
      const isWorking = await testGeminiConnection();
      if (isWorking) {
        addLog('✅ Gemini API connection successful!');
      } else {
        addLog('❌ Gemini API connection failed');
      }
    } catch (error) {
      addLog(`❌ Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const testRecipeGeneration = async () => {
    setIsTesting(true);
    addLog('Starting recipe generation test...');
    
    try {
      const testIngredients = ['chicken', 'rice', 'tomatoes'];
      addLog(`Testing with ingredients: ${testIngredients.join(', ')}`);
      
      const result = await generateRecipesWithGemini(testIngredients, 2);
      addLog(`✅ Generated ${result.length} recipes successfully`);
      
      result.forEach((recipe, index) => {
        addLog(`Recipe ${index + 1}: ${recipe.name} (${recipe.ingredients.length} ingredients)`);
      });
      
      setRecipes(result);
    } catch (error) {
      addLog(`❌ Recipe generation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gemini API Debug</h1>
        <p className="text-gray-600">Debug and test Gemini API integration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Test Controls</h2>
          
          <div className="space-y-4">
            <button
              onClick={testConnection}
              disabled={isTesting}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isTesting ? 'Testing...' : 'Test API Connection'}
            </button>
            
            <button
              onClick={testRecipeGeneration}
              disabled={isTesting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isTesting ? 'Testing...' : 'Test Recipe Generation'}
            </button>
            
            <button
              onClick={clearLogs}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
            >
              Clear Logs
            </button>
          </div>
        </div>

        {/* API Configuration */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">API Configuration</h2>
          
          <div className="space-y-3 text-sm">
            <div>
              <strong>API Key:</strong> 
              <span className="text-gray-600 ml-2">AIzaSyCswlWXhR_4vr6ByJKMKgfBtT2HAZfwSMc</span>
            </div>
            <div>
              <strong>API URL:</strong> 
              <span className="text-gray-600 ml-2">https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent</span>
            </div>
            <div>
              <strong>Model:</strong> 
              <span className="text-gray-600 ml-2">gemini-pro</span>
            </div>
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Debug Logs</h2>
        
        <div className="bg-gray-100 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs yet. Run a test to see debug information.</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Generated Recipes */}
      {recipes.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Generated Recipes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recipes.map((recipe, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">{recipe.name}</h3>
                <div className="text-sm text-gray-600 mb-2">
                  Prep time: {recipe.prepTime} min | Servings: {recipe.servings}
                </div>
                <div className="mb-2">
                  <strong>Ingredients:</strong>
                  <ul className="list-disc list-inside text-sm">
                    {recipe.ingredients.map((ingredient, i) => (
                      <li key={i}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Instructions:</strong>
                  <ol className="list-decimal list-inside text-sm">
                    {recipe.instructions.map((instruction, i) => (
                      <li key={i}>{instruction}</li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeminiDebug; 