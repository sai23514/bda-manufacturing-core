import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ERROR_MESSAGES } from '../utils/constants.js';

/**
 * Protect routes - Verify JWT token
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id).select('-password -refreshToken');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: ERROR_MESSAGES.USER_NOT_FOUND
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Your account has been deactivated'
        });
      }

      // Attach user to request
      req.user = user;
      next();

    } catch (error) {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_TOKEN
      });
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR
    });
  }
};

/**
 * Generate JWT Access Token
 */
export const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m'
  });
};

/**
 * Generate JWT Refresh Token
 */
export const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
  });
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error(ERROR_MESSAGES.INVALID_TOKEN);
  }
};
