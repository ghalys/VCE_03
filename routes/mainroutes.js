import express from "express";
import path from "path";

const __dirnameChild = path.resolve(path.dirname(""));
// Getting the parent directory
const __dirname = path.join(__dirnameChild, "..");

const router = express.Router();

router.use(express.static(path.join(__dirnameChild, "public")));

console.log(__dirname);

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

export default router;
