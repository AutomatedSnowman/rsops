"use client";

import React, { useState } from "react";
import {
  Video, Plus, Minus, Crosshair, Home, Power, Pencil, X, Check,
  Star, Droplets, Save, RefreshCw, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight
} from "lucide-react";

// --- RAILSTREAM DARK MODE THEME ---
const T = {
  bg: "#000000",          
  surface: "#111111",     
  surfaceAlt: "#1a1a1a",  
  border: "#262626",      
  borderStrong: "#333333",
  ink: "#ffffff",         
  body: "#a1a1aa",        
  muted: "#71717a",       
  faint: "#52525b",       
  primary: "#ff6d00",     
  primaryHover: "#e66200",
  primarySoft: "rgba(255, 109, 0, 0.15)", 
  primaryInk: "#ffb880",  
  green: "#10b981", greenDot: "#34d399", greenSoft: "rgba(16, 185, 129, 0.15)",
  blue: "#3b82f6", blueSoft: "rgba(59, 130, 246, 0.15)", blueInk: "#93c5fd",
  amber: "#f59e0b", amberDot: "#fbbf24", amberSoft: "rgba(245, 158, 11, 0.15)",
  red: "#ef4444", redSoft: "rgba(239, 68, 68, 0.15)",
  purple: "#a855f7", purpleSoft: "rgba(168, 85, 247, 0.15)", 
};

const STATUS = {
  available:   { label: "Available",   dot: T.greenDot, fg: T.green,  bg: T.greenSoft },
  inuse:       { label: "In use",      dot: T.blue,     fg: T.blueInk, bg: T.blueSoft },
  unavailable: { label: "Unavailable", dot: T.amberDot, fg: T.amber,  bg: T.amberSoft },
};

const SEED_CAMERAS = [
  { id: "fos-bo", name: "Fostoria B&O", brand: "Hikvision", ip: "172.20.10.220", user: "admin", pass: "Ki$$leAndrea04", status: "inuse", operator: "WarrenS", dayPreset: "Day Home", nightPreset: "Night Home", presets: ["Day Home", "Diamonds", "West Wide", "Night Home"], restricted: false, enabled: true },
  { id: "saginaw", name: "Saginaw", brand: "Axis", ip: "172.20.28.220", user: "root", pass: "Ki$$leAndrea04", status: "available", operator: null, dayPreset: "Home", nightPreset: "Home", presets: ["Home", "North", "South"], restricted: false, enabled: true },
];

const SYSTEM_PRESET_KEYWORDS = [
  "auto-flip", "origin", "patrol", "pattern", "day mode", "night mode", 
  "day/night auto", "manual limits", "reboot", "osd menu", "scan"
];

const StatusBadge = ({ status, size = "md" }: any) => {
  const s = STATUS[status as keyof typeof STATUS] || STATUS.unavailable;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: s.bg, color: s.fg, borderRadius: 999, padding: size === "sm" ? "2px 8px" : "3px 10px", font: `600 ${size === "sm" ? 11 : 12}px Inter,sans-serif` }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, boxShadow: `0 0 8px ${s.dot}` }} />{s.label}
    </span>
  );
};

const Btn = ({ variant = "primary", children, style, ...p }: any) => {
  const v = {
    primary: { background: p.disabled ? "#3f3f46" : T.primary, color: p.disabled ? "#a1a1aa" : "#fff" },
    secondary: { background: T.surfaceAlt, color: T.ink, borderColor: T.borderStrong },
    danger: { background: "transparent", color: T.red, borderColor: T.redSoft },
    dangerSolid: { background: T.red, color: "#fff" },
  }[variant as keyof typeof v];
  return <button {...p} style={{ border: "1px solid transparent", borderRadius: 8, font: "600 13px Inter,sans-serif", padding: "9px 14px", cursor: p.disabled ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, ...v, ...style }}>{children}</button>;
};

const Field = ({ label, children, hint }: any) => (
  <label style={{ display: "block" }}>
    <span style={{ display: "block", font: "600 12px Inter,sans-serif", color: T.body, marginBottom: 5 }}>{label}</span>
    {children}
    {hint && <span style={{ display: "block", font: "11px Inter,sans-serif", color: T.faint, marginTop: 4 }}>{hint}</span>}
  </label>
);

