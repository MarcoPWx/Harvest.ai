"use client";

import { useRef, useState } from "react";
import { useSSEStream } from "@/lib/client/useSSEStream";

export default function ThreadsPlaygroundPage() {
  const [threadId, setThreadId] = useState("");
  const [message, setMessage] = useState("Refine this to be more concise and action-oriented.");
  const [provider, setProvider] = useState("mock");
  const [streaming, setStreaming] = useState(false);
  const [transcript, setTranscript] = useState<Array<{ role: string; content: string }>>([]);
  const [threads, setThreads] = useState<
    Array<{ id: string; created_at: string; title?: string; size: number }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const { start: stream, abort: cancel } = useSSEStream();

  async function createThread() {
    setError(null);
    const r = await fetch("/api/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Playground" }),
    });
    const j = await r.json().catch(() => null);
    if (j?.thread_id) setThreadId(j.thread_id);
  }

  async function loadThreads() {
    setError(null);
    const r = await fetch("/api/threads");
    const j = await r.json().catch(() => null);
    if (j?.data) setThreads(j.data);
  }

  async function sendMessageSSE() {
    if (!threadId) return;
    setError(null);
    setStreaming(true);
    setTranscript((prev) => [...prev, { role: "user", content: message }]);
    try {
      const reqId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2, 10);
      await stream(
        `/api/threads/${encodeURIComponent(threadId)}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "text/event-stream",
            "X-Request-ID": reqId,
          },
          body: JSON.stringify({ role: "user", content: message, provider }),
        },
        (e) => {
          if (e.event === "final" && e.data?.content) {
            setTranscript((prev) => [...prev, { role: "assistant", content: e.data.content }]);
          }
        },
      );
    } catch (e) {
      setError(String(e));
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold">Threads Playground</h1>
        <p className="text-gray-600">
          Create a thread, send a message, and stream the assistant reply. Also list existing
          threads.
        </p>

        {error && (
          <div className="p-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={createThread}
            disabled={!!threadId}
            className="bg-gray-900 text-white px-3 py-2 rounded"
          >
            Create thread
          </button>
          <button onClick={loadThreads} className="bg-gray-200 px-3 py-2 rounded">
            Load threads
          </button>
          <span className="text-sm text-gray-600">
            {threadId ? `thread: ${threadId}` : "no thread yet"}
          </span>
        </div>

        {!!threads.length && (
          <div>
            <div className="font-semibold mb-1">Existing Threads</div>
            <div className="bg-white border rounded p-2 max-h-[160px] overflow-auto text-sm">
              {threads.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-1">
                  <span>{t.id}</span>
                  <span className="text-gray-500">{t.size} msgs</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium">Provider (stub)</label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="border rounded p-2 w-full max-w-xs"
          >
            {["mock", "openai", "anthropic", "gemini"].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <label className="block text-sm font-medium" htmlFor="threads-message">
            Message
          </label>
          <textarea
            id="threads-message"
            aria-label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border rounded p-2 w-full min-h-[100px]"
          />
          <div className="flex gap-2">
            <button
              onClick={sendMessageSSE}
              disabled={!threadId || streaming}
              className="bg-blue-600 text-white px-3 py-2 rounded"
            >
              Send & Stream
            </button>
            <button
              onClick={() => {
                cancel();
                setStreaming(false);
              }}
              disabled={!streaming}
              className="bg-gray-200 px-3 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>

        {!!transcript.length && (
          <div>
            <div className="font-semibold mb-1">Transcript</div>
            <div className="grid gap-2">
              {transcript.map((m, i) => (
                <div
                  key={i}
                  className={`border rounded p-2 ${m.role === "assistant" ? "bg-white" : "bg-gray-100"}`}
                >
                  <div className="text-xs text-gray-500">{m.role}</div>
                  <div className="whitespace-pre-wrap text-sm">{m.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
