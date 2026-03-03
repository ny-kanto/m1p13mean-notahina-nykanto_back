// routes/evenement.routes.js
import express from "express";
import * as evenementController from "../controllers/evenement.controller.js";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";
import { checkRole } from "../middlewares/role.js";

const router = express.Router();

router.get("/", auth, checkRole('admin'), evenementController.getAllEvenements);
router.get("/actifs", evenementController.getEvenementsActifs);
router.get("/:id", evenementController.getEvenementById);

router.post(
    "/",
    auth,
    checkRole('admin'),
    upload.single("image"),
    evenementController.createEvenement
);

router.put(
    "/:id",
    auth,
    checkRole('admin'),
    upload.single("image"),
    evenementController.updateEvenement
);

router.delete(
    "/:id",
    auth,
    checkRole('admin'),
    evenementController.deleteEvenement
);

export default router;
