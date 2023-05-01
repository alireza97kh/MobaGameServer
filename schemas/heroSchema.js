const mongoose = require('mongoose');

const heroSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    abilities: [
      {
        name: {
          type: String,
          required: true
        },
        description: {
          type: String,
          required: true
        }
      }
    ],
    stats: {
      health: {
        type: Number,
        required: true
      },
      damage: {
        type: Number,
        required: true
      },
      armor: {
        type: Number,
        required: true
      }
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    imageUrl: {
      type: String,
      default: 'https://cdn.vox-cdn.com/thumbor/5qREh2dNyj7Tz6tH9IezydgzsbM=/0x0:800x509/1200x800/filters:focal(332x91:460x219)/cdn.vox-cdn.com/uploads/chorus_image/image/57425161/wraithnight_fb_image.0.jpg'
    }
});

module.exports = mongoose.model('Hero', heroSchema);