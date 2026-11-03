import { useState, useEffect, useMemo, useRef } from "react";
import { Zap, Cookie, Wind, Wifi, Droplets, Flag, Clock, Check, X, CheckCircle2, TrendingUp, Building2, Plus, Moon, Sun, Sparkles, User, GraduationCap, QrCode, Navigation, Camera, ArrowLeft, Home as HomeIcon, ShieldCheck, Search, ChevronRight, ChevronDown, AlertCircle, LayoutDashboard, ClipboardList, BarChart3, Bell, Menu, PanelLeftClose, PanelLeftOpen, LogOut, Megaphone, Inbox, BookOpen, Armchair, Printer, Users, Utensils, Monitor, Map as MapIcon, CalendarDays, Pin, MapPin, Info, Trash2, Newspaper, PackageSearch, MessageSquare, Bus, Settings, UserRound, Lock, LifeBuoy, Palette, BellRing, Shield, Send, Coffee, Heart, Copy } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";

const STORAGE_KEY = "campusease-data-v10";
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

function Screen({ title, subtitle, onBack, onReport, actions, parent, children }) {
  return (
    <div className="ce-fade">
      <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, fontSize: 12.5, color: COLORS.inkMuted, flexWrap: "wrap" }}>
        <button className="ce-btn" onClick={onBack} style={{ background: "none", border: "none", padding: 0, color: COLORS.inkMuted, fontSize: 12.5, fontWeight: 500 }}>Dashboard</button>
        <ChevronRight size={12} />
        {parent && (<><button className="ce-btn" onClick={parent.onClick} style={{ background: "none", border: "none", padding: 0, color: COLORS.inkMuted, fontSize: 12.5, fontWeight: 500 }}>{parent.label}</button><ChevronRight size={12} /></>)}
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

// ---------- Campus content (placeholder text is tagged "Sample" in the UI) ----------
const DAY = 86400000;

function defaultCampusData() {
  const now = Date.now();
  const at = (days, h, m = 0) => { const d = new Date(now + days * DAY); d.setHours(h, m, 0, 0); return d.getTime(); };
  return {
    notices: [
      { id: "n1", sample: true, pinned: true, tag: "Campus", title: "Water cooler QR codes are now live", body: "Scan the sticker on any water cooler to see when it was last cleaned. If something looks wrong, report it from the same page.", ts: now - 2 * 3600000, author: "Campus Office" },
      { id: "n2", sample: true, pinned: false, tag: "Facilities", title: "WiFi upgrade planned for Aerospace Block", body: "Expect short interruptions on the weekend while access points are replaced. The WiFi page shows live signal status per block.", ts: now - 20 * 3600000, author: "IT Services" },
      { id: "n3", sample: true, pinned: false, tag: "Academic", title: "Library reading hall open late during exam weeks", body: "The reading hall will stay open later on weekdays during exam weeks. Check the Library page for current hours.", ts: now - 2 * DAY, author: "Library" },
      { id: "n4", sample: true, pinned: false, tag: "Safety", title: "Reminder: keep walkways clear near the workshop", body: "Please avoid parking bicycles and bags on the walkway near the workshop entrance.", ts: now - 4 * DAY, author: "Campus Office" },
    ],
    events: [
      { id: "e1", sample: true, title: "Tech fest registrations", club: "Coding Club", venue: "Core Block, Seminar Hall", ts: at(3, 10), going: 48, desc: "Sign up for hackathons, quizzes and project demos. Teams of up to four." },
      { id: "e2", sample: true, title: "Open mic evening", club: "Music Society", venue: "Open-air amphitheatre", ts: at(5, 17, 30), going: 72, desc: "Sing, play, recite or just listen. Walk-in slots available on the day." },
      { id: "e3", sample: true, title: "Intro to drones workshop", club: "Robotics & Aero Club", venue: "Aerospace Block, Hangar lab", ts: at(8, 14), going: 30, desc: "Hands-on session on flight basics and safe operation. Limited seats." },
      { id: "e4", sample: true, title: "Annual sports day", club: "Sports Club", venue: "Sports ground", ts: at(14, 9), going: 160, desc: "Track and field, team events and a fun relay. All blocks welcome." },
      { id: "e5", sample: true, title: "Campus photo walk", club: "Photography Club", venue: "Meet at the main gate", ts: at(-6, 16), going: 25, desc: "A relaxed walk around the campus with tips on composition and light." },
    ],
    lostFound: [
      { id: "l1", sample: true, kind: "found", item: "Black water bottle", desc: "Steel bottle with a blue cap, left near the library entrance.", location: "Library entrance", ts: now - 5 * 3600000, status: "open", contact: "Hand-in at the front desk" },
      { id: "l2", sample: true, kind: "lost", item: "Blue notebook", desc: "Spiral notebook with a circuit diagram on the cover.", location: "FET Block, Room 104", ts: now - DAY, status: "open", contact: "" },
      { id: "l3", sample: true, kind: "found", item: "Student ID card holder", desc: "Brown leather holder, no cards inside.", location: "Canteen", ts: now - 3 * DAY, status: "returned", contact: "" },
    ],
    threads: [
      { id: "t-1", sample: true, category: "Academics", title: "Best place to study quietly on campus?", body: "The reading hall fills up fast. Any quieter spots with charging points and decent WiFi?", author: "Anonymous", ts: now - 6 * 3600000,
        replies: [{ id: "r1", author: "Anonymous", body: "The first floor of Core Block is usually calm in the afternoon.", ts: now - 4 * 3600000 }] },
      { id: "t-2", sample: true, category: "Campus life", title: "Looking for teammates for the tech fest", body: "Need two more people for a web or app project. Beginners welcome.", author: "Anonymous", ts: now - DAY, replies: [] },
      { id: "t-3", sample: true, category: "Food", title: "What's good at the canteen today?", body: "Trying to decide between the thali and the sandwiches.", author: "Anonymous", ts: now - 2 * DAY,
        replies: [{ id: "r2", author: "Anonymous", body: "Thali, you won't regret it.", ts: now - 2 * DAY + 3600000 }] },
    ],
    helpRequests: [],
  };
}

const CLUBS = [
  { id: "c-code", name: "Coding Club", category: "Technology", members: 120, desc: "Weekly coding sessions, hackathons and open-source nights." },
  { id: "c-robo", name: "Robotics & Aero Club", category: "Technology", members: 85, desc: "Build drones, rovers and flying models in the Aerospace Block." },
  { id: "c-photo", name: "Photography Club", category: "Arts", members: 64, desc: "Photo walks, editing workshops and campus exhibitions." },
  { id: "c-music", name: "Music Society", category: "Arts", members: 78, desc: "Jam sessions, open mics and the annual cultural night." },
  { id: "c-ecell", name: "Entrepreneurship Cell", category: "Career", members: 52, desc: "Startup talks, pitch practice and founder meetups." },
  { id: "c-sports", name: "Sports Club", category: "Sports", members: 140, desc: "Practice sessions and inter-block tournaments." },
  { id: "c-lit", name: "Literary Club", category: "Arts", members: 41, desc: "Debates, poetry circles and creative writing." },
  { id: "c-green", name: "Green Campus", category: "Service", members: 57, desc: "Tree planting, clean-up drives and sustainability projects." },
];

const LIBRARY_INFO = {
  hours: { 0: null, 1: [8.5, 20], 2: [8.5, 20], 3: [8.5, 20], 4: [8.5, 20], 5: [8.5, 20], 6: [9, 17] },
  services: [
    { icon: "BookOpen", name: "Book lending", desc: "Borrow and return books at the front desk." },
    { icon: "Armchair", name: "Reading hall", desc: "Quiet seating with charging points." },
    { icon: "Monitor", name: "Digital resources", desc: "Journals and e-books on the campus network." },
    { icon: "Printer", name: "Printing and copying", desc: "Self-service printing near the entrance." },
    { icon: "Users", name: "Group study rooms", desc: "Small rooms for team projects." },
  ],
};

const CANTEEN_OUTLETS = [
  { id: "o1", name: "Main Canteen", cuisine: "North and South Indian meals", hours: [8, 19], note: "Thali and snacks all day",
    items: [{ n: "Veg thali", p: 70 }, { n: "Masala dosa", p: 45 }, { n: "Idli (3 pcs)", p: 30 }, { n: "Paneer wrap", p: 60 }, { n: "Samosa", p: 15 }] },
  { id: "o2", name: "Quick Bites Kiosk", cuisine: "Sandwiches, rolls and fries", hours: [9, 17], note: "Fast takeaway between classes",
    items: [{ n: "Veg sandwich", p: 40 }, { n: "Cheese roll", p: 50 }, { n: "French fries", p: 45 }, { n: "Veg burger", p: 55 }] },
  { id: "o3", name: "Juice and Coffee Bar", cuisine: "Cold drinks, juices and coffee", hours: [8.5, 18], note: "Open through the afternoon",
    items: [{ n: "Filter coffee", p: 20 }, { n: "Cold coffee", p: 45 }, { n: "Fresh lime soda", p: 30 }, { n: "Seasonal juice", p: 50 }] },
];

const HOSTEL_INFO = [
  { title: "Mess timings", icon: "Utensils", rows: [["Breakfast", "7:30 to 9:00"], ["Lunch", "12:30 to 14:00"], ["Snacks", "16:30 to 17:30"], ["Dinner", "19:30 to 21:00"]] },
  { title: "Office and visitors", icon: "Clock", rows: [["Hostel office", "9:00 to 17:00"], ["Visitor hours", "16:00 to 18:00"], ["Gate closes", "21:30"]] },
  { title: "Facilities", icon: "Home", rows: [["Laundry", "Ground floor, each wing"], ["Common room", "Indoor games and TV"], ["Study room", "Open 24 hours"], ["WiFi", "Available in all wings"]] },
];

const TRANSPORT_ROUTES = [
  { id: "r-a", name: "City Centre to Campus", stops: ["City Centre", "Kanakapura Road", "Main Gate"], times: ["7:15", "8:00", "8:45", "17:30", "18:15"], note: "Morning arrivals and evening returns" },
  { id: "r-b", name: "South Bengaluru Loop", stops: ["Banashankari", "Konanakunte Cross", "Main Gate"], times: ["7:30", "8:15", "17:45", "18:30"], note: "Pickup points on request" },
  { id: "r-c", name: "Inter-block shuttle", stops: ["Main Gate", "Core Block", "FET Block", "Aerospace Block", "Hostel"], times: ["Every 20 minutes, 8:30 to 17:30"], note: "Runs through the day on class days" },
];

const FAQ = [
  { q: "A facility is out of order. What should I do?", a: "Open the facility from Campus Amenities and tap Report issue. Staff see it in their queue straight away." },
  { q: "How do I check when a water cooler was cleaned?", a: "Scan the QR sticker on the cooler, or open Water coolers under Campus Amenities and pick a block." },
  { q: "Where do I find a teacher's cabin?", a: "Open Staff Directory, search for the teacher and tap Directions for a floor-plan route." },
  { q: "I lost something on campus.", a: "Post it on Lost and Found with where you last saw it. Others can contact you if they find it." },
];


// ---------- Small helpers ----------
const lsGet = (k, fb) => { try { const v = localStorage.getItem(k); return v === null ? fb : JSON.parse(v); } catch (e) { return fb; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const fmtDate = (ts) => new Date(ts).toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" });
const fmtTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const hoursLabel = (h) => { const hh = Math.floor(h); const mm = Math.round((h - hh) * 60); const d = new Date(); d.setHours(hh, mm, 0, 0); return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); };
const isOpenNow = (range, now) => { if (!range) return false; const d = new Date(now); const h = d.getHours() + d.getMinutes() / 60; return h >= range[0] && h < range[1]; };

const DEFAULT_PREFS = {
  notifFacility: true, notifNotices: true, notifEvents: true, notifLostFound: true,
  anonymous: false, showContact: true, startCollapsed: false,
};

// ---------- More design-system pieces ----------
function Avatar({ name, size = 36, tone = "soft" }) {
  return (
    <span style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size * 0.36,
      background: tone === "solid" ? "linear-gradient(135deg, #4F46E5, #8B5CF6)" : COLORS.tealBg, color: tone === "solid" ? "#fff" : COLORS.teal }}>{initialsOf(name)}</span>
  );
}

function Chip({ active, children, onClick, count }) {
  return (
    <button className="ce-btn" onClick={onClick} aria-pressed={!!active}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 13px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0,
        border: `1px solid ${active ? COLORS.teal : COLORS.line}`, background: active ? COLORS.tealBg : COLORS.surface, color: active ? COLORS.teal : COLORS.inkMuted }}>
      {children}{count !== undefined && <span style={{ fontSize: 11, opacity: 0.8 }}>{count}</span>}
    </button>
  );
}

function SearchBox({ value, onChange, placeholder, maxWidth = 440 }) {
  return (
    <div style={{ position: "relative", maxWidth, flex: 1, minWidth: 200 }}>
      <Search size={15} color={COLORS.inkMuted} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
      <input className="ce-input" aria-label={placeholder} style={{ paddingLeft: 38 }} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function InfoBanner({ children, tone = "sample" }) {
  const bg = tone === "sample" ? COLORS.amberBg : COLORS.tealBg;
  const fg = tone === "sample" ? COLORS.amber : COLORS.teal;
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: bg, borderRadius: 12, padding: "11px 14px", marginBottom: 18 }}>
      <Info size={16} color={fg} style={{ flexShrink: 0, marginTop: 1 }} />
      <p style={{ margin: 0, fontSize: 13, color: COLORS.ink, lineHeight: 1.5 }}>{children}</p>
    </div>
  );
}

function ToggleRow({ title, desc, on, onChange, disabled }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "14px 0", borderTop: `1px solid ${COLORS.line}`, opacity: disabled ? 0.55 : 1 }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{title}</p>
        {desc && <p style={{ margin: "3px 0 0", fontSize: 12.5, color: COLORS.inkMuted, lineHeight: 1.45 }}>{desc}</p>}
      </div>
      <Switch on={on} onClick={() => !disabled && onChange(!on)} label={title} />
    </div>
  );
}

function ListItem({ icon: Icon, tone = "primary", title, sub, right, onClick }) {
  const map = { primary: [COLORS.tealBg, COLORS.teal], ok: [COLORS.okBg, COLORS.ok], watch: [COLORS.amberBg, COLORS.amber], flagged: [COLORS.coralBg, COLORS.coral] };
  const [bg, fg] = map[tone];
  const inner = (
    <>
      <span style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={17} color={fg} /></span>
      <span style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
        <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: COLORS.ink, lineHeight: 1.35 }}>{title}</span>
        {sub && <span style={{ display: "block", fontSize: 12, color: COLORS.inkMuted, marginTop: 2, lineHeight: 1.4 }}>{sub}</span>}
      </span>
      {right}
    </>
  );
  const style = { display: "flex", alignItems: "center", gap: 12, padding: "10px 0", width: "100%", background: "none", border: "none", font: "inherit" };
  return onClick ? <button className="ce-btn" onClick={onClick} style={style}>{inner}</button> : <div style={style}>{inner}</div>;
}

function ThemeSwitcher({ pref, setPref, compact }) {
  const opts = [{ id: "light", label: "Light", icon: Sun }, { id: "dark", label: "Dark", icon: Moon }, { id: "system", label: "System", icon: Monitor }];
  return (
    <div role="radiogroup" aria-label="Theme" style={{ display: "inline-flex", padding: 3, background: COLORS.panel2, borderRadius: 11, gap: 2 }}>
      {opts.map((o) => {
        const Ic = o.icon; const on = pref === o.id;
        return (
          <button key={o.id} role="radio" aria-checked={on} aria-label={`${o.label} theme`} title={`${o.label} theme`} className="ce-btn" onClick={() => setPref(o.id)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "none", borderRadius: 8, padding: compact ? "7px 9px" : "7px 12px", fontSize: 12.5, fontWeight: 600,
              background: on ? COLORS.surface : "transparent", color: on ? COLORS.teal : COLORS.inkMuted, boxShadow: on ? COLORS.shadow : "none" }}>
            <Ic size={15} />{!compact && o.label}
          </button>
        );
      })}
    </div>
  );
}

// ---------- Campus map (schematic, with routing) ----------
const MAP_NODES = {
  gate: [200, 238], j1: [200, 170], jw: [90, 170], jl: [145, 170], jt: [255, 170], je: [310, 170],
  jc: [200, 106], jf: [90, 106], ja: [310, 106], jh: [90, 212], js: [310, 212],
};
const MAP_EDGES = [["gate", "j1"], ["jw", "jl"], ["jl", "j1"], ["j1", "jt"], ["jt", "je"], ["j1", "jc"], ["jw", "jf"], ["je", "ja"], ["jf", "jc"], ["jc", "ja"], ["jw", "jh"], ["je", "js"]];
const MAP_PLACES = [
  { id: "gate", name: "Main gate", kind: "entry", node: "gate", x: 200, y: 254, w: 64, h: 20, desc: "Main entrance to the campus on Kanakapura Road." },
  { id: "fet", name: "FET Block", kind: "academic", node: "jf", x: 90, y: 66, w: 74, h: 44, block: "FET Block", desc: "Faculty of Engineering and Technology. Computer science, electronics and information science cabins." },
  { id: "core", name: "Core Block", kind: "academic", node: "jc", x: 200, y: 66, w: 74, h: 44, block: "Core Block", desc: "Lecture halls, mathematics and physics departments." },
  { id: "aero", name: "Aerospace Block", kind: "academic", node: "ja", x: 310, y: 66, w: 74, h: 44, block: "Aerospace Block", desc: "Aerospace and avionics, with the hangar lab and design studio." },
  { id: "library", name: "Library", kind: "service", node: "jl", x: 145, y: 140, w: 58, h: 30, screen: "library", desc: "Reading hall, lending desk and digital resources." },
  { id: "canteen", name: "Canteen", kind: "service", node: "jt", x: 255, y: 140, w: 58, h: 30, screen: "canteen", desc: "Main canteen, quick bites kiosk and juice bar." },
  { id: "hostel", name: "Hostel", kind: "living", node: "jh", x: 90, y: 238, w: 66, h: 30, screen: "hostel", desc: "Student residences, mess and common rooms." },
  { id: "sports", name: "Sports ground", kind: "living", node: "js", x: 310, y: 238, w: 74, h: 30, desc: "Open ground for practice, tournaments and sports day." },
];
const KIND_COLOR = { academic: "#4F46E5", service: "#0EA5E9", living: "#8B5CF6", entry: "#64748B" };

