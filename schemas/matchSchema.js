const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  players: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: {
      type: String,
      default: ''
    },
    heroName: {
      type: String,
      ref: 'Hero',
      default: ''
    },
    team: {
      type: Number,
      default: 0
      //required: true
    },
    isWinner: {
      type: Boolean,
      default: false
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
  },
  gameMode:{
    type: String,
    default: 'OneVsOne'
  },
  countOfPlayers:{
    type: Number,
    default: 2
  }
});


module.exports = mongoose.model('Match', matchSchema);