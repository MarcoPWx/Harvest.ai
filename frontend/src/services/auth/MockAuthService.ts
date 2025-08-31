/**
 * Mock Auth Service Implementation
 * For testing and development without real backend
 */

import { AuthService } from "./AuthService";
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
  AuthError,
  AuthErrorCode,
  UserRole,
} from "./types";

interface MockDatabase {
  users: Map<string, User & { passwordHash: string }>;
  sessions: Map<string, Session>;
  refreshTokens: Map<string, { userId: string; expiresAt: Date }>;
  verificationTokens: Map<string, string>; // token -> email
  resetTokens: Map<string, { email: string; createdAt: Date }>; // token -> { email, createdAt }
  loginAttempts: Map<string, { count: number; lastAttempt: Date }>;
  ipAttempts: Map<string, { count: number; lastAttempt: Date }>;
  mfaSecrets: Map<string, string>; // userId -> secret
  mfaBackupCodes: Map<string, string[]>; // userId -> codes
  securityLogs: SecurityLog[];
  oauthLinks: Map<string, Set<string>>; // userId -> providers
  csrfTokens: Set<string>;
}

export class MockAuthService extends AuthService {
  private db: MockDatabase = {
    users: new Map(),
    sessions: new Map(),
    refreshTokens: new Map(),
    verificationTokens: new Map(),
    resetTokens: new Map(),
    loginAttempts: new Map(),
    ipAttempts: new Map(),
    mfaSecrets: new Map(),
    mfaBackupCodes: new Map(),
    securityLogs: [],
    oauthLinks: new Map(),
    csrfTokens: new Set(),
  };

  private currentSession: Session | null = null;

  constructor(config: AuthConfig) {
    super(config);
    this.loadFromStorage();
  }

  // User Registration
  async signUp(data: SignUpData): Promise<AuthResult> {
    // Sanitize inputs
    const email = this.sanitizeInput(data.email).toLowerCase();
    const name = data.name ? this.sanitizeInput(data.name) : undefined;

    // Validate email format
    if (!this.validateEmail(email)) {
      throw new AuthError("Invalid email format", AuthErrorCode.INVALID_EMAIL, 400);
    }

    // Check if email already exists
    const existingUser = Array.from(this.db.users.values()).find((u) => u.email === email);
    if (existingUser) {
      throw new AuthError("Email already registered", AuthErrorCode.EMAIL_ALREADY_EXISTS, 409);
    }

    // Validate password strength
    if (!this.validatePassword(data.password)) {
      throw new AuthError("Password does not meet requirements", AuthErrorCode.WEAK_PASSWORD, 400);
    }

    // Check terms acceptance
    if (!data.acceptTerms) {
      throw new AuthError(
        "Terms and conditions must be accepted",
        AuthErrorCode.TERMS_NOT_ACCEPTED,
        400,
      );
    }

    // Create user
    const userId = this.generateToken(16);
    const passwordHash = await this.hashPassword(data.password);

    const user: User = {
      id: userId,
      email,
      name: name || email.split("@")[0],
      role: "user" as UserRole,
      emailVerified: false,
      mfaEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        marketingConsent: data.marketingConsent,
        preferences: {
          theme: "light",
          emailNotifications: true,
          marketingEmails: data.marketingConsent || false,
          twoFactorAuth: false,
          apiAccess: false,
        },
      },
    };

    // Store user with password hash
    this.db.users.set(userId, { ...user, passwordHash });

    // Create verification token
    const verificationToken = this.generateToken();
    this.db.verificationTokens.set(verificationToken, email);

    // Create session
    const session = await this.createSession(user);

    // Store OAuth link if applicable
    this.db.oauthLinks.set(userId, new Set(["email"]));

    // Log security event
    this.logSecurityEvent({
      event: "USER_REGISTERED",
      email,
      userId,
      timestamp: new Date(),
      success: true,
    });

    this.saveToStorage();

