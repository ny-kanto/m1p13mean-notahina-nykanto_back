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
    upload.array('images', 5)(req, res, err => {
        if (err) {
            return res.status(413).json({
                message: 'Image trop volumineuse (max 2MB par image)'
            });
        }
        next();
    });
}, createProduit);

router.put('/:id', updateProduit);
router.delete('/:id', deleteProduit);

export default router;
