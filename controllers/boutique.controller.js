import Boutique from "../models/boutique.model.js";
import { pagination } from "../utils/pagination.js";


export const getAllBoutiques = async (req, res) => {
  try {
    const result = await pagination(
      Boutique,
      {},
      req
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /boutique/:etage
export const getBoutiqueByEtage = async (req, res) => {
  try {
    const result = await pagination(
        Boutique,
        { etage: req.params.etage },
        req
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createBoutique = async (req, res) => {

  const { nom, categorie, contact, horaires } = req.body;

  // 1️⃣ Création de la boutique en PENDING
  const boutique = await Boutique.create({
    nom,
    categorie,
    contact,
    horaires,
    status: "PENDING",
  });

  // 2️⃣ Suspendre le compte utilisateur jusqu'à validation
  const user = await User.findById(userId);
  user.status = "PENDING";
  user.boutiqueId = boutique._id;
  await user.save();

  res.status(201).json({
    message:
      "Demande de boutique enregistrée, votre compte est en attente de validation",
    boutiqueId: boutique._id
  });

}