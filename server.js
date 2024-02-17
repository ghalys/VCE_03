import express from "express";
import http from "http";
import { WebSocketServer } from "ws"; // Import the 'ws' library
import WebSocket from "ws";
import DB from "./db.js";
import { Msg } from "./public/scripts/classes.js";

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
  async start() {
    // Create the server and the websocket
    const app = express();
    const server = http.createServer(app);
    this.server = server;

    // Create the database then do the rest
    this.db = new DB();
    await Promise.all([this.db.initializeTables()]);

    const ws = new WebSocketServer({ server });
    this.ws = ws;
    this.listen();
    this.setupRoutes(app);
    this.setupWebsocket();
  }

  setupRoutes(app) {
    app.use("/", mainroutes);
  }

  setupWebsocket() {
    this.ws.sendToClient = function (type, message) {
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
      console.log("User connected!");
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
      case "saveData":
        // Store the data in the database
        this.setData(msg);
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

  async sendUsers(ws) {
    try {
      // Send the list of users to the client in the Msg object
      var msg = new Msg();
      msg.id = ws.user_id;
      msg.author = "Server";
      msg.content = await this.getData("users");
      msg.type = "users";
      msg.time = new Date().getTime();
      ws.send(JSON.stringify(msg));
    } catch (err) {
      console.log("Error getting users: " + err);
    }
  }

  async sendRooms(ws) {
    try {
      // Send the list of rooms to the client in the Msg object
      var msg = new Msg();
      msg.id = ws.user_id;
      msg.author = "Server";
      msg.content = await this.getData("rooms");
      msg.type = "rooms";
      msg.time = new Date().getTime();
      ws.send(JSON.stringify(msg));
    } catch (err) {
      console.log("Error getting rooms: " + err);
    }
  }

  async sendMsgHistory(ws, room) {
    try {
      // Get the message history from the database
      var msg_history = await this.getData("messages", room);
      // Send the message history to the client in the Msg object
      var msg = new Msg();
      msg.create(ws.user_id, "Server", msg_history, "msg_history");

      ws.send(JSON.stringify(msg));
    } catch (err) {
      console.log("Error getting message history: " + err);
    }
  }

  sendRoomInfo(ws, room) {
    // Send the room information to the client in the Msg object
    var msg = new Msg();
    msg.create(ws.user_id, "Server", this.rooms[room], "room_info");

    ws.send(JSON.stringify(msg));
  }

  setData(msg) {
    // Store data with two msg objects encoupled in each other
    // Msg1 ( type= savedata, content= Msg2)
    // Msg2 ( type= whatToSave, content= data)

    // extract the data (also a msg object) to be stored
    var data = msg.content;
    // Let the db handle where to store the data
    this.db.handleData(data.content, data.type);
  }

  async getData(info, room = null) {
    return await this.db.retrieveData(info, room);
  } // Linking to the database
}

// export default MyServer;
export default MyServer;
