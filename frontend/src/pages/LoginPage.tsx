import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginSchema, LoginFormValues } from '../lib/validations/auth';
import { useAuthStore } from '../store/useAuthStore';
import { Navbar } from '../components/Navbar';
import { Eye, EyeOff, Lock, Mail, Loader2, AlertCircle, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ||
    '/dashboard';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    clearError();
    try {
      await login(values);
      navigate(from, { replace: true });
    } catch {
      // Error handled by store
    }
  };

  const handleFillDemo = () => {
    setValue('email', 'learner@example.com', { shouldValidate: true });
    setValue('password', 'Learner123!', { shouldValidate: true });
    clearError();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome Back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to resume your English vocabulary and learning practice
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-xl shadow-primary/5 sm:p-8">
            {error && (
              <div
                id="login-error-alert"
                className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive"
              >
                <AlertCircle className="h-5 w-5 shrink-0" />
                <div className="leading-snug">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label
                  htmlFor="login-email-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Email Address
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="login-email-input"
                    type="email"
                    autoComplete="email"
                    placeholder="learner@example.com"
                    {...register('email')}
                    className={`block w-full rounded-xl border bg-background/50 py-2.5 pl-10 pr-3.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      errors.email
                        ? 'border-destructive focus:ring-destructive/20'
                        : 'border-input'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="login-password-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Password
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    {...register('password')}
                    className={`block w-full rounded-xl border bg-background/50 py-2.5 pl-10 pr-10 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      errors.password
                        ? 'border-destructive focus:ring-destructive/20'
                        : 'border-input'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                id="login-submit-button"
                type="submit"
                disabled={isSubmitting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 border-t pt-5">
              <button
                id="demo-learner-fill-button"
                type="button"
                onClick={handleFillDemo}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Fill Demo Learner Credentials
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              id="goto-register-link"
              className="font-semibold text-primary underline underline-offset-4 hover:opacity-90"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};
