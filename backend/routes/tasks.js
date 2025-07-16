const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { TaskModel } = require("../models/Task");
const { UserModel } = require("../models/User");

const FORBIDDEN_TITLES = ['Todo', 'In Progress', 'Done'];

module.exports = function (io) {
  router.post('/', auth, async (req, res) => {
    const { title, description, priority } = req.body;
    try {
      if (!title || !priority) {
        return res.status(400).json({ msg: 'Title and priority are required.' });
      }

      if (FORBIDDEN_TITLES.map(t => t.toLowerCase()).includes(title.toLowerCase())) {
        return res.status(400).json({ msg: 'Task title cannot match column name.' });
      }

      const existingTask = await TaskModel.findOne({ title });
      if (existingTask) {
        return res.status(400).json({ msg: 'A task with this title already exists.' });
      }

      const newTask = new TaskModel({
        title,
        description,
        priority,
        assignedUser: req.user.id 
      });

      const task = await newTask.save();
      io.emit('task:created', task);
      res.status(201).json(task);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  });

  router.get('/', auth, async (req, res) => {
    try {
      const tasks = await TaskModel.find()
        .populate('assignedUser', 'username')
        .sort({ createdAt: -1 });
      res.json(tasks);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  });

  router.put('/:id', auth, async (req, res) => {
    try {
      const updatedTask = await TaskModel.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      ).populate('assignedUser', 'username');

      if (!updatedTask) {
        return res.status(404).json({ msg: 'Task not found' });
      }

      io.emit('task:updated', updatedTask);
      res.json(updatedTask);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  });

  router.delete('/:id', auth, async (req, res) => {
    try {
      const task = await TaskModel.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ msg: 'Task not found' });
      }

      await task.deleteOne();
      io.emit('task:deleted', { id: req.params.id });

      res.json({ msg: 'Task removed' });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  });

  return router;
};
