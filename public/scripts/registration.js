// var md5 = require("md5");

var usernameInput = document.getElementById("usernameInput");
var passwordInput = document.getElementById("passwordInput");
var eyeIcon = document.getElementById("eyeIconOpened");

var usernameAvailability = document.getElementById("usernameAvailability");
var test = false;

usernameInput.addEventListener('input', function() {
  const username = this.value; 
  if (username !== '') {
    
    if(!isAvailable(username) ) {
      usernameAvailability.textContent = 'This username is already used, please select an other one';
    } 
    else {
      usernameAvailability.textContent = '';
    }
  }});

// var hashed_password = md5( passwordInput.value);

eyeIcon.addEventListener("click", function() {
  if(passwordInput.type=="password"){
    passwordInput.type = "text"
  }
  else{
    passwordInput.type = "password"
  }
});

function isAvailable(username){
  return test;
}
