# 🚀 BYOK Demo Tour - Complete Guide

## Overview

The BYOK Demo Tour is an interactive, guided walkthrough that showcases Harvest.ai's Bring Your Own Key features through a seamless user experience with animations, mock data, and real-time feedback.

## 🎭 How the Tour Works

### Tour Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Visits Page                         │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Check localStorage                            │
│                  Is first-time visitor?                          │
└─────────────────────────────────────────────────────────────────┘
                    │                          │
              Yes   │                          │   No
                    ▼                          ▼
┌──────────────────────────┐    ┌──────────────────────────────────┐
│   Show floating button   │    │    Show floating button          │
│   (after 2 seconds)      │    │    (after 2 seconds)             │
│   + Notification dot     │    │    No notification dot           │
│   + Pulse animation      │    │    Standard appearance           │
└──────────────────────────┘    └──────────────────────────────────┘
                    │                          │
                    ▼                          ▼
┌──────────────────────────┐    ┌──────────────────────────────────┐
│   Auto-start tour        │    │    Wait for manual trigger      │
│   (after 3 more seconds) │    │    (button click)                │
└──────────────────────────┘    └──────────────────────────────────┘
                    │                          │
                    └──────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Tour Overlay Opens                        │
│                   (Full-screen experience)                       │
└─────────────────────────────────────────────────────────────────┘
```

## 🎬 Tour Components

### 1. **DemoTourButton** (Floating Action Button)

Located: `src/components/demo/DemoTourButton.tsx`

**Features:**

- 🎯 Fixed position (bottom-right corner)
- ⏱️ Appears after a brief delay (2s in production; immediate in tests)
- 🔔 Notification dot for first-time visitors
- ✨ Hover effects with sparkles
- 💫 Pulse animation ring
- 🎨 Gradient background (blue to purple)

**Behavior:**

```typescript
// First-time visitor
- Button appears → Shows notification → Auto-starts tour → Hides after completion

// Returning visitor
- Button appears → No notification → Waits for click → Manual launch
```

### 2. **DemoTour** (Tour Overlay)

Located: `src/components/demo/DemoTour.tsx`

**Tour Steps:**

1. **Welcome** - Introduction to Harvest.ai BYOK
2. **Key Management** - Secure API key configuration
3. **AI Providers** - Multiple provider support
4. **Analytics** - Real-time usage metrics
5. **Cost Tracking** - Monitor spending
6. **Security** - Enterprise-grade protection
7. **Get Started** - Next steps and resources

**Navigation Options:**

- Click "Next"/"Back" buttons
- Keyboard shortcuts:
  - `→` or `Enter` - Next step
  - `←` - Previous step
  - `1-7` - Jump to specific step
  - `ESC` - Exit tour
- Click progress dots to jump
- Click backdrop to exit

### 3. **DemoDashboard** (Mock Data Display)

Located: `src/components/demo/DemoDashboard.tsx`

**Mock Metrics:**

- 4 Active API Keys
- 12,847 Monthly API Calls
- $2,340 Cost Saved
- 8 AI Models Available

**Charts:**

- Usage trends (line chart)
- Provider distribution (pie chart)
- Cost comparison (bar chart)

### 4. **DemoTourStatus** (System Monitor)

Located: `src/components/demo/DemoTourStatus.tsx`

**Real-time Metrics:**

- Total tour starts
- Completion rate
- Average duration
- Currently active users
- Step dropoff funnel
- Performance (FPS, load time, memory)
- User engagement events

## 🔄 State Management

### localStorage Keys:

```javascript
// Track if user has visited before
localStorage.setItem("harvest_visited", "true");

// Track if user completed the tour
localStorage.setItem("harvest_tour_completed", "true");

// Track last step viewed (for resuming)
localStorage.setItem("harvest_tour_step", "3");
```

### Tour Hook (`useDemoTour`):

```typescript
interface TourState {
  isVisible: boolean; // Is tour currently showing
  currentStep: number; // Current step (0-6)
  isCompleted: boolean; // Has user completed tour
  hasVisited: boolean; // Is returning visitor
}
```

## 🎨 Visual Experience

### Animations (Framer Motion):

```typescript
// Button entrance
initial={{ opacity: 0, scale: 0.8 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ type: "spring", duration: 0.5 }}

// Tour card slide
initial={{ opacity: 0, y: 50 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: 50 }}

// Progress dots
animate={{ scale: isActive ? 1.2 : 1 }}
```

### Color Scheme:

- Primary: Blue to Purple gradient
- Success: Green (#10b981)
- Warning: Yellow (#f59e0b)
- Error: Red (#ef4444)
- Background: White/Gray overlay

## 📱 Responsive Design

### Desktop (>1024px):

- Tour card: 600px width
- Button: 64px diameter
- Full animations enabled

### Tablet (768-1024px):

- Tour card: 500px width
- Button: 56px diameter
- Optimized animations

### Mobile (<768px):

- Tour card: 90% viewport width
- Button: 48px diameter
- Reduced animations for performance

## ⚡ Performance Optimization

### Lazy Loading:

```typescript
// Only load tour when needed
const DemoTour = lazy(() => import("./DemoTour"));

