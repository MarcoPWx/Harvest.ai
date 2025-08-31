"use client";

import Link from "next/link";

export default function RunbooksPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-6">Runbooks</h1>
      <ul className="space-y-4 list-disc pl-6">
        <li>
          <Link
            className="text-blue-600 hover:underline"
            href="https://github.com/NatureQuest/Harvest.ai/blob/main/docs/runbooks/BYOK_RUNBOOK.md"
          >
            BYOK Runbook
          </Link>
        </li>
        <li>
          <Link
            className="text-blue-600 hover:underline"
            href="https://github.com/NatureQuest/Harvest.ai/blob/main/docs/runbooks/SCRAPING_RUNBOOK.md"
          >
            Scraping Runbook
          </Link>
        </li>
        <li>
          <Link
            className="text-blue-600 hover:underline"
            href="https://github.com/NatureQuest/Harvest.ai/blob/main/docs/runbooks/API_OPERATIONS_RUNBOOK.md"
          >
            API Operations Runbook
          </Link>
        </li>
        <li>
          <Link
            className="text-blue-600 hover:underline"
            href="https://github.com/NatureQuest/Harvest.ai/blob/main/docs/runbooks/INCIDENT_RESPONSE_RUNBOOK.md"
          >
            Incident Response Runbook
          </Link>
        </li>
      </ul>
    </div>
  );
}
