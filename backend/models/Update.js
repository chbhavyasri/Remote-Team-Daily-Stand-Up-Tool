const mongoose = require('mongoose');
module.exports = mongoose.model('Update', new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    userName: String,
    teamId: mongoose.Schema.Types.ObjectId,
    taskName: String,
    yesterday: String,
    today: String,
    blockers: String,
    images: [String], // <--- This MUST be an array of strings
    date: { type: String, default: () => new Date().toLocaleDateString() },
    createdAt: { type: Date, default: Date.now }
}));