/**
 * TTFUO (Time To First Useful Output) Tracking
 * Our North Star metric: 90 seconds from landing to useful output
 */

export interface TTFUOEvent {
  timestamp: number;
  event: "landing" | "first_input" | "generate_click" | "first_token" | "complete" | "export";
  metadata?: Record<string, any>;
}

export interface TTFUOSession {
  sessionId: string;
  startTime: number;
  events: TTFUOEvent[];
  isCrisis: boolean;
  templateUsed?: string;
  provider?: string;
  ttfuo?: number; // Final TTFUO in milliseconds
  success?: boolean;
}

class TTFUOTracker {
  private currentSession: TTFUOSession | null = null;
  private readonly STORAGE_KEY = "harvest_ttfuo_sessions";
  private readonly MAX_SESSIONS = 100; // Keep last 100 sessions

  /**
   * Start a new TTFUO tracking session
   */
  startSession(isCrisis: boolean = false): string {
    const sessionId = `ttfuo_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const startTime = Date.now();

    this.currentSession = {
      sessionId,
      startTime,
      events: [
        {
          timestamp: startTime,
          event: "landing",
          metadata: { isCrisis, url: window.location.href },
        },
      ],
      isCrisis,
    };

    this.saveSession();
    return sessionId;
  }

  /**
   * Track an event in the current session
   */
  trackEvent(event: TTFUOEvent["event"], metadata?: Record<string, any>) {
    if (!this.currentSession) {
      this.startSession();
    }

    const eventData: TTFUOEvent = {
      timestamp: Date.now(),
      event,
      metadata,
    };

    this.currentSession!.events.push(eventData);

    // Calculate TTFUO when we get the complete event
    if (event === "complete") {
      const landingEvent = this.currentSession!.events.find((e) => e.event === "landing");
      if (landingEvent) {
        this.currentSession!.ttfuo = eventData.timestamp - landingEvent.timestamp;
        this.currentSession!.success = true;

        // Log achievement if under 90 seconds
        if (this.currentSession!.ttfuo < 90000) {
          console.log(
            `🎯 North Star achieved! TTFUO: ${Math.floor(this.currentSession!.ttfuo / 1000)}s`,
          );
          this.logNorthStarAchievement();
        }
      }
    }

    // Track template usage
    if (metadata?.templateUsed) {
      this.currentSession!.templateUsed = metadata.templateUsed;
    }

    // Track provider
    if (metadata?.provider) {
      this.currentSession!.provider = metadata.provider;
    }

    this.saveSession();
  }

  /**
   * Get the current TTFUO (time since landing)
   */
  getCurrentTTFUO(): number | null {
    if (!this.currentSession) return null;

    const landingEvent = this.currentSession.events.find((e) => e.event === "landing");
    if (!landingEvent) return null;

    return Date.now() - landingEvent.timestamp;
  }

  /**
   * Get metrics for North Star tracking
   */
  getMetrics(): {
    averageTTFUO: number;
    p90TTFUO: number;
    successRate: number;
    crisisReturnRate: number;
    exportRate: number;
    templateUsageRate: number;
  } {
    const sessions = this.getAllSessions();
    const completedSessions = sessions.filter((s) => s.ttfuo !== undefined);

    if (completedSessions.length === 0) {
      return {
        averageTTFUO: 0,
        p90TTFUO: 0,
        successRate: 0,
        crisisReturnRate: 0,
        exportRate: 0,
        templateUsageRate: 0,
      };
    }

    // Calculate average TTFUO
    const ttfuoValues = completedSessions.map((s) => s.ttfuo!);
    const averageTTFUO = ttfuoValues.reduce((a, b) => a + b, 0) / ttfuoValues.length;

    // Calculate P90 TTFUO
    const sortedTTFUO = [...ttfuoValues].sort((a, b) => a - b);
    const p90Index = Math.floor(sortedTTFUO.length * 0.9);
    const p90TTFUO = sortedTTFUO[p90Index] || 0;

    // Calculate success rate
    const successRate = completedSessions.filter((s) => s.success).length / sessions.length;

    // Calculate crisis return rate
    const crisisSessions = sessions.filter((s) => s.isCrisis);
    const uniqueCrisisUsers = new Set(crisisSessions.map((s) => s.sessionId.split("_")[1]));
    const returnUsers = Array.from(uniqueCrisisUsers).filter((userId) => {
      const userSessions = crisisSessions.filter((s) => s.sessionId.includes(userId));
      return userSessions.length > 1;
    });
    const crisisReturnRate =
      uniqueCrisisUsers.size > 0 ? returnUsers.length / uniqueCrisisUsers.size : 0;

    // Calculate export rate
    const exportRate =
      sessions.filter((s) => s.events.some((e) => e.event === "export")).length / sessions.length;

    // Calculate template usage rate
    const templateUsageRate =
      completedSessions.filter((s) => s.templateUsed).length / completedSessions.length;

    return {
      averageTTFUO,
      p90TTFUO,
      successRate,
      crisisReturnRate,
      exportRate,
      templateUsageRate,
    };
  }

  /**
   * Get all sessions from localStorage
   */
  private getAllSessions(): TTFUOSession[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save current session to localStorage
   */
  private saveSession() {
    if (!this.currentSession) return;

    try {
      const sessions = this.getAllSessions();
      const existingIndex = sessions.findIndex(
        (s) => s.sessionId === this.currentSession!.sessionId,
      );

      if (existingIndex >= 0) {
        sessions[existingIndex] = this.currentSession;
      } else {
        sessions.push(this.currentSession);
      }

      // Keep only last MAX_SESSIONS
      const trimmed = sessions.slice(-this.MAX_SESSIONS);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.error("Failed to save TTFUO session:", e);
    }
  }

  /**
   * Log North Star achievement for celebration
   */
  private logNorthStarAchievement() {
    try {
      const achievements = JSON.parse(localStorage.getItem("north_star_achievements") || "[]");
      achievements.push({
        timestamp: Date.now(),
        ttfuo: this.currentSession!.ttfuo,
        isCrisis: this.currentSession!.isCrisis,
        templateUsed: this.currentSession!.templateUsed,
      });
      localStorage.setItem("north_star_achievements", JSON.stringify(achievements.slice(-50)));
    } catch (e) {
      console.error("Failed to log North Star achievement:", e);
    }
  }

  /**
   * Get a summary report for display
   */
  getReport(): string {
    const metrics = this.getMetrics();
    const sessions = this.getAllSessions();
    const achievements = JSON.parse(localStorage.getItem("north_star_achievements") || "[]");

    return `
TTFUO Performance Report
========================
Sessions Tracked: ${sessions.length}
North Star Achievements: ${achievements.length}

Key Metrics:
- Average TTFUO: ${Math.floor(metrics.averageTTFUO / 1000)}s
- P90 TTFUO: ${Math.floor(metrics.p90TTFUO / 1000)}s ${metrics.p90TTFUO <= 90000 ? "✅" : "❌"}
- Success Rate: ${(metrics.successRate * 100).toFixed(1)}%
- Crisis Return Rate: ${(metrics.crisisReturnRate * 100).toFixed(1)}% ${metrics.crisisReturnRate >= 0.9 ? "✅" : "❌"}
- Export Rate: ${(metrics.exportRate * 100).toFixed(1)}% ${metrics.exportRate === 1 ? "✅" : "❌"}
- Template Usage: ${(metrics.templateUsageRate * 100).toFixed(1)}%

North Star Status: ${metrics.p90TTFUO <= 90000 ? "🎯 ACHIEVED" : "🎯 IN PROGRESS"}
    `.trim();
  }
}

// Export singleton instance
export const ttfuoTracker = new TTFUOTracker();

// Export for use in components
export function useTTFUO() {
  return {
    startSession: (isCrisis?: boolean) => ttfuoTracker.startSession(isCrisis),
    trackEvent: (event: TTFUOEvent["event"], metadata?: Record<string, any>) =>
      ttfuoTracker.trackEvent(event, metadata),
    getCurrentTTFUO: () => ttfuoTracker.getCurrentTTFUO(),
    getMetrics: () => ttfuoTracker.getMetrics(),
    getReport: () => ttfuoTracker.getReport(),
  };
}
