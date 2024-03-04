import Position from "./position.js"

export default class Agent {

  constructor(id,username,avatar ="girl", position = new Position(), animation="idle") {
      this.id = id,
      this.username =username,
      this.avatar = avatar,
      this.position = position,
      this.animation= animation,
      this.onMyWay = false // is True when there is a mouse click and the user should go to somewhere till he arrives
      this.avatar_pivot = null;
      this.bg_color = [0.1,0.1,0.1,1];
      this.avatar = avatar;
      this.character = null;
      this.avatar_scale = 0.3;
      this.animations = {};
      this.avatar_selector =null;
      this.time_factor = 1;
      this.isDansing = false;

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
		var anim = animations[name] = new RD.SkeletalAnimation();
		anim.load(url);
		return anim;
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

  this.loadAnimation("idle","data/"+this.avatar+"/idle.skanim");
	this.loadAnimation("walking","data/"+this.avatar+"/walking.skanim");
	this.loadAnimation("dance","data/"+this.avatar+"/dance.skanim");
  }

  loadAnimation( name, url )
	{
		this.animations[name] = new RD.SkeletalAnimation();
		this.animations[name].load(url);
	}
  
  sendJSON(){
    return {
            id : this.id,
            facing: this.facing,
            position : this.position,
            animation :this.animation,
            }
  }
  updateFromJSON(msgJSON){
    this.facing = msgJSON.facing;
    this.position = msgJSON.position;
    this.animation= msgJSON.animation;
  }

  setId(id){
      this.id=id;
  }
  changeAvatar(avatar){
    this.avatar = avatar;
  }


  rotateLeft(dt){
    this.avatar_pivot.rotate(90*DEG2RAD*dt,[0,1,0]);
  }
  rotateRight(dt){
    this.avatar_pivot.rotate(-90*DEG2RAD*dt,[0,1,0]);
  }

  //function for changing the animation
  animatIdle(){
    this.animation = this.animations.idle;
  }
  animatWalk(){
    this.animation = this.animations.walking;
    
    //in case we were dansing before walking
    this.isDansing =false;
  }
  animatDance(){
    if (this.isDansing){
      this.animation = this.animations.dance;
    }
  }
  animUpdate(t){
		//move bones in the skeleton based on animation
		this.animation.assignTime( t * 0.001 * this.time_factor );
		//copy the skeleton in the animation to the character
		this.character.skeleton.copyFrom( this.animation.skeleton );
  }

  moveUp(){
    this.avatar_pivot.moveLocal([0,0,1]);
    this.animatWalk();
  }
  moveDown(){
    this.avatar_pivot.moveLocal([0,0,-1]);
    this.animatWalk();
  }


  // //function for changing face direction
  // facingRight(){
  //   this.facing = Agent.FACING.RIGHT;
  // }
  // facingLeft(){
  //   this.facing = Agent.FACING.LEFT;
  // }
  // facingFront(){
  //   this.facing = Agent.FACING.FRONT;
  // }
  // facingBack(){
  //   this.facing = Agent.FACING.BACK;
  // }

  // animatSit(){
  //   this.animation = Agent.ANIMATION.SIT;
  // }
  // animatTalk(){
  //   this.animation = Agent.ANIMATION.TALK;
  // }

  // //walk to the right
  // moveToRight(dt){
  //   this.facingRight();
  //   this.animatWalk();
  //   this.position.x += dt*32;
  // }
  // //walk to the left
  // moveToLeft(dt){
  //   this.facingLeft();
  //   this.animatWalk();
  //   this.position.x -= dt*32;
  // }
  // //sit down
  // sitDown(){
  //   this.animatSit();
  // }
  // //stand up
  // standUp(){
  //   this.animatIdle();
  // }

  // // function which allows us to move to a new point
  // moveTo(newX, newY = this.position.y) {
  //   this.position.setPosition(newX, newY);
  // }

  // // walk to the mouse 
  // walkTo(newX,dt){

  //   if(newX>this.position.x){ //we move to the right
  //     //if we are close to the destination
  //     if(Math.abs(newX-this.position.x)<=32*dt){ 
  //       var dx = newX-this.position.x;
  //       this.moveToRight(dx/32);
  //       this.onMyWay = false
  //     }
  //     else{// if we are far from the destination
  //       this.moveToRight(dt)
  //     }
  //   }
  //   else if(newX<this.position.x){ // We move to the left
  //     if(Math.abs(newX-this.position.x)<=32*dt){ //if we are close
  //       var dx = this.position.x-newX;
  //       this.moveToLeft(dx/32);
  //       this.onMyWay = false
  //     }
  //     else{// if we are far from the destination
  //       this.moveToLeft(dt)
  //     }
  //   }
  //   else{ //we already arrived
  //     this.animatIdle();
  //     this.onMyWay = false;
  //   }
  // }

}