import express from "express";

const router = express.Router();

router.get("/", function (req, res, next) {
  res.send("ça va être sale 🐉!");
});

export default router;