function mapRoute(fromId, toId) {
  const a = MAP_PLACES.find((p) => p.id === fromId); const b = MAP_PLACES.find((p) => p.id === toId);
  if (!a || !b) return null;
  const adj = {};
  MAP_EDGES.forEach(([u, v]) => {
    const d = Math.hypot(MAP_NODES[u][0] - MAP_NODES[v][0], MAP_NODES[u][1] - MAP_NODES[v][1]);
    (adj[u] = adj[u] || []).push([v, d]); (adj[v] = adj[v] || []).push([u, d]);
  });
  const dist = { [a.node]: 0 }; const prev = {}; const todo = new Set(Object.keys(MAP_NODES));
  while (todo.size) {
    let u = null; todo.forEach((n) => { if (dist[n] !== undefined && (u === null || dist[n] < dist[u])) u = n; });
    if (u === null) break;
    todo.delete(u);
    (adj[u] || []).forEach(([v, d]) => { if (dist[v] === undefined || dist[u] + d < dist[v]) { dist[v] = dist[u] + d; prev[v] = u; } });
  }
  const path = []; let cur = b.node;
  while (cur !== undefined) { path.unshift(cur); cur = prev[cur]; }
  const pts = [[a.x, a.y], ...path.map((n) => MAP_NODES[n]), [b.x, b.y]];
  let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  const meters = Math.max(10, Math.round(len * 1.6));
  return { pts, meters, mins: Math.max(1, Math.round(meters / 75)), via: path.map((n) => MAP_PLACES.find((p) => p.node === n)).filter(Boolean).map((p) => p.name) };
}

function CampusMap({ from, to, onPick }) {
  const route = to && from && to !== from ? mapRoute(from, to) : null;
  const d = route ? route.pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ") : "";
  const f = MAP_PLACES.find((p) => p.id === from); const t = MAP_PLACES.find((p) => p.id === to);
  return (
    <div style={{ background: COLORS.panel2, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 8 }}>
      <svg viewBox="0 0 400 276" style={{ width: "100%", height: "auto", display: "block" }} role="img" aria-label="Schematic campus map">
        <rect x="0" y="0" width="400" height="276" rx="10" fill={COLORS.surface} />
        <rect x="14" y="196" width="372" height="64" rx="10" fill={COLORS.okBg} opacity="0.45" />
        {MAP_EDGES.map(([u, v], i) => <line key={i} x1={MAP_NODES[u][0]} y1={MAP_NODES[u][1]} x2={MAP_NODES[v][0]} y2={MAP_NODES[v][1]} stroke={COLORS.line} strokeWidth="9" strokeLinecap="round" />)}
        {MAP_PLACES.map((p) => {
          const sel = to === p.id; const col = KIND_COLOR[p.kind];
          return (
            <g key={p.id} onClick={() => onPick(p.id)} style={{ cursor: "pointer" }} role="button" tabIndex={0} aria-label={p.name} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onPick(p.id); }}>
              <rect x={p.x - p.w / 2} y={p.y - p.h / 2} width={p.w} height={p.h} rx="6" fill={sel ? col : col + "22"} stroke={col} strokeWidth={sel ? 2 : 1} />
              <text x={p.x} y={p.y + 3.5} textAnchor="middle" fontSize="9.5" fontWeight="600" fill={sel ? "#fff" : COLORS.ink} fontFamily="Inter, sans-serif" style={{ pointerEvents: "none" }}>{p.name}</text>
            </g>
          );
        })}
        {route && <path d={d} fill="none" stroke={COLORS.teal} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="7 5" className="ce-route" />}
        {f && route && <g><circle cx={f.x} cy={f.y + f.h / 2 + 7} r="0" /><circle cx={route.pts[0][0]} cy={route.pts[0][1]} r="5.5" fill={COLORS.teal} stroke={COLORS.surface} strokeWidth="2" /></g>}
        {t && route && <g><circle cx={route.pts[route.pts.length - 1][0]} cy={route.pts[route.pts.length - 1][1]} r="6" fill={COLORS.coral} stroke={COLORS.surface} strokeWidth="2" /><circle cx={route.pts[route.pts.length - 1][0]} cy={route.pts[route.pts.length - 1][1]} r="2" fill="#fff" /></g>}
      </svg>
      <p style={{ margin: "6px 4px 0", fontSize: 11.5, color: COLORS.inkMuted }}>Schematic map, not to scale. Distances are estimates.</p>
      {route && <span style={{ display: "none" }}>{route.meters}</span>}
    </div>
  );
}

// =====================================================================
// PAGES: campus information
// Each page receives `c`, the shared app context built in CampusEase().
// =====================================================================
const ICONS = { BookOpen, Armchair, Monitor, Printer, Users, Utensils, Clock, Home: HomeIcon };

function FormModal({ title, onClose, onSubmit, submitLabel = "Save", children }) {
  return (
    <div className="ce-modal-back" onClick={onClose}>
      <form role="dialog" aria-modal="true" aria-label={title} className="ce-modal" style={{ maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 650 }}>{title}</h3>
          <Button type="button" variant="ghost" size="sm" aria-label="Close" icon={X} onClick={onClose} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{children}</div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 }}>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">{submitLabel}</Button>
        </div>
      </form>
    </div>
  );
}

const SampleTag = ({ item }) => (item && item.sample ? <Tag tone="sample">Sample</Tag> : null);

// ---------------------------------------------------------------- Dashboard
function DashboardPage({ c }) {
  const { now, facilities, notices, events, updates, userName, go } = c;
  const first = userName.trim().split(/\s+/)[0];
  const h = new Date(now).getHours();
  const greeting = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  const upcoming = events.filter((e) => e.ts >= now - 3600000).sort((a, b) => a.ts - b.ts).slice(0, 3);
  const topNotices = [...notices].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.ts - a.ts).slice(0, 3);
  const open = CANTEEN_OUTLETS.filter((o) => isOpenNow(o.hours, now));
  const recent = [
    ...notices.map((n) => ({ id: n.id, label: "Notice", title: n.title, ts: n.ts, screen: "notices", icon: Newspaper })),
    ...c.lostFound.map((l) => ({ id: l.id, label: l.kind === "lost" ? "Lost item" : "Found item", title: l.item, ts: l.ts, screen: "lostfound", icon: PackageSearch })),
    ...c.threads.map((t) => ({ id: t.id, label: "Discussion", title: t.title, ts: t.ts, screen: "discussions", icon: MessageSquare })),
  ].sort((a, b) => b.ts - a.ts).slice(0, 4);
  const shortcuts = [
    { label: "Campus map", icon: MapIcon, screen: "map" }, { label: "Find a teacher", icon: GraduationCap, screen: "directory" },
    { label: "Scan QR", icon: Camera, screen: "scan" }, { label: "Lost and found", icon: PackageSearch, screen: "lostfound" },
    { label: "Report issue", icon: Flag, screen: "report" },
  ];
  return (
    <div className="ce-fade">
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>{greeting}{first ? `, ${first}` : ""}</h1>
        <p style={{ margin: "5px 0 0", fontSize: 14, color: COLORS.inkMuted }}>{new Date(now).toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" })} · {CAMPUS.name}</p>
      </div>

      <div className="ce-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 20 }}>
        {shortcuts.map((s) => { const Ic = s.icon; return (
          <button key={s.label} className="ce-btn ce-card-hover" onClick={() => go(s.screen)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 12, boxShadow: COLORS.shadow, fontSize: 13, fontWeight: 600 }}>
            <span style={{ width: 32, height: 32, borderRadius: 9, background: COLORS.tealBg, display: "flex", alignItems: "center", justifyContent: "center" }}><Ic size={16} color={COLORS.teal} /></span>{s.label}
          </button>); })}
      </div>

      <div className="ce-grid-eq" style={{ marginBottom: 16 }}>
        <Card>
          <SectionTitle right={<Button variant="ghost" size="sm" onClick={() => go("notices")}>All notices</Button>}>Announcements</SectionTitle>
          {topNotices.length === 0 ? <EmptyState icon={Newspaper} title="No announcements" body="New notices will show up here." /> :
            topNotices.map((n, i) => (
              <div key={n.id} style={{ padding: "11px 0", borderTop: i ? `1px solid ${COLORS.line}` : "none" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
                  {n.pinned && <Pin size={13} color={COLORS.teal} />}<Tag tone="primary">{n.tag}</Tag><SampleTag item={n} />
                </div>
                <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, lineHeight: 1.4 }}>{n.title}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.inkMuted }}>{formatRelative(n.ts, now)}</p>
              </div>))}
        </Card>
        <Card>
          <SectionTitle right={<Button variant="ghost" size="sm" onClick={() => go("events")}>All events</Button>}>Upcoming events</SectionTitle>
          {upcoming.length === 0 ? <EmptyState icon={CalendarDays} title="No upcoming events" body="Check back soon." /> :
            upcoming.map((e, i) => (
              <div key={e.id} style={{ display: "flex", gap: 12, padding: "11px 0", borderTop: i ? `1px solid ${COLORS.line}` : "none" }}>
                <span style={{ width: 48, flexShrink: 0, textAlign: "center", background: COLORS.tealBg, color: COLORS.teal, borderRadius: 10, padding: "6px 0" }}>
                  <span style={{ display: "block", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase" }}>{new Date(e.ts).toLocaleDateString([], { month: "short" })}</span>
                  <span style={{ display: "block", fontSize: 18, fontWeight: 700, lineHeight: 1.1 }}>{new Date(e.ts).getDate()}</span>
                </span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, lineHeight: 1.4 }}>{e.title}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.inkMuted }}>{fmtTime(e.ts)} · {e.venue}</p>
                </div>
              </div>))}
        </Card>
      </div>

      <SectionTitle hint="Live status across the three blocks">Campus amenities</SectionTitle>
      <div className="ce-stagger" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12, marginBottom: 20 }}>
        {SERVICE_TILES.map((t) => {
          const Ic = t.icon; const list = facilities.filter((f) => f.type === t.type); const bad = list.filter((f) => f.status !== "ok").length;
          return (
            <button key={t.id} className="ce-btn ce-card-hover" onClick={() => go(t.id)} style={{ textAlign: "left", padding: 14, background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 14, boxShadow: COLORS.shadow, display: "flex", flexDirection: "column", gap: 10 }}>
              <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ width: 36, height: 36, borderRadius: 10, background: COLORS.tealBg, display: "flex", alignItems: "center", justifyContent: "center" }}><Ic size={18} color={COLORS.teal} /></span>
                <Pill status={bad ? "watch" : "ok"}>{bad ? `${bad} issue${bad > 1 ? "s" : ""}` : "All good"}</Pill>
              </span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{t.label}</span>
            </button>);
        })}
      </div>

      <div className="ce-grid-eq" style={{ marginBottom: 16 }}>
        <Card>
          <SectionTitle right={<Button variant="ghost" size="sm" onClick={() => go("canteen")}>Full menu</Button>} hint="Outlets open right now">Canteen highlights</SectionTitle>
          {open.length === 0 ? <EmptyState icon={Utensils} title="All outlets are closed" body="Check the Canteen page for opening hours." /> :
            open.map((o, i) => (
              <div key={o.id} style={{ padding: "10px 0", borderTop: i ? `1px solid ${COLORS.line}` : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600 }}>{o.name}</p><Pill status="ok">Open</Pill>
                </div>
                <p style={{ margin: "3px 0 0", fontSize: 12.5, color: COLORS.inkMuted }}>{o.note} · e.g. {o.items[0].n}, ₹{o.items[0].p}</p>
              </div>))}
          <p style={{ margin: "8px 0 0", fontSize: 11.5, color: COLORS.amber }}>Placeholder menu until official details are added.</p>
        </Card>
        <Card>
          <SectionTitle right={<Button variant="ghost" size="sm" onClick={() => go("updates")}>All updates</Button>}>Campus updates</SectionTitle>
          {updates.length === 0 ? <EmptyState icon={Inbox} title="Nothing new" body="Updates appear as things happen on campus." /> :
            updates.slice(0, 4).map((u) => <ListItem key={u.id} icon={u.icon} tone={u.tone} title={u.title} sub={`${u.sub} · ${formatRelative(u.ts, now)}`} onClick={() => go(u.screen)} />)}
        </Card>
      </div>

      <Card>
        <SectionTitle hint="Newest notices, items and discussions">Recently added</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0 24px" }}>
          {recent.map((r) => <ListItem key={r.id} icon={r.icon} title={r.title} sub={`${r.label} · ${formatRelative(r.ts, now)}`} onClick={() => go(r.screen)} />)}
        </div>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------- Campus map
function MapPage({ c }) {
  const [from, setFrom] = useState("gate");
  const [to, setTo] = useState(null);
  const place = MAP_PLACES.find((p) => p.id === to);
  const route = to && to !== from ? mapRoute(from, to) : null;
  const blockFacilities = place && place.block ? c.facilities.filter((f) => f.floor === place.block) : [];
  const ok = blockFacilities.filter((f) => f.status === "ok").length;
  return (
    <Screen title="Campus map" subtitle="Tap a building to see what's inside and how to get there." onBack={() => c.go("home")}>
      <div className="ce-grid-2">
        <div>
          <CampusMap from={from} to={to} onPick={setTo} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            {MAP_PLACES.filter((p) => p.id !== "gate").map((p) => <Chip key={p.id} active={to === p.id} onClick={() => setTo(p.id)}>{p.name}</Chip>)}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <Field label="You are at">
              <select className="ce-select" value={from} onChange={(e) => setFrom(e.target.value)}>
                {MAP_PLACES.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Field>
          </Card>
          {!place ? (
            <EmptyState icon={MapPin} title="Pick a destination" body="Tap any building on the map, or choose one from the list below it." />
          ) : (
            <Card className="ce-fade">
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: KIND_COLOR[place.kind] }} />
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 650 }}>{place.name}</h3>
              </div>
              <p style={{ margin: "0 0 14px", fontSize: 13, color: COLORS.inkMuted, lineHeight: 1.5 }}>{place.desc}</p>
              {route && (
                <div style={{ background: COLORS.tealBg, borderRadius: 12, padding: "12px 14px", marginBottom: 14 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 650, color: COLORS.teal }}>About {route.mins} min walk · ~{route.meters} m</p>
                  <p style={{ margin: "4px 0 0", fontSize: 12.5, color: COLORS.ink }}>Route: {[MAP_PLACES.find((p) => p.id === from).name, ...route.via.filter((n) => n !== MAP_PLACES.find((p) => p.id === from).name && n !== place.name), place.name].join(" → ")}</p>
                </div>
              )}
              {to === from && <p style={{ margin: "0 0 14px", fontSize: 13, color: COLORS.teal, fontWeight: 600 }}>You are already here.</p>}
              {place.block && (
                <div style={{ marginBottom: 14 }}>
                  <p style={{ margin: "0 0 6px", fontSize: 12.5, fontWeight: 600, color: COLORS.inkMuted }}>Amenities in this block</p>
                  <Pill status={blockFacilities.length && ok === blockFacilities.length ? "ok" : "watch"}>{ok} of {blockFacilities.length} working</Pill>
                </div>
              )}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {place.block && <Button size="sm" variant="secondary" icon={GraduationCap} onClick={() => c.go("directory")}>Staff in this block</Button>}
                {place.block && <Button size="sm" variant="secondary" icon={Zap} onClick={() => c.go("amenities")}>Amenities</Button>}
                {place.screen && <Button size="sm" variant="secondary" icon={Info} onClick={() => c.go(place.screen)}>More information</Button>}
              </div>
            </Card>
          )}
        </div>
      </div>
    </Screen>
  );
}

// ---------------------------------------------------------------- Events
function EventsPage({ c }) {
  const [tab, setTab] = useState("upcoming");
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ title: "", date: "", time: "10:00", venue: "", desc: "" });
  const [err, setErr] = useState({});
  const { now, events } = c;
  const list = events.filter((e) => (tab === "upcoming" ? e.ts >= now - 3600000 : e.ts < now - 3600000)).sort((a, b) => (tab === "upcoming" ? a.ts - b.ts : b.ts - a.ts));
  const submit = () => {
    const e = {};
    if (!f.title.trim()) e.title = "Give the event a title."; if (!f.date) e.date = "Pick a date."; if (!f.venue.trim()) e.venue = "Add a venue.";
    setErr(e); if (Object.keys(e).length) return;
    const ts = new Date(`${f.date}T${f.time || "10:00"}`).getTime();
    c.update({ events: [{ id: `e-${Date.now()}`, title: f.title.trim(), club: "Campus", venue: f.venue.trim(), ts, going: 0, desc: f.desc.trim() }, ...events] });
    setAdding(false); setF({ title: "", date: "", time: "10:00", venue: "", desc: "" }); c.toast("ok", "Event added.");
  };
  return (
    <Screen title="Events and activities" subtitle="What's happening on campus, and how to join in." onBack={() => c.go("home")}
      actions={c.staffOk ? <Button icon={Plus} onClick={() => setAdding(true)}>Add event</Button> : null}>
      <Tabs value={tab} onChange={setTab} tabs={[{ id: "upcoming", label: "Upcoming" }, { id: "past", label: "Past" }]} />
      {list.length === 0 ? <EmptyState icon={CalendarDays} title={tab === "upcoming" ? "No upcoming events" : "No past events"} body="Staff can add events from this page after signing in." /> : (
        <div className="ce-grid-auto ce-stagger">
          {list.map((e) => {
            const going = c.rsvps.includes(e.id);
            return (
              <Card key={e.id} pad={18} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <span style={{ width: 52, flexShrink: 0, textAlign: "center", background: COLORS.tealBg, color: COLORS.teal, borderRadius: 12, padding: "7px 0" }}>
                    <span style={{ display: "block", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase" }}>{new Date(e.ts).toLocaleDateString([], { month: "short" })}</span>
                    <span style={{ display: "block", fontSize: 20, fontWeight: 700, lineHeight: 1.1 }}>{new Date(e.ts).getDate()}</span>
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 650, lineHeight: 1.35 }}>{e.title}</p>
                    <p style={{ margin: "3px 0 0", fontSize: 12.5, color: COLORS.inkMuted }}>{fmtDate(e.ts)}, {fmtTime(e.ts)}</p>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: COLORS.inkMuted, lineHeight: 1.5, flex: 1 }}>{e.desc}</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  <Tag tone="primary">{e.club}</Tag><SampleTag item={e} />
                  <span style={{ fontSize: 12, color: COLORS.inkMuted, display: "inline-flex", alignItems: "center", gap: 4 }}><MapPin size={12} />{e.venue}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ fontSize: 12.5, color: COLORS.inkMuted }}>{(e.going || 0) + (going ? 1 : 0)} going</span>
                  {tab === "upcoming" && <Button size="sm" variant={going ? "soft" : "primary"} icon={going ? Check : Plus} onClick={() => c.toggleRsvp(e.id)}>{going ? "You're going" : "I'm going"}</Button>}
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {adding && (
        <FormModal title="Add an event" submitLabel="Add event" onClose={() => setAdding(false)} onSubmit={submit}>
          <Field label="Title" error={err.title}><input className={`ce-input ${err.title ? "ce-invalid" : ""}`} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Date" error={err.date}><input type="date" className={`ce-input ${err.date ? "ce-invalid" : ""}`} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
            <Field label="Time"><input type="time" className="ce-input" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} /></Field>
          </div>
          <Field label="Venue" error={err.venue}><input className={`ce-input ${err.venue ? "ce-invalid" : ""}`} value={f.venue} onChange={(e) => setF({ ...f, venue: e.target.value })} /></Field>
          <Field label="Description"><textarea className="ce-textarea" rows={3} value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} /></Field>
        </FormModal>
      )}
    </Screen>
  );
}

