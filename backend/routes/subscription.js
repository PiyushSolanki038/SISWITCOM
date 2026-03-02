const express = require('express');
const router = express.Router();
const { prisma } = require('../prismaClient');
const auth = require('../middleware/auth'); // Assuming you have auth middleware

// @route   POST api/subscription/update
// @desc    Update subscription status (Mock Payment)
// @access  Public (Should be protected in real app, but simplified for this task)
router.post('/update', async (req, res) => {
  const { userId, plan } = req.body;

  if (!userId || !plan) {
    return res.status(400).json({ message: 'User ID and Plan are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update User Model
    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionStatus: 'active', subscriptionPlan: plan },
    });

    // Create Subscription Record
    const amountMap = {
      'starter': 49,
      'professional': 149,
      'enterprise': 999 // Placeholder
    };

    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: plan,
        status: 'active',
        amount: amountMap[plan] || 0,
        startDate: new Date(),
        billingCycle: 'monthly',
        currency: 'USD',
      },
    });

    res.json({ 
        success: true, 
        message: 'Subscription updated successfully',
        user: {
            id: user.id,
            name: user.firstName || '',
            email: user.email,
            role: user.role,
            subscriptionStatus: 'active',
            subscriptionPlan: plan
        }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/subscription/my-subscription
// @desc    Get user's active subscription (Uses token)
// @access  Private
router.get('/my-subscription', auth, async (req, res) => {
    try {
        const subscription = await prisma.subscription.findFirst({
          where: { userId: req.user.id, status: 'active' },
          orderBy: { createdAt: 'desc' },
        });

        // Return empty if not found, don't 404
        if (!subscription) {
            return res.json(null);
        }

        res.json(subscription);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
