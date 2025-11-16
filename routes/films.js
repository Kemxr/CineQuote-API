import express from "express";
import { getFilms, getFilmById} from "../controllers/filmController.js"

const router = express.Router();

router.get("/", getFilms);
router.get("/:id", getFilmById);

export default router;