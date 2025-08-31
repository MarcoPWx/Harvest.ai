import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DemoTour, useDemoTour } from "@/components/demo/DemoTour";
import "@/styles/demo-tour.css";

const meta = {
  title: "Demo/Interactive Tour",
  component: DemoTour,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# Interactive Demo Tour

An engaging onboarding experience that guides users through the BYOK features with animated highlights and step-by-step instructions.

## Features
- 🎯 6-step interactive walkthrough
- ✨ Animated floating elements and sparkles
- 🎨 Gradient animations and smooth transitions
- 📍 Position-aware tooltips
- 💾 Persistent completion state
- 🌙 Dark mode support

## Usage

\`\`\`tsx
import { DemoTour, useDemoTour } from '@/components/demo/DemoTour';

function App() {
  const { shouldShowTour, completeTour, startTour } = useDemoTour();
  
  return (
    <>
      <DemoTour 
        visible={shouldShowTour}
        onComplete={completeTour}
      />
      <button onClick={startTour}>Start Tour</button>
    </>
  );
}
\`\`\`
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    visible: {
      control: "boolean",
      description: "Controls tour visibility",
    },
    onComplete: {
      action: "tour-completed",
      description: "Callback when tour is completed or skipped",
    },
    onStepChange: {
      action: "step-changed",
      description: "Callback when tour step changes",
    },
  },
} satisfies Meta<typeof DemoTour>;

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive wrapper component for stories
const TourDemo = ({
  showOnMount = false,
  autoStart = false,
  mockElements = false,
}: {
  showOnMount?: boolean;
  autoStart?: boolean;
  mockElements?: boolean;
}) => {
  const [isVisible, setIsVisible] = useState(showOnMount);
  const [currentStep, setCurrentStep] = useState(0);
  const [completionCount, setCompletionCount] = useState(0);

  const handleComplete = () => {
    setIsVisible(false);
    setCompletionCount((prev) => prev + 1);
    console.log("Tour completed!");
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
    console.log("Step changed to:", step);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      {/* Control Panel */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Demo Tour Control Panel
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Tour Status
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Visible:</span>
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      isVisible ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {isVisible ? "Active" : "Hidden"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Current Step:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {currentStep + 1} / 6
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Completions:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {completionCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setIsVisible(true)}
                  disabled={isVisible}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                    isVisible
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  Start Tour
                </button>
                <button
                  onClick={() => setIsVisible(false)}
                  disabled={!isVisible}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                    !isVisible
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`}
                >
                  Stop Tour
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem("harvest_tour_completed");
                    alert("Tour completion state reset!");
                  }}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium transition-colors"
                >
                  Reset Completion State
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mock UI Elements */}
      {mockElements && (
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Mock Dashboard
              </h3>
              <button
                data-tour="byok-button"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                New BYOK Session
              </button>
            </div>

            <div data-tour="provider-select" className="grid grid-cols-3 gap-3 mb-4">
              {["OpenAI", "Anthropic", "Google"].map((provider) => (
                <div
                  key={provider}
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-center"
                >
                  {provider}
                </div>
              ))}
            </div>

            <div
              data-tour="analytics"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4"
            >
              <h4 className="font-semibold mb-2">Usage Analytics</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Tokens: 45.2K</div>
                <div>Cost: $1.36</div>
                <div>Sessions: 12</div>
                <div>Requests: 342</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tour Component */}
      <DemoTour visible={isVisible} onComplete={handleComplete} onStepChange={handleStepChange} />
    </div>
  );
};

// Default story
export const Default: Story = {
  render: () => <TourDemo showOnMount={false} />,
};

// Auto-start story
export const AutoStart: Story = {
  render: () => <TourDemo showOnMount={true} />,
  parameters: {
    docs: {
      description: {
        story: "Tour starts automatically when the component mounts.",
      },
    },
  },
};

// With mock elements story
export const WithMockElements: Story = {
  render: () => <TourDemo showOnMount={false} mockElements={true} />,
  parameters: {
    docs: {
      description: {
        story:
          "Includes mock UI elements that the tour can highlight. Try starting the tour to see the highlight effects!",
      },
    },
  },
};

// Hook usage example
export const HookUsage: Story = {
  render: () => {
    const Component = () => {
      const { shouldShowTour, isLoading, startTour, resetTour, completeTour } = useDemoTour();
      const [tourVisible, setTourVisible] = useState(false);

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              useDemoTour Hook Example
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Hook State</h3>
                <pre className="text-sm text-gray-700 dark:text-gray-300">
                  {JSON.stringify({ shouldShowTour, isLoading }, null, 2)}
                </pre>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    startTour();
                    setTourVisible(true);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Start Tour
                </button>
                <button
                  onClick={resetTour}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Reset Tour
                </button>
              </div>
            </div>
          </div>

          <DemoTour
            visible={tourVisible}
            onComplete={() => {
              completeTour();
              setTourVisible(false);
            }}
          />
        </div>
      );
    };

    return <Component />;
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates how to use the `useDemoTour` hook for managing tour state programmatically.",
      },
    },
  },
};

// Tour steps preview
export const TourStepsPreview: Story = {
  render: () => {
    const steps = [
      { title: "Welcome", emoji: "🎯", color: "from-purple-500 to-pink-500" },
      { title: "BYOK", emoji: "🔐", color: "from-blue-500 to-cyan-500" },
      { title: "Security", emoji: "✨", color: "from-green-500 to-emerald-500" },
      { title: "Providers", emoji: "⚡", color: "from-orange-500 to-red-500" },
      { title: "Analytics", emoji: "📈", color: "from-indigo-500 to-purple-500" },
      { title: "Demo Mode", emoji: "🧪", color: "from-yellow-500 to-orange-500" },
    ];

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Tour Steps Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {steps.map((step, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center mb-4`}
                >
                  <span className="text-2xl">{step.emoji}</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Step {index + 1}: {step.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Interactive step with animations and highlights
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "Visual preview of all tour steps with their associated colors and emojis.",
      },
    },
  },
};
