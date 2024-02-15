var canvas = document.querySelector("canvas");

var FACING = {
  RIGHT : 0,
  FRONT : 1,
  LEFT  : 2,
  BACK  : 3
}

var WORLD ={
  people :[
    { name : "javi",
      facing : FACING.RIGHT,
      pos:[0,0],
      animation:"walk"
    }
  ]
}

var anims = {
  idle :[0],
  talk : [0,1],
  sit : [13],
  walk :[2,3,4,5,6,7,8,9]
}

var images = {};
// function getImage(url)
// {
//   if(images[url])
//     return images[url];
//   var img = new Image();
//   img.src = url;
//   images[url] = img;
//   return img;
// }

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

// function drawCharacter(ctx, person)
// {
//   var img = getImage("Man.png");
//   ctx.imageSmoothingEnabled = false;
//   var frame_num = Math.floor((performance.now() / 1000)); 
//   var anim = anims[ person.animation ];
//   var frame = anim[ frame_num  % anim.length ];
//   ctx.drawImage(img,32*frame,64*person.facing,32,64,person.pos[0],person.pos[1],32,64);
// }
function drawCharacter(ctx, person) {
  getImage("Avatar.png", function(img) {
    ctx.imageSmoothingEnabled = false;
    // Define a speed modifier
    var speedModifier = 0.5; // Adjust this value to speed up or slow down the animation

    // Adjust the frame calculation to include the speed modifier
    var frame_num = Math.floor((performance.now() / 100 * speedModifier) % anims[person.animation].length);
    var anim = anims[person.animation];
    var frame = anim[frame_num % anim.length];
    ctx.drawImage(img, 32 * frame, 64 * person.facing, 32, 64, person.pos[0], person.pos[1], 32*4, 64*4);
  });
}

function draw()
{
  var rect = canvas.parentNode.getBoundingClientRect();
  canvas.width = Math.floor(rect.width);
  canvas.height = Math.floor(rect.height);

  var  ctx = canvas.getContext("2d");
  ctx.fillStyle = "red";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.resetTransform();

  // ctx.translate(canvas.width/2,);


  for(var i = 0; i < WORLD.people.length; ++i){
    var person = WORLD.people[i];
    drawCharacter(ctx,person);

    // ctx.fillRect();
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