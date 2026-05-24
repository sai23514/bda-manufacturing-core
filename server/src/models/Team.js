import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Team name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  teamLead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  targets: {
    monthly: {
      type: Number,
      default: 0
    },
    quarterly: {
      type: Number,
      default: 0
    },
    yearly: {
      type: Number,
      default: 0
    }
  },
  region: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
teamSchema.index({ teamLead: 1 });
teamSchema.index({ isActive: 1 });

const Team = mongoose.model('Team', teamSchema);

export default Team;
