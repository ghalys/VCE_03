class Msg {
  constructor() {
    this.id = null;
    this.author = null;
    this.content = null;
    this.type = null;
    this.time = null;
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
