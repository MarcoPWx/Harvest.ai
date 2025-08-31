import { factory, primaryKey } from "@mswjs/data";
import { faker } from "@faker-js/faker";

// Define the database schema
export const db = factory({
  user: {
    id: primaryKey(() => `user_${faker.string.uuid()}`),
    email: () => faker.internet.email(),
    name: () => faker.person.fullName(),
    avatar: () => faker.image.avatar(),
    role: () => "user" as "user" | "admin" | "developer",
    subscription_tier: () => "pro" as "free" | "starter" | "pro" | "team" | "enterprise",
    subscription_status: () => "active" as "active" | "canceled" | "past_due" | "trialing",
    api_keys: () => [] as string[],
    created_at: () => faker.date.past().toISOString(),
    updated_at: () => new Date().toISOString(),
    preferences: () => ({
      theme: "dark",
      default_format: "blog",
      email_notifications: true,
      language: "en",
    }),
    usage: () => ({
      generations_today: faker.number.int({ min: 0, max: 50 }),
      generations_total: faker.number.int({ min: 0, max: 1000 }),
      tokens_used: faker.number.int({ min: 0, max: 100000 }),
      limit: 1000,
      reset_date: faker.date.future().toISOString(),
    }),
  },

  generation: {
    id: primaryKey(() => `gen_${faker.string.uuid()}`),
    user_id: () => "",
    input: () => faker.lorem.paragraph(),
    output: () => faker.lorem.paragraphs(3),
    format: () => faker.helpers.arrayElement(["blog", "email", "summary", "presentation"]),
    model: () => faker.helpers.arrayElement(["gpt-4", "gpt-3.5-turbo", "claude-3", "gemini-pro"]),
    status: () => "completed" as "pending" | "processing" | "completed" | "failed",
    tokens_used: () => faker.number.int({ min: 100, max: 2000 }),
    cost: () => faker.number.float({ min: 0.01, max: 0.5, multipleOf: 0.001 }),
    quality_score: () => faker.number.int({ min: 70, max: 100 }),
    processing_time: () => faker.number.int({ min: 500, max: 5000 }),
    created_at: () => faker.date.recent().toISOString(),
    metadata: () => ({
      temperature: 0.7,
      max_tokens: 1000,
      language: "en",
      cached: faker.datatype.boolean(),
    }),
  },

  team: {
    id: primaryKey(() => `team_${faker.string.uuid()}`),
    name: () => faker.company.name(),
    slug: () => faker.helpers.slugify(faker.company.name()).toLowerCase(),
    description: () => faker.company.catchPhrase(),
    logo_url: () => faker.image.url(),
    owner_id: () => "",
    member_ids: () => [] as string[],
    subscription_tier: () => "team" as "team" | "enterprise",
    max_members: () => faker.number.int({ min: 5, max: 50 }),
    created_at: () => faker.date.past().toISOString(),
    settings: () => ({
      allow_api_access: true,
      shared_generations: true,
      billing_email: faker.internet.email(),
    }),
  },

  template: {
    id: primaryKey(() => `template_${faker.string.uuid()}`),
    name: () => faker.commerce.productName(),
    description: () => faker.commerce.productDescription(),
    category: () =>
      faker.helpers.arrayElement(["marketing", "sales", "education", "development", "creative"]),
    format: () => faker.helpers.arrayElement(["blog", "email", "summary", "presentation"]),
    prompt: () => faker.lorem.paragraph(),
    variables: () => [] as string[],
    is_public: () => faker.datatype.boolean(),
    is_featured: () => faker.datatype.boolean(),
    usage_count: () => faker.number.int({ min: 0, max: 10000 }),
    rating: () => faker.number.float({ min: 3, max: 5, multipleOf: 0.1 }),
    created_by: () => "",
    created_at: () => faker.date.past().toISOString(),
  },

  apiKey: {
    id: primaryKey(() => `key_${faker.string.uuid()}`),
    user_id: () => "",
    name: () => faker.lorem.words(2),
    key_preview: () => `sk-...${faker.string.alphanumeric(8)}`,
    permissions: () => ["read", "write"],
    rate_limit: () => faker.number.int({ min: 10, max: 1000 }),
    requests_count: () => faker.number.int({ min: 0, max: 10000 }),
    status: () => "active" as "active" | "revoked" | "expired",
    expires_at: () => faker.date.future().toISOString(),
    last_used_at: () => faker.date.recent().toISOString(),
    created_at: () => faker.date.past().toISOString(),
  },

  epic: {
    id: primaryKey(() => `epic_${faker.string.uuid()}`),
    title: () => faker.lorem.words(3),
    description: () => faker.lorem.sentence(),
    status: () =>
      faker.helpers.arrayElement(["proposed", "in-progress", "done"]) as
        | "proposed"
        | "in-progress"
        | "done",
    links: () => [] as string[],
    created_at: () => faker.date.recent().toISOString(),
    updated_at: () => new Date().toISOString(),
  },

  notification: {
    id: primaryKey(() => `notif_${faker.string.uuid()}`),
    user_id: () => "",
    type: () => faker.helpers.arrayElement(["info", "success", "warning", "error"]),
    title: () => faker.lorem.sentence(),
    message: () => faker.lorem.paragraph(),
    read: () => faker.datatype.boolean(),
    action_url: () => faker.internet.url(),
    created_at: () => faker.date.recent().toISOString(),
  },
});

