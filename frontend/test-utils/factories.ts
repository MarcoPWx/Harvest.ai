/**
 * Test Data Factories
 * Create consistent test data for unit and integration tests
 */

import { faker } from "@faker-js/faker";

// User Factory
export const createTestUser = (overrides: Partial<any> = {}) => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  avatar: faker.image.avatar(),
  plan: "free",
  apiKeys: [],
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

// API Key Factory
export const createTestApiKey = (overrides: Partial<any> = {}) => ({
  id: faker.string.uuid(),
  name: faker.company.name() + " API Key",
  key: "sk_test_" + faker.string.alphanumeric(32),
  provider: faker.helpers.arrayElement(["openai", "anthropic", "google"]),
  createdAt: faker.date.past(),
  lastUsed: faker.date.recent(),
  ...overrides,
});

// Generation Request Factory
export const createTestGenerationRequest = (overrides: Partial<any> = {}) => ({
  input: faker.lorem.paragraph(),
  format: faker.helpers.arrayElement(["blog", "email", "summary", "presentation"]),
  model: faker.helpers.arrayElement(["gpt-4", "gpt-3.5-turbo", "claude-3", "gemini-pro"]),
  tone: faker.helpers.arrayElement(["professional", "casual", "formal", "creative"]),
  length: faker.helpers.arrayElement(["short", "medium", "long"]),
  creativity: faker.number.float({ min: 0, max: 1 }),
  keywords: faker.helpers.multiple(() => faker.lorem.word(), { count: 3 }),
  ...overrides,
});

// Generation Response Factory
export const createTestGenerationResponse = (overrides: Partial<any> = {}) => ({
  id: faker.string.uuid(),
  content: faker.lorem.paragraphs(3),
  format: overrides.format || "blog",
  model: overrides.model || "gpt-4",
  provider: faker.helpers.arrayElement(["openai", "anthropic", "google"]),
  usage: {
    promptTokens: faker.number.int({ min: 100, max: 1000 }),
    completionTokens: faker.number.int({ min: 100, max: 2000 }),
    totalTokens: faker.number.int({ min: 200, max: 3000 }),
  },
  cost: faker.number.float({ min: 0.01, max: 0.5, precision: 0.001 }),
  cached: faker.datatype.boolean(),
  createdAt: faker.date.recent(),
  ...overrides,
});

// Template Factory
export const createTestTemplate = (overrides: Partial<any> = {}) => ({
  id: faker.string.uuid(),
  name: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  category: faker.helpers.arrayElement(["marketing", "crisis", "sales", "support"]),
  format: faker.helpers.arrayElement(["blog", "email", "summary"]),
  prompt: faker.lorem.paragraph(),
  variables: faker.helpers.multiple(
    () => ({
      name: faker.lorem.word(),
      type: "text",
      required: faker.datatype.boolean(),
    }),
    { count: 2 },
  ),
  ...overrides,
});

// Epic Factory (for epic management)
export const createTestEpic = (overrides: Partial<any> = {}) => ({
  id: faker.string.uuid(),
  title: faker.company.catchPhrase(),
  description: faker.lorem.paragraph(),
  status: faker.helpers.arrayElement(["not-started", "in-progress", "completed", "blocked"]),
  priority: faker.helpers.arrayElement(["low", "medium", "high", "critical"]),
  owner: faker.person.fullName(),
  startDate: faker.date.past(),
  endDate: faker.date.future(),
  progress: faker.number.int({ min: 0, max: 100 }),
  tasks: faker.helpers.multiple(
    () => ({
      id: faker.string.uuid(),
      title: faker.hacker.phrase(),
      completed: faker.datatype.boolean(),
    }),
    { count: 5 },
  ),
  ...overrides,
});

// System Status Factory
export const createTestSystemStatus = (overrides: Partial<any> = {}) => ({
  status: faker.helpers.arrayElement(["healthy", "degraded", "down"]),
  services: {
    api: faker.helpers.arrayElement(["up", "down"]),
    database: faker.helpers.arrayElement(["up", "down"]),
    cache: faker.helpers.arrayElement(["up", "down"]),
    ai: faker.helpers.arrayElement(["up", "degraded", "down"]),
  },
  metrics: {
    uptime: faker.number.float({ min: 95, max: 100, precision: 0.01 }),
    responseTime: faker.number.int({ min: 50, max: 500 }),
    errorRate: faker.number.float({ min: 0, max: 5, precision: 0.01 }),
  },
  timestamp: faker.date.recent(),
  ...overrides,
});

// Auth Session Factory
export const createTestSession = (overrides: Partial<any> = {}) => ({
  user: createTestUser(),
  accessToken: "test_access_" + faker.string.alphanumeric(32),
  refreshToken: "test_refresh_" + faker.string.alphanumeric(32),
  expiresAt: faker.date.future(),
  ...overrides,
});

// Error Factory
export const createTestError = (overrides: Partial<any> = {}) => ({
  code: faker.helpers.arrayElement([
    "AUTH_ERROR",
    "VALIDATION_ERROR",
    "RATE_LIMIT",
    "SERVER_ERROR",
  ]),
  message: faker.hacker.phrase(),
  details: faker.lorem.sentence(),
  timestamp: faker.date.recent(),
  requestId: faker.string.uuid(),
  ...overrides,
});

// Batch Generation Factory
export const createTestBatch = (count: number = 3) => ({
  id: faker.string.uuid(),
  items: Array.from({ length: count }, () => createTestGenerationRequest()),
  status: "pending",
  progress: 0,
  results: [],
  createdAt: faker.date.recent(),
});

// Usage Metrics Factory
export const createTestUsageMetrics = (overrides: Partial<any> = {}) => ({
  userId: faker.string.uuid(),
  period: faker.helpers.arrayElement(["daily", "weekly", "monthly"]),
  generations: faker.number.int({ min: 0, max: 1000 }),
  tokens: faker.number.int({ min: 0, max: 100000 }),
  cost: faker.number.float({ min: 0, max: 100, precision: 0.01 }),
  providers: {
    openai: faker.number.int({ min: 0, max: 500 }),
    anthropic: faker.number.int({ min: 0, max: 300 }),
    google: faker.number.int({ min: 0, max: 200 }),
  },
  ...overrides,
});
