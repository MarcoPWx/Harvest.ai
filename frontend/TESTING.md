# Testing Documentation

This document provides a comprehensive guide to the testing infrastructure for the Harvest.ai frontend application.

## Table of Contents

- [Overview](#overview)
- [Testing Stack](#testing-stack)
- [Running Tests](#running-tests)
- [Unit Testing](#unit-testing)
- [E2E Testing](#e2e-testing)
- [Storybook Testing](#storybook-testing)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)

## Overview

Our testing strategy includes three main types of tests:

1. **Unit Tests** - Component and function-level testing with Jest and React Testing Library
2. **E2E Tests** - End-to-end testing with Playwright
3. **Visual Tests** - Component documentation and visual testing with Storybook

## Testing Stack

- **Jest** - JavaScript testing framework
- **React Testing Library** - React component testing utilities
- **Playwright** - Cross-browser E2E testing
- **Storybook** - Component development and visual testing
- **Vitest** - Fast unit test runner (integrated with Storybook)

## Running Tests

### Quick Start

```bash
# Run all tests (unit + e2e)
npm run test:all

# Run unit tests only
npm test

# Run e2e tests only
npm run test:e2e

# Run Storybook
npm run storybook
```

### Unit Testing Commands

```bash
# Run unit tests once
npm test

# Run unit tests in watch mode
npm run test:watch

# Run unit tests with coverage report
npm run test:coverage

# Run unit tests in CI mode
npm run test:ci
```

### E2E Testing Commands

```bash
# Run all e2e tests headless
npm run test:e2e

# Run e2e tests with UI (interactive mode)
npm run test:e2e:ui

# Run e2e tests in headed browser
npm run test:e2e:headed

# Debug e2e tests
npm run test:e2e:debug

# Run e2e tests for specific browser
npm run test:e2e:chrome
npm run test:e2e:firefox
npm run test:e2e:webkit
```

### Storybook Commands

```bash
# Start Storybook dev server
npm run storybook

# Build static Storybook
npm run build-storybook

# Run Storybook tests
npm run storybook:test
```

### Validation Commands

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Run all validations (type-check + lint + tests)
npm run validate
```

## Unit Testing

### Writing Unit Tests

Unit tests are located alongside components in `__tests__` folders or as `.test.tsx` files.

#### Component Test Example

```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Testing Utilities

We provide custom testing utilities in `src/test-utils/`:

```typescript
import { render, mockLocalStorage, setViewport } from '@/test-utils';

// Use custom render with providers
const { getByText } = render(<MyComponent />);

// Mock localStorage
const storage = mockLocalStorage();

// Set viewport for responsive testing
setViewport(viewports.mobile.width, viewports.mobile.height);
```

### Coverage Reports

Generate coverage reports with:

```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory. Open `coverage/lcov-report/index.html` to view the HTML report.

## E2E Testing

### Writing E2E Tests

E2E tests are located in the `tests/e2e/` directory.

#### E2E Test Example

```typescript
// tests/e2e/navigation.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("should navigate between pages", async ({ page }) => {
    await page.goto("/");

    // Click demo link
    await page.getByRole("link", { name: "Demo" }).click();
    await expect(page).toHaveURL("/demo");

    // Check content
    await expect(page.getByRole("heading", { name: /demo/i })).toBeVisible();
  });
});
```

### Running E2E Tests Locally

1. Start the development server:

   ```bash
   npm run dev
   ```

2. In another terminal, run tests:
   ```bash
   npm run test:e2e
   ```

### Visual Regression Testing

E2E tests can capture screenshots for visual regression:

```typescript
test("visual regression", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveScreenshot("homepage.png");
});
```

## Storybook Testing

### Writing Stories

Stories are located alongside components as `.stories.tsx` files.

#### Story Example

```typescript
// src/components/Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import Button from "./Button";

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    primary: true,
    label: "Button",
  },
};
```

### Running Storybook

```bash
# Start Storybook dev server
npm run storybook
```

Visit http://localhost:6006 to view your components.

### Accessibility Testing

Storybook includes accessibility testing via the a11y addon. Each story is automatically tested for accessibility violations.

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run type checking
        run: npm run type-check

      - name: Run linting
        run: npm run lint

      - name: Run unit tests
        run: npm run test:ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        if: always()
        with:
          files: ./coverage/lcov.info

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: |
            coverage/
            playwright-report/
            test-results/
```

## Best Practices

### 1. Test Organization

- Keep tests close to the code they test
- Use descriptive test names
- Group related tests with `describe` blocks
- Follow AAA pattern: Arrange, Act, Assert

### 2. Component Testing

- Test user interactions, not implementation details
- Use semantic queries (getByRole, getByLabelText)
- Mock external dependencies
- Test accessibility

### 3. E2E Testing

- Test critical user paths
- Keep tests independent
- Use page objects for complex interactions
- Handle async operations properly

### 4. Performance

- Run unit tests in parallel
- Use test.skip for slow tests during development
- Mock heavy operations
- Use beforeAll/afterAll for shared setup

### 5. Debugging

```bash
# Debug unit tests
npm run test:watch

# Debug E2E tests
npm run test:e2e:debug

# Use UI mode for E2E
npm run test:e2e:ui
```

### 6. Test Data

- Use factories for test data generation
- Keep test data realistic
- Avoid hardcoding values
- Clean up after tests

## Common Issues and Solutions

### Issue: Tests fail due to animations

**Solution**: Mock framer-motion in unit tests:

```typescript
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));
```

### Issue: localStorage not available in tests

**Solution**: Use the mockLocalStorage utility:

```typescript
import { mockLocalStorage } from "@/test-utils";

beforeEach(() => {
  mockLocalStorage();
});
```

### Issue: E2E tests timeout

**Solution**: Increase timeout in playwright.config.ts:

```typescript
export default defineConfig({
  timeout: 30000, // 30 seconds
  expect: {
    timeout: 10000, // 10 seconds
  },
});
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Storybook Documentation](https://storybook.js.org/docs/react/get-started/introduction)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Contributing

When adding new features:

1. Write unit tests for new components/functions
2. Add Storybook stories for new UI components
3. Add E2E tests for new user flows
4. Ensure all tests pass before submitting PR
5. Maintain test coverage above 80%

For questions or issues, please open an issue on GitHub or contact the development team.
