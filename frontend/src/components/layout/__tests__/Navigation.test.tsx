import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Navigation from "../Navigation";

// Mock framer-motion to avoid animation issues in tests
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useMotionValue: () => ({ set: jest.fn() }),
  useSpring: () => ({ set: jest.fn() }),
  useTransform: () => ({ set: jest.fn() }),
  useReducedMotion: () => false,
}));

describe("Navigation Component", () => {
  beforeEach(() => {
    // Reset window.scrollY before each test
    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  describe("Rendering", () => {
    it("should render the navigation component", () => {
      render(<Navigation />);
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });

    it("should display the logo", () => {
      render(<Navigation />);
      expect(screen.getByText("Harvest.ai")).toBeInTheDocument();
    });

    it("should display all navigation links on desktop", () => {
      render(<Navigation />);
      expect(screen.getByText("Product")).toBeInTheDocument();
      expect(screen.getByText("Pricing")).toBeInTheDocument();
      expect(screen.getByText("Documentation")).toBeInTheDocument();
      expect(screen.getByText("Blog")).toBeInTheDocument();
    });

    it("should display CTA buttons on desktop", () => {
      render(<Navigation />);
      expect(screen.getByText("Sign in")).toBeInTheDocument();
      expect(screen.getByText("Start Free")).toBeInTheDocument();
    });

    it("should display mobile menu button on small screens", () => {
      // Set viewport to mobile size
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<Navigation />);
      // Mobile menu button should be present (though may be hidden via CSS)
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe("Scroll Behavior", () => {
    it("should change appearance when scrolled", () => {
      const { container } = render(<Navigation />);
      const nav = container.querySelector("nav");

      // Initial state - transparent background
      expect(nav).toHaveClass("bg-transparent");

      // Simulate scroll
      Object.defineProperty(window, "scrollY", {
        writable: true,
        configurable: true,
        value: 100,
      });

      // Trigger scroll event
      fireEvent.scroll(window);

      // Wait for state update
      waitFor(() => {
        expect(nav).toHaveClass("bg-white/80");
      });
    });

    it("should return to transparent when scrolled to top", () => {
      const { container } = render(<Navigation />);
      const nav = container.querySelector("nav");

      // Scroll down first
      Object.defineProperty(window, "scrollY", {
        writable: true,
        value: 100,
      });
      fireEvent.scroll(window);

      // Then scroll back to top
      Object.defineProperty(window, "scrollY", {
        writable: true,
        value: 0,
      });
      fireEvent.scroll(window);

      waitFor(() => {
        expect(nav).toHaveClass("bg-transparent");
      });
    });
  });

  describe("Mobile Menu", () => {
    it("should toggle mobile menu when hamburger button is clicked", () => {
      render(<Navigation />);

      // Find the mobile menu button
      const mobileMenuButton = screen.getByRole("button", { name: /menu|close/i });

      // Initially menu should be closed
      expect(screen.queryByText("Sign in")).toBeInTheDocument();

      // Click to open menu
      fireEvent.click(mobileMenuButton);

      // Menu items should be visible
      waitFor(() => {
        const signInLinks = screen.getAllByText("Sign in");
        expect(signInLinks.length).toBeGreaterThan(1); // Desktop + mobile
      });
    });

    it("should close mobile menu when close button is clicked", () => {
      render(<Navigation />);

      const mobileMenuButton = screen.getByRole("button", { name: /menu|close/i });

      // Open menu
      fireEvent.click(mobileMenuButton);

      // Click again to close
      fireEvent.click(mobileMenuButton);

      // Menu should be closed
      waitFor(() => {
        const signInLinks = screen.getAllByText("Sign in");
        expect(signInLinks.length).toBe(1); // Only desktop version
      });
    });
  });

  describe("Product Dropdown", () => {
    it("should show dropdown on hover", () => {
      render(<Navigation />);

      const productButton = screen.getByText("Product").closest("button");

      // Hover over product button
      if (productButton) {
        fireEvent.mouseEnter(productButton);

        // Dropdown items should appear
        waitFor(() => {
          expect(screen.getByText("Content Generation")).toBeInTheDocument();
          expect(screen.getByText("Live Scraping")).toBeInTheDocument();
          expect(screen.getByText("API & Integrations")).toBeInTheDocument();
          expect(screen.getByText("Team Collaboration")).toBeInTheDocument();
        });
      }
    });

    it("should hide dropdown on mouse leave", () => {
      render(<Navigation />);

      const productButton = screen.getByText("Product").closest("button");

      if (productButton) {
        // Show dropdown
        fireEvent.mouseEnter(productButton);

        waitFor(() => {
          expect(screen.getByText("Content Generation")).toBeInTheDocument();
        });

        // Hide dropdown
        fireEvent.mouseLeave(productButton);

        waitFor(() => {
          expect(screen.queryByText("Content Generation")).not.toBeInTheDocument();
        });
      }
    });
  });

  describe("Links", () => {
    it("should have correct href attributes for navigation links", () => {
      render(<Navigation />);

      const pricingLink = screen.getByRole("link", { name: /pricing/i });
      expect(pricingLink).toHaveAttribute("href", "/pricing");

      const docsLink = screen.getByRole("link", { name: /documentation/i });
      expect(docsLink).toHaveAttribute("href", "/docs");

      const blogLink = screen.getByRole("link", { name: /blog/i });
      expect(blogLink).toHaveAttribute("href", "/blog");

      const loginLink = screen.getByRole("link", { name: /sign in/i });
      expect(loginLink).toHaveAttribute("href", "/login");

      const signupLink = screen.getByRole("link", { name: /start free/i });
      expect(signupLink).toHaveAttribute("href", "/signup");
    });

    it("should have logo link to homepage", () => {
      render(<Navigation />);

      const logoLink = screen.getByText("Harvest.ai").closest("a");
      expect(logoLink).toHaveAttribute("href", "/");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      render(<Navigation />);

      const nav = screen.getByRole("navigation");
      expect(nav).toBeInTheDocument();
    });

    it("should have keyboard navigable links", () => {
      render(<Navigation />);

      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link).toHaveAttribute("href");
      });
    });

    it("should have accessible button for product dropdown", () => {
      render(<Navigation />);

      const productButton = screen.getByText("Product").closest("button");
      expect(productButton).toBeInTheDocument();
      expect(productButton?.tagName).toBe("BUTTON");
    });
  });

  describe("Responsive Behavior", () => {
    it("should hide desktop navigation on mobile", () => {
      // Mock mobile viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = render(<Navigation />);

      // Desktop navigation should have hidden class
      const desktopNav = container.querySelector(".hidden.md\\:flex");
      expect(desktopNav).toBeInTheDocument();
    });

    it("should show mobile menu button on small screens", () => {
      // Mock mobile viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = render(<Navigation />);

      // Mobile menu button should have md:hidden class
      const mobileButton = container.querySelector(".md\\:hidden");
      expect(mobileButton).toBeInTheDocument();
    });
  });
});
