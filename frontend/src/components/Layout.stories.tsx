import type { Meta, StoryObj } from "@storybook/react";
import Layout from "./Layout";
import { useEffect } from "react";

// Sample content for demonstration
const SampleContent = () => (
  <div style={{ padding: "2rem", minHeight: "60vh" }}>
    <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
      Sample Page Content
    </h1>
    <p style={{ marginBottom: "1rem", lineHeight: "1.6" }}>
      This is sample content to demonstrate the Layout component. The Layout provides consistent
      navigation, footer, and ecosystem widget across all pages of the application.
    </p>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "1rem",
        marginTop: "2rem",
      }}
    >
      <div
        style={{
          padding: "1.5rem",
          backgroundColor: "rgba(251, 146, 60, 0.1)",
          borderRadius: "0.5rem",
          border: "1px solid rgba(251, 146, 60, 0.3)",
        }}
      >
        <h3 style={{ fontWeight: "600", marginBottom: "0.5rem" }}>Feature 1</h3>
        <p style={{ fontSize: "0.875rem", opacity: "0.8" }}>
          Description of the first feature that showcases the layout capabilities.
        </p>
      </div>
      <div
        style={{
          padding: "1.5rem",
          backgroundColor: "rgba(251, 146, 60, 0.1)",
          borderRadius: "0.5rem",
          border: "1px solid rgba(251, 146, 60, 0.3)",
        }}
      >
        <h3 style={{ fontWeight: "600", marginBottom: "0.5rem" }}>Feature 2</h3>
        <p style={{ fontSize: "0.875rem", opacity: "0.8" }}>
          Another feature description to fill out the content area.
        </p>
      </div>
      <div
        style={{
          padding: "1.5rem",
          backgroundColor: "rgba(251, 146, 60, 0.1)",
          borderRadius: "0.5rem",
          border: "1px solid rgba(251, 146, 60, 0.3)",
        }}
      >
        <h3 style={{ fontWeight: "600", marginBottom: "0.5rem" }}>Feature 3</h3>
        <p style={{ fontSize: "0.875rem", opacity: "0.8" }}>
          Third feature showcasing responsive grid layout.
        </p>
      </div>
    </div>
  </div>
);

// Demo page content
const DemoContent = () => (
  <div style={{ padding: "2rem", minHeight: "60vh" }}>
    <h1
      style={{
        fontSize: "2.5rem",
        fontWeight: "bold",
        marginBottom: "1rem",
        background: "linear-gradient(to right, #fb923c, #f97316)",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        color: "transparent",
      }}
    >
      Demo Page
    </h1>
    <p style={{ marginBottom: "2rem", fontSize: "1.125rem" }}>
      Experience our AI-powered content transformation in action.
    </p>
    <div
      style={{
        padding: "2rem",
        backgroundColor: "rgba(0,0,0,0.05)",
        borderRadius: "1rem",
        border: "2px dashed rgba(0,0,0,0.2)",
      }}
    >
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Try It Out</h2>
      <textarea
        placeholder="Paste your content here..."
        style={{
          width: "100%",
          minHeight: "150px",
          padding: "1rem",
          borderRadius: "0.5rem",
          border: "1px solid rgba(0,0,0,0.2)",
          fontSize: "1rem",
        }}
      />
      <button
        style={{
          marginTop: "1rem",
          padding: "0.75rem 2rem",
          background: "linear-gradient(to right, #fb923c, #f97316)",
          color: "white",
          border: "none",
          borderRadius: "0.5rem",
          fontSize: "1rem",
          fontWeight: "600",
          cursor: "pointer",
        }}
      >
        Transform Content
      </button>
    </div>
  </div>
);

