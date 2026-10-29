import { useState, useEffect, useMemo, useRef } from "react";
import {
  Zap, Cookie, Wind, Wifi, Droplets, Flag, Clock, Check, X, CheckCircle2,
  TrendingUp, Building2, Plus, Moon, Sun, Sparkles, User, GraduationCap,
  QrCode, Navigation, Camera, ArrowLeft, Home as HomeIcon, ShieldCheck,
  Search, ChevronRight, AlertCircle,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const STORAGE_KEY = "campusease-data-v7";
const FLOORS = ["FET Block", "Mechanical Block", "Aerospace Block"];
const CAMPUS = {
  name: "JAIN Global Campus",
  address: "Jakkasandra Post, Kanakapura Road, Ramanagara District, Bengaluru — 562112",
  size: "350-acre campus",
  slogan: "350 Acres. One App.",
};

const LIGHT = {
  bg: "#EEF2ED", surface: "#FFFFFF", ink: "#1E2A22", inkMuted: "#5B6B60", inkFaint: "#94A199",
  line: "#DCE3DA", panel: "#F6F8F4", teal: "#1F6F5C", tealBg: "#E1EEE8",
  amber: "#B4790E", amberBg: "#FBEDD3", coral: "#B3402C", coralBg: "#F7E1DB",
};
const DARK = {
  bg: "#12151A", surface: "#1B2027", ink: "#EEF1F5", inkMuted: "#909AA8", inkFaint: "#5E6773",
  line: "#2A3038", panel: "#1B2027", teal: "#3FD8AC", tealBg: "rgba(63,216,172,0.14)",
  amber: "#F2BB4E", amberBg: "rgba(242,187,78,0.14)", coral: "#FF7C6B", coralBg: "rgba(255,124,107,0.14)",
};
const COLORS = { ...DARK };

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
  { id: "t3", name: "Dr. Suresh Rao", dept: "Mechanical Engineering", floor: "Mechanical Block", room: "Room 118" },
  { id: "t4", name: "Prof. Meena Nair", dept: "Civil Engineering", floor: "Mechanical Block", room: "Room 122" },
  { id: "t4b", name: "Dr. Farhan Sheikh", dept: "Electrical Engineering", floor: "Mechanical Block", room: "Room 130" },
  { id: "t5", name: "Dr. Arvind Menon", dept: "Aerospace Engineering", floor: "Aerospace Block", room: "Hangar Office 3" },
  { id: "t6", name: "Prof. Divya Shetty", dept: "Avionics", floor: "Aerospace Block", room: "Hangar Office 5" },
];
const BLOCK_SHORT = { "FET Block": "FET", "Mechanical Block": "Mech", "Aerospace Block": "Aero" };

