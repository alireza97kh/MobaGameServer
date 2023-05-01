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

  // Export the WebSocket server and the matches map
  return { wss, matches };
}

// Function to send a message to all players in a match
function sendToMatch(wss, matchId, message, data) {
  wss.clients.forEach((client) => {
    if (client.matchId === matchId && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ message, data }));
    }
  });
}

// Export the createWebSocketServer function and the sendToMatch function
module.exports = { createWebSocketServer, sendToMatch };
