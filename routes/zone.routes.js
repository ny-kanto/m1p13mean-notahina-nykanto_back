import express from 'express';
import {
    getZones,
    assignZone
} from '../controllers/zone.controller.js';
import auth from '../middlewares/auth.js';
import { checkRole } from '../middlewares/role.js';
import authOptional from '../middlewares/authOptional.js';

const router = express.Router();

router.get('/', authOptional, getZones);

router.put('/:zoneId/assign', auth, checkRole('admin'), (req, res, next) => {
  console.log("ROUTE HIT");
  next();
}, assignZone);

export default router;
