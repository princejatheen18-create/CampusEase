import { useState, useEffect, useMemo } from "react";
import {
  Zap, Cookie, Wind, Flag, Clock, Check, X, Search, Map as MapIcon, List,
  ShieldCheck, BarChart3, CheckCircle2, TrendingUp, Building2, Plus,
  Star, Moon, Sun, Sparkles, Wifi, Droplets, User, GraduationCap, QrCode, Navigation,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const STORAGE_KEY = "campusease-data-v5";
const FLOORS = ["FET Block", "PU Block", "Aerospace Block"];
const CAMPUS = {
  name: "JAIN Global Campus",
  address: "Jakkasandra Post, Kanakapura Road, Ramanagara District, Bengaluru — 562112",
  size: "350-acre campus",
  slogan: "350 Acres. One App.",
};
const STATUS_FILTERS = ["All", "ok", "watch", "flagged"];

const LIGHT = {
  bg: "#EEF2ED",
  surface: "#FFFFFF",
  ink: "#1E2A22",
  inkMuted: "#5B6B60",
  inkFaint: "#94A199",
  line: "#DCE3DA",
  panel: "#F6F8F4",
  teal: "#1F6F5C",
  tealBg: "#E1EEE8",
  amber: "#B4790E",
  amberBg: "#FBEDD3",
  coral: "#B3402C",
  coralBg: "#F7E1DB",
};

const DARK = {
  bg: "#12151A",
  surface: "#1B2027",
  ink: "#EEF1F5",
  inkMuted: "#909AA8",
  inkFaint: "#5E6773",
  line: "#2A3038",
  panel: "#1B2027",
  teal: "#3FD8AC",
  tealBg: "rgba(63,216,172,0.14)",
  amber: "#F2BB4E",
  amberBg: "rgba(242,187,78,0.14)",
  coral: "#FF7C6B",
  coralBg: "rgba(255,124,107,0.14)",
};

// mutable palette object — reassigned every render based on theme state
const COLORS = { ...DARK };

const STATUS_SHORT = { ok: "Free", watch: "Watch", flagged: "Flagged" };

const TYPE_META = {
  charging: { icon: Zap, noun: "Charging bay", labels: { ok: "Free", watch: "In use", flagged: "Out of order" } },
  vending: { icon: Cookie, noun: "Vending machine", labels: { ok: "Stocked", watch: "Low stock", flagged: "Out of order" } },
  washroom: { icon: Wind, noun: "Washroom", labels: { ok: "Clean", watch: "Needs attention", flagged: "Out of service" } },
  wifi: { icon: Wifi, noun: "WiFi zone", labels: { ok: "Strong signal", watch: "Weak signal", flagged: "No signal" } },
  watercooler: { icon: Droplets, noun: "Water cooler", labels: { ok: "Clean", watch: "Due for cleaning", flagged: "Needs cleaning" } },
};

const FLOOR_PINS = {
  "FET Block": {
    "f1-charge-104": [22, 30], "f1-charge-lib": [78, 30], "f1-vend-lobby": [50, 74], "f1-wash-a": [10, 74],
    "f1-wifi-lib": [50, 18], "f1-water-canteen": [90, 74],
  },
  "PU Block": {
    "f2-charge-204": [25, 30], "f2-vend-lounge": [75, 30], "f2-wash": [50, 74],
    "f2-wifi-workshop": [50, 18], "f2-water-corridor": [85, 74],
  },
  "Aerospace Block": {
    "f3-charge-hall": [25, 30], "f3-vend": [75, 30], "f3-wash": [50, 74],
    "f3-wifi-hangar": [50, 18], "f3-water-ground": [85, 74],
  },
};

// Teacher cabin pins, kept separate from facility pins but drawn on the same map
const TEACHER_PINS = {
  "FET Block": { "t1": [35, 16], "t2": [65, 16] },
  "PU Block": { "t3": [35, 16], "t4": [65, 16] },
  "Aerospace Block": { "t5": [35, 16], "t6": [65, 16] },
};

const TEACHERS = [
  { id: "t1", name: "Dr. Ramesh Iyer", dept: "Computer Science", floor: "FET Block", room: "Room 210" },
  { id: "t2", name: "Prof. Anitha Kumar", dept: "Electronics & Communication", floor: "FET Block", room: "Room 215" },
  { id: "t3", name: "Dr. Suresh Rao", dept: "Mechanical Engineering", floor: "PU Block", room: "Room 118" },
  { id: "t4", name: "Prof. Meena Nair", dept: "Civil Engineering", floor: "PU Block", room: "Room 122" },
  { id: "t5", name: "Dr. Arvind Menon", dept: "Aerospace Engineering", floor: "Aerospace Block", room: "Hangar Office 3" },
  { id: "t6", name: "Prof. Divya Shetty", dept: "Avionics", floor: "Aerospace Block", room: "Hangar Office 5" },
];

// where "you" enter each block from — used to draw the walking route
const FLOOR_ENTRANCE = { "FET Block": [50, 90], "PU Block": [50, 90], "Aerospace Block": [50, 90] };
const BLOCK_SHORT = { "FET Block": "FET", "PU Block": "PU", "Aerospace Block": "Aero" };

const TAB_META = {
  explore: { label: "Explore", subtitle: "Live status of every facility on campus." },
  teachers: { label: "Teachers", subtitle: "Find a teacher's cabin and get walking directions." },
  report: { label: "Report", subtitle: "Flag something that needs attention." },
  reserve: { label: "Reserve", subtitle: "Book a charging bay ahead of time." },
  insights: { label: "Insights", subtitle: "Trends across reports and blocks." },
  admin: { label: "Admin", subtitle: "Open issues, QR codes, and the full activity log." },
};

function defaultFacilities() {
  const now = Date.now();
  const mins = (n) => now - n * 60000;
  return [
    { id: "f1-charge-104", name: "Room 104", floor: "FET Block", type: "charging", status: "ok", updatedAt: mins(12) },
    { id: "f1-charge-lib", name: "Library entrance", floor: "FET Block", type: "charging", status: "watch", updatedAt: mins(4) },
    { id: "f1-vend-lobby", name: "Main lobby", floor: "FET Block", type: "vending", status: "ok", updatedAt: mins(30) },
    { id: "f1-wash-a", name: "Ground floor", floor: "FET Block", type: "washroom", status: "ok", updatedAt: mins(90) },
    { id: "f2-charge-204", name: "Workshop corridor", floor: "PU Block", type: "charging", status: "ok", updatedAt: mins(18) },
    { id: "f2-vend-lounge", name: "Faculty lounge", floor: "PU Block", type: "vending", status: "watch", updatedAt: mins(6) },
    { id: "f2-wash", name: "First floor", floor: "PU Block", type: "washroom", status: "watch", updatedAt: mins(45) },
    { id: "f3-charge-hall", name: "Design studio", floor: "Aerospace Block", type: "charging", status: "ok", updatedAt: mins(3) },
    { id: "f3-vend", name: "Hangar lobby", floor: "Aerospace Block", type: "vending", status: "ok", updatedAt: mins(60) },
    { id: "f3-wash", name: "Ground floor", floor: "Aerospace Block", type: "washroom", status: "flagged", updatedAt: mins(9) },
    { id: "f1-wifi-lib", name: "Library wing", floor: "FET Block", type: "wifi", status: "ok", updatedAt: mins(8) },
    { id: "f2-wifi-workshop", name: "Workshop area", floor: "PU Block", type: "wifi", status: "watch", updatedAt: mins(22) },
    { id: "f3-wifi-hangar", name: "Hangar lab", floor: "Aerospace Block", type: "wifi", status: "flagged", updatedAt: mins(15) },
    { id: "f1-water-canteen", name: "Near canteen", floor: "FET Block", type: "watercooler", status: "ok", updatedAt: mins(180), lastCleaned: mins(180) },
    { id: "f2-water-corridor", name: "Main corridor", floor: "PU Block", type: "watercooler", status: "watch", updatedAt: mins(1800), lastCleaned: mins(1800) },
    { id: "f3-water-ground", name: "Ground floor", floor: "Aerospace Block", type: "watercooler", status: "flagged", updatedAt: mins(3000), lastCleaned: mins(3000) },
  ];
}

function seedReports() {
  const now = Date.now();
  const hrs = (n) => now - n * 3600000;
  return [
    { id: "seed-1", facilityId: "f3-wash", note: "Fan isn't working, feels stuffy.", timestamp: hrs(2), status: "open" },
    { id: "seed-2", facilityId: "f2-vend-lounge", note: "Running low on chips and drinks.", timestamp: hrs(5), status: "open" },
    { id: "seed-3", facilityId: "f1-charge-lib", note: "Two of the four ports are dead.", timestamp: hrs(30), status: "resolved", resolvedAt: hrs(28) },
    { id: "seed-4", facilityId: "f3-wash", note: "Tap was leaking near sink 2.", timestamp: hrs(50), status: "resolved", resolvedAt: hrs(47) },
    { id: "seed-5", facilityId: "f1-vend-lobby", note: "Coin slot jammed.", timestamp: hrs(70), status: "resolved", resolvedAt: hrs(69) },
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

const statusColor = (status) => (status === "ok" ? COLORS.teal : status === "watch" ? COLORS.amber : COLORS.coral);
const statusBg = (status) => (status === "ok" ? COLORS.tealBg : status === "watch" ? COLORS.amberBg : COLORS.coralBg);

function Chip({ active, onClick, children }) {
  return (
    <button
      className="ce-btn ce-chip"
      onClick={onClick}
      style={{
        flexShrink: 0,
        border: `1px solid ${active ? COLORS.teal : COLORS.line}`,
        background: active ? COLORS.tealBg : COLORS.surface,
        color: active ? COLORS.teal : COLORS.inkMuted,
        borderRadius: 999,
        padding: "6px 14px",
        fontSize: 13,
        fontWeight: 500,
      }}
    >
      {children}
    </button>
  );
}

function Skeleton() {
  return (
    <div className="ce-grid">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="ce-pulse" style={{ height: 88, borderRadius: 14, background: COLORS.panel, border: `1px solid ${COLORS.line}` }} />
      ))}
    </div>
  );
}

