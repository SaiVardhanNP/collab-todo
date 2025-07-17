const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
// This line is the fix. We import the model directly.
const ActionLog = require('../models/ActionLog');

// @route   GET /api/logs
// @desc    Get the last 20 action logs
router.get('/', auth, async (req, res) => {
  try {
    const logs = await ActionLog.find()
      .sort({ timestamp: -1 })
      .limit(20)
      .populate('user', 'username');

    res.json(logs);
  } catch (err) {
    console.error("ERROR in GET /logs:", err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;