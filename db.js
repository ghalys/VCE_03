import mysql from "mysql2";
import wrapper from "node-mysql-wrapper";
import { Msg, User } from "./public/scripts/classes.js";
import util from "util";
import md5 from "md5";

// const client = mysql.createConnection({
//   database: "ecv-2019",
//   user: "ecv-user",
//   password: "ecv-upf-2019",
//   host: "127.0.0.1",
// });

// Class to manage the database
class DB {
  constructor() {
    this.client = mysql.createConnection({
      database: "ecv-2019",
      user: "ecv-user",
      password: "ecv-upf-2019",
      host: "127.0.0.1",
    });

    // this.client = mysql.createConnection({
    //   database: "VCE",
    //   user: "root",
    //   password: "root",
    //   host: "localhost",
    // });
    this.db = wrapper.wrap(this.client);
    this.users = [];
    this.rooms = [];
    this.messages = {};
    this.db.ready(() => {
      console.log("Database is ready");
    });
  }
  async initializeTables() {
    const queryAsync = util.promisify(this.client.query).bind(this.client);

    return Promise.all([
      // Table users_FG saves the users of the chat with
      // their a new id, name, password and the id of the rooms they have access to
      queryAsync(
        "CREATE TABLE IF NOT EXISTS users_FG (user_id INT AUTO_INCREMENT PRIMARY KEY, user_name VARCHAR(100), password VARCHAR(100), rooms TEXT)"
      ),
      // Table rooms_FG saves the rooms of the chat with
      // a new id, name and description
      queryAsync(
        "CREATE TABLE IF NOT EXISTS rooms_FG (room_id INT AUTO_INCREMENT PRIMARY KEY, room_name VARCHAR(100), room_description TEXT)"
      ),
      // Table messages_FG saves the messages of the chat with
      // a new id, the id of the user who sent the message, the id of the room where the message was sent, the message, the type of message and the timestamp
      queryAsync(
        "CREATE TABLE IF NOT EXISTS messages_FG (message_id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, room_id INT, message TEXT, type VARCHAR(50), timestamp DATETIME, FOREIGN KEY (user_id) REFERENCES users_FG(user_id) ON DELETE CASCADE, FOREIGN KEY (room_id) REFERENCES rooms_FG(room_id) ON DELETE CASCADE)"
      ),
    ]);
  }

  handleData(data, info) {
    console.log("Data received from the Server");

    switch (info) {
      case "users":
        this.addUser(data.user_name, data.password);
        break;
      case "rooms":
        this.addRoom(data.room_name, data.room_description);
        break;
      case "messages":
        this.addMessages(
          data.user_id,
          data.room_id,
          data.message,
          data.timestamp
        );
        break;
    }
  }

  async retrieveData(info, room) {
    switch (info) {
      case "users":
        return await this.getAllUsers();
      case "rooms":
        return await this.getAllRooms();
      case "messages":
        return await this.getMsgHistory(room);
      default:
        throw new Error("No info specified");
    }
  }

  addUser(name, password, rooms = []) {
    // encrypt password with md5 and extra string for security
    var encrypt_pw = md5(password + "salt");

    // Save the user using a query because the save method of the wrapper is not working
    // while avoiding SQL injection
    this.client.query(
      "INSERT INTO users_FG (user_name, password, rooms) VALUES (?, ?, ?)",
      [name, encrypt_pw, rooms],
      (err, result) => {
        if (err) throw err;
        console.log(`User ${name} added to the database`);
      }
    );
  }

  addRoom(name, description = "") {
    // Save the room to the database using query because the save method of the wrapper is not working
    // while avoiding SQL injection
    this.client.query(
      "INSERT INTO rooms_FG (room_name, room_description) VALUES (?, ?)",
      [name, description],
      (err, result) => {
        if (err) throw err;
        console.log(`Room ${name} added to the database`);
      }
    );
  }

  addMessages(user_id, room_id, message) {
    // Parse the Json string to a message object
    var msg = JSON.parse(message);

    // Save the message to the database using query because the save method of the wrapper is not working
    // while avoiding SQL injection
    this.client.query(
      "INSERT INTO messages_FG (user_id, room_id, message, type, timestamp) VALUES (?, ?, ?, ?, ?)",
      [user_id, room_id, msg.content, msg.type, msg.time],
      (err, result) => {
        if (err) throw err;
        console.log(`Message ${msg.content} added to the database`);
      }
    );
  }

  getAllUsers() {
    // Returns a promise with the result of the query
    return this.db.table("users_test").findAll((err, result) => {
      if (err) throw err;
      console.log(result);
      this.users = result;
    });
  }

  getUser(id) {
    // Returns a promise with the result of the query
    return this.db.table("users").find({ user_id: id }, (err, result) => {
      if (err) throw err;
      console.log(result);
      this.users = result;
    });
  }

  getAllRooms() {
    // Returns a promise with the result of the query
    return this.db.table("rooms_FG").findAll((err, result) => {
      if (err) throw err;
      console.log(result);
      this.rooms = result;
    });
  }

  getRoom(id) {
    // Returns a promise with the result of the query
    return this.db.table("rooms_FG").find({ room_id: id }, (err, result) => {
      if (err) throw err;
      console.log(result);
      this.rooms = result;
    });
  }

  getMsgHistory(room) {
    if (!room) return console.log("No room specified");
    console.log("Getting messages from room " + room);
    // Get all the messages from the room ordered by timestamp
    return this.db
      .table("messages_FG")
      .findAll({ room }, { order: "timestamp" }, (err, result) => {
        if (err) throw err;
        console.log(result);
        this.messages[room] = result;
      });
  }
}

export default DB;
