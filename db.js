import mysql from "mysql2";
import wrapper from "node-mysql-wrapper";
import util from "util";
import md5 from "md5";

import { testingLocally } from "./public/scripts/testing.js";

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

  // Bind the query method of the client to use promises
  queryAsync(query, values) {
    if (!this.client || !this.client.query) {
      return Promise.reject(new Error("Database client is not initialized"));
    }

    const promisifiedQuery = util
      .promisify(this.client.query)
      .bind(this.client);
    return promisifiedQuery(query, values);
  }

  initializeTables() {
    return Promise.all([
      // Table users_FG saves the users of the chat with
      // their a new id, name, password and the id of the rooms they have access to
      this.queryAsync(
        `CREATE TABLE IF NOT EXISTS users_FG (user_id INT AUTO_INCREMENT PRIMARY KEY, user_name VARCHAR(100), password VARCHAR(100), last_position VARCHAR(200), avatar VARCHAR(100),  rooms TEXT)`
      ),
      // Table rooms_FG saves the rooms of the chat with
      // a new id, name and description
      this.queryAsync(
        `CREATE TABLE IF NOT EXISTS rooms_FG (room_id INT AUTO_INCREMENT PRIMARY KEY, room_name VARCHAR(100), room_description TEXT)`
      ),
      // Table messages_FG saves the messages of the chat with
      // a new id, the id of the user who sent the message, the id of the room where the message was sent, the message, the type of message and the timestamp
      this.queryAsync(
        `CREATE TABLE IF NOT EXISTS messages_FG (message_id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, room_id INT, message TEXT, type VARCHAR(50), timestamp DATETIME)`
      ),
    ]);
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

  addUser(name, password, position, avatar, rooms) {
    var encrypt_pw = md5(password + "salt");
    var rooms = rooms || "Hall";

    return this.queryAsync(
      "INSERT INTO users_FG (user_name, password, last_position, avatar, rooms) VALUES (?, ?, ?, ?, ?)",
      [name, encrypt_pw, position, avatar, rooms]
    )
      .then((result) => {
        console.log(`User ${name} added to the database`);
      })
      .catch((err) => {
        throw err;
      });
  }

  updateUser(username, updates) {
    // Function to update the user information with various updates
    // updates should be an object with the fields to update of the table users_FG
    let updateFields = "";
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      //Skip null or undefined values
      if (value === null || value === undefined) continue;

      updateFields += `${key} = ?, `;
      values.push(value);
    }

    updateFields = updateFields.slice(0, -2); //Remove the last comma

    const query = `UPDATE users_FG SET ${updateFields} WHERE user_name = ?`;
    values.push(username);

    return this.queryAsync(query, values);
  }

  addRoom(name, description = "") {
    return this.queryAsync("SELECT * FROM rooms_FG WHERE room_name = ?", [name])
      .then((result) => {
        if (result.length > 0) {
          console.log(`Room ${name} already exists in the database`);
          return;
        }
        return this.queryAsync(
          "INSERT INTO rooms_FG (room_name, room_description) VALUES (?, ?)",
          [name, description]
        );
      })
      .then((result) => {
        if (result) {
          console.log(`Room ${name} added to the database`);
        }
      })
      .catch((err) => {
        throw err;
      });
  }

  addMessages(user_name, room_name, msg) {
    console.log("Message is being saved" + JSON.stringify(msg));

    const currentDate = new Date();
    const formattedDateTime = currentDate
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    var user_id = -1;

    return this.queryAsync(
      // Get the user_id from the user_name out of the users_FG table where it is saved
      "SELECT user_id FROM users_FG WHERE user_name = ?",
      [user_name]
    )
      .then((result) => {
        user_id = result[0].user_id;
        return this.queryAsync(
          // Get the room_id from the room name out of the rooms_FG table where it is saved
          "SELECT room_id FROM rooms_FG WHERE room_name = ?",
          [room_name]
        );
      })
      .then((result) => {
        if (user_id === -1) throw new Error("retrieve user_id failed");

        const room_id = result[0].room_id;
        return this.queryAsync(
          // Insert the message into the messages_FG table
          "INSERT INTO messages_FG (user_id, room_id, message, type, timestamp) VALUES (?, ?, ?, ?, ?)",
          [user_id, room_id, msg.content, msg.type, formattedDateTime]
        );
      })
      .then((result) => {
        console.log(`Message ${msg.content} added to the database`);
      })
      .catch((err) => {
        throw err;
      });
  }

  getAllUsers() {
    return this.queryAsync("SELECT * FROM users_FG")
      .then((result) => {
        console.log(result);
        this.users = result;
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  async validateUserInfo(name, password) {
    if (password) {
      const encrypt_pw = md5(password + "salt");
      const result = await this.queryAsync(
        "SELECT * FROM users_FG WHERE user_name = ? AND password = ?",
        [name, encrypt_pw]
      );
      if (result.length === 0) {
        console.log("No user found");
        return null;
      }
      return result[0];
    } else {
      const result = await this.queryAsync(
        "SELECT * FROM users_FG WHERE user_name = ?",
        [name]
      );
      if (result.length === 0) {
        console.log("No user found");
        return null;
      }
      return result[0];
    }
  }

  getAllRooms() {
    // Returns a promise with the result of the query
    return this.queryAsync("SELECT * FROM rooms_FG")
      .then((result) => {
        console.log(result);
        this.rooms = result;
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }

  getRoom(name) {
    // Returns a promise with the result of the query
    return this.queryAsync("SELECT * FROM rooms_FG WHERE room_name = ?", [name])
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        throw err;
      });
  }

  async getMsgHistory(room_name) {
    // Get all the messages from the room ordered by timestamp
    // Returns a promise with the result of the query

    return this.queryAsync(
      `SELECT * 
      FROM messages_FG m
      LEFT JOIN rooms_FG r ON m.room_id = r.room_id
      LEFT JOIN users_FG u ON m.user_id = u.user_id
      WHERE r.room_name = ?
      ORDER BY timestamp`,
      [room_name]
    )
      .then((result) => {
        //console.log(result);
        this.messages[room_name] = result;
        return result;
      })
      .catch((err) => {
        throw err;
      });
  }
}

export default DB;
