'use client';

import { useState, type FormEvent } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';

import css from './AuthForm.module.css';

type AuthFormProps = {
  onSubmit: (formData: FormData) => void | Promise<void>;
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

export default function AuthForm({ onSubmit }: AuthFormProps) {
  const pathname = usePathname();
  const isLogin = pathname === '/login';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);

  const strength = getStrength(password);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    onSubmit(formData);
  };

  return (
    <div className={css.card}>
      {/* Tabs */}
      <div className={css.tabs}>
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

      {/* Form */}
      <form className={css.form} onSubmit={handleSubmit}>
        {/* Name */}
        {!isLogin && (
          <div className={css.field}>
            <label htmlFor="name" className={css.label}>
              Ім'я
            </label>

            <div className={css.inputWrap}>
              <User size={18} className={css.icon} />

              <input
                id="name"
                name="name"
                type="text"
                className={css.input}
                placeholder="Артем Стужук"
                autoComplete="name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        {/* Email */}
        <div className={css.field}>
          <label htmlFor="email" className={css.label}>
            Email
          </label>

          <div className={css.inputWrap}>
            <Mail size={18} className={css.icon} />

            <input
              id="email"
              name="email"
              type="email"
              className={css.input}
              placeholder="name@example.com"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className={css.field}>
          <label htmlFor="password" className={css.label}>
            Пароль
          </label>

          <div className={css.inputWrap}>
            <Lock size={18} className={css.icon} />

            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              className={css.input}
              placeholder="••••••••"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={isLogin ? undefined : 8}
              required
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

          {/* Password strength */}
          {!isLogin && password && (
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
          <label className={css.agree}>
            <input
              type="checkbox"
              name="agree"
              className={css.checkbox}
              checked={agree}
              onChange={e => setAgree(e.target.checked)}
            />

            <span className={css.box}>
              <Check size={12} strokeWidth={3} />
            </span>

            <span className={css.agreeText}>
              Погоджуюсь з умовами використання та політикою конфіденційності
            </span>
          </label>
        )}

        {/* Submit */}
        <button type="submit" className={css.submit} disabled={!isLogin && !agree}>
          {isLogin ? 'Увійти в акаунт' : 'Створити акаунт'}

          <ArrowRight size={18} />
        </button>
      </form>

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
