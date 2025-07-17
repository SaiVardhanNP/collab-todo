const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  password: { 
    type: String, 
    required: true 
  },
}, { 
  timestamps: true 
});

// Use the standard module.exports for consistency
module.exports = mongoose.model('User', UserSchema);