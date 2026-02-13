import express from 'express';
import {
    getZones,
    assignZone
} from '../controllers/zone.controller.js';

const router = express.Router();

router.get('/', getZones);
router.put('/:zoneId/assign', (req, res, next) => {
  console.log("ROUTE HIT");
  next();
}, assignZone);

export default router;