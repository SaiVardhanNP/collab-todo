const ActionLog = require('../models/ActionLog');
const User = require('../models/User');

const logAction = async (io, userId, actionText) => {
  try {
    if (!userId) {
      console.error('logAction called without a userId.');
      return;
    }
    const user = await User.findById(userId, 'username');
    if (!user) {
      console.error(`logAction: User with ID ${userId} not found.`);
      return; 
    }
    const newLog = new ActionLog({
      user: userId,
      action: actionText,
    });
    await newLog.save();
    const populatedLog = {
      _id: newLog._id,
      user: { _id: user._id, username: user.username },
      action: newLog.action,
      timestamp: newLog.timestamp,
    };
    if (io) {
      io.emit('action:logged', populatedLog);
    }
  } catch (error) {
    console.error('CRITICAL: Failed to log action:', error);
  }
};

module.exports = logAction;