// ---------------------------------------------------------------- Notice board
const NOTICE_TAGS = ["Campus", "Academic", "Facilities", "Safety"];
function NoticesPage({ c }) {
  const [q, setQ] = useState(""); const [tag, setTag] = useState("All");
  const [adding, setAdding] = useState(false); const [f, setF] = useState({ title: "", body: "", tag: "Campus", pinned: false }); const [err, setErr] = useState({});
  const list = [...c.notices].filter((n) => (tag === "All" || n.tag === tag) && `${n.title} ${n.body}`.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.ts - a.ts);
  const submit = () => {
    const e = {}; if (!f.title.trim()) e.title = "Add a title."; if (!f.body.trim()) e.body = "Write the notice.";
    setErr(e); if (Object.keys(e).length) return;
    c.update({ notices: [{ id: `n-${Date.now()}`, title: f.title.trim(), body: f.body.trim(), tag: f.tag, pinned: f.pinned, ts: Date.now(), author: "Campus staff" }, ...c.notices] });
    setAdding(false); setF({ title: "", body: "", tag: "Campus", pinned: false }); c.toast("ok", "Notice posted.");
  };
  return (
    <Screen title="Notice board" subtitle="Official notices from campus offices." onBack={() => c.go("home")}
      actions={c.staffOk ? <Button icon={Plus} onClick={() => setAdding(true)}>Post notice</Button> : <Button variant="secondary" icon={ShieldCheck} onClick={() => c.goStaff("overview")}>Staff sign-in to post</Button>}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 18 }}>
        <SearchBox value={q} onChange={setQ} placeholder="Search notices" />
        <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>{["All", ...NOTICE_TAGS].map((t) => <Chip key={t} active={tag === t} onClick={() => setTag(t)}>{t}</Chip>)}</div>
      </div>
      {list.length === 0 ? <EmptyState icon={Newspaper} title="No notices found" body="Try a different search or category." action={<Button variant="secondary" onClick={() => { setQ(""); setTag("All"); }}>Clear filters</Button>} /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }} className="ce-stagger">
          {list.map((n) => (
            <Card key={n.id} pad={18}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
                {n.pinned && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: COLORS.teal }}><Pin size={13} />Pinned</span>}
                <Tag tone="primary">{n.tag}</Tag><SampleTag item={n} />
                <span style={{ marginLeft: "auto", fontSize: 12, color: COLORS.inkMuted }}>{n.author} · {formatRelative(n.ts, c.now)}</span>
              </div>
              <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 650 }}>{n.title}</h3>
              <p style={{ margin: "6px 0 0", fontSize: 13.5, color: COLORS.inkMuted, lineHeight: 1.55 }}>{n.body}</p>
              {c.staffOk && !n.sample && <Button variant="ghost" size="sm" icon={Trash2} style={{ marginTop: 10 }} onClick={() => c.update({ notices: c.notices.filter((x) => x.id !== n.id) })}>Remove</Button>}
            </Card>))}
        </div>
      )}
      {adding && (
        <FormModal title="Post a notice" submitLabel="Post notice" onClose={() => setAdding(false)} onSubmit={submit}>
          <Field label="Title" error={err.title}><input className={`ce-input ${err.title ? "ce-invalid" : ""}`} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
          <Field label="Category"><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{NOTICE_TAGS.map((t) => <Chip key={t} active={f.tag === t} onClick={() => setF({ ...f, tag: t })}>{t}</Chip>)}</div></Field>
          <Field label="Notice" error={err.body}><textarea className={`ce-textarea ${err.body ? "ce-invalid" : ""}`} rows={4} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></Field>
          <ToggleRow title="Pin to the top" on={f.pinned} onChange={(v) => setF({ ...f, pinned: v })} />
        </FormModal>
      )}
    </Screen>
  );
}

// ---------------------------------------------------------------- Lost and found
function LostFoundPage({ c }) {
  const [q, setQ] = useState(""); const [kind, setKind] = useState("all"); const [status, setStatus] = useState("open");
  const [adding, setAdding] = useState(false); const [f, setF] = useState({ kind: "lost", item: "", desc: "", location: "", contact: "" }); const [err, setErr] = useState({});
  const list = c.lostFound.filter((l) => (kind === "all" || l.kind === kind) && (status === "all" || l.status === status) && `${l.item} ${l.desc} ${l.location}`.toLowerCase().includes(q.trim().toLowerCase())).sort((a, b) => b.ts - a.ts);
  const submit = () => {
    const e = {}; if (!f.item.trim()) e.item = "What is the item?"; if (!f.location.trim()) e.location = "Where was it lost or found?";
    setErr(e); if (Object.keys(e).length) return;
    const id = `lf-${Date.now()}`;
    c.update({ lostFound: [{ id, kind: f.kind, item: f.item.trim(), desc: f.desc.trim(), location: f.location.trim(), contact: c.prefs.showContact ? f.contact.trim() : "", ts: Date.now(), status: "open" }, ...c.lostFound] });
    c.markMine(id); setAdding(false); setF({ kind: "lost", item: "", desc: "", location: "", contact: "" }); c.toast("ok", "Posted. Thanks for helping out.");
  };
  return (
    <Screen title="Lost and found" subtitle="Post what you've lost or found, and help it get home." onBack={() => c.go("home")} actions={<Button icon={Plus} onClick={() => setAdding(true)}>Report an item</Button>}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        <SearchBox value={q} onChange={setQ} placeholder="Search items or places" />
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
        {[["all", "All"], ["lost", "Lost"], ["found", "Found"]].map(([id, l]) => <Chip key={id} active={kind === id} onClick={() => setKind(id)}>{l}</Chip>)}
        <span style={{ width: 1, background: COLORS.line, margin: "0 4px" }} />
        {[["open", "Open"], ["returned", "Returned"], ["all", "Any status"]].map(([id, l]) => <Chip key={id} active={status === id} onClick={() => setStatus(id)}>{l}</Chip>)}
      </div>
      {list.length === 0 ? <EmptyState icon={PackageSearch} title="Nothing matches" body="No items fit these filters. Be the first to post one." action={<Button onClick={() => setAdding(true)} icon={Plus}>Report an item</Button>} /> : (
        <div className="ce-grid-auto ce-stagger">
          {list.map((l) => (
            <Card key={l.id} pad={18} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <Pill status={l.kind === "lost" ? "flagged" : "ok"}>{l.kind === "lost" ? "Lost" : "Found"}</Pill>
                {l.status === "returned" && <Tag tone="neutral">Returned</Tag>}<SampleTag item={l} />
                <span style={{ marginLeft: "auto", fontSize: 12, color: COLORS.inkMuted }}>{formatRelative(l.ts, c.now)}</span>
              </div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 650 }}>{l.item}</h3>
              {l.desc && <p style={{ margin: 0, fontSize: 13, color: COLORS.inkMuted, lineHeight: 1.5 }}>{l.desc}</p>}
              <p style={{ margin: 0, fontSize: 12.5, color: COLORS.inkMuted, display: "flex", alignItems: "center", gap: 5 }}><MapPin size={13} />{l.location}</p>
              {l.contact && <p style={{ margin: 0, fontSize: 12.5, color: COLORS.ink }}><strong>Contact:</strong> {l.contact}</p>}
              {l.status === "open" && (c.isMine(l.id) || c.staffOk) && <Button size="sm" variant="secondary" icon={CheckCircle2} onClick={() => c.update({ lostFound: c.lostFound.map((x) => (x.id === l.id ? { ...x, status: "returned" } : x)) })} style={{ alignSelf: "flex-start" }}>Mark returned</Button>}
            </Card>))}
        </div>
      )}
      {adding && (
        <FormModal title="Report an item" submitLabel="Post" onClose={() => setAdding(false)} onSubmit={submit}>
          <Field label="Is it lost or found?"><div style={{ display: "flex", gap: 8 }}><Chip active={f.kind === "lost"} onClick={() => setF({ ...f, kind: "lost" })}>I lost it</Chip><Chip active={f.kind === "found"} onClick={() => setF({ ...f, kind: "found" })}>I found it</Chip></div></Field>
          <Field label="Item" error={err.item}><input className={`ce-input ${err.item ? "ce-invalid" : ""}`} placeholder="Black water bottle" value={f.item} onChange={(e) => setF({ ...f, item: e.target.value })} /></Field>
          <Field label="Description"><textarea className="ce-textarea" rows={3} placeholder="Colour, brand, anything that identifies it" value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} /></Field>
          <Field label="Where" error={err.location}><input className={`ce-input ${err.location ? "ce-invalid" : ""}`} placeholder="Library entrance" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></Field>
          {c.prefs.showContact
            ? <Field label="How should people reach you?" hint="Optional. Shown publicly on this post."><input className="ce-input" placeholder="Name or where to hand it in" value={f.contact} onChange={(e) => setF({ ...f, contact: e.target.value })} /></Field>
            : <p style={{ margin: 0, fontSize: 12.5, color: COLORS.inkMuted }}>Contact details are hidden by your privacy settings.</p>}
        </FormModal>
      )}
    </Screen>
  );
}

// ---------------------------------------------------------------- Campus updates
function UpdatesPage({ c }) {
  const [kind, setKind] = useState("all");
  const kinds = [["all", "All"], ["facility", "Facilities"], ["notice", "Notices"], ["event", "Events"], ["lostfound", "Lost and found"], ["community", "Community"]];
  const list = c.updates.filter((u) => kind === "all" || u.kind === kind);
  return (
    <Screen title="Campus updates" subtitle="A live feed of what's changing around campus." onBack={() => c.go("home")}>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 18, paddingBottom: 4 }}>{kinds.map(([id, l]) => <Chip key={id} active={kind === id} onClick={() => setKind(id)}>{l}</Chip>)}</div>
      {list.length === 0 ? <EmptyState icon={Inbox} title="Nothing new here" body="Updates appear automatically as notices, events and facility changes happen." /> : (
        <Card pad={8}>
          {list.map((u, i) => (
            <div key={u.id} style={{ padding: "2px 12px", borderTop: i ? `1px solid ${COLORS.line}` : "none" }}>
              <ListItem icon={u.icon} tone={u.tone} title={u.title} sub={u.sub} onClick={() => c.go(u.screen)} right={<span style={{ fontSize: 12, color: COLORS.inkMuted, whiteSpace: "nowrap" }}>{formatRelative(u.ts, c.now)}</span>} />
            </div>))}
        </Card>
      )}
    </Screen>
  );
}

// ---------------------------------------------------------------- Library
function LibraryPage({ c }) {
  const today = new Date(c.now).getDay();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const open = isOpenNow(LIBRARY_INFO.hours[today], c.now);
  return (
    <Screen title="Library" subtitle="Opening hours and what you can do there." onBack={() => c.go("home")} actions={<Pill status={open ? "ok" : "flagged"}>{open ? "Open now" : "Closed now"}</Pill>}>
      <InfoBanner>Placeholder hours and services. Replace them with the official library details before sharing widely.</InfoBanner>
      <div className="ce-grid-eq">
        <Card>
          <SectionTitle>Opening hours</SectionTitle>
          {days.map((d, i) => { const r = LIBRARY_INFO.hours[i]; return (
            <div key={d} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderTop: i ? `1px solid ${COLORS.line}` : "none", fontSize: 13.5, fontWeight: i === today ? 650 : 400, color: i === today ? COLORS.teal : COLORS.ink }}>
              <span>{d}{i === today ? " (today)" : ""}</span><span>{r ? `${hoursLabel(r[0])} to ${hoursLabel(r[1])}` : "Closed"}</span>
            </div>); })}
        </Card>
        <Card>
          <SectionTitle>Services</SectionTitle>
          {LIBRARY_INFO.services.map((s) => <ListItem key={s.name} icon={ICONS[s.icon] || BookOpen} title={s.name} sub={s.desc} />)}
        </Card>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
        <Button variant="secondary" icon={MapPin} onClick={() => c.go("map")}>Find on the map</Button>
        <Button variant="secondary" icon={Zap} onClick={() => c.go("charging")}>Charging points</Button>
      </div>
    </Screen>
  );
}

// ---------------------------------------------------------------- Canteen
function CanteenPage({ c }) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const outlets = CANTEEN_OUTLETS.map((o) => ({ ...o, shown: o.items.filter((i) => !query || i.n.toLowerCase().includes(query) || o.name.toLowerCase().includes(query)) })).filter((o) => o.shown.length);
  return (
    <Screen title="Canteen and food" subtitle="Outlets, hours and menus." onBack={() => c.go("home")}>
      <InfoBanner>Menus, prices and hours are placeholders until the canteen provides official details.</InfoBanner>
      <div style={{ marginBottom: 18 }}><SearchBox value={q} onChange={setQ} placeholder="Search a dish or outlet" /></div>
      {outlets.length === 0 ? <EmptyState icon={Utensils} title="No dishes found" body={`Nothing matches "${q}".`} action={<Button variant="secondary" onClick={() => setQ("")}>Clear search</Button>} /> : (
        <div className="ce-grid-auto ce-stagger">
          {outlets.map((o) => { const open = isOpenNow(o.hours, c.now); return (
            <Card key={o.id} pad={18}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                <div><h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 650 }}>{o.name}</h3><p style={{ margin: "3px 0 0", fontSize: 12.5, color: COLORS.inkMuted }}>{o.cuisine}</p></div>
                <Pill status={open ? "ok" : "flagged"}>{open ? "Open" : "Closed"}</Pill>
              </div>
              <p style={{ margin: "10px 0", fontSize: 12.5, color: COLORS.inkMuted, display: "flex", gap: 5, alignItems: "center" }}><Clock size={13} />{hoursLabel(o.hours[0])} to {hoursLabel(o.hours[1])} · {o.note}</p>
              {o.shown.map((i, k) => <div key={i.n} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: `1px solid ${COLORS.line}`, fontSize: 13.5 }}><span>{i.n}</span><strong style={{ fontVariantNumeric: "tabular-nums" }}>₹{i.p}</strong></div>)}
            </Card>); })}
        </div>
      )}
    </Screen>
  );
}

// ---------------------------------------------------------------- Hostel
function HostelPage({ c }) {
  return (
    <Screen title="Hostel information" subtitle="Timings and facilities for residents." onBack={() => c.go("home")}>
      <InfoBanner>Placeholder timings. Replace them with the hostel office's official details.</InfoBanner>
      <div className="ce-grid-auto ce-stagger">
        {HOSTEL_INFO.map((s) => { const Ic = ICONS[s.icon] || Clock; return (
          <Card key={s.title} pad={18}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, background: COLORS.tealBg, display: "flex", alignItems: "center", justifyContent: "center" }}><Ic size={17} color={COLORS.teal} /></span>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 650 }}>{s.title}</h3>
            </div>
            {s.rows.map(([k, v], i) => <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderTop: `1px solid ${COLORS.line}`, fontSize: 13.5 }}><span style={{ color: COLORS.inkMuted }}>{k}</span><span style={{ fontWeight: 600, textAlign: "right" }}>{v}</span></div>)}
          </Card>); })}
      </div>
    </Screen>
  );
}

// ---------------------------------------------------------------- Transportation
function TransportPage({ c }) {
  return (
    <Screen title="Transportation" subtitle="Bus routes and the inter-block shuttle." onBack={() => c.go("home")}>
      <InfoBanner>Placeholder routes and times. Replace them with the transport office's current schedule.</InfoBanner>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }} className="ce-stagger">
        {TRANSPORT_ROUTES.map((r) => (
          <Card key={r.id} pad={20}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, background: COLORS.tealBg, display: "flex", alignItems: "center", justifyContent: "center" }}><Bus size={17} color={COLORS.teal} /></span>
              <div><h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 650 }}>{r.name}</h3><p style={{ margin: "2px 0 0", fontSize: 12.5, color: COLORS.inkMuted }}>{r.note}</p></div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, margin: "14px 0" }}>
              {r.stops.map((s, i) => <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600 }}>{s}{i < r.stops.length - 1 && <ChevronRight size={14} color={COLORS.inkFaint} />}</span>)}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{r.times.map((t) => <Tag key={t} tone="primary">{t}</Tag>)}</div>
          </Card>))}
      </div>
    </Screen>
  );
}

// =====================================================================
// PAGES: amenities (existing facility trackers), community, staff, profile, settings
// =====================================================================
const chartTip = () => ({ contentStyle: { fontSize: 12, borderRadius: 10, border: `1px solid ${COLORS.line}`, background: COLORS.surface, color: COLORS.ink, boxShadow: "0 8px 24px rgba(16,24,40,0.12)" }, cursor: { fill: COLORS.tealBg } });
const axisTick = () => ({ fontSize: 11, fill: COLORS.inkMuted });
const amenitiesCrumb = (c) => ({ label: "Campus amenities", onClick: () => c.go("amenities") });

