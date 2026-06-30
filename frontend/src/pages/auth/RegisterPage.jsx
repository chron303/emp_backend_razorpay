import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Banknote, User, Mail, Lock } from 'lucide-react';
import { register as registerService } from '../../services/auth.service.js';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../../utils/formatters.js';
import { Spinner } from '../../components/common/Spinner.jsx';

const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .trim(),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .refine((v) => v.endsWith('@org.com'), 'Email must be @org.com domain'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function RegisterPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async ({ name, email, password }) => {
    try {
      await registerService({ name, email, password });
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Registration failed. Please try again.'));
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

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Register with your org.com work email</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Name */}
          <div className="form-group mb-4">
            <label className="form-label" htmlFor="reg-name">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={13} /> Full Name
              </span>
            </label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              placeholder="John Doe"
              className={`form-input${errors.name ? ' error' : ''}`}
              {...register('name')}
            />
            {errors.name && <span className="form-error">{errors.name.message}</span>}
          </div>

          {/* Email */}
          <div className="form-group mb-4">
            <label className="form-label" htmlFor="reg-email">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Mail size={13} /> Work Email
              </span>
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              placeholder="you@org.com"
              className={`form-input${errors.email ? ' error' : ''}`}
              {...register('email')}
            />
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>

          {/* Password */}
          <div className="form-group mb-4">
            <label className="form-label" htmlFor="reg-password">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Lock size={13} /> Password
              </span>
            </label>
            <input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              placeholder="Min. 6 characters"
              className={`form-input${errors.password ? ' error' : ''}`}
              {...register('password')}
            />
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>

          {/* Confirm Password */}
          <div className="form-group mb-6">
            <label className="form-label" htmlFor="reg-confirm">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Lock size={13} /> Confirm Password
              </span>
            </label>
            <input
              id="reg-confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat password"
              className={`form-input${errors.confirmPassword ? ' error' : ''}`}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <span className="form-error">{errors.confirmPassword.message}</span>
            )}
          </div>

          <button
            id="register-submit"
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? <><Spinner /> Creating account…</> : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
          </span>
          <Link to="/login" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
            Sign in →
          </Link>
        </div>
      </div>
    </div>
  );
}
