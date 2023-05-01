const mongoose = require('mongoose');

const abilitySchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    cooldown: {
      type: Number,
      required: true
    },
    manaCost: {
      type: Number,
      required: true
    },
    damage: {
      type: Number,
      required: true
    },
    range: {
      type: Number,
      required: true
    },
    areaOfEffect: {
      type: Number,
      required: true
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now
    }
});

module.exports = mongoose.model('Ability', abilitySchema);