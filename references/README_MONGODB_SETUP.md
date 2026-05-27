# MongoDB Setup Instructions

This project has been migrated from localStorage to MongoDB. Follow these steps to set up and run the application.

## Prerequisites

1. **MongoDB Installation**
   - Install MongoDB locally: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

2. **Node.js and npm** (already installed)

## Setup Steps

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies (already done):
   ```bash
   npm install
   ```

3. Configure MongoDB connection:
   - For local MongoDB: Create a `.env` file in the `backend` directory with:
     ```
     MONGODB_URI=mongodb://localhost:27017/smart-fridge
     ```
   - For MongoDB Atlas: Update the `.env` file with your Atlas connection string:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-fridge
     ```

4. Start MongoDB (if using local):
   - Windows: Run `mongod` from your MongoDB installation directory
   - Mac/Linux: Run `mongod` or use `brew services start mongodb-community`

5. Start the backend server:
   ```bash
   node server.js
   ```
   The server will run on `http://localhost:4000`

### 2. Frontend Setup

1. Navigate to the project directory:
   ```bash
   cd project
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

The backend provides the following API endpoints:

### Food Items
- `GET /api/food-items` - Get all food items
- `GET /api/food-items/:id` - Get single food item
- `POST /api/food-items` - Create food item
- `PUT /api/food-items/:id` - Update food item
- `DELETE /api/food-items/:id` - Delete food item
- `DELETE /api/food-items` - Delete all food items

### Medicines
- `GET /api/medicines` - Get all medicines
- `GET /api/medicines/:id` - Get single medicine
- `POST /api/medicines` - Create medicine
- `PUT /api/medicines/:id` - Update medicine
- `DELETE /api/medicines/:id` - Delete medicine

### Settings
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings

### Email
- `POST /send-email` - Send email notification

## Changes Made

1. **Removed localStorage**: All data is now stored in MongoDB
2. **New API hooks**: Created `useAPI.ts` with hooks:
   - `useFoodItems()` - Manage food items
   - `useMedicines()` - Manage medicines
   - `useSettings()` - Manage settings
3. **Backend API**: Express server with MongoDB/Mongoose
4. **Models**: Created Mongoose models for FoodItem, Medicine, and Settings

## Troubleshooting

1. **MongoDB connection error**: 
   - Ensure MongoDB is running
   - Check your connection string in `.env`
   - Verify network/firewall settings for Atlas

2. **CORS errors**: 
   - Backend CORS is configured to allow all origins
   - If issues persist, check browser console

3. **Data not loading**:
   - Check backend server is running on port 4000
   - Verify MongoDB connection
   - Check browser console for API errors

## Notes

- The `useLocalStorage` hook is still in the codebase but is no longer used
- All components have been updated to use the new API hooks
- MongoDB `_id` fields are automatically mapped to `id` for frontend compatibility
-collections will be there inside the mongo
