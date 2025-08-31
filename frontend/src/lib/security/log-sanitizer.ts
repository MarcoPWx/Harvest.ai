/**
 * Log Sanitizer Utility
 * Removes sensitive information from logs
 */

/**
 * Sanitize sensitive data from logs
 * Redacts API keys, tokens, and other sensitive information
 */
export function sanitizeForLogs(data: any): any {
  if (typeof data === "string") {
    // Redact API keys and tokens
    return data
      .replace(/sk-[a-zA-Z0-9]{20,}/g, "sk-[REDACTED]")
      .replace(/Bearer\s+[a-zA-Z0-9\-._~+\/]+=*/g, "Bearer [REDACTED]")
      .replace(/api[_-]?key["\s:=]+["']?[a-zA-Z0-9\-._~+\/]+["']?/gi, "api_key: [REDACTED]")
      .replace(/token["\s:=]+["']?[a-zA-Z0-9\-._~+\/]+["']?/gi, "token: [REDACTED]")
      .replace(/password["\s:=]+["']?[^"'\s]+["']?/gi, "password: [REDACTED]")
      .replace(/secret["\s:=]+["']?[^"'\s]+["']?/gi, "secret: [REDACTED]");
  }

  if (typeof data === "object" && data !== null) {
    if (Array.isArray(data)) {
      return data.map((item) => sanitizeForLogs(item));
    }

    const sanitized: any = {};
    const sensitiveKeys = [
      "apiKey",
      "api_key",
      "token",
      "secret",
      "password",
      "authorization",
      "auth",
    ];

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
        sanitized[key] = "[REDACTED]";
      } else {
        sanitized[key] = sanitizeForLogs(value);
      }
    }

    return sanitized;
  }

  return data;
}

/**
 * Create a safe logger that automatically sanitizes output
 */
export function createSafeLogger(logger: Console = console) {
  return {
    log: (...args: any[]) => logger.log(...args.map(sanitizeForLogs)),
    info: (...args: any[]) => logger.info(...args.map(sanitizeForLogs)),
    warn: (...args: any[]) => logger.warn(...args.map(sanitizeForLogs)),
    error: (...args: any[]) => logger.error(...args.map(sanitizeForLogs)),
    debug: (...args: any[]) => logger.debug(...args.map(sanitizeForLogs)),
  };
}

export default sanitizeForLogs;
