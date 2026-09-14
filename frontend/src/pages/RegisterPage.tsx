import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import {
  registerSchema,
  RegisterFormValues,
  evaluatePassword,
} from '../lib/validations/auth';
import { useAuthStore } from '../store/useAuthStore';
import { Navbar } from '../components/Navbar';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Loader2,
  AlertCircle,
  Award,
  Check,
  X,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { EnglishLevel } from '../types/auth';

const ENGLISH_LEVEL_OPTIONS: Array<{
  value: EnglishLevel;
  label: string;
  cefr: string;
  description: string;
}> = [
  {
    value: 'BEGINNER',
    label: 'Beginner',
    cefr: 'A1',
    description: 'Starting from scratch, basic greetings',
  },
  {
    value: 'ELEMENTARY',
    label: 'Elementary',
    cefr: 'A2',
    description: 'Simple sentences & everyday expressions',
  },
  {
    value: 'INTERMEDIATE',
    label: 'Intermediate',
    cefr: 'B1',
    description: 'Comfortable with routine conversations',
  },
  {
    value: 'UPPER_INTERMEDIATE',
    label: 'Upper Intermediate',
    cefr: 'B2',
    description: 'Fluent discussions on diverse topics',
  },
  {
    value: 'ADVANCED',
    label: 'Advanced',
    cefr: 'C1',
    description: 'Complex nuance and professional contexts',
  },
  {
    value: 'PROFICIENT',
    label: 'Proficient',
    cefr: 'C2',
    description: 'Near-native fluency & mastery',
  },
];

