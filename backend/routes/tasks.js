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

  router.post('/:id/smart-assign', auth, async (req, res) => {
    try {
        const allUsers = await User.find({}, '_id');
        if (!allUsers.length) {
            return res.status(404).json({ msg: 'No users found in the system.' });
        }

        const taskCounts = await Task.aggregate([
            { $match: { status: { $in: ['Todo', 'In Progress'] }, assignedUser: { $ne: null } } },
            { $group: { _id: '$assignedUser', count: { $sum: 1 } } }
        ]);

        const userTaskCountMap = new Map(
            taskCounts.map(item => [item._id.toString(), item.count])
        );

        let targetUser = null;
        let minTasks = Infinity;

        for (const user of allUsers) {
            const count = userTaskCountMap.get(user._id.toString()) || 0;
            if (count < minTasks) {
                minTasks = count;
                targetUser = user;
            }
        }
        
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            { $set: { assignedUser: targetUser._id } },
            { new: true }
        ).populate('assignedUser', 'username'); // Populate to send user info back

        if (!updatedTask) {
            return res.status(404).json({ msg: 'Task not found' });
        }

        io.emit('task:updated', updatedTask);
        res.json(updatedTask);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.put('/:id', auth, async (req, res) => {
    const { title, description, priority, status, version } = req.body;

    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ msg: 'Task not found' });
        }

        if (version !== undefined && task.version !== version) {
            return res.status(409).json({
                msg: 'Conflict detected! This task has been updated by someone else.',
                serverTask: await task.populate('assignedUser', 'username') // Send the current task data back
            });
        }

        task.title = title !== undefined ? title : task.title;
        task.description = description !== undefined ? description : task.description;
        task.priority = priority !== undefined ? priority : task.priority;
        task.status = status !== undefined ? status : task.status;

        const updatedTask = await task.save(); // Mongoose automatically increments the version on save
        const populatedTask = await updatedTask.populate('assignedUser', 'username');

        io.emit('task:updated', populatedTask);
        logAction(io, req.user.id, `edited task "${populatedTask.title}"`);

        res.json(populatedTask);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

  return router;
};
