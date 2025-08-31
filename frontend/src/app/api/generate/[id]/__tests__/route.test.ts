import { GET as getGeneration, DELETE as deleteGeneration } from "../route";

jest.mock("@/lib/supabase/server", () => {
  const chain = {
    select: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  };

  const supabaseClientMock = {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: "user-1" } }, error: null }),
    },
    from: jest.fn(() => chain),
  } as any;

  return {
    __esModule: true,
    createClient: jest.fn(() => supabaseClientMock),
  };
});

describe("GET /api/generate/:id", () => {
  it("returns generation when found", async () => {
    const supabaseMock = require("@/lib/supabase/server").createClient();
    supabaseMock.from().select().eq().eq?.mockReturnThis?.();
    supabaseMock
      .from()
      .select()
      .eq()
      .single.mockResolvedValueOnce({
        data: {
          id: "gen-1",
          user_id: "user-1",
          output_format: "blog",
        },
        error: null,
      });

    const res = await getGeneration({} as any, { params: { id: "gen-1" } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.generation.id).toBe("gen-1");
  });

  it("returns 404 when not found", async () => {
    const supabaseMock = require("@/lib/supabase/server").createClient();
    supabaseMock
      .from()
      .select()
      .eq()
      .single.mockResolvedValueOnce({ data: null, error: { message: "Not found" } });

    const res = await getGeneration({} as any, { params: { id: "unknown" } });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/generate/:id", () => {
  it("deletes generation for owner and returns success", async () => {
    const supabaseMock = require("@/lib/supabase/server").createClient();
    // Final select() after delete resolves without error
    supabaseMock.from().delete().eq().eq().select.mockResolvedValueOnce({ data: [], error: null });

    const res = await deleteGeneration({} as any, { params: { id: "gen-1" } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it("returns 401 when unauthenticated and BYPASS_AUTH not set", async () => {
    const supabaseMock = require("@/lib/supabase/server").createClient();
    supabaseMock.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const res = await deleteGeneration({} as any, { params: { id: "gen-1" } });
    expect(res.status).toBe(401);
  });
});
