import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import tokenBlackList from "../models/tokenBlackList.model.js";

dotenv.config();

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

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Email incorrect" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Mot de passe incorrect" });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            token,
            user: {
                _id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Erreur du serveur",
            error: error.message
        });
    }
};

export const logout = async (req, res) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(400).json({ message: "Token manquant" });
    }

    const token = header.split(" ")[1];

    const decoded = jwt.decode(token);

    await tokenBlackList.create({
      token,
      expiresAt: new Date(decoded.exp * 1000)
    });

    res.json({ message: "Déconnecté avec succès" });

  } catch (error) {
    res.status(500).json({ message: "Erreur logout" });
  }
};
