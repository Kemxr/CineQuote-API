import jwt from "jsonwebtoken";
import User from "../models/user.js";

// const JWT_SECRET = process.env.JWT_SECRET;
// const JWT_SECRET = "salut";

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Génère le JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: "HS256"
  });
};

// Inscription
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: "Email déjà utilisé" });

  const user = await User.create({ name, email, password });
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  });
};

// Connexion
export const loginUser = async (req, res) => {
  const { email, password, rememberMe = false } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Email ou mot de passe incorrect" });

  const isMatch = await user.matchPassword(password);
  if (!isMatch) return res.status(400).json({ message: "Email ou mot de passe incorrect" });

  const token = generateToken(user._id, user.role);

  // Calcul de la durée du cookie
  const maxAge = parseExpirationTime(JWT_EXPIRES_IN);

  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: rememberMe ? maxAge : undefined // session cookie si pas rememberMe
  });

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token
  });
};

// Déconnexion
export const logoutUser = async (req, res) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: true,
    sameSite: "strict"
  });
  res.json({ message: "Déconnecté" });
};

/**
 * Convertit la durée JWT en ms (ex: '15m', '1h', '7d')
 */
function parseExpirationTime(expiresIn) {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // 7 jours par défaut

  const [, value, unit] = match;
  const num = parseInt(value);

  const units = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  return num * (units[unit] || units.d);
}