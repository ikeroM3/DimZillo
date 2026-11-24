import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Listing from '@/models/Listing';
import '@/models/Building';

// Усі будинки з оголошеннями + діапазон цін
export async function GET() {
  try {
    await connectDB();

    const buildings = await Listing.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$building',
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          count: { $sum: 1 },
        },
      },
      { $lookup: { from: 'buildings', localField: '_id', foreignField: '_id', as: 'b' } },
      { $unwind: '$b' },
      {
        $project: {
          _id: 0,
          id: { $toString: '$_id' },
          address: '$b.address',
          lng: { $arrayElemAt: ['$b.location.coordinates', 0] },
          lat: { $arrayElemAt: ['$b.location.coordinates', 1] },
          minPrice: 1,
          maxPrice: 1,
          count: 1,
        },
      },
    ]);

    return NextResponse.json(buildings);
  } catch (e) {
    console.error('BUILDINGS ERROR:', e);
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 });
  }
}