const inputStyle = { width: "100%", background: T.surfaceAlt, border: `1px solid ${T.borderStrong}`, borderRadius: 8, padding: "9px 11px", font: "14px Inter,sans-serif", color: T.ink, boxSizing: "border-box" as const, outline: "none" };

function Modal({ title, subtitle, onClose, children, footer, wide }: any) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "6vh 16px", zIndex: 100 }}>
      <div style={{ width: wide ? 640 : 480, maxWidth: "100%", background: T.surface, borderRadius: 14, border: `1px solid ${T.border}`, boxShadow: "0 24px 60px -20px rgba(0,0,0,0.7)" }}>
        <div style={{ padding: "18px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between" }}>
          <div><h2 style={{ margin: 0, font: "700 17px Inter,sans-serif", color: T.ink }}>{title}</h2><p style={{ margin: "3px 0 0", font: "13px Inter,sans-serif", color: T.muted }}>{subtitle}</p></div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: T.muted }}><X size={18} /></button>
        </div>
        <div style={{ padding: 20, maxHeight: "62vh", overflowY: "auto" }}>{children}</div>
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "flex-end", gap: 10, background: T.bg, borderRadius: "0 0 14px 14px" }}>{footer}</div>
      </div>
    </div>
  );
}

function Console({ cam, session, onEnd, isAdmin }: any) {
  const [pan, setPan] = useState(0), [tilt, setTilt] = useState(0), [zoom, setZoom] = useState(0);
  const [active, setActive] = useState<string | null>(null);
  const [preset, setPreset] = useState(cam.dayPreset);
  const [speed, setSpeed] = useState<number>(0.5); 
  
  const [livePresets, setLivePresets] = useState<{id: any, name: string}[]>(
    cam.presets.map((p: string, i: number) => ({ id: i + 1, name: p }))
  );
  
  const elapsed = Date.now() - session.startedAt;
  const videoSrc = `/api/video?type=${cam.brand.toLowerCase()}&ip=${encodeURIComponent(cam.ip)}&user=${encodeURIComponent(cam.user)}&pass=${encodeURIComponent(cam.pass)}`;

  const sendAPICommand = async (command: string, payload: any = {}) => {
    try {
      const res = await fetch('/api/ptz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          camera: { type: cam.brand.toLowerCase(), ip: cam.ip, user: cam.user, pass: cam.pass },
          command,
          ...payload
        })
      });
      return await res.json();
    } catch (err) {
      console.error('API Dispatch Error:', err);
    }
  };

  const syncPresetsFromHardware = async () => {
    const data = await sendAPICommand('get_presets');
    if (data && data.presets && data.presets.length > 0) {
      setLivePresets(data.presets);
    } else {
      alert('Could not find any named presets on this camera.');
    }
  };

  const startNudge = (dx: number, dy: number, dz: number, k: string) => {
    setActive(k);
    setPan((p) => Math.max(-100, Math.min(100, p + dx)));
    setTilt((v) => Math.max(-100, Math.min(100, v + dy)));
    setZoom((z) => Math.max(0, Math.min(100, z + dz)));
    
    sendAPICommand('move', {
      pan: dx !== 0 ? (dx > 0 ? speed : -speed) : 0,
      tilt: dy !== 0 ? (dy > 0 ? speed : -speed) : 0,
      zoom: dz !== 0 ? (dz > 0 ? speed : -speed) : 0
    });
  };

  const stopNudge = () => { setActive(null); sendAPICommand('stop'); };

  const handlePresetSelect = (p: {id: any, name: string}) => {
    setPreset(p.name);
    sendAPICommand('preset', { presetId: p.id });
  };

  const handleAdminSavePreset = () => {
    const target = livePresets.find(p => p?.name === preset);
    if (!target) return;
    if (!window.confirm(`WARNING: This will permanently overwrite the physical coordinates for preset "${target.name}". Proceed?`)) return;
    sendAPICommand('set_preset', { presetId: target.id, presetName: target.name });
  };

  const padBtn = (Icon: any, k: string, dx: number, dy: number) => (
    <button 
      onMouseDown={() => startNudge(dx, dy, 0, k)} onMouseUp={stopNudge} onMouseLeave={stopNudge}
      style={{ background: active === k ? T.primary : T.surfaceAlt, border: `1px solid ${active === k ? T.primary : T.borderStrong}`, color: active === k ? "#fff" : T.body, borderRadius: 8, height: 42, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all .12s" }}
    ><Icon size={18} /></button>
  );

  // Safely check for name before rendering to prevent undefined crashes
  const wiperPreset = livePresets.find(p => p?.name?.toLowerCase() === 'wiper');
  const userPresets = livePresets.filter(p => 
    p?.name && 
    p.name.toLowerCase() !== 'wiper' && 
    !SYSTEM_PRESET_KEYWORDS.some(sys => p.name.toLowerCase().includes(sys))
  );

  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.redSoft, color: T.red, borderRadius: 999, padding: "3px 10px", font: "600 12px Inter,sans-serif" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.red, boxShadow: `0 0 6px ${T.red}` }} /> Live
          </span>
          <div><h2 style={{ margin: 0, font: "700 18px Inter,sans-serif", color: T.ink }}>{cam.name}</h2><div style={{ font: "12px ui-monospace,monospace", color: T.muted }}>{cam.ip} · {cam.brand}</div></div>
        </div>
      </div>

      <div style={{ padding: 18, display: "grid", gap: 16 }}>
        <div style={{ position: "relative", aspectRatio: "16/9", borderRadius: 10, background: "#000", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: 'hidden' }}>
           <img 
              src={videoSrc} 
              alt={`Live feed from ${cam.name}`}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = `<span style="color:${T.faint};font:13px Inter">Video stream offline or MJPEG sub-stream not enabled on camera.</span>`;
              }}
           />
           <div style={{ position: "absolute", right: 12, bottom: 12, font: "11px ui-monospace,monospace", color: "#fff", background: "rgba(0,0,0,0.6)", border: `1px solid ${T.borderStrong}`, padding: "4px 9px", borderRadius: 6 }}>PAN {pan} · TILT {tilt} · ZOOM {zoom}</div>
        </div>

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div style={{ font: "12px Inter,sans-serif", color: T.body, marginBottom: 10, fontWeight: 600 }}>Movement & Speed</div>
            <div style={{ display: "grid", gridTemplateColumns: "42px 42px 42px", gridTemplateRows: "42px 42px 42px", gap: 6, marginBottom: 14 }}>
              <span />{padBtn(ChevronUp, "u", 0, 12)}<span />
              {padBtn(ChevronLeft, "l", -12, 0)}
              <div style={{ background: "transparent", border: `1px solid ${T.borderStrong}`, borderRadius: 8 }} />
              {padBtn(ChevronRight, "r", 12, 0)}
              <span />{padBtn(ChevronDown, "d", 0, -12)}<span />
            </div>
            <input type="range" min="0.1" max="1.0" step="0.1" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} style={{ width: "100%", accentColor: T.primary, cursor: "ew-resize" }} />
            <div style={{ textAlign: "center", font: "11px Inter,sans-serif", color: T.muted, marginTop: 6 }}>Motor Speed: {Math.round(speed * 100)}%</div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={{ font: "12px Inter,sans-serif", color: T.body, marginBottom: 10, fontWeight: 600 }}>Zoom</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <button onMouseDown={() => startNudge(0, 0, 14, "zi")} onMouseUp={stopNudge} onMouseLeave={stopNudge} style={{ width: 48, height: 42, background: active === "zi" ? T.primary : T.surfaceAlt, border: `1px solid ${active === "zi" ? T.primary : T.borderStrong}`, color: active === "zi" ? "#fff" : T.body, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={18} /></button>
                <button onMouseDown={() => startNudge(0, 0, -14, "zo")} onMouseUp={stopNudge} onMouseLeave={stopNudge} style={{ width: 48, height: 42, background: active === "zo" ? T.primary : T.surfaceAlt, border: `1px solid ${active === "zo" ? T.primary : T.borderStrong}`, color: active === "zo" ? "#fff" : T.body, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={18} /></button>
              </div>
            </div>
            
            {wiperPreset && (
              <div>
                 <div style={{ font: "12px Inter,sans-serif", color: T.body, marginBottom: 10, fontWeight: 600 }}>Functions</div>
                 <Btn variant="secondary" onClick={() => handlePresetSelect(wiperPreset)} style={{ width: "100%", height: 42 }}>
                   <Droplets color={T.blueInk} size={16} /> Wiper
                 </Btn>
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ font: "12px Inter,sans-serif", color: T.body, fontWeight: 600 }}>Physical Presets</div>
              <button onClick={syncPresetsFromHardware} title="Sync from camera hardware" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: T.muted, display: 'flex', alignItems: 'center', gap: 4, font: "11px Inter" }}><RefreshCw size={12} /> Sync</button>
            </div>
            
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {userPresets.map((p) => (
                <button key={p.id} onClick={() => handlePresetSelect(p)} style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer", font: "13px Inter,sans-serif", background: preset === p.name ? T.primarySoft : "transparent", color: preset === p.name ? T.primary : T.ink, border: `1px solid ${preset === p.name ? T.primary : T.borderStrong}`, fontWeight: preset === p.name ? 600 : 400 }}>{p.name}</button>
              ))}
              {userPresets.length === 0 && <div style={{font: "12px Inter", color: T.faint, padding: "8px 0"}}>No physical presets synced.</div>}
            </div>
            
            {isAdmin && (
              <div style={{ background: "rgba(239, 68, 68, 0.05)", border: `1px dashed ${T.redSoft}`, padding: 12, borderRadius: 8, marginTop: "auto" }}>
                <div style={{ font: "11px Inter,sans-serif", color: T.red, fontWeight: 600, marginBottom: 8 }}>ADMIN OVERRIDE</div>
                <Btn variant="danger" onClick={handleAdminSavePreset} style={{ width: "100%", background: T.bg }}>
                  <Save size={14} /> Update "{preset}" Location
                </Btn>
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ padding: "0 18px 18px" }}>
        <Btn variant="danger" onClick={() => { sendAPICommand('stop'); onEnd(cam, elapsed); }} style={{ width: "100%", background: T.surfaceAlt }}><Power size={15} /> End session &amp; release hardware</Btn>
      </div>
    </div>
  );
}

