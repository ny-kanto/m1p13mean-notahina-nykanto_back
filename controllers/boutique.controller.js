import Boutique from "../models/boutique.model.js";

export const getAllBoutiques = async (req, res) => {
  try {
    const boutiques = await Boutique.find();
    res.json(boutiques);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};