/**
 * Authentication Domain Types
 *
 * Core types and interfaces for the authentication module.
 * These types define the domain model for authentication
 * independent of any framework or implementation details.
 */

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  provider?: AuthProvider;
  createdAt: Date;
  updatedAt: Date;
}

export type AuthProvider = 'google' | 'email' | 'github' | 'facebook';

export interface AuthSession {
  user: User;
  expiresAt: Date;
  // Tokens are stored in httpOnly cookies and not exposed to JavaScript
  // for security reasons. Never store tokens in Redux or localStorage.
}

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: unknown;
}

export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  OAUTH_ERROR = 'OAUTH_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
}

export interface LoginFormData {
  email?: string;
  password?: string;
  provider?: AuthProvider;
  rememberMe?: boolean;
}

export interface SignUpFormData extends LoginFormData {
  name?: string;
  confirmPassword?: string;
  acceptTerms?: boolean;
}

export interface LoginContainerProps {
  redirectTo?: string;
}

export interface SignupContainerProps {
  redirectTo?: string;
}

export interface GoogleSignInButtonProps {
  onSuccess?: (user: User) => void;
  onError?: (error: AuthError) => void;
  disabled?: boolean;
  fullWidth?: boolean;
  text?: string;
}

export interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export interface UseAuthReturn {
  user: User | null;
  session: AuthSession | null;
  loading: boolean;
  error: AuthError | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

export interface UseLoginReturn {
  loading: boolean;
  error: string | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  clearError: () => void;
  handleEmailLogin: (email: string, password: string) => Promise<void>;
  handleGoogleLogin: () => Promise<void>;
}