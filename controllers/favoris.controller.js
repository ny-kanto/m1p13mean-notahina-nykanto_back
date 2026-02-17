// controllers/favoris.controller.js
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Boutique from "../models/boutique.model.js";
import Produit from "../models/produit.model.js";

/**
 * GET /favoris
 * Retourne la liste des favoris (boutiques + produits)
 */
export const getFavoris = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate("favorisBoutiques", "nom image categorie etage")
      .populate("favorisProduits", "nom prix images boutique")
      .lean();

    if (!user) return res.status(404).json({ success: false, message: "User introuvable" });

    return res.json({
      success: true,
      data: {
        boutiques: user.favorisBoutiques ?? [],
        produits: user.favorisProduits ?? [],
      },
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * POST /favoris/boutiques/:boutiqueId/toggle
 */
export const toggleFavoriBoutique = async (req, res) => {
  try {
    const { boutiqueId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(boutiqueId)) {
      return res.status(400).json({ success: false, message: "ID boutique invalide" });
    }

    const exists = await Boutique.exists({ _id: boutiqueId });
    if (!exists) return res.status(404).json({ success: false, message: "Boutique introuvable" });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: "User introuvable" });

    const already = user.favorisBoutiques.some((id) => id.toString() === boutiqueId);

    if (already) {
      user.favorisBoutiques = user.favorisBoutiques.filter((id) => id.toString() !== boutiqueId);
    } else {
      user.favorisBoutiques.push(boutiqueId);
    }

    await user.save();

    return res.json({
      success: true,
      data: { isFavorite: !already },
      message: !already ? "Ajouté aux favoris" : "Retiré des favoris",
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

/**
 * POST /favoris/produits/:produitId/toggle
 */
export const toggleFavoriProduit = async (req, res) => {
  try {
    const { produitId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(produitId)) {
      return res.status(400).json({ success: false, message: "ID produit invalide" });
    }

    const exists = await Produit.exists({ _id: produitId });
    if (!exists) return res.status(404).json({ success: false, message: "Produit introuvable" });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: "User introuvable" });

    const already = user.favorisProduits.some((id) => id.toString() === produitId);

    if (already) {
      user.favorisProduits = user.favorisProduits.filter((id) => id.toString() !== produitId);
    } else {
      user.favorisProduits.push(produitId);
    }

    await user.save();

    return res.json({
      success: true,
      data: { isFavorite: !already },
      message: !already ? "Ajouté aux favoris" : "Retiré des favoris",
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};



/**
 * Vérifier si une boutique est dans les favoris
 * GET /favoris/boutiques/:id/check
 */
export const checkFavoriBoutique = async (req, res) => {
  try {
    const userId = req.user.userId;
    const boutiqueId = req.params.id;

    const user = await User.findById(userId).select("favorisBoutiques");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    const isFavori = user.favorisBoutiques.some(
      (favId) => favId.toString() === boutiqueId
    );

    return res.json({
      success: true,
      isFavori,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};


/**
 * Récupérer tous les IDs des boutiques favorites
 * GET /favoris/boutiques/ids
 */
export const getFavorisBoutiquesIds = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId)
      .select("favorisBoutiques")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    return res.json(user.favorisBoutiques || []);

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message,
    });
  }
};