// Lazy load heavy assets
const mockData = lazy(() => import("./mockData"));
```

### Animation Performance:

- GPU-accelerated transforms
- `will-change` CSS property
- RequestAnimationFrame for smooth updates
- Debounced scroll/resize handlers

## 🧪 Testing Access Points

### Storybook Stories:

1. **Tour Button** - `http://localhost:6007/?path=/story/demo-tour-button--default`
2. **Tour Overlay** - `http://localhost:6007/?path=/story/demo-tour-overlay--manual`
3. **Status Monitor** - `http://localhost:6007/?path=/story/demo-tour-status-monitor--default`

### Test Scenarios:

```bash
# Run all tests
npm test

# Run E2E tests
npm run test:e2e

# Run specific story
npm run storybook
# Navigate to Demo section
```

## 🚀 Quick Start

### For Developers:

```bash
# 1. Start Storybook
npm run storybook

# 2. Navigate to Demo section
# 3. Test different scenarios:
#    - First Time Visitor
#    - Returning Visitor
#    - Mobile View
#    - Dark Mode
```

### For Testing:

```javascript
// Reset to first-time visitor
localStorage.clear();
location.reload();

// Skip to returning visitor
localStorage.setItem("harvest_visited", "true");
location.reload();

// Test completion flow
localStorage.setItem("harvest_tour_completed", "true");
location.reload();
```

## 📊 Analytics Events

### Tracked Events:

```typescript
trackEvent("tour_started", {
  trigger: "auto" | "manual",
  timestamp: Date.now(),
});

trackEvent("tour_step_viewed", {
  step: 1 - 7,
  duration: ms,
});

trackEvent("tour_completed", {
  totalDuration: ms,
  stepsViewed: [1, 2, 3, 4, 5, 6, 7],
});

trackEvent("tour_skipped", {
  exitStep: number,
  reason: "backdrop_click" | "esc_key" | "close_button",
});
```

## 🎯 Success Metrics

### Key Performance Indicators:

- **Completion Rate**: >70%
- **Time to First Action**: <30 seconds
- **Feature Discovery**: >85%
- **User Satisfaction**: >4.5/5 stars

### Conversion Goals:

- **Demo to Trial**: +35%
- **Support Tickets**: -30%
- **Feature Adoption**: +40%
- **User Engagement**: +50%

## 🐛 Troubleshooting

### Common Issues:

**Tour doesn't auto-start:**

```javascript
// Check localStorage
console.log("Visited:", localStorage.getItem("harvest_visited"));
console.log("Completed:", localStorage.getItem("harvest_tour_completed"));
// Clear if needed
localStorage.clear();
```

**Button not appearing:**

```javascript
// Check component mount
console.log("Tour button mounted");
// Wait 2+ seconds
setTimeout(() => {
  console.log("Button should be visible now");
}, 2100);
```

**Performance issues:**

```javascript
// Check metrics
const metrics = performance.getEntriesByType("measure");
console.log("Performance:", metrics);
// Reduce animations if needed
```

## 📝 Configuration

### Timing Configuration:

```typescript
const TIMING = {
  // In tests BUTTON_APPEAR_DELAY is effectively 0 for determinism
  BUTTON_APPEAR_DELAY: 2000, // 2 seconds (production)
  AUTO_START_DELAY: 3000, // 3 seconds after button
  HIDE_AFTER_COMPLETE: 5000, // 5 seconds
  ANIMATION_DURATION: 500, // 0.5 seconds
  STEP_TRANSITION: 300, // 0.3 seconds
};
```

### Feature Flags:

```typescript
const FEATURES = {
  AUTO_START_ENABLED: true,
  SHOW_NOTIFICATION: true,
  ANALYTICS_ENABLED: true,
  PERFORMANCE_MONITORING: true,
  KEYBOARD_NAVIGATION: true,
};
```

---

## 🎓 Summary

The BYOK Demo Tour provides an engaging, interactive way for users to discover Harvest.ai's key features. It combines:

1. **Smart Detection** - Identifies first-time vs returning visitors
2. **Progressive Disclosure** - Shows information step-by-step
3. **Interactive Elements** - Clickable, keyboard-navigable interface
4. **Visual Feedback** - Animations and transitions
5. **Performance Monitoring** - Real-time metrics tracking
6. **Accessibility** - Full keyboard and screen reader support

The tour is designed to be non-intrusive for returning visitors while providing maximum value for first-time users, ultimately driving engagement and conversion.
