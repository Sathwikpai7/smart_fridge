import { Recipe } from '../types';

const GEMINI_API_KEY = 'AIzaSyCswlWXhR_4vr6ByJKMKgfBtT2HAZfwSMc';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface GeminiRecipeResponse {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine?: string;
  tags?: string[];
}

// Simple test function to check if Gemini API is working
export const testGeminiConnection = async (): Promise<boolean> => {
  console.log('🔍 Starting Gemini connection test...');
  console.log('📡 API URL:', GEMINI_API_URL);
  console.log('🔑 API Key:', GEMINI_API_KEY.substring(0, 10) + '...');
  
  try {
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: "Say 'Hello, Gemini is working!' and respond with a simple JSON: {\"status\": \"ok\", \"message\": \"Hello, Gemini is working!\"}"
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 100,
      }
    };

    console.log('📤 Sending request to Gemini API...');
    console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 Response received:');
    console.log('   Status:', response.status);
    console.log('   Status Text:', response.statusText);
    console.log('   Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API error response:');
      console.error('   Status:', response.status);
      console.error('   Status Text:', response.statusText);
      console.error('   Error Body:', errorText);
      
      // Try to parse error as JSON for better formatting
      try {
        const errorJson = JSON.parse(errorText);
        console.error('   Parsed Error:', JSON.stringify(errorJson, null, 2));
      } catch (parseError) {
        console.error('   Raw Error Text:', errorText);
      }
      
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Gemini test response data:', JSON.stringify(data, null, 2));
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      console.log('✅ Response structure is valid');
      console.log('📝 Response text:', data.candidates[0].content.parts[0].text);
    } else {
      console.error('❌ Invalid response structure:', data);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Gemini connection test failed:');
    console.error('   Error type:', error.constructor.name);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    
    if (error instanceof TypeError) {
      console.error('   This looks like a network error. Check:');
      console.error('   - Internet connection');
      console.error('   - CORS settings');
      console.error('   - API endpoint accessibility');
    }
    
    return false;
  }
};

export const generateRecipesWithGemini = async (
  availableIngredients: string[],
  count: number = 5
): Promise<Recipe[]> => {
  console.log('🍳 Starting recipe generation...');
  console.log('📋 Ingredients:', availableIngredients);
  console.log('🔢 Count:', count);
  
  try {
    const prompt = `Generate ${count} simple recipes using these ingredients: ${availableIngredients.join(', ')}.

Return ONLY a valid JSON array like this example:
[
  {
    "id": "recipe1",
    "name": "Simple Pasta",
    "ingredients": ["pasta", "tomatoes", "garlic"],
    "instructions": ["Boil pasta", "Cook tomatoes", "Combine"],
    "prepTime": 20,
    "servings": 2,
    "difficulty": "easy",
    "cuisine": "Italian"
  }
]

Make sure the response is ONLY valid JSON, no extra text.`;

    console.log('📝 Generated prompt:', prompt);
    
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1500,
      }
    };

    console.log('📤 Sending request to Gemini API...');
    console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 Response received:');
    console.log('   Status:', response.status);
    console.log('   Status Text:', response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API error response:');
      console.error('   Status:', response.status);
      console.error('   Status Text:', response.statusText);
      console.error('   Error Body:', errorText);
      
      // Try to parse error as JSON for better formatting
      try {
        const errorJson = JSON.parse(errorText);
        console.error('   Parsed Error:', JSON.stringify(errorJson, null, 2));
      } catch (parseError) {
        console.error('   Raw Error Text:', errorText);
      }
      
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Gemini API response structure:', JSON.stringify(data, null, 2));
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('❌ Invalid response format:', data);
      throw new Error('Invalid response format from Gemini API');
    }

    const textResponse = data.candidates[0].content.parts[0].text;
    console.log('📝 Raw text response:', textResponse);
    console.log('📏 Response length:', textResponse.length);
    
    // Try to parse the response as JSON directly first
    let recipes: GeminiRecipeResponse[];
    try {
      console.log('🔍 Attempting direct JSON parse...');
      recipes = JSON.parse(textResponse.trim());
      console.log('✅ Direct JSON parse successful');
    } catch (parseError) {
      console.log('⚠️ Direct JSON parse failed:', parseError.message);
      console.log('🔍 Trying to extract JSON from response...');
      
      // Extract JSON from the response if it's wrapped in other text
      const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error('❌ No valid JSON array found in response');
        console.error('📝 Full response text:', textResponse);
        throw new Error('No valid JSON found in Gemini response');
      }
      
      console.log('🔍 Found JSON match:', jsonMatch[0]);
      try {
        recipes = JSON.parse(jsonMatch[0]);
        console.log('✅ JSON extraction successful');
      } catch (extractError) {
        console.error('❌ JSON extraction failed:', extractError.message);
        throw new Error(`Failed to parse extracted JSON: ${extractError.message}`);
      }
    }
    
    console.log('📋 Parsed recipes:', JSON.stringify(recipes, null, 2));
    console.log('🔢 Number of recipes:', recipes.length);
    
    // Convert to our Recipe format
    const result = recipes.map((recipe, index) => {
      console.log(`🍽️ Processing recipe ${index + 1}:`, recipe.name);
      
      const processedRecipe = {
        id: recipe.id || `gemini-${Date.now()}-${index}`,
        name: recipe.name,
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
        prepTime: recipe.prepTime || 30,
        servings: recipe.servings || 2,
        image: getRecipeImage(recipe.name, recipe.cuisine, recipe.tags)
      };
      
      console.log(`✅ Recipe ${index + 1} processed:`, processedRecipe.name);
      return processedRecipe;
    });

    console.log('🎉 Final recipe result:', JSON.stringify(result, null, 2));
    console.log(`✅ Successfully generated ${result.length} recipes`);
    return result;

  } catch (error) {
    console.error('❌ Error generating recipes with Gemini:');
    console.error('   Error type:', error.constructor.name);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    
    if (error instanceof TypeError) {
      console.error('   This looks like a network error. Check:');
      console.error('   - Internet connection');
      console.error('   - CORS settings');
      console.error('   - API endpoint accessibility');
    }
    
    throw error;
  }
};

