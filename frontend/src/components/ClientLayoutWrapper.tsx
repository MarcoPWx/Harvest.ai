"use client";

import { useEffect } from "react";
import { DemoTourButton } from "./demo/DemoTourButton";
import { BetaBanner } from "./demo/BetaBanner";
import { TourWatermark } from "./demo/TourWatermark";

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export default function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  useEffect(() => {
    // Determine if MSW should be enabled:
    // - env var NEXT_PUBLIC_ENABLE_MSW=1
    // - NODE_ENV=development
    // - URL query param msw=1 or mock=1
    let enableMsw =
      process.env.NEXT_PUBLIC_ENABLE_MSW === "1" || process.env.NODE_ENV === "development";

    // If tour is set to auto-start for this deploy, ensure MSW is enabled too
    if (process.env.NEXT_PUBLIC_TOUR_AUTO === "1") {
      enableMsw = true;
    }

    try {
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        const mswParam = url.searchParams.get("msw") || url.searchParams.get("mock");
        const tourParam = (url.searchParams.get("tour") || "").toLowerCase();
        if (mswParam && ["1", "true", "on", "yes"].includes(mswParam.toLowerCase())) {
          enableMsw = true;
        }
        // If user is explicitly starting the tour, also ensure MSW is on for a smooth demo
        if (["1", "true", "start", "auto", "reset", "again", "fresh"].includes(tourParam)) {
          enableMsw = true;
        }
      }
    } catch {
      // ignore URL parsing issues
    }

    if (!enableMsw) return;

    let cancelled = false;
    (async () => {
      try {
        const { worker, workerOptions } = await import("../mocks/browser");
        if (!cancelled) {
          await worker.start(workerOptions);
        }
      } catch {
        // Intentionally silent in strict mode
      }

      // Start WebSocket mocks (mock-socket) in dev/mock mode
      try {
        const { startWebSocketMocks } = await import("../mocks/ws");
        if (!cancelled) {
          await startWebSocketMocks();
        }
      } catch {
        // Intentionally silent in strict mode
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <BetaBanner />
      {children}
      {/* Floating Demo Tour Launcher (bottom-right) */}
      <DemoTourButton />
      {/* Bottom-left watermark indicating demo mode */}
      <TourWatermark />
    </>
  );
}
