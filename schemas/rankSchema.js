const mongoose = require('mongoose');

const rankSchema = new mongoose.Schema({
    name: { type: String, unique: true },

    description: String,

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    season: {
      type: Number,
      required: true
    },
    rank: {
      type: Number,
      required: true
    },
    tier: {
      type: String,
      required: true
    },
    wins: {
      type: Number,
      required: true
    },
    losses: {
      type: Number,
      required: true
    },
    updatedAt: {
      type: Date,
      required: true,
      default: Date.now
    }
});

module.exports = mongoose.model('Rank', rankSchema);