# [DEPRECATED] Harvest.ai Testing Strategy (See docs/testing/TESTING.md)

> This document is deprecated. Please refer to the consolidated guide:
> docs/testing/TESTING.md

# 🧪 Harvest.ai Comprehensive Testing Strategy

## Executive Summary

Harvest.ai employs a multi-layered testing strategy to ensure reliability, performance, and user satisfaction. Our testing pyramid consists of unit tests, integration tests, E2E tests, and visual regression tests.

## Testing Stack

| Tool                      | Purpose                                  | Coverage  |
| ------------------------- | ---------------------------------------- | --------- |
| **Jest**                  | Unit & Integration Testing               | 81%       |
| **React Testing Library** | Component Testing                        | ✅        |
| **Playwright**            | E2E Testing                              | 230 tests |
| **Storybook**             | Component Documentation & Visual Testing | ✅        |
| **MSW**                   | API Mocking                              | ✅        |
| **Vitest**                | Fast Unit Testing (Alternative)          | Optional  |

## Testing Pyramid

```
         /\
        /E2E\       (10%) - Critical User Journeys
       /------\
      /Integration\ (30%) - Service & API Tests
     /------------\
    /   Unit Tests  \ (60%) - Components & Functions
   /----------------\
```

## 1. Unit Testing

### Overview

Unit tests form the foundation of our testing strategy, focusing on individual components and functions in isolation.

### Running Unit Tests

```bash
# Run all unit tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test -- src/components/Footer.test.tsx
```

### Current Coverage

- **Total Coverage**: 81%
- **Components**: 78%
- **Services**: 85%
- **Utils**: 91%
- **Hooks**: 72%

### Best Practices

#### Component Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when prop is set', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

#### Service Testing

```typescript
import { AIService } from "@/lib/ai/service";

describe("AIService", () => {
  let service: AIService;

  beforeEach(() => {
    service = new AIService();
  });

  it("should generate content", async () => {
    const result = await service.generateContent("Test input", { format: "blog", model: "gpt-4" });

    expect(result).toHaveProperty("content");
    expect(result.content).toBeTruthy();
  });
});
```

## 2. Integration Testing

### API Integration Tests

```typescript
import { createMockServer } from "@/test-utils/mock-server";
import { apiClient } from "@/lib/api";

describe("API Integration", () => {
  const server = createMockServer();

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("should fetch user data", async () => {
    const user = await apiClient.getUser("123");
    expect(user).toMatchObject({
      id: "123",
      email: expect.any(String),
    });
  });
});
```

### Database Integration Tests

```typescript
describe("Database Integration", () => {
  it("should save generation to database", async () => {
    const generation = await saveGeneration({
      content: "Test content",
      format: "blog",
      userId: "test-user",
    });

    expect(generation.id).toBeTruthy();

    const saved = await getGeneration(generation.id);
    expect(saved.content).toBe("Test content");
  });
});
```

## 3. End-to-End Testing

### Playwright Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3002",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "Mobile Chrome", use: { ...devices["Pixel 5"] } },
    { name: "Mobile Safari", use: { ...devices["iPhone 12"] } },
  ],
});
```

### Running E2E Tests

```bash
# Install browsers
npx playwright install

# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test auth.spec.ts

# Run in headed mode
npx playwright test --headed

# Run with specific browser
npx playwright test --project=chromium

# Open test report
npx playwright show-report
```

### E2E Test Categories

#### Authentication Tests (auth.spec.ts)

- ✅ Signup flow
- ✅ Login flow
- ✅ Password reset
- ✅ OAuth integration
- ✅ Session persistence
- ✅ Logout flow

#### Content Generation Tests (content-generation.spec.ts)

- ✅ Blog generation
- ✅ Email generation
- ✅ Summary generation
- ✅ Multiple formats
- ✅ Copy/Download features
- ✅ Error handling
- ✅ Pro features

#### Demo Page Tests (demo.spec.ts)

- ✅ Page loading
- ✅ Navigation
- ✅ Responsive design
- ✅ Dark mode
- ✅ Visual regression

#### Home Page Tests (home.spec.ts)

- ✅ Page structure
- ✅ SEO meta tags
- ✅ Accessibility
- ✅ Mobile responsiveness

### E2E Best Practices

```typescript
test("should complete user journey", async ({ page }) => {
  // Use data-testid for stable selectors
  await page.click('[data-testid="login-button"]');

  // Wait for navigation
  await page.waitForURL(/.*\/dashboard/);

  // Assert visibility with timeout
  await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible({ timeout: 10000 });

  // Handle dynamic content
  await page.waitForSelector('[data-testid="content-loaded"]');
});
```

## 4. Visual Testing with Storybook

### Running Storybook

```bash
# Start Storybook dev server
npm run storybook

# Build Storybook static site
npm run build-storybook

