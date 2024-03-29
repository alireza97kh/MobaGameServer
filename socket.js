// Import the ws module
const WebSocket = require('ws');
const Match = require('./schemas/matchSchema');
const { ObjectId } = require('mongodb');
const dgram = require('node:dgram');
const { match } = require('node:assert');
const { Console } = require('node:console');
const { logToFile, clearLogFile } = require('./Log');
const server = dgram.createSocket('udp4');
const matches = new Map();
let totalBytesReceivedTCP = 0;
let totalBytesReceivedUDP = 0;
// Create a function that accepts an HTTP server and returns a WebSocket server
function createWebSocketServer(httpServer) {
  // Create a new WebSocket server
  const wss = new WebSocket.Server({ server: httpServer });
  // Add a map to keep track of all the matches and their connected players

  // Set up event listeners
  wss.on('connection',function connection(ws) {
    console.log('WebSocket connected');
    clearLogFile('DataSend');
    clearLogFile('ReciveDate');
    ws.on('message', async function incoming(msg) {
      let message = msg.toString();
      totalBytesReceivedTCP += Buffer.byteLength(message);

      if(message.endsWith(':'))
        message = message.substring(0,message.length-1);
      

      logToFile(message + '  WebSocket', 'ReciveDate');
      let splitedMessage = message.split(':');
      if(splitedMessage[0] == 'ID'){
        if(splitedMessage.length == 3){
          ws.userId = splitedMessage[1];
          CheckIDInStartAndAddToMatches(splitedMessage, ws);
        }
      }
      else if(splitedMessage[0] == 'SELECT_HERO'){
        SelectHeroController(splitedMessage, ws, message);
      }
      else if(splitedMessage[0] == 'PING'){
        ws.send('PONG:' + splitedMessage[1]);
        TCP_PingController(ws, splitedMessage);
      }
      else if(splitedMessage[0] == 'CHECK_MASTER_CLIENT'){
        Calculate_Master_Client(ws);
      }
      else if(splitedMessage[0] == 'NEW_CREEP_ACTIVATED' || splitedMessage[0] == 'NEW_CREEP_CREATED'){
        sendToMatch(ws.matchId, message, null);
      }
      else if(splitedMessage[0] == 'ANIMATION'){
        sendToMatch(ws.matchId, message, null);
      }
      else {
        // if(splitedMessage[0] == 'TOWER')
        //   console.log(message);
        sendToMatch(ws.matchId, message, null);
      }
    });

    // Handle disconnections
    ws.on('close', async function close() {
      console.log('WebSocket disconnected ', ws.userId);
      logToFile('\n---------- End of WebSocket and DC----------\nTCP Bytes :' + totalBytesReceivedTCP + '  UDP Bytes :' + totalBytesReceivedUDP, 'ReciveDate');
      logToFile('\n---------- End of WebSocket and DC----------\n', 'DataSend');
      await Match.deleteOne({_id: new ObjectId(ws.matchId)});
      
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
  // Export the WebSocket server and the matches map
  return { wss, matches };
}

function CreateUDPServer(){
    server.on('error', (err) => {
        console.error(`server error:\n${err.stack}`);
        server.close();
      });
      
      server.on('message', (msg, rinfo) => {
        let message = msg.toString();
        totalBytesReceivedUDP += Buffer.byteLength(message);
        logToFile(message, 'ReciveDate');
        let splitedMessage = message.split(':');
        if(message.split(':')[0] == 'PING'){
          server.send('PONG:' + message.split(':')[1], rinfo.port, rinfo.address);
          UDP_PingController(server, splitedMessage);
        }
        else if(splitedMessage[0] == 'ID'){
          CheckIDInStartAndAddToMatchesForUDP(server, splitedMessage, rinfo);
        }
        else{
          // console.log(message);
          sendToMatchByUDP(server.matchId, message, null);
        }
        // console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
      });
      
      server.on('listening', () => {
        const address = server.address();
        console.log(`server listening ${address.address}:${address.port}`);
      });
      
      server.bind({
        address: '192.168.223.20',
        port: 8080,
        exclusive: true
      });
      return server;
}


// Function to send a message to all players in a match
function sendToMatch(matchId, message, data = null) {
  const match = matches.get(matchId);
  if (!match) {
    // console.log('Match not found:', matchId);
    return;
  }
  logToFile('Send Data With TCP : ' + message + '  Data : ' + data + '  to match :' + matchId, 'DataSend');
  matches.get(matchId).players.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      if(data)
        client.send(message + ':' + data);
      else 
        client.send(message);
    }
  });
}
function sendToMatchByUDP(matchId, message, data = null) {
  const match = matches.get(matchId);
  if (!match) {
    // logToFile('Match not found:', matchId);
    return;
  }
  logToFile('Send Data With UDP : ' + message + '  Data : ' + data + '  to match :' + matchId, 'DataSend');
  matches.get(matchId).UDPServers.forEach((element) => {
    if(data)
    element.server.send(message + ':' + data, element.rinfo.port, element.rinfo.address);
    else 
    element.server.send(message, element.rinfo.port, element.rinfo.address);
  });
}
function SendToOtherPlayersInMatch(matchId, message, data = null, ws){
  const match = matches.get(matchId);
  if (!match) {
    // console.log('Match not found:', matchId);
    return;
  }
  // console.log('sendToMatch : ' + matchId , message, data + '\n');
  matches.get(matchId).players.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client != ws) {
      if(data)
        client.send(message + ':' + data);
      else 
        client.send(message);
    }
  });
}

