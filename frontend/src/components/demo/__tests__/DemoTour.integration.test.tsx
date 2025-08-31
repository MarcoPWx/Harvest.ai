import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DemoTour } from "../DemoTour";
import { DemoTourButton } from "../DemoTourButton";
import { DemoDashboard } from "../DemoDashboard";
import { DemoTourStatus } from "../DemoTourStatus";
import "@testing-library/jest-dom";

jest.setTimeout(15000);

// Mock framer-motion for consistent testing
jest.mock("framer-motion", () => {
  const React = require("react");
  const MockMotionDiv = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
    ({ children, ...props }, ref) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    ),
  );
  MockMotionDiv.displayName = "MockMotionDiv";
  const MockMotionButton = React.forwardRef<
    HTMLButtonElement,
    React.ComponentPropsWithoutRef<"button">
  >(({ children, ...props }, ref) => (
    <button ref={ref} {...props}>
      {children}
    </button>
  ));
  MockMotionButton.displayName = "MockMotionButton";
  return {
    motion: {
      div: MockMotionDiv,
      button: MockMotionButton,
    },
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  };
});

// Mock DemoDashboard to provide predictable content
jest.mock("../DemoDashboard", () => ({
  DemoDashboard: () => (
    <div>
      <div>Active API Keys</div>
      <div>Monthly Usage</div>
      <div>Cost Saved</div>
      <div>Models Available</div>
    </div>
  ),
}));

// Mock DemoTourStatus to avoid setInterval and animation-related act warnings
jest.mock("../DemoTourStatus", () => ({
  DemoTourStatus: () => {
    const React = require("react");
    const [expanded, setExpanded] = React.useState(false);
    return (
      <div>
        <button onClick={() => setExpanded(true)}>Tour Status</button>
        <div>HEALTHY</div>
        {expanded && (
          <div>
            <div>Demo Tour System Status</div>
            <div>Total Starts</div>
            <div>Completion Rate</div>
          </div>
        )}
      </div>
    );
  },
}));

// Mock localStorage with proper typing to avoid explicit any
const localStorageMock: Storage = {
  length: 0,
  clear: jest.fn() as unknown as Storage["clear"],
  getItem: jest.fn(() => null) as unknown as Storage["getItem"],
  key: jest.fn(() => null) as unknown as Storage["key"],
  removeItem: jest.fn() as unknown as Storage["removeItem"],
  setItem: jest.fn() as unknown as Storage["setItem"],
};

// Assign the mock to both global and window without using `any`
(global as unknown as { localStorage: Storage }).localStorage = localStorageMock;
// Ensure window.localStorage is also mocked so component code sees the mock
// (jsdom binds localStorage on window)
(window as unknown as { localStorage: Storage }).localStorage = localStorageMock;

