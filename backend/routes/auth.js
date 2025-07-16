const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");
const { UserModel } = require("../models/User"); // Correct import

const router = express.Router();

router.post("/register", async (req, res) => {
    const { username, password } = req.body;

    try {
        let existingUser = await UserModel.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ msg: "User already exists!" });
        }

        const hashedPassword = await bcrypt.hash(password, 5);

        const newUser = new UserModel({
            username,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({ msg: "User registered successfully!" });
    } catch (e) {
        console.error(e.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

router.post("/signin", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await UserModel.findOne({ username });

        if (!user) {
            return res.status(400).json({ msg: "User not found!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid Password!" });
        }

        const payload = {
            user: {
                id: user._id,
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET_KEY,
            { expiresIn: "7d" },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (e) {
        console.error(e.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

module.exports = router;
