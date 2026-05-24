import { ROLES, ERROR_MESSAGES } from '../utils/constants.js';

/**
 * Role-Based Access Control Middleware
 * @param  {...string} roles - Allowed roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.PERMISSION_DENIED
      });
    }

    next();
  };
};

/**
 * Check if user can access resource (own resources or team resources for leads)
 */
export const canAccessLead = async (req, res, next) => {
  try {
    const { role, _id: userId, team } = req.user;

    // Super admin and managers can access all
    if (role === ROLES.SUPER_ADMIN || role === ROLES.MANAGER) {
      return next();
    }

    // Get lead from request params
    const leadId = req.params.id;
    
    if (!leadId) {
      return next();
    }

    const Lead = (await import('../models/Lead.js')).default;
    const lead = await Lead.findById(leadId);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Team leads can access their team's leads
    if (role === ROLES.TEAM_LEAD) {
      const assignedUser = await (await import('../models/User.js')).default.findById(lead.assignedTo);
      if (assignedUser && assignedUser.team && assignedUser.team.toString() === team.toString()) {
        return next();
      }
    }

    // BDAs can only access their own leads
    if (role === ROLES.BDA && lead.assignedTo.toString() === userId.toString()) {
      return next();
    }

    // Viewers can only read
    if (role === ROLES.VIEWER && req.method === 'GET') {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: ERROR_MESSAGES.PERMISSION_DENIED
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR
    });
  }
};

/**
 * Check if user can modify resource
 */
export const canModify = (req, res, next) => {
  const { role } = req.user;

  if (role === ROLES.VIEWER) {
    return res.status(403).json({
      success: false,
      message: 'Viewers do not have permission to modify resources'
    });
  }

  next();
};
