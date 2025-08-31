"use client";

import dynamic from "next/dynamic";

// In app router, using ssr:false requires a Client Component. We mark this page as client.
const SwaggerUIPage = dynamic(() => import("@/components/SwaggerUIPage"), { ssr: false });

export default function ApiDocsPage() {
  return <SwaggerUIPage url="/api/openapi.json" />;
}
