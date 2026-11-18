import css from './AuthTitle.module.css';

const stats = [
  { value: '248', label: 'оголошень' },
  { value: '3D', label: 'будівлі' },
  { value: '24/7', label: 'оновлення' },
];
export default function AuthTitle() {
  return (
    <section className={css.authTitle}>
      <div className={css.authTitleWrapper}>
        <div className={css.authTitleContent}>
          <svg
            width="8"
            height="8"
            viewBox="0 0 8 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="4" cy="4" r="4" fill="#3DE0FF" />
          </svg>
          Карта оренди нового покоління
        </div>
      </div>
      <div className={css.authTitleWrapperText}>
        <h1 className={css.titleMain}>Знайди дім</h1>
        <span className={css.titleMainSpan}>у 3D-місті</span>
      </div>
      <p className={css.authTitleText}>
        Клікай по будинках, дивись квартири й порівнюй ціни на інтерактивній карті з аналітикою
        ринку.
      </p>
      <ul className={css.stats}>
        {stats.map(({ value, label }) => (
          <li key={label} className={css.statCard}>
            <span className={css.statValue}>{value}</span>
            <span className={css.statLabel}>{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
