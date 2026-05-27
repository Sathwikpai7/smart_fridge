const mongoose = require("mongoose");

const FoodItem = require("../models/FoodItem");
const Settings = require("../models/Settings");

const transporter = require("../config/mail");

// Get all food items
const getFoodItems = async (req, res) => {
  try {
    const items = await FoodItem.find().sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single food item
const getFoodItem = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: "Invalid item ID",
      });
    }

    const item = await FoodItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        error: "Item not found",
      });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// Create food item
const createFoodItem = async (req, res) => {
  try {
    const item = new FoodItem(req.body);

    await item.save();

    // Expiry check
    const expiryDate = new Date(item.expiryDate);

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (expiryDate < today) {
      console.log("⚠️ Expired food item detected:", item.name);

      const settings = await Settings.getSettings();

      if (settings.email) {
        try {
          await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: settings.email,
            subject: `⚠️ Expired Food Item Alert: ${item.name}`,
            text: `Your food item "${item.name}" has already expired on ${item.expiryDate}.

Please dispose of it properly and do not consume.

Best regards,
Smart Fridge System`,
          });

          console.log("📧 Expiry alert email sent");
        } catch (emailErr) {
          console.error("❌ Failed to send expiry alert:", emailErr.message);
        }
      }
    }

    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// Update food item
const updateFoodItem = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: "Invalid item ID",
      });
    }

    const { id, ...updateData } = req.body;

    const item = await FoodItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!item) {
      return res.status(404).json({
        error: "Item not found",
      });
    }

    // Expiry check after update
    if (updateData.expiryDate) {
      const expiryDate = new Date(item.expiryDate);

      const today = new Date();

      today.setHours(0, 0, 0, 0);

      if (expiryDate < today) {
        const settings = await Settings.getSettings();

        if (settings.email) {
          try {
            await transporter.sendMail({
              from: process.env.GMAIL_USER,
              to: settings.email,
              subject: `⚠️ Expired Food Item Alert: ${item.name}`,
              text: `Your food item "${item.name}" has already expired on ${item.expiryDate}.

Please dispose of it properly and do not consume.

Best regards,
Smart Fridge System`,
            });

            console.log("📧 Expiry alert email sent");
          } catch (emailErr) {
            console.error("❌ Failed to send expiry alert:", emailErr.message);
          }
        }
      }
    }

    res.json(item);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// Delete food item
const deleteFoodItem = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: "Invalid item ID",
      });
    }

    const item = await FoodItem.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        error: "Item not found",
      });
    }

    res.json({
      message: "Item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// Delete all food items
const deleteAllFoodItems = async (req, res) => {
  try {
    await FoodItem.deleteMany({});

    res.json({
      message: "All items deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = {
  getFoodItems,
  getFoodItem,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
  deleteAllFoodItems,
};