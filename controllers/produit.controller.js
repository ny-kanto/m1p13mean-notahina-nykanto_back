// import Produit from '../models/produit.model.js';
// import { paginationAvecFiltre } from '../utils/queryHelpers.js';

// // Get /produits
// export const getAllProduits = async (req, res) => {
//     try {
//         const produits = await Produit.find();
//         res.json(produits);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// }

// // GET /products/boutique/:boutiqueId
// export const getProductsByBoutique = async (req, res) => {
//     try {
//         const result = await paginationAvecFiltre(
//             Produit,
//             { boutiqueId: req.params.boutiqueId },
//             req
//         );

//         res.json(result);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };

// // Get /produits/:id
// export const findProduitById = async (req, res) => {
//     try {
//         const produit = await Produit.findById(req.params.id);
//         res.json(produit);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// }

// // POST /produits
// export const createProduit = async (req, res) => {
//     try {
//         console.log('📦 Body reçu:', req.body);
//         console.log('📸 Fichiers reçus:', req.files);  // ← AJOUTE CE LOG

//         // Récupération des images (0 ou plusieurs)
//         const images = req.files?.map(file => file.path) || [];

//         console.log('🔗 URLs Cloudinary:', images);  // ← AJOUTE CE LOG
//         // Création du produit avec images
//         const newProduit = new Produit({
//             ...req.body,   // nom, prix, description, stock, boutiqueId
//             images         // tableau d'URLs Cloudinary
//         });

//         await newProduit.save();

//         res.status(201).json(newProduit);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// // Put /produits/:id
// export const updateProduit = async (req, res) => {
//     try {
//         const updateProduit = await Produit.findByIdAndUpdate(
//             req.params.id,
//             req.body,
//             { new: true }
//         );
//         if (!updateProduit) { res.status(404).json({ message: 'Produit non trouvé' }); }
//         res.json(updateProduit);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// }

// // DELETE /products/:id
// export const deleteProduit = async (req, res) => {
//     try {
//         const deletedProduit = await Produit.findByIdAndDelete(req.params.id);
//         if (!deletedProduit) return res.status(404).json({ message: "Produit non trouvé" });
//         res.json({ message: "Produit supprimé" });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };


// controllers/produit.controller.js
import produitService from "../services/produit.service.js";

/**
 * GET /produits/boutique/:boutiqueId
 * Liste des produits d'une boutique
 */
export const getProductsByBoutique = async (req, res) => {
  try {
    const { boutiqueId } = req.params;

    const result = await produitService.getProductsByBoutique(
      boutiqueId,
      req.query
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /produits/:id
 * Produit par ID
 */
export const findProduitById = async (req, res) => {
  try {
    const result = await produitService.getProduitById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /produits
 * Création produit
 */
export const createProduit = async (req, res) => {
  try {
    console.log("📦 Body reçu:", req.body);
    console.log("📸 Files:", req.files);

    const result = await produitService.createProduit(
      req.body,
      req.files
    );

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * PUT /produits/:id
 * Modification produit
 */
export const updateProduit = async (req, res) => {
  try {
    const result = await produitService.updateProduit(
      req.params.id,
      req.body,
      req.files // si tu veux gérer update images aussi
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * DELETE /produits/:id
 */
export const deleteProduit = async (req, res) => {
  try {
    const result = await produitService.deleteProduit(req.params.id);

    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};
