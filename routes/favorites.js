import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { addFavorite, removeFavorite, getFavorites } from "../controllers/favoriteController.js";

const router = express.Router();

router.get("/", protect, getFavorites);
router.post("/", protect, addFavorite);
router.delete("/", protect, removeFavorite);

export default router;