import {Msg,User} from './classes.js';
import ServerClient from './client.js';

class MyChat {
  constructor() {
    this.root = null;
    this.server = null;
    this.current_room_name = null;
    this.user_id = null;
    this.my_username = null;
    this.my_icon = null;
    this.myWorld = null;
  }
  
  init(url, username, myWorld, roomname="hall",icon = "face"){       
    this.server = new ServerClient(url,roomname,username);

    // Set the username and the world
    this.my_username = username;
    this.myWorld = myWorld;
    myWorld.server = this.server;
    
    // Set the name of the room
    this.current_room_name = roomname;
    document.getElementById("room-name-header").textContent = roomname;
    
    // Set the icon of the user
    // this.setUserIcon(icon); //TODO - we should fix the icon or remove it

    
    
    this.server.on_message=(message)=>{
      this.showMessage(message);
    }

    
    this.server.on_ready = ()=>{
      //this function is called after that the server has sent the id to the client
      this.user_id = this.server.user_id; 
      //set the Id of my agent in myWorld
      this.myWorld.set_ID(this.server.user_id);
      //send my agent to the server to create a instance of client there
      this.server.sendAgent(this.myWorld.myAgent);    
      //start onTick in myWorld
      this.myWorld.initialisation();

    }
    this.server.on_state_update = (state)=>{
      this.myWorld.receivedJSON(state);
    }
    
    this.server.on_user_connected = (agent)=>{
      // Update active users display
      this.displayActiveUsers();
      this.myWorld.addOrUpdateAgent(agent);

    }
    
    this.server.on_user_disconnected = (agent)=>{
      // Update active users display
      this.displayActiveUsers();
      this.myWorld.removeAgent(agent);

    }
    
    this.server.connect_socket();
    
    this.on_chat_historic=(messages)=>{
    }
  };
  
  //Setting user icon
  setUserIcon(icon) {
    this.my_icon = icon;
    document.getElementById("user-icon").innerHTML = icon;
    // Make icon size bigger
    document.getElementById("user-icon").style.fontSize = "40px";
  }
  
  // Displaying messages in the chat
  showMessage(msg) {
    var messageDiv = document.createElement("div");
    if(msg.id == this.user_id){
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

    authorP.textContent = msg.author;
    contentP.textContent = msg.content;
    timeP.textContent = msg.time;

    // Append elements to the message div

    messageDiv.appendChild(authorP);
    messageDiv.appendChild(contentP);
    messageDiv.appendChild(timeP);

    this.root.querySelector(".msgs").appendChild(messageDiv);
    this.root.querySelector(".msgs").scrollTop = 10000000; //Scroll to bottom
  }

  // Sending messages
  sendMessage(msg,id) {
    // we precise the destination if there is an Id
    if(id==undefined){
      msg.destination = "room";
    }
    else{
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
    
    //send message when the keydown button is pressed
    var input = document.querySelector("input.chat");
    input.addEventListener("keydown", (e) => {
      if (e.code == "Enter") {
        this.send_input(input);
    }});

    //send message when the sendButton is clicked    
    const button = document.getElementById("sendButton");
    button.addEventListener("click", () => {
      this.send_input(input);
    });

    this.root = elem;
  }
  
  //send the input 
  //TODO is it not better to specify the room with this.current_room_name? In this case we will not need a loop to get the room. but if we do so, we should imagine how to send a message to a specific user
  send_input(input){
    if (input.value!=""){
      var new_message = new Msg(
        this.user_id,
        this.my_username,
        input.value,
        "TEXT",
        "room",
        );
        this.showMessage(new_message);
        this.sendMessage(new_message);
        input.value = "";
      } 
    }
}
export default MyChat;
