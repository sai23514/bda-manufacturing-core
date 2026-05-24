import mongoose from 'mongoose';
import { ACTIVITY_TYPES, ACTIVITY_STATUS, LEAD_PRIORITY } from '../utils/constants.js';

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: Object.values(ACTIVITY_TYPES),
    required: [true, 'Activity type is required']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: Object.values(ACTIVITY_STATUS),
    default: ACTIVITY_STATUS.PENDING
  },
  priority: {
    type: String,
    enum: Object.values(LEAD_PRIORITY),
    default: LEAD_PRIORITY.MEDIUM
  },
  dueDate: {
    type: Date,
    default: null
  },
  completedDate: {
    type: Date,
    default: null
  },
  duration: {
    type: Number,
    default: 0,
    min: 0
  },
  outcome: {
    type: String,
    maxlength: [1000, 'Outcome cannot exceed 1000 characters']
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes
activitySchema.index({ leadId: 1, createdAt: -1 });
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ type: 1 });
activitySchema.index({ status: 1 });
activitySchema.index({ dueDate: 1 });

// Auto-set completed date when status changes to completed
activitySchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === ACTIVITY_STATUS.COMPLETED && !this.completedDate) {
    this.completedDate = new Date();
  }
  next();
});

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
