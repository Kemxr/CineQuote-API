import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Pour que seulement ceux qui sont authentifiés puissent appeler les routes
export const protect = async (req, res, next) => {
  let token;

  // Cherche le token dans le cookie httpOnly
  if (req.cookies && req.cookies.auth_token) {
    token = req.cookies.auth_token;
  }

  if (!token) return res.status(401).json({ message: "Non autorisé, pas de token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide" });
  }
};

// Pour protéger les routes admin
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Accès réservé à l’administrateur" });
  }
};