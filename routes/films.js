import express from "express";
import { getFilms, getFilmById} from "../controllers/filmController.js"

const router = express.Router();

router.get("/", getFilms);
router.get("/:id", getFilmById);

//La base est faite je pense, vérifier que le bail de favoris fonctionne bien
//Ce qu'il reste à faire => paginated list, (agregation ?), geolocalisation + image téléphone
//Pour le agregated p-e faire le nombre de favoris d'un user

//JWT
//Soit rester avec headers et créer le cookie en front
//Soit créer le cookie en back avec req.headers.cookie et parseCookie puis envoyer le token au front

export default router;