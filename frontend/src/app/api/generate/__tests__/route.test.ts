import { POST as generatePOST } from "../route";

describe("POST /api/generate", () => {
  const originalEnv = { ...process.env };
  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns 400 when input is missing", async () => {
    process.env.BYPASS_AUTH = "1";
    const res = await generatePOST({
      json: async () => ({ format: "blog", options: {} }),
    } as any);
    const body = await res.json();
    expect(body.error).toMatch(/input content required/i);
  });
});