# Run Storybook tests
npm run test-storybook
```

### Story Structure

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Harvest.ai/UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Button",
  },
};

export const WithIcon: Story = {
  args: {
    children: "Generate",
    icon: "✨",
  },
};
```

### Visual Regression Testing

```bash
# Install chromatic
npm install --save-dev chromatic

# Run visual tests
npx chromatic --project-token=<token>
```

## 5. Mock Service Worker (MSW)

### Setup

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.post("/api/generate", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      content: "Generated content",
      model: body.model,
    });
  }),
];
```

### Browser Integration

```typescript
// src/mocks/browser.ts
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);

// Start in development
if (process.env.NODE_ENV === "development") {
  worker.start();
}
```

### Test Integration

```typescript
// src/setupTests.ts
import { server } from "./mocks/server";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## 6. Performance Testing

### Lighthouse CI

```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run performance tests
lhci autorun
```

### Bundle Size Analysis

```bash
# Analyze bundle
npm run analyze

# Check bundle size
npm run size
```

### Load Testing

```bash
# Using k6
k6 run tests/load/spike-test.js
```

## 7. Accessibility Testing

### Automated Testing

```typescript
import { axe } from 'jest-axe';

it('should not have accessibility violations', async () => {
  const { container } = render(<App />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Manual Testing Checklist

- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Color contrast (WCAG AA)
- [ ] Focus indicators
- [ ] ARIA labels
- [ ] Semantic HTML

## 8. Test Data Management

### Fixtures

```typescript
// tests/fixtures/user.ts
export const mockUser = {
  id: "test-123",
  email: "test@harvest.ai",
  name: "Test User",
  subscription: "pro",
};
```

### Factories

```typescript
// tests/factories/generation.ts
import { faker } from "@faker-js/faker";

export const createGeneration = (overrides = {}) => ({
  id: faker.string.uuid(),
  content: faker.lorem.paragraphs(),
  format: "blog",
  created_at: faker.date.recent(),
  ...overrides,
});
```

## 9. CI/CD Integration

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test -- --coverage
      - run: npx playwright install
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        with:
          name: coverage
          path: coverage/
```

## 10. Testing Checklist

### Before Commit

- [ ] Unit tests pass
- [ ] Coverage > 80%
- [ ] No console errors
- [ ] Linting passes

### Before PR

- [ ] E2E tests pass
- [ ] Visual regression checked
- [ ] Performance metrics met
- [ ] Accessibility checked

### Before Release

- [ ] Full E2E suite passes
- [ ] Load testing completed
- [ ] Security testing done
- [ ] Cross-browser testing verified

## 11. Debugging Tests

### Debug Unit Tests

```bash
# Debug in VS Code
npm test -- --runInBand --detectOpenHandles

# Debug specific test
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Debug E2E Tests

```bash
# Debug mode
npx playwright test --debug

# Step through test
npx playwright test --headed --slowmo=1000

# Open Playwright Inspector
PWDEBUG=1 npx playwright test
```

## 12. Test Metrics & KPIs

| Metric              | Target             | Current |
| ------------------- | ------------------ | ------- |
| Unit Test Coverage  | > 80%              | 81% ✅  |
| E2E Test Coverage   | All critical paths | ✅      |
| Test Execution Time | < 5 min            | 3:45 ✅ |
| Flaky Test Rate     | < 1%               | 0.5% ✅ |
| Bug Escape Rate     | < 5%               | 2% ✅   |

## 13. Testing Resources

### Documentation

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/)
- [Playwright Docs](https://playwright.dev/docs/intro)
- [Storybook Docs](https://storybook.js.org/docs)
- [MSW Docs](https://mswjs.io/docs)

### Tools

- [Testing Playground](https://testing-playground.com/)
- [Playwright Test Generator](https://playwright.dev/docs/codegen)
- [Storybook Addon Interactions](https://storybook.js.org/addons/@storybook/addon-interactions)

## 14. Common Issues & Solutions

### Issue: Flaky Tests

**Solution**: Use proper wait strategies

```typescript
// Bad
await page.click("button");
expect(element).toBeVisible();

// Good
await page.click("button");
await page.waitForSelector('[data-loaded="true"]');
await expect(element).toBeVisible({ timeout: 10000 });
```

### Issue: Slow Tests

**Solution**: Parallelize and optimize

```typescript
// Run tests in parallel
test.describe.parallel("Feature", () => {
  test("test 1", async () => {});
  test("test 2", async () => {});
});
```

### Issue: Mock Data Inconsistency

**Solution**: Use centralized fixtures

```typescript
import { mockUser } from "@/tests/fixtures";

beforeEach(() => {
  setupUser(mockUser);
});
```

## Conclusion

Harvest.ai's comprehensive testing strategy ensures high quality, reliability, and user satisfaction. By following these guidelines and maintaining high test coverage, we can confidently deploy changes and scale our application.

---

_Last Updated: December 2024_  
_Version: 1.0.0_
