import { render, screen } from "@testing-library/react";
import Footer from "../Footer";

describe("Footer", () => {
  it("renders footer with correct content", () => {
    render(<Footer darkMode={false} />);

    // Check for brand section
    expect(screen.getByText("Harvest.ai")).toBeInTheDocument();
    expect(screen.getByText(/AI-powered content transformation platform/)).toBeInTheDocument();

    // Check for quick links
    expect(screen.getByText("Quick Links")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Demo")).toBeInTheDocument();
    expect(screen.getByText("System")).toBeInTheDocument();
    expect(screen.getByText("Roadmap")).toBeInTheDocument();

    // Check for status section
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Demo Working")).toBeInTheDocument();
    expect(screen.getByText("Early Alpha")).toBeInTheDocument();
    expect(screen.getByText("Building in Public")).toBeInTheDocument();

    // Check for copyright
    expect(screen.getByText(/© 2024 Harvest.ai/)).toBeInTheDocument();
    expect(screen.getByText(/Made with ❤️ for content creators/)).toBeInTheDocument();
  });

  it("applies dark mode styles correctly", () => {
    render(<Footer darkMode={true} />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveClass("bg-gray-950");
    expect(footer).toHaveClass("border-gray-800");
  });

  it("applies light mode styles correctly", () => {
    render(<Footer darkMode={false} />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveClass("bg-white");
    expect(footer).toHaveClass("border-gray-200");
  });

  it("renders responsive grid layout", () => {
    render(<Footer darkMode={false} />);

    const grid = screen.getByText("Quick Links").closest("div")?.parentElement;
    expect(grid).toHaveClass("grid");
    expect(grid).toHaveClass("grid-cols-1");
    expect(grid).toHaveClass("md:grid-cols-3");
  });

  it("renders status indicators with correct colors", () => {
    render(<Footer darkMode={false} />);

    const statusIndicators = screen
      .getAllByRole("generic")
      .filter(
        (el) =>
          el.querySelector(".bg-green-500") ||
          el.querySelector(".bg-orange-500") ||
          el.querySelector(".bg-blue-500"),
      );

    expect(statusIndicators.length).toBeGreaterThan(0);
  });
});
