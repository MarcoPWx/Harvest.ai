/**
 * Demo Dashboard Component
 * Interactive dashboard showcasing BYOK features with mock data
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  KeyIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  BoltIcon,
  ClockIcon,
  TrashIcon,
  ArrowPathIcon,
  PlusIcon,
  BeakerIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { BYOKSession, BYOKProvider } from "@/types/byok";
import {
  demoManager,
  mockProviders,
  MockAnalytics,
  generateMockAnalytics,
} from "@/lib/demo/mockData";
import { DemoTour, useDemoTour } from "./DemoTour";

// Session card component
const SessionCard: React.FC<{
  session: BYOKSession;
  onRefresh: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ session, onRefresh, onDelete }) => {
  const provider = mockProviders[session.provider];
  const isExpired = new Date(session.expiresAt) < new Date();
  const isActive = session.status === "active";

  const statusColors = {
    active: "bg-green-100 text-green-800 border-green-200",
    inactive: "bg-gray-100 text-gray-800 border-gray-200",
    expired: "bg-red-100 text-red-800 border-red-200",
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("en-US");
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{provider.icon}</span>
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{provider.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {session.metadata?.model || "Default Model"}
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[session.status]}`}
        >
          {session.status}
        </span>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 text-xs mb-1">
            <BoltIcon className="w-4 h-4" />
            <span>Tokens Used</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatNumber(session.usage?.tokensUsed || 0)}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 text-xs mb-1">
            <CurrencyDollarIcon className="w-4 h-4" />
            <span>Cost</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            ${session.usage?.cost.toFixed(4) || "0.00"}
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Created</span>
          <span className="text-gray-700 dark:text-gray-300">{formatDate(session.createdAt)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Expires</span>
          <span
            className={`font-medium ${isExpired ? "text-red-600" : "text-gray-700 dark:text-gray-300"}`}
          >
            {formatDate(session.expiresAt)}
          </span>
        </div>
        {session.lastUsedAt && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Last Used</span>
            <span className="text-gray-700 dark:text-gray-300">
              {formatDate(session.lastUsedAt)}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={() => onRefresh(session.id)}
          disabled={!isActive}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors ${
            isActive
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <ArrowPathIcon className="w-4 h-4" />
          <span>Refresh</span>
        </button>
        <button
          onClick={() => onDelete(session.id)}
          className="flex items-center justify-center p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

// Analytics widget component
const AnalyticsWidget: React.FC<{ analytics: MockAnalytics }> = ({ analytics }) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Usage Analytics</h3>
        <ChartBarIcon className="w-6 h-6 opacity-80" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-blue-100 text-sm mb-1">Total Tokens</p>
          <p className="text-2xl font-bold">{formatNumber(analytics.totalTokensUsed)}</p>
        </div>
        <div>
          <p className="text-blue-100 text-sm mb-1">Total Cost</p>
          <p className="text-2xl font-bold">${analytics.totalCost.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-blue-100 text-sm mb-1">Active Sessions</p>
          <p className="text-2xl font-bold">{analytics.activeSessions}</p>
        </div>
        <div>
          <p className="text-blue-100 text-sm mb-1">Total Requests</p>
          <p className="text-2xl font-bold">{formatNumber(analytics.totalRequests)}</p>
        </div>
      </div>

      {/* Provider breakdown */}
      <div className="mt-6 space-y-2">
        <p className="text-sm font-medium mb-2">Provider Usage</p>
        {analytics.providerBreakdown.slice(0, 3).map((provider) => (
          <div key={provider.provider} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>{mockProviders[provider.provider].icon}</span>
              <span className="text-sm">{mockProviders[provider.provider].name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 rounded-full h-2 w-24">
                <div
                  className="bg-white rounded-full h-2"
                  style={{ width: `${provider.percentage}%` }}
                />
              </div>
              <span className="text-sm font-medium">{provider.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Create session modal
const CreateSessionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreate: (provider: BYOKProvider) => void;
}> = ({ isOpen, onClose, onCreate }) => {
  const [selectedProvider, setSelectedProvider] = useState<BYOKProvider | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const handleCreate = async () => {
    if (!selectedProvider) return;

    setIsValidating(true);
    // Simulate validation delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    onCreate(selectedProvider);
    setIsValidating(false);
    setSelectedProvider(null);
    setApiKey("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create BYOK Session</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Provider selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Select Provider
          </label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(mockProviders).map(([key, provider]) => (
              <button
                key={key}
                onClick={() => setSelectedProvider(key as BYOKProvider)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedProvider === key
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                }`}
                data-tour={key === "openai" ? "provider-select" : undefined}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{provider.icon}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{provider.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* API Key input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            API Key (Demo Mode - Any Value Works)
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            🔐 Your key is never stored and only exists for this session
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!selectedProvider || !apiKey || isValidating}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
              selectedProvider && apiKey && !isValidating
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isValidating ? (
              <>
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                <span>Validating...</span>
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4" />
                <span>Create Session</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Main Demo Dashboard
export const DemoDashboard: React.FC = () => {
  const [sessions, setSessions] = useState<BYOKSession[]>([]);
  const [analytics, setAnalytics] = useState<MockAnalytics | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const { shouldShowTour, completeTour, startTour } = useDemoTour();
  const [isTourVisible, setIsTourVisible] = useState(false);

  useEffect(() => {
    // Initialize demo data
    demoManager.activate();
    loadDemoData();

    // Show tour after a delay
    if (shouldShowTour) {
      setTimeout(() => setIsTourVisible(true), 500);
    }
  }, [shouldShowTour]);

  const loadDemoData = () => {
    const demoSessions = demoManager.getSessions();
    setSessions(demoSessions);
    setAnalytics(generateMockAnalytics(demoSessions));
  };

  const showNotification = (message: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateSession = (provider: BYOKProvider) => {
    const newSession = demoManager.addSession(provider);
    setSessions([newSession, ...sessions]);
    setAnalytics(demoManager.getAnalytics());
    showNotification(`Created new ${mockProviders[provider].name} session!`, "success");
  };

  const handleRefreshSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      // Update expiry time
      const updatedSession = {
        ...session,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
      setSessions(sessions.map((s) => (s.id === sessionId ? updatedSession : s)));
      showNotification("Session refreshed successfully!", "success");
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    demoManager.removeSession(sessionId);
    setSessions(sessions.filter((s) => s.id !== sessionId));
    setAnalytics(demoManager.getAnalytics());
    showNotification("Session deleted", "info");
  };

  const handleTourComplete = () => {
    setIsTourVisible(false);
    completeTour();
    showNotification("Welcome to Harvest.ai! Explore the demo features.", "info");
  };

  return (
    <>
      {/* Tour overlay */}
      <DemoTour visible={isTourVisible} onComplete={handleTourComplete} />

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-40"
          >
            <div
              className={`px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 ${
                notification.type === "success"
                  ? "bg-green-500 text-white"
                  : notification.type === "error"
                    ? "bg-red-500 text-white"
                    : "bg-blue-500 text-white"
              }`}
            >
              {notification.type === "success" && <CheckCircleIcon className="w-5 h-5" />}
              {notification.type === "error" && <ExclamationTriangleIcon className="w-5 h-5" />}
              <span>{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main dashboard */}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <BeakerIcon className="w-8 h-8 text-blue-500" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  BYOK Demo Dashboard
                </h1>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  Demo Mode
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => startTour()}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Restart Tour
                </button>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  data-tour="byok-button"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>New Session</span>
                </button>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Experience the power of Bring Your Own Key with realistic mock data. No real API keys
              required!
            </p>
          </div>

          {/* Analytics section */}
          {analytics && (
            <div className="mb-8" data-tour="analytics">
              <AnalyticsWidget analytics={analytics} />
            </div>
          )}

          {/* Sessions grid */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Active Sessions ({sessions.length})
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <ShieldCheckIcon className="w-4 h-4" />
              <span>All keys are session-based and never stored</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onRefresh={handleRefreshSession}
                  onDelete={handleDeleteSession}
                />
              ))}
            </AnimatePresence>
          </div>

          {sessions.length === 0 && (
            <div className="text-center py-12">
              <KeyIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                No active sessions
              </h3>
              <p className="text-gray-500 dark:text-gray-500 mb-4">
                Create a new BYOK session to get started
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Create First Session
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create session modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <CreateSessionModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreate={handleCreateSession}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default DemoDashboard;
