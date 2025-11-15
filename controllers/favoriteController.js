import User from "../models/user.js";
import Quote from "../models/quote.js";

// Ajouter une citation aux favoris
export const addFavorite = async (req, res) => {
  const userId = req.user._id;
  const { quoteId } = req.body;

  const quote = await Quote.findById(quoteId);
  if (!quote) return res.status(404).json({ message: "Citation introuvable" });

  const user = await User.findById(userId);
  if (user.favorites.includes(quoteId)) {
    return res.status(400).json({ message: "Déjà en favoris" });
  }
  user.favorites.push(quoteId);
  await user.save();
  res.json({ message: "Ajouté aux favoris" });
};

// Retirer une citation des favoris
export const removeFavorite = async (req, res) => {
  const userId = req.user._id;
  const { quoteId } = req.body;

  const user = await User.findById(userId);
  user.favorites = user.favorites.filter(fav => fav.toString() !== quoteId);
  await user.save();
  res.json({ message: "Retiré des favoris" });
};

// Lister les favoris de l'utilisateur
export const getFavorites = async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "favorites",
    populate: { path: "film" }
  });
  res.json(user.favorites);
};