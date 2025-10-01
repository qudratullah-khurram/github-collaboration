const jwt = require('jsonwebtoken');

const authMiddleware=(req, res, next)=> {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 

    next();
  } catch (err) {
    res.status(401).json({ err: 'Invalid token.' });
  }
}

function requireRole(role) { 
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (req.user.role !== role) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}

module.exports = { authMiddleware, requireRole };


