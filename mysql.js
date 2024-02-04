// SQL database with mysql

import mysql from "mysql";
import wrapper from "node-mysql-wrapper";

const client = mysql.createConnection({
  database: "ecv-2019",
  user: "ecv-user",
  password: "ecv-upf-2019",
  host: "127.0.0.1",
});

// Create tree tables if not exists (users and messages and rooms)

// users table with user_id, user_name,  the encripted password and their accessible rooms
client.query(
  "CREATE TABLE IF NOT EXISTS users (user_id INT AUTO_INCREMENT PRIMARY KEY, user_name VARCHAR(100), password VARCHAR(100), rooms VARCHAR(1000))",
  (err, result) => {
    if (err) throw err;
    console.log("Table users created" + result);
  }
);

// messages table with message_id, user_id, room, message and timestamp
client.query(
  "CREATE TABLE IF NOT EXISTS messages (message_id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, room VARCHAR(100), message TEXT, timestamp DATETIME, FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE, FOREIGN KEY (room) REFERENCES rooms(room_name) ON DELETE CASCADE",
  (err, result) => {
    if (err) throw err;
    console.log("Table messages created" + result);
  }
);

// rooms table with room_id, room_name, room_description
client.query(
  "CREATE TABLE IF NOT EXISTS rooms (room_id INT AUTO_INCREMENT PRIMARY KEY, room_name VARCHAR(100), room_description TEXT)",
  (err, result) => {
    if (err) throw err;
    console.log("Table rooms created" + result);
  }
);

// SQL database with wrapper

const db = wrap(client);

// To connect to the database:
db.ready(function () {
  console.log("Connected to the database");
});

// Class to manage the database
class DB = {
  users: []; 
  rooms: [];
  messages: [];

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
  }; 

  addRoom(name, description = "") {
    db.table("rooms").save(
      { room_name: name, room_description: description },
      (err, result) => {
        if (err) throw err;
        console.log(`Room ${name} added to the database`);
      }
    );
  };
}

// To query the database with wrapper:
// db.table("users").get((err, result) => {
//   console.log(result);
// });

// To query the database with wrapper and parameters:
// db.table("users").get({ id: 1 }, (err, result) => {
//   console.log(result);
// });

//all code you will see bellow goes inside db.ready(function () { //code here });
// var usersTable = db.table("users"); //yes, just this :)
// console.log('available columns: '+ usersTable.columns);
// console.log('primary key column name: '+ usersTable.primaryKey);
// console.log('find, findById, findAll, save and remove methods can be called from this table');

// usersTable.find({mail:"= makis@omakis.com"},function(results){

// });

// });

// To close the connection:
// db.end(function(err) {
//   if (err) throw err;
// });
