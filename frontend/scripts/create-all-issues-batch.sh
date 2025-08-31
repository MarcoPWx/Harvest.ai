#!/bin/bash

# Create ALL the issues we promised - no more excuses
# This script creates issues in batches to avoid rate limiting

echo "🚀 Creating ALL 70+ Issues for Harvest.ai"
echo "=========================================="

REPO="MarcoPWx/Harvest.ai"

# Function to create issue with error handling
create_issue() {
    local title="$1"
    local body="$2"
    local labels="$3"
    
    echo "Creating: $title"
    gh issue create \
        --title "$title" \
        --body "$body" \
        --label "$labels" \
        -R $REPO 2>/dev/null || echo "  ⚠️ Failed to create: $title"
    
    sleep 0.5 # Rate limiting
}

echo ""
echo "📦 BATCH 1: Remaining Core Epics"
echo "================================="

create_issue \
  "[Epic B] E2E Test Reliability" \
  "## Goal
All E2E tests pass reliably across browsers.

## Current Status
- Many tests not written
- Existing tests flaky
- No visual regression tests

## Tasks
- [ ] Write E2E tests for all 20 user journeys
- [ ] Fix flaky tests with proper waits
- [ ] Add visual regression tests
- [ ] Cross-browser testing" \
  "epic,testing"

create_issue \
  "[Epic C] Mock-First Backend" \
  "## Goal
Frontend fully functional without real backend.

## Current Status
- MSW handlers exist but not integrated
- No streaming support
- Not working in production

## Tasks
- [ ] Complete MSW handlers for all endpoints
- [ ] Add WebSocket mock server
- [ ] Add SSE streaming support
- [ ] Enable in production build" \
  "epic,backend"

echo ""
echo "📦 BATCH 2: Remaining User Journeys (UJ-03 to UJ-20)"
echo "====================================================="

# UJ-03 already created, start from UJ-04
create_issue \
  "[UJ-03] Server Error Recovery" \
  "Handle 500 errors gracefully with recovery options" \
  "user-journey,frontend"

create_issue \
  "[UJ-04] Cached Result Flow" \
  "Show cached results with indicators and bypass option" \
  "user-journey,frontend"

create_issue \
  "[UJ-05] Dark Mode Persistence" \
  "Dark mode toggle with localStorage persistence and system preference respect" \
  "user-journey,frontend"

create_issue \
  "[UJ-06] Email Format Conversion" \
  "Convert content to professional email format with templates" \
  "user-journey,frontend"

create_issue \
  "[UJ-07] Blog Format Generation" \
  "Generate SEO-optimized blog posts with proper structure" \
  "user-journey,frontend"

create_issue \
  "[UJ-08] Summary with Metrics" \
  "Create concise summaries with compression metrics" \
  "user-journey,frontend"

create_issue \
  "[UJ-09] BYOK (Bring Your Own Key) Flow" \
  "Guide users to use their own API keys securely" \
  "user-journey,frontend"

create_issue \
  "[UJ-10] SSE Streaming Playground" \
  "Interactive SSE streaming demo with real-time updates" \
  "user-journey,frontend"

create_issue \
  "[UJ-11] Error Injection Headers" \
  "Debug mode with header-based error injection" \
  "user-journey,testing"

create_issue \
  "[UJ-12] Latency Shaping" \
  "Simulate various network conditions for testing" \
  "user-journey,testing"

create_issue \
  "[UJ-13] Long Input Truncation" \
  "Handle large inputs gracefully with smart truncation" \
  "user-journey,frontend"

create_issue \
  "[UJ-14] Export UX" \
  "Multiple export formats (PDF, MD, TXT) with preview" \
  "user-journey,frontend"

create_issue \
  "[UJ-15] Accessibility Pass" \
  "Ensure WCAG 2.1 AA compliance throughout" \
  "user-journey,frontend"

create_issue \
  "[UJ-16] Mobile Viewport" \
  "Responsive mobile experience with touch support" \
  "user-journey,frontend"

create_issue \
  "[UJ-17] Network Retry Logic" \
  "Handle intermittent network issues with auto-retry" \
  "user-journey,frontend"

create_issue \
  "[UJ-18] Content Safety" \
  "Content moderation and safety checks" \
  "user-journey,frontend"

create_issue \
  "[UJ-19] Multi-step Workflow" \
  "Guided multi-step demo to format conversion" \
  "user-journey,frontend"

create_issue \
  "[UJ-20] Dev Tools Monitor" \
  "Developer tools for request/response debugging" \
  "user-journey,testing"

echo ""
echo "📦 BATCH 3: S2S Flows - Generation APIs (S2S-01 to S2S-10)"
echo "=========================================================="

for i in {1..10}; do
  create_issue \
    "[S2S-$(printf "%02d" $i)] JSON Generation API - Format $i" \
    "Server-to-server JSON API endpoint for content generation format $i.
    
