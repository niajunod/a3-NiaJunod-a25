const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Shift = require("../models/Shift");

const router = express.Router();

// helper to protect routes
function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid token" });
    }
}

// POST /api/login  (create account if not exists)
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await User.findOne({ username });
        if (!user) {
            // create new account
            const hash = await bcrypt.hash(password, 10);
            user = await User.create({ username, password: hash });
        } else {
            // check password
            const valid = await bcrypt.compare(password, user.password);
            if (!valid) return res.status(400).json({ error: "Wrong password" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "2h" });
        res.json({ token, username: user.username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// POST /api/logout
router.post("/logout", (req, res) => {
    // client just discards token
    res.json({ message: "Logged out" });
});

// GET /api/shifts (all shifts for logged in user)
router.get("/shifts", authMiddleware, async (req, res) => {
    try {
        const shifts = await Shift.find({ user: req.userId }).sort({ createdAt: -1 });
        res.json(shifts);
    } catch (err) {
        res.status(500).json({ error: "Failed to load shifts" });
    }
});

// POST /api/shifts (create shift)
router.post("/shifts", authMiddleware, async (req, res) => {
    const { restaurant, hours, tips } = req.body;
    try {
        const shift = await Shift.create({
            restaurant,
            hours,
            tips,
            user: req.userId,
        });
        res.json(shift);
    } catch (err) {
        res.status(500).json({ error: "Failed to create shift" });
    }
});

// PUT /api/shifts/:id (update shift)
router.put("/shifts/:id", authMiddleware, async (req, res) => {
    const { restaurant, hours, tips } = req.body;
    try {
        const shift = await Shift.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            { restaurant, hours, tips },
            { new: true }
        );
        res.json(shift);
    } catch (err) {
        res.status(500).json({ error: "Failed to update shift" });
    }
});

// DELETE /api/shifts/:id (delete shift)
router.delete("/shifts/:id", authMiddleware, async (req, res) => {
    try {
        await Shift.findOneAndDelete({ _id: req.params.id, user: req.userId });
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete shift" });
    }
});

module.exports = router;
