var canvas = document.querySelector("canvas");

//here we can store the keyboard state
var keys = {};

function onKeyDown( event ) { 
   //process key down event
   //mark it as being pressed
   keys[ event.key ] = true;
};

function onKeyUp( event ) { 
   //process key up event
   //mark it as being released
   keys[ event.key ] = false;
};
document.body.addEventListener("keydown", onKeyDown );
document.body.addEventListener("keyup", onKeyUp );


//here we can store the mouse position and state 
var mouse_pos = [0,0];
var mouse_buttons = 0;
var mouse_clicked = false;
function onMouse(e){
  mouse_buttons = e.buttons;
  // if(mouse_buttons ==1){
    if(e.type == "mousedown")
    {
      var rect = canvas.parentNode.getBoundingClientRect();
      mouse_pos[0] = (e.clientX - rect.left)/2 - canvas.width/4;
      mouse_pos[1] = (e.clientY - rect.top )/2 - (canvas.height*(1/3));
      mouse_clicked = true; // it records the last position when the mouse is clicked    
    }
    else if (e.type == "mouseup"){
     mouse_clicked = false;
    }
  // }
}
canvas.addEventListener("mousedown", onMouse );
canvas.addEventListener("mouseup", onMouse );

class Position {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  static interpolate(start, end, t) {
    return new Position(
      start.x + (end.x - start.x) * t,
      start.y + (end.y - start.y) * t
    );
  }
}

class Character {
  static FACING = {
    RIGHT : 0,
    FRONT : 1,
    LEFT  : 2,
    BACK  : 3
  }
  static ANIMATION = {
    IDLE :[0],
    TALK : [0,1],
    SIT : [13],
    WALK :[2,3,4,5,6,7,8,9]
  }

  constructor(id,username, position = new Position(), facing = Character.FACING.FRONT, animation=Character.ANIMATION.TALK) {
      this.id = id,
      this.username =username,
      this.facing = facing,
      this.position = position,
      this.animation= animation,
      this.onMyWay = false // is True when there is a mouse click and the user should go to somewhere till he arrives
  }

  //function for changing face direction
  facingRight(){
    this.facing = Character.FACING.RIGHT;
  }
  facingLeft(){
    this.facing = Character.FACING.LEFT;
  }
  facingFront(){
    this.facing = Character.FACING.FRONT;
  }
  facingBack(){
    this.facing = Character.FACING.BACK;
  }

  //function for changing the animation
  animatIdle(){
    this.animation = Character.ANIMATION.IDLE;
  }
  animatWalk(){
    this.animation = Character.ANIMATION.WALK;
  }
  animatSit(){
    this.animation = Character.ANIMATION.SIT;
  }
  animatTalk(){
    this.animation = Character.ANIMATION.TALK;
  }

  //walk to the right
  moveToRight(dt){
    this.facingRight();
    this.animatWalk();
    this.position.x += dt*32;
  }
  //walk to the left
  moveToLeft(dt){
    this.facingLeft();
    this.animatWalk();
    this.position.x -= dt*32;
  }
  //sit down
  sitDown(){
    this.animatSit();
  }
  //stand up
  standUp(){
    this.animatIdle();
  }

  // function which allows us to move to a new point
  moveTo(newX, newY = this.position.y) {
    this.position.setPosition(newX, newY);
  }

  // walk to the mouse 
  walkTo(newX,dt){

    if(newX>this.position.x){ //we move to the right
      if(Math.abs(newX-this.position.x)<=32*dt){ //if we are close
        var dx = newX-this.position.x;
        this.moveToRight(dx/32);
        this.onMyWay = false
      }
      else{// if we are far from the destination
        this.moveToRight(dt)
      }
    }
    else if(newX<this.position.x){ // We move to the left
      if(Math.abs(newX-this.position.x)<=32*dt){ //if we are close
        var dx = this.position.x-newX;
        this.moveToLeft(dx/32);
        this.onMyWay = false
      }
      else{// if we are far from the destination
        this.moveToLeft(dt)
      }
    }
    else{ //we already arrived
      this.animatIdle();
      this.onMyWay = false;
    }
  }
  // make the interpolate position with a factor t between the current position and the destination
  interpolatePosition(endPosition, t) {
    this.position = Position.interpolate(this.position, endPosition, t);
  }

}

