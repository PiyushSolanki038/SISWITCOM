const express = require('express');
const router = express.Router();
const { prisma } = require('../prismaClient');
const sendEmail = require('../utils/sendEmail');
const mapId = (o) => (o ? { ...o, _id: o.id } : o);
const auth = require('../middleware/auth');
const requireTenant = require('../middleware/requireTenant');

// Lightweight notifications for employee dashboards
// Derived from approval decisions; no persistent read tracking
router.get('/notifications', auth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user.id;
    const userId = req.user.id;
    const role = String(req.user.role || '').toLowerCase();
    if (!tenantId || !userId) return res.json({ notifications: [], unreadCount: 0 });
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    let notifications = [];

    if (['admin', 'owner', 'employee'].includes(role)) {
      const whereBase = { tenantId, status: { in: ['APPROVED', 'REJECTED'] }, createdAt: { gte: since } };
      const whereEmployee = role === 'employee' ? { ...whereBase, requestedBy: String(userId) } : whereBase;
      const [qa, ca] = await Promise.all([
        prisma.quoteApproval.findMany({
          where: whereEmployee,
          orderBy: { createdAt: 'desc' },
          include: { quote: true }
        }),
        prisma.contractApproval.findMany({
          where: whereEmployee,
          orderBy: { createdAt: 'desc' },
          include: { contract: true }
        })
      ]);
      notifications = [
        ...qa.map(a => ({
          _id: `qa_${a.id}`,
          title: a.status === 'APPROVED' ? 'Quote Approved' : 'Quote Rejected',
          message: `Quote ${a.quote?.quoteNumber || a.quoteId} has been ${a.status.toLowerCase()}.`,
          isRead: false,
          link: `/employee-dashboard/cpq/quotes/${a.quoteId}`,
          createdAt: (a.decidedAt || a.updatedAt || a.createdAt || new Date()).toISOString()
        })),
        ...ca.map(a => ({
          _id: `ca_${a.id}`,
          title: a.status === 'APPROVED' ? 'Contract Approved' : 'Contract Rejected',
          message: `Contract ${a.contract?.contract_number || a.contractId} has been ${a.status.toLowerCase()}.`,
          isRead: false,
          link: `/employee-dashboard/clm/contracts/${a.contractId}`,
          createdAt: (a.decidedAt || a.updatedAt || a.createdAt || new Date()).toISOString()
        }))
      ];
    } else if (role === 'customer') {
      // Customer-specific notifications: signature requests for this email in this tenant
      try {
        const srs = await prisma.contractSignatureRequest.findMany({
          where: { tenantId, signerEmail: req.user.email, createdAt: { gte: since } },
          orderBy: { createdAt: 'desc' },
          include: { contract: true }
        });
        notifications = srs.map(s => ({
          _id: `sr_${s.id}`,
          title: s.status === 'signed' ? 'Contract Signed' : (s.status === 'viewed' ? 'Contract Viewed' : 'Signature Request'),
          message: `Contract ${s.contract?.contract_number || s.contractId || ''} ${s.status === 'signed' ? 'has been signed' : s.status === 'viewed' ? 'was viewed' : 'awaits your signature'}.`,
          isRead: false,
          link: undefined,
          createdAt: (s.updatedAt || s.createdAt || new Date()).toISOString()
        }));
      } catch {}
    }
    
    res.json({ notifications, unreadCount: notifications.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
});

// Mark as read: placeholder (client handles local state)
router.patch('/notifications/:id/read', auth, requireTenant, async (req, res) => {
  try {
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: 'Server error marking notification read' });
  }
});

// @route   POST api/messages
// @desc    Submit a contact form message
// @access  Public
router.post('/', async (req, res) => {
  const { firstName, lastName, email, message } = req.body;

  // Simple validation
  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({ message: 'Please fill in all fields' });
  }

  try {
    // Create or find contact
    let contact = await prisma.contact.findFirst({ where: { email } });
    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          name: `${firstName} ${lastName}`,
          email,
        },
      });
    }

    // Store message as a Note linked to the contact (if Note model exists)
    try {
      await prisma.note.create({
        data: {
          title: 'Contact Form Message',
          content: message,
          createdAt: new Date(),
          contactId: contact.id,
        },
      });
    } catch (e) {
      // If Note model not present, ignore
    }

    // Send notification email to admin (using the SMTP_EMAIL as admin for now)
    // Or send confirmation email to user
    try {
        // 1. Send confirmation to user
        await sendEmail({
            email: email,
            subject: 'We received your message - SISWIT',
            message: `Hi ${firstName},\n\nThank you for contacting us. We have received your message and will get back to you shortly.\n\nYour Message:\n${message}\n\nBest Regards,\nSISWIT Team`,
            html: `
                <h3>Hi ${firstName},</h3>
                <p>Thank you for contacting <strong>SISWIT</strong>. We have received your message and will get back to you shortly.</p>
                <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <strong>Your Message:</strong><br/>
                    ${message}
                </div>
                <p>Best Regards,<br>SISWIT Team</p>
            `
        });

        // 2. Send notification to admin (optional, assuming FROM_EMAIL or a dedicated admin email)
        // For this demo, we'll just log it. In production, you'd email the support team.
    } catch (emailErr) {
        console.error('Email sending failed:', emailErr);
        // Do not fail the request if email fails, as the message is saved
    }

    res.status(201).json({ 
        message: 'Message sent successfully', 
        contact: mapId({
          id: contact.id,
          firstName,
          lastName,
          email: contact.email,
          createdAt: new Date(),
        })
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
