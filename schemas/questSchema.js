const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    reward: {
      type: {
        gold: Number,
        experience: Number,
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Item'
        }
      },
      required: true
    },
    requirements: [{
      type: String,
      required: true
    }],
    duration: {
      type: Number,
      required: true
    },
    expiration: {
      type: Date,
      required: true
    },
    difficulty: {type: String, required: true},
    isRepeatable: {type: Boolean, required: true},
    isActive: {type: Boolean, required: true},
});

module.exports = mongoose.model('Quest', questSchema);