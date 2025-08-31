import { http, HttpResponse, delay } from "msw";
import { db } from "../db/schema";
import { faker } from "@faker-js/faker";
import { maybeInjectNetworkControls } from "./util";

export const userHandlers = [
  // Get user profile
  http.get("/api/users/:userId", async ({ params, request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(500);

    const { userId } = params;
    const user = db.user.findFirst({
      where: { id: { equals: userId as string } },
    });

    if (!user) {
      return HttpResponse.json({ error: "User not found" }, { status: 404 });
    }

    return HttpResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      subscription_tier: user.subscription_tier,
      subscription_status: user.subscription_status,
      preferences: user.preferences,
      usage: user.usage,
      created_at: user.created_at,
    });
  }),

  // Update user profile
  http.patch("/api/users/:userId", async ({ params, request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(800);

    const { userId } = params;
    const updates = (await request.json()) as any;

    const user = db.user.findFirst({
      where: { id: { equals: userId as string } },
    });

    if (!user) {
      return HttpResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = db.user.update({
      where: { id: { equals: userId as string } },
      data: updates,
    });

    return HttpResponse.json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      avatar: updatedUser.avatar,
      preferences: updatedUser.preferences,
    });
  }),

  // Update user preferences
  http.put("/api/users/:userId/preferences", async ({ params, request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(600);

    const { userId } = params;
    const preferences = (await request.json()) as any;

    const updatedUser = db.user.update({
      where: { id: { equals: userId as string } },
      data: { preferences },
    });

    return HttpResponse.json({
      preferences: updatedUser.preferences,
    });
  }),

  // Get usage statistics
  http.get("/api/users/:userId/usage", async ({ params, request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(400);

    const { userId } = params;
    const user = db.user.findFirst({
      where: { id: { equals: userId as string } },
    });

    if (!user) {
      return HttpResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get generation count
    const generations = db.generation.findMany({
      where: { user_id: { equals: userId as string } },
    });

    return HttpResponse.json({
      usage: user.usage,
      generation_count: generations.length,
      last_generation: generations[generations.length - 1]?.created_at || null,
      subscription_tier: user.subscription_tier,
      limits: {
        monthly_generations: user.subscription_tier === "pro" ? 1000 : 100,
        max_length: user.subscription_tier === "pro" ? 10000 : 2000,
        ai_models:
          user.subscription_tier === "pro"
            ? ["gpt-4", "gpt-3.5-turbo", "claude-3-opus", "claude-3-sonnet"]
            : ["gpt-3.5-turbo", "claude-3-sonnet"],
      },
    });
  }),

  // Get billing info
  http.get("/api/users/:userId/billing", async ({ params, request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(600);

    const { userId } = params;
    const user = db.user.findFirst({
      where: { id: { equals: userId as string } },
    });

    if (!user) {
      return HttpResponse.json({ error: "User not found" }, { status: 404 });
    }

    return HttpResponse.json({
      subscription: {
        tier: user.subscription_tier,
        status: user.subscription_status,
        current_period_end: faker.date.future(),
        cancel_at_period_end: false,
      },
      payment_method:
        user.subscription_tier === "pro"
          ? {
              type: "card",
              last4: "4242",
              brand: "visa",
              exp_month: 12,
              exp_year: 2025,
            }
          : null,
      invoices:
        user.subscription_tier === "pro"
          ? [
              {
                id: faker.string.uuid(),
                amount: 2900,
                currency: "usd",
                status: "paid",
                date: faker.date.recent({ days: 30 }),
              },
              {
                id: faker.string.uuid(),
                amount: 2900,
                currency: "usd",
                status: "paid",
                date: faker.date.recent({ days: 60 }),
              },
            ]
          : [],
    });
  }),

  // Update subscription
  http.post("/api/users/:userId/subscription", async ({ params, request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(1500);

    const { userId } = params;
    const body = (await request.json()) as any;
    const { tier, payment_method } = body;

    const updatedUser = db.user.update({
      where: { id: { equals: userId as string } },
      data: {
        subscription_tier: tier,
        subscription_status: "active",
      },
    });

    return HttpResponse.json({
      subscription: {
        tier: updatedUser.subscription_tier,
        status: updatedUser.subscription_status,
        current_period_end: faker.date.future(),
      },
      success: true,
      message: `Successfully ${tier === "pro" ? "upgraded to" : "downgraded to"} ${tier} plan`,
    });
  }),

  // Cancel subscription
  http.delete("/api/users/:userId/subscription", async ({ params, request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(1000);

    const { userId } = params;

    const updatedUser = db.user.update({
      where: { id: { equals: userId as string } },
      data: {
        subscription_tier: "free",
        subscription_status: "cancelled",
      },
    });

    return HttpResponse.json({
      success: true,
      message: "Subscription cancelled successfully",
      subscription: {
        tier: updatedUser.subscription_tier,
        status: updatedUser.subscription_status,
      },
    });
  }),

  // Get API keys
  http.get("/api/users/:userId/api-keys", async ({ params, request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(500);

    const { userId } = params;
    const apiKeys = db.apiKey.findMany({
      where: { user_id: { equals: userId as string } },
    });

    return HttpResponse.json({
      api_keys: apiKeys.map((key) => ({
        id: key.id,
        name: key.name,
        key: key.key.substring(0, 8) + "..." + key.key.substring(key.key.length - 4),
        created_at: key.created_at,
        last_used: key.last_used,
        active: key.active,
      })),
    });
  }),

  // Create API key
  http.post("/api/users/:userId/api-keys", async ({ params, request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(800);

    const { userId } = params;
    const body = (await request.json()) as any;
    const { name } = body;

    const newKey = db.apiKey.create({
      user_id: userId as string,
      name: name || "API Key",
      key: `hv_${faker.string.alphanumeric(32)}`,
      active: true,
    });

    return HttpResponse.json({
      api_key: {
        id: newKey.id,
        name: newKey.name,
        key: newKey.key, // Full key only shown once
        created_at: newKey.created_at,
      },
    });
  }),

  // Delete API key
  http.delete("/api/users/:userId/api-keys/:keyId", async ({ params, request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(600);

    const { keyId } = params;

    db.apiKey.delete({
      where: { id: { equals: keyId as string } },
    });

    return HttpResponse.json({
      success: true,
      message: "API key deleted successfully",
    });
  }),
];
