# Development Runbook

## 🚀 Quick Start

### Initial Setup

```bash
# Clone and install
git clone https://github.com/NatureQuest/Harvest.ai.git
cd Harvest.ai/frontend
npm install

# Start development with mocks (MSW + WebSocket mocks)
npm run dev:mock
# Open http://localhost:3002
```

### Daily Development Workflow

#### Morning Startup

```bash
# 1. Update main
git status
git pull origin main

# 2. Install any new deps
npm install

# 3. Start dev server with mocks
npm run dev:mock

# 4. Run unit tests (all should pass)
npm test -- --watchAll=false
# Expected: 58/58 passing
```

#### Before Making Changes

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Check what's currently broken
npm test -- --watchAll=false
# Expected: 6 failing tests in Navigation, Layout, EcosystemWidget

# 3. Start dev server
npm run dev
```

## 🧪 Testing

### Running Tests

```bash
# Run all unit tests (expected: all passing)
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test Navigation.test

# Run a specific test file
npm test src/lib/ai/__tests__/service.test.ts
```

### Current Test Status

```
✅ Unit: 58/58 passing
🟡 E2E: Smoke tests WIP; run with mocks
```

### E2E Tests

```bash
# Run Playwright tests
npm run test:e2e:chrome

# Run headed mode to see what happens
npx playwright test --headed

# Run specific test
npx playwright test home.spec.ts

# Debug mode
npx playwright test --debug
```

## 🔧 Common Development Tasks

### Local-Memory Gateway (Degraded Mode)

Two developer convenience endpoints provide local indexing/search via a gateway, with in-memory fallback when the gateway is unavailable.

- POST /api/local-memory/index
  - Body: { namespace?: string, id?: string, text: string }
  - Proxies to ${LOCAL_GATEWAY_URL:-http://localhost:3005}/local-memory/index. Falls back to in-memory index when gateway is down.
- POST /api/local-memory/search
  - Body: { namespace?: string, query: string, topK?: number }
  - Proxies to ${LOCAL_GATEWAY_URL:-http://localhost:3005}/local-memory/search. Falls back to in-memory search.

Examples:

```bash
# Index text
curl -s -X POST http://localhost:3002/api/local-memory/index \
  -H 'Content-Type: application/json' \
  -d '{"namespace":"notes","id":"n1","text":"Harvest.ai makes content transformation easy"}' | jq

# Search
curl -s -X POST http://localhost:3002/api/local-memory/search \
  -H 'Content-Type: application/json' \
  -d '{"namespace":"notes","query":"content transformation","topK":5}' | jq
```

### Debug Endpoints

- GET /api/debug/endpoints — returns a list of implemented API endpoints and a total count
- GET /api/debug/logs — view recent in-memory logs
- POST /api/debug/logs — append a log entry `{ level, message, meta }`

```bash
curl -s http://localhost:3002/api/debug/endpoints | jq '.total'
curl -s -X POST http://localhost:3002/api/debug/logs -H 'Content-Type: application/json' \
  -d '{"level":"info","message":"hello","meta":{"env":"dev"}}' | jq
```

### OpenAPI (Swagger) Spec

- GET /api/openapi.json — OpenAPI 3.0 JSON
- UI: http://localhost:3002/docs/api — Swagger UI embedded page

Alternative viewers:

- Online: https://editor.swagger.io/ → File → Import URL → http://localhost:3002/api/openapi.json
- VS Code: install a Swagger/OpenAPI preview extension, then open the URL.

### Adding a New Page

1. Create page file:

```bash
mkdir -p src/app/your-page
touch src/app/your-page/page.tsx
```

2. Basic page template:

```typescript
export default function YourPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">Your Page</h1>
      {/* Your content */}
    </div>
  );
}
```

3. Add to navigation (if needed):

```typescript
// In src/components/Layout.tsx or Navigation.tsx
// Add your route to the navigation items
```

### Adding a Component

1. Create component:

```bash
mkdir -p src/components/your-component
touch src/components/your-component/YourComponent.tsx
touch src/components/your-component/index.ts
```

2. Write test FIRST (TDD approach):

```bash
mkdir -p src/components/your-component/__tests__
touch src/components/your-component/__tests__/YourComponent.test.tsx
```

3. Basic test template:

```typescript
import { render, screen } from '@testing-library/react';
import { YourComponent } from '../YourComponent';

describe('YourComponent', () => {
  it('renders without crashing', () => {
    render(<YourComponent />);
    expect(screen.getByText('expected text')).toBeInTheDocument();
  });
});
```

4. Run test (should fail):

```bash
npm test YourComponent
```

5. Implement component until test passes

### Working with API Routes (Hybrid)

Most endpoints work with mocks in dev:mock and Supabase in real mode.

```bash
# Generate content (hybrid)
curl -s -X POST http://localhost:3002/api/generate \
  -H 'Content-Type: application/json' \
  -d '{"input":"hello world","format":"blog"}' | jq

