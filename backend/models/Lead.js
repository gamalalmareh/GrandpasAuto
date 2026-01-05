const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true,
    lowercase: true,
    match: /^\S+@\S+\.\S+$/
  },
  phone: { 
    type: String, 
    required: true,
    trim: true
  },
  vehicleInterest: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  status: { 
    type: String, 
    enum: ['new', 'contacted', 'converted', 'lost'], 
    default: 'new' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true
  },
});

module.exports = mongoose.model('Lead', LeadSchema);
