const jwt = require('jsonwebtoken');
const sessionBlocklist = require('../utils/sessionBlocklist');
const { prisma } = require('../prismaClient');

module.exports = async function(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const token = bearer || req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = decoded.user || {};
    if (req.user?.id && sessionBlocklist.has(req.user.id)) {
      return res.status(401).json({ msg: 'User session invalidated' });
    }
    const r = req.user?.role;
    if (r) {
      req.user.role = String(r).toLowerCase();
    } else if (req.user?.id) {
      try {
        const u = await prisma.user.findUnique({ where: { id: req.user.id } });
        const map = { ADMIN: 'admin', OWNER: 'owner', EMPLOYEE: 'employee', CUSTOMER: 'customer' };
        if (u?.role && map[u.role]) {
          req.user.role = map[u.role];
        }
      } catch {}
    }
    if (req.user?.id && !req.user?.tenantId) {
      try {
        const u = await prisma.user.findUnique({ where: { id: req.user.id } });
        req.user.tenantId = u?.tenantId || req.user.id;
      } catch {
        req.user.tenantId = req.user.id;
      }
    }
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
