import Lead from '../models/Lead.js';
import Activity from '../models/Activity.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, ROLES, ACTIVITY_TYPES } from '../utils/constants.js';
import { 
  buildQueryFilters, 
  getPaginationParams, 
  buildPaginationResponse,
  calculateLeadScore,
  calculateWinProbability,
  calculateDaysBetween
} from '../utils/helpers.js';
import logger from '../utils/logger.js';

/**
 * @desc    Get all leads
 * @route   GET /api/v1/leads
 * @access  Private
 */
export const getLeads = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query.page, req.query.limit);
    
    // Build query filters
    let queryFilters = buildQueryFilters(req.query);

    // Apply role-based filtering
    const { role, _id: userId, team } = req.user;
    
    if (role === ROLES.BDA) {
      queryFilters.assignedTo = userId;
    } else if (role === ROLES.TEAM_LEAD && team) {
      // Get all users in the team
      const User = (await import('../models/User.js')).default;
      const teamMembers = await User.find({ team }).select('_id');
      const memberIds = teamMembers.map(m => m._id);
      queryFilters.assignedTo = { $in: memberIds };
    }

    // Execute query with pagination
    const leads = await Lead.find(queryFilters)
      .populate('assignedTo', 'firstName lastName email avatar')
      .populate('assignedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Lead.countDocuments(queryFilters);

    logger.info(`Fetched ${leads.length} leads for user ${req.user.email}`);

    res.status(200).json({
      success: true,
      ...buildPaginationResponse(leads, total, page, limit)
    });

  } catch (error) {
    logger.error(`Get leads error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
};

/**
 * @desc    Get single lead
 * @route   GET /api/v1/leads/:id
 * @access  Private
 */
export const getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email phone avatar')
      .populate('assignedBy', 'firstName lastName');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.LEAD_NOT_FOUND
      });
    }

    // Get activities for this lead
    const activities = await Activity.find({ leadId: lead._id })
      .populate('userId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: { 
        lead,
        activities 
      }
    });

  } catch (error) {
    logger.error(`Get lead error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
};

/**
 * @desc    Create new lead
 * @route   POST /api/v1/leads
 * @access  Private
 */
export const createLead = async (req, res) => {
  try {
    const leadData = {
      ...req.body,
      assignedBy: req.user._id
    };

    // Auto-assign to current user if not specified
    if (!leadData.assignedTo) {
      leadData.assignedTo = req.user._id;
    }

    const lead = await Lead.create(leadData);

    // Calculate initial score
    const activities = [];
    lead.score = calculateLeadScore(lead, activities);
    lead.probability = calculateWinProbability(lead, 0);
    await lead.save();

    // Create activity log
    await Activity.create({
      type: ACTIVITY_TYPES.STATUS_CHANGE,
      subject: 'Lead Created',
      description: `Lead ${lead.leadNumber} was created`,
      leadId: lead._id,
      userId: req.user._id,
      status: 'completed'
    });

    logger.info(`Lead created: ${lead.leadNumber} by ${req.user.email}`);

    const populatedLead = await Lead.findById(lead._id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('assignedBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.LEAD_CREATED,
      data: { lead: populatedLead }
    });

  } catch (error) {
    logger.error(`Create lead error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
};

/**
 * @desc    Update lead
 * @route   PUT /api/v1/leads/:id
 * @access  Private
 */
export const updateLead = async (req, res) => {
  try {
    let lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.LEAD_NOT_FOUND
      });
    }

    const oldStatus = lead.status;

    // Update lead
    lead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Recalculate score and probability
    const activities = await Activity.find({ leadId: lead._id });
    lead.score = calculateLeadScore(lead, activities);

    const daysInStage = calculateDaysBetween(
      lead.statusHistory.length > 0
        ? lead.statusHistory[lead.statusHistory.length - 1].changedAt
        : lead.createdAt
    );
    lead.probability = calculateWinProbability(lead, daysInStage);
    await lead.save();

    // Log status change if status was updated
    if (req.body.status && oldStatus !== req.body.status) {
      await Activity.create({
        type: ACTIVITY_TYPES.STATUS_CHANGE,
        subject: `Status changed to ${req.body.status}`,
        description: `Lead status changed from ${oldStatus} to ${req.body.status}`,
        leadId: lead._id,
        userId: req.user._id,
        status: 'completed'
      });
    }

    logger.info(`Lead updated: ${lead.leadNumber} by ${req.user.email}`);

    const populatedLead = await Lead.findById(lead._id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('assignedBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.LEAD_UPDATED,
      data: { lead: populatedLead }
    });

  } catch (error) {
    logger.error(`Update lead error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
};

/**
 * @desc    Delete lead
 * @route   DELETE /api/v1/leads/:id
 * @access  Private
 */
export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.LEAD_NOT_FOUND
      });
    }

    await lead.deleteOne();

    // Delete associated activities
    await Activity.deleteMany({ leadId: lead._id });

    logger.info(`Lead deleted: ${lead.leadNumber} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: SUCCESS_MESSAGES.LEAD_DELETED
    });

  } catch (error) {
    logger.error(`Delete lead error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
};

