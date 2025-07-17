const mongoose = require('mongoose');

const ActionLogSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  action: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
});

// This line is the fix.
module.exports = mongoose.model('ActionLog', ActionLogSchema);