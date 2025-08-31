"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DemoTour, useDemoTour } from "@/components/demo/DemoTour";
import { generateMockSessions, generateMockAnalytics } from "@/lib/demo/mockData";
import { BYOKSession } from "@/types/byok";
import {
  KeyIcon,
  RocketLaunchIcon,
  BeakerIcon,
  PlayIcon,
  ArrowPathIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

/**
 * BYOK Demo Page
 * Interactive demo showcasing BYOK functionality with mock data and guided tour
 */
export default function BYOKDemoPage() {
  const { shouldShowTour, startTour, resetTour, completeTour } = useDemoTour();
  const [tourVisible, setTourVisible] = useState(false);
  const [mockSessions, setMockSessions] = useState<BYOKSession[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize with some mock sessions
  useEffect(() => {
    const sessions = generateMockSessions(3);
    setMockSessions(sessions);
  }, []);

  // Auto-start tour for first-time visitors
  useEffect(() => {
    if (shouldShowTour) {
      // Small delay to let page render first
      setTimeout(() => setTourVisible(true), 500);
    }
  }, [shouldShowTour]);

  const handleStartTour = () => {
    startTour();
    setTourVisible(true);
  };

  const handleTourComplete = () => {
    setTourVisible(false);
    completeTour();
    // Generate more mock data to show the demo in action
    handleGenerateData();
  };

  const handleGenerateData = () => {
    setIsGenerating(true);
    // Simulate async data generation
    setTimeout(() => {
      const newSessions = generateMockSessions(6);
      setMockSessions(newSessions);
      setIsGenerating(false);
    }, 1500);
  };

  const analytics = mockSessions.length > 0 ? generateMockAnalytics(mockSessions) : null;

  return (
    <>
      {/* Tour Overlay */}
      <DemoTour
        visible={tourVisible}
        onComplete={handleTourComplete}
        onStepChange={(step) => {
          // Trigger mock actions based on tour step
          if (step === 1) {
            // Highlight BYOK section
            const element = document.querySelector('[data-tour="byok-button"]');
            element?.scrollIntoView({ behavior: "smooth", block: "center" });
          } else if (step === 4) {
            // Show analytics
            const element = document.querySelector('[data-tour="analytics"]');
            element?.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                  <KeyIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    BYOK Demo Experience
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Explore Bring Your Own Key features with mock data
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleStartTour}
                  className="flex items-center space-x-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <PlayIcon className="w-5 h-5" />
                  <span>Start Tour</span>
                </button>
                <button
                  onClick={resetTour}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                  <span>Reset Tour</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center space-x-2 text-sm text-yellow-800 dark:text-yellow-200">
              <BeakerIcon className="w-5 h-5" />
              <span className="font-medium">Demo Mode:</span>
              <span>All data shown is simulated. No real API keys are used or stored.</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* BYOK Button Section */}
          <div className="mb-8">
            <motion.button
              data-tour="byok-button"
              onClick={handleGenerateData}
              disabled={isGenerating}
              className="relative group px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center space-x-2">
                {isGenerating ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    <span>Generating Mock Sessions...</span>
                  </>
                ) : (
                  <>
                    <KeyIcon className="w-5 h-5" />
                    <span>Generate BYOK Sessions</span>
                  </>
                )}
              </span>

              {/* Animated background effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.button>
          </div>

          {/* Provider Selection (Mock) */}
          <div data-tour="provider-select" className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Available Providers
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                "🤖 OpenAI",
                "🧠 Anthropic",
                "🌟 Google",
                "☁️ Azure",
                "🔥 Cohere",
                "🤗 Hugging Face",
              ].map((provider) => (
                <motion.div
                  key={provider}
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-center cursor-pointer hover:shadow-md transition-shadow"
                  whileHover={{ y: -2 }}
                >
                  <div className="text-2xl mb-2">{provider.split(" ")[0]}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {provider.split(" ").slice(1).join(" ")}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Analytics Section */}
          {analytics && (
            <motion.div
              data-tour="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <ChartBarIcon className="w-5 h-5" />
                <span>Usage Analytics</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Total Sessions
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.totalSessions}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Active Sessions
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {analytics.activeSessions}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tokens Used</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {(analytics.totalTokensUsed / 1000).toFixed(1)}K
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Cost</div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    ${analytics.totalCost.toFixed(2)}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Sessions Grid */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Mock BYOK Sessions ({mockSessions.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">
                        {session.provider === "openai"
                          ? "🤖"
                          : session.provider === "anthropic"
                            ? "🧠"
                            : session.provider === "google"
                              ? "🌟"
                              : session.provider === "azure"
                                ? "☁️"
                                : session.provider === "cohere"
                                  ? "🔥"
                                  : "🤗"}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white capitalize">
                        {session.provider}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        session.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          : session.status === "expired"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>

                  {session.metadata?.model && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Model: {session.metadata.model}
                    </div>
                  )}

                  {session.usage && (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-500">Tokens:</span>
                        <span className="ml-1 text-gray-900 dark:text-white">
                          {session.usage.tokensUsed.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-500">Cost:</span>
                        <span className="ml-1 text-gray-900 dark:text-white">
                          ${session.usage.cost.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-500">
                    Created: {new Date(session.createdAt).toLocaleTimeString()}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Empty State */}
          {mockSessions.length === 0 && (
            <div className="text-center py-12">
              <RocketLaunchIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                No mock sessions yet
              </h3>
              <p className="text-gray-500 dark:text-gray-500 mb-4">
                Click "Generate BYOK Sessions" to create mock data
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
