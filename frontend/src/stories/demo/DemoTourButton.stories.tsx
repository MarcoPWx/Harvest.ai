import type { Meta, StoryObj } from "@storybook/react";
import { DemoTourButton } from "@/components/demo/DemoTourButton";
import { within, userEvent, waitFor } from "@storybook/testing-library";
import { expect } from "@storybook/jest";

const meta = {
  title: "Demo/Tour Button",
  component: DemoTourButton,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
## Demo Tour Button

A floating action button that launches the interactive BYOK demo tour.

### Features
- 🎯 **Floating Position**: Fixed to bottom-right corner
- ✨ **Animated Effects**: Pulse, bounce, and sparkles
- 🔔 **Notification Dot**: Shows for first-time visitors
- 💫 **Hover Tooltip**: Descriptive information on hover
- 🚀 **Auto-launch**: Starts tour automatically for new users

### Behavior
1. Button appears after 2 seconds
2. Shows notification dot for first-time visitors
3. Auto-starts tour after 3 seconds for new users
4. Hides after tour completion (5 second delay)
5. Can be manually triggered anytime

### Animation Details
- **Entry**: Spring animation with scale effect
- **Idle**: Gentle floating animation (up/down)
- **Hover**: Scale up with sparkle effects
- **Pulse**: Continuous pulse ring effect
- **Exit**: Scale down with fade
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
        }}
      >
        <div style={{ padding: "2rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
            Demo Page Content
          </h1>
          <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
            This is a mock page where the tour button would appear. Look for the floating button in
            the bottom-right corner.
          </p>
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>BYOK Features</h2>
            <ul style={{ listStyle: "disc", paddingLeft: "1.5rem" }}>
              <li>Secure key management</li>
              <li>Multiple AI providers</li>
              <li>Usage analytics</li>
              <li>Cost tracking</li>
            </ul>
          </div>
        </div>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DemoTourButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Default State",
  parameters: {
    docs: {
      description: {
        story: "The tour button in its default state - will appear after 2 seconds",
      },
    },
  },
};

export const FirstTimeVisitor: Story = {
  name: "First Time Visitor",
  parameters: {
    docs: {
      description: {
        story: "Shows notification dot and auto-starts tour after 3 seconds",
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Clear localStorage to simulate first visit
    localStorage.removeItem("harvest_tour_completed");
    localStorage.removeItem("harvest_visited");

    const canvas = within(canvasElement);

    // Wait for button to appear
    await waitFor(
      () => {
        const button = canvas.getByRole("button");
        expect(button).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // Check for notification dot
    const notificationDot = canvas.container.querySelector(".animate-ping");
    expect(notificationDot).toBeInTheDocument();
  },
};

export const ReturningVisitor: Story = {
  name: "Returning Visitor",
  parameters: {
    docs: {
      description: {
        story: "No notification dot, no auto-start for returning visitors",
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Set localStorage to simulate returning visit
    localStorage.setItem("harvest_tour_completed", "true");
    localStorage.setItem("harvest_visited", "true");

    const canvas = within(canvasElement);

    // Wait for button to appear
    await waitFor(
      () => {
        const button = canvas.getByRole("button");
        expect(button).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // Check that notification dot is not present
    const notificationDot = canvas.container.querySelector(".animate-ping");
    expect(notificationDot).not.toBeInTheDocument();
  },
};

export const HoverState: Story = {
  name: "Hover State",
  parameters: {
    docs: {
      description: {
        story: "Button with hover effects - tooltip and sparkles",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for button to appear
    await waitFor(
      () => {
        const button = canvas.getByRole("button");
        expect(button).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // Hover over button
    const button = canvas.getByRole("button");
    await userEvent.hover(button);

    // Check for tooltip
    await waitFor(() => {
      const tooltip = canvas.getByText("Launch BYOK Demo Tour");
      expect(tooltip).toBeInTheDocument();
    });

    // Check for sparkle effects
    const sparkles = canvas.container.querySelectorAll("svg.lucide-sparkles");
    expect(sparkles.length).toBeGreaterThan(0);
  },
};

export const LaunchTour: Story = {
  name: "Launch Tour",
  parameters: {
    docs: {
      description: {
        story: "Clicking the button launches the tour overlay",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for button to appear
    await waitFor(
      () => {
        const button = canvas.getByRole("button");
        expect(button).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // Click button to launch tour
    const button = canvas.getByRole("button");
    await userEvent.click(button);

    // Check that tour overlay appears
    await waitFor(() => {
      const tourTitle = canvas.getByText(/Welcome to Harvest.ai!/);
      expect(tourTitle).toBeInTheDocument();
    });
  },
};

export const MobileView: Story = {
  name: "Mobile View",
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story: "Tour button on mobile devices - adjusted positioning",
      },
    },
  },
};

export const DarkMode: Story = {
  name: "Dark Mode",
  parameters: {
    backgrounds: {
      default: "dark",
    },
    docs: {
      description: {
        story: "Tour button appearance in dark mode",
      },
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          minHeight: "100vh",
          position: "relative",
          background: "#111827",
        }}
      >
        <Story />
      </div>
    ),
  ],
};
