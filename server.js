// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const path = require('path');

const User = require('./models/User');
const Shift = require('./models/Shift');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/a3-shifttracker';

// --- Mongo connection
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(()=> console.log('Mongo connected'))
    .catch(err => {
        console.error('Mongo connection error:', err);
        process.exit(1);
    });

// --- Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- Sessions persisted in Mongo
const sessionStore = MongoStore.create({ mongoUrl: MONGO_URI, collectionName: 'sessions' });

app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-this',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// --- Helper auth middleware
function requireAuth(req, res, next) {
    if (req.session && req.session.userId) return next();
    res.status(401).json({ error: 'Not authenticated' });
}

// --- Routes

app.get('/api/ping', (req, res) => res.json({ ok: true }));

// LOGIN: if username not found -> create account and log in; if found -> check password
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });

        let user = await User.findOne({ username });
        if (!user) {
            const hash = await bcrypt.hash(password, 10);
            user = new User({ username, passwordHash: hash });
            await user.save();
            req.session.userId = user._id;
            return res.json({ created: true, message: 'Account created and logged in', username });
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(401).json({ error: 'Incorrect password' });

        req.session.userId = user._id;
        res.json({ created: false, message: 'Logged in', username });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// LOGOUT
app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: 'Logout failed' });
        res.json({ ok: true });
    });
});

// current login check
app.get('/api/me', async (req, res) => {
    if (!req.session.userId) return res.json({ loggedIn: false });
    const user = await User.findById(req.session.userId).select('username');
    res.json({ loggedIn: true, user });
});

// CRUD API scoped to current user

// GET all shifts for user
app.get('/api/shifts', requireAuth, async (req, res) => {
    try {
        const shifts = await Shift.find({ owner: req.session.userId }).sort({ createdAt: -1 }).lean();
        res.json({ shifts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// CREATE shift
app.post('/api/shifts', requireAuth, async (req, res) => {
    try {
        const { restaurant, hours, tips } = req.body;
        if (!restaurant || hours === undefined || tips === undefined) {
            return res.status(400).json({ error: 'Missing fields' });
        }
        const s = new Shift({
            owner: req.session.userId,
            restaurant,
            hours: Number(hours),
            tips: Number(tips)
        });
        await s.save();
        res.json({ shift: s });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// UPDATE shift (only owner)
app.put('/api/shifts/:id', requireAuth, async (req, res) => {
    try {
        const id = req.params.id;
        const update = {
            restaurant: req.body.restaurant,
            hours: Number(req.body.hours),
            tips: Number(req.body.tips)
        };
        const shift = await Shift.findOneAndUpdate({ _id: id, owner: req.session.userId }, update, { new: true });
        if (!shift) return res.status(404).json({ error: 'Not found' });
        // ensure derived field recalculated if necessary
        await shift.save();
        res.json({ shift });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE shift (only owner)
app.delete('/api/shifts/:id', requireAuth, async (req, res) => {
    try {
        const id = req.params.id;
        const shift = await Shift.findOneAndDelete({ _id: id, owner: req.session.userId });
        if (!shift) return res.status(404).json({ error: 'Not found' });
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// fallback to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// start
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
