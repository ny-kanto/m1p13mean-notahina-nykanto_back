// services/produit.service.js
import Produit from "../models/produit.model.js";
import cloudinary from "../config/cloudinary.js";

class ProduitService {
  // =========================
  // Helpers
  // =========================

  /**
   * Construit les filtres produits depuis query params
   * Supporte: search, minPrice, maxPrice, boutiqueId (ou boutique)
   */
  buildFilters(query = {}) {
    const { search, minPrice, maxPrice } = query;
    const filter = {};

    // Search par nom
    if (search && String(search).trim()) {
      filter.nom = { $regex: String(search).trim(), $options: "i" };
    }

    // Range prix
    const hasMin = minPrice !== undefined && minPrice !== null && String(minPrice) !== "";
    const hasMax = maxPrice !== undefined && maxPrice !== null && String(maxPrice) !== "";
    if (hasMin || hasMax) {
      filter.prix = {};
      if (hasMin) filter.prix.$gte = Number(minPrice);
      if (hasMax) filter.prix.$lte = Number(maxPrice);
    }

    return filter;
  }

  /**
   * Tri stable
   * Champs autorisés: nom, prix, created_at
   */
  buildSortOptions(sortBy = "created_at", order = "desc") {
    const allowed = ["nom", "prix", "created_at"];
    const sort = {};

    if (allowed.includes(sortBy)) sort[sortBy] = order === "asc" ? 1 : -1;
    else sort.created_at = -1;

    // tri stable
    sort._id = order === "asc" ? 1 : -1;
    return sort;
  }

  getPaginationMeta(total, page, limit) {
    const totalPages = Math.ceil(total / limit);
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

  /**
   * Convertit req.files (multer/cloudinary) -> [{url, public_id}]
   * Supporte 2 cas:
   * - file.path & file.filename (cloudinary storage)
   * - file.secure_url & file.public_id (certaines configs)
   */
  normalizeUploadedImages(files) {
    const list = Array.isArray(files) ? files : [];
    return list.map((file) => ({
      url: file?.path || file?.secure_url || "",
      public_id: file?.filename || file?.public_id || "",
    }));
  }

  // =========================
  // LISTE / PAGINATION
  // =========================

  /**
   * Lister tous les produits (pagination + filtres)
   * query: page, limit, search, minPrice, maxPrice, sortBy, order
   */
  async getAllProduits(queryParams = {}) {
    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 12));
    const skip = (page - 1) * limit;

    const filter = this.buildFilters(queryParams);
    const sort = this.buildSortOptions(queryParams.sortBy, queryParams.order);

    const [data, total] = await Promise.all([
      Produit.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Produit.countDocuments(filter),
    ]);

