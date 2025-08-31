# Web Scraping Runbook

## Scope
This runbook governs all scraping performed by Harvest.ai (not QuizMentor-specific).

## Compliance Rules
- Respect robots.txt (deny if disallowed)
- Prefer official APIs when available
- Honor crawl-delay and domain rate limits
- No bypassing paywalls or authentication

## Operational Procedure
1. Pre-flight
   - Validate URL against blacklist
   - Load robots.txt; compute crawl rules
   - Check known API availability
2. Fetch
   - Apply crawl delay
   - Use descriptive User-Agent
   - Strip scripts/styles; extract text
3. Post-process
   - Store only non-sensitive metadata (if needed)
   - Track attribution requirements

## Incident Handling
- On complaint or takedown request: stop scraping domain, notify legal, document incident.

## Checklist
- [ ] robots.txt compliant
- [ ] Rate limits applied
- [ ] API alternatives checked
- [ ] Attribution recorded
