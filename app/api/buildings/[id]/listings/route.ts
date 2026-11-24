import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import Listing from '@/models/Listing';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Некоректний id' }, { status: 400 });
    }

    await connectDB();

    const items = await Listing.find({ building: id, status: 'active' }).sort({ price: 1 }).lean();

    return NextResponse.json(
      items.map(l => ({
        id: String(l._id),
        title: l.title,
        price: l.price,
        rooms: l.rooms,
        area: l.area,
        floor: l.floor,
      }))
    );
  } catch (e) {
    console.error('LISTINGS ERROR:', e);
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 });
  }
}
