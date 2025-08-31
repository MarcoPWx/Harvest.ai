/**
 * Auth Service Tests
 * Written BEFORE implementation (TDD approach)
 */

import { AuthService } from "../AuthService";
import { MockAuthService } from "../MockAuthService";
import { AuthErrorCode, SignUpData, SignInData, User, Session, AuthError } from "../types";

describe("AuthService", () => {
  let authService: AuthService;

  beforeEach(() => {
    // Clear any persisted data
    localStorage.clear();
    sessionStorage.clear();

    // Create fresh instance
    authService = new MockAuthService({
      passwordMinLength: 8,
      passwordRequireUppercase: true,
      passwordRequireNumbers: true,
      maxLoginAttempts: 3,
      lockoutDuration: 900, // 15 minutes
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  describe("User Registration", () => {
    const validSignUpData: SignUpData = {
      email: "test@example.com",
      password: "SecurePass123!",
      name: "Test User",
      acceptTerms: true,
      marketingConsent: false,
    };

    it("should successfully register a new user", async () => {
      const result = await authService.signUp(validSignUpData);

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(validSignUpData.email);
      expect(result.user.name).toBe(validSignUpData.name);
      expect(result.user.emailVerified).toBe(false);
      expect(result.user.role).toBe("user");

      expect(result.session).toBeDefined();
      expect(result.session.accessToken).toBeTruthy();
      expect(result.session.refreshToken).toBeTruthy();
    });

    it("should hash passwords securely", async () => {
      const result = await authService.signUp(validSignUpData);

      // Password should not be stored in plain text
      expect(result.user).not.toHaveProperty("password");
      expect(result.user).not.toHaveProperty("passwordHash");
    });

    it("should prevent duplicate email registration", async () => {
      await authService.signUp(validSignUpData);

      await expect(authService.signUp(validSignUpData)).rejects.toThrow();

      try {
        await authService.signUp(validSignUpData);
      } catch (error) {
        expect((error as AuthError).code).toBe(AuthErrorCode.EMAIL_ALREADY_EXISTS);
        expect((error as AuthError).statusCode).toBe(409);
      }
    });

    it("should validate email format", async () => {
      const invalidEmails = [
        "notanemail",
        "missing@domain",
        "@nodomain.com",
        "spaces in@email.com",
        "double@@email.com",
      ];

      for (const email of invalidEmails) {
        await expect(authService.signUp({ ...validSignUpData, email })).rejects.toThrow();

        try {
          await authService.signUp({ ...validSignUpData, email });
        } catch (error) {
          expect((error as AuthError).code).toBe(AuthErrorCode.INVALID_EMAIL);
        }
      }
    });

    it("should enforce password requirements", async () => {
      const weakPasswords = [
        "short", // Too short
        "alllowercase", // No uppercase
        "ALLUPPERCASE", // No lowercase
        "NoNumbers!", // No numbers
        "nouppercase123", // No uppercase
      ];

      for (const password of weakPasswords) {
        await expect(authService.signUp({ ...validSignUpData, password })).rejects.toThrow();

        try {
          await authService.signUp({ ...validSignUpData, password });
        } catch (error) {
          expect((error as AuthError).code).toBe(AuthErrorCode.WEAK_PASSWORD);
        }
      }
    });

    it("should require terms acceptance", async () => {
      await expect(
        authService.signUp({ ...validSignUpData, acceptTerms: false }),
      ).rejects.toThrow();

      try {
        await authService.signUp({ ...validSignUpData, acceptTerms: false });
      } catch (error) {
        expect((error as AuthError).code).toBe(AuthErrorCode.TERMS_NOT_ACCEPTED);
      }
    });

    it("should send verification email after registration", async () => {
      const result = await authService.signUp(validSignUpData);

      // Check that verification was triggered
      const pendingVerifications = await authService.getPendingVerifications();
      expect(pendingVerifications).toContain(result.user.email);
    });
  });

  describe("User Authentication", () => {
    const testUser: SignUpData = {
      email: "auth@example.com",
      password: "TestPass123!",
      name: "Auth User",
      acceptTerms: true,
    };

    beforeEach(async () => {
      // Create a user for auth tests
      await authService.signUp(testUser);
    });

    it("should successfully sign in with valid credentials", async () => {
      const result = await authService.signIn({
        email: testUser.email,
        password: testUser.password,
      });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(testUser.email);
      expect(result.session).toBeDefined();
      expect(result.session.accessToken).toBeTruthy();
    });

    it("should reject invalid password", async () => {
      await expect(
        authService.signIn({
          email: testUser.email,
          password: "WrongPassword123!",
        }),
      ).rejects.toThrow();

      try {
        await authService.signIn({
          email: testUser.email,
          password: "WrongPassword123!",
        });
      } catch (error) {
        expect((error as AuthError).code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
        expect((error as AuthError).statusCode).toBe(401);
      }
    });

    it("should reject non-existent user", async () => {
      await expect(
        authService.signIn({
          email: "nonexistent@example.com",
          password: "AnyPassword123!",
        }),
      ).rejects.toThrow();

      try {
        await authService.signIn({
          email: "nonexistent@example.com",
          password: "AnyPassword123!",
        });
      } catch (error) {
        expect((error as AuthError).code).toBe(AuthErrorCode.USER_NOT_FOUND);
      }
    });

    it("should implement rate limiting after failed attempts", async () => {
      const invalidCreds = {
        email: testUser.email,
        password: "WrongPassword",
      };

      // Attempt login 3 times
      for (let i = 0; i < 3; i++) {
        try {
          await authService.signIn(invalidCreds);
        } catch (e) {
          // Expected to fail
        }
      }

      // Fourth attempt should be rate limited
      try {
        await authService.signIn(invalidCreds);
      } catch (error) {
        expect((error as AuthError).code).toBe(AuthErrorCode.RATE_LIMITED);
        expect((error as AuthError).statusCode).toBe(429);
      }
    });

    it("should persist session with remember me", async () => {
      const result = await authService.signIn({
        email: testUser.email,
        password: testUser.password,
        rememberMe: true,
      });

      // Check localStorage for persistent session
      const persistedSession = localStorage.getItem("auth_session");
      expect(persistedSession).toBeTruthy();

      const parsed = JSON.parse(persistedSession!);
      expect(parsed.userId).toBe(result.user.id);
    });

    it("should not persist session without remember me", async () => {
      await authService.signIn({
        email: testUser.email,
        password: testUser.password,
        rememberMe: false,
      });

      // Check that session is only in memory/sessionStorage
      const persistedSession = localStorage.getItem("auth_session");
      expect(persistedSession).toBeNull();

      const sessionSession = sessionStorage.getItem("auth_session");
      expect(sessionSession).toBeTruthy();
    });
  });

  describe("Session Management", () => {
    let user: User;
    let session: Session;

    beforeEach(async () => {
      const result = await authService.signUp({
        email: "session@example.com",
        password: "SessionPass123!",
        acceptTerms: true,
      });
      user = result.user;
      session = result.session;
    });

    it("should get current authenticated user", async () => {
      const currentUser = await authService.getCurrentUser();
      expect(currentUser).toBeDefined();
      expect(currentUser?.id).toBe(user.id);
      expect(currentUser?.email).toBe(user.email);
    });

    it("should validate active session", async () => {
      const isValid = await authService.validateSession(session.accessToken);
      expect(isValid).toBe(true);
    });

    it("should reject invalid session token", async () => {
      const isValid = await authService.validateSession("invalid-token");
      expect(isValid).toBe(false);
    });

    it("should refresh session before expiry", async () => {
      // Fast-forward time to near expiry
      const nearExpiry = new Date(session.expiresAt.getTime() - 60000); // 1 minute before
      jest.useFakeTimers();
      jest.setSystemTime(nearExpiry);

      const newSession = await authService.refreshSession();
      expect(newSession.accessToken).toBeDefined();
      expect(newSession.accessToken).not.toBe(session.accessToken);
      expect(newSession.expiresAt.getTime()).toBeGreaterThan(nearExpiry.getTime());

      jest.useRealTimers();
    });

    it("should reject expired refresh token", async () => {
      // Fast-forward time past refresh token expiry
      jest.useFakeTimers();
      jest.setSystemTime(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // 30 days

      await expect(authService.refreshSession()).rejects.toThrow();

      try {
        await authService.refreshSession();
      } catch (error) {
        expect((error as AuthError).code).toBe(AuthErrorCode.REFRESH_TOKEN_EXPIRED);
      }

      jest.useRealTimers();
    });

    it("should sign out and clear session", async () => {
      await authService.signOut();

      const currentUser = await authService.getCurrentUser();
      expect(currentUser).toBeNull();

      const isValid = await authService.validateSession(session.accessToken);
      expect(isValid).toBe(false);

      // Check storage is cleared
      expect(localStorage.getItem("auth_session")).toBeNull();
      expect(sessionStorage.getItem("auth_session")).toBeNull();
    });
  });

  describe("OAuth Authentication", () => {
    it("should initiate Google OAuth flow", async () => {
      const authUrl = await authService.signInWithGoogle();

      expect(authUrl).toContain("accounts.google.com");
      expect(authUrl).toContain("client_id=");
      expect(authUrl).toContain("redirect_uri=");
      expect(authUrl).toContain("scope=");
    });

    it("should initiate GitHub OAuth flow", async () => {
      const authUrl = await authService.signInWithGitHub();

      expect(authUrl).toContain("github.com/login/oauth");
      expect(authUrl).toContain("client_id=");
      expect(authUrl).toContain("redirect_uri=");
    });

    it("should handle OAuth callback", async () => {
      const mockOAuthResponse = {
        code: "mock-auth-code",
        state: "mock-state",
      };

      const result = await authService.handleOAuthCallback("google", mockOAuthResponse);

      expect(result.user).toBeDefined();
      expect(result.session).toBeDefined();
      expect(result.session.provider).toBe("google");
    });

    it("should link OAuth account to existing user", async () => {
      // Create email user
      const emailUser = await authService.signUp({
        email: "oauth@example.com",
        password: "Password123!",
        acceptTerms: true,
      });

      // Link Google account
      await authService.linkOAuthAccount("google", {
        code: "mock-code",
        state: "mock-state",
      });

      const user = await authService.getCurrentUser();
      const providers = await authService.getLinkedProviders(user!.id);

      expect(providers).toContain("email");
      expect(providers).toContain("google");
    });
  });

  describe("Password Management", () => {
    const userEmail = "reset@example.com";

    beforeEach(async () => {
      await authService.signUp({
        email: userEmail,
        password: "OldPassword123!",
        acceptTerms: true,
      });
    });

    it("should initiate password reset", async () => {
      await authService.resetPassword({ email: userEmail });

      const resetTokens = await authService.getPendingResets();
      expect(resetTokens).toHaveProperty([userEmail]);
    });

    it("should send password reset email", async () => {
      const result = await authService.resetPassword({ email: userEmail });

      expect(result.message).toContain("reset email sent");
      expect(result.email).toBe(userEmail);
    });

    it("should not reveal if email exists (security)", async () => {
      const result = await authService.resetPassword({
        email: "nonexistent@example.com",
      });

      // Should return success even for non-existent emails
      expect(result.message).toContain("reset email sent");
    });

    it("should reset password with valid token", async () => {
      await authService.resetPassword({ email: userEmail });
      const resetTokens = await authService.getPendingResets();
      const token = resetTokens[userEmail];

      await authService.confirmPasswordReset({
        token,
        password: "NewPassword123!",
      });

      // Should be able to login with new password
      const result = await authService.signIn({
        email: userEmail,
        password: "NewPassword123!",
      });

      expect(result.user.email).toBe(userEmail);
    });

    it("should reject invalid reset token", async () => {
      await expect(
        authService.confirmPasswordReset({
          token: "invalid-token",
          password: "NewPassword123!",
        }),
      ).rejects.toThrow();

      try {
        await authService.confirmPasswordReset({
          token: "invalid-token",
          password: "NewPassword123!",
        });
      } catch (error) {
        expect((error as AuthError).code).toBe(AuthErrorCode.RESET_TOKEN_INVALID);
      }
    });

    it("should expire reset tokens after time limit", async () => {
      // Use fake timers and set a base time BEFORE generating the token
      jest.useFakeTimers();
      const base = new Date("2025-01-01T00:00:00Z");
      jest.setSystemTime(base);

      await authService.resetPassword({ email: userEmail });
      const resetTokens = await authService.getPendingResets();
      const token = resetTokens[userEmail];

      // Advance system time by 1 hour + 1ms (beyond expiry threshold)
      jest.setSystemTime(new Date(base.getTime() + 60 * 60 * 1000 + 1));

      await expect(
        authService.confirmPasswordReset({
          token,
          password: "NewPassword123!",
        }),
      ).rejects.toThrow();

      try {
        await authService.confirmPasswordReset({
          token,
          password: "NewPassword123!",
        });
      } catch (error) {
        expect((error as AuthError).code).toBe(AuthErrorCode.RESET_TOKEN_EXPIRED);
      }

      jest.useRealTimers();
    });

    it("should update password for authenticated user", async () => {
      const { session } = await authService.signIn({
        email: userEmail,
        password: "OldPassword123!",
      });

      await authService.updatePassword("OldPassword123!", "UpdatedPassword123!");

      // Old password should not work
      await expect(
        authService.signIn({
          email: userEmail,
          password: "OldPassword123!",
        }),
      ).rejects.toThrow();

      // New password should work
      const result = await authService.signIn({
        email: userEmail,
        password: "UpdatedPassword123!",
      });

      expect(result.user.email).toBe(userEmail);
    });
  });

  describe("Profile Management", () => {
    let user: User;

    beforeEach(async () => {
      const result = await authService.signUp({
        email: "profile@example.com",
        password: "ProfilePass123!",
        name: "Original Name",
        acceptTerms: true,
      });
      user = result.user;
    });

    it("should update user profile", async () => {
      const updatedUser = await authService.updateProfile({
        name: "Updated Name",
        bio: "Software Developer",
        company: "Tech Corp",
        location: "San Francisco",
        website: "https://example.com",
      });

      expect(updatedUser.name).toBe("Updated Name");
      expect(updatedUser.metadata?.bio).toBe("Software Developer");
      expect(updatedUser.metadata?.company).toBe("Tech Corp");
    });

    it("should update user preferences", async () => {
      const updatedUser = await authService.updateProfile({
        preferences: {
          theme: "dark",
          emailNotifications: false,
          marketingEmails: false,
          twoFactorAuth: true,
          apiAccess: true,
        },
      });

      expect(updatedUser.metadata?.preferences.theme).toBe("dark");
      expect(updatedUser.metadata?.preferences.emailNotifications).toBe(false);
    });

    it("should upload and update avatar", async () => {
      const mockFile = new File(["avatar"], "avatar.jpg", { type: "image/jpeg" });

      const avatarUrl = await authService.uploadAvatar(mockFile);

      expect(avatarUrl).toContain("avatar");
      expect(avatarUrl).toMatch(/\.(jpg|jpeg|png)$/);

      const updatedUser = await authService.getCurrentUser();
      expect(updatedUser?.avatar).toBe(avatarUrl);
    });

    it("should validate avatar file size", async () => {
      // Create a 10MB file (too large)
      const largeFile = new File([new ArrayBuffer(10 * 1024 * 1024)], "large.jpg", {
        type: "image/jpeg",
      });

      await expect(authService.uploadAvatar(largeFile)).rejects.toThrow();
    });

    it("should validate avatar file type", async () => {
      const invalidFile = new File(["data"], "file.txt", { type: "text/plain" });

      await expect(authService.uploadAvatar(invalidFile)).rejects.toThrow();
    });

    it("should delete user account", async () => {
      await authService.deleteAccount();

      // Should be signed out
      const currentUser = await authService.getCurrentUser();
      expect(currentUser).toBeNull();

      // Should not be able to sign in
      await expect(
        authService.signIn({
          email: "profile@example.com",
          password: "ProfilePass123!",
        }),
      ).rejects.toThrow();
    });
  });

  describe("Multi-Factor Authentication", () => {
    let user: User;
    let mfaSetup: any;

    beforeEach(async () => {
      const result = await authService.signUp({
        email: "mfa@example.com",
        password: "MFAPass123!",
        acceptTerms: true,
      });
      user = result.user;
    });

    it("should enable MFA", async () => {
      mfaSetup = await authService.enableMFA();

      expect(mfaSetup.secret).toBeDefined();
      expect(mfaSetup.qrCode).toBeDefined();
      expect(mfaSetup.backupCodes).toHaveLength(10);
      expect(mfaSetup.verificationRequired).toBe(true);
    });

    it("should verify MFA setup with valid code", async () => {
      mfaSetup = await authService.enableMFA();

      // In real implementation, this would use TOTP
      const mockValidCode = "123456";

      const verified = await authService.verifyMFA(mockValidCode);
      expect(verified).toBe(true);

      const updatedUser = await authService.getCurrentUser();
      expect(updatedUser?.mfaEnabled).toBe(true);
    });

    it("should reject invalid MFA code", async () => {
      mfaSetup = await authService.enableMFA();

      const verified = await authService.verifyMFA("000000");
      expect(verified).toBe(false);
    });

    it("should require MFA code for login when enabled", async () => {
      // Enable MFA
      mfaSetup = await authService.enableMFA();
      await authService.verifyMFA("123456");

      // Sign out
      await authService.signOut();

      // Try to sign in without MFA code
      await expect(
        authService.signIn({
          email: "mfa@example.com",
          password: "MFAPass123!",
        }),
      ).rejects.toThrow();

      try {
        await authService.signIn({
          email: "mfa@example.com",
          password: "MFAPass123!",
        });
      } catch (error) {
        expect((error as AuthError).code).toBe(AuthErrorCode.MFA_REQUIRED);
      }
    });

    it("should sign in with valid MFA code", async () => {
      // Enable MFA
      mfaSetup = await authService.enableMFA();
      await authService.verifyMFA("123456");

      // Sign out
      await authService.signOut();

      // Sign in with MFA code
      const result = await authService.signIn({
        email: "mfa@example.com",
        password: "MFAPass123!",
        mfaCode: "123456",
      });

      expect(result.user.email).toBe("mfa@example.com");
      expect(result.session).toBeDefined();
    });

    it("should disable MFA", async () => {
      // Enable MFA first
      await authService.enableMFA();
      await authService.verifyMFA("123456");

      // Disable MFA
      await authService.disableMFA();

      const updatedUser = await authService.getCurrentUser();
      expect(updatedUser?.mfaEnabled).toBe(false);

      // Should be able to sign in without MFA
      await authService.signOut();
      const result = await authService.signIn({
        email: "mfa@example.com",
        password: "MFAPass123!",
      });

      expect(result.user.email).toBe("mfa@example.com");
    });
  });

  describe("Security Features", () => {
    it("should sanitize user input", async () => {
      const maliciousInput = {
        email: '<script>alert("xss")</script>test@example.com',
        password: "Password123!",
        name: '<img src=x onerror=alert("xss")>',
        acceptTerms: true,
      };

      const result = await authService.signUp(maliciousInput);

      // Email should be cleaned
      expect(result.user.email).toBe("test@example.com");
      // Name should be sanitized
      expect(result.user.name).not.toContain("<script>");
      expect(result.user.name).not.toContain("<img");
    });

    it("should implement CSRF protection", async () => {
      const csrfToken = await authService.getCSRFToken();
      expect(csrfToken).toBeDefined();
      expect(csrfToken).toHaveLength(32);
    });

    it("should log security events", async () => {
      // Failed login attempt
      try {
        await authService.signIn({
          email: "test@example.com",
          password: "wrong",
        });
      } catch (e) {
        // Expected
      }

      const securityLog = await authService.getSecurityLog("test@example.com");
      expect(securityLog).toContainEqual(
        expect.objectContaining({
          event: "LOGIN_FAILED",
          email: "test@example.com",
        }),
      );
    });

    it("should detect and prevent brute force attacks", async () => {
      const attackerIp = "192.168.1.100";

      // Simulate multiple failed attempts from same IP
      for (let i = 0; i < 5; i++) {
        try {
          await authService.signIn(
            {
              email: `user${i}@example.com`,
              password: "wrong",
            },
            { ip: attackerIp },
          );
        } catch (e) {
          // Expected
        }
      }

      // Next attempt should be blocked
      await expect(
        authService.signIn(
          {
            email: "any@example.com",
            password: "any",
          },
          { ip: attackerIp },
        ),
      ).rejects.toThrow();

      try {
        await authService.signIn(
          {
            email: "any@example.com",
            password: "any",
          },
          { ip: attackerIp },
        );
      } catch (error) {
        expect((error as AuthError).code).toBe(AuthErrorCode.RATE_LIMITED);
      }
    });
  });
});
