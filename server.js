import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import path from "path";
import DB from "./db.js";
import Msg from "./public/scripts/Chat/message_class.js";
import User from "./public/scripts/Chat/user_class.js";
import Client from "./public/scripts/Chat/client_class.js";
import Agent from "./public/scripts/World/agent_class.js";
import RoomManager from "./public/scripts/ClientServer/roomManager.js";
import router from "./routes/mainroutes.js";
import jsonwebtoken from "jsonwebtoken";

class MyServer {
  constructor() {
    this.roomManager = null; //The manager of the room, see the class in classes.js
    this.db = {}; // Our database
    this.server = null; //httpServer
    this.default_port = 9022; //our port on ecv-etic.upf.edu
    this.wsServer = null; //webSocketServer
    this.last_id = 0; // every user will get a unique id
    this.server_id = -1; // the id of the server
  }

  async start() {
    this.roomManager = new RoomManager();

    // Create the server and the websocket
    const app = express();
    const server = http.createServer(app);
    this.server = server;

    // Create the database then do the rest
    this.db = new DB();

    //await Promise.all([this.db.initializeTables()]);
    await this.db.initializeTables();

    this.listen(); // Listen on the default port

    const wsServer = new WebSocketServer({ server });
    this.wsServer = wsServer;
    this.setupRoutes(app); // Setup the routes

    //when a new client is connected
    this.wsServer.on("connection", (ws, req) => {
      //we retrieve the username and the current roomname from the client
      const urlParams = new URLSearchParams(req.url.split("?")[1]);
      const roomname = urlParams.get("roomname");

      // we send the id to the user
      this.sendId(ws, this.last_id);
      this.last_id++;

      this.createAcessToken(ws);

      //create a temporary client
      var client = new Client(null, ws);

      // Handling incoming messages from the client
      ws.on("message", (msg) => {
        var message = JSON.parse(msg);

        //if the message received is about the newUser
        if (message.type == "NEW_AGENT") {
          console.log("Websocket connection established");

          //should be received after seting the id
          var newAgent = message.content;

          //We associate the ws to its room
          ws.room = roomname;

          //we replace the temporary client with the new client created with its user and agent and ws
          client = this.createNewClient(newAgent, ws);

          //We communicate info about this incomming client and add him to the roomManager
          this.joinRoom(roomname, client);
        } else {
          //a normal message should be treated
          this.onMessage(client, message);
        }
      });

      // Handling client disconnection
      ws.on("close", () => {
        //if it's not a login_client
        if (client.user != null) {
          console.log("Client disconnected");
          this.quitRoom(client.WSserver.room, client);

          // Save the last position and avatar of the agent
          // TODO last position is always saved [0,0] and avatar is always saved "Avatar"
          // not sure if the problem is here or in the client
          this.saveAgentPosition(client.user);
        }
      });
    });
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
        if (message.destination == "room") {
          // Send the message to the room
          this.sendToRoom(client, message);

          // Save message in the database
          this.db.addMessages(
            client.user.username,
            client.WSserver.room,
            message
          );
        } else {
          //Send the message to the specific user mentionned in message.destination
          var id = message.destination;
          this.sendToUser(id, message, client); //the client here is the sender
        }
        break;

      case "LOGIN":
        this.checkLoginInfo(
          client,
          message.content.username,
          message.content.password
        );
        break;

      case "REGISTER":
        // Register the user in the database
        this.registerUser(
          client,
          message.content.username,
          message.content.password
        );
        break;

      case "CHANGE_ROOM":
        this.quitRoom(client.WSserver.room, client);
        var newRoom = message.content;
        client.WSserver.room = newRoom;
        this.joinRoom(newRoom, client);
    }
  }

  createAcessToken(ws, app) {
    // Attach token to response cookie
    app.post("/login", (req, res) => {
      const accessToken = jsonwebtoken.sign(
        { id: ws.id, username: ws.username },
        process.env.ACCESS_TOKEN_SECRET, // TODO: change to a more secure secret
        { expiresIn: "1h" }
      );
    });
  }

  listen(port) {
    this.port = port || this.default_port;
    console.log("Listening on port " + this.port);
    this.server.listen(this.port);
  }

  setupRoutes(app) {
    const __dirname = path.resolve();
    app.use(express.static(path.join(__dirname, "public")));
    app.use(router);
  }

  joinRoom(room, client) {
    this.roomManager.addClientToRoom(room, client);
    // Add room to the database if it doesn't exist
    this.db.addRoom(room);
    //We update the activeUsers lists for all clients presents in the room
    this.sendUserJoin(client);

    //send the info about all people connected to the new user
    this.sendUsersOfRoom(client);

    //send the history of messages to the new user
    this.sendMsgHistory(client, room);
  }

  quitRoom(room, client) {
    // we should remove the client from RoomManager
    this.roomManager.removeClientFromRoom(room, client);

    //inform everyone that the client has left
    this.sendUserLeft(client);

    //save the last position of its agent
    this.saveAgentPosition(client.user.agent);
  }

  saveAgentPosition(user) {
    // Save the last position of the agent and the avatar
    if (user.agent == null) {
      return;
    }

    const updateInfo = {
      last_position: JSON.stringify(user.agent.position),
      avatar: JSON.stringify(user.agent.avatar),
    };

    this.db.updateUser(user.username, updateInfo);
    // check if the update was succesful and print a message
    this.db.validateUserInfo(user.username).then((response) => {
      if (response) {
        if (
          response.last_position === JSON.stringify(user.agent.position) &&
          response.avatar === JSON.stringify(user.agent.avatar)
        ) {
          console.log(
            "User info of " + user.username + " updated successfully"
          );
        } else {
          console.log("Error updating user info of " + user.username);
          console.log("Last position: " + response.last_position);
          console.log("Avatar: " + response.avatar);
        }
      }
    });
  }

  createNewClient(agent, ws) {
    var id = agent.id;
    var username = agent.username;
    // We define the User and its Id
    var newUser = new User(id, username, "online", agent);

    // We create a new agent
    var newAgent = new Agent(id, username);

    //We define a client which associate the user to its client server
    var newClient = new Client(newUser, ws, newAgent);

    return newClient;
  }

  sendId(ws, id) {
    var msg = new Msg(this.server_id, "Server", id, "YOUR_INFO");
    ws.send(JSON.stringify(msg));
  }

  sendToUser(id, message, clientSender) {
    //Sends the message to a specific Id user
    var clients = this.roomManager.getClientsInRoom(clientSender);
    for (let client of clients) {
      if (client.user.id == id) {
        client.WSserver.send(JSON.stringify(message));
      }
    }
  }

  async checkLoginInfo(client, user, password) {
    // Check if the user is in the database
    // Check if the password is correct
    // Return true if the user is valid, false otherwise
    try {
      var response = {};
      var validUser = false;
      var accessToken = null;
      var user = await this.db.validateUserInfo(user, password);
      if (user) {
        validUser = true; // UserInfo is valid
        // Create Access Token and include it in the response
        const accessToken = jsonwebtoken.sign(
          { id: user.id, username: user.username },
          process.env.ACCESS_TOKEN_SECRET, // TODO: change to a more secure secret
          { expiresIn: "1h" }
        );
      }

      response.verified = validUser;
      response.accessToken = accessToken;

      var login_msg = new Msg(this.server_id, "Server", response, "LOGIN");
      client.WSserver.send(JSON.stringify(login_msg));
    } catch (err) {
      console.log("Error getting user: " + err);
    }
  }

  registerUser(client, username, password) {
    this.db.addUser(username, password);
    // Check if User is sucessfully added and send Client
    this.db.validateUserInfo(username).then((response) => {
      var register_msg = new Msg(
        this.server_id,
        "Server",
        response,
        "REGISTER"
      );
      client.WSserver.send(JSON.stringify(register_msg));
    });
  }

  sendToRoom(Client, message) {
    // Send the message to all other clients in the room
    var clients = this.roomManager.getClientsInRoom(Client);
    for (let otherClient of clients) {
      if (otherClient.user.id != Client.user.id) {
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
    var msg = new Msg(this.server_id, "Server", Client.user, "USER_LEFT");
    this.sendToRoom(Client, msg);
  }

  sendUsersOfRoom(newClient) {
    //send the info about all people connected to the new user
    var clients = this.roomManager.getClientsInRoom(newClient);
    for (let client of clients) {
      if (client.user.id != newClient.user.id) {
        var msg = new Msg(this.server_id, "Server", client.user, "USER_JOIN");
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

  //sendHistory of messages
  async sendMsgHistory(client, room) {
    try {
      // Get the message history from the database
      // Array of messages with message_id, user_id, room_id, message, type and timestamp
      var msg_history = await this.getData("messages", room);

      // Send the message history to the client in the Msg object
      for (let row of msg_history) {
        console.log("Sending message history to client: " + row.user_name);
        var msg = new Msg(row.user_id, row.user_name, row.message, row.type);
        client.WSserver.send(JSON.stringify(msg));
      }
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

  //TODO we should integrate functions below
  async getData(info, room = null) {
    return await this.db.retrieveData(info, room);
  } // Linking to the database
}
export default MyServer;
