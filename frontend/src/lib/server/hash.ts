import crypto from "node:crypto";

export function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function requestHash(obj: any): string {
  const s = JSON.stringify(obj, Object.keys(obj).sort());
  return sha256(s);
}
