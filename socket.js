// Import the ws module
const WebSocket = require('ws');
const Match = require('./schemas/matchSchema');
const { ObjectId } = require('mongodb');
const matches = new Map();

// Create a function that accepts an HTTP server and returns a WebSocket server
function createWebSocketServer(httpServer) {
  // Create a new WebSocket server
  const wss = new WebSocket.Server({ server: httpServer });
  // Add a map to keep track of all the matches and their connected players

  // Set up event listeners
  wss.on('connection',function connection(ws) {
    console.log('WebSocket connected');
    ws.on('message', async function incoming(msg) {
      let message = msg.toString();
      console.log('WebSocket message received: ', message);
      let splitedMessage = message.split(':');
      if(splitedMessage[0] == 'ID'){
        if(splitedMessage.length == 2){
          ws.playerId = splitedMessage[1];
          CheckIDInStartAndAddToMatches(splitedMessage, ws);
        }
      }
      else if(splitedMessage[0] == 'SELECT_HERO'){
        if(splitedMessage.length === 3){
          
        }
      }

    });

    // Handle disconnections
    ws.on('close', function close() {
      console.log('WebSocket disconnected');

      // Remove the player from all matches
      // for (let match of matches.values()) {
      //   if (match.players.has(ws)) {
      //     match.players.delete(ws);

      //     console.log('Player left match', match.id);

      //     // Send a message to all players in the match
      //     sendToMatch(match.id, 'player-left', { numPlayers: match.players.size });
      //   }
      // }
    });
  });

  // Function to generate a unique match ID
  function createMatchId() {
    return Math.random().toString(36).substr(2, 9);
  }

  // Export the WebSocket server and the matches map
  return { wss, matches };
}

// Function to send a message to all players in a match
function sendToMatch(matchId, message, data = null) {
  const match = matches.get(matchId);
  if (!match) {
    // console.log('Match not found:', matchId);
    return;
  }
  console.log('sendToMatch : ' + matchId , message, data);
  matches.get(matchId).forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      if(!data)
        client.send(message + ':' + data);
      else 
        client.send(message);
    }
  });
}
async function CheckIDInStartAndAddToMatches(splitedMessage, ws){
  let objID = new ObjectId(splitedMessage[1]);
  let match = await Match.findOne({'players.user': objID});
  if(match){
    if(matches.get(match.id)){
      matches.get(match.id).players.push(ws);
    }
    else {
      let temp = {id: match.id, players: [ws]};
      ws.matchId = match.id;
      matches.set(temp.id, temp.players);
    }
    sendToMatch(match.id, 'NEW_PLAYER:' + ws.playerId);
  }
}


async function SelectHeroController(splitedMessage, ws){
  let match = await Match.findOne({ 'players.user': objID });
  if (match) {
    if (matches.get(match.id)) {
      matches.get(match.id).players.push(ws);
    } else {
      let temp = { id: match.id, players: [ws] };
      ws.matchId = match.id;
      matches.set(temp.id, temp.players);
    }


  for (let i = 0; i < match.players.length; i++) {
    if (match.players[i].user.toString() === objID.toString()) {
      match.players[i].selectedHero = splitedMessage[2];
      await match.save(); // Save the updated match document to MongoDB
      break;
    }
  }
  ws.selectedHero = splitedMessage[1];
  sendToMatch(ws.matchId, message, null);
}
module.exports = { createWebSocketServer, sendToMatch };
