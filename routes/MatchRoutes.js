const express = require('express');
const router  = express.Router();

const Match = require('../schemas/matchSchema');
const { ObjectId } = require('mongodb');

router.put('/getMatch', async (req, res) => {
    const match = await Match.findOne({ 
      _id: new ObjectId(req.body.matchId),
      players: {
        $elemMatch: {
        user: new ObjectId(req.body.userId)
      }
    }});
    if (!match) {
      return res.status(404).send({
        success : false,
        message : 'Match not found!'
      });
    }
    else {
      return res.send({
        success :true ,
        result : {
            match : match
        }
      });
    }
  });
module.exports = router;