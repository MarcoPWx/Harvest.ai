import type { StorybookConfig } from "@storybook/nextjs-vite";
import fs from "node:fs";
import path from "node:path";

const staticDirs: any[] = ["../public", { from: "../docs", to: "/docs" }];

// Optionally include local coverage and Playwright report folders if present
try {
  const cov = path.resolve(__dirname, "../coverage");
  if (fs.existsSync(cov)) staticDirs.push("../coverage");
} catch {}
try {
  const pwr = path.resolve(__dirname, "../playwright-report");
  if (fs.existsSync(pwr)) staticDirs.push("../playwright-report");
} catch {}

const config: StorybookConfig = {
  stories: [
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    // Curated MDX docs that are SB9-compatible
    "../src/stories/DocsHome.docs.mdx",
    "../src/stories/Playgrounds.docs.mdx",
    "../src/stories/APIPlayground.docs.mdx",
    "../src/stories/RemoteConfig.docs.mdx",
    "../src/stories/SecurityTrustPlan.docs.mdx",
    "../src/stories/DebugAPI.docs.mdx",
    "../src/stories/TechStack.docs.mdx",
    "../src/stories/TechnologyOverviewLab.docs.mdx",
    "../src/stories/CommandCenterDevlog.docs.mdx",
    "../src/stories/CommandCenterEpicsManager.docs.mdx",
    "../src/stories/Lab/FirstInteractionJourneyS2S.docs.mdx",
    "../src/stories/LocalMemoryAPI.docs.mdx",
    // New Journeys & S2S indices
    "../src/stories/Journeys/Index.docs.mdx",
    "../src/stories/Journeys/TDD-MSW.docs.mdx",
    "../src/stories/S2S/Index.docs.mdx",

    // New Tests dashboards
    "../src/stories/Tests/UnitStatus.docs.mdx",
    "../src/stories/Tests/E2EStatus.docs.mdx",

    // New Labs bundle
    "../src/stories/Labs/Index.docs.mdx",
    "../src/stories/Labs/AIServiceLab.docs.mdx",
    "../src/stories/Labs/E2ESmokeLab.docs.mdx",
    "../src/stories/Labs/AuthLab.docs.mdx",
    "../src/stories/Labs/LocalMemoryLab.docs.mdx",
    "../src/stories/Labs/ProviderAdaptersLab.docs.mdx",
    "../src/stories/Labs/SecurityLab.docs.mdx",
    "../src/stories/Labs/AgentShowcase.docs.mdx",
  ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
  ],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {
      builder: {
        viteConfigPath: undefined,
      },
    },
  },
  docs: {
    autodocs: "tag",
    defaultName: "Documentation",
  },
  typescript: {
    reactDocgen: "react-docgen-typescript",
  },
  viteFinal: async (config) => {
    // Storybook already sets up MDX handling; avoid double-registering MDX plugins
    config.plugins = config.plugins || [];

    // Add support for analyzer if requested
    if (process.env.ANALYZE) {
      try {
        const { visualizer } = await import("vite-plugin-visualizer");
        // @ts-expect-error - Vite config typing allows plugin arrays
        config.plugins = [
          ...(config.plugins || []),
          visualizer({
            filename: "storybook-visualizer.html",
            template: "treemap",
            gzipSize: true,
            brotliSize: true,
            open: false,
          }),
        ];
      } catch (e) {
        console.warn(
          "[storybook] ANALYZE=1 set but vite-plugin-visualizer not installed. Run: npm i -D vite-plugin-visualizer",
        );
      }
    }

    // Optional manual chunking for vendor splitting; enable via SPLIT_CHUNKS=1
    if (process.env.SPLIT_CHUNKS) {
      // @ts-expect-error - Storybook passes a Vite config; we can extend build options
      config.build = config.build || {};
      // @ts-expect-error - rollupOptions is permitted on build
      config.build.rollupOptions = config.build.rollupOptions || {};
      const output = Array.isArray(config.build.rollupOptions.output)
        ? config.build.rollupOptions.output[0] || {}
        : config.build.rollupOptions.output || {};
      const manualChunks =
        output && typeof output === "object" && "manualChunks" in output
          ? output.manualChunks
          : undefined;
      // @ts-expect-error - assign output back
      config.build.rollupOptions.output = {
        ...output,
        manualChunks:
          manualChunks ||
          ((id) => {
            if (!id.includes("node_modules")) return;
            if (id.includes("react")) return "vendor-react";
            if (id.includes("lucide-react")) return "vendor-lucide";
            if (id.includes("framer-motion")) return "vendor-motion";
            if (id.includes("@radix-ui")) return "vendor-radix";
            if (id.includes("swagger-ui-react")) return "vendor-swagger";
          }),
      };
    }

    // Allow serving Storybook under a subpath (e.g., /storybook) by setting SB_BASE
    // Vite respects the 'base' path at build time
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    config.base = process.env.SB_BASE || config.base;

    // Additional MDX configuration
    config.optimizeDeps = config.optimizeDeps || {};
    config.optimizeDeps.include = [
      ...(config.optimizeDeps.include || []),
      "@storybook/blocks",
      "@mdx-js/react",
    ];
    config.optimizeDeps.exclude = [...(config.optimizeDeps.exclude || []), "@storybook/addon-docs"];

    return config;
  },
  staticDirs: staticDirs,
};
export default config;
