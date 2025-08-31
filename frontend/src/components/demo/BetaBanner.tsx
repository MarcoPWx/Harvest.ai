"use client";

import React, { useEffect, useState } from "react";

export function BetaBanner() {
  const [visible, setVisible] = useState(false);
  const [sbHref, setSbHref] = useState<string>("/storybook/?tour=1");

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      // Respect prior dismissal
      const dismissed = localStorage.getItem("harvest_beta_banner_dismissed") === "true";
      if (dismissed) return;

      const url = new URL(window.location.href);
      const tourParam = (url.searchParams.get("tour") || "").toLowerCase();
      const mswParam = (url.searchParams.get("msw") || url.searchParams.get("mock") || "").toLowerCase();

      const tourAuto = process.env.NEXT_PUBLIC_TOUR_AUTO === "1";
      const mswEnv = process.env.NEXT_PUBLIC_ENABLE_MSW === "1";

      const tourOn = ["1", "true", "start", "auto", "reset", "again", "fresh"].includes(tourParam);
      const mswOn = ["1", "true", "on", "yes"].includes(mswParam);

      if (tourOn || tourAuto || mswOn || mswEnv) {
        setVisible(true);
      }

      // Local dev Storybook link
      const host = window.location.hostname;
      if (host === "localhost" || host === "127.0.0.1") {
        setSbHref("http://localhost:6006/?tour=1");
      }
    } catch {
      // ignore
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-50">
      <div className="bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100 border-b border-amber-200 dark:border-amber-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-400 text-white text-xs">β</span>
            <span className="font-medium">Protected/BETA demo</span>
            <span className="opacity-80">Mocks are enabled and the guided tour is available.</span>
            <a
              href={sbHref}
              className="ml-2 underline text-amber-800 dark:text-amber-200 hover:opacity-90"
              target="_blank"
              rel="noreferrer"
            >
              Open Storybook Presenter
            </a>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/?tour=1"
              className="px-2 py-1 rounded bg-amber-500 text-white hover:bg-amber-600 transition-colors"
              title="Start guided tour"
            >
              Start Tour
            </a>
            <button
              onClick={() => {
                try { localStorage.setItem("harvest_beta_banner_dismissed", "true"); } catch {}
                setVisible(false);
              }}
              className="px-2 py-1 rounded border border-amber-300 dark:border-amber-700 hover:bg-amber-200/60 dark:hover:bg-amber-800/40"
              title="Dismiss"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
      {/* Spacer to avoid content jump under fixed banner */}
      <div className="h-10" />
    </div>
  );
}

export default BetaBanner;
