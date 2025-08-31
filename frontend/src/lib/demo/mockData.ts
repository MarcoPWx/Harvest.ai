/**
 * Mock Data Generator for Demo Mode
 * Generates realistic mock data for BYOK sessions and analytics
 */

import { BYOKSession, BYOKProvider, SessionStatus } from "@/types/byok";

// Mock provider configurations
export const mockProviders: Record<
  BYOKProvider,
  {
    name: string;
    models: string[];
    color: string;
    icon: string;
    costPerToken: number;
  }
> = {
  openai: {
    name: "OpenAI",
    models: ["gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"],
    color: "emerald",
    icon: "🤖",
    costPerToken: 0.00003,
  },
  anthropic: {
    name: "Anthropic",
    models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
    color: "purple",
    icon: "🧠",
    costPerToken: 0.00004,
  },
  google: {
    name: "Google AI",
    models: ["gemini-pro", "gemini-pro-vision", "palm-2"],
    color: "blue",
    icon: "🌟",
    costPerToken: 0.00002,
  },
  azure: {
    name: "Azure OpenAI",
    models: ["gpt-4-32k", "gpt-4", "gpt-35-turbo"],
    color: "sky",
    icon: "☁️",
    costPerToken: 0.00003,
  },
  cohere: {
    name: "Cohere",
    models: ["command-xlarge", "command-medium", "command-light"],
    color: "orange",
    icon: "🔥",
    costPerToken: 0.00002,
  },
  huggingface: {
    name: "Hugging Face",
    models: ["llama-2-70b", "falcon-40b", "mistral-7b"],
    color: "yellow",
    icon: "🤗",
    costPerToken: 0.00001,
  },
};

// Generate random date within range
const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Generate mock usage data
const generateUsageData = () => {
  const tokensUsed = Math.floor(Math.random() * 50000) + 1000;
  const requestCount = Math.floor(Math.random() * 200) + 10;

  return {
    tokensUsed,
    requestCount,
    avgTokensPerRequest: Math.floor(tokensUsed / requestCount),
  };
};

// Generate mock session
export const generateMockSession = (
  provider: BYOKProvider,
  index: number,
  status?: SessionStatus,
): BYOKSession => {
  const now = new Date();
  const createdAt = randomDate(
    new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    now,
  );
  const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000); // 24 hours later

  const usage = generateUsageData();
  const providerConfig = mockProviders[provider];
  const selectedModel =
    providerConfig.models[Math.floor(Math.random() * providerConfig.models.length)];

  // Determine status
  let sessionStatus: SessionStatus = status || "active";
  if (!status) {
    if (expiresAt < now) {
      sessionStatus = "expired";
    } else if (Math.random() > 0.8) {
      sessionStatus = "inactive";
    }
  }

  return {
    id: `demo-session-${provider}-${index}`,
    provider,
    status: sessionStatus,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    lastUsedAt:
      sessionStatus === "active"
        ? randomDate(createdAt, now).toISOString()
        : createdAt.toISOString(),
    metadata: {
      model: selectedModel,
      temperature: Math.round(Math.random() * 10) / 10,
      maxTokens: [2048, 4096, 8192][Math.floor(Math.random() * 3)],
      topP: Math.round(Math.random() * 10) / 10,
    },
    usage: {
      tokensUsed: usage.tokensUsed,
      requestCount: usage.requestCount,
      cost: usage.tokensUsed * providerConfig.costPerToken,
      lastRequestAt:
        sessionStatus === "active" ? randomDate(createdAt, now).toISOString() : undefined,
    },
    rateLimits: {
      requestsPerMinute: [10, 20, 60, 100][Math.floor(Math.random() * 4)],
      tokensPerMinute: [10000, 40000, 90000, 150000][Math.floor(Math.random() * 4)],
      concurrentRequests: [1, 5, 10][Math.floor(Math.random() * 3)],
    },
  };
};

