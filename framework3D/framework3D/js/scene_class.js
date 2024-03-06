import Agent from "./agent_class.js";

export default class Scene{
  constructor(myAgent){
    this.camera = null;
    this.scene = null;
    this.renderer = null;
    this.walkarea = null;
    this.view = 0;
    this.eye = null;
    this.target = null;
    this.initial_position_camera = [0,40,100];
    this.pitch =0;

    this.myAgent = myAgent;
    this.peopleById = {};
    this.WSserver = null;

  }

  set_ID_and_Server(WSServer) {
    this.myAgent.setId(WSServer.user_id);
    this.WSserver = WSServer;
  }

  init(){
		const RD = window.RD;
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

    myAgent.createAvatar();
    console.log(myAgent.id);
    scene.root.addChild( myAgent.avatar_pivot );

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

    context.onupdate = this.on_update;
    context.ondraw = this.on_draw;
    context.onmouseup = this.on_mouseup;
    context.onmousemove = this.on_mousemove;
    context.onmousewheel = this.on_mousewheel;
    

    //capture mouse events
    context.captureMouse(true);
    context.captureKeys();

    //launch loop
    context.animate();

    // console.log("tick should start correctly");
    // //send the Agent state to the server every 50ms
    // setInterval(this.onTick, 1000 / 20);
  }

  onTick = () => {
    //Create the Agent state to the server
    var myState = this.myAgent.sendJSON();
    this.WSserver.sendAgentState(myState);
  };

  leaveTheRoom() {
    this.peopleById = {};
  }
  
  addOrUpdateAgent(agentState) {
    var id = agentState.id;
    if (id in this.peopleById) {
      this.peopleById[id].updateFromJSON(agentState);
    } else {
      //TODO - Maybe we will need more info to get for the first time like which avatar is chosen
      var agent = new Agent(id, agentState.username); // we have to create a new agent
      agent.updateFromJSON(agentState);
      this.peopleById[id] = agent;
    }
  }

  removeAgent(agent_state) {
    //if the id is present, we remove the agent from myWorld
    if (agent_state.id in this.peopleById) {
      delete this.peopleById[agent_state.id];
    }
  }



  	//main draw function
	on_draw = function(){
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
		//render scene
		renderer.render(scene, camera, null, 0b11 );

		var vertices = walkarea.getVertices();
		renderer.renderPoints( vertices, null, camera, null,null,null,gl.LINES );

		//gizmo.setTargets([monkey]);
		//renderer.render( scene, camera, [gizmo] ); //render gizmo on top
	}

  //main update
  on_update(dt){
   //not necessary but just in case...
		scene.update(dt);

		var t = getTime();

		if(!myAgent.isdancing){
			myAgent.animatIdle();
		}
		myAgent.time_factor = 1;

		//control with keys
		if(gl.keys["UP"])
		{
			myAgent.moveUp();
		}
		else if(gl.keys["DOWN"])
		{
			myAgent.moveDown();
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
	}

  //detect clicks
	on_mouseup = function(e)
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
				myAgent.avatar_pivot.orientTo( ray.collision_point, true, [0,1,0], false, true  );
			}
			
		}
	}

	on_mousemove = function(e)
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

	on_mousewheel = function(e)
	{
		//move camera forward
		camera.moveLocal([0,0,e.wheel < 0 ? 10 : -10] );
	}
}