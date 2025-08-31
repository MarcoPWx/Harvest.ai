import type { Meta, StoryObj } from "@storybook/react";
import Footer from "./Footer";

const meta = {
  title: "Components/Footer",
  component: Footer,
  parameters: {
    layout: "fullscreen",
    repoDocPath: "/docs/README.md",
    repoDocLabel: "Docs README",
    docs: {
      description: {
        component:
          "The Footer component displays brand information, quick links, and status information. Supports both dark and light themes.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    darkMode: {
      control: "boolean",
      description: "Toggle between dark and light theme",
    },
  },
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default light mode footer
export const LightMode: Story = {
  args: {
    darkMode: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Footer in light mode with clean white background and dark text.",
      },
    },
    backgrounds: {
      default: "light",
    },
  },
};

// Dark mode footer
export const DarkMode: Story = {
  args: {
    darkMode: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Footer in dark mode with dark background and light text.",
      },
    },
    backgrounds: {
      default: "dark",
    },
  },
};

// Footer with custom background to show contrast
export const OnColoredBackground: Story = {
  args: {
    darkMode: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Footer displayed on a colored background to demonstrate contrast and readability.",
      },
    },
    backgrounds: {
      default: "twitter",
      values: [
        { name: "twitter", value: "#1da1f2" },
        { name: "facebook", value: "#4267b2" },
        { name: "gradient", value: "linear-gradient(45deg, #ff6b6b, #4ecdc4)" },
      ],
    },
  },
};

// Dark footer on colored background
export const DarkOnColoredBackground: Story = {
  args: {
    darkMode: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Dark footer on colored background showing theme flexibility.",
      },
    },
    backgrounds: {
      default: "gradient",
      values: [
        { name: "gradient", value: "linear-gradient(45deg, #667eea, #764ba2)" },
        { name: "purple", value: "#8b5cf6" },
        { name: "green", value: "#10b981" },
      ],
    },
  },
};

// Interactive playground
export const Playground: Story = {
  args: {
    darkMode: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Interactive playground to test footer with different theme settings.",
      },
    },
  },
};
