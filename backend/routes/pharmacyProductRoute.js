import express from 'express';
import { getProductsByPharmacy } from '../controllers/pharmacyProductController.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: PharmacyProduct
 *     description: Pharmacy product endpoints
 */

/**
 * @openapi
 * /api/pharmacy-product/{pharmacyId}:
 *   get:
 *     tags:
 *       - PharmacyProduct
 *     summary: Get products for a pharmacy
 *     parameters:
 *       - name: pharmacyId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Products list
 */
router.get('/:pharmacyId', getProductsByPharmacy);

export default router;
