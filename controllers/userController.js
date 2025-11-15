import User from "../models/user.js";

// Récupérer tous les utilisateurs
export const getAllUsers = async (req, res) => {
    const users = await User.find();
    res.json(users);
};

// Récupérer un utilisateur
export const getUserById = (req, res) => {
  res.json(res.user);
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