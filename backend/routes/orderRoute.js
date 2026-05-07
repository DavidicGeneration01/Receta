import express from 'express';
import { createOrder } from '../controllers/orderController.js';
import authUser from '../middlewares/authUser.js';

const router = express.Router();

router.post('/create', authUser, createOrder);

export default router;
