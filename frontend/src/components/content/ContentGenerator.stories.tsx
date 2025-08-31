import type { Meta, StoryObj } from "@storybook/react";
import { ContentGenerator } from "./ContentGenerator";
import { within, userEvent } from "@storybook/testing-library";
import { expect } from "@storybook/jest";

const meta = {
  title: "Harvest.ai/Content/ContentGenerator",
  component: ContentGenerator,
  parameters: {
    layout: "fullscreen",
    repoDocPath: "/docs/architecture/GENERATION_FLOW.md",
    repoDocLabel: "Generation Flow & AI Gateway",
    docs: {
      description: {
        component:
          "The main content generation interface for Harvest.ai. Supports multiple formats and AI models.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    defaultFormat: {
      control: "select",
      options: ["blog", "email", "summary", "presentation", "social"],
      description: "Default content format",
    },
    defaultModel: {
      control: "select",
      options: ["gpt-4", "gpt-3.5-turbo", "claude-3-opus", "claude-3-sonnet"],
      description: "Default AI model",
    },
    maxLength: {
      control: { type: "range", min: 100, max: 5000, step: 100 },
      description: "Maximum content length",
    },
  },
} satisfies Meta<typeof ContentGenerator>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    defaultFormat: "blog",
    defaultModel: "gpt-4",
    maxLength: 1000,
  },
};

// Blog post generation story
export const BlogPost: Story = {
  args: {
    defaultFormat: "blog",
    defaultModel: "gpt-4",
    maxLength: 1500,
    initialContent: "The future of renewable energy and sustainable technology",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for component to render
    const formatSelector = await canvas.findByRole("combobox", { name: /format/i });
    expect(formatSelector).toHaveValue("blog");

    // Enter content
    const textarea = canvas.getByRole("textbox", { name: /content/i });
    await userEvent.clear(textarea);
    await userEvent.type(textarea, "The future of renewable energy");

    // Click generate button
    const generateButton = canvas.getByRole("button", { name: /generate/i });
    await userEvent.click(generateButton);
  },
};

// Email generation story
export const Email: Story = {
  args: {
    defaultFormat: "email",
    defaultModel: "gpt-3.5-turbo",
    maxLength: 500,
    initialContent: "Professional follow-up after client meeting",
  },
};

// Summary generation story
export const Summary: Story = {
  args: {
    defaultFormat: "summary",
    defaultModel: "claude-3-sonnet",
    maxLength: 300,
    initialContent: "Long article about artificial intelligence developments...",
  },
};

// Social media post story
export const SocialMedia: Story = {
  args: {
    defaultFormat: "social",
    defaultModel: "gpt-3.5-turbo",
    maxLength: 280,
    initialContent: "New product launch announcement",
  },
};

// Loading state story
export const Loading: Story = {
  args: {
    defaultFormat: "blog",
    isLoading: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Shows the loading state during content generation",
      },
    },
  },
};

// Error state story
export const Error: Story = {
  args: {
    defaultFormat: "blog",
    error: "API rate limit exceeded. Please try again later.",
  },
  parameters: {
    docs: {
      description: {
        story: "Shows error handling when generation fails",
      },
    },
  },
};

// Pro features story
export const ProFeatures: Story = {
  args: {
    defaultFormat: "blog",
    defaultModel: "gpt-4",
    isPro: true,
    maxLength: 5000,
  },
  parameters: {
    docs: {
      description: {
        story: "Shows additional features available for Pro users",
      },
    },
  },
};

// Mobile responsive story
export const Mobile: Story = {
  args: {
    defaultFormat: "blog",
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story: "Mobile responsive view of the content generator",
      },
    },
  },
};

// Dark mode story
export const DarkMode: Story = {
  args: {
    defaultFormat: "blog",
  },
  parameters: {
    backgrounds: {
      default: "dark",
    },
    docs: {
      description: {
        story: "Content generator in dark mode",
      },
    },
  },
};
