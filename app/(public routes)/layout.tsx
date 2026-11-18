import css from './AuthLayout.module.css';
import AuthGlow from '../../components/AuthGlow/AuthGlow';
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={css.authLayout}>
      <AuthGlow />
      {children}
    </div>
  );
}
