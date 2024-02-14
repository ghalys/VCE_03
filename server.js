import express from "express";
import http from "http";
import { WebSocketServer } from 'ws'

// import DB from "./db.js";
import {Msg,User} from './public/scripts/Msg_User.js';

import mainroutes from "./routes/mainroutes.js";

var PORT = 3000;



class MyServer {
  constructor() {
    this.rooms = {};
    this.clients = [];
    this.db = {};
    this.server = null;
    this.default_port = 3000;
    this.wsServer = null;
    this.last_id = 0;
    this.server_id = -1;
  }
  
  start() {
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
      console.log(`Client ${ws.user_name} disconnected`);
  });

      // Optionally, you can handle errors as well
      ws.on("error", (error) => {
      console.log(`Client ${ws.user_name} disconnected with an error:`);
      console.log(error);

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
    ws.id = this.last_id;
    // ws.username = "User_" + this.last_id;
    this.last_id++;

    var msg = new Msg(
          4,
          "Server",
          "helooo",
          "TEXT",
          new Date().getTime());
    ws.send(JSON.stringify(msg));

    console.log(`Client ${ws.user_name} connected`);

    // var path_info = url.parse(req.url);
    // var parameters = qs.parse(path_info.query);

    // // Room management
    // var room_name = path_info.pathname;
    // ws.room = room_name.substring(1, room_name.length); // Remove the first character '/'

    //Create the room if it does not exist
    if (!this.rooms[ws.room]) {
      this.createRoom(ws.room);
    }

    var newUser = new User(ws.id,username,"online", new Date().getTime());
    this.rooms[ws.room].clients.push(ws);
    this.clients.push(ws);
    sendUserJoin(newUser,ws)
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


  sendToRoom(ws, msg) {
    // Send the message to all the clients in the room
    for (var client  in this.rooms[ws.room].clients) {
      if(client!=ws){
        this.rooms[room].clients[i].send(JSON.stringify(msg));
      }
    }
  }

  createRoom(room) {
    console.log("Creating room " + room);
    this.rooms[room] = { name : room, clients: [] };
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

  sendUserJoin(newUser,ws) {
    // Send the info about the user who joined the room
    var msg = new Msg(
                     this.server_id,
                     "Server",
                     newUser,
                     "USER_JOIN",
                     new Date().getTime());
    var room = ws.room;
    for (var client in this.rooms[room].clients){
      if (client.id!=ws.id){
        client.ws.send(JSON.stringify(msg));
      }
    }
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
    ws.send(JSON.stringify(msg));
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
  } // Linking to the database
}

// export default MyServer;
export default MyServer;
