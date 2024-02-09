export class Msg {
  constructor(id,author,content,type,time,room,destination) {
    this.id = id;
    this.author = author;
    this.content = content;
    this.type = type;
    this.time = time;
    this.room = room;
    this.destination = destination;
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
