import express from "express";
import http from "http";
import { WebSocketServer } from "ws"; // Import the 'ws' library
import WebSocket from "ws";
import DB from "./db.js";

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
    this.db = new DB();
    this.db.initializeTables();

    const app = express();
    const server = http.createServer(app);
    this.server = server;
    //const ws = new WebSocket("wss://ecv-etic.upf.edu/node/9022/");
    const ws = new WebSocketServer({ server: server });
    this.ws = ws;
    this.listen();
    this.setupRoutes(app);
    this.setupWebsocket();
  }

  setupRoutes(app) {
    app.use("/", mainroutes);
  }

  setupWebsocket() {
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

    ws.on("connection", (ws) => {
      console.log(`Client ${ws.user_name} connected`);
    });

    ws.on("message", (message) => {
      this.onMessage(ws, message);
    });

    ws.on("close", () => {
      console.log(`Client ${ws.user_name} disconnected`);
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

  onMessage(ws, message) {}

  createRoom(room) {
    console.log("Creating room " + room);
    this.rooms[room] = { clients: [] };
  }
  getRoomInfo(room) {
    // Copy the clients array and return it
    var room_clone = { clients: [] };
    // For each client in the room add its user_id to the clone array
    for (var i in this.rooms[room].clients)
      room_clone.clients.push(this.rooms[room].clients[i].user_id);
    return room_clone;
  }
  findRooms() {}
  sendToRoom() {}

  setData(data, info) {
    //Parameters: data, the data to be stored, info, the information where to store the data
    // Store the data in the database

    // Let the db handle where to store the data
    this.db.handleData(data, info);
  }

  getData(info, room = null) {
    this.db.retrieveData(info, room);
  } // Linking to the database
}

// export default MyServer;
export default MyServer;
