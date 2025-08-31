/**
 * Project Overview Dashboard
 * Comprehensive system status and epic tracking visualization
 */

import React, { useState, useEffect } from "react";
import { Meta, StoryObj } from "@storybook/react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CubeIcon,
  ServerIcon,
  ShieldCheckIcon,
  BoltIcon,
  BeakerIcon,
  CodeBracketIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartPieIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

interface SystemStatus {
  category: string;
  status: "working" | "partial" | "not-working" | "planned";
  items: StatusItem[];
  icon: React.ComponentType<any>;
}

interface StatusItem {
  name: string;
  status: "working" | "partial" | "not-working" | "planned";
  description?: string;
  progress?: number;
  notes?: string[];
}

interface Epic {
  id: string;
  name: string;
  status: "complete" | "in-progress" | "planned" | "blocked";
  owner: string;
  priority: "P0" | "P1" | "P2";
  progress: number;
  tasks: Task[];
  startDate?: string;
  endDate?: string;
  blockers?: string[];
}

interface Task {
  id: string;
  name: string;
  status: "done" | "in-progress" | "todo" | "blocked";
  assignee?: string;
}

const systemStatus: SystemStatus[] = [
  {
    category: "Frontend",
    status: "working",
    icon: CodeBracketIcon,
    items: [
      { name: "Home Page", status: "working", description: "Landing page with hero section" },
      { name: "Demo Page", status: "working", description: "Interactive demos" },
      { name: "Navigation", status: "partial", description: "Desktop works, mobile issues" },
      { name: "Dark Mode", status: "working", description: "Persistent theme switching" },
      { name: "Storybook", status: "working", description: "Component documentation" },
    ],
  },
  {
    category: "Backend",
    status: "not-working",
    icon: ServerIcon,
    items: [
      {
        name: "Database",
        status: "not-working",
        description: "No PostgreSQL/Supabase yet",
        progress: 0,
      },
      { name: "Authentication", status: "not-working", description: "No user system", progress: 0 },
      { name: "API Routes", status: "partial", description: "Mock responses only", progress: 30 },
      {
        name: "File Storage",
        status: "not-working",
        description: "No S3/R2 integration",
        progress: 0,
      },
      {
        name: "Email Service",
        status: "not-working",
        description: "No email capability",
        progress: 0,
      },
    ],
  },
  {
    category: "AI Integration",
    status: "partial",
    icon: BoltIcon,
    items: [
      { name: "OpenAI", status: "partial", description: "Mock implementation", progress: 40 },
      { name: "Anthropic", status: "partial", description: "Mock implementation", progress: 40 },
      { name: "Google AI", status: "partial", description: "Mock implementation", progress: 30 },
      { name: "BYOK System", status: "planned", description: "Bring Your Own Key", progress: 10 },
      { name: "Streaming", status: "planned", description: "SSE implementation", progress: 5 },
    ],
  },
  {
    category: "Testing",
    status: "partial",
    icon: BeakerIcon,
    items: [
      { name: "Unit Tests", status: "partial", description: "82% passing", progress: 82 },
      {
        name: "E2E Tests",
        status: "partial",
        description: "115 tests, not verified",
        progress: 50,
      },
      { name: "Integration Tests", status: "not-working", description: "None exist", progress: 0 },
      { name: "Coverage Tracking", status: "partial", description: "Basic setup", progress: 60 },
      { name: "MSW Mocks", status: "working", description: "Mock service worker", progress: 90 },
    ],
  },
  {
    category: "Security",
    status: "planned",
    icon: ShieldCheckIcon,
    items: [
      {
        name: "Rate Limiting",
        status: "planned",
        description: "Token bucket implementation",
        progress: 20,
      },
      { name: "API Keys", status: "planned", description: "Key management", progress: 15 },
      { name: "CORS", status: "partial", description: "Basic headers", progress: 40 },
      { name: "CSP Headers", status: "partial", description: "Content security", progress: 30 },
      {
        name: "Encryption",
        status: "not-working",
        description: "Key encryption at rest",
        progress: 0,
      },
    ],
  },
];

