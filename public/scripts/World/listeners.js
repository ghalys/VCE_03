import { FelixChat,myAgent } from "../main_scene.js";

var input = document.querySelector("input.chat");
var canvas = document.getElementById("scene");
var audio = document.getElementById('myAudio');
var flagSelection = document.getElementById('flagSelection');

// setVolume(0.5);
const upload = (file) => {
  // Create a FormData object and append the file
  const formData = new FormData();
  formData.append('file', file); // 'file' is the key expected by the server for the file

  fetch('http://localhost:9022/music', { // Your POST endpoint
    method: 'POST',
    body: formData // Pass formData as body directly
    // Don't set Content-Type header, FormData will handle it
  }).then(
    response => response.json() // Assuming the response is JSON
  ).then(
    success => console.log(success) // Handle success
  ).catch(
    error => console.log(error) // Handle errors
  );
};

document.getElementById('uploadButton').addEventListener('click', function() {
  var input = document.getElementById('audioFile');
  var file = input.files[0]; // Get the first file selected (assuming only one file is selected)
  console.log("heeloo")
  upload(file);
  // if (file) {
  //     console.log("fileLOADED")

  //     const reader = new FileReader();
  //     reader.onload = function(event) {
  //       console.log("filereadytosend")
  //       FelixChat.myWorld.sendMusic(event.target.result);
  //       console.log(file.type);
  //       console.log("filesent")
  //     };
  //     reader.readAsArrayBuffer(file); // Read the file as ArrayBuffer
  // }

  
});


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

document.getElementById('playButton').addEventListener('click', playMusic);
document.getElementById('pauseButton').addEventListener('click', pauseMusic);
document.getElementById('volumeSlider').addEventListener('input', (event) => setVolume(event.target.value));


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

function playMusic() {
  audio.play();
}
function pauseMusic() {
  audio.pause();
}
function setVolume(volume) {
  audio.volume = volume;
}
