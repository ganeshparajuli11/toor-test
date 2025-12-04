import express from 'express';
import Stripe from 'stripe';
import { getSettings } from '../config/store.js';

const router = express.Router();

router.post('/create-payment-intent', async (req, res) => {
    try {
        const settings = await getSettings();
        const { secretKey } = settings.stripe;

        if (!secretKey) {
            return res.status(400).json({ message: 'Stripe is not configured' });
        }

        const stripe = new Stripe(secretKey);
        const { amount, currency = 'usd' } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Stripe Error:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
