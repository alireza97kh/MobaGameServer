const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    friend: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      required: true
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now
    }
});

module.exports = mongoose.model('Friend', friendSchema);