import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";
import crypto from "crypto";

type ContentFormat = Database["public"]["Enums"]["content_format"];
type GenerationStatus = Database["public"]["Enums"]["generation_status"];

interface GenerationOptions {
  format: ContentFormat;
  model?: "gpt-4" | "gpt-3.5-turbo" | "claude-3-opus" | "claude-3-sonnet" | "gemini-pro";
  temperature?: number;
  maxTokens?: number;
  tone?: "professional" | "casual" | "academic" | "creative" | "technical";
  length?: "short" | "medium" | "long";
  language?: string;
  targetAudience?: string;
  includeSeo?: boolean;
  useCache?: boolean;
  stream?: boolean;
}

interface GenerationResult {
  content: string;
  model: string;
  tokensUsed: number;
  cost: number;
  processingTime: number;
  cached: boolean;
  qualityScore: number;
}

export class AIService {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private gemini: GoogleGenerativeAI | null = null;

  constructor() {
    // Initialize OpenAI
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        organization: process.env.OPENAI_ORG_ID,
      });
    }

    // Initialize Anthropic
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }

    // Initialize Google Gemini
    if (process.env.GOOGLE_AI_API_KEY) {
      this.gemini = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    }
  }

  async generateContent(
    input: string,
    options: GenerationOptions,
    userId?: string,
  ): Promise<GenerationResult> {
    const startTime = Date.now();
    const supabase = await createClient();

    // Check cache first if enabled
    if (options.useCache) {
      const cached = await this.checkCache(input, options);
      if (cached) {
        return {
          ...cached,
          cached: true,
          processingTime: Date.now() - startTime,
        };
      }
    }

    // Create generation record
    let generationId: string | null = null;
    if (userId) {
      const { data: generation } = await (supabase as any)
        .from("content_generations")
        .insert({
          user_id: userId,
          input_text: input,
          input_length: input.length,
          output_format: options.format,
          model: options.model || "gpt-4",
          status: "processing" as GenerationStatus,
          parameters: options as any,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      generationId = generation?.id || null;
    }

    try {
      // Build the prompt
      const prompt = this.buildPrompt(input, options);
      const model = options.model || "gpt-4";

      let result: GenerationResult | null = null;

      // Attempt primary provider first
      try {
        if (model.startsWith("gpt") && this.openai) {
          result = await this.generateWithOpenAI(prompt, options);
        } else if (model.startsWith("claude") && this.anthropic) {
          result = await this.generateWithAnthropic(prompt, options);
        } else if (model === "gemini-pro" && this.gemini) {
          result = await this.generateWithGemini(prompt, options);
        } else {
          // Unknown or unavailable model -> use fallback chain
          result = await this.generateWithFallback(prompt, options);
        }
      } catch (primaryErr) {
        // On primary failure, try fallback chain excluding the failed provider
        const exclude: Array<"openai" | "anthropic" | "gemini"> = [];
        if (model.startsWith("gpt")) exclude.push("openai");
        else if (model.startsWith("claude")) exclude.push("anthropic");
        else if (model === "gemini-pro") exclude.push("gemini");

        result = await this.generateWithFallback(prompt, options, exclude);
      }

      // Calculate quality score
      result.qualityScore = this.calculateQualityScore(input, result.content, options);

      // Update generation record
      if (generationId) {
        await (supabase as any)
          .from("content_generations")
          .update({
            output_text: result.content,
            output_length: result.content.length,
            tokens_used: result.tokensUsed,
            estimated_cost: result.cost,
            quality_score: result.qualityScore,
            processing_time: result.processingTime,
            status: "completed" as GenerationStatus,
            completed_at: new Date().toISOString(),
          })
          .eq("id", generationId);
      }

      // Cache the result
      if (options.useCache) {
        await this.cacheResult(input, options, result);
      }

      // Track usage
      if (userId) {
        await this.trackUsage(userId, result, options);
      }

      return result;
    } catch (error) {
      // Update generation record with error
      if (generationId) {
        await (supabase as any)
          .from("content_generations")
          .update({
            status: "failed" as GenerationStatus,
            error_message: error instanceof Error ? error.message : "Unknown error",
            completed_at: new Date().toISOString(),
          })
          .eq("id", generationId);
      }

      throw error;
    }
  }

  private async generateWithOpenAI(
    prompt: string,
    options: GenerationOptions,
  ): Promise<GenerationResult> {
    if (!this.openai) throw new Error("OpenAI not configured");

    const startTime = Date.now();
    const model = options.model === "gpt-3.5-turbo" ? "gpt-3.5-turbo" : "gpt-4-turbo-preview";

    const completion = await this.openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: this.getSystemPrompt(options),
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000,
      stream: false, // Force non-streaming for simplicity
    });

    const content = completion.choices[0].message.content || "";
    const tokensUsed = completion.usage?.total_tokens || 0;

    return {
      content,
      model,
      tokensUsed,
      cost: this.calculateCost(model, tokensUsed),
      processingTime: Date.now() - startTime,
      cached: false,
      qualityScore: 0, // Will be calculated later
    };
  }

  private async generateWithAnthropic(
    prompt: string,
    options: GenerationOptions,
  ): Promise<GenerationResult> {
    if (!this.anthropic) throw new Error("Anthropic not configured");

    const startTime = Date.now();
    const model =
      options.model === "claude-3-sonnet" ? "claude-3-sonnet-20240229" : "claude-3-opus-20240229";

    const message = await this.anthropic.messages.create({
      model,
      max_tokens: options.maxTokens || 2000,
      temperature: options.temperature || 0.7,
      system: this.getSystemPrompt(options),
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0].type === "text" ? message.content[0].text : "";
    const tokensUsed = message.usage?.input_tokens + message.usage?.output_tokens || 0;

    return {
      content,
      model,
      tokensUsed,
      cost: this.calculateCost(model, tokensUsed),
      processingTime: Date.now() - startTime,
      cached: false,
      qualityScore: 0,
    };
  }

  private async generateWithGemini(
    prompt: string,
    options: GenerationOptions,
  ): Promise<GenerationResult> {
    if (!this.gemini) throw new Error("Gemini not configured");

    const startTime = Date.now();
    const model = this.gemini.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    // Gemini doesn't provide token count, estimate it
    const tokensUsed = Math.ceil((prompt.length + content.length) / 4);

    return {
      content,
      model: "gemini-pro",
      tokensUsed,
      cost: this.calculateCost("gemini-pro", tokensUsed),
      processingTime: Date.now() - startTime,
      cached: false,
      qualityScore: 0,
    };
  }

  private async generateWithFallback(
    prompt: string,
    options: GenerationOptions,
    exclude: Array<"openai" | "anthropic" | "gemini"> = [],
  ): Promise<GenerationResult> {
    const errors: Error[] = [];

    const candidates: Array<{
      key: "openai" | "anthropic" | "gemini";
      run: () => Promise<GenerationResult>;
      available: boolean;
    }> = [
      {
        key: "openai",
        run: () => this.generateWithOpenAI(prompt, { ...options, model: "gpt-4" }),
        available: Boolean(this.openai),
      },
      {
        key: "anthropic",
        run: () => this.generateWithAnthropic(prompt, { ...options, model: "claude-3-opus" }),
        available: Boolean(this.anthropic),
      },
      {
        key: "gemini",
        run: () => this.generateWithGemini(prompt, options),
        available: Boolean(this.gemini),
      },
    ];

    for (const c of candidates) {
      if (!c.available) continue;
      if (exclude.includes(c.key)) continue;
      try {
        return await c.run();
      } catch (err) {
        errors.push(err as Error);
      }
    }

    // All failed
    throw new Error(`All AI providers failed: ${errors.map((e) => e.message).join(", ")}`);
  }

  private buildPrompt(input: string, options: GenerationOptions): string {
    const formatPrompts: Record<ContentFormat, string> = {
      blog: `Transform the following content into a well-structured blog post with an engaging title, introduction, main body with subheadings, and conclusion. Include SEO keywords if relevant.`,
      email: `Convert the following content into a professional email with a clear subject line, greeting, main message, call to action, and signature.`,
      summary: `Create a concise summary of the following content, highlighting key points, main ideas, and actionable insights.`,
      presentation: `Transform the following content into presentation slides with titles, bullet points, and speaker notes.`,
      tweet: `Create a Twitter thread (3-5 tweets) summarizing the key points of the following content. Each tweet should be under 280 characters.`,
      linkedin: `Write a LinkedIn post based on the following content. Make it professional, engaging, and include relevant hashtags.`,
      script: `Convert the following content into a script format with scene descriptions, dialogue, and stage directions.`,
      outline: `Create a detailed outline of the following content with main sections, subsections, and key points.`,
      report: `Transform the following content into a formal report with executive summary, sections, data analysis, and recommendations.`,
    };

    let prompt = formatPrompts[options.format] + "\n\n";

    if (options.tone) {
      prompt += `Tone: ${options.tone}\n`;
    }

    if (options.length) {
      const lengthMap = {
        short: "200-300 words",
        medium: "500-700 words",
        long: "1000-1500 words",
      };
      prompt += `Length: ${lengthMap[options.length]}\n`;
    }

    if (options.targetAudience) {
      prompt += `Target Audience: ${options.targetAudience}\n`;
    }

    if (options.language && options.language !== "en") {
      prompt += `Language: ${options.language}\n`;
    }

    prompt += `\nContent to transform:\n${input}`;

    return prompt;
  }

  private getSystemPrompt(options: GenerationOptions): string {
    return `You are an expert content transformation assistant. You excel at converting raw content into various professional formats while maintaining accuracy and engagement. Always provide high-quality, well-structured output that meets professional standards.`;
  }

  private calculateCost(model: string, tokens: number): number {
    const pricing: Record<string, number> = {
      "gpt-4-turbo-preview": 0.03, // per 1K tokens
      "gpt-3.5-turbo": 0.002,
      "claude-3-opus-20240229": 0.03,
      "claude-3-sonnet-20240229": 0.015,
      "gemini-pro": 0.001,
    };

    const rate = pricing[model] || 0.01;
    return (tokens / 1000) * rate;
  }

  private calculateQualityScore(input: string, output: string, options: GenerationOptions): number {
    let score = 70; // Base score

    // Length appropriateness
    const expectedLength = {
      short: 250,
      medium: 600,
      long: 1250,
    };

    if (options.length) {
      const expected = expectedLength[options.length];
      const actual = output.split(" ").length;
      const diff = Math.abs(expected - actual) / expected;
      score += Math.max(0, 10 * (1 - diff));
    }

    // Format compliance
    if (options.format === "blog" && output.includes("#")) score += 5;
    if (options.format === "email" && output.includes("Subject:")) score += 5;

    // Complexity match
    const inputComplexity = this.calculateComplexity(input);
    const outputComplexity = this.calculateComplexity(output);
    if (Math.abs(inputComplexity - outputComplexity) < 0.2) score += 10;

    return Math.min(100, Math.max(0, score));
  }

  private calculateComplexity(text: string): number {
    const words = text.split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const avgWordsPerSentence = words.length / (sentences.length || 1);
    const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
    const lexicalDiversity = uniqueWords.size / words.length;

    return (avgWordsPerSentence / 20) * 0.5 + lexicalDiversity * 0.5;
  }

  private async checkCache(
    input: string,
    options: GenerationOptions,
  ): Promise<GenerationResult | null> {
    const supabase = await createClient();
    const cacheKey = this.generateCacheKey(input, options);

    const { data: cached } = await (supabase as any)
      .from("cache")
      .select("value")
      .eq("key", cacheKey)
      .single();

    if (cached && cached.value) {
      return cached.value as GenerationResult;
    }

    return null;
  }

  private async cacheResult(
    input: string,
    options: GenerationOptions,
    result: GenerationResult,
  ): Promise<void> {
    const supabase = await createClient();
    const cacheKey = this.generateCacheKey(input, options);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    await (supabase as any).from("cache").upsert({
      key: cacheKey,
      value: result as any,
      expires_at: expiresAt,
    });
  }

  private generateCacheKey(input: string, options: GenerationOptions): string {
    const data = JSON.stringify({ input: input.substring(0, 100), options });
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  private async trackUsage(
    userId: string,
    result: GenerationResult,
    options: GenerationOptions,
  ): Promise<void> {
    const supabase = await createClient();

    await (supabase as any).from("usage_logs").insert({
      user_id: userId,
      endpoint: "/api/generate",
      method: "POST",
      tokens_used: result.tokensUsed,
      cost: result.cost,
      response_status: 200,
      response_time: result.processingTime,
      request_body: { format: options.format, model: result.model },
    });
  }

  // Embeddings for semantic search
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.openai) throw new Error("OpenAI not configured for embeddings");

    const response = await this.openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });

    return response.data[0].embedding;
  }

  // Content analysis
  async analyzeContent(text: string): Promise<{
    sentiment: "positive" | "negative" | "neutral";
    entities: string[];
    topics: string[];
    readability: number;
    seoScore: number;
  }> {
    // This would integrate with specialized APIs or models
    // For now, return mock analysis
    return {
      sentiment: "neutral",
      entities: [],
      topics: [],
      readability: 75,
      seoScore: 60,
    };
  }
}
