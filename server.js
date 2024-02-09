import express from "express";
import http from "http";
import WebSocketServer from "ws"; // Import the 'ws' library

import mainroutes from "./routes/mainroutes.js";

var PORT = 3000;

//var url_ws_upf = new WebSocket("wss://ecv-etic.upf.edu/node/9022/");

class MyServer {
  constructor() {
    this.rooms = {};
    this.clients = [];
    this.db = {};
    this.server = null;
    this.default_port = 3000;
    this.ws = null;
    this.last_id = 0;
  }
  start() {
    const app = express();
    const server = http.createServer(app);
    this.server = server;
    //const ws = new WebSocket("wss://ecv-etic.upf.edu/node/9022/");
    const ws = new WebSocketServer({ server: server });
    this.ws = ws;
    this.listen();

    app.use("/", mainroutes);
  }
  listen(port) {
    this.port = port || this.default_port;
    console.log("Listening on port " + this.port);
    this.server.listen(this.port);
  }
  onConnection(ws, req) {
    // When a client connects
    ws.user_id = this.last_id;
    ws.user_name = "User " + this.last_id;
    this.last_id++;

    console.log("Websocket connection established");

    // var path_info = url.parse(req.url);
    // var parameters = qs.parse(path_info.query);

    // // Room management
    // var room_name = path_info.pathname;
    // ws.room = room_name.substring(1, room_name.length);
  }
  createRoom() {}
  getRoomInfo() {}
  findRooms() {}
  sendToRoom() {}
  setData() {} // Linking to the database
  getData() {} // Linking to the database
}

// export default MyServer;
export default MyServer;
