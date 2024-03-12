import { FelixChat } from "../main_scene.js";

var input = document.querySelector("input.chat");
var canvas = document.getElementById("scene");

var selectedValue = document.getElementById('flagSelection').value;


//remove focus on the input when we click on the canvas
canvas.addEventListener('click', function() {
  input.blur();
});

//activate dancing
document.addEventListener('keydown', function(event) {
  if (event.key === 'd' && !document.activeElement === input) {
      gl.keys["d"] = true;
  }
});

//activate change of view of the camera
document.addEventListener('keydown', function(event) {
  if (event.key === 'c' && !document.activeElement === input) {
      gl.keys["c"] = true;
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
