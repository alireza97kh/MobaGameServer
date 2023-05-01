const express = require('express');
const router = express.Router();

const User = require('../schemas/userSchema');
const Match = require('../schemas/matchSchema');
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;

const { Server } = require('socket.io');
const MaxCountOfPlayersInMatch = 5;

// MatchMaking 
// Create a new match
async function createMatch(players) {
  try {
    const match = new Match({
      players: players.map(player => player._id)
    });
    await match.save();
    return match;
  } catch(err) {
    return null;
  }
}

// Add player to match
async function addPlayerToMatch(player, match) {
  if (match.players.length === MaxCountOfPlayersInMatch) return null;
  if (match.players.some(p => p.id == player._id)) {
      return match;
  }
  match.players.push(player._id);
  await match.save();

  if (match.players.length === MaxCountOfPlayersInMatch) {
      match.status = 'ready';
      await match.save();
  }

  return match;
}

// Remove player from match
async function removePlayerFromMatch(player, match) {
  const index = match.players.findIndex(p => p.equals(player._id));
  if (index < 0) return null;

  match.players.splice(index, 1);
  await match.save();

  if (match.status === 'ready' && match.players.length < MaxCountOfPlayersInMatch) {
      match.status = 'incomplete';
      await match.save();
  }

  return match;
}

// Check if player is in a match and remove them if they are not completed
async function checkIfPlayerInMatch(player) {
  const match = await Match.findOne({ players: player._id, isCompleted: false });
  if (match) {
    await removePlayerFromMatch(player, match);
  }
}

// Join matchmaking queue
async function joinMatchmakingQueue(player) {
  // Check if player is already in a match
  await checkIfPlayerInMatch(player);

  const match = await Match.findOne({ isCompleted: false, $where: `this.players.length < ${MaxCountOfPlayersInMatch}` });
  if (match) {
      return addPlayerToMatch(player, match);
  } else {
      return createMatch([player]);
  }
}

// Leave matchmaking queue
async function leaveMatchmakingQueue(player) {
  const match = await Match.findOne({
    status: 'incomplete',
    players: {
      $elemMatch: {
        _id: player._id
      }
    }
  });
  if (!match) return null;
  
  return removePlayerFromMatch(player, match);
}

// Matchmaking routes
router.get('/joinMatch', async (req, res) => {
  const player = await User.findById(req.query.id);
  if (!player) return res.status(404).send('Player not found.');

  const match = await joinMatchmakingQueue(player);
  if (match) {
      res.send({
          success: true,
          result: {
              match: match,
              address: 'ws://127.0.0.1:4000'
          }
      });
  } else {
      res.send({
          success: false,
          message: 'Join Match Error'
      });
  }
});

router.get('/leaveMatch', async (req, res) => {
  const player = await User.findById(req.query.id);
  if (!player) return res.status(404).send({
    success: false,
    message: 'Player not found.'
  });

  const match = await leaveMatchmakingQueue(player);
  if (!match) {
      res.send({ 
        success: false,
        message: 'Player not in matchmaking queue.' });
  } else {
      res.send({
        success: true,
        match: match
      });
  }
});

module.exports = router;
