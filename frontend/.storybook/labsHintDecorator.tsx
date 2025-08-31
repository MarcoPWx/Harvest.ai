import React from "react";

export const labsHintDecorator = (Story: any, context: any) => {
  const title: string = String(context?.title || "");
  const isLabs = title.startsWith("Labs/");

  const hint = (
    <div
      style={{
        position: "fixed",
        left: 8,
        bottom: 8,
        zIndex: 9996,
        padding: "6px 10px",
        fontSize: 12,
        background: "#111827",
        color: "#f9fafb",
        borderRadius: 6,
        boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
        display: isLabs ? "inline-flex" : "none",
        gap: 8,
        alignItems: "center",
      }}
    >
      <span>Presenter: press <b>g</b> then <b>g</b> to toggle, <b>Esc</b> to close.</span>
      <a
        href="?path=/docs/labs-index--docs&globals=presenterGuide:true&presenter=labs"
        style={{ color: "#93c5fd", textDecoration: "none" }}
      >
        Start Presentation
      </a>
    </div>
  );

  return (
    <div style={{ position: "relative" }}>
      <Story />
      {hint}
    </div>
  );
};

