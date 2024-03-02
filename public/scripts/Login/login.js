import LoginClient from "./login_client.js";
import {testingLocally} from "../testing.js";


let username; 
let password;
const loginForm    = document.getElementById("loginSection");
const registerlink = document.getElementById("registerLink");



export let loginServer = new LoginClient();
loginServer.connect_socket(testingLocally);


loginServer.onVerification= (response)=>{
  if(response){ // User is authenticated

    // creating a cookie for username and password
    const now = new Date();
    const expirationDate = new Date(now.getTime() + 60 * 60 * 1000); // Ajoute 1 heure
    const expires = expirationDate.toUTCString();
    document.cookie = `username=${encodeURIComponent(username)}; path=/; expires=${expires}`;
    document.cookie = `password=${encodeURIComponent(password)}; path=/; expires=${expires}`;
    

    // Redirect to the chat page with new instance of Client
    window.location.href = testingLocally
    ? `http://localhost:9022/room_selection?username=${encodeURIComponent(
      username)}`
      : `https://ecv-etic.upf.edu/node/9022/room_selection?username=${encodeURIComponent(
        username)}`;
    loginServer.socket.close();    
  }
  else{// User is not authenticated
    // Show an alert
    alert("Wrong username or password");
  }
}

if(registerlink){
  // Redirect to the Register page when the link is clicked
  registerlink.addEventListener("click", function () {
    window.location.href = testingLocally
    ? "http://localhost:9022/register"
    : "https://ecv-etic.upf.edu/node/9022/register";
  });
}

if(loginForm){
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    username = document.getElementById("username").value;
    password = document.getElementById("password").value;
    loginServer.sendForVerification(username,password);
  });
}