import Link from 'next/link';
import css from './Header-register.module.css';
export default function HeaderRegister() {
  return (
    <>
      <header className="header-register">
        <main className={css.main}>
          <div className={css.container}>
            <Link className={css.linkLogo} href="/register">
              <div className={css.iconWrapper}>
                <svg className={css.home} width="24" height="24">
                  <use href="/icons/sprite.svg#home" />
                </svg>
              </div>
              <span className={css.text}>DimZillo</span>
            </Link>
          </div>
        </main>
      </header>
    </>
  );
}
