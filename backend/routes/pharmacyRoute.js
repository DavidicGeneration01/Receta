import express from "express";
import { getPharmacies, upsertPharmacy } from "../controllers/pharmacyController.js";
import authAdmin from "../middlewares/authAdmin.js";

const pharmacyRouter = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Pharmacy
 *     description: Pharmacy management
 */

/**
 * @openapi
 * /api/pharmacy/list:
 *   get:
 *     tags:
 *       - Pharmacy
 *     summary: List pharmacies
 *     responses:
 *       200:
 *         description: Pharmacies list
 */
pharmacyRouter.get("/list", getPharmacies);

/**
 * @openapi
 * /api/pharmacy/upsert:
 *   post:
 *     tags:
 *       - Pharmacy
 *     summary: Create or update a pharmacy
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Upserted
 */
pharmacyRouter.post("/upsert", authAdmin, upsertPharmacy);

export default pharmacyRouter;