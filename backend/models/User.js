const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'Team Member' },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null }
});
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);