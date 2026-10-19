import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: [true, 'Project category is required'],
      trim: true,
    },
    categoryId: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    tags: [{ type: String, trim: true }],
    cloudinaryPublicId: {
      type: String,
      trim: true,
      default: '',
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL or Cloudinary ID is required'],
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      default: '0:30',
      trim: true,
    },
    aspectRatio: {
      type: String,
      enum: ['16:9', '9:16', '1:1', '4:5', '21:9'],
      default: '16:9',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    published: {
      type: Boolean,
      default: true,
    },
    client: {
      type: String,
      default: 'Client Project',
      trim: true,
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

projectSchema.index({ category: 1, featured: -1, order: 1 });
projectSchema.index({ title: 'text', description: 'text', tags: 'text' });

export const Project = mongoose.model('Project', projectSchema);
