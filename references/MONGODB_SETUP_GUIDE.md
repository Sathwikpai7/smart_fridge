# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Cloud - RECOMMENDED) ⭐

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account
3. Create a free cluster (M0 - Free tier)

### Step 2: Get Your Connection String
1. In MongoDB Atlas dashboard, click "Connect"
2. Choose "Connect your application"
3. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
4. Replace `<password>` with your database password
5. Replace `<dbname>` with `smart-fridge` or add `?retryWrites=true&w=majority` at the end

### Step 3: Configure Your App
1. Create a `.env` file in the `backend` folder
2. Add your connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-fridge?retryWrites=true&w=majority
   ```

### Step 4: Allow Network Access
1. In Atlas dashboard, go to "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development) or add your IP

---

## Option 2: Local MongoDB Installation

### Windows:
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Install MongoDB
3. MongoDB usually runs automatically as a Windows service
4. If not, start it manually:
   ```bash
   # Navigate to MongoDB bin directory (usually C:\Program Files\MongoDB\Server\7.0\bin)
   mongod
   ```

### Mac (using Homebrew):
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux:
```bash
sudo systemctl start mongod
sudo systemctl enable mongod  # To start on boot
```

### Verify MongoDB is Running:
```bash
# Check if MongoDB is running
mongosh
# Or
mongo
```

---

## Quick Setup (Using Atlas - Easiest)

1. **Sign up**: https://www.mongodb.com/cloud/atlas/register
2. **Create cluster**: Choose free M0 tier
3. **Create database user**: 
   - Go to "Database Access"
   - Add new user, set username and password
4. **Whitelist IP**: 
   - Go to "Network Access"
   - Click "Add IP Address" → "Allow Access from Anywhere"
5. **Get connection string**:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
6. **Create `.env` file in `backend` folder**:
   ```
   MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/smart-fridge?retryWrites=true&w=majority
   ```

---

## Test Your Connection

After setting up, start your backend:
```bash
cd backend
npm start
```

You should see: `MongoDB connected successfully`

If you see an error, check:
- Connection string is correct
- Password doesn't have special characters (if it does, URL encode them)
- Network access is allowed in Atlas
- MongoDB service is running (if using local)

