const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'biodiversity_secret_key_2026_dbms';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please login.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid token. Please log in again.' });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role) && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Your role (${req.user.role}) is not authorized to perform this operation. Allowed roles: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  authorizeRoles,
  JWT_SECRET,
};
