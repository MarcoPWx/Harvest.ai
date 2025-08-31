#!/bin/bash

# Create CONSOLIDATED issues without overlaps
# This creates ~10 real epics instead of 166 fake issues

echo "🎯 Creating Consolidated Issues (No Overlaps)"
echo "============================================="

REPO="MarcoPWx/Harvest.ai"

create_issue() {
    local title="$1"
    local body="$2"
    local labels="$3"
    
    echo "Creating: $title"
    gh issue create \
        --title "$title" \
        --body "$body" \
        --label "$labels" \
        -R $REPO 2>/dev/null || echo "  ⚠️ Failed"
    sleep 0.5
}

echo ""
echo "📦 Creating Missing S2S Backend Issues"
echo "======================================"

# Only create the UNIQUE S2S flows not covered by UJs

create_issue \
  "[S2S] Single Generation API Endpoint" \
  "Create ONE generation endpoint that handles all formats.

## Implementation
- Endpoint: /api/generate
- Parameter: format (blog|email|summary|presentation|social)
- Response: JSON with content, tokens, cost

## Includes
- All format types (replaces S2S-01 to S2S-10)
- Request validation
- Error handling
- Mock and real modes

## Acceptance Criteria
- [ ] All formats working
- [ ] Tests for each format
- [ ] MSW handlers
- [ ] Storybook demo" \
  "s2s-flow,backend"

create_issue \
  "[S2S] SSE Streaming Implementation" \
  "Implement Server-Sent Events for real-time streaming.

## Implementation  
- Endpoint: /api/generate/stream
- Protocol: SSE
- Features: Chunking, progress, cancellation

## Replaces
- S2S-11 to S2S-20 (all streaming scenarios)

## Acceptance Criteria
- [ ] Streaming works
- [ ] Progress events
- [ ] Error handling
- [ ] Reconnection logic" \
  "s2s-flow,backend"

create_issue \
  "[S2S] Caching System" \
  "Implement complete caching solution.

## Features
- Request hash caching
- TTL management
- Cache invalidation
- Conditional requests
- Cache headers

## Replaces
- S2S-31 to S2S-35

## Acceptance Criteria
- [ ] Cache hit/miss tracking
- [ ] Configurable TTL
- [ ] Cache bypass option
- [ ] Metrics" \
  "s2s-flow,backend"

create_issue \
  "[S2S] Thread Management System" \
  "Multi-turn conversation support.

## Features
- Create/continue/list/delete threads
- Context preservation
- Thread export

## Replaces
- S2S-36 to S2S-40

## Acceptance Criteria
- [ ] CRUD operations
- [ ] Context maintained
- [ ] Pagination
- [ ] Access control" \
  "s2s-flow,backend"

create_issue \
  "[S2S] Operations & Admin API" \
  "Management and monitoring endpoints.

## Endpoints
- GET /api/admin/generations (list)
- DELETE /api/admin/generations/:id
- GET /api/admin/metrics
- GET /api/health

## Replaces
- S2S-41 to S2S-50

## Acceptance Criteria
- [ ] Auth required
- [ ] Audit logging
- [ ] Bulk operations
- [ ] Export capability" \
  "s2s-flow,backend"

echo ""
echo "📦 Creating Missing Feature Issues"
echo "=================================="

create_issue \
  "[Feature] Complete Tour System" \
  "Fix and integrate the tour system.

## Current State
- Components exist but broken
- Not integrated with journeys

## Tasks
- [ ] Fix tour component bugs
- [ ] Create tour steps for all features
- [ ] Add to Storybook
- [ ] Make skippable but prominent

## Success Criteria
- Tours work in app and Storybook
- Cover main user flows
- Persistent state" \
  "frontend"

create_issue \
  "[Feature] SSE Playground" \
  "Interactive SSE testing interface.

## Features
- Live connection monitor
- Event stream viewer
- Error injection
- Performance metrics

## Part of UJ-10 but needs backend work" \
  "frontend,backend"

echo ""
echo "📦 Creating Missing Deployment Issues"
echo "===================================="

create_issue \
  "[Deploy] Chromatic for Storybook" \
  "Deploy Storybook documentation.

## Tasks
- [ ] Set up Chromatic account
- [ ] Configure chromatic.yml
- [ ] Add visual regression tests
- [ ] Set up PR previews

## Success Criteria
- Storybook publicly accessible
- Visual tests on PR
- Automatic deployment" \
  "deployment,frontend"

create_issue \
  "[Deploy] Complete CI/CD Pipeline" \
  "GitHub Actions for testing and deployment.

## Workflows Needed
- [ ] PR checks (lint, type, test)
- [ ] Build verification
- [ ] Coverage reporting
- [ ] Auto-deploy to Vercel on merge
- [ ] Storybook deploy on merge

## Success Criteria
- All PRs run tests
- Failing tests block merge
- Automatic deployments
- Status badges in README" \
  "deployment,testing"

echo ""
echo "==============================================="
echo "📊 SUMMARY"
echo "==============================================="
echo ""
echo "✅ Created Consolidated Issues:"
echo "  - 1 Generation API (replaces 10 issues)"
echo "  - 1 SSE Streaming (replaces 10 issues)"
echo "  - 1 Caching System (replaces 5 issues)"
echo "  - 1 Thread System (replaces 5 issues)"
echo "  - 1 Operations API (replaces 10 issues)"
echo "  - 2 Feature issues"
echo "  - 2 Deployment issues"
echo ""
echo "📉 Issue Reduction:"
echo "  Before: 166 planned issues"
echo "  After: ~40 actual work items"
echo "  Savings: 126 redundant issues avoided"
echo ""
echo "✨ Benefits:"
echo "  - No overlapping work"
echo "  - Clear ownership"
echo "  - Realistic scope"
echo "  - Actually deliverable"
