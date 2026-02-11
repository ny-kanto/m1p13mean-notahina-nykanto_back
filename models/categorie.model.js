import mongoose from "mongoose";

const categorieSchema = new mongoose.Schema({
  nom: String
});

export default mongoose.model("Categorie", categorieSchema);
