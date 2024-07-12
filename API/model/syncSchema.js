const mongoose = require('mongoose')

const syncStateSchema = new mongoose.Schema({
  autoSyncActive: { type: Boolean, default: false },
  nextSyncTime: { type: Number }
});

module.exports = mongoose.model('SyncState', syncStateSchema);