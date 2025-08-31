/**
 * BYOK Dashboard Story
 * Interactive demonstration of Bring Your Own Key functionality
 */

import React, { useState, useEffect } from "react";
import { Meta, StoryObj } from "@storybook/react";
import {
  KeyIcon,
  ShieldCheckIcon,
  ClockIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BoltIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  TrashIcon,
  PlusIcon,
  DocumentDuplicateIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  validateApiKey,
  detectProvider,
  estimateTokens,
  calculateCost,
} from "@/lib/byok/validators";
import type { AIProvider, BYOKSession } from "@/types/api";

interface ProviderInfo {
  name: string;
  icon: string;
  color: string;
  models: string[];
  keyFormat: string;
  keyExample: string;
}

const providers: Record<AIProvider, ProviderInfo> = {
  openai: {
    name: "OpenAI",
    icon: "🤖",
    color: "bg-green-500",
    models: ["gpt-4-turbo-preview", "gpt-4", "gpt-3.5-turbo"],
    keyFormat: "sk-...",
    keyExample: "sk-proj-abc123...",
  },
  anthropic: {
    name: "Anthropic",
    icon: "🧠",
    color: "bg-purple-500",
    models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
    keyFormat: "sk-ant-...",
    keyExample: "sk-ant-api03-abc123...",
  },
  google: {
    name: "Google AI",
    icon: "✨",
    color: "bg-blue-500",
    models: ["gemini-pro", "gemini-pro-vision"],
    keyFormat: "AIza...",
    keyExample: "AIzaSyAbc123...",
  },
  azure: {
    name: "Azure OpenAI",
    icon: "☁️",
    color: "bg-sky-500",
    models: ["gpt-4", "gpt-35-turbo"],
    keyFormat: "Variable",
    keyExample: "abc123def456...",
  },
  custom: {
    name: "Custom Provider",
    icon: "⚙️",
    color: "bg-gray-500",
    models: ["custom"],
    keyFormat: "Any",
    keyExample: "your-api-key-here",
  },
};

