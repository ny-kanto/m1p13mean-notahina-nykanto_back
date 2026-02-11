// services/boutique.service.js
import Boutique from "../models/boutique.model.js";
import cloudinary from "../config/cloudinary.js";

class BoutiqueService {

    /**
     * Construire les filtres à partir des query params
     * @param {Object} queryParams - Paramètres de recherche
     * @returns {Object} Filtre MongoDB
     */
    buildFilters(queryParams) {
        const { search, categorie, etage } = queryParams;
        const filter = {};

        if (search && search.trim()) {
            filter.nom = {
                $regex: search.trim(),
                $options: "i"
            };
        }

        if (categorie && categorie.trim()) {
            filter.categorie = categorie.trim();
        }

        if (etage !== undefined && etage !== "") {
            filter.etage = parseInt(etage);
        }

        return filter;
    }

    /**
 * Construire les options de tri AVEC TRI STABLE
 * @param {String} sortBy - Champ à trier
 * @param {String} order - Ordre (asc/desc)
 * @returns {Object} Options de tri MongoDB
 */
    buildSortOptions(sortBy = "created_at", order = "desc") {
        const sortOptions = {};
        const allowedSortFields = ["nom", "created_at", "etage"];

        if (allowedSortFields.includes(sortBy)) {
            sortOptions[sortBy] = order === "asc" ? 1 : -1;
        } else {
            sortOptions.created_at = -1;
        }

        // Tri stable
        sortOptions._id = order === "asc" ? 1 : -1;

        return sortOptions;
    }

