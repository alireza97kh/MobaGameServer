const express = require('express');
const router  = express.Router();

const Match = require('../schemas/matchSchema');
const { ObjectId } = require('mongodb');

router.get('/getPlayersInMatch', async (req, res) => {
    // const playerID = req.query.id;
    const matchId = req.query.matchId;
    let objID = new ObjectId(matchId);
    const match = await Match.findOne({ _id: objID });
    if(match){
        res.send({
            success: true,
            result: {
                match
            }
        })
    }
    else {
        res.send({
            success: false,
            message: 'User is not in any match!'
        })
    }
});

module.exports = router;