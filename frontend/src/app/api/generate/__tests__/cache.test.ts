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
        getUser: async () => ({ data: { user: null }, error: null }),
      },
    }),
  };
});

jest.mock("@/lib/ai/service", () => {
  return {
    AIService: class {
      async generateContent() {
        return {
          content: "cached-content",
          model: "gpt-4",
          tokensUsed: 5,
          cost: 0.001,
          processingTime: 0,
          cached: true,
          qualityScore: 95,
        };
      }
    },
  };
});

describe("POST /api/generate - cache metadata", () => {
  const OLD_ENV = process.env;
  beforeAll(() => {
    process.env = { ...OLD_ENV, BYPASS_AUTH: "1" };
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("propagates cached=true metadata on repeated requests with same input", async () => {
    const { POST } = await import("@/app/api/generate/route");

    const req1 = {
      async json() {
        return { input: "cache me please", format: "blog" };
      },
    } as any;
    const res1 = await POST(req1);
    const body1 = await res1.json();
    expect(body1.metadata.cached).toBe(false);

    const req2 = {
      async json() {
        return { input: "cache me please", format: "blog" };
      },
    } as any;
    const res2 = await POST(req2);
    const body2 = await res2.json();
    expect(body2.metadata.cached).toBe(true);
    expect(body2.processing_time).toBe(0);
  });
});
