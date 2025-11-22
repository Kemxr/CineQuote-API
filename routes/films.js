import express from "express";
import { getFilms, getFilmById, getQuoteCount, getTopFilms} from "../controllers/filmController.js"

const router = express.Router();

router.get("/", getFilms);
router.get("/top", getTopFilms);
router.get("/:id", getFilmById);
router.get("/:id/quoteCount", getQuoteCount);


//Ce qu'il reste à faire => paginated list, geolocalisation + image téléphone


//Ajouter des validations basique sur les user input

export default router;