export default class User {
  constructor(id, username, status,agent, time  = new Date().toLocaleTimeString()) {
    this.id = id;
    this.username = username;
    this.status = status;
    this.time = time;
    this.agent = agent;
  }
}