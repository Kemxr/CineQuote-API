import express from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
// router.get("/test",(req, res) => {
// const JWT_SECRET = process.env.JWT_SECRET;

//     res.json({bar: JWT_SECRET})
// });

export default router;
