"use client";

import Link from "next/link";

export default function DocsIndex() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-6" data-testid="docs-index-title">
        Documentation
      </h1>
      <p className="mb-8 text-gray-600">Overview of key docs for developers and operators.</p>
      <ul className="space-y-4 list-disc pl-6">
        <li>
          <Link href="/docs/api" className="text-blue-600 hover:underline">
            API Documentation (Swagger UI)
          </Link>
        </li>
        <li>
          <Link href="/docs/overview" className="text-blue-600 hover:underline">
            MDX Docs Overview (in-app)
          </Link>
        </li>
        <li>
          <Link href="/docs/testing" className="text-blue-600 hover:underline">
            Testing & CI (MDX)
          </Link>
        </li>
        <li>
          <Link href="/docs/architecture" className="text-blue-600 hover:underline">
            Architecture Overview
          </Link>
        </li>
        <li>
          <Link href="/docs/api-usage" className="text-blue-600 hover:underline">
            API Usage (MDX)
          </Link>
        </li>
        <li>
          <Link href="/docs/production" className="text-blue-600 hover:underline">
            Production Checklist (MDX)
          </Link>
        </li>
        <li>
          <Link href="/docs/ops" className="text-blue-600 hover:underline">
            Operations Summary (MDX)
          </Link>
        </li>
        <li>
          <Link href="/dev/tools" className="text-blue-600 hover:underline">
            Developer Tools (dev-only)
          </Link>
        </li>
        <li>
          <Link href="/dev/network" className="text-blue-600 hover:underline">
            Network Playground (dev-only)
          </Link>
        </li>
        <li>
          <Link href="/status" className="text-blue-600 hover:underline">
            Status Page
          </Link>
        </li>
        <li>
          <Link href="/docs/TECH_STACK_CHEATSHEET.md" className="text-blue-600 hover:underline">
            Tech Stack Cheat Sheet (Markdown)
          </Link>
        </li>
      </ul>
    </div>
  );
}
