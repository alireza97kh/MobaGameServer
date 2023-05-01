const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rank: {
      type: Number,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    gameMode: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
});

module.exports = mongoose.model('Leaderboard', leaderboardSchema);