    return {
      success: true,
      data,
      pagination: this.getPaginationMeta(total, page, limit),
      filters: {
        search: queryParams.search || "",
        minPrice: queryParams.minPrice || "",
        maxPrice: queryParams.maxPrice || "",
        sortBy: queryParams.sortBy || "",
        order: queryParams.order || "",
      },
    };
  }

  /**
   * Lister les produits d'une boutique (pagination + filtres)
   * IMPORTANT: champ = boutique (pas boutiqueId)
   */
  async getProductsByBoutique(boutiqueId, queryParams = {}) {
    if (!boutiqueId) throw new Error("boutiqueId requis");

    const page = Math.max(1, parseInt(queryParams.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit, 10) || 12));
    const skip = (page - 1) * limit;

    const filter = this.buildFilters(queryParams);
    filter.boutique = boutiqueId;

    const sort = this.buildSortOptions(queryParams.sortBy, queryParams.order);

    const [data, total] = await Promise.all([
      Produit.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Produit.countDocuments(filter),
    ]);

    return {
      success: true,
      data,
      pagination: this.getPaginationMeta(total, page, limit),
      filters: {
        boutique: boutiqueId,
        search: queryParams.search || "",
        minPrice: queryParams.minPrice || "",
        maxPrice: queryParams.maxPrice || "",
        sortBy: queryParams.sortBy || "",
        order: queryParams.order || "",
      },
    };
  }

  // =========================
  // PRODUIT BY ID
  // =========================

  async getProduitById(id) {
    const produit = await Produit.findById(id).lean();
    if (!produit) throw new Error("Produit non trouvé");
    return { success: true, data: produit };
  }

  // =========================
  // CREATE
  // =========================

  /**
   * createProduit(produitData, files)
   * - produitData doit contenir au moins: nom, boutique (ou boutiqueId)
   * - files = req.files (upload multiple)
   */
  async createProduit(produitData = {}, files = []) {
    const boutique = produitData.boutique || produitData.boutiqueId;
    if (!produitData.nom || !String(produitData.nom).trim()) {
      throw new Error("Nom obligatoire");
    }
    if (!boutique) {
      throw new Error("Boutique obligatoire (boutique ou boutiqueId)");
    }

    const images = this.normalizeUploadedImages(files);

    const newProduit = new Produit({
      nom: String(produitData.nom).trim(),
      boutique,
      description: produitData.description ?? "",
      prix: Number(produitData.prix ?? 0),
      images,
      // noteMoyenne / noteCompte restent par défaut
      created_at: produitData.created_at ?? undefined,
    });

    await newProduit.save();

    return {
      success: true,
      data: newProduit,
      message: "Produit créé avec succès",
    };
  }

  // =========================
  // UPDATE
  // =========================

  /**
   * updateProduit(id, updateData, files)
   * - Si files est fourni => remplace les images (et supprime anciennes sur cloudinary si public_id présent)
   * - Sinon => conserve images existantes
   */
  async updateProduit(id, updateData = {}, files = []) {
    const produit = await Produit.findById(id);
    if (!produit) throw new Error("Produit non trouvé");

    // Si nouvelles images => supprimer anciennes puis remplacer
    if (Array.isArray(files) && files.length > 0) {
      // supprime anciennes images cloudinary
      const old = Array.isArray(produit.images) ? produit.images : [];
      for (const img of old) {
        if (img?.public_id) {
          try {
            await cloudinary.uploader.destroy(img.public_id);
          } catch (e) {
            // on ne bloque pas la mise à jour si une suppression échoue
            console.warn("Suppression cloudinary échouée:", img.public_id);
          }
        }
      }

      produit.images = this.normalizeUploadedImages(files);
    }

    // Champs simples
    if (updateData.nom !== undefined) produit.nom = String(updateData.nom).trim();
    if (updateData.description !== undefined) produit.description = updateData.description ?? "";
    if (updateData.prix !== undefined) produit.prix = Number(updateData.prix ?? 0);

    // boutique/boutiqueId (optionnel)
    const newBoutique = updateData.boutique || updateData.boutiqueId;
    if (newBoutique) produit.boutique = newBoutique;

    await produit.save();

    return {
      success: true,
      data: produit,
      message: "Produit modifié avec succès",
    };
  }

  // =========================
  // DELETE
  // =========================

  async deleteProduit(id) {
    const produit = await Produit.findById(id);
    if (!produit) throw new Error("Produit non trouvé");

    // supprimer images cloudinary
    const imgs = Array.isArray(produit.images) ? produit.images : [];
    for (const img of imgs) {
      if (img?.public_id) {
        try {
          await cloudinary.uploader.destroy(img.public_id);
        } catch (e) {
          console.warn("Suppression cloudinary échouée:", img.public_id);
        }
      }
    }

    await produit.deleteOne();

    return { success: true, message: "Produit supprimé avec succès" };
  }

  // =========================
  // RECHERCHE (POST /produits/search)
  // =========================
  /**
   * Recherche plus libre (sans pagination obligatoire)
   * criteria:
   * - text (nom/description)
   * - boutiqueId/boutique
   * - minPrice/maxPrice
   */
  async searchProduits(criteria = {}) {
    const filter = {};

    const text = criteria.text ? String(criteria.text).trim() : "";
    if (text) {
      filter.$or = [
        { nom: { $regex: text, $options: "i" } },
        { description: { $regex: text, $options: "i" } },
      ];
    }

    const boutique = criteria.boutique || criteria.boutiqueId;
    if (boutique) {
      filter.boutique = boutique;
    }

    const hasMin = criteria.minPrice !== undefined && criteria.minPrice !== null && String(criteria.minPrice) !== "";
    const hasMax = criteria.maxPrice !== undefined && criteria.maxPrice !== null && String(criteria.maxPrice) !== "";
    if (hasMin || hasMax) {
      filter.prix = {};
      if (hasMin) filter.prix.$gte = Number(criteria.minPrice);
      if (hasMax) filter.prix.$lte = Number(criteria.maxPrice);
    }

    const produits = await Produit.find(filter).sort({ created_at: -1, _id: 1 }).lean();

    return {
      success: true,
      data: produits,
      count: produits.length,
    };
  }
}

export default new ProduitService();
