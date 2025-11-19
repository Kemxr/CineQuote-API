import express from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { getUser } from "../middlewares/userMiddleware.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Récupérer tous les utilisateurs
router.get("/", getAllUsers);

// Récupérer un utilisateur par ID
router.get("/:id", getUser, getUserById);

// Mettre à jour un utilisateur
router.patch("/:id", getUser, updateUser);

// Supprimer un utilisateur
router.delete("/:id", getUser, deleteUser);

export default router;