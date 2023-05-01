const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [
      {
        item_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Item',
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          default: 0
        }
      }
    ]
  });

  module.exports = mongoose.model('Inventory', inventorySchema);