// Generate multiple mock sessions
export const generateMockSessions = (count: number = 10): BYOKSession[] => {
  const providers = Object.keys(mockProviders) as BYOKProvider[];
  const sessions: BYOKSession[] = [];

  // Ensure at least one active session per provider
  providers.forEach((provider, index) => {
    sessions.push(generateMockSession(provider, index, "active"));
  });

  // Generate additional random sessions
  for (let i = providers.length; i < count; i++) {
    const provider = providers[Math.floor(Math.random() * providers.length)];
    sessions.push(generateMockSession(provider, i));
  }

  // Sort by creation date (newest first)
  return sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Generate analytics data
export interface MockAnalytics {
  totalSessions: number;
  activeSessions: number;
  totalTokensUsed: number;
  totalCost: number;
  totalRequests: number;
  providerBreakdown: {
    provider: BYOKProvider;
    sessions: number;
    tokensUsed: number;
    cost: number;
    percentage: number;
  }[];
  dailyUsage: {
    date: string;
    tokens: number;
    requests: number;
    cost: number;
  }[];
  modelUsage: {
    model: string;
    provider: BYOKProvider;
    requests: number;
    tokens: number;
  }[];
}

export const generateMockAnalytics = (sessions: BYOKSession[]): MockAnalytics => {
  const totalSessions = sessions.length;
  const activeSessions = sessions.filter((s) => s.status === "active").length;

  let totalTokensUsed = 0;
  let totalCost = 0;
  let totalRequests = 0;

  const providerStats: Record<
    BYOKProvider,
    {
      sessions: number;
      tokensUsed: number;
      cost: number;
    }
  > = {} as any;

  const modelStats: Record<
    string,
    {
      provider: BYOKProvider;
      requests: number;
      tokens: number;
    }
  > = {};

  // Calculate totals and breakdown
  sessions.forEach((session) => {
    if (session.usage) {
      totalTokensUsed += session.usage.tokensUsed;
      totalCost += session.usage.cost;
      totalRequests += session.usage.requestCount;

      if (!providerStats[session.provider]) {
        providerStats[session.provider] = {
          sessions: 0,
          tokensUsed: 0,
          cost: 0,
        };
      }

      providerStats[session.provider].sessions++;
      providerStats[session.provider].tokensUsed += session.usage.tokensUsed;
      providerStats[session.provider].cost += session.usage.cost;

      // Model usage
      const model = session.metadata?.model;
      if (model) {
        if (!modelStats[model]) {
          modelStats[model] = {
            provider: session.provider,
            requests: 0,
            tokens: 0,
          };
        }
        modelStats[model].requests += session.usage.requestCount;
        modelStats[model].tokens += session.usage.tokensUsed;
      }
    }
  });

  // Generate provider breakdown
  const providerBreakdown = Object.entries(providerStats).map(([provider, stats]) => ({
    provider: provider as BYOKProvider,
    ...stats,
    percentage: Math.round((stats.tokensUsed / totalTokensUsed) * 100),
  }));

  // Generate daily usage (last 7 days)
  const dailyUsage = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const dayTokens = Math.floor(Math.random() * 20000) + 5000;
    const dayRequests = Math.floor(Math.random() * 100) + 20;

    dailyUsage.push({
      date: date.toISOString().split("T")[0],
      tokens: dayTokens,
      requests: dayRequests,
      cost: dayTokens * 0.00003,
    });
  }

  // Generate model usage
  const modelUsage = Object.entries(modelStats)
    .map(([model, stats]) => ({
      model,
      ...stats,
    }))
    .sort((a, b) => b.tokens - a.tokens)
    .slice(0, 10);

  return {
    totalSessions,
    activeSessions,
    totalTokensUsed,
    totalCost,
    totalRequests,
    providerBreakdown,
    dailyUsage,
    modelUsage,
  };
};

// Generate mock API responses
export const mockApiResponses = {
  createSession: (provider: BYOKProvider) => ({
    success: true,
    session: generateMockSession(provider, Date.now(), "active"),
    message: "Demo session created successfully",
  }),

  validateKey: () => ({
    valid: true,
    provider: "openai" as BYOKProvider,
    models: mockProviders.openai.models,
    limits: {
      requestsPerMinute: 60,
      tokensPerMinute: 90000,
    },
  }),

  listSessions: (count: number = 10) => ({
    sessions: generateMockSessions(count),
    total: count,
    page: 1,
    pageSize: 20,
  }),

  getSession: (sessionId: string, provider: BYOKProvider = "openai") => ({
    session: {
      ...generateMockSession(provider, 1, "active"),
      id: sessionId,
    },
  }),

  refreshSession: (sessionId: string) => ({
    success: true,
    session: {
      id: sessionId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  }),

  deleteSession: () => ({
    success: true,
    message: "Demo session deleted",
  }),

  getAnalytics: () => {
    const sessions = generateMockSessions(20);
    return generateMockAnalytics(sessions);
  },
};

// Demo mode state manager
export class DemoModeManager {
  private sessions: BYOKSession[] = [];
  private isActive: boolean = false;

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const stored = localStorage.getItem("harvest_demo_state");
      if (stored) {
        const state = JSON.parse(stored);
        this.sessions = state.sessions || [];
        this.isActive = state.isActive || false;
      }
    } catch (error) {
      console.warn("Failed to load demo state:", error);
    }
  }

  private saveState() {
    try {
      localStorage.setItem(
        "harvest_demo_state",
        JSON.stringify({
          sessions: this.sessions,
          isActive: this.isActive,
        }),
      );
    } catch (error) {
      console.warn("Failed to save demo state:", error);
    }
  }

  activate() {
    this.isActive = true;
    this.sessions = generateMockSessions(15);
    this.saveState();

    // Set demo flag
    sessionStorage.setItem("harvest_demo_mode", "true");
  }

  deactivate() {
    this.isActive = false;
    this.sessions = [];
    this.saveState();

    // Remove demo flag
    sessionStorage.removeItem("harvest_demo_mode");
  }

  isDemo() {
    return this.isActive || sessionStorage.getItem("harvest_demo_mode") === "true";
  }

  getSessions() {
    return this.sessions;
  }

  addSession(provider: BYOKProvider) {
    const session = generateMockSession(provider, Date.now(), "active");
    this.sessions.unshift(session);
    this.saveState();
    return session;
  }

  removeSession(sessionId: string) {
    this.sessions = this.sessions.filter((s) => s.id !== sessionId);
    this.saveState();
  }

  getAnalytics() {
    return generateMockAnalytics(this.sessions);
  }
}

// Export singleton instance
export const demoManager = new DemoModeManager();