function ActivityList({ c, limit }) {
  const { feed, now } = c;
  if (!feed.length) return <EmptyState icon={Inbox} title="No activity yet" body="Reports and reservations will appear here as they happen." />;
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {feed.slice(0, limit).map((item, i) => (
        <div key={item.id} style={{ display: "flex", gap: 12, padding: "11px 0", borderTop: i ? `1px solid ${COLORS.line}` : "none" }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: item.kind === "report" ? (item.status === "resolved" ? COLORS.okBg : COLORS.coralBg) : COLORS.tealBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {item.kind === "report" ? (item.status === "resolved" ? <CheckCircle2 size={14} color={COLORS.ok} /> : <Flag size={14} color={COLORS.coral} />) : <Clock size={14} color={COLORS.teal} />}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.4 }}>
              {item.kind === "report" ? <>{item.status === "resolved" ? "Resolved" : "Flagged"} <strong style={{ fontWeight: 600 }}>{c.facilityName(item.facilityId)}</strong></> : <>Reserved <strong style={{ fontWeight: 600 }}>{c.facilityName(item.facilityId)}</strong> for {item.slot}</>}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 11.5, color: COLORS.inkMuted }}>{formatRelative(item.timestamp, now)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- Amenities hub
function AmenitiesPage({ c }) {
  const actions = [
    { id: "reserve", label: "Reserve charging", sub: "Book a bay ahead", icon: Clock },
    { id: "scan", label: "Scan a QR code", sub: "Check a water cooler", icon: Camera },
    { id: "report", label: "Report an issue", sub: "Flag something broken", icon: Flag },
  ];
  const nearest = c.facilities.find((f) => f.type === "charging" && f.status === "ok");
  return (
    <Screen title="Campus amenities" subtitle="Live status of charging, vending, washrooms, WiFi and water coolers." onBack={() => c.go("home")} onReport={() => c.goReport("")}>
      {nearest && (
        <button className="ce-btn ce-card-hover" onClick={() => c.go("charging")} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 12, background: COLORS.tealBg, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: "12px 16px", marginBottom: 18 }}>
          <Zap size={17} color={COLORS.teal} /><p style={{ margin: 0, fontSize: 13.5, flex: 1 }}>Nearest free charging bay: <strong>{nearest.name}</strong>, {nearest.floor}</p><ChevronRight size={16} color={COLORS.teal} />
        </button>)}
      <div className="ce-grid-auto ce-stagger" style={{ marginBottom: 22 }}>
        {SERVICE_TILES.map((t) => {
          const Ic = t.icon; const list = c.facilities.filter((f) => f.type === t.type);
          const ok = list.filter((f) => f.status === "ok").length; const bad = list.length - ok;
          return (
            <button key={t.id} className="ce-btn ce-card-hover" onClick={() => c.go(t.id)} style={{ textAlign: "left", padding: 18, background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 14, boxShadow: COLORS.shadow, display: "flex", flexDirection: "column", gap: 14 }}>
              <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ width: 42, height: 42, borderRadius: 12, background: COLORS.tealBg, display: "flex", alignItems: "center", justifyContent: "center" }}><Ic size={20} color={COLORS.teal} /></span>
                <ChevronRight size={17} color={COLORS.inkFaint} />
              </span>
              <span><span style={{ display: "block", fontSize: 15, fontWeight: 650 }}>{t.label}</span><span style={{ display: "block", fontSize: 12.5, color: COLORS.inkMuted, marginTop: 2 }}>{list.length} spots across 3 blocks</span></span>
              <Pill status={bad ? "watch" : "ok"}>{bad ? `${ok} working · ${bad} need attention` : "All working"}</Pill>
            </button>);
        })}
      </div>
      <SectionTitle>Tools</SectionTitle>
      <div className="ce-grid-auto">
        {actions.map((a) => { const Ic = a.icon; return (
          <button key={a.id} className="ce-btn ce-card-hover" onClick={() => (a.id === "report" ? c.goReport("") : c.go(a.id))} style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 14, boxShadow: COLORS.shadow, textAlign: "left" }}>
            <span style={{ width: 38, height: 38, borderRadius: 10, background: COLORS.tealBg, display: "flex", alignItems: "center", justifyContent: "center" }}><Ic size={18} color={COLORS.teal} /></span>
            <span><span style={{ display: "block", fontSize: 14, fontWeight: 600 }}>{a.label}</span><span style={{ display: "block", fontSize: 12, color: COLORS.inkMuted }}>{a.sub}</span></span>
          </button>); })}
      </div>
    </Screen>
  );
}

function FacilityPage({ c, type, title, subtitle, extra }) {
  return (
    <Screen title={title} subtitle={subtitle} parent={amenitiesCrumb(c)} onBack={() => c.go("home")} onReport={() => c.goReport("")} actions={extra}>
      <BlockBrowser facilities={c.facilities.filter((f) => f.type === type)} now={c.now} block={c.block} setBlock={c.setBlock} onRowClick={(f) => c.goReport(f.id)} labels={TYPE_META[type].labels} />
    </Screen>
  );
}

// ---------------------------------------------------------------- Reserve / Scan / Report
function ReservePage({ c }) {
  const r = c.reserve;
  return (
    <Screen title="Reserve charging" subtitle="Book a free bay ahead of your next class." parent={amenitiesCrumb(c)} onBack={() => c.go("home")} onReport={() => c.goReport("")}>
      <div className="ce-grid-eq">
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Field label="Charging bay" error={r.errors.bay}>
              <select className={`ce-select ${r.errors.bay ? "ce-invalid" : ""}`} value={r.facility} onChange={(e) => { r.setFacility(e.target.value); r.setErrors({ ...r.errors, bay: undefined }); }}>
                <option value="">Select a charging bay</option>
                {c.facilities.filter((f) => f.type === "charging").map((f) => <option key={f.id} value={f.id}>{f.floor}, {f.name}</option>)}
              </select>
            </Field>
            <Field label="Time slot" error={r.errors.slot}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {c.slots.map((s) => <Button key={s} size="sm" variant={r.slot === s ? "soft" : "secondary"} onClick={() => { r.setSlot(s); r.setErrors({ ...r.errors, slot: undefined }); }} style={{ borderColor: r.slot === s ? COLORS.teal : COLORS.line, fontVariantNumeric: "tabular-nums" }}>{s}</Button>)}
              </div>
            </Field>
            <Button icon={Clock} onClick={r.submit} style={{ alignSelf: "flex-start" }}>Reserve slot</Button>
          </div>
        </Card>
        <Card>
          <SectionTitle>Your reservations</SectionTitle>
          {c.reservations.length === 0 ? <EmptyState icon={Clock} title="Nothing booked yet" body="Pick a bay and a time slot to reserve your spot." /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {c.reservations.map((x) => (
                <div key={x.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: COLORS.panel2, borderRadius: 10, padding: "10px 12px" }}>
                  <div><p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{c.facilityName(x.facilityId)}</p><p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.inkMuted, fontVariantNumeric: "tabular-nums" }}>{x.slot}</p></div>
                  <Button variant="ghost" size="sm" aria-label="Cancel reservation" icon={X} onClick={() => c.setConfirm({ kind: "cancelRes", id: x.id })} />
                </div>))}
            </div>)}
        </Card>
      </div>
    </Screen>
  );
}

function ScanPage({ c }) {
  const s = c.scan;
  return (
    <Screen title="Scan QR" subtitle="Point your camera at a water cooler's sticker." parent={amenitiesCrumb(c)} onBack={() => c.go("home")}>
      {!s.result ? (
        <div style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 16 }}>
          {!s.scanning && <Button icon={Camera} onClick={s.start} style={{ minHeight: 48, fontSize: 14.5 }}>Start camera</Button>}
          {s.scanning && (
            <div>
              <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", border: `1px solid ${COLORS.line}`, background: "#000" }}>
                <video ref={s.videoRef} playsInline muted style={{ width: "100%", display: "block", maxHeight: 380, objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: "18%", border: "3px solid #fff", borderRadius: 18, boxShadow: "0 0 0 999px rgba(0,0,0,.35)", pointerEvents: "none" }} />
              </div>
              <Button variant="secondary" onClick={s.stop} style={{ width: "100%", marginTop: 10 }}>Cancel</Button>
            </div>)}
          {s.error && (
            <div role="alert" style={{ display: "flex", gap: 10, alignItems: "flex-start", background: COLORS.coralBg, borderRadius: 12, padding: 14 }}>
              <AlertCircle size={16} color={COLORS.coral} style={{ flexShrink: 0, marginTop: 1 }} /><p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>{s.error}</p>
            </div>)}
          <Card>
            <p style={{ margin: "0 0 12px", fontSize: 13.5, fontWeight: 600 }}>No camera handy?</p>
            <Field label="Pick a cooler manually">
              <select className="ce-select" value={s.manual} onChange={(e) => s.setManual(e.target.value)}>
                <option value="">Select a water cooler</option>
                {c.facilities.filter((f) => f.type === "watercooler").map((f) => <option key={f.id} value={f.id}>{f.floor}, {f.name}</option>)}
              </select>
            </Field>
            <Button variant="secondary" disabled={!s.manual} onClick={() => { const f = c.facilities.find((x) => x.id === s.manual); if (f) s.setResult(f); }} style={{ marginTop: 12, width: "100%" }}>View status</Button>
          </Card>
        </div>
      ) : (
        <div className="ce-fade" style={{ maxWidth: 440 }}>
          <Card style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
              <p style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{s.result.name}</p><Pill status={s.result.status}>{TYPE_META[s.result.type].labels[s.result.status]}</Pill>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: COLORS.inkMuted }}>{s.result.floor}</p>
            <p style={{ margin: "14px 0 0", fontSize: 14, display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: COLORS.tealBg, borderRadius: 10 }}>
              <Droplets size={16} color={COLORS.teal} /> Last cleaned <strong>{formatRelative(s.result.lastCleaned, c.now)}</strong>
            </p>
          </Card>
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="secondary" style={{ flex: 1 }} onClick={() => { s.setResult(null); s.setManual(""); }}>Scan another</Button>
            <Button variant="danger" icon={Flag} style={{ flex: 1 }} onClick={() => c.goReport(s.result.id)}>Report an issue</Button>
          </div>
        </div>)}
    </Screen>
  );
}

function ReportPage({ c }) {
  const r = c.report;
  return (
    <Screen title="Report an issue" subtitle="Flag something that needs staff attention." parent={amenitiesCrumb(c)} onBack={() => c.go("home")}>
      <Card style={{ maxWidth: 520 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Field label="Facility" error={r.errors.facility}>
            <select className={`ce-select ${r.errors.facility ? "ce-invalid" : ""}`} value={r.facility} onChange={(e) => { r.setFacility(e.target.value); r.setErrors({ ...r.errors, facility: undefined }); }}>
              <option value="">Select a facility</option>
              {FLOORS.map((fl) => <optgroup key={fl} label={fl}>{c.facilities.filter((f) => f.floor === fl).map((f) => <option key={f.id} value={f.id}>{TYPE_META[f.type].noun}, {f.name}</option>)}</optgroup>)}
            </select>
          </Field>
          <Field label="What's wrong?" error={r.errors.note} hint="One or two sentences is plenty.">
            <textarea className={`ce-textarea ${r.errors.note ? "ce-invalid" : ""}`} rows={5} placeholder="The machine isn't dispensing snacks" value={r.note} onChange={(e) => { r.setNote(e.target.value); r.setErrors({ ...r.errors, note: undefined }); }} style={{ resize: "vertical" }} />
          </Field>
          <Button variant="danger" icon={Flag} onClick={r.submit} style={{ alignSelf: "flex-start" }}>Flag this</Button>
        </div>
      </Card>
    </Screen>
  );
}

// ---------------------------------------------------------------- Clubs
function ClubsPage({ c }) {
  const [q, setQ] = useState(""); const [cat, setCat] = useState("All");
  const cats = ["All", ...Array.from(new Set(CLUBS.map((x) => x.category)))];
  const list = CLUBS.filter((x) => (cat === "All" || x.category === cat) && `${x.name} ${x.desc}`.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <Screen title="Clubs and communities" subtitle="Find your people. Join as many as you like." onBack={() => c.go("home")}>
      <InfoBanner tone="info">Club descriptions and member counts are placeholders. Your joined clubs are saved on this device.</InfoBanner>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}><SearchBox value={q} onChange={setQ} placeholder="Search clubs" /></div>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 18, paddingBottom: 4 }}>{cats.map((x) => <Chip key={x} active={cat === x} onClick={() => setCat(x)}>{x}</Chip>)}</div>
      {list.length === 0 ? <EmptyState icon={Users} title="No clubs found" body="Try another category or search." action={<Button variant="secondary" onClick={() => { setQ(""); setCat("All"); }}>Clear filters</Button>} /> : (
        <div className="ce-grid-auto ce-stagger">
          {list.map((x) => { const on = c.joined.includes(x.id); const evs = c.events.filter((e) => e.club === x.name && e.ts >= c.now).length; return (
            <Card key={x.id} pad={18} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <Avatar name={x.name} size={44} />
                <div style={{ minWidth: 0 }}><h3 style={{ margin: 0, fontSize: 15, fontWeight: 650 }}>{x.name}</h3><p style={{ margin: "2px 0 0", fontSize: 12.5, color: COLORS.inkMuted }}>{x.category} · {x.members + (on ? 1 : 0)} members</p></div>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: COLORS.inkMuted, lineHeight: 1.5, flex: 1 }}>{x.desc}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                {evs > 0 ? <Button variant="ghost" size="sm" onClick={() => c.go("events")}>{evs} upcoming event{evs > 1 ? "s" : ""}</Button> : <span />}
                <Button size="sm" variant={on ? "soft" : "primary"} icon={on ? Check : Plus} onClick={() => c.toggleClub(x.id)}>{on ? "Joined" : "Join"}</Button>
              </div>
            </Card>); })}
        </div>)}
    </Screen>
  );
}

