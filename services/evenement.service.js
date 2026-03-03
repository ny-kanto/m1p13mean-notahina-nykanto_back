// services/evenement.service.js
import Evenement from "../models/evenement.model.js";
import cloudinary from "../config/cloudinary.js";

class EvenementService {
  // =========================
  // Helpers
  // =========================

  buildFilters(queryParams = {}) {
    const { search, createdBy, actif } = queryParams;
    const filter = {};

    // search sur titre
    if (search && String(search).trim()) {
      filter.titre = { $regex: String(search).trim(), $options: "i" };
    }

    // filtre par créateur (optionnel)
    if (createdBy && String(createdBy).trim()) {
      filter.createdBy = String(createdBy).trim();
    }

    // actif=true => dateDebut <= now <= dateFin
    if (actif === "true") {
      const now = new Date();
      filter.dateDebut = { $lte: now };
      filter.dateFin = { $gte: now };
    }

    return filter;
  }

  buildSortOptions(sortBy = "dateDebut", order = "desc") {
    const sortOptions = {};
    const allowedSortFields = ["titre", "dateDebut", "dateFin", "created_at"];

    if (allowedSortFields.includes(sortBy)) {
      sortOptions[sortBy] = order === "asc" ? 1 : -1;
    } else {
      sortOptions.dateDebut = -1;
    }

    // tri stable
    sortOptions._id = order === "asc" ? 1 : -1;
    return sortOptions;
  }

  getPaginationMetadata(total, page, limit) {
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

  normalizeUploadedImage(file) {
    if (!file) return null;
    return {
      url: file?.path || "",
      public_id: file?.filename ||  "",
    };
  }

  // =========================
  // LISTE / PAGINATION
  // =========================

  async getAllEvenements(queryParams = {}) {
    const page = Math.max(1, parseInt(queryParams.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit) || 12));
    const skip = (page - 1) * limit;

    const filter = this.buildFilters(queryParams);
    const sortOptions = this.buildSortOptions(queryParams.sortBy, queryParams.order);

    const [data, total] = await Promise.all([
      Evenement.find(filter).sort(sortOptions).skip(skip).limit(limit).lean(),
      Evenement.countDocuments(filter),
    ]);

    return {
      success: true,
      data,
      pagination: this.getPaginationMetadata(total, page, limit),
      filters: {
        search: queryParams.search || "",
        createdBy: queryParams.createdBy || "",
        actif: queryParams.actif || "",
        sortBy: queryParams.sortBy || "",
        order: queryParams.order || "",
      },
    };
  }

  // =========================
  // ACTIFS
  // =========================

  async getEvenementsActifs() {
    const now = new Date();
    const data = await Evenement.find({
      dateDebut: { $lte: now },
      dateFin: { $gte: now },
    })
      .sort({ dateDebut: 1, _id: 1 })
      .lean();

    return { success: true, data };
  }

  // =========================
  // BY ID
  // =========================

  async getEvenementById(id) {
    const event = await Evenement.findById(id).lean();
    if (!event) throw new Error("Événement non trouvé");

    return { success: true, data: event };
  }

  // =========================
  // CREATE
  // =========================

  async createEvenement(data = {}, file, userId) {
    if (!data.titre) {
      throw new Error("Titre obligatoire");
    }
    if (!data.dateDebut || !data.dateFin) {
      throw new Error("dateDebut et dateFin obligatoires");
    }

    const image = this.normalizeUploadedImage(file);

    const event = new Evenement({
      titre: String(data.titre).trim(),
      description: data.description ?? "",
      dateDebut: new Date(data.dateDebut),
      dateFin: new Date(data.dateFin),
      image,
      createdBy: userId,
      created_at: data.created_at ?? undefined,
    });

    await event.save();

    return {
      success: true,
      data: event,
      message: "Événement créé avec succès",
    };
  }

  // =========================
  // UPDATE
  // =========================

  async updateEvenement(id, updateData = {}, file) {
    const event = await Evenement.findById(id);
    if (!event) throw new Error("Événement non trouvé");

    // ✅ si nouvelle image => supprimer ancienne image
    if (file && event.image?.public_id) {
      try {
        await cloudinary.uploader.destroy(event.image.public_id);
      } catch (e) {
        console.warn("Suppression image cloudinary échouée:", event.image.public_id);
      }
    }

    // ✅ si nouvelle image => enregistrer
    if (file) {
      event.image = this.normalizeUploadedImage(file);
    }

    // champs simples
    if (updateData.titre !== undefined) event.titre = String(updateData.titre).trim();
    if (updateData.description !== undefined) event.description = updateData.description ?? "";
    if (updateData.dateDebut !== undefined) event.dateDebut = new Date(updateData.dateDebut);
    if (updateData.dateFin !== undefined) event.dateFin = new Date(updateData.dateFin);

    await event.save();

    return {
      success: true,
      data: event,
      message: "Événement modifié avec succès",
    };
  }

  // =========================
  // DELETE
  // =========================

  async deleteEvenement(id) {
    const event = await Evenement.findById(id);
    if (!event) throw new Error("Événement non trouvé");

    // supprimer image cloudinary
    if (event.image?.public_id) {
      try {
        await cloudinary.uploader.destroy(event.image.public_id);
      } catch (e) {
        console.warn("Suppression image cloudinary échouée:", event.image.public_id);
      }
    }

    await event.deleteOne();

    return {
      success: true,
      message: "Événement supprimé avec succès",
    };
  }
}

export default new EvenementService();
