const express = require('express');
const router = express.Router();
const { prisma } = require('../prismaClient');
const auth = require('../middleware/auth');
const requireTenant = require('../middleware/requireTenant');

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

router.post('/check-in', auth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user.id;
    const userId = req.user.id;
    const today = startOfDay(new Date());
    const existing = await prisma.attendance.findFirst({
      where: { userId, date: today }
    });
    if (existing) return res.status(400).json({ message: 'Already checked in today' });
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || null;
    const deviceInfo = req.headers['x-device-info'] || null;
    const rec = await prisma.attendance.create({
      data: {
        tenantId,
        userId,
        date: today,
        checkInTime: new Date(),
        ip: typeof ip === 'string' ? ip : null,
        userAgent: typeof userAgent === 'string' ? userAgent : null,
        deviceInfo: typeof deviceInfo === 'string' ? deviceInfo : null
      }
    });
    res.json(rec);
  } catch (err) {
    res.status(500).json({ message: 'Server error check-in' });
  }
});

router.get('/my', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const rows = await prisma.attendance.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });
    res.json(rows);
  } catch {
    res.status(500).json({ message: 'Server error get my attendance' });
  }
});

router.get('/tenant', auth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user.id;
    const rows = await prisma.attendance.findMany({
      where: { tenantId },
      orderBy: { date: 'desc' },
      include: { user: true }
    });
    res.json(rows);
  } catch {
    res.status(500).json({ message: 'Server error get tenant attendance' });
  }
});

router.get('/admin/all', auth, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.user.id;
    if (!['admin', 'owner'].includes(String(req.user.role || '').toLowerCase())) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const rows = await prisma.attendance.findMany({ where: { tenantId }, orderBy: { date: 'desc' }, include: { user: true } });
    res.json(rows);
  } catch {
    res.status(500).json({ message: 'Server error get all attendance' });
  }
});

module.exports = router;
