import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

function AIGatewaySpec() {
  return (
    <div style={{ maxWidth: 900 }}>
      <h2>AI Gateway — Endpoints (Mock-first)</h2>
      <p style={{ color: "#555" }}>
        Quick reference for core endpoints; use the API Playground or Swagger UI for interactive
        requests.
      </p>
      <ul>
        <li>
          POST <code>/api/generate</code> — JSON or SSE (Accept: text/event-stream)
        </li>
        <li>
          POST <code>/api/generate/stream</code> — SSE streaming
        </li>
        <li>
          GET <code>/api/generations</code> — List (dev)
        </li>
        <li>
          GET <code>/api/generate/:id</code> — Single (dev)
        </li>
        <li>
          POST <code>/api/threads</code> — Create thread
        </li>
        <li>
          GET <code>/api/threads</code> — List threads
        </li>
        <li>
          GET <code>/api/threads/:id</code> — Get thread
        </li>
        <li>
          POST <code>/api/threads/:id/messages</code> — Append message; JSON/SSE reply
        </li>
      </ul>

      <h3>Headers</h3>
      <ul>
        <li>Content-Type: application/json</li>
        <li>Accept: text/event-stream (SSE)</li>
        <li>X-Request-ID: optional correlation</li>
      </ul>

      <h3>Try it</h3>
      <p>
        Open <a href="?path=/docs/docs-api-playground--docs">Docs/API Playground</a> or the embedded
        Swagger UI.
      </p>

      <h3>Notes</h3>
      <ul>
        <li>Mock triggers: include TRIGGER_RATE_LIMIT, TRIGGER_ERROR, TRIGGER_CACHED in input</li>
        <li>Caching: in-memory in dev; use x-cache-bypass: 1 to skip cache</li>
      </ul>
    </div>
  );
}

const meta: Meta<typeof AIGatewaySpec> = {
  title: "Specs/AI Gateway",
  component: AIGatewaySpec,
};
export default meta;

type Story = StoryObj<typeof meta>;
export const Reference: Story = {};
