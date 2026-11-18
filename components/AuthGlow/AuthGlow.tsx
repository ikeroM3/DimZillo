import css from './AuthGlow.module.css';

export default function AuthGlow() {
  return (
    <div className={css.glows} aria-hidden="true">
      <span className={`${css.glow} ${css.violet}`} />
      <span className={`${css.glow} ${css.orange}`} />
      <span className={`${css.glow} ${css.cyan}`} />
    </div>
  );
}
