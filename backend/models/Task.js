const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    assignerName: String,
    assigneeName: String,
    taskName: String, // <--- IDENTICAL NAME
    description: String,
    images: [String], 
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Task || mongoose.model('Task', TaskSchema);