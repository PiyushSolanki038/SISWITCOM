const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const PaytmChecksum = require('paytmchecksum');
const { prisma } = require('../prismaClient');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET'
});

// @route   POST api/payments/create-order
// @desc    Create a Razorpay order
// @access  Private
router.post('/create-order', async (req, res) => {
    try {
        const { amount, currency = 'USD' } = req.body; // Default to USD for this specific project requirement, though Razorpay is INR usually

        const options = {
            amount: Math.round(amount * 100), // amount in smallest currency unit
            currency,
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ message: 'Server error creating payment order' });
    }
});

// @route   POST api/payments/verify
// @desc    Verify Razorpay payment and update subscription
// @access  Private
router.post('/verify', async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            userId,
            planId,
            amount // We need amount to record the payment
        } = req.body;

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET')
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            const customer = await prisma.user.findUnique({ where: { id: userId } });
            if (!customer) {
                return res.status(404).json({ message: 'User not found' });
            }

            // 1. Update Customer Subscription Status
            await prisma.user.update({
                where: { id: userId },
                data: { subscriptionStatus: 'active', subscriptionPlan: planId },
            });

            // 2. Record Payment in Payment Model
            // Modified to support SaaS flow where invoice/account might not exist yet
            const newPayment = await prisma.payment.create({
                data: {
                    paymentNumber: `PAY-${Date.now()}`,
                    customerId: userId,
                    amount: amount || 0,
                    currency: 'USD',
                    paymentMethod: 'razorpay',
                    status: 'completed',
                    referenceNumber: razorpay_payment_id,
                    notes: `Subscription Payment for Plan: ${planId}`,
                    recordedBy: 'system',
                },
            });

            // 3. Create Subscription Record
            await prisma.subscription.create({
                data: {
                    userId: userId,
                    plan: planId,
                    status: 'active',
                    billingCycle: 'monthly',
                    amount: amount || 0,
                    razorpaySubscriptionId: razorpay_order_id,
                    lastPaymentDate: new Date(),
                    nextPaymentDate: new Date(Date.now() + 30*24*60*60*1000),
                },
            });

            res.json({ 
                success: true, 
                message: 'Payment verified and subscription updated',
                subscriptionStatus: 'active',
                subscriptionPlan: planId
            });
        } else {
            res.status(400).json({ 
                success: false, 
                message: 'Invalid signature' 
            });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Server error verifying payment' });
    }
});

// @route POST api/payments/record
// @desc Manually record a payment (for ERP flow)
router.post('/record', async (req, res) => {
    try {
        const savedPayment = await prisma.payment.create({ data: req.body });
        res.status(201).json(savedPayment);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   POST api/payments/paytm/dev-bypass
// @desc    DEV ONLY: Bypass payment and activate subscription
router.post('/paytm/dev-bypass', async (req, res) => {
    try {
        if (process.env.DEV_PAYMENT_BYPASS === 'false') {
            return res.status(403).json({ message: 'Dev payment bypass disabled' });
        }
        const { userId, plan, amount } = req.body;
        if (!userId || !plan) {
            return res.status(400).json({ message: 'userId and plan are required' });
        }
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: 'User not found' });
        const orderId = `DEV_${Date.now()}`;
        await prisma.paymentTransaction.create({
            data: {
                tenantId: userId,
                userId,
                provider: 'paytm',
                orderId,
                txnId: `TXN_${Date.now()}`,
                amount: String(amount || 0),
                status: 'PAID',
                method: 'dev-bypass',
                paidAt: new Date(),
            }
        });
        await prisma.user.update({
            where: { id: userId },
            data: { subscriptionStatus: 'active', subscriptionPlan: plan },
        });
        await prisma.subscription.create({
            data: {
                tenantId: userId,
                userId,
                planName: plan,
                status: 'active',
                billingCycle: 'monthly',
                amount: String(amount || 0),
                currency: 'INR',
                lastPaymentDate: new Date(),
                nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            }
        });
        res.json({ success: true, message: 'Bypassed payment and activated subscription' });
    } catch (err) {
        console.error('Dev bypass error', err);
        res.status(500).json({ message: 'Server error in dev bypass' });
    }
});
// -------------------- Paytm Integration --------------------
// @route   POST api/payments/paytm/create-order
// @desc    Create Paytm order and return params + checksum
router.post('/paytm/create-order', async (req, res) => {
    try {
        const { amount, userId, plan, callbackUrl } = req.body;
        if (!amount || !userId || !plan) {
            return res.status(400).json({ message: 'amount, userId, plan are required' });
        }
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: 'User not found' });
        const orderId = `ORD_${Date.now()}`;
        const mid = process.env.PAYTM_MERCHANT_ID || 'YOUR_MID';
        const merchantKey = process.env.PAYTM_MERCHANT_KEY || 'YOUR_KEY';
        const website = process.env.PAYTM_WEBSITE || 'WEBSTAGING';
        const gatewayUrl = process.env.PAYTM_GATEWAY_URL || 'https://securegw-stage.paytm.in/order/process';
        const cb = callbackUrl || process.env.PAYTM_CALLBACK_URL || 'http://localhost:5000/api/payments/paytm/callback';
        if (!mid || !merchantKey || merchantKey.length !== 16) {
            return res.status(400).json({
                code: 'PAYTM_CONFIG_INVALID',
                message: 'Invalid Paytm configuration. Ensure PAYTM_MERCHANT_ID is set and PAYTM_MERCHANT_KEY is exactly 16 characters.',
            });
        }
        const params = {
            MID: mid,
            WEBSITE: website,
            INDUSTRY_TYPE_ID: process.env.PAYTM_INDUSTRY_TYPE || 'Retail',
            CHANNEL_ID: process.env.PAYTM_CHANNEL_ID || 'WEB',
            ORDER_ID: orderId,
            CUST_ID: userId,
            TXN_AMOUNT: String(amount),
            CALLBACK_URL: cb,
        };
        const checksum = await PaytmChecksum.generateSignature(params, merchantKey);
        try {
            await prisma.paymentTransaction.create({
                data: {
                    tenantId: userId,
                    userId,
                    provider: 'paytm',
                    orderId,
                    amount: String(amount),
                    status: 'CREATED',
                    method: plan, // temporarily store plan here; read it before callback update
                }
            });
        } catch (dbErr) {
            console.error('paymentTransaction create failed', dbErr);
            // Do not block order creation; continue returning Paytm params
        }
        res.json({ gatewayUrl, params, checksum });
    } catch (err) {
        console.error('Paytm create-order error', err);
        res.status(500).json({ message: 'Server error creating Paytm order' });
    }
});