function defaultFacilities() {
  const now = Date.now();
  const mins = (n) => now - n * 60000;
  return [
    // Charging
    { id: "f1-charge-104", name: "Room 104", floor: "FET Block", type: "charging", status: "ok", updatedAt: mins(12) },
    { id: "f1-charge-lib", name: "Library entrance", floor: "FET Block", type: "charging", status: "watch", updatedAt: mins(4) },
    { id: "f2-charge-204", name: "Workshop corridor", floor: "Mechanical Block", type: "charging", status: "ok", updatedAt: mins(18) },
    { id: "f2-charge-sem", name: "Seminar hall", floor: "Mechanical Block", type: "charging", status: "watch", updatedAt: mins(26) },
    { id: "f3-charge-hall", name: "Design studio", floor: "Aerospace Block", type: "charging", status: "ok", updatedAt: mins(3) },
    { id: "f3-charge-hangar", name: "Hangar lobby", floor: "Aerospace Block", type: "charging", status: "ok", updatedAt: mins(40) },
    // Vending
    { id: "f1-vend-lobby", name: "Main lobby", floor: "FET Block", type: "vending", status: "ok", updatedAt: mins(30) },
    { id: "f1-vend-2f", name: "2nd floor corridor", floor: "FET Block", type: "vending", status: "ok", updatedAt: mins(50) },
    { id: "f2-vend-lounge", name: "Faculty lounge", floor: "Mechanical Block", type: "vending", status: "watch", updatedAt: mins(6) },
    { id: "f2-vend-entrance", name: "Workshop entrance", floor: "Mechanical Block", type: "vending", status: "ok", updatedAt: mins(70) },
    { id: "f3-vend", name: "Hangar lobby", floor: "Aerospace Block", type: "vending", status: "ok", updatedAt: mins(60) },
    { id: "f3-vend-wing", name: "Design wing", floor: "Aerospace Block", type: "vending", status: "flagged", updatedAt: mins(15) },
    // Washrooms
    { id: "f1-wash-a", name: "Ground floor", floor: "FET Block", type: "washroom", status: "ok", updatedAt: mins(90) },
    { id: "f1-wash-b", name: "First floor", floor: "FET Block", type: "washroom", status: "ok", updatedAt: mins(35) },
    { id: "f2-wash", name: "Ground floor", floor: "Mechanical Block", type: "washroom", status: "watch", updatedAt: mins(45) },
    { id: "f2-wash-b", name: "First floor", floor: "Mechanical Block", type: "washroom", status: "ok", updatedAt: mins(65) },
    { id: "f3-wash", name: "Ground floor", floor: "Aerospace Block", type: "washroom", status: "flagged", updatedAt: mins(9) },
    { id: "f3-wash-b", name: "First floor", floor: "Aerospace Block", type: "washroom", status: "ok", updatedAt: mins(55) },
    // WiFi zones
    { id: "f1-wifi-lib", name: "Library wing", floor: "FET Block", type: "wifi", status: "ok", updatedAt: mins(8) },
    { id: "f1-wifi-main", name: "Main entrance", floor: "FET Block", type: "wifi", status: "ok", updatedAt: mins(20) },
    { id: "f1-wifi-sem", name: "Seminar hall", floor: "FET Block", type: "wifi", status: "watch", updatedAt: mins(33) },
    { id: "f2-wifi-workshop", name: "Workshop area", floor: "Mechanical Block", type: "wifi", status: "watch", updatedAt: mins(22) },
    { id: "f2-wifi-lecture", name: "Lecture hall block", floor: "Mechanical Block", type: "wifi", status: "ok", updatedAt: mins(11) },
    { id: "f3-wifi-hangar", name: "Hangar lab", floor: "Aerospace Block", type: "wifi", status: "flagged", updatedAt: mins(15) },
    { id: "f3-wifi-design", name: "Design studio", floor: "Aerospace Block", type: "wifi", status: "ok", updatedAt: mins(6) },
    { id: "f3-wifi-admin", name: "Admin office", floor: "Aerospace Block", type: "wifi", status: "ok", updatedAt: mins(48) },
    // Water coolers
    { id: "f1-water-canteen", name: "Near canteen", floor: "FET Block", type: "watercooler", status: "ok", updatedAt: mins(180), lastCleaned: mins(180) },
    { id: "f1-water-2f", name: "2nd floor", floor: "FET Block", type: "watercooler", status: "ok", updatedAt: mins(240), lastCleaned: mins(240) },
    { id: "f2-water-corridor", name: "Main corridor", floor: "Mechanical Block", type: "watercooler", status: "watch", updatedAt: mins(1800), lastCleaned: mins(1800) },
    { id: "f2-water-workshop", name: "Workshop wing", floor: "Mechanical Block", type: "watercooler", status: "ok", updatedAt: mins(300), lastCleaned: mins(300) },
    { id: "f3-water-ground", name: "Ground floor", floor: "Aerospace Block", type: "watercooler", status: "flagged", updatedAt: mins(3000), lastCleaned: mins(3000) },
    { id: "f3-water-hangar", name: "Hangar wing", floor: "Aerospace Block", type: "watercooler", status: "ok", updatedAt: mins(150), lastCleaned: mins(150) },
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

const statusColor = (status) => (status === "ok" ? COLORS.teal : status === "watch" ? COLORS.amber : COLORS.coral);
const statusBg = (status) => (status === "ok" ? COLORS.tealBg : status === "watch" ? COLORS.amberBg : COLORS.coralBg);

function Switch({ on, onClick, color }) {
  return (
    <button className="ce-btn" onClick={onClick} aria-pressed={on}
      style={{ width: 38, height: 22, borderRadius: 999, border: "none", padding: 2, background: on ? color : COLORS.line, display: "flex", justifyContent: on ? "flex-end" : "flex-start" }}>
      <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", display: "block", boxShadow: "0 1px 2px rgba(0,0,0,0.25)" }} />
    </button>
  );
}

function Screen({ title, subtitle, onBack, onReport, now, children }) {
  return (
    <div className="ce-fade">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 22, flexWrap: "wrap" }}>
        <div>
          <button className="ce-btn" onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", padding: 0, marginBottom: 10, color: COLORS.inkMuted, fontSize: 12.5, fontWeight: 500 }}>
            <ArrowLeft size={14} /> Home
          </button>
          <h1 style={{ margin: 0, fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif", fontSize: 24, fontWeight: 700, letterSpacing: "-0.01em", color: COLORS.ink }}>{title}</h1>
          {subtitle && <p style={{ margin: "4px 0 0", fontSize: 13.5, color: COLORS.inkMuted }}>{subtitle}</p>}
        </div>
        {onReport && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: COLORS.inkMuted }}>
              {new Date(now).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
            </span>
            <button className="ce-btn" onClick={onReport} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, padding: "9px 15px", borderRadius: 10, border: "none", background: COLORS.coral, color: "#0F1216" }}>
              <Plus size={14} /> Report issue
            </button>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function FacilityRow({ f, now, onClick }) {
  const meta = TYPE_META[f.type];
  const Icon = meta.icon;
  return (
    <button className="ce-btn" onClick={onClick} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: COLORS.panel, borderRadius: 14, border: `1px solid ${COLORS.line}` }}>
      <div style={{ width: 42, height: 42, borderRadius: 11, background: statusBg(f.status), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
        <Icon size={20} color={statusColor(f.status)} />
        {f.status === "flagged" && <span className="ce-dot" style={{ position: "absolute", top: -2, right: -2, width: 9, height: 9, borderRadius: "50%", background: COLORS.coral }} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: COLORS.ink }}>{f.name}</p>
        {f.type === "watercooler" ? (
          <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.inkMuted }}>Last cleaned {formatRelative(f.lastCleaned, now)}</p>
        ) : (
          <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.inkMuted }}>Updated {formatRelative(f.updatedAt, now)}</p>
        )}
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: statusColor(f.status), background: statusBg(f.status), padding: "6px 12px", borderRadius: 999, flexShrink: 0 }}>
        {meta.labels[f.status]}
      </span>
      <ChevronRight size={16} color={COLORS.inkFaint} style={{ flexShrink: 0 }} />
    </button>
  );
}

