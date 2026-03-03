// routes/avis.routes.js
import express from "express";
import auth from "../middlewares/auth.js";
import { upsertAvis, deleteAvis, getAvisForEntity } from "../controllers/avis.controller.js";
import { checkRole } from "../middlewares/role.js";

const router = express.Router();

// Public (lecture)
router.get("/:entityType/:entityId", getAvisForEntity);

// Protected (écriture)
router.post("/", auth, checkRole('acheteur'), upsertAvis);
router.delete("/:id", auth, checkRole('acheteur'), deleteAvis);

export default router;
