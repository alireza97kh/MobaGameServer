const mongoose = require('mongoose');

const rankingSchema = new mongoose.Schema({
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rank: {
      type: Number,
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    matchesPlayed: {
      type: Number,
      required: true
    },
    matchesWon: {
      type: Number,
      required: true
    },
    matchesLost: {
      type: Number,
      required: true
    },
    matchesTied: {
      type: Number,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
});

module.exports = mongoose.model('Ranking', rankingSchema);