require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");

// Models
const User = require("./models/User");

// Routes
const apiRoutes = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async () => {
        console.log("✅ Connected to MongoDB");

        // --- Seed test user ---
        try {
            const existing = await User.findOne({ username: "testuser" });
            if (!existing) {
                const hashed = await bcrypt.hash("password123", 10);
                await User.create({ username: "testuser", passwordHash: hashed });
                console.log("👤 Test user created: testuser / password123");
            } else {
                console.log("👤 Test user already exists");
            }
        } catch (err) {
            console.error("❌ Error creating test user:", err.message);
        }
    })
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err.message);
    });

// Routes
app.use("/api", apiRoutes);

// Catch-all: serve index.html
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
