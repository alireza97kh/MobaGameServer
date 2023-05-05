const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const mongoose = require('mongoose');


mongoose.connect('mongodb://0.0.0.0:27017/Dobeil', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));

//Data Schema
// const User = require('./schemas/userSchema');
// const Ability = require('./schemas/abilitySchema');
// const Chat = require('./schemas/chatSchema');
// const Clan = require('./schemas/clanSchema');
// const Event = require('./schemas/eventSchema');
// const Friend = require('./schemas/friendSchema');
// const Hero = require('./schemas/heroSchema');
// const Inventory = require('./schemas/inventorySchema');
// const Item = require('./schemas/itemSchema');
// const Leaderboard = require('./schemas/leaderboardSchema');
// const MatchHistory = require('./schemas/matchHistorySchema');
// const Match = require('./schemas/matchSchema');
// const Notification = require('./schemas/notificationSchema');
// const Quest = require('./schemas/questSchema');
// const Ranking = require('./schemas/rankingSchema');
// const Rank = require('./schemas/rankSchema');
// const Team = require('./schemas/teamSchema');

// Connect to MongoDB
const { createWebSocketServer, CreateUDPServer }  = require('./socket');
// Create express app
const app = express();
// Add middleware
app.use(express.json());
app.use(bodyParser.json());


const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const heroRoutes = require('./routes/heroRoutes');
const friendRoutes = require('./routes/friendRouter');
const matchRoutes = require('./routes/MatchRoutes');
const matchMakingRoutes = require('./routes/matchMaking')

app.use('/', authRoutes);
app.use('/items', itemRoutes);
app.use('/heroes', heroRoutes);
app.use('/friend', friendRoutes);
app.use('/matchMaking', matchMakingRoutes);
app.use('/match', matchRoutes);

const server = http.createServer(app);
const wss = createWebSocketServer(server);
const udp = CreateUDPServer();

module.exports = wss;
// Start server
const port = process.env.PORT || 3000;
app.listen(port, '192.168.1.84', () => console.log(`Listening on port ${port}...`));
const socketPort = process.env.PORT || 4000;
server.listen(socketPort, () => {
  console.log('Server started on port:', socketPort);
});
  

