export type ProviderName = "mock" | "openai" | "anthropic" | "gemini" | "our";

export interface GenerateParams {
  input: string;
  format: "blog" | "email" | "summary" | "presentation";
}

export interface GenerateResult {
  output: string;
  model: string;
}

// Basic simulate used for local/dev providers
function simulateOutput(input: string, format: string) {
  const base = input.trim() || "Harvest.ai content";
  if (format === "email")
    return `Subject: Update on ${base.slice(0, 24)}\n\nDear team,\n\n${base}...\n\nBest,\nHarvest.ai`;
  if (format === "summary")
    return `Executive Summary: ${base.slice(0, 80)}...\n- Point 1\n- Point 2\n- Point 3`;
  if (format === "presentation")
    return `# ${base}\n\n---\nSlide 1: Intro\n---\nSlide 2: Details\n---\nSlide 3: Wrap-up`;
  return `# ${base}\n\n## Introduction\n${base}...\n\n## Conclusion\nThanks for reading.`;
}

// Adapters (lazy imported to avoid bundling provider SDKs unless enabled)
async function runOpenAI(input: string, format: string): Promise<GenerateResult> {
  const { default: OpenAI } = await import("openai");
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { output: simulateOutput(input, format), model: "openai-mock" };
  const client = new OpenAI({ apiKey });
  // Use a conservative model default; adjust if env specifies differently
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const sys = `You are a content transformation assistant. Format=${format}.`;
  const chat = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: sys },
      { role: "user", content: input },
    ],
    temperature: 0.7,
    max_tokens: 800,
  });
  const output = chat.choices?.[0]?.message?.content || simulateOutput(input, format);
  return { output, model };
}

async function runAnthropic(input: string, format: string): Promise<GenerateResult> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { output: simulateOutput(input, format), model: "anthropic-mock" };
  const client = new Anthropic({ apiKey });
  const model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest";
  const message = await client.messages.create({
    model,
    max_tokens: 800,
    temperature: 0.7,
    system: `You are a content transformation assistant. Format=${format}.`,
    messages: [{ role: "user", content: input }],
  });
  const output = (message.content?.[0] as any)?.text || simulateOutput(input, format);
  return { output, model };
}

async function runGemini(input: string, format: string): Promise<GenerateResult> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return { output: simulateOutput(input, format), model: "gemini-mock" };
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const model = genAI.getGenerativeModel({ model: modelName });
  const prompt = `You are a content transformation assistant. Format=${format}.\n\n${input}`;
  const result = await model.generateContent(prompt);
  const output = result?.response?.text?.() || simulateOutput(input, format);
  return { output, model: modelName };
}

// Our provider adapter — calls your proprietary service
import { runOurProviderWithEnv } from "./our";
async function runOurProvider(input: string, format: string): Promise<GenerateResult> {
  try {
    return await runOurProviderWithEnv(input, format);
  } catch {
    return { output: simulateOutput(input, format), model: "our-fallback" };
  }
}

export async function generateWithProvider(
  provider: ProviderName,
  params: GenerateParams,
): Promise<GenerateResult> {
  const providersOn = process.env.PROVIDERS_ON === "1";
  if (!providersOn || provider === "mock") {
    return { output: simulateOutput(params.input, params.format), model: "mock-gpt" };
  }
  try {
    switch (provider) {
      case "openai":
        return await runOpenAI(params.input, params.format);
      case "anthropic":
        return await runAnthropic(params.input, params.format);
      case "gemini":
        return await runGemini(params.input, params.format);
      case "our":
        return await runOurProvider(params.input, params.format);
      default:
        return { output: simulateOutput(params.input, params.format), model: "mock-gpt" };
    }
  } catch {
    // On any provider error, fall back to simulate
    return { output: simulateOutput(params.input, params.format), model: `${provider}-fallback` };
  }
}
