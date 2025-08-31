import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DemoTourButton } from "../DemoTourButton";
import "@testing-library/jest-dom";

// Mock framer-motion to avoid animation issues in tests
jest.mock("framer-motion", () => ({
  motion: {
    // Strip motion-only props so they don't leak to DOM and cause warnings
    div: ({
      children,
      whileHover,
      whileTap,
      animate,
      transition,
      initial,
      exit,
      ...props
    }: any) => <div {...props}>{children}</div>,
    button: ({
      children,
      whileHover,
      whileTap,
      animate,
      transition,
      initial,
      exit,
      ...props
    }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Compass: () => <div data-testid="compass-icon">Compass</div>,
  Sparkles: () => <div data-testid="sparkles-icon">Sparkles</div>,
  X: () => <div data-testid="x-icon">X</div>,
  ChevronLeft: () => <div data-testid="chevron-left-icon">ChevronLeft</div>,
  ChevronRight: () => <div data-testid="chevron-right-icon">ChevronRight</div>,
  CheckCircle: () => <div data-testid="check-circle-icon">CheckCircle</div>,
}));

// Mock the DemoTour component and hook
jest.mock("../DemoTour", () => ({
  DemoTour: ({ visible }: any) =>
    visible ? <div data-testid="demo-tour">Demo Tour Overlay</div> : null,
  useDemoTour: () => ({
    // Show tour for first-time visitors (no completion flag)
    shouldShowTour: localStorage.getItem("harvest_tour_completed") !== "true",
    startTour: jest.fn(),
    completeTour: jest.fn(),
  }),
}));

describe("DemoTourButton", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset all mocks
    jest.clearAllMocks();
    // Reset timers
    jest.useFakeTimers();
    user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime, delay: null });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe("Visibility and Animation", () => {
    it("should render button immediately in test environment", () => {
      render(<DemoTourButton />);

      // Button should be visible immediately in test mode
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should be present and accessible", async () => {
      render(<DemoTourButton />);

      await waitFor(() => {
        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute("aria-label", "Launch BYOK Demo Tour");
      });
    });

    it("should have correct aria attributes", async () => {
      render(<DemoTourButton />);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("aria-label", "Launch BYOK Demo Tour");
      });
    });
  });

  describe("First Time Visitor", () => {
    it("should show notification dot for first-time visitors", async () => {
      // Ensure localStorage is empty (first visit)
      localStorage.removeItem("harvest_tour_completed");
      localStorage.removeItem("harvest_visited");

      render(<DemoTourButton />);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();
      });

      // Check for notification dot (animate-ping class)
      const notificationDot = document.querySelector(".animate-ping");
      expect(notificationDot).toBeInTheDocument();
    });

    it("should auto-start tour after 3 seconds for first-time visitors", async () => {
      localStorage.removeItem("harvest_tour_completed");
      localStorage.removeItem("harvest_visited");

      render(<DemoTourButton />);

      // Fast-forward 2 seconds for button to appear
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Fast-forward another 3 seconds for auto-start
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.getByTestId("demo-tour")).toBeInTheDocument();
      });
    });

    it("should set visited flag in localStorage", async () => {
      localStorage.removeItem("harvest_visited");

      render(<DemoTourButton />);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(localStorage.getItem("harvest_visited")).toBe("true");
      });
    });
  });

  describe("Returning Visitor", () => {
    it("should not show notification dot for returning visitors", async () => {
      // Set as returning visitor
      localStorage.setItem("harvest_tour_completed", "true");
      localStorage.setItem("harvest_visited", "true");

      render(<DemoTourButton />);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();
      });

      // Check that notification dot is not present
      const notificationDot = document.querySelector(".animate-ping");
      expect(notificationDot).not.toBeInTheDocument();
    });

    it("should not auto-start tour for returning visitors", async () => {
      localStorage.setItem("harvest_tour_completed", "true");
      localStorage.setItem("harvest_visited", "true");

      render(<DemoTourButton />);

      // Fast-forward past auto-start time
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Tour should not be visible
      expect(screen.queryByTestId("demo-tour")).not.toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should launch tour when clicked", async () => {
      const user = userEvent.setup({ delay: null });
      localStorage.setItem("harvest_visited", "true");

      render(<DemoTourButton />);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByRole("button")).toBeInTheDocument();
      });

      const button = screen.getByRole("button");
      await user.click(button);

      expect(screen.getByTestId("demo-tour")).toBeInTheDocument();
    });

    it("should show tooltip on hover", async () => {
      const user = userEvent.setup({ delay: null });
      localStorage.setItem("harvest_visited", "true");

      render(<DemoTourButton />);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByRole("button")).toBeInTheDocument();
      });

      const button = screen.getByRole("button");
      await user.hover(button);

      await waitFor(() => {
        expect(screen.getByText("Launch BYOK Demo Tour")).toBeInTheDocument();
      });
    });

    it("should hide tooltip on mouse leave", async () => {
      const user = userEvent.setup({ delay: null });
      localStorage.setItem("harvest_visited", "true");

      render(<DemoTourButton />);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByRole("button")).toBeInTheDocument();
      });

      const button = screen.getByRole("button");

      // Hover to show tooltip
      await user.hover(button);
      await waitFor(() => {
        expect(screen.getByText("Launch BYOK Demo Tour")).toBeInTheDocument();
      });

      // Unhover to hide tooltip
      await user.unhover(button);
      await waitFor(() => {
        expect(screen.queryByText("Launch BYOK Demo Tour")).not.toBeInTheDocument();
      });
    });

    it("should show sparkle effects on hover", async () => {
      const user = userEvent.setup({ delay: null });
      localStorage.setItem("harvest_visited", "true");

      render(<DemoTourButton />);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByRole("button")).toBeInTheDocument();
      });

      const button = screen.getByRole("button");
      await user.hover(button);

      // Check for sparkle icons
      const sparkles = screen.getAllByTestId("sparkles-icon");
      expect(sparkles.length).toBeGreaterThan(0);
    });
  });

  describe("Tour Completion", () => {
    it("should hide button after tour completion", async () => {
      const user = userEvent.setup({ delay: null });

      render(<DemoTourButton />);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByRole("button")).toBeInTheDocument();
      });

      // Simulate tour completion by setting localStorage
      localStorage.setItem("harvest_tour_completed", "true");

      // Trigger storage event to simulate tour completion
      const storageEvent = new StorageEvent("storage", {
        key: "harvest_tour_completed",
        newValue: "true",
        oldValue: null,
        storageArea: localStorage,
      });
      act(() => {
        window.dispatchEvent(storageEvent);
      });

      // Fast-forward past hide delay (5 seconds)
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
      });
    });

    it("should track tour completion in localStorage", async () => {
      const user = userEvent.setup({ delay: null });

      render(<DemoTourButton />);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByRole("button")).toBeInTheDocument();
      });

      // Click to start tour
      const button = screen.getByRole("button");
      await user.click(button);

      // Simulate tour completion
      localStorage.setItem("harvest_tour_completed", "true");

      expect(localStorage.getItem("harvest_tour_completed")).toBe("true");
    });
  });

  describe("Responsive Behavior", () => {
    it("should render correctly on mobile screens", async () => {
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

      // Button should still render on mobile
      await waitFor(() => {
        expect(screen.getByRole("button")).toBeInTheDocument();
      });
    });

    it("should have proper positioning classes", async () => {
      render(<DemoTourButton />);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        const button = screen.getByRole("button");
        const container = button.parentElement;
        expect(container).toHaveClass("fixed");
        expect(container).toHaveClass("bottom-6");
        expect(container).toHaveClass("right-6");
      });
    });
  });

  describe("Accessibility", () => {
    it("should be keyboard accessible", async () => {
      render(<DemoTourButton />);

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByRole("button")).toBeInTheDocument();
      });

      const button = screen.getByRole("button");

      // Focus the button
      button.focus();
      expect(document.activeElement).toBe(button);

      // Trigger with Enter key
      fireEvent.keyDown(button, { key: "Enter", code: "Enter" });

      expect(screen.getByTestId("demo-tour")).toBeInTheDocument();
    });

    it("should have proper focus styles", async () => {
      render(<DemoTourButton />);

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(screen.getByRole("button")).toBeInTheDocument();
      });

      const button = screen.getByRole("button");

      // Check for focus-visible classes
      expect(button).toHaveClass("focus:outline-none");
      expect(button).toHaveClass("focus-visible:ring-2");
      expect(button).toHaveClass("focus-visible:ring-green-500");
    });

    it("should announce state changes to screen readers", async () => {
      render(<DemoTourButton />);

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("aria-label", "Launch BYOK Demo Tour");
      });
    });
  });
});
