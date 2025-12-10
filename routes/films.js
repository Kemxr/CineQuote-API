import express from "express";
import { getFilms, 
        getFilmById, 
        getQuoteCount, 
        getTopFilms,
        createFilm,
        updateFilm,
        deleteFilm
} from "../controllers/filmController.js"
import { adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getFilms);
router.get("/top", getTopFilms);
router.get("/:id", getFilmById);
router.get("/:id/quoteCount", getQuoteCount);
router.post("/", adminOnly, createFilm);
router.put("/:id", adminOnly, updateFilm);
router.delete("/:id", adminOnly, deleteFilm);

export default router;