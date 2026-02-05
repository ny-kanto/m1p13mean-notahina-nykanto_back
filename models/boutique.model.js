import mongoose from "mongoose";

const boutiqueSchema = new mongoose.Schema({
  nom: String,
  categorie: String,
  contact: {
    email: String,
    tel: String
  },
  horaires: {
    ouverture: String,
    fermeture: String
  },
  statut: String,
  created_at: String
});

export default mongoose.model("Boutique", boutiqueSchema);