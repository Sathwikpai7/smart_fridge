const Medicine = require("../models/Medicine");
const Settings = require("../models/Settings");// model inside mongoose



// Get settings
const getSettings= async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update settings
const updateSettings=async (req, res) => {
  try {
    // Remove id field from body if present
    const { id, ...updateData } = req.body;
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(updateData);
      await settings.save();
    } else {
      Object.assign(settings, updateData);
      await settings.save();
    }
    res.json(settings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



module.exports = {
    getSettings,
    updateSettings
};