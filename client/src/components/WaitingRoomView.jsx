import { useState, useEffect } from "react";
import { useQueue } from "../hooks/useQueue";
import { estimateWait } from "../utils/waitTime";

export default function WaitingRoomView() {
  const { queue } = useQueue();
  const [, tick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

  if (!queue) return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#f0f4f8" }}>
      <p style={{ color: "#888" }}>Connecting to server...</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8", padding: "2rem" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#1e293b" }}>Clinic Queue</h1>
        <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Waiting Room Display</p>
      </div>

      {/* Now serving — big card */}
      <div style={{ background: "#2563eb", borderRadius: 16, padding: "2.5rem", textAlign: "center", marginBottom: "1.5rem", maxWidth: 600, margin: "0 auto 1.5rem" }}>
        <p style={{ color: "#93c5fd", fontSize: "0.9rem", marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>Now Serving</p>
        <p style={{ fontSize: "3rem", fontWeight: 800, color: "#fff", marginBottom: 8 }}>
          {queue.currentToken?.name ?? "—"}
        </p>
        <p style={{ color: "#bfdbfe", fontSize: "0.85rem" }}>Please proceed to the consultation room</p>
      </div>

      {/* Queue list */}
      <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", maxWidth: 600, margin: "0 auto", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#1e293b", marginBottom: "1rem" }}>
          Up Next — {queue.tokens.length} waiting
        </h2>

        {queue.tokens.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
            <p style={{ fontSize: "2rem", marginBottom: 8 }}>✅</p>
            <p>No one waiting — queue is clear!</p>
          </div>
        ) : (
          queue.tokens.map((t, i) => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.85rem 1rem", borderRadius: 10, background: i === 0 ? "#eff6ff" : "#f8fafc", marginBottom: 8, border: i === 0 ? "1.5px solid #bfdbfe" : "1.5px solid transparent" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: i === 0 ? "#2563eb" : "#e2e8f0", color: i === 0 ? "#fff" : "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem" }}>
                  {i + 1}
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1e293b" }}>{t.name}</p>
                  <p style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{i === 0 ? "You are next!" : `${i} patient${i > 1 ? "s" : ""} ahead`}</p>
                </div>
              </div>
              <span style={{ background: i === 0 ? "#dbeafe" : "#f1f5f9", color: i === 0 ? "#1d4ed8" : "#64748b", fontSize: "0.8rem", fontWeight: 600, padding: "0.3rem 0.75rem", borderRadius: 20 }}>
                ~{estimateWait({ pos: i + 1, avgConsultMin: queue.avgConsultMin, calledAt: queue.calledAt })} min
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}