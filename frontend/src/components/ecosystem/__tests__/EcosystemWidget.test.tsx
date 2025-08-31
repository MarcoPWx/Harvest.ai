import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import EcosystemWidget from "../EcosystemWidget";

// Mock framer-motion to avoid animation issues in tests
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

describe("EcosystemWidget Component", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Mock window.location
    delete (window as any).location;
    (window as any).location = { href: "" } as any;
  });

  it("renders toggle button by default (closed state)", () => {
    render(<EcosystemWidget currentProduct="harvest" />);
    // Look for the rocket icon button via role or presence
    // Since there is no accessible name, we ensure the button is in the document
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("opens the widget panel when toggle is clicked", () => {
    render(<EcosystemWidget currentProduct="harvest" />);

    const buttons = screen.getAllByRole("button");
    const toggle = buttons[0];
    fireEvent.click(toggle);

    // Now expect some content from the panel header
    expect(screen.getByText("NatureQuest Ecosystem")).toBeInTheDocument();
  });

  it("displays products other than the current one", () => {
    render(<EcosystemWidget currentProduct="harvest" />);

    // Open panel
    fireEvent.click(screen.getAllByRole("button")[0]);

    // Should show DevMentor and QuizMentor at least
    expect(screen.getByText("DevMentor")).toBeInTheDocument();
    expect(screen.getByText("QuizMentor")).toBeInTheDocument();
    expect(screen.getByText("Omni.ai")).toBeInTheDocument();
  });

  it("invokes onProductClick when provided", () => {
    const onProductClick = jest.fn();
    render(
      <EcosystemWidget currentProduct="harvest" onProductClick={onProductClick} userTier="pro" />,
    );

    // Open panel
    fireEvent.click(screen.getAllByRole("button")[0]);

    // Click a product button (find the button that contains DevMentor text)
    const devMentorElement = screen.getByText("DevMentor");
    const productButton = devMentorElement.closest("button");

    if (productButton) {
      fireEvent.click(productButton);
      expect(onProductClick).toHaveBeenCalledWith("devmentor");
    } else {
      // Fallback to clicking the text element directly
      fireEvent.click(devMentorElement);
      expect(onProductClick).toHaveBeenCalledWith("devmentor");
    }
  });

  it("navigates to billing when clicking a locked product for free users", () => {
    render(<EcosystemWidget currentProduct="harvest" userTier="free" />);

    // Open panel
    fireEvent.click(screen.getAllByRole("button")[0]);

    // Find DevMentor (locked for free users per logic) and click
    fireEvent.click(screen.getByText("DevMentor"));

    expect(window.location.href).toContain("accounts.naturequest.dev/billing");
  });

  it("saves minimized state to localStorage", () => {
    render(<EcosystemWidget currentProduct="harvest" />);

    // Open panel
    fireEvent.click(screen.getAllByRole("button")[0]);

    // Click minimize (chevron-right button has no label, pick by title via DOM structure)
    const buttons = screen.getAllByRole("button");
    const minimize = buttons.find((b) => b.querySelector("svg"))!; // crude but sufficient here
    fireEvent.click(minimize);

    expect(localStorage.getItem("ecosystem-widget-state")).toBeTruthy();
  });
});
