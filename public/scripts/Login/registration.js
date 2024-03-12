import { loginServer } from "./login.js";
import { testingLocally } from "../testing.js";

const loginForm = document.getElementById("registrationSection");
var usernameInput = document.getElementById("usernameInput");
var passwordInput = document.getElementById("passwordInput");
var usernameAvailability = document.getElementById("usernameAvailability");
let isAvailable = false;

loginServer.onVerification = (response) => {
  if (!response.verified) {
    isAvailable = true;
    usernameAvailability.textContent = "Username is available";
    usernameAvailability.style.color = "green";
  } else {
    isAvailable = false;
    usernameAvailability.textContent = "Username is not available";
    usernameAvailability.style.color = "red";
  }
};

loginServer.onRegistration = (response) => {
  if (response) {
    alert("User registered successfully");
    window.location.href = testingLocally
      ? "http://localhost:9022/"
      : "https://ecv-etic.upf.edu/node/9022/";

    loginServer.socket.close();
  } else {
    alert("Error registering the user");
  }
};

usernameInput.addEventListener("input", function () {
  const username = this.value;
  if (username !== "") {
    loginServer.checkIfAvailable(username);
  }
});

// Submitting the form and sending the data to the server to register the user
loginForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const username = usernameInput.value;
  const password = passwordInput.value;

  if (username !== "" && password !== "") {
    if (!isAvailable) {
      alert("Username is not available");
    } else {
      loginServer.sendRegistration(username, password);
    }
  }
});
