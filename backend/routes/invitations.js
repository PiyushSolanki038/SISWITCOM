const express = require('express');
const router = express.Router();
const crypto = require('crypto');
// using existing nodemailer utility
const { prisma } = require('../prismaClient');
const auth = require('../middleware/auth');
const requireTenant = require('../middleware/requireTenant');
const requireRole = require('../middleware/requireRole');
const bcrypt = require('bcryptjs');
const { getEmployeeInviteEmail, getAdminInviteEmail, getEmployeeInviteText, getAdminInviteText } = require('../utils/emailTemplates');

const sendEmail = require('../utils/sendEmail');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const genToken = () => crypto.randomBytes(32).toString('hex');

router.post('/employee/create', auth, requireTenant, requireRole(['owner', 'admin']), async (req, res) => {
  try {
    const { email, companyName, fullName } = req.body;
    if (!email) return res.status(400).json({ message: 'email required' });
    const tenantId = req.user.tenantId || req.user.id;
    const createdById = req.user.id;
    const token = genToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const invitation = await prisma.invitation.create({
      data: { tenantId, email, role: 'EMPLOYEE', tokenHash, expiresAt, createdById }
    });
    const acceptUrl = `${process.env.FRONTEND_BASE_URL || 'http://localhost:8080'}/accept-invite/${token}`;
    const html = getEmployeeInviteEmail(companyName || 'Your Company', acceptUrl, fullName || '');
    const text = getEmployeeInviteText(companyName || 'Your Company', acceptUrl, fullName || '');
    try {
      await sendEmail({
        email,
        subject: `You’ve been invited to join ${companyName || 'SISWIT'} on SISWIT`,
        message: text,
        html,
      });
    } catch (error) {
      await prisma.emailLog.create({
        data: {
          tenantId,
          toEmail: email,
          subject: `You’ve been invited to join ${companyName || 'SISWIT'} on SISWIT`,
          templateName: 'employee_invite',
          status: 'ERROR',
          error: error?.message || 'send email failed'
        }
      });
      return res.status(500).json({ message: 'Failed to send invite email' });
    }
    await prisma.emailLog.create({
      data: {
        tenantId,
        toEmail: email,
        subject: `You’ve been invited to join ${companyName || 'SISWIT'} on SISWIT`,
        templateName: 'employee_invite',
        status: 'SENT',
        error: null
      }
    });
    res.json({ success: true, invitationId: invitation.id });
  } catch (err) {
    res.status(500).json({ message: 'Server error creating employee invitation' });
  }
});

router.post('/customer/create', auth, requireTenant, requireRole(['owner', 'admin', 'employee']), async (req, res) => {
  try {
    const { email, fullName, companyName } = req.body;
    if (!email) return res.status(400).json({ message: 'email required' });
    const tenantId = req.user.tenantId || req.user.id;
    const createdById = req.user.id;
    const token = genToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const invitation = await prisma.invitation.create({
      data: { tenantId, email, role: 'CUSTOMER', tokenHash, expiresAt, createdById }
    });
    const acceptUrl = `${process.env.FRONTEND_BASE_URL || 'http://localhost:8080'}/accept-invite/${token}`;
    const subject = `Access the ${companyName || 'SISWIT'} Customer Portal`;
    const message = `You have been invited to the ${companyName || 'SISWIT'} Customer Portal.\n\nAccept Invitation: ${acceptUrl}\n\nThis link expires in 48 hours.`;
    const html = `
      <div style="font-family:Segoe UI,Arial,sans-serif;color:#333;">
        <h2 style="margin:0 0 12px;">Customer Portal Invitation</h2>
        <p style="margin:0 0 8px;">${fullName ? `Hello ${fullName},` : 'Hello,'}</p>
        <p style="margin:0 0 12px;">You are invited to access the ${companyName || 'SISWIT'} Customer Portal.</p>
        <p style="margin:0 0 12px;"><a href="${acceptUrl}" style="display:inline-block;padding:10px 16px;background:#1A3C34;color:#fff;border-radius:6px;text-decoration:none;">Accept Invitation</a></p>
        <p style="font-size:12px;color:#666;">This link expires in 48 hours.</p>
      </div>
    `;
    try {
      await sendEmail({ email, subject, message, html });
    } catch (error) {
      await prisma.emailLog.create({
        data: {
          tenantId,
          toEmail: email,
          subject,
          templateName: 'customer_invite',
          status: 'ERROR',
          error: error?.message || 'send email failed'
        }
      });
      return res.status(500).json({ message: 'Failed to send invite email' });
    }
    await prisma.emailLog.create({
      data: {
        tenantId,
        toEmail: email,
        subject,
        templateName: 'customer_invite',
        status: 'SENT',
        error: null
      }
    });
    res.json({ success: true, invitationId: invitation.id, token });
  } catch (err) {
    res.status(500).json({ message: 'Server error creating customer invitation' });
  }
});

