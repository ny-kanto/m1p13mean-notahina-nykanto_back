import express from "express";
import { getAllBoutiques, getBoutiqueByEtage } from "../controllers/boutique.controller.js";

const router = express.Router();

router.get("/", getAllBoutiques);
router.get("/:etage", getBoutiqueByEtage);

export default router;