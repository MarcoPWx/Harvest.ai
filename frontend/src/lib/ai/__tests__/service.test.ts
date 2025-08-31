import { AIService } from "../service";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Mock all AI providers
jest.mock("openai");
jest.mock("@anthropic-ai/sdk");
jest.mock("@google/generative-ai");
jest.mock("@/lib/supabase/server", () => {
  const chain = {
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  };

  const supabaseClientMock = {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
    from: jest.fn(() => chain),
  } as any;

  return {
    __esModule: true,
    createClient: jest.fn(() => supabaseClientMock),
  };
});

describe("AIService", () => {
  let service: AIService;
  let mockOpenAI: jest.Mocked<OpenAI>;
  let mockAnthropic: jest.Mocked<Anthropic>;
  let mockGemini: jest.Mocked<GoogleGenerativeAI>;

  beforeEach(() => {
    // Reset environment variables
    process.env.OPENAI_API_KEY = "test-openai-key";
    process.env.ANTHROPIC_API_KEY = "test-anthropic-key";
    process.env.GOOGLE_AI_API_KEY = "test-google-key";

    // Create mocked instances
    mockOpenAI = {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: "Generated content from OpenAI" } }],
            usage: { total_tokens: 100 },
          }),
        },
      },
      embeddings: {
        create: jest.fn().mockResolvedValue({
          data: [{ embedding: new Array(1536).fill(0.1) }],
        }),
      },
    } as any;

    mockAnthropic = {
      messages: {
        create: jest.fn().mockResolvedValue({
          content: [{ type: "text", text: "Generated content from Claude" }],
          usage: { input_tokens: 50, output_tokens: 50 },
        }),
      },
    } as any;

    mockGemini = {
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => "Generated content from Gemini",
          },
        }),
      }),
    } as any;

    // Mock constructors
    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => mockOpenAI);
    (Anthropic as jest.MockedClass<typeof Anthropic>).mockImplementation(() => mockAnthropic);
    (GoogleGenerativeAI as jest.MockedClass<typeof GoogleGenerativeAI>).mockImplementation(
      () => mockGemini,
    );

    service = new AIService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("generateContent", () => {
    it("should generate content using OpenAI when specified", async () => {
      const result = await service.generateContent(
        "Test input",
        {
          format: "blog",
          model: "gpt-4",
          temperature: 0.7,
          maxTokens: 1000,
        },
        "test-user-id",
      );

      expect(result).toMatchObject({
        content: "Generated content from OpenAI",
        model: expect.stringContaining("gpt"),
        tokensUsed: 100,
        cached: false,
      });

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: expect.stringContaining("gpt"),
          temperature: 0.7,
          max_tokens: 1000,
        }),
      );
    });

    it("should generate content using Anthropic when specified", async () => {
      const result = await service.generateContent(
        "Test input",
        {
          format: "email",
          model: "claude-3-opus",
          temperature: 0.5,
        },
        "test-user-id",
      );

      expect(result).toMatchObject({
        content: "Generated content from Claude",
        model: expect.stringContaining("claude"),
        tokensUsed: 100,
        cached: false,
      });

      expect(mockAnthropic.messages.create).toHaveBeenCalled();
    });

    it("should generate content using Gemini when specified", async () => {
      const result = await service.generateContent(
        "Test input",
        {
          format: "summary",
          model: "gemini-pro",
        },
        "test-user-id",
      );

      expect(result).toMatchObject({
        content: "Generated content from Gemini",
        model: "gemini-pro",
        cached: false,
      });

      expect(mockGemini.getGenerativeModel).toHaveBeenCalledWith({ model: "gemini-pro" });
    });

    it("should fall back to other providers when primary fails", async () => {
      // Make OpenAI fail
      mockOpenAI.chat.completions.create.mockRejectedValueOnce(new Error("OpenAI API error"));

      const result = await service.generateContent("Test input", {
        format: "summary",
        model: "gpt-4", // Request GPT-4 but it will fail
      });

      // Should fall back to Anthropic or return generated content
      expect(result.content).toBeTruthy();
      expect(result.content.length).toBeGreaterThan(0);
      // Either Anthropic was called as fallback, or OpenAI succeeded on retry
      const anthropicCalled = mockAnthropic.messages.create.mock.calls.length > 0;
      const openaiCalledAgain = mockOpenAI.chat.completions.create.mock.calls.length > 1;
      expect(anthropicCalled || openaiCalledAgain).toBeTruthy();
    });

    it("should handle all providers failing", async () => {
      // Make all providers fail
      mockOpenAI.chat.completions.create.mockRejectedValueOnce(new Error("OpenAI error"));
      mockAnthropic.messages.create.mockRejectedValueOnce(new Error("Anthropic error"));
      const mockGenerateContent = mockGemini.getGenerativeModel("" as any)
        .generateContent as jest.Mock;
      mockGenerateContent.mockRejectedValueOnce(new Error("Gemini error"));

      await expect(service.generateContent("Test input", { format: "blog" })).rejects.toThrow(
        "All AI providers failed",
      );
    });

    it("should calculate quality score based on content", async () => {
      const result = await service.generateContent("Test input for quality scoring", {
        format: "blog",
        length: "medium",
      });

      expect(result.qualityScore).toBeGreaterThanOrEqual(0);
      expect(result.qualityScore).toBeLessThanOrEqual(100);
    });

    it("should respect different format prompts", async () => {
      const formats = ["blog", "email", "summary", "presentation"] as const;

      for (const format of formats) {
        await service.generateContent("Test input", { format }, "test-user-id");

        const calls = mockOpenAI.chat.completions.create.mock.calls;
        const lastCall = calls[calls.length - 1][0];

        expect(lastCall.messages[1].content).toContain(format);
      }
    });

    it("should apply tone and length options", async () => {
      await service.generateContent("Test input", {
        format: "email",
        tone: "casual",
        length: "short",
        targetAudience: "developers",
      });

      const call = mockOpenAI.chat.completions.create.mock.calls[0][0];
      expect(call.messages[1].content).toContain("casual");
      expect(call.messages[1].content).toContain("200-300 words");
      expect(call.messages[1].content).toContain("developers");
    });
  });

  describe("generateEmbedding", () => {
    it("should generate embeddings using OpenAI", async () => {
      const embedding = await service.generateEmbedding("Test text for embedding");

      expect(embedding).toHaveLength(1536);
      expect(mockOpenAI.embeddings.create).toHaveBeenCalledWith({
        model: "text-embedding-ada-002",
        input: "Test text for embedding",
      });
    });

    it("should throw error when OpenAI is not configured", async () => {
      delete process.env.OPENAI_API_KEY;
      const serviceWithoutOpenAI = new AIService();

      await expect(serviceWithoutOpenAI.generateEmbedding("Test text")).rejects.toThrow(
        "OpenAI not configured for embeddings",
      );
    });
  });

  describe("analyzeContent", () => {
    it("should return content analysis", async () => {
      const analysis = await service.analyzeContent("Test content for analysis");

      expect(analysis).toHaveProperty("sentiment");
      expect(analysis).toHaveProperty("entities");
      expect(analysis).toHaveProperty("topics");
      expect(analysis).toHaveProperty("readability");
      expect(analysis).toHaveProperty("seoScore");

      expect(["positive", "negative", "neutral"]).toContain(analysis.sentiment);
      expect(analysis.readability).toBeGreaterThanOrEqual(0);
      expect(analysis.readability).toBeLessThanOrEqual(100);
    });
  });

  describe("Error Handling", () => {
    it("should handle rate limit errors", async () => {
      mockOpenAI.chat.completions.create.mockRejectedValueOnce(new Error("Rate limit exceeded"));

      // Should fall back to another provider
      const result = await service.generateContent("Test input", { format: "blog" });

      expect(result.content).toBe("Generated content from Claude");
    });

    it("should handle API key errors", async () => {
      mockOpenAI.chat.completions.create.mockRejectedValueOnce(new Error("Invalid API key"));
      mockAnthropic.messages.create.mockRejectedValueOnce(new Error("Invalid API key"));

      // Should fall back to Gemini
      const result = await service.generateContent("Test input", { format: "summary" });

      expect(result.content).toBe("Generated content from Gemini");
    });

    it("should track errors in database", async () => {
      const supabaseMock = require("@/lib/supabase/server").createClient();

      mockOpenAI.chat.completions.create.mockRejectedValueOnce(new Error("Test error"));
      mockAnthropic.messages.create.mockRejectedValueOnce(new Error("Test error"));
      const mockGenerateContent = mockGemini.getGenerativeModel("" as any)
        .generateContent as jest.Mock;
      mockGenerateContent.mockRejectedValueOnce(new Error("Test error"));

      try {
        await service.generateContent("Test input", { format: "blog" }, "test-user-id");
      } catch (error) {
        // Expected to throw
      }

      expect(supabaseMock.from).toHaveBeenCalledWith("content_generations");
    });
  });

  describe("Caching", () => {
    it("should check cache when useCache is true", async () => {
      const supabaseMock = require("@/lib/supabase/server").createClient();

      // Mock cache hit
      supabaseMock
        .from()
        .select()
        .eq()
        .single.mockResolvedValueOnce({
          data: {
            value: {
              content: "Cached content",
              model: "gpt-4",
              tokensUsed: 50,
              cost: 0.001,
              qualityScore: 85,
            },
          },
          error: null,
        });

      const result = await service.generateContent("Test input", {
        format: "blog",
        useCache: true,
      });

      expect(result.content).toBe("Cached content");
      expect(result.cached).toBe(true);
      expect(mockOpenAI.chat.completions.create).not.toHaveBeenCalled();
    });

    it("should store results in cache when useCache is true", async () => {
      const supabaseMock = require("@/lib/supabase/server").createClient();

      await service.generateContent("Test input", {
        format: "blog",
        useCache: true,
      });

      expect(supabaseMock.from).toHaveBeenCalledWith("cache");
      expect(supabaseMock.from().upsert).toHaveBeenCalled();
    });
  });

  describe("Cost Calculation", () => {
    it("should calculate costs correctly for different models", async () => {
      const models = [
        { model: "gpt-3.5-turbo", expectedCostPer1k: 0.002 },
        { model: "gpt-4", expectedCostPer1k: 0.03 },
        { model: "claude-3-opus", expectedCostPer1k: 0.03 },
        { model: "gemini-pro", expectedCostPer1k: 0.001 },
      ];

      for (const { model, expectedCostPer1k } of models) {
        const result = await service.generateContent("Test", {
          format: "summary",
          model: model as any,
        });

        const expectedCost = (result.tokensUsed / 1000) * expectedCostPer1k;
        expect(result.cost).toBeCloseTo(expectedCost, 5);
      }
    });
  });
});
