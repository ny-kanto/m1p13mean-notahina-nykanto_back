import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import boutiqueRoutes from "./routes/boutique.routes.js";
import produitRoutes from "./routes/produit.routes.js";
import categorieRoutes from "./routes/categorie.routes.js";
import authRoutes from "./routes/auth.routes.js";
import zoneRoutes from "./routes/zone.routes.js";
import favorisRoutes from "./routes/favoris.routes.js";
import avisRoutes from "./routes/avis.routes.js";
import evenementRoutes from "./routes/evenement.routes.js";
import promotionRoutes from "./routes/promotion.routes.js";

console.log("🚀 Serveur démarré");

dotenv.config();
const app = express();

app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({
  limit: '15mb',
  extended: true
}));

// MongoDB
connectDB(process.env.MONGODB_URI);

// Routes
app.use("/boutiques", boutiqueRoutes);
app.use("/produits", produitRoutes);
app.use("/categories", categorieRoutes);
app.use("/auth", authRoutes);
app.use("/zones", zoneRoutes);
app.use("/favoris", favorisRoutes);
app.use("/avis", avisRoutes);
app.use("/evenements", evenementRoutes);
app.use("/promotions", promotionRoutes);

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));
