import { http, HttpResponse, delay, passthrough } from "msw";
import { db } from "../db/schema";
import { faker } from "@faker-js/faker";
import { maybeInjectNetworkControls } from "./util";

// High-quality mock content for different formats
const mockContent = {
  blog: (input: string) => `# ${faker.lorem.sentence()}

## Introduction

${faker.lorem.paragraph()}

Based on your input about "${input.substring(0, 100)}...", let's explore this topic in depth.

## Key Points

${faker.lorem.paragraph()}

### ${faker.lorem.words(3)}

${faker.lorem.paragraphs(2)}

### ${faker.lorem.words(3)}

${faker.lorem.paragraphs(2)}

## Practical Applications

${faker.lorem.paragraph()}

- **${faker.lorem.words(2)}**: ${faker.lorem.sentence()}
- **${faker.lorem.words(2)}**: ${faker.lorem.sentence()}
- **${faker.lorem.words(2)}**: ${faker.lorem.sentence()}

## Conclusion

${faker.lorem.paragraph()}

---

*Keywords: ${faker.lorem.words(5).split(" ").join(", ")}*
*Meta Description: ${faker.lorem.sentence()}*`,

  email: (input: string) => `Subject: ${faker.lorem.words(5)}

Dear ${faker.person.firstName()},

${faker.lorem.paragraph()}

Regarding your inquiry about "${input.substring(0, 50)}...":

${faker.lorem.paragraphs(2)}

Key action items:
• ${faker.lorem.sentence()}
• ${faker.lorem.sentence()}
• ${faker.lorem.sentence()}

${faker.lorem.paragraph()}

Best regards,
${faker.person.fullName()}
${faker.person.jobTitle()}

P.S. ${faker.lorem.sentence()}`,

  summary: (input: string) => `## Executive Summary

**Topic**: ${input.substring(0, 50)}...

### Key Points

• ${faker.lorem.sentence()}
• ${faker.lorem.sentence()}
• ${faker.lorem.sentence()}
• ${faker.lorem.sentence()}

### Main Insights

${faker.lorem.paragraph()}

### Recommendations

1. ${faker.lorem.sentence()}
2. ${faker.lorem.sentence()}
3. ${faker.lorem.sentence()}

### Next Steps

- [ ] ${faker.lorem.words(5)}
- [ ] ${faker.lorem.words(5)}
- [ ] ${faker.lorem.words(5)}`,

  presentation: (input: string) => `# ${faker.lorem.words(3)}

---

## Slide 1: Introduction

- ${faker.lorem.sentence()}
- ${faker.lorem.sentence()}
- ${faker.lorem.sentence()}

*Speaker Notes: ${faker.lorem.paragraph()}*

---

## Slide 2: ${faker.lorem.words(2)}

- ${faker.lorem.sentence()}
- ${faker.lorem.sentence()}
- ${faker.lorem.sentence()}

*Speaker Notes: ${faker.lorem.paragraph()}*

---

## Slide 3: ${faker.lorem.words(2)}

- ${faker.lorem.sentence()}
- ${faker.lorem.sentence()}
- ${faker.lorem.sentence()}

*Speaker Notes: ${faker.lorem.paragraph()}*

---

## Slide 4: Conclusion

- ${faker.lorem.sentence()}
- ${faker.lorem.sentence()}
- Questions?

*Speaker Notes: ${faker.lorem.paragraph()}*`,
};

