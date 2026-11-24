import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Building from '@/models/Building';
import Listing from '@/models/Listing';

// ТІЛЬКИ для розробки: створює будинок у точці кліку + кілька випадкових оголошень
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { lng, lat } = await req.json();
  if (typeof lng !== 'number' || typeof lat !== 'number') {
    return NextResponse.json({ error: 'lng/lat обовʼязкові' }, { status: 400 });
  }

  await connectDB();

  const building = await Building.create({
    address: `Демо-будинок (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    location: { type: 'Point', coordinates: [lng, lat] },
  });

  const count = 2 + Math.floor(Math.random() * 4);
  await Listing.insertMany(
    Array.from({ length: count }, () => {
      const rooms = 1 + Math.floor(Math.random() * 3);
      return {
        building: building._id,
        title: `${rooms}-кімнатна квартира`,
        rooms,
        area: 24 + rooms * 18 + Math.floor(Math.random() * 10),
        floor: 1 + Math.floor(Math.random() * 12),
        price: Math.round((8000 + rooms * 3500 + Math.random() * 5000) / 500) * 500,
      };
    })
  );

  return NextResponse.json({ id: String(building._id) }, { status: 201 });
}
