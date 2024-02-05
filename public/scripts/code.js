var ourPort = "9022";
var ourUrl = "wss://ecv-etic.upf.edu/node/"+ourPort+"/ws/";

class Msg {
  constructor() {
    this.id = null;
    this.author = null;
    this.content = null;
    this.type = null;
    this.time = null;
  }
}

class User {
  constructor(id, username, status, time) {
    this.id = id;
    this.username = username;
    this.status = status;
    this.time = time;
  }
}

class MyChat {
  constructor() {
    this.root = null;
    this.socket = null;
    // this.history = [];
    this.current_room_name = null;
    // this.activeUsers = [];
    this.device = {};
  }

  init(url, roomname, username, icon = "face"){   
    this.connect_socket(url);
    // Set the username
    this.setUsername(username);
    // Set the name of the room
    this.setRoomName(roomname);
    // Set the icon of the user
    this.setUserIcon(icon);
  };

  connect_socket(url){
    this.socket = new WebSocket(url);
    this.socket.onopen=this.onOpen();
    this.socket.onmessage = this.onMessage();
    this.socket.onclose = this.onClose();
  }

  onOpen(){
    console.log("Connecting!");
  };

  onClose(){
    //try to reconnect if we were disconnected
    setTimeout(connect_socket(url),3000);
  };
  
  //when the client receive a message 
  onMessage(ws_message){
    var msg = JSON.parse(ws_message.data);
    var message = new Msg(msg.id, msg.author, msg.content, msg.type, msg.time);

    switch(message.type)
    {
      // case "ROOM":
      //     this.setRoom(message);
      //     break;
      case "YOUR_INFO":
          this.setMyUser(message);
          break;
      case "USER_JOIN":
          this.onUserJoin(message);
          break;
      case "USER_LEFT":
          this.onUserLeft(message);
          break;
      case "text":
          this.onMessageReceived(message);
          break;
    }        
  };

  setMyUser(message){
    id = message.content;
    // Storing the information of the user in the device object
    this.device.id = id;
    // Send status update to all users in the room
    this.sendStatusUpdate(id, this.device.username, "I joined the room");
  }

  // Save the message in the data base
  saveMessage(message){
  }

  // Connect to chat server
  onMessageReceived(message) {
    this.showMessage(message);
    this.saveMessage(message);
  }

  onUserJoin(message){
    // Add user to active users list if it is not already there
    var user_exists = false;
    for (var user in this.activeUsers) {
      if (this.activeUsers[user].id == msg.id) {
        var user_exists = true;
      }
    }
    if (!user_exists) {
      var new_user = new User(message.id, message.author, "online", message.time);
      this.activeUsers.push(new_user);
    }

    // Update active users display
    this.getActiveUsers();
  }

  onUserLeft(message){
    // Change user status from active users list

    for (var user in this.activeUsers) {
      if (this.activeUsers[user].id == message.id) {
        this.activeUsers[user].status = "offline";
        this.activeUsers[user].time = message.time;
      }
    }
    // Update active users display
    this.getActiveUsers();
  }

  
  //from silly_server_code
/////////////////////////////////////////////////////////////////////////////
  on_user_connected(id){
    //choose the user who will send the historic of the chat
    let mailcarrier = Object.keys(this.server.clients)[0];
    if(this.device.id == mailcarrier){
      this.sendHistory(id);
    }
    // Send the new user our status information
    this.sendStatusUpdate(
      this.device.id,
      this.device.username,
      "User joined",
      id
    );
  };
  //from silly_server_code
  on_user_disconnected (id){
    // Send status update to all users in the room

    // Find the username of the user that disconnected
    var temp_username = "unknown";

    for (var user in this.activeUsers) {
      if (this.activeUsers[user].id == id) {
        var temp_username = this.activeUsers[user].username;
      }
    }

    // Send status update to all users in the room and update active users list
    this.sendStatusUpdate(id, temp_username, "User disconnected");
  };
  ///////////////////////////////////////////////////////////////////////////////////////
  

  // Sending status updates to all or specific users
  sendStatusUpdate(id, username, status, specific_user = null) {
    var status_update = new Msg(

      id,
      username,
      status,
      "status-update",
      new Date().toLocaleTimeString()
    );
    if (specific_user != null) {
      this.sendMessage(status_update, specific_user);
    } else {
      this.sendMessage(status_update);
    }
  }

