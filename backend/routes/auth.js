const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
    console.log("--> HIT: /api/auth/register");
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ msg: 'Username and password are required.' });
        }
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }
        user = new User({ username, password });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        res.status(201).json({ msg: 'User registered successfully' });
    } catch (e) {
        console.error("--> CRASH in /register:", e);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
    console.log("--> HIT: /api/auth/login");
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        const payload = { user: { id: user.id } };
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("--> FATAL: JWT_SECRET not defined!");
            return res.status(500).json({ msg: 'Server config error' });
        }
        jwt.sign(payload, secret, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (e) {
        console.error("--> CRASH in /login:", e);
        res.status(500).send('Server Error');
    }
});

module.exports = router;