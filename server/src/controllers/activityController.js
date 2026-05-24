import Activity from '../models/Activity.js';
import Lead from '../models/Lead.js';
import { ERROR_MESSAGES } from '../utils/constants.js';
import { getPaginationParams, buildPaginationResponse } from '../utils/helpers.js';
import logger from '../utils/logger.js';

/**
 * @desc    Get activities for a lead
 * @route   GET /api/v1/leads/:id/activities
 * @access  Private
 */
export const getLeadActivities = async (req, res) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query.page, req.query.limit);

    const activities = await Activity.find({ leadId: req.params.id })
      .populate('userId', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Activity.countDocuments({ leadId: req.params.id });

    res.status(200).json({
      success: true,
      ...buildPaginationResponse(activities, total, page, limit)
    });

  } catch (error) {
    logger.error(`Get lead activities error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
};

/**
 * @desc    Create activity for a lead
 * @route   POST /api/v1/leads/:id/activities
 * @access  Private
 */
export const createActivity = async (req, res) => {
  try {
    const leadId = req.params.id;

    // Verify lead exists
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.LEAD_NOT_FOUND
      });
    }

    const activityData = {
      ...req.body,
      leadId,
      userId: req.user._id
    };

    const activity = await Activity.create(activityData);

    // Update lead's next follow-up if this is a future task
    if (activity.dueDate && activity.dueDate > new Date()) {
      if (!lead.nextFollowUp || activity.dueDate < lead.nextFollowUp) {
        lead.nextFollowUp = activity.dueDate;
        await lead.save();
      }
    }

    const populatedActivity = await Activity.findById(activity._id)
      .populate('userId', 'firstName lastName avatar');

    logger.info(`Activity created for lead ${lead.leadNumber} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      data: { activity: populatedActivity }
    });

  } catch (error) {
    logger.error(`Create activity error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
};

/**
 * @desc    Update activity
 * @route   PUT /api/v1/activities/:id
 * @access  Private
 */
export const updateActivity = async (req, res) => {
  try {
    let activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    activity = await Activity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('userId', 'firstName lastName avatar');

    res.status(200).json({
      success: true,
      message: 'Activity updated successfully',
      data: { activity }
    });

  } catch (error) {
    logger.error(`Update activity error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
};

/**
 * @desc    Delete activity
 * @route   DELETE /api/v1/activities/:id
 * @access  Private
 */
export const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    await activity.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Activity deleted successfully'
    });

  } catch (error) {
    logger.error(`Delete activity error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
      error: error.message
    });
  }
};
