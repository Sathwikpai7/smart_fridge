const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  email: {
    type: String,
    default: ''
  },
  dairyAlert: {
    type: Number,
    default: 24
  },
  vegetableAlert: {
    type: Number,
    default: 3
  },
  snackAlert: {
    type: Number,
    default: 7
  },
  medicineAlert: {
    type: Number,
    default: 7
  },
  enableSensorAlerts: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);

