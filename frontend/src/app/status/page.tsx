"use client";

export default function StatusPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-6">System Status</h1>
      <p className="mb-4 text-gray-600">
        Human-readable status. Source of truth lives in docs/status/STATUS_PAGE.md.
      </p>
      <pre className="p-4 bg-gray-50 border rounded overflow-x-auto">{`See repository: docs/status/STATUS_PAGE.md`}</pre>
    </div>
  );
}
