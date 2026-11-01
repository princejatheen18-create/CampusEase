import { useState, useEffect, useMemo, useRef } from "react";
import {
  Zap, Cookie, Wind, Wifi, Droplets, Flag, Clock, Check, X, CheckCircle2,
  TrendingUp, Building2, Plus, Moon, Sun, Sparkles, User, GraduationCap,
  QrCode, Navigation, Camera, ArrowLeft, Home as HomeIcon, ShieldCheck,
  Search, ChevronRight, ChevronDown, AlertCircle, LayoutDashboard, ClipboardList,
  BarChart3, Bell, Menu, PanelLeftClose, PanelLeftOpen, LogOut, Megaphone, Inbox,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";

const STORAGE_KEY = "campusease-data-v9";
// Staff-only area: open the site with #staff at the end of the link. Change this PIN before sharing.
const STAFF_PIN = "jain2026";
const FLOORS = ["FET Block", "Core Block", "Aerospace Block"];
const CAMPUS = {
  name: "JAIN Global Campus",
  address: "Jakkasandra Post, Kanakapura Road, Ramanagara District, Bengaluru — 562112",
  size: "350-acre campus",
  slogan: "350 Acres. One App.",
};

// Palette from the design brief: deep navy, royal indigo, soft violet, light slate surfaces.
// "teal" is the primary brand colour key (kept so every existing style inherits the new look).
const LIGHT = {
  bg: "#F8FAFC", surface: "#FFFFFF", panel: "#FFFFFF", panel2: "#F1F5F9",
  ink: "#1E293B", inkMuted: "#64748B", inkFaint: "#94A3B8", line: "#E2E8F0",
  teal: "#4F46E5", tealBg: "#EEF2FF", onAccent: "#FFFFFF",
  ok: "#16A34A", okBg: "#DCFCE7", amber: "#B45309", amberBg: "#FEF3C7", amberFill: "#F59E0B",
  coral: "#DC2626", coralBg: "#FEE2E2", shadow: "0 1px 2px rgba(16,24,40,0.05)",
};
const DARK = {
  bg: "#0B1220", surface: "#101828", panel: "#101828", panel2: "#1A2336",
  ink: "#F1F5F9", inkMuted: "#94A3B8", inkFaint: "#64748B", line: "#243049",
  teal: "#818CF8", tealBg: "rgba(129,140,248,0.16)", onAccent: "#0B1220",
  ok: "#4ADE80", okBg: "rgba(74,222,128,0.14)", amber: "#FBBF24", amberBg: "rgba(251,191,36,0.14)", amberFill: "#FBBF24",
  coral: "#F87171", coralBg: "rgba(248,113,113,0.14)", shadow: "none",
};
const COLORS = { ...LIGHT };

const TYPE_META = {
  charging: { icon: Zap, noun: "Charging bay", labels: { ok: "Free", watch: "In use", flagged: "Out of order" } },
  vending: { icon: Cookie, noun: "Vending machine", labels: { ok: "Stocked", watch: "Low stock", flagged: "Out of order" } },
  washroom: { icon: Wind, noun: "Washroom", labels: { ok: "Clean", watch: "Needs attention", flagged: "Out of service" } },
  wifi: { icon: Wifi, noun: "WiFi zone", labels: { ok: "Strong signal", watch: "Weak signal", flagged: "No signal" } },
  watercooler: { icon: Droplets, noun: "Water cooler", labels: { ok: "Clean", watch: "Due for cleaning", flagged: "Needs cleaning" } },
};

const TEACHERS = [
  { id: "t1", name: "Dr. Ramesh Iyer", dept: "Computer Science", floor: "FET Block", room: "Room 210" },
  { id: "t2", name: "Prof. Anitha Kumar", dept: "Electronics & Communication", floor: "FET Block", room: "Room 215" },
  { id: "t2b", name: "Dr. Kavya Reddy", dept: "Information Science", floor: "FET Block", room: "Room 230" },
  { id: "t7", name: "Dr. Nisha Patil", dept: "Mathematics", floor: "Core Block", room: "Room 105" },
  { id: "t8", name: "Prof. Rohan Gupta", dept: "Physics", floor: "Core Block", room: "Room 112" },
  { id: "t5", name: "Dr. Arvind Menon", dept: "Aerospace Engineering", floor: "Aerospace Block", room: "Hangar Office 3" },
  { id: "t6", name: "Prof. Divya Shetty", dept: "Avionics", floor: "Aerospace Block", room: "Hangar Office 5" },
];
const BLOCK_SHORT = { "FET Block": "FET", "Core Block": "Core", "Aerospace Block": "Aero" };

function defaultFacilities() {
  const now = Date.now();
  const mins = (n) => now - n * 60000;
  return [
    // Charging
    { id: "f1-charge-104", name: "Room 104", floor: "FET Block", type: "charging", status: "ok", updatedAt: mins(12) },
    { id: "f1-charge-lib", name: "Library entrance", floor: "FET Block", type: "charging", status: "watch", updatedAt: mins(4) },
    { id: "f3-charge-hall", name: "Design studio", floor: "Aerospace Block", type: "charging", status: "ok", updatedAt: mins(3) },
    { id: "f3-charge-hangar", name: "Hangar lobby", floor: "Aerospace Block", type: "charging", status: "ok", updatedAt: mins(40) },
    // Vending
    { id: "f1-vend-lobby", name: "Main lobby", floor: "FET Block", type: "vending", status: "ok", updatedAt: mins(30) },
    { id: "f1-vend-2f", name: "2nd floor corridor", floor: "FET Block", type: "vending", status: "ok", updatedAt: mins(50) },
    { id: "f3-vend", name: "Hangar lobby", floor: "Aerospace Block", type: "vending", status: "ok", updatedAt: mins(60) },
    { id: "f3-vend-wing", name: "Design wing", floor: "Aerospace Block", type: "vending", status: "flagged", updatedAt: mins(15) },
    // Washrooms
    { id: "f1-wash-a", name: "Ground floor", floor: "FET Block", type: "washroom", status: "ok", updatedAt: mins(90) },
    { id: "f1-wash-b", name: "First floor", floor: "FET Block", type: "washroom", status: "ok", updatedAt: mins(35) },
    { id: "f3-wash", name: "Ground floor", floor: "Aerospace Block", type: "washroom", status: "flagged", updatedAt: mins(9) },
    { id: "f3-wash-b", name: "First floor", floor: "Aerospace Block", type: "washroom", status: "ok", updatedAt: mins(55) },
    // WiFi zones
    { id: "f1-wifi-lib", name: "Library wing", floor: "FET Block", type: "wifi", status: "ok", updatedAt: mins(8) },
    { id: "f1-wifi-main", name: "Main entrance", floor: "FET Block", type: "wifi", status: "ok", updatedAt: mins(20) },
    { id: "f1-wifi-sem", name: "Seminar hall", floor: "FET Block", type: "wifi", status: "watch", updatedAt: mins(33) },
    { id: "f3-wifi-hangar", name: "Hangar lab", floor: "Aerospace Block", type: "wifi", status: "flagged", updatedAt: mins(15) },
    { id: "f3-wifi-design", name: "Design studio", floor: "Aerospace Block", type: "wifi", status: "ok", updatedAt: mins(6) },
    { id: "f3-wifi-admin", name: "Admin office", floor: "Aerospace Block", type: "wifi", status: "ok", updatedAt: mins(48) },
    // Water coolers
    { id: "f1-water-canteen", name: "Near canteen", floor: "FET Block", type: "watercooler", status: "ok", updatedAt: mins(180), lastCleaned: mins(180) },
    { id: "f1-water-2f", name: "2nd floor", floor: "FET Block", type: "watercooler", status: "ok", updatedAt: mins(240), lastCleaned: mins(240) },
    { id: "f3-water-ground", name: "Ground floor", floor: "Aerospace Block", type: "watercooler", status: "flagged", updatedAt: mins(3000), lastCleaned: mins(3000) },
    { id: "f3-water-hangar", name: "Hangar wing", floor: "Aerospace Block", type: "watercooler", status: "ok", updatedAt: mins(150), lastCleaned: mins(150) },
    // Core Block
    { id: "fc-charge-lobby", name: "Main lobby", floor: "Core Block", type: "charging", status: "ok", updatedAt: mins(9) },
    { id: "fc-charge-lib", name: "Reading hall", floor: "Core Block", type: "charging", status: "ok", updatedAt: mins(22) },
    { id: "fc-vend-lobby", name: "Main lobby", floor: "Core Block", type: "vending", status: "ok", updatedAt: mins(35) },
    { id: "fc-wash-a", name: "Ground floor", floor: "Core Block", type: "washroom", status: "ok", updatedAt: mins(40) },
    { id: "fc-wash-b", name: "First floor", floor: "Core Block", type: "washroom", status: "watch", updatedAt: mins(25) },
    { id: "fc-wifi-hall", name: "Lecture halls", floor: "Core Block", type: "wifi", status: "ok", updatedAt: mins(10) },
    { id: "fc-wifi-lib", name: "Reading hall", floor: "Core Block", type: "wifi", status: "watch", updatedAt: mins(30) },
    { id: "fc-water-lobby", name: "Main lobby", floor: "Core Block", type: "watercooler", status: "ok", updatedAt: mins(210), lastCleaned: mins(210) },
    { id: "fc-water-1f", name: "1st floor", floor: "Core Block", type: "watercooler", status: "ok", updatedAt: mins(260), lastCleaned: mins(260) },
  ];
}

function seedReports() {
  const now = Date.now();
  const hrs = (n) => now - n * 3600000;
  return [
    { id: "seed-1", facilityId: "f3-wash", note: "Fan isn't working, feels stuffy.", timestamp: hrs(2), status: "open" },
    { id: "seed-3", facilityId: "f1-charge-lib", note: "Two of the four ports are dead.", timestamp: hrs(30), status: "resolved", resolvedAt: hrs(28) },
    { id: "seed-4", facilityId: "f3-wash", note: "Tap was leaking near sink 2.", timestamp: hrs(50), status: "resolved", resolvedAt: hrs(47) },
    { id: "seed-5", facilityId: "f1-vend-lobby", note: "Coin slot jammed.", timestamp: hrs(70), status: "resolved", resolvedAt: hrs(69) },
  ];
}

function formatRelative(ts, now) {
  if (!ts) return "unknown";
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

const statusColor = (status) => (status === "ok" ? COLORS.ok : status === "watch" ? COLORS.amber : COLORS.coral);
const statusBg = (status) => (status === "ok" ? COLORS.okBg : status === "watch" ? COLORS.amberBg : COLORS.coralBg);

const initialsOf = (name) => (name || "").trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "S";

// ---------- Design system ----------
function Button({ variant = "primary", size = "md", icon: Icon, children, style, ...rest }) {
  const sm = size === "sm";
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, fontWeight: 600,
    borderRadius: 10, border: "1px solid transparent", fontSize: sm ? 12.5 : 13.5,
    padding: sm ? "6px 12px" : "9px 16px", minHeight: sm ? 34 : 40, whiteSpace: "nowrap",
  };
  const variants = {
    primary: { background: COLORS.teal, color: COLORS.onAccent },
    secondary: { background: COLORS.surface, color: COLORS.ink, borderColor: COLORS.line },
    danger: { background: COLORS.coral, color: COLORS.onAccent },
    soft: { background: COLORS.tealBg, color: COLORS.teal },
    ghost: { background: "transparent", color: COLORS.inkMuted },
  };
  return (
    <button className="ce-btn" style={{ ...base, ...variants[variant], ...style }} {...rest}>
      {Icon && <Icon size={sm ? 14 : 16} />}{children}
    </button>
  );
}

function Card({ children, style, pad = 20, ...rest }) {
  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: pad, boxShadow: COLORS.shadow, ...style }} {...rest}>
      {children}
    </div>
  );
}

function SectionTitle({ children, right, hint }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 650, color: COLORS.ink }}>{children}</h2>
        {hint && <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.inkMuted }}>{hint}</p>}
      </div>
      {right}
    </div>
  );
}

function Pill({ status, children }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: statusColor(status), background: statusBg(status), padding: "4px 10px", borderRadius: 999, flexShrink: 0, whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor(status) }} />{children}
    </span>
  );
}

function Tag({ children, tone = "neutral" }) {
  const tones = { neutral: [COLORS.panel2, COLORS.inkMuted], sample: [COLORS.amberBg, COLORS.amber], primary: [COLORS.tealBg, COLORS.teal] };
  const [bg, fg] = tones[tone];
  return <span style={{ fontSize: 11, fontWeight: 600, color: fg, background: bg, padding: "3px 8px", borderRadius: 999, whiteSpace: "nowrap" }}>{children}</span>;
}

function Kpi({ label, value, icon: Icon, tone = "primary", hint }) {
  const map = { primary: [COLORS.tealBg, COLORS.teal], ok: [COLORS.okBg, COLORS.ok], watch: [COLORS.amberBg, COLORS.amber], flagged: [COLORS.coralBg, COLORS.coral] };
  const [bg, fg] = map[tone];
  return (
    <Card pad={18} className="ce-card-hover">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: COLORS.inkMuted }}>{label}</span>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={17} color={fg} /></span>
      </div>
      <p style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1, color: COLORS.ink }}>{value}</p>
      {hint && <p style={{ margin: "8px 0 0", fontSize: 12, color: COLORS.inkMuted }}>{hint}</p>}
    </Card>
  );
}

