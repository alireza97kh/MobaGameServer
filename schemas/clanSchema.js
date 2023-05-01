const mongoose = require('mongoose');

const clanSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    tag: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      required: true
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }],
    logo: {
      type: String,
      required: true
    },
    motto: {
      type: String,
      required: true
    },
    createdDate: {
      type: Date,
      required: true
    }
});

module.exports = mongoose.model('Clan', clanSchema);