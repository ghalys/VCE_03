import { FelixChat,myAgent } from "../main_scene.js";

var input = document.querySelector("input.chat");
var canvas = document.getElementById("scene");
var flagSelection = document.getElementById('flagSelection');

const avatar = ["man","woman","girl"];
const skin = [
  ['alien', 'astro', 'athlete', 'business', 'casual', 'cyborg', 'fantasy', 'farmer', 'military', 'racer', 'robot', 'survivor', 'zombie'],
  ['astro', 'athlete', 'casual', 'fantasy', 'military', 'racer', 'survivor'],
  ['casual']
];

const skinVersion = [
  [['alienA', 'alienB'],
   ['astroA', 'astroB'],
   ['athleteBlue', 'athleteGreen', 'athleteRed', 'athleteYellow'], 
   ['businessA', 'businessB'], 
   ['casualman', 'casualmanB'], 
   ['cyborg'], ['fantasyA', 'fantasyB'], 
   ['farmerA', 'farmerB'], 
   ['militaryA', 'militaryB'], 
   ['racerBlue', 'racerGreen', 'racerOrange', 'racerPurple', 'racerRed'], 
   ['robot', 'robot2', 'robot3'], 
   ['survivorA', 'survivorB'], 
   ['zombieA', 'zombieB', 'zombieC']],

  [
    ['astroA', 'astroB'],
    ['athleteBlue', 'athleteGreen', 'athleteRed', 'athleteYellow'],
    ['casualA', 'casualB'],
    ['fantasyA', 'fantasyB'],
    ['militaryA', 'militaryB'],
    ['racerBlue', 'racerGreen', 'racerOrange', 'racerPurple', 'racerRed'],
    ['survivorA', 'survivorB']
  ],
  [['casualgirl']]
]
let currentAvatarIndex = 1;
let currentSkinIndex = 2; // Index of current skin
let currentVersionIndex = 0; // Index of current version of the skin

const skinNameElement = document.getElementById('skin-name');
const skinVersionElement = document.getElementById('skin-version');
const avatarElement = document.getElementById('avatar-name');
updateSkinDisplay();

document.getElementById('prev-avatar').addEventListener('click', function() {
  if (currentAvatarIndex > 0) {
    currentAvatarIndex--;
  } else{
    currentAvatarIndex = avatar.length - 1; 
  }
  currentVersionIndex = 0;
  currentSkinIndex = 0;

  updateSkinDisplay();
});

document.getElementById('next-avatar').addEventListener('click', function() {
  if (currentAvatarIndex < avatar.length - 1) {
    currentAvatarIndex++;
  } else{
    currentAvatarIndex = 0; 
  }
  currentVersionIndex = 0;
  currentSkinIndex = 0;
  updateSkinDisplay();
});

document.getElementById('prev-skin').addEventListener('click', function() {
  if (currentSkinIndex > 0) {
    currentSkinIndex--;
  } else{
    currentSkinIndex = skin[currentAvatarIndex].length - 1; 
  }
  currentVersionIndex = 0;
  updateSkinDisplay();
});

document.getElementById('next-skin').addEventListener('click', function() {
  if (currentSkinIndex < skin[currentAvatarIndex].length - 1) {
    currentSkinIndex++;
  } else{
    currentSkinIndex = 0; 
  }
  currentVersionIndex = 0;
  updateSkinDisplay();
});


document.getElementById('prev-skinVersion').addEventListener('click', function() {
  if (currentVersionIndex > 0) {
    currentVersionIndex--;
  } else{
    currentVersionIndex = skinVersion[currentAvatarIndex][currentSkinIndex].length - 1; 
  }
  updateSkinDisplay();
});

document.getElementById('next-skinVersion').addEventListener('click', function() {
  if (currentVersionIndex < skinVersion[currentAvatarIndex][currentSkinIndex].length - 1) {
    currentVersionIndex++;
  } else{
    currentVersionIndex = 0; 
  }
  updateSkinDisplay();
});



function updateSkinDisplay() {
  var Avatar = avatar[currentAvatarIndex];
  var Skin = skin[currentAvatarIndex][currentSkinIndex];
  var SkinVersion = skinVersion[currentAvatarIndex][currentSkinIndex][currentVersionIndex];
  avatarElement.textContent = Avatar;
  skinNameElement.textContent = Skin;
  skinVersionElement.textContent = SkinVersion
  myAgent.updateSkin(Avatar,Skin,SkinVersion);
}

var audio = document.getElementById('myAudio');
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

  fetch('https://ecv-etic.upf.edu/node/9022/upload_files', {
    method: 'post',
    body: formData,
  }).then((response) => response.json()) 
    .then((res) => {
      console.log(res.message);
      var musicName = res.filename;
      audio.src = "upload_files/"+musicName; 
      console.log("---------"+musicName);
      FelixChat.myWorld.sendMusic(musicName);
    })
    .catch((err) => ('Error occurred', err))
})

document.getElementById('playButton').addEventListener('click', playMusic);
document.getElementById('pauseButton').addEventListener('click', pauseMusic);
document.getElementById('volumeSlider').addEventListener('input', (event) => setVolume(event.target.value));


flagSelection.addEventListener('change',function(){
  let newflag = this.value.toLowerCase();
  myAgent.changeFlag(newflag);
  FelixChat.setFlag(newflag);
});

//remove focus on the input when we click on the canvas
canvas.addEventListener('click', function() {
  input.blur();
});

document.addEventListener('keydown', function(event) {
  if (document.activeElement.tagName !== 'INPUT') {

  //activate dancing
  if (event.key === 'd' ) {
      gl.keys["d"] = true;
      }
  
  //activate change of view of the camera
  if (event.key === 'c' ) {
      gl.keys["c"] = true;
      }
  }

  //activate change of view of the camera
  if (event.key === 'w' ) {
    gl.keys["w"] = true;
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

function playMusic() {
  audio.play();
}
function pauseMusic() {
  audio.pause();
}
function setVolume(volume) {
  audio.volume = volume;
}
