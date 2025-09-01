/**
 * Unit tests for DemoTour component
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DemoTour, useDemoTour } from "../DemoTour";
import { renderHook, act } from "@testing-library/react";

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
  writable: true,
});

describe("DemoTour Component", () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders when visible", () => {
    const onComplete = jest.fn();
    render(<DemoTour visible={true} onComplete={onComplete} />);

    expect(screen.getByText(/Welcome to Harvest.ai!/)).toBeInTheDocument();
  });

  it("does not render when not visible", () => {
    const onComplete = jest.fn();
    render(<DemoTour visible={false} onComplete={onComplete} />);

    expect(screen.queryByText(/Welcome to Harvest.ai!/)).not.toBeInTheDocument();
  });

  it("shows the first step initially", () => {
    const onComplete = jest.fn();
    render(<DemoTour visible={true} onComplete={onComplete} />);

    expect(screen.getByText(/Welcome to Harvest.ai!/)).toBeInTheDocument();
    expect(
      screen.getByText(/Experience the power of AI-driven content transformation/),
    ).toBeInTheDocument();
  });

  it("advances to next step when Next button is clicked", () => {
    const onComplete = jest.fn();
    const onStepChange = jest.fn();
    render(<DemoTour visible={true} onComplete={onComplete} onStepChange={onStepChange} />);

    const nextButton = screen.getByRole("button", { name: /Next/i });
    fireEvent.click(nextButton);

    expect(screen.getByText(/Bring Your Own Key/)).toBeInTheDocument();
    expect(onStepChange).toHaveBeenCalledWith(1);
  });

  it("shows Start Demo button on last step", () => {
    const onComplete = jest.fn();
    render(<DemoTour visible={true} onComplete={onComplete} />);

    // Click through all steps to reach the last one
    const clickNext = () => {
      const button = screen.queryByRole("button", { name: /Next/i });
      if (button) {
        fireEvent.click(button);
        return true;
      }
      return false;
    };

    while (clickNext()) {
      // Keep clicking next
    }

    expect(screen.getByRole("button", { name: /Start Demo/i })).toBeInTheDocument();
  });

  it("completes tour when Start Demo is clicked", async () => {
    const onComplete = jest.fn();
    render(<DemoTour visible={true} onComplete={onComplete} />);

    // Click through all steps
    const buttons = screen.getAllByRole("button");
    const nextButton = buttons.find((b) => b.textContent?.includes("Next"));

    // Go through all steps
    for (let i = 0; i < 5; i++) {
      const button = screen.queryByRole("button", { name: /Next/i });
      if (button) fireEvent.click(button);
    }

    const startButton = screen.getByRole("button", { name: /Start Demo/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith("harvest_tour_completed", "true");
      expect(onComplete).toHaveBeenCalled();
    });
  });

  // Skip button test removed - component doesn't have a skip button

  it("displays correct step counter", () => {
    const onComplete = jest.fn();
    render(<DemoTour visible={true} onComplete={onComplete} />);

    expect(screen.getByText("1 / 6")).toBeInTheDocument();

    const nextButton = screen.getByRole("button", { name: /Next/i });
    fireEvent.click(nextButton);

    expect(screen.getByText("2 / 6")).toBeInTheDocument();
  });
});

describe("useDemoTour Hook", () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("shows tour for first-time visitors", () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useDemoTour());

    expect(result.current.shouldShowTour).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith("harvest_visited", "true");
  });

  it("does not show tour if already completed", () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === "harvest_tour_completed") return "true";
      if (key === "harvest_visited") return "true";
      return null;
    });

    const { result } = renderHook(() => useDemoTour());

    expect(result.current.shouldShowTour).toBe(false);
  });

  it("starts tour when startTour is called", () => {
    const { result } = renderHook(() => useDemoTour());

    act(() => {
      result.current.startTour();
    });

    expect(result.current.shouldShowTour).toBe(true);
  });

  it("resets tour when resetTour is called", () => {
    const { result } = renderHook(() => useDemoTour());

    act(() => {
      result.current.resetTour();
    });

    expect(localStorageMock.removeItem).toHaveBeenCalledWith("harvest_tour_completed");
    expect(result.current.shouldShowTour).toBe(true);
  });

  it("completes tour when completeTour is called", () => {
    const { result } = renderHook(() => useDemoTour());

    act(() => {
      result.current.completeTour();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith("harvest_tour_completed", "true");
    expect(result.current.shouldShowTour).toBe(false);
  });

  it("handles localStorage errors gracefully", () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error("Storage error");
    });

    const { result } = renderHook(() => useDemoTour());

    expect(result.current.shouldShowTour).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });
});
