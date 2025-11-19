import User from "../models/user.js";

// Récupérer tous les utilisateurs
export const getAllUsers = async (req, res) => {
    const users = await User.find()
    .populate({
      path: "favorites",
      populate: { path: "film"}
    })
    res.json(users);
};

// Récupérer un utilisateur
export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate({
      path: "favorites",
      populate: { path: "film" }
    });
  if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
  res.json(user);
};

// Créer un utilisateur
export const createUser = async (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

    const newUser = await user.save();
    res.status(201).json(newUser);
};

// Mettre à jour un utilisateur
export const updateUser = async (req, res) => {
  if (req.body.name != null) {
    res.user.name = req.body.name;
  }
  if (req.body.email != null) {
    res.user.email = req.body.email;
  }

    const updatedUser = await res.user.save();
    res.json(updatedUser);
};

// Supprimer un utilisateur
export const deleteUser = async (req, res) => {
    await res.user.deleteOne();
    res.json({ message: "Deleted user" });
};