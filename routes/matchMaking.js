const express = require('express');
const router = express.Router();

const User = require('../schemas/userSchema');
const Match = require('../schemas/matchSchema');
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const os = require('os');
const networkInterfaces = os.networkInterfaces();


const { sendToMatch } = require('../socket');
// Create WebSocket server
const MaxCountOfPlayersInMatch = 2;

// MatchMaking 
// Create a new match
async function createMatch(players) {
  try {
    const playerIds = players.map(player => mongoose.Types.ObjectId.isValid(player._id) ? new mongoose.Types.ObjectId(player._id) : null);
    // filter out any invalid playerIds
    const validPlayerIds = playerIds.filter(playerId => playerId !== null);
    const match = new Match({
      players: {
        user: validPlayerIds,
        userName: players[0].username,
      }
    });
    await match.save();
    return match;
  } catch(err) {
    console.error(err);
    return null;
  }
}


// Add player to match
async function addPlayerToMatch(player, match) {
  if (match.players.length === MaxCountOfPlayersInMatch) return null;
  if (match.players.some(p => p.id == player.id)) {
      return match;
  }
  match.players.push({
    user: player.id,
    userName: player.username,
    team: match.players.length % 2,
  });
  await match.save();

  if (match.players.length === MaxCountOfPlayersInMatch) {
      match.status = 'ready';
      await match.save();
  }

  return match;
}

// Remove player from match
async function removePlayerFromMatch(player, match) {
  const index = match.players.findIndex(p => p.user.equals(player.id));
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
  let objID = new ObjectId(player.id);
  const match = await Match.findOne({ 'players.user' : objID, isCompleted: false });
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
      const updatedMatch = await addPlayerToMatch(player, match);
      //console.log(updatedMatch, updatedMatch.players.length, MaxCountOfPlayersInMatch);
      // console.log('bingoooo *&*&*&*& ', updatedMatch.players.length, updatedMatch.countOfPlayers);
      // if (updatedMatch && updatedMatch.players.length === updatedMatch.countOfPlayers) {
      //   console.log('send Select Hero ');
      //   sendToMatch(match.id, 'GO_TO_SELECT_HERO', null);
      // }
      return updatedMatch;
  } else {
      const newMatch = await createMatch([player]);
      // if (newMatch && newMatch.players.length === newMatch.countOfPlayers) {
      //   sendToMatch(match.id, 'GO_TO_SELECT_HERO', null);
      // }
      return newMatch;
  }
}


// Leave matchmaking queue
async function leaveMatchmakingQueue(player) {
  const match = await Match.findOne({
    status: 'incomplete',
    players: {
      $elemMatch: {
        user: new ObjectId(player.id)
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
    let currentServerIp = GetMyServerIP();
      res.send({
          success: true,
          result: {
              matchId: match.id,
              TCPAddress: 'ws://' + currentServerIp + ':4000',
              UDPAddress: currentServerIp,
              UDPPort: 1234,
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
        result : {
          match: match
        }
      });
  }
});



router.get('/deleteAllMatch', async (req, res) =>{
  console.log("delete Matches");
  const match = await Match.deleteMany();
  res.send({
    success: true
  });
});

function GetMyServerIP(){
  const ipAddress = Object.values(networkInterfaces)
  .flat()
  .filter((iface) => iface.family === 'IPv4' && !iface.internal)
  .map((iface) => iface.address);
  console.log('Server IP address:', ipAddress[0]);
  return ipAddress[0];
}




module.exports = router;
