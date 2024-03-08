import Position from "./position.js"

export default class Agent {

  constructor(id,username,avatar ="girl", position = new Position(), animation="idle") {
      this.id = id,
      this.username = username,
      this.avatar = avatar,
      this.position = position,
      this.rotation = null;
      this.animation = animation,
      this.animations = {};
      this.isdancing = false;
      this.onMyWay = false // is True when there is a mouse click and the user should go to somewhere till he arrives
      this.destination = this.position;
      this.avatar_pivot = null;
      this.bg_color = [0.1,0.1,0.1,1];
      this.avatar = avatar;
      this.character = null;
      this.avatar_scale = 0.3;
      this.avatar_selector =null;
      this.time_factor = 1;

    }
  
  // getUsername(fontSize = 32, textColor = 'black', bgColor = 'white'){
  //   var canvas = document.createElement('canvas');
  //   var ctx = canvas.getContext('2d');

  //   // define the size and the style of the text
  //   ctx.font = `${fontSize}px Arial`;
  //   var metrics = ctx.measureText(this.username);
  //   canvas.width = metrics.width;
  //   canvas.height = fontSize;

  //   // define a background color
  //   ctx.fillStyle = bgColor;
  //   ctx.fillRect(0, 0, canvas.width, canvas.height);

  //   // draw the text
  //   ctx.fillStyle = textColor;
  //   ctx.fillText(text, 0, fontSize - (fontSize / 4)); // Ajustement based on the height of the text

  //   // create a texture in LiteGL with the canvas
  //   var texture = GL.Texture.fromImage(canvas, {
  //     minFilter: gl.LINEAR,
  //     magFilter: gl.LINEAR
  //   });
  
  //   return texture;
  // }
  

  //load some animations
	loadAnimation( name, url )
	{
		this.animations[name] = new RD.SkeletalAnimation();
		this.animations[name].load(url);
	}

  createAvatar(){
	//create material for the girl
	var mat = new RD.Material({textures: {
                            color: "girl/girl.png" }
                            });
	mat.register("girl");

	//create pivot point for the girl
	this.avatar_pivot = new RD.SceneNode({
		position: this.position.toArray()
	});
  this.rotation = this.avatar_pivot.rotation;

	//create a mesh for the girl
	this.character = new RD.SceneNode({
		scaling: this.avatar_scale,
		mesh: this.avatar + "/" + this.avatar +".wbin",
		material: this.avatar
	});

	this.avatar_pivot.addChild(this.character);
	this.character.skeleton = new RD.Skeleton();

  this.avatar_selector = new RD.SceneNode({
		position: [0,20,0],
		mesh: "cube",
		material: this.avatar,
		scaling: [8,20,8],
		name: "girl_selector",
		layers: 0b1000
	});
	this.avatar_pivot.addChild( this.avatar_selector );

  this.loadAnimation("idle"   ,"scripts/World/data/"+this.avatar+"/idle.skanim");
	this.loadAnimation("walking","scripts/World/data/"+this.avatar+"/walking.skanim");
	this.loadAnimation("dance"  ,"scripts/World/data/"+this.avatar+"/dance.skanim");
  }

  
  sendJSON(){
    return {
            id          : this.id,
            username    : this.username,
            position    : this.position,
            rotation    : this.rotation,
            animation   : this.animation,
            isdancing   : this.isdancing,
            onMyWay     : this.onMyWay,
            time_factor : this.time_factor,
            destination : this.destination,
            }
  }
  updateFromJSON(msgJSON){
    this.username    = msgJSON.username;
    this.rotation    = msgJSON.rotation;
    this.animation   = msgJSON.animation;
    this.isdancing   = msgJSON.isdancing;
    this.onMyWay     = msgJSON.onMyWay;
    this.time_factor = msgJSON.time_factor;
    // this.position.updatePosition(msgJSON.position);
    this.destination.setPosition(msgJSON.destination);
  }

  setId(id){
      this.id=id;
  }
  changeAvatar(avatar){
    this.avatar = avatar;
  }

  rotateLeft(dt){
    this.avatar_pivot.rotate(90*DEG2RAD*dt,[0,1,0]);
    this.rotation = this.avatar_pivot.rotation;
  }
  rotateRight(dt){
    this.avatar_pivot.rotate(-90*DEG2RAD*dt,[0,1,0]);
    this.rotation = this.avatar_pivot.rotation;
  }

  //function for changing the animation
  animatIdle(){
    this.animation = "idle";
  }
  animatWalk(){
    this.animation = "walking";
    //in case we were dancing before walking
    this.isdancing =false;
  }
  animatDance(){
    if (this.isdancing){
      this.animation = "dance";
    }
  }

  animUpdate(t){
    //update position and rotation
    this.avatar_pivot.position = this.position.toArray();
    this.avatar_pivot.rotation = this.rotation;

		//move bones in the skeleton based on animation
		this.animations[this.animation].assignTime( t * 0.001 * this.time_factor );
		//copy the skeleton in the animation to the character
		this.character.skeleton.copyFrom( this.animations[this.animation].skeleton );
  }

  //Update the state of the agent accordingly to info he got.
  Update(t){
    if(!this.position.samePositionAs(this.destination)){
      this.goTo(this.destination);
    }
    if (this.onMyWay){
      this.moveTo(this.destination);
    }
    //update position and rotation
    this.avatar_pivot.position = this.position.toArray();
    this.avatar_pivot.rotation = this.rotation;

    if(this.onMyWay){
      this.animations["walk"].assignTime( t * 0.001 * this.time_factor );
    }
    else{
      //move bones in the skeleton based on animation
      this.animations[this.animation].assignTime( t * 0.001 * this.time_factor );
    }

		//copy the skeleton in the animation to the character
		this.character.skeleton.copyFrom( this.animations[this.animation].skeleton );
  }

  //this function is used by myAgent to move Up 
  moveUp(){
    this.avatar_pivot.moveLocal([0,0,1]);
    this.position.updatePosition(this.avatar_pivot.position);
    this.destination.updatePosition(this.avatar_pivot.position);
    this.animatWalk();
  }
  //this function is used by myAgent to move Down 
  moveDown(){
    this.avatar_pivot.moveLocal([0,0,-1]);
    this.position.updatePosition(this.avatar_pivot.position);
    this.destination.updatePosition(this.avatar_pivot.position);
    this.animatWalk();
  }

  goTo(destination){
    this.destination = destination;
    this.onMyWay = true;
  }

  // function which allows us to move to a new point
  moveTo(destination){
    var distance = this.position.getDistanceTo(destination);

    if (distance<1){
      this.avatar_pivot.position = destination.toArray();
      this.position.setPosition(destination);
      this.onMyWay= false;
    }
    else
    {
      this.avatar_pivot.moveLocal([0,0,1]);
      this.position.updatePosition(this.avatar_pivot.position);
      this.animatWalk();
    }
  }
}