function BlockGroupedList({ facilities, now, onRowClick }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {FLOORS.map((fl) => {
        const items = facilities.filter((f) => f.floor === fl);
        if (items.length === 0) return null;
        return (
          <div key={fl}>
            <p style={{ margin: "0 0 10px", fontSize: 12.5, fontWeight: 700, color: COLORS.inkMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{fl}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((f) => <FacilityRow key={f.id} f={f} now={now} onClick={() => onRowClick(f)} />)}
            </div>
          </div>
        );
      })}
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
  t3: { level: 1, side: "top", slot: 0 }, t4: { level: 1, side: "top", slot: 3 }, t4b: { level: 1, side: "bot", slot: 3 },
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
  const mono = "'IBM Plex Mono', monospace";
  const roomRect = (cx, top, label, fill, stroke, textColor, bold) => {
    const y = top ? 8 : 74, h = 42;
    return (
      <g key={`${top}-${cx}-${label}`}>
        <rect x={cx - 15} y={y} width={30} height={h} rx={3} fill={fill} stroke={stroke} strokeWidth={0.8} />
        <text x={cx} y={y + h / 2 + 1.5} textAnchor="middle" fontSize={bold ? 4.4 : 3.6} fontWeight={bold ? 700 : 500} fill={textColor} fontFamily="Inter, system-ui, sans-serif">{label}</text>
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
          <text x={100} y={CORR_MID + 1.4} textAnchor="middle" fontSize={3.2} fill={faint} fontFamily={mono} letterSpacing="0.6">CORRIDOR</text>

          <rect x={4} y={8} width={16} height={42} rx={3} fill={COLORS.panel} stroke={lineC} strokeWidth={0.8} />
          <text x={12} y={30} textAnchor="middle" fontSize={3.4} fill={faint} fontWeight={600} fontFamily="Inter, sans-serif">Stairs</text>
          <rect x={178} y={8} width={16} height={42} rx={3} fill={COLORS.panel} stroke={lineC} strokeWidth={0.8} />
          <text x={186} y={30} textAnchor="middle" fontSize={3.4} fill={faint} fontWeight={600} fontFamily="Inter, sans-serif">Lift</text>

          {TOP_SLOTS.map((cx, i) => (i === room.slot && isTop)
            ? roomRect(cx, true, teacher.room.replace("Hangar Office", "Office"), COLORS.coralBg, COLORS.coral, COLORS.coral, true)
            : roomRect(cx, true, FILLER_TOP[i], COLORS.surface, lineC, faint, false))}
          {BOT_SLOTS.map((cx, i) => (i === room.slot && !isTop)
            ? roomRect(cx, false, teacher.room.replace("Hangar Office", "Office"), COLORS.coralBg, COLORS.coral, COLORS.coral, true)
            : roomRect(cx, false, i === 0 && room.level === 0 ? "Washroom" : (i === 3 && room.level === 0 ? "Canteen" : FILLER_BOT[i]), COLORS.surface, lineC, faint, false))}
          {room.level === 0 && <rect x={85} y={74} width={30} height={42} rx={3} fill={COLORS.tealBg} stroke={COLORS.teal} strokeWidth={0.8} />}
          {room.level === 0 && <text x={100} y={92} textAnchor="middle" fontSize={3.6} fontWeight={700} fill={COLORS.teal} fontFamily="Inter, sans-serif">Main lobby</text>}
          {room.level !== 0 && <rect x={85} y={74} width={30} height={42} rx={3} fill={COLORS.surface} stroke={lineC} strokeWidth={0.8} />}
          {room.level !== 0 && <text x={100} y={95} textAnchor="middle" fontSize={3.4} fill={faint} fontFamily="Inter, sans-serif">Open to below</text>}

          <path d={d} fill="none" stroke={COLORS.teal} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" strokeDasharray="4 3" className="ce-route" />

          <g>
            <circle cx={originX} cy={clean[0][1]} r={6} fill={COLORS.teal} opacity={0.2} />
            <circle cx={originX} cy={clean[0][1]} r={3.2} fill={COLORS.teal} stroke={COLORS.surface} strokeWidth={1} />
            <text x={originX} y={clean[0][1] + (clean[0][1] > 100 ? -7 : 9)} textAnchor="middle" fontSize={3.6} fontWeight={700} fill={COLORS.teal} fontFamily="Inter, sans-serif">{needsClimb ? `Arrive by ${arriveVia}` : "You are here"}</text>
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

export default function CampusEase() {
  const [data, setData] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [entered, setEntered] = useState(false);
  Object.assign(COLORS, theme === "dark" ? DARK : LIGHT);

  const [screen, setScreen] = useState("home");
  const [now, setNow] = useState(Date.now());
  const [toast, setToast] = useState(null);
  const [simulate, setSimulate] = useState(false);

  const [reportFacility, setReportFacility] = useState("");
  const [reportNote, setReportNote] = useState("");
  const [reportError, setReportError] = useState("");

  const [reserveFacility, setReserveFacility] = useState("");
  const [reserveSlot, setReserveSlot] = useState("");
  const [reserveError, setReserveError] = useState("");

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
    catch (e) { setToast({ kind: "error", text: "Couldn't save — check your connection." }); }
  };

  const showToast = (kind, text) => {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 2600);
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
    setReportError("");
    if (!reportFacility) return setReportError("Choose a facility first.");
    if (!reportNote.trim()) return setReportError("Describe what's wrong.");
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
    setReserveError("");
    if (!reserveFacility) return setReserveError("Choose a charging bay.");
    if (!reserveSlot) return setReserveError("Pick a time slot.");
    const conflict = reservations.some((r) => r.facilityId === reserveFacility && r.slot === reserveSlot);
    if (conflict) return setReserveError("That slot is already booked. Pick another.");
    persist({ ...data, reservations: [{ id: `v-${Date.now()}`, facilityId: reserveFacility, slot: reserveSlot, timestamp: Date.now() }, ...reservations] });
    setReserveSlot("");
    showToast("ok", "Reserved. See you then.");
  };

  const cancelReservation = (id) => persist({ ...data, reservations: reservations.filter((r) => r.id !== id) });

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

  const insights = useMemo(() => {
    const byType = { charging: 0, vending: 0, washroom: 0, wifi: 0, watercooler: 0 };
    const byFloor = { "FET Block": 0, "Mechanical Block": 0, "Aerospace Block": 0 };
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
      avgMins, topFacility: topId ? facilityName(topId) : "—", openCount: openQueue.length,
    };
  }, [reports, openQueue]);

  const visibleTeachers = useMemo(() => {
    if (!teacherQuery.trim()) return TEACHERS;
    const q = teacherQuery.trim().toLowerCase();
    return TEACHERS.filter((t) => t.name.toLowerCase().includes(q) || t.dept.toLowerCase().includes(q));
  }, [teacherQuery]);

  const nearestFreeCharging = useMemo(() => chargingFacilities.find((f) => f.status === "ok") || null, [chargingFacilities]);

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
    if (!scanSupported) { setScanError("QR scanning needs Chrome on Android (or another browser with camera barcode support)."); return; }
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
      setScanError("Camera access was denied. Allow camera permission and try again.");
      setScanning(false);
    }
  };

  useEffect(() => () => stopScanning(), []);

  const HOME_TILES = [
    { id: "charging", label: "Charging", icon: Zap, desc: "Find a free charging bay" },
    { id: "vending", label: "Vending", icon: Cookie, desc: "Check what's in stock" },
    { id: "washroom", label: "Washrooms", icon: Wind, desc: "See what's clean nearby" },
    { id: "wifi", label: "WiFi", icon: Wifi, desc: "Check signal by block" },
    { id: "water", label: "Water Coolers", icon: Droplets, desc: "Last cleaned, and scan QR" },
    { id: "teachers", label: "Find a Teacher", icon: GraduationCap, desc: "Search cabins with directions" },
    { id: "reserve", label: "Reserve Charging", icon: Clock, desc: "Book a bay ahead of time" },
    { id: "scan", label: "Scan QR", icon: Camera, desc: "Scan a water cooler sticker" },
  ];

  const tileBadge = (id) => {
    const typeMap = { charging: "charging", vending: "vending", washroom: "washroom", wifi: "wifi", water: "watercooler" };
    const type = typeMap[id];
    if (!type) return null;
    const list = facilities.filter((f) => f.type === type);
    const bad = list.filter((f) => f.status !== "ok").length;
    if (list.length === 0) return null;
    return bad === 0 ? { text: "All good", color: COLORS.teal, bg: COLORS.tealBg } : { text: `${bad} issue${bad > 1 ? "s" : ""}`, color: COLORS.amber, bg: COLORS.amberBg };
  };
  const goHome = () => { setScreen("home"); setScanResult(null); setScanError(""); stopScanning(); };
  const goReport = (facilityId) => { if (facilityId) setReportFacility(facilityId); setScreen("report"); };

  return (
    <div className="ce-app" style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", color: COLORS.ink }}>
      <style>{`
        .ce-app { display: flex; }
        .ce-btn { transition: transform 0.1s ease, background 0.15s ease, border-color 0.15s ease; cursor: pointer; }
        .ce-btn:active { transform: scale(0.97); }
        .ce-btn:focus-visible, .ce-input:focus-visible, .ce-select:focus-visible, .ce-textarea:focus-visible { outline: 2px solid ${COLORS.teal}; outline-offset: 2px; }
        .ce-input, .ce-select, .ce-textarea { font-family: inherit; font-size: 14px; color: ${COLORS.ink}; background: ${COLORS.surface}; border: 1px solid ${COLORS.line}; border-radius: 10px; padding: 10px 12px; width: 100%; }
        .ce-fade { animation: ceFadeIn 0.2s ease; }
        @keyframes ceFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .ce-dot { animation: ceDot 1.6s ease-in-out infinite; }
        @keyframes ceDot { 0%,100% { box-shadow: 0 0 0 0 rgba(255,124,107,0.35);} 50% { box-shadow: 0 0 0 6px rgba(255,124,107,0);} }
        .ce-route { animation: ceRoute 0.8s linear infinite; }
        @keyframes ceRoute { to { stroke-dashoffset: -10; } }
        .ce-tile { transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease; }
        .ce-tile:hover { border-color: ${COLORS.teal}; transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.12); }
        @media (prefers-reduced-motion: reduce) { .ce-fade, .ce-dot, .ce-route, .ce-tile { animation: none !important; transition: none !important; } }
        .ce-sidebar { width: 220px; flex-shrink: 0; background: ${COLORS.surface}; border-right: 1px solid ${COLORS.line}; display: flex; flex-direction: column; padding: 24px 16px; position: sticky; top: 0; height: 100vh; }
        .ce-brand { display: flex; align-items: center; gap: 9px; padding: 0 8px; margin-bottom: 26px; }
        .ce-nav-item { display: flex; align-items: center; gap: 11px; padding: 10px 12px; border-radius: 10px; border: none; background: none; font-size: 13.5px; font-weight: 500; color: ${COLORS.inkMuted}; text-align: left; width: 100%; }
        .ce-nav-item.active { background: ${COLORS.tealBg}; color: ${COLORS.teal}; }
        .ce-main { flex: 1; min-width: 0; padding: 28px 36px 60px; max-width: 980px; }
        .ce-tile-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }
        @media (max-width: 880px) {
          .ce-app { flex-direction: column; }
          .ce-sidebar { width: 100%; height: auto; position: static; flex-direction: row; align-items: center; padding: 14px 18px; }
          .ce-brand { margin-bottom: 0; margin-right: auto; }
          .ce-main { padding: 20px 18px 60px; }
        }
      `}</style>

      {entered && (
        <aside className="ce-sidebar">
          <div className="ce-brand">
            <div style={{ width: 30, height: 30, borderRadius: 8, background: COLORS.teal, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Building2 size={16} color="#0F1216" />
            </div>
            <span style={{ fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif", fontWeight: 700, fontSize: 17 }}>CampusEase</span>
          </div>
          <nav style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
            <button className={`ce-btn ce-nav-item ${screen === "home" ? "active" : ""}`} onClick={goHome}><HomeIcon size={17} /><span>Home</span></button>
            <button className={`ce-btn ce-nav-item ${screen === "admin" ? "active" : ""}`} onClick={() => setScreen("admin")}><ShieldCheck size={17} /><span>Staff Admin</span></button>
          </nav>
          <button className="ce-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 12px", borderRadius: 10, border: `1px solid ${COLORS.line}`, background: "none", color: COLORS.inkMuted, fontSize: 12.5, fontWeight: 500 }}>
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          </button>
        </aside>
      )}

      {!entered ? (
        <div style={{ minHeight: "100vh", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 20px", position: "relative" }}>
          <button className="ce-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} style={{ position: "absolute", top: 24, right: 24, display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderRadius: 999, border: `1px solid ${COLORS.line}`, background: COLORS.surface, color: COLORS.inkMuted, fontSize: 12.5, fontWeight: 500 }}>
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />} {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: COLORS.teal, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
              <Building2 size={28} color="#0F1216" />
            </div>
            <h1 style={{ fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif", fontWeight: 700, fontSize: 30, margin: "0 0 6px" }}>CampusEase</h1>
            <p style={{ fontSize: 15, fontWeight: 600, color: COLORS.teal, margin: "0 0 18px" }}>{CAMPUS.slogan}</p>
            <p style={{ fontSize: 13, color: COLORS.inkMuted, lineHeight: 1.6, margin: "0 0 28px" }}>
              A simple way to check charging, WiFi, washrooms, water coolers and teacher cabins at <strong style={{ color: COLORS.ink }}>{CAMPUS.name}</strong>.
            </p>
            <button className="ce-btn" onClick={() => setEntered(true)} style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: COLORS.teal, color: "#0F1216", fontSize: 14.5, fontWeight: 700 }}>
              Enter CampusEase
            </button>
          </div>
        </div>
      ) : (
        <main className="ce-main">
          {!data && <p style={{ color: COLORS.inkMuted, fontSize: 13 }}>Loading…</p>}

          {data && screen === "home" && (
            <div className="ce-fade">
              <h1 style={{ margin: "0 0 4px", fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif", fontSize: 28, fontWeight: 700, letterSpacing: "-0.01em" }}>{new Date(now).getHours() < 12 ? "Good morning" : new Date(now).getHours() < 17 ? "Good afternoon" : "Good evening"} 👋</h1>
              <p style={{ margin: "0 0 20px", fontSize: 14, color: COLORS.inkMuted }}>What do you need right now?</p>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
                {[
                  { label: "Working", value: facilities.filter((f) => f.status === "ok").length, color: COLORS.teal, bg: COLORS.tealBg },
                  { label: "Need attention", value: facilities.filter((f) => f.status === "watch").length, color: COLORS.amber, bg: COLORS.amberBg },
                  { label: "Out of order", value: facilities.filter((f) => f.status === "flagged").length, color: COLORS.coral, bg: COLORS.coralBg },
                ].map((c) => (
                  <div key={c.label} style={{ flex: "1 1 120px", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, background: c.bg }}>
                    <span style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: 22, fontWeight: 700, color: c.color }}>{c.value}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: c.color }}>{c.label}</span>
                  </div>
                ))}
              </div>

              {nearestFreeCharging && (
                <button className="ce-btn" onClick={() => setScreen("charging")} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 12, background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: "12px 16px", marginBottom: 20 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: COLORS.tealBg, display: "flex", alignItems: "center", justifyContent: "center" }}><Zap size={16} color={COLORS.teal} /></div>
                  <p style={{ margin: 0, fontSize: 13, flex: 1, color: COLORS.ink }}>Nearest free charging bay: <strong>{nearestFreeCharging.name}</strong>, {nearestFreeCharging.floor}</p>
                  <ChevronRight size={16} color={COLORS.inkFaint} />
                </button>
              )}

              <div className="ce-tile-grid">
                {HOME_TILES.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button key={t.id} className="ce-btn ce-tile" onClick={() => setScreen(t.id)} style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 10, padding: 18, background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: COLORS.tealBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon size={20} color={COLORS.teal} />
                        </div>
                        {tileBadge(t.id) && <span style={{ fontSize: 11, fontWeight: 700, color: tileBadge(t.id).color, background: tileBadge(t.id).bg, padding: "4px 9px", borderRadius: 999 }}>{tileBadge(t.id).text}</span>}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600 }}>{t.label}</p>
                        <p style={{ margin: "3px 0 0", fontSize: 12, color: COLORS.inkMuted }}>{t.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {data && (screen === "charging" || screen === "vending" || screen === "washroom" || screen === "wifi") && (
            <Screen title={TYPE_META[screen].noun + "s"} subtitle={`Live status across all three blocks.`} onBack={goHome} onReport={() => goReport("")} now={now}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                {["ok", "watch", "flagged"].map((st) => {
                  const n = facilities.filter((f) => f.type === screen && f.status === st).length;
                  return <span key={st} style={{ fontSize: 12, fontWeight: 700, color: statusColor(st), background: statusBg(st), padding: "6px 12px", borderRadius: 999 }}>{n} {TYPE_META[screen].labels[st].toLowerCase()}</span>;
                })}
              </div>
              <BlockGroupedList facilities={facilities.filter((f) => f.type === screen)} now={now} onRowClick={(f) => goReport(f.id)} />
            </Screen>
          )}

          {data && screen === "water" && (
            <Screen title="Water Coolers" subtitle="Last cleaned time for every cooler on campus." onBack={goHome} onReport={() => goReport("")} now={now}>
              <button className="ce-btn" onClick={() => setScreen("scan")} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 13, fontWeight: 600, padding: "11px 18px", borderRadius: 11, border: "none", background: COLORS.teal, color: "#0F1216" }}>
                <Camera size={15} /> Scan a cooler's QR code
              </button>
              <BlockGroupedList facilities={facilities.filter((f) => f.type === "watercooler")} now={now} onRowClick={(f) => goReport(f.id)} />
            </Screen>
          )}

          {data && screen === "teachers" && (
            <Screen title="Find a Teacher" subtitle="Search by name or department to find their cabin." onBack={goHome} onReport={null} now={now}>
              <div style={{ position: "relative", marginBottom: 22, maxWidth: 420 }}>
                <Search size={14} color={COLORS.inkMuted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input className="ce-input" style={{ paddingLeft: 32 }} placeholder="Search teachers" value={teacherQuery} onChange={(e) => setTeacherQuery(e.target.value)} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {FLOORS.map((fl) => {
                  const items = visibleTeachers.filter((t) => t.floor === fl);
                  if (items.length === 0) return null;
                  return (
                    <div key={fl}>
                      <p style={{ margin: "0 0 10px", fontSize: 12.5, fontWeight: 700, color: COLORS.inkMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{fl}</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {items.map((t) => {
                          const open = openTeacherMap === t.id;
                          return (
                            <div key={t.id} style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 14, overflow: "hidden" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px" }}>
                                <div style={{ width: 42, height: 42, borderRadius: 11, background: COLORS.tealBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                  <User size={19} color={COLORS.teal} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{ margin: 0, fontSize: 14.5, fontWeight: 600 }}>{t.name}</p>
                                  <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.inkMuted }}>{t.dept} · {t.room}</p>
                                </div>
                                <button className="ce-btn" onClick={() => setOpenTeacherMap(open ? null : t.id)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, padding: "8px 13px", borderRadius: 9, border: `1px solid ${COLORS.line}`, background: COLORS.surface, color: COLORS.ink, flexShrink: 0 }}>
                                  <Navigation size={13} /> {open ? "Hide" : "Directions"}
                                </button>
                              </div>
                              {open && (
                                <div style={{ padding: "0 16px 16px" }}>
                                  <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: COLORS.inkMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                    {t.floor} — {t.room}
                                  </p>
                                  <IndoorMap teacher={t} />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Screen>
          )}

          {data && screen === "scan" && (
            <Screen title="Scan QR" subtitle="Point your camera at a water cooler's sticker." onBack={goHome} onReport={null} now={now}>
              {!scanResult ? (
                <div style={{ maxWidth: 460 }}>
                  {!scanning && (
                    <button className="ce-btn" onClick={startScanning} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 0", borderRadius: 12, border: "none", background: COLORS.teal, color: "#0F1216", fontSize: 14.5, fontWeight: 700, marginBottom: 16 }}>
                      <Camera size={17} /> Start Camera
                    </button>
                  )}
                  {scanning && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", border: `1px solid ${COLORS.line}`, background: "#000" }}>
                        <video ref={videoRef} playsInline muted style={{ width: "100%", display: "block", maxHeight: 360, objectFit: "cover" }} />
                        <div style={{ position: "absolute", inset: 0, border: `3px solid ${COLORS.teal}88`, borderRadius: 16, pointerEvents: "none" }} />
                      </div>
                      <button className="ce-btn" onClick={stopScanning} style={{ width: "100%", marginTop: 10, padding: "10px 0", borderRadius: 10, border: `1px solid ${COLORS.line}`, background: COLORS.surface, color: COLORS.ink, fontSize: 13, fontWeight: 600 }}>
                        Cancel
                      </button>
                    </div>
                  )}
                  {scanError && (
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: COLORS.coralBg, border: `1px solid ${COLORS.coral}33`, borderRadius: 10, padding: 12, marginBottom: 16 }}>
                      <AlertCircle size={15} color={COLORS.coral} style={{ flexShrink: 0, marginTop: 1 }} />
                      <p style={{ margin: 0, fontSize: 12.5, color: COLORS.ink }}>{scanError}</p>
                    </div>
                  )}
                  <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 16 }}>
                    <p style={{ margin: "0 0 10px", fontSize: 12.5, fontWeight: 600, color: COLORS.inkMuted }}>No camera handy? Pick a cooler manually:</p>
                    <select className="ce-select" value={manualCooler} onChange={(e) => setManualCooler(e.target.value)} style={{ marginBottom: 10 }}>
                      <option value="">Select a water cooler</option>
                      {facilities.filter((f) => f.type === "watercooler").map((f) => <option key={f.id} value={f.id}>{f.floor} — {f.name}</option>)}
                    </select>
                    <button className="ce-btn" onClick={() => { const f = facility(manualCooler); if (f) setScanResult(f); }} disabled={!manualCooler} style={{ width: "100%", padding: "10px 0", borderRadius: 9, border: `1px solid ${COLORS.line}`, background: COLORS.surface, color: COLORS.ink, fontSize: 13, fontWeight: 600, opacity: manualCooler ? 1 : 0.5 }}>
                      View status
                    </button>
                  </div>
                </div>
              ) : (
                <div className="ce-fade" style={{ maxWidth: 420 }}>
                  <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 16, padding: 20, marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <p style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{scanResult.name}</p>
                      <span style={{ fontSize: 12, fontWeight: 700, color: statusColor(scanResult.status), background: statusBg(scanResult.status), padding: "5px 11px", borderRadius: 999 }}>{TYPE_META[scanResult.type].labels[scanResult.status]}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: COLORS.inkMuted }}>{scanResult.floor}</p>
                    <p style={{ margin: "10px 0 0", fontSize: 13.5, color: COLORS.ink, display: "flex", alignItems: "center", gap: 6 }}>
                      <Droplets size={14} color={COLORS.teal} /> Last cleaned {formatRelative(scanResult.lastCleaned, now)}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="ce-btn" onClick={() => { setScanResult(null); setManualCooler(""); }} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: `1px solid ${COLORS.line}`, background: COLORS.surface, color: COLORS.ink, fontSize: 13, fontWeight: 600 }}>
                      Scan another
                    </button>
                    <button className="ce-btn" onClick={() => goReport(scanResult.id)} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: COLORS.coral, color: "#0F1216", fontSize: 13, fontWeight: 600 }}>
                      Report an issue
                    </button>
                  </div>
                </div>
              )}
            </Screen>
          )}

          {data && screen === "report" && (
            <Screen title="Report an Issue" subtitle="Flag something that needs staff attention." onBack={goHome} onReport={null} now={now}>
              <div style={{ maxWidth: 460, display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, color: COLORS.inkMuted, marginBottom: 6 }}>Facility</label>
                  <select className="ce-select" value={reportFacility} onChange={(e) => setReportFacility(e.target.value)}>
                    <option value="">Select a facility</option>
                    {FLOORS.map((fl) => (
                      <optgroup key={fl} label={fl}>
                        {facilities.filter((f) => f.floor === fl).map((f) => <option key={f.id} value={f.id}>{TYPE_META[f.type].noun}, {f.name}</option>)}
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
            </Screen>
          )}

          {data && screen === "reserve" && (
            <Screen title="Reserve Charging" subtitle="Book a free bay ahead of your next class." onBack={goHome} onReport={() => goReport("")} now={now}>
              <div style={{ maxWidth: 460, display: "flex", flexDirection: "column", gap: 14 }}>
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
                      <button key={s} className="ce-btn" onClick={() => setReserveSlot(s)} style={{ border: `1px solid ${reserveSlot === s ? COLORS.teal : COLORS.line}`, background: reserveSlot === s ? COLORS.tealBg : COLORS.surface, color: reserveSlot === s ? COLORS.teal : COLORS.ink, borderRadius: 999, padding: "7px 13px", fontSize: 12.5, fontFamily: "'IBM Plex Mono', monospace" }}>{s}</button>
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
                          <div><p style={{ margin: 0, fontSize: 12.5, fontWeight: 500 }}>{facilityName(r.facilityId)}</p><p style={{ margin: "2px 0 0", fontSize: 11.5, color: COLORS.inkMuted, fontFamily: "'IBM Plex Mono', monospace" }}>{r.slot}</p></div>
                          <button className="ce-btn" onClick={() => cancelReservation(r.id)} style={{ background: "none", border: "none", color: COLORS.inkMuted, padding: 4 }}><X size={15} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Screen>
          )}

          {data && screen === "admin" && (
            <Screen title="Staff Admin" subtitle="Open issues, QR codes, and trends." onBack={goHome} onReport={null} now={now}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 12, padding: "12px 16px", marginBottom: 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Sparkles size={15} color={COLORS.amber} />
                  <div><p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>Simulate live activity</p><p style={{ margin: "1px 0 0", fontSize: 11.5, color: COLORS.inkMuted }}>Randomly nudges facility status — handy for demos.</p></div>
                </div>
                <Switch on={simulate} onClick={() => setSimulate(!simulate)} color={COLORS.teal} />
              </div>

              <div style={{ marginBottom: 26 }}>
                <p style={{ fontSize: 12.5, color: COLORS.inkMuted, margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6 }}>
                  <QrCode size={13} /> Water cooler QR codes
                </p>
                <p style={{ fontSize: 12, color: COLORS.inkMuted, margin: "0 0 12px" }}>Print and stick one on each cooler. Scanning opens the app to that cooler's status.</p>
                <div className="ce-tile-grid">
                  {facilities.filter((f) => f.type === "watercooler").map((f) => {
                    const deepLink = typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}?qr=${f.id}` : `https://example.com/?qr=${f.id}`;
                    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent(deepLink)}`;
                    return (
                      <div key={f.id} style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: 16, display: "flex", gap: 14, alignItems: "center" }}>
                        <div style={{ width: 84, height: 84, borderRadius: 10, background: "#fff", padding: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${COLORS.line}` }}>
                          <img src={qrSrc} alt={`QR for ${f.name}`} width={72} height={72} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{f.name}</p>
                          <p style={{ margin: "2px 0 6px", fontSize: 11, color: COLORS.inkMuted }}>{f.floor}</p>
                          <button className="ce-btn" onClick={() => markCleaned(f.id)} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 500, padding: "6px 10px", borderRadius: 8, border: "none", background: COLORS.teal, color: "#0F1216" }}>
                            <CheckCircle2 size={12} /> Mark cleaned
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 22, alignItems: "start", marginBottom: 26 }}>
                <div>
                  <p style={{ fontSize: 12.5, color: COLORS.inkMuted, margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Open queue ({openQueue.length})</p>
                  {openQueue.length === 0 && <p style={{ fontSize: 13, color: COLORS.inkMuted }}>Nothing open. Queue's clear.</p>}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {openQueue.map((r) => (
                      <div key={r.id} style={{ background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: "14px 16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{facilityName(r.facilityId)}</p>
                          <span style={{ fontSize: 11, color: COLORS.inkMuted }}>{formatRelative(r.timestamp, now)}</span>
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
                    {feed.slice(0, 8).map((item) => (
                      <div key={item.id} style={{ display: "flex", gap: 10, padding: "10px 13px", background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 11 }}>
                        <div style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, background: item.kind === "report" ? COLORS.coralBg : COLORS.tealBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {item.kind === "report" ? <Flag size={12} color={COLORS.coral} /> : <Clock size={12} color={COLORS.teal} />}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ margin: 0, fontSize: 12, color: COLORS.ink }}>{item.kind === "report" ? <>{item.status === "resolved" ? "Resolved" : "Flagged"} <strong style={{ fontWeight: 500 }}>{facilityName(item.facilityId)}</strong></> : <>Reserved <strong style={{ fontWeight: 500 }}>{facilityName(item.facilityId)}</strong> for {item.slot}</>}</p>
                          <p style={{ margin: "2px 0 0", fontSize: 10.5, color: COLORS.inkMuted }}>{formatRelative(item.timestamp, now)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <p style={{ fontSize: 12.5, color: COLORS.inkMuted, margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Trends</p>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
                  <div style={{ flex: "1 1 150px", background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: "14px 16px" }}>
                    <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: COLORS.coral }}>{insights.openCount}</p>
                    <p style={{ margin: "3px 0 0", fontSize: 11.5, color: COLORS.inkMuted }}>Open issues</p>
                  </div>
                  <div style={{ flex: "1 1 150px", background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: "14px 16px" }}>
                    <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: COLORS.teal }}>{insights.avgMins !== null ? `${insights.avgMins}m` : "—"}</p>
                    <p style={{ margin: "3px 0 0", fontSize: 11.5, color: COLORS.inkMuted }}>Avg. resolve time</p>
                  </div>
                  <div style={{ flex: "1 1 150px", background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}><TrendingUp size={12} color={COLORS.inkMuted} /><p style={{ margin: 0, fontSize: 10.5, color: COLORS.inkMuted, textTransform: "uppercase" }}>Most flagged</p></div>
                    <p style={{ margin: "5px 0 0", fontSize: 13, fontWeight: 600 }}>{insights.topFacility}</p>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div style={{ height: 190, background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: "12px 8px 4px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={insights.byType} margin={{ top: 4, right: 8, left: -14, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: COLORS.inkMuted }} axisLine={{ stroke: COLORS.line }} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: COLORS.inkMuted }} axisLine={false} tickLine={false} width={20} />
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${COLORS.line}`, background: COLORS.surface, color: COLORS.ink }} cursor={{ fill: COLORS.tealBg }} />
                        <Bar dataKey="count" fill={COLORS.coral} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ height: 190, background: COLORS.panel, border: `1px solid ${COLORS.line}`, borderRadius: 14, padding: "12px 8px 4px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={insights.byFloor} margin={{ top: 4, right: 8, left: -14, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.line} vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: COLORS.inkMuted }} axisLine={{ stroke: COLORS.line }} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: COLORS.inkMuted }} axisLine={false} tickLine={false} width={20} />
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${COLORS.line}`, background: COLORS.surface, color: COLORS.ink }} cursor={{ fill: COLORS.tealBg }} />
                        <Bar dataKey="count" fill={COLORS.teal} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </Screen>
          )}
        </main>
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#14171C", color: "#fff", padding: "10px 18px", borderRadius: 999, fontSize: 13, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.08)", zIndex: 10 }}>
          {toast.kind === "ok" ? <Check size={14} /> : null}{toast.text}
        </div>
      )}
    </div>
  );
}
