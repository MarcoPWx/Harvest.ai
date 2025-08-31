"use client";

import { useState, useEffect, useRef } from "react";
import {
  EMERGENCY_TEMPLATES,
  detectEmergencyTemplate,
  fillTemplate,
  getCrisisTimeEstimate,
  isCrisisSituation,
} from "@/lib/templates/emergency";
import type { EmergencyTemplate, TemplateField } from "@/lib/templates/emergency";

/**
 * Panic Mode - Our North Star Experience
 * Goal: From crisis to relief in under 90 seconds
 */
export default function PanicMode() {
  const [input, setInput] = useState("");
  const [detectedTemplate, setDetectedTemplate] = useState<EmergencyTemplate | null>(null);
  const [templateValues, setTemplateValues] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState("");
  const [timeEstimate, setTimeEstimate] = useState({
    fillTime: 30,
    generateTime: 30,
    totalTime: 60,
  });
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Track TTFUO (Time To First Useful Output)
  useEffect(() => {
    // Record landing time
    const landingTime = Date.now();
    localStorage.setItem("panic_landing_time", landingTime.toString());

    // Focus input immediately
    inputRef.current?.focus();

    // Check if returning crisis user
    const lastPanicVisit = localStorage.getItem("last_panic_visit");
    if (lastPanicVisit) {
      const daysSince = (Date.now() - parseInt(lastPanicVisit)) / (1000 * 60 * 60 * 24);
      if (daysSince < 30) {
        // Returning crisis user - track for North Star metric
        localStorage.setItem("crisis_return", "true");
      }
    }
    localStorage.setItem("last_panic_visit", Date.now().toString());
  }, []);

  // Detect crisis template as user types
  useEffect(() => {
    if (input.length > 10) {
      const template = detectEmergencyTemplate(input);
      setDetectedTemplate(template);

      if (template) {
        const estimate = getCrisisTimeEstimate(template);
        setTimeEstimate(estimate);

        // Pre-fill any obvious values
        const newValues: Record<string, string> = {};
        template.fields.forEach((field) => {
          if (field.defaultValue) {
            newValues[field.key] = field.defaultValue;
          }
        });
        setTemplateValues(newValues);
      }
    }
  }, [input]);

  // Track elapsed time
  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStartTime(Date.now());

    try {
      let finalOutput = input;

      // If template detected, use it
      if (detectedTemplate) {
        finalOutput = fillTemplate(detectedTemplate.template, templateValues);
      }

      // Call generate API (with SSE for real-time feedback)
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/event-stream",
        },
        body: JSON.stringify({
          input: finalOutput,
          format: detectedTemplate?.format || "email",
          provider: "mock", // Use fastest provider in crisis
        }),
      });

      if (response.headers.get("content-type")?.includes("text/event-stream")) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.event === "token") {
                    setOutput((prev) => prev + data.data.text);
                  } else if (data.event === "final") {
                    setOutput(data.data.result);

                    // Track TTFUO success
                    const landingTime = parseInt(localStorage.getItem("panic_landing_time") || "0");
                    const ttfuo = Date.now() - landingTime;
                    localStorage.setItem("last_ttfuo", ttfuo.toString());

                    // Show success if under 90 seconds
                    if (ttfuo < 90000) {
                      console.log(`✅ North Star achieved! TTFUO: ${Math.floor(ttfuo / 1000)}s`);
                    }
                  }
                } catch (e) {
                  // Skip parse errors
                }
              }
            }
          }
        }
      } else {
        // JSON fallback
        const data = await response.json();
        setOutput(data.result || data.error || "Generation failed");
      }
    } catch (error) {
      setOutput("Error: Unable to generate. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    setTemplateValues((prev) => ({ ...prev, [key]: value }));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    // Track export (trust metric)
    localStorage.setItem("last_export", Date.now().toString());
  };

  const downloadOutput = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${detectedTemplate?.id || "output"}_${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    // Track export (trust metric)
    localStorage.setItem("last_export", Date.now().toString());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-900/10 dark:to-orange-900/10">
      {/* Crisis Header - Minimal, focused */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🚨 Panic Mode</h1>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {elapsedTime > 0 && `${elapsedTime}s elapsed`}
          </div>
        </div>

        {/* Time estimate */}
        {detectedTemplate && !isGenerating && !output && (
          <div className="mt-2 text-sm text-orange-600 dark:text-orange-400">
            ⏱️ Estimated time: {timeEstimate.totalTime} seconds
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        {!output ? (
          <>
            {/* Crisis Input */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                What's the emergency? (Just type naturally)
              </label>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g., 'I need to resign tomorrow' or 'urgent apology for missing deadline'"
                className="w-full h-32 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isGenerating}
                autoFocus
              />
            </div>

            {/* Template Fields (if detected) */}
            {detectedTemplate && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">
                  ✅ Template detected: {detectedTemplate.name}
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-400 mb-4">
                  {detectedTemplate.description}
                </p>

                <div className="space-y-3">
                  {detectedTemplate.fields.map((field: TemplateField) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.type === "select" ? (
                        <select
                          value={templateValues[field.key] || ""}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="">Select...</option>
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : field.type === "textarea" ? (
                        <textarea
                          value={templateValues[field.key] || ""}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full h-20 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      ) : (
                        <input
                          type={field.type}
                          value={templateValues[field.key] || ""}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generate Button - Big and obvious */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !input.trim()}
              className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold text-lg rounded-lg transition-colors"
            >
              {isGenerating ? "⏳ Generating..." : "🚀 Generate Now"}
            </button>

            {/* Trust indicators */}
            <div className="mt-4 flex justify-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <span>✅ No signup required</span>
              <span>🔒 Your data stays yours</span>
              <span>⚡ Under 90 seconds</span>
            </div>
          </>
        ) : (
          /* Output Display */
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                ✅ Done in {elapsedTime} seconds!
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  📋 Copy
                </button>
                <button
                  onClick={downloadOutput}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  💾 Download
                </button>
                <button
                  onClick={() => {
                    setOutput("");
                    setInput("");
                    setDetectedTemplate(null);
                    setTemplateValues({});
                    setElapsedTime(0);
                    setStartTime(null);
                    inputRef.current?.focus();
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                >
                  🔄 New Crisis
                </button>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200">
                {output}
              </pre>
            </div>

            {/* North Star Achievement */}
            {elapsedTime <= 90 && (
              <div className="mt-6 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg text-center">
                <p className="text-green-800 dark:text-green-300 font-semibold">
                  🎯 North Star Achieved! Generated in under 90 seconds.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
