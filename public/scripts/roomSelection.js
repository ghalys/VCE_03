import MyChat from "./code.js";
import { World } from "./world.js";
import { Agent } from "./classes.js";

const testingLocally = false; // Change to true if testing locally

var ourPort = "9022";
var ourUrl = testingLocally
  ? "ws://localhost:3000"
  : "wss://ecv-etic.upf.edu/node/" + ourPort + "/ws/";
var FelixChat = new MyChat();
FelixChat.create(document.getElementById("mychat"));
//TODO - we can create a kind of user to have info about rooms

//Submitting Login and Room selection
document
  .getElementById("login-button")
  .addEventListener("click", connectToChat);

// Get the username from the url
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get("username");

var canvas = document.querySelector("canvas");
var myWorld = null;

function connectToChat() {
  if (document.getElementById("room-name").value == "") {
    var element = document.getElementById("room-list");
    var selectedOption = element.options[element.selectedIndex];
    var room = selectedOption.value;
  } else {
    var room = document.getElementById("room-name").value;
  }

  var icon_list = document.getElementById("icon_list");
  var selected_icon = icon_list.options[icon_list.selectedIndex];
  var icon = selected_icon.value;

  //Clear inputs for next login //TODO - ??
  document.getElementById("room-name").value = "";

  var room = "hall"; //TODO - we have to remove this at the end

  var myAgent = new Agent(-2, username); // 2 is a temporary Id
  var myWorld = new World(myAgent, canvas);

  //Connect to chat
  console.log(ourUrl);
  FelixChat.init(ourUrl, username, myWorld, room, icon);

  //Display chat page
  document.getElementById("login-page").style.display = "none";
  document.getElementById("chat-page").style.display = "block";

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
}
