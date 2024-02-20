import {Agent} from './classes.js';

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




class World{
  constructor(myAgent,list_Agents){
    this.myAgent = myAgent;
    this.people = list_Agents;
    this.peopleById = null;
  }

  initialisation(){
    //add Agent to people
    // for (const Agent of this.people) {
    //   var id = Agent.id;
    //   this.peopleById[id] = Agent;
    // }

    //send the Agent state to the server every 50ms
    setInterval(this.onTick,1000/20);
  }

  onTick(){
    //send the Agent state to the server
    var myState = this.myAgent.sendJSON();
    
  }
  receivedJSON(agent){
    
  }
  

  addOrUpdateAgent(Agent){
    var id = Agent.id;
    var person = this.peopleById(id);

    //if the person doesn't exist, we add it to World
    if(!person){
      this.people.push(Agent);
      this.peopleById[id] = Agent;
    }
    else{
      this.peopleById[id] = Agent;
    }
  }

  removeAgent(Agent){
    var person = this.peopleById(id);

    //if the person doesn't exist, we do nothing
    if(!person) return ;

    var idx = this.people.indexOf(Agent);
    this.people.splice(idx,1);
    delete this.peopleById(Agent.id);
  }

}


//testing
var avatar = new Agent(1,"avatar");
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

function drawAgent(ctx, Agent) {
  getImage("Avatar.png", function(img) {
    ctx.imageSmoothingEnabled = false;
    
    // Define a speed modifier
    var speedModifier = 0.5; 

    // Adjust the frame calculation to include the speed modifier
    var frame_num = Math.floor((performance.now() / 100 * speedModifier) % Agent.animation.length);
    var anim = Agent.animation;
    var frame = anim[frame_num % anim.length];
    ctx.drawImage(img, 32 * frame, 64 * Agent.facing, 32, 64, Agent.position.x-32, Agent.position.y-64, 32*2, 64*2);
    
    // write the username on the top of the agent
    ctx.font = "10px Arial"; 
    ctx.fillStyle = "red";
    ctx.fillText(Agent.username, Agent.position.x-16, Agent.position.y-64);
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
    var Agent = WORLD.people[i];
    drawAgent(ctx,Agent);
  }
  drawAgent(ctx,WORLD.myAgent);
}


var last_time = performance.now();


function update(dt)
{
  WORLD.myAgent.animatIdle();
  if(keys["ArrowRight"]){
    WORLD.myAgent.onMyWay = false;
    WORLD.myAgent.moveToRight(dt);
  }
  else if (keys["ArrowLeft"]){
    WORLD.myAgent.onMyWay = false;
    WORLD.myAgent.moveToLeft(dt);
  }
  else if (keys["ArrowDown"]) {
    WORLD.myAgent.onMyWay = false;
    WORLD.myAgent.sitDown();
  }
  else if (keys["ArrowUp"]) {
    WORLD.myAgent.onMyWay = false;
    WORLD.myAgent.facingFront();// not needed now 
  }

  if (WORLD.myAgent.onMyWay || mouse_clicked){
    WORLD.myAgent.onMyWay = true;
    WORLD.myAgent.walkTo(mouse_pos[0],dt);
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
