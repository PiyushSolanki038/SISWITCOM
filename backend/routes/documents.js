const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireTenant = require('../middleware/requireTenant');
const { prisma } = require('../prismaClient');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tenantId = (req.user?.tenantId || req.user?.id || 'public').toString();
    const dest = path.join(__dirname, '../uploads', tenantId);
    try {
      fs.mkdirSync(dest, { recursive: true });
    } catch {}
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_\-]/gi, '_');
    cb(null, `${Date.now()}_${base}${ext}`);
  }
});
const upload = multer({ storage });

// @route   GET api/documents
// @desc    Get all documents (filtered for customer)
// @access  Private
router.get('/', auth, requireTenant, async (req, res) => {
    try {
        const tenantId = req.user.tenantId || req.user.id;
        let filter = { tenantId };
        const isUuid = (s) => typeof s === 'string' && /^[0-9a-fA-F-]{36}$/.test(s);
        if (!isUuid(tenantId)) {
            return res.json([]);
        }

        if (req.user.role === 'customer') {
            if (!req.user.email) {
                return res.json([]);
            }
            const contact = await prisma.contact.findFirst({ where: { email: req.user.email, tenantId } });
            if (!contact) {
                return res.json([]); 
            }
            
            if (!contact.company) {
                return res.json([]);
            }
            const account = await prisma.account.findFirst({ where: { name: contact.company, tenantId } });
            if (!account) {
                 return res.json([]); 
            }
            
            filter.accountId = account.id;
        }

        const documents = await prisma.document.findMany({
          where: filter
        });
        res.json(documents.map(d => ({
          id: d.id,
          tenantId: d.tenantId,
          title: d.title,
          name: d.name || d.title,
          type: d.type,
          url: d.url,
          category: d.category,
          linked_entity_id: d.linked_entity_id,
          linked_entity_model: d.linked_entity_model,
          size: d.size,
          version: d.version,
          accountId: d.accountId,
          account_id: d.accountId || null,
          quoteId: d.quoteId,
          contractId: d.contractId,
          invoiceId: d.invoiceId,
          orderId: d.orderId,
          userId: d.userId,
          uploaded_by: d.userId || d.uploaded_by || null,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
          created_at: d.created_at
        })));
    } catch (err) {
        console.error('Documents list error:', err);
        res.json([]);
    }
});

// @route   GET api/documents/:id
// @desc    Get a single document
// @access  Private
router.get('/:id', auth, requireTenant, async (req, res) => {
    try {
        const tenantId = req.user.tenantId || req.user.id;
        const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
        if (!doc) return res.status(404).json({ message: 'Document not found' });
        if (doc.tenantId !== tenantId) return res.status(403).json({ message: 'Forbidden' });
        return res.json({
          id: doc.id,
          tenantId: doc.tenantId,
          title: doc.title,
          name: doc.name || doc.title,
          type: doc.type,
          url: doc.url,
          category: doc.category,
          linked_entity_id: doc.linked_entity_id,
          linked_entity_model: doc.linked_entity_model,
          size: doc.size,
          version: doc.version,
          accountId: doc.accountId,
          quoteId: doc.quoteId,
          contractId: doc.contractId,
          invoiceId: doc.invoiceId,
          orderId: doc.orderId,
          userId: doc.userId,
          uploaded_by: doc.userId || doc.uploaded_by || null,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
          created_at: doc.created_at
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/documents
// @desc    Upload/Create a document info
// @access  Private
router.post('/', auth, requireTenant, upload.single('file'), async (req, res) => {
    try {
        let { name, type, category, size, version, account_id, url } = req.body;
        const tenantId = req.user.tenantId || req.user.id;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(String(tenantId))) {
          return res.status(400).json({ message: 'Invalid tenant' });
        }
        if (req.file) {
          const relUrl = `/uploads/${tenantId}/${req.file.filename}`;
          url = url || relUrl;
          size = size || `${req.file.size} bytes`;
          if (!type) {
            const ext = path.extname(req.file.originalname).replace('.', '').toLowerCase();
            type = ext || 'file';
          }
          if (!name) {
            name = req.file.originalname;
          }
        }
        if (!name) return res.status(400).json({ message: 'Name is required' });
        if (!url) return res.status(400).json({ message: 'URL is required' });

        const doc = await prisma.document.create({
          data: {
            tenantId,
            title: name,
            name,
            type,
            category,
            url,
            size,
            version,
            accountId: account_id || null,
            uploaded_by: req.user.id,
            userId: req.user.id,
          },
        });
        res.json({
          ...doc,
          account_id: doc.accountId || null,
          uploaded_by: doc.uploaded_by || req.user.id,
          name: doc.name || doc.title,
        });
    } catch (err) {
        console.error('Document upload error:', err);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/documents/:id
// @desc    Delete a document
// @access  Private
router.delete('/:id', auth, requireTenant, async (req, res) => {
    try {
        const tenantId = req.user.tenantId || req.user.id;
        const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
        if (!doc) return res.status(404).json({ message: 'Document not found' });
        if (doc.tenantId !== tenantId) return res.status(403).json({ message: 'Forbidden' });

        if (req.user.role === 'customer') {
             const contact = await prisma.contact.findFirst({ where: { email: req.user.email, tenantId } });
             if (!contact) return res.status(403).json({ message: 'Forbidden' });
             const account = await prisma.account.findFirst({ where: { name: contact.company, tenantId } });
             if (!account || doc.accountId !== account.id) return res.status(403).json({ message: 'Forbidden' });
        }

        // Try to remove file from disk if stored locally
        try {
          if (doc.url && doc.url.startsWith('/uploads/')) {
            const root = path.join(__dirname, '..');
            const fp = path.join(root, doc.url.replace(/^\//, ''));
            if (fs.existsSync(fp)) {
              fs.unlinkSync(fp);
            }
          }
        } catch {}
        await prisma.document.delete({ where: { id: req.params.id } });
        res.json({ message: 'Document removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
