class Msg {
  constructor(id, author, content, type, time) {
    this.id = id;
    this.author = author;
    this.content = content;
    this.type = type;
    this.time = time;
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
    this.server = null;
    this.history = [];
    this.current_room_name = null;
    this.activeUsers = [];
    this.device = {};
  }

  //Connect to chat server
  connect(url, roomname, username, icon = "face") {
    this.server = new SillyClient();
    this.current_room_name = roomname;

    this.server.connect(url, roomname);

    this.server.on_connect = () => {
      console.log("Connected!");
    };

    this.server.on_ready = (id) => {
      console.log("Ready!");
      console.log("My id is " + id);

      // Storing the information of the user in the device object
      this.device.id = id;
      this.device.username = username;
      this.device.icon = icon;

      //Send status update to all users in the room
      this.sendStatusUpdate(id, username, "I joined the room");

      // Set the name of the room
      this.setRoomName(roomname);

      // Set the icon of the user
      this.setUserIcon(icon);
    };

    this.server.on_error = (err) => {
      console.log("Error: " + err);
    };

    //Gets invoked when a message is received
    this.server.on_message = (id, msg) => {
      console.log("A message was received");

      //Check if the message is a JSON string
      if (isJSONString(msg)) {
        console.log("JSON string received");
        console.log(msg);
        var msg = JSON.parse(msg);
        var new_message = new Msg(msg.id, msg.author, msg.content, msg.type, msg.time);
        switch (msg.type) {
          case "text":
            this.showMessage(new_message);
            this.history.push(new_message);
            break;
          case "status-update":
            if (msg.content.includes("joined")) {
              // Add user to active users list if it is not already there
              var user_exists = false;
              for (var user in this.activeUsers) {
                if (this.activeUsers[user].id == msg.id) {
                  var user_exists = true;
                }
              }
              if (!user_exists) {
                var new_user = new User(msg.id, msg.author, "online", msg.time);
                this.activeUsers.push(new_user);
              }

              // Update active users display
              this.getActiveUsers();
            } else if (msg.content.includes("disconnected")) {
              // Change user status from active users list

              for (var user in this.activeUsers) {
                if (this.activeUsers[user].id == msg.id) {
                  this.activeUsers[user].status = "offline";
                  this.activeUsers[user].time = msg.time;
                }
              }
              // Update active users display
              this.getActiveUsers();
            }
            break;
        }
      } else {
        console.log("Text message received");
        console.log(msg);
        var new_message = new Msg(
          id,
          "unknown",
          msg,
          "text",
          new Date().toLocaleTimeString()
        );
      }
    };

    this.server.on_user_disconnected = (id) => {
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

    this.server.on_user_connected = (id) => {
      console.log("A new User connected");

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
  }

  //Sending status updates to all or specific users
  sendStatusUpdate(id, username, status, specific_user = null) {
    var status_update = new Msg(
      id,
      username,
      status,
      "status-update",
      new Date().toLocaleTimeString()
    );
    var status_update_json = JSON.stringify(status_update);
    if (specific_user != null) {
      this.sendMessage(status_update_json, specific_user);
    } else {
      this.sendMessage(status_update_json);
    }
  }

  //Displaying messages in the chat
  showMessage(Msg) {
    var messageDiv = document.createElement("div");
    messageDiv.className = "msg";

    var authorP = document.createElement("p");
    authorP.className = "author";

    var contentP = document.createElement("p");
    contentP.className = "content";

    var timeP = document.createElement("p");
    timeP.className = "time";

    authorP.textContent = Msg.author;
    contentP.textContent = Msg.content;
    timeP.textContent = Msg.time;

    //Append elements to the message div
    messageDiv.appendChild(authorP);
    messageDiv.appendChild(contentP);
    messageDiv.appendChild(timeP);

    this.root.querySelector(".msgs").appendChild(messageDiv);
    this.root.querySelector(".msgs").scrollTop = 10000000; //Scroll to bottom
  }

  //Sending messages
  sendMessage(msg) {
    this.server.sendMessage(msg);
  }

  //Setting room name
  setRoomName(roomname) {
    document.getElementById("room-name-header").textContent = roomname;
  }

  //Setting user icon
  setUserIcon(icon) {
    document.getElementById("user-icon").innerHTML = icon;
    // Make icon size bigger
    document.getElementById("user-icon").style.fontSize = "40px";
  }

  //Sending history to new users
  sendHistory(id) {
    // Sending the new user the history of the chat
    for (var i = 0; i < this.history.length; i++) {
      var msg = this.history[i];
      var msg_json = JSON.stringify(msg);
      this.server.sendMessage(msg_json, id);
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
        var new_message = new Msg(
          this.device.id,
          this.device.username,
          input.value,
          "text",
          new Date().toLocaleTimeString()
        );

        var msg_json = JSON.stringify(new_message);

        this.history.push(new_message);
        this.showMessage(new_message);
        this.sendMessage(msg_json);
        input.value = "";
      }
    });
    this.root = elem;
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
    console.log("The selected room is: " + room);
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
  FelixChat.connect(
    "wss://ecv-etic.upf.edu/node/9000/ws/",
    room,
    username,
    icon
  );

  //Display chat page
  document.getElementById("login-page").style.display = "none";
  document.getElementById("chat-page").style.display = "block";
}
