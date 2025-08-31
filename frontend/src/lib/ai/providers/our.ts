import type { GenerateResult } from "./index";

export type OurProviderConfig = {
  baseUrl: string;
  apiKey: string;
  timeoutMs?: number;
  fetchFn?: typeof fetch;
};

export class OurProvider {
  private baseUrl: string;
  private apiKey: string;
  private timeoutMs: number;
  private fetchFn: typeof fetch;

  constructor(cfg: OurProviderConfig) {
    this.baseUrl = cfg.baseUrl.replace(/\/$/, "");
    this.apiKey = cfg.apiKey;
    this.timeoutMs = typeof cfg.timeoutMs === "number" ? cfg.timeoutMs : 30_000;
    this.fetchFn = cfg.fetchFn || fetch;
  }

  async generate(input: string, format: string, signal?: AbortSignal): Promise<GenerateResult> {
    const url = `${this.baseUrl}/v1/generate`;

    const ctrl = new AbortController();
    const onAbort = () => ctrl.abort();
    if (signal) signal.addEventListener("abort", onAbort);

    const timer = setTimeout(() => ctrl.abort(), this.timeoutMs);

    try {
      const res = await this.fetchFn(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.apiKey,
        },
        body: JSON.stringify({ input, format }),
        signal: ctrl.signal,
      });

      if (!res.ok) {
        // Try to read structured error if available
        let code = `HTTP_${res.status}`;
        try {
          const j = await res.json();
          code = j?.code || code;
        } catch {}
        throw new Error(code);
      }

      const json = await res.json().catch(() => null);
      const output = json?.output ?? "";
      const model = json?.model ?? "our-default";
      return { output, model };
    } finally {
      clearTimeout(timer);
      if (signal) signal.removeEventListener("abort", onAbort);
    }
  }
}

export async function runOurProviderWithEnv(
  input: string,
  format: string,
  opts?: { signal?: AbortSignal },
): Promise<GenerateResult> {
  const baseUrl = process.env.OUR_PROVIDER_API_URL;
  const apiKey = process.env.OUR_PROVIDER_API_KEY;
  if (!baseUrl || !apiKey) {
    // The caller should decide how to fallback. We return a minimal mock.
    return { output: `# ${input}\n\n(our-mock output for ${format})`, model: "our-mock" };
  }
  const provider = new OurProvider({ baseUrl, apiKey });
  return provider.generate(input, format, opts?.signal);
}
