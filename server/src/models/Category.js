import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: 60,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: 500,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

categorySchema.index({ order: 1, name: 1 });

export const Category = mongoose.model('Category', categorySchema);