// System page content
const SystemContent = () => (
  <div style={{ padding: "2rem", minHeight: "60vh" }}>
    <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
      System Architecture
    </h1>
    <div style={{ marginTop: "2rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
          Technical Stack
        </h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {["Next.js 15", "React 19", "TypeScript", "Tailwind CSS", "OpenAI API"].map((tech) => (
            <li
              key={tech}
              style={{ padding: "0.5rem 0", borderBottom: "1px solid rgba(0,0,0,0.1)" }}
            >
              ✅ {tech}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
          Architecture
        </h2>
        <div
          style={{ padding: "1rem", backgroundColor: "rgba(0,0,0,0.05)", borderRadius: "0.5rem" }}
        >
          <pre style={{ fontSize: "0.875rem", whiteSpace: "pre-wrap" }}>
            {`┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │
└─────────────┘     └─────────────┘
       │                    │
       ▼                    ▼
┌─────────────┐     ┌─────────────┐
│    Cache    │     │   AI APIs   │
└─────────────┘     └─────────────┘`}
          </pre>
        </div>
      </div>
    </div>
  </div>
);

// Roadmap page content
const RoadmapContent = () => (
  <div style={{ padding: "2rem", minHeight: "60vh" }}>
    <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
      Product Roadmap
    </h1>
    <div style={{ marginTop: "2rem" }}>
      <div style={{ marginBottom: "3rem" }}>
        <h2
          style={{ fontSize: "1.25rem", fontWeight: "600", color: "#10b981", marginBottom: "1rem" }}
        >
          ✅ Completed
        </h2>
        <ul style={{ paddingLeft: "1.5rem" }}>
          <li>Basic UI implementation</li>
          <li>Quiz generation prototype</li>
          <li>Storybook integration</li>
        </ul>
      </div>
      <div style={{ marginBottom: "3rem" }}>
        <h2
          style={{ fontSize: "1.25rem", fontWeight: "600", color: "#f59e0b", marginBottom: "1rem" }}
        >
          🚧 In Progress
        </h2>
        <ul style={{ paddingLeft: "1.5rem" }}>
          <li>Backend API development</li>
          <li>Authentication system</li>
          <li>Enhanced testing suite</li>
        </ul>
      </div>
      <div>
        <h2
          style={{ fontSize: "1.25rem", fontWeight: "600", color: "#6b7280", marginBottom: "1rem" }}
        >
          📋 Planned
        </h2>
        <ul style={{ paddingLeft: "1.5rem" }}>
          <li>Multiple output formats</li>
          <li>Team collaboration features</li>
          <li>Advanced AI models integration</li>
        </ul>
      </div>
    </div>
  </div>
);

const meta = {
  title: "Components/Layout",
  component: Layout,
  parameters: {
    layout: "fullscreen",
    repoDocPath: "/docs/architecture/SYSTEM_ARCHITECTURE.md",
    repoDocLabel: "System Architecture",
    docs: {
      description: {
        component:
          "The Layout component provides the main application structure including navigation, footer, and ecosystem widget. It manages dark mode state and provides consistent layout across all pages.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    currentPage: {
      control: "select",
      options: ["home", "demo", "system", "roadmap"],
      description: "The current active page for navigation highlighting",
    },
    children: {
      control: false,
      description: "Page content to be rendered within the layout",
    },
  },
} satisfies Meta<typeof Layout>;

export default meta;
type Story = StoryObj<typeof meta>;

// Home page layout
export const HomePage: Story = {
  args: {
    currentPage: "home",
    children: <SampleContent />,
  },
  parameters: {
    docs: {
      description: {
        story: "Layout with home page selected in navigation.",
      },
    },
  },
};

// Demo page layout
export const DemoPage: Story = {
  args: {
    currentPage: "demo",
    children: <DemoContent />,
  },
  parameters: {
    docs: {
      description: {
        story: "Layout with demo page selected, showing demo-specific content.",
      },
    },
  },
};

// System page layout
export const SystemPage: Story = {
  args: {
    currentPage: "system",
    children: <SystemContent />,
  },
  parameters: {
    docs: {
      description: {
        story: "Layout with system architecture page selected.",
      },
    },
  },
};

// Roadmap page layout
export const RoadmapPage: Story = {
  args: {
    currentPage: "roadmap",
    children: <RoadmapContent />,
  },
  parameters: {
    docs: {
      description: {
        story: "Layout with roadmap page selected.",
      },
    },
  },
};

// Mobile view
export const Mobile: Story = {
  args: {
    currentPage: "home",
    children: <SampleContent />,
  },
  parameters: {
    docs: {
      description: {
        story: "Layout in mobile view with responsive navigation and footer.",
      },
    },
    viewport: {
      defaultViewport: "iphone12",
    },
  },
};

// Tablet view
export const Tablet: Story = {
  args: {
    currentPage: "home",
    children: <SampleContent />,
  },
  parameters: {
    docs: {
      description: {
        story: "Layout in tablet view.",
      },
    },
    viewport: {
      defaultViewport: "ipad",
    },
  },
};

// With long content to show sticky navigation
export const WithLongContent: Story = {
  args: {
    currentPage: "home",
    children: (
      <div style={{ padding: "2rem" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
          Long Content Page
        </h1>
        <p style={{ marginBottom: "2rem" }}>
          Scroll down to see the sticky navigation and how it handles long content.
        </p>
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            style={{
              marginBottom: "2rem",
              padding: "1.5rem",
              backgroundColor: "rgba(251, 146, 60, 0.05)",
              borderRadius: "0.5rem",
            }}
          >
            <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "0.5rem" }}>
              Section {i + 1}
            </h2>
            <p style={{ lineHeight: "1.6" }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </p>
          </div>
        ))}
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "Layout with long scrollable content to demonstrate sticky navigation behavior.",
      },
    },
  },
};

// Empty state
export const EmptyState: Story = {
  args: {
    currentPage: "home",
    children: (
      <div
        style={{
          padding: "2rem",
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📭</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "0.5rem" }}>
            No Content Yet
          </h2>
          <p style={{ opacity: "0.7" }}>This page is currently empty.</p>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "Layout with empty state content.",
      },
    },
  },
};

// Interactive playground
export const Playground: Story = {
  args: {
    currentPage: "home",
    children: <SampleContent />,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Interactive playground to test the Layout component with different configurations. Try toggling dark mode or changing the current page.",
      },
    },
  },
};

// With custom content
export const WithCustomContent: Story = {
  args: {
    currentPage: "home",
    children: (
      <div style={{ padding: "2rem", minHeight: "60vh" }}>
        <div style={{ maxWidth: "48rem", margin: "0 auto", textAlign: "center" }}>
          <h1
            style={{
              fontSize: "3rem",
              fontWeight: "bold",
              marginBottom: "1rem",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Welcome to Harvest.ai
          </h1>
          <p style={{ fontSize: "1.25rem", marginBottom: "2rem", opacity: "0.8" }}>
            Transform your content with the power of AI
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <button
              style={{
                padding: "0.75rem 2rem",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "9999px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Get Started
            </button>
            <button
              style={{
                padding: "0.75rem 2rem",
                background: "transparent",
                color: "#764ba2",
                border: "2px solid #764ba2",
                borderRadius: "9999px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: "Layout with custom styled content demonstrating flexibility.",
      },
    },
  },
};
