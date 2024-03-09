import LoginClient from "./login_client.js";
import { testingLocally } from "../testing.js";
import { fetchWithToken } from "../fetchWithToken.js";

let username;
let password;
const loginForm = document.getElementById("loginSection");
const registerlink = document.getElementById("registerLink");

export let loginServer = new LoginClient();
loginServer.connect_socket(testingLocally);

loginServer.onVerification = (response) => {
  console.log(JSON.stringify(response));
  if (response.verified && response.accessToken) {
    // Save the access token in local storage
    localStorage.setItem("accessToken", response.accessToken);

    // creating a cookie for username and password
    const now = new Date();
    const expirationDate = new Date(now.getTime() + 60 * 60 * 1000); // Ajoute 1 heure
    const expires = expirationDate.toUTCString();
    document.cookie = `username=${encodeURIComponent(
      username
    )}; path=/; expires=${expires};`;
    document.cookie = `password=${encodeURIComponent(
      password
    )}; path=/; expires=${expires};`;

    // Make a request to the chat page with the access token included
    fetchWithToken(
      testingLocally
        ? "http://localhost:9022/room_selection"
        : "https://ecv-etic.upf.edu/node/9022/room_selection",
      {
        method: "POST",
      }
    )
      .then((data) => {
        // Open the chat page with the data received
        document.open();
        document.write(data);
        document.close();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    loginServer.socket.close();
  } else {
    // User is not authenticated
    // Show an alert
    alert("Wrong username or password");
  }
};

if (registerlink) {
  // Redirect to the Register page when the link is clicked
  registerlink.addEventListener("click", function () {
    window.location.href = testingLocally
      ? "http://localhost:9022/register"
      : "https://ecv-etic.upf.edu/node/9022/register";
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    username = document.getElementById("username").value;
    password = document.getElementById("password").value;
    loginServer.sendForVerification(username, password);
  });
}
