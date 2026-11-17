import css from './AuthTitle.module.css';
export default function AuthTitle() {
  return (
    <section className={css.authTitle}>
      <div className="container">
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
        <h1 className={css.titleMain}>Знайди дім</h1>
        <span className={css.titleMainSpan}>у 3D-місті</span>
        <p className={css.authTitleText}>
          Створіть свій акаунт, щоб отримати доступ до всіх функцій DimZillo.
        </p>
      </div>
    </section>
  );
}
