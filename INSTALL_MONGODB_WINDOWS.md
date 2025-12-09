# Install MongoDB on Windows - Quick Guide

## ✅ Step 1: Download MongoDB

1. Go to: **https://www.mongodb.com/try/download/community**
2. Select:
   - **Version**: 7.0 (or latest)
   - **Platform**: Windows
   - **Package**: MSI
3. Click **Download**

## ✅ Step 2: Install MongoDB

1. Run the downloaded `.msi` installer
2. Click **Next** through the setup wizard
3. **Important**: Check these options:
   - ✅ **Install MongoDB as a Service**
   - ✅ **Run service as Network Service user**
   - ✅ **Install MongoDB Compass** (optional - nice GUI tool)
4. Click **Install**
5. Wait for installation to complete

## ✅ Step 3: Verify MongoDB is Running

### Option A: Check Windows Services
1. Press `Win + R`
2. Type `services.msc` and press Enter
3. Look for **MongoDB** service
4. Status should be **Running**

### Option B: PowerShell Command
```powershell
Get-Service MongoDB
```

### Option C: Test Connection
Open PowerShell and run:
```powershell
mongosh
```
If it connects, you'll see MongoDB shell. Type `exit` to quit.

## ✅ Step 4: Start MongoDB (If Not Running)

If MongoDB service is not running:

### Method 1: Services Window
1. Open Services (`Win + R` → `services.msc`)
2. Find **MongoDB**
3. Right-click → **Start**

### Method 2: PowerShell (Run as Administrator)
```powershell
Start-Service MongoDB
```

## ✅ Step 5: Verify Your .env File

Your `.env` file in the `backend` folder should contain:
```
MONGODB_URI=mongodb://localhost:27017/smart-fridge
```

✅ **Already created for you!**

## ✅ Step 6: Test Your Backend

```bash
cd backend
npm start
```

You should see:
```
✅ MongoDB connected successfully
📊 Database: Local MongoDB
```

## 🚨 Troubleshooting

### MongoDB Service Won't Start
1. Open Services (`Win + R` → `services.msc`)
2. Find **MongoDB**
3. Right-click → **Properties**
4. Set **Startup type** to **Automatic**
5. Click **Start**

### "mongod not found" Error
- MongoDB is not installed or not in PATH
- Reinstall MongoDB and make sure to check "Add to PATH" option

### Port 27017 Already in Use
1. Check what's using the port:
   ```powershell
   netstat -ano | findstr :27017
   ```
2. Stop the conflicting application
3. Or change MongoDB port in `.env` file

### Manual Start (If Service Fails)
```powershell
# Create data directory (if it doesn't exist)
New-Item -ItemType Directory -Force -Path "C:\data\db"

# Navigate to MongoDB bin (adjust path if different)
cd "C:\Program Files\MongoDB\Server\7.0\bin"

# Start MongoDB manually
.\mongod.exe --dbpath "C:\data\db"
```

## 📝 Next Steps

Once MongoDB is running:
1. ✅ `.env` file is already created with local connection
2. Start your backend: `cd backend && npm start`
3. Your app will use local MongoDB database!

