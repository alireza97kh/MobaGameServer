// Import the ws module
const WebSocket = require('ws');

// Create a function that accepts an HTTP server and returns a WebSocket server
function createWebSocketServer(httpServer) {
  // Create a new WebSocket server
  const wss = new WebSocket.Server({ server: httpServer });

  // Set up event listeners
  wss.on('connection', function connection(ws) {
    console.log('WebSocket connected');

    // Handle incoming messages
    ws.on('message', function incoming(msg) {
        let message = msg.toString();
        
        console.log('WebSocket message received: ', message);
        ws.send('Hi, Client');
    });

    // Handle disconnections
    ws.on('close', function close() {
      console.log('WebSocket disconnected');
    });
  });

  return wss;
}

// Export the createWebSocketServer function
module.exports = createWebSocketServer;
