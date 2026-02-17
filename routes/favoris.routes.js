// routes/favoris.routes.js
import express from "express";
import auth from "../middlewares/auth.js";
import {
  getFavoris,
  toggleFavoriBoutique,
  toggleFavoriProduit,
  checkFavoriBoutique,
  getFavorisBoutiquesIds
} from "../controllers/favoris.controller.js";

const router = express.Router();

router.get("/", auth, getFavoris);
router.post("/boutiques/:boutiqueId/toggle", auth, toggleFavoriBoutique);
router.post("/produits/:produitId/toggle", auth, toggleFavoriProduit);
router.get("/boutiques/:id/check", auth, checkFavoriBoutique);
router.get("/boutiques/ids", auth, getFavorisBoutiquesIds);

export default router;
