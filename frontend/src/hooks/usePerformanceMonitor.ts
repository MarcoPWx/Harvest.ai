import { useEffect, useRef, useState, useCallback } from "react";

interface PerformanceMetrics {
  fps: number;
  loadTime: number;
  memoryUsage: number;
  renderTime: number;
  interactionLatency: number;
  animationFrames: number[];
}

interface PerformanceThresholds {
  minFPS: number;
  maxLoadTime: number;
  maxMemoryUsage: number;
  maxRenderTime: number;
  maxInteractionLatency: number;
}

/**
 * Custom hook for monitoring performance metrics of the demo tour
 * Tracks FPS, memory usage, load times, and interaction latency
 */
export function usePerformanceMonitor(
  thresholds: PerformanceThresholds = {
    minFPS: 55,
    maxLoadTime: 500,
    maxMemoryUsage: 10,
    maxRenderTime: 16,
    maxInteractionLatency: 100,
  },
) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    loadTime: 0,
    memoryUsage: 0,
    renderTime: 0,
    interactionLatency: 0,
    animationFrames: [],
  });

  const [warnings, setWarnings] = useState<string[]>([]);
  const frameTimestamps = useRef<number[]>([]);
  const lastFrameTime = useRef<number>(performance.now());
  const animationId = useRef<number>(0);
  const startTime = useRef<number>(performance.now());

  // Calculate FPS
  const calculateFPS = useCallback(() => {
    const now = performance.now();
    const delta = now - lastFrameTime.current;
    lastFrameTime.current = now;

    frameTimestamps.current.push(now);

    // Keep only last 60 frames
    if (frameTimestamps.current.length > 60) {
      frameTimestamps.current.shift();
    }

    // Calculate average FPS from last 60 frames
    if (frameTimestamps.current.length > 1) {
      const timeSpan =
        frameTimestamps.current[frameTimestamps.current.length - 1] - frameTimestamps.current[0];
      const fps = Math.round((frameTimestamps.current.length - 1) / (timeSpan / 1000));

      setMetrics((prev) => ({
        ...prev,
        fps,
        animationFrames: [...prev.animationFrames, delta].slice(-60),
      }));

      // Check FPS threshold
      if (fps < thresholds.minFPS) {
        addWarning(`Low FPS detected: ${fps} (threshold: ${thresholds.minFPS})`);
      }
    }

    animationId.current = requestAnimationFrame(calculateFPS);
  }, [thresholds.minFPS]);

  // Track memory usage
  const trackMemoryUsage = useCallback(() => {
    if ("memory" in performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      const usedMemoryMB = memory.usedJSHeapSize / (1024 * 1024);

      setMetrics((prev) => ({
        ...prev,
        memoryUsage: Math.round(usedMemoryMB * 10) / 10,
      }));

      // Check memory threshold
      if (usedMemoryMB > thresholds.maxMemoryUsage) {
        addWarning(
          `High memory usage: ${usedMemoryMB.toFixed(1)}MB (threshold: ${thresholds.maxMemoryUsage}MB)`,
        );
      }
    }
  }, [thresholds.maxMemoryUsage]);

  // Track load time
  const trackLoadTime = useCallback(() => {
    const loadTime = performance.now() - startTime.current;

    setMetrics((prev) => ({
      ...prev,
      loadTime: Math.round(loadTime),
    }));

    // Check load time threshold
    if (loadTime > thresholds.maxLoadTime) {
      addWarning(
        `Slow load time: ${loadTime.toFixed(0)}ms (threshold: ${thresholds.maxLoadTime}ms)`,
      );
    }
  }, [thresholds.maxLoadTime]);

  // Track render performance
  const trackRenderPerformance = useCallback(() => {
    if ("PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === "measure" || entry.entryType === "navigation") {
            const duration = entry.duration;

            setMetrics((prev) => ({
              ...prev,
              renderTime: Math.round(duration * 10) / 10,
            }));

            // Check render time threshold
            if (duration > thresholds.maxRenderTime) {
              addWarning(
                `Slow render: ${duration.toFixed(1)}ms (threshold: ${thresholds.maxRenderTime}ms)`,
              );
            }
          }
        });
      });

      try {
        observer.observe({ entryTypes: ["measure", "navigation"] });
        return () => observer.disconnect();
      } catch (e) {
        console.warn("Performance Observer not supported:", e);
      }
    }
  }, [thresholds.maxRenderTime]);

  // Track interaction latency
  const trackInteraction = useCallback(
    (interactionType: string) => {
      const mark = `interaction-${interactionType}-${Date.now()}`;
      performance.mark(mark);

      return () => {
        const endMark = `${mark}-end`;
        performance.mark(endMark);

        try {
          performance.measure(`${interactionType}-duration`, mark, endMark);
          const measures = performance.getEntriesByName(`${interactionType}-duration`);

          if (measures.length > 0) {
            const duration = measures[measures.length - 1].duration;

            setMetrics((prev) => ({
              ...prev,
              interactionLatency: Math.round(duration * 10) / 10,
            }));

            // Check interaction latency threshold
            if (duration > thresholds.maxInteractionLatency) {
              addWarning(
                `Slow interaction: ${duration.toFixed(1)}ms (threshold: ${thresholds.maxInteractionLatency}ms)`,
              );
            }

            // Clean up performance marks
            performance.clearMarks(mark);
            performance.clearMarks(endMark);
            performance.clearMeasures(`${interactionType}-duration`);
          }
        } catch (e) {
          console.warn("Performance measurement failed:", e);
        }
      };
    },
    [thresholds.maxInteractionLatency],
  );

  // Add warning helper
  const addWarning = (warning: string) => {
    setWarnings((prev) => {
      const newWarnings = [...prev, `[${new Date().toLocaleTimeString()}] ${warning}`];
      // Keep only last 10 warnings
      return newWarnings.slice(-10);
    });
  };

  // Start monitoring
  useEffect(() => {
    // Start FPS monitoring
    animationId.current = requestAnimationFrame(calculateFPS);

    // Track initial load time
    trackLoadTime();

    // Set up memory tracking interval
    const memoryInterval = setInterval(trackMemoryUsage, 1000);

    // Set up render performance tracking
    const cleanupRenderTracking = trackRenderPerformance();

    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
      clearInterval(memoryInterval);
      if (cleanupRenderTracking) {
        cleanupRenderTracking();
      }
    };
  }, [calculateFPS, trackLoadTime, trackMemoryUsage, trackRenderPerformance]);

  // Report metrics to analytics
  const reportMetrics = useCallback(() => {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: {
        ...metrics,
        averageFPS:
          metrics.animationFrames.length > 0
            ? Math.round(
                1000 /
                  (metrics.animationFrames.reduce((a, b) => a + b, 0) /
                    metrics.animationFrames.length),
              )
            : 60,
      },
      warnings: warnings.slice(-5),
      thresholds,
    };

    // Send to analytics service
    if (typeof window !== "undefined" && (window as any).analytics) {
      (window as any).analytics.track("tour_performance", report);
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log("[Performance Report]", report);
    }

    return report;
  }, [metrics, warnings, thresholds]);

  // Get performance score (0-100)
  const getPerformanceScore = useCallback(() => {
    let score = 100;

    // Deduct points for poor metrics
    if (metrics.fps < thresholds.minFPS) {
      score -= Math.min(20, (thresholds.minFPS - metrics.fps) * 2);
    }

    if (metrics.loadTime > thresholds.maxLoadTime) {
      score -= Math.min(20, (metrics.loadTime - thresholds.maxLoadTime) / 50);
    }

    if (metrics.memoryUsage > thresholds.maxMemoryUsage) {
      score -= Math.min(20, (metrics.memoryUsage - thresholds.maxMemoryUsage) * 2);
    }

    if (metrics.renderTime > thresholds.maxRenderTime) {
      score -= Math.min(20, metrics.renderTime - thresholds.maxRenderTime);
    }

    if (metrics.interactionLatency > thresholds.maxInteractionLatency) {
      score -= Math.min(20, (metrics.interactionLatency - thresholds.maxInteractionLatency) / 10);
    }

    return Math.max(0, Math.round(score));
  }, [metrics, thresholds]);

  // Check if performance is acceptable
  const isPerformanceAcceptable = useCallback(() => {
    return getPerformanceScore() >= 70;
  }, [getPerformanceScore]);

  return {
    metrics,
    warnings,
    trackInteraction,
    reportMetrics,
    getPerformanceScore,
    isPerformanceAcceptable,
    clearWarnings: () => setWarnings([]),
  };
}
