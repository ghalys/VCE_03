import Position from "./position.js"

export default class Agent {

  constructor(id,username,avatar ="man", position = new Position(), animation="idle") {
      this.id = id,
      this.username = username,
      this.avatar = avatar,
      this.position = position,
      this.rotation = null;
      this.animation = animation,
      this.animations = {};
      this.isdancing = false;
      this.onMyWay = false // is True when there is a mouse click and the user should go to somewhere till he arrives
      this.destination = null;
      this.avatar_pivot = null;
      this.bg_color = [0.1,0.1,0.1,1];
      this.character = null;
      this.avatar_scale = 0.138;
      this.avatar_selector =null;
      this.time_factor = 1;
      this.walkArea = null;
      this.panel = null;
      this.flag = "es";
      this.updatePanel = null;
      this.skin = "casual";
      this.skinVersion = "casualman";
      
    }

  updateSkin(avatar,skin,skinVersion){
    var old_avatar = this.avatar;
    this.avatar = avatar;
    this.skin = skin;
    this.skinVersion = skinVersion;

    if (this.avatar =="girl"){
      this.avatar_scale  =  0.3;
    }
    else{
      this.avatar_scale  =  0.138;
    }

    var mat = new RD.Material({textures: {
      color: "skins/"+this.avatar+"/"+this.skin+"/"+this.skinVersion+".png" }
      });
    mat.register(this.username);
    this.character.scaling = this.avatar_scale;
    this.character.mesh = this.avatar + "/avatar.wbin";
    
    if(old_avatar!= this.avatar){
      this.loadAnimation("idle"   ,"../media/assets3D/"+this.avatar+"/idle.skanim");
      this.loadAnimation("walking","../media/assets3D/"+this.avatar+"/walking.skanim");
      this.loadAnimation("dance"  ,"../media/assets3D/"+this.avatar+"/dance.skanim");
    }
  }

  setWalkArea(walkArea){
    this.walkArea = walkArea;
  }
  changeFlag(flag){
    this.flag = flag;
    this.updatePanel(flag);
  }

  //load some animations
	loadAnimation( name, url )
	{
		this.animations[name] = new RD.SkeletalAnimation();
		this.animations[name].load(url);
	}

  createAvatar(){
  if (this.avatar =="girl"){
    this.avatar_scale  =  0.3;
  }
  else{
    this.avatar_scale  =  0.138;
  }
	//create material for the girl
	var mat = new RD.Material({textures: {
                            color: "skins/"+this.avatar+"/"+this.skin+"/"+this.skinVersion+".png" }
                            });
	mat.register(this.username);

	//create pivot point for the girl
	this.avatar_pivot = new RD.SceneNode({
		position: this.position.toArray()
	});
  this.rotation = this.avatar_pivot.rotation;

	//create a mesh for the girl
	this.character = new RD.SceneNode({
		scaling: this.avatar_scale,
		mesh: this.avatar + "/avatar.wbin",
		material: this.username
	});

	this.avatar_pivot.addChild(this.character);
	this.character.skeleton = new RD.Skeleton();

  this.avatar_selector = new RD.SceneNode({
		position: [0,20,0],
		mesh: "cube",
		material: ""+this.id,
		scaling: [8,20,8],
		name: this.avatar + "_selector",
		layers: 0b1000
	});
	this.avatar_pivot.addChild( this.avatar_selector );

  this.loadAnimation("idle"   ,"../media/assets3D/"+this.avatar+"/idle.skanim");
	this.loadAnimation("walking","../media/assets3D/"+this.avatar+"/walking.skanim");
	this.loadAnimation("dance"  ,"../media/assets3D/"+this.avatar+"/dance.skanim");
  }


  sendJSON(){
    return {
            id        : this.id,
            username  : this.username,
            position  : this.position,
            rotation  : this.rotation,
            animation : this.animation,
            isdancing : this.isdancing,
            onMyWay   : this.onMyWay,
            flag      : this.flag,
            }
  }
  updateFromJSON(msgJSON){
    this.username  = msgJSON.username;
    this.rotation  = msgJSON.rotation;
    this.animation = msgJSON.animation;
    this.isdancing = msgJSON.isdancing;
    this.onMyWay   = msgJSON.onMyWay;
    this.position.updatePosition(msgJSON.position);
    if(this.flag != msgJSON.flag){
      this.changeFlag(msgJSON.flag);
    }
  }

  setId(id){
      this.id=id;
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
  animUpdate(t,camera){
    //update position and rotation
    this.avatar_pivot.position = this.position.toArray();
    this.avatar_pivot.rotation = this.rotation;

		//move bones in the skeleton based on animation
		this.animations[this.animation].assignTime( t * 0.001 * this.time_factor );
		//copy the skeleton in the animation to the character
		this.character.skeleton.copyFrom( this.animations[this.animation].skeleton );
    
    //if the panel has been created
    if(this.panel){
      this.panel.position = this.position.getPositionOfUsername();
      this.panel.lookAt(this.panel.position,camera.position,[0,1,0]);
      this.panel.rotate(180*DEG2RAD,[0,1,0]);
    }
  }

  moveUp(){
    this.avatar_pivot.moveLocal([0,0,1]);
    if(!this.walkArea.isInsideArea(this.avatar_pivot.position)){
      this.avatar_pivot.moveLocal([0,0,-1]);
    }
    else{
      this.position.setPosition(this.avatar_pivot.position);
      this.animatWalk();
    }
  }
  moveDown(){
    this.avatar_pivot.moveLocal([0,0,-1]);
    if(!this.walkArea.isInsideArea(this.avatar_pivot.position)){
      this.avatar_pivot.moveLocal([0,0,+1]);
    }
    else{
      this.position.setPosition(this.avatar_pivot.position);
      this.animatWalk();
    }
  }

  goTo(destination){
    this.destination = destination;
    this.onMyWay = true;
  }
  // function which allows us to move to a new point
  moveTo(destination){
    var distance = this.position.getDistanceTo(destination);

    if (distance<1){
      this.avatar_pivot.position = destination;
      this.position.setPosition(destination);
      this.onMyWay= false;
    }
    else
    {
      this.avatar_pivot.moveLocal([0,0,1]);
      this.position.setPosition(this.avatar_pivot.position);
      this.animatWalk();
    }

  }
  createPanel(image){
    this.createTexture(image);
    var position  = [this.position.x,this.position.y+45,this.position.z]
    //create a node
    this.panel = new RD.SceneNode({ mesh: "plane", scale: [15, 5, 0], position: position, flags: { two_sided: true } });
    this.panel.texture = this.username; //assign canvas texture to node
  }
  createTexture(image){
    var text = this.username;
		//writting a text in 3D
		var texture;
		var canvas = document.createElement("canvas");
		canvas.width = 512;
		canvas.height = 256;
		var ctx = canvas.getContext("2d");
		
    // display the flag as an image
    var imageWidth = 128; // Largeur désirée de l'image
    var imageHeight = canvas.height; // Hauteur égale à celle du canvas
    ctx.drawImage(image, 0, 0, imageWidth, imageHeight);
    
    // display the username
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "Bold 100px Arial";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    var textX = imageWidth + 160;
    var textY = canvas.height/2 + 30
    ctx.fillText(text, textX, textY);

    //create a texture to upload the offscreen canvas 
    texture = GL.Texture.fromImage(canvas, { wrap: gl.CLAMP_TO_EDGE });
    gl.textures[text] = texture; //give it a name
  }
}