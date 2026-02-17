// services/avis.service.js
import Avis from "../models/avis.model.js";
import Boutique from "../models/boutique.model.js";
import Produit from "../models/produit.model.js";

class AvisService {
  async assertEntityExists(entityType, entityId) {
    if (entityType === "boutique") {
      const exists = await Boutique.exists({ _id: entityId });
      if (!exists) throw new Error("Boutique introuvable");
      return;
    }

    if (entityType === "produit") {
      const exists = await Produit.exists({ _id: entityId });
      if (!exists) throw new Error("Produit introuvable");
      return;
    }

    throw new Error("entityType invalide");
  }

  /**
   * Créer OU mettre à jour l'avis (upsert)
   * - 1 avis par user par entity
   */
  async upsertAvis({ userId, entityType, entityId, note, commentaire }) {
    await this.assertEntityExists(entityType, entityId);

    if (note < 1 || note > 5) {
      throw new Error("La note doit être entre 1 et 5");
    }

    const avis = await Avis.findOneAndUpdate(
      { user: userId, entityType, entityId },
      {
        $set: {
          note,
          commentaire: commentaire ?? "",
        },
        $setOnInsert: {
          created_at: new Date(),
        },
      },
      { new: true, upsert: true }
    );

    // ⚠️ findOneAndUpdate ne déclenche PAS post("save")
    // donc on déclenche manuellement le recalcul en resauvegardant
    // (simple et fiable)
    await avis.save();

    return {
      success: true,
      data: avis,
      message: "Avis enregistré",
    };
  }

  async deleteAvis({ avisId, userId }) {
    const avis = await Avis.findOneAndDelete({ _id: avisId, user: userId });
    if (!avis) throw new Error("Avis introuvable ou non autorisé");

    // post('findOneAndDelete') recalc déjà
    return { success: true, message: "Avis supprimé" };
  }

  async getAvisForEntity({ entityType, entityId, page = 1, limit = 10 }) {
    await this.assertEntityExists(entityType, entityId);

    const p = Math.max(1, parseInt(page) || 1);
    const l = Math.min(50, Math.max(1, parseInt(limit) || 10));
    const skip = (p - 1) * l;

    const [data, total] = await Promise.all([
      Avis.find({ entityType, entityId })
        .populate("user", "nom email")
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(l)
        .lean(),
      Avis.countDocuments({ entityType, entityId }),
    ]);

    return {
      success: true,
      data,
      pagination: {
        total,
        page: p,
        limit: l,
        totalPages: Math.ceil(total / l),
      },
    };
  }
}

export default new AvisService();
