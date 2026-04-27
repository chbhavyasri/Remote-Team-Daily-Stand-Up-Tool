const User = require('../models/User');
const Team = require('../models/Team');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await User.create({ ...req.body, password: hashedPassword });
        res.status(201).json({ message: "Success" });
    } catch (e) { res.status(400).json({ error: "Email exists" }); }
};

exports.login = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user || !await bcrypt.compare(req.body.password, user.password)) 
            return res.status(401).json({ error: "Invalid credentials" });
        
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || "SECRET", { expiresIn: "24h" });
        res.json({ token, user: { id: user._id, name: user.name, role: user.role, teamId: user.teamId } });
    } catch (e) { res.status(500).json({ error: "Login failed" }); }
};

exports.leaveTeam = async (req, res) => {
    const user = await User.findByIdAndUpdate(req.body.userId, { teamId: null, role: 'Team Member' }, { new: true });
    res.json({ user });
};

exports.createTeam = async (req, res) => {
    try {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const team = await Team.create({ name: req.body.name, code, adminId: req.body.adminId });
        
        // Save user with Admin role
        const user = await User.findByIdAndUpdate(
            req.body.adminId, 
            { teamId: team._id, role: 'Admin' }, 
            { new: true }
        );
        res.json({ team, user });
    } catch (e) { res.status(500).json({ error: "Fail" }); }
};

exports.joinTeam = async (req, res) => {
    try {
        const team = await Team.findOne({ code: req.body.code.toUpperCase() });
        if (!team) return res.status(404).json({ error: "Invalid Team Code" });

        // Save user with the role passed from frontend (Team Lead or Member)
        const user = await User.findByIdAndUpdate(
            req.body.userId, 
            { teamId: team._id, role: req.body.role }, 
            { new: true }
        );
        res.json({ team, user });
    } catch (e) { res.status(500).json({ error: "Fail" }); }
};