MobaGameServer
MobaGameServer is a Node.js server for a multiplayer online battle arena (MOBA) game. It uses Express for HTTP routing, WebSocket for real-time communication, and MongoDB for data storage.

Installation
Clone the repository:
bash
Copy code
git clone https://github.com/alireza97kh/MobaGameServer.git
Install the dependencies:
bash
Copy code
cd MobaGameServer
npm install
Start the server:
bash
Copy code
npm start
Usage
API
The server exposes the following HTTP endpoints:

/register: Register a new user
/login: Log in an existing user
/matches: Get a list of available matches
/joinMatch?matchId={matchId}: Join a match
WebSocket
The server uses WebSocket to provide real-time communication between clients. When a client joins a match, they will be added to a WebSocket room with the same ID as the match. The server will emit the following events to clients in the room:

player-joined: A new player has joined the match
player-left: A player has left the match
game-started: The game has started
game-ended: The game has ended
MongoDB
The server uses MongoDB to store user and match data. User data includes the user's email address and password hash. Match data includes the match's ID, the maximum number of players, and the current list of players.

Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