// @route   POST api/payments/paytm/callback
// @desc    Paytm callback to verify and activate subscription
router.post('/paytm/callback', express.urlencoded({ extended: false }), async (req, res) => {
    try {
        const body = req.body || {};
        const merchantKey = process.env.PAYTM_MERCHANT_KEY || 'YOUR_KEY';
        const isValid = merchantKey && merchantKey.length === 16
            ? PaytmChecksum.verifySignature(body, merchantKey, body.CHECKSUMHASH)
            : false;
        const orderId = body.ORDERID || body.ORDER_ID;
        const txnId = body.TXNID || body.TXN_ID;
        const status = body.STATUS || body.STATUS_CODE;
        const amount = Number(body.TXNAMOUNT || body.TXN_AMOUNT || 0);
        const method = body.PAYMENTMODE || null;
        const userId = body.CUST_ID || null;
        // Read plan stored earlier
        const existingTx = orderId ? await prisma.paymentTransaction.findFirst({ where: { orderId } }) : null;
        const plan = existingTx?.method || null;
        const success = isValid && status === 'TXN_SUCCESS';
        if (!orderId) {
            return res.status(400).send('Invalid callback');
        }
        await prisma.paymentTransaction.updateMany({
            where: { orderId },
            data: {
                txnId,
                status: success ? 'PAID' : 'FAILED',
                method,
                paidAt: success ? new Date() : null,
            }
        });
        if (success && userId) {
            await prisma.user.update({
                where: { id: userId },
                data: { subscriptionStatus: 'active', subscriptionPlan: plan || 'starter' },
            });
            await prisma.subscription.create({
                data: {
                    tenantId: userId,
                    userId,
                    planName: plan || 'starter',
                    status: 'active',
                    billingCycle: 'monthly',
                    amount: String(amount || 0),
                    currency: 'INR',
                    lastPaymentDate: new Date(),
                    nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                }
            });
            const redirectUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:5173/owner-dashboard';
            return res.redirect(redirectUrl);
        }
        const failUrl = process.env.FRONTEND_FAIL_URL || 'http://localhost:5173/signin';
        return res.redirect(failUrl);
    } catch (err) {
        console.error('Paytm callback error', err);
        const failUrl = process.env.FRONTEND_FAIL_URL || 'http://localhost:5173/signin';
        return res.redirect(failUrl);
    }
});

// List transactions for current tenant (requires tenantId query)
router.get('/transactions', async (req, res) => {
    try {
        const { tenantId } = req.query;
        if (!tenantId) return res.status(400).json({ message: 'tenantId required' });
        const rows = await prisma.paymentTransaction.findMany({
            where: { tenantId: String(tenantId) },
            orderBy: { createdAt: 'desc' }
        });
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error listing transactions' });
    }
});

// Admin list all transactions
router.get('/transactions/all', async (_req, res) => {
    try {
        const rows = await prisma.paymentTransaction.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error listing all transactions' });
    }
});

module.exports = router;
