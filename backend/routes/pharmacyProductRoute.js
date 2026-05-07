import express from 'express';
import { getProductsByPharmacy } from '../controllers/pharmacyProductController.js';

const router = express.Router();

router.get('/:pharmacyId', getProductsByPharmacy);

export default router;
