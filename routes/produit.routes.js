import express from 'express';
import {
    getProductsByBoutique,
    findProduitById,
    createProduit,
    updateProduit,
    deleteProduit,
} from '../controllers/produit.controller.js';
import auth from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';
import { checkRole } from '../middlewares/role.js';

const router = express.Router();

router.get('/boutique/:boutiqueId', auth, checkRole('acheteur', 'boutique'), getProductsByBoutique);
router.get('/:id', auth, checkRole('acheteur', 'boutique'), findProduitById);
router.post('/', auth, checkRole('boutique'), upload.array('images', 5), createProduit);
router.put('/:id', auth, checkRole('boutique'), upload.array('images', 5), updateProduit);
router.delete('/:id', auth, checkRole('boutique'), deleteProduit);

export default router;
