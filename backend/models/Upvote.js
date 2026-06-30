import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const upvoteSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4(),
  },
  user_id: {
    type: String,
    required: true,
    ref: 'User',
  },
  issue_id: {
    type: String,
    required: true,
    ref: 'Issue',
  },
  created_at: {
    type: Date,
    default: Date.now,
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

// A user can only upvote an issue once (compound unique index)
upvoteSchema.index({ user_id: 1, issue_id: 1 }, { unique: true });

upvoteSchema.virtual('id').get(function() {
  return this._id;
});

const Upvote = mongoose.model('Upvote', upvoteSchema);

export default Upvote;
