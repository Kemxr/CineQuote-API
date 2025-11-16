import jwt from "jsonwebtoken";
import User from "../models/user.js";

//Pour que seulement ceux qui sont authentifié puisse appeler les routes
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      return res.status(401).json({ message: "Token invalide" });
    }
  }

  if (!token) return res.status(401).json({ message: "Non autorisé, pas de token" });
};

//Pour protéger les routes
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Accès réservé à l’administrateur" });
  }
};
