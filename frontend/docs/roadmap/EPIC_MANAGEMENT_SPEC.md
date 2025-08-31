# Epic Management — Deep Dive

This page describes epic CRUD, linking, and status reflection. It connects UI flows to API endpoints and Storybook specifications.

## API (mock-first)

- GET /api/epics → [Epic]
- POST /api/epics → Epic
- PUT /api/epics/:id → Epic

## Acceptance criteria

- List with stable sort and filters; create/update with validation and optimistic UI
- Links open in new tab; broken links flagged by CI link-check

## Error & alt flows

- Offline → empty state with retry
- Conflict → prompt to refresh

## References

- Storybook: Specs/Epic Management — Full Spec
- Storybook: Overview/Architecture — System Map & Dependencies; Layered View; Data Model — Extended ERD
