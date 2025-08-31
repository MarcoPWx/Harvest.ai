import React, { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

interface Epic {
  id?: string;
  title: string;
  description?: string;
  status?: string;
}

function EpicsEditor() {
  const [rows, setRows] = useState<Epic[]>([]);
  const [err, setErr] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("proposed");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const r = await fetch("/api/epics");
        if (r.ok) {
          const j = await r.json();
          if (alive) setRows(Array.isArray(j) ? j : j?.data || []);
          return;
        }
      } catch {}
      try {
        const s = await fetch("/docs/roadmap/epics.sample.json");
        if (s.ok) {
          const j = await s.json();
          if (alive) setRows(j?.epics || []);
          return;
        }
      } catch {}
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  async function createEpic() {
    if (!title.trim()) return;
    const newEpic: Epic = { title, description, status };
    setSaving(true);
    try {
      const r = await fetch("/api/epics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEpic),
      });
      if (r.ok) {
        const j = await r.json();
        setRows((prev) => [j, ...prev]);
        setTitle("");
        setDescription("");
        setStatus("proposed");
        return;
      }
      setRows((prev) => [{ id: `E-${Date.now()}`, ...newEpic }, ...prev]);
    } catch (e: any) {
      setErr(e?.message || String(e));
      setRows((prev) => [{ id: `E-${Date.now()}`, ...newEpic }, ...prev]);
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(idx: number, next: string) {
    const item = rows[idx];
    const updated = { ...item, status: next };
    setRows((prev) => prev.map((r, i) => (i === idx ? updated : r)));
    try {
      if (item?.id) {
        await fetch(`/api/epics/${encodeURIComponent(item.id)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: next }),
        });
      }
    } catch {}
  }

  const statuses = ["proposed", "in-progress", "done"];

  return (
    <div style={{ maxWidth: 920 }}>
      {err && <div style={{ color: "crimson", fontFamily: "monospace" }}>Error: {err}</div>}
      <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 12, marginBottom: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>Create Epic</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ padding: 8, border: "1px solid #ddd", borderRadius: 6 }}
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ padding: 8, border: "1px solid #ddd", borderRadius: 6, minHeight: 80 }}
          />
          <div>
            <label style={{ fontSize: 12, marginRight: 8 }}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={createEpic}
            disabled={saving || !title.trim()}
            style={{ padding: "8px 12px" }}
          >
            {saving ? "Saving…" : "Create"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {rows.map((e, i) => (
          <div key={e.id || i} style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <div style={{ fontWeight: 600 }}>{e.title || `Epic ${e.id}`}</div>
              <select
                value={e.status || "proposed"}
                onChange={(ev) => updateStatus(i, ev.target.value)}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            {e.description && (
              <div style={{ fontSize: 14, color: "#444", marginBottom: 8 }}>{e.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const meta: Meta<typeof EpicsEditor> = {
  title: "Command Center/Epics Editor",
  component: EpicsEditor,
};
export default meta;

type Story = StoryObj<typeof meta>;
export const Editor: Story = {};
