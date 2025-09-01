/**
 * Demo Tour Component
 * Interactive tour to showcase BYOK and other features with demo data
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  ChevronRightIcon,
  RocketLaunchIcon,
  KeyIcon,
  ShieldCheckIcon,
  BoltIcon,
  ChartBarIcon,
  SparklesIcon,
  BeakerIcon,
} from "@heroicons/react/24/outline";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  emoji: string;
  position?: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
  highlight?: string; // CSS selector for element to highlight
  action?: () => void; // Optional action to perform
  gradient: string[];
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Harvest.ai! 🚀",
    description:
      "Experience the power of AI-driven content transformation. Let's explore the key features!",
    icon: RocketLaunchIcon,
    emoji: "🎯",
    position: "center",
    gradient: ["from-purple-500", "to-pink-500"],
  },
  {
    id: "byok",
    title: "Bring Your Own Key 🔑",
    description:
      "Use your own API keys from OpenAI, Anthropic, Google, or Azure. Zero storage, maximum security!",
    icon: KeyIcon,
    emoji: "🔐",
    position: "top-right",
    highlight: '[data-tour="byok-button"]',
    gradient: ["from-blue-500", "to-cyan-500"],
  },
  {
    id: "security",
    title: "Enterprise Security 🛡️",
    description:
      "Your keys are never stored. Session-based access with automatic expiry. Complete peace of mind.",
    icon: ShieldCheckIcon,
    emoji: "✨",
    position: "center",
    gradient: ["from-green-500", "to-emerald-500"],
  },
  {
    id: "providers",
    title: "Multiple AI Providers 🤖",
    description:
      "Switch between OpenAI GPT-4, Claude 3, Gemini Pro, and more. Find the perfect model for your needs.",
    icon: BoltIcon,
    emoji: "⚡",
    position: "center",
    highlight: '[data-tour="provider-select"]',
    gradient: ["from-orange-500", "to-red-500"],
  },
  {
    id: "analytics",
    title: "Usage Analytics 📊",
    description:
      "Track your API usage, costs, and performance metrics in real-time. Stay in control of your budget.",
    icon: ChartBarIcon,
    emoji: "📈",
    position: "bottom-left",
    highlight: '[data-tour="analytics"]',
    gradient: ["from-indigo-500", "to-purple-500"],
  },
  {
    id: "demo",
    title: "Try Demo Mode! 🎮",
    description:
      "Test all features with mock data. No API keys needed. Perfect for exploring capabilities!",
    icon: BeakerIcon,
    emoji: "🧪",
    position: "center",
    gradient: ["from-yellow-500", "to-orange-500"],
  },
];

interface DemoTourProps {
  visible: boolean;
  onComplete: () => void;
  onStepChange?: (step: number) => void;
}

// Floating elements for background animation
const FloatingElements: React.FC = () => {
  const elements = ["🔑", "⚡", "🛡️", "✨", "🚀", "💎", "🎯", "📊"];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map((emoji, index) => (
        <motion.div
          key={index}
          className="absolute text-2xl"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: 0.5 + Math.random() * 0.5,
          }}
          animate={{
            x: [
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
              Math.random() * window.innerWidth,
            ],
            y: [
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
              Math.random() * window.innerHeight,
            ],
            rotate: [0, 360],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 20 + index * 2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {emoji}
        </motion.div>
      ))}
    </div>
  );
};

// Individual tour step card
const TourStepCard: React.FC<{
  step: TourStep;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
}> = ({ step, currentStep, totalSteps, onNext }) => {
  const Icon = step.icon;

  const getPositionClasses = () => {
    switch (step.position) {
      case "top-left":
        return "top-20 left-10";
      case "top-right":
        return "top-20 right-10";
      case "bottom-left":
        return "bottom-20 left-10";
      case "bottom-right":
        return "bottom-20 right-10";
      default:
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
    }
  };

  useEffect(() => {
    // Highlight element if specified
    if (step.highlight) {
      const element = document.querySelector(step.highlight);
      if (element) {
        element.classList.add("tour-highlight");
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    return () => {
      // Remove highlight
      if (step.highlight) {
        const element = document.querySelector(step.highlight);
        if (element) {
          element.classList.remove("tour-highlight");
        }
      }
    };
  }, [step]);

  // Execute action if specified
  useEffect(() => {
    if (step.action) {
      step.action();
    }
  }, [step]);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", duration: 0.5 }}
      className={`absolute ${getPositionClasses()} z-50 max-w-md w-full`}
    >
      <div
        className={`bg-gradient-to-br ${step.gradient.join(" ")} p-[2px] rounded-2xl shadow-2xl`}
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{step.emoji}</span>
              <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {currentStep + 1} / {totalSteps}
                </span>
              </div>
            </div>
          </div>

          {/* Icon */}
          <div
            className={`w-16 h-16 bg-gradient-to-br ${step.gradient.join(" ")} rounded-xl flex items-center justify-center mb-4`}
          >
            <Icon className="w-8 h-8 text-white" />
          </div>

          {/* Content */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{step.description}</p>

          {/* Progress dots */}
          <div className="flex justify-center space-x-2 mb-4">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`transition-all duration-300 ${
                  index === currentStep
                    ? "w-8 h-2 bg-gradient-to-r " + step.gradient.join(" ") + " rounded-full"
                    : "w-2 h-2 bg-gray-300 dark:bg-gray-700 rounded-full"
                }`}
              />
            ))}
          </div>

          {/* Action button */}
          <button
            onClick={onNext}
            className={`w-full bg-gradient-to-r ${step.gradient.join(" ")} text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2`}
          >
            <span>{currentStep === totalSteps - 1 ? "Start Demo" : "Next"}</span>
            {currentStep === totalSteps - 1 ? (
              <RocketLaunchIcon className="w-5 h-5" />
            ) : (
              <ChevronRightIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const DemoTour: React.FC<DemoTourProps> = ({ visible, onComplete, onStepChange }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      onStepChange?.(currentStep + 1);
    } else {
      // Tour complete
      localStorage.setItem("harvest_tour_completed", "true");
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
      setCurrentStep(0);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
        data-testid="demo-tour"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

        {/* Floating elements */}
        <FloatingElements />

        {/* Tour step */}
        <AnimatePresence mode="wait">
          <TourStepCard
            key={tourSteps[currentStep].id}
            step={tourSteps[currentStep]}
            currentStep={currentStep}
            totalSteps={tourSteps.length}
            onNext={handleNext}
          />
        </AnimatePresence>

        {/* Sparkles effect */}
        <div className="absolute inset-0 pointer-events-none">
          <SparklesIcon className="absolute top-10 left-10 w-8 h-8 text-yellow-400 animate-pulse" />
          <SparklesIcon className="absolute top-20 right-20 w-6 h-6 text-blue-400 animate-pulse delay-100" />
          <SparklesIcon className="absolute bottom-20 left-20 w-10 h-10 text-purple-400 animate-pulse delay-200" />
          <SparklesIcon className="absolute bottom-10 right-10 w-7 h-7 text-pink-400 animate-pulse delay-300" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Hook to manage tour state
export const useDemoTour = () => {
  const [shouldShowTour, setShouldShowTour] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkTourStatus();
  }, []);

  const checkTourStatus = () => {
    try {
      // URL and env overrides
      let forceStart = false;
      let forceReset = false;
      let forceStop = false;
      try {
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          const tourParam = (url.searchParams.get("tour") || "").toLowerCase();
          if (["1", "true", "start", "auto"].includes(tourParam)) forceStart = true;
          if (["reset", "again", "fresh"].includes(tourParam)) forceReset = true;
          // In development only, allow explicitly turning tour off via URL
          if (process.env.NODE_ENV !== "production" && ["0", "false", "off"].includes(tourParam)) {
            forceStop = true;
          }
        }
      } catch {
        // ignore URL parse errors
      }

      // Environment flag to auto-start tour on this deploy
      if (process.env.NEXT_PUBLIC_TOUR_AUTO === "1") {
        forceStart = true;
      }

      if (forceReset) {
        localStorage.removeItem("harvest_tour_completed");
      }

      const tourCompleted = localStorage.getItem("harvest_tour_completed");
      const isFirstVisit = !localStorage.getItem("harvest_visited");

      if (isFirstVisit) {
        localStorage.setItem("harvest_visited", "true");
      }

      if (forceStop) {
        setShouldShowTour(false);
      } else if (forceStart) {
        setShouldShowTour(true);
      } else {
        setShouldShowTour(!tourCompleted || isFirstVisit);
      }
    } catch (error) {
      console.warn("Failed to check tour status:", error);
      setShouldShowTour(false);
    } finally {
      setIsLoading(false);
    }
  };

  const startTour = () => {
    setShouldShowTour(true);
  };

  const resetTour = () => {
    localStorage.removeItem("harvest_tour_completed");
    setShouldShowTour(true);
  };

  const completeTour = () => {
    localStorage.setItem("harvest_tour_completed", "true");
    setShouldShowTour(false);
  };

  return {
    shouldShowTour,
    isLoading,
    startTour,
    resetTour,
    completeTour,
  };
};

export default DemoTour;
