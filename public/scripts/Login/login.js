import LoginClient from "./login_client.js";

export const testingLocally = true; // Change to true if testing locally

const loginForm    = document.getElementById("loginSection");
const registerlink = document.getElementById("registerLink");

export let loginServer = new LoginClient();
loginServer.connect_socket(testingLocally);


loginServer.onVerification= (response)=>{
  if(response){ // User is authenticated
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
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    loginServer.sendForVerification(username,password);
  });
}
