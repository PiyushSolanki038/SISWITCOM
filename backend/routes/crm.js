const express = require('express');
const router = express.Router();
const { prisma } = require('../prismaClient');
const jwt = require('jsonwebtoken');
const mapId = (o) => (o ? { ...o, _id: o.id } : o);
const sendEmail = require('../utils/sendEmail');
const { getLeadOutreachEmail, getProfessionalOutreachEmail, getMeetingRequestNotifyEmail } = require('../utils/emailTemplates');

const parseUser = (req) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    return decoded?.user || null;
  } catch (e) {
    return null;
  }
};

const requireRole = (roles = ['owner', 'employee']) => (req, res, next) => {
  const user = parseUser(req);
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  const role = (user.role || '').toLowerCase();
  if (!roles.includes(role)) return res.status(403).json({ message: 'Forbidden' });
  req.user = user;
  next();
};

// Public CTA route: when recipient clicks "Schedule Meeting" in email
router.get('/cta/contacts/:id/meeting', async (req, res) => {
  try {
    const token = (req.query.t || '').toString();
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    } catch (e) {
      res.status(401).send('<h3>Invalid or expired link</h3>');
      return;
    }
    if (decoded?.scope !== 'cta' || decoded?.contactId !== req.params.id) {
      res.status(401).send('<h3>Invalid link</h3>');
      return;
    }
    const contact = await prisma.contact.findUnique({ where: { id: req.params.id } });
    if (!contact) {
      res.status(404).send('<h3>Contact not found</h3>');
      return;
    }
    try {
      await prisma.activity.create({
        data: {
          tenantId: decoded.tenantId || contact.tenantId,
          type: 'meeting',
          title: 'Meeting Requested via Email CTA',
          description: `Recipient clicked Schedule Meeting (${contact.name})`,
          date: new Date(),
          time: new Date().toLocaleTimeString(),
          status: 'completed',
          contactId: contact.id,
          userId: decoded.tenantId || contact.tenantId
        }
      });
    } catch {}

    try {
      const appUrl = process.env.APP_PUBLIC_URL || 'http://localhost:8080';
      const viewUrl = `${appUrl}/employee-dashboard/crm/contacts/${contact.id}`;
      await sendEmail({
        email: process.env.MEETING_NOTIFY_EMAIL || process.env.FROM_EMAIL,
        subject: `Meeting requested by ${contact.name}`,
        message: `${contact.name} requested a meeting.`,
        html: getMeetingRequestNotifyEmail({
          name: contact.name || '',
          email: contact.email || '',
          phone: contact.phone || '',
          company: contact.company || '',
          viewUrl
        })
      });
    } catch {}

    const brandColor = process.env.BRAND_COLOR || '#2c3e50';
    const brandName = process.env.BRAND_NAME || 'SISWIT';
    res.send(`
      <!DOCTYPE html>
      <html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
      <title>Meeting Requested</title>
      <style>
        body { font-family: Arial, sans-serif; background:#f6f8fb; margin:0; }
        .wrap { max-width:600px; margin:40px auto; background:#fff; border-radius:10px; box-shadow:0 4px 18px rgba(0,0,0,0.08); overflow:hidden; }
        .header { background:${brandColor}; color:#fff; padding:20px; text-align:center; }
        .content { padding:24px; color:#333; }
        .small { color:#777; font-size:13px; margin-top:14px; }
        a.btn { display:inline-block; background:${brandColor}; color:#fff; padding:10px 16px; border-radius:6px; text-decoration:none; }
      </style></head>
      <body>
        <div class="wrap">
          <div class="header"><h2>${brandName}</h2></div>
          <div class="content">
            <h3>Thank you!</h3>
            <p>We have received your meeting request. Our team will contact you shortly.</p>
            <p class="small">You can close this page.</p>
          </div>
        </div>
      </body></html>
    `);
  } catch (err) {
    res.status(500).send('<h3>Something went wrong</h3>');
  }
});

router.use(requireRole(['owner', 'employee']));

