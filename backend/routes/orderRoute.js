import express from 'express';
import { createOrder } from '../controllers/orderController.js';
import authUser from '../middlewares/authUser.js';

const router = express.Router();

/**
 * @openapi
 * tags:
 *   - name: Order
 *     description: Orders and payments
 */

/**
 * @openapi
 * /api/order/create:
 *   post:
 *     tags:
 *       - Order
 *     summary: Create an order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Order created
 */
router.post('/create', authUser, createOrder);

export default router;
