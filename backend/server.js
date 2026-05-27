// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const nodemailer = require('nodemailer');
// const cors = require('cors');
// const WebSocket = require('ws');

// const FoodItem = require('./models/FoodItem');
// const Medicine = require('./models/Medicine');
// const Settings = require('./models/Settings');
// const SensorData = require('./models/SensorData');

// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // MongoDB connection
// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-fridge';

// mongoose.connect(MONGODB_URI, {
//   serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
// })
//   .then(() => {
//     console.log('✅ MongoDB connected successfully');
//     console.log('📊 Database:', MONGODB_URI.includes('localhost') ? 'Local MongoDB' : 'MongoDB Atlas');
//   })
//   .catch(err => {
//     console.error('❌ MongoDB connection error:', err.message);
//     console.error('\n📝 To fix this error:');
//     console.error('1. If using local MongoDB: Make sure MongoDB is running');
//     console.error('   - Windows: Check Services or run "mongod"');
//     console.error('   - Mac/Linux: Run "brew services start mongodb-community" or "sudo systemctl start mongod"');
//     console.error('2. If using MongoDB Atlas:');
//     console.error('   - Create a .env file in the backend folder');
//     console.error('   - Add: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-fridge');
//     console.error('   - Make sure your IP is whitelisted in Atlas Network Access');
//     console.error('\n💡 See MONGODB_SETUP_GUIDE.md for detailed instructions\n');
//     // Don't exit - let the server start anyway (API will fail but server won't crash)
//   });

// // Email transporter
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'sathwik11112005@gmail.com',
//     pass: 'fpoxfnchblqrufjr' // Use an App Password, not your real password!
//   }
// });

// // ========== FOOD ITEMS API ==========
// const wss = new WebSocket.Server({ port: 3000 });

// wss.on('connection', (ws) => {
//   console.log('🔌 WebSocket client connected');

//   ws.on('message', async (message) => {
//     try {
//       const data = JSON.parse(message.toString());
//       console.log('📡 ESP32 Data:', data);

//       // 🔥 Save to MongoDB
//       await SensorData.create({
//         temperature: data.temperature,
//         humidity: data.humidity,
//         gas: data.methane_level,
//         distance: data.ultrasonic_value
//       });

//       // 🔁 Broadcast to ALL clients (frontend)
//       wss.clients.forEach(client => {
//         if (client.readyState === WebSocket.OPEN) {
//           client.send(JSON.stringify(data));
//         }
//       });

//     } catch (err) {
//       console.error('❌ Error processing WebSocket data:', err);
//     }
//   });

//   ws.on('close', () => {
//     console.log('❌ WebSocket client disconnected');
//   });
// });// newly added
// // Get all food items
// app.get('/api/food-items', async (req, res) => {
//   try {
//     const items = await FoodItem.find().sort({ createdAt: -1 });
//     res.json(items);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Get single food item
// app.get('/api/food-items/:id', async (req, res) => {
//   try {
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return res.status(400).json({ error: 'Invalid item ID' });
//     }
//     const item = await FoodItem.findById(req.params.id);
//     if (!item) return res.status(404).json({ error: 'Item not found' });
//     res.json(item);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Create food item
// app.post('/api/food-items', async (req, res) => {
//   try {
//     const item = new FoodItem(req.body);
//     await item.save();
    
//     // Check if food item is expired and send email alert
//     const expiryDate = new Date(item.expiryDate);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     if (expiryDate < today) {
//       console.log('⚠️ Expired food item detected:', item.name);
//       const settings = await Settings.getSettings();
//       if (settings.email) {
//         try {
//           await transporter.sendMail({
//             from: 'sathwik11112005@gmail.com',
//             to: settings.email,
//             subject: `⚠️ Expired Food Item Alert: ${item.name}`,
//             text: `Your food item "${item.name}" has already expired on ${item.expiryDate}.\n\nPlease dispose of it properly and do not consume.\n\nBest regards,\nSmart Fridge System`
//           });
//           console.log('📧 Expiry alert email sent to:', settings.email);
//         } catch (emailErr) {
//           console.error('❌ Failed to send expiry alert:', emailErr.message);
//         }
//       }
//     }
    
