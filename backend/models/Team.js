const mongoose = require('mongoose');
const TeamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, unique: true, required: true },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
module.exports = mongoose.models.Team || mongoose.model('Team', TeamSchema);