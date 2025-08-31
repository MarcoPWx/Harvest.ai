import type { Meta, StoryObj } from "@storybook/react";
import EcosystemWidget from "./EcosystemWidget";
import { EcosystemWidgetProps } from "./types";

const meta = {
  title: "Components/EcosystemWidget",
  component: EcosystemWidget,
  parameters: {
    layout: "fullscreen",
    repoDocPath: "/docs/TECH_STACK_CHEATSHEET.md",
    repoDocLabel: "Tech Stack Cheat Sheet",
    docs: {
      description: {
        component:
          "The EcosystemWidget displays the NatureQuest ecosystem of products with different user tiers and positioning options.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    currentProduct: {
      control: "select",
      options: ["devmentor", "quizmentor", "harvest", "omni"],
      description: "The current product being used",
    },
    position: {
      control: "select",
      options: ["bottom-right", "bottom-left", "top-right", "top-left"],
      description: "Widget position on screen",
    },
    userTier: {
      control: "select",
      options: ["free", "pro", "team", "enterprise"],
      description: "User subscription tier",
    },
    theme: {
      control: "select",
      options: ["dark", "light"],
      description: "Widget theme",
    },
    onProductClick: {
      action: "product-clicked",
      description: "Callback when a product is clicked",
    },
  },
} satisfies Meta<typeof EcosystemWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

// Base story with free tier
export const FreeUser: Story = {
  args: {
    currentProduct: "harvest",
    position: "bottom-right",
    userTier: "free",
    theme: "dark",
  },
  parameters: {
    docs: {
      description: {
        story: "Free tier user sees locked products and upgrade prompts.",
      },
    },
  },
};

// Pro user with all features unlocked
export const ProUser: Story = {
  args: {
    currentProduct: "harvest",
    position: "bottom-right",
    userTier: "pro",
    theme: "dark",
  },
  parameters: {
    docs: {
      description: {
        story: "Pro tier user has access to all products.",
      },
    },
  },
};

// Light theme variant
export const LightTheme: Story = {
  args: {
    currentProduct: "harvest",
    position: "bottom-right",
    userTier: "free",
    theme: "light",
  },
  parameters: {
    docs: {
      description: {
        story: "Widget with light theme styling.",
      },
    },
  },
};

// Different positioning options
export const TopLeft: Story = {
  args: {
    currentProduct: "harvest",
    position: "top-left",
    userTier: "pro",
    theme: "dark",
  },
  parameters: {
    docs: {
      description: {
        story: "Widget positioned at top-left of screen.",
      },
    },
  },
};

export const TopRight: Story = {
  args: {
    currentProduct: "harvest",
    position: "top-right",
    userTier: "pro",
    theme: "dark",
  },
  parameters: {
    docs: {
      description: {
        story: "Widget positioned at top-right of screen.",
      },
    },
  },
};

export const BottomLeft: Story = {
  args: {
    currentProduct: "harvest",
    position: "bottom-left",
    userTier: "pro",
    theme: "dark",
  },
  parameters: {
    docs: {
      description: {
        story: "Widget positioned at bottom-left of screen.",
      },
    },
  },
};

// Different current products
export const FromDevMentor: Story = {
  args: {
    currentProduct: "devmentor",
    position: "bottom-right",
    userTier: "pro",
    theme: "dark",
  },
  parameters: {
    docs: {
      description: {
        story: "Widget viewed from DevMentor product showing other available products.",
      },
    },
  },
};

export const FromQuizMentor: Story = {
  args: {
    currentProduct: "quizmentor",
    position: "bottom-right",
    userTier: "free",
    theme: "dark",
  },
  parameters: {
    docs: {
      description: {
        story: "Widget viewed from QuizMentor showing locked premium products.",
      },
    },
  },
};

// Team tier user
export const TeamUser: Story = {
  args: {
    currentProduct: "harvest",
    position: "bottom-right",
    userTier: "team",
    theme: "dark",
  },
  parameters: {
    docs: {
      description: {
        story: "Team tier user with full access to ecosystem.",
      },
    },
  },
};

// Enterprise tier user
export const EnterpriseUser: Story = {
  args: {
    currentProduct: "harvest",
    position: "bottom-right",
    userTier: "enterprise",
    theme: "dark",
  },
  parameters: {
    docs: {
      description: {
        story: "Enterprise tier user with complete ecosystem access.",
      },
    },
  },
};

// Interactive playground
export const Playground: Story = {
  args: {
    currentProduct: "harvest",
    position: "bottom-right",
    userTier: "free",
    theme: "dark",
  },
  parameters: {
    docs: {
      description: {
        story: "Interactive playground to test all widget configurations.",
      },
    },
  },
};
