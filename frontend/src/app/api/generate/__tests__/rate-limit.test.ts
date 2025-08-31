// Mock next/server to avoid requiring global Request during import
jest.mock("next/server", () => ({
  NextRequest: class {},
  NextResponse: {
    json: (body: any, init?: any) => ({
      status: (init && init.status) || 200,
      json: async () => body,
    }),
  },
}));

jest.mock("@/lib/supabase/server", () => {
  return {
    createClient: async () => ({
      auth: {
        getUser: async () => ({ data: { user: { id: "user_test" } }, error: null }),
      },
    }),
  };
});

jest.mock("@/lib/ai/service", () => {
  return {
    AIService: class {
      async generateContent() {
        return {
          content: "x",
          model: "gpt-4",
          tokensUsed: 1,
          cost: 0,
          processingTime: 1,
          cached: false,
          qualityScore: 80,
        };
      }
    },
  };
});

describe("POST /api/generate - rate limiting", () => {
  const OLD_ENV = process.env;
  beforeAll(() => {
    process.env = {
      ...OLD_ENV,
      BYPASS_AUTH: "",
    };
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("returns 429 when rate limit exceeded", async () => {
    const req = {
      async json() {
        return { input: "TRIGGER_RATE_LIMIT", format: "blog" };
      },
    } as any;

    const { POST } = await import("@/app/api/generate/route");
    const res = await POST(req);
    const json = await res.json();
    expect(json.error).toMatch(/rate limit/i);
  });
});
