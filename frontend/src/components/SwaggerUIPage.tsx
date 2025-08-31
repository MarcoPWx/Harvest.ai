"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";
import React from "react";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

type SwaggerProps = {
  url?: string;
  docExpansion?: "list" | "full" | "none";
  defaultModelsExpandDepth?: number;
  defaultModelExpandDepth?: number;
  deepLinking?: boolean;
  displayRequestDuration?: boolean;
  tryItOutEnabled?: boolean;
  layout?: string;
};

export default function SwaggerUIPage({
  url = "/api/openapi.json",
  docExpansion = "list",
  defaultModelsExpandDepth = 1,
  defaultModelExpandDepth = 1,
  deepLinking = true,
  displayRequestDuration = true,
  tryItOutEnabled = true,
  layout = "BaseLayout",
}: SwaggerProps) {
  return (
    <div style={{ height: "100%", minHeight: "calc(100vh - 64px)" }}>
      {/* @ts-ignore - component is client-only */}
      <SwaggerUI
        url={url}
        docExpansion={docExpansion as any}
        defaultModelsExpandDepth={defaultModelsExpandDepth as any}
        defaultModelExpandDepth={defaultModelExpandDepth as any}
        deepLinking={deepLinking as any}
        displayRequestDuration={displayRequestDuration as any}
        tryItOutEnabled={tryItOutEnabled as any}
        layout={layout as any}
      />
    </div>
  );
}
