import { NextRequest } from "next/server";
import { getMetrics } from "@/lib/server/metrics";

export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
  const data = getMetrics();
  return new Response(JSON.stringify({ ok: true, data }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
}
