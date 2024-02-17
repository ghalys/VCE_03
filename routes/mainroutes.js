import express from "express";
import path from "path";

const __dirname = path.resolve(path.dirname(""));

const router = express.Router();

router.use(express.static(path.join(__dirname, "public")));

console.log("THIS IS THE " + __dirname);

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

export default router;
