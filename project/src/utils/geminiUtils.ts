import { Recipe } from '../types';


const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = import.meta.env.VITE_GROQ_API_URL;

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

// Simple test function to check if Groq API is working
export const testGeminiConnection = async (): Promise<boolean> => {
  console.log('🔍 Starting Groq connection test...');
  console.log('📡 API URL:', GROQ_API_URL);
  console.log('🔑 API Key:', GROQ_API_KEY.substring(0, 10) + '...');
  
  try {
    const requestBody = {
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'user',
          content: "Say 'Hello, Groq is working!' and respond with a simple JSON: {\"status\": \"ok\", \"message\": \"Hello, Groq is working!\"}"
        }
      ],
      temperature: 0.1,
      max_tokens: 100,
    };

    console.log('📤 Sending request to Groq API...');
    console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 Response received:');
    console.log('   Status:', response.status);
    console.log('   Status Text:', response.statusText);
    console.log('   Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Groq API error response:');
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
      
      throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Groq test response data:', JSON.stringify(data, null, 2));
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      console.log('✅ Response structure is valid');
      console.log('📝 Response text:', data.choices[0].message.content);
    } else {
      console.error('❌ Invalid response structure:', data);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Groq connection test failed:');
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
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    };

    console.log('📤 Sending request to Groq API...');
    console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 Response received:');
    console.log('   Status:', response.status);
    console.log('   Status Text:', response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Groq API error response:');
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
      
      throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Groq API response structure:', JSON.stringify(data, null, 2));
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid response format:', data);
      throw new Error('Invalid response format from Groq API');
    }

    const textResponse = data.choices[0].message.content;
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
        throw new Error('No valid JSON found in Groq response');
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
        id: recipe.id || `groq-${Date.now()}-${index}`,
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
    console.error('❌ Error generating recipes with Groq:');
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

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const textResponse = data.choices[0].message.content;
    
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
  console.log('🧪 Testing Groq from browser console...');
  try {
    const isWorking = await testGeminiConnection();
    if (isWorking) {
      console.log('✅ Groq API is working!');
      
      // Test recipe generation
      console.log('🍳 Testing recipe generation...');
      const recipes = await generateRecipesWithGemini(['chicken', 'rice'], 1);
      console.log('✅ Recipe generation successful:', recipes);
    } else {
      console.log('❌ Groq API is not working');
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
  console.log('🔧 Groq API Configuration:');
  console.log('   API URL:', GROQ_API_URL);
  console.log('   API Key:', GROQ_API_KEY.substring(0, 10) + '...');
  console.log('   Model: llama-3.1-8b-instant');
}; 