router.post('/admin/create', auth, requireTenant, requireRole(['owner']), async (req, res) => {
  try {
    const { email, fullName } = req.body;
    if (!email) return res.status(400).json({ message: 'email required' });
    const tenantId = req.user.tenantId || req.user.id;
    const createdById = req.user.id;
    const token = genToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const invitation = await prisma.invitation.create({
      data: { tenantId, email, role: 'ADMIN', tokenHash, expiresAt, createdById }
    });
    const acceptUrl = `${process.env.FRONTEND_BASE_URL || 'http://localhost:8080'}/accept-invite/${token}`;
    const html = getAdminInviteEmail({ acceptUrl, fullName });
    const text = getAdminInviteText(acceptUrl);
    try {
      await sendEmail({
        email,
        subject: 'You’ve been invited to become an Admin on SISWIT',
        message: text,
        html,
      });
    } catch (error) {
      await prisma.emailLog.create({
        data: {
          tenantId,
          toEmail: email,
          subject: 'You’ve been invited to become an Admin on SISWIT',
          templateName: 'admin_invite',
          status: 'ERROR',
          error: error?.message || 'send email failed'
        }
      });
      return res.status(500).json({ message: 'Failed to send admin invite email' });
    }
    await prisma.emailLog.create({
      data: {
        tenantId,
        toEmail: email,
        subject: 'You’ve been invited to become an Admin on SISWIT',
        templateName: 'admin_invite',
        status: 'SENT',
        error: null
      }
    });
    res.json({ success: true, invitationId: invitation.id, token });
  } catch (err) {
    res.status(500).json({ message: 'Server error creating admin invitation' });
  }
});

router.get('/list', auth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user.id;
    const invitations = await prisma.invitation.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(invitations);
  } catch {
    res.status(500).json({ message: 'Server error listing invitations' });
  }
});

router.post('/revoke/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.invitation.update({
      where: { id },
      data: { status: 'REVOKED' }
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: 'Server error revoking invitation' });
  }
});

router.get('/validate/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const tokenHash = hashToken(token);
    const inv = await prisma.invitation.findFirst({ where: { tokenHash } });
    if (!inv) return res.status(404).json({ valid: false, reason: 'not_found' });
    if (inv.status !== 'PENDING') return res.status(400).json({ valid: false, reason: 'not_pending' });
    if (new Date() > inv.expiresAt) return res.status(400).json({ valid: false, reason: 'expired' });
    res.json({ valid: true, invitation: { email: inv.email, role: inv.role } });
  } catch {
    res.status(500).json({ message: 'Server error validating token' });
  }
});

router.post('/accept/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const tokenHash = hashToken(token);
    const inv = await prisma.invitation.findFirst({ where: { tokenHash } });
    if (!inv) return res.status(404).json({ message: 'Invalid token' });
    if (inv.status !== 'PENDING') return res.status(400).json({ message: 'Invitation not active' });
    if (new Date() > inv.expiresAt) return res.status(400).json({ message: 'Invitation expired' });
    await prisma.invitation.update({
      where: { id: inv.id },
      data: { status: 'ACCEPTED', usedAt: new Date() }
    });
    // create user if not exists
    const existing = await prisma.user.findUnique({ where: { email: inv.email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          email: inv.email,
          role: inv.role,
          tenantId: inv.tenantId
        }
      });
    }
    res.json({ success: true, email: inv.email, role: inv.role });
  } catch {
    res.status(500).json({ message: 'Server error accepting invitation' });
  }
});

// Resend invitation link (generates a fresh token and returns it)
router.post('/resend/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const inv = await prisma.invitation.findUnique({ where: { id } });
    if (!inv) return res.status(404).json({ message: 'Invitation not found' });
    if (inv.status !== 'PENDING') return res.status(400).json({ message: 'Invitation is not pending' });
    const token = genToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    await prisma.invitation.update({
      where: { id },
      data: { tokenHash, expiresAt, status: 'PENDING' }
    });
    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ message: 'Server error resending invitation' });
  }
});

// Resend email with a fresh token (admin invites)
router.post('/resend-email/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const inv = await prisma.invitation.findUnique({ where: { id } });
    if (!inv) return res.status(404).json({ message: 'Invitation not found' });
    if (inv.status !== 'PENDING') return res.status(400).json({ message: 'Invitation is not pending' });
    if (inv.role !== 'ADMIN') return res.status(400).json({ message: 'Only admin invites supported' });
    const token = genToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    await prisma.invitation.update({
      where: { id },
      data: { tokenHash, expiresAt }
    });
    const acceptUrl = `${process.env.FRONTEND_BASE_URL || 'http://localhost:8080'}/accept-invite/${token}`;
    const html = getAdminInviteEmail({ acceptUrl });
    const text = getAdminInviteText(acceptUrl);
    try {
      await sendEmail({
        email: inv.email,
        subject: 'You’ve been invited to become an Admin on SISWIT',
        message: text,
        html,
      });
    } catch (error) {
      await prisma.emailLog.create({
        data: {
          tenantId: inv.tenantId,
          toEmail: inv.email,
          subject: 'You’ve been invited to become an Admin on SISWIT',
          templateName: 'admin_invite',
          status: 'ERROR',
          error: error?.message || 'send email failed'
        }
      });
      return res.status(500).json({ message: 'Failed to resend admin invite email' });
    }
    await prisma.emailLog.create({
      data: {
        tenantId: inv.tenantId,
        toEmail: inv.email,
        subject: 'You’ve been invited to become an Admin on SISWIT',
        templateName: 'admin_invite',
        status: 'SENT',
        error: null
      }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error resending email' });
  }
});

// Set password after accepting invitation
router.post('/set-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    const tokenHash = hashToken(token);
    const inv = await prisma.invitation.findFirst({ where: { tokenHash } });
    if (!inv) return res.status(404).json({ message: 'Invalid token' });
    if (inv.status !== 'ACCEPTED') return res.status(400).json({ message: 'Invitation must be accepted first' });
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const user = await prisma.user.upsert({
      where: { email: inv.email },
      update: { password: hashed, role: inv.role, tenantId: inv.tenantId },
      create: { email: inv.email, password: hashed, role: inv.role, tenantId: inv.tenantId }
    });
    res.json({ success: true, userId: user.id });
  } catch (err) {
    res.status(500).json({ message: 'Server error setting password' });
  }
});

module.exports = router;
