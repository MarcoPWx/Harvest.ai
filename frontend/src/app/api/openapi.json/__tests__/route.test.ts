import { GET as openapiGET } from "../route";

describe("GET /api/openapi.json", () => {
  it("returns an OpenAPI spec", async () => {
    const res = await openapiGET({} as any);
    const body = await res.json();
    expect(body.openapi).toBe("3.0.3");
    expect(body.info?.title).toMatch(/Harvest\.ai/i);
    expect(body.paths).toBeTruthy();
  });
});
