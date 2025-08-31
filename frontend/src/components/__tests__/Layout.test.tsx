import { render, screen, fireEvent } from "@testing-library/react";
import Layout from "../Layout";

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
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
});

describe("Layout", () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });
  it("renders layout with navigation and footer", () => {
    render(
      <Layout currentPage="home">
        <div>Test content</div>
      </Layout>,
    );

    // Check for navigation - get the first occurrence (navigation title)
    const harvestElements = screen.getAllByText("Harvest.ai");
    expect(harvestElements.length).toBeGreaterThan(0);
    // Check that Early Alpha exists (multiple occurrences are OK)
    const earlyAlphaElements = screen.getAllByText("Early Alpha");
    expect(earlyAlphaElements.length).toBeGreaterThan(0);

    // Check for navigation links (multiple instances may exist in nav and footer)
    expect(screen.getAllByText("Home").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Demo").length).toBeGreaterThan(0);
    expect(screen.getAllByText("System").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Roadmap").length).toBeGreaterThan(0);

    // Check for footer
    expect(screen.getByText(/© 2024 Harvest.ai/)).toBeInTheDocument();

    // Check for content
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("highlights current page in navigation", () => {
    render(
      <Layout currentPage="demo">
        <div>Test content</div>
      </Layout>,
    );

    // Get the Demo link in navigation (should be the first one)
    const demoLinks = screen.getAllByText("Demo");
    const demoLink = demoLinks[0];
    expect(demoLink).toHaveClass("font-medium");
    expect(demoLink).toHaveClass("text-orange-500");
  });

  it("toggles dark mode when button is clicked", () => {
    render(
      <Layout currentPage="home">
        <div>Test content</div>
      </Layout>,
    );

    const darkModeButton = screen.getByLabelText("Toggle dark mode");
    fireEvent.click(darkModeButton);

    // Check that localStorage was called
    expect(localStorageMock.setItem).toHaveBeenCalledWith("harvest-dark-mode", "true");
  });

  it("applies correct layout structure", () => {
    render(
      <Layout currentPage="home">
        <div>Test content</div>
      </Layout>,
    );

    const layout = screen.getByText("Test content").closest("div")?.parentElement
      ?.parentElement?.parentElement;
    expect(layout).toHaveClass("min-h-screen");
    expect(layout).toHaveClass("flex");
    expect(layout).toHaveClass("flex-col");
  });

  it("renders navigation with correct positioning", () => {
    render(
      <Layout currentPage="home">
        <div>Test content</div>
      </Layout>,
    );

    const nav = screen.getByRole("navigation");
    expect(nav).toHaveClass("fixed");
    expect(nav).toHaveClass("w-full");
    expect(nav).toHaveClass("z-50");
  });

  it("renders main content with correct padding", () => {
    render(
      <Layout currentPage="home">
        <div>Test content</div>
      </Layout>,
    );

    const main = screen.getByRole("main");
    expect(main).toHaveClass("flex-1");
    expect(main).toHaveClass("pt-16");
  });
});
