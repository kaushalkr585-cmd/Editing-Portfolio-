import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    fullDescription: {
      type: String,
      required: true,
    },
    deliverables: [{ type: String }],
    keySkills: [{ type: String }],
    pricingEstimate: {
      type: String,
      default: 'Request a Quote',
    },
    turnaround: {
      type: String,
      default: '2 - 4 business days',
    },
    iconName: {
      type: String,
      default: 'Film',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Service = mongoose.model('Service', serviceSchema);