    /**
 * Calculer les métadonnées de pagination
 * @param {Number} total - Nombre total d'éléments
 * @param {Number} page - Page actuelle
 * @param {Number} limit - Nombre d'éléments par page
 * @returns {Object} Métadonnées de pagination
 */
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
            prevPage: page > 1 ? page - 1 : null
        };
    }

    /**
 * Récupérer toutes les boutiques avec filtres et pagination
 * @param {Object} queryParams - Paramètres de requête
 * @returns {Promise<Object>} Résultat avec données et pagination
 */
    async getAllBoutiques(queryParams) {
        try {
            const page = Math.max(1, parseInt(queryParams.page) || 1);
            const limit = Math.min(100, Math.max(1, parseInt(queryParams.limit) || 12));
            const skip = (page - 1) * limit;

            const filter = this.buildFilters(queryParams);
            const sortOptions = this.buildSortOptions(
                queryParams.sortBy,
                queryParams.order
            );

            const [boutiques, total] = await Promise.all([
                Boutique.find(filter)
                    .populate("categorie", "nom")
                    .sort(sortOptions)
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Boutique.countDocuments(filter)
            ]);

            // Ajouter ouvertMaintenant
            let data = boutiques.map(b => ({
                ...b,
                ouvertMaintenant: Boutique.isOpenNow(b)
            }));

            // Filtrer par ouvert=true / false
            if (queryParams.ouvert === "true") {
                data = data.filter(b => b.ouvertMaintenant);
            }

            if (queryParams.ouvert === "false") {
                data = data.filter(b => !b.ouvertMaintenant);
            }

            const pagination = this.getPaginationMetadata(total, page, limit);

            return {
                success: true,
                data,
                pagination,
                filters: {
                    search: queryParams.search || "",
                    categorie: queryParams.categorie || "",
                    etage: queryParams.etage || "",
                    ouvert: queryParams.ouvert || ""
                }
            };

        } catch (error) {
            throw new Error(`Erreur service getAllBoutiques: ${error.message}`);
        }
    }

    /**
   * Récupérer une boutique par ID
   * @param {String} id - ID de la boutique
   * @returns {Promise<Object>} Boutique trouvée
   */
    async getBoutiqueById(id) {
        try {
            const boutique = await Boutique
                .findById(id)
                .populate("categorie", "nom")
                .lean();

            if (!boutique) {
                throw new Error("Boutique non trouvée");
            }

            return {
                success: true,
                data: {
                    ...boutique,
                    ouvertMaintenant: Boutique.isOpenNow(boutique)
                }
            };

        } catch (error) {
            throw new Error(`Erreur service getBoutiqueById: ${error.message}`);
        }
    }

    /**
     * Créer une nouvelle boutique
     * @param {Object} boutiqueData - Données de la boutique
     * @returns {Promise<Object>} Boutique créée
     */
    async createBoutique(boutiqueData) {
        console.log('NEW DATA', boutiqueData);
        try {
            if (!boutiqueData.nom || !boutiqueData.categorie) {
                throw new Error("Nom et catégorie sont obligatoires");
            }

            const boutique = new Boutique(boutiqueData);
            await boutique.save();
            await boutique.populate("categorie", "nom");

            return {
                success: true,
                data: boutique,
                message: "Boutique créée avec succès"
            };

        } catch (error) {
            throw new Error(`Erreur service createBoutique: ${error.message}`);
        }
    }

    /**
     * Modifier une boutique
     * @param {String} id - ID de la boutique
     * @param {Object} updateData - Données à modifier
     * @returns {Promise<Object>} Boutique modifiée
     */
    async updateBoutique(id, updateData, file) {
        const boutique = await Boutique.findById(id);
        if (!boutique) throw new Error("Boutique non trouvée");

        // ✅ si nouvelle image => supprimer ancienne image
        if (file && boutique.image?.public_id) {
            await cloudinary.uploader.destroy(boutique.image.public_id);
        }

        // ✅ si nouvelle image => enregistrer
        if (file) {
            boutique.image = {
                url: file.path,
                public_id: file.filename,
            };
        }

        // ✅ Normaliser horaires (ferme = boolean)
        if (updateData.horaires) {
            const jours = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

            jours.forEach((jour) => {
                const h = updateData.horaires[jour];
                if (!h) return;

                // convertir "true"/"false" en boolean
                const fermeBool = h.ferme === true || h.ferme === "true";
                h.ferme = fermeBool;

                // si pas fermé => ouverture/fermeture obligatoires
                if (!fermeBool) {
                    h.ouverture = h.ouverture ?? "";
                    h.fermeture = h.fermeture ?? "";
                    if (!h.ouverture || !h.fermeture) {
                        throw new Error(`Horaires invalides: ${jour} doit avoir ouverture + fermeture`);
                    }
                } else {
                    // si fermé => on peut nettoyer ouverture/fermeture
                    delete h.ouverture;
                    delete h.fermeture;
                }
            });
        }

        // ✅ assign champs simples
        boutique.nom = updateData.nom ?? boutique.nom;
        boutique.categorie = updateData.categorie ?? boutique.categorie;
        boutique.etage = updateData.etage ?? boutique.etage;
        boutique.contact = updateData.contact ?? boutique.contact;
        boutique.horaires = updateData.horaires ?? boutique.horaires;

        await boutique.save();
        await boutique.populate("categorie", "nom");

        return {
            success: true,
            data: boutique,
            message: "Boutique modifiée avec succès",
        };
    }




    /**
     * Supprimer une boutique
     * @param {String} id - ID de la boutique
     * @returns {Promise<Object>} Confirmation de suppression
     */
    async deleteBoutique(id) {
        const boutique = await Boutique.findById(id);
        if (!boutique) throw new Error('Boutique non trouvée');

        if (boutique.image?.public_id) {
            await cloudinary.uploader.destroy(boutique.image.public_id);
        }

        await boutique.deleteOne();

        return {
            success: true,
            message: 'Boutique supprimée avec succès'
        };
    }


    /**
     * Obtenir les statistiques des boutiques
     * @returns {Promise<Object>} Statistiques
     */
    async getStatistics() {
        try {
            const boutiques = await Boutique.find().lean();

            const ouvertes = boutiques.filter(b =>
                Boutique.isOpenNow(b)
            ).length;

            const fermees = boutiques.length - ouvertes;

            const parCategorie = await Boutique.aggregate([
                {
                    $group: {
                        _id: "$categorie",
                        count: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "_id",
                        foreignField: "_id",
                        as: "categorieInfo"
                    }
                },
                {
                    $project: {
                        categorie: { $arrayElemAt: ["$categorieInfo.nom", 0] },
                        count: 1
                    }
                }
            ]);

            const parEtage = await Boutique.aggregate([
                {
                    $group: {
                        _id: "$etage",
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ]);

            return {
                success: true,
                data: {
                    total: boutiques.length,
                    ouvertes,
                    fermees,
                    parCategorie,
                    parEtage
                }
            };

        } catch (error) {
            throw new Error(`Erreur service getStatistics: ${error.message}`);
        }
    }

    async searchBoutiques(criteria) {
        try {
            const filter = {};

            // Recherche textuelle
            if (criteria.text && criteria.text.trim()) {
                filter.$or = [
                    { nom: { $regex: criteria.text.trim(), $options: "i" } },
                    { "contact.email": { $regex: criteria.text.trim(), $options: "i" } }
                ];
            }

            // Filtres catégories
            if (criteria.categories?.length) {
                filter.categorie = { $in: criteria.categories };
            }

            // Filtres étages
            if (criteria.etages?.length) {
                filter.etage = { $in: criteria.etages };
            }

            let boutiques = await Boutique
                .find(filter)
                .populate("categorie", "nom")
                .lean();

            // Filtre ouvert maintenant
            if (criteria.ouvert === true || criteria.ouvert === "true") {
                boutiques = boutiques.filter(b =>
                    Boutique.isOpenNow(b)
                );
            }

            // Filtre fermé maintenant
            if (criteria.ouvert === false || criteria.ouvert === "false") {
                boutiques = boutiques.filter(b =>
                    !Boutique.isOpenNow(b)
                );
            }

            return {
                success: true,
                data: boutiques.map(b => ({
                    ...b,
                    ouvertMaintenant: Boutique.isOpenNow(b)
                })),
                count: boutiques.length
            };

        } catch (error) {
            throw new Error(`Erreur service searchBoutiques: ${error.message}`);
        }
    }
}

const boutiqueService = new BoutiqueService();
export default boutiqueService;