function Switch({ on, onClick, color }) {
  return (
    <button
      className="ce-btn"
      onClick={onClick}
      aria-pressed={on}
      style={{
        width: 38, height: 22, borderRadius: 999, border: "none", padding: 2,
        background: on ? color : COLORS.line, display: "flex", justifyContent: on ? "flex-end" : "flex-start",
      }}
    >
      <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", display: "block", boxShadow: "0 1px 2px rgba(0,0,0,0.25)" }} />
    </button>
  );
}

function CampusHero() {
  // Original illustration — not a photo — evoking a green, low-rise campus at dusk/day
  const skyTop = COLORS.panel;
  const buildings = [
    { x: 30, w: 46, h: 92, c: COLORS.panel },
    { x: 82, w: 60, h: 130, c: COLORS.teal },
    { x: 148, w: 44, h: 78, c: COLORS.panel },
    { x: 198, w: 66, h: 110, c: COLORS.coral },
    { x: 270, w: 50, h: 88, c: COLORS.panel },
    { x: 326, w: 40, h: 66, c: COLORS.panel },
  ];
  return (
    <svg viewBox="0 0 400 220" style={{ width: "100%", height: "auto", display: "block" }}>
      <defs>
        <radialGradient id="ceSky" cx="50%" cy="30%" r="75%">
          <stop offset="0%" stopColor={COLORS.tealBg} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="400" height="220" fill="url(#ceSky)" />
      <circle cx="330" cy="42" r="22" fill={COLORS.gold || COLORS.amber} opacity="0.85" />
      <line x1="0" y1="182" x2="400" y2="182" stroke={COLORS.line} strokeWidth="1.5" />
      {buildings.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={182 - b.h} width={b.w} height={b.h} rx="3" fill={b.c} opacity={b.c === COLORS.panel ? 1 : 0.9} stroke={COLORS.line} strokeWidth="1" />
          {Array.from({ length: Math.floor(b.h / 20) }).map((_, r) =>
            Array.from({ length: Math.max(2, Math.floor(b.w / 16)) }).map((_, c) => (
              <rect
                key={`${r}-${c}`}
                x={b.x + 8 + c * 15}
                y={182 - b.h + 10 + r * 20}
                width="6"
                height="8"
                rx="1"
                fill={b.c === COLORS.panel ? COLORS.line : "rgba(255,255,255,0.55)"}
              />
            ))
          )}
        </g>
      ))}
      {/* foreground trees */}
      {[18, 60, 118, 172, 240, 300, 355, 385].map((x, i) => (
        <g key={i}>
          <rect x={x - 2} y={182} width="4" height="10" fill={COLORS.line} />
          <circle cx={x} cy={176} r={i % 2 ? 9 : 7} fill={COLORS.teal} opacity="0.55" />
        </g>
      ))}
    </svg>
  );
}

