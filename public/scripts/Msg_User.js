export class Msg {
  constructor() {
    this.id = null;
    this.author = null;
    this.content = null;
    this.type = null;
    this.time = null;
    this.room = null;
    this.destination = null;
  }
}
export class User {
  constructor(id, username, status, time) {
    this.id = id;
    this.username = username;
    this.status = status;
    this.time = time;
  }
}
