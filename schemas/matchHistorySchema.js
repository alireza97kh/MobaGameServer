const mongoose = require('mongoose');

const matchHistorySchema = new mongoose.Schema({
    matchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      required: true
    },
    playerIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }],
    winner: {
      type: String,
      enum: ['red', 'blue'],
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
      required: true
    }
  });

  module.exports = mongoose.model('MatchHistory', matchHistorySchema);