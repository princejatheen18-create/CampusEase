import { useState, useEffect, useMemo } from "react";
import { Zap, Cookie, Wind, LayoutGrid, Flag, Clock, Activity, Loader2, Check, X } from "lucide-react";

const STORAGE_KEY = "campusease-data-v1";
const FLOORS = ["Floor 1", "Floor 2", "Floor 3"];

const COLORS = {
  bg: "#EEF2ED",
  frame: "#FFFFFF",
  board: "#16211B",
  boardLine: "#2B392F",
  ink: "#1E2A22",
  inkMuted: "#5B6B60",
  line: "#DCE3DA",
  panel: "#F6F8F4",
  teal: "#1F6F5C",
  tealBg: "#E1EEE8",
  amber: "#B4790E",
  amberBg: "#FBEDD3",
  coral: "#B3402C",
  coralBg: "#F7E1DB",
};

const TYPE_META = {
  charging: {
    icon: Zap,
    noun: "Charging bay",
    labels: { ok: "Free", watch: "In use", flagged: "Out of order" },
  },
  vending: {
    icon: Cookie,
    noun: "Vending machine",
    labels: { ok: "Stocked", watch: "Low stock", flagged: "Out of order" },
  },
  washroom: {
    icon: Wind,
    noun: "Washroom",
    labels: { ok: "Clean", watch: "Needs attention", flagged: "Out of service" },
  },
};

function defaultFacilities() {
  const now = Date.now();
  const mins = (n) => now - n * 60000;
  return [
    { id: "f1-charge-104", name: "Room 104", floor: "Floor 1", type: "charging", status: "ok", updatedAt: mins(12) },
    { id: "f1-charge-lib", name: "Library entrance", floor: "Floor 1", type: "charging", status: "watch", updatedAt: mins(4) },
    { id: "f1-vend-lobby", name: "Lobby", floor: "Floor 1", type: "vending", status: "ok", updatedAt: mins(30) },
    { id: "f1-wash-a", name: "Block A", floor: "Floor 1", type: "washroom", status: "ok", updatedAt: mins(90) },
    { id: "f2-charge-204", name: "Room 204", floor: "Floor 2", type: "charging", status: "ok", updatedAt: mins(18) },
    { id: "f2-vend-lounge", name: "Floor 2 lounge", floor: "Floor 2", type: "vending", status: "watch", updatedAt: mins(6) },
    { id: "f2-wash", name: "Floor 2", floor: "Floor 2", type: "washroom", status: "watch", updatedAt: mins(45) },
    { id: "f3-charge-hall", name: "Seminar hall", floor: "Floor 3", type: "charging", status: "ok", updatedAt: mins(3) },
    { id: "f3-vend", name: "Floor 3", floor: "Floor 3", type: "vending", status: "ok", updatedAt: mins(60) },
    { id: "f3-wash", name: "Floor 3", floor: "Floor 3", type: "washroom", status: "flagged", updatedAt: mins(9) },
  ];
}

