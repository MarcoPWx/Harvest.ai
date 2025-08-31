/**
 * React Hook for BYOK AI Chat
 * Handles communication with the AI gateway
 */

import { useState, useCallback } from "react";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  provider: "openai" | "anthropic" | "google";
  model: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ChatResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  provider: string;
  model: string;
  timestamp: string;
}

export function useAIChat() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState<string>("");

  /**
   * Send chat request through our gateway
   */
  const sendMessage = useCallback(
    async (messages: ChatMessage[], options: ChatOptions): Promise<ChatResponse | null> => {
      setLoading(true);
      setError(null);
      setStreamingContent("");

      try {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...options,
            messages,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to get AI response");
        }

        if (options.stream) {
          // Handle streaming response
          const reader = response.body?.getReader();
          if (!reader) throw new Error("No response body");

          const decoder = new TextDecoder();
          let fullContent = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") break;

                try {
                  const parsed = JSON.parse(data);
                  const content = extractStreamContent(options.provider, parsed);
                  if (content) {
                    fullContent += content;
                    setStreamingContent(fullContent);
                  }
                } catch (e) {
                  console.error("Failed to parse stream:", e);
                }
              }
            }
          }

          return {
            content: fullContent,
            provider: options.provider,
            model: options.model,
            timestamp: new Date().toISOString(),
          };
        } else {
          // Handle regular response
          const data = await response.json();
          return data;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error occurred";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Stream chat response
   */
  const streamMessage = useCallback(
    async (
      messages: ChatMessage[],
      options: ChatOptions,
      onChunk: (chunk: string) => void,
    ): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...options,
            messages,
            stream: true,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to stream AI response");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") return;

              try {
                const parsed = JSON.parse(data);
                const content = extractStreamContent(options.provider, parsed);
                if (content) {
                  onChunk(content);
                }
              } catch (e) {
                console.error("Failed to parse stream:", e);
              }
            }
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error occurred";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    sendMessage,
    streamMessage,
    loading,
    error,
    streamingContent,
  };
}

// Helper: Extract content from streaming response based on provider
function extractStreamContent(provider: string, data: any): string | null {
  switch (provider) {
    case "openai":
      return data.choices?.[0]?.delta?.content || null;
    case "anthropic":
      return data.delta?.text || null;
    case "google":
      return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    default:
      return null;
  }
}
