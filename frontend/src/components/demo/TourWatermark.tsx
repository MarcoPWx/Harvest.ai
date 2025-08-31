"use client";

import React, { useEffect, useState } from "react";
import { useDemoTour } from "./DemoTour";

export function TourWatermark() {
  const { shouldShowTour } = useDemoTour();
  const [forced, setForced] = useState(false);

  useEffect(() => {
    try {
      if (process.env.NEXT_PUBLIC_TOUR_AUTO === "1") {
        setForced(true);
        return;
      }
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        const tour = (url.searchParams.get("tour") || "").toLowerCase();
        if (["1", "true", "start", "auto", "reset", "again", "fresh"].includes(tour)) {
          setForced(true);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const show = forced || shouldShowTour;
  if (!show) return null;

  return (
    <div className="fixed bottom-3 left-3 z-[60] pointer-events-none">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 text-white text-xs shadow-lg">
        <span className="inline-flex w-2 h-2 rounded-full bg-emerald-400" />
        <span>Tour is on</span>
      </div>
    </div>
  );
}

export default TourWatermark;
