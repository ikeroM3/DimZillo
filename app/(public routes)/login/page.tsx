import AuthTitle from '@/components/AuthMain/AuthTitle/AuthTitle';
import AuthForm from '@/components/AuthForm/AuthForm';
import HeadersRegister from '@/components/Header-register/Header-register';
import css from './page.module.css';
export default function Login() {
  return (
    <>
      <HeadersRegister />
      <main className={css.main}>
        <AuthTitle />
        <AuthForm onSubmit={handleSubmit} />
      </main>
    </>
  );
}
