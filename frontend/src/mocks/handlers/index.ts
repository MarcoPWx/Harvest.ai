import { authHandlers } from "./auth";
import { generationHandlers } from "./generation";
import { userHandlers } from "./user";
import { templateHandlers, teamHandlers } from "./templates";
import { debugHandlers } from "./debug";
import { localMemoryHandlers } from "./localMemory";

// Combine all handlers
export const handlers = [
  ...authHandlers,
  ...generationHandlers,
  ...userHandlers,
  ...templateHandlers,
  ...teamHandlers,
  ...debugHandlers,
  ...localMemoryHandlers,
];