// ==========================================
// Accounts Routes
// ==========================================
router.get('/accounts', async (req, res) => {
  try {
    const accounts = await prisma.account.findMany({ 
      where: { tenantId: req.user.id },
      orderBy: { createdAt: 'desc' } 
    });
    res.json(accounts.map(mapId));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/accounts/:id', async (req, res) => {
  try {
    const account = await prisma.account.findFirst({ where: { id: req.params.id, tenantId: req.user.id } });
    if (!account) return res.status(404).json({ message: 'Account not found' });
    res.json(mapId(account));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/accounts', async (req, res) => {
  try {
    const savedAccount = await prisma.account.create({ data: { ...req.body, tenantId: req.user.id } });
    res.status(201).json(mapId(savedAccount));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/accounts/:id', async (req, res) => {
  try {
    const updatedAccount = await prisma.account.update({
      where: { id_tenantId: { id: req.params.id, tenantId: req.user.id } },
      data: req.body,
    });
    res.json(mapId(updatedAccount));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/accounts/:id', async (req, res) => {
  try {
    await prisma.account.delete({ where: { id_tenantId: { id: req.params.id, tenantId: req.user.id } } });
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// CRM Contacts Routes
// ==========================================
router.get('/contacts', async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({ 
      where: { tenantId: req.user.id },
      orderBy: { createdAt: 'desc' } 
    });
    res.json(contacts.map(mapId));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/contacts/:id', async (req, res) => {
  try {
    const contact = await prisma.contact.findFirst({ where: { id: req.params.id, tenantId: req.user.id } });
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json(mapId(contact));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send Email to Contact using SMTP configured in .env
router.post('/contacts/:id/email', async (req, res) => {
  try {
    const contact = await prisma.contact.findFirst({ where: { id: req.params.id, tenantId: req.user.id } });
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    if (!contact.email) return res.status(400).json({ message: 'Contact has no email' });
    const subject = (req.body?.subject || `Follow up with ${contact.name || 'you'}`).toString();
    const message = (req.body?.message || `Hello ${contact.name || ''},\n\nFollowing up regarding ${contact.company || 'our discussion'}.\n\nThanks,\n${req.user.firstName || ''} ${req.user.lastName || ''}`).toString();
    const token = jwt.sign(
      { scope: 'cta', contactId: contact.id, tenantId: req.user.id },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '14d' }
    );
    const appUrl = process.env.APP_PUBLIC_URL || 'http://localhost:8080';
    const ctaUrl = `${appUrl}/api/crm/cta/contacts/${contact.id}/meeting?t=${encodeURIComponent(token)}`;
    const html = req.body?.html || getProfessionalOutreachEmail({
      recipientName: contact.name || '',
      company: contact.company || '',
      intro: message.replace(/\n/g, '<br>'),
      callToActionText: 'Schedule Meeting',
      callToActionUrl: ctaUrl
    });

    await sendEmail({
      email: contact.email,
      subject,
      message,
      html
    });

    try {
      await prisma.activity.create({
        data: {
          tenantId: req.user.id,
          type: 'email',
          title: 'Email Sent',
          description: message,
          date: new Date(),
          time: new Date().toLocaleTimeString(),
          status: 'completed',
          contactId: contact.id,
          userId: req.user.id
        }
      });
    } catch {}

    res.json({ message: 'Email sent successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/contacts', async (req, res) => {
  try {
    const savedContact = await prisma.contact.create({ data: { ...req.body, tenantId: req.user.id } });
    res.status(201).json(mapId(savedContact));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/contacts/:id', async (req, res) => {
  try {
    const updatedContact = await prisma.contact.update({
      where: { id_tenantId: { id: req.params.id, tenantId: req.user.id } },
      data: req.body,
    });
    res.json(mapId(updatedContact));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/contacts/:id', async (req, res) => {
  try {
    await prisma.contact.delete({ where: { id_tenantId: { id: req.params.id, tenantId: req.user.id } } });
    res.json({ message: 'Contact deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// Leads Routes
// ==========================================
router.post('/leads/:id/convert', async (req, res) => {
    try {
        const lead = await prisma.lead.findFirst({ where: { id: req.params.id, tenantId: req.user.id } });
        if (!lead) return res.status(404).json({ message: 'Lead not found' });

        // if (lead.status === 'converted') {
        //     return res.status(400).json({ message: 'Lead already converted' });
        // }

        const { dealName, dealValue } = req.body;

        // 1. Create/Find Account
        let account = await prisma.account.findFirst({ where: { name: lead.company, tenantId: req.user.id } });
        if (!account) {
            account = await prisma.account.create({
                data: {
                    tenantId: req.user.id,
                    name: lead.company,
                    industry: 'Technology',
                    status: 'active',
                    annualRevenue: '0',
                    ownerName: lead.ownerName || 'Unassigned'
                }
            });
        }

        // 2. Create/Find Contact
        let contact = await prisma.contact.findFirst({ where: { email: lead.email, tenantId: req.user.id } });
        if (!contact) {
            contact = await prisma.contact.create({
                data: {
                    tenantId: req.user.id,
                    name: lead.name,
                    email: lead.email,
                    company: lead.company,
                    phone: lead.phone,
                    address: lead.address,
                    role: lead.title || 'Decision Maker'
                }
            });
        }

        // 3. Create Opportunity
        const opportunity = await prisma.opportunity.create({
            data: {
                tenantId: req.user.id,
                title: dealName || `${lead.company} Deal`,
                company: lead.company,
                value: dealValue || 0,
                stage: 'new',
                accountId: account.id,
                primaryContactId: contact.id,
                leadId: lead.id,
                closingDate: new Date(Date.now() + 30*24*60*60*1000)
            }
        });

        // 4. Update Lead
        await prisma.lead.update({ where: { id_tenantId: { id: lead.id, tenantId: req.user.id } }, data: { status: 'converted' } });

        res.json({
            message: 'Lead converted successfully',
            account: mapId(account),
            opportunity: mapId(opportunity),
            contact: mapId(contact),
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/leads', async (req, res) => {
  try {
    const q = (req.query.q || '').toString().toLowerCase();
    const leads = await prisma.lead.findMany({ 
      where: { 
        tenantId: req.user.id,
        OR: q ? [
          { name: { contains: q, mode: 'insensitive' } },
          { company: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ] : undefined
      },
      orderBy: { createdAt: 'desc' } 
    });
    res.json(leads.map(mapId));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/leads/:id', async (req, res) => {
  try {
    const lead = await prisma.lead.findFirst({ where: { id: req.params.id, tenantId: req.user.id } });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(mapId(lead));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/leads', async (req, res) => {
  try {
    const savedLead = await prisma.lead.create({ data: { ...req.body, tenantId: req.user.id } });
    res.status(201).json(mapId(savedLead));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/leads/:id', async (req, res) => {
  try {
    const updatedLead = await prisma.lead.update({
      where: { id_tenantId: { id: req.params.id, tenantId: req.user.id } },
      data: req.body,
    });
    res.json(mapId(updatedLead));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/leads/:id', async (req, res) => {
  try {
    await prisma.lead.delete({ where: { id_tenantId: { id: req.params.id, tenantId: req.user.id } } });
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send Email to Lead using SMTP configured in .env
router.post('/leads/:id/email', async (req, res) => {
  try {
    const lead = await prisma.lead.findFirst({ where: { id: req.params.id, tenantId: req.user.id } });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    if (!lead.email) return res.status(400).json({ message: 'Lead has no email' });
    const subject = (req.body?.subject || `Follow up with ${lead.name}`).toString();
    const message = (req.body?.message || `Hello ${lead.name},\n\nFollowing up regarding ${lead.company || 'our discussion'}.\n\nThanks,\n${req.user.firstName || ''} ${req.user.lastName || ''}`).toString();
    const token = jwt.sign(
      { scope: 'cta', leadId: lead.id, tenantId: req.user.id },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '14d' }
    );
    const appUrl = process.env.APP_PUBLIC_URL || 'http://localhost:8080';
    const ctaUrl = `${appUrl}/api/crm/cta/leads/${lead.id}/meeting?t=${encodeURIComponent(token)}`;
  const html = req.body?.html || getProfessionalOutreachEmail({
    recipientName: lead.name || '',
    company: lead.company || '',
    intro: message.replace(/\n/g, '<br>'),
    callToActionText: 'Schedule Meeting',
    callToActionUrl: ctaUrl
  });

    await sendEmail({
      email: lead.email,
      subject,
      message,
      html
    });

    try {
      await prisma.activity.create({
        data: {
          tenantId: req.user.id,
          type: 'email',
          title: 'Email Sent',
          description: message,
          date: new Date(),
          time: new Date().toLocaleTimeString(),
          status: 'completed',
          leadId: lead.id,
          userId: req.user.id
        }
      });
    } catch {}

    res.json({ message: 'Email sent successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// Opportunities Routes
// ==========================================
router.get('/opportunities', async (req, res) => {
  try {
    const q = (req.query.q || '').toString().toLowerCase();
    const opportunities = await prisma.opportunity.findMany({
      where: {
        tenantId: req.user.id,
        OR: q ? [
          { title: { contains: q, mode: 'insensitive' } },
          { company: { contains: q, mode: 'insensitive' } },
        ] : undefined
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(opportunities.map(mapId));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/opportunities/:id', async (req, res) => {
  try {
    const opp = await prisma.opportunity.findFirst({ where: { id: req.params.id, tenantId: req.user.id } });
    if (!opp) return res.status(404).json({ message: 'Opportunity not found' });
    res.json(mapId(opp));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/opportunities', async (req, res) => {
  try {
    const { accountId, pipelineStageId } = req.body || {};
    if (!accountId) {
      return res.status(400).json({ message: 'accountId is required' });
    }
    let stageId = pipelineStageId;
    if (!stageId) {
      let stage = await prisma.pipelineStage.findFirst({
        where: { tenantId: req.user.id, name: 'New' }
      });
      if (!stage) {
        stage = await prisma.pipelineStage.create({
          data: { tenantId: req.user.id, name: 'New', order: 0 }
        });
      }
      stageId = stage.id;
    }
    const saved = await prisma.opportunity.create({
      data: { ...req.body, tenantId: req.user.id, pipelineStageId: stageId }
    });
    res.status(201).json(mapId(saved));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/opportunities/:id', async (req, res) => {
  try {
    const updated = await prisma.opportunity.update({
      where: { id_tenantId: { id: req.params.id, tenantId: req.user.id } },
      data: req.body,
    });
    res.json(mapId(updated));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/opportunities/:id', async (req, res) => {
  try {
    await prisma.opportunity.delete({ where: { id_tenantId: { id: req.params.id, tenantId: req.user.id } } });
    res.json({ message: 'Opportunity deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/opportunities/:id/move', async (req, res) => {
  try {
    const { stageId } = req.body;
    const opp = await prisma.opportunity.update({
      where: { id_tenantId: { id: req.params.id, tenantId: req.user.id } },
      data: { pipelineStageId: stageId },
    });
    res.json(mapId(opp));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Back-compat for existing UI using /deals (map to opportunities directly)
router.get('/deals', async (req, res) => {
  try {
    const q = (req.query.q || '').toString().toLowerCase();
    const company = (req.query.company || '').toString();
    const where = {
      tenantId: req.user.id,
      OR: q
        ? [
            { title: { contains: q, mode: 'insensitive' } },
            { company: { contains: q, mode: 'insensitive' } },
          ]
        : undefined,
    };
    if (company && !q) {
      where.company = { contains: company, mode: 'insensitive' };
    }
    const opportunities = await prisma.opportunity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(opportunities.map(mapId));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get('/deals/:id', async (req, res) => {
  try {
    const opp = await prisma.opportunity.findFirst({
      where: { id: req.params.id, tenantId: req.user.id },
    });
    if (!opp) return res.status(404).json({ message: 'Opportunity not found' });
    res.json(mapId(opp));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.post('/deals', async (req, res) => {
  try {
    const saved = await prisma.opportunity.create({
      data: { ...req.body, tenantId: req.user.id },
    });
    res.status(201).json(mapId(saved));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
router.put('/deals/:id', async (req, res) => {
  try {
    const updated = await prisma.opportunity.update({
      where: { id_tenantId: { id: req.params.id, tenantId: req.user.id } },
      data: req.body,
    });
    res.json(mapId(updated));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
router.delete('/deals/:id', async (req, res) => {
  try {
    await prisma.opportunity.delete({
      where: { id_tenantId: { id: req.params.id, tenantId: req.user.id } },
    });
    res.json({ message: 'Opportunity deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// Activities Routes
// ==========================================
router.get('/activities', async (req, res) => {
  try {
    const filter = { tenantId: req.user.id };
    if (req.query['relatedTo.type'] && req.query['relatedTo.id']) {
      // map related filters to actual foreign keys when possible
      // For simplicity, filter by opportunityId when type === 'deal'
      if (req.query['relatedTo.type'] === 'deal') {
        filter.opportunityId = req.query['relatedTo.id'];
      } else if (req.query['relatedTo.type'] === 'lead') {
        filter.leadId = req.query['relatedTo.id'];
      }
    }
    const activities = await prisma.activity.findMany({
      where: filter,
      orderBy: { date: 'asc' },
    });
    res.json(activities.map(mapId));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/activities/:id', async (req, res) => {
  try {
    const activity = await prisma.activity.findFirst({ where: { id: req.params.id, tenantId: req.user.id } });
    if (!activity) return res.status(404).json({ message: 'Activity not found' });
    res.json(mapId(activity));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/activities', async (req, res) => {
  try {
    const savedActivity = await prisma.activity.create({ data: { ...req.body, tenantId: req.user.id } });
    res.status(201).json(mapId(savedActivity));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/activities/:id', async (req, res) => {
  try {
    const updatedActivity = await prisma.activity.update({
      where: { id_tenantId: { id: req.params.id, tenantId: req.user.id } },
      data: req.body,
    });
    res.json(mapId(updatedActivity));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/activities/:id', async (req, res) => {
  try {
    await prisma.activity.delete({ where: { id_tenantId: { id: req.params.id, tenantId: req.user.id } } });
    res.json({ message: 'Activity deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// Notes Routes
// ==========================================
router.get('/notes', async (req, res) => {
  try {
    const notes = await prisma.note.findMany({ 
      where: { tenantId: req.user.id },
      orderBy: { createdAt: 'desc' } 
    });
    res.json(notes.map(mapId));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/notes/:id', async (req, res) => {
  try {
    const note = await prisma.note.findFirst({ where: { id: req.params.id, tenantId: req.user.id } });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(mapId(note));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/notes', async (req, res) => {
  try {
    const savedNote = await prisma.note.create({ data: { ...req.body, tenantId: req.user.id } });
    res.status(201).json(mapId(savedNote));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/notes/:id', async (req, res) => {
  try {
    const updatedNote = await prisma.note.update({
      where: { id_tenantId: { id: req.params.id, tenantId: req.user.id } },
      data: req.body,
    });
    res.json(mapId(updatedNote));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/notes/:id', async (req, res) => {
  try {
    await prisma.note.delete({ where: { id_tenantId: { id: req.params.id, tenantId: req.user.id } } });
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// Pipeline Stages Routes
// ==========================================
router.get('/stages', async (req, res) => {
  try {
    let stages = await prisma.pipelineStage.findMany({
      where: { tenantId: req.user.id },
      orderBy: { order: 'asc' }
    });
    if (stages.length === 0) {
      const defaults = [
        { name: 'New', order: 0 },
        { name: 'Qualified', order: 1 },
        { name: 'Proposal', order: 2 },
        { name: 'Negotiation', order: 3 },
        { name: 'Won', order: 4 },
        { name: 'Lost', order: 5 },
      ];
      await prisma.$transaction(
        defaults.map(d =>
          prisma.pipelineStage.create({
            data: { tenantId: req.user.id, name: d.name, order: d.order }
          })
        )
      );
      stages = await prisma.pipelineStage.findMany({
        where: { tenantId: req.user.id },
        orderBy: { order: 'asc' }
      });
    }
    res.json(stages.map(mapId));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/stages', async (req, res) => {
  try {
    const created = await prisma.pipelineStage.create({
      data: { ...req.body, tenantId: req.user.id }
    });
    res.status(201).json(mapId(created));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/stages/:id', async (req, res) => {
  try {
    const updated = await prisma.pipelineStage.update({
      where: { id_tenantId: { id: req.params.id, tenantId: req.user.id } },
      data: req.body
    });
    res.json(mapId(updated));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/stages/:id', async (req, res) => {
  try {
    await prisma.pipelineStage.delete({
      where: { id_tenantId: { id: req.params.id, tenantId: req.user.id } }
    });
    res.json({ message: 'Stage deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
