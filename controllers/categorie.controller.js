import Categorie from "../models/categorie.model.js";

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Categorie.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
