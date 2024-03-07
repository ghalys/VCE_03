import Agent from "./agent_class.js";

export default class World2{
  constructor(myAgent){
    this.myAgent = myAgent;
    this.peopleById = {};
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
  getPeople(){
    return this.peopleById;
  }
  
  addOrUpdateAgent(agentState) {
    var id = agentState.id;
    if (id in this.peopleById) {
      this.peopleById[id].updateFromJSON(agentState);
    } else {
      //TODO - Maybe we will need more info to get for the first time like which avatar is chosen
      var agent = new Agent(id, agentState.username); // we have to create a new agent
      agent.createAvatar();
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

}