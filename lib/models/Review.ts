import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    userId: { type: String, default: '' },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: '' },
    comment: { type: String, default: '' },
    verifiedPurchase: { type: Boolean, default: false },
    helpfulCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform: (_: any, ret: any) => {
        ret.id = ret._id.toString();
        ret.createdAt = ret.createdAt?.toISOString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Review =
  mongoose.models.Review || mongoose.model('Review', ReviewSchema);
