import http from "http";
import express from "express";
import ws from "ws";

const WebSocketServer = ws.Server;
const app = express();
const server = http.createServer(app);

const wss = new WebSocketServer({ httpServer: server });

var ws = new WebSocket("wss://ecv-etic.upf.edu/node/" + PORT + "/");

PORT = 3000;

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT} :)`);
});
