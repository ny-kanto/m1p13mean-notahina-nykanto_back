import Produit from '../models/produit.model.js';
import { pagination } from "../utils/pagination.js";

// Get /produits
export const getAllProduits = async (req, res) => {
  try {
      const result = await pagination(
        Produit,
        {},
        req
      );
  
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
};


// GET /products/boutique/:boutiqueId
export const getProductsByBoutique = async (req, res) => {
  try {
    const result = await pagination(
        Produit,
        { boutiqueId: req.params.boutiqueId },
        req
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get /produits/:id
export const findProduitById = async (req, res) => {
    try {
        const produit = await Produit.findById(req.params.id);
        res.json(produit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// // Post /produits
// export const createProduit = async (req, res) => {
//     try {

//         const newProduit = new Produit(req.body);
//         await newProduit.save();
//         res.status(201).json(newProduit);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// }

// POST /produits
export const createProduit = async (req, res) => {
    try {
        console.log('📦 Body reçu:', req.body);
        console.log('📸 Fichiers reçus:', req.files);  // ← AJOUTE CE LOG

        // Récupération des images (0 ou plusieurs)
        const images = req.files?.map(file => file.path) || [];

        console.log('🔗 URLs Cloudinary:', images);  // ← AJOUTE CE LOG
        // Création du produit avec images
        const newProduit = new Produit({
            ...req.body,   // nom, prix, description, stock, boutiqueId
            images         // tableau d'URLs Cloudinary
        });

        await newProduit.save();

        res.status(201).json(newProduit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Put /produits/:id
export const updateProduit = async (req, res) => {
    try {
        const updateProduit = await Produit.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updateProduit) { res.status(404).json({ message: 'Produit non trouvé' }); }
        res.json(updateProduit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// DELETE /products/:id
export const deleteProduit = async (req, res) => {
    try {
        const deletedProduit = await Produit.findByIdAndDelete(req.params.id);
        if (!deletedProduit) return res.status(404).json({ message: "Produit non trouvé" });
        res.json({ message: "Produit supprimé" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
