import MyServer from "../server.js";
import DB from "../mysql.js";

const myserver = new MyServer();
myserver.start();
const db = new DB();
db.innitializeTables();
