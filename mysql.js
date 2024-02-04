import mysql from "mysql2";
import wrapper from "node-mysql-wrapper";

const client = mysql.createConnection({
  database: "ecv-2019",
  user: "ecv-user",
  password: "ecv-upf-2019",
  host: "127.0.0.1",
});
// const client = mysql.createConnection({
//   database: "VCE",
//   user: "root",
//   password: "root",
//   host: "localhost",
// });

// SQL database with wrapper
const db = wrapper.wrap(client);

// Class to manage the database
class DB {
  users = [];
  rooms = [];
  messages = [];

  innitializeTables() {
    // Create tree tables if not exists (users and messages and rooms)
    // users table with user_id, user_name,  the encripted password and their accessible rooms
    client.query(
      "CREATE TABLE IF NOT EXISTS users_FG (user_id INT AUTO_INCREMENT PRIMARY KEY, user_name VARCHAR(100), password VARCHAR(100), rooms VARCHAR(1000))",
      (err, result) => {
        if (err) throw err;
        console.log("Table users created" + result);
      }
    );
    // rooms table with room_id, room_name, room_description
    client.query(
      "CREATE TABLE IF NOT EXISTS rooms_FG (room_id INT AUTO_INCREMENT PRIMARY KEY, room_name VARCHAR(100), room_description TEXT)",
      (err, result) => {
        if (err) throw err;
        console.log("Table rooms created" + result);
      }
    );

    // messages table with message_id, user_id, room, message and timestamp
    client.query(
      "CREATE TABLE IF NOT EXISTS messages_FG (message_id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, room_id INT, message TEXT, timestamp DATETIME, FOREIGN KEY (user_id) REFERENCES users_FG(user_id) ON DELETE CASCADE, FOREIGN KEY (room_id) REFERENCES rooms_FG(room_id) ON DELETE CASCADE)",
      (err, result) => {
        if (err) throw err;
        console.log("Table messages created" + result);
      }
    );

    // To connect to the database:
    db.ready(function () {
      console.log("Connected to the database");
    });
  }

  addUser(name, password) {
    // encript the password
    password = bcrypt.hashSync(password, 10);

    db.table("users").save(
      { user_name: name, password: password },
      (err, result) => {
        if (err) throw err;
        console.log(`User ${name} added to the database`);
      }
    );
  }

  addRoom(name, description = "") {
    db.table("rooms").save(
      { room_name: name, room_description: description },
      (err, result) => {
        if (err) throw err;
        console.log(`Room ${name} added to the database`);
      }
    );
  }
}

export default DB;
