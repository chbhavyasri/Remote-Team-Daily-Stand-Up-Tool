const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// 1. IMPORT MODELS
const User = require('./models/User');
const Team = require('./models/Team');
const Update = require('./models/Update');
const Message = require('./models/Message');
const Task = require('./models/Task');

const app = express();
const server = http.createServer(app);

// 2. MIDDLEWARE CONFIGURATION
// Increase limits for image attachments (Mandatory for Team Lead Task feature)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// 3. WEBSOCKET SETUP (Socket.io)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    // Join private room based on teamId
    socket.on("join-team", (teamId) => {
        if (teamId) {
            socket.join(teamId.toString());
            console.log(`User connected to Team Room: ${teamId}`);
        }
    });

    // Handle Real-time Chat
    socket.on("send-message", async (data) => {
        try {
            // Guard: Prevent empty/broken data from crashing server
            if (!data.teamId || !data.text || !data.senderId) return;

            // Save to Database permanently
            const newMessage = await Message.create({
                teamId: data.teamId.toString(),
                senderId: data.senderId.toString(),
                senderName: data.senderName,
                text: data.text
            });

            // BROADCAST TO ENTIRE TEAM (Including the sender)
            // This ensures immediate visibility on everyone's screen
            io.to(data.teamId.toString()).emit("receive-message", newMessage);

        } catch (err) {
            console.error("Chat Socket Error:", err.message);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

// 4. API ROUTES

// --- CHAT HISTORY ---
app.get('/api/messages/:teamId', async (req, res) => {
    try {
        const messages = await Message.find({ teamId: req.params.teamId }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) { res.status(500).json({ error: "Failed to load history" }); }
});

// --- TASKS (TEAM LEAD & USER) ---

// Post Task (Team Lead)
app.post('/api/tasks', async (req, res) => {
    try {
        const task = await Task.create(req.body);
        res.status(201).json(task);
    } catch (e) { res.status(500).json({ error: "Task creation failed" }); }
});

// Get tasks assigned BY a specific Lead
app.get('/api/tasks/lead/:userName', async (req, res) => {
    try {
        const tasks = await Task.find({ assignerName: req.params.userName }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (e) { res.status(500).json({ error: "Lead fetch failed" }); }
});

// Get tasks assigned TO a specific User
app.get('/api/tasks/user/:userName', async (req, res) => {
    try {
        const tasks = await Task.find({ assigneeName: req.params.userName }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (e) { res.status(500).json({ error: "User fetch failed" }); }
});

// --- STAND-UP UPDATES (DASHBOARD & FEED) ---

// Post Stand-up (4 Boxes: Task Name, Yesterday, Today, Blockers)
app.post('/api/updates', async (req, res) => {
    try {
        const update = await Update.create(req.body);
        res.status(201).json(update);
    } catch (e) { res.status(500).json({ error: "Update failed" }); }
});

// Get Team Feed
app.get('/api/updates/:teamId', async (req, res) => {
    try {
        const updates = await Update.find({ teamId: req.params.teamId }).sort({ createdAt: -1 });
        res.json(updates);
    } catch (e) { res.status(500).json({ error: "Feed failed" }); }
});

// --- AUTH & TEAM ROUTES (userController) ---
app.use('/api', require('./routes/api'));

// 5. DATABASE CONNECTION & SERVER START
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/standup_db';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("✅ SyncUp Database Connected Successfully");
        
        // CRITICAL: Use server.listen, NOT app.listen
        server.listen(5000, () => {
            console.log("🚀 Server running on http://localhost:5000");
            console.log("💬 WebSockets Active for Workspace Chat");
        });
    })
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err.message);
    });
