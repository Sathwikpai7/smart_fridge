export interface FoodItem {
  id: string;
  name: string;
  category: 'dairy' | 'vegetables' | 'snacks' | 'medicine' | 'fruits' | 'meat' | 'grains' | 'other';
  expiryDate: string;
  quantity: number;
  unit: string;
  addedDate: string;
  image?: string;
  location?: string;
}

export interface SensorData {
  temperature: number;
  humidity: number;
  methaneLevel: number;
  ultrasonicDistance: number;
  timestamp: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  servings: number;
  image?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  cuisine?: string;
  tags?: string[];
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  expiryDate: string;
  quantity: number;
  instructions: string;
  addedDate: string;
}

export interface NotificationSettings {
  email: string;
  dairyAlert: number; // hours before expiry
  vegetableAlert: number; // days before expiry
  snackAlert: number; // days before expiry
  medicineAlert: number; // days before expiry
  enableSensorAlerts: boolean;
}

export type { FoodItem };