//     res.status(201).json(item);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // Update food item
// app.put('/api/food-items/:id', async (req, res) => {
//   try {
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return res.status(400).json({ error: 'Invalid item ID' });
//     }
//     // Remove id field from body if present (MongoDB uses _id internally)
//     const { id, ...updateData } = req.body;
//     const item = await FoodItem.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { new: true, runValidators: true }
//     );
//     if (!item) return res.status(404).json({ error: 'Item not found' });
    
//     // Check if updated food item is expired and send email alert
//     if (updateData.expiryDate) {
//       const expiryDate = new Date(item.expiryDate);
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
      
//       if (expiryDate < today) {
//         console.log('⚠️ Expired food item detected after update:', item.name);
//         const settings = await Settings.getSettings();
//         if (settings.email) {
//           try {
//             await transporter.sendMail({
//               from: 'sathwik11112005@gmail.com',
//               to: settings.email,
//               subject: `⚠️ Expired Food Item Alert: ${item.name}`,
//               text: `Your food item "${item.name}" has already expired on ${item.expiryDate}.\n\nPlease dispose of it properly and do not consume.\n\nBest regards,\nSmart Fridge System`
//             });
//             console.log('📧 Expiry alert email sent to:', settings.email);
//           } catch (emailErr) {
//             console.error('❌ Failed to send expiry alert:', emailErr.message);
//           }
//         }
//       }
//     }
    
//     res.json(item);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // Delete food item
// app.delete('/api/food-items/:id', async (req, res) => {
//   try {
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return res.status(400).json({ error: 'Invalid item ID' });
//     }
//     const item = await FoodItem.findByIdAndDelete(req.params.id);
//     if (!item) return res.status(404).json({ error: 'Item not found' });
//     res.json({ message: 'Item deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Delete all food items
// app.delete('/api/food-items', async (req, res) => {
//   try {
//     await FoodItem.deleteMany({});
//     res.json({ message: 'All items deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // ========== MEDICINES API ==========

// // Get all medicines
// app.get('/api/medicines', async (req, res) => {
//   try {
//     const medicines = await Medicine.find().sort({ createdAt: -1 });
//     res.json(medicines);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Get single medicine
// app.get('/api/medicines/:id', async (req, res) => {
//   try {
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return res.status(400).json({ error: 'Invalid medicine ID' });
//     }
//     const medicine = await Medicine.findById(req.params.id);
//     if (!medicine) return res.status(404).json({ error: 'Medicine not found' });
//     res.json(medicine);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Create medicine
// app.post('/api/medicines', async (req, res) => {
//   try {
//     const medicine = new Medicine(req.body);
//     await medicine.save();
    
//     // Check if medicine is expired and send email alert
//     const expiryDate = new Date(medicine.expiryDate);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     if (expiryDate < today) {
//       console.log('⚠️ Expired medicine detected:', medicine.name);
//       const settings = await Settings.getSettings();
//       if (settings.email) {
//         try {
//           await transporter.sendMail({
//             from: 'sathwik11112005@gmail.com',
//             to: settings.email,
//             subject: `⚠️ Expired Medicine Alert: ${medicine.name}`,
//             text: `Your medicine "${medicine.name}" has already expired on ${medicine.expiryDate}.\n\nPlease dispose of it properly and do not use.\n\nBest regards,\nSmart Fridge System`
//           });
//           console.log('📧 Expiry alert email sent to:', settings.email);
//         } catch (emailErr) {
//           console.error('❌ Failed to send expiry alert:', emailErr.message);
//         }
//       }
//     }
    
//     res.status(201).json(medicine);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // Update medicine
// app.put('/api/medicines/:id', async (req, res) => {
//   try {
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return res.status(400).json({ error: 'Invalid medicine ID' });
//     }
//     // Remove id field from body if present (MongoDB uses _id internally)
//     const { id, ...updateData } = req.body;
//     const medicine = await Medicine.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { new: true, runValidators: true }
//     );
//     if (!medicine) return res.status(404).json({ error: 'Medicine not found' });
    
