import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../middlewares/authMiddleware.js';
import { sanitizeUser } from '../utils/helpers.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants.js';
import logger from '../utils/logger.js';

/**
 * @desc    Register new user
 * @route   POST /api/v1/auth/register
 * @access  Public (or Admin only for production)
 */
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, phone, department } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.USER_EXISTS
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      department
    });

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.USER_CREATED,
      data: {
        user: sanitizeUser(user),
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    logger.error(`Register error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_CREDENTIALS
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    // Validate password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_CREDENTIALS
      });
    }

    // Update last login
    user.lastLogin = new Date();
    
    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    logger.info(`User logged in: ${email}`);

    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
      data: {
        user: sanitizeUser(user),
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public
 */
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(token);

    // Find user
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_TOKEN
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user._id);

    res.status(200).json({
      success: true,
      data: { accessToken }
    });

  } catch (error) {
    logger.error(`Refresh token error: ${error.message}`);
    res.status(401).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_TOKEN
    });
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.refreshToken = null;
    await user.save();

    logger.info(`User logged out: ${user.email}`);

    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.LOGOUT_SUCCESS
    });

  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR
    });
  }
};

/**
 * @desc    Get current user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('team', 'name');

    res.status(200).json({
      success: true,
      data: { user: sanitizeUser(user) }
    });

  } catch (error) {
    logger.error(`Get me error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR
    });
  }
};

/**
 * @desc    Update profile
 * @route   PUT /api/v1/auth/update-profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, department, avatar } = req.body;

    const user = await User.findById(req.user._id);

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (department) user.department = department;
    if (avatar) user.avatar = avatar;

    await user.save();

    logger.info(`Profile updated: ${user.email}`);

    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.USER_UPDATED,
      data: { user: sanitizeUser(user) }
    });

  } catch (error) {
    logger.error(`Update profile error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR
    });
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/v1/auth/change-password
 * @access  Private
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`Password changed: ${user.email}`);

    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS
    });

  } catch (error) {
    logger.error(`Change password error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR
    });
  }
};
