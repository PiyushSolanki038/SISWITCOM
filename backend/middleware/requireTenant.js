const { prisma } = require('../prismaClient');

module.exports = async function requireTenant(req, res, next) {
  try {
    const u = req.user || {};
    if (!u.id) return res.status(401).json({ message: 'Unauthorized' });
    if (!u.tenantId) {
      try {
        const dbUser = await prisma.user.findUnique({ where: { id: u.id } });
        req.user.tenantId = dbUser?.tenantId || u.id;
      } catch {}
    }
    if (!req.user.tenantId) {
      return res.status(403).json({ message: 'Missing tenant context' });
    }
    return next();
  } catch {
    return res.status(403).json({ message: 'Missing tenant context' });
  }
}
