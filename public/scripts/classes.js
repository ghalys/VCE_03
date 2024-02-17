export class Msg {
  constructor() {
    this.id = null; // User ID
    this.author = null; // UserName
    this.content = null; // Message
    this.type = null; // Type of message: text, join, leave
    this.time = null; // Time of message
  }
  create(id, author, content, type, time = new Date().getTime()) {
    this.id = id;
    this.author = author;
    this.content = content;
    this.type = type;
    this.time = time;
  }
}

export class User {
  constructor() {
    this.id = null;
    this.username = null;
    this.password = null;
    this.rooms = [];
  }
  create(id, username, password, rooms = []) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.rooms = rooms;
  }
}
