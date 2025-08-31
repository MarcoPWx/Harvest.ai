import type { Meta, StoryObj } from "@storybook/react";
import { DemoTourStatus } from "@/components/demo/DemoTourStatus";
import { within, userEvent, waitFor } from "@storybook/testing-library";
import { expect } from "@storybook/jest";

const meta = {
  title: "Demo/Tour Status Monitor",
  component: DemoTourStatus,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
## Demo Tour Status Monitor

Real-time system status and metrics monitoring for the BYOK demo tour.

### Features
- 📊 **Live Metrics**: Real-time tour engagement metrics
- 🎯 **Completion Funnel**: Step-by-step dropoff analysis
- ⚡ **Performance Monitoring**: FPS, load time, memory usage
- 🔍 **User Engagement**: Track hovers, clicks, keyboard events
- 💚 **Health Status**: Component operational status
- 📈 **Analytics Dashboard**: Comprehensive metrics overview

### Metrics Tracked
- Total tour starts
- Completion rate
- Average duration
- Currently active users
- Step-by-step dropoff rates
- Performance metrics (FPS, load time, memory)
- User engagement events

### Health Monitoring
- Tour Button component
- Tour Overlay component
- Analytics service
- LocalStorage availability
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">BYOK Demo Page</h1>
          <p className="text-gray-600 mb-8">
            This page demonstrates the system status monitor for the demo tour. Look for the status
            indicator in the bottom-left corner.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-3">Tour Analytics</h2>
              <p className="text-gray-600">
                The status monitor tracks real-time metrics about tour usage, performance, and user
                engagement.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-3">System Health</h2>
              <p className="text-gray-600">
                Monitor the operational status of all tour components and identify potential issues.
              </p>
            </div>
          </div>
        </div>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DemoTourStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Collapsed State",
  parameters: {
    docs: {
      description: {
        story: "The status monitor in its default collapsed state",
      },
    },
  },
};

export const ExpandedView: Story = {
  name: "Expanded View",
  parameters: {
    docs: {
      description: {
        story: "Click the status button to expand and view detailed metrics",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for component to render
    await waitFor(() => {
      const button = canvas.getByText("Tour Status");
      expect(button).toBeInTheDocument();
    });

    // Click to expand
    const button = canvas.getByText("Tour Status");
    await userEvent.click(button);

    // Check that expanded view is visible
    await waitFor(() => {
      const title = canvas.getByText("Demo Tour System Status");
      expect(title).toBeInTheDocument();
    });
  },
};

export const HealthyStatus: Story = {
  name: "Healthy Status",
  parameters: {
    docs: {
      description: {
        story: "System showing healthy operational status",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check for healthy status indicator
    await waitFor(() => {
      const status = canvas.getByText("HEALTHY");
      expect(status).toBeInTheDocument();
      expect(status).toHaveClass("bg-green-100");
    });
  },
};

export const MetricsUpdate: Story = {
  name: "Live Metrics Update",
  parameters: {
    docs: {
      description: {
        story: "Metrics update automatically every 5 seconds",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Expand the view
    const button = canvas.getByText("Tour Status");
    await userEvent.click(button);

    // Wait for metrics to be visible
    await waitFor(() => {
      const title = canvas.getByText("Demo Tour System Status");
      expect(title).toBeInTheDocument();
    });

    // Note the initial total starts value
    const totalStartsElement = canvas.getByText("Total Starts").closest("div")?.parentElement;
    const initialValue = totalStartsElement?.querySelector("p.text-2xl")?.textContent;

    // Wait for 6 seconds for update
    await new Promise((resolve) => setTimeout(resolve, 6000));

    // Check that value has changed
    const updatedValue = totalStartsElement?.querySelector("p.text-2xl")?.textContent;
    expect(updatedValue).not.toBe(initialValue);
  },
};

export const PerformanceMetrics: Story = {
  name: "Performance Metrics",
  parameters: {
    docs: {
      description: {
        story: "View real-time performance metrics including FPS, load time, and memory usage",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Expand the view
    const button = canvas.getByText("Tour Status");
    await userEvent.click(button);

    // Check for performance metrics
    await waitFor(() => {
      expect(canvas.getByText(/FPS/)).toBeInTheDocument();
      expect(canvas.getByText(/Load Time/)).toBeInTheDocument();
      expect(canvas.getByText(/Memory Usage/)).toBeInTheDocument();
    });
  },
};

export const StepDropoffFunnel: Story = {
  name: "Step Dropoff Funnel",
  parameters: {
    docs: {
      description: {
        story: "Visualize user dropoff at each step of the tour",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Expand the view
    const button = canvas.getByText("Tour Status");
    await userEvent.click(button);

    // Check for step funnel
    await waitFor(() => {
      expect(canvas.getByText("Step Completion Funnel")).toBeInTheDocument();

      // Check for all 7 steps
      for (let i = 1; i <= 7; i++) {
        expect(canvas.getByText(`Step ${i}`)).toBeInTheDocument();
      }
    });
  },
};

export const UserEngagement: Story = {
  name: "User Engagement Tracking",
  parameters: {
    docs: {
      description: {
        story: "Track user interaction events including hovers, clicks, and keyboard usage",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Expand the view
    const button = canvas.getByText("Tour Status");
    await userEvent.click(button);

    // Check for engagement metrics
    await waitFor(() => {
      expect(canvas.getByText("User Engagement")).toBeInTheDocument();
      expect(canvas.getByText("Hovers")).toBeInTheDocument();
      expect(canvas.getByText("Clicks")).toBeInTheDocument();
      expect(canvas.getByText("Keys")).toBeInTheDocument();
    });
  },
};

export const ComponentHealth: Story = {
  name: "Component Health Status",
  parameters: {
    docs: {
      description: {
        story: "Monitor the health status of individual tour components",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Expand the view
    const button = canvas.getByText("Tour Status");
    await userEvent.click(button);

    // Check for component health
    await waitFor(() => {
      expect(canvas.getByText("Component Health")).toBeInTheDocument();
      expect(canvas.getByText("Tour Button")).toBeInTheDocument();
      expect(canvas.getByText("Tour Overlay")).toBeInTheDocument();
      expect(canvas.getByText("Analytics")).toBeInTheDocument();
      expect(canvas.getByText("LocalStorage")).toBeInTheDocument();
    });
  },
};

export const CloseExpanded: Story = {
  name: "Close Expanded View",
  parameters: {
    docs: {
      description: {
        story: "Close the expanded view using the X button",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Expand the view
    const button = canvas.getByText("Tour Status");
    await userEvent.click(button);

    // Wait for expanded view
    await waitFor(() => {
      const title = canvas.getByText("Demo Tour System Status");
      expect(title).toBeInTheDocument();
    });

    // Find and click close button
    const closeButton = canvas
      .getByRole("button", { name: "" })
      .parentElement?.querySelector("button:last-child");
    if (closeButton) {
      await userEvent.click(closeButton);
    }

    // Check that expanded view is hidden
    await waitFor(() => {
      const title = canvas.queryByText("Demo Tour System Status");
      expect(title).not.toBeInTheDocument();
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
        story: "Status monitor on mobile devices",
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
        story: "Status monitor in dark mode",
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
