import type { Meta, StoryObj } from "@storybook/react";
import BYOKDemoPage from "@/app/demo/byok/page";

const meta = {
  title: "Demo/BYOK Demo Experience",
  component: BYOKDemoPage,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
## BYOK Demo Experience

An interactive demo showcasing Bring Your Own Key (BYOK) functionality with:

### Features
- 🚀 **Interactive Tour**: Guided walkthrough of BYOK features
- 🔑 **Session Management**: Mock API key sessions with realistic data
- 📊 **Analytics Dashboard**: Usage metrics and cost tracking
- 🤖 **Multi-Provider Support**: OpenAI, Anthropic, Google, Azure, and more
- 🛡️ **Security First**: Demonstrates session-based, zero-storage approach

### Tour Steps
1. **Welcome**: Introduction to Harvest.ai
2. **BYOK Overview**: Explanation of key management
3. **Security Features**: Zero-storage, session-based approach
4. **Provider Selection**: Multiple AI provider options
5. **Analytics**: Usage tracking and cost management
6. **Demo Mode**: Try features with mock data

### Mock Data
The demo generates realistic mock data including:
- Active and expired sessions
- Token usage statistics
- Cost calculations
- Provider distribution
- Time-based metrics
        `,
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BYOKDemoPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Interactive Demo",
};

export const WithMockData: Story = {
  name: "Pre-populated Sessions",
  parameters: {
    docs: {
      description: {
        story: "Demo starts with several mock sessions already generated",
      },
    },
  },
};

export const TourAutoStart: Story = {
  name: "Auto-start Tour",
  parameters: {
    docs: {
      description: {
        story: "Tour automatically starts for first-time visitors",
      },
    },
  },
};