export const generationHandlers = [
  // Generate content
  http.post("/api/generate", async ({ request }) => {
    // Allow bypass to real API when header present or query param real=1
    const hdrVal = (request.headers as any)?.get?.("x-real-api");
    let realHeader = false;
    try {
      realHeader = hdrVal === "1";
    } catch {}
    let realParam = false;
    try {
      const u = new URL(request.url);
      realParam = u.searchParams.get("real") === "1";
    } catch {}
    if (realHeader || realParam) return passthrough();

    // Apply header-driven network controls (extra delay/error injection)
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;

    // Simulate processing delay
    await delay(faker.number.int({ min: 300, max: 1200 }));

    const body = (await request.json()) as any;
    const { input, format = "blog", options = {} } = body;

    // Special triggers for E2E scenarios
    if (typeof input === "string") {
      const s = input.toUpperCase();
      if (s.includes("TRIGGER_RATE_LIMIT")) {
        return HttpResponse.json(
          {
            error: "Rate limit exceeded",
            message: "Too many requests. Please try again later.",
            code: "RATE_LIMIT_EXCEEDED",
            retryAfter: 60,
          },
          { status: 429 },
        );
      }
      if (s.includes("TRIGGER_ERROR")) {
        return HttpResponse.json(
          {
            error: "Generation failed",
            message: "An error occurred during content generation",
            code: "GENERATION_ERROR",
            retryAfter: 30,
          },
          { status: 500 },
        );
      }
    }

    // Get or create user
    const currentUser =
      db.user.findFirst({
        where: { email: { equals: "demo@harvest.ai" } },
      }) || db.user.create({ email: "demo@harvest.ai", name: "Demo User" });

    // Generate mock content
    const outputFormat = format as keyof typeof mockContent;
    const output = mockContent[outputFormat]
      ? mockContent[outputFormat](input)
      : mockContent.blog(input);

    // Create generation record
    const generation = db.generation.create({
      user_id: currentUser.id,
      input,
      output,
      format: outputFormat,
      model: options.model || "gpt-4",
      status: "completed",
      tokens_used: faker.number.int({ min: 500, max: 2000 }),
      cost: faker.number.float({ min: 0.02, max: 0.1, multipleOf: 0.001 }),
      quality_score: faker.number.int({ min: 85, max: 98 }),
      processing_time: faker.number.int({ min: 800, max: 2400 }),
    });

    const cached = typeof input === "string" && input.toUpperCase().includes("TRIGGER_CACHED");
    const processing_time = cached ? 0 : generation.processing_time;

    return HttpResponse.json({
      result: generation.output,
      cost: {
        tokens_used: generation.tokens_used,
        estimated_cost: generation.cost,
        model_used: generation.model,
      },
      quality_score: generation.quality_score,
      processing_time,
      metadata: {
        format: generation.format,
        input_length: input.length,
        output_length: generation.output.length,
        generated_at: generation.created_at,
        cached,
        generation_id: generation.id,
      },
    });
  }),

  // Get generation by ID
  http.get("/api/generate/:id", async ({ request, params }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;

    const generation = db.generation.findFirst({
      where: { id: { equals: params.id as string } },
    });

    if (!generation) {
      return HttpResponse.json({ error: "Generation not found" }, { status: 404 });
    }

    return HttpResponse.json(generation);
  }),

  // Get user's generation history
  http.get("/api/generations", async ({ request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    // Get demo user
    const currentUser = db.user.findFirst({
      where: { email: { equals: "demo@harvest.ai" } },
    });

    if (!currentUser) {
      return HttpResponse.json([]);
    }

    const generations = db.generation.findMany({
      where: { user_id: { equals: currentUser.id } },
      take: limit,
      skip: offset,
      orderBy: { created_at: "desc" },
    });

    return HttpResponse.json({
      data: generations,
      total: db.generation.count({ where: { user_id: { equals: currentUser.id } } }),
      limit,
      offset,
    });
  }),

  // Delete generation
  http.delete("/api/generate/:id", async ({ request, params }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;

    const generation = db.generation.findFirst({
      where: { id: { equals: params.id as string } },
    });

    if (!generation) {
      return HttpResponse.json({ error: "Generation not found" }, { status: 404 });
    }

    db.generation.delete({
      where: { id: { equals: params.id as string } },
    });

    return HttpResponse.json({ success: true });
  }),

  // Batch generation
  http.post("/api/generate/batch", async ({ request }) => {
    const injected = await maybeInjectNetworkControls(request as unknown as Request);
    if (injected) return injected;

    await delay(2000);

    const body = (await request.json()) as any;
    const { inputs, format = "blog" } = body;

    const results = inputs.map((input: string) => ({
      input,
      output: mockContent[format as keyof typeof mockContent](input),
      tokens_used: faker.number.int({ min: 500, max: 2000 }),
      cost: faker.number.float({ min: 0.02, max: 0.1, multipleOf: 0.001 }),
    }));

    return HttpResponse.json({
      results,
      total_tokens: results.reduce((acc: number, r: any) => acc + r.tokens_used, 0),
      total_cost: results.reduce((acc: number, r: any) => acc + r.cost, 0),
    });
  }),
];
