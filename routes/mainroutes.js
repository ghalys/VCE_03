import express from "express";
import path from "path";

const __dirname = path.resolve();

const router = express.Router();

console.log("THIS IS THE " + __dirname);

router.all("/", (req, res) => {
  console.log("Serving index.html");
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

router.all("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

router.all("/room_selection", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "room_selection.html"));
});

router.all("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "main.html"));
});

export default router;
