# Harvest.ai Documentation Hub

## 📚 Complete Documentation Index

Welcome to the comprehensive documentation for Harvest.ai - an AI-powered content transformation platform.

### 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server with mocks
npm run dev:mock

# Run Storybook
npm run storybook

# Run tests (unit + e2e)
npm run test:all
```

### 📖 Documentation Structure

#### 1. Architecture

- [System Architecture](./architecture/SYSTEM_ARCHITECTURE.md)

#### 2. API Documentation

- [REST API Reference](./api/REST_API.md)
- [Complete API Spec](./api/COMPLETE_API_SPEC.md)

#### 3. User Journeys

- [Content Transformation](./user-journeys/CONTENT_TRANSFORMATION.md)
- [User Flows](./user-journeys/USER_FLOWS.md)

#### 4. Planning & Status

- [Epics & Tasks](./roadmap/EPICS.md)
- [Implementation Progress](./status/implementation-progress.md)
- [Mock-First Strategy](./../MOCK_FIRST_STRATEGY.md)

#### 5. Testing

- [Testing & CI (Consolidated)](./testing/TESTING.md)

### 🎯 Project Status (Snapshot)

| Feature      | Status             | Notes                             |
| ------------ | ------------------ | --------------------------------- |
| Frontend UI  | 🟢 Mostly Complete | App routes present; mocks enabled |
| Storybook    | 🟢 Good            | Key components covered            |
| Unit Tests   | 🟡 In Progress     | AIService tests need fixes        |
| E2E Tests    | 🟡 In Progress     | Align with current UI/state       |
| Backend API  | 🟠 Planned         | Supabase integration next         |
| Auth/Billing | 🟠 Planned         | OAuth + Stripe                    |

### 🗺️ Application Routes

| Route      | Description               | Status  |
| ---------- | ------------------------- | ------- |
| `/`        | Home                      | ✅ Live |
| `/demo`    | Interactive demonstration | ✅ Live |
| `/system`  | System architecture       | ✅ Live |
| `/roadmap` | Product roadmap           | ✅ Live |
| `/status`  | System status dashboard   | ✅ Live |
| `/format`  | Format converter          | ✅ Live |
| `/docs`    | Documentation             | ✅ Live |

### 🛠️ Technology Stack

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS
- State: Zustand
- Mocks: MSW
- Testing: Jest + RTL, Playwright
- Docs: Storybook, Markdown

### 🤝 Contributing

See CONTRIBUTING.md (to be added). Please open issues for bugs/requests.

---

Last Updated: 2025-08-28
Version: 0.2.0 (Alpha)