function Skeleton({ h = 16, w = "100%", r = 8, style }) {
  return <div className="ce-skel" style={{ height: h, width: w, borderRadius: r, ...style }} />;
}

function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div style={{ textAlign: "center", padding: "32px 20px", border: `1px dashed ${COLORS.line}`, borderRadius: 14, background: COLORS.surface }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: COLORS.tealBg, margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={20} color={COLORS.teal} /></div>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{title}</p>
      {body && <p style={{ margin: "4px auto 0", fontSize: 12.5, color: COLORS.inkMuted, maxWidth: 320 }}>{body}</p>}
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  );
}

function Field({ label, error, hint, children }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.ink, marginBottom: 6 }}>{label}</label>
      {children}
      {error ? (
        <p role="alert" style={{ margin: "6px 0 0", fontSize: 12.5, color: COLORS.coral, display: "flex", alignItems: "center", gap: 5 }}><AlertCircle size={13} />{error}</p>
      ) : hint ? <p style={{ margin: "6px 0 0", fontSize: 12, color: COLORS.inkMuted }}>{hint}</p> : null}
    </div>
  );
}

function Modal({ title, body, confirmLabel = "Confirm", tone = "primary", onConfirm, onClose }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.focus(); }, []);
  return (
    <div className="ce-modal-back" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="ce-modal" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 650 }}>{title}</h3>
        <p style={{ margin: "8px 0 20px", fontSize: 13.5, color: COLORS.inkMuted, lineHeight: 1.55 }}>{body}</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <button ref={ref} className="ce-btn" onClick={onConfirm} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontWeight: 600, fontSize: 13.5, padding: "9px 16px", minHeight: 40, borderRadius: 10, border: "1px solid transparent", background: tone === "danger" ? COLORS.coral : COLORS.teal, color: COLORS.onAccent }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function Tabs({ tabs, value, onChange }) {
  return (
    <div role="tablist" style={{ display: "flex", gap: 4, padding: 4, background: COLORS.panel2, borderRadius: 12, overflowX: "auto", marginBottom: 22, maxWidth: "100%", width: "fit-content" }}>
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} className="ce-btn" onClick={() => onChange(t.id)}
          style={{ border: "none", padding: "8px 16px", borderRadius: 9, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", background: value === t.id ? COLORS.surface : "transparent", color: value === t.id ? COLORS.ink : COLORS.inkMuted, boxShadow: value === t.id ? COLORS.shadow : "none" }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

function Switch({ on, onClick, color, label }) {
  return (
    <button className="ce-btn" role="switch" aria-checked={on} aria-label={label || "Toggle"} onClick={onClick}
      style={{ width: 40, height: 24, borderRadius: 999, border: "none", padding: 2, background: on ? (color || COLORS.teal) : COLORS.line, display: "flex", justifyContent: on ? "flex-end" : "flex-start", flexShrink: 0 }}>
      <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", display: "block", boxShadow: "0 1px 2px rgba(0,0,0,0.25)", transition: "all .15s" }} />
    </button>
  );
}

function Screen({ title, subtitle, onBack, onReport, actions, children }) {
  return (
    <div className="ce-fade">
      <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, fontSize: 12.5, color: COLORS.inkMuted }}>
        <button className="ce-btn" onClick={onBack} style={{ background: "none", border: "none", padding: 0, color: COLORS.inkMuted, fontSize: 12.5, fontWeight: 500 }}>Dashboard</button>
        <ChevronRight size={12} />
        <span style={{ color: COLORS.ink, fontWeight: 600 }}>{title}</span>
      </nav>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", color: COLORS.ink }}>{title}</h1>
          {subtitle && <p style={{ margin: "5px 0 0", fontSize: 14, color: COLORS.inkMuted }}>{subtitle}</p>}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {actions}
          {onReport && <Button icon={Plus} onClick={onReport}>Report issue</Button>}
        </div>
      </div>
      {children}
    </div>
  );
}

function FacilityRow({ f, now, onClick, showBlock }) {
  const meta = TYPE_META[f.type];
  const Icon = meta.icon;
  return (
    <button className="ce-btn ce-card-hover" onClick={onClick} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", background: COLORS.surface, borderRadius: 14, border: `1px solid ${COLORS.line}`, boxShadow: COLORS.shadow }}>
      <div style={{ width: 40, height: 40, borderRadius: 11, background: statusBg(f.status), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
        <Icon size={19} color={statusColor(f.status)} />
        {f.status === "flagged" && <span className="ce-dot" style={{ position: "absolute", top: -2, right: -2, width: 9, height: 9, borderRadius: "50%", background: COLORS.coral }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: COLORS.ink }}>{f.name}</p>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.inkMuted }}>
          {showBlock ? `${f.floor} · ` : ""}{f.type === "watercooler" ? `Last cleaned ${formatRelative(f.lastCleaned, now)}` : `Updated ${formatRelative(f.updatedAt, now)}`}
        </p>
      </div>
      <Pill status={f.status}>{meta.labels[f.status]}</Pill>
      <ChevronRight size={16} color={COLORS.inkFaint} style={{ flexShrink: 0 }} />
    </button>
  );
}

const BLOCK_ACCENT = { "FET Block": "#4F46E5", "Core Block": "#8B5CF6", "Aerospace Block": "#0EA5E9" };

// Step 1: pick a block. Step 2: see that block's facilities.
function BlockBrowser({ facilities, now, block, setBlock, onRowClick, labels }) {
  if (!block) {
    return (
      <div>
        <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: COLORS.inkMuted }}>Choose a block</p>
        <div className="ce-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
          {FLOORS.map((fl) => {
            const items = facilities.filter((f) => f.floor === fl);
            const ok = items.filter((f) => f.status === "ok").length;
            const bad = items.length - ok;
            const accent = BLOCK_ACCENT[fl] || COLORS.teal;
            return (
              <button key={fl} className="ce-btn ce-card-hover" onClick={() => setBlock(fl)}
                style={{ textAlign: "left", padding: 18, borderRadius: 14, border: `1px solid ${COLORS.line}`, background: COLORS.surface, boxShadow: COLORS.shadow, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: accent + "1F", color: accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18 }}>{fl[0]}</div>
                  <ChevronRight size={18} color={COLORS.inkFaint} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 15.5, fontWeight: 650, color: COLORS.ink }}>{fl}</p>
                  <p style={{ margin: "3px 0 0", fontSize: 12.5, color: COLORS.inkMuted }}>{items.length} {items.length === 1 ? "spot" : "spots"}</p>
                </div>
                <div>
                  <div style={{ height: 6, borderRadius: 999, background: COLORS.panel2, overflow: "hidden" }}>
                    <div style={{ width: items.length ? `${(ok / items.length) * 100}%` : "0%", height: "100%", background: COLORS.ok, borderRadius: 999 }} />
                  </div>
                  <p style={{ margin: "8px 0 0", fontSize: 12, fontWeight: 600, color: items.length === 0 ? COLORS.inkMuted : bad ? COLORS.amber : COLORS.ok }}>
                    {items.length === 0 ? "Nothing here yet" : bad === 0 ? "All working" : `${ok} working · ${bad} need attention`}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }
  const items = facilities.filter((f) => f.floor === block);
  return (
    <div>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, marginBottom: 14 }}>
        <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => setBlock(null)} style={{ flexShrink: 0 }}>All blocks</Button>
        {FLOORS.map((fl) => (
          <Button key={fl} variant={block === fl ? "soft" : "secondary"} size="sm" onClick={() => setBlock(fl)} style={{ flexShrink: 0, borderColor: block === fl ? COLORS.teal : COLORS.line }}>{fl}</Button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {["ok", "watch", "flagged"].map((st) => {
          const n = items.filter((f) => f.status === st).length;
          return <Pill key={st} status={st}>{n} {labels[st].toLowerCase()}</Pill>;
        })}
      </div>
      {items.length === 0 ? (
        <EmptyState icon={Building2} title={`Nothing listed in ${block} yet`} body="Pick another block from the row above." />
      ) : (
        <div className="ce-stagger" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((f) => <FacilityRow key={f.id} f={f} now={now} onClick={() => onRowClick(f)} />)}
        </div>
      )}
    </div>
  );
}

// ---------- Indoor floor plan (building map) ----------
// SVG coordinate space is 200 x 124. One long corridor runs through the middle (y 56-68).
// Rooms above the corridor open downward (door y=56); rooms below open upward (door y=68).
const MAP_W = 200, MAP_H = 124, CORR_Y1 = 56, CORR_Y2 = 68, CORR_MID = 62;
const TOP_SLOTS = [40, 76, 112, 148];      // x centres of the four rooms above the corridor
const BOT_SLOTS = [24, 62, 138, 176];      // rooms below the corridor (lobby sits in the middle)
const STAIRS = { x: 12, label: "Stairs" };
const LIFT = { x: 186, label: "Lift" };
const LOBBY_X = 100;                       // main entrance centre
const START_POINTS = [
  { id: "entrance", label: "Main entrance", level0: true },
  { id: "stairs", label: "Stairs" },
  { id: "lift", label: "Lift" },
  { id: "canteen", label: "Canteen", level0: true },
];
const START_X = { entrance: LOBBY_X, stairs: STAIRS.x, lift: LIFT.x, canteen: 176 };
// Each teacher's cabin: level (0 = ground), side of corridor, slot index
const TEACHER_ROOMS = {
  t1: { level: 2, side: "top", slot: 1 }, t2: { level: 2, side: "top", slot: 2 }, t2b: { level: 2, side: "bot", slot: 0 },
  t7: { level: 1, side: "top", slot: 1 }, t8: { level: 1, side: "bot", slot: 2 },
  t5: { level: 0, side: "top", slot: 1 }, t6: { level: 0, side: "top", slot: 2 },
};
const LEVEL_NAME = ["Ground floor", "1st floor", "2nd floor"];
// Neighbouring rooms drawn for context on each floor
const FILLER_TOP = ["Lab", "Lecture hall", "Cabin", "Cabin"];
const FILLER_BOT = ["Washroom", "Cabin", "Cabin", "Cabin"];

function IndoorMap({ teacher }) {
  const room = TEACHER_ROOMS[teacher.id];
  const [start, setStart] = useState("entrance");
  if (!room) return null;

  const isTop = room.side === "top";
  const slots = isTop ? TOP_SLOTS : BOT_SLOTS;
  const doorX = slots[room.slot];
  const doorY = isTop ? CORR_Y1 : CORR_Y2;
  const startPt = START_POINTS.find((s) => s.id === start);
  const sx = START_X[start];
  const needsClimb = room.level > 0 && startPt.level0;
  const arriveVia = start === "canteen" || start === "entrance" ? (room.slot > 1 ? "lift" : "stairs") : start;
  const originX = needsClimb ? START_X[arriveVia] : sx;
  // On the ground floor the entrance and canteen are real start points; on upper floors you arrive by stairs or lift.
  const onThisLevel = !needsClimb;
  const startY = start === "entrance" && room.level === 0 ? 116 : start === "canteen" && room.level === 0 ? 100 : CORR_MID;

  const pts = [];
  if (onThisLevel && room.level === 0 && (start === "entrance")) pts.push([originX, 116], [originX, CORR_MID]);
  else if (onThisLevel && room.level === 0 && start === "canteen") pts.push([originX, 100], [originX, CORR_MID]);
  else pts.push([originX, CORR_MID]);
  pts.push([doorX, CORR_MID], [doorX, doorY]);
  const clean = pts.filter((p, i) => i === 0 || p[0] !== pts[i - 1][0] || p[1] !== pts[i - 1][1]);
  const d = clean.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");

  let units = 0;
  for (let i = 1; i < clean.length; i++) units += Math.abs(clean[i][0] - clean[i - 1][0]) + Math.abs(clean[i][1] - clean[i - 1][1]);
  const meters = Math.max(5, Math.round(units * 0.35)) + (needsClimb ? room.level * 8 : 0);
  const mins = Math.max(1, Math.round(meters / 75));

  const goingRight = doorX > originX;
  const cabinSide = isTop ? (goingRight ? "left" : "right") : (goingRight ? "right" : "left");
  const steps = [];
  if (needsClimb) steps.push(`Take the ${arriveVia} up to the ${LEVEL_NAME[room.level].toLowerCase()}.`);
  else if (start === "entrance" && room.level === 0) steps.push("Enter and walk straight ahead into the corridor.");
  else if (start === "canteen" && room.level === 0) steps.push("Leave the canteen and join the main corridor.");
  else steps.push(`Start at the ${startPt.label.toLowerCase()} on this floor.`);
  if (Math.abs(doorX - originX) > 4) steps.push(`Walk ${goingRight ? "right" : "left"} along the corridor until you pass ${Math.max(0, Math.round(Math.abs(doorX - originX) / 36))} room${Math.round(Math.abs(doorX - originX) / 36) === 1 ? "" : "s"}.`);
  steps.push(`${teacher.room} is on your ${cabinSide}. You've arrived.`);

  const lineC = COLORS.line, faint = COLORS.inkFaint;
  const mono = "Inter, system-ui, sans-serif";
  const roomRect = (cx, top, label, fill, stroke, textColor, bold) => {
    const y = top ? 8 : 74, h = 42;
    return (
      <g key={`${top}-${cx}-${label}`}>
        <rect x={cx - 15} y={y} width={30} height={h} rx={3} fill={fill} stroke={stroke} strokeWidth={0.8} />
        <text x={cx} y={y + h / 2 + 1.5} textAnchor="middle" fontSize={bold ? 5.4 : 4.4} fontWeight={bold ? 700 : 500} fill={textColor} fontFamily="Inter, system-ui, sans-serif">{label}</text>
      </g>
    );
  };

  return (
    <div>
      <p style={{ margin: "0 0 8px", fontSize: 12.5, fontWeight: 600, color: COLORS.inkMuted }}>Where are you now?</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {START_POINTS.map((s) => (
          <button key={s.id} className="ce-btn" onClick={() => setStart(s.id)}
            style={{ fontSize: 12.5, fontWeight: 600, padding: "7px 13px", borderRadius: 999, border: `1px solid ${start === s.id ? COLORS.teal : COLORS.line}`, background: start === s.id ? COLORS.tealBg : COLORS.surface, color: start === s.id ? COLORS.teal : COLORS.ink }}>
            {s.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: COLORS.teal, background: COLORS.tealBg, padding: "4px 10px", borderRadius: 999 }}>{LEVEL_NAME[room.level]}</span>
        <span style={{ fontSize: 12, color: COLORS.inkMuted }}>{teacher.floor} · floor plan</span>
      </div>

      <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 8 }}>
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label={`Floor plan showing the way to ${teacher.room}`}>
          <rect x={2} y={2} width={196} height={120} rx={6} fill={COLORS.surface} stroke={lineC} strokeWidth={1} />
          <rect x={4} y={CORR_Y1} width={192} height={CORR_Y2 - CORR_Y1} fill={COLORS.panel} stroke={lineC} strokeWidth={0.5} strokeDasharray="2 2" />
          <text x={100} y={CORR_Y2 - 1.8} textAnchor="middle" fontSize={3} fill={faint} fontFamily={mono} letterSpacing="0.6">CORRIDOR</text>

          <rect x={4} y={8} width={16} height={42} rx={3} fill={COLORS.panel} stroke={lineC} strokeWidth={0.8} />
          <text x={12} y={30} textAnchor="middle" fontSize={4.2} fill={faint} fontWeight={600} fontFamily="Inter, sans-serif">Stairs</text>
          <rect x={178} y={8} width={16} height={42} rx={3} fill={COLORS.panel} stroke={lineC} strokeWidth={0.8} />
          <text x={186} y={30} textAnchor="middle" fontSize={4.2} fill={faint} fontWeight={600} fontFamily="Inter, sans-serif">Lift</text>

          {TOP_SLOTS.map((cx, i) => (i === room.slot && isTop)
            ? roomRect(cx, true, teacher.room.replace("Hangar Office", "Office"), COLORS.coralBg, COLORS.coral, COLORS.coral, true)
            : roomRect(cx, true, FILLER_TOP[i], COLORS.surface, lineC, faint, false))}
          {BOT_SLOTS.map((cx, i) => (i === room.slot && !isTop)
            ? roomRect(cx, false, teacher.room.replace("Hangar Office", "Office"), COLORS.coralBg, COLORS.coral, COLORS.coral, true)
            : roomRect(cx, false, i === 0 && room.level === 0 ? "Washroom" : (i === 3 && room.level === 0 ? "Canteen" : FILLER_BOT[i]), COLORS.surface, lineC, faint, false))}
          {room.level === 0 && <rect x={85} y={74} width={30} height={42} rx={3} fill={COLORS.tealBg} stroke={COLORS.teal} strokeWidth={0.8} />}
          {room.level === 0 && <text x={100} y={92} textAnchor="middle" fontSize={4.4} fontWeight={700} fill={COLORS.teal} fontFamily="Inter, sans-serif">Main lobby</text>}
          {room.level !== 0 && <rect x={85} y={74} width={30} height={42} rx={3} fill={COLORS.surface} stroke={lineC} strokeWidth={0.8} />}
          {room.level !== 0 && <text x={100} y={95} textAnchor="middle" fontSize={4.2} fill={faint} fontFamily="Inter, sans-serif">Atrium</text>}

          <path d={d} fill="none" stroke={COLORS.teal} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" strokeDasharray="4 3" className="ce-route" />

          <g>
            <circle cx={originX} cy={clean[0][1]} r={6} fill={COLORS.teal} opacity={0.2} />
            <circle cx={originX} cy={clean[0][1]} r={3.2} fill={COLORS.teal} stroke={COLORS.surface} strokeWidth={1} />
            <text x={originX < 40 ? originX - 5 : originX > 160 ? originX + 5 : originX} y={clean[0][1] + (clean[0][1] > 100 ? -7 : 10)} textAnchor={originX < 40 ? "start" : originX > 160 ? "end" : "middle"} fontSize={4.4} fontWeight={700} fill={COLORS.teal} fontFamily="Inter, sans-serif">{needsClimb ? `Arrive by ${arriveVia}` : "You are here"}</text>
          </g>
          <g>
            <path d={`M${doorX},${doorY} m0,0`} />
            <circle cx={doorX} cy={doorY} r={4.2} fill={COLORS.coral} stroke={COLORS.surface} strokeWidth={1.2} />
            <circle cx={doorX} cy={doorY} r={1.4} fill="#fff" />
          </g>
        </svg>
      </div>

      <div style={{ display: "flex", gap: 14, margin: "10px 2px 4px", fontSize: 12.5, color: COLORS.ink, fontWeight: 600 }}>
        <span>~{meters} m</span><span style={{ color: COLORS.inkMuted, fontWeight: 400 }}>·</span><span>about {mins} min walk</span>
      </div>
      <ol style={{ margin: "6px 0 0", padding: "0 0 0 18px", display: "flex", flexDirection: "column", gap: 4 }}>
        {steps.map((s, i) => <li key={i} style={{ fontSize: 12.5, color: COLORS.inkMuted, lineHeight: 1.5 }}>{s}</li>)}
      </ol>
    </div>
  );
}

// ---------- Sample content (clearly labelled in the UI) ----------
const SAMPLE_ANNOUNCEMENTS = [
  { id: "a1", title: "Library hours extended during exam weeks", when: "Today", tag: "Academics" },
  { id: "a2", title: "WiFi upgrade planned for Aerospace Block", when: "This weekend", tag: "Infrastructure" },
  { id: "a3", title: "Water cooler QR codes are now live", when: "This week", tag: "Campus" },
];
const SAMPLE_EVENTS = [
  { id: "e1", title: "Tech fest registrations", date: "12 Nov" },
  { id: "e2", title: "Placement orientation", date: "15 Nov" },
  { id: "e3", title: "Annual sports day", date: "20 Nov" },
];
const SAMPLE_TIMETABLE = [
  { id: "c1", time: "09:00", title: "Data Structures", place: "FET, Room 210", group: "CS 3A" },
  { id: "c2", time: "11:00", title: "Operating Systems", place: "FET, Room 215", group: "CS 4B" },
  { id: "c3", time: "14:00", title: "Mentoring session", place: "Core Block, Room 105", group: "Mentees" },
  { id: "c4", time: "16:00", title: "Lab supervision", place: "Aerospace, Hangar Office 3", group: "AE Lab" },
];
const SAMPLE_ATTENDANCE = [
  { day: "Mon", pct: 92 }, { day: "Tue", pct: 88 }, { day: "Wed", pct: 90 }, { day: "Thu", pct: 85 }, { day: "Fri", pct: 87 },
];
const TYPE_SCREEN = { charging: "charging", vending: "vending", washroom: "washroom", wifi: "wifi", watercooler: "water" };
const SERVICE_TILES = [
  { id: "charging", label: "Charging", icon: Zap, type: "charging" },
  { id: "vending", label: "Vending", icon: Cookie, type: "vending" },
  { id: "washroom", label: "Washrooms", icon: Wind, type: "washroom" },
  { id: "wifi", label: "WiFi", icon: Wifi, type: "wifi" },
  { id: "water", label: "Water coolers", icon: Droplets, type: "watercooler" },
];
const NAV = [
  { group: "Overview", items: [{ id: "home", label: "Dashboard", icon: LayoutDashboard }] },
  { group: "Campus services", items: [
    { id: "charging", label: "Charging", icon: Zap }, { id: "vending", label: "Vending", icon: Cookie },
    { id: "washroom", label: "Washrooms", icon: Wind }, { id: "wifi", label: "WiFi", icon: Wifi }, { id: "water", label: "Water coolers", icon: Droplets },
  ] },
  { group: "Tools", items: [
    { id: "teachers", label: "Find a teacher", icon: GraduationCap }, { id: "scan", label: "Scan QR", icon: Camera },
    { id: "reserve", label: "Reserve charging", icon: Clock }, { id: "report", label: "Report issue", icon: Flag },
  ] },
];
const STAFF_NAV = [
  { tab: "overview", label: "Staff dashboard", icon: ShieldCheck },
  { tab: "issues", label: "Issue queue", icon: ClipboardList },
  { tab: "qr", label: "QR codes", icon: QrCode },
  { tab: "insights", label: "Insights", icon: BarChart3 },
];
const STAFF_PROFILE = { name: "Campus Operations", role: "Facilities team", dept: "JAIN Global Campus", id: "STF-0412" };

export default function CampusEase() {
  const [data, setData] = useState(null);
  const [theme, setTheme] = useState("light");
  const [entered, setEntered] = useState(false);
  Object.assign(COLORS, theme === "dark" ? DARK : LIGHT);

  const [screen, setScreen] = useState("home");
  const [now, setNow] = useState(Date.now());
  const [toast, setToast] = useState(null);
  const [simulate, setSimulate] = useState(false);

  // shell
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(null); // "notif" | "account" | null
  const [searchQ, setSearchQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [userName, setUserName] = useState(() => { try { return localStorage.getItem("ce-name") || ""; } catch (e) { return ""; } });
  const [confirm, setConfirm] = useState(null);

  const [reportFacility, setReportFacility] = useState("");
  const [reportNote, setReportNote] = useState("");
  const [reportErrors, setReportErrors] = useState({});

  const [reserveFacility, setReserveFacility] = useState("");
  const [reserveSlot, setReserveSlot] = useState("");
  const [reserveErrors, setReserveErrors] = useState({});

  const [staffOk, setStaffOk] = useState(false);
  const [staffTab, setStaffTab] = useState("overview");
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [issueStatus, setIssueStatus] = useState("open");
  const [issueBlock, setIssueBlock] = useState("all");
  const [issueSort, setIssueSort] = useState("oldest");

  const [block, setBlock] = useState(null);
  useEffect(() => { setBlock(null); }, [screen]);
  const [teacherQuery, setTeacherQuery] = useState("");
  const [openTeacherMap, setOpenTeacherMap] = useState(null);

  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState("");
  const [manualCooler, setManualCooler] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanLoopRef = useRef(false);
  const scanSupported = typeof window !== "undefined" && "BarcodeDetector" in window;

  useEffect(() => {
    const check = () => { if (window.location.hash === "#staff") { setEntered(true); setScreen("admin"); } };
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") { setMenu(null); setConfirm(null); setDrawer(false); setSearchOpen(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) throw new Error("empty");
        if (!cancelled) setData(JSON.parse(raw));
      } catch (e) {
        const initial = { facilities: defaultFacilities(), reports: seedReports(), reservations: [] };
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(initial)); } catch (e2) {}
        if (!cancelled) setData(initial);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const persist = async (next) => {
    setData(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
    catch (e) { setToast({ kind: "error", text: "Couldn't save. Check your connection and try again." }); }
  };

  const showToast = (kind, text) => {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 2800);
  };

  // QR deep-link support: a scanned/printed QR opening the site directly
  useEffect(() => {
    if (!data) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const qrId = params.get("qr");
      if (qrId) {
        const f = (data.facilities || []).find((x) => x.id === qrId);
        if (f) {
          setEntered(true);
          setScanResult(f);
          setScreen("scan");
          showToast("ok", `Scanned: ${f.name}`);
        }
      }
    } catch (e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const facilities = data?.facilities ?? [];
  const reports = data?.reports ?? [];
  const reservations = data?.reservations ?? [];

  useEffect(() => {
    if (!simulate || !data) return;
    const t = setInterval(() => {
      const eligible = facilities.filter((f) => f.status !== "flagged");
      if (eligible.length === 0) return;
      const pick = eligible[Math.floor(Math.random() * eligible.length)];
      const nextStatus = pick.status === "ok" ? "watch" : "ok";
      persist({ ...data, facilities: facilities.map((f) => (f.id === pick.id ? { ...f, status: nextStatus, updatedAt: Date.now() } : f)) });
    }, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulate, data]);

  const facility = (id) => facilities.find((x) => x.id === id);
  const facilityName = (id) => { const f = facility(id); return f ? `${TYPE_META[f.type].noun}, ${f.name}` : "Unknown facility"; };
  const chargingFacilities = facilities.filter((f) => f.type === "charging");
  const slots = useMemo(() => generateSlots(now), [now]);

  const submitReport = () => {
    const errs = {};
    if (!reportFacility) errs.facility = "Choose the facility that has a problem.";
    if (!reportNote.trim()) errs.note = "Describe what's wrong so staff know what to fix.";
    setReportErrors(errs);
    if (Object.keys(errs).length) return;
    const next = {
      ...data,
      facilities: facilities.map((f) => (f.id === reportFacility ? { ...f, status: "flagged", updatedAt: Date.now() } : f)),
      reports: [{ id: `r-${Date.now()}`, facilityId: reportFacility, note: reportNote.trim(), timestamp: Date.now(), status: "open" }, ...reports],
    };
    persist(next);
    setReportFacility(""); setReportNote("");
    showToast("ok", "Reported. Thanks for flagging it.");
    setScreen("home");
  };

  const submitReservation = () => {
    const errs = {};
    if (!reserveFacility) errs.bay = "Choose a charging bay.";
    if (!reserveSlot) errs.slot = "Pick a time slot.";
    else if (reserveFacility && reservations.some((r) => r.facilityId === reserveFacility && r.slot === reserveSlot)) errs.slot = "That slot is already booked. Pick another.";
    setReserveErrors(errs);
    if (Object.keys(errs).length) return;
    persist({ ...data, reservations: [{ id: `v-${Date.now()}`, facilityId: reserveFacility, slot: reserveSlot, timestamp: Date.now() }, ...reservations] });
    setReserveSlot("");
    showToast("ok", "Reserved. See you then.");
  };

  const cancelReservation = (id) => { persist({ ...data, reservations: reservations.filter((r) => r.id !== id) }); showToast("ok", "Reservation cancelled."); };

  const resolveReport = (id) => {
    const report = reports.find((r) => r.id === id);
    if (!report) return;
    persist({
      ...data,
      reports: reports.map((r) => (r.id === id ? { ...r, status: "resolved", resolvedAt: Date.now() } : r)),
      facilities: facilities.map((f) => (f.id === report.facilityId ? { ...f, status: "ok", updatedAt: Date.now() } : f)),
    });
    showToast("ok", "Marked resolved.");
  };

  const markCleaned = (facilityId) => {
    persist({ ...data, facilities: facilities.map((f) => (f.id === facilityId ? { ...f, status: "ok", updatedAt: Date.now(), lastCleaned: Date.now() } : f)) });
    showToast("ok", "Marked as cleaned just now.");
  };

  const feed = useMemo(() => {
    const items = [...reports.map((r) => ({ kind: "report", ...r })), ...reservations.map((r) => ({ kind: "reservation", ...r }))];
    return items.sort((a, b) => b.timestamp - a.timestamp);
  }, [reports, reservations]);
  const openQueue = useMemo(() => reports.filter((r) => r.status === "open").sort((a, b) => a.timestamp - b.timestamp), [reports]);

  const counts = useMemo(() => ({
    ok: facilities.filter((f) => f.status === "ok").length,
    watch: facilities.filter((f) => f.status === "watch").length,
    flagged: facilities.filter((f) => f.status === "flagged").length,
    total: facilities.length,
  }), [facilities]);

  const byBlock = useMemo(() => FLOORS.map((fl) => ({
    name: BLOCK_SHORT[fl] || fl,
    Working: facilities.filter((f) => f.floor === fl && f.status === "ok").length,
    "Needs attention": facilities.filter((f) => f.floor === fl && f.status === "watch").length,
    "Out of order": facilities.filter((f) => f.floor === fl && f.status === "flagged").length,
  })), [facilities]);

  const insights = useMemo(() => {
    const byType = { charging: 0, vending: 0, washroom: 0, wifi: 0, watercooler: 0 };
    const byFloor = { "FET Block": 0, "Core Block": 0, "Aerospace Block": 0 };
    const perFacility = {};
    reports.forEach((r) => {
      const f = facility(r.facilityId);
      if (!f) return;
      byType[f.type]++; byFloor[f.floor]++;
      perFacility[r.facilityId] = (perFacility[r.facilityId] || 0) + 1;
    });
    const resolved = reports.filter((r) => r.status === "resolved" && r.resolvedAt);
    const avgMins = resolved.length ? Math.round(resolved.reduce((s, r) => s + (r.resolvedAt - r.timestamp), 0) / resolved.length / 60000) : null;
    let topId = null, topCount = 0;
    Object.entries(perFacility).forEach(([id, c]) => { if (c > topCount) { topCount = c; topId = id; } });
    return {
      byType: [{ name: "Charge", count: byType.charging }, { name: "Vending", count: byType.vending }, { name: "Wash", count: byType.washroom }, { name: "WiFi", count: byType.wifi }, { name: "Water", count: byType.watercooler }],
      byFloor: FLOORS.map((fl) => ({ name: BLOCK_SHORT[fl] || fl, count: byFloor[fl] })),
      avgMins, topFacility: topId ? facilityName(topId) : "None yet", openCount: openQueue.length, resolvedCount: resolved.length,
    };
  }, [reports, openQueue]);

  const dueCoolers = useMemo(() => facilities.filter((f) => f.type === "watercooler" && f.lastCleaned && now - f.lastCleaned > 24 * 3600000), [facilities, now]);

  const alerts = useMemo(() => facilities.filter((f) => f.status === "flagged").concat(facilities.filter((f) => f.status === "watch")).slice(0, 7), [facilities]);

  const visibleTeachers = useMemo(() => {
    if (!teacherQuery.trim()) return TEACHERS;
    const q = teacherQuery.trim().toLowerCase();
    return TEACHERS.filter((t) => t.name.toLowerCase().includes(q) || t.dept.toLowerCase().includes(q) || t.room.toLowerCase().includes(q));
  }, [teacherQuery]);

  const nearestFreeCharging = useMemo(() => chargingFacilities.find((f) => f.status === "ok") || null, [chargingFacilities]);

  const searchResults = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    if (!q) return null;
    return {
      facilities: facilities.filter((f) => `${f.name} ${f.floor} ${TYPE_META[f.type].noun} ${f.type}`.toLowerCase().includes(q)).slice(0, 6),
      teachers: TEACHERS.filter((t) => `${t.name} ${t.dept} ${t.room} ${t.floor}`.toLowerCase().includes(q)).slice(0, 4),
    };
  }, [searchQ, facilities]);

  // ---- QR scanning ----
  const stopScanning = () => {
    scanLoopRef.current = false;
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    setScanning(false);
  };

  const parseFacilityId = (raw) => {
    const m = raw.match(/[?&]qr=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : raw.trim();
  };

  const startScanning = async () => {
    setScanError(""); setScanResult(null);
    if (!scanSupported) { setScanError("QR scanning needs Chrome on Android (or another browser with camera barcode support). You can pick a cooler manually below."); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setScanning(true);
      scanLoopRef.current = true;
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      const loop = async () => {
        if (!scanLoopRef.current || !videoRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes && codes.length > 0) {
            const id = parseFacilityId(codes[0].rawValue || "");
            const f = facility(id);
            stopScanning();
            if (f) { setScanResult(f); showToast("ok", `Scanned: ${f.name}`); }
            else setScanError("That QR code isn't recognized by CampusEase.");
            return;
          }
        } catch (e) {}
        if (scanLoopRef.current) requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    } catch (e) {
      setScanError("Camera access was denied. Allow camera permission in your browser and try again.");
      setScanning(false);
    }
  };

  useEffect(() => () => stopScanning(), []);

  // ---- navigation helpers ----
  const closeOverlays = () => { setDrawer(false); setMenu(null); setSearchOpen(false); };
  const go = (id) => { if (id !== "scan") stopScanning(); setScanResult(null); setScanError(""); setScreen(id); closeOverlays(); };
  const goHome = () => go("home");
  const goReport = (facilityId) => { if (facilityId) setReportFacility(facilityId); setReportErrors({}); setScreen("report"); closeOverlays(); };
  const goStaff = (tab) => { setStaffTab(tab || "overview"); setScreen("admin"); closeOverlays(); };
  const exitStaff = () => {
    if (window.location.hash === "#staff") window.history.replaceState(null, "", window.location.pathname + window.location.search);
    setStaffOk(false); setPinInput(""); setPinError(""); setScreen("home"); closeOverlays(); showToast("ok", "Signed out of staff mode.");
  };
  const saveName = (v) => { setUserName(v); try { localStorage.setItem("ce-name", v); } catch (e) {} };
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const firstName = userName.trim().split(/\s+/)[0] || "";
  const hour = new Date(now).getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const displayName = staffOk && screen === "admin" ? STAFF_PROFILE.name : (userName.trim() || "Guest");
  const roleLabel = staffOk ? "Staff" : "Student";

  const chartTip = { contentStyle: { fontSize: 12, borderRadius: 10, border: `1px solid ${COLORS.line}`, background: COLORS.surface, color: COLORS.ink, boxShadow: "0 8px 24px rgba(16,24,40,0.12)" }, cursor: { fill: COLORS.tealBg } };
  const axisTick = { fontSize: 11, fill: COLORS.inkMuted };

  const activityList = (limit) => (
    feed.length === 0 ? (
      <EmptyState icon={Inbox} title="No activity yet" body="Reports and reservations will appear here as they happen." />
    ) : (
      <div style={{ display: "flex", flexDirection: "column" }}>
        {feed.slice(0, limit).map((item, i) => (
          <div key={item.id} style={{ display: "flex", gap: 12, padding: "11px 0", borderTop: i ? `1px solid ${COLORS.line}` : "none" }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: item.kind === "report" ? (item.status === "resolved" ? COLORS.okBg : COLORS.coralBg) : COLORS.tealBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {item.kind === "report" ? (item.status === "resolved" ? <CheckCircle2 size={14} color={COLORS.ok} /> : <Flag size={14} color={COLORS.coral} />) : <Clock size={14} color={COLORS.teal} />}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, color: COLORS.ink, lineHeight: 1.4 }}>
                {item.kind === "report" ? <>{item.status === "resolved" ? "Resolved" : "Flagged"} <strong style={{ fontWeight: 600 }}>{facilityName(item.facilityId)}</strong></> : <>Reserved <strong style={{ fontWeight: 600 }}>{facilityName(item.facilityId)}</strong> for {item.slot}</>}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 11.5, color: COLORS.inkMuted }}>{formatRelative(item.timestamp, now)}</p>
            </div>
          </div>
        ))}
      </div>
    )
  );

  const donutData = [
    { name: "Working", value: counts.ok, color: COLORS.ok },
    { name: "Needs attention", value: counts.watch, color: COLORS.amberFill },
    { name: "Out of order", value: counts.flagged, color: COLORS.coral },
  ];

  const navItem = (item, active, onClick) => {
    const Icon = item.icon;
    return (
      <button key={item.id || item.tab} className={`ce-btn ce-nav-item ${active ? "active" : ""}`} onClick={onClick} title={item.label} aria-current={active ? "page" : undefined}>
        <Icon size={18} style={{ flexShrink: 0 }} /><span className="lbl">{item.label}</span>
      </button>
    );
  };

  // ============================== RENDER ==============================
  return (
    <div className="ce-app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .ce-app { display: flex; min-height: 100vh; font-family: Inter, system-ui, sans-serif; background: ${COLORS.bg}; color: ${COLORS.ink}; -webkit-font-smoothing: antialiased; font-feature-settings: "cv11", "ss01"; }
        .ce-app *, .ce-app *::before, .ce-app *::after { box-sizing: border-box; }
        .ce-app button { font-family: inherit; }
        .ce-btn { color: ${COLORS.ink}; cursor: pointer; transition: transform .1s ease, background .15s ease, border-color .15s ease, box-shadow .15s ease, opacity .15s ease; }
        .ce-btn:hover:not(:disabled) { box-shadow: 0 1px 3px rgba(16,24,40,.14); }
        .ce-btn:active:not(:disabled) { transform: scale(.97); }
        .ce-btn:disabled { opacity: .5; cursor: not-allowed; }
        .ce-btn:focus-visible, .ce-input:focus-visible, .ce-select:focus-visible, .ce-textarea:focus-visible { outline: 2px solid ${COLORS.teal}; outline-offset: 2px; }
        .ce-input, .ce-select, .ce-textarea { font-family: inherit; font-size: 14px; color: ${COLORS.ink}; background: ${COLORS.surface}; border: 1px solid ${COLORS.line}; border-radius: 10px; padding: 10px 12px; width: 100%; min-height: 42px; transition: border-color .15s, box-shadow .15s; }
        .ce-input:hover, .ce-select:hover, .ce-textarea:hover { border-color: ${COLORS.inkFaint}; }
        .ce-input:focus, .ce-select:focus, .ce-textarea:focus { border-color: ${COLORS.teal}; box-shadow: 0 0 0 3px ${COLORS.tealBg}; outline: none; }
        .ce-invalid { border-color: ${COLORS.coral} !important; }
        .ce-fade { animation: ceFadeIn .22s ease; }
        @keyframes ceFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .ce-pop { animation: cePop .16s ease; transform-origin: top right; }
        @keyframes cePop { from { opacity: 0; transform: translateY(-4px) scale(.98); } to { opacity: 1; transform: none; } }
        .ce-dot { animation: ceDot 1.6s ease-in-out infinite; }
        @keyframes ceDot { 0%,100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.35);} 50% { box-shadow: 0 0 0 6px rgba(220,38,38,0);} }
        .ce-route { animation: ceRoute .8s linear infinite; }
        @keyframes ceRoute { to { stroke-dashoffset: -10; } }
        .ce-skel { background: linear-gradient(90deg, ${COLORS.panel2} 25%, ${COLORS.line} 37%, ${COLORS.panel2} 63%); background-size: 400% 100%; animation: ceShimmer 1.4s ease infinite; }
        @keyframes ceShimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
        .ce-card-hover { transition: transform .15s ease, border-color .15s ease, box-shadow .15s ease; }
        .ce-card-hover:hover { border-color: ${COLORS.teal} !important; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(16,24,40,.08); }
        .ce-stagger > * { animation: ceFadeIn .35s ease both; }
        .ce-stagger > *:nth-child(2) { animation-delay: .04s; } .ce-stagger > *:nth-child(3) { animation-delay: .08s; } .ce-stagger > *:nth-child(4) { animation-delay: .12s; }
        .ce-stagger > *:nth-child(5) { animation-delay: .16s; } .ce-stagger > *:nth-child(6) { animation-delay: .2s; } .ce-stagger > *:nth-child(7) { animation-delay: .24s; }

        .ce-sidebar { width: 256px; flex-shrink: 0; background: ${COLORS.surface}; border-right: 1px solid ${COLORS.line}; display: flex; flex-direction: column; padding: 16px 12px; position: sticky; top: 0; height: 100vh; overflow-y: auto; overflow-x: hidden; transition: width .22s ease, transform .25s ease; z-index: 50; }
        .ce-sidebar.collapsed { width: 76px; }
        .ce-brand { display: flex; align-items: center; gap: 10px; padding: 6px 8px 18px; }
        .ce-nav-group { margin: 14px 0 4px; padding: 0 10px; font-size: 11.5px; font-weight: 600; color: ${COLORS.inkFaint}; white-space: nowrap; height: 16px; overflow: hidden; transition: opacity .15s; }
        .ce-sidebar.collapsed .ce-nav-group { opacity: 0; }
        .ce-nav-item { display: flex; align-items: center; gap: 12px; padding: 9px 12px; min-height: 40px; border-radius: 10px; border: none; background: none; font-size: 13.5px; font-weight: 500; color: ${COLORS.inkMuted}; text-align: left; width: 100%; white-space: nowrap; }
        .ce-nav-item:hover { background: ${COLORS.panel2}; color: ${COLORS.ink}; }
        .ce-nav-item.active { background: ${COLORS.tealBg}; color: ${COLORS.teal}; font-weight: 600; }
        .ce-nav-item .lbl { transition: opacity .15s; overflow: hidden; text-overflow: ellipsis; }
        .ce-sidebar.collapsed .lbl { opacity: 0; width: 0; }
        .ce-content { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .ce-topbar { position: sticky; top: 0; z-index: 40; height: 64px; display: flex; align-items: center; gap: 12px; padding: 0 28px; background: ${COLORS.surface}; border-bottom: 1px solid ${COLORS.line}; }
        .ce-main { width: 100%; max-width: 1180px; margin: 0 auto; padding: 28px 28px 64px; }
        .ce-grid-kpi { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
        .ce-grid-2 { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 16px; align-items: start; }
        .ce-grid-eq { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; align-items: start; }
        .ce-grid-auto { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
        .ce-table-wrap { overflow-x: auto; border: 1px solid ${COLORS.line}; border-radius: 14px; background: ${COLORS.surface}; box-shadow: ${COLORS.shadow}; }
        .ce-table { width: 100%; border-collapse: collapse; min-width: 680px; font-size: 13px; }
        .ce-table th { text-align: left; font-weight: 600; font-size: 12px; color: ${COLORS.inkMuted}; padding: 12px 16px; background: ${COLORS.panel2}; white-space: nowrap; }
        .ce-table td { padding: 13px 16px; border-top: 1px solid ${COLORS.line}; vertical-align: middle; }
        .ce-table tbody tr:hover { background: ${COLORS.panel2}; }
        .ce-modal-back { position: fixed; inset: 0; z-index: 100; background: rgba(16,24,40,.5); display: flex; align-items: center; justify-content: center; padding: 20px; animation: ceFadeIn .15s ease; }
        .ce-modal { width: 100%; max-width: 420px; background: ${COLORS.surface}; border: 1px solid ${COLORS.line}; border-radius: 16px; padding: 22px; box-shadow: 0 24px 60px rgba(16,24,40,.3); }
        .ce-menu { position: absolute; top: 48px; right: 0; width: 320px; max-width: calc(100vw - 28px); background: ${COLORS.surface}; border: 1px solid ${COLORS.line}; border-radius: 14px; box-shadow: 0 16px 40px rgba(16,24,40,.16); z-index: 60; overflow: hidden; }
        .ce-menu-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 14px; border: none; background: none; font-size: 13.5px; font-weight: 500; text-align: left; border-radius: 0; }
        .ce-menu-item:hover { background: ${COLORS.panel2}; }
        .ce-overlay { display: none; }
        .ce-table td[data-label]::before { content: none; }
        .ce-only-mobile { display: none !important; }
        @media (max-width: 980px) { .ce-grid-2, .ce-grid-eq { grid-template-columns: minmax(0, 1fr); } }
        @media (max-width: 880px) {
          .ce-sidebar { position: fixed; left: 0; top: 0; bottom: 0; width: 280px !important; transform: translateX(-100%); box-shadow: 0 0 40px rgba(16,24,40,.25); }
          .ce-sidebar.open { transform: none; }
          .ce-sidebar.collapsed .lbl, .ce-sidebar.collapsed .ce-nav-group { opacity: 1; width: auto; }
          .ce-overlay { display: block; position: fixed; inset: 0; z-index: 45; background: rgba(16,24,40,.45); }
          .ce-topbar { padding: 0 14px; gap: 8px; }
          .ce-main { padding: 20px 14px 56px; }
          .ce-table { min-width: 0; }
          .ce-table thead { display: none; }
          .ce-table tbody tr { display: block; padding: 12px 14px; border-top: 1px solid ${COLORS.line}; }
          .ce-table tbody tr:first-child { border-top: none; }
          .ce-table td { display: flex; justify-content: space-between; align-items: center; gap: 14px; border: none; padding: 5px 0; text-align: right !important; max-width: none !important; }
          .ce-table td[data-label]::before { content: attr(data-label); color: ${COLORS.inkMuted}; font-weight: 600; font-size: 12px; text-align: left; flex-shrink: 0; }
          .ce-only-desktop { display: none !important; }
          .ce-only-mobile { display: inline-flex !important; }
          .ce-hide-sm { display: none !important; }
        }
        @media (prefers-reduced-motion: reduce) { .ce-app *, .ce-app *::before, .ce-app *::after { animation: none !important; transition: none !important; } }
      `}</style>

      {!entered ? (
        // ------------------------------ WELCOME ------------------------------
        <div style={{ minHeight: "100vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 20px", position: "relative", background: theme === "dark" ? COLORS.bg : `linear-gradient(180deg, #EEF2FF 0%, ${COLORS.bg} 55%)` }}>
          <Button variant="secondary" size="sm" icon={theme === "dark" ? Sun : Moon} onClick={toggleTheme} style={{ position: "absolute", top: 20, right: 20 }}>{theme === "dark" ? "Light mode" : "Dark mode"}</Button>
          <Card pad={32} style={{ width: "100%", maxWidth: 440, textAlign: "center", boxShadow: "0 24px 60px rgba(16,24,40,.12)" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: `linear-gradient(135deg, #4F46E5, #8B5CF6)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
              <Building2 size={28} color="#fff" />
            </div>
            <h1 style={{ margin: "0 0 6px", fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em" }}>CampusEase</h1>
            <p style={{ fontSize: 15, fontWeight: 600, color: COLORS.teal, margin: "0 0 14px" }}>{CAMPUS.slogan}</p>
            <p style={{ fontSize: 14, color: COLORS.inkMuted, lineHeight: 1.6, margin: "0 0 24px" }}>
              Live status of charging, WiFi, washrooms, water coolers and teacher cabins at <strong style={{ color: COLORS.ink }}>{CAMPUS.name}</strong>.
            </p>
            <div style={{ textAlign: "left", marginBottom: 16 }}>
              <Field label="What should we call you?" hint="Optional. Only used for your greeting.">
                <input className="ce-input" placeholder="Your first name" value={userName} onChange={(e) => saveName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") setEntered(true); }} />
              </Field>
            </div>
            <Button style={{ width: "100%", minHeight: 46, fontSize: 14.5 }} onClick={() => setEntered(true)}>Enter CampusEase</Button>
          </Card>
        </div>
      ) : (
        <>
          {/* ------------------------------ SIDEBAR ------------------------------ */}
          {drawer && <div className="ce-overlay" onClick={() => setDrawer(false)} />}
          <aside className={`ce-sidebar ${collapsed ? "collapsed" : ""} ${drawer ? "open" : ""}`} aria-label="Primary">
            <div className="ce-brand">
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #4F46E5, #8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Building2 size={19} color="#fff" />
              </div>
              <div className="lbl" style={{ minWidth: 0, transition: "opacity .15s", overflow: "hidden", whiteSpace: "nowrap", opacity: collapsed ? 0 : 1 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em" }}>CampusEase</p>
                <p style={{ margin: 0, fontSize: 11.5, color: COLORS.inkMuted }}>JAIN Global Campus</p>
              </div>
            </div>
            <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
              {NAV.map((g) => (
                <div key={g.group}>
                  <p className="ce-nav-group">{g.group}</p>
                  {g.items.map((it) => navItem(it, screen === it.id, () => go(it.id)))}
                </div>
              ))}
              {staffOk && (
                <div>
                  <p className="ce-nav-group">Staff</p>
                  {STAFF_NAV.map((it) => navItem(it, screen === "admin" && staffTab === it.tab, () => goStaff(it.tab)))}
                </div>
              )}
            </nav>
            <div style={{ paddingTop: 12, borderTop: `1px solid ${COLORS.line}`, marginTop: 12 }}>
              <button className="ce-btn ce-nav-item" onClick={toggleTheme} title={theme === "dark" ? "Light mode" : "Dark mode"}>
                {theme === "dark" ? <Sun size={18} style={{ flexShrink: 0 }} /> : <Moon size={18} style={{ flexShrink: 0 }} />}<span className="lbl">{theme === "dark" ? "Light mode" : "Dark mode"}</span>
              </button>
            </div>
          </aside>

          <div className="ce-content">
            {/* ------------------------------ TOP BAR ------------------------------ */}
            <header className="ce-topbar">
              <button className="ce-btn ce-only-mobile" aria-label="Open menu" onClick={() => setDrawer(true)} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center", border: `1px solid ${COLORS.line}`, background: COLORS.surface, borderRadius: 10 }}><Menu size={18} /></button>
              <button className="ce-btn ce-only-desktop" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setCollapsed(!collapsed)} style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${COLORS.line}`, background: COLORS.surface, borderRadius: 10 }}>
                {collapsed ? <PanelLeftOpen size={18} color={COLORS.inkMuted} /> : <PanelLeftClose size={18} color={COLORS.inkMuted} />}
              </button>

              <div style={{ position: "relative", flex: 1, maxWidth: 480 }}>
                <Search size={16} color={COLORS.inkMuted} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input className="ce-input" aria-label="Search" style={{ paddingLeft: 38, height: 42, background: COLORS.panel2, borderColor: "transparent" }} placeholder="Search campus" value={searchQ}
                  onChange={(e) => { setSearchQ(e.target.value); setSearchOpen(true); setMenu(null); }} onFocus={() => setSearchOpen(true)} />
                {searchOpen && searchResults && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 55 }} onClick={() => setSearchOpen(false)} />
                    <div className="ce-menu ce-pop" style={{ left: 0, right: "auto", width: "100%", minWidth: 280, maxHeight: 420, overflowY: "auto", padding: 6, top: 48 }}>
                      {searchResults.facilities.length === 0 && searchResults.teachers.length === 0 && (
                        <p style={{ margin: 0, padding: 14, fontSize: 13, color: COLORS.inkMuted }}>No matches for "{searchQ}". Try "wifi", "Core" or a teacher's name.</p>
                      )}
                      {searchResults.facilities.length > 0 && <p style={{ margin: "6px 10px 4px", fontSize: 11.5, fontWeight: 600, color: COLORS.inkFaint }}>Facilities</p>}
                      {searchResults.facilities.map((f) => {
                        const Ic = TYPE_META[f.type].icon;
                        return (
                          <button key={f.id} className="ce-btn ce-menu-item" style={{ borderRadius: 10 }} onClick={() => { setSearchQ(""); go(TYPE_SCREEN[f.type]); }}>
                            <span style={{ width: 30, height: 30, borderRadius: 9, background: statusBg(f.status), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ic size={15} color={statusColor(f.status)} /></span>
                            <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: 13, fontWeight: 600 }}>{TYPE_META[f.type].noun}, {f.name}</span><span style={{ display: "block", fontSize: 11.5, color: COLORS.inkMuted }}>{f.floor}</span></span>
                            <Pill status={f.status}>{TYPE_META[f.type].labels[f.status]}</Pill>
                          </button>
                        );
                      })}
                      {searchResults.teachers.length > 0 && <p style={{ margin: "8px 10px 4px", fontSize: 11.5, fontWeight: 600, color: COLORS.inkFaint }}>Teachers</p>}
                      {searchResults.teachers.map((t) => (
                        <button key={t.id} className="ce-btn ce-menu-item" style={{ borderRadius: 10 }} onClick={() => { setSearchQ(""); setOpenTeacherMap(t.id); go("teachers"); }}>
                          <span style={{ width: 30, height: 30, borderRadius: 9, background: COLORS.tealBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><User size={15} color={COLORS.teal} /></span>
                          <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: 13, fontWeight: 600 }}>{t.name}</span><span style={{ display: "block", fontSize: 11.5, color: COLORS.inkMuted }}>{t.dept} · {t.floor}, {t.room}</span></span>
                          <Navigation size={14} color={COLORS.teal} />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div style={{ flex: 1 }} />
              <span className="ce-hide-sm"><Tag tone={staffOk ? "primary" : "neutral"}>{roleLabel} view</Tag></span>

              <div style={{ position: "relative" }}>
                <button className="ce-btn" aria-label={`Notifications, ${counts.flagged} out of order`} aria-expanded={menu === "notif"} onClick={() => { setMenu(menu === "notif" ? null : "notif"); setSearchOpen(false); }}
                  style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${COLORS.line}`, background: COLORS.surface, borderRadius: 10, position: "relative" }}>
                  <Bell size={18} color={COLORS.inkMuted} />
                  {counts.flagged > 0 && <span style={{ position: "absolute", top: -5, right: -5, minWidth: 18, height: 18, padding: "0 5px", borderRadius: 999, background: COLORS.coral, color: "#fff", fontSize: 10.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${COLORS.surface}` }}>{counts.flagged}</span>}
                </button>
                {menu === "notif" && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 55 }} onClick={() => setMenu(null)} />
                    <div className="ce-menu ce-pop">
                      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${COLORS.line}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>Campus alerts</p>
                        <Tag tone="neutral">{alerts.length} active</Tag>
                      </div>
                      <div style={{ maxHeight: 340, overflowY: "auto" }}>
                        {alerts.length === 0 ? (
                          <p style={{ margin: 0, padding: 20, textAlign: "center", fontSize: 13, color: COLORS.inkMuted }}>All clear. Everything on campus is working.</p>
                        ) : alerts.map((f) => (
                          <button key={f.id} className="ce-btn ce-menu-item" onClick={() => go(TYPE_SCREEN[f.type])}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor(f.status), flexShrink: 0 }} />
                            <span style={{ flex: 1, minWidth: 0 }}>
                              <span style={{ display: "block", fontSize: 13, fontWeight: 600 }}>{TYPE_META[f.type].noun}, {f.name}</span>
                              <span style={{ display: "block", fontSize: 11.5, color: COLORS.inkMuted }}>{f.floor} · {TYPE_META[f.type].labels[f.status]} · {formatRelative(f.updatedAt, now)}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div style={{ position: "relative" }}>
                <button className="ce-btn" aria-label="Account menu" aria-expanded={menu === "account"} onClick={() => { setMenu(menu === "account" ? null : "account"); setSearchOpen(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 8px 3px 3px", border: `1px solid ${COLORS.line}`, background: COLORS.surface, borderRadius: 999, height: 40 }}>
                  <span style={{ width: 32, height: 32, borderRadius: "50%", background: staffOk ? "linear-gradient(135deg, #4F46E5, #8B5CF6)" : COLORS.tealBg, color: staffOk ? "#fff" : COLORS.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12.5, fontWeight: 700 }}>{initialsOf(staffOk ? STAFF_PROFILE.name : userName)}</span>
                  <ChevronDown size={14} color={COLORS.inkMuted} />
                </button>
                {menu === "account" && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 55 }} onClick={() => setMenu(null)} />
                    <div className="ce-menu ce-pop" style={{ width: 264 }}>
                      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${COLORS.line}` }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>{staffOk ? STAFF_PROFILE.name : (userName.trim() || "Guest")}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.inkMuted }}>{staffOk ? `${STAFF_PROFILE.role} · Staff` : "Student view"}</p>
                      </div>
                      <div style={{ padding: "6px 0" }}>
                        <button className="ce-btn ce-menu-item" onClick={() => { toggleTheme(); setMenu(null); }}>{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}{theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}</button>
                        {staffOk ? (
                          <>
                            <button className="ce-btn ce-menu-item" onClick={() => goStaff("overview")}><ShieldCheck size={16} />Staff dashboard</button>
                            <button className="ce-btn ce-menu-item" onClick={exitStaff}><LogOut size={16} />Exit staff mode</button>
                          </>
                        ) : (
                          <button className="ce-btn ce-menu-item" onClick={() => goStaff("overview")}><ShieldCheck size={16} />Staff sign-in</button>
                        )}
                        <button className="ce-btn ce-menu-item" onClick={() => { setEntered(false); closeOverlays(); }}><HomeIcon size={16} />Back to welcome page</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </header>

            <main className="ce-main">
              {!data && (
                <div aria-busy="true" aria-label="Loading">
                  <Skeleton h={30} w={260} style={{ marginBottom: 10 }} /><Skeleton h={14} w={180} style={{ marginBottom: 26 }} />
                  <div className="ce-grid-kpi" style={{ marginBottom: 16 }}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} h={110} r={14} />)}</div>
                  <div className="ce-grid-2"><Skeleton h={300} r={14} /><Skeleton h={300} r={14} /></div>
                </div>
              )}

              {/* ------------------------------ DASHBOARD ------------------------------ */}
              {data && screen === "home" && (
                <div className="ce-fade">
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 22 }}>
                    <div>
                      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>{greeting}{firstName ? `, ${firstName}` : ""}</h1>
                      <p style={{ margin: "5px 0 0", fontSize: 14, color: COLORS.inkMuted }}>{new Date(now).toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" })} · {CAMPUS.name}</p>
                    </div>
                    <Button icon={Plus} onClick={() => goReport("")}>Report issue</Button>
                  </div>

                  {nearestFreeCharging && (
                    <button className="ce-btn ce-card-hover" onClick={() => go("charging")} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 12, background: COLORS.tealBg, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: "12px 16px", marginBottom: 16 }}>
                      <Zap size={17} color={COLORS.teal} />
                      <p style={{ margin: 0, fontSize: 13.5, flex: 1, color: COLORS.ink }}>Nearest free charging bay: <strong>{nearestFreeCharging.name}</strong>, {nearestFreeCharging.floor}</p>
                      <ChevronRight size={16} color={COLORS.teal} />
                    </button>
                  )}

                  <div className="ce-grid-kpi ce-stagger" style={{ marginBottom: 16 }}>
                    <Kpi label="Working" value={counts.ok} icon={CheckCircle2} tone="ok" hint={`of ${counts.total} campus spots`} />
                    <Kpi label="Needs attention" value={counts.watch} icon={AlertCircle} tone="watch" hint="Low stock, weak signal or due cleaning" />
                    <Kpi label="Out of order" value={counts.flagged} icon={X} tone="flagged" hint="Staff have been notified" />
                    <Kpi label="Open reports" value={openQueue.length} icon={Flag} tone="primary" hint={`${insights.resolvedCount} resolved so far`} />
                  </div>

                  <div className="ce-grid-2" style={{ marginBottom: 16 }}>
                    <Card>
                      <SectionTitle hint="Live status of every spot, by block">Campus health by block</SectionTitle>
                      <div style={{ height: 250 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={byBlock} margin={{ top: 4, right: 8, left: -18, bottom: 0 }} barSize={34}>
                            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} vertical={false} />
                            <XAxis dataKey="name" tick={axisTick} axisLine={{ stroke: COLORS.line }} tickLine={false} />
                            <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
                            <Tooltip {...chartTip} />
                            <Bar dataKey="Working" stackId="s" fill={COLORS.ok} />
                            <Bar dataKey="Needs attention" stackId="s" fill={COLORS.amberFill} />
                            <Bar dataKey="Out of order" stackId="s" fill={COLORS.coral} radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>
                    <Card>
                      <SectionTitle hint="Share of all spots">Overall health</SectionTitle>
                      <div style={{ height: 170, position: "relative" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={donutData} dataKey="value" innerRadius={52} outerRadius={78} paddingAngle={3} stroke="none">
                              {donutData.map((d) => <Cell key={d.name} fill={d.color} />)}
                            </Pie>
                            <Tooltip {...chartTip} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                          <span style={{ fontSize: 26, fontWeight: 700, lineHeight: 1 }}>{counts.total ? Math.round((counts.ok / counts.total) * 100) : 0}%</span>
                          <span style={{ fontSize: 11.5, color: COLORS.inkMuted, marginTop: 3 }}>working</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 8 }}>
                        {donutData.map((d) => (
                          <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                            <span style={{ width: 9, height: 9, borderRadius: 3, background: d.color }} /><span style={{ flex: 1, color: COLORS.inkMuted }}>{d.name}</span><strong>{d.value}</strong>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  <SectionTitle>Quick actions</SectionTitle>
                  <div className="ce-grid-kpi ce-stagger" style={{ marginBottom: 22 }}>
                    {[
                      { label: "Report an issue", sub: "Flag something broken", icon: Flag, run: () => goReport("") },
                      { label: "Scan a QR code", sub: "Check a water cooler", icon: Camera, run: () => go("scan") },
                      { label: "Find a teacher", sub: "Cabin with directions", icon: GraduationCap, run: () => go("teachers") },
                      { label: "Reserve charging", sub: "Book a bay ahead", icon: Clock, run: () => go("reserve") },
                    ].map((a) => {
                      const Ic = a.icon;
                      return (
                        <button key={a.label} className="ce-btn ce-card-hover" onClick={a.run} style={{ textAlign: "left", display: "flex", alignItems: "center", gap: 12, padding: 14, background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 14, boxShadow: COLORS.shadow }}>
                          <span style={{ width: 40, height: 40, borderRadius: 11, background: COLORS.tealBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ic size={19} color={COLORS.teal} /></span>
                          <span><span style={{ display: "block", fontSize: 14, fontWeight: 600 }}>{a.label}</span><span style={{ display: "block", fontSize: 12, color: COLORS.inkMuted }}>{a.sub}</span></span>
                        </button>
                      );
                    })}
                  </div>

                  <SectionTitle hint="Tap a service to see it block by block">Campus services</SectionTitle>
                  <div className="ce-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16, marginBottom: 22 }}>
                    {SERVICE_TILES.map((t) => {
                      const Ic = t.icon;
                      const list = facilities.filter((f) => f.type === t.type);
                      const bad = list.filter((f) => f.status !== "ok").length;
                      return (
                        <button key={t.id} className="ce-btn ce-card-hover" onClick={() => go(t.id)} style={{ textAlign: "left", padding: 16, background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 14, boxShadow: COLORS.shadow, display: "flex", flexDirection: "column", gap: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ width: 40, height: 40, borderRadius: 11, background: COLORS.tealBg, display: "flex", alignItems: "center", justifyContent: "center" }}><Ic size={19} color={COLORS.teal} /></span>
                            <Pill status={bad ? "watch" : "ok"}>{bad ? `${bad} issue${bad > 1 ? "s" : ""}` : "All good"}</Pill>
                          </div>
                          <div><p style={{ margin: 0, fontSize: 14.5, fontWeight: 600 }}>{t.label}</p><p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.inkMuted }}>{list.length} spots across {FLOORS.length} blocks</p></div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="ce-grid-eq">
                    <Card>
                      <SectionTitle right={<Button variant="ghost" size="sm" onClick={() => go("report")}>New report</Button>}>Recent activity</SectionTitle>
                      {activityList(6)}
                    </Card>
                    <Card>
                      <SectionTitle right={<Tag tone="sample">Sample data</Tag>}>Announcements and events</SectionTitle>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        {SAMPLE_ANNOUNCEMENTS.map((a, i) => (
                          <div key={a.id} style={{ display: "flex", gap: 12, padding: "11px 0", borderTop: i ? `1px solid ${COLORS.line}` : "none" }}>
                            <span style={{ width: 30, height: 30, borderRadius: 9, background: COLORS.tealBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Megaphone size={14} color={COLORS.teal} /></span>
                            <div style={{ minWidth: 0 }}><p style={{ margin: 0, fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{a.title}</p><p style={{ margin: "2px 0 0", fontSize: 11.5, color: COLORS.inkMuted }}>{a.tag} · {a.when}</p></div>
                          </div>
                        ))}
                        <p style={{ margin: "14px 0 6px", fontSize: 12, fontWeight: 600, color: COLORS.inkMuted }}>Upcoming events</p>
                        {SAMPLE_EVENTS.map((e) => (
                          <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                            <span style={{ width: 44, textAlign: "center", fontSize: 11.5, fontWeight: 700, color: COLORS.teal, background: COLORS.tealBg, borderRadius: 8, padding: "5px 0" }}>{e.date}</span>
                            <span style={{ fontSize: 13 }}>{e.title}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {/* ------------------------------ FACILITY SCREENS ------------------------------ */}
              {data && (screen === "charging" || screen === "vending" || screen === "washroom" || screen === "wifi") && (
                <Screen title={TYPE_META[screen].noun + "s"} subtitle="Pick a block to see what's available right now." onBack={goHome} onReport={() => goReport("")}>
                  <BlockBrowser facilities={facilities.filter((f) => f.type === screen)} now={now} block={block} setBlock={setBlock} onRowClick={(f) => goReport(f.id)} labels={TYPE_META[screen].labels} />
                </Screen>
              )}

              {data && screen === "water" && (
                <Screen title="Water coolers" subtitle="When each cooler was last cleaned." onBack={goHome} onReport={() => goReport("")} actions={<Button variant="secondary" icon={Camera} onClick={() => go("scan")}>Scan a cooler's QR</Button>}>
                  <BlockBrowser facilities={facilities.filter((f) => f.type === "watercooler")} now={now} block={block} setBlock={setBlock} onRowClick={(f) => goReport(f.id)} labels={TYPE_META.watercooler.labels} />
                </Screen>
              )}

              {/* ------------------------------ TEACHERS ------------------------------ */}
              {data && screen === "teachers" && (
                <Screen title="Find a teacher" subtitle="Search by name, department or room, then follow the floor-plan directions." onBack={goHome}>
                  <div style={{ position: "relative", marginBottom: 22, maxWidth: 440 }}>
                    <Search size={15} color={COLORS.inkMuted} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
                    <input className="ce-input" aria-label="Search teachers" style={{ paddingLeft: 38 }} placeholder="Search teachers" value={teacherQuery} onChange={(e) => setTeacherQuery(e.target.value)} />
                  </div>
                  {visibleTeachers.length === 0 && <EmptyState icon={Search} title="No teachers found" body={`Nothing matches "${teacherQuery}". Try a department or room number.`} action={<Button variant="secondary" onClick={() => setTeacherQuery("")}>Clear search</Button>} />}
                  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    {FLOORS.map((fl) => {
                      const items = visibleTeachers.filter((t) => t.floor === fl);
                      if (items.length === 0) return null;
                      return (
                        <div key={fl}>
                          <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: COLORS.inkMuted }}>{fl}</p>
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {items.map((t) => {
                              const open = openTeacherMap === t.id;
                              return (
                                <Card key={t.id} pad={0} style={{ overflow: "hidden" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", flexWrap: "wrap" }}>
                                    <span style={{ width: 42, height: 42, borderRadius: "50%", background: COLORS.tealBg, color: COLORS.teal, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{initialsOf(t.name.replace(/^(Dr\.|Prof\.)\s*/, ""))}</span>
                                    <div style={{ flex: 1, minWidth: 160 }}>
                                      <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600 }}>{t.name}</p>
                                      <p style={{ margin: "2px 0 0", fontSize: 12.5, color: COLORS.inkMuted }}>{t.dept} · {t.room}</p>
                                    </div>
                                    <Button variant={open ? "soft" : "secondary"} size="sm" icon={Navigation} onClick={() => setOpenTeacherMap(open ? null : t.id)} aria-expanded={open}>{open ? "Hide directions" : "Directions"}</Button>
                                  </div>
                                  {open && (
                                    <div style={{ padding: "4px 16px 18px", borderTop: `1px solid ${COLORS.line}`, paddingTop: 16 }}>
                                      <IndoorMap teacher={t} />
                                    </div>
                                  )}
                                </Card>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Screen>
              )}

              {/* ------------------------------ SCAN ------------------------------ */}
              {data && screen === "scan" && (
                <Screen title="Scan QR" subtitle="Point your camera at a water cooler's sticker." onBack={goHome}>
                  {!scanResult ? (
                    <div style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 16 }}>
                      {!scanning && <Button icon={Camera} onClick={startScanning} style={{ minHeight: 48, fontSize: 14.5 }}>Start camera</Button>}
                      {scanning && (
                        <div>
                          <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", border: `1px solid ${COLORS.line}`, background: "#000" }}>
                            <video ref={videoRef} playsInline muted style={{ width: "100%", display: "block", maxHeight: 380, objectFit: "cover" }} />
                            <div style={{ position: "absolute", inset: "18%", border: "3px solid #fff", borderRadius: 18, boxShadow: "0 0 0 999px rgba(0,0,0,.35)", pointerEvents: "none" }} />
                          </div>
                          <Button variant="secondary" onClick={stopScanning} style={{ width: "100%", marginTop: 10 }}>Cancel</Button>
                        </div>
                      )}
                      {scanError && (
                        <div role="alert" style={{ display: "flex", gap: 10, alignItems: "flex-start", background: COLORS.coralBg, borderRadius: 12, padding: 14 }}>
                          <AlertCircle size={16} color={COLORS.coral} style={{ flexShrink: 0, marginTop: 1 }} />
                          <p style={{ margin: 0, fontSize: 13, color: COLORS.ink, lineHeight: 1.5 }}>{scanError}</p>
                        </div>
                      )}
                      <Card>
                        <p style={{ margin: "0 0 12px", fontSize: 13.5, fontWeight: 600 }}>No camera handy?</p>
                        <Field label="Pick a cooler manually">
                          <select className="ce-select" value={manualCooler} onChange={(e) => setManualCooler(e.target.value)}>
                            <option value="">Select a water cooler</option>
                            {facilities.filter((f) => f.type === "watercooler").map((f) => <option key={f.id} value={f.id}>{f.floor}, {f.name}</option>)}
                          </select>
                        </Field>
                        <Button variant="secondary" disabled={!manualCooler} onClick={() => { const f = facility(manualCooler); if (f) setScanResult(f); }} style={{ marginTop: 12, width: "100%" }}>View status</Button>
                      </Card>
                    </div>
                  ) : (
                    <div className="ce-fade" style={{ maxWidth: 440 }}>
                      <Card style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                          <p style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{scanResult.name}</p>
                          <Pill status={scanResult.status}>{TYPE_META[scanResult.type].labels[scanResult.status]}</Pill>
                        </div>
                        <p style={{ margin: 0, fontSize: 13, color: COLORS.inkMuted }}>{scanResult.floor}</p>
                        <p style={{ margin: "14px 0 0", fontSize: 14, display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: COLORS.tealBg, borderRadius: 10 }}>
                          <Droplets size={16} color={COLORS.teal} /> Last cleaned <strong>{formatRelative(scanResult.lastCleaned, now)}</strong>
                        </p>
                      </Card>
                      <div style={{ display: "flex", gap: 10 }}>
                        <Button variant="secondary" style={{ flex: 1 }} onClick={() => { setScanResult(null); setManualCooler(""); }}>Scan another</Button>
                        <Button variant="danger" icon={Flag} style={{ flex: 1 }} onClick={() => goReport(scanResult.id)}>Report an issue</Button>
                      </div>
                    </div>
                  )}
                </Screen>
              )}

              {/* ------------------------------ REPORT ------------------------------ */}
              {data && screen === "report" && (
                <Screen title="Report an issue" subtitle="Flag something that needs staff attention." onBack={goHome}>
                  <Card style={{ maxWidth: 520 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                      <Field label="Facility" error={reportErrors.facility}>
                        <select className={`ce-select ${reportErrors.facility ? "ce-invalid" : ""}`} value={reportFacility} onChange={(e) => { setReportFacility(e.target.value); setReportErrors({ ...reportErrors, facility: undefined }); }}>
                          <option value="">Select a facility</option>
                          {FLOORS.map((fl) => (
                            <optgroup key={fl} label={fl}>
                              {facilities.filter((f) => f.floor === fl).map((f) => <option key={f.id} value={f.id}>{TYPE_META[f.type].noun}, {f.name}</option>)}
                            </optgroup>
                          ))}
                        </select>
                      </Field>
                      <Field label="What's wrong?" error={reportErrors.note} hint="One or two sentences is plenty.">
                        <textarea className={`ce-textarea ${reportErrors.note ? "ce-invalid" : ""}`} rows={5} placeholder="The machine isn't dispensing snacks" value={reportNote} onChange={(e) => { setReportNote(e.target.value); setReportErrors({ ...reportErrors, note: undefined }); }} style={{ resize: "vertical" }} />
                      </Field>
                      <Button variant="danger" icon={Flag} onClick={submitReport} style={{ alignSelf: "flex-start" }}>Flag this</Button>
                    </div>
                  </Card>
                </Screen>
              )}

              {/* ------------------------------ RESERVE ------------------------------ */}
              {data && screen === "reserve" && (
                <Screen title="Reserve charging" subtitle="Book a free bay ahead of your next class." onBack={goHome} onReport={() => goReport("")}>
                  <div className="ce-grid-eq">
                    <Card>
                      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                        <Field label="Charging bay" error={reserveErrors.bay}>
                          <select className={`ce-select ${reserveErrors.bay ? "ce-invalid" : ""}`} value={reserveFacility} onChange={(e) => { setReserveFacility(e.target.value); setReserveErrors({ ...reserveErrors, bay: undefined }); }}>
                            <option value="">Select a charging bay</option>
                            {chargingFacilities.map((f) => <option key={f.id} value={f.id}>{f.floor}, {f.name}</option>)}
                          </select>
                        </Field>
                        <Field label="Time slot" error={reserveErrors.slot}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {slots.map((s) => (
                              <Button key={s} size="sm" variant={reserveSlot === s ? "soft" : "secondary"} onClick={() => { setReserveSlot(s); setReserveErrors({ ...reserveErrors, slot: undefined }); }} style={{ borderColor: reserveSlot === s ? COLORS.teal : COLORS.line, fontVariantNumeric: "tabular-nums" }}>{s}</Button>
                            ))}
                          </div>
                        </Field>
                        <Button icon={Clock} onClick={submitReservation} style={{ alignSelf: "flex-start" }}>Reserve slot</Button>
                      </div>
                    </Card>
                    <Card>
                      <SectionTitle>Your reservations</SectionTitle>
                      {reservations.length === 0 ? (
                        <EmptyState icon={Clock} title="Nothing booked yet" body="Pick a bay and a time slot to reserve your spot." />
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {reservations.map((r) => (
                            <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: COLORS.panel2, borderRadius: 10, padding: "10px 12px" }}>
                              <div><p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{facilityName(r.facilityId)}</p><p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.inkMuted, fontVariantNumeric: "tabular-nums" }}>{r.slot}</p></div>
                              <Button variant="ghost" size="sm" aria-label="Cancel reservation" icon={X} onClick={() => setConfirm({ kind: "cancelRes", id: r.id })} />
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  </div>
                </Screen>
              )}

              {/* ------------------------------ STAFF: SIGN-IN ------------------------------ */}
              {data && screen === "admin" && !staffOk && (
                <Screen title="Staff sign-in" subtitle="This area is for campus staff only." onBack={goHome}>
                  <Card style={{ maxWidth: 400 }}>
                    <form onSubmit={(e) => { e.preventDefault(); if (pinInput === STAFF_PIN) { setStaffOk(true); setPinError(""); setPinInput(""); showToast("ok", "Welcome to the staff dashboard."); } else setPinError("That PIN isn't right. Check it and try again."); }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: COLORS.tealBg, display: "flex", alignItems: "center", justifyContent: "center" }}><ShieldCheck size={21} color={COLORS.teal} /></div>
                      <Field label="Staff PIN" error={pinError}>
                        <input className={`ce-input ${pinError ? "ce-invalid" : ""}`} type="password" autoFocus placeholder="Enter your PIN" value={pinInput} onChange={(e) => { setPinInput(e.target.value); setPinError(""); }} />
                      </Field>
                      <Button type="submit">Sign in</Button>
                    </form>
                  </Card>
                </Screen>
              )}

              {/* ------------------------------ STAFF PORTAL ------------------------------ */}
              {data && screen === "admin" && staffOk && (
                <Screen title="Staff portal" subtitle="Manage issues, cleaning, QR codes and campus trends." onBack={goHome}>
                  <Tabs value={staffTab} onChange={setStaffTab} tabs={[{ id: "overview", label: "Overview" }, { id: "issues", label: `Issue queue${openQueue.length ? ` (${openQueue.length})` : ""}` }, { id: "qr", label: "QR codes" }, { id: "insights", label: "Insights" }]} />

                  {staffTab === "overview" && (
                    <div className="ce-fade">
                      <Card style={{ marginBottom: 16, background: theme === "dark" ? COLORS.surface : "linear-gradient(135deg, #4F46E5, #8B5CF6)", border: theme === "dark" ? undefined : "none", color: "#fff" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                          <span style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,.2)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, fontWeight: 700, flexShrink: 0 }}>{initialsOf(STAFF_PROFILE.name)}</span>
                          <div style={{ flex: 1, minWidth: 200 }}>
                            <p style={{ margin: 0, fontSize: 21, fontWeight: 700, letterSpacing: "-0.01em", color: "#fff" }}>{greeting}, {STAFF_PROFILE.name}</p>
                            <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "rgba(255,255,255,.82)" }}>{STAFF_PROFILE.role} · {STAFF_PROFILE.dept} · ID {STAFF_PROFILE.id}</p>
                          </div>
                          <Tag tone="sample">Sample profile</Tag>
                        </div>
                      </Card>

                      <div className="ce-grid-kpi ce-stagger" style={{ marginBottom: 16 }}>
                        <Kpi label="Open issues" value={openQueue.length} icon={Flag} tone={openQueue.length ? "flagged" : "ok"} hint={openQueue.length ? "Needs your attention" : "Queue is clear"} />
                        <Kpi label="Avg. resolve time" value={insights.avgMins !== null ? `${insights.avgMins}m` : "n/a"} icon={Clock} tone="primary" hint={`${insights.resolvedCount} resolved`} />
                        <Kpi label="Coolers due cleaning" value={dueCoolers.length} icon={Droplets} tone={dueCoolers.length ? "watch" : "ok"} hint="Not cleaned in 24 hours" />
                        <Kpi label="Campus working" value={`${counts.total ? Math.round((counts.ok / counts.total) * 100) : 0}%`} icon={CheckCircle2} tone="ok" hint={`${counts.ok} of ${counts.total} spots`} />
                      </div>

                      <div className="ce-grid-2" style={{ marginBottom: 16 }}>
                        <Card>
                          <SectionTitle hint="Open reports and cleaning due" right={<Button variant="ghost" size="sm" onClick={() => setStaffTab("issues")}>View all</Button>}>Pending tasks</SectionTitle>
                          {openQueue.length + dueCoolers.length === 0 ? (
                            <EmptyState icon={CheckCircle2} title="You're all caught up" body="No open issues and every cooler is freshly cleaned." />
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              {openQueue.map((r, i) => (
                                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: i ? `1px solid ${COLORS.line}` : "none", flexWrap: "wrap" }}>
                                  <span style={{ width: 32, height: 32, borderRadius: 9, background: COLORS.coralBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Flag size={15} color={COLORS.coral} /></span>
                                  <div style={{ flex: 1, minWidth: 160 }}><p style={{ margin: 0, fontSize: 13.5, fontWeight: 600 }}>{facilityName(r.facilityId)}</p><p style={{ margin: "2px 0 0", fontSize: 12.5, color: COLORS.inkMuted }}>{r.note} · {formatRelative(r.timestamp, now)}</p></div>
                                  <Button size="sm" variant="secondary" icon={CheckCircle2} onClick={() => setConfirm({ kind: "resolve", id: r.id })}>Resolve</Button>
                                </div>
                              ))}
                              {dueCoolers.map((f, i) => (
                                <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: openQueue.length + i ? `1px solid ${COLORS.line}` : "none", flexWrap: "wrap" }}>
                                  <span style={{ width: 32, height: 32, borderRadius: 9, background: COLORS.amberBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Droplets size={15} color={COLORS.amber} /></span>
                                  <div style={{ flex: 1, minWidth: 160 }}><p style={{ margin: 0, fontSize: 13.5, fontWeight: 600 }}>Clean water cooler, {f.name}</p><p style={{ margin: "2px 0 0", fontSize: 12.5, color: COLORS.inkMuted }}>{f.floor} · last cleaned {formatRelative(f.lastCleaned, now)}</p></div>
                                  <Button size="sm" variant="secondary" icon={CheckCircle2} onClick={() => markCleaned(f.id)}>Mark cleaned</Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </Card>
                        <Card>
                          <SectionTitle right={<Tag tone="sample">Sample data</Tag>}>Today's schedule</SectionTitle>
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {SAMPLE_TIMETABLE.map((c) => (
                              <div key={c.id} style={{ display: "flex", gap: 12 }}>
                                <span style={{ width: 46, fontSize: 12.5, fontWeight: 700, color: COLORS.teal, fontVariantNumeric: "tabular-nums", paddingTop: 2 }}>{c.time}</span>
                                <div style={{ flex: 1, paddingLeft: 12, borderLeft: `2px solid ${COLORS.tealBg}` }}>
                                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{c.title}</p>
                                  <p style={{ margin: "1px 0 0", fontSize: 12, color: COLORS.inkMuted }}>{c.place} · {c.group}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card>
                      </div>

                      <div className="ce-grid-eq">
                        <Card>
                          <SectionTitle right={<Tag tone="sample">Sample data</Tag>} hint="Class attendance this week">Attendance</SectionTitle>
                          <div style={{ height: 190 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={SAMPLE_ATTENDANCE} margin={{ top: 4, right: 8, left: -18, bottom: 0 }} barSize={28}>
                                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} vertical={false} />
                                <XAxis dataKey="day" tick={axisTick} axisLine={{ stroke: COLORS.line }} tickLine={false} />
                                <YAxis domain={[60, 100]} tick={axisTick} axisLine={false} tickLine={false} unit="%" />
                                <Tooltip {...chartTip} formatter={(v) => [`${v}%`, "Present"]} />
                                <Bar dataKey="pct" fill={COLORS.teal} radius={[6, 6, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </Card>
                        <Card>
                          <SectionTitle>Recent activity</SectionTitle>
                          {activityList(5)}
                        </Card>
                      </div>

                      <Card style={{ marginTop: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ width: 38, height: 38, borderRadius: 10, background: COLORS.amberBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Sparkles size={17} color={COLORS.amber} /></span>
                            <div><p style={{ margin: 0, fontSize: 13.5, fontWeight: 600 }}>Simulate live activity</p><p style={{ margin: "2px 0 0", fontSize: 12.5, color: COLORS.inkMuted }}>Randomly nudges facility status every few seconds. Handy for demos.</p></div>
                          </div>
                          <Switch on={simulate} onClick={() => setSimulate(!simulate)} label="Simulate live activity" />
                        </div>
                      </Card>
                    </div>
                  )}

                  {staffTab === "issues" && (
                    <div className="ce-fade">
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
                        <select className="ce-select" aria-label="Filter by status" style={{ width: "auto", minWidth: 150 }} value={issueStatus} onChange={(e) => setIssueStatus(e.target.value)}>
                          <option value="open">Open</option><option value="resolved">Resolved</option><option value="all">All statuses</option>
                        </select>
                        <select className="ce-select" aria-label="Filter by block" style={{ width: "auto", minWidth: 170 }} value={issueBlock} onChange={(e) => setIssueBlock(e.target.value)}>
                          <option value="all">All blocks</option>{FLOORS.map((fl) => <option key={fl} value={fl}>{fl}</option>)}
                        </select>
                        <select className="ce-select" aria-label="Sort" style={{ width: "auto", minWidth: 160 }} value={issueSort} onChange={(e) => setIssueSort(e.target.value)}>
                          <option value="oldest">Oldest first</option><option value="newest">Newest first</option><option value="facility">By facility</option>
                        </select>
                      </div>
                      {(() => {
                        const rows = reports
                          .filter((r) => (issueStatus === "all" || r.status === issueStatus) && (issueBlock === "all" || (facility(r.facilityId) || {}).floor === issueBlock))
                          .sort((a, b) => issueSort === "oldest" ? a.timestamp - b.timestamp : issueSort === "newest" ? b.timestamp - a.timestamp : facilityName(a.facilityId).localeCompare(facilityName(b.facilityId)));
                        if (rows.length === 0) return <EmptyState icon={CheckCircle2} title="No issues match" body="Try a different status or block filter." action={<Button variant="secondary" onClick={() => { setIssueStatus("all"); setIssueBlock("all"); }}>Reset filters</Button>} />;
                        return (
                          <div className="ce-table-wrap">
                            <table className="ce-table">
                              <thead><tr><th>Facility</th><th>Block</th><th>Issue</th><th>Reported</th><th>Status</th><th style={{ textAlign: "right" }}>Action</th></tr></thead>
                              <tbody>
                                {rows.map((r) => (
                                  <tr key={r.id}>
                                    <td data-label="Facility" style={{ fontWeight: 600 }}>{facilityName(r.facilityId)}</td>
                                    <td data-label="Block" style={{ color: COLORS.inkMuted }}>{(facility(r.facilityId) || {}).floor || "n/a"}</td>
                                    <td data-label="Issue" style={{ color: COLORS.inkMuted, maxWidth: 260 }}>{r.note}</td>
                                    <td data-label="Reported" style={{ color: COLORS.inkMuted, whiteSpace: "nowrap" }}>{formatRelative(r.timestamp, now)}</td>
                                    <td data-label="Status"><Pill status={r.status === "open" ? "flagged" : "ok"}>{r.status === "open" ? "Open" : "Resolved"}</Pill></td>
                                    <td data-label="Action" style={{ textAlign: "right" }}>{r.status === "open" ? <Button size="sm" variant="secondary" icon={CheckCircle2} onClick={() => setConfirm({ kind: "resolve", id: r.id })}>Resolve</Button> : <span style={{ fontSize: 12, color: COLORS.inkMuted }}>{formatRelative(r.resolvedAt, now)}</span>}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {staffTab === "qr" && (
                    <div className="ce-fade">
                      <p style={{ margin: "0 0 16px", fontSize: 13.5, color: COLORS.inkMuted, maxWidth: 560 }}>Print one code per cooler and stick it on. Scanning opens CampusEase straight to that cooler's cleaning status.</p>
                      <div className="ce-grid-auto">
                        {facilities.filter((f) => f.type === "watercooler").map((f) => {
                          const deepLink = typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}?qr=${f.id}` : `https://example.com/?qr=${f.id}`;
                          const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent(deepLink)}`;
                          return (
                            <Card key={f.id} pad={16} style={{ display: "flex", gap: 14, alignItems: "center" }}>
                              <div style={{ width: 92, height: 92, borderRadius: 12, background: "#fff", padding: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${COLORS.line}` }}>
                                <img src={qrSrc} alt={`QR code for ${f.name}`} width={78} height={78} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{f.name}</p>
                                <p style={{ margin: "2px 0 4px", fontSize: 12, color: COLORS.inkMuted }}>{f.floor}</p>
                                <p style={{ margin: "0 0 10px", fontSize: 12, color: COLORS.inkMuted }}>Cleaned {formatRelative(f.lastCleaned, now)}</p>
                                <Button size="sm" variant="soft" icon={CheckCircle2} onClick={() => markCleaned(f.id)}>Mark cleaned</Button>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {staffTab === "insights" && (
                    <div className="ce-fade">
                      <div className="ce-grid-kpi" style={{ marginBottom: 16 }}>
                        <Kpi label="Open issues" value={insights.openCount} icon={Flag} tone="flagged" />
                        <Kpi label="Avg. resolve time" value={insights.avgMins !== null ? `${insights.avgMins}m` : "n/a"} icon={Clock} tone="primary" />
                        <Kpi label="Resolved" value={insights.resolvedCount} icon={CheckCircle2} tone="ok" />
                        <Card pad={18}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                            <span style={{ fontSize: 13, fontWeight: 500, color: COLORS.inkMuted }}>Most flagged</span>
                            <span style={{ width: 34, height: 34, borderRadius: 10, background: COLORS.amberBg, display: "flex", alignItems: "center", justifyContent: "center" }}><TrendingUp size={17} color={COLORS.amber} /></span>
                          </div>
                          <p style={{ margin: 0, fontSize: 16, fontWeight: 650, lineHeight: 1.3 }}>{insights.topFacility}</p>
                        </Card>
                      </div>
                      <div className="ce-grid-eq">
                        <Card>
                          <SectionTitle hint="Reports by facility type">Where problems happen</SectionTitle>
                          <div style={{ height: 220 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={insights.byType} margin={{ top: 4, right: 8, left: -18, bottom: 0 }} barSize={28}>
                                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} vertical={false} />
                                <XAxis dataKey="name" tick={axisTick} axisLine={{ stroke: COLORS.line }} tickLine={false} />
                                <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
                                <Tooltip {...chartTip} />
                                <Bar dataKey="count" name="Reports" fill={COLORS.coral} radius={[6, 6, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </Card>
                        <Card>
                          <SectionTitle hint="Reports by block">Which blocks need most help</SectionTitle>
                          <div style={{ height: 220 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={insights.byFloor} margin={{ top: 4, right: 8, left: -18, bottom: 0 }} barSize={36}>
                                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} vertical={false} />
                                <XAxis dataKey="name" tick={axisTick} axisLine={{ stroke: COLORS.line }} tickLine={false} />
                                <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
                                <Tooltip {...chartTip} />
                                <Bar dataKey="count" name="Reports" fill={COLORS.teal} radius={[6, 6, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </Card>
                      </div>
                    </div>
                  )}
                </Screen>
              )}
            </main>
          </div>
        </>
      )}

      {confirm && (
        <Modal
          title={confirm.kind === "resolve" ? "Mark this issue as resolved?" : "Cancel this reservation?"}
          body={confirm.kind === "resolve" ? "The facility will be set back to working and the report moves to Resolved." : "The time slot will be released for other students."}
          confirmLabel={confirm.kind === "resolve" ? "Mark resolved" : "Cancel reservation"}
          tone={confirm.kind === "resolve" ? "primary" : "danger"}
          onClose={() => setConfirm(null)}
          onConfirm={() => { if (confirm.kind === "resolve") resolveReport(confirm.id); else cancelReservation(confirm.id); setConfirm(null); }}
        />
      )}

      {toast && (
        <div role="status" className="ce-pop" style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#101828", color: "#fff", padding: "11px 18px", borderRadius: 12, fontSize: 13.5, fontWeight: 500, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 12px 32px rgba(16,24,40,0.35)", zIndex: 120, maxWidth: "calc(100vw - 32px)" }}>
          {toast.kind === "ok" ? <CheckCircle2 size={17} color="#4ADE80" /> : <AlertCircle size={17} color="#F87171" />}{toast.text}
        </div>
      )}
    </div>
  );
}