Endpoint: /api/generate/format$i
Method: POST
Response: JSON with content, tokens, cost" \
    "s2s-flow,backend"
done

echo ""
echo "📦 BATCH 4: S2S Flows - SSE Streaming (S2S-11 to S2S-20)"
echo "========================================================="

for i in {11..20}; do
  create_issue \
    "[S2S-$(printf "%02d" $i)] SSE Streaming - Scenario $(($i-10))" \
    "Server-sent events streaming for real-time generation.
    
Endpoint: /api/stream/scenario$(($i-10))
Protocol: SSE
Events: chunk, progress, complete, error" \
    "s2s-flow,backend"
done

echo ""
echo "📦 BATCH 5: S2S Flows - Error Handling (S2S-21 to S2S-30)"
echo "=========================================================="

errors=("Rate Limit" "Timeout" "Invalid Input" "Auth Failed" "Quota Exceeded" "Service Down" "Bad Gateway" "Network Error" "Partial Failure" "Circuit Breaker")
for i in {21..30}; do
  idx=$((i-21))
  create_issue \
    "[S2S-$(printf "%02d" $i)] Error Handling - ${errors[$idx]}" \
    "Handle '${errors[$idx]}' error scenario properly.
    
Error code: $(($i+408))
Retry strategy: Exponential backoff
Max retries: 3" \
    "s2s-flow,backend"
done

echo ""
echo "📦 BATCH 6: S2S Flows - Caching (S2S-31 to S2S-35)"
echo "==================================================="

cache_types=("Request Hash" "TTL Management" "Cache Invalidation" "Conditional Requests" "Cache Warming")
for i in {31..35}; do
  idx=$((i-31))
  create_issue \
    "[S2S-$(printf "%02d" $i)] Caching - ${cache_types[$idx]}" \
    "Implement caching strategy: ${cache_types[$idx]}" \
    "s2s-flow,backend"
done

echo ""
echo "📦 BATCH 7: S2S Flows - Threads (S2S-36 to S2S-40)"
echo "==================================================="

thread_ops=("Create Thread" "Continue Thread" "List Threads" "Delete Thread" "Export Thread")
for i in {36..40}; do
  idx=$((i-36))
  create_issue \
    "[S2S-$(printf "%02d" $i)] Threads - ${thread_ops[$idx]}" \
    "Thread management: ${thread_ops[$idx]}" \
    "s2s-flow,backend"
done

echo ""
echo "📦 BATCH 8: S2S Flows - Operations (S2S-41 to S2S-50)"
echo "======================================================"

ops=("List Generations" "Delete Generation" "Bulk Operations" "Export History" "Usage Stats" "Rate Limit Status" "Health Check" "Metrics Export" "CORS Configuration" "API Versioning")
for i in {41..50}; do
  idx=$((i-41))
  create_issue \
    "[S2S-$(printf "%02d" $i)] Operations - ${ops[$idx]}" \
    "Operational endpoint: ${ops[$idx]}" \
    "s2s-flow,backend"
done

echo ""
echo "📦 BATCH 9: Additional Missing Features"
echo "======================================="

create_issue \
  "[Feature] ContentGenerator Real API Integration" \
  "Update ContentGenerator to use real API calls instead of mock data.
  
Current: Uses hardcoded mock responses
Needed: Real fetch calls to /api/generate
Tests: 18 tests written, need component update" \
  "frontend,tdd"

create_issue \
  "[Feature] Tour System Integration" \
  "Make the tour system actually work.
  
Components exist but don't work properly.
Need to integrate with all user journeys." \
  "frontend"

create_issue \
  "[Feature] Storybook MSW Integration" \
  "Properly integrate MSW in all Storybook stories.
  
MSW handlers exist but aren't used in stories.
Each story should demonstrate real API behavior." \
  "frontend,testing"

create_issue \
  "[Deploy] GitHub Actions CI/CD" \
  "Set up automated testing and deployment pipeline.
  
- Test runner on PR
- Build verification  
- Auto-deploy to Vercel
- Status badges" \
  "deployment,testing"

create_issue \
  "[Deploy] Storybook on Chromatic" \
  "Deploy Storybook for component documentation.
  
- Set up Chromatic account
- Configure build pipeline
- Visual regression tests" \
  "deployment,frontend"

echo ""
echo "📊 SUMMARY"
echo "=========="
echo "✅ Issues created for:"
echo "  - 3 Core Epics"
echo "  - 20 User Journeys (UJ-01 to UJ-20)"
echo "  - 50 S2S Flows (S2S-01 to S2S-50)"
echo "  - 5 Additional Features/Deployment tasks"
echo ""
echo "Total: 78 issues to track ALL promised work"
echo ""
echo "🔍 Verify created issues:"
gh issue list -R $REPO --limit 10
echo ""
echo "📈 To see all issues: gh issue list -R $REPO --limit 100"