//     // Check if updated medicine is expired and send email alert
//     if (updateData.expiryDate) {
//       const expiryDate = new Date(medicine.expiryDate);
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
      
//       if (expiryDate < today) {
//         console.log('⚠️ Expired medicine detected after update:', medicine.name);
//         const settings = await Settings.getSettings();
//         if (settings.email) {
//           try {
//             await transporter.sendMail({
//               from: 'sathwik11112005@gmail.com',
//               to: settings.email,
//               subject: `⚠️ Expired Medicine Alert: ${medicine.name}`,
//               text: `Your medicine "${medicine.name}" has already expired on ${medicine.expiryDate}.\n\nPlease dispose of it properly and do not use.\n\nBest regards,\nSmart Fridge System`
//             });
//             console.log('📧 Expiry alert email sent to:', settings.email);
//           } catch (emailErr) {
//             console.error('❌ Failed to send expiry alert:', emailErr.message);
//           }
//         }
//       }
//     }
    
//     res.json(medicine);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // Delete medicine
// app.delete('/api/medicines/:id', async (req, res) => {
//   try {
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return res.status(400).json({ error: 'Invalid medicine ID' });
//     }
//     const medicine = await Medicine.findByIdAndDelete(req.params.id);
//     if (!medicine) return res.status(404).json({ error: 'Medicine not found' });
//     res.json({ message: 'Medicine deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // ========== SETTINGS API ==========

// // Get settings
// app.get('/api/settings', async (req, res) => {
//   try {
//     const settings = await Settings.getSettings();
//     res.json(settings);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Update settings
// app.put('/api/settings', async (req, res) => {
//   try {
//     // Remove id field from body if present
//     const { id, ...updateData } = req.body;
//     let settings = await Settings.findOne();
//     if (!settings) {
//       settings = new Settings(updateData);
//       await settings.save();
//     } else {
//       Object.assign(settings, updateData);
//       await settings.save();
//     }
//     res.json(settings);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // ========== EMAIL API ==========

// app.post('/send-email', async (req, res) => {
//   const { to, subject, text } = req.body;
//   console.log('[Backend] /send-email called');
//   console.log('[Backend] Sending email:', { to, subject });
//   try {
//     await transporter.sendMail({
//       from: 'sathwik11112005@gmail.com',
//       to,
//       subject,
//       text
//     });
//     console.log('[Backend] Email sent successfully to:', to);
//     res.json({ success: true });
//   } catch (err) {
//     console.error('[Backend] Email send error:', err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// const PORT = 4000;
// app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const WebSocket = require("ws");

const connectDB = require("./config/db");

const SensorData = require("./models/SensorData");

const foodRoutes = require("./routes/foodRoutes");
const medicineRoutes = require("./routes/medicineroutes");
const Settings = require("./models/Settings");
const settingRoutes=require("./routes/settingsRoutes.js")
const sendToMail=require("./routes/mailRoutes")

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Database Connection
connectDB();

// Routes
app.use("/api/food-items", foodRoutes);
app.use("/api/medicines",medicineRoutes)
app.use("/api/settings",settingRoutes)
app.use("/send-mail",sendToMail)
// WebSocket Server
const wss = new WebSocket.Server({
  port: 3000,
});

wss.on("connection", (ws) => {
  console.log("🔌 WebSocket client connected");

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message.toString());

      console.log("📡 ESP32 Data:", data);

      // Save sensor data
      await SensorData.create({
        temperature: data.temperature,
        humidity: data.humidity,
        gas: data.methane_level,
        distance: data.ultrasonic_value,
      });

      // Broadcast to all frontend clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (err) {
      console.error("❌ Error processing WebSocket data:", err);
    }
  });

  ws.on("close", () => {
    console.log("❌ WebSocket client disconnected");
  });
});


// Root Route
app.get("/", (req, res) => {
  res.send("Smart Fridge Backend Running");
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});