function CameraForm({ initial, onSave, onClose }: any) {
  const [f, setF] = useState(initial ? { ...initial, presetText: initial.presets.join(", ") } : { name: "", brand: "Hikvision", ip: "", user: "admin", pass: "", channel: 1, dayPreset: "Home", nightPreset: "Home", presets: ["Home"], restricted: false, enabled: true, presetText: "Home" });
  const set = (k: string, v: any) => setF((s: any) => ({ ...s, [k]: v }));
  
  const save = () => {
    const presets = f.presetText.split(",").map((s: string) => s.trim()).filter(Boolean);
    onSave({ ...f, presets: presets.length ? presets : ["Home"], channel: Number(f.channel) || 1, id: initial?.id ?? f.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") });
  };

  return (
    <Modal wide title={initial ? "Edit Camera" : "Add Camera"} subtitle="These credentials will be passed directly to the PTZ tunnel API." onClose={onClose} footer={<><Btn variant="secondary" onClick={onClose}>Cancel</Btn><Btn onClick={save}><Check size={15} /> Save Camera</Btn></>}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ gridColumn: "1 / -1" }}><Field label="Camera Name"><input style={inputStyle} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Mainline Junction" /></Field></div>
        <Field label="Brand">
          <select style={inputStyle} value={f.brand} onChange={(e) => set("brand", e.target.value)}>
            <option style={{background: T.surface}}>Hikvision</option>
            <option style={{background: T.surface}}>Axis</option>
          </select>
        </Field>
        <Field label="Tunnel IP Address"><input style={inputStyle} value={f.ip} onChange={(e) => set("ip", e.target.value)} placeholder="172.20.10.220" /></Field>
        <Field label="Admin Username"><input style={inputStyle} value={f.user} onChange={(e) => set("user", e.target.value)} /></Field>
        <Field label="Admin Password"><input style={inputStyle} type="password" value={f.pass} onChange={(e) => set("pass", e.target.value)} /></Field>
        <div style={{ gridColumn: "1 / -1" }}><Field label="UI Preset Buttons (Comma Separated)"><input style={inputStyle} value={f.presetText} onChange={(e) => set("presetText", e.target.value)} placeholder="Home, Wide, Platform" /></Field></div>
      </div>
    </Modal>
  );
}

