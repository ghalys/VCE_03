var usernameInput = document.getElementById("usernameInput");
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

function isAvailable(username){
  return test;
}
