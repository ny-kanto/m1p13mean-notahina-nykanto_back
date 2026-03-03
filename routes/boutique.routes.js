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
import auth from '../middlewares/auth.js';
import { checkRole } from '../middlewares/role.js';

const router = express.Router();

/**
 * Routes Boutique
 * Base URL : /boutiques
 */

router.get('/', authOptional, getAllBoutiques);

router.post('/search', auth, checkRole('admin'), searchBoutiques);

router.get('/:id', getBoutiqueById);

router.post('/', auth, checkRole('admin'), upload.single('image'), createBoutique);

router.put('/:id', auth, checkRole('admin'), upload.single('image'), updateBoutique);

router.delete('/:id', auth, checkRole('admin'), deleteBoutique);

export default router;