const BYOKDashboard: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>("openai");
  const [apiKey, setApiKey] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [sessions, setSessions] = useState<BYOKSession[]>([]);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(60);
  const [testPrompt, setTestPrompt] = useState("Write a haiku about coding");
  const [costEstimate, setCostEstimate] = useState<number | null>(null);
  const [autoDetectedProvider, setAutoDetectedProvider] = useState<AIProvider | null>(null);

  // Mock session data for demo
  useEffect(() => {
    const mockSessions: BYOKSession[] = [
      {
        id: "session-1",
        provider: "openai",
        modelId: "gpt-4-turbo-preview",
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        expiresAt: new Date(Date.now() + 1800000).toISOString(),
        usageCount: 42,
        metadata: {
          capabilities: ["chat", "completion"],
          rateLimit: {
            requestsPerMinute: 60,
            tokensPerMinute: 90000,
            requestsPerDay: 10000,
          },
        },
      },
      {
        id: "session-2",
        provider: "anthropic",
        modelId: "claude-3-opus-20240229",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        expiresAt: new Date(Date.now() + 600000).toISOString(),
        usageCount: 15,
        metadata: {
          capabilities: ["chat", "vision"],
          rateLimit: {
            requestsPerMinute: 50,
            tokensPerMinute: 100000,
            requestsPerDay: 5000,
          },
        },
      },
    ];
    setSessions(mockSessions);
  }, []);

  // Auto-detect provider from key format
  useEffect(() => {
    if (apiKey) {
      const detected = detectProvider(apiKey);
      setAutoDetectedProvider(detected);
      if (detected && detected !== selectedProvider) {
        setSelectedProvider(detected);
      }
    } else {
      setAutoDetectedProvider(null);
    }
  }, [apiKey, selectedProvider]);

  // Calculate cost estimate
  useEffect(() => {
    if (testPrompt && selectedProvider) {
      const inputTokens = estimateTokens(testPrompt);
      const outputTokens = estimateTokens("A typical response would be about this long...");
      const cost = calculateCost(
        selectedProvider,
        providers[selectedProvider].models[0],
        inputTokens,
        outputTokens,
      );
      setCostEstimate(cost);
    }
  }, [testPrompt, selectedProvider]);

  const handleValidate = async () => {
    if (!apiKey) {
      setValidationResult({ valid: false, error: "Please enter an API key" });
      return;
    }

    setIsValidating(true);
    try {
      const result = await validateApiKey(apiKey, selectedProvider);
      setValidationResult(result);

      if (result.valid) {
        // Create mock session
        const newSession: BYOKSession = {
          id: `session-${Date.now()}`,
          provider: selectedProvider,
          modelId: result.defaultModel || providers[selectedProvider].models[0],
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + sessionDuration * 60000).toISOString(),
          usageCount: 0,
          metadata: {
            capabilities: result.capabilities || [],
            rateLimit: result.rateLimit,
          },
        };
        setSessions([newSession, ...sessions]);
        setShowKeyInput(false);
        setApiKey("");
      }
    } catch (error) {
      setValidationResult({ valid: false, error: "Validation failed" });
    } finally {
      setIsValidating(false);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(sessions.filter((s) => s.id !== sessionId));
  };

  const getRemainingTime = (expiresAt: string) => {
    const remaining = new Date(expiresAt).getTime() - Date.now();
    if (remaining <= 0) return "Expired";
    const minutes = Math.floor(remaining / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const getSessionStatus = (session: BYOKSession) => {
    const remaining = new Date(session.expiresAt).getTime() - Date.now();
    if (remaining <= 0) return "expired";
    if (remaining < 600000) return "expiring"; // Less than 10 minutes
    return "active";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <KeyIcon className="w-8 h-8 text-blue-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">BYOK Dashboard</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Securely manage your AI provider API keys with zero-retention, session-based access
        </p>
      </div>

      {/* Security Notice */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start">
          <ShieldCheckIcon className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Security Guarantees
            </p>
            <ul className="text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Keys exist only in memory during active sessions</li>
              <li>• Automatic expiry after configured duration</li>
              <li>• No database storage or logging of keys</li>
              <li>• Rate limiting and usage tracking</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Active Sessions</h2>
          <button
            onClick={() => setShowKeyInput(true)}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            New Session
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
            <KeyIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">No active sessions</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Create a new session to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sessions.map((session) => {
              const status = getSessionStatus(session);
              const provider = providers[session.provider as AIProvider];

              return (
                <div
                  key={session.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{provider.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {provider.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {session.modelId}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                      <div className="flex items-center">
                        {status === "active" && (
                          <>
                            <CheckCircleIcon className="w-4 h-4 text-green-500 mr-1" />
                            <span className="text-sm text-green-600 dark:text-green-400">
                              Active
                            </span>
                          </>
                        )}
                        {status === "expiring" && (
                          <>
                            <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500 mr-1" />
                            <span className="text-sm text-yellow-600 dark:text-yellow-400">
                              Expiring Soon
                            </span>
                          </>
                        )}
                        {status === "expired" && (
                          <>
                            <XCircleIcon className="w-4 h-4 text-red-500 mr-1" />
                            <span className="text-sm text-red-600 dark:text-red-400">Expired</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Time Remaining */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Expires In</span>
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {getRemainingTime(session.expiresAt)}
                        </span>
                      </div>
                    </div>

                    {/* Usage */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Requests</span>
                      <div className="flex items-center">
                        <ChartBarIcon className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {session.usageCount}
                        </span>
                      </div>
                    </div>

                    {/* Rate Limits */}
                    {session.metadata.rateLimit && (
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Rate Limits</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Requests/min:</span>
                            <span className="ml-1 text-gray-900 dark:text-white">
                              {session.metadata.rateLimit.requestsPerMinute}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Tokens/min:</span>
                            <span className="ml-1 text-gray-900 dark:text-white">
                              {session.metadata.rateLimit.tokensPerMinute?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Session ID */}
                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-mono">{session.id}</span>
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <DocumentDuplicateIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Session Form */}
      {showKeyInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Create New BYOK Session
            </h3>

            {/* Provider Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Provider
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(providers).map(([key, provider]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedProvider(key as AIProvider)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedProvider === key
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <div className="text-2xl mb-1">{provider.icon}</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {provider.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {provider.keyFormat}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* API Key Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={providers[selectedProvider].keyExample}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {autoDetectedProvider && (
                <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                  ✓ Auto-detected {providers[autoDetectedProvider].name} key format
                </p>
              )}
            </div>

            {/* Session Duration */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Session Duration
              </label>
              <select
                value={sessionDuration}
                onChange={(e) => setSessionDuration(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={240}>4 hours</option>
                <option value={480}>8 hours</option>
              </select>
            </div>

            {/* Test Prompt */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Test Prompt (Optional)
              </label>
              <textarea
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter a test prompt to validate the key..."
              />
              {costEstimate !== null && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Estimated cost: ${costEstimate.toFixed(5)}
                </p>
              )}
            </div>

            {/* Validation Result */}
            {validationResult && (
              <div
                className={`mb-4 p-3 rounded-lg ${
                  validationResult.valid
                    ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                }`}
              >
                <div className="flex items-start">
                  {validationResult.valid ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        validationResult.valid
                          ? "text-green-900 dark:text-green-100"
                          : "text-red-900 dark:text-red-100"
                      }`}
                    >
                      {validationResult.valid ? "Valid API Key" : "Invalid API Key"}
                    </p>
                    {validationResult.error && (
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        {validationResult.error}
                      </p>
                    )}
                    {validationResult.defaultModel && (
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Default model: {validationResult.defaultModel}
                      </p>
                    )}
                    {validationResult.warnings && (
                      <div className="mt-2">
                        {validationResult.warnings.map((warning: string, idx: number) => (
                          <p key={idx} className="text-sm text-yellow-700 dark:text-yellow-300">
                            ⚠️ {warning}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowKeyInput(false);
                  setApiKey("");
                  setValidationResult(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleValidate}
                disabled={!apiKey || isValidating}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:text-gray-500 transition-colors flex items-center"
              >
                {isValidating ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <ShieldCheckIcon className="w-4 h-4 mr-2" />
                    Create Session
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cost Calculator */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Cost Calculator
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Provider</label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value as AIProvider)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {Object.entries(providers).map(([key, provider]) => (
                <option key={key} value={key}>
                  {provider.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              Input Tokens
            </label>
            <input
              type="number"
              defaultValue="1000"
              onChange={(e) => {
                const input = Number(e.target.value);
                const output = 500;
                const cost = calculateCost(
                  selectedProvider,
                  providers[selectedProvider].models[0],
                  input,
                  output,
                );
                setCostEstimate(cost);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
              Output Tokens
            </label>
            <input
              type="number"
              defaultValue="500"
              onChange={(e) => {
                const input = 1000;
                const output = Number(e.target.value);
                const cost = calculateCost(
                  selectedProvider,
                  providers[selectedProvider].models[0],
                  input,
                  output,
                );
                setCostEstimate(cost);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        {costEstimate !== null && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center">
              <CurrencyDollarIcon className="w-5 h-5 text-blue-500 mr-2" />
              <span className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                Estimated Cost: ${costEstimate.toFixed(5)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="flex items-start">
          <InformationCircleIcon className="w-5 h-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium mb-2">About BYOK</p>
            <p>
              The Bring Your Own Key system allows you to use your own API keys from various AI
              providers while maintaining security and privacy. Keys are validated, used for the
              session duration, and then automatically cleared from memory. No keys are ever stored
              in databases or logs.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href="/docs/api/BYOK_API.md"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                API Documentation →
              </a>
              <span className="text-gray-400">•</span>
              <a
                href="?path=/docs/docs-security-playground--docs"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Security Playground →
              </a>
              <span className="text-gray-400">•</span>
              <a
                href="?path=/story/dashboard-project-overview--default"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Project Overview →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const meta: Meta = {
  title: "BYOK/Dashboard",
  component: BYOKDashboard,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Interactive BYOK (Bring Your Own Key) dashboard for managing AI provider API keys with zero-retention security",
      },
    },
  },
};

export default meta;

export const Default: StoryObj = {
  render: () => <BYOKDashboard />,
};

export const EmptyState: StoryObj = {
  render: () => {
    const EmptyDashboard = () => {
      const [sessions, setSessions] = useState<BYOKSession[]>([]);
      return <BYOKDashboard />;
    };
    return <EmptyDashboard />;
  },
  parameters: {
    docs: {
      description: {
        story: "Dashboard with no active sessions",
      },
    },
  },
};

export const WithTestKeys: StoryObj = {
  render: () => <BYOKDashboard />,
  parameters: {
    docs: {
      description: {
        story:
          "Use these test keys in development mode:\n\n" +
          "- OpenAI: `test-openai-key` or `sk-test123`\n" +
          "- Anthropic: `test-anthropic-key` or `sk-ant-test123`\n" +
          "- Google: `test-google-key` or `AIzaTest123`\n" +
          "- Azure: Any key longer than 20 characters",
      },
    },
  },
};
