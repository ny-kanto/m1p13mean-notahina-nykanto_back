// routes/promotion.routes.js
import express from "express";
import * as promotionController from "../controllers/promotion.controller.js";
import auth from "../middlewares/auth.js";
import { checkRole } from "../middlewares/role.js";

const router = express.Router();

// Public (home)
router.get("/actives", promotionController.getPromotionsActives);

// Admin/boutique (gestion)
router.get("/", auth, checkRole("admin", "boutique"), promotionController.getAllPromotions);
router.get("/:id", auth, checkRole("admin", "boutique"), promotionController.getPromotionById);

router.post("/", auth, checkRole("boutique"), promotionController.createPromotion);
router.put("/:id", auth, checkRole("boutique"), promotionController.updatePromotion);
router.delete("/:id", auth, checkRole("boutique"), promotionController.deletePromotion);

export default router;
