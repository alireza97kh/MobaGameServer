const express = require('express');
const router  = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../schemas/userSchema');

// Sign up route OK
router.put('/signup', async (req, res) => {
    try {
      console.log("user try to Signup");
      const { username, password, email } = req.body;
      // create a new user object using the User model
      let hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, password: hashedPassword, email });
      // save the new user to the database
      const savedUser = await newUser.save();
      // send a success response with the saved user object
      
      res.status(200).json(
        {
          success: true,
          result: {
            profile: savedUser
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
          result: {
            message: error.message
        }
      });
      // handle errors here
    }
});
// Login route OK
router.put('/login', async (req, res) => {
try {
    console.log("user try to Login");
    const { username, password } = req.body;
    // Find the user in the database
    const user = await User.findOne({ username });
    if (!user) {
    throw new Error('User not found');
    }
    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
    throw new Error('Invalid password');
    }

    // Generate JWT token
    const token = jwt.sign({ username, friends: user.friends }, 'secretkey');
    res.json({
    success: true,
    result: {
        token: token,
        profile: user
    }
    });
} catch (error) {
    res.status(500).json({ 
    success: false,
    result: {
        message: error.message
    }
    });
}
});

//Get User Profile By ID
router.get('/getProfileByID', async (req, res) => {
    const player = await User.findById(req.query.id);
    if (!player) return res.status(404).send({
      success: false,
      message: 'Player not found.'
    });
  
    res.send({
      success: true,
      result: player
    });
  });

module.exports = router;