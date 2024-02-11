class Msg {
  constructor() {
    this.id = null; // User ID
    this.author = null; // UserName
    this.content = null; // Message
    this.type = null; // Type of message: text, join, leave
    this.time = null; // Time of message
  }
}

class User {
  constructor() {
    this.id = null;
    this.username = null;
    this.status = null;
    this.time = null;
  }
}

export default { Msg, User };
