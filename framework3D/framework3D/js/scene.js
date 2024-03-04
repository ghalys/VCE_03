import Agent  from "./agent_class.js";

var scene = null;
var renderer = null;
var camera = null;
var walkarea = null;
var view = 0;
var eye = null;
var target = null;
var initial_position_camera = [0,40,100];
var pitch =0;

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

	//create camera
	camera = new RD.Camera();
	camera.perspective( 60, gl.canvas.width / gl.canvas.height, 0.1, 1000 );
	camera.lookAt( initial_position_camera,[0,20,0],[0,1,0] );

	var agent = new Agent(1,"julia");
	agent.createAvatar();
	scene.root.addChild( agent.avatar_pivot );

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

		var girlpos = agent.avatar_pivot.localToGlobal([0,1,0]);
		//var campos = girl_pivot.localToGlobal([0,50,0]);
		var camtarget = agent.avatar_pivot.localToGlobal([0,50,70]);
		var smoothtarget = vec3.lerp( vec3.create(), camera.target, camtarget, 0.02 );

		// camera.perspective( 60, gl.canvas.width / gl.canvas.height, 0.1, 1000 );
		if (view==0){
			eye    = initial_position_camera;
			target = girlpos;
		}
		else if(view==1){
			eye    = vec3.lerp(vec3.create(),camera.position,agent.avatar_pivot.localToGlobal([0,50,-80]),0.5); 
			target = agent.avatar_pivot.localToGlobal([0,40,0]);
		}
		else if (view==2){
			eye    = vec3.lerp(vec3.create(),camera.position,agent.avatar_pivot.localToGlobal([0,50,-50]),0.5); 
			target = agent.avatar_pivot.localToGlobal([0,50,0]);
			
		}
		else if (view==3){
			eye    = agent.avatar_pivot.localToGlobal([0,50,0]);
			target = agent.avatar_pivot.localToGlobal([0,40+pitch,100]);			
		}

		camera.lookAt( eye, target, [0,1,0] );

		//clear
		renderer.clear(agent.bg_color);
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

		if(!agent.isDansing){
			agent.animatIdle();
		}
		agent.time_factor = 1;

		//control with keys
		if(gl.keys["UP"])
		{
			agent.moveUp();
		}
		else if(gl.keys["DOWN"])
		{
			agent.moveDown();
			agent.time_factor = -1;
		}
		if(gl.keys["LEFT"])
			agent.rotateLeft(dt);
		else if(gl.keys["RIGHT"])
			agent.rotateRight(dt);

		if(gl.keys["d"]){
			agent.isDansing = ! agent.isDansing;
			agent.animatDance();
			gl.keys["d"] = false;
		}

		if(gl.keys["c"]){
			view = (view+1)%4;
			gl.keys["c"]=false;
		}


		var pos = agent.avatar_pivot.position;
		var nearest_pos = walkarea.adjustPosition( pos );
		agent.avatar_pivot.position = nearest_pos;

		agent.animUpdate(t);
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
			console.log(node);
			
			if( ray.testPlane( RD.ZERO, RD.UP ) ) //collision with infinite plane
			{
				console.log( "floor position clicked", ray.collision_point );
				agent.avatar_pivot.orientTo( ray.collision_point, true, [0,1,0], false, true  );
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
			agent.rotateRight(e.deltax * 0.001);

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