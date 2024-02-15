import express from "express";
import http from "http";
import { WebSocketServer } from 'ws'

// import DB from "./db.js";
import {Msg,User,Client,Room,RoomManager} from './public/scripts/Msg_User.js';

import mainroutes from "./routes/mainroutes.js";

var PORT = 3000;



class MyServer {
  constructor() {
    this.rooms = {};
    this.roomManager = null;
    // this.clients = [];
    this.db = {};
    this.server = null;
    this.default_port = 3000;
    this.wsServer = null;
    this.last_id = 0;
    this.server_id = -1;
  }
  
  start() {
  this.roomManager = new RoomManager();
  // Create the database
  // this.db = new DB();
  // this.db.initializeTables();

  // Create the server and the websocket
  const app = express();
  const server = http.createServer(app);
  this.server = server;
  this.listen(); // Listen on the default port

  //const ws = new WebSocket("wss://ecv-etic.upf.edu/node/9022/");
  const wsServer = new WebSocketServer({ server });
  this.wsServer = wsServer;
  this.setupRoutes(app); // Setup the routes
  
  this.wsServer.on("connection", (ws, req) => {
      this.onConnection(ws,req)

      // Handling incoming messages from the client
      ws.on("message", (message) => {
        console.log("Received message:", message);
      });

      // Handling client disconnection
      ws.on("close", () => {
      // console.log(`Client ${ws.user_name} disconnected`);
  });

      // Optionally, you can handle errors as well
      ws.on("error", (error) => {
      // console.log(`Client ${ws.user_name} disconnected with an error:`);
      // console.log(error);

    });

    });
  
  };

  setupRoutes(app) {
    app.use("/", mainroutes);
  }

  listen(port) {
    this.port = port || this.default_port;
    console.log("Listening on port " + this.port);
    this.server.listen(this.port);
  }

  onConnection(ws, req) {
    console.log("Websocket connection established");

    // When a client connects
    var newUser = new User(this.last_id,username="User_" + this.last_id,"online", new Date().getTime());
    ws.id = this.last_id; // we should associate an id to the ws 
    this.last_id++;
    
    var newClient = new Client(newUser, ws);

    this.roomManager.addClientToRoom(ws.room,newClient);
    
    // var path_info = url.parse(req.url);
    // var parameters = qs.parse(path_info.query);

    // // Room management
    // var room_name = path_info.pathname;
    // ws.room = room_name.substring(1, room_name.length); // Remove the first character '/'

    this.sendUserJoin(newClient);
    this.sendRoomInfo(newClient);
  }

  // Handling the messages received from the clients
  onMessage(ws, message) {
    // Parse the message
    var msg = JSON.parse(message);
    // Switch case for all the types of messages
    switch (msg.type) {
      case "TEXT":
        // Send the message to the room
        this.sendToRoom(msg.room, msg);
        break;
      case "YOUR_INFO":
        break;
      case "getUsers":
        // Send the message to the room
        this.sendUsers(ws);
        break;
      case "getRooms":
        // Send the message to the room
        this.sendRooms(ws);
        break;
      case "getMsgHistory":
        // Send the message to the room
        this.sendMsgHistory(ws, msg.room);
        break;
      case "getRoomInfo":
        // Send the message to the room
        this.sendRoomInfo(ws, msg.room);
        break;
    }
  }


  sendToRoom(newClient, msg) {
    // Send the message to all other clients in the room
    var clients = this.roomManager.getClientsInRoom(newClient);
    for (var client in clients){
      if (client.id!=newClient.id){
        client.server.send(JSON.stringify(msg));
      }
    }
  }

  sendUserJoin(newClient) {
    // Send the info about the user who joined the room to the rest of the users
    var msg = new Msg(
                     this.server_id,
                     "Server",
                     newClient.user,
                     "USER_JOIN",
                     new Date().getTime());
    this.sendToRoom(newClient,msg);
  }

  sendUserLeft(Client) {
    // Send the info about the user who quit the room to the rest of the users
    var msg = new Msg(
                     this.server_id,
                     "Server",
                     Client.user,
                     "USER_LEFT",
                     new Date().getTime());
    this.sendToRoom(Client);
  }

  sendRoomInfo(newClient){
    //send to new user the info about all people connected
    var msg = new Msg(
                      this.server_id,
                      "Server",
                      client.user,
                      "USER_JOIN",
                      new Date().getTime());

    var clients = this.roomManager.getClientsInRoom(newClient);
    for (var client in clients){
      if (client.id!=newClient.id){
        newClient.server.send(JSON.stringify(msg));
      }
    }
  }
  createRoom(room) {
    console.log("Creating room " + room);
    this.rooms[room] = { clients: [] };
  }

  sendUsers(ws) {
    // Send the list of users of the room to the client in the Msg object
    var msg = new Msg(
                     this.server_id,
                     "Server",
                     this.rooms[ws.room].clients,
                     "users",
                     new Date().getTime());
    ws.send(JSON.stringify(msg));
  }

  sendRooms(ws) {
    // Send the list of rooms to the client in the Msg object
    var msg = new Msg(
                      ws.user_id,
                      "Server",
                      this.rooms,
                      "rooms",
                      new Date().getTime());
    ws.send(JSON.stringify(msg));
  }

///////////////////////////////////////////////////////////////////////////////////////
  sendMsgHistory(ws, room) {
    // Get the message history from the database and save it in the room object
    //TODO: Async functions!!
    var msg_history = this.getData("messages", room);
    // Send the message history to the client in the Msg object
    var msg = new Msg(
                      ws.user_id,
                      "Server",
                      this.rooms[room].msg_history,
                      "msg_history",
                      msg.time = new Date().getTime());
    // ws.send(JSON.stringify(msg));
  }

  sendRoomInfo(ws, room) {
    // Send the room information to the client in the Msg object
    var msg = new Msg(
                      ws.user_id,
                      "Server",
                      this.rooms[room],
                      msg.type = "room_info",
                      msg.time = new Date().getTime());
                      
    ws.send(JSON.stringify(msg))
  }

  setData(data, info) {
    //Parameters: data, the data to be stored, info, the information where to store the data
    // Store the data in the database

    // Let the db handle where to store the data
    this.db.handleData(data, info);
  }

  async getData(info, room = null) {
    return await this.db.retrieveData(info, room);
  // Linking to the database
  } 
}


// var msg = new Msg(
//   4,
//   "Server",
//   "helooo",
//   "TEXT",
//   new Date().getTime());
// ws.send(JSON.stringify(msg));

// export default MyServer;
export default MyServer;
