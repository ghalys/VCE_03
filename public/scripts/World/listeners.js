import { FelixChat,myAgent } from "../main_scene.js";

var input = document.querySelector("input.chat");
var canvas = document.getElementById("scene");
var audio = document.getElementById('myAudio');
var flagSelection = document.getElementById('flagSelection');

// setVolume(0.5);
const form = document.querySelector('form')
const fileInput = document.getElementById('file')
let file

//input file upload gets the file we want to post:
const handleAudioFile = (e) => {
  file = e.target.files
  for (let i = 0; i <= file.length - 1; i++) {
    file = file[i]
  }
}
fileInput.addEventListener('change', handleAudioFile)

//on clicking the submit button, we create the Form Data object, add the data value of the username to send as part of the request body and add the file to the object
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append('username', myAgent.username);
  formData.append('files', file);

  fetch('http://localhost:9022/upload_files', {
    method: 'post',
    body: formData,
  }).then((response) => response.json()) 
    .then((res) => {
      console.log(res.message);
      var musicName = res.filename;
      audio.src = "upload_files/"+musicName; 
      FelixChat.myWorld.sendMusic(musicName);
    })
    .catch((err) => ('Error occurred', err))
})


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
