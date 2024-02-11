import express from "express";
import http from "http";
import { WebSocketServer } from "ws"; // Import the 'ws' library
import WebSocket from "ws";
import DB from "./db.js";
import Msg from "./classes.js";

import mainroutes from "./routes/mainroutes.js";

var PORT = 3000;

//var url_ws_upf = new WebSocket("wss://ecv-etic.upf.edu/node/9022/");

class MyServer {
  constructor() {
    this.rooms = {};
    this.clients = [];
    this.db = {};
    this.server = null;
    this.default_port = 9022;
    this.ws = null;
    this.last_id = 0;
  }
  start() {
    // Create the database
    this.db = new DB();
    this.db.initializeTables();

    // Create the server and the websocket
    const app = express();
    const server = http.createServer(app);
    this.server = server;
    //const ws = new WebSocket("wss://ecv-etic.upf.edu/node/9022/");
    const ws = new WebSocketServer({ server: server });
    this.ws = ws;
    this.listen(); // Listen on the default port
    this.setupRoutes(app); // Setup the routes
    this.setupWebsocket(); // Setup the websocket
  }

  setupRoutes(app) {
    app.use("/", mainroutes);
  }

  setupWebsocket() {
    ws.sendToClient = function (type, message) {
      // Create instance of Msg with all the information
      var msg = new Msg();
      msg.id = this.user_id;
      msg.author = this.user_name;
      msg.content = message;
      msg.type = type;
      msg.time = new Date().getTime();

      //Stringify the message and send it to the client
      this.send(JSON.stringify(msg));
    };

    this.ws.on("connection", (ws, req) => {
      this.onConnection(ws, req);
    });
  }

  listen(port) {
    this.port = port || this.default_port;
    console.log("Listening on port " + this.port);
    this.server.listen(this.port);
  }

  onConnection(ws, req) {
    // When a client connects
    ws.user_id = this.last_id;
    ws.user_name = "User_" + this.last_id;
    this.last_id++;

    // WEBSOCKET EVENT HANDLERS
    ws.on("connection", (ws) => {
      console.log(`Client ${ws.user_name} connected`);
    });

    ws.on("message", (message) => {
      this.onMessage(ws, message);
    });

    ws.on("close", () => {
      console.log(`Client ${ws.user_name} disconnected`);
    });

    ws.on("error", (error) => {
      console.log(`Client ${ws.user_name} disconnected with an error:`);
      console.log(error);
    });

    console.log("Websocket connection established");

    var path_info = url.parse(req.url);
    var parameters = qs.parse(path_info.query);

    // Room management
    var room_name = path_info.pathname;
    ws.room = room_name.substring(1, room_name.length); // Remove the first character '/'

    //Create the room if it does not exist
    if (!this.rooms[ws.room]) this.createRoom(ws.room);
    this.rooms[ws.room].clients.push(ws);
    this.clients.push(ws);

    // On message callback for the websocket
    ws.onMessage((event) => {
      this.onMessage(ws, event);
    });
  }

  // Handling the messages received from the clients
  onMessage(ws, message) {
    // Parse the message
    var msg = JSON.parse(message);
    // Switch case for all the types of messages
    switch (msg.type) {
      case "text":
        // Send the message to the room
        this.sendToRoom(msg.room, msg);
        break;
      case "join":
        // Send the message to the room
        this.sendToRoom(msg.room, msg);
        break;
      case "leave":
        // Send the message to the room
        this.sendToRoom(msg.room, msg);
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

  sendToRoom(room, msg) {
    // Send the message to all the clients in the room
    for (var i in this.rooms[room].clients) {
      this.rooms[room].clients[i].send(JSON.stringify(msg));
    }
  }

  createRoom(room) {
    console.log("Creating room " + room);
    this.rooms[room] = { clients: [] };
  }

  sendUsers(ws) {
    // Send the list of users to the client in the Msg object
    var msg = new Msg();
    msg.id = ws.user_id;
    msg.author = "Server";
    msg.content = this.clients;
    msg.type = "users";
    msg.time = new Date().getTime();
    ws.send(JSON.stringify(msg));
  }

  sendRooms(ws) {
    // Send the list of rooms to the client in the Msg object
    var msg = new Msg();
    msg.id = ws.user_id;
    msg.author = "Server";
    msg.content = this.rooms;
    msg.type = "rooms";
    msg.time = new Date().getTime();
    ws.send(JSON.stringify(msg));
  }

  sendMsgHistory(ws, room) {
    // Get the message history from the database and save it in the room object
    //TODO: Async functions!!
    var msg_history = this.getData("messages", room);
    // Send the message history to the client in the Msg object
    var msg = new Msg();
    msg.id = ws.user_id;
    msg.author = "Server";
    msg.content = this.rooms[room].msg_history;
    msg.type = "msg_history";
    msg.time = new Date().getTime();
    ws.send(JSON.stringify(msg));
  }

  sendRoomInfo(ws, room) {
    // Send the room information to the client in the Msg object
    var msg = new Msg();
    msg.id = ws.user_id;
    msg.author = "Server";
    msg.content = this.rooms[room];
    msg.type = "room_info";
    msg.time = new Date().getTime();
    ws.send(JSON.stringify(msg));
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
