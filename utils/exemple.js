import { paginationAvecFiltre, pagination } from '../utils/queryHelpers.js';
import Produit from '../models/Produit.js';
import Client from '../models/Client.js';
import Commande from '../models/Commande.js';
import Boutique from '../models/Boutique.js';

// ============================================
// 1. PRODUITS (votre cas actuel)
// ============================================
export const getProductsByBoutique = async (req, res) => {
    try {
        const result = await paginationAvecFiltre(
            Produit,
            { boutiqueId: req.params.boutiqueId },
            req,
            {
                // Recherche sur le nom du produit
                searchFields: ['nom'],

                // Filtre par prix (minPrice, maxPrice)
                rangeField: 'prix',

                // Filtre par stock (status=empty/low/ok)
                statusField: 'stock',
                statusRanges: {
                    empty: 0,
                    low: { min: 1, max: 9 },
                    ok: { min: 10 }
                },

                // Tri par défaut
                defaultSort: { createdAt: -1 }
            }
        );
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ============================================
// 2. CLIENTS
// ============================================
export const getClients = async (req, res) => {
    try {
        const result = await paginationAvecFiltre(
            Client,
            {},
            req,
            {
                // Recherche sur nom, prénom, email, téléphone
                searchFields: ['nom', 'prenom', 'email', 'telephone'],

                // Pas de filtre de prix pour les clients
                // Pas de filtre de stock pour les clients

                // Filtres custom
                customFilters: {
                    // ?ville=Antananarivo
                    ville: (value) => ({ ville: value }),

                    // ?typeClient=VIP
                    typeClient: (value) => ({ typeClient: value })
                },

                defaultSort: { nom: 1 }
            }
        );
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ============================================
// 3. COMMANDES
// ============================================
export const getCommandes = async (req, res) => {
    try {
        const result = await paginationAvecFiltre(
            Commande,
            { boutiqueId: req.params.boutiqueId },
            req,
            {
                // Recherche sur numéro de commande
                searchFields: ['numeroCommande'],

                // Filtre par montant total (minTotal, maxTotal)
                rangeField: 'total',

                // Filtre par statut de commande
                statusField: 'statut',
                statusRanges: {
                    pending: 'en_attente',
                    confirmed: 'confirmee',
                    shipped: 'expediee',
                    delivered: 'livree',
                    cancelled: 'annulee'
                },

                // Filtres custom pour les dates
                customFilters: {
                    // ?dateFrom=2024-01-01
                    dateFrom: (value) => ({
                        createdAt: { $gte: new Date(value) }
                    }),

                    // ?dateTo=2024-12-31
                    dateTo: (value) => ({
                        createdAt: { $lte: new Date(value) }
                    }),

                    // ?clientId=123
                    clientId: (value) => ({ clientId: value })
                },

                defaultSort: { createdAt: -1 }
            }
        );
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ============================================
// 4. BOUTIQUES
// ============================================
export const getBoutiques = async (req, res) => {
    try {
        const result = await paginationAvecFiltre(
            Boutique,
            { centreCommercialId: req.params.centreId },
            req,
            {
                // Recherche sur nom de la boutique
                searchFields: ['nom'],

                // Filtres custom
                customFilters: {
                    // ?categorie=Vêtements
                    categorie: (value) => ({ categorie: value }),

                    // ?isActive=true
                    isActive: (value) => ({ isActive: value === 'true' }),

                    // ?etage=1
                    etage: (value) => ({ etage: parseInt(value) })
                },

                defaultSort: { nom: 1 }
            }
        );
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ============================================
// 5. SANS FILTRES (juste pagination)
// ============================================
export const getSimpleList = async (req, res) => {
    try {
        // Utiliser la fonction simple
        const result = await pagination(
            Produit,
            { boutiqueId: req.params.boutiqueId },
            req
        );
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ============================================
// 6. PRODUITS AVEC RECHERCHE AVANCÉE
// ============================================
export const searchProductsAdvanced = async (req, res) => {
    try {
        const result = await paginationAvecFiltre(
            Produit,
            { boutiqueId: req.params.boutiqueId },
            req,
            {
                // Recherche sur nom ET description
                searchFields: ['nom', 'description'],

                // Filtre par prix
                rangeField: 'prix',

                // Filtre par stock
                statusField: 'stock',
                statusRanges: {
                    empty: 0,
                    low: { min: 1, max: 9 },
                    ok: { min: 10 }
                },

                // Filtres supplémentaires
                customFilters: {
                    // ?categorie=Pantalon
                    categorie: (value) => ({ categorie: value }),

                    // ?couleur=Noir
                    couleur: (value) => ({ couleur: value }),

                    // ?taille=M
                    taille: (value) => ({ taille: value }),

                    // ?enPromo=true
                    enPromo: (value) => ({ enPromotion: value === 'true' })
                },

                defaultSort: { createdAt: -1 }
            }
        );
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
