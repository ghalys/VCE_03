import Agent from "./agent_class.js";

export default class World {
  constructor(myAgent, canvas) {
    this.myAgent = myAgent;
    this.peopleById = {};
    // this.images = {};
    this.canvas = canvas;
    this.WSserver = null;
  }

  set_ID_and_Server(WSServer) {
    this.myAgent.setId(WSServer.user_id);
    this.WSserver = WSServer;
  }
  
  initialisation() {
    console.log("tick should start correctly");
    //send the Agent state to the server every 50ms
    setInterval(this.onTick, 1000 / 20);
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

  //get image
  getImage(avatar, callback) {
    var url = avatar; 
    if (this.images[url]) {
      callback(this.images[url]);
      return;
    }
    var img = new Image();
    img.onload = () => {
      this.images[url] = img;
      callback(img);
    };
    img.onerror = function () {
      console.error("Failed to load image at " + url);
    };
    img.src = url;
  }

  drawAgent(ctx, Agent) {
    this.getImage("media/avatars/"+Agent.avatar+".png", (img) => {
      ctx.imageSmoothingEnabled = false;

      // Define a speed modifier
      var speedModifier = 0.5;

      // Adjust the frame calculation to include the speed modifier
      var frame_num = Math.floor(
        ((performance.now() / 100) * speedModifier) % Agent.animation.length
      );
      var anim = Agent.animation;
      var frame = anim[frame_num % anim.length];
      ctx.drawImage(
        img,
        32 * frame,
        64 * Agent.facing,
        32,
        64,
        Agent.position.x - 32,
        Agent.position.y - 64,
        32 * 2,
        64 * 2
      );

      // write the username on the top of the agent
      ctx.font = "10px Arial";
      ctx.fillStyle = "red";
      ctx.fillText(
        Agent.username,
        Agent.position.x - 16,
        Agent.position.y - 64
      );
    });
  }

  draw() {
    var rect = this.canvas.parentNode.getBoundingClientRect();
    this.canvas.width = Math.floor(rect.width);
    this.canvas.height = Math.floor(rect.height);

    var ctx = this.canvas.getContext("2d");
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.resetTransform();
    ctx.translate(this.canvas.width / 2, this.canvas.height * (2 / 3));
    ctx.scale(2, 2);

    for (let id in this.peopleById) {
      var Agent = this.peopleById[id];
      this.drawAgent(ctx, Agent);
    }

    this.drawAgent(ctx, this.myAgent);
  }
}