export const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerAccount, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      level: 'BEGINNER',
      targetLevel: 'INTERMEDIATE',
    },
  });

  const selectedLevel = watch('level');
  const passwordValue = watch('password') || '';
  const confirmPasswordValue = watch('confirmPassword') || '';

  const passwordStats = evaluatePassword(passwordValue);

  const onSubmit = async (values: RegisterFormValues) => {
    clearError();
    try {
      await registerAccount(values);
      navigate('/dashboard', { replace: true });
    } catch {
      // Error handled in store
    }
  };

  const getStrengthLabel = (score: number) => {
    if (score <= 1) return { text: 'Very Weak', color: 'bg-destructive text-destructive' };
    if (score <= 2) return { text: 'Weak', color: 'bg-destructive/80 text-destructive' };
    if (score === 3) return { text: 'Moderate', color: 'bg-amber-500 text-amber-500' };
    if (score === 4) return { text: 'Good', color: 'bg-blue-500 text-blue-500' };
    return { text: 'Strong & Valid', color: 'bg-emerald-500 text-emerald-500' };
  };

  const strength = getStrengthLabel(passwordStats.score);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight">Create Your Account</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Begin your personalized English learning path with interactive quizzes and vocabulary tools
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-xl shadow-primary/5 sm:p-8">
            {error && (
              <div
                id="register-error-alert"
                className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive"
              >
                <AlertCircle className="h-5 w-5 shrink-0" />
                <div className="leading-snug">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label
                  htmlFor="register-name-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Full Name
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="register-name-input"
                    type="text"
                    autoComplete="name"
                    placeholder="Jane Doe"
                    {...register('name')}
                    className={`block w-full rounded-xl border bg-background/50 pl-10 pr-3.5 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      errors.name ? 'border-destructive focus:ring-destructive/20' : 'border-input'
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="register-email-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Email Address
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="register-email-input"
                    type="email"
                    autoComplete="email"
                    placeholder="learner@example.com"
                    {...register('email')}
                    className={`block w-full rounded-xl border bg-background/50 pl-10 pr-3.5 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      errors.email ? 'border-destructive focus:ring-destructive/20' : 'border-input'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="register-password-input"
                    className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Password
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="register-password-input"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      {...register('password')}
                      className={`block w-full rounded-xl border bg-background/50 pl-10 pr-10 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
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
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="register-confirm-password-input"
                    className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Confirm Password
                  </label>
                  <div className="relative mt-1.5">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="register-confirm-password-input"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      {...register('confirmPassword')}
                      className={`block w-full rounded-xl border bg-background/50 pl-10 pr-10 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                        errors.confirmPassword
                          ? 'border-destructive focus:ring-destructive/20'
                          : 'border-input'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {confirmPasswordValue.length > 0 && (
                    <div className="mt-1.5">
                      {confirmPasswordValue === passwordValue ? (
                        <span
                          id="confirm-password-match"
                          className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          Passwords match
                        </span>
                      ) : (
                        <span
                          id="confirm-password-mismatch"
                          className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400"
                        >
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                          Passwords do not match yet
                        </span>
                      )}
                    </div>
                  )}
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Real-time Password Warning & Checklist */}
              {passwordValue.length > 0 && (
                <div
                  id="password-validation-box"
                  className="rounded-xl border border-border/80 bg-background/60 p-3.5 shadow-sm space-y-3"
                >
                  {/* Password Strength Meter */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Password Strength
                    </span>
                    <span className="text-xs font-bold capitalize">
                      {strength.text}
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          passwordStats.score >= level ? strength.color.split(' ')[0] : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Warning / Notification Banner */}
                  {!passwordStats.isValid ? (
                    <div
                      id="password-warning-notification"
                      className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-400"
                    >
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                      <div>
                        <span className="font-semibold">Password requirements needed:</span>
                        <p className="mt-0.5 text-[11px] opacity-90">
                          Please fulfill all 5 security requirements below before registering.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      id="password-success-notification"
                      className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                    >
                      <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                      All security criteria satisfied! Ready to proceed.
                    </div>
                  )}

                  {/* Live Criteria Checklist */}
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 pt-1">
                    <div
                      className={`flex items-center gap-2 text-xs transition-colors ${
                        passwordStats.hasMinLength
                          ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {passwordStats.hasMinLength ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                      )}
                      <span>At least 8 characters</span>
                    </div>

                    <div
                      className={`flex items-center gap-2 text-xs transition-colors ${
                        passwordStats.hasUppercase
                          ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {passwordStats.hasUppercase ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                      )}
                      <span>One uppercase letter (A-Z)</span>
                    </div>

                    <div
                      className={`flex items-center gap-2 text-xs transition-colors ${
                        passwordStats.hasLowercase
                          ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {passwordStats.hasLowercase ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                      )}
                      <span>One lowercase letter (a-z)</span>
                    </div>

                    <div
                      className={`flex items-center gap-2 text-xs transition-colors ${
                        passwordStats.hasNumber
                          ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {passwordStats.hasNumber ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                      )}
                      <span>One number (0-9)</span>
                    </div>

                    <div
                      className={`flex items-center gap-2 text-xs transition-colors sm:col-span-2 ${
                        passwordStats.hasSpecialChar
                          ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {passwordStats.hasSpecialChar ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                      )}
                      <span>One special character (!@#$%^&*)</span>
                    </div>
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Select Starting English Level
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {ENGLISH_LEVEL_OPTIONS.map((lvl) => {
                    const isSelected = selectedLevel === lvl.value;
                    return (
                      <button
                        key={lvl.value}
                        type="button"
                        onClick={() => setValue('level', lvl.value, { shouldValidate: true })}
                        className={`flex flex-col rounded-xl border p-3 text-left transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary'
                            : 'border-border bg-background/50 hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{lvl.label}</span>
                          <span
                            className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                              isSelected
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {lvl.cefr}
                          </span>
                        </div>
                        <span className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                          {lvl.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.level && (
                  <p className="mt-1 text-xs text-destructive">{errors.level.message}</p>
                )}
              </div>

              <button
                id="register-submit-button"
                type="submit"
                disabled={isSubmitting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <Award className="h-4 w-4" />
                    Create Account & Start Learning
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              to="/login"
              id="goto-login-link"
              className="font-semibold text-primary underline underline-offset-4 hover:opacity-90"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};
