import { HttpResponse, delay } from "msw";

function parseFloatSafe(v: string | null, def = 0): number {
  if (!v) return def;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : def;
}

function parseIntSafe(v: string | null, def = 0): number {
  if (!v) return def;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : def;
}

// Applies development-only network controls via request headers and cookies.
// Sources and precedence:
// 1) Headers: x-mock-delay, x-mock-error-rate
// 2) Cookies: harvest_mock_delay, harvest_mock_error_rate
// Returns an HttpResponse if an injected error should be returned; otherwise null.
export async function maybeInjectNetworkControls(request: Request) {
  try {
    // Parse cookies from header (service worker context)
    const cookieHeader = request.headers.get("cookie") || "";
    const cookieMap = Object.fromEntries(
      cookieHeader
        .split(";")
        .map((v) => v.trim())
        .filter(Boolean)
        .map((kv) => {
          const idx = kv.indexOf("=");
          if (idx === -1) return [kv, ""];
          return [decodeURIComponent(kv.slice(0, idx)), decodeURIComponent(kv.slice(idx + 1))];
        }),
    ) as Record<string, string>;

    // Read from headers (highest precedence)
    const hdrDelay = parseIntSafe(request.headers.get("x-mock-delay"), NaN);
    const hdrError = parseFloatSafe(request.headers.get("x-mock-error-rate"), NaN);

    // Read from cookies (fallbacks)
    const ckDelay = parseIntSafe(cookieMap["harvest_mock_delay"] || null, 0);
    const ckError = parseFloatSafe(cookieMap["harvest_mock_error_rate"] || null, 0);

    const delayMs = Number.isFinite(hdrDelay) ? hdrDelay : ckDelay;
    const errorRate = Number.isFinite(hdrError) ? hdrError : ckError;

    if (delayMs > 0) await delay(delayMs);
    if (errorRate > 0 && Math.random() < Math.max(0, Math.min(1, errorRate))) {
      return HttpResponse.json(
        {
          error: "Injected mock error",
          message: "This error was injected by dev mock controls",
          code: "MOCK_INJECTED_ERROR",
        },
        { status: 500 },
      );
    }
  } catch {
    // ignore parsing errors
  }
  return null;
}
