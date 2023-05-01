// Import the ws module
const WebSocket = require('ws');

// Create a function that accepts an HTTP server and returns a WebSocket server
function createWebSocketServer(httpServer) {
  // Create a new WebSocket server
  const wss = new WebSocket.Server({ server: httpServer });

  // Add a map to keep track of all the matches and their connected players
  const matches = new Map();

  // Set up event listeners
  wss.on('connection', function connection(ws) {
    console.log('WebSocket connected');

    // Handle incoming messages
    ws.on('message', function incoming(msg) {
      let message = msg.toString();
      console.log('WebSocket message received: ', message);

      ws.send("Hi Client ");
      // // Parse the incoming message as JSON
      // let json;
      // try {
      //   json = JSON.parse(message);
      // } catch (e) {
      //   console.log('Invalid JSON');
      //   return;
      // }

      // // Check the type of message
      // switch (json.type) {
      //   case 'join-match':
      //     // Get the match ID from the message
      //     let matchId = json.matchId;

      //     // Check if the match exists
      //     if (!matches.has(matchId)) {
      //       console.log(`Match ${matchId} does not exist`);
      //       return;
      //     }

      //     // Add the player to the match
      //     let match = matches.get(matchId);
      //     match.players.set(ws, {});

      //     console.log(`Player joined match ${matchId}`);

      //     // Send a message to all players in the match
      //     sendToMatch(matchId, 'player-joined', { numPlayers: match.players.size });
      //     break;
      //   case 'create-match':
      //     // Create a new match with a unique ID
      //     let newMatchId = createMatchId();
      //     matches.set(newMatchId, { id: newMatchId, players: new Map() });

      //     console.log(`New match created with ID ${newMatchId}`);

      //     // Send the new match ID back to the player
      //     ws.send(JSON.stringify({ type: 'match-created', matchId: newMatchId }));
      //     break;
      //   default:
      //     console.log('Unknown message type');
      //     break;
      // }
    });

    // Handle disconnections
    ws.on('close', function close() {
      console.log('WebSocket disconnected');

      // Remove the player from all matches
      for (let match of matches.values()) {
        if (match.players.has(ws)) {
          match.players.delete(ws);

          console.log('Player left match', match.id);

          // Send a message to all players in the match
          sendToMatch(match.id, 'player-left', { numPlayers: match.players.size });
        }
      }
    });
  });

  // Function to generate a unique match ID
  function createMatchId() {
    return Math.random().toString(36).substr(2, 9);
  }

  // Function to send a message to all players in a match
  wss.sendToMatch = function sendToMatch(matchId, type, data) {
    let match = matches.get(matchId);

    if (!match) {
      console.log(`Match ${matchId} does not exist`);
      return;
    }

    for (let player of match.players.keys()) {
      player.send(JSON.stringify({ type: type, ...data }));
    }
  }
  return wss;
}

// Export the createWebSocketServer function
module.exports = createWebSocketServer;