// ---------------------------------------------------------------- Discussions
const THREAD_CATS = ["Academics", "Campus life", "Food", "Clubs", "Other"];
function DiscussionsPage({ c }) {
  const [q, setQ] = useState(""); const [cat, setCat] = useState("All"); const [open, setOpen] = useState(null); const [reply, setReply] = useState("");
  const [adding, setAdding] = useState(false); const [f, setF] = useState({ title: "", body: "", category: "Campus life" }); const [err, setErr] = useState({});
  const author = c.prefs.anonymous ? "Anonymous" : (c.userName.trim() || "Student");
  const list = [...c.threads].filter((t) => (cat === "All" || t.category === cat) && `${t.title} ${t.body}`.toLowerCase().includes(q.trim().toLowerCase())).sort((a, b) => b.ts - a.ts);
  const submit = () => {
    const e = {}; if (!f.title.trim()) e.title = "Add a title."; if (!f.body.trim()) e.body = "Say a little more.";
    setErr(e); if (Object.keys(e).length) return;
    const id = `t-${Date.now()}`;
    c.update({ threads: [{ id, category: f.category, title: f.title.trim(), body: f.body.trim(), author, ts: Date.now(), replies: [] }, ...c.threads] });
    c.markMine(id); setAdding(false); setF({ title: "", body: "", category: "Campus life" }); c.toast("ok", "Discussion started.");
  };
  const sendReply = (t) => {
    if (!reply.trim()) return;
    c.update({ threads: c.threads.map((x) => (x.id === t.id ? { ...x, replies: [...x.replies, { id: `rp-${Date.now()}`, author, body: reply.trim(), ts: Date.now() }] } : x)) });
    setReply("");
  };
  return (
    <Screen title="Student discussions" subtitle="Ask, share and help each other out." onBack={() => c.go("home")} actions={<Button icon={Plus} onClick={() => setAdding(true)}>New discussion</Button>}>
      <InfoBanner tone="info">Posts are saved on this device only, since CampusEase has no shared server yet. Be kind and keep it respectful.</InfoBanner>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}><SearchBox value={q} onChange={setQ} placeholder="Search discussions" /></div>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 18, paddingBottom: 4 }}>{["All", ...THREAD_CATS].map((x) => <Chip key={x} active={cat === x} onClick={() => setCat(x)}>{x}</Chip>)}</div>
      {list.length === 0 ? <EmptyState icon={MessageSquare} title="No discussions yet" body="Start the first one." action={<Button icon={Plus} onClick={() => setAdding(true)}>New discussion</Button>} /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }} className="ce-stagger">
          {list.map((t) => { const isOpen = open === t.id; return (
            <Card key={t.id} pad={0}>
              <button className="ce-btn" onClick={() => { setOpen(isOpen ? null : t.id); setReply(""); }} aria-expanded={isOpen} style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: 18, display: "flex", gap: 12 }}>
                <Avatar name={t.author === "Anonymous" ? "A" : t.author} size={38} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}><Tag tone="primary">{t.category}</Tag><SampleTag item={t} /><span style={{ fontSize: 12, color: COLORS.inkMuted }}>{t.author} · {formatRelative(t.ts, c.now)}</span></span>
                  <span style={{ display: "block", fontSize: 15, fontWeight: 650, lineHeight: 1.35 }}>{t.title}</span>
                  <span style={{ display: "block", fontSize: 13, color: COLORS.inkMuted, marginTop: 4, lineHeight: 1.5 }}>{t.body}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, fontSize: 12.5, fontWeight: 600, color: COLORS.teal }}><MessageSquare size={13} />{t.replies.length} {t.replies.length === 1 ? "reply" : "replies"}</span>
                </span>
              </button>
              {isOpen && (
                <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${COLORS.line}` }}>
                  {t.replies.map((rp) => (
                    <div key={rp.id} style={{ display: "flex", gap: 10, padding: "12px 0", borderBottom: `1px solid ${COLORS.line}` }}>
                      <Avatar name={rp.author === "Anonymous" ? "A" : rp.author} size={30} />
                      <div><p style={{ margin: 0, fontSize: 12, color: COLORS.inkMuted }}><strong style={{ color: COLORS.ink }}>{rp.author}</strong> · {formatRelative(rp.ts, c.now)}</p><p style={{ margin: "3px 0 0", fontSize: 13.5, lineHeight: 1.5 }}>{rp.body}</p></div>
                    </div>))}
                  <form onSubmit={(e) => { e.preventDefault(); sendReply(t); }} style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    <input className="ce-input" aria-label="Write a reply" placeholder="Write a reply" value={reply} onChange={(e) => setReply(e.target.value)} />
                    <Button type="submit" icon={Send} disabled={!reply.trim()}>Reply</Button>
                  </form>
                  {(c.isMine(t.id) || c.staffOk) && !t.sample && <Button variant="ghost" size="sm" icon={Trash2} style={{ marginTop: 10 }} onClick={() => c.update({ threads: c.threads.filter((x) => x.id !== t.id) })}>Delete discussion</Button>}
                </div>)}
            </Card>); })}
        </div>)}
      {adding && (
        <FormModal title="Start a discussion" submitLabel="Post" onClose={() => setAdding(false)} onSubmit={submit}>
          <Field label="Topic"><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{THREAD_CATS.map((x) => <Chip key={x} active={f.category === x} onClick={() => setF({ ...f, category: x })}>{x}</Chip>)}</div></Field>
          <Field label="Title" error={err.title}><input className={`ce-input ${err.title ? "ce-invalid" : ""}`} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
          <Field label="Details" error={err.body} hint={`Posting as ${author}.`}><textarea className={`ce-textarea ${err.body ? "ce-invalid" : ""}`} rows={4} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></Field>
        </FormModal>)}
    </Screen>
  );
}

// ---------------------------------------------------------------- Help and support
function HelpPage({ c }) {
  const [open, setOpen] = useState(0); const [f, setF] = useState({ category: "Facilities", message: "" }); const [err, setErr] = useState("");
  const mine = c.helpRequests.filter((h) => c.isMine(h.id));
  const submit = () => {
    if (!f.message.trim()) return setErr("Tell us what you need help with.");
    const id = `h-${Date.now()}`;
    c.update({ helpRequests: [{ id, category: f.category, message: f.message.trim(), ts: Date.now(), status: "open", from: c.userName.trim() || "Student" }, ...c.helpRequests] });
    c.markMine(id); setF({ ...f, message: "" }); setErr(""); c.toast("ok", "Request sent to campus staff.");
  };
  return (
    <Screen title="Student help and support" subtitle="Quick answers, or ask campus staff directly." onBack={() => c.go("home")}>
      <div className="ce-grid-eq">
        <Card>
          <SectionTitle>Common questions</SectionTitle>
          {FAQ.map((x, i) => (
            <div key={x.q} style={{ borderTop: i ? `1px solid ${COLORS.line}` : "none" }}>
              <button className="ce-btn" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} style={{ width: "100%", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", background: "none", border: "none", padding: "13px 0", textAlign: "left", fontSize: 14, fontWeight: 600 }}>
                {x.q}<ChevronDown size={16} color={COLORS.inkMuted} style={{ flexShrink: 0, transform: open === i ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
              </button>
              {open === i && <p style={{ margin: "0 0 14px", fontSize: 13.5, color: COLORS.inkMuted, lineHeight: 1.55 }}>{x.a}</p>}
            </div>))}
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <SectionTitle hint="Staff will see your request in their queue">Ask for help</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="About"><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{["Facilities", "App or account", "Safety", "Other"].map((x) => <Chip key={x} active={f.category === x} onClick={() => setF({ ...f, category: x })}>{x}</Chip>)}</div></Field>
              <Field label="How can we help?" error={err}><textarea className={`ce-textarea ${err ? "ce-invalid" : ""}`} rows={4} value={f.message} onChange={(e) => { setF({ ...f, message: e.target.value }); setErr(""); }} /></Field>
              <Button icon={Send} onClick={submit} style={{ alignSelf: "flex-start" }}>Send request</Button>
            </div>
          </Card>
          {mine.length > 0 && (
            <Card>
              <SectionTitle>Your requests</SectionTitle>
              {mine.map((h, i) => (
                <div key={h.id} style={{ padding: "11px 0", borderTop: i ? `1px solid ${COLORS.line}` : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}><Tag tone="primary">{h.category}</Tag><Pill status={h.status === "open" ? "watch" : "ok"}>{h.status === "open" ? "Waiting" : "Handled"}</Pill></div>
                  <p style={{ margin: "6px 0 0", fontSize: 13.5, lineHeight: 1.5 }}>{h.message}</p>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: COLORS.inkMuted }}>{formatRelative(h.ts, c.now)}</p>
                </div>))}
            </Card>)}
        </div>
      </div>
    </Screen>
  );
}

// ---------------------------------------------------------------- Staff directory
function DirectoryPage({ c }) {
  const [q, setQ] = useState(""); const [blk, setBlk] = useState("All"); const [openId, setOpenId] = useState(c.openTeacher);
  const list = TEACHERS.filter((t) => (blk === "All" || t.floor === blk) && `${t.name} ${t.dept} ${t.room}`.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <Screen title="Staff directory" subtitle="Find a faculty member's cabin and follow the floor-plan directions." onBack={() => c.go("home")}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}><SearchBox value={q} onChange={setQ} placeholder="Search by name, department or room" /></div>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 18, paddingBottom: 4 }}>{["All", ...FLOORS].map((x) => <Chip key={x} active={blk === x} onClick={() => setBlk(x)}>{x}</Chip>)}</div>
      {list.length === 0 ? <EmptyState icon={Search} title="No staff found" body="Nothing matches that search. Try a department or room number." action={<Button variant="secondary" onClick={() => { setQ(""); setBlk("All"); }}>Clear filters</Button>} /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }} className="ce-stagger">
          {list.map((t) => { const open = openId === t.id; return (
            <Card key={t.id} pad={0} style={{ overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", flexWrap: "wrap" }}>
                <Avatar name={t.name.replace(/^(Dr\.|Prof\.)\s*/, "")} size={44} />
                <div style={{ flex: 1, minWidth: 170 }}><p style={{ margin: 0, fontSize: 14.5, fontWeight: 650 }}>{t.name}</p><p style={{ margin: "2px 0 0", fontSize: 12.5, color: COLORS.inkMuted }}>{t.dept} · {t.floor}, {t.room}</p></div>
                <Button variant={open ? "soft" : "secondary"} size="sm" icon={Navigation} onClick={() => setOpenId(open ? null : t.id)} aria-expanded={open}>{open ? "Hide directions" : "Directions"}</Button>
              </div>
              {open && <div style={{ padding: "16px 16px 18px", borderTop: `1px solid ${COLORS.line}` }}><IndoorMap teacher={t} /></div>}
            </Card>); })}
        </div>)}
    </Screen>
  );
}

// ---------------------------------------------------------------- Faculty contacts
function ContactsPage({ c }) {
  const [q, setQ] = useState("");
  const list = TEACHERS.filter((t) => `${t.name} ${t.dept}`.toLowerCase().includes(q.trim().toLowerCase()));
  const depts = Array.from(new Set(list.map((t) => t.dept)));
  const copy = async (t) => {
    const text = `${t.name}, ${t.dept}, ${t.floor}, ${t.room}`;
    try { await navigator.clipboard.writeText(text); c.toast("ok", "Cabin details copied."); } catch (e) { c.toast("error", "Couldn't copy. Select the text and copy it instead."); }
  };
  return (
    <Screen title="Faculty contacts" subtitle="Where to find faculty, grouped by department." onBack={() => c.go("home")}>
      <InfoBanner tone="info">Phone numbers and email addresses are shared by each department office. Visit the cabin below or ask at the department office.</InfoBanner>
      <div style={{ marginBottom: 18 }}><SearchBox value={q} onChange={setQ} placeholder="Search by name or department" /></div>
      {depts.length === 0 ? <EmptyState icon={Search} title="No matches" body="Try another name or department." /> : (
        <div className="ce-grid-auto ce-stagger">
          {depts.map((d) => (
            <Card key={d} pad={18}>
              <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 650 }}>{d}</h3>
              {list.filter((t) => t.dept === d).map((t, i) => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: `1px solid ${COLORS.line}` }}>
                  <Avatar name={t.name.replace(/^(Dr\.|Prof\.)\s*/, "")} size={34} />
                  <div style={{ flex: 1, minWidth: 0 }}><p style={{ margin: 0, fontSize: 13.5, fontWeight: 600 }}>{t.name}</p><p style={{ margin: "1px 0 0", fontSize: 12, color: COLORS.inkMuted }}>{t.floor}, {t.room}</p></div>
                  <Button variant="ghost" size="sm" aria-label={`Copy cabin details for ${t.name}`} icon={Copy} onClick={() => copy(t)} />
                </div>))}
            </Card>))}
        </div>)}
    </Screen>
  );
}

// ---------------------------------------------------------------- Staff information (PIN protected)
function StaffInfoPage({ c }) {
  const [pin, setPin] = useState(""); const [pinErr, setPinErr] = useState("");
  const [fStatus, setFStatus] = useState("open"); const [fBlock, setFBlock] = useState("all"); const [fSort, setFSort] = useState("oldest");
  if (!c.staffOk) {
    return (
      <Screen title="Staff information" subtitle="Issue queue, cleaning tasks and QR codes for campus staff." onBack={() => c.go("home")}>
        <Card style={{ maxWidth: 400 }}>
          <form onSubmit={(e) => { e.preventDefault(); if (pin === STAFF_PIN) { c.setStaffOk(true); setPinErr(""); c.toast("ok", "Signed in as staff."); } else setPinErr("That PIN isn't right. Check it and try again."); }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <span style={{ width: 44, height: 44, borderRadius: 12, background: COLORS.tealBg, display: "flex", alignItems: "center", justifyContent: "center" }}><ShieldCheck size={21} color={COLORS.teal} /></span>
            <Field label="Staff PIN" error={pinErr}><input className={`ce-input ${pinErr ? "ce-invalid" : ""}`} type="password" autoFocus placeholder="Enter your PIN" value={pin} onChange={(e) => { setPin(e.target.value); setPinErr(""); }} /></Field>
            <Button type="submit">Sign in</Button>
          </form>
        </Card>
      </Screen>
    );
  }
  const tab = c.staffTab; const ins = c.insights;
  const openHelp = c.helpRequests.filter((h) => h.status === "open");
  const rows = c.reports.filter((r) => (fStatus === "all" || r.status === fStatus) && (fBlock === "all" || (c.facilities.find((f) => f.id === r.facilityId) || {}).floor === fBlock))
    .sort((a, b) => fSort === "oldest" ? a.timestamp - b.timestamp : fSort === "newest" ? b.timestamp - a.timestamp : c.facilityName(a.facilityId).localeCompare(c.facilityName(b.facilityId)));
  return (
    <Screen title="Staff information" subtitle="Manage issues, cleaning, QR codes and campus trends." onBack={() => c.go("home")}>
      <Tabs value={tab} onChange={c.setStaffTab} tabs={[{ id: "overview", label: "Overview" }, { id: "issues", label: `Issue queue${c.openQueue.length ? ` (${c.openQueue.length})` : ""}` }, { id: "qr", label: "QR codes" }, { id: "insights", label: "Insights" }, { id: "help", label: `Help requests${openHelp.length ? ` (${openHelp.length})` : ""}` }]} />

      {tab === "overview" && (
        <div className="ce-fade">
          <div className="ce-grid-kpi ce-stagger" style={{ marginBottom: 16 }}>
            <Kpi label="Open issues" value={c.openQueue.length} icon={Flag} tone={c.openQueue.length ? "flagged" : "ok"} hint={c.openQueue.length ? "Needs attention" : "Queue is clear"} />
            <Kpi label="Avg. resolve time" value={ins.avgMins !== null ? `${ins.avgMins}m` : "n/a"} icon={Clock} tone="primary" hint={`${ins.resolvedCount} resolved`} />
            <Kpi label="Coolers due cleaning" value={c.dueCoolers.length} icon={Droplets} tone={c.dueCoolers.length ? "watch" : "ok"} hint="Not cleaned in 24 hours" />
            <Kpi label="Help requests" value={openHelp.length} icon={LifeBuoy} tone={openHelp.length ? "watch" : "ok"} hint="Waiting for a reply" />
          </div>
          <div className="ce-grid-2" style={{ marginBottom: 16 }}>
            <Card>
              <SectionTitle hint="Open reports and cleaning due" right={<Button variant="ghost" size="sm" onClick={() => c.setStaffTab("issues")}>View all</Button>}>Pending tasks</SectionTitle>
              {c.openQueue.length + c.dueCoolers.length === 0 ? <EmptyState icon={CheckCircle2} title="You're all caught up" body="No open issues and every cooler is freshly cleaned." /> : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {c.openQueue.map((r, i) => (
                    <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: i ? `1px solid ${COLORS.line}` : "none", flexWrap: "wrap" }}>
                      <span style={{ width: 32, height: 32, borderRadius: 9, background: COLORS.coralBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Flag size={15} color={COLORS.coral} /></span>
                      <div style={{ flex: 1, minWidth: 160 }}><p style={{ margin: 0, fontSize: 13.5, fontWeight: 600 }}>{c.facilityName(r.facilityId)}</p><p style={{ margin: "2px 0 0", fontSize: 12.5, color: COLORS.inkMuted }}>{r.note} · {formatRelative(r.timestamp, c.now)}</p></div>
                      <Button size="sm" variant="secondary" icon={CheckCircle2} onClick={() => c.setConfirm({ kind: "resolve", id: r.id })}>Resolve</Button>
                    </div>))}
                  {c.dueCoolers.map((f, i) => (
                    <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: c.openQueue.length + i ? `1px solid ${COLORS.line}` : "none", flexWrap: "wrap" }}>
                      <span style={{ width: 32, height: 32, borderRadius: 9, background: COLORS.amberBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Droplets size={15} color={COLORS.amber} /></span>
                      <div style={{ flex: 1, minWidth: 160 }}><p style={{ margin: 0, fontSize: 13.5, fontWeight: 600 }}>Clean water cooler, {f.name}</p><p style={{ margin: "2px 0 0", fontSize: 12.5, color: COLORS.inkMuted }}>{f.floor} · last cleaned {formatRelative(f.lastCleaned, c.now)}</p></div>
                      <Button size="sm" variant="secondary" icon={CheckCircle2} onClick={() => c.markCleaned(f.id)}>Mark cleaned</Button>
                    </div>))}
                </div>)}
            </Card>
            <Card><SectionTitle>Recent activity</SectionTitle><ActivityList c={c} limit={5} /></Card>
          </div>
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 38, height: 38, borderRadius: 10, background: COLORS.amberBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Sparkles size={17} color={COLORS.amber} /></span>
                <div><p style={{ margin: 0, fontSize: 13.5, fontWeight: 600 }}>Simulate live activity</p><p style={{ margin: "2px 0 0", fontSize: 12.5, color: COLORS.inkMuted }}>Randomly nudges facility status every few seconds. Handy for demos.</p></div>
              </div>
              <Switch on={c.simulate} onClick={() => c.setSimulate(!c.simulate)} label="Simulate live activity" />
            </div>
          </Card>
        </div>)}

      {tab === "issues" && (
        <div className="ce-fade">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            <select className="ce-select" aria-label="Filter by status" style={{ width: "auto", minWidth: 150 }} value={fStatus} onChange={(e) => setFStatus(e.target.value)}><option value="open">Open</option><option value="resolved">Resolved</option><option value="all">All statuses</option></select>
            <select className="ce-select" aria-label="Filter by block" style={{ width: "auto", minWidth: 170 }} value={fBlock} onChange={(e) => setFBlock(e.target.value)}><option value="all">All blocks</option>{FLOORS.map((fl) => <option key={fl} value={fl}>{fl}</option>)}</select>
            <select className="ce-select" aria-label="Sort" style={{ width: "auto", minWidth: 160 }} value={fSort} onChange={(e) => setFSort(e.target.value)}><option value="oldest">Oldest first</option><option value="newest">Newest first</option><option value="facility">By facility</option></select>
          </div>
          {rows.length === 0 ? <EmptyState icon={CheckCircle2} title="No issues match" body="Try a different status or block filter." action={<Button variant="secondary" onClick={() => { setFStatus("all"); setFBlock("all"); }}>Reset filters</Button>} /> : (
            <div className="ce-table-wrap"><table className="ce-table">
              <thead><tr><th>Facility</th><th>Block</th><th>Issue</th><th>Reported</th><th>Status</th><th style={{ textAlign: "right" }}>Action</th></tr></thead>
              <tbody>{rows.map((r) => (
                <tr key={r.id}>
                  <td data-label="Facility" style={{ fontWeight: 600 }}>{c.facilityName(r.facilityId)}</td>
                  <td data-label="Block" style={{ color: COLORS.inkMuted }}>{(c.facilities.find((f) => f.id === r.facilityId) || {}).floor || "n/a"}</td>
                  <td data-label="Issue" style={{ color: COLORS.inkMuted, maxWidth: 260 }}>{r.note}</td>
                  <td data-label="Reported" style={{ color: COLORS.inkMuted, whiteSpace: "nowrap" }}>{formatRelative(r.timestamp, c.now)}</td>
                  <td data-label="Status"><Pill status={r.status === "open" ? "flagged" : "ok"}>{r.status === "open" ? "Open" : "Resolved"}</Pill></td>
                  <td data-label="Action" style={{ textAlign: "right" }}>{r.status === "open" ? <Button size="sm" variant="secondary" icon={CheckCircle2} onClick={() => c.setConfirm({ kind: "resolve", id: r.id })}>Resolve</Button> : <span style={{ fontSize: 12, color: COLORS.inkMuted }}>{formatRelative(r.resolvedAt, c.now)}</span>}</td>
                </tr>))}</tbody>
            </table></div>)}
        </div>)}

      {tab === "qr" && (
        <div className="ce-fade">
          <p style={{ margin: "0 0 16px", fontSize: 13.5, color: COLORS.inkMuted, maxWidth: 560 }}>Print one code per cooler and stick it on. Scanning opens CampusEase straight to that cooler's cleaning status.</p>
          <div className="ce-grid-auto">
            {c.facilities.filter((f) => f.type === "watercooler").map((f) => {
              const deepLink = typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}?qr=${f.id}` : `https://example.com/?qr=${f.id}`;
              const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent(deepLink)}`;
              return (
                <Card key={f.id} pad={16} style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{ width: 92, height: 92, borderRadius: 12, background: "#fff", padding: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${COLORS.line}` }}><img src={qrSrc} alt={`QR code for ${f.name}`} width={78} height={78} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{f.name}</p><p style={{ margin: "2px 0 4px", fontSize: 12, color: COLORS.inkMuted }}>{f.floor}</p>
                    <p style={{ margin: "0 0 10px", fontSize: 12, color: COLORS.inkMuted }}>Cleaned {formatRelative(f.lastCleaned, c.now)}</p>
                    <Button size="sm" variant="soft" icon={CheckCircle2} onClick={() => c.markCleaned(f.id)}>Mark cleaned</Button>
                  </div>
                </Card>);
            })}
          </div>
        </div>)}

      {tab === "insights" && (
        <div className="ce-fade">
          <div className="ce-grid-kpi" style={{ marginBottom: 16 }}>
            <Kpi label="Open issues" value={ins.openCount} icon={Flag} tone="flagged" />
            <Kpi label="Avg. resolve time" value={ins.avgMins !== null ? `${ins.avgMins}m` : "n/a"} icon={Clock} tone="primary" />
            <Kpi label="Resolved" value={ins.resolvedCount} icon={CheckCircle2} tone="ok" />
            <Card pad={18}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}><span style={{ fontSize: 13, fontWeight: 500, color: COLORS.inkMuted }}>Most flagged</span><span style={{ width: 34, height: 34, borderRadius: 10, background: COLORS.amberBg, display: "flex", alignItems: "center", justifyContent: "center" }}><TrendingUp size={17} color={COLORS.amber} /></span></div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 650, lineHeight: 1.3 }}>{ins.topFacility}</p>
            </Card>
          </div>
          <div className="ce-grid-eq">
            {[["Where problems happen", "Reports by facility type", ins.byType, COLORS.coral, 28], ["Which blocks need most help", "Reports by block", ins.byFloor, COLORS.teal, 36]].map(([t, h, data, fill, bs]) => (
              <Card key={t}>
                <SectionTitle hint={h}>{t}</SectionTitle>
                <div style={{ height: 220 }}><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }} barSize={bs}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} vertical={false} /><XAxis dataKey="name" tick={axisTick()} axisLine={{ stroke: COLORS.line }} tickLine={false} /><YAxis allowDecimals={false} tick={axisTick()} axisLine={false} tickLine={false} />
                  <Tooltip {...chartTip()} /><Bar dataKey="count" name="Reports" fill={fill} radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
              </Card>))}
          </div>
        </div>)}

      {tab === "help" && (
        <div className="ce-fade">
          {c.helpRequests.length === 0 ? <EmptyState icon={LifeBuoy} title="No help requests" body="Requests from the Student help page appear here." /> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {c.helpRequests.map((h) => (
                <Card key={h.id} pad={16}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Tag tone="primary">{h.category}</Tag><span style={{ fontSize: 12.5, color: COLORS.inkMuted }}>{h.from} · {formatRelative(h.ts, c.now)}</span></div>
                    <Pill status={h.status === "open" ? "watch" : "ok"}>{h.status === "open" ? "Waiting" : "Handled"}</Pill>
                  </div>
                  <p style={{ margin: "8px 0 10px", fontSize: 13.5, lineHeight: 1.5 }}>{h.message}</p>
                  {h.status === "open" && <Button size="sm" variant="secondary" icon={CheckCircle2} onClick={() => c.update({ helpRequests: c.helpRequests.map((x) => (x.id === h.id ? { ...x, status: "handled" } : x)) })}>Mark handled</Button>}
                </Card>))}
            </div>)}
        </div>)}
    </Screen>
  );
}

