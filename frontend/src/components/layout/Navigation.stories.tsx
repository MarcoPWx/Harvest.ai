import type { Meta, StoryObj } from "@storybook/react";
import Navigation from "./Navigation";
import { useEffect } from "react";

// Wrapper to simulate scroll for testing
const ScrollWrapper = ({
  children,
  scrolled,
}: {
  children: React.ReactNode;
  scrolled?: boolean;
}) => {
  useEffect(() => {
    if (scrolled) {
      // Simulate scroll
      window.scrollY = 100;
      window.dispatchEvent(new Event("scroll"));
    } else {
      window.scrollY = 0;
      window.dispatchEvent(new Event("scroll"));
    }

    return () => {
      window.scrollY = 0;
    };
  }, [scrolled]);

  return (
    <div style={{ minHeight: "200vh", paddingTop: "80px" }}>
      {children}
      <div style={{ padding: "2rem", marginTop: "2rem" }}>
        <h2>Page Content</h2>
        <p>This is placeholder content to demonstrate the navigation component.</p>
        <p>Scroll down to see the navigation background change.</p>
      </div>
    </div>
  );
};

const meta = {
  title: "Components/Layout/Navigation",
  component: Navigation,
  parameters: {
    layout: "fullscreen",
    repoDocPath: "/docs/architecture/SYSTEM_ARCHITECTURE.md",
    repoDocLabel: "System Architecture",
    docs: {
      description: {
        component:
          "The Navigation component provides the main site navigation with dropdown menus, mobile responsiveness, and scroll effects.",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story, context) => (
      <ScrollWrapper scrolled={context.args.scrolled}>
        <Story />
      </ScrollWrapper>
    ),
  ],
} satisfies Meta<typeof Navigation>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default state - not scrolled
export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: "Navigation in its default state with transparent background.",
      },
    },
  },
};

// Scrolled state with blurred background
export const Scrolled: Story = {
  args: {
    scrolled: true,
  } as any,
  parameters: {
    docs: {
      description: {
        story: "Navigation after scrolling with blurred white background.",
      },
    },
  },
};

// Mobile view
export const Mobile: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          "Navigation in mobile view with hamburger menu. Resize your browser to see the mobile menu.",
      },
    },
    viewport: {
      defaultViewport: "iphone12",
    },
  },
};

// Tablet view
export const Tablet: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: "Navigation in tablet view.",
      },
    },
    viewport: {
      defaultViewport: "ipad",
    },
  },
};

// With dark background to show contrast
export const OnDarkBackground: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          minHeight: "100vh",
        }}
      >
        <Story />
        <div style={{ padding: "2rem", color: "white" }}>
          <h2>Dark Background</h2>
          <p>Navigation component displayed on a dark gradient background.</p>
        </div>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: "Navigation on a dark background to show visibility and contrast.",
      },
    },
  },
};

// With image background
export const OnImageBackground: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&h=1080&fit=crop)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "100vh",
        }}
      >
        <Story />
        <div
          style={{
            padding: "2rem",
            color: "white",
            backgroundColor: "rgba(0,0,0,0.5)",
            marginTop: "2rem",
          }}
        >
          <h2>Image Background</h2>
          <p>Navigation component displayed over an image background.</p>
        </div>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: "Navigation over an image background showing transparency effect.",
      },
    },
  },
};

// Interactive playground
export const Playground: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          "Interactive playground to test the navigation component. Try scrolling the page or resizing the browser window.",
      },
    },
  },
};
