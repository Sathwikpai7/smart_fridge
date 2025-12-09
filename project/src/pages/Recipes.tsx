import React, { useState, useEffect } from 'react';
import { Clock, Users, ChefHat, ExternalLink, Loader2, RefreshCw, Filter, Sparkles } from 'lucide-react';
import { FoodItem, Recipe } from '../types';
import { useFoodItems } from '../hooks/useAPI';
import { findRecipesByIngredients, recipeDatabase } from '../data/recipes';
import { generateRecipesWithGemini, getRecipeSuggestions } from '../utils/geminiUtils';
import RecipeCard from '../components/RecipeCard';

const Recipes: React.FC = () => {
  const { items } = useFoodItems();
  const [suggestedRecipes, setSuggestedRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    cuisine: '',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    maxPrepTime: 60,
    dietary: [] as string[]
  });

  const generateRecipes = async (usePreferences = false) => {
    if (items.length === 0) {
      setSuggestedRecipes([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const availableIngredients = items.map(item => item.name.toLowerCase());
      let recipes: Recipe[] = [];

      if (usePreferences && (preferences.cuisine || preferences.difficulty !== 'easy' || preferences.maxPrepTime !== 60 || preferences.dietary.length > 0)) {
        // Use personalized suggestions
        recipes = await getRecipeSuggestions(availableIngredients, preferences);
      } else {
        // Use general recipe generation
        recipes = await generateRecipesWithGemini(availableIngredients, 6);
      }

      // Sort recipes by ingredient match percentage
      recipes.sort((a, b) => {
        const aMatch = getAvailableIngredients(a).length / a.ingredients.length;
        const bMatch = getAvailableIngredients(b).length / b.ingredients.length;
        return bMatch - aMatch;
      });

      setSuggestedRecipes(recipes);
    } catch (err) {
      console.error('Error generating recipes:', err);
      setError('Failed to generate AI recipes. Using local recipes instead.');
      
      // Fallback to local recipes
      const availableIngredients = items.map(item => item.name.toLowerCase());
      const fallbackRecipes = findRecipesByIngredients(availableIngredients);
      
      if (fallbackRecipes.length === 0) {
        // If no local recipes match, show all local recipes
        setSuggestedRecipes(recipeDatabase);
      } else {
        setSuggestedRecipes(fallbackRecipes);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateRecipes();
  }, [items]);

  const getAvailableIngredients = (recipe: Recipe) => {
    const availableIngredients = items.map(item => item.name.toLowerCase());
    return recipe.ingredients.filter(ingredient =>
      availableIngredients.some(available =>
        available.includes(ingredient.toLowerCase()) ||
        ingredient.toLowerCase().includes(available)
      )
    );
  };

  const getMissingIngredients = (recipe: Recipe) => {
    const availableIngredients = items.map(item => item.name.toLowerCase());
    return recipe.ingredients.filter(ingredient =>
      !availableIngredients.some(available =>
        available.includes(ingredient.toLowerCase()) ||
        ingredient.toLowerCase().includes(available)
      )
    );
  };

  const handleRefresh = () => {
    generateRecipes();
  };

  const handleGenerateWithPreferences = () => {
    generateRecipes(true);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Recipe Suggestions</h1>
        <p className="text-gray-600">Discover personalized recipes using your available ingredients</p>
      </div>

      {/* Available Ingredients */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <ChefHat className="h-6 w-6 mr-2 text-green-600" />
          Your Available Ingredients ({items.length})
        </h2>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item.id}
              className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
            >
              {item.name}
            </span>
          ))}
          {items.length === 0 && (
            <p className="text-gray-500">No ingredients available. Add some items to your inventory first!</p>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Generate New Recipes
            </button>
            
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="h-4 w-4" />
              Preferences
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Sparkles className="h-4 w-4" />
            Powered by Gemini AI
          </div>
        </div>

        {/* Preferences Panel */}
        {showPreferences && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-4">Recipe Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine</label>
                <select
                  value={preferences.cuisine}
                  onChange={(e) => setPreferences(prev => ({ ...prev, cuisine: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any Cuisine</option>
                  <option value="italian">Italian</option>
                  <option value="asian">Asian</option>
                  <option value="mexican">Mexican</option>
                  <option value="indian">Indian</option>
                  <option value="mediterranean">Mediterranean</option>
                  <option value="american">American</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={preferences.difficulty}
                  onChange={(e) => setPreferences(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Prep Time (min)</label>
                <input
                  type="number"
                  value={preferences.maxPrepTime}
                  onChange={(e) => setPreferences(prev => ({ ...prev, maxPrepTime: parseInt(e.target.value) || 60 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="10"
                  max="180"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dietary</label>
                <select
                  multiple
                  value={preferences.dietary}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setPreferences(prev => ({ ...prev, dietary: selected }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="gluten-free">Gluten-Free</option>
                  <option value="dairy-free">Dairy-Free</option>
                  <option value="low-carb">Low-Carb</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={handleGenerateWithPreferences}
              disabled={isLoading}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Generate with Preferences
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Recipe Suggestions */}
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Generating Recipes...</h3>
          <p className="text-gray-600">AI is creating personalized recipes for you</p>
        </div>
      ) : suggestedRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestedRecipes.map((recipe) => {
            const availableIngredients = getAvailableIngredients(recipe);
            const missingIngredients = getMissingIngredients(recipe);
            const matchPercentage = Math.round((availableIngredients.length / recipe.ingredients.length) * 100);

            return (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                availableIngredients={availableIngredients}
                missingIngredients={missingIngredients}
                matchPercentage={matchPercentage}
                onClick={() => setSelectedRecipe(recipe)}
                showDifficulty={true}
                showCuisine={true}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Recipe Suggestions</h3>
          <p className="text-gray-600">
            Add more ingredients to your inventory to get personalized recipe suggestions.
          </p>
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {selectedRecipe.image && (
              <div className="h-64 bg-gray-200 overflow-hidden rounded-t-xl">
                <img
                  src={selectedRecipe.image}
                  alt={selectedRecipe.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedRecipe.name}</h2>
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="flex items-center text-gray-600 mb-6">
                <Clock className="h-5 w-5 mr-2" />
                <span className="mr-6">{selectedRecipe.prepTime} minutes</span>
                <Users className="h-5 w-5 mr-2" />
                <span>{selectedRecipe.servings} servings</span>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
                  <ul className="space-y-2">
                    {selectedRecipe.ingredients.map((ingredient, index) => {
                      const available = getAvailableIngredients(selectedRecipe).includes(ingredient);
                      return (
                        <li
                          key={index}
                          className={`flex items-center ${
                            available ? 'text-green-700' : 'text-red-700'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full mr-3 ${
                            available ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <span className={available ? 'line-through' : ''}>{ingredient}</span>
                          <span className="ml-2 text-xs">
                            {available ? '(available)' : '(missing)'}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Instructions</h3>
                  <ol className="space-y-3">
                    {selectedRecipe.instructions.map((instruction, index) => (
                      <li key={index} className="flex">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Close Recipe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recipes;