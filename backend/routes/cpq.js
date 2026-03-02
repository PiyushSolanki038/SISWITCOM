const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { prisma } = require('../prismaClient');
const mapId = (o) => (o ? { ...o, _id: o.id } : o);
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const { getQuoteApprovalSubmittedEmail, getQuoteApprovalRequestEmail } = require('../utils/emailTemplates');

const parseUser = (req) => {
  try {
    const authHeader = req.headers.authorization || '';
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = bearer || req.header('x-auth-token');
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    return decoded?.user || null;
  } catch (e) {
    return null;
  }
};

// Note: CRMContact and Account now mapped to Prisma Contact and Account

// @route   GET api/cpq/products
// @desc    Get all active products
// @access  Private
router.get('/products', auth, async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            where: { is_active: true },
            orderBy: { name: 'asc' },
        });
        res.json(products.map(mapId));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/cpq/products
// @desc    Create a new product (Admin/Employee only)
// @access  Private
router.post('/products', auth, async (req, res) => {
    try {
        const user = parseUser(req);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });
        const tenantId = user.tenantId || user.id;
        if (!tenantId) return res.status(400).json({ message: 'Missing tenant context' });
        if (user.role === 'customer') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { name, sku, description, pricing_type, base_price, currency } = req.body;

        if (sku && sku.trim()) {
          const existing = await prisma.product.findUnique({ where: { sku } });
          if (existing) {
              return res.status(400).json({ message: 'Product with this SKU already exists' });
          }
        }

        const product = await prisma.product.create({
            data: { 
              name, 
              sku: sku && sku.trim() ? sku.trim() : null, 
              description, 
              pricing_type, 
              base_price: base_price !== undefined ? Number(base_price) : null, 
              currency, 
              is_active: true, 
              tenantId 
            },
        });
        res.json(mapId(product));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update product
router.put('/products/:id', auth, async (req, res) => {
  try {
    const user = parseUser(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const { name, description, pricing_type, base_price, currency, is_active } = req.body;
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { name, description, pricing_type, base_price, currency, is_active, updatedAt: new Date() }
    });
    res.json(mapId(product));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete product
router.delete('/products/:id', auth, async (req, res) => {
  try {
    const user = parseUser(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/cpq/quotes
// @desc    Create a new quote
// @access  Private
router.post('/quotes', auth, async (req, res) => {
    try {
        const {
            opportunityId,
            accountId,
            items,
            currency,
            validUntil,
            taxRate, // optional
            status // optional: 'draft' | 'pending_approval'
        } = req.body;

        const user = parseUser(req);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });
        const tenantId = user.tenantId || user.id;
        if (!tenantId) return res.status(400).json({ message: 'Missing tenant context' });

        if (!currency || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Missing required fields: currency, items' });
        }

        // Optional FK validations: if provided, ensure they exist
        if (accountId) {
            const acc = await prisma.account.findUnique({ where: { id: accountId } });
            if (!acc) return res.status(400).json({ message: 'Invalid accountId' });
        }
        if (opportunityId) {
            const opp = await prisma.opportunity.findUnique({ where: { id: opportunityId } });
            if (!opp) return res.status(400).json({ message: 'Invalid opportunityId' });
        }

        // Normalize items to expected shape
        const normalizedItems = items
          .map(it => ({
            productId: it.productId ?? it.product_id,
            quantity: Number(it.quantity ?? it.qty ?? 1),
            unitPrice: Number(it.unitPrice ?? it.unit_price ?? 0),
            discount: Number(it.discount ?? it.discount_percent ?? 0),
          }))
          .filter(it => it.productId && it.quantity > 0 && it.unitPrice >= 0);
        if (normalizedItems.length === 0) {
            return res.status(400).json({ message: 'No valid line items' });
        }
        // Validate all productIds exist (and optionally match tenant)
        const productIds = [...new Set(normalizedItems.map(i => i.productId))];
        const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
        if (products.length !== productIds.length) {
            return res.status(400).json({ message: 'One or more productIds are invalid' });
        }

        // Calculate totals
        let subtotal = 0;
        let discountTotal = 0;
        
        const calculatedItems = normalizedItems.map(item => {
            const lineSubtotal = Number(item.quantity) * Number(item.unitPrice);
            const discountAmount = lineSubtotal * (Number(item.discount || 0) / 100);
            const lineTotal = lineSubtotal - discountAmount;
            
            subtotal += lineSubtotal;
            discountTotal += discountAmount;
            
            return {
                ...item,
                total: Number(lineTotal)
            };
        });

        const taxTotal = (subtotal - discountTotal) * (taxRate ? (taxRate / 100) : 0.1); // default 10%
        const grandTotal = subtotal - discountTotal + taxTotal;

        // Generate Quote Number
        const count = await prisma.quote.count();
        const quoteNumber = `Q-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

        const quote = await prisma.quote.create({
            data: {
                quoteNumber,
                tenantId,
                opportunityId: opportunityId || null,
                accountId: accountId || null,
                currency,
                subtotal,
                discountTotal,
                taxTotal,
                grandTotal,
                validUntil: validUntil ? new Date(validUntil) : null,
                createdBy: user.id,
                status: status === 'pending_approval' ? 'APPROVAL_PENDING' : 'DRAFT',
                items: {
                    create: calculatedItems.map(it => ({
                        tenantId,
                        productId: it.productId,
                        quantity: Number(it.quantity),
                        unitPrice: Number(it.unitPrice),
                        discount: Number(it.discount || 0),
                        total: Number(it.total),
                    })),
                },
            },
            include: { items: true },
        });
        // Return shape identical to original with embedded items
        res.json({
            ...mapId(quote),
            items: quote.items.map(mapId),
        });

    } catch (err) {
        console.error('Create quote error:', err);
        const message = err?.message || 'Server Error';
        res.status(500).json({ message });
    }
});

// @route   GET api/cpq/quotes
// @desc    Get all quotes (filtered for customers)
// @access  Private
router.get('/quotes', auth, async (req, res) => {
    try {
        const user = parseUser(req);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });
        const tenantId = user.tenantId || user.id;
        const accountId = (req.query.accountId || '').toString();
        const accountName = (req.query.accountName || '').toString();
        const status = (req.query.status || '').toString().toUpperCase();
        let where = { tenantId };

        // If user is a customer, only show their quotes
        if (user.role === 'customer') {
            const contact = await prisma.contact.findFirst({ where: { email: (req.user?.email || user.email) } });
            if (!contact) {
                return res.json([]); // No contact found for this user
            }
            
            // Find account by company name
            // Note: Ideally we should link Contact to Account by ID
            const account = await prisma.account.findFirst({ where: { name: contact.company } });
            if (!account) {
                 return res.json([]); // No account found
            }
            
            where.accountId = account.id;
        }

        if (accountId) {
            where.accountId = accountId;
        } else if (accountName) {
            where = {
                ...where,
                account: { name: accountName }
            };
        }
        if (status) {
            where = { ...where, status };
        }

        const quotes = await prisma.quote.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: { items: true, account: true, opportunity: true },
        });
        res.json(
            quotes.map(q => ({
                ...mapId(q),
                items: q.items.map(mapId),
                account: mapId(q.account),
                opportunity: mapId(q.opportunity),
            }))
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/cpq/quotes/:id
// @desc    Get quote by ID
// @access  Private
router.get('/quotes/:id', auth, async (req, res) => {
    try {
        const quote = await prisma.quote.findUnique({
            where: { id: req.params.id },
            include: { items: true, account: true, opportunity: true },
        });
        
        if (!quote) {
            return res.status(404).json({ message: 'Quote not found' });
        }
        res.json({
            ...mapId(quote),
            items: quote.items.map(mapId),
            account: mapId(quote.account),
            opportunity: mapId(quote.opportunity),
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/cpq/quotes/:id
// @desc    Update quote
// @access  Private
router.put('/quotes/:id', auth, async (req, res) => {
    try {
        const user = parseUser(req);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });
        let quote = await prisma.quote.findUnique({ where: { id: req.params.id }, include: { items: true } });
        if (!quote) return res.status(404).json({ message: 'Quote not found' });

        // Recalculate if items changed
        if (req.body.items) {
             let subtotal = 0;
            let discountTotal = 0;
            
            const updatedItems = req.body.items.map(item => {
                const lineSubtotal = item.quantity * item.unitPrice;
                const discountAmount = lineSubtotal * (item.discount / 100);
                const lineTotal = lineSubtotal - discountAmount;
                
                subtotal += lineSubtotal;
                discountTotal += discountAmount;
                
                return {
                    ...item,
                    total: lineTotal
                };
            });

            req.body.subtotal = subtotal;
            req.body.discountTotal = discountTotal;
            req.body.taxTotal = (subtotal - discountTotal) * 0.1;
            req.body.grandTotal = req.body.subtotal - req.body.discountTotal + req.body.taxTotal;
            // Replace items: simplistic approach delete old and recreate
            await prisma.quoteItem.deleteMany({ where: { quoteId: req.params.id } });
            await prisma.quoteItem.createMany({
                data: updatedItems.map(it => ({
                    tenantId: user.tenantId,
                    quoteId: req.params.id,
                    productId: it.productId,
                    quantity: it.quantity,
                    unitPrice: it.unitPrice,
                    discount: it.discount || 0,
                    total: it.total,
                })),
            });
        }
        
        const updated = await prisma.quote.update({
            where: { id: req.params.id },
            data: {
                status: req.body.status,
                currency: req.body.currency,
                subtotal: req.body.subtotal,
                discountTotal: req.body.discountTotal,
                taxTotal: req.body.taxTotal,
                grandTotal: req.body.grandTotal,
                validUntil: req.body.validUntil ? new Date(req.body.validUntil) : null,
                updatedAt: new Date(),
            },
            include: { items: true },
        });
        res.json({
            ...mapId(updated),
            items: updated.items.map(mapId),
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/cpq/quotes/:id/send
// @desc    Send quote to customer (Update status)
// @access  Private
router.post('/quotes/:id/send', auth, async (req, res) => {
    try {
        const quote = await prisma.quote.update({
            where: { id: req.params.id },
            data: { status: 'SENT', updatedAt: new Date() },
            include: { items: true },
        });
        if (!quote) return res.status(404).json({ message: 'Quote not found' });
        res.json({
            ...mapId(quote),
            items: quote.items.map(mapId),
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/cpq/quotes/:id/accept
// @desc    Accept quote (Customer/Admin)
// @access  Private
router.post('/quotes/:id/accept', auth, async (req, res) => {
    try {
        const quote = await prisma.quote.update({
            where: { id: req.params.id },
            data: { status: 'ACCEPTED', updatedAt: new Date() },
            include: { items: true },
        });
        
        if (!quote) return res.status(404).json({ message: 'Quote not found' });
        
        // Update Opportunity Stage to Closed Won
        if (quote.opportunityId) {
            await prisma.opportunity.update({
                where: { id: quote.opportunityId },
                data: { stage: 'closed_won', value: quote.grandTotal },
            });
        }
        
        res.json({
            ...mapId(quote),
            items: quote.items.map(mapId),
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/cpq/quotes/:id/reject
// @desc    Reject quote
// @access  Private
router.post('/quotes/:id/reject', auth, async (req, res) => {
    try {
        const quote = await prisma.quote.update({
            where: { id: req.params.id },
            data: { status: 'REJECTED', updatedAt: new Date() },
            include: { items: true },
        });
        if (!quote) return res.status(404).json({ message: 'Quote not found' });
    const user = parseUser(req);
    if (user) {
      await prisma.quoteApproval.updateMany({
        where: { quoteId: req.params.id, status: 'PENDING' },
        data: { status: 'REJECTED', decidedBy: user.id, decidedAt: new Date(), comment: req.body.comment || null }
      });
      const lastApproval = await prisma.quoteApproval.findFirst({ where: { quoteId: req.params.id }, orderBy: { createdAt: 'desc' } });
      if (lastApproval?.requestedBy) {
        const employee = await prisma.user.findUnique({ where: { id: lastApproval.requestedBy } });
        if (employee?.email) {
          const brand = process.env.BRAND_NAME || 'SISWIT';
          const cta = `${process.env.FRONTEND_BASE_URL || 'http://localhost:5173'}/employee-dashboard/cpq/quotes/${quote.id}`;
          const html = `<div style="font-family:system-ui,Segoe UI,Arial">
            <h2 style="color:#0F172A">${brand}: Quote Rejected</h2>
            <p>Quote ${quote.quoteNumber || quote.id} was rejected.</p>
            <p>Reason: ${(req.body.comment || '').toString()}</p>
            <p><a href="${cta}" style="background:#1A3C34;color:#fff;padding:8px 12px;border-radius:6px;text-decoration:none">View Quote</a></p>
          </div>`;
          await sendEmail({ email: employee.email, subject: 'Quote Rejected', message: 'Your quote was rejected', html });
        }
      }
    }
        res.json({
            ...mapId(quote),
            items: quote.items.map(mapId),
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Request approval
router.post('/quotes/:id/request-approval', auth, async (req, res) => {
  try {
    const user = parseUser(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const quote = await prisma.quote.update({
      where: { id: req.params.id },
      data: { status: 'APPROVAL_PENDING', updatedAt: new Date() }
    });
    await prisma.quoteApproval.create({
      data: {
        tenantId: user.tenantId || user.id,
        quoteId: req.params.id,
        requestedBy: user.id,
        status: 'PENDING',
        comment: req.body.comment || null
      }
    });
    // Notify the requesting employee with quote details (no owner portal CTA)
    try {
      const enriched = await prisma.quote.findUnique({
        where: { id: req.params.id },
        include: { account: true, items: true }
      });
      if (user.email) {
        const html = getQuoteApprovalSubmittedEmail({
          workspaceName: process.env.BRAND_NAME || 'SISWIT',
          quoteNumber: enriched?.quoteNumber || quote.quoteNumber || quote.id,
          customerName: enriched?.account?.name || '',
          currency: enriched?.currency || quote.currency || 'USD',
          grandTotal: enriched?.grandTotal ?? quote.grandTotal ?? 0,
          discountTotal: enriched?.discountTotal ?? quote.discountTotal ?? 0,
          items: enriched?.items || []
        });
        await sendEmail({ email: user.email, subject: 'Quote Approval Request Submitted', message: 'Approval requested', html });
      }
      const owner = await prisma.user.findUnique({ where: { id: user.tenantId || user.id } });
      if (owner?.email) {
        const htmlOwner = getQuoteApprovalRequestEmail({
          workspaceName: process.env.BRAND_NAME || 'SISWIT',
          quoteNumber: enriched?.quoteNumber || quote.quoteNumber || quote.id,
          customerName: enriched?.account?.name || '',
          currency: enriched?.currency || quote.currency || 'USD',
          grandTotal: enriched?.grandTotal ?? quote.grandTotal ?? 0
        });
        await sendEmail({ email: owner.email, subject: 'Approval Needed: Quote', message: 'Quote approval request', html: htmlOwner });
      }
    } catch {}
    res.json(mapId(quote));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Approve (owner)
router.post('/quotes/:id/approve', auth, async (req, res) => {
  try {
    const user = parseUser(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if ((user.role || '').toLowerCase() !== 'owner') return res.status(403).json({ message: 'Forbidden' });
    const quote = await prisma.quote.update({
      where: { id: req.params.id },
      data: { status: 'APPROVED', updatedAt: new Date() },
      include: { items: true }
    });
    await prisma.quoteApproval.updateMany({
      where: { quoteId: req.params.id, status: 'PENDING' },
      data: { status: 'APPROVED', decidedBy: user.id, decidedAt: new Date() }
    });
    const lastApproval = await prisma.quoteApproval.findFirst({ where: { quoteId: req.params.id }, orderBy: { createdAt: 'desc' } });
    if (lastApproval?.requestedBy) {
      const employee = await prisma.user.findUnique({ where: { id: lastApproval.requestedBy } });
      if (employee?.email) {
        const brand = process.env.BRAND_NAME || 'SISWIT';
        const cta = `${process.env.FRONTEND_BASE_URL || 'http://localhost:5173'}/employee-dashboard/cpq/quotes/${quote.id}`;
        const html = `<div style="font-family:system-ui,Segoe UI,Arial">
          <h2 style="color:#0F172A">${brand}: Quote Approved</h2>
          <p>Quote ${quote.quoteNumber || quote.id} was approved.</p>
          <p><a href="${cta}" style="background:#1A3C34;color:#fff;padding:8px 12px;border-radius:6px;text-decoration:none">View Quote</a></p>
        </div>`;
        await sendEmail({ email: employee.email, subject: 'Quote Approved', message: 'Your quote was approved', html });
      }
    }
    res.json({
      ...mapId(quote),
      items: quote.items.map(mapId),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// List approvals
router.get('/approvals', auth, async (req, res) => {
  try {
    const user = parseUser(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    let approvals = await prisma.quoteApproval.findMany({
      where: { tenantId: user.tenantId || user.id },
      orderBy: { createdAt: 'desc' },
      include: { quote: true }
    });
    if (!approvals.length) {
      approvals = await prisma.quoteApproval.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        include: { quote: true }
      });
    }
    res.json(approvals.map(a => ({
      ...mapId(a),
      quote: mapId(a.quote)
    })));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
// Quote items CRUD
router.post('/quotes/:id/items', auth, async (req, res) => {
  try {
    const user = parseUser(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const { productId, quantity, unitPrice, discount } = req.body;
    const lineSubtotal = quantity * unitPrice;
    const discountAmount = lineSubtotal * ((discount || 0) / 100);
    const total = lineSubtotal - discountAmount;
    const item = await prisma.quoteItem.create({
      data: {
        tenantId: user.tenantId,
        quoteId: req.params.id,
        productId,
        quantity,
        unitPrice,
        discount: discount || 0,
        total
      }
    });
    // Recalc quote totals
    const items = await prisma.quoteItem.findMany({ where: { quoteId: req.params.id } });
    const subtotal = items.reduce((s, it) => s + Number(it.unitPrice) * it.quantity, 0);
    const discountTotal = items.reduce((s, it) => s + (Number(it.unitPrice) * it.quantity) * (Number(it.discount || 0) / 100), 0);
    const taxTotal = (subtotal - discountTotal) * 0.1;
    const grandTotal = subtotal - discountTotal + taxTotal;
    await prisma.quote.update({ where: { id: req.params.id }, data: { subtotal, discountTotal, taxTotal, grandTotal } });
    res.json(mapId(item));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.put('/quotes/:id/items/:itemId', auth, async (req, res) => {
  try {
    const { quantity, unitPrice, discount } = req.body;
    const lineSubtotal = quantity * unitPrice;
    const discountAmount = lineSubtotal * ((discount || 0) / 100);
    const total = lineSubtotal - discountAmount;
    const item = await prisma.quoteItem.update({
      where: { id: req.params.itemId },
      data: { quantity, unitPrice, discount, total, updatedAt: new Date() }
    });
    // Recalc totals
    const items = await prisma.quoteItem.findMany({ where: { quoteId: req.params.id } });
    const subtotal = items.reduce((s, it) => s + Number(it.unitPrice) * it.quantity, 0);
    const discountTotal = items.reduce((s, it) => s + (Number(it.unitPrice) * it.quantity) * (Number(it.discount || 0) / 100), 0);
    const taxTotal = (subtotal - discountTotal) * 0.1;
    const grandTotal = subtotal - discountTotal + taxTotal;
    await prisma.quote.update({ where: { id: req.params.id }, data: { subtotal, discountTotal, taxTotal, grandTotal } });
    res.json(mapId(item));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.delete('/quotes/:id/items/:itemId', auth, async (req, res) => {
  try {
    await prisma.quoteItem.delete({ where: { id: req.params.itemId } });
    const items = await prisma.quoteItem.findMany({ where: { quoteId: req.params.id } });
    const subtotal = items.reduce((s, it) => s + Number(it.unitPrice) * it.quantity, 0);
    const discountTotal = items.reduce((s, it) => s + (Number(it.unitPrice) * it.quantity) * (Number(it.discount || 0) / 100), 0);
    const taxTotal = (subtotal - discountTotal) * 0.1;
    const grandTotal = subtotal - discountTotal + taxTotal;
    await prisma.quote.update({ where: { id: req.params.id }, data: { subtotal, discountTotal, taxTotal, grandTotal } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
module.exports = router;
