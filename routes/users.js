import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { getUser } from "../middlewares/userMiddleware.js";

const router = express.Router();

// Récupérer tous les utilisateurs
router.get("/", getAllUsers);

// Récupérer un utilisateur par ID
router.get("/:id", getUser, getUserById);

// Créer un utilisateur
router.post("/", createUser);

// Mettre à jour un utilisateur
router.patch("/:id", getUser, updateUser);

// Supprimer un utilisateur
router.delete("/:id", getUser, deleteUser);

export default router;