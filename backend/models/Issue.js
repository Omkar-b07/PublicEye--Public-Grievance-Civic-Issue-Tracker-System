import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const issueSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4(),
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    default: null,
  },
  image_url: {
    type: String,
    default: null,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'],
    default: 'PENDING',
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'MEDIUM',
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  is_rejected: {
    type: Boolean,
    default: false,
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  feedback_rating: {
    type: Number,
    default: null,
  },
  feedback_text: {
    type: String,
    default: null,
  },
  is_false_resolution: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  resolved_at: {
    type: Date,
    default: null,
  },
  escalated_at: {
    type: Date,
    default: null,
  },
  created_by: {
    type: String,
    required: true,
    ref: 'User',
  },
  assigned_to: {
    type: String,
    default: null,
    ref: 'User',
  },
}, {
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

issueSchema.virtual('id').get(function() {
  return this._id;
});

const Issue = mongoose.model('Issue', issueSchema);

export default Issue;
