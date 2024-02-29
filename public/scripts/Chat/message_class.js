export default class Msg {
  constructor(id,author,content,type,destination="room",time = new Date().toLocaleTimeString()) {
    this.id = id; // User ID
    this.author = author; // UserName
    this.content = content; // Message
    this.type = type; // Type of message
    this.time = time; // Time of message
    this.destination = destination; // Destination of message
  }
}