// ---------------------------------------------------------------- Profile
function ProfilePage({ c }) {
  const [name, setName] = useState(c.userName);
  const myClubs = CLUBS.filter((x) => c.joined.includes(x.id));
  const myEvents = c.events.filter((e) => c.rsvps.includes(e.id));
  const myItems = c.lostFound.filter((l) => c.isMine(l.id));
  return (
    <Screen title="My profile" subtitle="Your details stay on this device." onBack={() => c.go("home")}>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <Avatar name={c.userName} size={64} tone="solid" />
          <div style={{ flex: 1, minWidth: 220 }}>
            <form onSubmit={(e) => { e.preventDefault(); c.setUserName(name); c.toast("ok", "Profile saved."); }} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input className="ce-input" aria-label="Your name" style={{ flex: 1, minWidth: 160, maxWidth: 300 }} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
              <Button type="submit" disabled={name === c.userName}>Save</Button>
            </form>
            <p style={{ margin: "8px 0 0", fontSize: 12.5, color: COLORS.inkMuted }}>{c.staffOk ? "Signed in as staff" : "Student view"} · {CAMPUS.name}</p>
          </div>
        </div>
      </Card>
      <div className="ce-grid-kpi" style={{ marginBottom: 16 }}>
        <Kpi label="Clubs joined" value={myClubs.length} icon={Users} />
        <Kpi label="Events going" value={myEvents.length} icon={CalendarDays} />
        <Kpi label="Items posted" value={myItems.length} icon={PackageSearch} />
        <Kpi label="Reservations" value={c.reservations.length} icon={Clock} />
      </div>
      <div className="ce-grid-eq">
        <Card>
          <SectionTitle>My clubs</SectionTitle>
          {myClubs.length === 0 ? <EmptyState icon={Users} title="No clubs yet" body="Join a club to see it here." action={<Button variant="secondary" onClick={() => c.go("clubs")}>Browse clubs</Button>} /> : myClubs.map((x) => <ListItem key={x.id} icon={Users} title={x.name} sub={x.category} onClick={() => c.go("clubs")} />)}
        </Card>
        <Card>
          <SectionTitle>Events I'm going to</SectionTitle>
          {myEvents.length === 0 ? <EmptyState icon={CalendarDays} title="No events yet" body="Tap I'm going on an event to save it here." action={<Button variant="secondary" onClick={() => c.go("events")}>See events</Button>} /> : myEvents.map((e) => <ListItem key={e.id} icon={CalendarDays} title={e.title} sub={`${fmtDate(e.ts)}, ${fmtTime(e.ts)} · ${e.venue}`} onClick={() => c.go("events")} />)}
        </Card>
      </div>
    </Screen>
  );
}

// ---------------------------------------------------------------- Notifications
function NotificationsPage({ c }) {
  const [only, setOnly] = useState("all");
  const items = c.notifItems.filter((n) => only === "all" || !c.readIds.includes(n.id));
  return (
    <Screen title="Notifications" subtitle="Alerts that match your notification preferences." onBack={() => c.go("home")}
      actions={<><Button variant="secondary" icon={Settings} onClick={() => c.go("settings-notifications")}>Preferences</Button><Button variant="secondary" icon={CheckCircle2} onClick={c.readAll} disabled={!c.unreadCount}>Mark all as read</Button></>}>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}><Chip active={only === "all"} onClick={() => setOnly("all")}>All</Chip><Chip active={only === "unread"} onClick={() => setOnly("unread")} count={c.unreadCount}>Unread</Chip></div>
      {items.length === 0 ? <EmptyState icon={BellRing} title={only === "unread" ? "You're all caught up" : "No notifications"} body="New alerts will show up here. You can choose what to hear about in preferences." action={<Button variant="secondary" onClick={() => c.go("settings-notifications")}>Open preferences</Button>} /> : (
        <Card pad={8}>
          {items.map((n, i) => { const unread = !c.readIds.includes(n.id); return (
            <div key={n.id} style={{ padding: "2px 12px", borderTop: i ? `1px solid ${COLORS.line}` : "none", background: unread ? COLORS.tealBg : "transparent", borderRadius: 10 }}>
              <ListItem icon={n.icon} tone={n.tone} title={n.title} sub={n.sub} onClick={() => { c.markRead(n.id); c.go(n.screen); }} right={<span style={{ display: "flex", alignItems: "center", gap: 8 }}>{unread && <span aria-label="Unread" style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.teal }} />}<span style={{ fontSize: 12, color: COLORS.inkMuted, whiteSpace: "nowrap" }}>{n.when || formatRelative(n.ts, c.now)}</span></span>} />
            </div>); })}
        </Card>)}
    </Screen>
  );
}

// ---------------------------------------------------------------- Settings
function SettingsShell({ c, id, title, subtitle, children }) {
  const tabs = [["settings-appearance", "Appearance", Palette], ["settings-account", "Account", UserRound], ["settings-notifications", "Notifications", BellRing], ["settings-privacy", "Privacy", Lock]];
  return (
    <Screen title={title} subtitle={subtitle} parent={{ label: "Settings", onClick: () => c.go("settings-appearance") }} onBack={() => c.go("home")}>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 20, paddingBottom: 4 }}>{tabs.map(([sid, l, Ic]) => <Chip key={sid} active={id === sid} onClick={() => c.go(sid)}><Ic size={13} />{l}</Chip>)}</div>
      <Card style={{ maxWidth: 640 }}>{children}</Card>
    </Screen>
  );
}

function SettingsAppearance({ c }) {
  const opts = [["light", "Light", Sun, "#F8FAFC", "#FFFFFF", "#1E293B"], ["dark", "Dark", Moon, "#0B1220", "#101828", "#F1F5F9"], ["system", "System default", Monitor, "linear-gradient(90deg,#F8FAFC 50%,#0B1220 50%)", "#94A3B8", "#475569"]];
  return (
    <SettingsShell c={c} id="settings-appearance" title="Appearance" subtitle="Choose how CampusEase looks. Changes apply instantly.">
      <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600 }}>Theme</p>
      <div role="radiogroup" aria-label="Theme" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 20 }}>
        {opts.map(([id, label, Ic, bg, card, ink]) => { const on = c.themePref === id; return (
          <button key={id} role="radio" aria-checked={on} className="ce-btn" onClick={() => c.setThemePref(id)} style={{ textAlign: "left", padding: 10, borderRadius: 14, background: COLORS.surface, border: `2px solid ${on ? COLORS.teal : COLORS.line}` }}>
            <span style={{ display: "block", height: 62, borderRadius: 9, background: bg, padding: 8, marginBottom: 10, border: `1px solid ${COLORS.line}` }}>
              <span style={{ display: "block", height: 8, width: "50%", borderRadius: 4, background: ink, opacity: 0.8, marginBottom: 6 }} /><span style={{ display: "block", height: 22, borderRadius: 6, background: card, border: "1px solid rgba(100,116,139,.25)" }} />
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13.5, fontWeight: 600 }}><Ic size={15} color={on ? COLORS.teal : COLORS.inkMuted} />{label}{on && <Check size={14} color={COLORS.teal} style={{ marginLeft: "auto" }} />}</span>
          </button>); })}
      </div>
      <ToggleRow title="Start with the sidebar collapsed" desc="Gives pages more room on large screens." on={c.prefs.startCollapsed} onChange={(v) => c.setPref("startCollapsed", v)} />
    </SettingsShell>
  );
}

