import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuidv4(),
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    unique: true,
    index: true,
    sparse: true, // Allow multiple null/undefined values
    trim: true,
  },
  password_hash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['citizen', 'admin', 'department', 'senior_authority'],
    default: 'citizen',
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
      delete ret.password_hash;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password_hash;
      return ret;
    }
  }
});

// For compatibility with FastAPI response structure which has `id`
userSchema.virtual('id').get(function() {
  return this._id;
});

const User = mongoose.model('User', userSchema);

export default User;
