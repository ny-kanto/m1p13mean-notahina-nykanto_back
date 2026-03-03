// controllers/promotion.controller.js
import promotionService from "../services/promotion.service.js";

export const getAllPromotions = async (req, res) => {
  try {
    const result = await promotionService.getAllPromotions(req.query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPromotionsActives = async (req, res) => {
  try {
    const result = await promotionService.getPromotionsActives(req.query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPromotionById = async (req, res) => {
  try {
    const result = await promotionService.getPromotionById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const createPromotion = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;
    if (!userId) return res.status(401).json({ success: false, message: "Non authentifié" });

    const result = await promotionService.createPromotion(req.body, userId, role);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePromotion = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;
    if (!userId) return res.status(401).json({ success: false, message: "Non authentifié" });

    const result = await promotionService.updatePromotion(req.params.id, req.body, userId, role);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deletePromotion = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;
    if (!userId) return res.status(401).json({ success: false, message: "Non authentifié" });

    const result = await promotionService.deletePromotion(req.params.id, userId, role);
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};