function WelcomeScreen({ theme, setTheme, onEnter }) {
  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 20px", fontFamily: "'Inter', system-ui, sans-serif", position: "relative" }}>
      <style>{`
        .ce-btn { transition: transform 0.1s ease, background 0.15s ease, border-color 0.15s ease; cursor: pointer; }
        .ce-btn:active { transform: scale(0.97); }
        .ce-btn:focus-visible { outline: 2px solid ${COLORS.teal}; outline-offset: 2px; }
      `}</style>
      <button
        className="ce-btn"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        style={{ position: "absolute", top: 24, right: 24, display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 999, border: `1px solid ${COLORS.line}`, background: COLORS.surface, color: COLORS.inkMuted, fontSize: 12.5, fontWeight: 500 }}
      >
        {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        {theme === "dark" ? "Light mode" : "Dark mode"}
      </button>

      <div style={{ width: "100%", maxWidth: 460 }}>
        <div style={{ borderRadius: 20, overflow: "hidden", border: `1px solid ${COLORS.line}`, marginBottom: 28 }}>
          <CampusHero />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: COLORS.teal, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Building2 size={17} color="#0F1216" />
          </div>
          <span style={{ fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif", fontWeight: 700, fontSize: 26, color: COLORS.ink, letterSpacing: "-0.01em" }}>CampusEase</span>
        </div>

        <p style={{ textAlign: "center", fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif", fontSize: 15, fontWeight: 600, color: COLORS.teal, margin: "0 0 18px" }}>
          {CAMPUS.slogan}
        </p>

        <p style={{ textAlign: "center", fontSize: 13, color: COLORS.inkMuted, lineHeight: 1.6, margin: "0 0 28px" }}>
          Built for <strong style={{ color: COLORS.ink }}>{CAMPUS.name}</strong> — {CAMPUS.address}. A live tracker for charging bays, vending machines and washrooms across the {CAMPUS.size}.
        </p>

        <button
          className="ce-btn"
          onClick={onEnter}
          style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: COLORS.teal, color: "#0F1216", fontSize: 14.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          Enter CampusEase
        </button>
      </div>
    </div>
  );
}

export default function CampusEase() {
  const [data, setData] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [entered, setEntered] = useState(false);
  Object.assign(COLORS, theme === "dark" ? DARK : LIGHT);

  const [tab, setTab] = useState("explore");
  const [exploreView, setExploreView] = useState("list");
  const [floorFilter, setFloorFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedPin, setSelectedPin] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [toast, setToast] = useState(null);
  const [simulate, setSimulate] = useState(false);
  const [teacherQuery, setTeacherQuery] = useState("");
  const [teacherFloorFilter, setTeacherFloorFilter] = useState("All");
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);

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
        const initial = { facilities: defaultFacilities(), reports: seedReports(), reservations: [], favorites: [] };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        setData(initial);
      }
    } catch (e) {
      setData({ facilities: defaultFacilities(), reports: seedReports(), reservations: [], favorites: [] });
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

  // QR deep-link: a scanned water-cooler QR opens straight to that facility's status
  useEffect(() => {
    if (!data) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const qrId = params.get("qr");
      if (qrId) {
        const f = (data.facilities || []).find((x) => x.id === qrId);
        if (f) {
          setEntered(true);
          setTab("explore");
          setExploreView("list");
          setFloorFilter(f.floor);
          setQuery(f.name);
          showToast("ok", `Scanned: ${f.name} — showing the latest status.`);
        }
      }
    } catch (e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const facilities = data?.facilities ?? [];
  const reports = data?.reports ?? [];
  const reservations = data?.reservations ?? [];
  const favorites = data?.favorites ?? [];

  // live simulation — nudges non-flagged facilities between ok/watch to demo real-time updates
  useEffect(() => {
    if (!simulate || !data) return;
    const t = setInterval(() => {
      const eligible = facilities.filter((f) => f.status !== "flagged");
      if (eligible.length === 0) return;
      const pick = eligible[Math.floor(Math.random() * eligible.length)];
      const nextStatus = pick.status === "ok" ? "watch" : "ok";
      persist({
        ...data,
        facilities: facilities.map((f) => (f.id === pick.id ? { ...f, status: nextStatus, updatedAt: Date.now() } : f)),
      });
    }, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulate, data]);

  const toggleFavorite = (id) => {
    const next = favorites.includes(id) ? favorites.filter((x) => x !== id) : [...favorites, id];
    persist({ ...data, favorites: next });
  };

  const visibleFacilities = useMemo(() => {
    let list = floorFilter === "All" ? facilities : facilities.filter((f) => f.floor === floorFilter);
    if (statusFilter !== "All") list = list.filter((f) => f.status === statusFilter);
    if (onlyFavorites) list = list.filter((f) => favorites.includes(f.id));
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((f) => f.name.toLowerCase().includes(q) || TYPE_META[f.type].noun.toLowerCase().includes(q));
    }
    return list;
  }, [facilities, floorFilter, statusFilter, onlyFavorites, favorites, query]);

  const counts = useMemo(() => {
    const base = floorFilter === "All" ? facilities : facilities.filter((f) => f.floor === floorFilter);
    const c = { ok: 0, watch: 0, flagged: 0 };
    base.forEach((f) => c[f.status]++);
    return c;
  }, [facilities, floorFilter]);

  const chargingFacilities = facilities.filter((f) => f.type === "charging");
  const slots = useMemo(() => generateSlots(now), [now]);

  const nearestFreeCharging = useMemo(() => {
    const scope = floorFilter === "All" ? chargingFacilities : chargingFacilities.filter((f) => f.floor === floorFilter);
    return scope.find((f) => f.status === "ok") || chargingFacilities.find((f) => f.status === "ok") || null;
  }, [chargingFacilities, floorFilter]);

  const facility = (id) => facilities.find((x) => x.id === id);
  const facilityName = (id) => {
    const f = facility(id);
    return f ? `${TYPE_META[f.type].noun}, ${f.name}` : "Unknown facility";
  };

  const submitReport = () => {
    setReportError("");
    if (!reportFacility) return setReportError("Choose a facility first.");
    if (!reportNote.trim()) return setReportError("Describe what's wrong.");
    const next = {
      ...data,
      facilities: facilities.map((f) => (f.id === reportFacility ? { ...f, status: "flagged", updatedAt: Date.now() } : f)),
      reports: [{ id: `r-${Date.now()}`, facilityId: reportFacility, note: reportNote.trim(), timestamp: Date.now(), status: "open" }, ...reports],
    };
    persist(next);
    setReportFacility("");
    setReportNote("");
    showToast("ok", "Reported. Thanks for flagging it.");
    setTab("explore");
  };

  const submitReservation = () => {
    setReserveError("");
    if (!reserveFacility) return setReserveError("Choose a charging bay.");
    if (!reserveSlot) return setReserveError("Pick a time slot.");
    const conflict = reservations.some((r) => r.facilityId === reserveFacility && r.slot === reserveSlot);
    if (conflict) return setReserveError("That slot is already booked. Pick another.");
    const next = { ...data, reservations: [{ id: `v-${Date.now()}`, facilityId: reserveFacility, slot: reserveSlot, timestamp: Date.now() }, ...reservations] };
    persist(next);
    setReserveSlot("");
    showToast("ok", "Reserved. See you then.");
  };

  const cancelReservation = (id) => persist({ ...data, reservations: reservations.filter((r) => r.id !== id) });

  const resolveReport = (id) => {
    const report = reports.find((r) => r.id === id);
    if (!report) return;
    const next = {
      ...data,
      reports: reports.map((r) => (r.id === id ? { ...r, status: "resolved", resolvedAt: Date.now() } : r)),
      facilities: facilities.map((f) => (f.id === report.facilityId ? { ...f, status: "ok", updatedAt: Date.now() } : f)),
    };
    persist(next);
    showToast("ok", "Marked resolved.");
  };

  const markCleaned = (facilityId) => {
    const next = {
      ...data,
      facilities: facilities.map((f) =>
        f.id === facilityId ? { ...f, status: "ok", updatedAt: Date.now(), lastCleaned: Date.now() } : f
      ),
    };
    persist(next);
    showToast("ok", "Marked as cleaned just now.");
  };

  const feed = useMemo(() => {
    const items = [...reports.map((r) => ({ kind: "report", ...r })), ...reservations.map((r) => ({ kind: "reservation", ...r }))];
    return items.sort((a, b) => b.timestamp - a.timestamp);
  }, [reports, reservations]);

  const openQueue = useMemo(() => reports.filter((r) => r.status === "open").sort((a, b) => a.timestamp - b.timestamp), [reports]);

  const insights = useMemo(() => {
    const byType = { charging: 0, vending: 0, washroom: 0, wifi: 0, watercooler: 0 };
    const byFloor = { "FET Block": 0, "PU Block": 0, "Aerospace Block": 0 };
    const perFacility = {};
    reports.forEach((r) => {
      const f = facility(r.facilityId);
      if (!f) return;
      byType[f.type]++;
      byFloor[f.floor]++;
      perFacility[r.facilityId] = (perFacility[r.facilityId] || 0) + 1;
    });
    const resolved = reports.filter((r) => r.status === "resolved" && r.resolvedAt);
    const avgMins = resolved.length
      ? Math.round(resolved.reduce((s, r) => s + (r.resolvedAt - r.timestamp), 0) / resolved.length / 60000)
      : null;
    let topId = null, topCount = 0;
    Object.entries(perFacility).forEach(([id, c]) => { if (c > topCount) { topCount = c; topId = id; } });
    return {
      byType: [
        { name: "Charging", count: byType.charging },
        { name: "Vending", count: byType.vending },
        { name: "Washroom", count: byType.washroom },
        { name: "WiFi", count: byType.wifi },
        { name: "Water", count: byType.watercooler },
      ],
      byFloor: FLOORS.map((fl) => ({ name: BLOCK_SHORT[fl] || fl, count: byFloor[fl] })),
      avgMins,
      topFacility: topId ? facilityName(topId) : "—",
      openCount: openQueue.length,
    };
  }, [reports, openQueue]);

  const pins = exploreView === "map" && floorFilter !== "All" ? FLOOR_PINS[floorFilter] || {} : null;
  const entrance = floorFilter !== "All" ? FLOOR_ENTRANCE[floorFilter] : null;
  const selectedFacility = selectedPin ? facility(selectedPin) : null;

  const routeInfo = useMemo(() => {
    if (!entrance || !selectedPin || !pins || !pins[selectedPin]) return null;
    const [ex, ey] = entrance;
    const [px, py] = pins[selectedPin];
    const pct = Math.hypot(px - ex, py - ey);
    const meters = Math.max(4, Math.round(pct * 0.55));
    const mins = Math.max(1, Math.round(meters / 70));
    return { meters, mins };
  }, [entrance, selectedPin, pins]);

  const visibleTeachers = useMemo(() => {
    let list = teacherFloorFilter === "All" ? TEACHERS : TEACHERS.filter((t) => t.floor === teacherFloorFilter);
    if (teacherQuery.trim()) {
      const q = teacherQuery.trim().toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q) || t.dept.toLowerCase().includes(q));
    }
    return list;
  }, [teacherFloorFilter, teacherQuery]);

  const selectedTeacher = selectedTeacherId ? TEACHERS.find((t) => t.id === selectedTeacherId) : null;
  const teacherPins = selectedTeacher ? TEACHER_PINS[selectedTeacher.floor] || {} : null;
  const teacherEntrance = selectedTeacher ? FLOOR_ENTRANCE[selectedTeacher.floor] : null;

  const teacherRouteInfo = useMemo(() => {
    if (!selectedTeacher || !teacherEntrance || !teacherPins || !teacherPins[selectedTeacher.id]) return null;
    const [ex, ey] = teacherEntrance;
    const [px, py] = teacherPins[selectedTeacher.id];
    const pct = Math.hypot(px - ex, py - ey);
    const meters = Math.max(4, Math.round(pct * 0.55));
    const mins = Math.max(1, Math.round(meters / 70));
    return { meters, mins };
  }, [selectedTeacher, teacherEntrance, teacherPins]);

  const NAV = [
    { id: "explore", label: "Explore", icon: MapIcon },
    { id: "teachers", label: "Teachers", icon: GraduationCap },
    { id: "report", label: "Report", icon: Flag },
    { id: "reserve", label: "Reserve", icon: Clock },
    { id: "insights", label: "Insights", icon: BarChart3 },
    { id: "admin", label: "Admin", icon: ShieldCheck },
  ];

  if (!entered) {
    return <WelcomeScreen theme={theme} setTheme={setTheme} onEnter={() => setEntered(true)} />;
  }

  return (
    <div className="ce-app" style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", color: COLORS.ink }}>
      <style>{`
        .ce-app { display: flex; }
        .ce-btn { transition: transform 0.1s ease, background 0.15s ease, border-color 0.15s ease; cursor: pointer; }
        .ce-btn:active { transform: scale(0.97); }
        .ce-chip:focus-visible, .ce-btn:focus-visible, .ce-input:focus-visible, .ce-select:focus-visible, .ce-textarea:focus-visible, .ce-nav-item:focus-visible {
          outline: 2px solid ${COLORS.teal}; outline-offset: 2px;
        }
        .ce-input, .ce-select, .ce-textarea {
          font-family: inherit; font-size: 14px; color: ${COLORS.ink};
          background: ${COLORS.surface}; border: 1px solid ${COLORS.line}; border-radius: 10px; padding: 10px 12px; width: 100%;
        }
        .ce-scroll::-webkit-scrollbar { display: none; }
        .ce-fade { animation: ceFadeIn 0.22s ease; }
        @keyframes ceFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .ce-pulse { animation: cePulse 1.4s ease-in-out infinite; }
        @keyframes cePulse { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }
        .ce-dot { animation: ceDot 1.6s ease-in-out infinite; }
        @keyframes ceDot { 0%, 100% { box-shadow: 0 0 0 0 rgba(255,124,107,0.35); } 50% { box-shadow: 0 0 0 6px rgba(255,124,107,0); } }
        .ce-route { animation: ceRoute 0.8s linear infinite; }
        @keyframes ceRoute { to { stroke-dashoffset: -10; } }

        .ce-sidebar { width: 240px; flex-shrink: 0; background: ${COLORS.surface}; border-right: 1px solid ${COLORS.line}; display: flex; flex-direction: column; padding: 24px 16px; position: sticky; top: 0; height: 100vh; }
        .ce-brand { display: flex; align-items: center; gap: 9px; padding: 0 8px; margin-bottom: 22px; }
        .ce-nav { display: flex; flex-direction: column; gap: 3px; flex: 1; }
        .ce-nav-item { display: flex; align-items: center; gap: 11px; padding: 10px 12px; border-radius: 10px; border: none; background: none; font-size: 13.5px; font-weight: 500; color: ${COLORS.inkMuted}; text-align: left; width: 100%; }
        .ce-nav-item.active { background: ${COLORS.tealBg}; color: ${COLORS.teal}; }
        .ce-theme-toggle { display: flex; align-items: center; gap: 9px; padding: 10px 12px; border-radius: 10px; border: 1px solid ${COLORS.line}; background: none; color: ${COLORS.inkMuted}; font-size: 12.5px; font-weight: 500; }

        .ce-main { flex: 1; min-width: 0; padding: 28px 36px 60px; }
        .ce-topbar { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }
        .ce-toolbar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 18px; }
        .ce-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 12px; }
        .ce-map-layout { display: grid; grid-template-columns: 1.6fr 1fr; gap: 20px; align-items: start; }
        .ce-insights-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .ce-admin-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; align-items: start; }
        .ce-form-shell { max-width: 480px; }

        @media (max-width: 880px) {
          .ce-app { flex-direction: column; }
          .ce-sidebar { width: 100%; height: auto; position: static; flex-direction: row; align-items: center; padding: 14px 18px; overflow-x: auto; }
          .ce-brand { margin-bottom: 0; margin-right: 16px; flex-shrink: 0; }
          .ce-nav { flex-direction: row; }
          .ce-nav-item span { display: none; }
          .ce-nav-item { padding: 9px 11px; }
          .ce-theme-toggle span { display: none; }
          .ce-main { padding: 20px 18px 60px; }
          .ce-map-layout, .ce-insights-grid, .ce-admin-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Sidebar */}
      <aside className="ce-sidebar">
        <div className="ce-brand">
          <div style={{ width: 30, height: 30, borderRadius: 8, background: COLORS.teal, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Building2 size={16} color="#0F1216" />
          </div>
          <span style={{ fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif", fontWeight: 700, fontSize: 17, letterSpacing: "-0.01em" }}>CampusEase</span>
        </div>
        <nav className="ce-nav">
          {NAV.map((n) => {
            const Icon = n.icon;
            return (
              <button key={n.id} className={`ce-btn ce-nav-item ${tab === n.id ? "active" : ""}`} onClick={() => { setTab(n.id); setSelectedPin(null); }}>
                <Icon size={17} />
                <span>{n.label}</span>
              </button>
            );
          })}
        </nav>
        <button className="ce-btn ce-theme-toggle" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        </button>
      </aside>

      {/* Main */}
      <main className="ce-main">
        <div className="ce-topbar">
          <div>
            <h1 style={{ margin: 0, fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif", fontSize: 24, fontWeight: 700, letterSpacing: "-0.01em" }}>{TAB_META[tab].label}</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13.5, color: COLORS.inkMuted }}>{TAB_META[tab].subtitle}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: COLORS.inkMuted }}>
              {new Date(now).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
            </span>
            <button className="ce-btn" onClick={() => { setSelectedPin(null); setTab("report"); }} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, padding: "9px 15px", borderRadius: 10, border: "none", background: COLORS.coral, color: "#0F1216" }}>
              <Plus size={14} /> Report issue
            </button>
          </div>
        </div>

        {!data && <Skeleton />}

        {data && tab === "explore" && (
          <div key="explore" className="ce-fade">
            <div className="ce-toolbar">
              <div className="ce-scroll" style={{ display: "flex", gap: 8, overflowX: "auto" }}>
                {["All", ...FLOORS].map((fl) => (
                  <Chip key={fl} active={floorFilter === fl} onClick={() => { setFloorFilter(fl); setSelectedPin(null); }}>{fl}</Chip>
                ))}
              </div>
              <span style={{ width: 1, height: 20, background: COLORS.line, flexShrink: 0 }} />
              <button className="ce-btn" onClick={() => setExploreView("list")} style={{ display: "flex", alignItems: "center", gap: 6, border: `1px solid ${exploreView === "list" ? COLORS.teal : COLORS.line}`, background: exploreView === "list" ? COLORS.tealBg : COLORS.surface, color: exploreView === "list" ? COLORS.teal : COLORS.inkMuted, borderRadius: 9, padding: "7px 13px", fontSize: 13, fontWeight: 500 }}>
                <List size={14} /> List
              </button>
              <button className="ce-btn" onClick={() => setExploreView("map")} style={{ display: "flex", alignItems: "center", gap: 6, border: `1px solid ${exploreView === "map" ? COLORS.teal : COLORS.line}`, background: exploreView === "map" ? COLORS.tealBg : COLORS.surface, color: exploreView === "map" ? COLORS.teal : COLORS.inkMuted, borderRadius: 9, padding: "7px 13px", fontSize: 13, fontWeight: 500 }}>
                <MapIcon size={14} /> Map
              </button>

              <div style={{ marginLeft: "auto", display: "flex", gap: 14, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5 }}>
                <span style={{ color: COLORS.teal }}>{counts.ok} free</span>
                <span style={{ color: COLORS.amber }}>{counts.watch} watch</span>
                <span style={{ color: COLORS.coral }}>{counts.flagged} flagged</span>
              </div>
            </div>

            {nearestFreeCharging && exploreView === "list" && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, background: COLORS.tealBg, border: `1px solid ${COLORS.teal}33`, borderRadius: 12, padding: "11px 16px", marginBottom: 14 }}>
                <Zap size={16} color={COLORS.teal} />
                <p style={{ margin: 0, fontSize: 12.5, color: COLORS.ink, flex: 1 }}>
                  Nearest free charging bay: <strong>{nearestFreeCharging.name}</strong> · {nearestFreeCharging.floor}
                </p>
                <button className="ce-btn" onClick={() => { setReserveFacility(nearestFreeCharging.id); setTab("reserve"); }} style={{ fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 8, border: "none", background: COLORS.teal, color: "#0F1216" }}>Reserve</button>
              </div>
            )}

            {exploreView === "list" && (
              <>
                <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                  <div style={{ position: "relative", flex: "1 1 240px", minWidth: 220 }}>
                    <Search size={14} color={COLORS.inkMuted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                    <input className="ce-input" style={{ paddingLeft: 32 }} placeholder="Search facilities" value={query} onChange={(e) => setQuery(e.target.value)} />
                  </div>
                  <div className="ce-scroll" style={{ display: "flex", gap: 8, overflowX: "auto" }}>
                    {STATUS_FILTERS.map((s) => (
                      <Chip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>{s === "All" ? "All" : STATUS_SHORT[s]}</Chip>
                    ))}
                    <Chip active={onlyFavorites} onClick={() => setOnlyFavorites(!onlyFavorites)}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Star size={11} fill={onlyFavorites ? COLORS.teal : "none"} /> Favorites</span>
                    </Chip>
                  </div>
                </div>

                <div className="ce-grid">
                  {visibleFacilities.length === 0 && <p style={{ fontSize: 13, color: COLORS.inkMuted, padding: "20px 0", gridColumn: "1/-1" }}>No facilities match.</p>}
                  {visibleFacilities.map((f) => {
                    const meta = TYPE_META[f.type];
                    const Icon = meta.icon;
                    const isFav = favorites.includes(f.id);
                    return (
                      <div key={f.id} style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: 12, padding: "16px", background: COLORS.panel, borderRadius: 14, border: `1px solid ${COLORS.line}` }}>
                        <button className="ce-btn" onClick={() => toggleFavorite(f.id)} aria-label="Toggle favorite" style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", padding: 4, color: isFav ? COLORS.amber : COLORS.inkFaint }}>
                          <Star size={15} fill={isFav ? COLORS.amber : "none"} />
                        </button>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: statusBg(f.status), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
                          <Icon size={18} color={statusColor(f.status)} />
                          {f.status === "flagged" && <span className="ce-dot" style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: COLORS.coral }} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, paddingRight: 18 }}>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: COLORS.ink }}>{f.name}</p>
                          </div>
                          <span style={{ display: "inline-block", marginTop: 4, fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 600, color: statusColor(f.status), background: statusBg(f.status), padding: "3px 8px", borderRadius: 999 }}>{meta.labels[f.status]}</span>
                          <p style={{ margin: "6px 0 0", fontSize: 12, color: COLORS.inkMuted }}>{meta.noun} · {f.floor}</p>
                          {f.type === "watercooler" ? (
                            <p style={{ margin: "4px 0 0", fontSize: 11.5, color: COLORS.inkFaint }}>Last cleaned {formatRelative(f.lastCleaned, now)}</p>
                          ) : (
                            <p style={{ margin: "4px 0 0", fontSize: 11.5, color: COLORS.inkFaint }}>Updated {formatRelative(f.updatedAt, now)}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {exploreView === "map" && (
              <>
                {floorFilter === "All" ? (
                  <div style={{ padding: "70px 16px", textAlign: "center", background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 16 }}>
                    <MapIcon size={22} color={COLORS.inkFaint} style={{ marginBottom: 8 }} />
                    <p style={{ fontSize: 13, color: COLORS.inkMuted, margin: 0 }}>Pick a block above to see its map.</p>
                  </div>
                ) : (
                  <div className="ce-map-layout">
                    <div>
                      <div style={{ position: "relative", width: "100%", paddingBottom: "56%", background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 16 }}>
                        <div style={{ position: "absolute", inset: 0 }}>
                          <div style={{ position: "absolute", left: "5%", right: "5%", top: "48%", height: "9%", background: COLORS.surface, border: `1px dashed ${COLORS.line}`, borderRadius: 4 }} />
                          <span style={{ position: "absolute", left: "50%", top: "52.5%", transform: "translate(-50%,-50%)", fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: COLORS.inkFaint, letterSpacing: "0.08em" }}>CORRIDOR</span>
                          <span style={{ position: "absolute", left: "3%", top: "5%", fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: COLORS.inkFaint }}>STAIRS</span>
                          <span style={{ position: "absolute", right: "3%", top: "5%", fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: COLORS.inkFaint }}>STAIRS</span>
                          <div style={{ position: "absolute", left: "5%", top: "10%", width: "40%", height: "27%", border: `1px solid ${COLORS.line}`, borderRadius: 6 }} />
                          <div style={{ position: "absolute", right: "5%", top: "10%", width: "40%", height: "27%", border: `1px solid ${COLORS.line}`, borderRadius: 6 }} />
                          <div style={{ position: "absolute", left: "16%", bottom: "6%", width: "68%", height: "22%", border: `1px solid ${COLORS.line}`, borderRadius: 6 }} />

                          {/* route */}
                          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
                            <defs>
                              <marker id="ce-arrow" markerWidth="6" markerHeight="6" refX="4.5" refY="3" orient="auto">
                                <path d="M0,0 L6,3 L0,6 z" fill={COLORS.coral} />
                              </marker>
                            </defs>
                            {entrance && selectedPin && pins[selectedPin] && (
                              <line
                                x1={entrance[0]} y1={entrance[1]} x2={pins[selectedPin][0]} y2={pins[selectedPin][1]}
                                stroke={COLORS.coral} strokeWidth={0.9} strokeDasharray="2.4 1.8" markerEnd="url(#ce-arrow)"
                                className="ce-route" vectorEffect="non-scaling-stroke"
                              />
                            )}
                          </svg>

                          {/* entrance marker */}
                          {entrance && (
                            <div style={{ position: "absolute", left: `${entrance[0]}%`, top: `${entrance[1]}%`, transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                              <div style={{ width: 12, height: 12, borderRadius: "50%", background: COLORS.ink, border: `2px solid ${COLORS.surface}` }} />
                              <span style={{ fontSize: 8.5, fontFamily: "'IBM Plex Mono', monospace", color: COLORS.inkFaint, whiteSpace: "nowrap" }}>ENTRANCE</span>
                            </div>
                          )}

                          {/* pins */}
                          {pins && Object.entries(pins).map(([id, [x, y]]) => {
                            const f = facility(id);
                            if (!f) return null;
                            const Icon = TYPE_META[f.type].icon;
                            const active = selectedPin === id;
                            return (
                              <button
                                key={id}
                                className="ce-btn"
                                onClick={() => setSelectedPin(active ? null : id)}
                                aria-label={facilityName(id)}
                                style={{
                                  position: "absolute", left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)",
                                  width: active ? 40 : 34, height: active ? 40 : 34, borderRadius: "50%",
                                  background: statusColor(f.status), border: `3px solid ${COLORS.surface}`,
                                  boxShadow: active ? `0 0 0 4px ${statusColor(f.status)}40` : "0 2px 6px rgba(0,0,0,0.3)",
                                  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2,
                                }}
                              >
                                <Icon size={active ? 18 : 15} color="#0F1216" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      {routeInfo && (
                        <p style={{ margin: "10px 2px 0", fontSize: 12.5, color: COLORS.inkMuted, display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 8, height: 2, background: COLORS.coral, display: "inline-block" }} />
                          ~{routeInfo.meters}m from the entrance · about {routeInfo.mins} min walk
                        </p>
                      )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {selectedFacility ? (
                        <div className="ce-fade" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 16 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                            <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{selectedFacility.name}</p>
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600, color: statusColor(selectedFacility.status), background: statusBg(selectedFacility.status), padding: "3px 8px", borderRadius: 999 }}>{TYPE_META[selectedFacility.type].labels[selectedFacility.status]}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: 12.5, color: COLORS.inkMuted }}>{TYPE_META[selectedFacility.type].noun} · Updated {formatRelative(selectedFacility.updatedAt, now)}</p>
                          {selectedFacility.type === "watercooler" && (
                            <p style={{ margin: "4px 0 0", fontSize: 12.5, color: COLORS.inkMuted, display: "flex", alignItems: "center", gap: 6 }}>
                              <Droplets size={12} /> Last cleaned {formatRelative(selectedFacility.lastCleaned, now)}
                            </p>
                          )}
                          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                            <button className="ce-btn" onClick={() => { setReportFacility(selectedFacility.id); setTab("report"); }} style={{ flex: 1, fontSize: 12.5, fontWeight: 500, padding: "9px 0", borderRadius: 9, border: `1px solid ${COLORS.line}`, background: COLORS.surface, color: COLORS.ink }}>Report issue</button>
                            {selectedFacility.type === "charging" && (
                              <button className="ce-btn" onClick={() => { setReserveFacility(selectedFacility.id); setTab("reserve"); }} style={{ flex: 1, fontSize: 12.5, fontWeight: 500, padding: "9px 0", borderRadius: 9, border: "none", background: COLORS.teal, color: "#0F1216" }}>Reserve</button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 16, fontSize: 12.5, color: COLORS.inkMuted }}>
                          Tap a pin to see facility details and get walking directions from the entrance.
                        </div>
                      )}
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {facilities.filter((f) => f.floor === floorFilter).map((f) => {
                          const meta = TYPE_META[f.type];
                          const Icon = meta.icon;
                          return (
                            <button key={f.id} className="ce-btn" onClick={() => setSelectedPin(f.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: 10, border: `1px solid ${selectedPin === f.id ? COLORS.teal : COLORS.line}`, background: selectedPin === f.id ? COLORS.tealBg : COLORS.surface, textAlign: "left" }}>
                              <Icon size={14} color={statusColor(f.status)} />
                              <span style={{ fontSize: 12.5, flex: 1, color: COLORS.ink }}>{f.name}</span>
                              <span style={{ fontSize: 10.5, fontFamily: "'IBM Plex Mono', monospace", color: statusColor(f.status) }}>{meta.labels[f.status]}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {data && tab === "teachers" && (
          <div key="teachers" className="ce-fade">
            <div className="ce-toolbar">
              <div className="ce-scroll" style={{ display: "flex", gap: 8, overflowX: "auto" }}>
                {["All", ...FLOORS].map((fl) => (
                  <Chip key={fl} active={teacherFloorFilter === fl} onClick={() => { setTeacherFloorFilter(fl); setSelectedTeacherId(null); }}>{fl}</Chip>
                ))}
              </div>
            </div>

            <div style={{ position: "relative", marginBottom: 16, maxWidth: 420 }}>
              <Search size={14} color={COLORS.inkMuted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <input className="ce-input" style={{ paddingLeft: 32 }} placeholder="Search by name or department" value={teacherQuery} onChange={(e) => setTeacherQuery(e.target.value)} />
            </div>

            <div className="ce-map-layout">
              <div>
                <div className="ce-grid" style={{ marginBottom: 4 }}>
                  {visibleTeachers.length === 0 && <p style={{ fontSize: 13, color: COLORS.inkMuted, padding: "20px 0", gridColumn: "1/-1" }}>No teachers match.</p>}
                  {visibleTeachers.map((t) => {
                    const active = selectedTeacherId === t.id;
                    return (
                      <button
                        key={t.id}
                        className="ce-btn"
                        onClick={() => setSelectedTeacherId(t.id)}
                        style={{ textAlign: "left", display: "flex", alignItems: "flex-start", gap: 12, padding: "16px", background: active ? COLORS.tealBg : COLORS.panel, borderRadius: 14, border: `1px solid ${active ? COLORS.teal : COLORS.line}` }}
                      >
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: COLORS.ink, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <User size={18} color={COLORS.bg} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: COLORS.ink }}>{t.name}</p>
                          <p style={{ margin: "3px 0 0", fontSize: 12, color: COLORS.inkMuted }}>{t.dept}</p>
                          <p style={{ margin: "4px 0 0", fontSize: 11.5, color: COLORS.inkFaint, display: "flex", alignItems: "center", gap: 5 }}>
                            <Navigation size={11} /> {t.room} · {t.floor}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {!selectedTeacher ? (
                  <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 16, fontSize: 12.5, color: COLORS.inkMuted }}>
                    Pick a teacher to see their cabin on the map with walking directions from the entrance.
                  </div>
                ) : (
                  <>
                    <div className="ce-fade" style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 16 }}>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{selectedTeacher.name}</p>
                      <p style={{ margin: "3px 0 0", fontSize: 12.5, color: COLORS.inkMuted }}>{selectedTeacher.dept}</p>
                      <p style={{ margin: "8px 0 0", fontSize: 12.5, color: COLORS.ink, display: "flex", alignItems: "center", gap: 6 }}>
                        <Navigation size={13} color={COLORS.teal} /> {selectedTeacher.room}, {selectedTeacher.floor}
                      </p>
                      {teacherRouteInfo && (
                        <p style={{ margin: "6px 0 0", fontSize: 12, color: COLORS.inkMuted }}>
                          ~{teacherRouteInfo.meters}m from the entrance · about {teacherRouteInfo.mins} min walk
                        </p>
                      )}
                    </div>

                    <div style={{ position: "relative", width: "100%", paddingBottom: "56%", background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 16 }}>
                      <div style={{ position: "absolute", inset: 0 }}>
                        <div style={{ position: "absolute", left: "5%", right: "5%", top: "48%", height: "9%", background: COLORS.surface, border: `1px dashed ${COLORS.line}`, borderRadius: 4 }} />
                        <span style={{ position: "absolute", left: "50%", top: "52.5%", transform: "translate(-50%,-50%)", fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", color: COLORS.inkFaint, letterSpacing: "0.08em" }}>CORRIDOR</span>
                        <div style={{ position: "absolute", left: "5%", top: "10%", width: "40%", height: "27%", border: `1px solid ${COLORS.line}`, borderRadius: 6 }} />
                        <div style={{ position: "absolute", right: "5%", top: "10%", width: "40%", height: "27%", border: `1px solid ${COLORS.line}`, borderRadius: 6 }} />
                        <div style={{ position: "absolute", left: "16%", bottom: "6%", width: "68%", height: "22%", border: `1px solid ${COLORS.line}`, borderRadius: 6 }} />

                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
                          <defs>
                            <marker id="ce-arrow-t" markerWidth="6" markerHeight="6" refX="4.5" refY="3" orient="auto">
                              <path d="M0,0 L6,3 L0,6 z" fill={COLORS.teal} />
                            </marker>
                          </defs>
                          {teacherEntrance && teacherPins && teacherPins[selectedTeacher.id] && (
                            <line
                              x1={teacherEntrance[0]} y1={teacherEntrance[1]} x2={teacherPins[selectedTeacher.id][0]} y2={teacherPins[selectedTeacher.id][1]}
                              stroke={COLORS.teal} strokeWidth={0.9} strokeDasharray="2.4 1.8" markerEnd="url(#ce-arrow-t)"
                              className="ce-route" vectorEffect="non-scaling-stroke"
                            />
                          )}
                        </svg>

                        {teacherEntrance && (
                          <div style={{ position: "absolute", left: `${teacherEntrance[0]}%`, top: `${teacherEntrance[1]}%`, transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                            <div style={{ width: 12, height: 12, borderRadius: "50%", background: COLORS.ink, border: `2px solid ${COLORS.surface}` }} />
                            <span style={{ fontSize: 8.5, fontFamily: "'IBM Plex Mono', monospace", color: COLORS.inkFaint, whiteSpace: "nowrap" }}>ENTRANCE</span>
                          </div>
                        )}

                        {teacherPins && teacherPins[selectedTeacher.id] && (
                          <div
                            style={{
                              position: "absolute", left: `${teacherPins[selectedTeacher.id][0]}%`, top: `${teacherPins[selectedTeacher.id][1]}%`, transform: "translate(-50%,-50%)",
                              width: 38, height: 38, borderRadius: "50%", background: COLORS.ink, border: `3px solid ${COLORS.surface}`,
                              boxShadow: `0 0 0 4px ${COLORS.teal}40`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2,
                            }}
                          >
                            <User size={17} color={COLORS.bg} />
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {data && tab === "report" && (
          <div key="report" className="ce-fade ce-form-shell" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
              <textarea className="ce-textarea" rows={5} placeholder="Machine isn't dispensing snacks" value={reportNote} onChange={(e) => setReportNote(e.target.value)} style={{ resize: "vertical" }} />
            </div>
            {reportError && <p style={{ margin: 0, fontSize: 12.5, color: COLORS.coral }}>{reportError}</p>}
            <button className="ce-btn" onClick={submitReport} style={{ background: COLORS.coral, color: "#0F1216", border: "none", borderRadius: 11, padding: "12px 22px", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, alignSelf: "flex-start" }}>
              <Flag size={15} /> Flag this
            </button>
          </div>
        )}

        {data && tab === "reserve" && (
          <div key="reserve" className="ce-fade ce-form-shell" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12.5, color: COLORS.inkMuted, marginBottom: 6 }}>Charging bay</label>
              <select className="ce-select" value={reserveFacility} onChange={(e) => setReserveFacility(e.target.value)}>
                <option value="">Select a charging bay</option>
                {chargingFacilities.map((f) => <option key={f.id} value={f.id}>{f.floor} — {f.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12.5, color: COLORS.inkMuted, marginBottom: 6 }}>Time slot</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {slots.map((s) => (
                  <button key={s} className="ce-btn" onClick={() => setReserveSlot(s)} style={{ border: `1px solid ${reserveSlot === s ? COLORS.teal : COLORS.line}`, background: reserveSlot === s ? COLORS.tealBg : COLORS.surface, color: reserveSlot === s ? COLORS.teal : COLORS.ink, borderRadius: 999, padding: "7px 13px", fontSize: 12.5, fontFamily: "'IBM Plex Mono', monospace" }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {reserveError && <p style={{ margin: 0, fontSize: 12.5, color: COLORS.coral }}>{reserveError}</p>}
            <button className="ce-btn" onClick={submitReservation} style={{ background: COLORS.teal, color: "#0F1216", border: "none", borderRadius: 11, padding: "12px 22px", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, alignSelf: "flex-start" }}>
              <Clock size={15} /> Reserve slot
            </button>

            {reservations.length > 0 && (
              <div style={{ marginTop: 6 }}>
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

        {data && tab === "insights" && (
          <div key="insights" className="ce-fade" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 180px", background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: "16px 18px" }}>
                <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color: COLORS.coral }}>{insights.openCount}</p>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: COLORS.inkMuted }}>Open issues</p>
              </div>
              <div style={{ flex: "1 1 180px", background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: "16px 18px" }}>
                <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color: COLORS.teal }}>{insights.avgMins !== null ? `${insights.avgMins}m` : "—"}</p>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: COLORS.inkMuted }}>Avg. resolve time</p>
              </div>
              <div style={{ flex: "1 1 180px", background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <TrendingUp size={13} color={COLORS.inkMuted} />
                  <p style={{ margin: 0, fontSize: 11, color: COLORS.inkMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Most flagged</p>
                </div>
                <p style={{ margin: "6px 0 0", fontSize: 15, fontWeight: 600 }}>{insights.topFacility}</p>
              </div>
            </div>

            <div className="ce-insights-grid">
              <div>
                <p style={{ fontSize: 12.5, color: COLORS.inkMuted, margin: "0 0 8px" }}>Reports by facility type</p>
                <div style={{ height: 220, background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: "14px 10px 4px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={insights.byType} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11.5, fill: COLORS.inkMuted }} axisLine={{ stroke: COLORS.line }} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11.5, fill: COLORS.inkMuted }} axisLine={false} tickLine={false} width={26} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${COLORS.line}`, background: COLORS.surface, color: COLORS.ink }} cursor={{ fill: COLORS.tealBg }} />
                      <Bar dataKey="count" fill={COLORS.coral} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <p style={{ fontSize: 12.5, color: COLORS.inkMuted, margin: "0 0 8px" }}>Reports by block</p>
                <div style={{ height: 220, background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: "14px 10px 4px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={insights.byFloor} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11.5, fill: COLORS.inkMuted }} axisLine={{ stroke: COLORS.line }} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11.5, fill: COLORS.inkMuted }} axisLine={false} tickLine={false} width={26} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${COLORS.line}`, background: COLORS.surface, color: COLORS.ink }} cursor={{ fill: COLORS.tealBg }} />
                      <Bar dataKey="count" fill={COLORS.teal} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {data && tab === "admin" && (
          <div key="admin" className="ce-fade">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: "12px 16px", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Sparkles size={15} color={COLORS.amber} />
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>Simulate live activity</p>
                  <p style={{ margin: "1px 0 0", fontSize: 11.5, color: COLORS.inkMuted }}>Randomly nudges facility status every few seconds — handy for demos.</p>
                </div>
              </div>
              <Switch on={simulate} onClick={() => setSimulate(!simulate)} color={COLORS.teal} />
            </div>

            <div style={{ marginBottom: 22 }}>
              <p style={{ fontSize: 12.5, color: COLORS.inkMuted, margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6 }}>
                <QrCode size={13} /> Water cooler QR codes
              </p>
              <p style={{ fontSize: 12, color: COLORS.inkMuted, margin: "0 0 12px" }}>
                Print these and stick one on each water cooler. Scanning opens the app straight to that cooler's live status and last-cleaned time.
              </p>
              <div className="ce-grid">
                {facilities.filter((f) => f.type === "watercooler").map((f) => {
                  const deepLink = typeof window !== "undefined"
                    ? `${window.location.origin}${window.location.pathname}?qr=${f.id}`
                    : `https://example.com/?qr=${f.id}`;
                  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent(deepLink)}`;
                  return (
                    <div key={f.id} style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 16, display: "flex", gap: 14, alignItems: "center" }}>
                      <div style={{ width: 92, height: 92, borderRadius: 10, background: "#fff", padding: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${COLORS.line}` }}>
                        <img src={qrSrc} alt={`QR code for ${f.name}`} width={80} height={80} style={{ display: "block" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600 }}>{f.name}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 11.5, color: COLORS.inkMuted }}>{f.floor}</p>
                        <p style={{ margin: "6px 0 8px", fontSize: 11.5, color: COLORS.inkFaint, display: "flex", alignItems: "center", gap: 5 }}>
                          <Droplets size={11} /> Last cleaned {formatRelative(f.lastCleaned, now)}
                        </p>
                        <button className="ce-btn" onClick={() => markCleaned(f.id)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, padding: "6px 12px", borderRadius: 8, border: "none", background: COLORS.teal, color: "#0F1216" }}>
                          <CheckCircle2 size={13} /> Mark cleaned now
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="ce-admin-grid">
              <div>
                <p style={{ fontSize: 12.5, color: COLORS.inkMuted, margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Open queue ({openQueue.length})</p>
                {openQueue.length === 0 && <p style={{ fontSize: 13, color: COLORS.inkMuted, padding: "20px 0" }}>Nothing open. Queue's clear.</p>}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {openQueue.map((r) => (
                    <div key={r.id} style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: "14px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{facilityName(r.facilityId)}</p>
                        <span style={{ fontSize: 11, color: COLORS.inkMuted, whiteSpace: "nowrap" }}>{formatRelative(r.timestamp, now)}</span>
                      </div>
                      <p style={{ margin: "5px 0 10px", fontSize: 13, color: COLORS.inkMuted }}>{r.note}</p>
                      <button className="ce-btn" onClick={() => resolveReport(r.id)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 500, padding: "7px 13px", borderRadius: 8, border: "none", background: COLORS.teal, color: "#0F1216" }}>
                        <CheckCircle2 size={13} /> Mark resolved
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p style={{ fontSize: 12.5, color: COLORS.inkMuted, margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Recent activity</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {feed.slice(0, 10).map((item) => (
                    <div key={item.id} style={{ display: "flex", gap: 10, padding: "10px 13px", background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 11 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: item.kind === "report" ? COLORS.coralBg : COLORS.tealBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {item.kind === "report" ? <Flag size={13} color={COLORS.coral} /> : <Clock size={13} color={COLORS.teal} />}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 12.5, color: COLORS.ink }}>
                          {item.kind === "report" ? <>{item.status === "resolved" ? "Resolved" : "Flagged"} <strong style={{ fontWeight: 500 }}>{facilityName(item.facilityId)}</strong></> : <>Reserved <strong style={{ fontWeight: 500 }}>{facilityName(item.facilityId)}</strong> for {item.slot}</>}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: COLORS.inkMuted }}>{formatRelative(item.timestamp, now)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#14171C", color: "#fff", padding: "10px 18px", borderRadius: 999, fontSize: 13, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.08)", zIndex: 10 }}>
          {toast.kind === "ok" ? <Check size={14} /> : null}
          {toast.text}
        </div>
      )}
    </div>
  );
}
