import express from 'express';
import {
    signup,
    login
} from '../controllers/aut.controller.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

router.post('/signup',signup);
router.post('/login',login);

export default router;