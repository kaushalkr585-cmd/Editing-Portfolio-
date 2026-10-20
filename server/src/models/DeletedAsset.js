import mongoose from 'mongoose';

const deletedAssetSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      default: '',
    },
    deletedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const DeletedAsset = mongoose.model('DeletedAsset', deletedAssetSchema);
