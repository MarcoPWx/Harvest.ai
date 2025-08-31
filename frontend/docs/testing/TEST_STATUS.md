# [DEPRECATED] Testing Status Report (See docs/testing/TESTING.md)

> This document is deprecated. Please refer to the consolidated guide:
> docs/testing/TESTING.md

# Testing Status Report

> ✅ Unit tests are green locally; E2E alignment is in progress.

Last Updated: 2025-08-30
Test Framework Status: **Unit: Stable (229/229), E2E: WIP**

## 📊 Overall Test Summary

```
Unit+Integration (Jest): 229/229 passing (100% pass rate)
E2E Tests (Playwright):  TBD (not part of current run)
Integration:             API route tests present and green
Total Coverage:          TBA (enable in CI)
```

## 🟢 Unit Test Summary

### 1. Navigation Component Tests (2 failures)

**File**: `src/components/layout/__tests__/Navigation.test.tsx`

#### ❌ Mobile Menu Toggle Test

```
Error: Unable to find an accessible element with the role "button" and name /menu|close/i
```

**Issue**: Mobile menu button lacks accessible name/aria-label
**Line**: 122

#### ❌ Mobile Menu Close Test

```
Error: Unable to find an accessible element with the role "button" and name /menu|close/i
```

**Issue**: Same as above - no aria-label on mobile controls
**Line**: 140

### 2. Layout Component Tests (3 failures)

**File**: `src/components/__tests__/Layout.test.tsx`

#### ❌ Renders Layout Test

```
Error: Found multiple elements with the text: Harvest.ai
```

**Issue**: Multiple elements have same text (nav and footer)
**Line**: 13

#### ❌ Highlights Current Page Test

```
Error: Found multiple elements with the text: Demo
```

**Issue**: Demo link appears in both nav and footer
**Line**: 36

#### ❌ Dark Mode Toggle Test

```
Error: expect(localStorage.setItem).toHaveBeenCalledWith
Received has type: function
Received has value: [Function setItem]
```

**Issue**: localStorage mock not properly set up
**Line**: 52

### 3. EcosystemWidget Tests (1 failure)

**File**: `src/components/ecosystem/__tests__/EcosystemWidget.test.tsx`

#### ❌ onProductClick Callback Test

```
Error: expect(jest.fn()).toHaveBeenCalledWith("devmentor")
Number of calls: 0
```

**Issue**: Click handler not triggering callback
**Line**: 66

#### ⚠️ Console Warnings (Not failures but issues)

```
Warning: React does not recognize the `whileHover` prop on a DOM element
Warning: React does not recognize the `whileTap` prop on a DOM element
```

**Issue**: Framer Motion props leaking to DOM elements

## 🔴 E2E Test Failures (ALL failing)

### Playwright Test Results

Focus: Chromium smoke tests in dev:mock mode. Firefox/WebKit queued after selectors stabilize.

#### Sample Failures from `home.spec.ts`:

1. **Page Title Mismatch**

```
Expected: /Harvest\.ai/
Received: "NatureQuest - Developer Tools Ecosystem"
```

2. **Navigation Links Timeout**

```
Error: Test timeout of 30000ms exceeded
locator.click: waiting for getByRole('link', { name: 'Demo' })
```

3. **Missing Elements**

- Main heading not found
- CTA buttons missing
- Navigation elements not clickable

### Browser Coverage Status

- ❌ Chromium: All tests failing
- ❌ Firefox: Not tested (likely failing)
- ❌ WebKit: Not tested (likely failing)
- ❌ Mobile Chrome: Not tested (likely failing)
- ❌ Mobile Safari: Not tested (likely failing)

## 🟡 Test Configuration Issues

### Jest Configuration

- ✅ Basic setup working
- ⚠️ Coverage reporting incomplete
- ❌ localStorage mocking broken
- ❌ Framer Motion mocking incomplete

### Playwright Configuration

- ✅ Config file exists
- ❌ Tests written for wrong app (NatureQuest vs Harvest.ai)
- ❌ Base URL might be wrong
- ❌ No tests actually pass

## 📈 Coverage Gaps

### What's NOT Tested

