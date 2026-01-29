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
router.post('/', (req, res, next) => {
    console.log('Route POST /produits appelée');
    next();
}, upload.array('images', 5), (req, res, next) => {
    console.log('Multer a terminé, passage au controller');
    next();
}, createProduit);

router.put('/:id', updateProduit);
router.delete('/:id', deleteProduit);

export default router;
