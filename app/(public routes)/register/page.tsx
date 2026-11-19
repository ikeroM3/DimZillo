'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthTitle from '@/components/AuthMain/AuthTitle/AuthTitle';
import AuthForm from '@/components/AuthForm/AuthForm';
import HeadersRegister from '@/components/Header-register/Header-register';
import { register, type RegisterRequest } from '@/lib/api';
import { ApiError } from '@/app/api/api';
import css from './page.module.css';

const SignUp = () => {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleSubmit = async (formData: FormData) => {
    try {
      setError('');

      const formValues = Object.fromEntries(formData.entries()) as RegisterRequest;

      const res = await register(formValues);

      if (res) {
        router.push('/home');
        router.refresh();
      }
    } catch (error) {
      setError(
        (error as ApiError).response?.data?.error ??
          (error as ApiError).message ??
          'Oops... some error'
      );
    }
  };

  return (
    <>
      <HeadersRegister />

      <main className={css.main}>
        <AuthTitle />

        <AuthForm onSubmit={handleSubmit} />

        {error && <p>{error}</p>}
      </main>
    </>
  );
};

export default SignUp;
