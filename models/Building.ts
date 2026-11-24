import { Schema, models, model } from 'mongoose';

const buildingSchema = new Schema(
  {
    address: { type: String, required: true, trim: true },
    // точка всередині контуру будинку (lng, lat)
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
  },
  { timestamps: true }
);

buildingSchema.index({ location: '2dsphere' });

const Building = models.Building || model('Building', buildingSchema);

export default Building;
