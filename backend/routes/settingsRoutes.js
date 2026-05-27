const express = require("express");

const router = express.Router();

const {
  updateSettings,
  getSettings
} = require("../controllers/settingsController");




router.get('/',getSettings)

router.put('/',updateSettings)

module.exports = router;