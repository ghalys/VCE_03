import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";

import DB from "./db.js";
import {Msg,User,Client,Room,RoomManager,Agent} from './public/scripts/classes.js';

import mainroutes from "./routes/mainroutes.js";
// import { client } from "websocket";

var PORT = 3000;

class MyServer {
  constructor() {
    this.roomManager = null;
    this.db = {};
    this.server = null; //httpServer
    this.default_port = 9022;
    this.wsServer = null; //webSocketServer
    this.last_id = 0;
    this.server_id = -1;
  }

  async start() {
    this.roomManager = new RoomManager();

    // Create the server and the websocket
    const app = express();
    const server = http.createServer(app);
    this.server = server;

    // Create the database then do the rest
    this.db = new DB();

    await Promise.all([this.db.initializeTables()]);

    this.listen(); // Listen on the default port

    const wsServer = new WebSocketServer({ server });
    this.wsServer = wsServer;
    this.setupRoutes(app); // Setup the routes

    //when a new client is connected
    this.wsServer.on("connection", (ws, req) => {
      //we retrieve the username and the current roomname from the client
      const urlParams = new URLSearchParams(req.url.split('?')[1]);
      const roomname = urlParams.get('roomname');
      
      
      // we send the id to the user
      this.sendId(ws,this.last_id); 
      this.last_id++;
      
      //We associate the ws to its room
      ws.room = roomname;

      var client = null;
      
      // Handling incoming messages from the client
      ws.on("message", (msg) => {
        var message = JSON.parse(msg);

        //if the message received is about the newUser
        if(message.type=="NEW_AGENT"){//should be received after seting the id
          console.log("Received agent from client");

          var newAgent = message.content;

          //we create the new client with its user and agent and ws
          client = this.createNewClient(newAgent,roomname,ws);
          //We communicate info about this incomming client and add him to the roomManager
          this.onConnection(roomname,client);

          //
        
        }
        else{ //a normal message should be treated
          this.onMessage(client, message);
        }


      });

      // Handling client disconnection
      ws.on("close", () => {
        console.log("Client disconnected");

        // we should remove the client from RoomManager
        this.roomManager.removeClientFromRoom(roomname, client);
        //inform everyone that the client has left
        this.sendUserLeft(client);
        // save the last position of the character

      });
    });
  
  };

  createNewClient(agent,roomname,ws){
      var id = agent.id;
      var username = agent.username;
      // We define the User and its Id
      var newUser = new User(id,username,"online",agent );

      // We create a new agent
      var newAgent = new Agent(id,username);

      //We define a client which associate the user to its client server
      var newClient = new Client(newUser, ws, newAgent);

      return newClient;
  };

  setupRoutes(app) {
    app.use("/", mainroutes);
  }

  sendId(ws, id) {
    var msg = new Msg(this.server_id, "Server", id, "YOUR_INFO");
    ws.send(JSON.stringify(msg));
  }

  listen(port) {
    this.port = port || this.default_port;
    console.log("Listening on port " + this.port);
    this.server.listen(this.port);
  }

  onConnection(room, newClient) {
    console.log("Websocket connection established");
    this.roomManager.addClientToRoom(room, newClient);

    //We update the activeUsers lists for all clients presents in the room
    this.sendUserJoin(newClient);

    //send the info about all people connected to the new user
    this.sendUsersOfRoom(newClient);
    
    //TODO -  send messages to the client
    // var array = null;
    // for (let msg in array){
    //   this.newClient.wsServer.send(msg);
    // }

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
      
        case "AGENT_STATE":
        this.sendToRoom(client, message);
        break;
        
        case "TEXT":
        console.log("Received message from client ");
        if (message.destination =="room") {
          // Send the message to the room
          this.sendToRoom(client, message);
        } else {
          //Send the message to the specific user mentionned in message.destination
          var id = message.destination;
          this.sendToUser(id, message, client); //the client here is the sender
        }
        break; 
      

    }
  }

  sendToUser(id, message, clientSender) {
    //Sends the message to a specific Id user
    var clients = this.roomManager.getClientsInRoom(clientSender);
    for (let client of clients){
      if (client.user.id==id){
        client.WSserver.send(JSON.stringify(message));
      }
    }
  }

  sendToRoom(Client, message) {
    // Send the message to all other clients in the room
    var clients = this.roomManager.getClientsInRoom(Client);
    for (let otherClient of clients) {
      if (otherClient.user.id != Client.user.id){
        otherClient.WSserver.send(JSON.stringify(message));
      }
    }
  }

  sendUserJoin(newClient) {
    // Send the info "USER_JOIN" to the rest of the users of the same room
    var msg = new Msg(this.server_id, "Server", newClient.user, "USER_JOIN");
    this.sendToRoom(newClient, msg);
  }
  
  sendUserLeft(Client) {
    // Send the info "USER_LEFT" to the rest of the users of the room
    var msg = new Msg(this.server_id,
                     "Server",
                     Client.user,
                     "USER_LEFT");
    this.sendToRoom(Client,msg);
  }

  sendUsersOfRoom(newClient) {
    //send the info about all people connected to the new user
    var clients = this.roomManager.getClientsInRoom(newClient);
    for (let client of clients){
      if (client.user.id!=newClient.user.id){
        var msg = new Msg(this.server_id,
                          "Server",
                          client.user,
                          "USER_JOIN");
        newClient.WSserver.send(JSON.stringify(msg));
      }
    }
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

  //TODO we should integrate functions below
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

  //TODO we should integrate functions below
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

  //TODO we should integrate functions below
  sendRoomInfo(ws, room) {
    // Send the room information to the client in the Msg object
    var msg = new Msg();
    msg.create(ws.user_id, "Server", this.rooms[room], "room_info");

    ws.send(JSON.stringify(msg));
  }

  //TODO we should integrate functions below
  setData(msg) {
    // Store data with two msg objects encoupled in each other
    // Msg1 ( type= savedata, content= Msg2)
    // Msg2 ( type= whatToSave, content= data)

    // extract the data (also a msg object) to be stored
    var data = msg.content;
    // Let the db handle where to store the data
    this.db.handleData(data.content, data.type);
  }

  //TODO we should integrate functions below
  async getData(info, room = null) {
    return await this.db.retrieveData(info, room);
  } // Linking to the database
}
export default MyServer;
