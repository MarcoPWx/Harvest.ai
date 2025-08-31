"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  Users,
  Clock,
  BarChart3,
  Zap,
  Eye,
  MousePointer,
  Target,
} from "lucide-react";

interface TourMetrics {
  totalStarts: number;
  completions: number;
  averageDuration: number;
  currentActive: number;
  stepDropoff: number[];
  performance: {
    fps: number;
    loadTime: number;
    memoryUsage: number;
  };
  engagement: {
    hoverEvents: number;
    clickEvents: number;
    keyboardEvents: number;
  };
}

interface SystemHealth {
  status: "healthy" | "degraded" | "down";
  components: {
    name: string;
    status: "operational" | "degraded" | "down";
    responseTime: number;
    errorRate: number;
  }[];
  lastChecked: Date;
}

/**
 * System status monitoring component for the BYOK demo tour
 * Tracks performance metrics, user engagement, and system health
 */
export function DemoTourStatus() {
  const [metrics, setMetrics] = useState<TourMetrics>({
    totalStarts: 0,
    completions: 0,
    averageDuration: 0,
    currentActive: 0,
    stepDropoff: [100, 85, 72, 65, 58, 51, 45],
    performance: {
      fps: 60,
      loadTime: 0,
      memoryUsage: 0,
    },
    engagement: {
      hoverEvents: 0,
      clickEvents: 0,
      keyboardEvents: 0,
    },
  });

  const [health, setHealth] = useState<SystemHealth>({
    status: "healthy",
    components: [
      { name: "Tour Button", status: "operational", responseTime: 12, errorRate: 0 },
      { name: "Tour Overlay", status: "operational", responseTime: 45, errorRate: 0 },
      { name: "Analytics", status: "operational", responseTime: 23, errorRate: 0 },
      { name: "LocalStorage", status: "operational", responseTime: 5, errorRate: 0 },
    ],
    lastChecked: new Date(),
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Simulate real-time metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        totalStarts: prev.totalStarts + Math.floor(Math.random() * 3),
        completions: prev.completions + (Math.random() > 0.7 ? 1 : 0),
        currentActive: Math.floor(Math.random() * 10),
        performance: {
          fps: 60 - Math.floor(Math.random() * 5),
          loadTime: 200 + Math.floor(Math.random() * 100),
          memoryUsage: 5 + Math.random() * 3,
        },
        engagement: {
          hoverEvents: prev.engagement.hoverEvents + Math.floor(Math.random() * 5),
          clickEvents: prev.engagement.clickEvents + Math.floor(Math.random() * 3),
          keyboardEvents: prev.engagement.keyboardEvents + Math.floor(Math.random() * 2),
        },
      }));

      // Update health status
      setHealth((prev) => ({
        ...prev,
        lastChecked: new Date(),
        components: prev.components.map((comp) => ({
          ...comp,
          responseTime: comp.responseTime + (Math.random() - 0.5) * 10,
          errorRate: Math.random() * 2,
        })),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Calculate metrics
  const completionRate =
    metrics.totalStarts > 0 ? ((metrics.completions / metrics.totalStarts) * 100).toFixed(1) : "0";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
      case "healthy":
        return "text-green-500";
      case "degraded":
        return "text-yellow-500";
      case "down":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
      case "healthy":
        return <CheckCircle className="w-4 h-4" />;
      case "degraded":
        return <AlertCircle className="w-4 h-4" />;
      case "down":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 left-4 z-30"
    >
      {/* Collapsed View */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 flex items-center space-x-2 hover:shadow-xl transition-shadow"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Activity className={`w-5 h-5 ${getStatusColor(health.status)}`} />
        <span className="text-sm font-medium">Tour Status</span>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            health.status === "healthy"
              ? "bg-green-100 text-green-800"
              : health.status === "degraded"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {health.status.toUpperCase()}
        </span>
      </motion.button>

      {/* Expanded View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute bottom-14 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-96 max-h-[600px] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Demo Tour System Status</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-gray-500">Total Starts</span>
                </div>
                <p className="text-2xl font-bold">{metrics.totalStarts}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <Target className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-500">Completion Rate</span>
                </div>
                <p className="text-2xl font-bold">{completionRate}%</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span className="text-xs text-gray-500">Avg Duration</span>
                </div>
                <p className="text-2xl font-bold">{Math.floor(metrics.averageDuration / 60)}m</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <Activity className="w-4 h-4 text-orange-500" />
                  <span className="text-xs text-gray-500">Active Now</span>
                </div>
                <p className="text-2xl font-bold">{metrics.currentActive}</p>
              </div>
            </div>

            {/* Step Dropoff */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Step Completion Funnel
              </h4>
              <div className="space-y-2">
                {metrics.stepDropoff.map((percentage, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-xs w-12">Step {index + 1}</span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      />
                    </div>
                    <span className="text-xs w-10 text-right">{percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3 flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                Performance
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Frame Rate</span>
                  <span
                    className={metrics.performance.fps >= 55 ? "text-green-500" : "text-yellow-500"}
                  >
                    {metrics.performance.fps} FPS
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Load Time</span>
                  <span
                    className={
                      metrics.performance.loadTime <= 300 ? "text-green-500" : "text-yellow-500"
                    }
                  >
                    {metrics.performance.loadTime}ms
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Memory Usage</span>
                  <span
                    className={
                      metrics.performance.memoryUsage <= 8 ? "text-green-500" : "text-yellow-500"
                    }
                  >
                    {metrics.performance.memoryUsage.toFixed(1)}MB
                  </span>
                </div>
              </div>
            </div>

            {/* Engagement Metrics */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3 flex items-center">
                <MousePointer className="w-4 h-4 mr-2" />
                User Engagement
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                  <Eye className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                  <p className="text-xs text-gray-500">Hovers</p>
                  <p className="font-semibold">{metrics.engagement.hoverEvents}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                  <MousePointer className="w-4 h-4 mx-auto mb-1 text-green-500" />
                  <p className="text-xs text-gray-500">Clicks</p>
                  <p className="font-semibold">{metrics.engagement.clickEvents}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                  <Activity className="w-4 h-4 mx-auto mb-1 text-purple-500" />
                  <p className="text-xs text-gray-500">Keys</p>
                  <p className="font-semibold">{metrics.engagement.keyboardEvents}</p>
                </div>
              </div>
            </div>

            {/* Component Health */}
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-3">Component Health</h4>
              <div className="space-y-2">
                {health.components.map((component, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <span className={getStatusColor(component.status)}>
                        {getStatusIcon(component.status)}
                      </span>
                      <span>{component.name}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs">
                      <span className="text-gray-500">{component.responseTime.toFixed(0)}ms</span>
                      <span
                        className={component.errorRate > 1 ? "text-yellow-500" : "text-gray-500"}
                      >
                        {component.errorRate.toFixed(1)}% err
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Last Updated */}
            <div className="text-xs text-gray-500 text-center">
              Last updated: {health.lastChecked.toLocaleTimeString()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
