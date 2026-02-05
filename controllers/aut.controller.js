import User from "../models/user.model.js";

export const signup = async (req, res) => {
  try {
    const { nom, prenom, email, password } = req.body;

    const user = await User.create({
      nom,
      prenom,
      email,
      password, // 🔥 PAS de hash ici
    });

    res.status(201).json({
      message: "Compte acheteur créé",
      userId: user._id
    });

  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de l'inscription",
      error: error.message
    });
  }
};