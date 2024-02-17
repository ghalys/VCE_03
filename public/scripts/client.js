import { Msg, User } from './classes.js';



class ServerClient{
  constructor(url,roomname, username) {
    this.url = url;
    this.socket = null;
    this.is_connected = false;
    this.room = { name: "", clients:[], updated: false };
    this.clients = {};
    this.num_clients = 0;
    this.info_transmitted = 0;
    this.info_received = 0;
    this.activeUsers = [];
    this.active_room = roomname;

    this.user_id = -2;
    this.username = username;
    this.on_connect = null; //when connected
    this.on_ready = null; //when we have an ID from the server
    this.on_message = null; //when somebody sends a message
    this.on_close = null; //when the server closes
    this.on_user_connected = null; //new user connected
    this.on_user_disconnected = null; //user leaves
    this.on_chat_historic = null; //when the historic of the chat is sent by the server
    this.on_error = null; //when cannot connect
  }

  connect_socket(){
    this.socket = new WebSocket(`${this.url}?username=${encodeURIComponent(this.username)}&roomname=${encodeURIComponent(this.active_room)}`);

    this.socket.onopen = (event) => this.onOpen(event);
    this.socket.onmessage = (event) => this.onData(event);
    this.socket.onclose = (event) => this.onClose(event);

  }
  
  send_message(message){
      //Sends the message to the server
      var msg_json = JSON.stringify(message);
      this.socket.send(msg_json);
      this.info_transmitted++;
    }
  
  onData(ws_message){
    //when the client receive a message from the server
    this.info_received++;
    var msg = JSON.parse(ws_message.data);
    var message = new Msg(msg.id, msg.author, msg.content, msg.type, msg.time);

    switch(message.type)
    {
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
    }   
  };

  onOpen(){
    //When the user is connected
    this.is_connected = true;
    console.log("Connected!");
  };

  setMyRoom(message){
    //TODO we should use it somewhere. Maybe we should also define a new user which retrieve only the rooms which are present for the RoomSelection html. 
    var rooms = message.content;
    console.log("I received the info about the room",message.content);

  }

  onClose(){
    //When the connection is closed
    this.is_connected = false;

    //try to reconnect if we were disconnected
    setTimeout(this.connect_socket(),3000);
    console.log("we were disconnected to the server");
  };

  onUserJoin(message){
    //When a new user join the room

    // var id = message.id;
    // // Add user to active users list if it is not already there
    
    var newUser = message.content;
    var id = newUser.id;
    
    var user_exists = false;
    for (var user in this.activeUsers) {
      if (this.activeUsers[user].id == id) {
        var user_exists = true;
      }
    }
    if (!user_exists) {
      this.activeUsers.push(newUser);
    }

    this.on_user_connected(id);
  }

  onUserLeft(message){
    //When an user quit the room

    var user = message.content;
    var id = user.id;

    // Change user status from active users list
    for (var user in this.activeUsers) {
      if (this.activeUsers[user].id == id) {
        this.activeUsers[user].status = "offline";
        this.activeUsers[user].time = message.time;
      }
    }
    this.on_user_disconnected(id);

  }

  setMyUser(message){
    // Storing the information of the user in the device object
    this.user_id = message.content;
    this.on_ready()
    // Send status update to all users in the room
    // this.sendStatusUpdate(id, this.device.username, "I joined the room");
  }
}
export default ServerClient;



