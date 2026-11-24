import type { Metadata } from 'next';
import AuthTitle from '@/components/AuthMain/AuthTitle/AuthTitle';
import AuthForm from '@/components/AuthForm/AuthForm';
import HeadersRegister from '@/components/Header-register/Header-register';
import css from './page.module.css';

export const metadata: Metadata = {
  title: 'Вхід | DimZillo',
};

export default function LoginPage() {
  return (
    <>
      <HeadersRegister />

      <main className={css.main}>
        <AuthTitle />
        <AuthForm />
      </main>
    </>
  );
}