const epics: Epic[] = [
  {
    id: "E-001",
    name: "Test Infrastructure",
    status: "complete",
    owner: "System Team",
    priority: "P0",
    progress: 100,
    startDate: "2024-12-15",
    endDate: "2024-12-22",
    tasks: [
      { id: "T-001", name: "Test utilities and factories", status: "done" },
      { id: "T-002", name: "E2E selectors", status: "done" },
      { id: "T-003", name: "MSW handlers", status: "done" },
      { id: "T-004", name: "Coverage tracking", status: "done" },
    ],
  },
  {
    id: "E-002",
    name: "Documentation Hub",
    status: "complete",
    owner: "Docs Team",
    priority: "P0",
    progress: 100,
    startDate: "2024-12-20",
    endDate: "2024-12-27",
    tasks: [
      { id: "T-005", name: "TDD Master Plan", status: "done" },
      { id: "T-006", name: "Testing Patterns", status: "done" },
      { id: "T-007", name: "Expert Hub", status: "done" },
      { id: "T-008", name: "Interactive examples", status: "done" },
    ],
  },
  {
    id: "E-003",
    name: "Authentication System",
    status: "in-progress",
    owner: "Auth Team",
    priority: "P0",
    progress: 20,
    startDate: "2024-12-28",
    blockers: ["Supabase environment not configured"],
    tasks: [
      { id: "T-009", name: "Test structure", status: "done" },
      { id: "T-010", name: "Unit tests for auth", status: "in-progress", assignee: "John" },
      { id: "T-011", name: "Integration tests", status: "todo" },
      { id: "T-012", name: "E2E login flow", status: "todo" },
      { id: "T-013", name: "Supabase implementation", status: "blocked" },
    ],
  },
  {
    id: "E-004",
    name: "BYOK System",
    status: "in-progress",
    owner: "Platform Team",
    priority: "P1",
    progress: 35,
    startDate: "2024-12-29",
    tasks: [
      { id: "T-014", name: "API types and specs", status: "done" },
      { id: "T-015", name: "API client implementation", status: "done" },
      { id: "T-016", name: "Session management", status: "in-progress", assignee: "Sarah" },
      { id: "T-017", name: "Provider validators", status: "in-progress", assignee: "Mike" },
      { id: "T-018", name: "Rate limiting", status: "todo" },
      { id: "T-019", name: "UI components", status: "todo" },
    ],
  },
  {
    id: "E-005",
    name: "Content Generation",
    status: "in-progress",
    owner: "AI Team",
    priority: "P0",
    progress: 60,
    tasks: [
      { id: "T-020", name: "AIService class", status: "done" },
      { id: "T-021", name: "Mock providers", status: "done" },
      { id: "T-022", name: "Basic tests", status: "done" },
      { id: "T-023", name: "Streaming tests", status: "in-progress", assignee: "Alex" },
      { id: "T-024", name: "Error handling", status: "todo" },
      { id: "T-025", name: "Cost calculation", status: "todo" },
    ],
  },
  {
    id: "E-006",
    name: "Observability",
    status: "planned",
    owner: "Platform Team",
    priority: "P2",
    progress: 10,
    tasks: [
      { id: "T-026", name: "Logging structure", status: "done" },
      { id: "T-027", name: "Metrics collection", status: "todo" },
      { id: "T-028", name: "Distributed tracing", status: "todo" },
      { id: "T-029", name: "Error tracking", status: "todo" },
      { id: "T-030", name: "Performance monitoring", status: "todo" },
    ],
  },
  {
    id: "E-007",
    name: "Billing & Subscriptions",
    status: "planned",
    owner: "Backend Team",
    priority: "P2",
    progress: 0,
    tasks: [
      { id: "T-031", name: "Stripe integration", status: "todo" },
      { id: "T-032", name: "Product configuration", status: "todo" },
      { id: "T-033", name: "Webhook handling", status: "todo" },
      { id: "T-034", name: "Customer portal", status: "todo" },
    ],
  },
];

const ProjectOverviewDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<"status" | "epics" | "metrics">("status");
  const [filter, setFilter] = useState<string>("all");
  const [realTimeUpdate, setRealTimeUpdate] = useState(new Date());

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeUpdate(new Date());
    }, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "working":
      case "complete":
      case "done":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case "partial":
      case "in-progress":
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case "not-working":
      case "blocked":
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case "planned":
      case "todo":
        return <ExclamationTriangleIcon className="w-5 h-5 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "working":
      case "complete":
      case "done":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "partial":
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "not-working":
      case "blocked":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "planned":
      case "todo":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "P0":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "P1":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "P2":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate overall statistics
  const stats = {
    totalEpics: epics.length,
    completedEpics: epics.filter((e) => e.status === "complete").length,
    inProgressEpics: epics.filter((e) => e.status === "in-progress").length,
    blockedEpics: epics.filter((e) => e.status === "blocked" || e.blockers?.length).length,
    overallProgress: Math.round(epics.reduce((acc, e) => acc + e.progress, 0) / epics.length),
    testCoverage: 82,
    systemHealth: 45,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Harvest.ai Project Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time system status and epic tracking dashboard
        </p>
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-500">
          Last updated: {realTimeUpdate.toLocaleString()}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overall Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.overallProgress}%
              </p>
            </div>
            <ChartPieIcon className="w-8 h-8 text-blue-500" />
          </div>
          <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 rounded-full h-2 transition-all duration-500"
              style={{ width: `${stats.overallProgress}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Test Coverage</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.testCoverage}%
              </p>
            </div>
            <BeakerIcon className="w-8 h-8 text-green-500" />
          </div>
          <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 rounded-full h-2 transition-all duration-500"
              style={{ width: `${stats.testCoverage}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Epics</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.inProgressEpics}/{stats.totalEpics}
              </p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-yellow-500" />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {stats.completedEpics} completed, {stats.blockedEpics} blocked
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">System Health</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.systemHealth}%
              </p>
            </div>
            <ServerIcon className="w-8 h-8 text-orange-500" />
          </div>
          <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-orange-500 rounded-full h-2 transition-all duration-500"
              style={{ width: `${stats.systemHealth}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 inline-flex">
        <button
          onClick={() => setSelectedTab("status")}
          className={`px-4 py-2 rounded-md transition-colors ${
            selectedTab === "status"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          System Status
        </button>
        <button
          onClick={() => setSelectedTab("epics")}
          className={`px-4 py-2 rounded-md transition-colors ${
            selectedTab === "epics"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Epic Tracking
        </button>
        <button
          onClick={() => setSelectedTab("metrics")}
          className={`px-4 py-2 rounded-md transition-colors ${
            selectedTab === "metrics"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Metrics & Charts
        </button>
      </div>

      {/* Tab Content */}
      {selectedTab === "status" && (
        <div className="space-y-6">
          {systemStatus.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.category}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
              >
                <div className="flex items-center mb-4">
                  <Icon className="w-6 h-6 mr-2 text-gray-600 dark:text-gray-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {category.category}
                  </h2>
                  <span
                    className={`ml-3 px-2 py-1 text-xs rounded-full ${getStatusColor(category.status)}`}
                  >
                    {category.status.replace("-", " ").toUpperCase()}
                  </span>
                </div>
                <div className="space-y-3">
                  {category.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      <div className="flex items-center flex-1">
                        {getStatusIcon(item.status)}
                        <div className="ml-3">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </div>
                          {item.description && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                      {item.progress !== undefined && (
                        <div className="w-32">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                              <div
                                className={`rounded-full h-2 transition-all duration-500 ${
                                  item.progress >= 80
                                    ? "bg-green-500"
                                    : item.progress >= 50
                                      ? "bg-yellow-500"
                                      : item.progress >= 20
                                        ? "bg-orange-500"
                                        : "bg-red-500"
                                }`}
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {item.progress}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedTab === "epics" && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              All ({epics.length})
            </button>
            <button
              onClick={() => setFilter("in-progress")}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === "in-progress"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              In Progress ({epics.filter((e) => e.status === "in-progress").length})
            </button>
            <button
              onClick={() => setFilter("complete")}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === "complete"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              Complete ({epics.filter((e) => e.status === "complete").length})
            </button>
            <button
              onClick={() => setFilter("blocked")}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === "blocked"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              Blocked ({epics.filter((e) => e.blockers?.length).length})
            </button>
          </div>

          {/* Epic Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {epics
              .filter(
                (epic) =>
                  filter === "all" ||
                  (filter === "blocked" && epic.blockers?.length) ||
                  epic.status === filter,
              )
              .map((epic) => (
                <div key={epic.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {epic.name}
                        </h3>
                        <span
                          className={`ml-2 px-2 py-1 text-xs rounded-full ${getPriorityColor(epic.priority)}`}
                        >
                          {epic.priority}
                        </span>
                      </div>
                      <div className="flex items-center mt-1 space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>{epic.id}</span>
                        <span>•</span>
                        <span>{epic.owner}</span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(epic.status)}`}
                    >
                      {epic.status.replace("-", " ").toUpperCase()}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {epic.progress}%
                      </span>
                    </div>
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`rounded-full h-2 transition-all duration-500 ${
                          epic.progress === 100
                            ? "bg-green-500"
                            : epic.progress >= 60
                              ? "bg-blue-500"
                              : epic.progress >= 30
                                ? "bg-yellow-500"
                                : "bg-red-500"
                        }`}
                        style={{ width: `${epic.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Blockers */}
                  {epic.blockers && epic.blockers.length > 0 && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                      <div className="flex items-center text-red-800 dark:text-red-200">
                        <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Blockers:</span>
                      </div>
                      <ul className="mt-1 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
                        {epic.blockers.map((blocker, idx) => (
                          <li key={idx}>{blocker}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tasks */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tasks ({epic.tasks.filter((t) => t.status === "done").length}/
                      {epic.tasks.length})
                    </div>
                    <div className="space-y-1">
                      {epic.tasks.slice(0, 3).map((task) => (
                        <div key={task.id} className="flex items-center text-sm">
                          {getStatusIcon(task.status)}
                          <span className="ml-2 text-gray-700 dark:text-gray-300">{task.name}</span>
                          {task.assignee && (
                            <span className="ml-auto text-xs text-gray-500 dark:text-gray-500">
                              @{task.assignee}
                            </span>
                          )}
                        </div>
                      ))}
                      {epic.tasks.length > 3 && (
                        <div className="text-sm text-gray-500 dark:text-gray-500 ml-7">
                          +{epic.tasks.length - 3} more tasks
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dates */}
                  {(epic.startDate || epic.endDate) && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-500">
                      {epic.startDate && <span>Started: {epic.startDate}</span>}
                      {epic.startDate && epic.endDate && <span className="mx-2">•</span>}
                      {epic.endDate && <span>Target: {epic.endDate}</span>}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {selectedTab === "metrics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sprint Velocity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Sprint Velocity
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Week 1</span>
                <div className="flex items-center">
                  <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-3 mr-2">
                    <div className="bg-green-500 rounded-full h-3" style={{ width: "100%" }} />
                  </div>
                  <span className="text-sm font-medium">12 pts</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Week 2</span>
                <div className="flex items-center">
                  <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-3 mr-2">
                    <div className="bg-blue-500 rounded-full h-3" style={{ width: "66%" }} />
                  </div>
                  <span className="text-sm font-medium">8 pts</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Week 3</span>
                <div className="flex items-center">
                  <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-3 mr-2">
                    <div className="bg-yellow-500 rounded-full h-3" style={{ width: "33%" }} />
                  </div>
                  <span className="text-sm font-medium">4 pts</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Week 4 (projected)</span>
                <div className="flex items-center">
                  <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-3 mr-2">
                    <div
                      className="bg-gray-400 rounded-full h-3 opacity-50"
                      style={{ width: "66%" }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-500">8 pts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Test Coverage by Component */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Test Coverage by Component
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">UI Components</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                    <div className="bg-green-500 rounded-full h-2" style={{ width: "85%" }} />
                  </div>
                  <span className="text-sm font-medium">85%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">AIService</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                    <div className="bg-yellow-500 rounded-full h-2" style={{ width: "75%" }} />
                  </div>
                  <span className="text-sm font-medium">75%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Templates</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                    <div className="bg-yellow-500 rounded-full h-2" style={{ width: "60%" }} />
                  </div>
                  <span className="text-sm font-medium">60%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">API Routes</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                    <div className="bg-orange-500 rounded-full h-2" style={{ width: "50%" }} />
                  </div>
                  <span className="text-sm font-medium">50%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Auth</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                    <div className="bg-red-500 rounded-full h-2" style={{ width: "0%" }} />
                  </div>
                  <span className="text-sm font-medium">0%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Burndown Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Sprint Burndown
            </h3>
            <div className="h-48 flex items-end justify-between">
              <div className="flex flex-col items-center">
                <div className="bg-blue-500 w-8 rounded-t" style={{ height: "100%" }}></div>
                <span className="text-xs mt-1">Day 1</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-blue-500 w-8 rounded-t" style={{ height: "80%" }}></div>
                <span className="text-xs mt-1">Day 5</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-blue-500 w-8 rounded-t" style={{ height: "60%" }}></div>
                <span className="text-xs mt-1">Day 10</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-green-500 w-8 rounded-t" style={{ height: "40%" }}></div>
                <span className="text-xs mt-1">Day 15</span>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className="bg-gray-400 w-8 rounded-t opacity-50"
                  style={{ height: "20%" }}
                ></div>
                <span className="text-xs mt-1">Day 20</span>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className="bg-gray-400 w-8 rounded-t opacity-50"
                  style={{ height: "5%" }}
                ></div>
                <span className="text-xs mt-1">Day 30</span>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="inline-block w-3 h-3 bg-green-500 rounded mr-2"></span>
              Current
              <span className="inline-block w-3 h-3 bg-gray-400 rounded mr-2 ml-4 opacity-50"></span>
              Projected
            </div>
          </div>

          {/* Risk Matrix */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Risk Assessment
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                    <span className="font-medium text-red-800 dark:text-red-200">High Risk</span>
                  </div>
                  <span className="text-sm text-red-600 dark:text-red-300">3 items</span>
                </div>
                <ul className="mt-2 text-sm text-red-700 dark:text-red-300 space-y-1">
                  <li>• Authentication: No implementation</li>
                  <li>• BYOK: Security-critical, partial</li>
                  <li>• Payment: Not started</li>
                </ul>
              </div>

              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-2" />
                    <span className="font-medium text-yellow-800 dark:text-yellow-200">
                      Medium Risk
                    </span>
                  </div>
                  <span className="text-sm text-yellow-600 dark:text-yellow-300">3 items</span>
                </div>
                <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• AI Service: Needs streaming tests</li>
                  <li>• API Routes: Low integration coverage</li>
                  <li>• Error Handling: Minimal coverage</li>
                </ul>
              </div>

              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                    <span className="font-medium text-green-800 dark:text-green-200">Low Risk</span>
                  </div>
                  <span className="text-sm text-green-600 dark:text-green-300">3 items</span>
                </div>
                <ul className="mt-2 text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• UI Components: Good coverage</li>
                  <li>• Documentation: Comprehensive</li>
                  <li>• Test Infrastructure: Solid</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Quick Links</h3>
        <div className="flex flex-wrap gap-2">
          <a
            href="?path=/docs/docs-tdd-master-plan--docs"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            TDD Master Plan →
          </a>
          <span className="text-blue-400 dark:text-blue-600">•</span>
          <a
            href="?path=/docs/docs-testing-patterns-examples--docs"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Testing Patterns →
          </a>
          <span className="text-blue-400 dark:text-blue-600">•</span>
          <a
            href="?path=/docs/docs-expert-hub--docs"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Expert Hub →
          </a>
          <span className="text-blue-400 dark:text-blue-600">•</span>
          <a
            href="http://localhost:8080/coverage"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Coverage Report →
          </a>
          <span className="text-blue-400 dark:text-blue-600">•</span>
          <a
            href="http://localhost:8081"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Playwright UI →
          </a>
        </div>
      </div>
    </div>
  );
};

const meta: Meta = {
  title: "Dashboard/Project Overview",
  component: ProjectOverviewDashboard,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Comprehensive project overview dashboard showing system status, epic tracking, and metrics",
      },
    },
  },
};

export default meta;

export const Default: StoryObj = {
  render: () => <ProjectOverviewDashboard />,
};

export const StatusView: StoryObj = {
  render: () => {
    return <ProjectOverviewDashboard />;
  },
  parameters: {
    docs: {
      description: {
        story: "System status view showing the current state of all components",
      },
    },
  },
};

export const EpicsView: StoryObj = {
  render: () => {
    const Component = () => {
      const [selectedTab, setSelectedTab] = useState<"status" | "epics" | "metrics">("epics");
      useEffect(() => {
        setSelectedTab("epics");
      }, []);
      return <ProjectOverviewDashboard />;
    };
    return <Component />;
  },
  parameters: {
    docs: {
      description: {
        story: "Epic tracking view showing progress on all development epics",
      },
    },
  },
};

export const MetricsView: StoryObj = {
  render: () => {
    const Component = () => {
      const [selectedTab, setSelectedTab] = useState<"status" | "epics" | "metrics">("metrics");
      useEffect(() => {
        setSelectedTab("metrics");
      }, []);
      return <ProjectOverviewDashboard />;
    };
    return <Component />;
  },
  parameters: {
    docs: {
      description: {
        story: "Metrics and charts view showing project analytics",
      },
    },
  },
};
