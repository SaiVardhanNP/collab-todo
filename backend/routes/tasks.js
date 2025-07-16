const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Import auth middleware
const Task = require('../models/Task');
const User = require('../models/User');

const FORBIDDEN_TITLES = ['Todo', 'In Progress', 'Done'];

router.post('/', auth, async (req, res) => {
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
    res.status(201).json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignedUser', 'username').sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        if (!task) {
            return res.status(404).json({ msg: 'Task not found' });
        }
        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


router.delete('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ msg: 'Task not found' });
        }
        await task.deleteOne();
        res.json({ msg: 'Task removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;