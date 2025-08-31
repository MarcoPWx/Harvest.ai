/**
 * Auth Service Interface
 * Defines the contract for authentication services
 */

import {
  User,
  Session,
  SignUpData,
  SignInData,
  AuthResult,
  PasswordResetData,
  PasswordResetConfirmData,
  AuthConfig,
  ProfileUpdateData,
  OAuthProvider,
  OAuthCallbackData,
  MFASetup,
  SecurityLog,
} from "./types";

/**
 * Main authentication service interface
 */
export abstract class AuthService {
  protected config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
  }

  // User Registration
  abstract signUp(data: SignUpData): Promise<AuthResult>;
  abstract verifyEmail(token: string): Promise<User>;
  abstract resendVerificationEmail(email: string): Promise<void>;
  abstract getPendingVerifications(): Promise<string[]>;

  // User Authentication
  abstract signIn(data: SignInData, context?: { ip?: string }): Promise<AuthResult>;
  abstract signOut(): Promise<void>;
  abstract signInWithGoogle(): Promise<string>;
  abstract signInWithGitHub(): Promise<string>;
  abstract handleOAuthCallback(
    provider: OAuthProvider,
    data: OAuthCallbackData,
  ): Promise<AuthResult>;
  abstract linkOAuthAccount(provider: OAuthProvider, data: OAuthCallbackData): Promise<void>;
  abstract getLinkedProviders(userId: string): Promise<string[]>;

  // Session Management
  abstract getCurrentUser(): Promise<User | null>;
  abstract validateSession(accessToken: string): Promise<boolean>;
  abstract refreshSession(): Promise<Session>;
  abstract getSession(): Promise<Session | null>;

  // Password Management
  abstract resetPassword(data: PasswordResetData): Promise<{ message: string; email: string }>;
  abstract confirmPasswordReset(data: PasswordResetConfirmData): Promise<void>;
  abstract updatePassword(oldPassword: string, newPassword: string): Promise<void>;
  abstract getPendingResets(): Promise<Record<string, string>>;

  // Profile Management
  abstract updateProfile(data: ProfileUpdateData): Promise<User>;
  abstract uploadAvatar(file: File): Promise<string>;
  abstract deleteAccount(): Promise<void>;

  // Multi-Factor Authentication
  abstract enableMFA(): Promise<MFASetup>;
  abstract verifyMFA(code: string, userId?: string): Promise<boolean>;
  abstract disableMFA(): Promise<void>;
  abstract generateBackupCodes(): Promise<string[]>;

  // Security
  abstract getCSRFToken(): Promise<string>;
  abstract getSecurityLog(email: string): Promise<SecurityLog[]>;

  // Helper methods
  protected validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  protected validatePassword(password: string): boolean {
    if (password.length < this.config.passwordMinLength) return false;
    if (this.config.passwordRequireUppercase && !/[A-Z]/.test(password)) return false;
    if (this.config.passwordRequireLowercase && !/[a-z]/.test(password)) return false;
    if (this.config.passwordRequireNumbers && !/\d/.test(password)) return false;
    if (this.config.passwordRequireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password))
      return false;
    return true;
  }

  protected sanitizeInput(input: string): string {
    // Remove HTML tags and script content
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<[^>]+>/g, "")
      .trim();
  }

  protected generateToken(length: number = 32): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  protected async hashPassword(password: string): Promise<string> {
    // In real implementation, use bcrypt or argon2
    // For mock, simple base64 encoding
    return btoa(password + this.config.passwordSalt || "default-salt");
  }

  protected async verifyPassword(password: string, hash: string): Promise<boolean> {
    // In real implementation, use bcrypt or argon2
    const testHash = await this.hashPassword(password);
    return testHash === hash;
  }
}
