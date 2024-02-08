import { Msg, User } from './Msg_User.js';



class ServerClient
{
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
    // this.history = [];



    this.user_id = 0;
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
    this.socket = new WebSocket(this.url);
    this.socket.onopen=this.onOpen;
    this.socket.onmessage = this.onData;
    this.socket.onclose = this.onClose;
    // this.socket.onerror = this.onError;
  }
  
  send_message(message){
      var msg_json = JSON.stringify(message);
      this.socket.send(msg_json);
      this.history.push(msg_json)
    }
    
  

  //when the client receive data from the server
  onData(ws_message){
    var msg = JSON.parse(ws_message.data);
    var message = new Msg(msg.id, msg.author, msg.content, msg.type, msg.time);

    switch(message.type)
    {
      case "YOUR_INFO":
          this.setMyUser(message);
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
      case "TEXT":
          this.on_message(message);
          break;
    //   case "history":
    //       this.set_history(message);
    }   
  };

  onOpen(){
    console.log("Connecting!");
  };
  setMyRoom(){
  }

  onClose(){
    console.log("we were disconnected to the server");
    //try to reconnect if we were disconnected
    setTimeout(connect_socket(url),3000);
  };

  onUserJoin(message){
    var id = message.id;

    // Add user to active users list if it is not already there
    var user_exists = false;
    for (var user in this.activeUsers) {
      if (this.activeUsers[user].id == id) {
        var user_exists = true;
      }
    }
    if (!user_exists) {
      var new_user = new User(id, message.author, "online", message.time);
      this.activeUsers.push(new_user);
    }
    this.on_user_connected(id);
  }

  onUserLeft(message){
    var id = message.id;

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
    id = message.content;
    // Storing the information of the user in the device object
    this.user_id = id;

    this.on_ready(id)
    // Send status update to all users in the room
    // this.sendStatusUpdate(id, this.device.username, "I joined the room");
  }
}


