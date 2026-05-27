# 🚀 Quick Start - Fix MongoDB Connection Error

## The Error You're Seeing
```
MongooseServerSelectionError: connect ECONNREFUSED
```
This means MongoDB is not running or not accessible.

## ✅ EASIEST SOLUTION: Use MongoDB Atlas (Cloud - 2 minutes)

### Step 1: Create Free MongoDB Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up (it's free!)
3. Choose "Build a Database" → Free tier (M0)

### Step 2: Create Database User
1. Click "Database Access" in left menu
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter username (e.g., `smartfridge`) and password
5. Click "Add User"
6. **SAVE YOUR PASSWORD** - you'll need it!

### Step 3: Allow Network Access
1. Click "Network Access" in left menu
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

### Step 4: Get Connection String
1. Click "Database" in left menu
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 5: Create .env File
1. In the `backend` folder, create a file named `.env`
2. Add this line (replace with YOUR connection string):
   ```
   MONGODB_URI=mongodb+srv://smartfridge:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/smart-fridge?retryWrites=true&w=majority
   ```
   **Important**: Replace:
   - `smartfridge` with your username
   - `YOUR_PASSWORD` with your password
   - `cluster0.xxxxx.mongodb.net` with your cluster address
   - Add `/smart-fridge` before the `?` to specify database name

### Step 6: Test
```bash
cd backend
npm start
```

You should see: `✅ MongoDB connected successfully`

---

## Alternative: Install Local MongoDB

### Windows:
1. Download: https://www.mongodb.com/try/download/community
2. Install MongoDB
3. MongoDB should start automatically
4. Create `.env` file in `backend` folder:
   ```
   MONGODB_URI=mongodb://localhost:27017/smart-fridge
   ```

### Mac:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

Then create `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/smart-fridge
```

---

## Need Help?

- See `MONGODB_SETUP_GUIDE.md` for detailed instructions
- Check `backend/SETUP_ENV.txt` for .env file template