1. **API Routes** - No tests for `/api/*` endpoints
2. **Form Submissions** - No tests for content generation forms
3. **Dark Mode** - Toggle tested but persistence not verified
4. **Error States** - No error handling tests
5. **Loading States** - No async/loading tests
6. **Accessibility** - Basic ARIA issues present
7. **Performance** - No performance tests
8. **Security** - No security tests

### What's Partially Tested

1. **Components** - Basic rendering only
2. **Navigation** - Desktop only, mobile broken
3. **Layout** - Structure only, interactions failing
4. **Footer** - Only component that fully passes

## 🐛 Root Causes of Test Failures

### 1. Project Confusion

- Tests expect "Harvest.ai" but app shows "NatureQuest"
- Mixed project artifacts from different codebases

### 2. Missing Accessibility

- No aria-labels on interactive elements
- Mobile menu buttons not accessible

### 3. Poor Test Queries

- Using text queries for duplicate content
- Not using proper Testing Library queries

### 4. Mock Setup Issues

- localStorage not properly mocked
- Framer Motion not properly mocked
- Event handlers not triggering

### 5. E2E Test Mismatch

- Tests written for different version of app
- Selectors don't match actual DOM
- Expected content doesn't exist

## 🔧 How to Fix Tests

### Quick Fixes (1 hour)

1. **Add aria-labels to mobile menu**:

```jsx
<button aria-label="Open menu" className="md:hidden">
```

2. **Use getAllByText for duplicates**:

```javascript
const elements = screen.getAllByText("Harvest.ai");
expect(elements[0]).toBeInTheDocument();
```

3. **Mock localStorage properly**:

```javascript
beforeEach(() => {
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
  };
  global.localStorage = mockLocalStorage;
});
```

### Medium Fixes (1 day)

1. Update all E2E tests to match actual app
2. Fix Framer Motion mocking
3. Add proper test IDs to components
4. Implement proper async handling

### Long-term Fixes (1 week)

1. Rewrite test suite with TDD approach
2. Add integration tests
3. Set up proper CI/CD pipeline
4. Add visual regression testing

## 📝 Testing Commands Reference

### Run Specific Test Suites

```bash
# Only passing tests
npm test Footer

# Skip known failures
npm test -- --testPathIgnorePatterns="Navigation|Layout|EcosystemWidget"

# Run with verbose output
npm test -- --verbose

# Run single file
npm test Layout.test.tsx
```

### Debug Failed Tests

```bash
# Run in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Run with detailed error
npm test -- --no-coverage --verbose
```

### E2E Test Commands

```bash
# Run all E2E (all will fail)
npm run test:e2e

# Run with UI to see failures
npx playwright test --ui

# Run specific browser
npx playwright test --project=chromium

# Generate new tests (careful!)
npx playwright codegen localhost:3000
```

## 🚨 Current Focus Areas

1. Align E2E selectors and titles with current UI
2. Add robust waits; integrate MSW and WebSocket mocks in Playwright
3. Expand API route tests and coverage reporting

## 📊 Test Metrics

| Metric              | Current | Target | Status |
| ------------------- | ------- | ------ | ------ |
| Unit Test Pass Rate | 100%    | 95%    | 🟢     |
| E2E Test Pass Rate  | WIP     | 80%    | 🟡     |
| Code Coverage       | TBA     | 80%    | 🟡     |
| Test Execution Time | ~1s     | <5s    | ✅     |
| Flaky Tests         | Low     | 0      | 🟡     |

## 🎯 Testing Priorities

### Immediate (Fix broken tests)

1. Add aria-labels to fix Navigation tests
2. Fix duplicate element queries in Layout tests
3. Mock localStorage properly
4. Update E2E test expectations

### Short-term (Improve coverage)

1. Add API route tests
2. Add form submission tests
3. Add error state tests
4. Fix Framer Motion warnings

### Long-term (Mature testing)

1. Add integration test layer
2. Implement visual regression
3. Add performance testing
4. Set up mutation testing

---

**Bottom Line**: The testing setup exists but is largely broken. Unit tests are partially working (82.8%), but E2E tests are completely broken (0% pass rate). The project needs significant test maintenance before it can be considered properly tested.
