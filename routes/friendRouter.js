const express = require('express');
const { route } = require('./authRoutes');
const router  = express.Router();

const User = require('../schemas/userSchema');

// Add friend route
router.post('/addfriend', async (req, res) => {
    try {
      const { username, friendUsername } = req.body;
  
      // Connect to MongoDB
      // const client = await mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
      const db = mongoose.connection.db;
  
      // Find the user and friend in the database
      const user = await db.collection('users').findOne({ username });
      const friend = await db.collection('users').findOne({ username: friendUsername });
  
      if (!user || !friend) {
        throw new Error('User or friend not found');
      }
  
      // Add the friend to the user's friends array
      user.friends.push(friend._id);
      await User.findOneAndUpdate({ username }, { friends: user.friends });
  
      res.json({ message: 'Friend added' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});
router.get('/getAllFriends', async (req, res) => {

const player = await User.findById(req.query.id).populate('friends', 'name');
if (!player) return res.status(404).send('Player not found.');

res.send(player.friends);
});

module.exports = router;