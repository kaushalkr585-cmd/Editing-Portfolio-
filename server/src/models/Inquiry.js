import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    projectType: {
      type: String,
      required: [true, 'Project type is required'],
      trim: true,
    },
    budget: {
      type: String,
      trim: true,
      default: 'Flexible / Not specified',
    },
    deadline: {
      type: String,
      trim: true,
      default: 'Flexible',
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      maxlength: 5000,
    },
    referenceLinks: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['new', 'in_review', 'responded', 'archived'],
      default: 'new',
    },
    aiBrief: {
      type: Object,
      default: null,
    },
  },
  { timestamps: true }
);

export const Inquiry = mongoose.model('Inquiry', inquirySchema);