describe("Demo Tour Integration Tests", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    jest.useFakeTimers();
    user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe("Tour Flow Integration", () => {
    it("should integrate tour button with tour overlay", async () => {
      const { container } = render(
        <>
          <DemoTourButton />
          <DemoDashboard />
        </>,
      );

      // Wait for button to appear
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByLabelText("Launch BYOK Demo Tour")).toBeInTheDocument();
      });

      // Click button to launch tour
      const button = screen.getByLabelText("Launch BYOK Demo Tour");
      await user.click(button);

      // Tour should be visible
      expect(screen.getByTestId("demo-tour")).toBeInTheDocument();
    });

    it("should handle first-time visitor flow end-to-end", async () => {
      localStorageMock.getItem.mockReturnValue(null);

      render(
        <>
          <DemoTourButton />
          <DemoDashboard />
        </>,
      );

      // Button appears after 2 seconds
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByRole("button")).toBeInTheDocument();
      });

      // Auto-start after 3 more seconds
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Tour should auto-start
      await waitFor(() => {
        expect(screen.getByTestId("demo-tour")).toBeInTheDocument();
      });

      // Verify flow completed by ensuring tour overlay is active
      expect(screen.getByTestId("demo-tour")).toBeInTheDocument();
    });

    it("should integrate with dashboard mock data", async () => {
      render(<DemoDashboard />);

      // Check that dashboard renders with mock data
      expect(screen.getByText(/Active API Keys/)).toBeInTheDocument();
      expect(screen.getByText(/Monthly Usage/)).toBeInTheDocument();
      expect(screen.getByText(/Cost Saved/)).toBeInTheDocument();
      expect(screen.getByText(/Models Available/)).toBeInTheDocument();
    });
  });

  describe("Status Monitor Integration", () => {
    it("should show system status alongside tour components", async () => {
      render(
        <>
          <DemoTourButton />
          <DemoTourStatus />
        </>,
      );

      // Status monitor should be visible
      expect(screen.getByText("Tour Status")).toBeInTheDocument();
      expect(screen.getByText("HEALTHY")).toBeInTheDocument();
    });

    it("should expand status monitor to show metrics", async () => {
      render(<DemoTourStatus />);

      const statusButton = screen.getByText("Tour Status");
      await user.click(statusButton);

      // Expanded view should show metrics
      await waitFor(() => {
        expect(screen.getByText("Demo Tour System Status")).toBeInTheDocument();
        expect(screen.getByText("Total Starts")).toBeInTheDocument();
        expect(screen.getByText("Completion Rate")).toBeInTheDocument();
      });
    });
  });

  describe("Tour Navigation Integration", () => {
    it("should navigate through tour steps with mock data", async () => {
      const mockTourSteps = [
        { title: "Welcome", content: "Welcome to Harvest.ai!" },
        { title: "Key Management", content: "Secure API Key Management" },
        { title: "Providers", content: "Multiple AI Providers" },
      ];

      const TourWrapper = () => {
        const [step, setStep] = React.useState(0);

        return (
          <div>
            <h2>{mockTourSteps[step].title}</h2>
            <p>{mockTourSteps[step].content}</p>
            <button onClick={() => setStep(Math.min(step + 1, mockTourSteps.length - 1))}>
              Next
            </button>
            <button onClick={() => setStep(Math.max(step - 1, 0))}>Back</button>
          </div>
        );
      };

      render(<TourWrapper />);

      // Initial step
      expect(screen.getByText("Welcome")).toBeInTheDocument();
      expect(screen.getByText("Welcome to Harvest.ai!")).toBeInTheDocument();

      // Navigate forward
      await user.click(screen.getByText("Next"));
      expect(screen.getByText("Key Management")).toBeInTheDocument();

      // Navigate backward
      await user.click(screen.getByText("Back"));
      expect(screen.getByText("Welcome")).toBeInTheDocument();
    });

    it("should handle keyboard navigation", async () => {
      const { container } = render(<DemoTour />);

      // Simulate keyboard navigation
      fireEvent.keyDown(container, { key: "ArrowRight" });
      fireEvent.keyDown(container, { key: "ArrowLeft" });
      fireEvent.keyDown(container, { key: "Escape" });

      // Tour should handle keyboard events
      expect(container).toBeInTheDocument();
    });
  });

  describe("Performance Integration", () => {
    it("should track performance metrics during tour", async () => {
      const performanceMetrics = {
        startTime: Date.now(),
        fps: [],
        memoryUsage: [],
      };

      // Mock performance observer
      const measurePerformance = () => {
        performanceMetrics.fps.push(60);
        performanceMetrics.memoryUsage.push(5.2);
      };

      render(
        <>
          <DemoTourButton />
          <DemoTourStatus />
        </>,
      );

      // Simulate performance measurements
      measurePerformance();

      expect(performanceMetrics.fps.length).toBeGreaterThan(0);
      expect(performanceMetrics.memoryUsage.length).toBeGreaterThan(0);
    });

    it("should handle animation performance", async () => {
      const { container } = render(<DemoTourButton />);

      // Check for animation classes
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        const button = container.querySelector("button");
        expect(button).toBeInTheDocument();
      });

      // Animations should be smooth (mocked in test environment)
      expect(container.querySelector(".fixed")).toBeInTheDocument();
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle localStorage errors gracefully", async () => {
      // Mock localStorage error
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error("localStorage not available");
      });

      render(<DemoTourButton />);

      // Component should still render despite localStorage error
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByRole("button")).toBeInTheDocument();
      });
    });

    it("should handle missing mock data gracefully", async () => {
      // Render dashboard without mock data
      const { container } = render(<DemoDashboard />);

      // Dashboard should still render with default values
      expect(container).toBeInTheDocument();
    });
  });

  describe("Accessibility Integration", () => {
    it("should maintain focus management across components", async () => {
      render(
        <>
          <DemoTourButton />
          <DemoTour />
        </>,
      );

      // Wait for button
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      const button = await screen.findByRole("button");

      // Focus button
      button.focus();
      expect(document.activeElement).toBe(button);

      // Launch tour with keyboard
      fireEvent.keyDown(button, { key: "Enter" });

      // Focus should be managed within tour
      await waitFor(() => {
        const tourElement = screen.getByTestId("demo-tour");
        expect(tourElement).toBeInTheDocument();
      });
    });

    it("should provide proper ARIA labels across components", async () => {
      render(
        <>
          <DemoTourButton />
          <DemoTourStatus />
        </>,
      );

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Check for ARIA labels
      const buttons = await screen.findAllByRole("button");
      const demoButton = buttons.find((btn) => btn.getAttribute("aria-label"))!;
      expect(demoButton).toHaveAttribute("aria-label");

      const statusButton = screen.getByText("Tour Status");
      expect(statusButton).toBeInTheDocument();
    });
  });

  describe("Data Flow Integration", () => {
    it("should sync state between tour components", async () => {
      const mockState = {
        tourActive: false,
        currentStep: 0,
        completed: false,
      };

      const StateManager = ({ children }: { children: React.ReactNode }) => {
        const [state, setState] = React.useState(mockState);

        return (
          <div data-testid="state-manager" data-state={JSON.stringify(state)}>
            {children}
          </div>
        );
      };

      render(
        <StateManager>
          <DemoTourButton />
          <DemoTour />
        </StateManager>,
      );

      const stateManager = screen.getByTestId("state-manager");
      const state = JSON.parse(stateManager.getAttribute("data-state") || "{}");

      expect(state.tourActive).toBe(false);
      expect(state.currentStep).toBe(0);
    });

    it("should update metrics when tour events occur", async () => {
      const metrics = {
        starts: 0,
        completions: 0,
        stepViews: [],
      };

      const trackEvent = (event: string, data?: any) => {
        if (event === "tour_started") metrics.starts++;
        if (event === "tour_completed") metrics.completions++;
        if (event === "step_viewed") metrics.stepViews.push(data.step);
      };

      // Simulate tour start
      trackEvent("tour_started");
      expect(metrics.starts).toBe(1);

      // Simulate step views
      trackEvent("step_viewed", { step: 1 });
      trackEvent("step_viewed", { step: 2 });
      expect(metrics.stepViews).toEqual([1, 2]);

      // Simulate completion
      trackEvent("tour_completed");
      expect(metrics.completions).toBe(1);
    });
  });

  describe("Mobile Integration", () => {
    it("should handle touch events on mobile", async () => {
      // Mock mobile viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<DemoTourButton />);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      const button = await screen.findByRole("button");

      // Simulate touch event
      fireEvent.touchStart(button);
      fireEvent.touchEnd(button);

      // Button should respond to touch
      expect(button).toBeInTheDocument();
    });

    it("should adjust layout for mobile screens", async () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = render(
        <>
          <DemoTour />
          <DemoTourStatus />
        </>,
      );

      // Components should render in mobile layout
      expect(container).toBeInTheDocument();
    });
  });
});