    return { user, session };
  }

  async verifyEmail(token: string): Promise<User> {
    const email = this.db.verificationTokens.get(token);
    if (!email) {
      throw new AuthError(
        "Invalid verification token",
        AuthErrorCode.VERIFICATION_TOKEN_INVALID,
        400,
      );
    }

    const user = Array.from(this.db.users.values()).find((u) => u.email === email);

    if (!user) {
      throw new AuthError("User not found", AuthErrorCode.USER_NOT_FOUND, 404);
    }

    user.emailVerified = true;
    user.updatedAt = new Date();

    this.db.verificationTokens.delete(token);
    this.saveToStorage();

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = Array.from(this.db.users.values()).find((u) => u.email === email);

    if (!user) {
      // Don't reveal if email exists
      return;
    }

    if (user.emailVerified) {
      return;
    }

    // Create new verification token
    const verificationToken = this.generateToken();
    this.db.verificationTokens.set(verificationToken, email);

    this.saveToStorage();
  }

  async getPendingVerifications(): Promise<string[]> {
    return Array.from(this.db.verificationTokens.values());
  }

  // User Authentication
  async signIn(data: SignInData, context?: { ip?: string }): Promise<AuthResult> {
    const email = data.email.toLowerCase();

    // Check IP rate limiting
    if (context?.ip) {
      const ipAttempts = this.db.ipAttempts.get(context.ip);
      if (ipAttempts && ipAttempts.count >= 5) {
        const timeSinceLastAttempt = Date.now() - ipAttempts.lastAttempt.getTime();
        if (timeSinceLastAttempt < this.config.lockoutDuration * 1000) {
          throw new AuthError(
            "Too many attempts from this IP address",
            AuthErrorCode.RATE_LIMITED,
            429,
          );
        }
      }
    }

    // Check user rate limiting
    const attempts = this.db.loginAttempts.get(email);
    if (attempts && attempts.count >= this.config.maxLoginAttempts) {
      const timeSinceLastAttempt = Date.now() - attempts.lastAttempt.getTime();
      if (timeSinceLastAttempt < this.config.lockoutDuration * 1000) {
        throw new AuthError(
          "Account temporarily locked due to too many failed attempts",
          AuthErrorCode.RATE_LIMITED,
          429,
        );
      }
    }

    // Find user
    const userWithPassword = Array.from(this.db.users.values()).find((u) => u.email === email);

    if (!userWithPassword) {
      this.recordFailedAttempt(email, context?.ip);
      throw new AuthError("User not found", AuthErrorCode.USER_NOT_FOUND, 404);
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(data.password, userWithPassword.passwordHash);

    if (!isValidPassword) {
      this.recordFailedAttempt(email, context?.ip);
      throw new AuthError("Invalid credentials", AuthErrorCode.INVALID_CREDENTIALS, 401);
    }

    // Check MFA if enabled
    if (userWithPassword.mfaEnabled) {
      if (!data.mfaCode) {
        throw new AuthError(
          "Multi-factor authentication code required",
          AuthErrorCode.MFA_REQUIRED,
          401,
        );
      }

      // Pass userId for MFA verification in sign-in context
      const isValidMFA = await this.verifyMFA(data.mfaCode, userWithPassword.id);
      if (!isValidMFA) {
        this.recordFailedAttempt(email, context?.ip);
        throw new AuthError("Invalid MFA code", AuthErrorCode.INVALID_MFA_CODE, 401);
      }
    }

    // Clear login attempts on successful login
    this.db.loginAttempts.delete(email);
    if (context?.ip) {
      this.db.ipAttempts.delete(context.ip);
    }

    // Create session
    const { passwordHash, ...user } = userWithPassword;
    const session = await this.createSession(user, data.rememberMe);

    // Log security event
    this.logSecurityEvent({
      event: "LOGIN_SUCCESS",
      email,
      userId: user.id,
      timestamp: new Date(),
      success: true,
      ip: context?.ip,
    });

    this.saveToStorage();

    return { user, session };
  }

  async signOut(): Promise<void> {
    if (this.currentSession) {
      this.db.sessions.delete(this.currentSession.accessToken);
      this.db.refreshTokens.delete(this.currentSession.refreshToken);
      this.currentSession = null;
    }

    localStorage.removeItem("auth_session");
    sessionStorage.removeItem("auth_session");

    this.saveToStorage();
  }

  async signInWithGoogle(): Promise<string> {
    const state = this.generateToken(16);
    const clientId = "mock-google-client-id";
    const redirectUri = encodeURIComponent("http://localhost:3000/auth/callback/google");
    const scope = encodeURIComponent("email profile");

    return `https://accounts.google.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}&response_type=code`;
  }

  async signInWithGitHub(): Promise<string> {
    const state = this.generateToken(16);
    const clientId = "mock-github-client-id";
    const redirectUri = encodeURIComponent("http://localhost:3000/auth/callback/github");

    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`;
  }

  async handleOAuthCallback(provider: OAuthProvider, data: OAuthCallbackData): Promise<AuthResult> {
    // Mock OAuth user data
    const mockOAuthUser = {
      email: `oauth-${provider}@example.com`,
      name: `OAuth User (${provider})`,
      avatar: `https://example.com/avatar-${provider}.jpg`,
    };

    // Check if user exists with this email
    let user = Array.from(this.db.users.values()).find((u) => u.email === mockOAuthUser.email);

    if (!user) {
      // Create new user from OAuth
      const userId = this.generateToken(16);
      user = {
        id: userId,
        email: mockOAuthUser.email,
        name: mockOAuthUser.name,
        avatar: mockOAuthUser.avatar,
        role: "user" as UserRole,
        emailVerified: true, // OAuth emails are pre-verified
        mfaEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          preferences: {
            theme: "light",
            emailNotifications: true,
            marketingEmails: false,
            twoFactorAuth: false,
            apiAccess: false,
          },
        },
        passwordHash: "", // No password for OAuth users
      } as User & { passwordHash: string };

      this.db.users.set(userId, user);
      this.db.oauthLinks.set(userId, new Set([provider]));
    } else {
      // Link provider to existing user
      const providers = this.db.oauthLinks.get(user.id) || new Set();
      providers.add(provider);
      this.db.oauthLinks.set(user.id, providers);
    }

    const { passwordHash, ...userWithoutPassword } = user;
    const session = await this.createSession(userWithoutPassword);
    session.provider = provider;

    this.saveToStorage();

    return { user: userWithoutPassword, session };
  }

  async linkOAuthAccount(provider: OAuthProvider, data: OAuthCallbackData): Promise<void> {
    if (!this.currentSession) {
      throw new AuthError("Not authenticated", AuthErrorCode.NOT_AUTHENTICATED, 401);
    }

    const userId = this.currentSession.userId;
    const providers = this.db.oauthLinks.get(userId) || new Set();
    providers.add(provider);
    this.db.oauthLinks.set(userId, providers);

    this.saveToStorage();
  }

  async getLinkedProviders(userId: string): Promise<string[]> {
    const providers = this.db.oauthLinks.get(userId) || new Set();
    return Array.from(providers);
  }

  // Session Management
  async getCurrentUser(): Promise<User | null> {
    if (!this.currentSession) {
      // Try to restore from storage
      const storedSession = this.getStoredSession();
      if (storedSession) {
        this.currentSession = storedSession;
      } else {
        return null;
      }
    }

    const user = this.db.users.get(this.currentSession.userId);
    if (!user) return null;

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async validateSession(accessToken: string): Promise<boolean> {
    const session = this.db.sessions.get(accessToken);
    if (!session) return false;

    if (new Date() > session.expiresAt) {
      this.db.sessions.delete(accessToken);
      return false;
    }

    return true;
  }

  async refreshSession(): Promise<Session> {
    if (!this.currentSession) {
      throw new AuthError("No active session", AuthErrorCode.NOT_AUTHENTICATED, 401);
    }

    const refreshToken = this.db.refreshTokens.get(this.currentSession.refreshToken);
    if (!refreshToken) {
      throw new AuthError("Invalid refresh token", AuthErrorCode.REFRESH_TOKEN_INVALID, 401);
    }

    if (new Date() > refreshToken.expiresAt) {
      throw new AuthError("Refresh token expired", AuthErrorCode.REFRESH_TOKEN_EXPIRED, 401);
    }

    // Delete old session
    this.db.sessions.delete(this.currentSession.accessToken);
    this.db.refreshTokens.delete(this.currentSession.refreshToken);

    // Create new session
    const user = this.db.users.get(refreshToken.userId);
    if (!user) {
      throw new AuthError("User not found", AuthErrorCode.USER_NOT_FOUND, 404);
    }

    const { passwordHash, ...userWithoutPassword } = user;
    const newSession = await this.createSession(userWithoutPassword);

    this.saveToStorage();

    return newSession;
  }

  async getSession(): Promise<Session | null> {
    return this.currentSession;
  }

  // Password Management
  async resetPassword(data: PasswordResetData): Promise<{ message: string; email: string }> {
    const email = data.email.toLowerCase();

    // Don't reveal if email exists (security best practice)
    const user = Array.from(this.db.users.values()).find((u) => u.email === email);

    if (user) {
      const resetToken = this.generateToken();
      this.db.resetTokens.set(resetToken, {
        email,
        createdAt: new Date(),
      });

      // Log security event
      this.logSecurityEvent({
        event: "PASSWORD_RESET_REQUESTED",
        email,
        userId: user.id,
        timestamp: new Date(),
        success: true,
      });
    }

    this.saveToStorage();

    return {
      message: "Password reset email sent if account exists",
      email,
    };
  }

  async confirmPasswordReset(data: PasswordResetConfirmData): Promise<void> {
    const resetData = this.db.resetTokens.get(data.token);

    if (!resetData) {
      throw new AuthError("Invalid or expired reset token", AuthErrorCode.RESET_TOKEN_INVALID, 400);
    }

    // Check if token has expired (1 hour expiry)
    const tokenAge = Date.now() - resetData.createdAt.getTime();
    if (tokenAge > 60 * 60 * 1000) {
      // 1 hour in milliseconds
      throw new AuthError("Reset token has expired", AuthErrorCode.RESET_TOKEN_EXPIRED, 400);
    }

    const email = resetData.email;

    // Validate new password
    if (!this.validatePassword(data.password)) {
      throw new AuthError("Password does not meet requirements", AuthErrorCode.WEAK_PASSWORD, 400);
    }

    // Find and update user
    const user = Array.from(this.db.users.values()).find((u) => u.email === email);

    if (!user) {
      throw new AuthError("User not found", AuthErrorCode.USER_NOT_FOUND, 404);
    }

    user.passwordHash = await this.hashPassword(data.password);
    user.updatedAt = new Date();

    // Remove reset token
    this.db.resetTokens.delete(data.token);

    // Log security event
    this.logSecurityEvent({
      event: "PASSWORD_RESET_SUCCESS",
      email,
      userId: user.id,
      timestamp: new Date(),
      success: true,
    });

    this.saveToStorage();
  }

  async updatePassword(oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new AuthError("Not authenticated", AuthErrorCode.NOT_AUTHENTICATED, 401);
    }

    const userWithPassword = this.db.users.get(user.id);
    if (!userWithPassword) {
      throw new AuthError("User not found", AuthErrorCode.USER_NOT_FOUND, 404);
    }

    // Verify old password
    const isValid = await this.verifyPassword(oldPassword, userWithPassword.passwordHash);
    if (!isValid) {
      throw new AuthError("Invalid current password", AuthErrorCode.INVALID_CREDENTIALS, 401);
    }

    // Validate new password
    if (!this.validatePassword(newPassword)) {
      throw new AuthError("Password does not meet requirements", AuthErrorCode.WEAK_PASSWORD, 400);
    }

    userWithPassword.passwordHash = await this.hashPassword(newPassword);
    userWithPassword.updatedAt = new Date();

    this.saveToStorage();
  }

  async getPendingResets(): Promise<Record<string, string>> {
    const resets: Record<string, string> = {};
    this.db.resetTokens.forEach((data, token) => {
      resets[data.email] = token;
    });
    return resets;
  }

  // Profile Management
  async updateProfile(data: ProfileUpdateData): Promise<User> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new AuthError("Not authenticated", AuthErrorCode.NOT_AUTHENTICATED, 401);
    }

    const userWithPassword = this.db.users.get(user.id);
    if (!userWithPassword) {
      throw new AuthError("User not found", AuthErrorCode.USER_NOT_FOUND, 404);
    }

    // Update profile fields
    if (data.name !== undefined) userWithPassword.name = this.sanitizeInput(data.name);
    if (data.bio !== undefined) {
      userWithPassword.metadata = userWithPassword.metadata || {};
      userWithPassword.metadata.bio = this.sanitizeInput(data.bio);
    }
    if (data.company !== undefined) {
      userWithPassword.metadata = userWithPassword.metadata || {};
      userWithPassword.metadata.company = this.sanitizeInput(data.company);
    }
    if (data.location !== undefined) {
      userWithPassword.metadata = userWithPassword.metadata || {};
      userWithPassword.metadata.location = this.sanitizeInput(data.location);
    }
    if (data.website !== undefined) {
      userWithPassword.metadata = userWithPassword.metadata || {};
      userWithPassword.metadata.website = data.website;
    }
    if (data.preferences !== undefined) {
      userWithPassword.metadata = userWithPassword.metadata || {};
      userWithPassword.metadata.preferences = {
        ...userWithPassword.metadata.preferences,
        ...data.preferences,
      };
    }

    userWithPassword.updatedAt = new Date();

    this.saveToStorage();

    const { passwordHash, ...userWithoutPassword } = userWithPassword;
    return userWithoutPassword;
  }

  async uploadAvatar(file: File): Promise<string> {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new AuthError("File size too large (max 5MB)", AuthErrorCode.FILE_TOO_LARGE, 400);
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      throw new AuthError(
        "Invalid file type (only JPEG, PNG, GIF allowed)",
        AuthErrorCode.INVALID_FILE_TYPE,
        400,
      );
    }

    const user = await this.getCurrentUser();
    if (!user) {
      throw new AuthError("Not authenticated", AuthErrorCode.NOT_AUTHENTICATED, 401);
    }

    // Mock upload - return a fake URL
    const avatarUrl = `https://storage.example.com/avatars/${user.id}-${Date.now()}.${file.name.split(".").pop()}`;

    const userWithPassword = this.db.users.get(user.id);
    if (userWithPassword) {
      userWithPassword.avatar = avatarUrl;
      userWithPassword.updatedAt = new Date();
    }

    this.saveToStorage();

    return avatarUrl;
  }

  async deleteAccount(): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new AuthError("Not authenticated", AuthErrorCode.NOT_AUTHENTICATED, 401);
    }

    // Delete user and all associated data
    this.db.users.delete(user.id);
    this.db.oauthLinks.delete(user.id);
    this.db.mfaSecrets.delete(user.id);
    this.db.mfaBackupCodes.delete(user.id);

    // Delete all user sessions
    Array.from(this.db.sessions.entries()).forEach(([token, session]) => {
      if (session.userId === user.id) {
        this.db.sessions.delete(token);
      }
    });

    // Delete all user refresh tokens
    Array.from(this.db.refreshTokens.entries()).forEach(([token, data]) => {
      if (data.userId === user.id) {
        this.db.refreshTokens.delete(token);
      }
    });

    // Sign out
    await this.signOut();

    this.saveToStorage();
  }

  // Multi-Factor Authentication
  async enableMFA(): Promise<MFASetup> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new AuthError("Not authenticated", AuthErrorCode.NOT_AUTHENTICATED, 401);
    }

    // Generate secret for TOTP
    const secret = this.generateToken(32);
    this.db.mfaSecrets.set(user.id, secret);

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => this.generateToken(8));
    this.db.mfaBackupCodes.set(user.id, backupCodes);

    // Generate QR code URL (mock)
    const qrCode = `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=otpauth://totp/MockApp:${user.email}?secret=${secret}`;

    this.saveToStorage();

    return {
      secret,
      qrCode,
      backupCodes,
      verificationRequired: true,
    };
  }

  async verifyMFA(code: string, userId?: string): Promise<boolean> {
    // Use provided userId or get current user
    let user: User | null = null;
    if (userId) {
      const userWithPassword = this.db.users.get(userId);
      if (userWithPassword) {
        const { passwordHash, ...userWithoutPassword } = userWithPassword;
        user = userWithoutPassword;
      }
    } else {
      user = await this.getCurrentUser();
    }

    if (!user) return false;

    // Mock verification - in real implementation, use TOTP library
    // For testing, accept '123456' as valid code
    if (code === "123456") {
      const userWithPassword = this.db.users.get(user.id);
      if (userWithPassword) {
        userWithPassword.mfaEnabled = true;
        userWithPassword.updatedAt = new Date();
        this.saveToStorage();
      }
      return true;
    }

    // Check backup codes
    const backupCodes = this.db.mfaBackupCodes.get(user.id);
    if (backupCodes && backupCodes.includes(code)) {
      // Remove used backup code
      const updatedCodes = backupCodes.filter((c) => c !== code);
      this.db.mfaBackupCodes.set(user.id, updatedCodes);
      this.saveToStorage();
      return true;
    }

    return false;
  }

  async disableMFA(): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new AuthError("Not authenticated", AuthErrorCode.NOT_AUTHENTICATED, 401);
    }

    const userWithPassword = this.db.users.get(user.id);
    if (userWithPassword) {
      userWithPassword.mfaEnabled = false;
      userWithPassword.updatedAt = new Date();
    }

    this.db.mfaSecrets.delete(user.id);
    this.db.mfaBackupCodes.delete(user.id);

    this.saveToStorage();
  }

  async generateBackupCodes(): Promise<string[]> {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new AuthError("Not authenticated", AuthErrorCode.NOT_AUTHENTICATED, 401);
    }

    const backupCodes = Array.from({ length: 10 }, () => this.generateToken(8));
    this.db.mfaBackupCodes.set(user.id, backupCodes);

    this.saveToStorage();

    return backupCodes;
  }

  // Security
  async getCSRFToken(): Promise<string> {
    const token = this.generateToken(32);
    this.db.csrfTokens.add(token);

    // Clean old tokens (keep last 100)
    if (this.db.csrfTokens.size > 100) {
      const tokens = Array.from(this.db.csrfTokens);
      tokens.slice(0, -100).forEach((t) => this.db.csrfTokens.delete(t));
    }

    this.saveToStorage();
    return token;
  }

  async getSecurityLog(email: string): Promise<SecurityLog[]> {
    return this.db.securityLogs.filter((log) => log.email === email);
  }

  // Helper methods
  private async createSession(user: User, rememberMe: boolean = false): Promise<Session> {
    const accessToken = this.generateToken(32);
    const refreshToken = this.generateToken(32);

    const session: Session = {
      userId: user.id,
      accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      createdAt: new Date(),
    };

    this.db.sessions.set(accessToken, session);
    this.db.refreshTokens.set(refreshToken, {
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    this.currentSession = session;

    // Store session based on rememberMe
    const sessionData = {
      userId: user.id,
      accessToken,
      refreshToken,
      expiresAt: session.expiresAt.toISOString(),
    };

    if (rememberMe) {
      localStorage.setItem("auth_session", JSON.stringify(sessionData));
    } else {
      sessionStorage.setItem("auth_session", JSON.stringify(sessionData));
    }

    return session;
  }

  private getStoredSession(): Session | null {
    const stored = localStorage.getItem("auth_session") || sessionStorage.getItem("auth_session");

    if (!stored) return null;

    try {
      const data = JSON.parse(stored);
      return {
        userId: data.userId,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: new Date(data.expiresAt),
        createdAt: new Date(),
      };
    } catch {
      return null;
    }
  }

  private recordFailedAttempt(email: string, ip?: string): void {
    // Record email attempt
    const emailAttempts = this.db.loginAttempts.get(email) || { count: 0, lastAttempt: new Date() };
    emailAttempts.count++;
    emailAttempts.lastAttempt = new Date();
    this.db.loginAttempts.set(email, emailAttempts);

    // Record IP attempt
    if (ip) {
      const ipAttempts = this.db.ipAttempts.get(ip) || { count: 0, lastAttempt: new Date() };
      ipAttempts.count++;
      ipAttempts.lastAttempt = new Date();
      this.db.ipAttempts.set(ip, ipAttempts);
    }

    // Log security event
    this.logSecurityEvent({
      event: "LOGIN_FAILED",
      email,
      timestamp: new Date(),
      success: false,
      ip,
    });

    this.saveToStorage();
  }

  private logSecurityEvent(log: SecurityLog): void {
    this.db.securityLogs.push(log);

    // Keep only last 1000 logs
    if (this.db.securityLogs.length > 1000) {
      this.db.securityLogs = this.db.securityLogs.slice(-1000);
    }
  }

  private saveToStorage(): void {
    // In a real implementation, this would persist to a database
    // For mock, we can optionally save to localStorage for demo persistence
    if (typeof window !== "undefined") {
      try {
        const data = {
          users: Array.from(this.db.users.entries()),
          sessions: Array.from(this.db.sessions.entries()),
          refreshTokens: Array.from(this.db.refreshTokens.entries()),
          verificationTokens: Array.from(this.db.verificationTokens.entries()),
          resetTokens: Array.from(this.db.resetTokens.entries()),
          oauthLinks: Array.from(this.db.oauthLinks.entries()).map(([k, v]) => [k, Array.from(v)]),
          mfaSecrets: Array.from(this.db.mfaSecrets.entries()),
          mfaBackupCodes: Array.from(this.db.mfaBackupCodes.entries()),
          securityLogs: this.db.securityLogs,
        };
        localStorage.setItem("mock_auth_db", JSON.stringify(data));
      } catch (e) {
        // Storage might be full or unavailable
        console.warn("Failed to save auth data to storage:", e);
      }
    }
  }

  private loadFromStorage(): void {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("mock_auth_db");
        if (stored) {
          const data = JSON.parse(stored);

          // Restore users with Date objects
          this.db.users = new Map(
            data.users?.map(([k, v]: [string, any]) => [
              k,
              {
                ...v,
                createdAt: new Date(v.createdAt),
                updatedAt: new Date(v.updatedAt),
              },
            ]) || [],
          );

          // Restore sessions with Date objects
          this.db.sessions = new Map(
            data.sessions?.map(([k, v]: [string, any]) => [
              k,
              {
                ...v,
                expiresAt: new Date(v.expiresAt),
                createdAt: new Date(v.createdAt),
              },
            ]) || [],
          );

          // Restore refresh tokens with Date objects
          this.db.refreshTokens = new Map(
            data.refreshTokens?.map(([k, v]: [string, any]) => [
              k,
              {
                ...v,
                expiresAt: new Date(v.expiresAt),
              },
            ]) || [],
          );

          this.db.verificationTokens = new Map(data.verificationTokens || []);

          // Restore reset tokens with Date objects
          this.db.resetTokens = new Map(
            data.resetTokens?.map(([k, v]: [string, any]) => [
              k,
              {
                email: v.email,
                createdAt: new Date(v.createdAt),
              },
            ]) || [],
          );

          // Restore OAuth links as Sets
          this.db.oauthLinks = new Map(
            data.oauthLinks?.map(([k, v]: [string, string[]]) => [k, new Set(v)]) || [],
          );

          this.db.mfaSecrets = new Map(data.mfaSecrets || []);
          this.db.mfaBackupCodes = new Map(data.mfaBackupCodes || []);

          // Restore security logs with Date objects
          this.db.securityLogs = (data.securityLogs || []).map((log: any) => ({
            ...log,
            timestamp: new Date(log.timestamp),
          }));
        }
      } catch (e) {
        console.warn("Failed to load auth data from storage:", e);
      }
    }
  }
}
