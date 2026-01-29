import express from 'express';
import {
    getProductsByBoutique,
    findProduitById,
    createProduit,
    updateProduit,
    deleteProduit,
} from '../controllers/produit.controller.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.get('/boutique/:boutiqueId', getProductsByBoutique);
router.get('/:id', findProduitById);
router.post('/', upload.array('images', 5), createProduit);
router.put('/:id', updateProduit);
router.delete('/:id', deleteProduit);

export default router;
