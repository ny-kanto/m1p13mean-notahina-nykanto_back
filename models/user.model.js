// models/user.model.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["acheteur", "boutique", "admin"],
      default: "acheteur",
    },

    boutique: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Boutique",
      default: null,
    },

    // ✅ Favoris
    favorisBoutiques: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Boutique", default: [] }
    ],
    favorisProduits: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Produit", default: [] }
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

export default mongoose.model("User", userSchema);
