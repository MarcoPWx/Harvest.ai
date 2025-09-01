import type { Meta, StoryObj } from "@storybook/react";
import { DemoTour } from "@/components/demo/DemoTour";
import { within, userEvent, waitFor } from "@storybook/testing-library";
import { expect } from "@storybook/jest";
import { useState } from "react";

// Mock component to control tour visibility
const DemoTourWrapper = ({ autoStart = false }: { autoStart?: boolean }) => {
  const [isOpen, setIsOpen] = useState(autoStart);

  return (
    <>
      {!autoStart && (
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Launch Tour
        </button>
      )}
      <DemoTour visible={isOpen} onComplete={() => setIsOpen(false)} />
    </>
  );
};

const meta = {
  title: "Demo/Tour Overlay",
  component: DemoTourWrapper,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
## Demo Tour Overlay

The full interactive BYOK demo tour experience with mock data and guided steps.

### Features
- 🎭 **Full-screen overlay**: Immersive tour experience
- 📍 **Step-by-step guidance**: Navigate through BYOK features
- 🎯 **Interactive highlights**: Spotlight key UI elements
- 📊 **Mock data showcase**: Sample analytics and dashboards
- 🔄 **Progress tracking**: Visual progress indicators
- ⌨️ **Keyboard navigation**: Arrow keys and ESC support

### Tour Steps
1. **Welcome**: Introduction to Harvest.ai BYOK
2. **Key Management**: Configure API keys
3. **Provider Selection**: Choose AI providers
4. **Analytics Dashboard**: View usage metrics
5. **Cost Tracking**: Monitor spending
6. **Security Features**: Key encryption and safety
7. **Get Started**: Next steps and resources

### Interaction
- Click "Next" or press →/Enter to advance
- Click "Back" or press ← to go back
- Press ESC or click backdrop to exit
- Use number keys (1-7) to jump to specific steps
        `,
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div
        style={{
          minHeight: "100vh",
          position: "relative",
          background: "linear-gradient(to br, #f3f4f6, #e5e7eb)",
          padding: "2rem",
        }}
      >
        {/* Mock page content */}
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Harvest.ai Platform</h1>
            <p className="text-gray-600">Your AI-powered content generation suite</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Mock dashboard cards */}
            <div className="bg-white p-6 rounded-lg shadow" id="key-management">
              <h2 className="text-xl font-semibold mb-3">API Key Management</h2>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded">OpenAI: sk-...demo</div>
                <div className="p-3 bg-gray-50 rounded">Anthropic: sk-...demo</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow" id="analytics">
              <h2 className="text-xl font-semibold mb-3">Usage Analytics</h2>
              <div className="h-32 bg-gradient-to-r from-blue-100 to-blue-200 rounded flex items-center justify-center">
                <span className="text-blue-800">Mock Chart Area</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow" id="providers">
              <h2 className="text-xl font-semibold mb-3">AI Providers</h2>
              <div className="flex gap-4">
                <div className="p-4 bg-green-100 rounded text-center">
                  <div className="text-2xl">🤖</div>
                  <div className="text-sm mt-1">GPT-4</div>
                </div>
                <div className="p-4 bg-purple-100 rounded text-center">
                  <div className="text-2xl">🧠</div>
                  <div className="text-sm mt-1">Claude</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow" id="cost-tracking">
              <h2 className="text-xl font-semibold mb-3">Cost Tracking</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>This Month:</span>
                  <span className="font-semibold">$127.43</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Month:</span>
                  <span className="text-gray-600">$98.21</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4" id="security">
            <h3 className="font-semibold text-green-800 mb-2">🔒 Security Features</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• End-to-end encryption for all keys</li>
              <li>• Zero-knowledge architecture</li>
              <li>• SOC 2 Type II certified</li>
            </ul>
          </div>
        </div>

        <div className="fixed top-4 left-4 z-10">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof DemoTourWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Manual: Story = {
  name: "Manual Launch",
  args: {
    autoStart: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Click the button to manually launch the tour overlay",
      },
    },
  },
};

export const AutoStart: Story = {
  name: "Auto Start",
  args: {
    autoStart: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Tour starts automatically when the component mounts",
      },
    },
  },
};

export const NavigationFlow: Story = {
  name: "Navigation Flow",
  args: {
    autoStart: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Test the complete navigation flow through all tour steps",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for tour to appear
    await waitFor(() => {
      const welcomeText = canvas.getByText(/Welcome to Harvest.ai!/);
      expect(welcomeText).toBeInTheDocument();
    });

    // Test navigation through steps
    const nextButton = canvas.getByText("Next");

    // Step 1 -> 2
    await userEvent.click(nextButton);
    await waitFor(() => {
      const keyManagementText = canvas.getByText(/Secure API Key Management/);
      expect(keyManagementText).toBeInTheDocument();
    });

    // Step 2 -> 3
    await userEvent.click(nextButton);
    await waitFor(() => {
      const providersText = canvas.getByText(/Multiple AI Providers/);
      expect(providersText).toBeInTheDocument();
    });

    // Test back button
    const backButton = canvas.getByText("Back");
    await userEvent.click(backButton);
    await waitFor(() => {
      const keyManagementText = canvas.getByText(/Secure API Key Management/);
      expect(keyManagementText).toBeInTheDocument();
    });
  },
};

export const KeyboardNavigation: Story = {
  name: "Keyboard Navigation",
  args: {
    autoStart: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Navigate the tour using keyboard shortcuts",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for tour to appear
    await waitFor(() => {
      const welcomeText = canvas.getByText(/Welcome to Harvest.ai!/);
      expect(welcomeText).toBeInTheDocument();
    });

    // Test arrow key navigation
    await userEvent.keyboard("{ArrowRight}");
    await waitFor(() => {
      const keyManagementText = canvas.getByText(/Secure API Key Management/);
      expect(keyManagementText).toBeInTheDocument();
    });

    // Test Enter key
    await userEvent.keyboard("{Enter}");
    await waitFor(() => {
      const providersText = canvas.getByText(/Multiple AI Providers/);
      expect(providersText).toBeInTheDocument();
    });

    // Test left arrow
    await userEvent.keyboard("{ArrowLeft}");
    await waitFor(() => {
      const keyManagementText = canvas.getByText(/Secure API Key Management/);
      expect(keyManagementText).toBeInTheDocument();
    });

    // Test number key jump
    await userEvent.keyboard("4");
    await waitFor(() => {
      const analyticsText = canvas.getByText(/Real-time Analytics/);
      expect(analyticsText).toBeInTheDocument();
    });
  },
};

export const ExitTour: Story = {
  name: "Exit Tour",
  args: {
    autoStart: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Various ways to exit the tour",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for tour to appear
    await waitFor(() => {
      const welcomeText = canvas.getByText(/Welcome to Harvest.ai!/);
      expect(welcomeText).toBeInTheDocument();
    });

    // Test ESC key exit
    await userEvent.keyboard("{Escape}");

    // Tour should be closed
    await waitFor(() => {
      const welcomeText = canvas.queryByText(/Welcome to Harvest.ai!/);
      expect(welcomeText).not.toBeInTheDocument();
    });
  },
};

export const CompleteTour: Story = {
  name: "Complete Tour",
  args: {
    autoStart: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Navigate through the entire tour to completion",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for tour to appear
    await waitFor(() => {
      const welcomeText = canvas.getByText(/Welcome to Harvest.ai!/);
      expect(welcomeText).toBeInTheDocument();
    });

    // Navigate through all steps
    const steps = 7;
    for (let i = 1; i < steps; i++) {
      const nextButton = canvas.getByText(i === steps - 1 ? "Get Started" : "Next");
      await userEvent.click(nextButton);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay between steps
    }

    // Check completion state
    await waitFor(() => {
      expect(localStorage.getItem("harvest_tour_completed")).toBe("true");
    });
  },
};

export const MobileResponsive: Story = {
  name: "Mobile Responsive",
  args: {
    autoStart: true,
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story: "Tour overlay on mobile devices",
      },
    },
  },
};

export const TabletView: Story = {
  name: "Tablet View",
  args: {
    autoStart: true,
  },
  parameters: {
    viewport: {
      defaultViewport: "tablet",
    },
    docs: {
      description: {
        story: "Tour overlay on tablet devices",
      },
    },
  },
};

export const ProgressIndicators: Story = {
  name: "Progress Indicators",
  args: {
    autoStart: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Visual progress indicators showing current step",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for tour to appear
    await waitFor(() => {
      const welcomeText = canvas.getByText(/Welcome to Harvest.ai!/);
      expect(welcomeText).toBeInTheDocument();
    });

    // Check for progress dots
    const progressDots = canvas.container.querySelectorAll('[aria-label*="Step"]');
    expect(progressDots.length).toBe(7);

    // Check first dot is active
    expect(progressDots[0]).toHaveClass("bg-green-600");

    // Move to next step
    const nextButton = canvas.getByText("Next");
    await userEvent.click(nextButton);

    // Check second dot is now active
    await waitFor(() => {
      expect(progressDots[1]).toHaveClass("bg-green-600");
    });
  },
};
