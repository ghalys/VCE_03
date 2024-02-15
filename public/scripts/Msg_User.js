export class Msg {
  constructor(id,author,content,type,time,room,destination) {
    this.id = id;
    this.author = author;
    this.content = content;
    this.type = type;
    this.time = time;
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

export class Client {
  constructor(user, server) {
    this.user = user;
    this.server = server;
    this.id = server.id;
  }
}

export class Room{
    constructor(name) {
      this.name = name;
      this.clients = {}; // Map of users indexed by their ID
    }
  
    addClient(client) {
      this.users[client.id] = client;
    }
  
    removeClient(client) {
      delete this.users[client.id];
    }
  }

  export class RoomManager {
    constructor() {
      this.rooms = {}; // Map of rooms indexed by their names
    }
  
    addClientToRoom(roomName, client) {
      if (!this.rooms[roomName]) {
        this.rooms[roomName] = new Room(roomName);
      }
      this.rooms[roomName].addClient(client);
    }
  
    removeClientFromRoom(roomName, client) {
      if (this.rooms[roomName]) {
        this.rooms[roomName].removeClient(client);
      }
    }
  
    getClientsInRoom(client) {
      var roomName = client.server.room;
      return this.rooms[roomName] ? Object.values(this.rooms[roomName].clients) : [];
    }

  }



