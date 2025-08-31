import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

// This configures a Service Worker with the given request handlers.
export const worker = setupWorker(...handlers);

// Start options for the worker
export const workerOptions = {
  onUnhandledRequest: "bypass" as const,
  serviceWorker: {
    url: "/mockServiceWorker.js",
  },
};
