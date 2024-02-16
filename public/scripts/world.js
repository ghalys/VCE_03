var canvas = document.querySelector("canvas");
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

  constructor(name, position = new Position(), facing = Character.FACING.FRONT, animation=Character.ANIMATION.TALK) {
      this.name =name,
      this.facing = facing,
      this.position = position,
      this.animation= animation
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

  moveTo(newX, newY) {
    this.position.setPosition(newX, newY);
  }
  interpolatePosition(endPosition, t) {
    this.position = Position.interpolate(this.position, endPosition, t);
  }

}
//testing
var avatar = new Character("avatar");

var WORLD ={
  people :
  [avatar]
}

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
    ctx.drawImage(img, 32 * frame, 64 * character.facing, 32, 64, character.position.x-16, character.position.y-64, 32*2, 64*2);
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
}


var last_time = performance.now();


function update(dt)
{

}

function mainLoop()
{
  requestAnimationFrame(mainLoop);

  draw();
  var now = performance.now();
  var elapsed_time = (now-last_time)/1000;
  last_time = now;

  // update(dt);

}


mainLoop();