import express from "express";
import { getFilms, 
        getFilmById, 
        getQuoteCount, 
        getTopFilms,
        createFilm,
        updateFilm,
        deleteFilm
    } from "../controllers/filmController.js"

const router = express.Router();

router.get("/", getFilms);
router.get("/top", getTopFilms);
router.get("/:id", getFilmById);
router.get("/:id/quoteCount", getQuoteCount);
router.post("/", createFilm);
router.put("/:id", updateFilm);
router.delete("/:id", deleteFilm);

export default router;