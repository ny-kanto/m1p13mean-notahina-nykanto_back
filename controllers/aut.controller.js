import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import tokenBlackList from "../models/tokenBlackList.model.js";

dotenv.config();

export const signup = async (req, res) => {
  try {
    // ✅ on accepte boutique (id boutique) dans le body
    const { nom, prenom, email, password, role, boutique } = req.body;

    const finalRole = role ?? "acheteur";

    // ✅ payload user
    const payload = {
      nom,
      prenom,
      email,
      password,
      role: finalRole,
    };

    // ✅ si role=boutique => on lie l'id boutique
    if (finalRole === "boutique") {
      if (!boutique) {
        return res.status(400).json({
          message: "Erreur lors de l'inscription",
          error: "Le champ 'boutique' (id boutique) est requis pour le role boutique",
        });
      }
      payload.boutique = boutique; // ⚠️ suppose que ton User schema a bien un champ `boutique`
    }

    const user = await User.create(payload);

    res.status(201).json({
      message: "Compte créé",
      userId: user._id,
      role: user.role,
      boutiqueId: user.boutique ?? null,
    });
  } catch (error) {
    res.status(400).json({
      message: "Erreur lors de l'inscription",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // ✅ populate optionnel si tu veux les infos boutique plus tard
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email incorrect" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    // ✅ token contient aussi boutiqueId
    const token = jwt.sign(
      { userId: user._id, role: user.role, boutiqueId: user.boutique ?? null },
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
        role: user.role,
        boutiqueId: user.boutique ?? null,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur du serveur",
      error: error.message,
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
      expiresAt: new Date(decoded.exp * 1000),
    });

    res.json({ message: "Déconnecté avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur logout" });
  }
};
