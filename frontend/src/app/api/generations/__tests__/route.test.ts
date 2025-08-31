import { GET as listGenerations } from "../route";

// We reuse the list route logic for simplicity

// Basic sanity tests for the generations listing route
jest.mock("@/lib/supabase/server", () => {
  const chain = {
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    range: jest.fn(),
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

describe("GET /api/generations", () => {
  it("returns paginated generations", async () => {
    const supabaseMock = require("@/lib/supabase/server").createClient();
    const rows = [
      {
        id: "gen-1",
        user_id: "user-1",
        output_format: "blog",
        model: "gpt-4",
        created_at: new Date().toISOString(),
      },
      {
        id: "gen-2",
        user_id: "user-1",
        output_format: "summary",
        model: "gpt-3.5-turbo",
        created_at: new Date().toISOString(),
      },
    ];

    // Mock range result with count
    supabaseMock.from().select().order().eq().range.mockResolvedValueOnce({
      data: rows,
      count: 2,
      error: null,
    });

    const req = { url: "http://localhost/api/generations?page=1&limit=2" } as any;
    const res = await listGenerations(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(2);
    expect(body.pagination.total_items).toBe(2);
    expect(body.pagination.total_pages).toBe(1);
  });

  it("returns 401 when unauthenticated and BYPASS_AUTH not set", async () => {
    const supabaseMock = require("@/lib/supabase/server").createClient();
    // Force no user
    supabaseMock.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const req = { url: "http://localhost/api/generations" } as any;
    const res = await listGenerations(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toMatch(/Authentication required/i);
  });
});
