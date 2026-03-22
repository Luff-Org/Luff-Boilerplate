import crypto from 'crypto';

import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import { createLogger } from '@shared/logger';

import { env } from '../config/env';

const log = createLogger('payment-controller');

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    const options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);
    log.info({ orderId: order.id }, 'Razorpay order created');
    res.json({ success: true, order });
  } catch (err) {
    log.error({ err }, 'Error creating Razorpay order');
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      log.info({ razorpay_payment_id }, 'Payment verified successfully');
      return res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      log.error('Invalid payment signature');
      return res.status(400).json({ success: false, error: 'Invalid signature' });
    }
  } catch (err) {
    log.error({ err }, 'Error verifying payment');
    res.status(500).json({ success: false, error: 'Failed to verify payment' });
  }
};
