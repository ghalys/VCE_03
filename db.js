import mysql from "mysql2";
import wrapper from "node-mysql-wrapper";
import util from "util";
import md5 from "md5";

import {testingLocally} from "./public/scripts/testing.js";

// const testingLocally = true; // Change to true if testing locally

// Class to manage the database
class DB {
  constructor() {
    this.client = testingLocally
      ? mysql.createConnection({
          database: "VCE",
          user: "root",
          password: "root",
          host: "localhost",
        })
      : mysql.createConnection({
          database: "ecv-2019",
          user: "ecv-user",
          password: "ecv-upf-2019",
          host: "127.0.0.1",
        });
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
        "CREATE TABLE IF NOT EXISTS messages_FG2 (message_id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, room_id INT, message TEXT, type VARCHAR(50), timestamp DATETIME)"
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
          data.destination,
          data
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

  addUser(name, password, rooms) {
    // encrypt password with md5 and extra string for security
    var encrypt_pw = md5(password + "salt");

    var rooms = rooms || "Hall";

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

  async addMessages(user_id, room_name, msg) {
    // Parse the Json string to a message object
    console.log("Message is being saved" + JSON.stringify(msg)); 
    
    //Room Id
    const room_id = 12; 

    // Get current date and time
    const currentDate = new Date();
    // Format the date and time as 'YYYY-MM-DD HH:MM:SS'
    const formattedDateTime = currentDate.toISOString().slice(0, 19).replace('T', ' ');

    // Save the message to the database using query because the save method of the wrapper is not working
    // while avoiding SQL injection
    this.client.query(
      "INSERT INTO messages_FG2 (user_id, room_id, message, type, timestamp) VALUES (?, ?, ?, ?, ?)",
      [user_id, room_id, msg.content, msg.type, formattedDateTime],
      (err, result) => {
        if (err) throw err;
        console.log(`Message ${msg.content} added to the database`);
      }
    );
  }

  getAllUsers() {
    // Returns a promise with the result of the query
    return this.db.table("users_FG").findAll((err, result) => {
      if (err) throw err;
      console.log(result);
      this.users = result;
    });
  }

  validateUserInfo(name, password) {
    // Returns a promise with the result of the query
    if (password) {
      const encrypt_pw = md5(password + "salt");
      // Using a SQL query because the wrapper always returns the entire table
      // while avoiding SQL injection
      // returning a promise with the result of the query
      return new Promise((resolve, reject) => {
        this.client.query(
          "SELECT * FROM users_FG WHERE user_name = ? AND password = ?",
          [name, encrypt_pw],
          (err, result) => {
            if (err) throw err;
            if (result.length === 0) {
              console.log("No user found");
              resolve(null);
              return;
            }
            resolve(result[0]);
          }
        );
      });
    }
    return new Promise((resolve, reject) => {
      this.client.query(
        "SELECT * FROM users_FG WHERE user_name = ?",
        [name],
        (err, result) => {
          if (err) throw err;
          if (result.length === 0) {
            console.log("No user found");
            resolve(null);
            return;
          }
          resolve(result[0]);
        }
      );
    });
  }

  getAllRooms() {
    // Returns a promise with the result of the query
    return this.db.table("rooms_FG").findAll((err, result) => {
      if (err) throw err;
      this.rooms = result;
    });
  }

  getRoom(name) {
    // Returns a promise with the result of the query
    return this.db.table("rooms_FG").find({ room_name: name }, (err, result) => {
      if (err) throw err;
      console.log(result);
      
    });
  }

  getMsgHistory(room) {
    if (!room) return console.log("No room specified");
    console.log("Getting messages from room " + room);
    // Get all the messages from the room ordered by timestamp
    // Returns a promise with the result of the query
    // because the wrapper is not working properly
    // while avoiding SQL injection
    return new Promise((resolve, reject) => {
      this.client.query(
        "SELECT * FROM messages_FG2 WHERE room_id = ? ORDER BY timestamp",
        [room],
        (err, result) => {
          if (err) throw err;
          this.messages[room] = result;
          resolve(result);
        }
      );
    });
  }
}

export default DB;
