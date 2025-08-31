"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { connectGenerationProgress, type GenerationEvent } from "@/lib/realtime/generation";

interface GenerationResult {
  result: string;
  cost: {
    tokens_used: number;
    estimated_cost: number;
    model_used: string;
  };
  quality_score: number;
  processing_time: number;
  metadata: {
    format: string;
    input_length: number;
    output_length: number;
    generated_at: string;
    cached?: boolean;
  };
}

export default function DemoPage() {
  const [inputContent, setInputContent] = useState(
    process.env.NEXT_PUBLIC_E2E === "1" ? "E2E default content" : "",
  );
  const [selectedFormat, setSelectedFormat] = useState<"blog" | "summary" | "email">("blog");
  const [apiKey, setApiKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Realtime mock progress/streaming state
  const [progress, setProgress] = useState(0);
  const [streamText, setStreamText] = useState("");
  const wsCleanupRef = useRef<null | (() => void)>(null);

  // Initialize dark mode from system preference
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const stored = localStorage.getItem("harvest-dark-mode");
    setDarkMode(stored ? stored === "true" : prefersDark);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("harvest-dark-mode", newMode.toString());
  };

  // Determine if we are in mock mode (MSW enabled or dev)
  const mockMode =
    process.env.NEXT_PUBLIC_ENABLE_MSW === "1" || process.env.NODE_ENV === "development";

  const startRealtime = () => {
    // Clean up any previous connection
    wsCleanupRef.current?.();
    setProgress(0);
    setStreamText("");

    wsCleanupRef.current = connectGenerationProgress({
      onEvent: (ev: GenerationEvent) => {
        if (ev.type === "progress") setProgress(ev.value);
        if (ev.type === "stream") setStreamText((prev) => prev + ev.delta);
        if (ev.type === "complete") {
          // If no server-side result yet, at least show streamed content
          if (!result) {
            setStreamText((prev) => (prev ? prev + "\n" : "") + ev.content);
          }
          // Close after a small delay to ensure UI updates
          setTimeout(() => wsCleanupRef.current?.(), 250);
        }
      },
    });
  };

  const formats = [
    {
      id: "blog",
      name: "Blog Post",
      icon: "📝",
      description: "SEO-optimized blog post with structure",
      example: "Turn notes into a professional blog post with headings, intro, and conclusion",
    },
    {
      id: "summary",
      name: "Content Summary",
      icon: "📋",
      description: "Key points and takeaways",
      example: "Extract main ideas and action items from long content",
    },
    {
      id: "email",
      name: "Email Template",
      icon: "📧",
      description: "Professional email with CTA",
      example: "Convert content into a business email with subject line and structure",
    },
  ];

  const sampleInputs = [
    {
      title: "Product Launch Notes",
      content: `We're launching a new AI-powered content tool called Harvest.ai. It transforms any content into different formats like blog posts, summaries, emails, and quizzes. Key features: uses your own OpenAI API key, provides cost transparency, quality scoring, and multiple export options. Target audience: content creators, marketers, educators. Pricing: free demo, paid plans coming soon. Launch date: September 2024.`,
      expectedOutput:
        "Professional blog post with SEO optimization, clear sections, and call-to-action",
    },
    {
      title: "Meeting Notes - Q4 Strategy",
      content: `Q4 Strategy Meeting Notes: Revenue target $500K, focus on enterprise customers, launch new features by November, hire 3 developers, improve customer support response time to under 2 hours, expand to European market, reduce churn rate to 5%, increase NPS score to 70. Key challenges: competition from larger players, technical debt, limited marketing budget. Success metrics: MRR growth, customer acquisition cost, lifetime value.`,
      expectedOutput: "Structured summary with key points, action items, and success metrics",
    },
    {
      title: "Technical Documentation",
      content: `API Endpoints: POST /api/generate - transforms content into different formats. Parameters: input (string), format (blog|summary|email), apiKey (string), options (tone, length, target_audience). Response includes: result (string), cost (tokens, estimated_cost), quality_score (number), processing_time (ms). Error handling: 400 for invalid input, 500 for generation failures. Rate limits: 100 requests per hour per API key.`,
      expectedOutput: "Professional email template with clear structure and call-to-action",
    },
  ];

  const handleSampleSelect = (sample: (typeof sampleInputs)[0]) => {
    setInputContent(sample.content);
  };

  const handleGenerate = async () => {
    if (!inputContent.trim()) {
      setError("Please enter some content to transform");
      return;
    }

    if (!apiKey.trim() && !mockMode) {
      setShowApiKeyInput(true);
      setError("Please enter your OpenAI API key");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);
    setProgress(0);
    setStreamText("");

    // Start realtime mock progress/streaming
    startRealtime();

    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: inputContent,
            format: selectedFormat,
            apiKey: apiKey,
            options: {
              tone: "professional",
              length: "medium",
              include_seo: selectedFormat === "blog",
            },
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          // Handle specific error types
          if (response.status === 429) {
            // Rate limit exceeded
            const retryAfter = data.retryAfter || 60;
            throw new Error(`Rate limit exceeded. Please try again in ${retryAfter} seconds.`);
          }

          if (response.status === 401) {
            // Invalid API key
            throw new Error("Invalid API key. Please check your OpenAI API key.");
          }

          if (response.status === 402) {
            // Quota exceeded
            throw new Error("OpenAI quota exceeded. Please check your account billing.");
          }

          if (response.status === 500) {
            // Server error
            const retryAfter = data.retryAfter || 30;
            if (retryCount < maxRetries - 1) {
              retryCount++;
              await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
              continue;
            }
            throw new Error(data.error || "Server error. Please try again later.");
          }

          throw new Error(data.error || "Generation failed");
        }

        setResult(data);
        break; // Success, exit retry loop
      } catch (err) {
        retryCount++;

        if (retryCount >= maxRetries) {
          // Final attempt failed
          setError(err instanceof Error ? err.message : "An error occurred");
          break;
        }

        // Wait before retrying (exponential backoff)
        const waitTime = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    // Clean up realtime connection
    wsCleanupRef.current?.();
    setIsGenerating(false);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 relative ${darkMode ? "bg-gray-950 text-white" : "bg-white text-gray-900"}`}
    >
      {/* Navigation Bar */}
      <nav
        className={`fixed w-full z-50 backdrop-blur-md border-b ${
          darkMode ? "bg-gray-950/90 border-gray-800" : "bg-white/90 border-gray-200"
        }`}
        style={{ WebkitBackdropFilter: "blur(16px)", backdropFilter: "blur(16px)" }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">H</span>
                </div>
                <div>
                  <span
                    className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    Harvest.ai
                  </span>
                  <span className="text-xs text-orange-500 block -mt-1">Early Alpha</span>
                </div>
              </Link>

              <div className="hidden md:flex items-center space-x-6">
                <Link
                  href="/"
                  className={`text-sm transition-colors hover:text-orange-500 ${
                    darkMode
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/demo"
                  className={`text-sm font-medium text-orange-500 ${
                    darkMode ? "text-orange-400" : "text-orange-500"
                  }`}
                >
                  Demo
                </Link>
                <Link
                  href="/system"
                  className={`text-sm transition-colors hover:text-orange-500 ${
                    darkMode
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  System
                </Link>
                <Link
                  href="/roadmap"
                  className={`text-sm transition-colors hover:text-orange-500 ${
                    darkMode
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Roadmap
                </Link>
                <Link
                  href="/docs"
                  className={`text-sm transition-colors hover:text-orange-500 ${
                    darkMode
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Docs
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-all ${
                  darkMode
                    ? "bg-gray-800 hover:bg-gray-700 text-yellow-500"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content with higher z-index */}
      <div className="relative z-10 pt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.h1
              className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              🚀 Harvest.ai Content Transformer
            </motion.h1>
            <motion.p
              className="text-lg text-gray-600 dark:text-gray-300 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Transform your raw content into professional, ready-to-use formats
            </motion.p>
            <motion.div
              className="text-sm text-gray-500 dark:text-gray-400"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              💡 <strong>How it works:</strong> Paste any content → Choose format → Get professional
              output
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  🎯 What do you want to create?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {formats.map((format) => (
                    <button
                      key={format.id}
                      onClick={() => setSelectedFormat(format.id as any)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedFormat === format.id
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-orange-300"
                      }`}
                    >
                      <div className="text-2xl mb-2">{format.icon}</div>
                      <div className="font-medium text-gray-900 dark:text-white">{format.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {format.description}
                      </div>
                      <div className="text-xs text-orange-600 dark:text-orange-400">
                        {format.example}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sample Inputs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  🧪 Try with Real Examples
                </label>
                <div className="space-y-3">
                  {sampleInputs.map((sample, index) => (
                    <button
                      key={index}
                      onClick={() => handleSampleSelect(sample)}
                      className="w-full p-4 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:border-orange-300 transition-colors bg-white dark:bg-gray-800"
                    >
                      <div className="font-medium text-gray-900 dark:text-white mb-1">
                        {sample.title}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {sample.content.substring(0, 120)}...
                      </div>
                      <div className="text-xs text-orange-600 dark:text-orange-400">
                        Expected: {sample.expectedOutput}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* API Key Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🔑 Your OpenAI API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-1">
                  <p>• Your API key is used only for generation and never stored</p>
                  <p>
                    • Get your key at{" "}
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      className="text-orange-500 hover:underline"
                    >
                      platform.openai.com
                    </a>
                  </p>
                  <p>• Typical cost: $0.01-$0.10 per generation</p>
                </div>
              </div>

              {/* Content Input */}
              <div>
                <label
                  htmlFor="demo-input-content"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  📝 Your Content (What you have)
                </label>
                <textarea
                  id="demo-input-content"
                  aria-label="Your content"
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  placeholder="Paste your notes, meeting minutes, documentation, or any content you want to transform..."
                  rows={8}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  💡 Works with: meeting notes, product specs, technical docs, research, ideas,
                  outlines, etc.
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                aria-label="Generate content"
                disabled={isGenerating || !inputContent.trim()}
                className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Transforming your content...
                  </div>
                ) : (
                  `✨ Generate ${selectedFormat.charAt(0).toUpperCase() + selectedFormat.slice(1)}`
                )}
              </button>

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="text-red-800 dark:text-red-200 text-sm">❌ {error}</div>
                </div>
              )}
            </motion.div>

            {/* Output Section */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {/* Realtime progress */}
              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Realtime Progress
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {progress}%
                    </span>
                  </div>
                  <div
                    className={`w-full h-2 rounded-full ${darkMode ? "bg-gray-800" : "bg-gray-200"}`}
                  >
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  {streamText && (
                    <div
                      className={`p-3 rounded-md text-sm ${darkMode ? "bg-gray-900 border border-gray-700" : "bg-gray-50 border border-gray-200"}`}
                    >
                      <div
                        className={`font-medium mb-1 ${darkMode ? "text-gray-200" : "text-gray-800"}`}
                      >
                        Streaming Output
                      </div>
                      <pre
                        className={`${darkMode ? "text-gray-300" : "text-gray-700"} whitespace-pre-wrap`}
                      >
                        {streamText}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  🎉 Your Generated Content (What you get)
                </label>

                {result ? (
                  <div className="space-y-4">
                    {/* Result */}
                    <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                      {result.metadata.cached && (
                        <div className="mb-4 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="text-green-800 dark:text-green-200 text-sm flex items-center">
                            <span className="mr-2">⚡</span>
                            <strong>Instant Result:</strong> This content was served from cache for
                            faster performance
                          </div>
                        </div>
                      )}
                      <div className="prose dark:prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white leading-relaxed">
                          {result.result}
                        </pre>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="text-sm text-green-600 dark:text-green-400">
                          Quality Score
                        </div>
                        <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                          {result.quality_score}/100
                        </div>
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="text-sm text-blue-600 dark:text-blue-400">Cost</div>
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                          ${result.cost.estimated_cost.toFixed(4)}
                        </div>
                      </div>
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="text-sm text-purple-600 dark:text-purple-400">
                          Tokens Used
                        </div>
                        <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                          {result.cost.tokens_used.toLocaleString()}
                        </div>
                      </div>
                      <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <div className="text-sm text-orange-600 dark:text-orange-400">Speed</div>
                        <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                          {result.processing_time}ms
                        </div>
                      </div>
                    </div>

                    {/* Export Options */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigator.clipboard.writeText(result.result)}
                        className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                      >
                        📋 Copy to Clipboard
                      </button>
                      <button
                        onClick={() => {
                          const blob = new Blob([result.result], { type: "text/markdown" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `harvest-ai-${selectedFormat}-${Date.now()}.md`;
                          a.click();
                        }}
                        className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                      >
                        💾 Download as Markdown
                      </button>
                    </div>

                    {/* Success Message */}
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="text-green-800 dark:text-green-200 text-sm">
                        ✅ <strong>Success!</strong> Your content has been transformed and is ready
                        to use. You can copy it directly or download as a markdown file.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
                    <div className="text-4xl mb-4">✨</div>
                    <div className="text-gray-600 dark:text-gray-400 mb-2">
                      {isGenerating
                        ? "Transforming your content..."
                        : "Your professional content will appear here"}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-500">
                      {isGenerating
                        ? "This usually takes 5-15 seconds"
                        : "Ready-to-use, formatted content"}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* BYOK Demo Section */}
          <motion.div
            className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                🚀 New: Interactive BYOK Demo Tour
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Experience our Bring Your Own Key features with an interactive guided tour and mock
                data
              </p>
              <Link
                href="/demo/byok"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <span>🔑</span>
                <span>Launch BYOK Demo Tour</span>
                <span>→</span>
              </Link>
            </div>
          </motion.div>

          {/* Footer Info */}
          <motion.div
            className="mt-12 text-center text-sm text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="mb-2">
              💡 <strong>Perfect for:</strong> Content creators, marketers, educators, product
              managers, and anyone who needs to transform raw content into professional formats.
            </p>
            <p>
              🔒 <strong>Privacy first:</strong> Your content and API key are never stored on our
              servers.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
