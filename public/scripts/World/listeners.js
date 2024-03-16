import { FelixChat,myAgent } from "../main_scene.js";

var input = document.querySelector("input.chat");
var canvas = document.getElementById("scene");

var flagSelection = document.getElementById('flagSelection');

flagSelection.addEventListener('change',function(){
  myAgent.changeFlag(this.value.toLowerCase());
});

//remove focus on the input when we click on the canvas
canvas.addEventListener('click', function() {
  input.blur();
});

document.addEventListener('keydown', function(event) {
  if (document.activeElement.tagName !== 'INPUT') {

  //activate dancing
  if (event.key === 'd' ) {
      console.log("d");
      gl.keys["d"] = true;
      }
  
  //activate change of view of the camera
  if (event.key === 'c' ) {
      gl.keys["c"] = true;
      }
  }
});

var room = "Hall"
// Changing the Room
document.getElementById("changeRoomButton").addEventListener("click", goToRoom);
document.getElementById("returnToTheHall").addEventListener("click",returnToTheHall);

function returnToTheHall(){
  room = "Hall";
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
