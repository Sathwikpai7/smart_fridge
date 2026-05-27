# Gemini AI Recipe Integration

This project now includes AI-powered recipe suggestions using Google's Gemini API. The integration provides personalized recipe recommendations based on available ingredients in your inventory.

## Features

### 🍳 AI Recipe Generation
- **Smart Ingredient Matching**: Analyzes your available ingredients and suggests recipes that use them
- **Personalized Preferences**: Filter recipes by cuisine, difficulty level, prep time, and dietary restrictions
- **Real-time Generation**: Get fresh recipe suggestions with a single click
- **Fallback System**: Falls back to local recipes if AI generation fails

### 🎯 Recipe Preferences
- **Cuisine Selection**: Choose from Italian, Asian, Mexican, Indian, Mediterranean, or American
- **Difficulty Levels**: Easy, Medium, or Hard recipes
- **Prep Time Limits**: Set maximum preparation time (10-180 minutes)
- **Dietary Restrictions**: Vegetarian, Vegan, Gluten-Free, Dairy-Free, Low-Carb options

### 📱 User Interface
- **Beautiful Recipe Cards**: Modern, responsive design with ingredient matching indicators
- **Loading States**: Smooth loading animations during AI generation
- **Error Handling**: Graceful error messages and fallback options
- **Interactive Modals**: Detailed recipe view with step-by-step instructions

## How It Works

### 1. Ingredient Analysis
The system analyzes your inventory items and extracts ingredient names for recipe matching.

### 2. AI Prompt Generation
Creates intelligent prompts for Gemini API based on:
- Available ingredients
- User preferences (cuisine, difficulty, etc.)
- Dietary restrictions
- Prep time constraints

### 3. Recipe Processing
- Parses Gemini API responses
- Extracts recipe data (ingredients, instructions, timing)
- Assigns appropriate food images based on cuisine/tags
- Calculates ingredient match percentages

### 4. Smart Sorting
Recipes are sorted by:
- Ingredient match percentage
- User preferences
- Recipe complexity

## API Integration

### Gemini API Configuration
```typescript
const GEMINI_API_KEY = 'AIzaSyCswlWXhR_4vr6ByJKMKgfBtT2HAZfwSMc';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
```

### Key Functions

#### `generateRecipesWithGemini(ingredients, count)`
Generates general recipe suggestions using available ingredients.

#### `getRecipeSuggestions(ingredients, preferences)`
Generates personalized recipes based on user preferences.

### Error Handling
- Network error fallback to local recipes
- Invalid JSON response handling
- Rate limiting considerations
- Graceful degradation

## Usage

### Basic Recipe Generation
```typescript
import { generateRecipesWithGemini } from '../utils/geminiUtils';

const recipes = await generateRecipesWithGemini(['chicken', 'rice', 'tomatoes'], 5);
```

### Personalized Suggestions
```typescript
import { getRecipeSuggestions } from '../utils/geminiUtils';

const preferences = {
  cuisine: 'italian',
  difficulty: 'easy',
  maxPrepTime: 30,
  dietary: ['vegetarian']
};

const recipes = await getRecipeSuggestions(['pasta', 'tomatoes'], preferences);
```

## Components

### RecipeCard
Reusable component for displaying recipe information with:
- Ingredient availability indicators
- Match percentage badges
- Difficulty and cuisine tags
- Interactive hover effects

### Recipes Page
Main page featuring:
- AI recipe generation controls
- Preference settings panel
- Recipe grid with filtering
- Detailed recipe modal

## Configuration

### Environment Variables
Add your Gemini API key to the configuration:
```typescript
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyCswlWXhR_4vr6ByJKMKgfBtT2HAZfwSMc';
```

### API Limits
- Maximum 6 recipes per generation
- 2048 token response limit
- Temperature: 0.7-0.8 for creativity balance
- Safety settings enabled for content filtering

## Future Enhancements

### Planned Features
- **Recipe Ratings**: User feedback system
- **Shopping Lists**: Generate missing ingredient lists
- **Nutritional Info**: Add calorie and macro information
- **Recipe Sharing**: Social sharing capabilities
- **Voice Commands**: Voice-activated recipe generation

### Technical Improvements
- **Caching**: Cache popular recipe combinations
- **Offline Mode**: Local recipe database expansion
- **Image Generation**: AI-generated recipe images
- **Multi-language**: International recipe support

## Troubleshooting

### Common Issues

1. **API Key Errors**
   - Verify your Gemini API key is valid
   - Check API quota and billing status

2. **No Recipes Generated**
   - Ensure you have ingredients in your inventory
   - Try adjusting preference settings
   - Check network connectivity

3. **Slow Response Times**
   - API response times vary (2-10 seconds)
   - Consider reducing recipe count
   - Check API service status

### Debug Mode
Enable debug logging by setting:
```typescript
const DEBUG_MODE = true;
```

This will log API requests and responses for troubleshooting.

## Contributing

When contributing to the Gemini integration:

1. Test API responses thoroughly
2. Handle edge cases gracefully
3. Maintain fallback functionality
4. Update documentation
5. Follow TypeScript best practices

## License

This integration uses Google's Gemini API. Please ensure compliance with Google's terms of service and API usage policies. 