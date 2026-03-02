module.exports = function requireRole(allowed) {
  const set = new Set((allowed || []).map(r => String(r).toLowerCase()));
  return function(req, res, next) {
    const role = String(req?.user?.role || '').toLowerCase();
    if (!role || !set.has(role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}
