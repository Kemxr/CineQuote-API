import express from "express";
import { getFilms, 
        getFilmById, 
        getQuoteCount, 
        getTopFilms,
        createFilm,
        updateFilm,
        deleteFilm
} from "../controllers/filmController.js"
import { adminOnly, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getFilms);
router.get("/top", getTopFilms);
router.get("/:id", getFilmById);
router.get("/:id/quoteCount", getQuoteCount);
router.post("/", protect, adminOnly, createFilm);
router.put("/:id", protect, adminOnly, updateFilm);
router.delete("/:id", protect, adminOnly, deleteFilm);

export default router;