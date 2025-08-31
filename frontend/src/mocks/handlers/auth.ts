import { http, HttpResponse, delay } from "msw";
import { db } from "../db/schema";
import { faker } from "@faker-js/faker";
import { maybeInjectNetworkControls } from "./util";

// Store sessions in memory (would be in database in real app)
const sessions = new Map<string, any>();

export const authHandlers = [
  // Sign up
  http.post("/api/auth/signup", async ({ request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(1000);

    const body = (await request.json()) as any;
    const { email, password, name } = body;

    // Check if user exists
    const existingUser = db.user.findFirst({
      where: { email: { equals: email } },
    });

    if (existingUser) {
      return HttpResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Create new user
    const newUser = db.user.create({
      email,
      name: name || email.split("@")[0],
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      subscription_tier: "free",
      subscription_status: "active",
    });

    // Create session
    const sessionToken = `session_${faker.string.uuid()}`;
    sessions.set(sessionToken, {
      userId: newUser.id,
      email: newUser.email,
      createdAt: new Date(),
    });

    return HttpResponse.json(
      {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          avatar: newUser.avatar,
        },
        session: sessionToken,
      },
      {
        headers: {
          "Set-Cookie": `harvest-session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
        },
      },
    );
  }),

  // Login
  http.post("/api/auth/login", async ({ request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(1000);

    const body = (await request.json()) as any;
    const { email, password } = body;

    // Find or create user (for demo, any login works)
    let user = db.user.findFirst({
      where: { email: { equals: email } },
    });

    if (!user) {
      user = db.user.create({
        email,
        name: email.split("@")[0],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        subscription_tier: "pro",
        subscription_status: "active",
      });
    }

    // Create session
    const sessionToken = `session_${faker.string.uuid()}`;
    sessions.set(sessionToken, {
      userId: user.id,
      email: user.email,
      createdAt: new Date(),
    });

    return HttpResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          subscription_tier: user.subscription_tier,
        },
        session: sessionToken,
      },
      {
        headers: {
          "Set-Cookie": `harvest-session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
        },
      },
    );
  }),

  // Logout
  http.post("/api/auth/logout", async ({ request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(500);

    // Get session from cookie
    const cookie = request.headers.get("cookie");
    const sessionToken = cookie?.split("harvest-session=")[1]?.split(";")[0];

    if (sessionToken) {
      sessions.delete(sessionToken);
    }

    return HttpResponse.json(
      { success: true },
      {
        headers: {
          "Set-Cookie": `harvest-session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
        },
      },
    );
  }),

  // Get current session
  http.get("/api/auth/session", async ({ request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    const cookie = request.headers.get("cookie");
    const sessionToken = cookie?.split("harvest-session=")[1]?.split(";")[0];

    if (!sessionToken || !sessions.has(sessionToken)) {
      return HttpResponse.json({ user: null });
    }

    const session = sessions.get(sessionToken);
    const user = db.user.findFirst({
      where: { id: { equals: session.userId } },
    });

    if (!user) {
      return HttpResponse.json({ user: null });
    }

    return HttpResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        subscription_tier: user.subscription_tier,
        preferences: user.preferences,
        usage: user.usage,
      },
    });
  }),

  // Forgot password
  http.post("/api/auth/forgot-password", async ({ request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(1500);

    const body = (await request.json()) as any;
    const { email } = body;

    // Just return success for demo
    return HttpResponse.json({
      success: true,
      message: "Password reset email sent (mock)",
    });
  }),

  // Reset password
  http.post("/api/auth/reset-password", async ({ request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(1000);

    const body = (await request.json()) as any;
    const { token, password } = body;

    // Just return success for demo
    return HttpResponse.json({
      success: true,
      message: "Password reset successful (mock)",
    });
  }),

  // OAuth providers (mock)
  http.get("/api/auth/oauth/google", async ({ request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(500);

    // Redirect to mock OAuth flow
    return HttpResponse.redirect("/auth/callback?provider=google&code=mock_code");
  }),

  http.get("/api/auth/oauth/github", async ({ request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;
    await delay(500);

    // Redirect to mock OAuth flow
    return HttpResponse.redirect("/auth/callback?provider=github&code=mock_code");
  }),
];
