import mongoose from 'mongoose';
import { LEAD_STATUS, LEAD_PRIORITY, LEAD_SOURCES } from '../utils/constants.js';
import { generateLeadNumber } from '../utils/helpers.js';

const leadSchema = new mongoose.Schema({
  leadNumber: {
    type: String,
    unique: true,
    required: true
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters']
  },
  contactPerson: {
    type: String,
    required: [true, 'Contact person is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  alternatePhone: {
    type: String,
    trim: true
  },
  industry: {
    type: String,
    trim: true
  },
  location: {
    city: String,
    state: String,
    country: {
      type: String,
      default: 'India'
    }
  },
  source: {
    type: String,
    enum: Object.values(LEAD_SOURCES),
    required: [true, 'Lead source is required']
  },
  status: {
    type: String,
    enum: Object.values(LEAD_STATUS),
    default: LEAD_STATUS.NEW
  },
  priority: {
    type: String,
    enum: Object.values(LEAD_PRIORITY),
    default: LEAD_PRIORITY.MEDIUM
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  estimatedValue: {
    type: Number,
    default: 0,
    min: 0
  },
  probability: {
    type: Number,
    min: 0,
    max: 100,
    default: 5
  },
  expectedCloseDate: {
    type: Date,
    default: null
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  requirements: {
    type: String,
    maxlength: [2000, 'Requirements cannot exceed 2000 characters']
  },
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  },
  tags: [{
    type: String,
    trim: true
  }],
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  lostReason: {
    type: String,
    default: null
  },
  wonDate: {
    type: Date,
    default: null
  },
  nextFollowUp: {
    type: Date,
    default: null
  },
  statusHistory: [{
    status: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }]
}, {
  timestamps: true
});

// Indexes for faster queries
leadSchema.index({ companyName: 1 });
leadSchema.index({ email: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ score: -1 });
leadSchema.index({ expectedCloseDate: 1 });

// Auto-generate lead number before validation so required validation passes.
leadSchema.pre('validate', function(next) {
  if (!this.leadNumber) {
    this.leadNumber = generateLeadNumber();
  }
  next();
});

// Track status changes
leadSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date()
    });
  }
  next();
});

// Virtual for days since creation
leadSchema.virtual('daysOld').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

leadSchema.set('toJSON', { virtuals: true });
leadSchema.set('toObject', { virtuals: true });

const Lead = mongoose.model('Lead', leadSchema);

export default Lead;
