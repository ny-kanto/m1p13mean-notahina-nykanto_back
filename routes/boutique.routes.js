// routes/boutique.routes.js

import express from 'express';
import upload from '../middlewares/upload.js';

import {
    getAllBoutiques,
    getBoutiqueById,
    createBoutique,
    updateBoutique,
    deleteBoutique,
    getStatistics,
    searchBoutiques
} from '../controllers/boutique.controller.js';
import authOptional from '../middlewares/authOptional.js';

const router = express.Router();

/**
 * Routes Boutique
 * Base URL : /boutiques
 */

router.get('/', authOptional, getAllBoutiques);

// router.get('/statistics', getStatistics);

router.post('/search', searchBoutiques);

router.get('/:id', getBoutiqueById);

router.post('/', upload.single('image'), createBoutique);

router.put('/:id', upload.single('image'), updateBoutique);

router.delete('/:id', deleteBoutique);

export default router;
