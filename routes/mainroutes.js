import express from "express";
import path from "path";
import DB from "../db.js";
import jwt from "jsonwebtoken";

const __dirname = path.resolve();

const router = express.Router();

console.log("THIS IS THE " + __dirname);
const db = new DB();

async function validateAccessToken(req, res, next) {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send("Access Denied");
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await db.validateAccessToken(token, decoded.username);
    if (user) {
      req.user = user;
      next();
    }
  } catch (e) {
    console.log(e);
    return res.status(403).send("Invalid Token");
  }
}

router.all("/", (req, res) => {
  console.log("Serving index.html");
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

router.all("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

// Room selection ignores the username
router.all("/room_selection/", validateAccessToken, (req, res) => {
  console.log("Serving room_selection.html");
  res.sendFile(path.join(__dirname, "public", "main.html"));
});

router.all("/chat", validateAccessToken, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "chat.html"));
});

export default router;
