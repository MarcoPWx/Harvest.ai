import { generateWithProvider } from "..";
import { OurProvider } from "../our";

describe("Our provider adapter", () => {
  const env = { ...process.env };
  beforeEach(() => {
    jest.resetModules();
  });
  afterEach(() => {
    process.env = { ...env };
  });

  it("falls back to simulate when env missing", async () => {
    process.env.PROVIDERS_ON = "1";
    delete process.env.OUR_PROVIDER_API_URL;
    delete process.env.OUR_PROVIDER_API_KEY;
    const res = await generateWithProvider("our", { input: "Hello", format: "summary" });
    expect(res.output).toBeTruthy();
    expect(typeof res.model).toBe("string");
    expect(res.model).toMatch(/our-mock|our-default|our-http|our-fallback|mock/i);
  });

  it("calls our provider endpoint when env present", async () => {
    process.env.PROVIDERS_ON = "1";
    process.env.OUR_PROVIDER_API_URL = "https://api.example.com";
    process.env.OUR_PROVIDER_API_KEY = "secret";

    // Provide a fetch shim for node test env
    (globalThis as any).fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ output: "From Our Provider", model: "our-prod-model" }),
    });

    const res = await generateWithProvider("our", { input: "Hello", format: "blog" });
    expect((globalThis as any).fetch).toHaveBeenCalledTimes(1);
    expect(res.output).toBe("From Our Provider");
    expect(res.model).toBe("our-prod-model");

    delete (globalThis as any).fetch;
  });

  it("respects timeout and aborts", async () => {
    const fakeFetch = (async (_url: string, init?: any) => {
      return await new Promise((_, reject) => {
        const sig: AbortSignal | undefined = init?.signal;
        if (sig) {
          const onAbort = () => reject(new Error("AbortError"));
          if (sig.aborted) return onAbort();
          sig.addEventListener("abort", onAbort, { once: true });
        }
        // never resolve; rely on abort to reject
      });
    }) as any;
    const provider = new OurProvider({
      baseUrl: "https://api.example.com",
      apiKey: "k",
      timeoutMs: 20,
      fetchFn: fakeFetch,
    });
    await expect(provider.generate("Hello", "blog")).rejects.toBeTruthy();
  }, 2000);
});
