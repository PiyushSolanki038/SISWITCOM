const express = require('express');
const router = express.Router();
const { prisma } = require('../prismaClient');
const auth = require('../middleware/auth');
const requireTenant = require('../middleware/requireTenant');
const jwt = require('jsonwebtoken');

const sseClients = new Map();

const computeNotifications = async (tenantId, role, userId, email) => {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  let notifications = [];
  if (['admin', 'owner', 'employee'].includes(role)) {
    const whereBase = { tenantId, status: { in: ['APPROVED', 'REJECTED'] }, createdAt: { gte: since } };
    const whereEmployee = role === 'employee' ? { ...whereBase, requestedBy: String(userId) } : whereBase;
    const [qa, ca] = await Promise.all([
      prisma.quoteApproval.findMany({ where: whereEmployee, orderBy: { createdAt: 'desc' }, include: { quote: true } }),
      prisma.contractApproval.findMany({ where: whereEmployee, orderBy: { createdAt: 'desc' }, include: { contract: true } }),
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
    try {
      const srs = await prisma.contractSignatureRequest.findMany({
        where: { tenantId, signerEmail: email, createdAt: { gte: since } },
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
  return notifications;
};

router.get('/stream', async (req, res) => {
  try {
    const token = (req.query.token || '').toString();
    if (!token) return res.status(401).end();
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    const u = decoded?.user || decoded || {};
    const tenantId = u.tenantId || u.id;
    const role = String(u.role || '').toLowerCase();
    if (!tenantId) return res.status(401).end();
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    const entry = { res, tenantId, role, userId: u.id, email: u.email };
    if (!sseClients.has(tenantId)) sseClients.set(tenantId, new Set());
    sseClients.get(tenantId).add(entry);
    const send = (event, data) => {
      try {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      } catch {}
    };
    const init = async () => {
      const list = await computeNotifications(tenantId, role, u.id, u.email);
      send('notifications', { notifications: list, unreadCount: list.length });
    };
    init();
    const heartbeat = setInterval(() => {
      try { res.write(': ping\n\n'); } catch {}
    }, 25000);
    const periodic = setInterval(async () => {
      try {
        const list = await computeNotifications(tenantId, role, u.id, u.email);
        send('notifications', { notifications: list, unreadCount: list.length });
      } catch {}
    }, 30000);
    req.on('close', () => {
      clearInterval(heartbeat);
      clearInterval(periodic);
      const set = sseClients.get(tenantId);
      if (set) {
        set.delete(entry);
        if (set.size === 0) sseClients.delete(tenantId);
      }
    });
  } catch {
    res.status(401).end();
  }
});

router.get('/users', auth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user.id;
    const users = await prisma.user.findMany({
      where: { tenantId },
      select: { id: true, firstName: true, lastName: true, email: true, role: true }
    });
    const me = String(req.user.id);
    const list = users
      .filter(u => u.id !== me)
      .map(u => ({
        id: u.id,
        name: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email,
        email: u.email,
        role: String(u.role).toLowerCase()
      }));
    res.json(list);
  } catch {
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

const dmRoomFor = (a, b) => {
  const [x, y] = [String(a), String(b)].sort();
  return `dm:${x}:${y}`;
};

router.get('/messages', auth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user.id;
    const toUserId = (req.query.toUserId || '').toString();
    const baseRoom = (req.query.room || 'general').toString();
    const room = toUserId ? dmRoomFor(req.user.id, toUserId) : baseRoom;
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const items = await prisma.activity.findMany({
      where: { tenantId, type: 'chat', title: room },
      orderBy: { createdAt: 'asc' },
      take: limit
    });
    const users = new Map();
    const result = await Promise.all(items.map(async it => {
      let name = '';
      const uid = it.userId;
      if (uid) {
        if (!users.has(uid)) {
          try {
            const u = await prisma.user.findUnique({ where: { id: uid } });
            users.set(uid, u?.name || u?.firstName || 'User');
          } catch { users.set(uid, 'User'); }
        }
        name = users.get(uid);
      }
      return { id: it.id, room: it.title, text: it.description, senderId: uid, senderName: name, createdAt: it.createdAt };
    }));
    res.json(result);
  } catch {
    res.status(500).json({ message: 'Server error fetching chat messages' });
  }
});

router.post('/messages', auth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user.id;
    const toUserId = (req.body?.toUserId || '').toString();
    const baseRoom = (req.body?.room || 'general').toString();
    const room = toUserId ? dmRoomFor(req.user.id, toUserId) : baseRoom;
    const text = (req.body?.text || '').toString();
    if (!text.trim()) return res.status(400).json({ message: 'Text required' });
    const saved = await prisma.activity.create({
      data: {
        tenantId,
        type: 'chat',
        title: room,
        description: text,
        userId: req.user.id,
        date: new Date(),
        time: new Date().toLocaleTimeString(),
        status: 'completed'
      }
    });
    let senderName = '';
    try {
      const u = await prisma.user.findUnique({ where: { id: req.user.id } });
      senderName = u?.name || u?.firstName || 'User';
    } catch {}
    const payload = { id: saved.id, room, text, senderId: req.user.id, senderName, createdAt: saved.createdAt };
    const set = sseClients.get(tenantId);
    if (set) {
      set.forEach(entry => {
        try {
          entry.res.write(`event: chat\n`);
          entry.res.write(`data: ${JSON.stringify(payload)}\n\n`);
        } catch {}
      });
    }
    res.status(201).json(payload);
  } catch {
    res.status(500).json({ message: 'Server error sending message' });
  }
});

module.exports = router;
