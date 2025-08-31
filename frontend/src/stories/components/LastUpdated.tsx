import React from "react";

export default function LastUpdated({ file }: { file: string }) {
  const [updated, setUpdated] = React.useState<string>("");
  React.useEffect(() => {
    let alive = true;
    fetch("/docs/status/last-updated.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!alive || !j) return;
        const ts = j?.files?.[file];
        if (ts) setUpdated(new Date(ts).toLocaleString());
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [file]);
  if (!updated) return null;
  return <div style={{ marginTop: 16, fontSize: 12, color: "#666" }}>Last updated: {updated}</div>;
}