  // Displaying messages in the chat
  showMessage(Msg) {
    var messageDiv = document.createElement("div");
    if(Msg.id == this.device.id){
      messageDiv.className ="mycontent";
    }
    else{
      messageDiv.className = "msg";
    }


    var authorP = document.createElement("p");
    authorP.className = "author";

    var contentP = document.createElement("p");
    contentP.className = "content";

    var timeP = document.createElement("p");
    timeP.className = "time";

    authorP.textContent = Msg.author;
    contentP.textContent = Msg.content;
    timeP.textContent = Msg.time;


    // Append elements to the message div

    messageDiv.appendChild(authorP);
    messageDiv.appendChild(contentP);
    messageDiv.appendChild(timeP);

    this.root.querySelector(".msgs").appendChild(messageDiv);
    this.root.querySelector(".msgs").scrollTop = 10000000; //Scroll to bottom
  }

  // Sending messages
  sendMessage(msg,id) {
    var msg_json = JSON.stringify(msg);
    if(id!==undefined){
      // this.socket.sendMessage(msg_json,id); //to Id only
    }
    else{
      this.socket.send(msg); //to all
    }
  }

  //Setting username
  setUsername(username){
    this.device.username = username;
  }
  //Setting room name
  setRoomName(roomname) {
    this.current_room_name = roomname;

    document.getElementById("room-name-header").textContent = roomname;
  }

  //Setting user icon
  setUserIcon(icon) {
    this.device.icon = icon;
    document.getElementById("user-icon").innerHTML = icon;
    // Make icon size bigger
    document.getElementById("user-icon").style.fontSize = "40px";
  }

  //Sending history to new users
  sendHistory(id) {
    // Sending the new user the history of the chat
    for (var i = 0; i < this.history.length; i++) {
      var msg = this.history[i];
      this.sendMessage(msg, id);
    }
  }

  //Getting active users
  getActiveUsers() {
    // Clearing user list
    document.getElementById("user-list").innerHTML = "";

    var active_users = this.activeUsers;

    for (var user in active_users) {
      // Creating user div
      var user_div = document.createElement("div");
      user_div.className = "single_user";
      user_div.id = active_users[user].id;

      // Creating user name and status html elements
      var user_name = document.createElement("p");
      user_name.className = "user_name";
      user_name.textContent = active_users[user].username;

      var user_status = document.createElement("p");
      user_status.className = "user_status";
      user_status.textContent =
        active_users[user].status + " since " + active_users[user].time;

      user_div.appendChild(user_name);
      user_div.appendChild(user_status);

      document.getElementById("user-list").appendChild(user_div);
    }
  }

  // Creating chat interface
  create(container) {
    var elem = document.createElement("div");
    elem.innerHTML = " <div class='msgs'> </div>";
    container.appendChild(elem);

    var input = document.querySelector("input.chat");
    input.addEventListener("keydown", (e) => {
      if (e.code == "Enter") {
        this.send_input(input);
    }});
    
    const button = document.getElementById("sendButton");
    button.addEventListener("click", () => {
      this.send_input(input);
    });

    this.root = elem;
  }

  //send_input
  send_input(input){
    if (input.value!=""){
      var new_message = new Msg(
        this.device.id,
        this.device.username,
        input.value,
        "text",
        new Date().toLocaleTimeString()
        );
      this.showMessage(new_message);
      this.saveMessage(new_message);
      this.sendMessage(new_message);
      input.value = "";
    } 
  }
}



function isJSONString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}


var FelixChat = new MyChat();

FelixChat.create(document.querySelector("#mychat"));

//Managing Login and Room selection
//Connecting to another instance for getting the list of rooms

async function getRooms() {
  var server = new SillyClient();
  server.connect("wss://ecv-etic.upf.edu/node/9000/ws/");
  var report = await server.getReport();
  var rooms = report.rooms;
  //Add rooms to the selection list
  for (var i in rooms) {
    var room = i;
    var activeUsers = rooms[i];
    var option = document.createElement("option");
    option.value = room;
    option.innerHTML = room + " (" + activeUsers + ")";
    document.getElementById("room-list").appendChild(option);
  }
}

//Displaying all existing rooms
getRooms();

//Submitting Login and Room selection
document
  .getElementById("login-button")
  .addEventListener("click", connectToChat);

function connectToChat() {
  if (document.getElementById("room-name").value == "") {
    var element = document.getElementById("room-list");
    var selectedOption = element.options[element.selectedIndex];
    var room = selectedOption.value;

  } else {
    var room = document.getElementById("room-name").value;
  }

  var username = document.getElementById("username").value;

  var icon_list = document.getElementById("icon_list");
  var selected_icon = icon_list.options[icon_list.selectedIndex];
  var icon = selected_icon.value;

  //Clear inputs for next login
  document.getElementById("username").value = "";
  document.getElementById("room-name").value = "";

  //Connect to chat
  FelixChat.init(

    "wss://ecv-etic.upf.edu/node/9000/ws/",
    room,
    username,
    icon
  );

  //Display chat page
  document.getElementById("login-page").style.display = "none";
  document.getElementById("chat-page").style.display = "block";
}
