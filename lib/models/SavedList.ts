import mongoose from 'mongoose';

const SavedListItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    productName: { type: String, default: '' },
    slug: { type: String, default: '' },
    image: { type: String, default: '' },
    unit: { type: String, default: 'piece' },
    qty: { type: Number, default: 1, min: 1 },
    price: { type: Number, default: 0 },
  },
  { _id: false }
);

const SavedListSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, maxlength: 60 },
    items: { type: [SavedListItemSchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform: (_: any, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const SavedList =
  mongoose.models.SavedList || mongoose.model('SavedList', SavedListSchema);
