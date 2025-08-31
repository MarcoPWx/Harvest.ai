import React from "react";

export const tourWatermarkDecorator = (Story: any, context: any) => {
  // Determine if tour/presenter is on in Storybook
  let on = Boolean(context?.globals?.presenterGuide);
  try {
    const top = (window.top || window) as Window;
    const url = new URL(top.location.href);
    const tourParam = (url.searchParams.get("tour") || "").toLowerCase();
    if (["1", "true", "start", "auto", "reset", "again", "fresh"].includes(tourParam)) {
      on = true;
    }
  } catch {}

  const watermark = (
    <div
      style={{
        position: "fixed",
        left: 8,
        bottom: 42, // slightly above Labs hint to avoid overlap
        zIndex: 9994,
        pointerEvents: "none",
        display: on ? "inline-flex" : "none",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        fontSize: 12,
        color: "#fff",
        background: "rgba(0,0,0,0.7)",
        borderRadius: 999,
        boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          width: 8,
          height: 8,
          borderRadius: 999,
          background: "#34d399",
        }}
      />
      <span>Tour is on</span>
    </div>
  );

  return (
    <div style={{ position: "relative" }}>
      <Story />
      {watermark}
    </div>
  );
};
