import React, { useState } from 'react';
import { generateRecipesWithGemini, testGeminiConnection } from '../utils/geminiUtils';
import { Recipe } from '../types';

const GeminiTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus(null);
    
    try {
      const isWorking = await testGeminiConnection();
      setConnectionStatus(isWorking ? '✅ Gemini API is working!' : '❌ Gemini API connection failed');
    } catch (err) {
      setConnectionStatus(`❌ Connection error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const testGemini = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Test with some common ingredients
      const testIngredients = ['chicken', 'rice', 'tomatoes', 'onions', 'garlic'];
      const result = await generateRecipesWithGemini(testIngredients, 3);
      setRecipes(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Gemini API Test</h2>
      
      <div className="space-y-4">
        <div>
          <button
            onClick={testConnection}
            disabled={isTestingConnection}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 mr-2"
          >
            {isTestingConnection ? 'Testing Connection...' : 'Test Connection'}
          </button>
          
          <button
            onClick={testGemini}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Recipe Generation'}
          </button>
        </div>

        {connectionStatus && (
          <div className={`p-3 rounded ${
            connectionStatus.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {connectionStatus}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {recipes.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Generated Recipes:</h3>
          <div className="space-y-2">
            {recipes.map((recipe, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded">
                <h4 className="font-medium">{recipe.name}</h4>
                <p className="text-sm text-gray-600">
                  Prep time: {recipe.prepTime} min | Servings: {recipe.servings}
                </p>
                <p className="text-sm">
                  Ingredients: {recipe.ingredients.join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeminiTest; 