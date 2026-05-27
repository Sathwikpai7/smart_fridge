# Local MongoDB Setup Guide

## Step 1: Install MongoDB on Windows

### Download and Install
1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - Version: Latest (7.0 or newer)
   - Platform: Windows
   - Package: MSI
3. Download and run the installer
4. During installation:
   - Choose "Complete" installation
   - ✅ Check "Install MongoDB as a Service"
   - ✅ Check "Install MongoDB Compass" (optional GUI tool)
   - Service Name: MongoDB (default)
   - Run service as: Network Service User (default)

### Verify Installation
After installation, MongoDB should start automatically as a Windows service.

## Step 2: Verify MongoDB is Running

### Check Service Status
Open PowerShell as Administrator and run:
```powershell
Get-Service MongoDB
```

You should see status as "Running"

### If Not Running, Start It:
```powershell
Start-Service MongoDB
```

### Test Connection
```powershell
mongosh
```
If it connects, you'll see: `Current Mongosh Log ID: ...`
Type `exit` to quit.

## Step 3: Create .env File

1. Navigate to the `backend` folder
2. Create a new file named `.env` (no extension)
3. Add this line:
   ```
   MONGODB_URI=mongodb://localhost:27017/smart-fridge
   ```

## Step 4: Start Your Backend

```bash
cd backend
npm start
```

You should see: `✅ MongoDB connected successfully`

## Troubleshooting

### MongoDB Service Won't Start
1. Open Services (Win + R, type `services.msc`)
2. Find "MongoDB" service
3. Right-click → Properties
4. Set Startup type to "Automatic"
5. Click "Start"

### Port 27017 Already in Use
If you get a port conflict:
1. Check what's using the port:
   ```powershell
   netstat -ano | findstr :27017
   ```
2. Stop the conflicting service or change MongoDB port

### Manual Start (If Service Fails)
```powershell
# Navigate to MongoDB bin folder (usually):
cd "C:\Program Files\MongoDB\Server\7.0\bin"
# Start MongoDB
.\mongod.exe --dbpath "C:\data\db"
```

Note: You may need to create `C:\data\db` folder first.

## Verify Everything Works

1. MongoDB service is running
2. `.env` file exists in `backend` folder with correct connection string
3. Backend server starts without MongoDB errors
4. You can create/read data through the API

