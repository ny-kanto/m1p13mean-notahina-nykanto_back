/**
 * Fonction réutilisable pour gérer la pagination et le filtrage
 * @param {Model} model - Le modèle Mongoose
 * @param {Object} baseFilter - Filtre de base (ex: { boutiqueId: '123' })
 * @param {Request} req - L'objet request Express
 * @returns {Promise<Object>} - Résultat paginé avec filtres appliqués
 */
export const paginationAvecFiltre = async (model, baseFilter, req) => {
    // PAGINATION
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    // CONSTRUCTION DU FILTRE COMPLET
    const filter = { ...baseFilter };

    // Recherche par texte (nom du produit)
    if (req.query.search && req.query.search.trim() !== '') {
        filter.nom = { $regex: req.query.search.trim(), $options: 'i' };
    }

    // Filtre par prix (plage min-max)
    if (req.query.minPrice || req.query.maxPrice) {
        filter.prix = {};
        if (req.query.minPrice) {
            filter.prix.$gte = parseFloat(req.query.minPrice);
        }
        if (req.query.maxPrice) {
            filter.prix.$lte = parseFloat(req.query.maxPrice);
        }
    }

    // Filtre par état du stock
    if (req.query.stockStatus && req.query.stockStatus !== 'all') {
        switch (req.query.stockStatus) {
            case 'empty':
                filter.stock = 0;
                break;
            case 'low':
                filter.stock = { $gt: 0, $lt: 10 };
                break;
            case 'ok':
                filter.stock = { $gte: 10 };
                break;
        }
    }

    // CONSTRUCTION DU TRI
    let sortOptions = {};
    if (req.query.sortBy) {
        const order = req.query.sortOrder === 'desc' ? -1 : 1;
        sortOptions[req.query.sortBy] = order;
    } else {
        // Tri par défaut : plus récents d'abord
        sortOptions = { createdAt: -1 };
    }

    // EXÉCUTION DES REQUÊTES
    const [data, total] = await Promise.all([
        model.find(filter).sort(sortOptions).skip(skip).limit(limit),
        model.countDocuments(filter)
    ]);

    // RÉSULTATS
    return {
        page,
        limit,
        skip,
        data,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        appliedFilters: {
            search: req.query.search,
            minPrice: req.query.minPrice,
            maxPrice: req.query.maxPrice,
            stockStatus: req.query.stockStatus,
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder
        }
    };
};
