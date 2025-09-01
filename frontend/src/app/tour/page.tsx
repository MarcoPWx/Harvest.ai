"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function TourLandingPage() {
  useEffect(() => {
    try {
      // Redirect to home with tour enabled; MSW will also be enabled automatically
      window.location.replace("/?tour=1");
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-lg text-center">
        <h1 className="text-2xl font-bold mb-2">Starting Guided Tour…</h1>
        <p className="text-gray-600 mb-4">
          If you are not redirected automatically, click the button below to get started.
        </p>
        <Link
          href="/?tour=1"
          className="inline-block px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Start Tour
        </Link>
      </div>
    </div>
  );
}
