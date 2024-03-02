export default class Room{
  constructor(name) {
    this.name = name;
    this.clients = {}; // Map of users indexed by their ID
    this.backgroundImage = null;
  }

  addClient(client) {
    this.clients[client.user.id] = client;
  }

  removeClient(client) {
    delete this.clients[client.user.id];
  }
}