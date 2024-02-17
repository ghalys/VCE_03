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
  }
  
  init(url, roomname, username, icon = "face"){       
    this.server = new ServerClient(url,roomname,username);

    // Set the username and the id 
    this.my_username = username;
    
    // Set the name of the room
    this.current_room_name = roomname;
    document.getElementById("room-name-header").textContent = roomname;
    
    // Set the icon of the user
    this.setUserIcon(icon);
    
    this.server.on_message=(message)=>{
      this.showMessage(message);
    }
    
    this.server.on_ready = ()=>{
      this.user_id = this.server.user_id;
    }
    
    this.server.on_user_connected = (id)=>{
      // Update active users display
      this.displayActiveUsers();
    }
    
    this.server.on_user_disconnected = (id)=>{
      // Update active users display
      this.displayActiveUsers();
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
    if(id!==undefined){
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
  send_input(input){
    if (input.value!=""){
      var new_message = new Msg(
        this.user_id,
        this.my_username,
        input.value,
        "TEXT",
        new Date().toLocaleTimeString(),
        this.current_room_name,
        null
        );
        this.showMessage(new_message);
        this.sendMessage(new_message);
        input.value = "";
      } 
    }
}
export default MyChat;
