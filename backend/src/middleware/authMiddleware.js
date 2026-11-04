import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// @desc    Protect routes — requires a valid JWT Bearer token
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized — please sign in' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User account not found — please sign in again' });
    }

    req.user = user;
    return next();
  } catch (error) {
    // jwt.verify throws for expired/invalid tokens
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired — please sign in again' });
    }
    return res.status(401).json({ message: 'Invalid token — please sign in again' });
  }
};

// @desc    Restrict to admin or seller roles
export const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'seller')) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied — Admin or Seller role required' });
};
