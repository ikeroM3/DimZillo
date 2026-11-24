'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, LogOut } from 'lucide-react';

import { logout } from '@/lib/api';
import css from './Header.module.css';

type UserMenuProps = { name: string; email: string };

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function UserMenu({ name, email }: UserMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className={css.user} ref={ref}>
      <button
        type="button"
        className={css.userBtn}
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className={css.avatar}>{getInitials(name)}</span>
        <span className={css.userName}>{name.split(' ')[0]}</span>
        <ChevronDown size={14} className={`${css.chevron} ${open ? css.chevronOpen : ''}`} />
      </button>

      {open && (
        <div className={css.menu} role="menu">
          <div className={css.menuHead}>
            <span className={css.menuName}>{name}</span>
            <span className={css.menuEmail}>{email}</span>
          </div>
          <button type="button" role="menuitem" className={css.menuItem} onClick={handleLogout}>
            <LogOut size={15} />
            Вийти
          </button>
        </div>
      )}
    </div>
  );
}
