const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  players: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      //required: true
    },
    hero: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hero',
      //required: true
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      //required: true
    },
    isWinner: {
      type: Boolean,
      //required: true
    }
  }],
  status: {
    type: String,
    default: 'incomplete'
  },
  matchToken: {
    type: String,
    unique: true,
    //required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number,
    default: 0
  }
});


module.exports = mongoose.model('Match', matchSchema);