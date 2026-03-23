import { Router } from 'express';

import { createOrder, verifyPayment, getPurchases } from '../controllers/payment.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Order Creation — Must be authenticated
router.post('/create-order', authMiddleware as any, createOrder as any);

// Payment Verification — Typically triggered from frontend after pay success
router.post('/verify', authMiddleware as any, verifyPayment as any);

// Fetch Purchases
router.get('/my-purchases', authMiddleware as any, getPurchases as any);

export default router;