/**
 * @desc    Update lead status
 * @route   PATCH /api/v1/leads/:id/status
 * @access  Private
 */
export const updateLeadStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.LEAD_NOT_FOUND
      });
    }

    const oldStatus = lead.status;
    lead.status = status;

    // Update won/lost dates
    if (status === 'won') {
      lead.wonDate = new Date();
    }

    await lead.save();

    // Create activity
    await Activity.create({
      type: ACTIVITY_TYPES.STATUS_CHANGE,
      subject: `Status changed to ${status}`,
      description: notes || `Lead moved from ${oldStatus} to ${status}`,
      leadId: lead._id,
      userId: req.user._id,
      status: 'completed'
    });

    logger.info(`Lead status updated: ${lead.leadNumber} to ${status}`);

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: { lead }
    });

  } catch (error) {
    logger.error(`Update lead status error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
};

/**
 * @desc    Assign lead to BDA
 * @route   PATCH /api/v1/leads/:id/assign
 * @access  Private
 */
export const assignLead = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.LEAD_NOT_FOUND
      });
    }

    const User = (await import('../models/User.js')).default;
    const newAssignee = await User.findById(assignedTo);
    if (!newAssignee) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND
      });
    }

    lead.assignedTo = assignedTo;
    lead.assignedBy = req.user._id;
    await lead.save();

    // Create activity
    await Activity.create({
      type: ACTIVITY_TYPES.NOTE,
      subject: 'Lead Reassigned',
      description: `Lead assigned to ${newAssignee.firstName} ${newAssignee.lastName}`,
      leadId: lead._id,
      userId: req.user._id,
      status: 'completed'
    });

    logger.info(`Lead assigned: ${lead.leadNumber} to ${newAssignee.email}`);

    const populatedLead = await Lead.findById(lead._id)
      .populate('assignedTo', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Lead assigned successfully',
      data: { lead: populatedLead }
    });

  } catch (error) {
    logger.error(`Assign lead error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
};

/**
 * @desc    Get lead statistics
 * @route   GET /api/v1/leads/stats
 * @access  Private
 */
export const getLeadStats = async (req, res) => {
  try {
    // Build query based on role
    let matchQuery = {};
    const { role, _id: userId, team } = req.user;

    if (role === ROLES.BDA) {
      matchQuery.assignedTo = userId;
    } else if (role === ROLES.TEAM_LEAD && team) {
      const User = (await import('../models/User.js')).default;
      const teamMembers = await User.find({ team }).select('_id');
      const memberIds = teamMembers.map(m => m._id);
      matchQuery.assignedTo = { $in: memberIds };
    }

    // Get statistics
    const stats = await Lead.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$estimatedValue' }
        }
      }
    ]);

    const totalLeads = await Lead.countDocuments(matchQuery);
    const totalValue = await Lead.aggregate([
      { $match: matchQuery },
      { $group: { _id: null, total: { $sum: '$estimatedValue' } } }
    ]);

    const wonLeads = await Lead.countDocuments({ ...matchQuery, status: 'won' });
    const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      data: {
        stats,
        summary: {
          totalLeads,
          totalValue: totalValue[0]?.total || 0,
          wonLeads,
          conversionRate: parseFloat(conversionRate)
        }
      }
    });

  } catch (error) {
    logger.error(`Get lead stats error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
};
