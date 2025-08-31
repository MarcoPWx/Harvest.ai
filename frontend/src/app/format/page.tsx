"use client";

import { useState, useRef } from "react";
// Define locally to avoid importing server code into a client component
export type FormatType = "blog" | "email" | "summary" | "presentation";

export default function FormatPage() {
  const E2E_MODE =
    process.env.NEXT_PUBLIC_E2E === "1" || process.env.NEXT_PUBLIC_ENABLE_MSW === "1";

  const [content, setContent] = useState(E2E_MODE ? "E2E default input" : "");
  const [outputFormat, setOutputFormat] = useState<FormatType>("blog");
  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const [formatted, setFormatted] = useState("");
  const [cost, setCost] = useState("");
  const [quality, setQuality] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatContent = async () => {
    setLoading(true);
    setError("");

    const current = content;

    try {
      if (E2E_MODE) {
        // Deterministic local mock to stabilize E2E without relying on network
        await new Promise((r) => setTimeout(r, 200));
        let mock = "";
        if (outputFormat === "email") {
          mock = `Subject: Update on ${current.slice(0, 24)}\n\nDear Team,\n\n${current}\n\nBest,\nHarvest.ai`;
        } else if (outputFormat === "blog") {
          mock = `# ${current.slice(0, 40) || "Blog"}\n\n## Introduction\n${current}\n\n## Conclusion\nThanks for reading.`;
        } else if (outputFormat === "summary") {
          mock = `## Summary\n\n- ${current.slice(0, 40)}...\n- Key point 1\n- Key point 2`;
        } else if (outputFormat === "presentation") {
          mock = `# ${current.slice(0, 24) || "Presentation"}\n\n---\nSlide 1: Intro\n---\nSlide 2: Details`;
        }
        setFormatted(mock);
        setCost("$0.012");
        setQuality(8.8);
        return;
      }

      const response = await fetch("/api/format", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: current,
          outputFormat,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to format content");
      }

      const data = await response.json();
      setFormatted(data.formatted);
      setCost(data.cost);
      setQuality(data.quality);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Format Your Content</h1>
          <p className="mt-2 text-lg text-gray-600">
            Transform messy notes into polished, professional formats
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Input</h2>

            {/* Format Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Output Format</label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as FormatType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="blog">Blog Post</option>
                <option value="email">Email</option>
                <option value="summary">Summary</option>
                <option value="presentation">Presentation</option>
              </select>
            </div>

            {/* Content Input */}
            <div className="mb-4">
              <label htmlFor="format-content-input" className="block text-sm font-medium text-gray-700 mb-2">Your Content</label>
              <textarea
                id="format-content-input"
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your notes, ideas, or any text here..."
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">{content.length} / 10,000 characters</p>
            </div>

            {/* Format Button */}
            <button
              onClick={formatContent}
              disabled={!content || loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Formatting..." : `Format as ${outputFormat}`}
            </button>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Output</h2>

            {/* Metrics */}
            {cost && (
              <div className="mb-4 flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-md">
                <div>
                  <span className="text-sm font-medium text-gray-700">Cost: </span>
                  <span className="text-lg font-bold text-green-600">{cost}</span>
                </div>
                {quality !== null && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Quality: </span>
                    <span className="text-lg font-bold text-blue-600">{quality.toFixed(1)}/10</span>
                  </div>
                )}
              </div>
            )}

            {/* Formatted Content */}
            <div className="prose prose-sm max-w-none">
              {formatted ? (
                <div className="bg-gray-50 p-4 rounded-md">
                  <pre data-testid="formatted-output" className="whitespace-pre-wrap text-sm">{formatted}</pre>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="mt-2">Your formatted content will appear here</p>
                </div>
              )}
            </div>

            {/* Copy Button */}
              {formatted && (
              <button
                data-testid="copy-formatted"
                onClick={() => {
                  navigator.clipboard.writeText(formatted);
                  alert("Copied to clipboard!");
                }}
                className="mt-4 w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
              >
                Copy to Clipboard
              </button>
            )}
          </div>
        </div>

        {/* Example Templates */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Examples</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                setContent(
                  "Team meeting update: We discussed the Q4 roadmap. Main priorities are launching the new feature, improving customer support response times, and preparing for the holiday season traffic. John will lead feature development, Sarah handles support training, and Mike manages infrastructure scaling.",
                );
                setOutputFormat("email");
              }}
              className="text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50"
            >
              <h4 className="font-medium">Meeting Notes → Email</h4>
              <p className="text-sm text-gray-600">Turn meeting notes into a professional email</p>
            </button>

            <button
              onClick={() => {
                setContent(
                  "Product launch successful. 10,000 signups first week. Revenue up 25%. Customer satisfaction at 4.8/5. Minor bugs fixed. Mobile app next quarter. Team celebrated with dinner. Need to hire 2 more engineers. Marketing campaign performing above expectations.",
                );
                setOutputFormat("blog");
              }}
              className="text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50"
            >
              <h4 className="font-medium">Bullet Points → Blog</h4>
              <p className="text-sm text-gray-600">Transform notes into a blog post</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
