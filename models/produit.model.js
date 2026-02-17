import mongoose from "mongoose";

const produitSchema = new mongoose.Schema(
    {
        nom: { type: String, required: true, trim: true },

        boutique: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Boutique",
            required: true,
            index: true,
        },

        categorie: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Categorie",
            required: false,
            index: true,
        },

        description: { type: String, default: "" },
        prix: { type: Number, default: 0 },

        images: [
            {
                url: { type: String, default: "" },
                public_id: { type: String, default: "" },
            },
        ],

        // ✅ Agrégats (avis sur le PRODUIT)
        noteMoyenne: { type: Number, default: 0 },
        noteCompte: { type: Number, default: 0 },

        created_at: { type: Date, default: Date.now },
    },
    { timestamps: false }
);

export default mongoose.model("Produit", produitSchema);