# Get generation history (auth-backed if configured)
curl -s http://localhost:3002/api/generations | jq

# OpenAPI
echo http://localhost:3002/api/openapi.json
```

## 🐛 Troubleshooting

### Common Issues & Solutions

#### Port 3000 Already in Use

```bash
# Find and kill process
lsof -i :3000
kill -9 [PID]

# Or use different port
PORT=3001 npm run dev
```

#### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript Errors

```bash
# Check for type errors
npm run type-check

# If types are missing
npm install --save-dev @types/[package-name]
```

#### Build Failures

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

#### Test Failures

At this time unit tests are green. If a test fails locally:

```bash
# Run a single suite with verbose
npm test -- src/app/api/generations/__tests__/route.test.ts -- --verbose
```

## 🎨 Styling with Tailwind

### Adding New Styles

```bash
# Tailwind classes are already configured
# Just use them in components:
className="bg-orange-500 hover:bg-orange-600 transition-colors"

# If a class doesn't work, check tailwind.config.js
# May need to add to safelist
```

### Dark Mode

```javascript
// Dark mode classes
className = "bg-white dark:bg-gray-900";

// Check if dark mode is active
const isDark = document.documentElement.classList.contains("dark");
```

## 📝 Git Workflow

### Making Changes

```bash
# 1. Create branch
git checkout -b feature/your-feature

# 2. Make changes and test
npm test

# 3. Stage and commit
git add .
git commit -m "feat: add your feature"

# 4. Push
git push origin feature/your-feature
```

### Commit Message Format

```
feat: add new feature
fix: fix bug in component
docs: update documentation
test: add tests for component
refactor: refactor code
style: format code
chore: update dependencies
```

## 🚨 Before Pushing Code

### Checklist

```bash
# 1. Run type check
npm run type-check

# 2. Run linter
npm run lint

# 3. Run tests (remember 6 are expected to fail)
npm test -- --watchAll=false

# 4. Try to build
npm run build

# 5. Test in browser
npm run dev
# Check: /, /demo, /system, /roadmap, /docs
```

## 🔍 Debugging

### Browser DevTools

```javascript
// Add console logs
console.log("Component rendered:", props);

// Add debugger statements
debugger; // Browser will pause here

// Check React DevTools
// Install React DevTools extension
```

### VS Code Debugging

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "port": 9229,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

## 📦 Dependencies

### Installing New Packages

```bash
# Production dependency
npm install package-name

# Dev dependency
npm install --save-dev package-name

# Check for outdated
npm outdated

# Update all dependencies (careful!)
npm update
```

### Current Key Dependencies

- `next`: 15.x - App framework
- `react`: 19.x - UI library
- `tailwindcss`: 3.x - Styling
- `framer-motion`: 12.x - Animations (may log prop warnings in tests)
- `lucide-react`: Icons

## ⚡ Performance Tips

### Development Performance

```bash
# If dev server is slow
rm -rf .next
npm run dev

# Disable source maps for faster builds
# In next.config.js:
productionBrowserSourceMaps: false
```

### Check Bundle Size

```bash
# Analyze bundle
npm install --save-dev @next/bundle-analyzer

# Add to next.config.js and run
ANALYZE=true npm run build
```

## 🎯 What to Work On (Priority Order)

1. E2E stabilization with MSW + WebSocket mocks; align selectors/titles
2. Supabase usage logging and rate limiting
3. Auth UI flows (login/signup pages) and session state in header
4. Content history UI and export flows
5. Observability (Sentry) and CI quality gates

## 📄 Docs Update Procedure (Canonical)

- Canonical docs (single source of truth):
  - DevLog: /docs/status/DEVLOG.md
  - Epics: /docs/roadmap/EPICS.md
  - System Status: /docs/SYSTEM_STATUS.md

Minimal workflow (no scripts)

- Edit the canonical docs above.
- Ask the agent: "Update docs now".
  - The agent will: update the three docs as requested and refresh /docs/status/last-updated.json so Storybook badges reflect changes.
- Reload Storybook in your browser to see updated content and timestamps.

Note: If you add or rename files under /docs, the agent can also update /docs/manifest.json on request so any index pages reflect the changes.

## 🤝 Getting Help

### Resources That Actually Help

- Next.js Docs: https://nextjs.org/docs
- Tailwind Docs: https://tailwindcss.com/docs
- React Testing Library: https://testing-library.com/docs/react-testing-library/intro/

### Project-Specific Help

- Check `/docs/SYSTEM_STATUS.md` for what actually works
- Check failing tests for known issues
- API routes are all mocked - check the route files to see mock responses

---

**Note**: The app runs fully with mocks via `npm run dev:mock`. Supabase-backed routes are progressively enabled; see `/api/openapi.json` and `/api/debug/endpoints`.
