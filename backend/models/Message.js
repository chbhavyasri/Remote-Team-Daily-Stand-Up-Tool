const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    teamId: { type: String, required: true }, // Changed to String to prevent ObjectId crashes
    senderId: { type: String, required: true }, 
    senderName: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Message || mongoose.model('Message', MessageSchema);