// Seed initial data
export function seedDatabase() {
  // Create a demo user
  const demoUser = db.user.create({
    id: "user_demo",
    email: "demo@harvest.ai",
    name: "Demo User",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
    role: "user",
    subscription_tier: "pro",
    subscription_status: "active",
    created_at: new Date("2024-01-01").toISOString(),
  });

  // Create some generations for the demo user
  for (let i = 0; i < 10; i++) {
    db.generation.create({
      user_id: demoUser.id,
      input: faker.lorem.sentence(),
      output: faker.lorem.paragraphs(2),
      format: faker.helpers.arrayElement(["blog", "email", "summary"]),
      model: faker.helpers.arrayElement(["gpt-4", "claude-3"]),
      status: "completed",
    });
  }

  // Create some templates
  for (let i = 0; i < 5; i++) {
    db.template.create({
      created_by: demoUser.id,
      is_public: true,
      is_featured: i < 2,
    });
  }

  // Create some notifications
  for (let i = 0; i < 3; i++) {
    db.notification.create({
      user_id: demoUser.id,
      read: i > 0,
    });
  }

  // Seed epics (used by Command Center stories)
  db.epic.create({
    id: "E-001",
    title: "Docs & Test Reliability",
    description: "Stabilize E2E, add learning pages, status pipeline.",
    status: "in-progress",
    links: [
      "?path=/docs/overview-overview-insanely-detailed--docs",
      "?path=/docs/specs-system-status-full-spec--docs",
    ],
    created_at: new Date("2025-08-01").toISOString(),
  });
  db.epic.create({
    id: "E-002",
    title: "Observability & CI Signals",
    description: "Expand status, incident flows, artifacts.",
    status: "proposed",
    links: ["?path=/docs/specs-system-status-full-spec--docs"],
    created_at: new Date("2025-08-10").toISOString(),
  });
  db.epic.create({
    id: "E-003",
    title: "Performance & Bundle Hygiene",
    description: "Analyzer, lazy loading, vendor splits.",
    status: "proposed",
    links: ["?path=/docs/docs-performance-bundling--docs"],
    created_at: new Date("2025-08-15").toISOString(),
  });
  db.epic.create({
    id: "E-004",
    title: "Beta Readiness",
    description: "Complete stories, finalize mocks, trim dependencies.",
    status: "proposed",
    links: [
      "?path=/docs/overview-architecture-system-map-dependencies-layered-view-data-model-extended-erd--docs",
    ],
    created_at: new Date("2025-08-20").toISOString(),
  });

  // Create an API key
  db.apiKey.create({
    user_id: demoUser.id,
    name: "Production API",
    status: "active",
  });

  return { demoUser };
}
