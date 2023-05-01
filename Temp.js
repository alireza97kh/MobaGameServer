const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Connect to MongoDB
mongoose.connect('mongodb://localhost/moba')
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...'));

// Define schemas
const playerSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  level: { type: Number, required: true },
  rank: { type: String, required: true },
  wins: { type: Number, required: true },
  losses: { type: Number, required: true },
});

const matchSchema = new mongoose.Schema({
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  token: { type: String, required: true },
});

// Define models
const Player = mongoose.model('Player', playerSchema);
const Match = mongoose.model('Match', matchSchema);

// Middleware
app.use(express.json());

// Routes for authentication
app.post('/api/auth/register', async (req, res) => {
  const { email, password, username } = req.body;
  const existingUser = await Player.findOne({ email });
  if (existingUser) return res.status(400).send('Email already exists.');

  const level = 1;
  const rank = 'Bronze';
  const wins = 0;
  const losses = 0;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const player = new Player({
    email,
    password: hashedPassword,
    username,
    level,
    rank,
    wins,
    losses
  });
  await player.save();

  const token = jwt.sign({ _id: player._id }, 'jwtPrivateKey');
  res.header('x-auth-token', token).send({
    _id: player._id,
    email: player.email,
    username: player.username,
    level: player.level,
    rank: player.rank,
    wins: player.wins,
    losses: player.losses
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const player = await Player.findOne({ email });
  if (!player) return res.status(400).send('Invalid email or password.');

  const validPassword = await bcrypt.compare(password, player.password);
  if (!validPassword) return res.status(400).send('Invalid email or password.');

  const token = jwt.sign({ _id: player._id }, 'jwtPrivateKey');
  res.header('x-auth-token', token).send({
    _id: player._id,
    email: player.email,
    username: player.username,
    level: player.level,
    rank: player.rank,
    wins: player.wins,
    losses: player.losses
  });
});

// Routes for player profile
app.get('/api/players/:id', async (req, res) => {
  const player = await Player.findById(req.params.id).select('-password');
  if (!player) return res.status(404).send('Player not found.');
  res.send(player);
});

// Functions for matchmaking
const matchmakingQueue = [];

async function joinMatchmakingQueue(player) {
  matchmakingQueue.push(player);

  if (matchmakingQueue.length >= 2) {
    const player1 = matchmakingQueue.shift();
    const player2 = matchmakingQueue.shift();

    const matchToken = uuidv4();

    const match = new Match({
      players: [player1._id, player2._id],
      token: matchToken,
    });
    await match.save();

    player1.currentMatchToken = matchToken;
    player2.currentMatchToken = matchToken;

    await player1.save();
    await player2.save();

    io.emit('match found', { matchToken });
  }
}

async function leaveMatchmakingQueue(player) {
  const index = matchmakingQueue.indexOf(player);
  if (index !== -1) {
    matchmakingQueue.splice(index, 1);
  }
}

// Socket.io
const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.on('connection', socket => {
  console.log('Client connected.');

  socket.on('join matchmaking', async playerId => {
    const player = await Player.findById(playerId);
    if (!player) return;

    await leaveMatchmakingQueue(player);
    await joinMatchmakingQueue(player);
  });

  socket.on('leave matchmaking', async playerId => {
    const player = await Player.findById(playerId);
    if (!player) return;

    await leaveMatchmakingQueue(player);
  });

  socket.on('start game', async matchToken => {
    const match = await Match.findOne({ token: matchToken }).populate('players');
    if (!match) return;

    // Generate a unique token for the match
    const gameToken = uuidv4();

    // Set the game token for each player
    match.players[0].currentGameToken = gameToken;
    match.players[1].currentGameToken = gameToken;

    await match.players[0].save();
    await match.players[1].save();

    // Emit an event to each player with the game token and opponent's info
    io.to(match.players[0]._id.toString()).emit('game started', {
      token: gameToken,
      opponent: {
        _id: match.players[1]._id,
        username: match.players[1].username,
        level: match.players[1].level,
        rank: match.players[1].rank,
      },
    });
    io.to(match.players[1]._id.toString()).emit('game started', {
      token: gameToken,
      opponent: {
        _id: match.players[0]._id,
        username: match.players[0].username,
        level: match.players[0].level,
        rank: match.players[0].rank,
      },
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected.');
  });
});

// Start the server
const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Listening on port ${port}...`));
