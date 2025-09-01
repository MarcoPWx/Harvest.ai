/**
 * BYOK AI Gateway API Route
 * Proxies requests to AI providers using user's stored API keys
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Provider configurations
const PROVIDER_CONFIGS = {
  openai: {
    url: "https://api.openai.com/v1/chat/completions",
    headers: (apiKey: string) => ({
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
  },
  anthropic: {
    url: "https://api.anthropic.com/v1/messages",
    headers: (apiKey: string) => ({
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    }),
  },
  google: {
    url: (model: string, apiKey: string) =>
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    headers: () => ({
      "Content-Type": "application/json",
    }),
  },
};

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get request body
    const body = await request.json();
    const { provider, model, messages, temperature, maxTokens, stream } = body;

    // 3. Validate provider
    if (!PROVIDER_CONFIGS[provider as keyof typeof PROVIDER_CONFIGS]) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    // 4. Get user's API key from database
    const { data: apiKeyData, error: keyError } = await supabase
      .from("api_keys")
      .select("encrypted_key")
      .eq("user_id", user.id)
      .eq("provider", provider)
      .single();

    if (keyError || !apiKeyData) {
      return NextResponse.json(
        { error: `No API key found for ${provider}. Please add your key in settings.` },
        { status: 400 },
      );
    }

    // 5. Decrypt API key (in production, use proper encryption)
    // For now, assuming it's stored as-is (YOU MUST ENCRYPT IN PRODUCTION!)
    const apiKey = (apiKeyData as any).encrypted_key;

    // 6. Build provider-specific request
    const providerConfig = PROVIDER_CONFIGS[provider as keyof typeof PROVIDER_CONFIGS];
    let url =
      typeof providerConfig.url === "function"
        ? providerConfig.url(model, apiKey)
        : providerConfig.url;

    const headers = providerConfig.headers(apiKey);

    // 7. Transform request for each provider's format
    const providerBody = transformRequestForProvider(provider, {
      model,
      messages,
      temperature,
      maxTokens,
      stream,
    });

    // 8. Log usage (before making request)
    const { error: logError } = await (supabase as any).from("ai_usage").insert({
      user_id: user.id,
      provider,
      model,
      prompt_tokens: 0, // Will update after response
      completion_tokens: 0,
      total_tokens: 0,
      cost: 0,
      created_at: new Date().toISOString(),
    });

    // 9. Make request to AI provider
    if (stream) {
      // Handle streaming response
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ ...providerBody, stream: true }),
      });

      if (!response.ok) {
        const error = await response.text();
        return NextResponse.json(
          { error: `Provider error: ${error}` },
          { status: response.status },
        );
      }

      // Return streaming response
      return new NextResponse(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    } else {
      // Handle regular response
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(providerBody),
      });

      if (!response.ok) {
        const error = await response.text();
        return NextResponse.json(
          { error: `Provider error: ${error}` },
          { status: response.status },
        );
      }

      const data = await response.json();

      // 10. Parse response and extract usage
      const parsed = parseProviderResponse(provider, data);

      // 11. Update usage in database
      if (parsed.usage) {
        await (supabase as any)
          .from("ai_usage")
          .update({
            prompt_tokens: parsed.usage.promptTokens,
            completion_tokens: parsed.usage.completionTokens,
            total_tokens: parsed.usage.totalTokens,
            cost: calculateCost(provider, model, parsed.usage),
          })
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);
      }

      // 12. Return standardized response
      return NextResponse.json({
        content: parsed.content,
        usage: parsed.usage,
        provider,
        model,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("AI Gateway Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Helper: Transform request for each provider's API format
function transformRequestForProvider(provider: string, request: any) {
  switch (provider) {
    case "openai":
      return {
        model: request.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens,
        stream: request.stream ?? false,
      };

    case "anthropic":
      const systemMessage = request.messages.find((m: any) => m.role === "system");
      const otherMessages = request.messages.filter((m: any) => m.role !== "system");

      return {
        model: request.model,
        messages: otherMessages,
        system: systemMessage?.content,
        max_tokens: request.maxTokens ?? 1024,
        temperature: request.temperature ?? 0.7,
        stream: request.stream ?? false,
      };

    case "google":
      return {
        contents: request.messages.map((m: any) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        generationConfig: {
          temperature: request.temperature ?? 0.7,
          maxOutputTokens: request.maxTokens,
        },
      };

    default:
      return request;
  }
}

// Helper: Parse provider response to standard format
function parseProviderResponse(provider: string, data: any) {
  switch (provider) {
    case "openai":
      return {
        content: data.choices[0]?.message?.content || "",
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
      };

    case "anthropic":
      return {
        content: data.content[0]?.text || "",
        usage: {
          promptTokens: data.usage?.input_tokens || 0,
          completionTokens: data.usage?.output_tokens || 0,
          totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        },
      };

    case "google":
      const text = data.candidates[0]?.content?.parts[0]?.text || "";
      return {
        content: text,
        usage: {
          // Google doesn't provide token counts, estimate
          promptTokens: Math.ceil(text.length / 4),
          completionTokens: Math.ceil(text.length / 4),
          totalTokens: Math.ceil(text.length / 2),
        },
      };

    default:
      return {
        content: "",
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      };
  }
}

// Helper: Calculate cost based on provider pricing
function calculateCost(provider: string, model: string, usage: any): number {
  const pricing: Record<string, Record<string, { input: number; output: number }>> = {
    openai: {
      "gpt-4-turbo-preview": { input: 0.01, output: 0.03 },
      "gpt-4": { input: 0.03, output: 0.06 },
      "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 },
    },
    anthropic: {
      "claude-3-opus-20240229": { input: 0.015, output: 0.075 },
      "claude-3-sonnet-20240229": { input: 0.003, output: 0.015 },
      "claude-3-haiku-20240307": { input: 0.00025, output: 0.00125 },
    },
    google: {
      "gemini-pro": { input: 0.00025, output: 0.0005 },
    },
  };

  const modelPricing = pricing[provider]?.[model];
  if (!modelPricing) return 0;

  const inputCost = (usage.promptTokens / 1000) * modelPricing.input;
  const outputCost = (usage.completionTokens / 1000) * modelPricing.output;

  return inputCost + outputCost;
}
