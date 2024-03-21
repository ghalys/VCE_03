import Agent  from "./World/agent_class.js";
import World2  from "./World/World.js";
import MyChat from "./ClientServer/myChat.js";
import {testingLocally} from "./testing.js";

var scene = null;
var renderer = null;
var camera = null;
var walkarea = null;
var view = 0;
var eye = null;
var target = null;
var initial_position_camera = [0,40,100];
var pitch = 0;
var images ={};



const username = document.cookie.split('; ').find(row => row.startsWith('username='))?.split('=')[1];
const password = document.cookie.split('; ').find(row => row.startsWith('password='))?.split('=')[1];


export var myAgent = new Agent(1,username);
var myWorld = new World2(myAgent); 
window.myWorld = myWorld;

init();
export var FelixChat = new MyChat();
FelixChat.create(document.getElementById("mychat"));
FelixChat.init(testingLocally, username, myWorld);

function init()
{
	var canvas = document.getElementById("scene");
	//create the rendering context
	var context = GL.create({canvas:canvas});

	//setup renderer
	renderer = new RD.Renderer(context);
	renderer.setDataFolder("../media/assets3D/");
	renderer.autoload_assets = true;
	

	//create a scene
	scene = new RD.Scene();
	window.scene = scene;
	
	//create camera
	camera = new RD.Camera();
	camera.perspective( 60, gl.canvas.width / gl.canvas.height, 0.1, 1000 );
	camera.lookAt( initial_position_camera,[0,20,0],[0,1,0] );
	

	
	myAgent.createAvatar();
	scene.root.addChild(myAgent.avatar_pivot );
	addPanel(myAgent);

	myWorld.addAvatarToScene = (agent)=>{
		agent.createAvatar();
		scene.root.addChild(agent.avatar_pivot );
		addPanel(agent);
	}

	myWorld.removeAvatarFromScene = (agent)=>{
		scene.root.removeChild(agent.avatar_pivot);
		scene.root.removeChild(agent.panel);
	}
	myWorld.cleanTheScene = ()=>{
		for (let id in myWorld.peopleById)	{
			var agent = myWorld.peopleById[id];
			scene.root.removeChild(agent.avatar_pivot)
			scene.root.removeChild(agent.panel);
		}
	}	


	walkarea = new WalkArea();
	walkarea.addRect([-50,0,-30],80,50);
	walkarea.addRect([-90,0,-10],80,20);
	walkarea.addRect([-110,0,-30],40,50);

	myAgent.setWalkArea(walkarea);


	//load a GLTF for the room
	var room = new RD.SceneNode({scaling:40,position:[0,-.01,0]});
	room.loadGLTF("scripts/World/data/room.gltf");
	scene.root.addChild( room );

	var gizmo = new RD.Gizmo();
	gizmo.mode = RD.Gizmo.ALL;

	// main loop ***********************

	//main draw function
	context.ondraw = function(){
		var Canvastyle = window.getComputedStyle(canvas);
		gl.canvas.width = parseFloat(Canvastyle.width);
		gl.canvas.height = parseFloat(Canvastyle.height);
		gl.viewport(0,0,gl.canvas.width,gl.canvas.height);

		var girlpos = myAgent.avatar_pivot.localToGlobal([0,1,0]);

		// camera.perspective( 60, gl.canvas.width / gl.canvas.height, 0.1, 1000 );
		if (view==0){
			eye    = initial_position_camera;
			target = girlpos;
		}
		else if(view==1){
			eye    = vec3.lerp(vec3.create(),camera.position,myAgent.avatar_pivot.localToGlobal([0,50,-80]),0.5); 
			target = myAgent.avatar_pivot.localToGlobal([0,40,0]);
		}
		else if (view==2){
			eye    = vec3.lerp(vec3.create(),camera.position,myAgent.avatar_pivot.localToGlobal([0,50,-50]),0.5); 
			target = myAgent.avatar_pivot.localToGlobal([0,50,0]);
			
		}
		else if (view==3){
			eye    = myAgent.avatar_pivot.localToGlobal([0,50,0]);
			target = myAgent.avatar_pivot.localToGlobal([0,40+pitch,100]);			
		}
		
		camera.lookAt( eye, target, [0,1,0] );
		
		//hide the panel according to the view
		if(myAgent.panel){
			if(view ==0){
				myAgent.panel.visible = true;
			}
			else{
				myAgent.panel.visible = false;
			}
		}

		//clear
		renderer.clear(myAgent.bg_color);
		//TODO - verify if I have to change this ??
		// renderer.clear(otherAgent.bg_color);
		
		//render scene
		renderer.render(scene, camera, null, 0b11 );

		// var vertices = walkarea.getVertices();
		// renderer.renderPoints( vertices, null, camera, null,null,null,gl.LINES );

		// gizmo.setTargets([monkey]);
		// renderer.render( scene, camera, [gizmo] ); //render gizmo on top
	}
	//main update
	context.onupdate = function(dt)
	{
		//not necessary but just in case...
		scene.update(dt);
		var t = getTime();

		if(myAgent.onMyWay){
			myAgent.moveTo(myAgent.destination);
		}
		else if (!myAgent.isdancing){
			myAgent.animatIdle();
		}
		myAgent.time_factor = 1;

		//control with keys
		if(gl.keys["UP"])
		{
			myAgent.moveUp();
			myAgent.onMyWay = false; // we fix it to false in case we were walking towards a destination and we don't want to go to it anymore
		}
		else if(gl.keys["DOWN"])
		{
			myAgent.moveDown();
			myAgent.onMyWay = false;
			myAgent.time_factor = -1;
		}
		if(gl.keys["LEFT"])
			myAgent.rotateLeft(dt);
		else if(gl.keys["RIGHT"])
			myAgent.rotateRight(dt);

		if(gl.keys["d"]){
			myAgent.isdancing = ! myAgent.isdancing;
			myAgent.animatDance();
			gl.keys["d"] = false;
		}

		if(gl.keys["c"]){
			view = (view+1)%4;
			gl.keys["c"]=false;
		}


		var pos = myAgent.avatar_pivot.position;
		var nearest_pos = walkarea.adjustPosition( pos );
		myAgent.avatar_pivot.position = nearest_pos;
		
		myAgent.animUpdate(t,camera);

		for (var agent of Object.values(myWorld.getPeople())){
			agent.animUpdate(t,camera);
		}
	}

	//user input ***********************

	context.onmouse = function(e)
	{
		//gizmo.onMouse(e);
	}

	//detect clicks
	context.onmouseup = function(e)
	{
		if(e.click_time < 200) //fast click
		{
			//compute collision with scene
			var ray = camera.getRay(e.canvasx, e.canvasy);
			var node = scene.testRay( ray, null, 10000, 0b1000 );
			
			if( ray.testPlane( RD.ZERO, RD.UP ) ) //collision with infinite plane
			{
				var destination = walkarea.adjustPosition(ray.collision_point);
				myAgent.avatar_pivot.orientTo(destination, true, [0,1,0], false, true  );
				myAgent.goTo(destination);
			}
			
		}
	}

	context.onmousemove = function(e)
	{
		if(e.dragging)
		{
			pitch -= e.deltay*0.1;
			myAgent.rotateRight(e.deltax * 0.001);
			
		}
	}

	context.onmousewheel = function(e)
	{
		//move camera forward
		camera.moveLocal([0,0,e.wheel < 0 ? 10 : -10] );
	}
	
	//capture mouse events
	context.captureMouse(true);
	context.captureKeys();
	
	//launch loop
	context.animate();
	
};

//get image
function getImage(flag, callback) {
	var url = "../media/flags/"+flag+".png";
	if (images[flag]) {
		callback(images[flag]);
		return;
	}
	var img = new Image();
	img.src = url;
	img.onload = () => {
		images[flag] = img;
		console.log("image loaded of "+flag);
		callback(img);
	};
	img.onerror = function () {
		console.error("Failed to load image at " + url);
	};
}

function addPanel(agent){
	getImage(agent.flag,(img)=> {
		agent.createPanel(img)
		scene.root.addChild(agent.panel);
	});

	agent.updatePanel = ()=>{
		getImage(agent.flag,(img)=>{
			agent.createTexture(img);
			agent.panel.texture = agent.username;
		});
	}
}