function SendToOtherPlayersInMatchInUDP(matchId, message, data = null, server){
  const match = matches.get(matchId);
  if (!match) {
    // console.log('Match not found:', matchId);
    return;
  }
  matches.get(matchId).UDPServers.forEach((element) => {
    if(element.server != server){
      if(data)
      element.server.send(message + ':' + data, element.rinfo.port, element.rinfo.address);
      else 
      element.server.send(message, element.rinfo.port, element.rinfo.address);
    }
  });


}
async function CheckIDInStartAndAddToMatches(splitedMessage, ws){
  // let objID = new ObjectId(splitedMessage[1]);
  let matchId = splitedMessage[2];
  let match = await Match.findOne({_id: new ObjectId(matchId)});
  if(match){
    if(matches.get(matchId)){
      if(!matches.get(matchId).players)
        matches.get(matchId).players = [];
      matches.get(matchId).players.push(ws);
    }
    else {
      let temp = {id: matchId, players: [], match: match, TCP_ping: -1, UDP_ping: -1};
      temp.players.push(ws);
      matches.set(temp.id, temp);
    }
    ws.matchId = matchId;
    ws.userId = splitedMessage[1];
    sendToMatch(matchId, 'NEW_PLAYER:' + ws.userId);
    let currentMatch = matches.get(matchId);
    console.log(currentMatch.match.countOfPlayers + '\n' + currentMatch.players.length);
    if(currentMatch.match.countOfPlayers === currentMatch.players.length){
      sendToMatch(matchId, 'GO_TO_SELECT_HERO:' + ws.userId);
    }
  }
  // else {
  //   console.log('Else Bingooo ');
  // }
}

async function CheckIDInStartAndAddToMatchesForUDP(server, splitedMessage, rinfo){
  let matchId = splitedMessage[1];

  if(matches.get(matchId)){
    if(!matches.get(matchId).UDPServers)
      matches.get(matchId).UDPServers = [];


    // else if(!matches.get(matchId).UDPServers.findOne(x => x == server)){
      //TODO inja bayad check konim ke ghablan ino add kardim ya na
      matches.get(matchId).UDPServers.push({server: server, rinfo: rinfo});
    // }
  }
  else {
    let match = await Match.findOne({_id: new ObjectId(matchId)});
    let temp = {id: matchId, players: [], match: match, UDPServers: [], TCP_ping: -1, UDP_ping: -1};
    temp.UDPServers.push({server: server, rinfo: rinfo});
    matches.set(temp.id, temp);
  }

  server.matchId = matchId;
  server.userId = splitedMessage[2];
  sendToMatchByUDP(matchId, "ID_VALIDATED:" + splitedMessage[2], null);
}

function TCP_PingController(ws, splitedMessage){
  let _ping = Number.parseInt(splitedMessage[1]);
  if(_ping > 0){
    ws.ping = _ping;
  }
}

function UDP_PingController(server, splitedMessage){
  let _ping = Number.parseInt(splitedMessage[1]);
  if(_ping > 0){
    server.ping = _ping;
  }
}

async function SelectHeroController(splitedMessage, ws, message){
  let match = await Match.findOne({ _id: ws.matchId });
  if (match) {
    let otherPlayers = match.players.filter(player => player.user.toString() !== ws.userId);
    let isHeroSelected = otherPlayers.some(player => player.heroName === splitedMessage[1]);
    if (!isHeroSelected) {
      let playerIndex = match.players.findIndex(player => player.user.toString() === ws.userId);
      if (playerIndex !== -1) {
        match.players[playerIndex].heroName = splitedMessage[1];
        await match.save();
        ws.selectedHero = splitedMessage[1];
        sendToMatch(ws.matchId, message, null);
      }

      let AllPLayerSelectedHero = match.players.findIndex(x => x.heroName === '');
      if(AllPLayerSelectedHero === -1){
        console.log('\n------------ All Player Has Selected Their hero So lets Start Game------------\n');
        sendToMatch(ws.matchId, "START_GAME", null);
      }
    } 
  }
}

function Calculate_Master_Client(ws){
  let _match = matches.get(ws.matchId);
  let selectedIndex = -1;
  let maxPing = 1000;
  for(let i = 0; i < _match.players.length; i++){
    if(_match.players[i].ping && _match.players[i].userId == '642585785dc4948057b45979'){
      if(_match.players[i].ping < maxPing){
        maxPing = _match.players[i].ping;
        selectedIndex = i;
      }
      // console.log(_match.players[i]);
    }
  }
  if(selectedIndex > -1)
    sendToMatch(ws.matchId, 'CHECK_MASTER_CLIENT:' + _match.players[selectedIndex].userId, null);
}

module.exports = { createWebSocketServer, sendToMatch, CreateUDPServer };
