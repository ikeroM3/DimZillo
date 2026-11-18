'use client';

import AuthTitle from '@/components/AuthMain/AuthTitle/AuthTitle';
import AuthForm from '@/components/AuthForm/AuthForm';
import HeadersRegister from '@/components/Header-register/Header-register';
import css from './page.module.css';
const SignUp = () => {
  const handleSubmit = async (formData: FormData) => {};

  return (
    <>
      <HeadersRegister />
      <main className={css.main}>
        <AuthTitle />
        <AuthForm />
      </main>
    </>
  );
};

export default SignUp;
