import Msg from "../Chat/message_class.js";
import ServerClient from "./serverClient.js";

export default class MyChat {
  constructor() {
    this.root = null;
    this.server = null;
    this.current_room_name = null;
    this.user_id = null;
    this.my_username = null;
    this.myWorld = null;
    this.flag = null;
  }

  init(testingLocally, username, myWorld, roomname = "Hall", flag = "es") {
    var ourPort = "9022";
    var ourUrl = testingLocally
                  ? "ws://localhost:9022"
                  : "wss://ecv-etic.upf.edu/node/" + ourPort + "/ws/";
  
    this.server = new ServerClient(ourUrl, roomname, username);

    // Set the username and the world
    this.my_username = username;
    this.myWorld = myWorld;
    this.myWorld.server = this.server;

    // Set the name of the room
    this.current_room_name = roomname;

    this.flag = flag;
    // Set the icon of the user
    // this.setUserIcon(icon); //TODO - we should fix the icon or remove it

    this.server.on_message = (message) => {
      this.showMessage(message);
    };

    this.server.on_ready = () => {
      //this function is called after that the server has sent the id to the client
      this.user_id = this.server.user_id;
      //set the Id of my agent and the client server in myWorld
      this.myWorld.set_ID_and_Server(this.server);
      //send my agent to the server to create a instance of client there
      this.server.sendAgent(this.myWorld.myAgent.sendJSON()); //We cannot send all the agent because there is a circular structure and it's not efficient

      //start onTick in myWorld
      this.myWorld.initialisation();
    };
    this.server.on_state_update = (state) => {
      this.myWorld.addOrUpdateAgent(state);
    };

    this.server.on_user_connected = (agent) => {
      // Update active users display
      // this.displayActiveUsers();//TODO - to fix display active users to see who is in the room

      this.myWorld.addOrUpdateAgent(agent);
    };

    this.server.on_user_disconnected = (agent) => {
      // Update active users display
      // this.displayActiveUsers(); //TODO -

      this.myWorld.removeAgent(agent);
    };

    this.server.connect_socket();

    this.on_chat_historic = (messages) => {};
  }

  changeRoom(room){
    console.log("change of room send to the server");
    var new_message = new Msg(
      this.user_id,
      this.my_username,
      room,
      "CHANGE_ROOM"
    );
    this.sendMessage(new_message);
  }
  
  setFlag(flag){
    this.flag = flag;
    console.log("neeeeew flag"+flag);
  }

  // Displaying messages in the chat
  showMessage(msg) {
    var messageDiv = document.createElement("div");
    if (msg.author == this.my_username) {
      messageDiv.className = "mycontent";
    } else {
      messageDiv.className = "msg";
    }

    var authorP = document.createElement("p");
    authorP.className = "author";

    var contentP = document.createElement("p");
    contentP.className = "content";

    var timeP = document.createElement("p");
    timeP.className = "time";
    if (msg.content.includes("#")) {
      var parts = msg.content.split("#");
      var flag = parts[0];
      var msgContent = parts[1];
    }
    else{
      var flag = null;
      var msgContent = msg.content;
    }

    if(flag !=null){
      let flagImg = document.createElement('img');
      flagImg.src = "media/flags/"+flag+".png";
      flagImg.alt = 'Flag';
      flagImg.style.width = '20px'; // Adjust the size as needed
      flagImg.style.height = '20px'; // Adjust the size as needed
      flagImg.style.marginRight = '5px'; // Adds a little space between the flag and the text
      authorP.textContent = msg.author+" ";
      authorP.appendChild(flagImg);
    }
    else{
      authorP.textContent = msg.author+ " ";
    }

    contentP.textContent = msgContent;
    timeP.textContent = msg.time;

    // Append elements to the message div

    messageDiv.appendChild(authorP);
    messageDiv.appendChild(contentP);
    messageDiv.appendChild(timeP);
    this.root.appendChild(messageDiv);
    document.getElementById('mychat').scrollTop = 10000000; //Scroll to bottom
  }

  // Sending messages
  sendMessage(msg, id) {
    // we precise the destination if there is an Id
    if (id == undefined) {
      msg.destination = "room";
    } else {
      msg.destination = id;
    }
    this.server.send_message(msg);
  }

  //Display the updated active users list
  displayActiveUsers() {
    // Clearing user list
    document.getElementById("user-list").innerHTML = "";

    var active_users = this.server.activeUsers;

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
      user_status.textContent = active_users[user].status + " since " + active_users[user].time;

      user_div.appendChild(user_name);
      user_div.appendChild(user_status);

      document.getElementById("user-list").appendChild(user_div);
    }
  }

  // Creating chat interface
  create(container) {
    var elem = document.createElement("div");
    elem.className = "msgs";
    container.appendChild(elem);

    //send message when the keydown button is pressed
    var input = document.querySelector("input.chat");
    input.addEventListener("keydown", (e) => {
      if (e.code == "Enter") {
        this.send_input(input);
      }
    });

    //send message when the sendButton is clicked
    const button = document.getElementById("sendButton");
    button.addEventListener("click", () => {
      this.send_input(input);
    });

    this.root = elem;
  }

  //send the input
  send_input(input) {
    if (input.value != "") {
      var new_message = new Msg(
        this.user_id,
        this.my_username,
        this.flag+"#"+input.value,
        "TEXT",
        "room"
      );
      this.showMessage(new_message);
      this.sendMessage(new_message);
      input.value = "";
    }
  }
}
