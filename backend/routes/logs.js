const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ActionLog = require('../models/ActionLog');

router.get('/', auth, async (req, res) => {
  try {
    const logs = await ActionLog.find()
      .sort({ timestamp: -1 }) 
      .limit(20) 
      .populate('user', 'username');

    res.json(logs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;