function Admin({ cameras, setCameras }: any) {
  const [editing, setEditing] = useState<any>(null);
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ margin: 0, font: "700 16px Inter,sans-serif", color: T.ink }}>Network Cameras</h3>
        <Btn onClick={() => setEditing("new")}><Plus size={16} /> Add Camera</Btn>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {cameras.map((c: any) => (
          <div key={c.id} style={{ display: "flex", justifyContent: "space-between", padding: 14, background: T.bg, border: `1px solid ${T.borderStrong}`, borderRadius: 8 }}>
            <div><div style={{ fontWeight: 600, color: T.ink, marginBottom: 4 }}>{c.name}</div><div style={{ font: "12px ui-monospace,monospace", color: T.muted }}>{c.ip} ({c.brand})</div></div>
            <button onClick={() => setEditing(c)} style={{ background: "transparent", border: "none", cursor: "pointer", color: T.primary }}><Pencil size={16} /></button>
          </div>
        ))}
      </div>
      {editing && <CameraForm initial={editing === "new" ? null : editing} onSave={(cam: any) => { setCameras((cs: any[]) => cs.some(c => c.id === cam.id) ? cs.map(c => c.id === cam.id ? cam : c) : [...cs, cam]); setEditing(null); }} onClose={() => setEditing(null)} />}
    </div>
  );
}

