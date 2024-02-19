import MyChat from "./code.js";

var ourPort = "9022";
// var ourUrl = "wss://ecv-etic.upf.edu/node/"+ourPort+"/ws/";
var ourUrl = "ws://localhost:3000";
var FelixChat = new MyChat();
FelixChat.create(document.querySelector("#mychat"));
//Managing Login and Room selection
//Connecting to another instance for getting the list of rooms

// async function getRooms() {
//   var server = new SillyClient();
//   server.connect("wss://ecv-etic.upf.edu/node/9000/ws/");
//   var report = await server.getReport();
//   var rooms = report.rooms;
//   //Add rooms to the selection list
//   for (var i in rooms) {
//     var room = i;
//     var activeUsers = rooms[i];
//     var option = document.createElement("option");
//     option.value = room;
//     option.innerHTML = room + " (" + activeUsers + ")";
//     document.getElementById("room-list").appendChild(option);
//   }
// }

//////////////////////////////////////
//Displaying all existing rooms
// getRooms();
//////////////////////////////////////

//Submitting Login and Room selection
document
  .getElementById("login-button")
  .addEventListener("click", connectToChat);

function connectToChat() {
  if (document.getElementById("room-name").value == "") {
    var element = document.getElementById("room-list");
    var selectedOption = element.options[element.selectedIndex];
    var room = selectedOption.value;
  } else {
    var room = document.getElementById("room-name").value;
  }

  var username = document.getElementById("username").value;

  var icon_list = document.getElementById("icon_list");
  var selected_icon = icon_list.options[icon_list.selectedIndex];
  var icon = selected_icon.value;

  //Clear inputs for next login
  document.getElementById("username").value = "";
  document.getElementById("room-name").value = "";

  //Connect to chat
  FelixChat.init(ourUrl, room, username, icon);

  //Display chat page
  document.getElementById("login-page").style.display = "none";
  document.getElementById("chat-page").style.display = "block";
}
