const mongoose = require('mongoose');

const CarSchema = new mongoose.Schema({
  year: { 
    type: Number, 
    required: true 
  },
  make: { 
    type: String, 
    required: true,
    trim: true
  },
  model: { 
    type: String, 
    required: true,
    trim: true
  },
  price: { 
    type: Number, 
    required: true 
  },
  mileage: { 
    type: Number, 
    default: 0 
  },
  city: { 
    type: String, 
    default: 'Gloucester',
    trim: true
  },
  state: { 
    type: String, 
    default: 'VA',
    trim: true
  },
  imageUrl: { 
    type: String, 
    required: true 
  },
  images: [{ 
    type: String 
  }],
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = mongoose.model('Car', CarSchema);
