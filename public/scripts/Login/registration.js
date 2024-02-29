import Msg from "../Chat/message_class.js";

const testingLocally = true; // Change to true if testing locally

const ws = testingLocally
  ? new WebSocket("ws://localhost:9022")
  : new WebSocket("wss://ecv-etic.upf.edu/node/9022/ws/");

ws.onopen = function () {
  console.log("Register Client: Connected to the server");
};

ws.onerror = function (error) {
  console.log("Error: " + error);
};

ws.onclose = function () {
  console.log("Register Client: Connection closed");
};
const loginForm = document.getElementById("loginSection");
var usernameInput = document.getElementById("usernameInput");
var passwordInput = document.getElementById("passwordInput");
var eyeIcon = document.getElementById("eyeIconOpened");

var usernameAvailability = document.getElementById("usernameAvailability");
var test = false;

usernameInput.addEventListener("input", function () {
  const username = this.value;
  if (username !== "") {
    isAvailable(username).then((response) => {
      if (!response) {
        usernameAvailability.textContent = "Username is available";
        usernameAvailability.style.color = "green";
      } else {
        usernameAvailability.textContent = "Username is not available";
        usernameAvailability.style.color = "red";
      }
    });
  }
});

// Making the password visible/invisible by clicking the eye icon
eyeIcon.addEventListener("click", function () {
  if (passwordInput.type == "password") {
    passwordInput.type = "text";
  } else {
    passwordInput.type = "password";
  }
});

// Submitting the form and sending the data to the server to register the user
loginForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const username = usernameInput.value;
  const password = passwordInput.value;
  const id = 0;

  if (username !== "" && password !== "") {
    isAvailable(username).then((response) => {
      if (response) {
        alert("Username is not available");
      } else {
        const registerInfo = new Msg(
          id,
          "register-client",
          { username: username, password: password },
          "REGISTER"
        );
        ws.send(JSON.stringify(registerInfo));
        const waitForResponse = new Promise((resolve) => {
          ws.addEventListener("message", function (message) {
            console.log("Received message from server: " + message.data);
            var msg = JSON.parse(message.data);
            if (msg.type == "REGISTER") {
              resolve(msg.content);
            }
          });
        });
        waitForResponse.then((response) => {
          if (response) {
            alert("User registered successfully");
            window.location.href = testingLocally
              ? "http://localhost:9022/"
              : "https://ecv-etic.upf.edu/node/9022/";
            ws.close();
          } else {
            alert("Error registering the user");
          }
        });
      }
    });
  }
});

async function isAvailable(username) {
  console.log("Checking if the username is available");
  // Asking the server if the username is available
  // and returning the result
  var id = 0;
  var msg = new Msg(id, "register-client", { username: username }, "LOGIN");
  ws.send(JSON.stringify(msg));

  // Waiting for the response from the server
  const waitForResponse = new Promise((resolve) => {
    ws.addEventListener("message", function (message) {
      console.log("Received message from server: " + message.data);
      var msg = JSON.parse(message.data);
      if (msg.type == "LOGIN") {
        resolve(msg.content);
      }
    });
  });
  // Return the response from the server
  const response = await waitForResponse;
  console.log("Response from the server: " + response);
  // response is false if the username isnt in the database => available
  return response;
}
