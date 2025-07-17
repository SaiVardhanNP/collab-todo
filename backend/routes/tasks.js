const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.js');
const Task = require('../models/Task.js');
const User = require('../models/User.js');
const logAction = require('../utils/logAction.js');

router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignedUser', 'username').sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error("ERROR in GET /tasks:", err);
    res.status(500).send('Server Error');
  }
});

router.post('/', auth, async (req, res) => {
  if (!req.user || !req.user.id) return res.status(401).json({ msg: 'User not authorized' });
  try {
    const io = req.app.get('socketio');
    const { title, description, priority } = req.body;
    const newTask = new Task({ title, description, priority });
    const task = await newTask.save();
    const populatedTask = await Task.findById(task._id).populate('assignedUser', 'username');
    io.emit('task:created', populatedTask);
    logAction(io, req.user.id, `created task "${task.title}"`);
    res.status(201).json(populatedTask);
  } catch (err) {
    console.error("ERROR in POST /tasks:", err);
    res.status(500).send('Server Error');
  }
});

router.put('/:id', auth, async (req, res) => {
  if (!req.user || !req.user.id) return res.status(401).json({ msg: 'User not authorized' });
  
  try {
    const io = req.app.get('socketio');
    const { version, ...updateData } = req.body;
    const oldStatus = (await Task.findById(req.params.id, 'status')).status;

    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, version: version },
      { $set: updateData, $inc: { version: 1 } },
      { new: true }
    ).populate('assignedUser', 'username');

    if (!updatedTask) {
      const serverTask = await Task.findById(req.params.id).populate('assignedUser', 'username');
      return res.status(409).json({ msg: 'Conflict detected!', serverTask: serverTask });
    }

    io.emit('task:updated', updatedTask);
    
    if (updateData.status && updateData.status !== oldStatus) {
      logAction(io, req.user.id, `moved task "${updatedTask.title}" to ${updateData.status}`);
    } else {
      logAction(io, req.user.id, `edited task "${updatedTask.title}"`);
    }
    
    res.json(updatedTask);
  } catch (err) {
    console.error("ERROR in PUT /tasks/:id:", err);
    res.status(500).send('Server Error');
  }
});

router.delete('/:id', auth, async (req, res) => {
    if (!req.user || !req.user.id) return res.status(401).json({ msg: 'User not authorized' });
    try {
        const io = req.app.get('socketio');
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });
        io.emit('task:deleted', { id: req.params.id });
        logAction(io, req.user.id, `deleted task "${task.title}"`);
        res.json({ msg: 'Task removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

router.post('/:id/smart-assign', auth, async (req, res) => {
  if (!req.user || !req.user.id) return res.status(401).json({ msg: 'User not authorized' });
  try {
    const io = req.app.get('socketio');
    const allUsers = await User.find({}, '_id');
    if (!allUsers.length) return res.status(404).json({ msg: 'No users found.' });
    const taskCounts = await Task.aggregate([ { $match: { status: { $in: ['Todo', 'In Progress'] }, assignedUser: { $ne: null } } }, { $group: { _id: '$assignedUser', count: { $sum: 1 } } } ]);
    const userTaskCountMap = new Map(taskCounts.map(item => [item._id.toString(), item.count]));
    let targetUser = null;
    let minTasks = Infinity;
    for (const user of allUsers) {
      const count = userTaskCountMap.get(user._id.toString()) || 0;
      if (count < minTasks) {
        minTasks = count;
        targetUser = user;
      }
    }
    const updatedTask = await Task.findByIdAndUpdate( req.params.id, { $set: { assignedUser: targetUser._id }, $inc: { version: 1 } }, { new: true } ).populate('assignedUser', 'username');
    if (!updatedTask) return res.status(404).json({ msg: 'Task not found' });
    io.emit('task:updated', updatedTask);
    logAction(io, req.user.id, `smart-assigned task "${updatedTask.title}" to ${updatedTask.assignedUser.username}`);
    res.json(updatedTask);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;