export default function OperatorPage() {
  const [cameras, setCameras] = useState(SEED_CAMERAS);
  const [session, setSession] = useState<any>(null);
  const [roleView, setRoleView] = useState("admin");

  const take = (cam: any) => setSession({ cameraId: cam.id, startedAt: Date.now() });
  const activeCam = session ? cameras.find((c) => c.id === session.cameraId) : null;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.ink, fontFamily: "Inter,system-ui,sans-serif" }}>
      <header style={{ background: "#000000", borderBottom: `1px solid ${T.border}`, padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ color: T.primary, display: "flex", alignItems: "center", gap: 8, font: "800 20px Inter,sans-serif", letterSpacing: "-0.5px" }}>
              <Video fill={T.primary} size={22} /> RAILSTREAM
            </div>
            <span style={{ color: T.body, font: "500 15px Inter,sans-serif", borderLeft: `1px solid ${T.borderStrong}`, paddingLeft: 12, marginLeft: 4 }}>Operations</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
             <span style={{ font: "14px Inter", color: T.muted }}>Help</span>
             <span style={{ display: "flex", alignItems: "center", gap: 6, background: T.purple, color: "#fff", font: "600 13px Inter", padding: "6px 12px", borderRadius: 999 }}>
               <Star fill="#fff" size={13} /> Admin
             </span>
             <span style={{ font: "14px Inter,sans-serif", color: T.ink, fontWeight: 500 }}>WarrenS</span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "32px auto", padding: "0 20px", display: "grid", gap: 32, gridTemplateColumns: "1fr 360px" }}>
        <div>
          {activeCam && <div style={{ marginBottom: 32 }}><Console cam={activeCam} session={session} onEnd={() => setSession(null)} isAdmin={roleView === "admin"} /></div>}
          
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
            <h2 style={{ font: "700 20px Inter,sans-serif", margin: 0, color: T.ink }}>Active Fleet</h2>
            <span style={{ color: T.faint, font: "13px Inter" }}>{cameras.length} connections</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {cameras.map((c: any) => (
              <div key={c.id} style={{ background: T.surface, border: `1px solid ${session?.cameraId === c.id ? T.primary : T.border}`, padding: 20, borderRadius: 12, transition: "border 0.2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                   <div>
                     <h3 style={{ margin: 0, font: "600 16px Inter,sans-serif", color: T.ink }}>{c.name}</h3>
                     <p style={{ font: "12px ui-monospace,monospace", color: T.faint, margin: "4px 0 0" }}>{c.ip}</p>
                   </div>
                   <StatusBadge status={c.status} size="sm" />
                </div>
                <Btn onClick={() => take(c)} variant={session?.cameraId === c.id ? "secondary" : "primary"} style={{ width: "100%", marginTop: 8 }}>{session?.cameraId === c.id ? "Controls Active" : "Take Control"}</Btn>
              </div>
            ))}
          </div>
        </div>
        <aside>
          <Admin cameras={cameras} setCameras={setCameras} />
        </aside>
      </main>
    </div>
  );
}