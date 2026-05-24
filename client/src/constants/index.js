// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// User Roles
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  MANAGER: 'manager',
  TEAM_LEAD: 'team_lead',
  BDA: 'bda',
  VIEWER: 'viewer'
};

// Lead Status
export const LEAD_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  PROPOSAL: 'proposal',
  NEGOTIATION: 'negotiation',
  WON: 'won',
  LOST: 'lost',
  NURTURING: 'nurturing'
};

// Lead Status Labels
export const LEAD_STATUS_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
  nurturing: 'Nurturing'
};

// Lead Status Colors
export const LEAD_STATUS_COLORS = {
  new: '#2196F3',
  contacted: '#FF9800',
  qualified: '#9C27B0',
  proposal: '#00BCD4',
  negotiation: '#FFC107',
  won: '#4CAF50',
  lost: '#F44336',
  nurturing: '#607D8B'
};

// Lead Priority
export const LEAD_PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

// Lead Priority Colors
export const PRIORITY_COLORS = {
  high: '#F44336',
  medium: '#FF9800',
  low: '#4CAF50'
};

// Lead Sources
export const LEAD_SOURCES = [
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'email_campaign', label: 'Email Campaign' },
  { value: 'trade_show', label: 'Trade Show' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'other', label: 'Other' }
];

// Activity Types
export const ACTIVITY_TYPES = {
  CALL: 'call',
  EMAIL: 'email',
  MEETING: 'meeting',
  NOTE: 'note',
  TASK: 'task',
  STATUS_CHANGE: 'status_change'
};

// Activity Type Labels
export const ACTIVITY_TYPE_LABELS = {
  call: 'Phone Call',
  email: 'Email',
  meeting: 'Meeting',
  note: 'Note',
  task: 'Task',
  status_change: 'Status Change'
};

// Activity Status
export const ACTIVITY_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  ROWS_PER_PAGE_OPTIONS: [10, 25, 50, 100]
};

// Date Formats
export const DATE_FORMAT = 'MMM dd, yyyy';
export const DATE_TIME_FORMAT = 'MMM dd, yyyy HH:mm';

// Chart Colors
export const CHART_COLORS = [
  '#2196F3',
  '#4CAF50',
  '#FF9800',
  '#F44336',
  '#9C27B0',
  '#00BCD4',
  '#FFC107',
  '#607D8B'
];
