export const runtime = "nodejs";

export async function GET() {
  const startTime = Date.now();

  const responseTime = Date.now() - startTime;

  return Response.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    response_time: responseTime,
    services: {
      openai: {
        status: process.env.OPENAI_API_KEY ? "configured" : "not_configured",
      },
    },
    cache: {
      total_keys: 0,
      memory_usage: 0,
      hit_rate: 0,
    },
    rate_limits: {
      active_limits: 0,
      total_requests: 0,
    },
    environment: process.env.NODE_ENV || "development",
  });
}
