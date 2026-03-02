const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const { getWelcomeEmail, getLoginNotificationEmail, getPasswordResetEmail } = require('../utils/emailTemplates');
const { prisma } = require('../prismaClient');
const { randomUUID } = require('crypto');

const toEnumRole = (role) => {
  if (!role) return null;
  const r = role.toLowerCase();
  if (r === 'admin') return 'ADMIN';
  if (r === 'owner') return 'OWNER';
  if (r === 'employee') return 'EMPLOYEE';
  if (r === 'customer') return 'CUSTOMER';
  return null;
};
const toWireRole = (roleEnum) => {
  if (!roleEnum) return null;
  const map = { ADMIN: 'admin', OWNER: 'owner', EMPLOYEE: 'employee', CUSTOMER: 'customer' };
  return map[roleEnum] || null;
};

// Signup User (Public - Customers ONLY)
router.post('/signup', async (req, res) => {
  const { name, email, password, role: roleInput } = req.body;
  
  // Default signup role to OWNER
  const role = (roleInput && roleInput.toLowerCase() === 'owner') ? 'owner' : 'owner';

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    // Check if user exists globally
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const workspaceId = randomUUID();

    const created = await prisma.user.create({
      data: {
        id: workspaceId,
        tenantId: workspaceId,
        email,
        password: hashed,
        role: 'OWNER',
        firstName: name,
        subscriptionStatus: 'inactive',
        subscriptionPlan: null,
      },
    });

    const payload = {
      user: {
        id: created.id,
        tenantId: created.tenantId || created.id,
        role: role,
        email: created.email
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '1h' },
      async (err, token) => {
        if (err) {
          console.error('JWT sign error:', err);
          return res.status(500).json({ message: 'Token generation failed' });
        }
        
        // Send Welcome Email
        try {
          const htmlContent = getWelcomeEmail(name, role);
          await sendEmail({
            email: created.email,
            subject: 'Welcome to SISWIT!',
            message: `Hi ${name},\n\nWelcome to SISWIT! We are excited to have you on board as a ${role}.\n\nBest Regards,\nSISWIT Team`,
            html: htmlContent
          });
          console.log('Welcome email sent to:', created.email);
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          // Don't block registration if email fails, just log it
        }

        const userData = {
            id: created.id,
            name,
            email: created.email,
            role: role
        };
        
        // Owners do not get subscription fields on signup

        res.json({ token, user: userData });
      }
    );
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: err?.message || 'Server error' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  // If role is provided, search only in that collection
  // If role is NOT provided (legacy or direct API call), we might need to search all.
  // But based on user requirements, we should probably enforce role or search all.
  // Let's implement search all if role is missing, but prioritize role if present.

  try {
    console.log('[AUTH] login body', { email, role });
    let userRole = role;
    let user = null;

    if (role) {
      const enumRole = toEnumRole(role);
      console.log('[AUTH] enumRole', enumRole);
      if (!enumRole) {
        return res.status(400).json({ message: 'Invalid role' });
      }
      user = await prisma.user.findFirst({ where: { email, role: enumRole } });
      console.log('[AUTH] prisma findFirst result', user ? { id: user.id, email: user.email, role: user.role } : null);
    } else {
      user = await prisma.user.findUnique({ where: { email } });
      console.log('[AUTH] prisma findUnique result', user ? { id: user.id, email: user.email, role: user.role } : null);
      if (user) userRole = toWireRole(user.role);
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password || '');
    console.log('[AUTH] bcrypt compare', isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        tenantId: user.tenantId || user.id,
        role: userRole,
        email: user.email
      },
    };
    console.log('[AUTH] jwt signing start', { userRole, hasSecret: !!process.env.JWT_SECRET });
    console.log('[AUTH] jwt payload', payload);

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '1h' },
      async (err, token) => {
        if (err) {
          console.error('[AUTH] jwt sign error', err);
          return res.status(500).json({ message: 'Server error' });
        }
        console.log('[AUTH] jwt signed');

        // Send Login Notification (Optional but "connect real email")
        try {
          const displayName = user.firstName || user.lastName || 'User';
          const htmlContent = getLoginNotificationEmail(displayName, new Date().toLocaleString());
          await sendEmail({
             email: user.email,
             subject: 'New Login to SISWIT',
             message: `Hi ${displayName},\n\nYou just logged in to your SISWIT account.\n\nIf this wasn't you, please contact support immediately.\n\nBest Regards,\nSISWIT Team`,
             html: htmlContent
          });
          console.log('Login notification email sent to:', user.email);
        } catch (emailError) {
          console.error('Login email sending failed:', emailError);
        }

        const userData = {
            id: user.id,
            name: user.firstName || user.lastName || 'User',
            email: user.email,
            role: userRole
        };

        if (userRole === 'customer') {
            userData.subscriptionStatus = user.subscriptionStatus || 'inactive';
            userData.subscriptionPlan = user.subscriptionPlan || null;
        }

        res.json({ token, user: userData });
      }
    );
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err?.message || 'Server error' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate token (in a real app, you'd save this to DB and email it)
    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`; // Assuming frontend runs on 5173

    try {
        const displayName = user.firstName || user.lastName || 'User';
        const htmlContent = getPasswordResetEmail(displayName, resetUrl);
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Request',
            message: `Hi ${displayName},\n\nYou requested a password reset. Please click the link below to reset your password:\n\n${resetUrl}\n\nThis link will expire in 15 minutes.\n\nBest Regards,\nSISWIT Team`,
            html: htmlContent
        });
        res.json({ message: 'Password reset link sent to email' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Email could not be sent' });
    }

  } catch (err) {
    console.error('Forgot-password error:', err);
    res.status(500).json({ message: err?.message || 'Server error' });
  }
});

module.exports = router;
