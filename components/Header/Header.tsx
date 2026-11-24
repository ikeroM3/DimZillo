import Link from 'next/link';
import { cookies } from 'next/headers';
import { House, Zap, Plus, Bell } from 'lucide-react';

import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

import HeaderNav from './HeaderNav';
import UserMenu from './UserMenu';
import css from './Header.module.css';

type HeaderProps = {
  /** 'minimal' — лише логотип (login/register), 'app' — повний хедер */
  variant?: 'minimal' | 'app';
};

async function getCurrentUser() {
  const token = (await cookies()).get('token')?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload) return null;

  await connectDB();
  const user = await User.findById(payload.userId).select('userName email').lean();
  if (!user) return null;

  return { name: String(user.userName), email: String(user.email) };
}

export default async function Header({ variant = 'app' }: HeaderProps) {
  const logo = (
    <Link className={css.linkLogo} href="/register">
      <div className={css.iconWrapper}>
        <svg className={css.home} width="24" height="24">
          <use href="/icons/sprite.svg#home" />
        </svg>
      </div>
      <span className={css.text}>DimZillo</span>
    </Link>
  );

  if (variant === 'minimal') {
    return (
      <header className={css.wrap}>
        <div className={css.minimal}>{logo}</div>
      </header>
    );
  }

  const user = await getCurrentUser();

  return (
    <header className={css.wrap}>
      <div className={css.bar}>
        {logo}

        <label className={css.search}>
          <Zap size={16} className={css.searchIcon} />
          <input
            type="search"
            className={css.searchInput}
            placeholder="Спитай AI: «2-кімнатна до 15 000 ₴ біля парку»"
            aria-label="Пошук з AI"
          />
        </label>

        <HeaderNav />

        <div className={css.actions}>
          <Link href="/add" className={css.addBtn}>
            <Plus size={16} strokeWidth={2.5} />
            <span>Додати</span>
          </Link>

          <button type="button" className={css.bell} aria-label="Сповіщення">
            <Bell size={17} />
            <span className={css.bellDot} aria-hidden="true" />
          </button>

          {user ? (
            <UserMenu name={user.name} email={user.email} />
          ) : (
            <Link href="/login" className={css.loginLink}>
              Увійти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
