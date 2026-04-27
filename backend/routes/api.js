const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');
const Update = require('../models/Update');
const Task = require('../models/Task'); // Ensure Task model exists
const auth = require('../middleware/auth');

router.post('/register', userCtrl.register);
router.post('/login', userCtrl.login);
router.post('/leave-team', auth, userCtrl.leaveTeam);
router.post('/teams/create', auth, userCtrl.createTeam);
router.post('/teams/join', auth, userCtrl.joinTeam);

// Tasks
router.post('/tasks', auth, async (req, res) => {
    try {
        const task = await Task.create(req.body);
        res.json(task);
    } catch (e) { res.status(500).json({ error: "Task failed" }); }
});

// Updates
router.post('/updates', auth, async (req, res) => { res.json(await Update.create(req.body)); });
router.get('/updates/:teamId', auth, async (req, res) => { 
    res.json(await Update.find({ teamId: req.params.teamId }).sort({ createdAt: -1 })); 
});

module.exports = router;