export function sanitizeForLogs(obj: any) {
  try {
    return JSON.stringify(obj, (_k, v) => {
      if (typeof v === "string" && /sk-[A-Za-z0-9_-]{10,}/.test(v)) return "***REDACTED***";
      if (typeof v === "string" && /xox[baprs]-[A-Za-z0-9-]+/.test(v)) return "***REDACTED***"; // example other tokens
      return v;
    });
  } catch {
    return "[UNSERIALIZABLE]";
  }
}
