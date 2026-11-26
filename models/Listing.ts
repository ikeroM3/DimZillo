import { Schema, models, model } from 'mongoose';

const listingSchema = new Schema(
  {
    building: { type: Schema.Types.ObjectId, ref: 'Building', required: true, index: true },
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 }, // ₴ (оренда: за місяць)
    deal: { type: String, enum: ['rent', 'sale'], default: 'rent' },
    rooms: { type: Number, required: true, min: 1 },
    area: { type: Number, required: true, min: 1 },
    floor: { type: Number, required: true, min: 0 },
    photos: { type: [String], default: [] },
    source: { type: String },
    externalId: { type: String },
    url: { type: String },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
  },
  { timestamps: true }
);

listingSchema.index({ source: 1, externalId: 1 }, { unique: true, sparse: true });

const Listing = models.Listing || model('Listing', listingSchema);
export default Listing;
