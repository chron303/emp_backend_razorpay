import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Banknote, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../../utils/formatters.js';
import { Spinner } from '../../components/common/Spinner.jsx';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .refine((v) => v.endsWith('@org.com'), 'Email must be @org.com domain'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async ({ email, password }) => {
    try {
      await login({ email, password });
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Login failed. Check your credentials.'));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card slide-up">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Banknote size={22} color="white" />
          </div>
          <span className="auth-logo-text">ReimburseFlow</span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Email */}
          <div className="form-group mb-4">
            <label className="form-label" htmlFor="login-email">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Mail size={13} /> Work Email
              </span>
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@org.com"
              className={`form-input${errors.email ? ' error' : ''}`}
              {...register('email')}
            />
            {errors.email && (
              <span className="form-error">{errors.email.message}</span>
            )}
          </div>

          {/* Password */}
          <div className="form-group mb-6">
            <label className="form-label" htmlFor="login-password">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Lock size={13} /> Password
              </span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className={`form-input${errors.password ? ' error' : ''}`}
                style={{ paddingRight: '2.75rem' }}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <span className="form-error">{errors.password.message}</span>
            )}
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? <><Spinner /> Signing in…</> : 'Sign In'}
          </button>
        </form>

        <div className="divider-text" style={{ marginTop: '1.5rem' }}>
          Don't have an account?
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link to="/register" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
            Create an account →
          </Link>
        </div>

        {/* CFO hint */}
        <div style={{
          marginTop: '1.5rem',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
        }}>
          <strong style={{ color: 'var(--text-secondary)' }}>CFO credentials:</strong>{' '}
          cfo@org.com / CFO#ORG@April2026
        </div>
      </div>
    </div>
  );
}
