import express from "express";

const router = express.Router();

// Test route
router.get("/", (req, res) => {
  res.send("Got a response from the users route");
});

export default router;
