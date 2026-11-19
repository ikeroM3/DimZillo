import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const { userName, email, password } = await req.json();

    if (!userName || !email || !password) {
      return NextResponse.json({ error: 'Заповніть усі поля' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Пароль мінімум 8 символів' }, { status: 400 });
    }

    await connectDB();

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return NextResponse.json({ error: 'Користувач з таким email вже існує' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ userName, email, passwordHash });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const token = await new SignJWT({ userId: user._id.toString() })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret);

    const res = NextResponse.json(
      { id: user._id, email: user.email, userName: user.userName },
      { status: 201 }
    );
    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e) {
    console.error('REGISTER ERROR:', e);
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 });
  }
}
