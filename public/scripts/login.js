import { Msg } from "./classes.js";
import MyChat from "./code.js";

const testingLocally = false; // Change to true if testing locally

// Redirect to the Register page when the link is clicked
document.getElementById("registerLink").addEventListener("click", function () {
  window.location.href = testingLocally
    ? "http://localhost:9022/register"
    : "https://ecv-etic.upf.edu/node/9022/register";
});

const loginForm = document.getElementById("loginSection");

const ws = testingLocally
  ? new WebSocket("ws://localhost:9022")
  : new WebSocket("wss://ecv-etic.upf.edu/node/9022/ws/");

ws.onopen = function () {
  console.log("Login Client is connected to the server");
};

ws.onerror = function (error) {
  console.log("Error: " + error);
};

ws.onclose = function () {
  console.log("Login Client: connection closed");
};

// Get Username and Password from the form
// and send it to the server
loginForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const id = 0;
  const loginInfo = new Msg(
    id,
    "login-client",
    { username: username, password: password },
    "LOGIN"
  );
  ws.send(JSON.stringify(loginInfo));
  const waitForResponse = new Promise((resolve) => {
    ws.addEventListener("message", function (message) {
      console.log("Received message from server: " + message.data);
      var msg = JSON.parse(message.data);
      if (msg.type == "LOGIN") {
        resolve(msg.content);
      }
    });
  });
  waitForResponse.then((response) => {
    if (response) {
      // User is authenticated
      // Redirect to the chat page with new instance of Client
      window.location.href = testingLocally
        ? "http://localhost:9022/room_selection"
        : "https://ecv-etic.upf.edu/node/9022/room_selection";
    } else {
      // User is not authenticated
      // Show an alert
      alert("Wrong username or password");
    }
  });
});
