import crypto from 'crypto';

import { Response } from 'express';
import { createLogger } from '@shared/logger';
import Razorpay from 'razorpay';

import { env } from '../config/env';
import prisma from '../db/client';
import { AuthRequest } from '../middlewares/auth';

const log = createLogger('payment-controller');

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'User ID missing' });
    }

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);

    // Persist order as CREATED in DB
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: options.amount,
        currency,
        userId,
        status: 'CREATED',
        receipt: receipt?.toString(),
      },
    });

    log.info({ orderId: order.id, userId }, 'Razorpay order created and persisted');
    res.json({ success: true, order });
  } catch (err: any) {
    log.error({ err }, 'Error creating Razorpay order');
    res.status(500).json({
      success: false,
      error: 'Failed to initialize payment',
      details: err.error?.description || err.message || 'Unknown Razorpay error',
    });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Update DB status to SUCCESS
      await prisma.payment.update({
        where: { orderId: razorpay_order_id },
        data: {
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
          status: 'SUCCESS',
        },
      });

      log.info({ razorpay_payment_id }, 'Payment verified and updated to SUCCESS');
      return res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      // Mark as FAILED? actually, just return error
      log.error({ orderId: razorpay_order_id }, 'Invalid payment signature');
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }
  } catch (err) {
    log.error({ err }, 'Error verifying payment');
    res.status(500).json({ success: false, error: 'Failed to verify payment' });
  }
};

export const getPurchases = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const purchases = await prisma.payment.findMany({
      where: {
        userId,
        status: 'SUCCESS',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ success: true, purchases });
  } catch (err) {
    log.error({ err }, 'Error fetching purchases');
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
