/**
 * Auth Service Storybook Stories
 * Interactive playground for testing authentication flows
 */

import React, { useState, useEffect, useCallback } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { MockAuthService } from "../../services/auth/MockAuthService";
import { AuthService } from "../../services/auth/AuthService";
import {
  User,
  Session,
  SignUpData,
  SignInData,
  AuthError,
  AuthErrorCode,
} from "../../services/auth/types";

// Create a global instance for the story
let authService: AuthService;

// Component to demonstrate Auth Service
const AuthServicePlayground: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [signUpForm, setSignUpForm] = useState<SignUpData>({
    email: "",
    password: "",
    name: "",
    acceptTerms: false,
    marketingConsent: false,
  });

  const [signInForm, setSignInForm] = useState<SignInData>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [resetEmail, setResetEmail] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  // Initialize service
  useEffect(() => {
    if (!authService) {
      authService = new MockAuthService({
        passwordMinLength: 8,
        passwordRequireUppercase: true,
        passwordRequireNumbers: true,
        maxLoginAttempts: 3,
        lockoutDuration: 900,
      });
    }

    // Check for existing session
    checkSession();
  }, [checkSession]);

  const addLog = (message: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev].slice(0, 20));
  };

  const checkSession = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();
      const session = await authService.getSession();
      setCurrentUser(user);
      setSession(session);
      if (user) {
        addLog(`Session restored for ${user.email}`);
      }
    } catch (err) {
      console.error("Session check failed:", err);
    }
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await authService.signUp(signUpForm);
      setCurrentUser(result.user);
      setSession(result.session);
      setSuccess(
        `Successfully registered ${result.user.email}! Check console for verification token.`,
      );
      addLog(`User registered: ${result.user.email}`);

      // Get pending verifications for demo
      const pending = await authService.getPendingVerifications();
      addLog(`Pending verifications: ${pending.join(", ")}`);
    } catch (err) {
      const error = err as AuthError;
      setError(`Sign up failed: ${error.message} (${error.code})`);
      addLog(`Sign up error: ${error.code}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await authService.signIn(signInForm);
      setCurrentUser(result.user);
      setSession(result.session);
      setSuccess(`Welcome back, ${result.user.name || result.user.email}!`);
      addLog(`User signed in: ${result.user.email}`);
    } catch (err) {
      const error = err as AuthError;
      setError(`Sign in failed: ${error.message} (${error.code})`);
      addLog(`Sign in error: ${error.code}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setCurrentUser(null);
      setSession(null);
      setSuccess("Successfully signed out");
      addLog("User signed out");
    } catch (err) {
      setError("Sign out failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await authService.resetPassword({ email: resetEmail });
      setSuccess(result.message);
      addLog(`Password reset requested for ${resetEmail}`);

      // Get reset tokens for demo
      const resets = await authService.getPendingResets();
      console.log("Reset tokens:", resets);
      addLog(`Active reset tokens: ${Object.keys(resets).length}`);
    } catch (err) {
      const error = err as AuthError;
      setError(`Reset failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setLoading(true);
    try {
      const url =
        provider === "google"
          ? await authService.signInWithGoogle()
          : await authService.signInWithGitHub();

      addLog(`OAuth URL generated for ${provider}`);
      console.log(`${provider} OAuth URL:`, url);
      setSuccess(`OAuth URL generated (check console). In production, this would redirect.`);
    } catch (err) {
      setError(`OAuth failed: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEnableMFA = async () => {
    setLoading(true);
    try {
      const mfaSetup = await authService.enableMFA();
      console.log("MFA Setup:", mfaSetup);
      setSuccess("MFA enabled! Check console for setup details.");
      addLog("MFA enabled for account");

      // Auto-verify for demo
      await authService.verifyMFA("123456");
      addLog("MFA verified with code: 123456");
    } catch (err) {
      setError(`MFA setup failed: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🔐 Auth Service Playground</h1>
        <p className="text-gray-600">Test authentication flows with the mock service</p>
      </div>

      {/* Current Status */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Current Status</h2>
        {currentUser ? (
          <div className="space-y-2">
            <p>
              <strong>User:</strong> {currentUser.email}
            </p>
            <p>
              <strong>Name:</strong> {currentUser.name}
            </p>
            <p>
              <strong>Role:</strong> {currentUser.role}
            </p>
            <p>
              <strong>Email Verified:</strong> {currentUser.emailVerified ? "✅" : "❌"}
            </p>
            <p>
              <strong>MFA Enabled:</strong> {currentUser.mfaEnabled ? "✅" : "❌"}
            </p>
            {session && (
              <>
                <p>
                  <strong>Session:</strong> Active
                </p>
                <p>
                  <strong>Expires:</strong> {new Date(session.expiresAt).toLocaleString()}
                </p>
              </>
            )}
            <button
              onClick={handleSignOut}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              disabled={loading}
            >
              Sign Out
            </button>
            {!currentUser.mfaEnabled && (
              <button
                onClick={handleEnableMFA}
                className="mt-2 ml-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                disabled={loading}
              >
                Enable MFA
              </button>
            )}
          </div>
        ) : (
          <p className="text-gray-500">Not authenticated</p>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sign Up Form */}
        {!currentUser && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Sign Up</h2>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={signUpForm.email}
                  onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={signUpForm.password}
                  onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Min 8 chars, uppercase, numbers required
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={signUpForm.name}
                  onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={signUpForm.acceptTerms}
                    onChange={(e) =>
                      setSignUpForm({ ...signUpForm, acceptTerms: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm">Accept Terms & Conditions</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={signUpForm.marketingConsent}
                    onChange={(e) =>
                      setSignUpForm({ ...signUpForm, marketingConsent: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm">Receive marketing emails</span>
                </label>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={loading}
              >
                {loading ? "Processing..." : "Sign Up"}
              </button>
            </form>
          </div>
        )}

        {/* Sign In Form */}
        {!currentUser && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Sign In</h2>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={signInForm.email}
                  onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={signInForm.password}
                  onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={signInForm.rememberMe}
                    onChange={(e) => setSignInForm({ ...signInForm, rememberMe: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm">Remember me</span>
                </label>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                disabled={loading}
              >
                {loading ? "Processing..." : "Sign In"}
              </button>

              <div className="border-t pt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn("google")}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  disabled={loading}
                >
                  Sign in with Google
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn("github")}
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
                  disabled={loading}
                >
                  Sign in with GitHub
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Password Reset */}
        {!currentUser && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Password Reset</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter your email"
                />
              </div>
              <button
                onClick={handlePasswordReset}
                className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                disabled={loading || !resetEmail}
              >
                Send Reset Email
              </button>
            </div>
          </div>
        )}

        {/* Activity Log */}
        <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Activity Log</h2>
          <div className="bg-gray-50 p-4 rounded h-64 overflow-y-auto">
            {logs.length > 0 ? (
              <ul className="space-y-1">
                {logs.map((log, index) => (
                  <li key={index} className="text-sm font-mono text-gray-600">
                    {log}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No activity yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Test Accounts */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">🧪 Test Accounts</h3>
        <p className="text-sm text-gray-600 mb-2">Use these for quick testing:</p>
        <ul className="text-sm space-y-1">
          <li>
            <strong>New User:</strong> test@example.com / TestPass123!
          </li>
          <li>
            <strong>OAuth:</strong> Click Google/GitHub buttons (generates mock URLs)
          </li>
          <li>
            <strong>MFA Code:</strong> Always use "123456" for testing
          </li>
          <li>
            <strong>Reset Token:</strong> Check console after requesting reset
          </li>
        </ul>
      </div>
    </div>
  );
};

// Storybook configuration
const meta = {
  title: "Services/Auth Service",
  component: AuthServicePlayground,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Interactive playground for testing authentication flows with the mock AuthService.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AuthServicePlayground>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Playground: Story = {
  name: "🎮 Interactive Playground",
};

// Pre-configured stories for specific scenarios
export const SignUpFlow: Story = {
  name: "📝 Sign Up Flow",
  parameters: {
    docs: {
      description: {
        story: "Test the complete sign-up flow including validation and email verification.",
      },
    },
  },
};

export const SignInFlow: Story = {
  name: "🔑 Sign In Flow",
  parameters: {
    docs: {
      description: {
        story: "Test sign-in with email/password and OAuth providers.",
      },
    },
  },
};

export const PasswordReset: Story = {
  name: "🔒 Password Reset",
  parameters: {
    docs: {
      description: {
        story: "Test the password reset flow with token generation.",
      },
    },
  },
};

export const MFASetup: Story = {
  name: "🛡️ MFA Setup",
  parameters: {
    docs: {
      description: {
        story: "Test multi-factor authentication setup and verification.",
      },
    },
  },
};
