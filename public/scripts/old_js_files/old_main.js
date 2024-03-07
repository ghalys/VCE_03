// import MyChat from "../ClientServer/myChat.js";
// import World  from "../World/world.js";
// import Agent  from "../World/agent_class.js";
import {testingLocally} from "../testing.js";

const username = document.cookie.split('; ').find(row => row.startsWith('username='))?.split('=')[1];
const password = document.cookie.split('; ').find(row => row.startsWith('password='))?.split('=')[1];

var room = "hall";
document.getElementById("room-name-header").textContent = "hall";


var canvas = document.querySelector("canvas");
var myAgent = new Agent(-2, username); // 2 is a temporary Id
var myWorld = new World(myAgent, canvas);
var FelixChat = new MyChat();
FelixChat.create(document.getElementById("mychat"));
FelixChat.init(testingLocally, username, myWorld);

// Changing the Room
document.getElementById("login-button").addEventListener("click", goToRoom);
document.getElementById("returnToTheHall").addEventListener("click",returnToTheHall);

function returnToTheHall(){
  room = "hall";
  change_room(room);
  
  //Display hall with room page
  document.getElementById("room-page").style.display = "flex";
  document.getElementById("chat-window").style.display = "none";
}

function goToRoom(){
  //select the name of the new room
  if (document.getElementById("room-name").value == "") {
    var element = document.getElementById("room-list");
    var selectedOption = element.options[element.selectedIndex];
    room = selectedOption.value;
  } 
  else {
    room = document.getElementById("room-name").value;
  }
  document.getElementById("room-name").value = "";
  change_room(room);
  
  //Display chat page
  document.getElementById("room-page").style.display = "none";
  document.getElementById("chat-window").style.display = "flex";
}

function change_room(room){
  myWorld.leaveTheRoom();

  //clean the chat
  document.querySelector(".msgs").innerHTML = "";
  //send to the server a message informing it that the user changed the room
  FelixChat.changeRoom(room);
  document.getElementById("room-name-header").textContent = room;

}



//here we can store the keyboard state
var keys = {};
//here we can store the mouse position and state
var mouse_pos = [0, 0];
var mouse_buttons = 0;
var mouse_clicked = false;

function Listeners() {
  function onKeyDown(event) {
    //process key down event
    //mark it as being pressed
    keys[event.key] = true;
  }
  
  function onKeyUp(event) {
    //process key up event
    //mark it as being released
    keys[event.key] = false;
  }
  document.body.addEventListener("keydown", onKeyDown);
  document.body.addEventListener("keyup", onKeyUp);
  
  function onMouse(e) {
    mouse_buttons = e.buttons;
    // if(mouse_buttons ==1){
      if (e.type == "mousedown") {
      var rect = canvas.parentNode.getBoundingClientRect();
      mouse_pos[0] = (e.clientX - rect.left) / 2 - canvas.width / 4;
      mouse_pos[1] = (e.clientY - rect.top) / 2 - canvas.height * (1 / 3);
      mouse_clicked = true; // it records the last position when the mouse is clicked
    } else if (e.type == "mouseup") {
      mouse_clicked = false;
    }
    // }
  }
  canvas.addEventListener("mousedown", onMouse);
  canvas.addEventListener("mouseup", onMouse);
}

function update(dt) {
  myWorld.myAgent.animatIdle();
  if (keys["ArrowRight"]) {
    myWorld.myAgent.onMyWay = false;
    myWorld.myAgent.moveToRight(dt);
  } else if (keys["ArrowLeft"]) {
    myWorld.myAgent.onMyWay = false;
    myWorld.myAgent.moveToLeft(dt);
  } else if (keys["ArrowDown"]) {
    myWorld.myAgent.onMyWay = false;
    myWorld.myAgent.sitDown();
  } else if (keys["ArrowUp"]) {
    myWorld.myAgent.onMyWay = false;
    myWorld.myAgent.facingFront(); // not needed now
  }
  
  if (myWorld.myAgent.onMyWay || mouse_clicked) {
    myWorld.myAgent.onMyWay = true;
    myWorld.myAgent.walkTo(mouse_pos[0], dt);
  }
}

var last_time = performance.now();

function mainLoop() {
  requestAnimationFrame(mainLoop);
  
  myWorld.draw();
  var now = performance.now();
  var dt = (now - last_time) / 1000;
  last_time = now;
  update(dt);
}
Listeners();
mainLoop();

var icon_list = document.getElementById("icon_list");

icon_list.addEventListener('change', function() {
  var selected_icon = this.options[this.selectedIndex];
  var icon = selected_icon.value;
  console.log("Icone sélectionné : ", icon);
  //TODO - change the avatar with corresponding icone
});