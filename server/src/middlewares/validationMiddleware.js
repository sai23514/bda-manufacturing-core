import { body, param, query, validationResult } from 'express-validator';
import {
  ROLES,
  LEAD_STATUS,
  LEAD_PRIORITY,
  LEAD_SOURCES,
  ACTIVITY_TYPES,
  ACTIVITY_STATUS
} from '../utils/constants.js';

/**
 * Validation result handler
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * User Registration Validation
 */
export const registerValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(Object.values(ROLES)).withMessage('Invalid role'),
  body('phone').optional({ values: 'falsy' }).matches(/^[0-9]{10}$/).withMessage('Phone must be 10 digits')
];

/**
 * Login Validation
 */
export const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

/**
 * Lead Creation Validation
 */
export const createLeadValidation = [
  body('companyName').trim().notEmpty().withMessage('Company name is required'),
  body('contactPerson').trim().notEmpty().withMessage('Contact person is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('source').isIn(Object.values(LEAD_SOURCES)).withMessage('Invalid lead source'),
  body('status').optional().isIn(Object.values(LEAD_STATUS)).withMessage('Invalid status'),
  body('priority').optional().isIn(Object.values(LEAD_PRIORITY)).withMessage('Invalid priority'),
  body('estimatedValue').optional({ values: 'falsy' }).isNumeric().withMessage('Estimated value must be a number'),
  body('assignedTo').optional({ values: 'falsy' }).isMongoId().withMessage('Invalid user ID')
];

/**
 * Lead Update Validation
 */
export const updateLeadValidation = [
  param('id').isMongoId().withMessage('Invalid lead ID'),
  body('companyName').optional().trim().notEmpty().withMessage('Company name cannot be empty'),
  body('contactPerson').optional().trim().notEmpty().withMessage('Contact person cannot be empty'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
  body('source').optional().isIn(Object.values(LEAD_SOURCES)).withMessage('Invalid lead source'),
  body('status').optional().isIn(Object.values(LEAD_STATUS)).withMessage('Invalid status'),
  body('priority').optional().isIn(Object.values(LEAD_PRIORITY)).withMessage('Invalid priority'),
  body('estimatedValue').optional({ values: 'falsy' }).isNumeric().withMessage('Estimated value must be a number'),
  body('assignedTo').optional({ values: 'falsy' }).isMongoId().withMessage('Invalid user ID'),
  body('expectedCloseDate').optional({ values: 'falsy' }).isISO8601().withMessage('Invalid date format'),
  body('requirements').optional({ values: 'falsy' }).isLength({ max: 2000 }).withMessage('Requirements cannot exceed 2000 characters'),
  body('notes').optional({ values: 'falsy' }).isLength({ max: 2000 }).withMessage('Notes cannot exceed 2000 characters')
];

/**
 * Lead Status Update Validation
 */
export const updateLeadStatusValidation = [
  body('status').isIn(Object.values(LEAD_STATUS)).withMessage('Invalid status'),
  body('notes').optional({ values: 'falsy' }).isLength({ max: 2000 }).withMessage('Notes cannot exceed 2000 characters')
];

/**
 * Lead Assignment Validation
 */
export const assignLeadValidation = [
  body('assignedTo').isMongoId().withMessage('Invalid user ID')
];

/**
 * ID Param Validation
 */
export const idValidation = [
  param('id').isMongoId().withMessage('Invalid ID format')
];

/**
 * Pagination Validation
 */
export const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

/**
 * Team Creation Validation
 */
export const createTeamValidation = [
  body('name').trim().notEmpty().withMessage('Team name is required'),
  body('teamLead').isMongoId().withMessage('Invalid team lead ID'),
  body('members').optional().isArray().withMessage('Members must be an array'),
  body('members.*').optional().isMongoId().withMessage('Invalid member ID')
];

/**
 * Activity Creation Validation
 */
export const createActivityValidation = [
  body('type').isIn(Object.values(ACTIVITY_TYPES)).withMessage('Invalid activity type'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('description').optional({ values: 'falsy' }).isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('status').optional({ values: 'falsy' }).isIn(Object.values(ACTIVITY_STATUS)).withMessage('Invalid activity status'),
  body('priority').optional({ values: 'falsy' }).isIn(Object.values(LEAD_PRIORITY)).withMessage('Invalid priority'),
  body('dueDate').optional({ values: 'falsy' }).isISO8601().withMessage('Invalid date format')
];

/**
 * Change Password Validation
 */
export const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
];
