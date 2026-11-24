'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import css from './Header.module.css';

const links = [
  { href: '/home', label: 'Карта' },
  { href: '/analytics', label: 'Аналітика' },
];

export default function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav className={css.nav} aria-label="Основна навігація">
      {links.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={`${css.navLink} ${active ? css.navActive : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
