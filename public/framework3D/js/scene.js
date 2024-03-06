import Agent  from "./agent_class.js";
import World2  from "./World2.js";

var scene = null;
var renderer = null;
var camera = null;
var walkarea = null;
var view = 0;
var eye = null;
var target = null;
var initial_position_camera = [0,40,100];
var pitch = 0;
var myAgent = new Agent(1,"julia");
var otherAgent = new Agent(2,"jua");
var myWorld = new World2(myAgent); 
myWorld.addOrUpdateAgent(otherAgent.sendJSON());
window.myWorld = myWorld;

//translation
// const res = await fetch("https://libretranslate.com/translate", {
	//   method: "POST",
	//   body: JSON.stringify({
		//     q: "Hello!",
		//     source: "en",
		//     target: "es"
		//   }),
		//   headers: { "Content-Type": "application/json" }
		// });
		
		// console.log(await res.json());
		
		function init()
{
	// setInterval(myWorld.onTick, 1000 / 20);
	
	//create the rendering context
	var context = GL.create({width: window.innerWidth, height:window.innerHeight});

	//setup renderer
	renderer = new RD.Renderer(context);
	renderer.setDataFolder("data");
	renderer.autoload_assets = true;
	
	//attach canvas to DOM
	document.body.appendChild(renderer.canvas);
	
	//create a scene
	scene = new RD.Scene();
	window.scene = scene;
	
	//create camera
	camera = new RD.Camera();
	camera.perspective( 60, gl.canvas.width / gl.canvas.height, 0.1, 1000 );
	camera.lookAt( initial_position_camera,[0,20,0],[0,1,0] );
	
	myAgent.createAvatar();
	scene.root.addChild( myAgent.avatar_pivot );

	// otherAgent.createAvatar();
	// scene.root.addChild( otherAgent.avatar_pivot );
	for (var agent of Object.values(myWorld.getPeople())){
		agent.createAvatar();
		scene.root.addChild(agent.avatar_pivot);
	}
	
	

	walkarea = new WalkArea();
	walkarea.addRect([-50,0,-30],80,50);
	walkarea.addRect([-90,0,-10],80,20);
	walkarea.addRect([-110,0,-30],40,50);



	//load a GLTF for the room
	var room = new RD.SceneNode({scaling:40,position:[0,-.01,0]});
	room.loadGLTF("data/room.gltf");
	scene.root.addChild( room );

	var gizmo = new RD.Gizmo();
	gizmo.mode = RD.Gizmo.ALL;

	// main loop ***********************

	//main draw function
	context.ondraw = function(){
		gl.canvas.width = document.body.offsetWidth;
		gl.canvas.height = document.body.offsetHeight;
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

		//clear
		renderer.clear(myAgent.bg_color);
		//TODO - verify if I have to change this ??
		// renderer.clear(otherAgent.bg_color);
		
		//render scene
		renderer.render(scene, camera, null, 0b11 );

		var vertices = walkarea.getVertices();
		renderer.renderPoints( vertices, null, camera, null,null,null,gl.LINES );

		//gizmo.setTargets([monkey]);
		//renderer.render( scene, camera, [gizmo] ); //render gizmo on top
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

		myAgent.animUpdate(t);

		for (var agent of Object.values(myWorld.getPeople())){
			agent.animUpdate(t);
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
			// console.log(node);
			
			if( ray.testPlane( RD.ZERO, RD.UP ) ) //collision with infinite plane
			{
				var destination = walkarea.adjustPosition(ray.collision_point);
				console.log( "floor position clicked", ray.collision_point );
				myAgent.avatar_pivot.orientTo(destination, true, [0,1,0], false, true  );
				myAgent.goTo(destination);
			}
			
		}
	}

	context.onmousemove = function(e)
	{
		if(e.dragging)
		{
			//orbit camera around
			//camera.orbit( e.deltax * -0.01, RD.UP );
			//camera.position = vec3.scaleAndAdd( camera.position, camera.position, RD.UP, e.deltay );
			// camera.move([-e.deltax*0.1, e.deltay*0.1,0]);
			//girl_pivot.rotate(e.deltax*-0.003,[0,1,0]);
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
	
}


init();