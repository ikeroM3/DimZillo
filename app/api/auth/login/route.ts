import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { createToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Заповніть усі поля' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });
    const ok = user && (await bcrypt.compare(password, user.passwordHash));

    // одне й те саме повідомлення, щоб не підказувати, чи існує email
    if (!ok) {
      return NextResponse.json({ error: 'Невірний email або пароль' }, { status: 401 });
    }

    const token = await createToken(user._id.toString());
    const res = NextResponse.json({
      id: user._id,
      email: user.email,
      userName: user.userName,
    });
    setAuthCookie(res, token);
    return res;
  } catch {
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 });
  }
}
