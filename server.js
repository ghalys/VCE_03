import express from "express";
import http from "http";
import { WebSocketServer } from 'ws'

// import DB from "./db.js";
import {Msg,User,Client,Room,RoomManager} from './public/scripts/Msg_User.js';

import mainroutes from "./routes/mainroutes.js";

var PORT = 3000;



class MyServer {
  constructor() {
    this.roomManager = null;
    this.db = {};
    this.server = null; //httpServer
    this.default_port = 3000;
    this.wsServer = null;//webSocketServer
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
    

    //when a new client is connected 
    this.wsServer.on("connection", (ws, req) => {

      //we retrieve the username and the current roomname from the client
      const urlParams = new URLSearchParams(req.url.split('?')[1]);
      const username = urlParams.get('username');
      const roomname = urlParams.get('roomname');


      // We define the User and its Id
      var newUser = new User(this.last_id,username,"online",new Date().getTime() );
      this.sendId(ws,this.last_id); //to the user
      this.last_id++;
      //We associate the ws to its room
      ws.room = roomname;
      //We define a client which associate the user to its client server
      var newClient = new Client(newUser, ws);

      //We communicate info about this incomming client and add him to the roomManager
      this.onConnection(roomname,newClient);

      
      // Handling incoming messages from the client
      ws.on("message", (msg) => {
        console.log("Received message from client");

        var message = JSON.parse(msg);
        this.onMessage(newClient, message);

      });

      // Handling client disconnection
      ws.on("close", () => {
        console.log("Client disconnected");
      });

    });
  
  };

  setupRoutes(app) {
    app.use("/", mainroutes);
  }
  sendId(ws,id){
    var msg = new Msg(
      this.server_id,
      "Server",
      id,
      "YOUR_INFO",
      new Date().getTime());
    ws.send(JSON.stringify(msg));
  }

  listen(port) {
    this.port = port || this.default_port;
    console.log("Listening on port " + this.port);
    this.server.listen(this.port);
  }

  onConnection(room,newClient) {
    console.log("Websocket connection established");
    this.roomManager.addClientToRoom(room,newClient);

    //We update the activeUsers lists for all clients presents in the room
    this.sendUserJoin(newClient); 
    this.sendUsersOfRoom(newClient);
    

    // var path_info = url.parse(req.url);
    // var parameters = qs.parse(path_info.query);
    // // Room management
    // var room_name = path_info.pathname;
    // ws.room = room_name.substring(1, room_name.length); // Remove the first character '/'

  }

  // Handling the messages received from the clients
  onMessage(client, message) {

    // Switch case for all the types of messages
    switch (message.type) {

      case "TEXT":
        if (message.destination) {
          // Send the message to the room
          this.sendToRoom(client, message);

        }
        else{
          //Send the message to the specific user mentionned in message.destination
          var id = message.destination;
          this.sendToUser(id,message,client); //the client here is the sender
        }
        break;           
    }

      // case "getRooms":
      //   // Send the message to the room
      //   this.sendRooms(ws);
      //   break;
      // case "getMsgHistory":
      //   // Send the message to the room
      //   this.sendMsgHistory(ws, msg.room);
      //   break;
      // case "getRoomInfo":
      //   // Send the message to the room
      //   this.sendRoomInfo(ws, msg.room);
      //   break;
  }
  

  sendToUser(id,message,clientSender){
    //Sends the message to a specific Id user
    var clients = this.roomManager.getClientsInRoom(clientSender);
    for (let client of clients){
      if (client.id==id){
        client.server.send(JSON.stringify(message));
      }
    }
  }

  sendToRoom(Client, message) {
    // Send the message to all other clients in the room
    var clients = this.roomManager.getClientsInRoom(Client);

    for (let otherClient of clients) {
      if (otherClient.id != Client.id){
        otherClient.server.send(JSON.stringify(message));
      }
    }
  }

  sendUserJoin(newClient) {
    // Send the info "USER_JOIN" to the rest of the users of the same room
    var msg = new Msg(
                     this.server_id,
                     "Server",
                     newClient.user,
                     "USER_JOIN",
                     new Date().getTime());
    this.sendToRoom(newClient,msg);
  }

  sendUserLeft(Client) {
    // Send the info "USER_LEFT" to the rest of the users of the room
    var msg = new Msg(
                     this.server_id,
                     "Server",
                     Client.user,
                     "USER_LEFT",
                     new Date().getTime());
    this.sendToRoom(Client);
  }

  sendUsersOfRoom(newClient){
    //send the info about all people connected to the new user
    var clients = this.roomManager.getClientsInRoom(newClient);
    for (let client of clients){
      if (client.id!=newClient.id){
        var msg = new Msg(
                          this.server_id,
                          "Server",
                          client.user,
                          "USER_JOIN",
                          new Date().getTime());
        newClient.server.send(JSON.stringify(msg));
      }
    }
  }


  sendRooms(client) {
    //Send the list of rooms to the client in the Msg object
    var rooms = this.roomManager.getRoomNames();
    var msg = new Msg(
                      this.server_id,
                      "Server",
                      rooms,
                      "ROOMS_INFO",
                      new Date().getTime());
    client.server.send(JSON.stringify(msg));
  }


  //THIS PART WILL BE REVIEWED AFTER
///////////////////////////////////////////////////////////////////////////////////////
//   sendMsgHistory(ws, room) {
//     // Get the message history from the database and save it in the room object
//     //TODO: Async functions!!
//     var msg_history = this.getData("messages", room);
//     // Send the message history to the client in the Msg object
//     var msg = new Msg(
//                       ws.user_id,
//                       "Server",
//                       this.rooms[room].msg_history,
//                       "msg_history",
//                       msg.time = new Date().getTime());
//     // ws.send(JSON.stringify(msg));
//   }


//   setData(data, info) {
//     //Parameters: data, the data to be stored, info, the information where to store the data
//     // Store the data in the database

//     // Let the db handle where to store the data
//     this.db.handleData(data, info);
//   }

//   async getData(info, room = null) {
//     return await this.db.retrieveData(info, room);
//   // Linking to the database
//   } 
}
export default MyServer;
