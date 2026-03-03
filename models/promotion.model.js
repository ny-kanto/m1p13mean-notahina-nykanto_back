import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    boutique: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Boutique",
      required: true,
      index: true,
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Evenement",
      default: null,
      index: true,
    },

    titre: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },

    pourcentage: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },

    dateDebut: { type: Date, required: true, index: true },
    dateFin: { type: Date, required: true, index: true },

    scope: {
      type: String,
      enum: ["ALL_PRODUCTS", "PRODUCTS"],
      default: "PRODUCTS",
    },

    productIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Produit", default: [] },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    created_at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

promotionSchema.pre("validate", function () {
  if (this.dateDebut && this.dateFin && this.dateFin < this.dateDebut) {
    throw new Error("dateFin doit être >= dateDebut");
  }

  if (this.scope === "PRODUCTS" && (!this.productIds || this.productIds.length === 0)) {
    throw new Error("productIds requis quand scope = PRODUCTS");
  }

  if (this.scope === "ALL_PRODUCTS") {
    this.productIds = [];
  }
});

promotionSchema.virtual("isActive").get(function () {
  const now = new Date();
  return now >= this.dateDebut && now <= this.dateFin;
});

promotionSchema.set("toJSON", { virtuals: true });
promotionSchema.set("toObject", { virtuals: true });

promotionSchema.index({ boutique: 1, dateDebut: 1, dateFin: 1 });
promotionSchema.index({ event: 1, dateDebut: 1, dateFin: 1 });

export default mongoose.model("Promotion", promotionSchema);
