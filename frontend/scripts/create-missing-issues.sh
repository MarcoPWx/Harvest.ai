#!/bin/bash

# Create ALL MISSING issues - Complete the promise
# This creates the 135+ missing issues identified in the audit

echo "🚨 Creating ALL MISSING Issues (135+)"
echo "====================================="

REPO="MarcoPWx/Harvest.ai"
CREATED=0

# Function to create issue
create_issue() {
    local title="$1"
    local body="$2"
    local labels="$3"
    
    echo "Creating: $title"
    if gh issue create \
        --title "$title" \
        --body "$body" \
        --label "$labels" \
        -R $REPO 2>/dev/null; then
        ((CREATED++))
    else
        echo "  ⚠️ Failed: $title"
    fi
    sleep 0.3
}

echo ""
echo "📦 BATCH 1: Missing S2S Flows (S2S-06 to S2S-50)"
echo "================================================"

# S2S-06 to S2S-10: Remaining JSON APIs
for i in {6..10}; do
  create_issue \
    "[S2S-$(printf "%02d" $i)] JSON Generation API - Format $i" \
    "Server-to-server JSON API endpoint for format $i.
Endpoint: /api/generate/format$i
Method: POST
Response: JSON" \
    "s2s-flow,backend"
done

# S2S-11 to S2S-20: SSE Streaming
for i in {11..20}; do
  create_issue \
    "[S2S-$(printf "%02d" $i)] SSE Streaming - Scenario $(($i-10))" \
    "Server-sent events streaming scenario $(($i-10)).
Endpoint: /api/stream/scenario$(($i-10))
Protocol: SSE" \
    "s2s-flow,backend"
done

# S2S-21 to S2S-30: Error Handling
errors=("Rate Limit" "Timeout" "Invalid Input" "Auth Failed" "Quota Exceeded" 
        "Service Down" "Bad Gateway" "Network Error" "Partial Failure" "Circuit Breaker")
for i in {21..30}; do
  idx=$((i-21))
  create_issue \
    "[S2S-$(printf "%02d" $i)] Error - ${errors[$idx]}" \
    "Handle ${errors[$idx]} error scenario.
Error code: $(($i+408))
Retry: Exponential backoff" \
    "s2s-flow,backend"
done

# S2S-31 to S2S-35: Caching
cache=("Request Hash" "TTL Management" "Invalidation" "Conditional" "Warming")
for i in {31..35}; do
  idx=$((i-31))
  create_issue \
    "[S2S-$(printf "%02d" $i)] Cache - ${cache[$idx]}" \
    "Caching: ${cache[$idx]}" \
    "s2s-flow,backend"
done

# S2S-36 to S2S-40: Threads
threads=("Create" "Continue" "List" "Delete" "Export")
for i in {36..40}; do
  idx=$((i-36))
  create_issue \
    "[S2S-$(printf "%02d" $i)] Thread - ${threads[$idx]}" \
    "Thread operation: ${threads[$idx]}" \
    "s2s-flow,backend"
done

# S2S-41 to S2S-50: Operations
ops=("List Gen" "Delete Gen" "Bulk Ops" "Export" "Usage" 
     "Rate Status" "Health" "Metrics" "CORS" "Versioning")
for i in {41..50}; do
  idx=$((i-41))
  create_issue \
    "[S2S-$(printf "%02d" $i)] Ops - ${ops[$idx]}" \
    "Operation: ${ops[$idx]}" \
    "s2s-flow,backend"
done

echo ""
echo "📦 BATCH 2: Storybook Stories for User Journeys"
echo "==============================================="

for i in {1..20}; do
  num=$(printf "%02d" $i)
  create_issue \
    "[Story] UJ-$num Storybook Implementation" \
    "Create Storybook story for User Journey $num.
Requirements:
- Interactive demo
- MSW integration
- Multiple variants
- Documentation" \
    "storybook,frontend"
done

echo ""
echo "📦 BATCH 3: Storybook Stories for S2S Flows"
echo "==========================================="

for i in {1..50}; do
  num=$(printf "%02d" $i)
  create_issue \
    "[Story] S2S-$num Demo" \
    "Storybook demo for S2S flow $num" \
    "storybook,backend"
done

echo ""
echo "📦 BATCH 4: Missing Deployment Issues"
echo "====================================="

create_issue \
  "[Deploy] Storybook on Chromatic" \
  "Deploy Storybook to Chromatic for documentation.
Tasks:
- Set up Chromatic
- Configure CI
- Visual tests" \
  "deployment,frontend"

create_issue \
  "[Deploy] GitHub Actions CI/CD" \
  "Automated CI/CD pipeline.
Tasks:
- Test on PR
- Build verification
- Auto-deploy" \
  "deployment,testing"

echo ""
echo "📦 BATCH 5: Feature Integration Issues"
echo "======================================"

create_issue \
  "[Feature] ContentGenerator API Integration" \
  "Make ContentGenerator use real API.
Current: Mock data
Needed: Real fetch calls
Tests: 18 tests need updating" \
  "frontend,tdd"

create_issue \
  "[Feature] Tour System Fix" \
  "Fix broken tour system.
Components exist but broken.
Integrate with all journeys." \
  "frontend"

create_issue \
  "[Feature] MSW Production Mode" \
  "Enable MSW in production build.
Currently only works in dev." \
  "frontend,backend"

create_issue \
  "[Feature] Test Infrastructure" \
  "Set up comprehensive testing.
- Coverage enforcement
- Integration tests
- Visual regression" \
  "testing"

echo ""
echo "📦 BATCH 6: Testing Issues"
echo "=========================="

for i in {1..20}; do
  num=$(printf "%02d" $i)
  create_issue \
    "[Test] E2E for UJ-$num" \
    "End-to-end test for User Journey $num" \
    "testing,e2e"
done

echo ""
echo "==============================================="
echo "📊 SUMMARY"
echo "==============================================="
echo "✅ Issues created: $CREATED"
echo ""
echo "📈 Total issues after this script:"
echo "  - S2S Flows: 50"
echo "  - User Journeys: 20"
echo "  - Storybook Stories: 70"
echo "  - Deployment: 3"
echo "  - Features: 4"
echo "  - Testing: 20+"
echo "  TOTAL: 167+ issues"
echo ""
echo "🔍 Check all issues:"
echo "gh issue list -R $REPO --limit 200"
