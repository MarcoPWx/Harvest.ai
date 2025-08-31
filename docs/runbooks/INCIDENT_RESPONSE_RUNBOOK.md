# Incident Response Runbook

## Severity Levels
- SEV-1: Full outage
- SEV-2: Partial degradation
- SEV-3: Minor bug

## Roles
- Incident Commander
- Communications Lead
- Ops Engineer

## Process
1. Detect
2. Triage and assign severity
3. Mitigate (rollback, feature flag, rate limit)
4. Communicate (SYSTEM_STATUS.md, banner)
5. Postmortem (within 48h) in DEVLOG.md

## Templates
- Status Update: "Ongoing incident affecting X% users. Mitigation in progress. Next update in 30m."
