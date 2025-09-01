// Shared thread store for development
// In production, this would be replaced with a database

export const threadStore = new Map<
  string,
  {
    created_at: string;
    title?: string;
    messages: Array<{ role: "user" | "assistant"; content: string; at: string }>;
  }
>();

export function getThreadStore() {
  return threadStore;
}
