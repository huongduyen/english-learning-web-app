export type EnglishLevel =
  | 'BEGINNER'
  | 'ELEMENTARY'
  | 'INTERMEDIATE'
  | 'UPPER_INTERMEDIATE'
  | 'ADVANCED'
  | 'PROFICIENT';

export type UserRole = 'ADMIN' | 'TEACHER' | 'LEARNER';

export interface UserProfile {
  id?: string;
  userId?: string;
  targetLevel: EnglishLevel;
  nativeLanguage: string;
  dailyGoalMinutes: number;
  streakDays: number;
  totalXp: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: UserRole;
  level: EnglishLevel;
  profile?: UserProfile | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  token?: string;
  user: User;
}

export interface UpdateProfilePayload {
  name?: string;
  avatar?: string;
  targetLevel?: EnglishLevel;
  nativeLanguage?: string;
  dailyGoalMinutes?: number;
}
