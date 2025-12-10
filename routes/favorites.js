import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { addFavorite, removeFavorite, getFavorites } from "../controllers/favoriteController.js";

const router = express.Router();

router.post("/", protect, addFavorite);
router.get("/", protect, getFavorites);
router.delete("/", protect, removeFavorite);

export default router;