import "@testing-library/jest-dom";

// Polyfill fetch/Request/Response for route handler unit tests
try {
  // Node 18+: undici is available for fetch primitives
  const undici = require("undici");
  if (undici) {
    // @ts-ignore
    global.fetch = undici.fetch;
    // @ts-ignore
    global.Headers = undici.Headers;
    // @ts-ignore
    global.Request = undici.Request;
    // @ts-ignore
    global.Response = undici.Response;
  }
} catch (_) {
  // ignore if not available
}

// Ensure a usable Response in the test environment (with json/text and constructor)
(() => {
  let needsPolyfill = false;
  try {
    // @ts-ignore
    const R = global.Response;
    // @ts-ignore
    const inst = R ? new R("test") : null;
    // @ts-ignore
    if (!inst || typeof inst.text !== "function" || typeof inst.json !== "function") {
      needsPolyfill = true;
    }
  } catch {
    needsPolyfill = true;
  }

  if (needsPolyfill) {
    class SimpleResponse {
      _body;
      status;
      headers;
      constructor(body, init) {
        this._body = body;
        this.status = (init && init.status) || 200;
        this.headers = (init && init.headers) || { "content-type": "application/json" };
      }
      async text() {
        const b = this._body;
        // Handle ReadableStream bodies (for SSE tests)
        if (b && typeof b.getReader === "function") {
          const reader = b.getReader();
          const decoder = new TextDecoder();
          let out = "";
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            out += decoder.decode(value, { stream: true });
          }
          return out;
        }
        if (typeof b === "string") return b;
        try {
          return JSON.stringify(b ?? "");
        } catch {
          return String(b);
        }
      }
      async json() {
        const t = await this.text();
        try {
          return JSON.parse(t);
        } catch {
          return t;
        }
      }
      static json(body, init) {
        const r = new SimpleResponse(JSON.stringify(body), init);
        return r;
      }
    }
    // @ts-ignore
    global.Response = SimpleResponse;
  }
})();

// Polyfill TextEncoder/TextDecoder for Node tests
try {
  const { TextEncoder, TextDecoder } = require("util");
  // @ts-ignore
  if (typeof global.TextEncoder === "undefined") global.TextEncoder = TextEncoder;
  // @ts-ignore
  if (typeof global.TextDecoder === "undefined") global.TextDecoder = TextDecoder;
} catch {}

// Polyfill ReadableStream for Node/Jest if missing
try {
  // @ts-ignore
  if (typeof global.ReadableStream === "undefined") {
    const { ReadableStream } = require("stream/web");
    // @ts-ignore
    global.ReadableStream = ReadableStream;
  }
} catch {}

// Mock Next.js router
jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "/",
      query: {},
      asPath: "/",
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "/";
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
// @ts-ignore
global.localStorage = localStorageMock;

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
// @ts-ignore
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
// @ts-ignore
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};
