export class Msg {
  constructor(id,author,content,type,destination="room",time = new Date().toLocaleTimeString()) {
    this.id = id; // User ID
    this.author = author; // UserName
    this.content = content; // Message
    this.type = type; // Type of message
    this.time = time; // Time of message
    this.destination = destination; // Destination of message
  }
}

export class User {
  constructor(id, username, status, time  = new Date().toLocaleTimeString()) {
    this.id = id;
    this.username = username;
    this.status = status;
    this.time = time;
  }
}

export class Client {
  constructor(user, WSserver, agent) {
    this.user = user;
    this.WSserver = WSserver;
    this.agent = agent;
  }
}

export class Room{
    constructor(name) {
      this.name = name;
      this.clients = {}; // Map of users indexed by their ID
      this.backgroundImage = null;
    }
  
    addClient(client) {
      this.clients[client.id] = client;
    }
  
    removeClient(client) {
      delete this.clients[client.id];
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

  getRoomNames() {
    return Object.keys(this.rooms);
  }

}

