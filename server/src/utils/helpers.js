import { STAGE_PROBABILITY, SOURCE_SCORES } from './constants.js';

/**
 * Generate unique lead number
 */
export const generateLeadNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LEAD-${timestamp}-${random}`;
};

/**
 * Generate unique client number
 */
export const generateClientNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CLT-${timestamp}-${random}`;
};

/**
 * Calculate lead score (0-100)
 */
export const calculateLeadScore = (lead, activities = []) => {
  let score = 0;

  // Company size/value (30 points max)
  if (lead.estimatedValue >= 1000000) score += 30;
  else if (lead.estimatedValue >= 500000) score += 20;
  else if (lead.estimatedValue >= 100000) score += 10;
  else if (lead.estimatedValue >= 50000) score += 5;

  // Engagement level based on activities (30 points max)
  const activityCount = activities.length;
  if (activityCount >= 10) score += 30;
  else if (activityCount >= 5) score += 20;
  else if (activityCount >= 2) score += 10;
  else if (activityCount >= 1) score += 5;

  // Response time (20 points max) - based on last activity
  if (activities.length > 0) {
    const lastActivity = activities[0];
    const hoursSinceLastActivity = (Date.now() - new Date(lastActivity.createdAt)) / (1000 * 60 * 60);
    
    if (hoursSinceLastActivity < 24) score += 20;
    else if (hoursSinceLastActivity < 72) score += 10;
    else if (hoursSinceLastActivity < 168) score += 5;
  }

  // Source quality (20 points max)
  score += SOURCE_SCORES[lead.source] || 0;

  return Math.min(score, 100);
};

/**
 * Calculate win probability based on stage and other factors
 */
export const calculateWinProbability = (lead, daysInStage = 0) => {
  let probability = STAGE_PROBABILITY[lead.status] || 0;

  // Adjust based on lead score
  const scoreAdjustment = (lead.score - 50) / 10;
  probability += scoreAdjustment;

  // Adjust based on time in stage (negative impact if too long)
  if (daysInStage > 60) probability -= 20;
  else if (daysInStage > 30) probability -= 10;

  // Priority adjustment
  if (lead.priority === 'high') probability += 5;
  else if (lead.priority === 'low') probability -= 5;

  return Math.max(0, Math.min(100, Math.round(probability)));
};

/**
 * Calculate days between two dates
 */
export const calculateDaysBetween = (date1, date2 = new Date()) => {
  const diffTime = Math.abs(date2 - date1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Sanitize user data (remove sensitive fields)
 */
export const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;
  delete userObj.refreshToken;
  return userObj;
};

/**
 * Build MongoDB query filters
 */
export const buildQueryFilters = (filters) => {
  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.source) query.source = filters.source;
  if (filters.assignedTo) query.assignedTo = filters.assignedTo;
  
  if (filters.search) {
    query.$or = [
      { companyName: { $regex: filters.search, $options: 'i' } },
      { contactPerson: { $regex: filters.search, $options: 'i' } },
      { email: { $regex: filters.search, $options: 'i' } },
      { phone: { $regex: filters.search, $options: 'i' } }
    ];
  }

  if (filters.dateFrom || filters.dateTo) {
    query.createdAt = {};
    if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
  }

  if (filters.minValue || filters.maxValue) {
    query.estimatedValue = {};
    if (filters.minValue) query.estimatedValue.$gte = Number(filters.minValue);
    if (filters.maxValue) query.estimatedValue.$lte = Number(filters.maxValue);
  }

  return query;
};

/**
 * Pagination helper
 */
export const getPaginationParams = (page = 1, limit = 10) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    skip
  };
};

/**
 * Build pagination response
 */
export const buildPaginationResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};
