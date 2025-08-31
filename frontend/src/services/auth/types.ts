/**
 * Authentication Service Types
 * Complete type definitions for auth functionality
 */

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: UserRole;
  emailVerified: boolean;
  mfaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  metadata?: Record<string, any>;
}

export interface Session {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  provider?: AuthProvider;
  deviceInfo?: DeviceInfo;
}

export interface UserProfile {
  name?: string;
  avatar?: string;
  bio?: string;
  company?: string;
  location?: string;
  website?: string;
  timezone?: string;
  language?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  emailNotifications: boolean;
  marketingEmails: boolean;
  twoFactorAuth: boolean;
  apiAccess: boolean;
}

export interface MFASetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
  verificationRequired: boolean;
}

export interface DeviceInfo {
  userAgent: string;
  ip: string;
  location?: string;
  fingerprint?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
  acceptTerms: boolean;
  marketingConsent?: boolean;
}

export interface SignInData {
  email: string;
  password: string;
  rememberMe?: boolean;
  mfaCode?: string;
}

export interface PasswordResetData {
  email: string;
}

export interface PasswordResetConfirmData {
  token: string;
  password: string;
}

export interface OAuthConfig {
  provider: OAuthProvider;
  redirectUrl?: string;
  scopes?: string[];
  state?: string;
}

export class AuthError extends Error {
  code: AuthErrorCode;
  statusCode: number;
  details?: any;

  constructor(message: string, code: AuthErrorCode, statusCode: number, details?: any) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthError);
    }
  }
}

export type UserRole = "user" | "admin" | "moderator" | "developer";

export type AuthProvider = "email" | "google" | "github" | "twitter" | "microsoft";

export type OAuthProvider = Exclude<AuthProvider, "email">;

export enum AuthErrorCode {
  // Authentication errors
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED",
  ACCOUNT_DISABLED = "ACCOUNT_DISABLED",
  NOT_AUTHENTICATED = "NOT_AUTHENTICATED",

  // Registration errors
  EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS",
  WEAK_PASSWORD = "WEAK_PASSWORD",
  INVALID_EMAIL = "INVALID_EMAIL",
  TERMS_NOT_ACCEPTED = "TERMS_NOT_ACCEPTED",

  // Session errors
  SESSION_EXPIRED = "SESSION_EXPIRED",
  INVALID_TOKEN = "INVALID_TOKEN",
  REFRESH_TOKEN_EXPIRED = "REFRESH_TOKEN_EXPIRED",
  REFRESH_TOKEN_INVALID = "REFRESH_TOKEN_INVALID",

  // MFA errors
  MFA_REQUIRED = "MFA_REQUIRED",
  INVALID_MFA_CODE = "INVALID_MFA_CODE",
  MFA_SETUP_REQUIRED = "MFA_SETUP_REQUIRED",

  // Password reset errors
  RESET_TOKEN_EXPIRED = "RESET_TOKEN_EXPIRED",
  RESET_TOKEN_INVALID = "RESET_TOKEN_INVALID",

  // OAuth errors
  OAUTH_ERROR = "OAUTH_ERROR",
  OAUTH_CANCELLED = "OAUTH_CANCELLED",
  OAUTH_ACCOUNT_LINKED = "OAUTH_ACCOUNT_LINKED",

  // Rate limiting
  RATE_LIMITED = "RATE_LIMITED",

  // File errors
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  INVALID_FILE_TYPE = "INVALID_FILE_TYPE",

  // Verification errors
  VERIFICATION_TOKEN_INVALID = "VERIFICATION_TOKEN_INVALID",

  // General errors
  NETWORK_ERROR = "NETWORK_ERROR",
  SERVER_ERROR = "SERVER_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export interface AuthServiceOptions {
  baseUrl?: string;
  sessionDuration?: number; // in seconds
  refreshThreshold?: number; // in seconds
  maxLoginAttempts?: number;
  lockoutDuration?: number; // in seconds
  passwordMinLength?: number;
  passwordRequireUppercase?: boolean;
  passwordRequireNumbers?: boolean;
  passwordRequireSpecialChars?: boolean;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
}

export interface AuthEvents {
  onSignIn?: (user: User, session: Session) => void;
  onSignOut?: () => void;
  onSessionExpired?: () => void;
  onUserUpdated?: (user: User) => void;
  onError?: (error: AuthError) => void;
}

// Additional types that were missing
export interface AuthResult {
  user: User;
  session: Session;
}

export interface AuthConfig {
  passwordMinLength: number;
  passwordRequireUppercase?: boolean;
  passwordRequireLowercase?: boolean;
  passwordRequireNumbers?: boolean;
  passwordRequireSpecialChars?: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number;
  passwordSalt?: string;
}

export interface ProfileUpdateData {
  name?: string;
  bio?: string;
  company?: string;
  location?: string;
  website?: string;
  preferences?: Partial<UserPreferences>;
}

export interface OAuthCallbackData {
  code: string;
  state: string;
}

export interface SecurityLog {
  event: string;
  email: string;
  userId?: string;
  timestamp: Date;
  success: boolean;
  ip?: string;
}

export interface VerificationToken {
  token: string;
  email: string;
  expiresAt: Date;
}

export interface RefreshToken {
  token: string;
  userId: string;
  expiresAt: Date;
}

export interface ResetToken {
  token: string;
  email: string;
  expiresAt: Date;
}
