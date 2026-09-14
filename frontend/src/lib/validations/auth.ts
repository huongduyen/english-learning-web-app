import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters long'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export interface PasswordValidationResult {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  score: number;
  isValid: boolean;
}

export const evaluatePassword = (password: string): PasswordValidationResult => {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[@$!%*?&^#_()\-+=<>.,]/.test(password);

  const criteria = [
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
  ];
  const score = criteria.filter(Boolean).length;
  const isValid = score === 5;

  return {
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
    score,
    isValid,
  };
};

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters long'),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Must contain at least 1 uppercase letter (A-Z)')
      .regex(/[a-z]/, 'Must contain at least 1 lowercase letter (a-z)')
      .regex(/[0-9]/, 'Must contain at least 1 number (0-9)')
      .regex(
        /[@$!%*?&^#_()\-+=<>.,]/,
        'Must contain at least 1 special character (!@#$%^&*)',
      ),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
    level: z.enum([
      'BEGINNER',
      'ELEMENTARY',
      'INTERMEDIATE',
      'UPPER_INTERMEDIATE',
      'ADVANCED',
      'PROFICIENT',
    ]),
    targetLevel: z
      .enum([
        'BEGINNER',
        'ELEMENTARY',
        'INTERMEDIATE',
        'UPPER_INTERMEDIATE',
        'ADVANCED',
        'PROFICIENT',
      ])
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
  targetLevel: z.enum([
    'BEGINNER',
    'ELEMENTARY',
    'INTERMEDIATE',
    'UPPER_INTERMEDIATE',
    'ADVANCED',
    'PROFICIENT',
  ]),
  dailyGoalMinutes: z.coerce
    .number()
    .min(5, 'Daily goal must be at least 5 minutes')
    .max(180, 'Daily goal cannot exceed 180 minutes'),
  nativeLanguage: z.string().default('vi'),
});

export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;
