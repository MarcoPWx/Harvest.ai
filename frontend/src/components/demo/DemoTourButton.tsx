"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DemoTour, useDemoTour } from "./DemoTour";
import { RocketLaunchIcon, SparklesIcon } from "@heroicons/react/24/outline";

/**
 * Floating Tour Button Component
 * An overlay button that launches the interactive BYOK demo tour
 */
export function DemoTourButton() {
  const { shouldShowTour, startTour, completeTour } = useDemoTour();
  const [isVisible, setIsVisible] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleStartTour = useCallback(() => {
    setTourActive(true);
    startTour();
  }, [startTour]);

  useEffect(() => {
    // Show button after a short delay (0ms in tests to stabilize)
    if (process.env.NODE_ENV === "test") {
      setIsVisible(true);
      return;
    }

    // If tour is requested via URL or env, show immediately and auto-start soon after
    try {
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        const tourParam = (url.searchParams.get("tour") || "").toLowerCase();
        const tourRequested = ["1", "true", "start", "auto", "reset", "again", "fresh"].includes(
          tourParam,
        );
        const tourAuto = process.env.NEXT_PUBLIC_TOUR_AUTO === "1";
        if (tourRequested || tourAuto) {
          setIsVisible(true);
          // give a tiny delay for layout to settle, then start
          const id = setTimeout(() => handleStartTour(), 400);
          return () => clearTimeout(id);
        }
      }
    } catch {}

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [handleStartTour]);

  // Mark visitor as having seen the demo button once it becomes visible
  useEffect(() => {
    if (!isVisible) return;
    try {
      localStorage.setItem("harvest_visited", "true");
    } catch {
      // ignore storage errors in non-browser/test envs
    }
  }, [isVisible]);

  useEffect(() => {
    // Auto-start tour for first-time visitors (fallback when not forced by URL/env)
    if (shouldShowTour && isVisible) {
      const autoStartTimer = setTimeout(() => {
        handleStartTour();
      }, 3000);

      return () => clearTimeout(autoStartTimer);
    }
  }, [shouldShowTour, isVisible, handleStartTour]);

  // Listen for external completion (e.g., other tabs/components) via storage event
  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout> | null = null;

    const onStorage = (e: StorageEvent) => {
      if (e.key === "harvest_tour_completed" && e.newValue === "true") {
        setTourActive(false);
        // Hide button after a short delay to mirror completion UX
        hideTimer = setTimeout(() => setIsVisible(false), 5000);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", onStorage);
      return () => {
        window.removeEventListener("storage", onStorage);
        if (hideTimer) clearTimeout(hideTimer);
      };
    }
  }, []);

  const handleCompleteTour = () => {
    setTourActive(false);
    completeTour();
    // Optionally hide the button after tour completion
    setTimeout(() => {
      setIsVisible(false);
    }, 5000);
  };

  return (
    <>
      {/* Floating Tour Button */}
      <AnimatePresence>
        {isVisible && !tourActive && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1,
            }}
            className="fixed bottom-6 right-6 z-40"
          >
            <motion.button
              onClick={handleStartTour}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleStartTour();
                }
              }}
              aria-label="Launch BYOK Demo Tour"
              className="group relative focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                y: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            >
              {/* Main Button */}
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-xl hover:shadow-2xl transition-all">
                  <RocketLaunchIcon className="w-6 h-6 text-white" />
                </div>

                {/* Pulse effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Notification dot */}
                {shouldShowTour && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1"
                  >
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Tooltip */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: 10, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 10, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap"
                  >
                    <div className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
                      <div className="flex items-center space-x-2">
                        <SparklesIcon
                          data-testid="sparkles-icon"
                          className="w-4 h-4 text-yellow-400"
                        />
                        <span className="font-medium">Launch BYOK Demo Tour</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Interactive walkthrough with mock data
                      </div>
                      {/* Arrow pointing to button */}
                      <div className="absolute top-1/2 -translate-y-1/2 -right-2 w-0 h-0 border-t-8 border-b-8 border-l-8 border-transparent border-l-gray-900" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sparkle effects around button */}
              {isHovered && (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      repeatDelay: 0.2,
                    }}
                    className="absolute -top-8 -right-8"
                  >
                    <SparklesIcon data-testid="sparkles-icon" className="w-6 h-6 text-yellow-400" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      rotate: [0, -180, -360],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      repeatDelay: 0.4,
                      delay: 0.2,
                    }}
                    className="absolute -bottom-8 -left-8"
                  >
                    <SparklesIcon data-testid="sparkles-icon" className="w-5 h-5 text-blue-400" />
                  </motion.div>
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Demo Tour Overlay */}
      <DemoTour
        visible={tourActive}
        onComplete={handleCompleteTour}
        onStepChange={(step) => {
          console.log("Tour step:", step);
        }}
      />
    </>
  );
}

export default DemoTourButton;
