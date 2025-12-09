import { Recipe } from '../types';

export const recipeDatabase: Recipe[] = [
  {
    id: '1',
    name: 'Vegetable Stir Fry',
    ingredients: ['vegetables', 'carrots', 'broccoli', 'bell peppers', 'onions'],
    instructions: [
      'Heat oil in a large pan',
      'Add chopped vegetables',
      'Stir fry for 5-7 minutes',
      'Season with salt and pepper',
      'Serve hot'
    ],
    prepTime: 15,
    servings: 4,
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'
  },
  {
    id: '2',
    name: 'Creamy Mushroom Pasta',
    ingredients: ['pasta', 'mushrooms', 'cream', 'garlic', 'cheese'],
    instructions: [
      'Cook pasta according to package directions',
      'Sauté mushrooms and garlic',
      'Add cream and simmer',
      'Toss with pasta',
      'Top with cheese'
    ],
    prepTime: 20,
    servings: 2,
    image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg'
  },
  {
    id: '3',
    name: 'Fresh Fruit Smoothie',
    ingredients: ['bananas', 'berries', 'yogurt', 'honey', 'milk'],
    instructions: [
      'Add all ingredients to blender',
      'Blend until smooth',
      'Pour into glasses',
      'Serve immediately'
    ],
    prepTime: 5,
    servings: 2,
    image: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg'
  },
  {
    id: '4',
    name: 'Chicken Salad',
    ingredients: ['chicken', 'lettuce', 'tomatoes', 'cucumber', 'dressing'],
    instructions: [
      'Cook and slice chicken',
      'Prepare vegetables',
      'Mix in large bowl',
      'Add dressing',
      'Toss and serve'
    ],
    prepTime: 25,
    servings: 3,
    image: 'https://images.pexels.com/photos/1213710/pexels-photo-1213710.jpeg'
  }
];

export const findRecipesByIngredients = (availableIngredients: string[]): Recipe[] => {
  return recipeDatabase.filter(recipe => {
    const matchingIngredients = recipe.ingredients.filter(ingredient => 
      availableIngredients.some(available => 
        available.toLowerCase().includes(ingredient.toLowerCase()) ||
        ingredient.toLowerCase().includes(available.toLowerCase())
      )
    );
    return matchingIngredients.length >= 2; // At least 2 matching ingredients
  });
};