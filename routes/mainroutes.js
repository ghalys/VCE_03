import express from "express";
import path from "path";

const __dirname = path.resolve(path.dirname(""));

const router = express.Router();

router.use(express.static(path.join(__dirname, "public")));

console.log("THIS IS THE " + __dirname);

router.all("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

router.all("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

router.all("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "main.html"));
});

export default router;
