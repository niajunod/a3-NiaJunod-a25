const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const User = require("../models/User");
const Shift = require("../models/Shift");

// --- User login / registration ---
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
    }

    try {
        let user = await User.findOne({ username });

        // If user doesn't exist, create
        if (!user) {
            const passwordHash = await bcrypt.hash(password, 10);
            user = await User.create({ username, passwordHash });
            return res.json({ message: "User created", username: user.username, id: user._id });
        }

        // Compare passwords
        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) return res.status(401).json({ error: "Invalid password" });

        res.json({ message: "Login successful", username: user.username, id: user._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// --- Get all shifts for a user ---
router.get("/shifts/:userId", async (req, res) => {
    try {
        const shifts = await Shift.find({ userId: req.params.userId });
        res.json(shifts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// --- Add new shift ---
router.post("/shifts", async (req, res) => {
    const { userId, restaurant, hours, tips } = req.body;

    if (!userId || !restaurant || hours == null || tips == null) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const shift = await Shift.create({ userId, restaurant, hours, tips });
        res.json(shift);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// --- Update shift ---
router.put("/shifts/:id", async (req, res) => {
    try {
        const updated = await Shift.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// --- Delete shift ---
router.delete("/shifts/:id", async (req, res) => {
    try {
        await Shift.findByIdAndDelete(req.params.id);
        res.json({ message: "Shift deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;

