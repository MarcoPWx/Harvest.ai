import React from "react";

export default function InlineToc({
  items,
  threshold = 200,
}: {
  items: { href: string; label: string }[];
  threshold?: number;
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  React.useEffect(() => {
    function onScroll() {
      setCollapsed(window.scrollY > threshold);
    }
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return (
    <div style={{ position: "sticky", top: 8, zIndex: 1, marginBottom: 12 }}>
      <div
        style={{
          background: "#f8f9fa",
          border: "1px solid #eaeaea",
          borderRadius: 8,
          padding: collapsed ? "6px 10px" : 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        {collapsed ? (
          <button onClick={() => setCollapsed(false)} style={{ fontSize: 12 }}>
            Contents ▾
          </button>
        ) : (
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 6,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Contents</span>
              <button onClick={() => setCollapsed(true)} style={{ fontSize: 12 }}>
                ▴
              </button>
            </div>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, lineHeight: 1.6 }}>
              {items.map((it) => (
                <li key={it.href}>
                  <a href={it.href}>{it.label}</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
