## Pull Request Checklist

- [ ] Unit tests (Jest) pass locally: `npm run test`
- [ ] E2E tests (Playwright) pass locally: `npm run test:e2e`
- [ ] Storybook opens and affected stories were verified
- [ ] Demo Tour flow verified locally:
  - [ ] `/login` loads (if SITE_USE_LOGIN=1)
  - [ ] Login redirects to `/?tour=1`
  - [ ] Tour overlay auto-starts and cannot be dismissed (prod)
  - [ ] "Tour is on" watermark visible
- [ ] MSW mocks work locally: `/?tour=1` enables MSW (or use `npm run dev:mock`)
- [ ] No console errors in browser during the tour
- [ ] README updated if behavior or setup changed

### Summary

What does this change do? Why is it needed?

### Screenshots / Videos (optional)

Include relevant UI diffs or a short screen recording of the demo tour if applicable.

### Deployment notes

- [ ] Vercel envs set (Production + Preview):
  - NEXT_PUBLIC_TOUR_AUTO=1
  - SITE_USE_LOGIN=1
  - SITE_DEMO_PASSWORD=<password>
- [ ] Optional: STORYBOOK_BASIC_AUTH if exposing /storybook externally

