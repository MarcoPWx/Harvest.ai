"use client";

import Link from "next/link";

export default function PlaygroundsHubPage() {
  const cards = [
    {
      title: "Generate Playground",
      href: "/playground/generate",
      desc: "Stream tokens and test JSON fallback for /api/generate with error and cache triggers",
    },
    {
      title: "Threads Playground",
      href: "/playground/threads",
      desc: "Create a thread, send a message, and stream assistant replies with transcript",
    },
    {
      title: "Format Playground",
      href: "/format",
      desc: "Try the /api/format transformer with supported formats",
    },
    {
      title: "SSE Demo",
      href: "/playground/sse",
      desc: "Simple SSE stream viewer bound to /api/sse-demo",
    },
    {
      title: "Storybook: S2S Streaming",
      href: "http://localhost:6006/?path=/story/command-center-s2s-streaming-threads--generate-sse-json",
      desc: "Interactive Storybook page for generate SSE & threads streaming (run Storybook)",
      external: true,
    },
    {
      title: "Storybook: API Playground (MSW)",
      href: "http://localhost:6006/?path=/story/docs-api-playground--generate",
      desc: "Mock-first API explorer using MSW (no backend needed)",
      external: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2">Harvest.ai Playgrounds</h1>
        <p className="text-gray-600 mb-6">
          Hands-on sandboxes for core features: streaming generation, multi-turn threads,
          formatting, and SSE.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              target={c.external ? "_blank" : undefined}
              className="block border rounded-lg p-4 bg-white hover:shadow transition"
            >
              <div className="text-lg font-semibold">{c.title}</div>
              <div className="text-sm text-gray-600 mt-1">{c.desc}</div>
              <div className="text-blue-600 text-sm mt-2">
                {c.external ? "Open in Storybook" : "Open playground →"}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
