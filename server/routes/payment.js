import express from 'express';
import Stripe from 'stripe';
import { getSettings } from '../config/store.js';
import { getBookings, saveBookings, getBookingById, updateBooking } from '../config/bookingStore.js';

const router = express.Router();

// Helper to get Stripe instance (uses database settings only)
const getStripeInstance = async () => {
    const settings = await getSettings();
    const secretKey = settings.stripe?.secretKey;

    if (!secretKey) {
        return null;
    }

    return new Stripe(secretKey);
};

/**
 * Get Stripe publishable key for frontend (public endpoint)
 */
router.get('/publishable-key', async (req, res) => {
    try {
        const settings = await getSettings();
        const publishableKey = settings.stripe?.publishableKey || '';

        res.json({
            success: true,
            publishableKey
        });
    } catch (error) {
        console.error('[Payment] Error getting publishable key:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * Create a payment intent for a booking
 */
router.post('/create-payment-intent', async (req, res) => {
    try {
        const stripe = await getStripeInstance();

        if (!stripe) {
            return res.status(400).json({
                success: false,
                message: 'Stripe is not configured. Please configure Stripe in Admin Settings.'
            });
        }

        const { amount, currency = 'chf', bookingId, customerEmail, customerName, description, metadata = {} } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
        }

        // Create payment intent with metadata for tracking
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency.toLowerCase(),
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                bookingId: bookingId || '',
                customerEmail: customerEmail || '',
                customerName: customerName || '',
                source: 'zanafly',
                ...metadata
            },
            description: description || `Zanafly Booking Payment`,
            receipt_email: customerEmail || undefined,
        });

        console.log('[Payment] PaymentIntent created:', paymentIntent.id, 'Amount:', amount, currency);

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        console.error('[Payment] Stripe Error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * Retrieve payment intent details
 */
router.get('/payment-intent/:id', async (req, res) => {
    try {
        const stripe = await getStripeInstance();

        if (!stripe) {
            return res.status(400).json({
                success: false,
                message: 'Stripe is not configured'
            });
        }

        const { id } = req.params;
        const paymentIntent = await stripe.paymentIntents.retrieve(id);

        res.json({
            success: true,
            paymentIntent: {
                id: paymentIntent.id,
                amount: paymentIntent.amount / 100, // Convert back to dollars
                currency: paymentIntent.currency,
                status: paymentIntent.status,
                created: new Date(paymentIntent.created * 1000).toISOString(),
                metadata: paymentIntent.metadata,
                charges: paymentIntent.latest_charge ? {
                    id: paymentIntent.latest_charge,
                    receipt_url: paymentIntent.charges?.data[0]?.receipt_url
                } : null
            }
        });
    } catch (error) {
        console.error('[Payment] Error retrieving payment intent:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * Process refund for a payment
 */
router.post('/refund', async (req, res) => {
    try {
        const stripe = await getStripeInstance();

        if (!stripe) {
            return res.status(400).json({
                success: false,
                message: 'Stripe is not configured'
            });
        }

        const { paymentIntentId, amount, reason = 'requested_by_customer' } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({
                success: false,
                message: 'Payment intent ID is required'
            });
        }

        // Create refund
        const refundParams = {
            payment_intent: paymentIntentId,
            reason: reason
        };

        // If amount provided, do partial refund
        if (amount) {
            refundParams.amount = Math.round(amount * 100);
        }

        const refund = await stripe.refunds.create(refundParams);

        console.log('[Payment] Refund processed:', refund.id, 'Amount:', refund.amount / 100);

        res.json({
            success: true,
            refund: {
                id: refund.id,
                amount: refund.amount / 100,
                currency: refund.currency,
                status: refund.status,
                created: new Date(refund.created * 1000).toISOString()
            }
        });
    } catch (error) {
        console.error('[Payment] Refund error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * Get all payments from Stripe (for admin)
 */
router.get('/payments', async (req, res) => {
    try {
        const stripe = await getStripeInstance();

        if (!stripe) {
            // Return empty array if Stripe not configured
            return res.json({
                success: true,
                payments: [],
                hasMore: false,
                message: 'Stripe is not configured'
            });
        }

        const { limit = 50, starting_after, status } = req.query;

        const params = {
            limit: parseInt(limit),
            expand: ['data.charges']
        };

        if (starting_after) {
            params.starting_after = starting_after;
        }

        const paymentIntents = await stripe.paymentIntents.list(params);

        // Filter by status if provided
        let payments = paymentIntents.data;
        if (status) {
            payments = payments.filter(pi => pi.status === status);
        }

        // Transform to a more usable format
        const transformedPayments = payments.map(pi => {
            const charge = pi.charges?.data?.[0];
            return {
                id: pi.id,
                amount: pi.amount / 100,
                currency: pi.currency.toUpperCase(),
                status: pi.status,
                created: new Date(pi.created * 1000).toISOString(),
                customerEmail: pi.receipt_email || pi.metadata?.customerEmail || '',
                customerName: pi.metadata?.customerName || '',
                bookingId: pi.metadata?.bookingId || '',
                description: pi.description,
                paymentMethod: charge?.payment_method_details?.type || 'card',
                cardBrand: charge?.payment_method_details?.card?.brand || '',
                cardLast4: charge?.payment_method_details?.card?.last4 || '',
                receiptUrl: charge?.receipt_url || '',
                refunded: pi.amount_received !== pi.amount || charge?.refunded,
                amountRefunded: charge?.amount_refunded ? charge.amount_refunded / 100 : 0,
                fee: charge?.balance_transaction ? null : (pi.amount / 100 * 0.029 + 0.30).toFixed(2), // Estimate fee
                isDemo: false
            };
        });

        res.json({
            success: true,
            payments: transformedPayments,
            hasMore: paymentIntents.has_more
        });
    } catch (error) {
        console.error('[Payment] Error fetching payments:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * Get payment statistics for admin dashboard
 */
router.get('/stats', async (req, res) => {
    try {
        const stripe = await getStripeInstance();

        const stats = {
            totalRevenue: 0,
            successfulPayments: 0,
            pendingPayments: 0,
            failedPayments: 0,
            refundedAmount: 0,
            averagePayment: 0,
            stripeConfigured: !!stripe
        };

        if (!stripe) {
            return res.json({
                success: true,
                stats,
                message: 'Stripe is not configured'
            });
        }

        // Get payment intents from last 30 days
        const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);

        const paymentIntents = await stripe.paymentIntents.list({
            limit: 100,
            created: { gte: thirtyDaysAgo }
        });

        paymentIntents.data.forEach(pi => {
            if (pi.status === 'succeeded') {
                stats.totalRevenue += pi.amount_received / 100;
                stats.successfulPayments++;
            } else if (pi.status === 'requires_payment_method' || pi.status === 'requires_confirmation') {
                stats.pendingPayments++;
            } else if (pi.status === 'canceled') {
                stats.failedPayments++;
            }
        });

        // Get refunds
        const refunds = await stripe.refunds.list({
            limit: 100,
            created: { gte: thirtyDaysAgo }
        });

        refunds.data.forEach(refund => {
            stats.refundedAmount += refund.amount / 100;
        });

        stats.averagePayment = stats.successfulPayments > 0
            ? (stats.totalRevenue / stats.successfulPayments).toFixed(2)
            : 0;

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('[Payment] Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * Webhook handler for Stripe events (uses database settings only)
 * Note: Raw body parsing is handled at server.js level for this route
 */
router.post('/webhook', async (req, res) => {
    try {
        const settings = await getSettings();
        const webhookSecret = settings.stripe?.webhookSecret;
        const stripe = await getStripeInstance();

        if (!stripe) {
            return res.status(400).json({ message: 'Stripe not configured' });
        }

        let event;

        if (webhookSecret) {
            const sig = req.headers['stripe-signature'];
            try {
                event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
            } catch (err) {
                console.error('[Webhook] Signature verification failed:', err.message);
                return res.status(400).send(`Webhook Error: ${err.message}`);
            }
        } else {
            // Without webhook secret, parse body directly (not recommended for production)
            event = req.body;
        }

        console.log('[Webhook] Received event:', event.type);

        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log('[Webhook] Payment succeeded:', paymentIntent.id);

                // Update booking status if bookingId is in metadata
                if (paymentIntent.metadata?.bookingId) {
                    try {
                        const booking = await getBookingById(paymentIntent.metadata.bookingId);
                        if (booking) {
                            await updateBooking(paymentIntent.metadata.bookingId, {
                                paymentStatus: 'paid',
                                paymentId: paymentIntent.id,
                                paymentAmount: paymentIntent.amount_received / 100,
                                paymentCurrency: paymentIntent.currency,
                                paidAt: new Date().toISOString()
                            });
                            console.log('[Webhook] Updated booking:', paymentIntent.metadata.bookingId);
                        }
                    } catch (err) {
                        console.error('[Webhook] Error updating booking:', err);
                    }
                }
                break;

            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                console.log('[Webhook] Payment failed:', failedPayment.id);

                if (failedPayment.metadata?.bookingId) {
                    try {
                        await updateBooking(failedPayment.metadata.bookingId, {
                            paymentStatus: 'failed',
                            paymentError: failedPayment.last_payment_error?.message
                        });
                    } catch (err) {
                        console.error('[Webhook] Error updating failed booking:', err);
                    }
                }
                break;

            case 'charge.refunded':
                const refundedCharge = event.data.object;
                console.log('[Webhook] Charge refunded:', refundedCharge.id);

                // Find and update the associated booking
                if (refundedCharge.payment_intent) {
                    const pi = await stripe.paymentIntents.retrieve(refundedCharge.payment_intent);
                    if (pi.metadata?.bookingId) {
                        await updateBooking(pi.metadata.bookingId, {
                            status: 'refunded',
                            paymentStatus: 'refunded',
                            refundedAt: new Date().toISOString(),
                            refundAmount: refundedCharge.amount_refunded / 100
                        });
                    }
                }
                break;

            default:
                console.log('[Webhook] Unhandled event type:', event.type);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('[Webhook] Error:', error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * Check Stripe configuration status (uses database settings only)
 */
router.get('/config-status', async (req, res) => {
    try {
        const settings = await getSettings();
        const hasSecretKey = !!settings.stripe?.secretKey;
        const hasPublishableKey = !!settings.stripe?.publishableKey;
        const hasWebhookSecret = !!settings.stripe?.webhookSecret;

        let connectionStatus = 'not_configured';

        if (hasSecretKey) {
            try {
                const stripe = await getStripeInstance();
                if (stripe) {
                    // Try a simple API call to verify the key works
                    await stripe.balance.retrieve();
                    connectionStatus = 'connected';
                }
            } catch (err) {
                connectionStatus = 'error';
                console.error('[Payment] Stripe connection error:', err.message);
            }
        }

        res.json({
            success: true,
            config: {
                hasSecretKey,
                hasPublishableKey,
                hasWebhookSecret,
                connectionStatus,
                publishableKey: settings.stripe?.publishableKey || ''
            }
        });
    } catch (error) {
        console.error('[Payment] Config status error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
