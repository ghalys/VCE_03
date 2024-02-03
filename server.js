import http from "http";
import express from "express";
import ws from "ws"; // Websocket

var ws = new WebSocket("wss://ecv-etic.upf.edu/node/" + PORT + "/");

PORT = 3000;

app.ws(); // to implement the websocket

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
    this.server = http.createServer(app);
    this.ws = new WebSocketServer({ httpServer: this.server });
    this.listen();
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

    var path_info = url.parse(req.url);
    var parameters = qs.parse(path_info.query);

    // Room management
    var room_name = path_info.pathname;
    ws.room = room_name.substring(1, room_name.length);
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
