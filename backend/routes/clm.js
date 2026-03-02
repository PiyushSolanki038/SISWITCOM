const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { prisma } = require('../prismaClient');
const mapId = (o) => (o ? { ...o, _id: o.id } : o);
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const {
  getContractApprovalRequestEmail,
  getContractApprovedEmail,
  getContractRejectedEmail,
  getSignatureRequestEmail,
  getContractSignedEmail
} = require('../utils/emailTemplates');

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

// CRMContact -> Prisma Contact

// @route   POST api/clm/contracts/from-quote/:quoteId
// @desc    Create contract from accepted quote
// @access  Private
router.post('/contracts/from-quote/:quoteId', auth, async (req, res) => {
    console.log(`[CLM] Hitting POST /contracts/from-quote/${req.params.quoteId}`);
    try {
        const user = parseUser(req);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });
        if (['customer'].includes((user.role || '').toLowerCase())) return res.status(403).json({ message: 'Access denied' });
        const tenantId = user.tenantId || user.id;
        if (!tenantId) return res.status(400).json({ message: 'Missing tenant context' });
        const quote = await prisma.quote.findUnique({
            where: { id: req.params.quoteId },
            include: { account: true, items: true },
        });
        console.log('[CLM] Quote found:', quote ? quote.id : 'null');
        
        if (!quote) return res.status(404).json({ message: 'Quote not found' });

        if ((quote.status || '').toUpperCase() !== 'ACCEPTED') {
            return res.status(400).json({ message: 'Quote must be accepted before creating a contract' });
        }

        if (!quote.accountId || !quote.account) {
             console.error('Quote account not populated:', quote);
             const account = await prisma.account.findUnique({ where: { id: quote.accountId } });
             if (!account) {
                 return res.status(500).json({ message: 'Quote account not found', quote });
             }
             quote.account = account;
        }

        // Generate Contract Number
        const count = await prisma.contract.count({ where: { tenantId } });
        const contractNumber = `CTR-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

        // Create Contract
        const contract = await prisma.contract.create({
            data: {
                tenantId,
                contract_number: contractNumber,
                name: `Contract for ${quote.account.name}`,
                account_id: quote.account.id,
                customer_name: quote.account.name,
                quote_id: quote.id,
                contract_type: 'MSA',
                status: 'draft',
                contract_value: quote.grandTotal || 0,
                owner_id: user.id,
                start_date: new Date(),
                end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                renewal_type: 'auto',
                signers: [],
            },
        });
        res.json(mapId(contract));

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// @route   GET api/clm/contracts
// @desc    Get all contracts (tenant-scoped; customers blocked)
// @access  Private
router.get('/contracts', auth, async (req, res) => {
    console.log('[CLM] GET /contracts HIT');
    console.log('[CLM] req.user:', req.user);
    try {
        const user = parseUser(req);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });
        const tenantId = user.tenantId || user.id;
        if (!tenantId) return res.status(400).json({ message: 'Missing tenant context' });
        if (['customer'].includes((user.role || '').toLowerCase())) {
            return res.status(403).json({ message: 'Access denied' });
        }
        let filter = { tenantId };
        const { status, type, accountId, from, to } = req.query || {};
        if (status) filter.status = String(status);
        if (type) filter.contract_type = String(type);
        if (accountId) filter.account_id = String(accountId);
        if (from || to) {
            filter.created_at = {};
            if (from) filter.created_at.gte = new Date(String(from));
            if (to) filter.created_at.lte = new Date(String(to));
        }

        const contracts = await prisma.contract.findMany({ where: filter });
        res.json(contracts.map(mapId));
    } catch (err) {
        console.error('[CLM] GET /contracts error:', err);
        res.json([]);
    }
});

// @route   GET api/clm/contracts/:id
// @desc    Get contract by ID
// @access  Private
router.get('/contracts/:id', auth, async (req, res) => {
    try {
        const user = parseUser(req);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });
        const tenantId = user.tenantId || user.id;
        if (['customer'].includes((user.role || '').toLowerCase())) return res.status(403).json({ message: 'Access denied' });
        const contract = await prisma.contract.findUnique({
            where: { id: req.params.id },
            include: { account: true, quote: true },
        });
        
        if (!contract) return res.status(404).json({ message: 'Contract not found' });
        if (contract.tenantId !== tenantId) return res.status(403).json({ message: 'Forbidden' });
        
        res.json({
            ...mapId(contract),
            account: mapId(contract.account),
            quote: mapId(contract.quote),
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/clm/contracts
// @desc    Create contract
// @access  Private
router.post('/contracts', auth, async (req, res) => {
  try {
    const user = parseUser(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (['customer'].includes((user.role || '').toLowerCase())) return res.status(403).json({ message: 'Access denied' });
    const tenantId = user.tenantId || user.id;
    const {
      accountId,
      opportunityId,
      title,
      type,
      startDate,
      endDate,
      value,
      currency,
      content
    } = req.body;
    if (!accountId || !title) return res.status(400).json({ message: 'Missing required fields' });
    const count = await prisma.contract.count({ where: { tenantId } });
    const contractNumber = `CTR-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
    const acc = await prisma.account.findUnique({ where: { id: accountId } });
    const contract = await prisma.contract.create({
      data: {
        tenantId,
        contract_number: contractNumber,
        name: title,
        account_id: accountId,
        customer_name: acc ? acc.name : null,
        opportunityId: opportunityId || null,
        contract_type: type || 'MSA',
        status: 'draft',
        start_date: startDate ? new Date(startDate) : null,
        end_date: endDate ? new Date(endDate) : null,
        contract_value: value ? Number(value) : null,
        currency: currency || 'USD',
        owner_id: user.id,
        content: content || null,
        signers: []
      }
    });
    await prisma.contractAuditLog.create({
      data: { tenantId, contractId: contract.id, action: 'CREATE', performedBy: user.id, metadata: { title } }
    });
    res.json(mapId(contract));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/clm/contracts/:id
// @desc    Update contract
// @access  Private
router.put('/contracts/:id', auth, async (req, res) => {
  try {
    const user = parseUser(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (['customer'].includes((user.role || '').toLowerCase())) return res.status(403).json({ message: 'Access denied' });
    const tenantId = user.tenantId || user.id;
    let contract = await prisma.contract.findUnique({ where: { id: req.params.id } });
    if (!contract) return res.status(404).json({ message: 'Not found' });
    if (contract.tenantId !== tenantId) return res.status(403).json({ message: 'Forbidden' });
    contract = await prisma.contract.update({
      where: { id: req.params.id },
      data: {
        name: req.body.title ?? contract.name,
        contract_type: req.body.type ?? contract.contract_type,
        start_date: req.body.startDate ? new Date(req.body.startDate) : contract.start_date,
        end_date: req.body.endDate ? new Date(req.body.endDate) : contract.end_date,
        contract_value: req.body.value !== undefined ? Number(req.body.value) : contract.contract_value,
        currency: req.body.currency ?? contract.currency,
        content: req.body.content ?? contract.content,
        status: req.body.status ?? contract.status,
        updated_at: new Date()
      }
    });
    await prisma.contractAuditLog.create({
      data: { tenantId, contractId: contract.id, action: 'UPDATE', performedBy: user.id, metadata: req.body || {} }
    });
    res.json(mapId(contract));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/clm/contracts/:id
// @desc    Archive contract
// @access  Private
router.delete('/contracts/:id', auth, async (req, res) => {
  try {
    const user = parseUser(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (['customer'].includes((user.role || '').toLowerCase())) return res.status(403).json({ message: 'Access denied' });
    const tenantId = user.tenantId || user.id;
    const contract = await prisma.contract.findUnique({ where: { id: req.params.id } });
    if (!contract) return res.status(404).json({ message: 'Not found' });
    if (contract.tenantId !== tenantId) return res.status(403).json({ message: 'Forbidden' });
    await prisma.contract.update({ where: { id: req.params.id }, data: { status: 'archived', updated_at: new Date() } });
    await prisma.contractAuditLog.create({
      data: { tenantId, contractId: req.params.id, action: 'ARCHIVE', performedBy: user.id }
    });
    res.json({ message: 'Archived' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/clm/contracts/:id/submit-approval
// @desc    Submit for approval
// @access  Private
router.post('/contracts/:id/submit-approval', auth, async (req, res) => {
    try {
        const user = parseUser(req);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });
        if (['customer'].includes((user.role || '').toLowerCase())) return res.status(403).json({ message: 'Access denied' });
        const tenantId = user.tenantId || user.id;
        const contract = await prisma.contract.update({
            where: { id: req.params.id },
            data: { status: 'pending_approval', updated_at: new Date() },
        });
        const approval = await prisma.contractApproval.create({
          data: { tenantId, contractId: req.params.id, requestedBy: user.id, status: 'PENDING', comment: req.body.comment || null }
        });
        await prisma.contractAuditLog.create({
          data: { tenantId, contractId: req.params.id, action: 'APPROVAL_SUBMIT', performedBy: user.id, metadata: { comment: req.body.comment || null } }
        });
        const owner = await prisma.user.findUnique({ where: { id: tenantId } });
        if (owner?.email) {
          const html = getContractApprovalRequestEmail({
            workspaceName: process.env.BRAND_NAME || 'SISWIT',
            contractTitle: contract.name || '',
            contractNumber: contract.contract_number || '',
            ctaUrl: `${process.env.FRONTEND_BASE_URL || 'http://localhost:5173'}/app`,
            expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
          });
          await sendEmail({ email: owner.email, subject: 'Approval Needed: Contract', message: 'Contract approval request', html });
        }
        res.json(mapId(contract));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/clm/contracts/:id/approve
// @desc    Approve contract (Owner/Admin)
// @access  Private
router.post('/contracts/:id/approve', auth, async (req, res) => {
    try {
        const user = parseUser(req);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });
        const role = (user.role || '').toLowerCase();
        if (!['owner', 'admin'].includes(role)) return res.status(403).json({ message: 'Forbidden' });
        const contract = await prisma.contract.update({
            where: { id: req.params.id },
            data: { status: 'approved', updated_at: new Date() },
        });
        await prisma.contractApproval.updateMany({
          where: { contractId: req.params.id, status: 'PENDING' },
          data: { status: 'APPROVED', decidedBy: user.id, decidedAt: new Date(), reason: req.body.reason || null }
        });
        await prisma.contractAuditLog.create({
          data: { tenantId: user.tenantId || user.id, contractId: req.params.id, action: 'APPROVAL_APPROVE', performedBy: user.id, metadata: { reason: req.body.reason || null } }
        });
        const lastApproval = await prisma.contractApproval.findFirst({ where: { contractId: req.params.id }, orderBy: { createdAt: 'desc' } });
        if (lastApproval?.requestedBy) {
          const employee = await prisma.user.findUnique({ where: { id: lastApproval.requestedBy } });
          if (employee?.email) {
            const html = getContractApprovedEmail({
              workspaceName: process.env.BRAND_NAME || 'SISWIT',
              contractTitle: contract.name || '',
              contractNumber: contract.contract_number || '',
              ctaUrl: `${process.env.FRONTEND_BASE_URL || 'http://localhost:5173'}/employee-dashboard/clm/contracts/${contract.id}`
            });
            await sendEmail({ email: employee.email, subject: 'Contract Approved', message: 'Your contract was approved', html });
          }
        }
        res.json(mapId(contract));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/clm/contracts/:id/reject
// @desc    Reject contract (Owner/Admin)
// @access  Private
router.post('/contracts/:id/reject', auth, async (req, res) => {
  try {
    const user = parseUser(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const role = (user.role || '').toLowerCase();
    if (!['owner', 'admin'].includes(role)) return res.status(403).json({ message: 'Forbidden' });
    const contract = await prisma.contract.update({
      where: { id: req.params.id },
      data: { status: 'rejected', updated_at: new Date() }
    });
    await prisma.contractApproval.updateMany({
      where: { contractId: req.params.id, status: 'PENDING' },
      data: { status: 'REJECTED', decidedBy: user.id, decidedAt: new Date(), reason: req.body.reason || null }
    });
    await prisma.contractAuditLog.create({
      data: { tenantId: user.tenantId || user.id, contractId: req.params.id, action: 'APPROVAL_REJECT', performedBy: user.id, metadata: { reason: req.body.reason || null } }
    });
    const lastApproval = await prisma.contractApproval.findFirst({ where: { contractId: req.params.id }, orderBy: { createdAt: 'desc' } });
    if (lastApproval?.requestedBy) {
      const employee = await prisma.user.findUnique({ where: { id: lastApproval.requestedBy } });
      if (employee?.email) {
        const html = getContractRejectedEmail({
          workspaceName: process.env.BRAND_NAME || 'SISWIT',
          contractTitle: contract.name || '',
          contractNumber: contract.contract_number || '',
          ctaUrl: `${process.env.FRONTEND_BASE_URL || 'http://localhost:5173'}/employee-dashboard/clm/contracts/${contract.id}`,
          reason: req.body.reason || ''
        });
        await sendEmail({ email: employee.email, subject: 'Contract Rejected', message: 'Your contract was rejected', html });
      }
    }
    res.json(mapId(contract));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/clm/contracts/:id/send-for-signature
// @desc    Send contract for signature
// @access  Private
router.post('/contracts/:id/send-for-signature', auth, async (req, res) => {
    try {
        const user = parseUser(req);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });
        if (['customer'].includes((user.role || '').toLowerCase())) return res.status(403).json({ message: 'Access denied' });
        const tenantId = user.tenantId || user.id;
        const { signers } = req.body; 
        const contract = await prisma.contract.findUnique({ where: { id: req.params.id } });
        if (!contract) return res.status(404).json({ message: 'Contract not found' });

        // Update contract status and add signers
        const newSigners = signers || contract.signers || [];
        await prisma.contract.update({
            where: { id: req.params.id },
            data: { status: 'sent_for_signature', signers: newSigners, updated_at: new Date() },
        });
        
        // Create Signing Sessions (Envelopes)
        if (signers && signers.length > 0) {
            for (const signer of signers) {
                // Generate unique token
                const token = crypto.randomBytes(32).toString('hex');
                
                await prisma.signingSession.create({
                    data: {
                        token,
                        tenantId,
                        contractId: req.params.id,
                        signerEmail: signer.email,
                        signerName: signer.name,
                        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    },
                });
                await prisma.contractSignatureRequest.create({
                  data: {
                    tenantId,
                    contractId: req.params.id,
                    signerEmail: signer.email,
                    signerName: signer.name,
                    token,
                    status: 'sent',
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  }
                });
                const html = getSignatureRequestEmail({
                  workspaceName: process.env.BRAND_NAME || 'SISWIT',
                  contractTitle: contract.name || '',
                  contractNumber: contract.contract_number || '',
                  ctaUrl: `${process.env.FRONTEND_BASE_URL || 'http://localhost:5173'}/employee-dashboard/sign/execute?token=${token}`,
                  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                });
                await sendEmail({ email: signer.email, subject: 'Signature Request', message: 'Please sign the contract', html });
                
                // Update signer status in contract
                const updatedSigners = newSigners.map(s => s.email === signer.email ? { ...s, status: 'sent' } : s);
                await prisma.contract.update({ where: { id: req.params.id }, data: { signers: updatedSigners } });
                await prisma.contractAuditLog.create({
                  data: { tenantId, contractId: req.params.id, action: 'SEND_SIGNATURE', performedBy: user.id, metadata: { signerEmail: signer.email } }
                });
            }
        }
        
        const updated = await prisma.contract.findUnique({ where: { id: req.params.id } });
        res.json(mapId(updated));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/clm/signatures
// @desc    List signature requests (tenant-scoped)
// @access  Private
router.get('/signatures', auth, async (req, res) => {
    try {
        const user = parseUser(req);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });
        const tenantId = user.tenantId || user.id;
        if (['customer'].includes((user.role || '').toLowerCase())) return res.status(403).json({ message: 'Access denied' });
        const sessions = await prisma.contractSignatureRequest.findMany({
          where: { tenantId },
          orderBy: { createdAt: 'desc' },
          include: { contract: true }
        });
        res.json(sessions.map(s => ({
          ...mapId(s),
          contract: mapId(s.contract)
        })));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/clm/signatures/:id
// @desc    Get signature request
// @access  Private
router.get('/signatures/:id', auth, async (req, res) => {
  try {
    const user = parseUser(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const tenantId = user.tenantId || user.id;
    const s = await prisma.contractSignatureRequest.findUnique({ where: { id: req.params.id }, include: { contract: true } });
    if (!s || s.tenantId !== tenantId) return res.status(404).json({ message: 'Not found' });
    res.json({ ...mapId(s), contract: mapId(s.contract) });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Public signing endpoints
// @route   GET api/clm/public/sign/:token
router.get('/public/sign/:token', async (req, res) => {
  try {
    const s = await prisma.contractSignatureRequest.findUnique({ where: { token: req.params.token }, include: { contract: true } });
    if (!s) return res.status(404).json({ message: 'Invalid or expired signing link' });
    if (new Date(s.expiresAt) < Date.now()) return res.status(400).json({ message: 'Signing link has expired' });
    if (s.status === 'sent') {
      await prisma.contractSignatureRequest.update({ where: { token: req.params.token }, data: { status: 'viewed', viewedAt: new Date() } });
      await prisma.contractAuditLog.create({
        data: { tenantId: s.tenantId, contractId: s.contractId, action: 'SIGN_VIEW', performedBy: s.signerEmail, metadata: { token: s.token } }
      });
    }
    res.json({ session: mapId(await prisma.contractSignatureRequest.findUnique({ where: { token: req.params.token } })), contract: mapId(s.contract) });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/clm/public/sign/:token
router.post('/public/sign/:token', async (req, res) => {
  try {
    const { signatureData } = req.body;
    const s = await prisma.contractSignatureRequest.findUnique({ where: { token: req.params.token } });
    if (!s) return res.status(404).json({ message: 'Session not found' });
    if (s.status === 'signed') return res.status(400).json({ message: 'Already signed' });
    await prisma.contractSignatureRequest.update({
      where: { token: req.params.token },
      data: { status: 'signed', usedAt: new Date(), updatedAt: new Date() }
    });
    await prisma.signingSession.updateMany({
      where: { token: req.params.token },
      data: { status: 'signed', signedAt: new Date(), signatureData }
    });
    const contract = await prisma.contract.findUnique({ where: { id: s.contractId } });
    const updatedSigners = (contract.signers || []).map(si => si.email === s.signerEmail ? { ...si, status: 'signed', signed_at: Date.now() } : si);
    await prisma.contract.update({ where: { id: contract.id }, data: { signers: updatedSigners } });
    const refreshed = await prisma.contract.findUnique({ where: { id: contract.id } });
    const allSigned = (refreshed.signers || []).every(si => si.status === 'signed');
    if (allSigned) {
      await prisma.contract.update({ where: { id: refreshed.id }, data: { status: 'active' } });
      await createERPOrderFromContract(refreshed.id);
    }
    await prisma.contractAuditLog.create({
      data: { tenantId: s.tenantId, contractId: s.contractId, action: 'SIGN_COMPLETE', performedBy: s.signerEmail, metadata: { token: s.token } }
    });
    const owner = await prisma.user.findUnique({ where: { id: s.tenantId } });
    const emails = [];
    if (owner?.email) emails.push(owner.email);
    if (contract?.owner_id) {
      const ownerUser = await prisma.user.findUnique({ where: { id: contract.owner_id } });
      if (ownerUser?.email) emails.push(ownerUser.email);
    }
    emails.push(s.signerEmail);
    for (const to of emails) {
      const html = getContractSignedEmail({
        workspaceName: process.env.BRAND_NAME || 'SISWIT',
        contractTitle: contract?.name || '',
        contractNumber: contract?.contract_number || '',
        ctaUrl: `${process.env.FRONTEND_BASE_URL || 'http://localhost:5173'}/employee-dashboard/clm/contracts/${contract?.id || ''}`
      });
      await sendEmail({ email: to, subject: 'Contract Signed', message: 'Contract signed confirmation', html });
    }
    res.json({ message: 'Contract signed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/clm/public/decline/:token
router.post('/public/decline/:token', async (req, res) => {
  try {
    const s = await prisma.contractSignatureRequest.findUnique({ where: { token: req.params.token } });
    if (!s) return res.status(404).json({ message: 'Session not found' });
    await prisma.contractSignatureRequest.update({
      where: { token: req.params.token },
      data: { status: 'declined', updatedAt: new Date() }
    });
    await prisma.contractAuditLog.create({
      data: { tenantId: s.tenantId, contractId: s.contractId, action: 'SIGN_DECLINE', performedBy: s.signerEmail, metadata: { token: s.token } }
    });
    res.json({ message: 'Declined' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/clm/contracts/:id/audit
router.get('/contracts/:id/audit', auth, async (req, res) => {
  try {
    const user = parseUser(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const tenantId = user.tenantId || user.id;
    const logs = await prisma.contractAuditLog.findMany({ where: { tenantId, contractId: req.params.id }, orderBy: { created_at: 'desc' } });
    res.json(logs.map(mapId));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
// Approvals list for Owner/Admin
router.get('/approvals/contracts', auth, async (req, res) => {
  try {
    const user = parseUser(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const role = (user.role || '').toLowerCase();
    if (!['owner', 'admin'].includes(role)) return res.status(403).json({ message: 'Forbidden' });
    const tenantId = user.tenantId || user.id;
    const approvals = await prisma.contractApproval.findMany({
      where: { tenantId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: { contract: true }
    });
    res.json(approvals.map(a => ({ ...mapId(a), contract: mapId(a.contract) })));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
// Templates CRUD
router.get('/templates', auth, async (req, res) => {
  try {
    const user = parseUser(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const tenantId = user.tenantId || user.id;
    if (['customer'].includes((user.role || '').toLowerCase())) return res.status(403).json({ message: 'Access denied' });
    const templates = await prisma.contractTemplate.findMany({ where: { tenantId }, orderBy: { updated_at: 'desc' } });
    res.json(templates.map(mapId));
  } catch (err) {
    console.error('[CLM] GET /templates error:', err);
    res.json([]);
  }
});

router.post('/templates', auth, async (req, res) => {
  try {
    const user = parseUser(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const tenantId = user.tenantId || user.id;
    const { name, contract_type, content, clauses, is_active } = req.body;
    const tpl = await prisma.contractTemplate.create({
      data: { tenantId, name, contract_type, content, is_active: !!is_active, clauses: { create: (clauses || []).map((c, i) => ({ tenantId, title: c.title, content: c.content, sortOrder: c.sortOrder ?? i, required: !!c.required })) } }
    });
    res.json(mapId(tpl));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/templates/:id', auth, async (req, res) => {
  try {
    const user = parseUser(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const tenantId = user.tenantId || user.id;
    const tpl = await prisma.contractTemplate.findUnique({ where: { id: req.params.id }, include: { clauses: true } });
    if (!tpl || tpl.tenantId !== tenantId) return res.status(404).json({ message: 'Not found' });
    res.json({ ...mapId(tpl), clauses: tpl.clauses.map(mapId) });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.put('/templates/:id', auth, async (req, res) => {
  try {
    const user = parseUser(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const tenantId = user.tenantId || user.id;
    const { name, contract_type, content, clauses, is_active, version } = req.body;
    const existing = await prisma.contractTemplate.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.tenantId !== tenantId) return res.status(404).json({ message: 'Not found' });
    await prisma.contractTemplate.update({ 
      where: { id: req.params.id }, 
      data: { 
        name, 
        contract_type, 
        content, 
        version: typeof version === 'number' ? version : existing.version, 
        is_active: typeof is_active === 'boolean' ? is_active : existing.is_active, 
        updated_at: new Date() 
      } 
    });
    if (Array.isArray(clauses)) {
      await prisma.contractClause.deleteMany({ where: { templateId: req.params.id } });
      await prisma.contractClause.createMany({
        data: clauses.map((c, i) => ({
          id: undefined,
          tenantId,
          templateId: req.params.id,
          title: c.title,
          content: c.content,
          sortOrder: c.sortOrder ?? i,
          required: !!c.required,
          created_at: new Date(),
          updated_at: new Date()
        }))
      });
    }
    const tpl = await prisma.contractTemplate.findUnique({ where: { id: req.params.id }, include: { clauses: true } });
    res.json({ ...mapId(tpl), clauses: tpl.clauses.map(mapId) });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.delete('/templates/:id', auth, async (req, res) => {
  try {
    const user = parseUser(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    const tenantId = user.tenantId || user.id;
    const tpl = await prisma.contractTemplate.findUnique({ where: { id: req.params.id } });
    if (!tpl || tpl.tenantId !== tenantId) return res.status(404).json({ message: 'Not found' });
    await prisma.contractClause.deleteMany({ where: { templateId: req.params.id } });
    await prisma.contractTemplate.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
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
                    productId: item.productId,
                    name: item.name || 'Service',
                    quantity: item.quantity || 1,
                    unitPrice: item.unitPrice || 0,
                    total: item.total || 0
                })),
                subtotal: grandTotal,
                taxTotal: 0,
                grandTotal: grandTotal,
                createdByStr: contract.owner_id ? String(contract.owner_id) : 'System',
            },
        });
        console.log(`ERP Order created: ${orderNumber}`);
    } catch (error) {
        console.error("Failed to auto-create ERP Order:", error);
    }
}

// Renewals: create renewal draft from existing contract
router.post('/contracts/:id/renew', auth, async (req, res) => {
  try {
    const user = parseUser(req);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (['customer'].includes((user.role || '').toLowerCase())) return res.status(403).json({ message: 'Access denied' });
    const tenantId = user.tenantId || user.id;
    const existing = await prisma.contract.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: 'Not found' });
    if (existing.tenantId !== tenantId) return res.status(403).json({ message: 'Forbidden' });
    const count = await prisma.contract.count({ where: { tenantId } });
    const newNumber = `CTR-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
    const newContract = await prisma.contract.create({
      data: {
        tenantId,
        contract_number: newNumber,
        name: `${existing.name} - Renewal`,
        account_id: existing.account_id,
        customer_name: existing.customer_name,
        quote_id: existing.quote_id,
        contract_type: existing.contract_type,
        status: 'draft',
        start_date: new Date(),
        end_date: existing.end_date ? new Date(new Date(existing.end_date).setFullYear(new Date().getFullYear() + 1)) : null,
        renewal_type: existing.renewal_type || 'manual',
        contract_value: existing.contract_value,
        owner_id: user.id,
        currency: existing.currency,
        content: existing.content,
        signers: []
      }
    });
    const latestVersion = await prisma.contractVersion.findFirst({
      where: { tenantId, contractId: existing.id },
      orderBy: { version: 'desc' }
    });
    await prisma.contractVersion.create({
      data: {
        tenantId,
        contractId: newContract.id,
        version: (latestVersion?.version || 0) + 1,
        content: existing.content || '',
        createdById: user.id
      }
    });
    await prisma.contractAuditLog.create({
      data: { tenantId, contractId: newContract.id, action: 'RENEWAL_CREATE', performedBy: user.id, metadata: { fromContractId: existing.id } }
    });
    res.json(mapId(newContract));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;
