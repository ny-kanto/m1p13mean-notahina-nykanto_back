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
import { checkRole } from "../middlewares/role.js";

const router = express.Router();

router.get("/", auth, checkRole('acheteur'), getFavoris);
router.post("/boutiques/:boutiqueId/toggle", auth, checkRole('acheteur'), toggleFavoriBoutique);
router.get("/boutiques/:id/check", auth, checkRole('acheteur'), checkFavoriBoutique);
router.get("/boutiques/ids", auth, checkRole('acheteur'), getFavorisBoutiquesIds);

export default router;
