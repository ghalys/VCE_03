import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import path from "path";

import DB from "./db.js";

import {
  Msg,
  User,
  Client,
  Room,
  RoomManager,
} from "./public/scripts/classes.js";

import router from "./routes/mainroutes.js";

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

    //const wsServer = new WebSocket("wss://ecv-etic.upf.edu/node/9022/ws/");
    const wsServer = new WebSocketServer({ server });
    this.wsServer = wsServer;
    this.setupRoutes(app); // Setup the routes

    //when a new client is connected
    this.wsServer.on("connection", (ws, req) => {
      //we retrieve the username and the current roomname from the client
      const urlParams = new URLSearchParams(req.url.split("?")[1]);
      const username = urlParams.get("username");
      const roomname = urlParams.get("roomname");

      // We define the User and its Id
      var newUser = new User(this.last_id, username, "online");
      this.sendId(ws, this.last_id); //to the user
      this.last_id++;
      //We associate the ws to its room
      ws.room = roomname;
      //We define a client which associate the user to its client server
      var newClient = new Client(newUser, ws);

      //We communicate info about this incomming client and add him to the roomManager
      this.onConnection(roomname, newClient);

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
  }

  setupRoutes(app) {
    const __dirname = path.resolve();
    app.use(express.static(path.join(__dirname, "public")));
    app.use(router);
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
        if (message.destination == "room") {
          // Send the message to the room
          this.sendToRoom(client, message);
        } else {
          //Send the message to the specific user mentionned in message.destination
          var id = message.destination;
          this.sendToUser(id, message, client); //the client here is the sender
        }
        break;
      case "LOGIN":
        this.validateUserInfo(
          client,
          message.content.username,
          message.content.password
        );
        break;
      case "REGISTER":
        // Register the user in the database
        this.registerUser(client, message.content.username, message.content.password); 
        break;
    }
  }

  sendToUser(id, message, clientSender) {
    //Sends the message to a specific Id user
    var clients = this.roomManager.getClientsInRoom(clientSender);
    for (let client of clients) {
      if (client.id == id) {
        client.server.send(JSON.stringify(message));
      }
    }
  }

  async validateUserInfo(client, user, password) {
    // Check if the user is in the database
    // Check if the password is correct
    // Return true if the user is valid, false otherwise
    try {
      var validUser = false;
      var user = await this.db.validateUserInfo(user, password);
      if (user) {
        validUser = true; // UserInfo is valid
      }
      var login_msg = new Msg(this.server_id, "Server", validUser, "LOGIN");
      client.server.send(JSON.stringify(login_msg));
    } catch (err) {
      console.log("Error getting user: " + err);
    }
  }

  registerUser(client, username, password){
    this.db.addUser(username, password);
    // Check if User is sucessfully added and send Client 
    this.db.validateUserInfo(username).then((response) => {
      var register_msg = new Msg(this.server_id, "Server", response, "REGISTER"); 
      client.server.send(JSON.stringify(register_msg)); 
    }); 

  }

  sendToRoom(Client, message) {
    // Send the message to all other clients in the room
    var clients = this.roomManager.getClientsInRoom(Client);

    for (let otherClient of clients) {
      if (otherClient.id != Client.id) {
        otherClient.server.send(JSON.stringify(message));
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
    var msg = new Msg(this.server_id, "Server", Client.user, "USER_LEFT");
    this.sendToRoom(Client);
  }

  sendUsersOfRoom(newClient) {
    //send the info about all people connected to the new user
    var clients = this.roomManager.getClientsInRoom(newClient);
    for (let client of clients) {
      if (client.id != newClient.id) {
        var msg = new Msg(this.server_id, "Server", client.user, "USER_JOIN");
        newClient.server.send(JSON.stringify(msg));
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
