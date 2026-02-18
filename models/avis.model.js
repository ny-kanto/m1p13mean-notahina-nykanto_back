// models/avis.model.js
import mongoose from "mongoose";
import Boutique from "./boutique.model.js";
import Produit from "./produit.model.js";

const avisSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    entityType: {
      type: String,
      required: true,
      enum: ["boutique", "produit"],
      index: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    note: { type: Number, required: true, min: 1, max: 5 },
    commentaire: { type: String, default: "", trim: true },

    created_at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// 1 avis max par user par entity
avisSchema.index({ user: 1, entityType: 1, entityId: 1 }, { unique: true });

async function recomputeEntityRating(entityType, entityId) {
  const Avis = mongoose.model("Avis");

  const stats = await Avis.aggregate([
    { $match: { entityType, entityId: new mongoose.Types.ObjectId(entityId) } },
    {
      $group: {
        _id: "$entityId",
        avg: { $avg: "$note" },
        count: { $sum: 1 },
      },
    },
  ]);

  const avg = stats?.[0]?.avg ?? 0;
  const count = stats?.[0]?.count ?? 0;
  const avgRounded = Math.round(avg * 10) / 10;

  if (entityType === "boutique") {
    await Boutique.updateOne(
      { _id: entityId },
      { $set: { noteMoyenne: avgRounded, noteCompte: count } }
    );
  } else {
    await Produit.updateOne(
      { _id: entityId },
      { $set: { noteMoyenne: avgRounded, noteCompte: count } }
    );
  }
}

avisSchema.post("save", async function () {
  await recomputeEntityRating(this.entityType, this.entityId);
});

avisSchema.post("findOneAndDelete", async function (doc) {
  if (doc) await recomputeEntityRating(doc.entityType, doc.entityId);
});

export default mongoose.model("Avis", avisSchema);
