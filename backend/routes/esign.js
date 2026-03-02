const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { prisma } = require('../prismaClient');
const auth = require('../middleware/auth');

// @route   POST api/esign/create
// @desc    Create signing session(s) for a contract (Internal/Private)
// @access  Private
router.post('/create', auth, async (req, res) => {
    try {
        const { contractId, signers } = req.body;

        const sessions = [];
        
        for (const signer of signers) {
            // Generate unique token
            const token = crypto.randomBytes(32).toString('hex');
            
            const session = await prisma.signingSession.create({
                data: {
                    token,
                    contractId,
                    signerEmail: signer.email,
                    signerName: signer.name,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            });
            sessions.push(session);
            
            // In a real app, we would send an email here with the link:
            // `${process.env.FRONTEND_URL}/sign/${token}`
            console.log(`[Mock Email] Sending signing link to ${signer.email}: /sign/${token}`);
        }

        res.json(sessions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/esign/session/:token
// @desc    Get signing session details (Public)
// @access  Public
router.get('/session/:token', async (req, res) => {
    try {
        const session = await prisma.signingSession.findUnique({
            where: { token: req.params.token },
            include: { contract: true },
        });
        
        if (!session) {
            return res.status(404).json({ message: 'Invalid or expired signing link' });
        }

        if (new Date(session.expiresAt) < Date.now()) {
            return res.status(400).json({ message: 'Signing link has expired' });
        }

        // Mark as viewed if not already signed
        if (session.status === 'sent') {
            await prisma.signingSession.update({
                where: { token: req.params.token },
                data: { status: 'viewed', viewedAt: new Date() },
            });
        }

        res.json({
            session: await prisma.signingSession.findUnique({ where: { token: req.params.token } }),
            contract: session.contract
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/esign/sign/:token
// @desc    Sign the contract (Public)
// @access  Public
router.post('/sign/:token', async (req, res) => {
    try {
        const { signatureData } = req.body;
        
        const session = await prisma.signingSession.findUnique({ where: { token: req.params.token } });
        if (!session) return res.status(404).json({ message: 'Session not found' });
        
        if (session.status === 'signed') {
            return res.status(400).json({ message: 'Already signed' });
        }

        // Update session
        await prisma.signingSession.update({
            where: { token: req.params.token },
            data: {
                status: 'signed',
                signedAt: new Date(),
                signatureData,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
            },
        });

        // Check if all signers have signed the contract
        // This logic depends on whether we want to update the MAIN contract status here
        // or just this signer's status.
        // Let's update the main contract status if needed.
        
        const contract = await prisma.contract.findUnique({ where: { id: session.contractId } });
        
        // Update specific signer status in contract.signers array
        const signerIndex = (contract.signers || []).findIndex(s => s.email === session.signerEmail);
        if (signerIndex !== -1) {
            const updatedSigners = (contract.signers || []).map((s, i) => i === signerIndex ? { ...s, status: 'signed', signed_at: Date.now() } : s);
            await prisma.contract.update({ where: { id: contract.id }, data: { signers: updatedSigners } });
        }
        
        // Check if all signers are signed
        const refreshed = await prisma.contract.findUnique({ where: { id: contract.id } });
        const allSigned = (refreshed.signers || []).every(s => s.status === 'signed');
        if (allSigned) {
            await prisma.contract.update({ where: { id: refreshed.id }, data: { status: 'active' } });
            // Create ERP Order automatically
            await createERPOrderFromContract(refreshed.id);
        }
        
        res.json({ message: 'Contract signed successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

async function createERPOrderFromContract(contractId) {
    try {
        // Check if order already exists for this contract
        const existingOrder = await prisma.eRPOrder.findFirst({ where: { contractId } });
        if (existingOrder) return;

        const contract = await prisma.contract.findUnique({ where: { id: contractId }, include: { quote: { include: { items: true } } } });
        const quote = contract.quote;
        const items = quote ? quote.items : [];
        const grandTotal = quote ? quote.grandTotal : contract.contract_value || 0;

        // Generate Order Number
        const count = await prisma.eRPOrder.count();
        const orderNumber = `ORD-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

        await prisma.eRPOrder.create({
            data: {
                orderNumber,
                accountId: contract.account_id || null,
                contractId: contract.id,
                status: 'confirmed',
                orderDate: new Date(),
                items: items.map(item => ({
                    description: item.description || 'Service',
                    quantity: item.quantity || 1,
                    unitPrice: item.unitPrice || 0,
                    total: item.total || 0
                })),
                subtotal: grandTotal,
                taxTotal: 0,
                grandTotal: grandTotal,
            },
        });
        console.log(`ERP Order created: ${orderNumber}`);
    } catch (error) {
        console.error("Failed to auto-create ERP Order:", error);
    }
}

module.exports = router;