const getRecipeImage = (name: string, cuisine?: string, tags?: string[]): string => {
  // Generate a placeholder image URL based on recipe characteristics
  const baseUrl = 'https://images.pexels.com/photos/';
  
  // Map cuisines and tags to image categories
  if (cuisine?.toLowerCase().includes('italian')) {
    return `${baseUrl}1279330/pexels-photo-1279330.jpeg`;
  } else if (cuisine?.toLowerCase().includes('asian') || cuisine?.toLowerCase().includes('chinese')) {
    return `${baseUrl}1640777/pexels-photo-1640777.jpeg`;
  } else if (tags?.some(tag => tag.toLowerCase().includes('smoothie') || tag.toLowerCase().includes('drink'))) {
    return `${baseUrl}1092730/pexels-photo-1092730.jpeg`;
  } else if (tags?.some(tag => tag.toLowerCase().includes('salad'))) {
    return `${baseUrl}1213710/pexels-photo-1213710.jpeg`;
  } else {
    // Default food image
    return `${baseUrl}1640777/pexels-photo-1640777.jpeg`;
  }
};

export const getRecipeSuggestions = async (
  availableIngredients: string[],
  preferences?: {
    cuisine?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    maxPrepTime?: number;
    dietary?: string[];
  }
): Promise<Recipe[]> => {
  try {
    let prompt = `Generate 3 simple recipes using these ingredients: ${availableIngredients.join(', ')}.`;

    if (preferences) {
      if (preferences.cuisine) {
        prompt += ` Focus on ${preferences.cuisine} cuisine.`;
      }
      if (preferences.difficulty) {
        prompt += ` Make recipes ${preferences.difficulty} difficulty level.`;
      }
      if (preferences.maxPrepTime) {
        prompt += ` Keep prep time under ${preferences.maxPrepTime} minutes.`;
      }
      if (preferences.dietary && preferences.dietary.length > 0) {
        prompt += ` Accommodate dietary restrictions: ${preferences.dietary.join(', ')}.`;
      }
    }

    prompt += `

Return ONLY a valid JSON array like this:
[
  {
    "id": "recipe1",
    "name": "Recipe Name",
    "ingredients": ["ingredient1", "ingredient2"],
    "instructions": ["Step 1", "Step 2"],
    "prepTime": 30,
    "servings": 4,
    "difficulty": "easy",
    "cuisine": "Italian"
  }
]`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    
    // Try direct JSON parse first
    let recipes: GeminiRecipeResponse[];
    try {
      recipes = JSON.parse(textResponse.trim());
    } catch (parseError) {
      const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      recipes = JSON.parse(jsonMatch[0]);
    }
    
    return recipes.map((recipe, index) => ({
      id: recipe.id || `suggestion-${Date.now()}-${index}`,
      name: recipe.name,
      ingredients: recipe.ingredients || [],
      instructions: recipe.instructions || [],
      prepTime: recipe.prepTime || 30,
      servings: recipe.servings || 2,
      image: getRecipeImage(recipe.name, recipe.cuisine, recipe.tags)
    }));

  } catch (error) {
    console.error('Error getting recipe suggestions:', error);
    throw error;
  }
};

// Global test functions that can be called from browser console
(window as any).testGeminiFromConsole = async () => {
  console.log('🧪 Testing Gemini from browser console...');
  try {
    const isWorking = await testGeminiConnection();
    if (isWorking) {
      console.log('✅ Gemini API is working!');
      
      // Test recipe generation
      console.log('🍳 Testing recipe generation...');
      const recipes = await generateRecipesWithGemini(['chicken', 'rice'], 1);
      console.log('✅ Recipe generation successful:', recipes);
    } else {
      console.log('❌ Gemini API is not working');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Global function to test just the connection
(window as any).testGeminiConnection = testGeminiConnection;

// Global function to test recipe generation
(window as any).testGeminiRecipes = generateRecipesWithGemini;

// Global function to show current API configuration
(window as any).showGeminiConfig = () => {
  console.log('🔧 Gemini API Configuration:');
  console.log('   API URL:', GEMINI_API_URL);
  console.log('   API Key:', GEMINI_API_KEY.substring(0, 10) + '...');
  console.log('   Model: gemini-pro');
}; 