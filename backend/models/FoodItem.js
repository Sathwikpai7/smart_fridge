const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['dairy', 'vegetables', 'snacks', 'medicine', 'fruits', 'meat', 'grains', 'other'],
    required: true
  },
  expiryDate: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  unit: {
    type: String,
    required: true,
    default: 'piece'
  },
  addedDate: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: 'fridge'
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

module.exports = mongoose.model('FoodItem', foodItemSchema);

