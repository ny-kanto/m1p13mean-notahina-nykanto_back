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