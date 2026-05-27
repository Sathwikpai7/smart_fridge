const mongoose = require("mongoose");
const Medicine = require("../models/Medicine");
const Settings = require("../models/Settings");
const transporter = require("../config/mail");

// GET all medicines
const getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ createdAt: -1 });
    console.log(medicines)
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET single medicine
const getMedicine = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: "Invalid medicine ID",
      });
    }

    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        error: "Medicine not found",
      });
    }

    res.json(medicine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CREATE medicine
const createMedicine = async (req, res) => {
  try {
    const medicine = new Medicine(req.body);

    await medicine.save();

    // expiry check
    const expiryDate = new Date(medicine.expiryDate);

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (expiryDate < today) {
      console.log("⚠️ Expired medicine detected:", medicine.name);

      const settings = await Settings.getSettings();

      if (settings.email) {
        try {
          await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: settings.email,
            subject: `⚠️ Expired Medicine Alert: ${medicine.name}`,
            text: `Your medicine "${medicine.name}" has already expired on ${medicine.expiryDate}.`
          });

          console.log("📧 Expiry alert email sent");
        } catch (emailErr) {
          console.log(emailErr.message);
        }
      }
    }

    res.status(201).json(medicine);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// UPDATE medicine
const updateMedicine = async (req, res) => {
  try {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: "Invalid medicine ID",
      });
    }

    const { id, ...updateData } = req.body;

    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!medicine) {
      return res.status(404).json({
        error: "Medicine not found",
      });
    }

    res.json(medicine);

  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// DELETE medicine
const deleteMedicine = async (req, res) => {
  try {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: "Invalid medicine ID",
      });
    }

    const medicine = await Medicine.findByIdAndDelete(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        error: "Medicine not found",
      });
    }

    res.json({
      message: "Medicine deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = {
  getMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
};