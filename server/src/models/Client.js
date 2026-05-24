import mongoose from 'mongoose';
import { CLIENT_STATUS } from '../utils/constants.js';
import { generateClientNumber } from '../utils/helpers.js';

const clientSchema = new mongoose.Schema({
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  clientNumber: {
    type: String,
    unique: true,
    required: true
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
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
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true
  },
  industry: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: {
      type: String,
      default: 'India'
    },
    pincode: String
  },
  gst: {
    type: String,
    trim: true,
    uppercase: true
  },
  pan: {
    type: String,
    trim: true,
    uppercase: true
  },
  accountManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalRevenue: {
    type: Number,
    default: 0,
    min: 0
  },
  activeContracts: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: Object.values(CLIENT_STATUS),
    default: CLIENT_STATUS.ACTIVE
  },
  billingInfo: {
    billingAddress: String,
    paymentTerms: String,
    creditLimit: {
      type: Number,
      default: 0
    }
  },
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  }
}, {
  timestamps: true
});

// Indexes
clientSchema.index({ companyName: 1 });
clientSchema.index({ email: 1 });
clientSchema.index({ accountManager: 1 });
clientSchema.index({ status: 1 });

// Auto-generate client number before validation so required validation passes.
clientSchema.pre('validate', function(next) {
  if (!this.clientNumber) {
    this.clientNumber = generateClientNumber();
  }
  next();
});

const Client = mongoose.model('Client', clientSchema);

export default Client;
