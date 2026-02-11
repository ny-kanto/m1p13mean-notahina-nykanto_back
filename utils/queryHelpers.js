/**
 * FONCTION UNIVERSELLE pour pagination + filtrage
 * Fonctionne avec N'IMPORTE QUEL modèle (Produit, Client, Commande, etc.)
 *
 * @param {Model} model - Le modèle Mongoose
 * @param {Object} baseFilter - Filtre de base (ex: { boutiqueId: '123' })
 * @param {Request} req - L'objet request Express
 * @param {Object} config - Configuration des filtres (IMPORTANT !)
 * @returns {Promise<Object>} - Résultat paginé avec filtres appliqués
 */
export const paginationAvecFiltre = async (model, baseFilter, req, config = {}) => {
    // ============================================
    // 1. PAGINATION (universel)
    // ============================================
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    // ============================================
    // 2. FILTRE DE BASE
    // ============================================
    const filter = { ...baseFilter };

    // ============================================
    // 3. RECHERCHE PAR TEXTE (configurable)
    // ============================================
    if (config.searchFields && req.query.search && req.query.search.trim() !== '') {
        const searchTerm = req.query.search.trim();

        if (config.searchFields.length === 1) {
            // Un seul champ de recherche
            filter[config.searchFields[0]] = {
                $regex: searchTerm,
                $options: 'i'
            };
        } else {
            // Plusieurs champs de recherche (OR)
            filter.$or = config.searchFields.map(field => ({
                [field]: { $regex: searchTerm, $options: 'i' }
            }));
        }
    }

    // ============================================
    // 4. FILTRE PAR PLAGE NUMÉRIQUE (configurable)
    // ============================================
    if (config.rangeField) {
        const minParam = `min${config.rangeField.charAt(0).toUpperCase() + config.rangeField.slice(1)}`;
        const maxParam = `max${config.rangeField.charAt(0).toUpperCase() + config.rangeField.slice(1)}`;

        if (req.query[minParam] || req.query[maxParam]) {
            filter[config.rangeField] = {};
            if (req.query[minParam]) {
                filter[config.rangeField].$gte = parseFloat(req.query[minParam]);
            }
            if (req.query[maxParam]) {
                filter[config.rangeField].$lte = parseFloat(req.query[maxParam]);
            }
        }
    }

    // ============================================
    // 5. FILTRE PAR STATUS/ÉTAT (configurable)
    // ============================================
    if (config.statusField && config.statusRanges && req.query.status && req.query.status !== 'all') {
        const statusConfig = config.statusRanges[req.query.status];

        if (statusConfig !== undefined) {
            if (typeof statusConfig === 'number') {
                // Valeur exacte
                filter[config.statusField] = statusConfig;
            } else if (statusConfig.min !== undefined || statusConfig.max !== undefined) {
                // Plage de valeurs
                filter[config.statusField] = {};
                if (statusConfig.min !== undefined) {
                    filter[config.statusField].$gte = statusConfig.min;
                }
                if (statusConfig.max !== undefined) {
                    filter[config.statusField].$lte = statusConfig.max;
                }
            } else if (typeof statusConfig === 'string') {
                // Valeur string exacte
                filter[config.statusField] = statusConfig;
            }
        }
    }

    // ============================================
    // 6. FILTRES CUSTOM ADDITIONNELS (très flexible)
    // ============================================
    if (config.customFilters) {
        Object.entries(config.customFilters).forEach(([queryParam, filterFunction]) => {
            if (req.query[queryParam]) {
                const customFilter = filterFunction(req.query[queryParam], req.query);
                Object.assign(filter, customFilter);
            }
        });
    }

    // ============================================
    // 7. TRI (universel)
    // ============================================
    let sortOptions = {};
    if (req.query.sortBy) {
        const order = req.query.sortOrder === 'desc' ? -1 : 1;
        sortOptions[req.query.sortBy] = order;
    } else {
        // Tri par défaut
        sortOptions = config.defaultSort || { createdAt: -1 };
    }

    // ============================================
    // 8. EXÉCUTION (universel)
    // ============================================
    const [data, total] = await Promise.all([
        model.find(filter).sort(sortOptions).skip(skip).limit(limit),
        model.countDocuments(filter)
    ]);

    // ============================================
    // 9. RÉSULTAT (universel)
    // ============================================
    return {
        page,
        limit,
        skip,
        data,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        appliedFilters: req.query
    };
};


/**
 * FONCTION SIMPLE (juste pagination, sans filtres)
 */
export const pagination = async (model, filter, req) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        model.find(filter).skip(skip).limit(limit),
        model.countDocuments(filter)
    ]);

    return {
        page,
        limit,
        skip,
        data,
        totalPages: Math.ceil(total / limit),
        totalItems: total
    };
};
