import { useState } from "react";
import { useQueue } from "../hooks/useQueue";

const NAV = [
  { id: "queue", label: "Queue", icon: "👥" },
  { id: "patients", label: "Patient List", icon: "🏥" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

const S = {
  sidebar: { width: 220, background: "#fff", borderRight: "1px solid #e8edf2", display: "flex", flexDirection: "column", padding: "1.5rem 0", height: "100vh" },
  main: { flex: 1, overflowY: "auto", padding: "2rem" },
  card: { background: "#fff", borderRadius: 12, padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: "1.5rem" },
  badge: (color, bg) => ({ background: bg, color, fontSize: "0.72rem", fontWeight: 600, padding: "0.25rem 0.65rem", borderRadius: 20 }),
  btn: (bg, disabled) => ({ background: disabled ? "#cbd5e1" : bg, color: "#fff", border: "none", borderRadius: 8, padding: "0.6rem 1.1rem", fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", fontSize: "0.9rem" }),
  input: { padding: "0.6rem 0.9rem", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: "0.9rem", outline: "none", width: "100%" },
  row: (alt) => ({ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.85rem 1rem", borderRadius: 10, background: alt ? "#f8fafc" : "#fff", marginBottom: 6 }),
  avatar: (bg, color) => ({ width: 36, height: 36, borderRadius: "50%", background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem", flexShrink: 0 }),
};

export default function ReceptionistView() {
  const { queue, addPatient, callNext, setAvgConsult } = useQueue();
  const [name, setName] = useState("");
  const [activeNav, setActiveNav] = useState("queue");
  const [history, setHistory] = useState([]);
  const [clinicName, setClinicName] = useState("City Clinic");
  const [settingAvg, setSettingAvg] = useState("");
  const [saved, setSaved] = useState(false);

  if (!queue) return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#f0f4f8" }}>
      <p style={{ color: "#888" }}>Connecting to server...</p>
    </div>
  );

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addPatient(trimmed);
    setName("");
  };

  const handleCallNext = () => {
    if (!queue.tokens.length) return;
    const next = queue.tokens[0];
    setHistory((prev) => [
      { ...next, seenAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), status: "seen" },
      ...prev,
    ]);
    callNext();
  };

  const handleSaveSettings = () => {
    const val = parseInt(settingAvg);
    if (!isNaN(val) && val > 0) setAvgConsult(val);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearQueue = () => {
    if (window.confirm("Clear the entire queue? This cannot be undone.")) {
      queue.tokens.forEach(() => callNext());
    }
  };

  const allPatients = [
    ...(queue.currentToken
      ? [{ ...queue.currentToken, status: "serving", seenAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]
      : []),
    ...queue.tokens.map((t, i) => ({ ...t, status: "waiting", position: i + 1 })),
    ...history,
  ];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#f0f4f8" }}>

      {/* Sidebar */}
      <div style={S.sidebar}>
        <div style={{ padding: "0 1.5rem 2rem" }}>
          <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#2563eb" }}>{clinicName}</h1>
          <p style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: 2 }}>Reception Panel</p>
        </div>

        {NAV.map((item) => (
          <div key={item.id} onClick={() => setActiveNav(item.id)} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "0.75rem 1.5rem", cursor: "pointer",
            background: activeNav === item.id ? "#eff6ff" : "transparent",
            borderRight: activeNav === item.id ? "3px solid #2563eb" : "3px solid transparent",
            color: activeNav === item.id ? "#2563eb" : "#64748b",
            fontWeight: activeNav === item.id ? 600 : 400,
            fontSize: "0.9rem", transition: "all 0.15s",
          }}>
            <span>{item.icon}</span>{item.label}
          </div>
        ))}

      </div>

      {/* Main */}
      <div style={S.main}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1e293b" }}>
              {activeNav === "queue" && "Reception Dashboard"}
              {activeNav === "patients" && "Patient List"}
              {activeNav === "settings" && "Settings"}
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
              {activeNav === "queue" && "Manage today's patient queue"}
              {activeNav === "patients" && `${allPatients.length} patient${allPatients.length !== 1 ? "s" : ""} today`}
              {activeNav === "settings" && "Configure your clinic preferences"}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={S.avatar("#dbeafe", "#2563eb")}>R</div>
            <div>
              <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1e293b" }}>Receptionist</p>
              <p style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Admin</p>
            </div>
          </div>
        </div>

        {/* ── QUEUE TAB ── */}
        {activeNav === "queue" && (
          <>
            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: "1.5rem" }}>
              {[
                { label: "Now Serving", value: queue.currentToken?.name ?? "—", sub: "Current patient" },
                { label: "Waiting", value: queue.tokens.length, sub: "In queue" },
                { label: "Avg Wait Time", value: `${queue.avgConsultMin} min`, sub: "Per consultation" },
              ].map((c) => (
                <div key={c.label} style={{ ...S.card, marginBottom: 0 }}>
                  <p style={{ fontSize: "0.78rem", color: "#94a3b8", marginBottom: 4 }}>{c.label}</p>
                  <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", marginBottom: 2 }}>{c.value}</p>
                  <p style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{c.sub}</p>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: "1.5rem" }}>
              {/* Add patient */}
              <div style={S.card}>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#1e293b", marginBottom: "1rem" }}>Add Patient</h3>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} placeholder="Enter patient name" style={{ ...S.input, flex: 1, width: "auto" }} />
                  <button onClick={handleAdd} disabled={!name.trim()} style={S.btn("#2563eb", !name.trim())}>+ Add</button>
                </div>
                <div style={{ marginTop: "1rem" }}>
                  <p style={{ fontSize: "0.78rem", color: "#94a3b8", marginBottom: 6 }}>Avg consultation time</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="number" min={1} value={queue.avgConsultMin} onChange={(e) => setAvgConsult(e.target.value)} style={{ width: 70, padding: "0.5rem", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: "0.9rem", textAlign: "center" }} />
                    <span style={{ color: "#64748b", fontSize: "0.9rem" }}>minutes</span>
                  </div>
                </div>
              </div>

              {/* Call next */}
              <div style={S.card}>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#1e293b", marginBottom: "0.5rem" }}>Now Serving</h3>
                <div style={{ background: "#eff6ff", borderRadius: 10, padding: "1rem", marginBottom: "1rem", textAlign: "center" }}>
                  <p style={{ fontSize: "0.78rem", color: "#93c5fd", marginBottom: 4 }}>Current patient</p>
                  <p style={{ fontSize: "1.4rem", fontWeight: 700, color: "#1d4ed8" }}>{queue.currentToken?.name ?? "—"}</p>
                </div>
                <button onClick={handleCallNext} disabled={!queue.tokens.length} style={{ ...S.btn("#2563eb", !queue.tokens.length), width: "100%", padding: "0.75rem" }}>
                  Call Next Patient ({queue.tokens.length} waiting)
                </button>
              </div>
            </div>

            {/* Queue list */}
            <div style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#1e293b" }}>Patient Queue</h3>
                <span style={{ fontSize: "0.78rem", color: "#2563eb", fontWeight: 500 }}>{queue.tokens.length} waiting</span>
              </div>
              {queue.tokens.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                  <p style={{ fontSize: "2rem", marginBottom: 8 }}>🏥</p>
                  <p>Queue is empty — add a patient to get started</p>
                </div>
              ) : (
                queue.tokens.map((t, i) => (
                  <div key={t.id} style={S.row(i % 2 === 0)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={S.avatar("#dbeafe", "#2563eb")}>{t.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1e293b" }}>{t.name}</p>
                        <p style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Token #{i + 1}</p>
                      </div>
                    </div>
                    <span style={S.badge("#1d4ed8", "#eff6ff")}>~{(i + 1) * queue.avgConsultMin} min wait</span>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ── PATIENT LIST TAB ── */}
        {activeNav === "patients" && (
          <div style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#1e293b" }}>All patients today</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={S.badge("#0f6e56", "#e1f5ee")}>● Seen: {history.length}</span>
                <span style={S.badge("#1d4ed8", "#eff6ff")}>● Waiting: {queue.tokens.length}</span>
                {queue.currentToken && <span style={S.badge("#854f0b", "#faeeda")}>● Serving: 1</span>}
              </div>
            </div>

            {allPatients.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
                <p style={{ fontSize: "2rem", marginBottom: 8 }}>📋</p>
                <p>No patients yet today. Add patients from the Queue tab.</p>
              </div>
            ) : (
              <>
                {/* Table header */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 12, padding: "0.5rem 1rem", borderBottom: "1.5px solid #e2e8f0", marginBottom: 4 }}>
                  {["Patient", "Time", "Position", "Status"].map((h) => (
                    <p key={h} style={{ fontSize: "0.72rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</p>
                  ))}
                </div>

                {allPatients.map((p, i) => (
                  <div key={p.id + p.status} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 12, padding: "0.75rem 1rem", borderRadius: 8, background: i % 2 === 0 ? "#f8fafc" : "#fff", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={S.avatar(
                        p.status === "serving" ? "#faeeda" : p.status === "seen" ? "#e1f5ee" : "#dbeafe",
                        p.status === "serving" ? "#854f0b" : p.status === "seen" ? "#0f6e56" : "#1d4ed8"
                      )}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1e293b" }}>{p.name}</p>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "#64748b" }}>{p.seenAt ?? "—"}</p>
                    <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
                      {p.status === "waiting" ? `#${p.position}` : p.status === "serving" ? "Now" : "Done"}
                    </p>
                    <span style={
                      p.status === "serving"
                        ? S.badge("#854f0b", "#faeeda")
                        : p.status === "seen"
                        ? S.badge("#0f6e56", "#e1f5ee")
                        : S.badge("#1d4ed8", "#eff6ff")
                    }>
                      {p.status === "serving" ? "Serving" : p.status === "seen" ? "Seen ✓" : "Waiting"}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeNav === "settings" && (
          <>
            {/* Clinic info */}
            <div style={S.card}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#1e293b", marginBottom: "1.25rem" }}>Clinic information</h3>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 500, display: "block", marginBottom: 6 }}>Clinic name</label>
                <input value={clinicName} onChange={(e) => setClinicName(e.target.value)} style={{ ...S.input, maxWidth: 320 }} />
              </div>
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 500, display: "block", marginBottom: 6 }}>Default avg consultation time (minutes)</label>
                <input type="number" min={1} placeholder={queue.avgConsultMin} value={settingAvg} onChange={(e) => setSettingAvg(e.target.value)} style={{ ...S.input, maxWidth: 120 }} />
                <p style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: 4 }}>Currently set to {queue.avgConsultMin} min</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={handleSaveSettings} style={S.btn("#2563eb", false)}>
                  {saved ? "✓ Saved!" : "Save changes"}
                </button>
                {saved && <span style={{ fontSize: "0.85rem", color: "#0f6e56" }}>Settings updated successfully</span>}
              </div>
            </div>

            {/* Queue management */}
            <div style={S.card}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#1e293b", marginBottom: "0.5rem" }}>Queue management</h3>
              <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "1.25rem" }}>Manage the current queue state</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", background: "#f8fafc", borderRadius: 10 }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1e293b" }}>Patients currently waiting</p>
                    <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{queue.tokens.length} in queue</p>
                  </div>
                  <span style={S.badge("#1d4ed8", "#eff6ff")}>{queue.tokens.length} patients</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", background: "#f8fafc", borderRadius: 10 }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1e293b" }}>Patients seen today</p>
                    <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{history.length} consultations completed</p>
                  </div>
                  <span style={S.badge("#0f6e56", "#e1f5ee")}>{history.length} seen</span>
                </div>

                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "1rem", marginTop: 4 }}>
                  <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: 10 }}>Danger zone</p>
                  <button
                    onClick={handleClearQueue}
                    disabled={queue.tokens.length === 0}
                    style={{ ...S.btn("#dc2626", queue.tokens.length === 0), padding: "0.6rem 1.25rem" }}
                  >
                    Clear entire queue
                  </button>
                  <p style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: 6 }}>This will remove all {queue.tokens.length} waiting patients. Cannot be undone.</p>
                </div>
              </div>
            </div>

            {/* About */}
            <div style={S.card}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#1e293b", marginBottom: "1rem" }}>About</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  ["System", "Clinic Queue v1.0"],
                  ["Sync", "Socket.io real-time"],
                  ["Storage", "In-memory"],
                  ["Screens", "Receptionist + Waiting Room"],
                ].map(([k, v]) => (
                  <div key={k} style={{ padding: "0.75rem 1rem", background: "#f8fafc", borderRadius: 8 }}>
                    <p style={{ fontSize: "0.72rem", color: "#94a3b8", marginBottom: 2 }}>{k}</p>
                    <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1e293b" }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}