import express from "express";
import { getAllBoutiques } from "../controllers/boutique.controller.js";

const router = express.Router();

router.get("/", getAllBoutiques);

export default router;