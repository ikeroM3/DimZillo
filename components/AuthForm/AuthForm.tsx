'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';

import { login, register } from '@/lib/api';
import type { ApiError } from '@/app/api/api';
import css from './AuthForm.module.css';

type FormValues = {
  userName: string;
  email: string;
  password: string;
  agree: boolean;
};

const strengthLabels = ['Занадто слабкий', 'Слабкий', 'Середній', 'Надійний', 'Дуже надійний'];

function getStrength(password: string) {
  if (!password) return 0;

  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-ZА-ЯІЇЄҐ]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-zА-Яа-яІіЇїЄєҐґ0-9]/.test(password)) score++;

  return score;
}

const registerSchema = Yup.object({
  userName: Yup.string().min(2, "Ім'я повинно містити мінімум 2 символи").required("Введіть ім'я"),
  email: Yup.string().email('Некоректний формат email').required('Введіть email'),
  password: Yup.string()
    .min(8, 'Пароль повинен містити мінімум 8 символів')
    .required('Введіть пароль'),
  agree: Yup.boolean().oneOf([true], 'Потрібно погодитися з умовами використання'),
});

const loginSchema = Yup.object({
  email: Yup.string().email('Некоректний формат email').required('Введіть email'),
  password: Yup.string().required('Введіть пароль'),
});

export default function AuthForm() {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === '/login';

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (values: FormValues) => {
    try {
      setServerError('');

      if (isLogin) {
        await login({ email: values.email, password: values.password });
      } else {
        await register({
          userName: values.userName,
          email: values.email,
          password: values.password,
        });
      }

      router.push('/home');
      router.refresh();
    } catch (err) {
      const e = err as ApiError;
      setServerError(e.response?.data?.error ?? e.message ?? 'Щось пішло не так');
    }
  };

  return (
    <div className={`${css.card} ${isLogin ? css.cardLogin : css.cardRegister}`}>
      {/* Tabs */}
      <div className={css.tabs}>
        <span
          className={`${css.indicator} ${isLogin ? css.toLogin : css.toRegister}`}
          aria-hidden="true"
        />

        <Link
          href="/login"
          className={`${css.tab} ${isLogin ? css.tabActive : ''}`}
          aria-current={isLogin ? 'page' : undefined}
        >
          Вхід
        </Link>

        <Link
          href="/register"
          className={`${css.tab} ${!isLogin ? css.tabActive : ''}`}
          aria-current={!isLogin ? 'page' : undefined}
        >
          Реєстрація
        </Link>
      </div>

      {/* Heading */}
      <div className={css.heading}>
        <h1 className={css.title}>{isLogin ? 'З поверненням!' : 'Створити акаунт'}</h1>

        <p className={css.subtitle}>
          {isLogin
            ? 'Увійдіть, щоб продовжити користування сервісом'
            : 'Зберігайте квартири й додавайте свої оголошення'}
        </p>
      </div>

      {/* Formik */}
      <Formik<FormValues>
        initialValues={{
          userName: '',
          email: '',
          password: '',
          agree: false,
        }}
        validationSchema={isLogin ? loginSchema : registerSchema}
        onSubmit={handleSubmit}
      >
        {({ values, isSubmitting }) => {
          const strength = getStrength(values.password);

          return (
            <Form className={css.form}>
              {/* Name */}
              {!isLogin && (
                <div className={css.field}>
                  <label htmlFor="userName" className={css.label}>
                    Ім'я
                  </label>

                  <div className={css.inputWrap}>
                    <User size={18} className={css.icon} />

                    <Field
                      id="userName"
                      name="userName"
                      type="text"
                      className={css.input}
                      placeholder="Артем Стужук"
                      autoComplete="name"
                    />
                  </div>

                  <ErrorMessage name="userName" component="span" className={css.error} />
                </div>
              )}

              {/* Email */}
              <div className={css.field}>
                <label htmlFor="email" className={css.label}>
                  Email
                </label>

                <div className={css.inputWrap}>
                  <Mail size={18} className={css.icon} />

                  <Field
                    id="email"
                    name="email"
                    type="email"
                    className={css.input}
                    placeholder="name@example.com"
                    autoComplete="email"
                  />
                </div>

                <ErrorMessage name="email" component="span" className={css.error} />
              </div>

              {/* Password */}
              <div className={css.field}>
                <label htmlFor="password" className={css.label}>
                  Пароль
                </label>

                <div className={css.inputWrap}>
                  <Lock size={18} className={css.icon} />

                  <Field
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className={css.input}
                    placeholder="••••••••"
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                  />

                  <button
                    type="button"
                    className={css.eye}
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Сховати пароль' : 'Показати пароль'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <ErrorMessage name="password" component="span" className={css.error} />

                {/* Password strength */}
                {!isLogin && values.password && (
                  <div className={css.strength}>
                    <div className={css.bars}>
                      {[1, 2, 3, 4].map(n => (
                        <span key={n} className={`${css.bar} ${n <= strength ? css.barOn : ''}`} />
                      ))}
                    </div>

                    <span className={css.strengthText}>{strengthLabels[strength]}</span>
                  </div>
                )}
              </div>

              {/* Agreement */}
              {!isLogin && (
                <div>
                  <label className={css.agree}>
                    <Field type="checkbox" name="agree" className={css.checkbox} />

                    <span className={css.box}>
                      <Check size={12} strokeWidth={3} />
                    </span>

                    <span className={css.agreeText}>
                      Погоджуюсь з умовами використання та політикою конфіденційності
                    </span>
                  </label>

                  <ErrorMessage name="agree" component="span" className={css.error} />
                </div>
              )}

              {/* Server error */}
              {serverError && <p className={css.serverError}>{serverError}</p>}

              {/* Submit */}
              <button
                type="submit"
                className={css.submit}
                disabled={isSubmitting || (!isLogin && !values.agree)}
              >
                {isSubmitting ? 'Зачекайте...' : isLogin ? 'Увійти в акаунт' : 'Створити акаунт'}

                <ArrowRight size={18} />
              </button>
            </Form>
          );
        }}
      </Formik>

      {/* Divider */}
      <div className={css.divider}>
        <span>або</span>
      </div>

      {/* Socials */}
      <div className={css.socials}>
        <button type="button" className={css.social}>
          <span className={css.dot} />
          Google
        </button>

        <button type="button" className={css.social}>
          <span className={css.dot} />
          GitHub
        </button>
      </div>

      {/* Footer */}
      <p className={css.footer}>
        {isLogin ? 'Ще не маєте акаунта? ' : 'Вже є акаунт? '}

        <Link href={isLogin ? '/register' : '/login'}>
          {isLogin ? 'Зареєструватися' : 'Увійти'}
        </Link>
      </p>
    </div>
  );
}
