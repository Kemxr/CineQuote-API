import express from "express";
import {
    addQuote,
    updateQuote,
    deleteQuote,
    getQuotes,
    getQuoteById,
    getRandomQuote
} from "../controllers/quoteController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getQuotes);
router.get("/:id", getQuoteById);
router.get("/random", getRandomQuote);
router.post("/", protect, adminOnly, addQuote);
router.patch("/:id", protect, adminOnly, updateQuote);
router.delete("/:id", protect, adminOnly, deleteQuote);

export default router;