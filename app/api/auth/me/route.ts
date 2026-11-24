import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const payload = token ? await verifyToken(token) : null;

  if (!payload) {
    return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 });
  }

  await connectDB();
  const user = await User.findById(payload.userId).select('-passwordHash');
  if (!user) {
    return NextResponse.json({ error: 'Користувача не знайдено' }, { status: 404 });
  }

  return NextResponse.json(user);
}
