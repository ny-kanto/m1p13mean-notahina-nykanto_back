import express from 'express';
import {
    getAllProduits,
    findProduitById,
    createProduit,
    updateProduit,
    deleteProduit,
} from '../controllers/produit.controller.js';

const router = express.Router();

router.get('/', getAllProduits);
router.get('/:id', findProduitById);
router.post('/', createProduit);
router.put('/:id', updateProduit);
router.delete('/:id', deleteProduit);

export default router;