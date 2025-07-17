const ActionLog = require('../models/ActionLog');
const User = require('../models/User');

/**
 * Creates and saves an action log, then broadcasts it via sockets.
 * @param {object} io - The Socket.IO instance.
 * @param {string} userId - The ID of the user who performed the action.
 * @param {string} actionText - The description of the action.
 */
const logAction = async (io, userId, actionText) => {
  try {
    const user = await User.findById(userId, 'username');
    if (!user) return; 

    const newLog = new ActionLog({
      user: userId,
      action: actionText,
    });
    
    await newLog.save();

    io.emit('action:logged', {
      _id: newLog._id,
      user: { username: user.username },
      action: newLog.action,
      timestamp: newLog.timestamp,
    });
  } catch (error) {
    console.error('Failed to log action:', error);
  }
};

module.exports = logAction;