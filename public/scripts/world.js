var canvas = document.querySelector("canvas");

function draw()
{
  var rect = canvas.parentNode.getBoundingClientRect();
  canvas.width = Math.floor(rect.width);
  canvas.height = Math.floor(rect.height);

  var  ctw = canvas.getContext("2d");
  ctx.fillStyle = "red";
  ctx.fillRect(0,0,canvas.width,canvas.height)

  ctx.reserTransform();
}
var last_time = performance.now();

var images = {};
function getImage(url)
{
  if(images[url])
    return images[url];
  var img = new Image();
  img.srx = url;
  images[url] = img;
  return img;
}

function drawCharacter(pos)
{
  var img = getImage("Avatar.png");
  ctx.drawImage(img,0,0);

}
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

  update(dt);

}


mainLoop();