function SettingsAccount({ c }) {
  const [name, setName] = useState(c.userName);
  return (
    <SettingsShell c={c} id="settings-account" title="Account settings" subtitle="Your name and staff access.">
      <form onSubmit={(e) => { e.preventDefault(); c.setUserName(name); c.toast("ok", "Name saved."); }} style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 6 }}>
        <Field label="Display name" hint="Used for your greeting and in discussions (unless you post anonymously)."><input className="ce-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" /></Field>
        <Button type="submit" disabled={name === c.userName} style={{ alignSelf: "flex-start" }}>Save name</Button>
      </form>
      <div style={{ borderTop: `1px solid ${COLORS.line}`, marginTop: 18, paddingTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div><p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Staff access</p><p style={{ margin: "3px 0 0", fontSize: 12.5, color: COLORS.inkMuted }}>{c.staffOk ? "You are signed in as staff on this device." : "Sign in with the staff PIN to manage issues and post notices."}</p></div>
        {c.staffOk ? <Button variant="secondary" icon={LogOut} onClick={c.exitStaff}>Sign out of staff</Button> : <Button variant="secondary" icon={ShieldCheck} onClick={() => c.go("admin")}>Staff sign-in</Button>}
      </div>
      <div style={{ borderTop: `1px solid ${COLORS.line}`, marginTop: 18, paddingTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div><p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Restore sample content</p><p style={{ margin: "3px 0 0", fontSize: 12.5, color: COLORS.inkMuted }}>Resets notices, events, posts and facility status on this device.</p></div>
        <Button variant="danger" icon={Trash2} onClick={() => c.setConfirm({ kind: "reset" })}>Restore</Button>
      </div>
    </SettingsShell>
  );
}

function SettingsNotifications({ c }) {
  return (
    <SettingsShell c={c} id="settings-notifications" title="Notification preferences" subtitle="Choose what shows up in your alerts and the bell.">
      <ToggleRow title="Facility alerts" desc="Out-of-order and needs-attention amenities." on={c.prefs.notifFacility} onChange={(v) => c.setPref("notifFacility", v)} />
      <ToggleRow title="Notices" desc="New posts on the notice board." on={c.prefs.notifNotices} onChange={(v) => c.setPref("notifNotices", v)} />
      <ToggleRow title="Events" desc="Events happening in the next week." on={c.prefs.notifEvents} onChange={(v) => c.setPref("notifEvents", v)} />
      <ToggleRow title="Lost and found" desc="Newly reported lost or found items." on={c.prefs.notifLostFound} onChange={(v) => c.setPref("notifLostFound", v)} />
    </SettingsShell>
  );
}

function SettingsPrivacy({ c }) {
  return (
    <SettingsShell c={c} id="settings-privacy" title="Privacy settings" subtitle="Control what you share, and clear what's stored on this device.">
      <ToggleRow title="Post anonymously by default" desc="Discussions and replies show as Anonymous instead of your name." on={c.prefs.anonymous} onChange={(v) => c.setPref("anonymous", v)} />
      <ToggleRow title="Allow contact details on Lost and found posts" desc="Turn off to stop adding contact info to your posts." on={c.prefs.showContact} onChange={(v) => c.setPref("showContact", v)} />
      <div style={{ borderTop: `1px solid ${COLORS.line}`, marginTop: 6, paddingTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div><p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Clear my data on this device</p><p style={{ margin: "3px 0 0", fontSize: 12.5, color: COLORS.inkMuted, maxWidth: 380 }}>Removes your name, joined clubs, event RSVPs, preferences and read alerts. Shared content stays.</p></div>
        <Button variant="danger" icon={Trash2} onClick={() => c.setConfirm({ kind: "clearMine" })}>Clear</Button>
      </div>
    </SettingsShell>
  );
}

// =====================================================================
// NAVIGATION + APP SHELL
// =====================================================================
const TYPE_SCREEN = { charging: "charging", vending: "vending", washroom: "washroom", wifi: "wifi", watercooler: "water" };
const SERVICE_TILES = [
  { id: "charging", label: "Charging", icon: Zap, type: "charging" },
  { id: "vending", label: "Vending", icon: Cookie, type: "vending" },
  { id: "washroom", label: "Washrooms", icon: Wind, type: "washroom" },
  { id: "wifi", label: "WiFi", icon: Wifi, type: "wifi" },
  { id: "water", label: "Water coolers", icon: Droplets, type: "watercooler" },
];
const NAV_GROUPS = [
  { id: "home", label: "Home", items: [
    { id: "home", label: "Dashboard", icon: LayoutDashboard }, { id: "profile", label: "My Profile", icon: UserRound }, { id: "notifications", label: "Notifications", icon: Bell } ] },
  { id: "info", label: "Campus information", items: [
    { id: "map", label: "Campus Map", icon: MapIcon }, { id: "events", label: "Events & Activities", icon: CalendarDays }, { id: "notices", label: "Notice Board", icon: Newspaper },
    { id: "lostfound", label: "Lost & Found", icon: PackageSearch }, { id: "updates", label: "Campus Updates", icon: Megaphone } ] },
  { id: "facilities", label: "Campus facilities", items: [
    { id: "library", label: "Library Information", icon: BookOpen }, { id: "canteen", label: "Canteen & Food Services", icon: Utensils }, { id: "hostel", label: "Hostel Information", icon: HomeIcon },
    { id: "transport", label: "Transportation", icon: Bus }, { id: "amenities", label: "Campus Amenities", icon: Zap } ] },
  { id: "community", label: "Student community", items: [
    { id: "clubs", label: "Clubs & Communities", icon: Users }, { id: "discussions", label: "Student Discussions", icon: MessageSquare }, { id: "help", label: "Student Help & Support", icon: LifeBuoy } ] },
  { id: "staff", label: "Staff", items: [
    { id: "directory", label: "Staff Directory", icon: GraduationCap }, { id: "staffinfo", label: "Staff Information", icon: ShieldCheck }, { id: "contacts", label: "Faculty Contacts", icon: ClipboardList } ] },
  { id: "settings", label: "Settings", items: [
    { id: "settings-appearance", label: "Appearance", icon: Palette }, { id: "settings-account", label: "Account Settings", icon: Settings },
    { id: "settings-notifications", label: "Notification Preferences", icon: BellRing }, { id: "settings-privacy", label: "Privacy Settings", icon: Lock } ] },
];
const ALL_NAV = NAV_GROUPS.flatMap((g) => g.items.map((i) => ({ ...i, group: g.id })));
const AMENITY_SCREENS = ["charging", "vending", "washroom", "wifi", "water", "reserve", "scan", "report"];
const activeNavId = (s) => (AMENITY_SCREENS.includes(s) ? "amenities" : s);
const groupOf = (s) => (ALL_NAV.find((i) => i.id === activeNavId(s)) || { group: "home" }).group;

export default function CampusEase() {
  const [data, setData] = useState(null);
  const dataRef = useRef(null);
  const [themePref, setThemePrefState] = useState(() => lsGet("ce-theme", "system"));
  const [sysDark, setSysDark] = useState(() => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)").matches : false));
  const theme = themePref === "system" ? (sysDark ? "dark" : "light") : themePref;
  Object.assign(COLORS, theme === "dark" ? DARK : LIGHT);
  const setThemePref = (v) => { setThemePrefState(v); lsSet("ce-theme", v); };

  const [entered, setEntered] = useState(() => lsGet("ce-entered", false));
  const [screen, setScreen] = useState("home");
  const [now, setNow] = useState(Date.now());
  const [toast, setToast] = useState(null);
  const [simulate, setSimulate] = useState(false);

  const [prefs, setPrefs] = useState(() => ({ ...DEFAULT_PREFS, ...lsGet("ce-prefs", {}) }));
  const setPref = (k, v) => setPrefs((p) => { const n = { ...p, [k]: v }; lsSet("ce-prefs", n); return n; });
  const [userName, setUserNameState] = useState(() => lsGet("ce-name", ""));
  const setUserName = (v) => { setUserNameState(v); lsSet("ce-name", v); };
  const [rsvps, setRsvps] = useState(() => lsGet("ce-rsvps", []));
  const [joined, setJoined] = useState(() => lsGet("ce-clubs", []));
  const [readIds, setReadIds] = useState(() => lsGet("ce-read", []));
  const [mine, setMine] = useState(() => lsGet("ce-mine", []));

  const [collapsed, setCollapsed] = useState(() => lsGet("ce-prefs", {}).startCollapsed === true);
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(null);
  const [openGroups, setOpenGroups] = useState({ home: true, info: true });
  const [searchQ, setSearchQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const [staffOk, setStaffOk] = useState(false);
  const [staffTab, setStaffTab] = useState("overview");
  const [block, setBlock] = useState(null);
  const [openTeacher, setOpenTeacher] = useState(null);

  const [reportFacility, setReportFacility] = useState("");
  const [reportNote, setReportNote] = useState("");
  const [reportErrors, setReportErrors] = useState({});
  const [reserveFacility, setReserveFacility] = useState("");
  const [reserveSlot, setReserveSlot] = useState("");
  const [reserveErrors, setReserveErrors] = useState({});

  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState("");
  const [manualCooler, setManualCooler] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanLoopRef = useRef(false);
  const scanSupported = typeof window !== "undefined" && "BarcodeDetector" in window;

  // system theme listener
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const on = (e) => setSysDark(e.matches);
    if (mq.addEventListener) mq.addEventListener("change", on); else mq.addListener(on);
    return () => { if (mq.removeEventListener) mq.removeEventListener("change", on); else mq.removeListener(on); };
  }, []);
  useEffect(() => { try { document.body.style.background = COLORS.bg; document.documentElement.style.colorScheme = theme; } catch (e) {} }, [theme]);

  useEffect(() => {
    const check = () => { if (window.location.hash === "#staff") { setEntered(true); setScreen("staffinfo"); } };
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, []);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") { setMenu(null); setConfirm(null); setDrawer(false); setSearchOpen(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t); }, []);
  useEffect(() => { setBlock(null); const g = groupOf(screen); setOpenGroups((o) => (o[g] ? o : { ...o, [g]: true })); }, [screen]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) throw new Error("empty");
        if (!cancelled) setData(JSON.parse(raw));
      } catch (e) {
        const initial = { facilities: defaultFacilities(), reports: seedReports(), reservations: [], ...defaultCampusData() };
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(initial)); } catch (e2) {}
        if (!cancelled) setData(initial);
      }
    })();
    return () => { cancelled = true; };
  }, []);
  dataRef.current = data;

  const showToast = (kind, text) => { setToast({ kind, text }); setTimeout(() => setToast(null), 2800); };
  const persist = async (next) => {
    dataRef.current = next;
    setData(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
    catch (e) { setToast({ kind: "error", text: "Couldn't save. Check your connection and try again." }); }
  };
  const update = (patch) => persist({ ...dataRef.current, ...patch });

  const facilities = data?.facilities ?? [];
  const reports = data?.reports ?? [];
  const reservations = data?.reservations ?? [];
  const notices = data?.notices ?? [];
  const events = data?.events ?? [];
  const lostFound = data?.lostFound ?? [];
  const threads = data?.threads ?? [];
  const helpRequests = data?.helpRequests ?? [];

  // QR deep link
  useEffect(() => {
    if (!data) return;
    try {
      const qrId = new URLSearchParams(window.location.search).get("qr");
      if (qrId) {
        const f = (data.facilities || []).find((x) => x.id === qrId);
        if (f) { setEntered(true); setScanResult(f); setScreen("scan"); showToast("ok", `Scanned: ${f.name}`); }
      }
    } catch (e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data === null]);

  useEffect(() => {
    if (!simulate || !data) return;
    const t = setInterval(() => {
      const d = dataRef.current; const eligible = d.facilities.filter((f) => f.status !== "flagged");
      if (!eligible.length) return;
      const pick = eligible[Math.floor(Math.random() * eligible.length)];
      persist({ ...d, facilities: d.facilities.map((f) => (f.id === pick.id ? { ...f, status: pick.status === "ok" ? "watch" : "ok", updatedAt: Date.now() } : f)) });
    }, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulate, data === null]);

  const facility = (id) => facilities.find((x) => x.id === id);
  const facilityName = (id) => { const f = facility(id); return f ? `${TYPE_META[f.type].noun}, ${f.name}` : "Unknown facility"; };
  const slots = useMemo(() => generateSlots(now), [now]);

  // ---- actions ----
  const submitReport = () => {
    const errs = {};
    if (!reportFacility) errs.facility = "Choose the facility that has a problem.";
    if (!reportNote.trim()) errs.note = "Describe what's wrong so staff know what to fix.";
    setReportErrors(errs);
    if (Object.keys(errs).length) return;
    persist({ ...data,
      facilities: facilities.map((f) => (f.id === reportFacility ? { ...f, status: "flagged", updatedAt: Date.now() } : f)),
      reports: [{ id: `r-${Date.now()}`, facilityId: reportFacility, note: reportNote.trim(), timestamp: Date.now(), status: "open" }, ...reports] });
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
    setReserveSlot(""); showToast("ok", "Reserved. See you then.");
  };
  const cancelReservation = (id) => { persist({ ...data, reservations: reservations.filter((r) => r.id !== id) }); showToast("ok", "Reservation cancelled."); };
  const resolveReport = (id) => {
    const report = reports.find((r) => r.id === id); if (!report) return;
    persist({ ...data,
      reports: reports.map((r) => (r.id === id ? { ...r, status: "resolved", resolvedAt: Date.now() } : r)),
      facilities: facilities.map((f) => (f.id === report.facilityId ? { ...f, status: "ok", updatedAt: Date.now() } : f)) });
    showToast("ok", "Marked resolved.");
  };
  const markCleaned = (id) => { persist({ ...data, facilities: facilities.map((f) => (f.id === id ? { ...f, status: "ok", updatedAt: Date.now(), lastCleaned: Date.now() } : f)) }); showToast("ok", "Marked as cleaned just now."); };

  const toggleRsvp = (id) => setRsvps((r) => { const n = r.includes(id) ? r.filter((x) => x !== id) : [...r, id]; lsSet("ce-rsvps", n); return n; });
  const toggleClub = (id) => setJoined((r) => { const n = r.includes(id) ? r.filter((x) => x !== id) : [...r, id]; lsSet("ce-clubs", n); return n; });
  const markMine = (id) => setMine((r) => { const n = r.includes(id) ? r : [...r, id]; lsSet("ce-mine", n); return n; });
  const isMine = (id) => mine.includes(id);
  const markRead = (id) => setReadIds((r) => { if (r.includes(id)) return r; const n = [...r, id].slice(-300); lsSet("ce-read", n); return n; });

  // ---- derived ----
  const openQueue = useMemo(() => reports.filter((r) => r.status === "open").sort((a, b) => a.timestamp - b.timestamp), [reports]);
  const feed = useMemo(() => [...reports.map((r) => ({ kind: "report", ...r })), ...reservations.map((r) => ({ kind: "reservation", ...r }))].sort((a, b) => b.timestamp - a.timestamp), [reports, reservations]);
  const dueCoolers = useMemo(() => facilities.filter((f) => f.type === "watercooler" && f.lastCleaned && now - f.lastCleaned > 24 * 3600000), [facilities, now]);
  const insights = useMemo(() => {
    const byType = { charging: 0, vending: 0, washroom: 0, wifi: 0, watercooler: 0 };
    const byFloor = {}; FLOORS.forEach((fl) => { byFloor[fl] = 0; });
    const per = {};
    reports.forEach((r) => { const f = facilities.find((x) => x.id === r.facilityId); if (!f) return; byType[f.type]++; byFloor[f.floor]++; per[r.facilityId] = (per[r.facilityId] || 0) + 1; });
    const resolved = reports.filter((r) => r.status === "resolved" && r.resolvedAt);
    const avgMins = resolved.length ? Math.round(resolved.reduce((s, r) => s + (r.resolvedAt - r.timestamp), 0) / resolved.length / 60000) : null;
    let topId = null, topCount = 0; Object.entries(per).forEach(([id, n]) => { if (n > topCount) { topCount = n; topId = id; } });
    return {
      byType: [{ name: "Charge", count: byType.charging }, { name: "Vending", count: byType.vending }, { name: "Wash", count: byType.washroom }, { name: "WiFi", count: byType.wifi }, { name: "Water", count: byType.watercooler }],
      byFloor: FLOORS.map((fl) => ({ name: BLOCK_SHORT[fl] || fl, count: byFloor[fl] })),
      avgMins, topFacility: topId ? facilityName(topId) : "None yet", openCount: openQueue.length, resolvedCount: resolved.length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reports, facilities, openQueue]);

  const updates = useMemo(() => {
    const out = [];
    reports.forEach((r) => out.push({ id: `u-r-${r.id}`, kind: "facility", icon: r.status === "resolved" ? CheckCircle2 : Flag, tone: r.status === "resolved" ? "ok" : "flagged",
      title: `${r.status === "resolved" ? "Fixed" : "Reported"}: ${facilityName(r.facilityId)}`, sub: r.status === "resolved" ? "Back in service" : r.note, ts: r.status === "resolved" && r.resolvedAt ? r.resolvedAt : r.timestamp, screen: TYPE_SCREEN[(facility(r.facilityId) || {}).type] || "amenities" }));
    notices.forEach((n) => out.push({ id: `u-n-${n.id}`, kind: "notice", icon: Newspaper, tone: "primary", title: n.title, sub: `Notice · ${n.tag}`, ts: n.ts, screen: "notices" }));
    events.filter((e) => e.ts >= now - DAY).forEach((e) => out.push({ id: `u-e-${e.id}`, kind: "event", icon: CalendarDays, tone: "primary", title: e.title, sub: `Event · ${fmtDate(e.ts)}, ${fmtTime(e.ts)}`, ts: Math.min(e.ts, now), screen: "events" }));
    lostFound.forEach((l) => out.push({ id: `u-l-${l.id}`, kind: "lostfound", icon: PackageSearch, tone: l.status === "returned" ? "ok" : "watch", title: `${l.kind === "lost" ? "Lost" : "Found"}: ${l.item}`, sub: l.status === "returned" ? "Returned to owner" : l.location, ts: l.ts, screen: "lostfound" }));
    threads.forEach((t) => out.push({ id: `u-t-${t.id}`, kind: "community", icon: MessageSquare, tone: "primary", title: t.title, sub: `Discussion · ${t.category}`, ts: t.ts, screen: "discussions" }));
    return out.sort((a, b) => b.ts - a.ts).slice(0, 40);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reports, notices, events, lostFound, threads, facilities, now]);

  const notifItems = useMemo(() => {
    const out = [];
    if (prefs.notifFacility) facilities.filter((f) => f.status === "flagged").forEach((f) => out.push({ id: `nf-${f.id}-${f.status}-${f.updatedAt}`, icon: TYPE_META[f.type].icon, tone: f.status === "flagged" ? "flagged" : "watch", title: `${TYPE_META[f.type].noun}, ${f.name}: ${TYPE_META[f.type].labels[f.status]}`, sub: f.floor, ts: f.updatedAt || now, screen: TYPE_SCREEN[f.type] }));
    if (prefs.notifNotices) notices.filter((n) => n.pinned || now - n.ts < 7 * DAY).forEach((n) => out.push({ id: `nn-${n.id}`, icon: Newspaper, tone: "primary", title: n.title, sub: `Notice · ${n.tag}`, ts: n.ts, screen: "notices" }));
    if (prefs.notifEvents) events.filter((e) => e.ts >= now && e.ts < now + 7 * DAY).forEach((e) => out.push({ id: `ne-${e.id}`, icon: CalendarDays, tone: "primary", title: `Coming up: ${e.title}`, sub: `${fmtDate(e.ts)}, ${fmtTime(e.ts)} · ${e.venue}`, ts: now, when: "Soon", screen: "events" }));
    if (prefs.notifLostFound) lostFound.filter((l) => l.status === "open" && now - l.ts < 7 * DAY).forEach((l) => out.push({ id: `nl-${l.id}`, icon: PackageSearch, tone: "watch", title: `${l.kind === "lost" ? "Lost" : "Found"}: ${l.item}`, sub: l.location, ts: l.ts, screen: "lostfound" }));
    return out.sort((a, b) => b.ts - a.ts);
  }, [prefs, facilities, notices, events, lostFound, now]);
  const unreadCount = notifItems.filter((n) => !readIds.includes(n.id)).length;
  const readAll = () => { const n = Array.from(new Set([...readIds, ...notifItems.map((x) => x.id)])).slice(-300); setReadIds(n); lsSet("ce-read", n); };

  // ---- scanning ----
  const stopScanning = () => {
    scanLoopRef.current = false;
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    setScanning(false);
  };
  const parseFacilityId = (raw) => { const m = raw.match(/[?&]qr=([^&]+)/); return m ? decodeURIComponent(m[1]) : raw.trim(); };
  const startScanning = async () => {
    setScanError(""); setScanResult(null);
    if (!scanSupported) { setScanError("QR scanning needs Chrome on Android (or another browser with camera barcode support). You can pick a cooler manually below."); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setScanning(true);
      await new Promise((r) => setTimeout(r, 80));
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      scanLoopRef.current = true;
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      const loop = async () => {
        if (!scanLoopRef.current || !videoRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes && codes.length > 0) {
            const f = facility(parseFacilityId(codes[0].rawValue || ""));
            stopScanning();
            if (f) { setScanResult(f); showToast("ok", `Scanned: ${f.name}`); } else setScanError("That QR code isn't recognized by CampusEase.");
            return;
          }
        } catch (e) {}
        if (scanLoopRef.current) requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    } catch (e) {
      if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
      setScanError("Camera access was denied. Allow camera permission in your browser and try again."); setScanning(false);
    }
  };
  useEffect(() => () => stopScanning(), []);

  // ---- navigation ----
  const closeOverlays = () => { setDrawer(false); setMenu(null); setSearchOpen(false); };
  const go = (id) => {
    const target = id === "admin" || id === "teachers" ? (id === "admin" ? "staffinfo" : "directory") : id;
    if (target !== "scan") { stopScanning(); setScanResult(null); setScanError(""); }
    if (target !== "directory") setOpenTeacher(null);
    setScreen(target); closeOverlays();
    try { window.scrollTo({ top: 0 }); } catch (e) {}
  };
  const goReport = (facilityId) => { if (facilityId) setReportFacility(facilityId); setReportErrors({}); go("report"); };
  const goStaff = (tab) => { setStaffTab(tab || "overview"); go("staffinfo"); };
  const exitStaff = () => {
    if (window.location.hash === "#staff") window.history.replaceState(null, "", window.location.pathname + window.location.search);
    setStaffOk(false); go("home"); showToast("ok", "Signed out of staff mode.");
  };
  const enter = () => { setEntered(true); lsSet("ce-entered", true); };

  const resetAll = () => {
    persist({ facilities: defaultFacilities(), reports: seedReports(), reservations: [], ...defaultCampusData() });
    showToast("ok", "Sample content restored.");
  };
  const clearMine = () => {
    ["ce-name", "ce-clubs", "ce-rsvps", "ce-prefs", "ce-read", "ce-mine", "ce-entered"].forEach((k) => { try { localStorage.removeItem(k); } catch (e) {} });
    setUserNameState(""); setJoined([]); setRsvps([]); setReadIds([]); setMine([]); setPrefs({ ...DEFAULT_PREFS });
    showToast("ok", "Your data on this device was cleared.");
  };

  // ---- global search ----
  const searchResults = useMemo(() => {
    const q = searchQ.trim().toLowerCase(); if (!q) return null;
    const has = (s) => String(s).toLowerCase().includes(q);
    return {
      pages: ALL_NAV.filter((p) => has(p.label)).slice(0, 4),
      facilities: facilities.filter((f) => has(`${f.name} ${f.floor} ${TYPE_META[f.type].noun}`)).slice(0, 4),
      teachers: TEACHERS.filter((t) => has(`${t.name} ${t.dept} ${t.room} ${t.floor}`)).slice(0, 3),
      notices: notices.filter((n) => has(`${n.title} ${n.body}`)).slice(0, 3),
      events: events.filter((e) => has(`${e.title} ${e.club} ${e.venue}`)).slice(0, 3),
      lost: lostFound.filter((l) => has(`${l.item} ${l.desc} ${l.location}`)).slice(0, 3),
      clubs: CLUBS.filter((x) => has(`${x.name} ${x.category}`)).slice(0, 3),
    };
  }, [searchQ, facilities, notices, events, lostFound]);
  const searchEmpty = searchResults && Object.values(searchResults).every((a) => a.length === 0);

  const c = {
    now, facilities, reports, reservations, notices, events, lostFound, threads, helpRequests, updates, feed, openQueue, dueCoolers, insights, slots, notifItems, unreadCount, readIds,
    userName, setUserName, prefs, setPref, rsvps, toggleRsvp, joined, toggleClub, isMine, markMine, markRead, readAll,
    themePref, setThemePref, staffOk, setStaffOk, staffTab, setStaffTab, simulate, setSimulate, block, setBlock, openTeacher,
    go, goReport, goStaff, exitStaff, update, toast: showToast, setConfirm, facilityName, markCleaned,
    report: { facility: reportFacility, setFacility: setReportFacility, note: reportNote, setNote: setReportNote, errors: reportErrors, setErrors: setReportErrors, submit: submitReport },
    reserve: { facility: reserveFacility, setFacility: setReserveFacility, slot: reserveSlot, setSlot: setReserveSlot, errors: reserveErrors, setErrors: setReserveErrors, submit: submitReservation },
    scan: { videoRef, scanning, start: startScanning, stop: stopScanning, result: scanResult, setResult: setScanResult, error: scanError, manual: manualCooler, setManual: setManualCooler },
  };

  const renderPage = () => {
    switch (screen) {
      case "home": return <DashboardPage c={c} />;
      case "profile": return <ProfilePage c={c} />;
      case "notifications": return <NotificationsPage c={c} />;
      case "map": return <MapPage c={c} />;
      case "events": return <EventsPage c={c} />;
      case "notices": return <NoticesPage c={c} />;
      case "lostfound": return <LostFoundPage c={c} />;
      case "updates": return <UpdatesPage c={c} />;
      case "library": return <LibraryPage c={c} />;
      case "canteen": return <CanteenPage c={c} />;
      case "hostel": return <HostelPage c={c} />;
      case "transport": return <TransportPage c={c} />;
      case "amenities": return <AmenitiesPage c={c} />;
      case "charging": return <FacilityPage c={c} type="charging" title="Charging" subtitle="Free bays across the three blocks." extra={<Button variant="secondary" icon={Clock} onClick={() => go("reserve")}>Reserve a bay</Button>} />;
      case "vending": return <FacilityPage c={c} type="vending" title="Vending machines" subtitle="Stock status by block." />;
      case "washroom": return <FacilityPage c={c} type="washroom" title="Washrooms" subtitle="Cleanliness status by block." />;
      case "wifi": return <FacilityPage c={c} type="wifi" title="WiFi" subtitle="Signal strength by zone." />;
      case "water": return <FacilityPage c={c} type="watercooler" title="Water coolers" subtitle="Cleaning status by block." extra={<Button variant="secondary" icon={Camera} onClick={() => go("scan")}>Scan QR</Button>} />;
      case "reserve": return <ReservePage c={c} />;
      case "scan": return <ScanPage c={c} />;
      case "report": return <ReportPage c={c} />;
      case "clubs": return <ClubsPage c={c} />;
      case "discussions": return <DiscussionsPage c={c} />;
      case "help": return <HelpPage c={c} />;
      case "directory": return <DirectoryPage c={c} />;
      case "contacts": return <ContactsPage c={c} />;
      case "staffinfo": return <StaffInfoPage c={c} />;
      case "settings-appearance": return <SettingsAppearance c={c} />;
      case "settings-account": return <SettingsAccount c={c} />;
      case "settings-notifications": return <SettingsNotifications c={c} />;
      case "settings-privacy": return <SettingsPrivacy c={c} />;
      default: return <DashboardPage c={c} />;
    }
  };

  const confirmCfg = confirm && ({
    resolve: { title: "Mark this issue as resolved?", body: "The facility will be set back to working and the report moves to Resolved.", label: "Mark resolved", tone: "primary", run: () => resolveReport(confirm.id) },
    cancelRes: { title: "Cancel this reservation?", body: "The time slot will be released for other students.", label: "Cancel reservation", tone: "danger", run: () => cancelReservation(confirm.id) },
    reset: { title: "Restore sample content?", body: "Notices, events, posts, reports and facility status on this device go back to their starting values.", label: "Restore", tone: "danger", run: resetAll },
    clearMine: { title: "Clear your data on this device?", body: "Your name, joined clubs, RSVPs, preferences and read alerts will be removed. Shared content stays.", label: "Clear data", tone: "danger", run: clearMine },
  })[confirm.kind];

  const activeId = activeNavId(screen);
  const firstInitialName = staffOk ? "Staff" : userName;
  const menuBtn = { width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${COLORS.line}`, background: COLORS.surface, borderRadius: 10, position: "relative" };
  const group = (t, items, render) => items.length > 0 && (<><p style={{ margin: "8px 10px 4px", fontSize: 11.5, fontWeight: 600, color: COLORS.inkFaint }}>{t}</p>{items.map(render)}</>);

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
        .ce-input, .ce-select, .ce-textarea { font-family: inherit; font-size: 14px; color: ${COLORS.ink}; background: ${COLORS.surface}; border: 1px solid ${COLORS.line}; border-radius: 10px; padding: 10px 12px; width: 100%; min-height: 42px; box-sizing: border-box; transition: border-color .15s, box-shadow .15s; }
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

        .ce-sidebar { width: 264px; flex-shrink: 0; background: ${COLORS.surface}; border-right: 1px solid ${COLORS.line}; display: flex; flex-direction: column; padding: 16px 12px; position: sticky; top: 0; height: 100vh; overflow-y: auto; overflow-x: hidden; transition: width .22s ease, transform .25s ease; z-index: 50; }
        .ce-sidebar.collapsed { width: 76px; }
        .ce-brand { display: flex; align-items: center; gap: 10px; padding: 6px 8px 14px; }
        .ce-group-head { display: flex; align-items: center; justify-content: space-between; width: 100%; margin-top: 10px; padding: 7px 10px; border: none; background: none; border-radius: 8px; font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: ${COLORS.inkFaint}; }
        .ce-group-head:hover { color: ${COLORS.ink}; background: ${COLORS.panel2}; }
        .ce-group-head svg { transition: transform .2s ease; }
        .ce-group-head.open svg { transform: rotate(180deg); }
        .ce-group-body { display: flex; flex-direction: column; gap: 1px; }
        .ce-group-body.closed { display: none; }
        .ce-nav-item { position: relative; display: flex; align-items: center; gap: 12px; padding: 8px 12px; min-height: 38px; border-radius: 10px; border: none; background: none; font-size: 13.5px; font-weight: 500; color: ${COLORS.inkMuted}; text-align: left; width: 100%; white-space: nowrap; }
        .ce-nav-item:hover { background: ${COLORS.panel2}; color: ${COLORS.ink}; }
        .ce-nav-item.active { background: ${COLORS.tealBg}; color: ${COLORS.teal}; font-weight: 600; }
        .ce-nav-item.active::before { content: ""; position: absolute; left: -12px; top: 8px; bottom: 8px; width: 3px; border-radius: 0 3px 3px 0; background: ${COLORS.teal}; }
        .ce-nav-item .lbl { overflow: hidden; text-overflow: ellipsis; transition: opacity .15s; }
        .ce-content { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .ce-topbar { position: sticky; top: 0; z-index: 40; height: 64px; display: flex; align-items: center; gap: 10px; padding: 0 28px; background: ${COLORS.surface}; border-bottom: 1px solid ${COLORS.line}; }
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
        .ce-menu { position: absolute; top: 48px; right: 0; width: 340px; max-width: calc(100vw - 28px); background: ${COLORS.surface}; border: 1px solid ${COLORS.line}; border-radius: 14px; box-shadow: 0 16px 40px rgba(16,24,40,.16); z-index: 60; overflow: hidden; }
        .ce-menu-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 14px; border: none; background: none; font-size: 13.5px; font-weight: 500; text-align: left; border-radius: 0; }
        .ce-menu-item:hover { background: ${COLORS.panel2}; }
        .ce-overlay { display: none; }
        .ce-only-mobile { display: none !important; }
        @media (min-width: 881px) {
          .ce-sidebar.collapsed .lbl, .ce-sidebar.collapsed .ce-group-head, .ce-sidebar.collapsed .ce-brand-text { display: none; }
          .ce-sidebar.collapsed .ce-group-body.closed { display: flex; }
          .ce-sidebar.collapsed .ce-group-body { padding-bottom: 6px; margin-bottom: 6px; border-bottom: 1px solid ${COLORS.line}; }
          .ce-sidebar.collapsed .ce-nav-item { justify-content: center; padding: 8px; }
          .ce-sidebar.collapsed .ce-nav-item.active::before { left: -12px; }
        }
        @media (max-width: 980px) { .ce-grid-2, .ce-grid-eq { grid-template-columns: minmax(0, 1fr); } }
        @media (max-width: 880px) {
          .ce-sidebar { position: fixed; left: 0; top: 0; bottom: 0; width: 290px !important; transform: translateX(-100%); box-shadow: 0 0 40px rgba(16,24,40,.25); }
          .ce-sidebar.open { transform: none; }
          .ce-overlay { display: block; position: fixed; inset: 0; z-index: 45; background: rgba(16,24,40,.45); }
          .ce-topbar { padding: 0 14px; gap: 8px; }
          .ce-main { padding: 20px 14px 56px; }
          .ce-only-desktop { display: none !important; }
          .ce-only-mobile { display: inline-flex !important; }
          .ce-hide-sm { display: none !important; }
          .ce-table { min-width: 0; }
          .ce-table thead { display: none; }
          .ce-table, .ce-table tbody, .ce-table tr, .ce-table td { display: block; width: 100%; }
          .ce-table tr { padding: 12px 14px; border-top: 1px solid ${COLORS.line}; }
          .ce-table td { border: none; padding: 4px 0; display: flex; justify-content: space-between; gap: 12px; text-align: right !important; max-width: none !important; }
          .ce-table td::before { content: attr(data-label); font-size: 11.5px; font-weight: 600; color: ${COLORS.inkMuted}; text-align: left; flex-shrink: 0; }
        }
        @media (prefers-reduced-motion: reduce) { .ce-app *, .ce-app *::before, .ce-app *::after { animation: none !important; transition: none !important; } }
      `}</style>

      {!entered ? (
        <div style={{ minHeight: "100vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 20px", position: "relative", background: theme === "dark" ? COLORS.bg : `linear-gradient(180deg, #EEF2FF 0%, ${COLORS.bg} 55%)` }}>
          <div style={{ position: "absolute", top: 20, right: 20 }}><ThemeSwitcher pref={themePref} setPref={setThemePref} compact /></div>
          <Card pad={32} style={{ width: "100%", maxWidth: 440, textAlign: "center", boxShadow: "0 24px 60px rgba(16,24,40,.12)" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #4F46E5, #8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}><Building2 size={28} color="#fff" /></div>
            <h1 style={{ margin: "0 0 6px", fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em" }}>CampusEase</h1>
            <p style={{ fontSize: 15, fontWeight: 600, color: COLORS.teal, margin: "0 0 14px" }}>{CAMPUS.slogan}</p>
            <p style={{ fontSize: 14, color: COLORS.inkMuted, lineHeight: 1.6, margin: "0 0 24px" }}>Your digital campus companion for <strong style={{ color: COLORS.ink }}>{CAMPUS.name}</strong>: maps, events, notices, facilities and community in one place.</p>
            <div style={{ textAlign: "left", marginBottom: 16 }}>
              <Field label="What should we call you?" hint="Optional. Only used for your greeting.">
                <input className="ce-input" placeholder="Your first name" value={userName} onChange={(e) => setUserName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") enter(); }} />
              </Field>
            </div>
            <Button style={{ width: "100%", minHeight: 46, fontSize: 14.5 }} onClick={enter}>Enter CampusEase</Button>
          </Card>
        </div>
      ) : (
        <>
          {drawer && <div className="ce-overlay" onClick={() => setDrawer(false)} />}
          <aside className={`ce-sidebar ${collapsed ? "collapsed" : ""} ${drawer ? "open" : ""}`} aria-label="Primary">
            <div className="ce-brand">
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #4F46E5, #8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Building2 size={19} color="#fff" /></div>
              <div className="ce-brand-text" style={{ minWidth: 0, whiteSpace: "nowrap" }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em" }}>CampusEase</p>
                <p style={{ margin: 0, fontSize: 11.5, color: COLORS.inkMuted }}>JAIN Global Campus</p>
              </div>
            </div>
            <nav style={{ flex: 1 }}>
              {NAV_GROUPS.map((g) => {
                const open = !!openGroups[g.id];
                return (
                  <div key={g.id}>
                    <button className={`ce-btn ce-group-head ${open ? "open" : ""}`} aria-expanded={open} onClick={() => setOpenGroups({ ...openGroups, [g.id]: !open })}>
                      {g.label}<ChevronDown size={14} />
                    </button>
                    <div className={`ce-group-body ${open ? "" : "closed"}`}>
                      {g.items.map((it) => { const Ic = it.icon; const on = activeId === it.id; return (
                        <button key={it.id} className={`ce-btn ce-nav-item ${on ? "active" : ""}`} onClick={() => go(it.id)} title={it.label} aria-current={on ? "page" : undefined}>
                          <Ic size={18} style={{ flexShrink: 0 }} /><span className="lbl" style={{ flex: 1 }}>{it.label}</span>
                          {it.id === "notifications" && unreadCount > 0 && <span className="lbl" style={{ minWidth: 20, height: 20, padding: "0 6px", borderRadius: 999, background: COLORS.coral, color: "#fff", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{unreadCount}</span>}
                        </button>); })}
                    </div>
                  </div>
                );
              })}
            </nav>
            <p className="lbl" style={{ margin: "14px 8px 0", fontSize: 11.5, color: COLORS.inkFaint }}>{CAMPUS.slogan}</p>
          </aside>

          <div className="ce-content">
            <header className="ce-topbar">
              <button className="ce-btn ce-only-mobile" aria-label="Open menu" onClick={() => setDrawer(true)} style={menuBtn}><Menu size={18} /></button>
              <button className="ce-btn ce-only-desktop" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setCollapsed(!collapsed)} style={menuBtn}>
                {collapsed ? <PanelLeftOpen size={18} color={COLORS.inkMuted} /> : <PanelLeftClose size={18} color={COLORS.inkMuted} />}
              </button>

              <div style={{ position: "relative", flex: 1, maxWidth: 480, minWidth: 0 }}>
                <Search size={16} color={COLORS.inkMuted} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input className="ce-input" aria-label="Search CampusEase" style={{ paddingLeft: 38, height: 42, background: COLORS.panel2, borderColor: "transparent" }} placeholder="Search campus" value={searchQ}
                  onChange={(e) => { setSearchQ(e.target.value); setSearchOpen(true); setMenu(null); }} onFocus={() => setSearchOpen(true)} />
                {searchOpen && searchResults && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 55 }} onClick={() => setSearchOpen(false)} />
                    <div className="ce-menu ce-pop" style={{ left: 0, right: "auto", width: "100%", minWidth: 280, maxHeight: 440, overflowY: "auto", padding: 6, top: 48 }}>
                      {searchEmpty && <p style={{ margin: 0, padding: 14, fontSize: 13, color: COLORS.inkMuted }}>No matches for "{searchQ}". Try "library", "wifi" or a teacher's name.</p>}
                      {(() => { const pick = (fn) => { setSearchQ(""); setSearchOpen(false); fn(); }; const R = ({ icon: Ic, title, sub, onClick }) => (
                        <button className="ce-btn ce-menu-item" style={{ borderRadius: 10 }} onClick={() => pick(onClick)}>
                          <span style={{ width: 30, height: 30, borderRadius: 9, background: COLORS.tealBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ic size={15} color={COLORS.teal} /></span>
                          <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: 13, fontWeight: 600 }}>{title}</span>{sub && <span style={{ display: "block", fontSize: 11.5, color: COLORS.inkMuted }}>{sub}</span>}</span>
                        </button>); return (
                        <>
                          {group("Pages", searchResults.pages, (p) => <R key={p.id} icon={p.icon} title={p.label} onClick={() => go(p.id)} />)}
                          {group("Facilities", searchResults.facilities, (f) => <R key={f.id} icon={TYPE_META[f.type].icon} title={`${TYPE_META[f.type].noun}, ${f.name}`} sub={`${f.floor} · ${TYPE_META[f.type].labels[f.status]}`} onClick={() => go(TYPE_SCREEN[f.type])} />)}
                          {group("Staff", searchResults.teachers, (t) => <R key={t.id} icon={User} title={t.name} sub={`${t.dept} · ${t.floor}, ${t.room}`} onClick={() => { setOpenTeacher(t.id); go("directory"); }} />)}
                          {group("Notices", searchResults.notices, (n) => <R key={n.id} icon={Newspaper} title={n.title} sub={n.tag} onClick={() => go("notices")} />)}
                          {group("Events", searchResults.events, (e) => <R key={e.id} icon={CalendarDays} title={e.title} sub={`${fmtDate(e.ts)} · ${e.venue}`} onClick={() => go("events")} />)}
                          {group("Lost and found", searchResults.lost, (l) => <R key={l.id} icon={PackageSearch} title={l.item} sub={l.location} onClick={() => go("lostfound")} />)}
                          {group("Clubs", searchResults.clubs, (x) => <R key={x.id} icon={Users} title={x.name} sub={x.category} onClick={() => go("clubs")} />)}
                        </>); })()}
                    </div>
                  </>
                )}
              </div>

              <div style={{ flex: 1 }} />
              <span className="ce-hide-sm"><ThemeSwitcher pref={themePref} setPref={setThemePref} compact /></span>

              <div style={{ position: "relative" }}>
                <button className="ce-btn" aria-label={`Notifications, ${unreadCount} unread`} aria-expanded={menu === "notif"} onClick={() => { setMenu(menu === "notif" ? null : "notif"); setSearchOpen(false); }} style={menuBtn}>
                  <Bell size={18} color={COLORS.inkMuted} />
                  {unreadCount > 0 && <span style={{ position: "absolute", top: -5, right: -5, minWidth: 18, height: 18, padding: "0 5px", borderRadius: 999, background: COLORS.coral, color: "#fff", fontSize: 10.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${COLORS.surface}` }}>{unreadCount}</span>}
                </button>
                {menu === "notif" && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 55 }} onClick={() => setMenu(null)} />
                    <div className="ce-menu ce-pop">
                      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${COLORS.line}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>Notifications</p>
                        <Button variant="ghost" size="sm" onClick={readAll} disabled={!unreadCount}>Mark all read</Button>
                      </div>
                      <div style={{ maxHeight: 340, overflowY: "auto" }}>
                        {notifItems.length === 0 ? <p style={{ margin: 0, padding: 20, textAlign: "center", fontSize: 13, color: COLORS.inkMuted }}>You're all caught up.</p> :
                          notifItems.slice(0, 6).map((n) => { const unread = !readIds.includes(n.id); return (
                            <button key={n.id} className="ce-btn ce-menu-item" onClick={() => { markRead(n.id); go(n.screen); }}>
                              <span style={{ width: 8, height: 8, borderRadius: "50%", background: unread ? COLORS.teal : "transparent", flexShrink: 0 }} />
                              <span style={{ flex: 1, minWidth: 0 }}><span style={{ display: "block", fontSize: 13, fontWeight: unread ? 650 : 500 }}>{n.title}</span><span style={{ display: "block", fontSize: 11.5, color: COLORS.inkMuted }}>{n.sub}</span></span>
                            </button>); })}
                      </div>
                      <div style={{ padding: 8, borderTop: `1px solid ${COLORS.line}` }}><Button variant="secondary" style={{ width: "100%" }} onClick={() => go("notifications")}>View all notifications</Button></div>
                    </div>
                  </>
                )}
              </div>

              <button className="ce-btn ce-hide-sm" aria-label="Settings" title="Settings" onClick={() => go("settings-appearance")} style={menuBtn}><Settings size={18} color={COLORS.inkMuted} /></button>

              <div style={{ position: "relative" }}>
                <button className="ce-btn" aria-label="Profile menu" aria-expanded={menu === "account"} onClick={() => { setMenu(menu === "account" ? null : "account"); setSearchOpen(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 8px 3px 3px", border: `1px solid ${COLORS.line}`, background: COLORS.surface, borderRadius: 999, height: 40 }}>
                  <Avatar name={firstInitialName} size={32} tone={staffOk ? "solid" : "soft"} /><ChevronDown size={14} color={COLORS.inkMuted} />
                </button>
                {menu === "account" && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 55 }} onClick={() => setMenu(null)} />
                    <div className="ce-menu ce-pop" style={{ width: 280 }}>
                      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${COLORS.line}` }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>{userName.trim() || "Guest"}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.inkMuted }}>{staffOk ? "Staff access on" : "Student view"}</p>
                      </div>
                      <div style={{ padding: "6px 0" }}>
                        <button className="ce-btn ce-menu-item" onClick={() => go("profile")}><UserRound size={16} />My profile</button>
                        <button className="ce-btn ce-menu-item" onClick={() => go("settings-appearance")}><Settings size={16} />Settings</button>
                        {staffOk ? <button className="ce-btn ce-menu-item" onClick={exitStaff}><LogOut size={16} />Sign out of staff</button> : <button className="ce-btn ce-menu-item" onClick={() => go("staffinfo")}><ShieldCheck size={16} />Staff sign-in</button>}
                        <button className="ce-btn ce-menu-item" onClick={() => { setEntered(false); lsSet("ce-entered", false); closeOverlays(); }}><HomeIcon size={16} />Welcome page</button>
                      </div>
                      <div className="ce-only-mobile" style={{ padding: "10px 14px", borderTop: `1px solid ${COLORS.line}` }}><ThemeSwitcher pref={themePref} setPref={setThemePref} /></div>
                    </div>
                  </>
                )}
              </div>
            </header>

            <main className="ce-main">
              {!data ? (
                <div aria-busy="true" aria-label="Loading">
                  <Skeleton h={30} w={260} style={{ marginBottom: 10 }} /><Skeleton h={14} w={180} style={{ marginBottom: 26 }} />
                  <div className="ce-grid-kpi" style={{ marginBottom: 16 }}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} h={110} r={14} />)}</div>
                  <div className="ce-grid-2"><Skeleton h={300} r={14} /><Skeleton h={300} r={14} /></div>
                </div>
              ) : renderPage()}
            </main>
          </div>
        </>
      )}

      {confirm && confirmCfg && (
        <Modal title={confirmCfg.title} body={confirmCfg.body} confirmLabel={confirmCfg.label} tone={confirmCfg.tone} onClose={() => setConfirm(null)} onConfirm={() => { confirmCfg.run(); setConfirm(null); }} />
      )}
      {toast && (
        <div role="status" className="ce-pop" style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#101828", color: "#fff", padding: "11px 18px", borderRadius: 12, fontSize: 13.5, fontWeight: 500, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 12px 32px rgba(16,24,40,0.35)", zIndex: 120, maxWidth: "calc(100vw - 32px)" }}>
          {toast.kind === "ok" ? <CheckCircle2 size={17} color="#4ADE80" /> : <AlertCircle size={17} color="#F87171" />}{toast.text}
        </div>
      )}
    </div>
  );
}
