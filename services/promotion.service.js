// services/promotion.service.js
import Promotion from "../models/promotion.model.js";
import User from "../models/user.model.js";

class PromotionService {
  buildFilters(queryParams = {}) {
    const { search, boutique, event, actif, scope } = queryParams;
    const filter = {};

    if (search && search.trim()) {
      filter.titre = { $regex: search.trim(), $options: "i" };
    }

    if (boutique && boutique.trim()) {
      filter.boutique = boutique.trim();
    }

    if (event && event.trim()) {
      filter.event = event.trim();
    }

    if (scope && ["ALL_PRODUCTS", "PRODUCTS"].includes(scope)) {
      filter.scope = scope;
    }

    // actif=true => promos en cours (dateDebut <= now <= dateFin)
    if (actif === "true") {
      const now = new Date();
      filter.dateDebut = { $lte: now };
      filter.dateFin = { $gte: now };
    }

    return filter;
  }

  buildSortOptions(sortBy = "created_at", order = "desc") {
    const allowed = ["created_at", "dateDebut", "dateFin", "pourcentage", "titre"];
    const sort = {};

    if (allowed.includes(sortBy)) sort[sortBy] = order === "asc" ? 1 : -1;
    else sort.created_at = -1;

    // tri stable
    sort._id = order === "asc" ? 1 : -1;
    return sort;
  }

  getPaginationMetadata(total, page, limit) {
    const totalPages = Math.ceil(total / limit) || 1;
    return {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
    };
  }

  async assertCanManagePromotion({ userId, role, boutiqueIdFromBodyOrDoc }) {
    // admin => OK
    if (role === "admin") return;

    // boutique => doit gérer sa propre boutique
    if (role === "boutique") {
      const user = await User.findById(userId).select("boutique role").lean();
      if (!user) throw new Error("User introuvable");
      if (!user.boutique) throw new Error("Ce compte boutique n'est lié à aucune boutique");

      if (String(user.boutique) !== String(boutiqueIdFromBodyOrDoc)) {
        throw new Error("Accès interdit: promotion d'une autre boutique");
      }
      return;
    }

    // acheteur => interdit
    throw new Error("Accès interdit");
  }

  // GET /promotions
  async getAllPromotions(queryParams = {}) {
    const page = Math.max(1, parseInt(queryParams.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit) || 12));
    const skip = (page - 1) * limit;

    const filter = this.buildFilters(queryParams);
    const sort = this.buildSortOptions(queryParams.sortBy, queryParams.order);

    const [promotions, total] = await Promise.all([
      Promotion.find(filter)
        .populate("boutique", "nom image")
        .populate("event", "titre dateDebut dateFin")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true }),
      Promotion.countDocuments(filter),
    ]);

    return {
      success: true,
      data: promotions,
      pagination: this.getPaginationMetadata(total, page, limit),
      filters: {
        search: queryParams.search || "",
        boutique: queryParams.boutique || "",
        event: queryParams.event || "",
        actif: queryParams.actif || "",
        scope: queryParams.scope || "",
        sortBy: queryParams.sortBy || "created_at",
        order: queryParams.order || "desc",
      },
    };
  }

  // GET /promotions/actives (public)
  async getPromotionsActives(queryParams = {}) {
    const now = new Date();
    const filter = {
      dateDebut: { $lte: now },
      dateFin: { $gte: now },
    };

    if (queryParams.boutique) filter.boutique = String(queryParams.boutique);
    if (queryParams.event) filter.event = String(queryParams.event);

    const promos = await Promotion.find(filter)
      .populate("boutique", "nom image")
      .populate("event", "titre dateDebut dateFin")
      .sort({ dateDebut: 1, _id: 1 })
      .lean({ virtuals: true });

    return { success: true, data: promos };
  }

  // GET /promotions/:id
  async getPromotionById(id) {
    const promo = await Promotion.findById(id)
      .populate("boutique", "nom image")
      .populate("event", "titre dateDebut dateFin")
      .lean({ virtuals: true });

    if (!promo) throw new Error("Promotion introuvable");
    return { success: true, data: promo };
  }

  // POST /promotions (admin ou boutique)
  async createPromotion(data = {}, userId, role) {
    if (!data.boutique) throw new Error("boutique obligatoire");
    if (!data.titre || !String(data.titre).trim()) throw new Error("Titre obligatoire");
    if (!data.dateDebut || !data.dateFin) throw new Error("dateDebut et dateFin obligatoires");
    if (data.pourcentage === undefined || data.pourcentage === null) throw new Error("pourcentage obligatoire");

    await this.assertCanManagePromotion({
      userId,
      role,
      boutiqueIdFromBodyOrDoc: data.boutique,
    });

    const promo = new Promotion({
      boutique: data.boutique,
      event: data.event ?? null,
      titre: String(data.titre).trim(),
      description: data.description ?? "",
      pourcentage: Number(data.pourcentage),
      dateDebut: new Date(data.dateDebut),
      dateFin: new Date(data.dateFin),
      scope: data.scope ?? "PRODUCTS",
      productIds: Array.isArray(data.productIds) ? data.productIds : [],
      createdBy: userId,
      created_at: data.created_at ?? undefined,
    });

    await promo.save();
    await promo.populate("boutique", "nom image");
    await promo.populate("event", "titre dateDebut dateFin");

    return { success: true, data: promo, message: "Promotion créée avec succès" };
  }

  // PUT /promotions/:id (admin ou boutique propriétaire)
  async updatePromotion(id, data = {}, userId, role) {
    const promo = await Promotion.findById(id);
    if (!promo) throw new Error("Promotion introuvable");

    await this.assertCanManagePromotion({
      userId,
      role,
      boutiqueIdFromBodyOrDoc: promo.boutique,
    });

    if (data.titre !== undefined) promo.titre = String(data.titre).trim();
    if (data.description !== undefined) promo.description = data.description ?? "";
    if (data.event !== undefined) promo.event = data.event ?? null;
    if (data.pourcentage !== undefined) promo.pourcentage = Number(data.pourcentage);
    if (data.dateDebut !== undefined) promo.dateDebut = new Date(data.dateDebut);
    if (data.dateFin !== undefined) promo.dateFin = new Date(data.dateFin);
    if (data.scope !== undefined) promo.scope = data.scope;

    if (data.productIds !== undefined) {
      promo.productIds = Array.isArray(data.productIds) ? data.productIds : [];
    }

    await promo.save();
    await promo.populate("boutique", "nom image");
    await promo.populate("event", "titre dateDebut dateFin");

    return { success: true, data: promo, message: "Promotion modifiée avec succès" };
  }

  // DELETE /promotions/:id (admin ou boutique propriétaire)
  async deletePromotion(id, userId, role) {
    const promo = await Promotion.findById(id);
    if (!promo) throw new Error("Promotion introuvable");

    await this.assertCanManagePromotion({
      userId,
      role,
      boutiqueIdFromBodyOrDoc: promo.boutique,
    });

    await promo.deleteOne();
    return { success: true, message: "Promotion supprimée avec succès" };
  }
}

export default new PromotionService();
