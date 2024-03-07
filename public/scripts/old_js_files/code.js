var scene = null;
var renderer = null;
var camera = null;
var character = null;

var animations = {};
var animation = null;

var walkarea = null;

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
	camera.lookAt( [0,40,100],[0,20,0],[0,1,0] );

	//global settings
	var bg_color = [0.1,0.1,0.1,1];
	var avatar = "girl";
	var avatar_scale = 0.3;
	//var avatar = "tiger";
	//var avatar_scale = 1.5;

	//create material for the girl
	var mat = new RD.Material({
		textures: {
		 color: "girl/girl.png" }
		});
	mat.register("girl");

	//create pivot point for the girl
	var girl_pivot = new RD.SceneNode({
		position: [-40,0,0]
	});

	//create a mesh for the girl
	var girl = new RD.SceneNode({
		scaling: avatar_scale,
		mesh: avatar + "/" + avatar +".wbin",
		material: "girl"
	});
	girl_pivot.addChild(girl);
	girl.skeleton = new RD.Skeleton();
	scene.root.addChild( girl_pivot );

	var girl_selector = new RD.SceneNode({
		position: [0,20,0],
		mesh: "cube",
		material: "girl",
		scaling: [8,20,8],
		name: "girl_selector",
		layers: 0b1000
	});
	girl_pivot.addChild( girl_selector );

	walkarea = new WalkArea();
	walkarea.addRect([-50,0,-30],80,50);
	walkarea.addRect([-90,0,-10],80,20);
	walkarea.addRect([-110,0,-30],40,50);


	character = girl;

	//load some animations
	function loadAnimation( name, url )
	{
		var anim = animations[name] = new RD.SkeletalAnimation();
		anim.load(url);
		return anim;
	}
	loadAnimation("idle","data/"+avatar+"/idle.skanim");
	loadAnimation("walking","data/"+avatar+"/walking.skanim");
	//loadAnimation("dance","data/girl/dance.skanim");

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

		var girlpos = girl_pivot.localToGlobal([0,40,0]);
		//var campos = girl_pivot.localToGlobal([0,50,0]);
		var camtarget = girl_pivot.localToGlobal([0,50,70]);
		var smoothtarget = vec3.lerp( vec3.create(), camera.target, camtarget, 0.02 );

		camera.perspective( 60, gl.canvas.width / gl.canvas.height, 0.1, 1000 );
		camera.lookAt( camera.position, girlpos, [0,1,0] );

		//clear
		renderer.clear(bg_color);
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
		var anim = animations.idle;
		var time_factor = 1;

		//control with keys
		if(gl.keys["UP"])
		{
			girl_pivot.moveLocal([0,0,1]);
			anim = animations.walking;
		}
		else if(gl.keys["DOWN"])
		{
			girl_pivot.moveLocal([0,0,-1]);
			anim = animations.walking;
			time_factor = -1;
		}
		if(gl.keys["LEFT"])
			girl_pivot.rotate(90*DEG2RAD*dt,[0,1,0]);
		else if(gl.keys["RIGHT"])
			girl_pivot.rotate(-90*DEG2RAD*dt,[0,1,0]);

		var pos = girl_pivot.position;
		var nearest_pos = walkarea.adjustPosition( pos );
		girl_pivot.position = nearest_pos;

		//move bones in the skeleton based on animation
		anim.assignTime( t * 0.001 * time_factor );
		//copy the skeleton in the animation to the character
		character.skeleton.copyFrom( anim.skeleton );
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
				girl_pivot.orientTo( ray.collision_point, true, [0,1,0], false, true  );
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
			camera.move([-e.deltax*0.1, e.deltay*0.1,0]);
			//girl_pivot.rotate(e.deltax*-0.003,[0,1,0]);

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


