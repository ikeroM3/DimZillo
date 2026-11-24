import { Schema, models, model } from 'mongoose';

const listingSchema = new Schema(
  {
    building: { type: Schema.Types.ObjectId, ref: 'Building', required: true, index: true },
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 }, // ₴ на місяць
    rooms: { type: Number, required: true, min: 1 },
    area: { type: Number, required: true, min: 1 }, // м²
    floor: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
  },
  { timestamps: true }
);

const Listing = models.Listing || model('Listing', listingSchema);

export default Listing;
