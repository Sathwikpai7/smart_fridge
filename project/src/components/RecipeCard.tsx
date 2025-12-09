import React from 'react';
import { Clock, Users, ChefHat, Star } from 'lucide-react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  availableIngredients: string[];
  missingIngredients: string[];
  matchPercentage: number;
  onClick: () => void;
  showDifficulty?: boolean;
  showCuisine?: boolean;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  availableIngredients,
  missingIngredients,
  matchPercentage,
  onClick,
  showDifficulty = false,
  showCuisine = false
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
      onClick={onClick}
    >
      {/* Recipe Image */}
      {recipe.image && (
        <div className="h-48 bg-gray-200 overflow-hidden relative">
          <img
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {/* Match Percentage Badge */}
            <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
              <div className={`w-2 h-2 rounded-full mr-2 ${getMatchColor(matchPercentage)}`}></div>
              <span className="text-sm font-medium text-gray-700">{matchPercentage}% match</span>
            </div>
            
            {/* Difficulty Badge */}
            {showDifficulty && recipe.difficulty && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                {recipe.difficulty}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Recipe Content */}
      <div className="p-6">
        {/* Recipe Header */}
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
            {recipe.name}
          </h3>
          
          {/* Cuisine and Tags */}
          {(showCuisine || recipe.cuisine) && (
            <div className="flex items-center gap-2 mb-2">
              {recipe.cuisine && (
                <span className="text-sm text-blue-600 font-medium">
                  {recipe.cuisine}
                </span>
              )}
              {recipe.tags && recipe.tags.length > 0 && (
                <div className="flex gap-1">
                  {recipe.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recipe Stats */}
          <div className="flex items-center text-gray-600 text-sm">
            <Clock className="h-4 w-4 mr-1" />
            <span className="mr-4">{recipe.prepTime} min</span>
            <Users className="h-4 w-4 mr-1" />
            <span>{recipe.servings} servings</span>
          </div>
        </div>

        {/* Ingredients Section */}
        <div className="space-y-3">
          {/* Available Ingredients */}
          <div>
            <p className="text-sm font-medium text-green-700 mb-2 flex items-center">
              <ChefHat className="h-3 w-3 mr-1" />
              Available ({availableIngredients.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {availableIngredients.slice(0, 4).map((ingredient, index) => (
                <span
                  key={index}
                  className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium"
                >
                  {ingredient}
                </span>
              ))}
              {availableIngredients.length > 4 && (
                <span className="text-xs text-gray-500">
                  +{availableIngredients.length - 4} more
                </span>
              )}
            </div>
          </div>
          
          {/* Missing Ingredients */}
          {missingIngredients.length > 0 && (
            <div>
              <p className="text-sm font-medium text-red-700 mb-2">
                Missing ({missingIngredients.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {missingIngredients.slice(0, 3).map((ingredient, index) => (
                  <span
                    key={index}
                    className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium"
                  >
                    {ingredient}
                  </span>
                ))}
                {missingIngredients.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{missingIngredients.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
              <span>AI Generated</span>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View Recipe →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard; 