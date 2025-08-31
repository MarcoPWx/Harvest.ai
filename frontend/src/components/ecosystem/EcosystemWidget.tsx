"use client";

import React, { useState, useEffect } from "react";
import {
  Zap,
  Star,
  TrendingUp,
  Globe,
  X,
  ChevronRight,
  Lock,
  Sparkles,
  Users,
  Shield,
  Rocket,
  Gift,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EcosystemWidgetProps, Product } from "./types";

export default function EcosystemWidget({
  currentProduct,
  position = "bottom-right",
  userTier = "free",
  onProductClick,
  theme = "dark",
}: EcosystemWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Load interaction state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("ecosystem-widget-state");
    if (stored) {
      const state = JSON.parse(stored);
      setIsMinimized(state.minimized);
      setHasInteracted(state.interacted);
    }
  }, []);

  // Save interaction state
  const saveState = (minimized: boolean, interacted: boolean) => {
    localStorage.setItem(
      "ecosystem-widget-state",
      JSON.stringify({
        minimized,
        interacted,
        timestamp: Date.now(),
      }),
    );
  };

  const products: Product[] = [
    {
      id: "devmentor",
      name: "DevMentor",
      description: "AI-powered development assistant",
      icon: Zap,
      color: "blue",
      href: "https://devmentor.naturequest.dev",
      status: userTier === "free" ? "locked" : "active",
    },
    {
      id: "quizmentor",
      name: "QuizMentor",
      description: "Interactive learning platform",
      icon: Star,
      color: "purple",
      href: "https://quizmentor.naturequest.dev",
      status: "active",
    },
    {
      id: "harvest",
      name: "Harvest.ai",
      description: "AI content transformation platform",
      icon: TrendingUp,
      color: "green",
      href: "https://harvest.naturequest.dev",
      status:
        userTier === "pro" || userTier === "team" || userTier === "enterprise" ? "active" : "free",
    },
    {
      id: "omni",
      name: "Omni.ai",
      description: "Free open-source AI toolkit",
      icon: Globe,
      color: "orange",
      href: "https://omni.naturequest.dev",
      status: "free",
      badge: "Open Source",
    },
  ];

  const otherProducts = products.filter((p) => p.id !== currentProduct);
  const lockedProducts = otherProducts.filter((p) => p.status === "locked").length;
  const hasLockedProducts = lockedProducts > 0;

  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-20 right-4",
    "top-left": "top-20 left-4",
  };

  const handleProductClick = (product: Product) => {
    if (product.status === "locked") {
      // Navigate to upgrade page
      window.location.href = "https://accounts.naturequest.dev/billing";
    } else {
      if (onProductClick) {
        onProductClick(product.id);
      } else {
        window.location.href = product.href;
      }
    }
    setHasInteracted(true);
    saveState(isMinimized, true);
  };

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    if (!hasInteracted) {
      setHasInteracted(true);
      saveState(isMinimized, true);
    }
  };

  const minimizeWidget = () => {
    setIsMinimized(true);
    setIsOpen(false);
    saveState(true, hasInteracted);
  };

  // Auto-show after delay for first-time users
  useEffect(() => {
    if (!hasInteracted && !isMinimized) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 5000); // Show after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [hasInteracted, isMinimized]);

  if (isMinimized) {
    return (
      <button
        onClick={() => {
          setIsMinimized(false);
          setIsOpen(true);
          saveState(false, true);
        }}
        className={`fixed ${positionClasses[position]} z-50 p-2 bg-gradient-to-r from-orange-600 to-green-600 rounded-full shadow-lg hover:scale-110 transition-transform`}
      >
        <Sparkles className="w-5 h-5 text-white" />
      </button>
    );
  }

  return (
    <>
      {/* Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={toggleWidget}
            className={`fixed ${positionClasses[position]} z-50 group`}
          >
            <div className="relative">
              <div className="p-4 bg-gradient-to-r from-orange-600 to-green-600 rounded-full shadow-xl hover:shadow-2xl transition-all group-hover:scale-110">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              {hasLockedProducts && userTier === "free" && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
              )}
              {!hasInteracted && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute top-1/2 -translate-y-1/2 right-full mr-3 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap"
                >
                  <div className="flex items-center space-x-2">
                    <Gift className="w-4 h-4 text-yellow-400" />
                    <span>Explore our ecosystem!</span>
                  </div>
                  <div className="absolute top-1/2 -translate-y-1/2 -right-2 w-0 h-0 border-t-8 border-b-8 border-l-8 border-transparent border-l-gray-900" />
                </motion.div>
              )}
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Widget Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed ${positionClasses[position]} z-50 w-96 max-w-[calc(100vw-2rem)]`}
          >
            <div
              className={`${
                theme === "dark" ? "bg-gray-900/95 border-gray-700" : "bg-white/95 border-gray-200"
              } backdrop-blur-xl rounded-2xl shadow-2xl border`}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-orange-500 to-green-600 rounded-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3
                        className={`font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                      >
                        NatureQuest Ecosystem
                      </h3>
                      <p
                        className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                      >
                        {userTier === "free"
                          ? `${lockedProducts} products to unlock`
                          : "All products available"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={minimizeWidget}
                      className={`p-1.5 rounded-lg hover:bg-gray-800 transition-colors ${
                        theme === "dark"
                          ? "text-gray-400 hover:text-white"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <ChevronRight className="w-4 h-4 rotate-90" />
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className={`p-1.5 rounded-lg hover:bg-gray-800 transition-colors ${
                        theme === "dark"
                          ? "text-gray-400 hover:text-white"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Products List */}
              <div className="p-2 max-h-96 overflow-y-auto">
                {otherProducts.map((product) => {
                  const Icon = product.icon;
                  const isLocked = product.status === "locked";
                  const isFree = product.status === "free";

                  return (
                    <motion.button
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-3 rounded-lg mb-2 text-left transition-all ${
                        isLocked
                          ? "bg-gray-800/50 hover:bg-gray-800/70 opacity-75"
                          : theme === "dark"
                            ? "bg-gray-800/50 hover:bg-gray-800/70"
                            : "bg-gray-100 hover:bg-gray-200"
                      } group relative overflow-hidden`}
                    >
                      {/* Background gradient on hover */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{
                          background: `linear-gradient(to right, ${
                            product.color === "blue"
                              ? "rgba(59, 130, 246, 0.1)"
                              : product.color === "purple"
                                ? "rgba(147, 51, 234, 0.1)"
                                : product.color === "green"
                                  ? "rgba(34, 197, 94, 0.1)"
                                  : "rgba(251, 146, 60, 0.1)"
                          }, transparent)`,
                        }}
                      />

                      <div className="relative flex items-start space-x-3">
                        <div
                          className={`p-2 rounded-lg flex-shrink-0 ${
                            product.color === "blue"
                              ? "bg-blue-500/10"
                              : product.color === "purple"
                                ? "bg-purple-500/10"
                                : product.color === "green"
                                  ? "bg-green-500/10"
                                  : "bg-orange-500/10"
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 ${
                              product.color === "blue"
                                ? theme === "dark"
                                  ? "text-blue-400"
                                  : "text-blue-600"
                                : product.color === "purple"
                                  ? theme === "dark"
                                    ? "text-purple-400"
                                    : "text-purple-600"
                                  : product.color === "green"
                                    ? theme === "dark"
                                      ? "text-green-400"
                                      : "text-green-600"
                                    : theme === "dark"
                                      ? "text-orange-400"
                                      : "text-orange-600"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4
                              className={`font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                            >
                              {product.name}
                            </h4>
                            {isLocked && <Lock className="w-3 h-3 text-yellow-400" />}
                            {product.badge && (
                              <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                                {product.badge}
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-sm mt-0.5 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
                          >
                            {product.description}
                          </p>
                          {isLocked && (
                            <p className="text-xs text-yellow-400 mt-1 flex items-center">
                              <Shield className="w-3 h-3 mr-1" />
                              Upgrade to Pro to unlock
                            </p>
                          )}
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 ${
                            theme === "dark" ? "text-gray-500" : "text-gray-400"
                          } group-hover:translate-x-1 transition-transform`}
                        />
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer - Upgrade CTA */}
              {userTier === "free" && hasLockedProducts && (
                <div className="p-4 border-t border-gray-700">
                  <button
                    onClick={() =>
                      (window.location.href = "https://accounts.naturequest.dev/billing")
                    }
                    className="w-full px-4 py-2 bg-gradient-to-r from-orange-600 to-green-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <Rocket className="w-4 h-4" />
                    <span>Unlock All Products</span>
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Get access to all tools for $29/month
                  </p>
                </div>
              )}

              {/* Footer - Account Link */}
              {userTier !== "free" && (
                <div className="p-4 border-t border-gray-700">
                  <button
                    onClick={() => (window.location.href = "https://accounts.naturequest.dev")}
                    className="w-full px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-all flex items-center justify-center space-x-2"
                  >
                    <Users className="w-4 h-4" />
                    <span>Manage Account</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
