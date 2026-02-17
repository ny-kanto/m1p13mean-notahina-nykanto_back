// routes/avis.routes.js
import express from "express";
import auth from "../middlewares/auth.js";
import { upsertAvis, deleteAvis, getAvisForEntity } from "../controllers/avis.controller.js";

const router = express.Router();

// Public (lecture)
router.get("/:entityType/:entityId", getAvisForEntity);

// Protected (écriture)
router.post("/", auth, upsertAvis);
router.delete("/:id", auth, deleteAvis);

export default router;
