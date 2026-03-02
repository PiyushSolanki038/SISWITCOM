const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { prisma } = require('../prismaClient');
const mapId = (o) => (o ? { ...o, _id: o.id } : o);
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

// Helper to get Account ID for Customer
const getCustomerAccount = async (email) => {
    const contact = await prisma.contact.findFirst({ where: { email } });
    if (!contact) return null;
    const account = await prisma.account.findFirst({ where: { name: contact.company } });
    return account ? account.id : null;
};

// --- ORDERS ---

// Get all orders (with optional filtering)
router.get('/orders', auth, async (req, res) => {
  try {
    const filter = { tenantId: req.user.tenantId };
    
    if (req.user.role === 'customer') {
        const accountId = await getCustomerAccount(req.user.email);
        if (!accountId) return res.status(404).json({ message: 'Account not found for this user' });
        filter.accountId = accountId;
    } else if (req.query.accountId) {
      filter.accountId = req.query.accountId;
    }

    const orders = await prisma.eRPOrder.findMany({
      where: filter,
      include: { account: true },
    });
    res.json(orders.map(o => ({ ...mapId(o), account: mapId(o.account) })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get order by id
router.get('/orders/:id', auth, async (req, res) => {
  try {
    const order = await prisma.eRPOrder.findFirst({
      where: { id: req.params.id, tenantId: req.user.tenantId },
      include: { account: true }
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ ...mapId(order), account: mapId(order.account) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create order
router.post('/orders', auth, async (req, res) => {
  try {
    const body = { ...req.body, tenantId: req.user.tenantId, createdById: req.user.id };
    if (!body.orderNumber) {
      const count = await prisma.eRPOrder.count();
      body.orderNumber = `ORD-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
    }
    if (!body.status) body.status = 'draft';
    if (!body.fulfillmentStatus) body.fulfillmentStatus = 'pending';
    if (body.createdBy) {
      body.createdByStr = String(body.createdBy);
      delete body.createdBy;
    }
    const savedOrder = await prisma.eRPOrder.create({ data: body });
    res.status(201).json(mapId(savedOrder));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update order
router.put('/orders/:id', auth, async (req, res) => {
  try {
    const updatedOrder = await prisma.eRPOrder.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(mapId(updatedOrder));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Email order confirmation to account primary contact (best-effort)
router.post('/orders/:id/email', auth, async (req, res) => {
  try {
    const order = await prisma.eRPOrder.findFirst({
      where: { id: req.params.id, tenantId: req.user.tenantId },
      include: { account: true }
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const account = order.account;
    // Try to find a contact by company name
    let contactEmail = req.body?.email || null;
    if (!contactEmail && account?.name) {
      const contact = await prisma.contact.findFirst({ where: { company: account.name } });
      contactEmail = contact?.email || null;
    }
    if (!contactEmail) {
      return res.status(400).json({ message: 'No contact email found for account' });
    }

    const subject = `Order Confirmation ${order.orderNumber}`;
    const currency = order.currency || 'USD';
    const itemsHtml = (order.items || [])
      .map(i => `<tr><td style="padding:6px 8px;border:1px solid #eee;">${i.name || i.productId}</td><td style="padding:6px 8px;border:1px solid #eee;text-align:right;">${i.quantity}</td><td style="padding:6px 8px;border:1px solid #eee;text-align:right;">${Number(i.unitPrice || 0).toLocaleString('en-US',{style:'currency',currency})}</td><td style="padding:6px 8px;border:1px solid #eee;text-align:right;">${Number(i.total || 0).toLocaleString('en-US',{style:'currency',currency})}</td></tr>`)
      .join('');
    const message = `Order ${order.orderNumber} details`;
    const html = `
      <div style="font-family:Segoe UI,Arial,sans-serif;color:#333;">
        <h2 style="margin:0 0 8px;">Order ${order.orderNumber}</h2>
        <p style="margin:0 0 12px;">Hello${account?.name ? ` ${account.name}` : ''}, please find your order details below.</p>
        <table style="border-collapse:collapse;width:100%;margin:12px 0;">
          <thead>
            <tr>
              <th style="padding:6px 8px;border:1px solid #eee;text-align:left;">Product</th>
              <th style="padding:6px 8px;border:1px solid #eee;text-align:right;">Qty</th>
              <th style="padding:6px 8px;border:1px solid #eee;text-align:right;">Unit Price</th>
              <th style="padding:6px 8px;border:1px solid #eee;text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p style="margin:8px 0;">Subtotal: <strong>${Number(order.subtotal || 0).toLocaleString('en-US',{style:'currency',currency})}</strong></p>
        <p style="margin:8px 0;">Tax: <strong>${Number(order.taxTotal || 0).toLocaleString('en-US',{style:'currency',currency})}</strong></p>
        <p style="margin:8px 0;">Grand Total: <strong>${Number(order.grandTotal || 0).toLocaleString('en-US',{style:'currency',currency})}</strong></p>
        ${req.body?.note ? `<div style="margin-top:12px;padding:10px;background:#f9f9f9;border:1px solid #eee;border-radius:6px;"><strong>Note:</strong> ${String(req.body.note)}</div>` : ''}
      </div>
    `;
    await sendEmail({
      email: contactEmail,
      subject,
      message,
      html
    });
    res.json({ message: 'Email sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

// Confirm order
router.post('/orders/:id/confirm', auth, async (req, res) => {
  try {
    const order = await prisma.eRPOrder.findFirst({ where: { id: req.params.id, tenantId: req.user.tenantId } });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const updated = await prisma.eRPOrder.update({
      where: { id: order.id },
      data: { status: 'confirmed' }
    });
    res.json(mapId(updated));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Fulfillment transitions
router.post('/orders/:id/fulfillment/start', auth, async (req, res) => {
  try {
    const order = await prisma.eRPOrder.findFirst({ where: { id: req.params.id, tenantId: req.user.tenantId } });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const updated = await prisma.eRPOrder.update({
      where: { id: order.id },
      data: { fulfillmentStatus: 'in_progress', status: 'fulfilled' }
    });
    res.json(mapId(updated));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/orders/:id/fulfillment/complete', auth, async (req, res) => {
  try {
    const order = await prisma.eRPOrder.findFirst({ where: { id: req.params.id, tenantId: req.user.tenantId } });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const updated = await prisma.eRPOrder.update({
      where: { id: order.id },
      data: { fulfillmentStatus: 'completed', status: 'closed' }
    });
    res.json(mapId(updated));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- INVOICES ---

// Get all invoices (with optional filtering)
router.get('/invoices', auth, async (req, res) => {
  try {
    const filter = { tenantId: req.user.tenantId };
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    if (req.user.role === 'customer') {
        const accountId = await getCustomerAccount(req.user.email);
        if (!accountId) return res.status(404).json({ message: 'Account not found for this user' });
        filter.accountId = accountId;
    } else if (req.query.accountId) {
      filter.accountId = req.query.accountId;
    }

    const invoices = await prisma.invoice.findMany({
      where: filter,
      include: { account: true, order: true },
    });
    res.json(invoices.map(i => ({ ...mapId(i), account: mapId(i.account), order: mapId(i.order) })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get invoice by id
router.get('/invoices/:id', auth, async (req, res) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, tenantId: req.user.tenantId },
      include: { account: true, order: true, payments: true }
    });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ ...mapId(invoice), account: mapId(invoice.account), order: mapId(invoice.order) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create invoice
router.post('/invoices', auth, async (req, res) => {
  try {
    let invoiceData = { ...req.body, tenantId: req.user.tenantId };

    // Auto-populate from Order if orderId is provided
    if (invoiceData.orderId) {
        const order = await prisma.eRPOrder.findUnique({ where: { id: invoiceData.orderId } });
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Generate Invoice Number
        const count = await prisma.invoice.count();
        const invoiceNumber = `INV-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

        invoiceData = {
            invoiceNumber,
            orderId: order.id,
            accountId: order.accountId,
            issueDate: new Date(),
            dueDate: invoiceData.dueDate || new Date(Date.now() + 30*24*60*60*1000),
            status: 'sent',
            items: order.items,
            subtotal: order.subtotal,
            taxTotal: order.taxTotal,
            grandTotal: order.grandTotal,
            balanceDue: order.grandTotal,
            createdBy: req.user.id,
            ...invoiceData // Override with any explicitly provided fields
        };
    } else {
         return res.status(400).json({ message: 'orderId is required' });
    }

    const savedInvoice = await prisma.invoice.create({ data: invoiceData });
    res.status(201).json(mapId(savedInvoice));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update invoice
router.put('/invoices/:id', auth, async (req, res) => {
  try {
    const updatedInvoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(mapId(updatedInvoice));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Email invoice to recipient (and mark as sent)
router.post('/invoices/:id/email', auth, async (req, res) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, tenantId: req.user.tenantId },
      include: { account: true, order: true },
    });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    // Determine recipient
    let recipient = (req.body && req.body.email) ? String(req.body.email) : '';
    if (!recipient && invoice.account?.name) {
      const contact = await prisma.contact.findFirst({ where: { company: invoice.account.name } });
      if (contact?.email) recipient = contact.email;
    }
    if (!recipient) {
      return res.status(400).json({ message: 'No recipient email provided or found' });
    }

    const token = jwt.sign(
      { invoiceId: invoice.id, tenantId: req.user.tenantId, t: 'invoice_pay' },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '7d' }
    );
    const appUrl = process.env.APP_URL || 'http://localhost:5173';
    const payUrl = `${appUrl}/pay/${token}`;

    const currency = invoice.currency || 'USD';
    const lineRows = (invoice.items || [])
      .map((i) => {
        const unit = Number(i.unitPrice || 0).toLocaleString('en-US', { style: 'currency', currency });
        const total = Number(i.total || 0).toLocaleString('en-US', { style: 'currency', currency });
        return `<tr>
          <td style="padding:8px;border:1px solid #e5e7eb;">${i.name || i.productId}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">${i.quantity}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">${unit}</td>
          <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">${total}</td>
        </tr>`;
      })
      .join('');

    const subtotal = Number(invoice.subtotal || 0).toLocaleString('en-US', { style: 'currency', currency });
    const taxTotal = Number(invoice.taxTotal || 0).toLocaleString('en-US', { style: 'currency', currency });
    const grandTotal = Number(invoice.grandTotal || 0).toLocaleString('en-US', { style: 'currency', currency });

    const subject = `Invoice ${invoice.invoiceNumber}`;
    const message = `Invoice ${invoice.invoiceNumber} details`;
    const note = req.body?.note ? `<div style="margin-top:12px;padding:10px;background:#f9f9f9;border:1px solid #eee;border-radius:6px;"><strong>Note:</strong> ${String(req.body.note)}</div>` : '';
    const html = `
      <div style="font-family:Segoe UI,Arial,sans-serif;color:#333;">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #111;padding-bottom:8px;margin-bottom:12px;">
          <div>
            <div style="font-size:22px;font-weight:700;">SISWIT</div>
            <div style="font-size:12px;color:#666;">Invoice</div>
          </div>
          <div style="text-align:right;font-size:12px;color:#555;">
            <div><strong>Invoice:</strong> ${invoice.invoiceNumber}</div>
            <div><strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}</div>
            ${invoice.dueDate ? `<div><strong>Due:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</div>` : ''}
          </div>
        </div>
        <div style="margin-bottom:12px;">
          <div style="font-weight:600;margin-bottom:6px;">Bill To</div>
          <div>${invoice.account?.name || ''}</div>
        </div>
        <table style="border-collapse:collapse;width:100%;margin:12px 0;">
          <thead>
            <tr>
              <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;background:#f9fafb;">Product</th>
              <th style="padding:8px;border:1px solid #e5e7eb;text-align:right;background:#f9fafb;">Qty</th>
              <th style="padding:8px;border:1px solid #e5e7eb;text-align:right;background:#f9fafb;">Unit Price</th>
              <th style="padding:8px;border:1px solid #e5e7eb;text-align:right;background:#f9fafb;">Total</th>
            </tr>
          </thead>
          <tbody>${lineRows}</tbody>
        </table>
        <div style="display:flex;justify-content:flex-end;">
          <div style="width:280px;">
            <div style="display:flex;justify-content:space-between;margin:6px 0;"><span>Subtotal</span><strong>${subtotal}</strong></div>
            <div style="display:flex;justify-content:space-between;margin:6px 0;"><span>Tax</span><strong>${taxTotal}</strong></div>
            <div style="height:1px;background:#e5e7eb;margin:8px 0;"></div>
            <div style="display:flex;justify-content:space-between;margin:6px 0;font-size:16px;"><span>Total</span><strong>${grandTotal}</strong></div>
          </div>
        </div>
        <div style="margin:16px 0;">
          <a href="${payUrl}" style="display:inline-block;background:#1A3C34;color:#fff;text-decoration:none;padding:10px 16px;border-radius:6px;">Pay Online</a>
        </div>
        ${note}
      </div>
    `;

    await sendEmail({ email: recipient, subject, message, html });

    const updated = await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: 'sent' }
    });
    res.json(mapId(updated));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to email invoice' });
  }
});

router.post('/invoices/:id/payment-link', auth, async (req, res) => {
  try {
    const invoice = await prisma.invoice.findFirst({ where: { id: req.params.id, tenantId: req.user.tenantId } });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    const token = jwt.sign(
      { invoiceId: invoice.id, tenantId: req.user.tenantId, t: 'invoice_pay' },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '7d' }
    );
    const appUrl = process.env.APP_URL || 'http://localhost:5173';
    const url = `${appUrl}/pay/${token}`;
    res.json({ token, url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/public/invoices/:token', async (req, res) => {
  try {
    let decoded;
    try {
      decoded = jwt.verify(req.params.token, process.env.JWT_SECRET || 'dev_secret');
    } catch {
      return res.status(401).json({ message: 'Invalid or expired link' });
    }
    if (!decoded || decoded.t !== 'invoice_pay') {
      return res.status(400).json({ message: 'Invalid link' });
    }
    const invoice = await prisma.invoice.findFirst({
      where: { id: decoded.invoiceId, tenantId: decoded.tenantId },
      include: { account: true }
    });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      dueDate: invoice.dueDate,
      amount: invoice.grandTotal,
      balanceDue: invoice.balanceDue,
      currency: invoice.currency || 'USD',
      accountName: invoice.account?.name || '',
      items: invoice.items || []
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/public/invoices/:token/pay', async (req, res) => {
  try {
    let decoded;
    try {
      decoded = jwt.verify(req.params.token, process.env.JWT_SECRET || 'dev_secret');
    } catch {
      return res.status(401).json({ message: 'Invalid or expired link' });
    }
    if (!decoded || decoded.t !== 'invoice_pay') {
      return res.status(400).json({ message: 'Invalid link' });
    }
    const invoice = await prisma.invoice.findFirst({ where: { id: decoded.invoiceId, tenantId: decoded.tenantId } });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    if (invoice.status === 'paid') {
      return res.status(400).json({ message: 'Invoice already paid' });
    }
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: 'paid', balanceDue: 0 }
    });
    if (invoice.orderId) {
      await prisma.eRPOrder.update({
        where: { id: invoice.orderId },
        data: { paymentStatus: 'paid', status: 'fulfilled', fulfillmentStatus: 'pending' },
      });
    }
    const count = await prisma.payment.count();
    const paymentNumber = `PAY-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
    const newPayment = await prisma.payment.create({
      data: {
        tenantId: decoded.tenantId,
        paymentNumber,
        invoiceId: invoice.id,
        accountId: invoice.accountId || null,
        amount: invoice.grandTotal,
        paymentMethod: req.body?.paymentMethod || 'credit_card',
        status: 'completed',
        recordedBy: null,
        paymentDate: new Date(),
      },
    });
    const updatedInvoice = await prisma.invoice.findUnique({ where: { id: invoice.id } });
    res.json({ message: 'Payment successful', invoice: updatedInvoice, payment: newPayment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send invoice
router.post('/invoices/:id/send', auth, async (req, res) => {
  try {
    const inv = await prisma.invoice.findFirst({ where: { id: req.params.id, tenantId: req.user.tenantId } });
    if (!inv) return res.status(404).json({ message: 'Invoice not found' });
    const updated = await prisma.invoice.update({
      where: { id: inv.id },
      data: { status: 'sent' }
    });
    res.json(mapId(updated));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- CREDIT NOTES ---

// Get all credit notes (with optional filtering)
router.get('/credit-notes', auth, async (req, res) => {
  try {
    const filter = { tenantId: req.user.tenantId };
    
    if (req.user.role === 'customer') {
        const accountId = await getCustomerAccount(req.user.email);
        if (!accountId) return res.status(404).json({ message: 'Account not found for this user' });
        filter.accountId = accountId;
    } else if (req.query.accountId) {
      filter.accountId = req.query.accountId;
    }

    const notes = await prisma.creditNote.findMany({
      where: filter,
      include: { account: true, invoice: true },
    });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create credit note
router.post('/credit-notes', auth, async (req, res) => {
  try {
    const data = { ...req.body, tenantId: req.user.tenantId };
    const savedNote = await prisma.creditNote.create({ data });
    res.status(201).json(savedNote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get credit note by id
router.get('/credit-notes/:id', auth, async (req, res) => {
  try {
    const note = await prisma.creditNote.findFirst({
      where: { id: req.params.id, tenantId: req.user.tenantId },
      include: { account: true, invoice: true }
    });
    if (!note) return res.status(404).json({ message: 'Credit note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// --- PAYMENTS ---

// Pay Invoice (Customer or Employee)
router.post('/invoices/:id/pay', auth, async (req, res) => {
    try {
        const invoice = await prisma.invoice.findFirst({ where: { id: req.params.id, tenantId: req.user.tenantId } });
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

        if (invoice.status === 'paid') {
            return res.status(400).json({ message: 'Invoice already paid' });
        }

        // 1. Update Invoice
        await prisma.invoice.update({
          where: { id: req.params.id },
          data: { status: 'paid', balanceDue: 0 },
        });

        // 2. Update Order
        if (invoice.orderId) {
            await prisma.eRPOrder.update({
              where: { id: invoice.orderId },
              data: { paymentStatus: 'paid', status: 'fulfilled', fulfillmentStatus: 'pending' },
            });
        }

        // 3. Record Payment
        const count = await prisma.payment.count();
        const paymentNumber = `PAY-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
        
        const newPayment = await prisma.payment.create({
          data: {
            tenantId: req.user.tenantId,
            paymentNumber,
            invoiceId: invoice.id,
            accountId: invoice.accountId || null,
            amount: invoice.grandTotal,
            paymentMethod: req.body.paymentMethod || 'credit_card',
            status: 'completed',
            recordedBy: req.user.id,
            paymentDate: new Date(),
          },
        });

        // 4. Handle Subscription (if applicable)
        // Try to find the customer user to assign subscription to
        let userId = null;
        if (req.user.role === 'customer') {
            userId = req.user.id;
        } else {
            // If employee is paying, try to find the customer account's primary contact
            const account = await prisma.account.findUnique({ where: { id: invoice.accountId } });
            if (account) {
                const contact = await prisma.contact.findFirst({ where: { company: account.name } });
                if (contact) {
                    const customer = await prisma.user.findFirst({ where: { email: contact.email, role: 'CUSTOMER' } });
                    if (customer) userId = customer.id;
                }
            }
        }

        if (userId) {
            // Create Subscription
            await prisma.subscription.create({
              data: {
                userId: userId,
                plan: 'professional',
                status: 'active',
                billingCycle: 'monthly',
                amount: invoice.grandTotal,
                lastPaymentDate: new Date(),
                nextPaymentDate: new Date(Date.now() + 30*24*60*60*1000),
              },
            });

            // Update Customer Status
            await prisma.user.update({
              where: { id: userId },
              data: { subscriptionStatus: 'active', subscriptionPlan: 'professional' },
            });
            console.log(`Subscription activated for user ${userId}`);
        }

        const updatedInvoice = await prisma.invoice.findUnique({ where: { id: req.params.id } });
        res.json({ message: 'Payment successful', invoice: updatedInvoice, payment: newPayment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error processing payment' });
    }
});

// Get payment by id
router.get('/payments/:id', auth, async (req, res) => {
  try {
    const payment = await prisma.payment.findFirst({
      where: { id: req.params.id, tenantId: req.user.tenantId },
      include: { invoice: { include: { account: true } } }
    });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    const account = payment.invoice?.account || null;
    res.json({ ...mapId(payment), account: mapId(account), invoice: mapId(payment.invoice) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all payments (with optional filtering)
router.get('/payments', auth, async (req, res) => {
  try {
    const filter = { tenantId: req.user.tenantId };
    
    if (req.user.role === 'customer') {
        const accountId = await getCustomerAccount(req.user.email);
        if (!accountId) return res.status(404).json({ message: 'Account not found for this user' });
        filter.accountId = accountId;
    } else if (req.query.accountId) {
      filter.accountId = req.query.accountId;
    }

    const payments = await prisma.payment.findMany({
      where: filter,
      include: { invoice: { include: { account: true } } },
    });
    res.json(payments.map(p => {
      const account = p.invoice?.account || null;
      return { ...mapId(p), account: mapId(account), invoice: mapId(p.invoice) };
    }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- ANALYTICS ---

// Get Revenue Analytics (Admin/Owner Only)
router.get('/revenue/analytics', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const payments = await prisma.payment.findMany({
          where: { tenantId: req.user.tenantId, paymentDate: { gte: sixMonthsAgo }, status: 'completed' },
        });
        const monthsMap = {};
        for (const p of payments) {
          const d = new Date(p.paymentDate || Date.now());
          const key = `${d.getFullYear()}-${d.getMonth()+1}`;
          monthsMap[key] = (monthsMap[key] || 0) + Number(p.amount);
        }
        const revenueData = Object.entries(monthsMap)
          .map(([key, totalRevenue]) => {
            const [year, month] = key.split('-').map(Number);
            return { _id: { month, year }, totalRevenue };
          })
          .sort((a, b) => (a._id.year - b._id.year) || (a._id.month - b._id.month));

        // Format for frontend (e.g., "Jan", "Feb")
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedData = revenueData.map(item => ({
            name: months[item._id.month - 1],
            total: item.totalRevenue
        }));

        res.json(formattedData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching analytics' });
    }
});

module.exports = router;