function formatRelative(ts, now) {
  const diff = Math.max(0, Math.round((now - ts) / 60000));
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff}m ago`;
  const hrs = Math.round(diff / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function generateSlots(now) {
  const slots = [];
  const start = new Date(now);
  start.setSeconds(0, 0);
  const rem = start.getMinutes() % 30;
  start.setMinutes(start.getMinutes() + (30 - rem));
  for (let i = 0; i < 6; i++) {
    const d = new Date(start.getTime() + i * 30 * 60000);
    slots.push(d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
  }
  return slots;
}

const statusColor = (status) =>
  status === "ok" ? COLORS.teal : status === "watch" ? COLORS.amber : COLORS.coral;
const statusBg = (status) =>
  status === "ok" ? COLORS.tealBg : status === "watch" ? COLORS.amberBg : COLORS.coralBg;

export default function CampusEase() {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [tab, setTab] = useState("board");
  const [floorFilter, setFloorFilter] = useState("All");
  const [now, setNow] = useState(Date.now());
  const [toast, setToast] = useState(null);

  const [reportFacility, setReportFacility] = useState("");
  const [reportNote, setReportNote] = useState("");
  const [reportError, setReportError] = useState("");

  const [reserveFacility, setReserveFacility] = useState("");
  const [reserveSlot, setReserveSlot] = useState("");
  const [reserveError, setReserveError] = useState("");

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setData(JSON.parse(raw));
      } else {
        const initial = { facilities: defaultFacilities(), reports: [], reservations: [] };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        setData(initial);
      }
    } catch (e) {
      setLoadError(true);
      setData({ facilities: defaultFacilities(), reports: [], reservations: [] });
    }
  }, []);

  const persist = (next) => {
    setData(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      setToast({ kind: "error", text: "Couldn't save locally." });
    }
  };

  const showToast = (kind, text) => {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 2600);
  };

  const facilities = data?.facilities ?? [];
  const reports = data?.reports ?? [];
  const reservations = data?.reservations ?? [];

  const visibleFacilities = useMemo(
    () => (floorFilter === "All" ? facilities : facilities.filter((f) => f.floor === floorFilter)),
    [facilities, floorFilter]
  );

  const counts = useMemo(() => {
    const c = { ok: 0, watch: 0, flagged: 0 };
    visibleFacilities.forEach((f) => c[f.status]++);
    return c;
  }, [visibleFacilities]);

  const chargingFacilities = facilities.filter((f) => f.type === "charging");
  const slots = useMemo(() => generateSlots(now), [now]);

  const submitReport = () => {
    setReportError("");
    if (!reportFacility) return setReportError("Choose a facility first.");
    if (!reportNote.trim()) return setReportError("Describe what's wrong.");
    const next = {
      ...data,
      facilities: facilities.map((f) =>
        f.id === reportFacility ? { ...f, status: "flagged", updatedAt: Date.now() } : f
      ),
      reports: [
        { id: `r-${Date.now()}`, facilityId: reportFacility, note: reportNote.trim(), timestamp: Date.now() },
        ...reports,
      ],
    };
    persist(next);
    setReportFacility("");
    setReportNote("");
    showToast("ok", "Reported. Thanks for flagging it.");
    setTab("board");
  };

  const submitReservation = () => {
    setReserveError("");
    if (!reserveFacility) return setReserveError("Choose a charging bay.");
    if (!reserveSlot) return setReserveError("Pick a time slot.");
    const conflict = reservations.some(
      (r) => r.facilityId === reserveFacility && r.slot === reserveSlot
    );
    if (conflict) return setReserveError("That slot is already booked. Pick another.");
    const next = {
      ...data,
      reservations: [
        { id: `v-${Date.now()}`, facilityId: reserveFacility, slot: reserveSlot, timestamp: Date.now() },
        ...reservations,
      ],
    };
    persist(next);
    setReserveSlot("");
    showToast("ok", "Reserved. See you then.");
  };

  const cancelReservation = (id) => {
    persist({ ...data, reservations: reservations.filter((r) => r.id !== id) });
  };

  const facilityName = (id) => {
    const f = facilities.find((x) => x.id === id);
    return f ? `${TYPE_META[f.type].noun}, ${f.name}` : "Unknown facility";
  };

  const feed = useMemo(() => {
    const items = [
      ...reports.map((r) => ({ kind: "report", ...r })),
      ...reservations.map((r) => ({ kind: "reservation", ...r })),
    ];
    return items.sort((a, b) => b.timestamp - a.timestamp);
  }, [reports, reservations]);

  return (
    <div style={{ background: COLORS.bg, minHeight: "100%", padding: "24px 12px", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        .ce-btn { transition: transform 0.1s ease, background 0.15s ease, border-color 0.15s ease; cursor: pointer; }
        .ce-btn:active { transform: scale(0.97); }
        .ce-chip:focus-visible, .ce-btn:focus-visible, .ce-input:focus-visible, .ce-select:focus-visible, .ce-textarea:focus-visible {
          outline: 2px solid ${COLORS.teal}; outline-offset: 2px;
        }
        .ce-input, .ce-select, .ce-textarea {
          font-family: inherit; font-size: 14px; color: ${COLORS.ink};
          background: #fff; border: 1px solid ${COLORS.line}; border-radius: 10px; padding: 10px 12px; width: 100%;
        }
        .ce-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      <div
        style={{
          maxWidth: 420,
          margin: "0 auto",
          background: COLORS.frame,
          borderRadius: 28,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(30,42,34,0.08), 0 12px 32px rgba(30,42,34,0.10)",
          border: `1px solid ${COLORS.line}`,
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 20px 14px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif", fontWeight: 700, fontSize: 21, color: COLORS.ink, letterSpacing: "-0.01em" }}>
              CampusEase
            </span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: COLORS.inkMuted }}>
              {new Date(now).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
            </span>
          </div>
          <p style={{ margin: "4px 0 0", fontSize: 12.5, color: COLORS.inkMuted }}>
            Saved on this device.
          </p>
        </div>

        {/* Floor chips */}
        <div className="ce-scroll" style={{ display: "flex", gap: 8, padding: "0 20px 16px", overflowX: "auto" }}>
          {["All", ...FLOORS].map((fl) => (
            <button
              key={fl}
              className="ce-btn ce-chip"
              onClick={() => setFloorFilter(fl)}
              style={{
                flexShrink: 0,
                border: `1px solid ${floorFilter === fl ? COLORS.teal : COLORS.line}`,
                background: floorFilter === fl ? COLORS.tealBg : "#fff",
                color: floorFilter === fl ? COLORS.teal : COLORS.inkMuted,
                borderRadius: 999,
                padding: "6px 14px",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {fl}
            </button>
          ))}
        </div>

        {/* Status board */}
        <div style={{ margin: "0 20px 18px", background: COLORS.board, borderRadius: 16, padding: "14px 16px" }}>
          <p style={{ margin: "0 0 10px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: "#8FA396", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {floorFilter === "All" ? "All floors" : floorFilter} · status
          </p>
          <div style={{ display: "flex", gap: 18, fontFamily: "'IBM Plex Mono', monospace" }}>
            {[
              { label: "Free", val: counts.ok, color: "#6FCF9E" },
              { label: "Watch", val: counts.watch, color: "#F0C46A" },
              { label: "Flagged", val: counts.flagged, color: "#EE8C77" },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: 22, color: s.color, fontWeight: 600, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 10.5, color: "#8FA396", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "0 20px 100px", minHeight: 320 }}>
          {!data && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "60px 0", color: COLORS.inkMuted }}>
              <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              <span style={{ fontSize: 13 }}>Loading facilities…</span>
            </div>
          )}

          {data && tab === "board" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {visibleFacilities.length === 0 && (
                <p style={{ fontSize: 13, color: COLORS.inkMuted, textAlign: "center", padding: "40px 0" }}>
                  No facilities on this floor.
                </p>
              )}
              {visibleFacilities.map((f) => {
                const meta = TYPE_META[f.type];
                const Icon = meta.icon;
                return (
                  <div
                    key={f.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 14px",
                      background: COLORS.panel,
                      borderRadius: 12,
                      border: `1px solid ${COLORS.line}`,
                    }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: statusBg(f.status), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={17} color={statusColor(f.status)} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, color: COLORS.ink }}>
                        {meta.noun}, {f.name}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: 11.5, color: COLORS.inkMuted }}>
                        {f.floor} · updated {formatRelative(f.updatedAt, now)}
                      </p>
                    </div>
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 11,
                        fontWeight: 600,
                        color: statusColor(f.status),
                        background: statusBg(f.status),
                        padding: "4px 9px",
                        borderRadius: 999,
                        flexShrink: 0,
                      }}
                    >
                      {meta.labels[f.status]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {data && tab === "report" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 4 }}>
              <div>
                <label style={{ display: "block", fontSize: 12.5, color: COLORS.inkMuted, marginBottom: 6 }}>Facility</label>
                <select className="ce-select" value={reportFacility} onChange={(e) => setReportFacility(e.target.value)}>
                  <option value="">Select a facility</option>
                  {FLOORS.map((fl) => (
                    <optgroup key={fl} label={fl}>
                      {facilities.filter((f) => f.floor === fl).map((f) => (
                        <option key={f.id} value={f.id}>{TYPE_META[f.type].noun}, {f.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12.5, color: COLORS.inkMuted, marginBottom: 6 }}>What's wrong</label>
                <textarea
                  className="ce-textarea"
                  rows={4}
                  placeholder="Machine isn't dispensing snacks"
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                  style={{ resize: "vertical" }}
                />
              </div>
              {reportError && (
                <p style={{ margin: 0, fontSize: 12.5, color: COLORS.coral }}>{reportError}</p>
              )}
              <button
                className="ce-btn"
                onClick={submitReport}
                style={{ background: COLORS.coral, color: "#fff", border: "none", borderRadius: 12, padding: "12px 0", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <Flag size={15} /> Flag this
              </button>
            </div>
          )}

          {data && tab === "reserve" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 4 }}>
              <div>
                <label style={{ display: "block", fontSize: 12.5, color: COLORS.inkMuted, marginBottom: 6 }}>Charging bay</label>
                <select className="ce-select" value={reserveFacility} onChange={(e) => setReserveFacility(e.target.value)}>
                  <option value="">Select a charging bay</option>
                  {chargingFacilities.map((f) => (
                    <option key={f.id} value={f.id}>{f.floor} — {f.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12.5, color: COLORS.inkMuted, marginBottom: 6 }}>Time slot</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {slots.map((s) => (
                    <button
                      key={s}
                      className="ce-btn"
                      onClick={() => setReserveSlot(s)}
                      style={{
                        border: `1px solid ${reserveSlot === s ? COLORS.teal : COLORS.line}`,
                        background: reserveSlot === s ? COLORS.tealBg : "#fff",
                        color: reserveSlot === s ? COLORS.teal : COLORS.ink,
                        borderRadius: 999,
                        padding: "7px 13px",
                        fontSize: 12.5,
                        fontFamily: "'IBM Plex Mono', monospace",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {reserveError && (
                <p style={{ margin: 0, fontSize: 12.5, color: COLORS.coral }}>{reserveError}</p>
              )}
              <button
                className="ce-btn"
                onClick={submitReservation}
                style={{ background: COLORS.teal, color: "#fff", border: "none", borderRadius: 12, padding: "12px 0", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <Clock size={15} /> Reserve slot
              </button>

              {reservations.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <p style={{ fontSize: 12, color: COLORS.inkMuted, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Upcoming</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {reservations.map((r) => (
                      <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: "9px 12px" }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 12.5, color: COLORS.ink, fontWeight: 500 }}>{facilityName(r.facilityId)}</p>
                          <p style={{ margin: "2px 0 0", fontSize: 11.5, color: COLORS.inkMuted, fontFamily: "'IBM Plex Mono', monospace" }}>{r.slot}</p>
                        </div>
                        <button className="ce-btn" onClick={() => cancelReservation(r.id)} aria-label="Cancel reservation" style={{ background: "none", border: "none", color: COLORS.inkMuted, padding: 4 }}>
                          <X size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {data && tab === "activity" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 4 }}>
              {feed.length === 0 && (
                <p style={{ fontSize: 13, color: COLORS.inkMuted, textAlign: "center", padding: "40px 0" }}>
                  Nothing reported or reserved yet.
                </p>
              )}
              {feed.map((item) => (
                <div key={item.id} style={{ display: "flex", gap: 12, padding: "11px 14px", background: COLORS.panel, borderRadius: 12, border: `1px solid ${COLORS.line}` }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: item.kind === "report" ? COLORS.coralBg : COLORS.tealBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item.kind === "report" ? <Flag size={14} color={COLORS.coral} /> : <Clock size={14} color={COLORS.teal} />}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13, color: COLORS.ink }}>
                      {item.kind === "report"
                        ? <>Flagged <strong style={{ fontWeight: 500 }}>{facilityName(item.facilityId)}</strong> — {item.note}</>
                        : <>Reserved <strong style={{ fontWeight: 500 }}>{facilityName(item.facilityId)}</strong> for {item.slot}</>}
                    </p>
                    <p style={{ margin: "3px 0 0", fontSize: 11, color: COLORS.inkMuted }}>{formatRelative(item.timestamp, now)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <div style={{ position: "sticky", bottom: 0, display: "flex", background: "#fff", borderTop: `1px solid ${COLORS.line}` }}>
          {[
            { id: "board", label: "Board", icon: LayoutGrid },
            { id: "report", label: "Report", icon: Flag },
            { id: "reserve", label: "Reserve", icon: Clock },
            { id: "activity", label: "Activity", icon: Activity },
          ].map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                className="ce-btn"
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1,
                  border: "none",
                  background: "none",
                  padding: "11px 0 13px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  color: active ? COLORS.teal : COLORS.inkMuted,
                  borderTop: `2px solid ${active ? COLORS.teal : "transparent"}`,
                  marginTop: -1,
                }}
              >
                <Icon size={18} />
                <span style={{ fontSize: 10.5, fontWeight: 500 }}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: COLORS.ink,
            color: "#fff",
            padding: "10px 18px",
            borderRadius: 999,
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
          }}
        >
          {toast.kind === "ok" ? <Check size={14} /> : null}
          {toast.text}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
