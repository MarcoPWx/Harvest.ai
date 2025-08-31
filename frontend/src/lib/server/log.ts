type LogFields = Record<string, unknown>;

const ENABLED = process.env.OBS_LOGS_ON === "1" || process.env.NEXT_PUBLIC_OBS_LOGS_ON === "1";

function write(level: "info" | "error", event: string, fields: LogFields = {}) {
  if (!ENABLED) return;
  try {
    const line = JSON.stringify({ level, event, t: new Date().toISOString(), ...fields }) + "\n";
    if (level === "error") {
      // Prefer stderr for errors to keep separation in logs
      // process.stderr is allowed under strict no-console rules
      process.stderr.write(line);
    } else {
      process.stdout.write(line);
    }
  } catch {
    // ignore logging errors
  }
}

export function logInfo(event: string, fields: LogFields = {}) {
  write("info", event, fields);
}

export function logError(event: string, fields: LogFields = {}) {
  write("error", event, fields);
}
