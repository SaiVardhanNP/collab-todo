const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const User = require('../models/User');

const FORBIDDEN_TITLES = ['Todo', 'In Progress', 'Done'];

module.exports = function(io) {
  // ## CREATE A NEW TASK
  router.post('/', auth, async (req, res) => {
    // ... (validation logic remains the same)
    const { title, description, priority } = req.body;
    try {
        if (FORBIDDEN_TITLES.map(t => t.toLowerCase()).includes(title.toLowerCase())) {
            return res.status(400).json({ msg: 'Task title cannot be the same as a column name.' });
        }
        const existingTask = await Task.findOne({ title });
        if (existingTask) {
            return res.status(400).json({ msg: 'A task with this title already exists.' });
        }
        
        const newTask = new Task({ title, description, priority });
        const task = await newTask.save();
        
        // ✨ Emit event to all connected clients
        io.emit('task:created', task);
        
        res.status(201).json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
  });

  // ## GET ALL TASKS
  router.get('/', auth, async (req, res) => {
    try {
        const tasks = await Task.find().populate('assignedUser', 'username').sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
  });

  // ## UPDATE A TASK
  router.put('/:id', auth, async (req, res) => {
    try {
        // Find and update, and get the new document back
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, 
            { new: true }
        ).populate('assignedUser', 'username');

        if (!updatedTask) {
            return res.status(404).json({ msg: 'Task not found' });
        }

        // ✨ Emit event with the updated task data
        io.emit('task:updated', updatedTask);
        
        res.json(updatedTask);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
  });

  // ## DELETE A TASK
  router.delete('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ msg: 'Task not found' });
        }
        await task.deleteOne();

        // ✨ Emit event with the ID of the deleted task
        io.emit('task:deleted', { id: req.params.id });

        res.json({ msg: 'Task removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
  });

  return router;
};