class World{
  constructor(myCharacter,list_characters){
    this.myCharacter = myCharacter;
    this.people = list_characters;
    this.peopleById = null;
  }

  initialisation(){
    //add character to people
    for (const character of this.people) {
      var id = character.id;
      this.peopleById[id] = character;
    }

    //send the character state to the server every 50ms
    setInterval(this.onTick,1000/20);
  }
  onTick(){
    //send the character state to the server
  }

  addOrUpdateCharacter(character){
    var id = character.id;
    var person = this.peopleById(id);

    //if the person doesn't exist, we add it to World
    if(!person){
      this.people.push(character);
      this.peopleById[id] = character;
    }
    else{
      this.peopleById[id] = character;
    }
  }

  removeCharacter(character){
    var person = this.peopleById(id);

    //if the person doesn't exist, we do nothing
    if(!person) return ;

    var idx = this.people.indexOf(character);
    this.people.splice(idx,1);
    delete this.peopleById(character.id);
  }

}


//testing
var avatar = new Character(1,"avatar");
var WORLD =new World(avatar,[]);


//get image
var images = {};
function getImage(url, callback) {
  if (images[url]) {
    callback(images[url]);
    return;
  }
  var img = new Image();
  img.onload = function() {
    images[url] = img;
    callback(img);
  };
  img.onerror = function() {
    console.error("Failed to load image at " + url);
  };
  img.src = url;
}

function drawCharacter(ctx, character) {
  getImage("Avatar.png", function(img) {
    ctx.imageSmoothingEnabled = false;
    
    // Define a speed modifier
    var speedModifier = 0.5; 

    // Adjust the frame calculation to include the speed modifier
    var frame_num = Math.floor((performance.now() / 100 * speedModifier) % character.animation.length);
    var anim = character.animation;
    var frame = anim[frame_num % anim.length];
    ctx.drawImage(img, 32 * frame, 64 * character.facing, 32, 64, character.position.x-32, character.position.y-64, 32*2, 64*2);
    ctx.font = "10px Arial"; // Définit la taille et le type de police
    ctx.fillStyle = "red";
    ctx.fillText(character.username, character.position.x-16, character.position.y-64);
  });
}

function draw()
{
  var rect = canvas.parentNode.getBoundingClientRect();
  canvas.width = Math.floor(rect.width);
  canvas.height = Math.floor(rect.height);

  var  ctx = canvas.getContext("2d");
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.resetTransform();
  ctx.translate(canvas.width/2,canvas.height*(2/3));
  ctx.scale(2,2);

  for(var i = 0; i < WORLD.people.length; ++i){
    var character = WORLD.people[i];
    drawCharacter(ctx,character);
  }
  drawCharacter(ctx,WORLD.myCharacter);
}


var last_time = performance.now();


function update(dt)
{
  WORLD.myCharacter.animatIdle();
  if(keys["ArrowRight"]){
    WORLD.myCharacter.onMyWay = false;
    WORLD.myCharacter.moveToRight(dt);
  }
  else if (keys["ArrowLeft"]){
    WORLD.myCharacter.onMyWay = false;
    WORLD.myCharacter.moveToLeft(dt);
  }
  else if (keys["ArrowDown"]) {
    WORLD.myCharacter.onMyWay = false;
    WORLD.myCharacter.sitDown();
  }
  else if (keys["ArrowUp"]) {
    WORLD.myCharacter.onMyWay = false;
    WORLD.myCharacter.standUp();// not needed now 
  }

  if (WORLD.myCharacter.onMyWay || mouse_clicked){
    WORLD.myCharacter.onMyWay = true;
    WORLD.myCharacter.walkTo(mouse_pos[0],dt);
  }

}

function mainLoop()
{
  requestAnimationFrame(mainLoop);

  draw();
  var now = performance.now();
  var dt = (now-last_time)/1000;
  last_time = now;

  update(dt);

}


mainLoop();

//drawARoom
