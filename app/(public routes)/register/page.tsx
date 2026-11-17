'use client';
import AuthTitle from '@/components/AuthMain/AuthTitle/AuthTitle';
import HeadersRegister from '@/components/Header-register/Header-register';
const SignUp = () => {
  const handleSubmit = async (formData: FormData) => {};

  return (
    <>
      <HeadersRegister />
      <main>
        <AuthTitle />
      </main>
    </>
  );
};

export default SignUp;
