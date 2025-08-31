"use client";

export default function ArchitectureDocs() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-6">Architecture Overview</h1>
      <p className="mb-4 text-gray-600">
        See the detailed Mermaid and ASCII diagrams in the repository.
      </p>
      <pre className="p-4 bg-gray-50 border rounded overflow-x-auto">{`docs/architecture/FRONTEND_BACKEND_OVERVIEW.md`}</pre>
    </div>
  );
}
