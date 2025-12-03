import express from "express";
import { registerUser, loginUser, logoutUser, getUserProfile } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/profile", protect, getUserProfile);
// router.get("/test",(req, res) => {
// const JWT_SECRET = process.env.JWT_SECRET;

//     res.json({bar: JWT_SECRET})
// });

export default router;
