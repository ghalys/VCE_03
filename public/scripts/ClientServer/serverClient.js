import Msg from "../Chat/message_class.js";

class ServerClient {
  constructor(url, roomname, username) {
    this.url = url;
    this.socket = null;
    this.is_connected = false;
    this.clients = {};
    this.num_clients = 0;
    this.info_transmitted = 0;
    this.info_received = 0;
    this.activeUsers = [];
    this.roomname = roomname;
    this.user_id = -2;
    this.username = username;
    this.on_connect = null; //when connected
    this.on_ready = null; //when we have an ID from the server
    this.on_message = null; //when we receive a message
    this.on_state_update = null; //when we receive a agent state update
    this.on_close = null; //when the server closes
    this.on_user_connected = null; //new user connected
    this.on_user_disconnected = null; //user leaves
    this.on_chat_historic = null; //when the historic of the chat is sent by the server
    this.on_error = null; //when cannot connect
    this.onMusic = null;
  }

  connect_socket() {
    this.socket = new WebSocket(
      `${this.url}?roomname=${encodeURIComponent(this.roomname)}`
    );

    this.socket.onopen = (event) => this.onOpen(event);
    this.socket.onmessage = (event) => this.onData(event);
    this.socket.onclose = (event) => this.onClose(event);
  }

  send_message(message) {
    //Sends the message to the server
    var msg_json = JSON.stringify(message);
    this.socket.send(msg_json);
    this.info_transmitted++;
  }

  onData(ws_message) {
    //when the client receive a message from the server
    this.info_received++;
    try {
      
    var msg = JSON.parse(ws_message.data);
    var message = new Msg(
      msg.id,
      msg.author,
      msg.content,
      msg.type,
      msg.destination,
      msg.time
    );

    switch (message.type) {
      case "YOUR_INFO":
        this.setMyUser(message);
        break;
      case "TEXT":
        this.on_message(message);
        break;
      case "ROOM_INFO":
        this.setMyRoom(message);
        break;
      case "USER_JOIN":
        this.onUserJoin(message);
        break;
      case "USER_LEFT":
        this.onUserLeft(message);
        break;
      case "AGENT_STATE":
        this.onAgentState(message);
      case "NEW_AGENT":
        this.onAgentState(message); //TODO - 
    }
  } catch (error) {
    var audio_file = ws_message;
    console.log("audio_received");
    var blob = new Blob([audio_file], { type: 'audio/mpeg' });
    var url = URL.createObjectURL(blob);
    this.onMusic(url);
  }
  
  }

  onOpen() {
    //When the user is connected
    this.is_connected = true;
    console.log("Client Connected!");
  }

  setMyRoom(message) {
    //TODO we should use "ROOM_INFO" to get the information about all rooms present 
    var rooms = message.content;
    console.log("I received the info about the room", message.content);
  }

  onClose() {
    //When the connection is closed
    this.is_connected = false;


    console.log("we were disconnected to the server");
    //try to reconnect if we were disconnected
    setTimeout(this.connect_socket(), 3000);
  }

  onUserJoin(message) {
    //When a new user join the room

    // // Add user to active users list if it is not already there

    var newUser = message.content;

    var id = newUser.id;

    //TODO - to remove ??
    var user_exists = false;
    for (var user in this.activeUsers) {
      if (this.activeUsers[user].id == id) {
        var user_exists = true;
      }
    }
    if (!user_exists) {
      this.activeUsers.push(newUser);
    }

    var newAgent = newUser.agent;
    this.on_user_connected(newAgent);
  }

  onUserLeft(message) {
    //When an user quit the room

    var user = message.content;

    // var id = user.id;
    // Change user status from active users list
    // for (var USER in this.activeUsers) {
    //   if (this.activeUsers[USER].id == id) {
    //     this.activeUsers[USER].status = "offline";
    //     this.activeUsers[USER].time = message.time;
    //   }
    // }

    var agent = user.agent;
    this.on_user_disconnected(agent);
  }

  setMyUser(message) {
    // Storing the information of the user in the device object
    this.user_id = message.content;
    this.on_ready();
    // Send status update to all users in the room
    // this.sendStatusUpdate(id, this.device.username, "I joined the room");
  }

  onAgentState(message) {
    //the state present in the content is processed by myWorld
    //see Mychat
    this.on_state_update(message.content);
  }

  sendAgentState(state) {
    var msg = new Msg(this.user_id, this.username, state, "AGENT_STATE");
    this.send_message(msg);
  }

  sendMusicFile(music){
    console.log(music);
    this.socket.send(music);
  }


  sendAgent(agent) {
    var msg = new Msg(this.user_id, this.username, agent, "NEW_AGENT");
    this.send_message(msg);
  }
}
export default ServerClient;
