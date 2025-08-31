# Testing Guide - Harvest.ai

## Overview

Harvest.ai uses a comprehensive testing strategy with both unit tests and end-to-end (E2E) tests to ensure reliability and prevent regressions.

## Test Infrastructure

### Unit Tests (Jest + React Testing Library)
- **Framework**: Jest with React Testing Library
- **Location**: `src/components/__tests__/`
- **Configuration**: `jest.config.js`, `jest.setup.js`
- **Coverage**: Component logic, props, user interactions

### E2E Tests (Playwright)
- **Framework**: Playwright
- **Location**: `tests/e2e/`
- **Configuration**: `playwright.config.ts`
- **Coverage**: User workflows, cross-browser compatibility, responsive design

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### E2E Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode
npm run test:e2e:headed

# Run E2E tests in debug mode
npm run test:e2e:debug
```

## Test Structure

### Unit Tests
```
src/components/__tests__/
├── Footer.test.tsx          # Footer component tests
├── Layout.test.tsx          # Layout component tests
└── [Component].test.tsx     # Other component tests
```

### E2E Tests
```
tests/e2e/
├── home.spec.ts             # Home page tests
├── demo.spec.ts             # Demo page tests
├── system.spec.ts           # System page tests
└── roadmap.spec.ts          # Roadmap page tests
```

## Writing Tests

### Unit Test Guidelines

1. **Test Structure**
   ```typescript
   import { render, screen } from '@testing-library/react'
   import Component from '../Component'

   describe('Component', () => {
     it('should render correctly', () => {
       render(<Component />)
       expect(screen.getByText('Expected Text')).toBeInTheDocument()
     })
   })
   ```

2. **Test Coverage**
   - Component rendering
   - Props handling
   - User interactions
   - State changes
   - Accessibility features

3. **Best Practices**
   - Use semantic queries (`getByRole`, `getByLabelText`)
   - Test user behavior, not implementation
   - Mock external dependencies
   - Test error states

### E2E Test Guidelines

1. **Test Structure**
   ```typescript
   import { test, expect } from '@playwright/test'

   test.describe('Page', () => {
     test('should load successfully', async ({ page }) => {
       await page.goto('/')
       await expect(page.getByRole('heading')).toBeVisible()
     })
   })
   ```

2. **Test Coverage**
   - Page loading
   - Navigation
   - User interactions
   - Responsive design
   - Cross-browser compatibility

3. **Best Practices**
   - Test user workflows
   - Use page objects for complex interactions
   - Test accessibility features
   - Test responsive behavior

## Test Configuration

### Jest Configuration
- **Environment**: jsdom for DOM simulation
- **Setup**: Custom mocks for Next.js, localStorage, etc.
- **Coverage**: Excludes test files and stories
- **Module Mapping**: Supports `@/` imports

### Playwright Configuration
- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Base URL**: `http://localhost:3000`
- **Web Server**: Automatically starts dev server
- **Retries**: 2 retries on CI

## Mocking Strategy

### Unit Test Mocks
- **Next.js Router**: Mocked navigation functions
- **localStorage**: Mocked for dark mode persistence
- **matchMedia**: Mocked for responsive design
- **IntersectionObserver**: Mocked for animations

### E2E Test Mocks
- **API Calls**: Mock external API responses
- **Timeouts**: Configured for slow operations
- **Network**: Handle offline scenarios

## Continuous Integration

### GitHub Actions
```yaml
name: Tests
on: [push, pull_request]
jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
```

## Coverage Goals

### Unit Tests
- **Components**: 90%+ coverage
- **Utilities**: 95%+ coverage
- **Hooks**: 90%+ coverage

### E2E Tests
- **Critical Paths**: 100% coverage
- **User Flows**: All major workflows
- **Cross-browser**: All supported browsers

## Debugging Tests

### Unit Test Debugging
```bash
# Run specific test file
npm test -- Footer.test.tsx

# Run tests with verbose output
npm test -- --verbose

# Run tests with coverage
npm run test:coverage
```

### E2E Test Debugging
```bash
# Run tests in headed mode
npm run test:e2e:headed

# Run tests with UI
npm run test:e2e:ui

# Run specific test
npx playwright test home.spec.ts
```

## Best Practices

### General
1. **Write tests first** (TDD approach)
2. **Test user behavior** not implementation
3. **Keep tests simple** and focused
4. **Use descriptive test names**
5. **Maintain test data** separately

### Unit Tests
1. **Test one thing** per test
2. **Use meaningful assertions**
3. **Mock external dependencies**
4. **Test edge cases**
5. **Test accessibility**

### E2E Tests
1. **Test user workflows**
2. **Use page objects** for complex pages
3. **Test responsive design**
4. **Test cross-browser compatibility**
5. **Handle async operations properly**

## Troubleshooting

### Common Issues

1. **Tests failing on CI but passing locally**
   - Check environment differences
   - Verify mock configurations
   - Check for timing issues

2. **E2E tests flaky**
   - Add proper waits
   - Use stable selectors
   - Check for race conditions

3. **Coverage not accurate**
   - Check coverage configuration
   - Verify test file patterns
   - Check for excluded files

### Performance
- **Unit tests**: Should run in < 30 seconds
- **E2E tests**: Should run in < 5 minutes
- **CI pipeline**: Should complete in < 10 minutes

## Future Improvements

1. **Visual Regression Testing**
   - Add visual testing with Playwright
   - Screenshot comparison
   - Design system testing

2. **Performance Testing**
   - Lighthouse CI integration
   - Core Web Vitals testing
   - Bundle size monitoring

3. **Accessibility Testing**
   - axe-core integration
   - Screen reader testing
   - Keyboard navigation testing

4. **API Testing**
   - API endpoint testing
   - Contract testing
   - Load testing

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
