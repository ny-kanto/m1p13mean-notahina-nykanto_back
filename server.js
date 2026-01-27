import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import boutiqueRoutes from "./routes/boutique.routes.js";

dotenv.config();
const app = express();

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

app.use(express.json());

// MongoDB
connectDB(process.env.MONGODB_URI);

// Routes
app.use("/boutiques", boutiqueRoutes);

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));
