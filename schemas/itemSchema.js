const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, default: ""},
    rarity: { type: String ,default: ""},
    stats: {
      health: { type: Number ,default: 0},
      mana: { type: Number ,default: 0},
      attackDamage: { type: Number ,default: 0},
      abilityPower: { type: Number ,default: 0},
      armor: { type: Number ,default: 0},
      magicResist: { type: Number ,default: 0}
    },
    imageUrl: { type: String ,default: ""}
  });

  module.exports = mongoose.model('Item', itemSchema);
