import type { Preview } from "@storybook/nextjs-vite";
import "../src/app/globals.css";

import { handlers } from "../src/mocks/handlers";
import { initialize, mswDecorator } from "msw-storybook-addon";
import { repoDocDecorator } from "./repoDocDecorator";
import { presenterGuideDecorator } from "./presenterGuideDecorator";
import { mswInfoDecorator } from "./mswInfoDecorator";
import { labsHintDecorator } from "./labsHintDecorator";
import { testsInfoDecorator } from "./testsInfoDecorator";
import { tourWatermarkDecorator } from "./tourWatermarkDecorator";

// Initialize MSW for Storybook
initialize({ onUnhandledRequest: "bypass" });

const preview: Preview = {
  decorators: [
    repoDocDecorator,
    labsHintDecorator,
    presenterGuideDecorator,
    tourWatermarkDecorator,
    mswInfoDecorator,
    testsInfoDecorator,
    mswDecorator,
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },

    msw: {
      // Provide default handlers so stories have API mocks by default
      handlers,
    },
  },
  globalTypes: {
    presenterGuide: {
      name: "Presenter",
      description: "Toggle Presenter Guide overlay and jump to Labs/Index",
      defaultValue: false,
      toolbar: {
        icon: "book",
        title: "Presenter Guide",
      },
    },
    presenterAuto: {
      name: "Presenter Auto",
      description: "Auto-advance Presenter steps",
      defaultValue: "off",
      toolbar: {
        icon: "timer",
        title: "Auto",
        items: [
          { value: "off", title: "Auto: Off" },
          { value: "on", title: "Auto: On" },
        ],
      },
    },
    presenterAutoSec: {
      name: "Auto Seconds",
      description: "Seconds between Presenter steps (when Auto is On)",
      defaultValue: 30,
      toolbar: {
        icon: "clock",
        title: "Secs",
        items: [
          { value: 15, title: "15s" },
          { value: 30, title: "30s" },
          { value: 60, title: "60s" },
        ],
      },
    },
    mswInfo: {
      name: "MSW",
      description: "Mock Service Worker info overlay",
      defaultValue: "closed",
      toolbar: {
        icon: "plug",
        title: "MSW",
        items: [
          { value: "closed", title: "MSW: On" },
          { value: "open", title: "MSW Info" },
        ],
        showName: true,
      },
    },
    testsInfo: {
      name: "Tests",
      description: "Unit & E2E test artifacts and links",
      defaultValue: "closed",
      toolbar: {
        icon: "check",
        title: "Tests",
        items: [
          { value: "closed", title: "Tests" },
          { value: "open", title: "Tests Info" },
        ],
        showName: true,
      },
    },
  },
};

export default preview;
