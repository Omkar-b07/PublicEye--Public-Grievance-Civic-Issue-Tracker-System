import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-local-dev-key');
      const userEmail = decoded.sub;
      
      const user = await User.findOne({ email: userEmail });
      if (!user) {
        return res.status(401).json({ detail: 'User no longer exists' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ detail: 'Could not validate credentials' });
    }
  } else {
    return res.status(401).json({ detail: 'Not authorized, no token provided' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ detail: 'Admin access required' });
  }
};

export const departmentOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'department' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ detail: 'Department access required' });
  }
};

export const seniorOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'senior_authority' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ detail: 'Senior authority access required' });
  }
};
