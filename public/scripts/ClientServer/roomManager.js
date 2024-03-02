import Room from "../Chat/room_class.js";

export default class RoomManager {
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
    var roomName = client.WSserver.room;
    return this.rooms[roomName] ? Object.values(this.rooms[roomName].clients) : [];
  }

  getRoomNames() {
    return Object.keys(this.rooms);
  }

}