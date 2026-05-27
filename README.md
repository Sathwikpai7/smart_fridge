# 🧊 Smart Fridge - Intelligent Food Management System

> A full-stack web application for managing food inventory, medicines, and monitoring fridge sensors with AI-powered recipe suggestions.

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Models](#database-models)
- [API Routes](#api-routes)
- [Installation and Setup](#installation--setup)
- [Running the Project](#running-the-project)
- [Configuration](#configuration)
- [WebSocket Integration](#websocket-integration)

---

## Project Overview

Smart Fridge is an IoT-enabled food management system that helps users:
- Track food items and their expiry dates
- Manage medicine storage and schedules
- Monitor fridge conditions (temperature, humidity, gas levels)
- Receive email alerts for expiring items
- Get AI-powered recipe suggestions using Google Gemini API
- Scan and extract product information using OCR technology

This project combines a **Node.js/Express backend** with a **React TypeScript frontend**, integrated with MongoDB for data persistence and IoT sensors for real-time monitoring.

---

## ✨ Features

### 🍔 Food Inventory Management
- Add, update, and delete food items
- Track items by category (dairy, vegetables, fruits, meat, grains, snacks, other)
- Monitor expiry dates with automatic alerts
- Attach images to food items
- Track quantity and unit of measurement
- Real-time inventory dashboard

### 💊 Medicine Management
- Store medicine information (name, dosage, expiry date)
- Track quantities and usage instructions
- Set custom expiry alerts for medicines
- Monitor multiple medicines at once

### 🌡️ Sensor Integration
- Real-time temperature monitoring
- Humidity tracking
- Methane gas level detection
- Ultrasonic distance measurements (for smart fill level detection)
- WebSocket-based live data streaming from ESP32

### 🤖 AI Features
- Gemini API integration for recipe suggestions
- OCR (Optical Character Recognition) for scanning products
- Automated image analysis

### 📧 Notifications
- Email alerts for expiring items
- Customizable alert thresholds per category
- Settings management for alert preferences
- Nodemailer integration with Gmail

### 📊 Dashboard
- Overview of all inventory items
- Quick statistics and insights
- Category-wise item distribution

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 
- **Language:** TypeScript 
- **Build Tool:** Vite 
- **Styling:** TailwindCSS 
- **Routing:** React Router DOM 
- **Components:** Lucide React (icons)
- **OCR:** Tesseract.js 
- **Notifications:** React Toastify 
- **Date Handling:** date-fns 
- **Linting:** ESLint

### Backend
- **Runtime:** Node.js
- **Server:** Express.js 
- **Database:** MongoDB with Mongoose 
- **Email:** Nodemailer 
- **Real-time:** WebSocket (ws)
- **CORS:** cors 
- **Environment:** dotenv 

### External APIs
- Google Gemini API (AI recipe suggestions)
- Gmail SMTP (Email notifications)

---

## 📁 Project Structure

```
smart_fridge/
│
├── backend/
│   │
│   ├── server.js
│   ├── package.json
│   ├── .env
│   │
│   ├── config/
│   │   ├── db.js
│   │   └── mail.js
│   │
│   ├── controllers/
│   │   ├── foodController.js
│   │   ├── medicineController.js
│   │   ├── settingsController.js
│   │   └── mailController.js
│   │
│   ├── routes/
│   │   ├── foodRoutes.js
│   │   ├── medicineRoutes.js
│   │   ├── settingsRoutes.js
│   │   └── mailRoutes.js
│   │
│   ├── models/
│   │   ├── FoodItem.js
│   │   ├── Medicine.js
│   │   ├── SensorData.js
│   │   └── Settings.js
│   │
│   └── node_modules/
│
│
├── project/
│   │
│   ├── src/
│   │   │
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   ├── ItemCard.tsx
│   │   │   ├── RecipeCard.tsx
│   │   │   ├── ExpiryTimer.tsx
│   │   │   └── CategoryCard.tsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Inventory.tsx
│   │   │   ├── Medicine.tsx
│   │   │   ├── Sensors.tsx
│   │   │   ├── Recipes.tsx
│   │   │   ├── Settings.tsx
│   │   │   ├── Scan.tsx
│   │   │   ├── Upload.tsx
│   │   │   └── RemoveItem.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAPI.ts
│   │   │   └── useLocalStorage.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── geminiUtils.ts
│   │   │   ├── emailUtils.ts
│   │   │   ├── ocrUtils.ts
│   │   │   ├── sensorUtils.ts
│   │   │   ├── methaneAlertUtils.ts
│   │   │   └── dateUtils.ts
│   │   │
│   │   ├── types/
│   │   │   └── index.ts
│   │   │
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   │
│   ├── .env
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── node_modules/
│
│
├── README.md
├── .gitignore
└── package.json

```

---

## 🗄️ Database Models

### 1. **FoodItem Schema**
Stores information about food items in the fridge.

```javascript
{
  name: String (required),
  category: Enum ['dairy', 'vegetables', 'snacks', 'medicine', 'fruits', 'meat', 'grains', 'other'] (required),
  expiryDate: String (required),
  quantity: Number (default: 1),
  unit: String (default: 'piece'),
  addedDate: String (required),
  image: String (default: ''),
  location: String (default: 'fridge'),
  timestamps: { createdAt, updatedAt }
}
```

**Use Cases:**
- Track all food items stored in the fridge
- Categorize items for better organization
- Monitor expiry dates and receive alerts
- Track quantities available

---

### 2. **Medicine Schema**
Manages medicine storage and schedules.

```javascript
{
  name: String (required),
  dosage: String (default: ''),
  expiryDate: String (required),
  quantity: Number (default: 1),
  instructions: String (default: ''),
  addedDate: String (required),
  timestamps: { createdAt, updatedAt }
}
```

**Use Cases:**
- Store medicine information
- Track dosage instructions
- Monitor expiry dates
- Manage quantities of medicines

---

### 3. **SensorData Schema**
Stores real-time sensor readings from IoT devices.

```javascript
{
  temperature: Number,
  humidity: Number,
  gas: Number (methane level),
  distance: Number (ultrasonic sensor),
  createdAt: Date (default: Date.now)
}
```

**Use Cases:**
- Monitor fridge temperature
- Track humidity levels
- Detect methane gas (spoilage indicator)
- Measure fridge fill level

---

### 4. **Settings Schema**
Stores user preferences and alert thresholds.

```javascript
{
  email: String (default: ''),
  dairyAlert: Number (hours, default: 24),
  vegetableAlert: Number (hours, default: 3),
  snackAlert: Number (hours, default: 7),
  medicineAlert: Number (hours, default: 7),
  enableSensorAlerts: Boolean (default: true),
  timestamps: { createdAt, updatedAt }
}
```

**Use Cases:**
- Store user email for notifications
- Set custom expiry alerts per category
- Enable/disable sensor-based alerts
- Persist user preferences

---

## 🔌 API Routes

### **Base URL:** `http://localhost:4000`

### 🍔 Food Items Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/food-items` | Get all food items (sorted by newest first) |
| `GET` | `/api/food-items/:id` | Get a specific food item by ID |
| `POST` | `/api/food-items` | Create a new food item |
| `PUT` | `/api/food-items/:id` | Update a food item |
| `DELETE` | `/api/food-items/:id` | Delete a specific food item |
| `DELETE` | `/api/food-items` | Delete all food items |

**Create/Update Food Item Payload:**
```json
{
  "name": "Milk",
  "category": "dairy",
  "expiryDate": "2024-12-31",
  "quantity": 2,
  "unit": "liters",
  "addedDate": "2024-12-20",
  "image": "image_url",
  "location": "fridge"
}
```

---

### 💊 Medicines Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/medicines` | Get all medicines (sorted by newest first) |
| `GET` | `/api/medicines/:id` | Get a specific medicine by ID |
| `POST` | `/api/medicines` | Create a new medicine |
| `PUT` | `/api/medicines/:id` | Update a medicine |
| `DELETE` | `/api/medicines/:id` | Delete a specific medicine |

**Create/Update Medicine Payload:**
```json
{
  "name": "Aspirin",
  "dosage": "500mg",
  "expiryDate": "2025-06-30",
  "quantity": 30,
  "instructions": "Take 1 tablet twice daily",
  "addedDate": "2024-12-20"
}
```

---

### ⚙️ Settings Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/settings` | Get all settings (creates default if not exists) |
| `PUT` | `/api/settings` | Update settings |

**Update Settings Payload:**
```json
{
  "email": "user@example.com",
  "dairyAlert": 24,
  "vegetableAlert": 3,
  "snackAlert": 7,
  "medicineAlert": 7,
  "enableSensorAlerts": true
}
```

---

### 📧 Email Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/send-email` | Send an email notification |

**Email Payload:**
```json
{
  "to": "recipient@example.com",
  "subject": "Item Expiring Soon",
  "text": "Your milk is expiring on 2024-12-31"
}
```

---

## 📦 Installation and Setup

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas cloud account)
- **Git**

### Step 1: Clone the Repository

```bash
git clone https://github.com/Sathwikpai7/smart_fridge.git
cd smart_fridge
```

### Step 2: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../project
npm install
```

### Step 3: MongoDB Setup

Choose one option:

#### Option A: MongoDB Atlas (Cloud - Recommended)

1. Create account at https://www.mongodb.com/cloud/atlas/register
2. Create a free M0 cluster
3. Create database user with password
4. Whitelist your IP (or allow all: 0.0.0.0/0)
5. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/smart-fridge?retryWrites=true&w=majority`

#### Option B: Local MongoDB

**Windows:**
```bash
# Download and install from https://www.mongodb.com/try/download/community
# Or use Chocolatey:
choco install mongodb-community
```

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongod
```

### Step 4: Environment Configuration

Create `.env` file in the `backend` folder:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-fridge?retryWrites=true&w=majority
# OR for local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/smart-fridge

# Optional: Email Configuration (already set up with Gmail)
# GMAIL_USER=your-email@gmail.com
# GMAIL_PASS=your-app-password
```

**Note:** The backend has pre-configured Gmail credentials. For production, create your own Gmail App Password.

### Step 5: Optional - Google GROQ API Setup

For recipe suggestions to work:

1. Get API key 
2. Add to frontend environment or store in a config file
3. Update the .env with the API key

---

## 🚀 Running the Project

### Terminal 1: Start Backend Server

```bash
cd backend
npm start
# or for development with auto-reload:
npm run dev
```

Expected output:
```
✅ MongoDB connected successfully
Backend server running on port 4000
```

### Terminal 2: Start Frontend Development Server

```bash
cd project
npm run dev
```

Expected output:
```
VITE v5.4.2  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  press h + enter to show help
```

### Terminal 3 (Optional): WebSocket Listener

```bash
# The WebSocket server automatically starts on port 3000
# It will receive data from ESP32 and broadcast to connected clients
```

**Access the application:**
- Open browser to http://localhost:5173/
- Backend API: http://localhost:4000
- WebSocket: ws://localhost:3000

---

## ⚙️ Configuration

### Backend Configuration

**Port:** Default 4000 (can be changed in `backend/server.js`)

```javascript
const PORT = 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
```

**MongoDB Connection Timeout:** 5 seconds (configurable in `backend/server.js`)

```javascript
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-fridge';
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
});
```

### Frontend Configuration

**API Base URL:** Update in `hooks/useAPI.ts` if backend is on different host

**Vite Config:** `project/vite.config.ts`
- Development server port: 5173 (default)
- Build output: `dist/`

### CORS Configuration

Currently allows all origins (development-friendly):
```javascript
app.use(cors());
```

For production, specify allowed origins:
```javascript
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

---

## 🔌 WebSocket Integration

### Real-time Sensor Data Streaming

**Server:** `ws://localhost:3000`

**ESP32 Data Format (incoming):**
```json
{
  "temperature": 4.5,
  "humidity": 65,
  "methane_level": 0,
  "ultrasonic_value": 20
}
```

**Frontend Receives & Broadcasts:**
The WebSocket server automatically:
1. Receives data from ESP32
2. Saves to MongoDB (SensorData collection)
3. Broadcasts to all connected frontend clients

**Frontend Connection Example:**
```javascript
const ws = new WebSocket('ws://localhost:3000');
ws.onmessage = (event) => {
  const sensorData = JSON.parse(event.data);
  console.log('Temperature:', sensorData.temperature);
  console.log('Humidity:', sensorData.humidity);
  console.log('Methane:', sensorData.methane_level);
};
```

---

## 📱 API Usage Examples

### Create a Food Item

```bash
curl -X POST http://localhost:4000/api/food-items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Organic Milk",
    "category": "dairy",
    "expiryDate": "2024-12-31",
    "quantity": 2,
    "unit": "liters",
    "addedDate": "2024-12-20"
  }'
```

### Get All Food Items

```bash
curl http://localhost:4000/api/food-items
```

### Update a Food Item

```bash
curl -X PUT http://localhost:4000/api/food-items/ITEM_ID \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 1
  }'
```

### Send Email Notification

```bash
curl -X POST http://localhost:4000/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Milk Expiring Soon",
    "text": "Your milk will expire on 2024-12-31"
  }'
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions:**
1. Check MongoDB is running
2. Verify connection string in `.env`
3. Whitelist IP in MongoDB Atlas
4. Check firewall settings

### Frontend Can't Connect to Backend
**Solutions:**
1. Verify backend is running on port 4000
2. Check CORS configuration
3. Update API base URL in frontend
4. Check network connectivity

### Email Not Sending
**Solutions:**
1. Use Gmail App Password (not regular password)
2. Allow "Less secure apps" in Gmail settings
3. Check recipient email address
4. Check backend logs for errors

### WebSocket Connection Issues
**Solutions:**
1. Verify WebSocket server is running on port 3000
2. Check firewall allows port 3000
3. Ensure ESP32 is connected to network
4. Check ESP32 firmware for WebSocket implementation

---

## 📚 Frontend Pages

| Page | Route | Features |
|------|-------|----------|
| Dashboard | `/` | Overview of all inventory & sensors |
| Inventory | `/inventory` | View all food items, search, filter |
| Medicine | `/medicine` | Manage medicines & expiry tracking |
| Sensors | `/sensors` | Real-time sensor monitoring |
| Recipes | `/recipes` | Gemini AI recipe suggestions |
| Settings | `/settings` | User preferences & alert thresholds |
| Scan | `/scan` | OCR scanning & product identification |
| Upload | `/upload` | Batch upload items |
| Remove Item | `/remove-item` | Delete items from inventory |

---

## 🔐 Security Notes

⚠️ **Production Considerations:**
1. **Don't commit `.env` file** - Add to `.gitignore`
2. **Use environment variables** for sensitive data
3. **Implement authentication** for multi-user access
4. **Validate & sanitize** all API inputs
5. **Use HTTPS** in production
6. **Implement rate limiting** on API endpoints
7. **Secure WebSocket** with authentication tokens
8. **Use OAuth** instead of hardcoded credentials

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

For issues or questions:
1. Check existing documentation in `MONGODB_SETUP_GUIDE.md`
2. Review backend logs for errors
3. Check browser console for frontend errors
4. Open an issue on GitHub

---

## 🎉 Getting Started Quick Commands

```bash
# Clone & install
git clone https://github.com/Sathwikpai7/smart_fridge.git && cd smart_fridge
cd backend && npm install && cd ../project && npm install

# Set up MongoDB & .env (see QUICK_START.md)

# Run backend (Terminal 1)
cd backend && npm start

# Run frontend (Terminal 2)
cd project && npm run dev

# Access at http://localhost:5173
```

---

**Last Updated:** May 2026
**Status:** Active Development
