import jwt from 'jsonwebtoken';

export const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });

export const requireAuth = (roles = ['admin', 'staff']) => (req, res, next) => {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Not permitted' });
  next();
};
