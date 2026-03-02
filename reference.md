<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SISWIT — Command Center</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Bricolage+Grotesque:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --ink: #0d0d0d;
  --paper: #f7f5f0;
  --cream: #ede9e0;
  --line: rgba(13,13,13,0.1);
  --line2: rgba(13,13,13,0.06);
  --accent: #d4ff00;
  --accent2: #ff3d00;
  --blue: #0047ff;
  --muted: rgba(13,13,13,0.4);
  --dim: rgba(13,13,13,0.25);
}

html { font-size: 14px; }

body {
  font-family: 'Bricolage Grotesque', sans-serif;
  background: var(--paper);
  color: var(--ink);
  min-height: 100vh;
  display: flex;
  position: relative;
  overflow-x: hidden;
}

/* NOISE TEXTURE OVERLAY */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 9999;
  opacity: 0.5;
}

/* GRID LINES BACKGROUND */
.grid-bg {
  position: fixed;
  inset: 0;
  background-image: 
    linear-gradient(var(--line2) 1px, transparent 1px),
    linear-gradient(90deg, var(--line2) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none;
  z-index: 0;
}

/* SIDEBAR */
.sidebar {
  width: 200px;
  min-height: 100vh;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 50;
  border-right: 1px solid var(--line);
  background: var(--paper);
  display: flex;
  flex-direction: column;
}

.logo-block {
  padding: 24px 20px;
  border-bottom: 1px solid var(--line);
}
.logo-type {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 28px;
  letter-spacing: 0.08em;
  line-height: 1;
  color: var(--ink);
}
.logo-sub {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--muted);
  margin-top: 4px;
  font-weight: 500;
}

.nav-block {
  flex: 1;
  padding: 16px 12px;
}
.nav-section-lbl {
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--dim);
  padding: 0 8px;
  margin-bottom: 4px;
  margin-top: 16px;
  font-weight: 600;
}
.nav-section-lbl:first-child { margin-top: 0; }

.nav-link {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.12s;
  text-decoration: none;
  margin-bottom: 1px;
}
.nav-link:hover { color: var(--ink); background: var(--cream); }
.nav-link.on {
  color: var(--ink);
  font-weight: 700;
  background: var(--ink);
  color: var(--accent);
}
.nav-link.on svg { color: var(--accent); }

.nav-ic { width: 14px; height: 14px; flex-shrink: 0; }

.notif-badge {
  margin-left: auto;
  background: var(--accent2);
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  width: 16px; height: 16px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}

.sidebar-bottom {
  border-top: 1px solid var(--line);
  padding: 16px 12px;
}
.user-block {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.12s;
}
.user-block:hover { background: var(--cream); }
.ava {
  width: 32px; height: 32px;
  background: var(--ink);
  color: var(--accent);
  border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 14px;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}
.u-name { font-size: 12px; font-weight: 700; }
.u-role { font-size: 10px; color: var(--muted); }

/* MAIN */
.main {
  margin-left: 200px;
  flex: 1;
  position: relative;
  z-index: 1;
  min-height: 100vh;
}

/* TOP STRIP */
.topstrip {
  border-bottom: 1px solid var(--line);
  padding: 0 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  background: var(--paper);
  position: sticky;
  top: 0;
  z-index: 40;
  animation: slideIn 0.4s ease both;
}
@keyframes slideIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }

.breadcrumb {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--muted);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}
.breadcrumb span { color: var(--ink); }

.topstrip-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.date-chip {
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}
.btn-ink {
  padding: 8px 18px;
  background: var(--ink);
  color: var(--accent);
  border: none;
  border-radius: 2px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  cursor: pointer;
  font-family: 'Bricolage Grotesque', sans-serif;
  transition: all 0.15s;
}
.btn-ink:hover { background: #222; transform: translateY(-1px); }
.btn-ghost2 {
  padding: 8px 16px;
  background: transparent;
  color: var(--ink);
  border: 1px solid var(--line);
  border-radius: 2px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  cursor: pointer;
  font-family: 'Bricolage Grotesque', sans-serif;
  transition: all 0.15s;
}
.btn-ghost2:hover { border-color: var(--ink); }

.toggle-seg {
  display: flex;
  border: 1px solid var(--line);
  border-radius: 2px;
  overflow: hidden;
}
.seg-btn {
  padding: 7px 14px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  border: none;
  background: transparent;
  color: var(--muted);
  font-family: 'Bricolage Grotesque', sans-serif;
  transition: all 0.12s;
  border-right: 1px solid var(--line);
}
.seg-btn:last-child { border-right: none; }
.seg-btn.on { background: var(--ink); color: var(--accent); }

/* HERO HEADER SECTION */
.hero-section {
  padding: 36px 36px 0;
  border-bottom: 1px solid var(--line);
  animation: riseUp 0.5s 0.1s ease both;
}
@keyframes riseUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }

.hero-inner {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-bottom: 28px;
}
.hero-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 72px;
  letter-spacing: 0.04em;
  line-height: 0.9;
  color: var(--ink);
}
.hero-title .accent-word {
  color: transparent;
  -webkit-text-stroke: 2px var(--ink);
}
.hero-sub {
  font-size: 13px;
  color: var(--muted);
  font-weight: 400;
  max-width: 280px;
  line-height: 1.5;
  margin-top: 12px;
}

.hero-stats {
  display: flex;
  gap: 0;
  border: 1px solid var(--line);
  border-radius: 4px;
  overflow: hidden;
}
.hstat {
  padding: 14px 22px;
  border-right: 1px solid var(--line);
  text-align: center;
  min-width: 100px;
}
.hstat:last-child { border-right: none; }
.hstat-val {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 30px;
  letter-spacing: 0.04em;
  line-height: 1;
}
.hstat-lbl { font-size: 9px; text-transform: uppercase; letter-spacing: 0.14em; color: var(--muted); margin-top: 3px; font-weight: 600; }
.hstat.active-stat { background: var(--ink); }
.hstat.active-stat .hstat-val { color: var(--accent); }
.hstat.active-stat .hstat-lbl { color: rgba(212,255,0,0.5); }

/* CONTENT */
.content {
  padding: 28px 36px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* METRIC ROW */
.metrics-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border: 1px solid var(--line);
  border-radius: 4px;
  overflow: hidden;
  animation: riseUp 0.5s 0.18s ease both;
}

.mcard {
  padding: 24px 22px;
  border-right: 1px solid var(--line);
  position: relative;
  transition: background 0.2s;
  cursor: pointer;
  overflow: hidden;
}
.mcard:last-child { border-right: none; }
.mcard:hover { background: var(--cream); }

.mcard-num {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 48px;
  letter-spacing: 0.02em;
  line-height: 1;
  margin-bottom: 4px;
}
.mc-rev .mcard-num { color: var(--blue); }
.mc-pipe .mcard-num { color: var(--ink); }
.mc-inv .mcard-num { color: var(--accent2); }
.mc-cont .mcard-num { color: #059669; }

.mcard-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--muted);
  font-weight: 700;
  margin-bottom: 10px;
}
.mcard-change {
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}
.chg-up { color: #059669; }
.chg-warn { color: var(--accent2); }
.chg-meta { color: var(--dim); font-weight: 400; }

.mcard-deco {
  position: absolute;
  right: 16px; top: 16px;
  font-size: 28px;
  opacity: 0.08;
}

/* MAIN GRID */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
  animation: riseUp 0.5s 0.26s ease both;
}

/* PANEL */
.panel {
  border: 1px solid var(--line);
  border-radius: 4px;
  overflow: hidden;
  background: var(--paper);
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 22px;
  border-bottom: 1px solid var(--line);
  background: var(--cream);
}
.panel-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 18px;
  letter-spacing: 0.1em;
}
.panel-subtitle { font-size: 11px; color: var(--muted); font-weight: 400; }
.panel-action {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--muted);
  font-weight: 700;
  cursor: pointer;
  border: 1px solid var(--line);
  background: transparent;
  padding: 5px 12px;
  border-radius: 2px;
  font-family: 'Bricolage Grotesque', sans-serif;
  transition: all 0.12s;
}
.panel-action:hover { color: var(--ink); border-color: var(--ink); }

/* CHART */
.chart-body { padding: 22px; }
.chart-area {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 160px;
  position: relative;
}

/* grid lines */
.chart-area::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    180deg,
    var(--line2) 0px,
    var(--line2) 1px,
    transparent 1px,
    transparent 25%
  );
  pointer-events: none;
}

.bar-g { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0; height: 100%; }
.bar-t { flex: 1; width: 100%; display: flex; flex-direction: column; justify-content: flex-end; }
.b-fill {
  width: 100%;
  border-radius: 2px 2px 0 0;
  position: relative;
  cursor: pointer;
  transition: filter 0.15s;
}
.b-fill.is-now { background: var(--ink); }
.b-fill.is-now::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--accent);
  opacity: 0.3;
  border-radius: 2px 2px 0 0;
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse { 0%,100% { opacity:0.2; } 50% { opacity:0.5; } }
.b-fill.is-past { background: var(--cream); border: 1px solid var(--line); }
.b-fill:hover { filter: brightness(1.1); }

.b-val {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-4px);
  font-size: 10px;
  font-weight: 800;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.15s;
  background: var(--ink);
  color: var(--accent);
  padding: 2px 6px;
  border-radius: 2px;
}
.b-fill:hover .b-val { opacity: 1; }

.b-month { font-size: 10px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 8px; }
.b-month.now { color: var(--ink); }

/* ACTION PANEL */
.action-seg {
  display: flex;
  border-bottom: 1px solid var(--line);
}
.aseg {
  flex: 1;
  padding: 10px;
  text-align: center;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--muted);
  cursor: pointer;
  border: none;
  background: transparent;
  border-right: 1px solid var(--line);
  font-family: 'Bricolage Grotesque', sans-serif;
  transition: all 0.12s;
}
.aseg:last-child { border-right: none; }
.aseg.on { background: var(--ink); color: var(--accent); }

.action-body2 { padding: 0; }
.aitem {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--line);
  transition: background 0.12s;
  cursor: default;
}
.aitem:last-child { border-bottom: none; }
.aitem:hover { background: var(--cream); }

.aitem-priority {
  width: 4px;
  flex-shrink: 0;
}
.pri-high { background: var(--accent2); }
.pri-med { background: #f59e0b; }

.aitem-content { flex: 1; padding: 13px 16px; min-width: 0; }
.aitem-title { font-size: 13px; font-weight: 700; }
.aitem-desc { font-size: 11px; color: var(--muted); margin-top: 2px; }
.aitem-foot { display: flex; align-items: center; gap: 8px; margin-top: 8px; }

.pri-tag {
  font-size: 8px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  padding: 2px 7px;
  border-radius: 1px;
}
.pt-high { background: var(--accent2); color: #fff; }
.pt-med { background: #f59e0b; color: #fff; }
.days-tag { font-size: 10px; color: var(--muted); font-weight: 600; }

.aitem-cta {
  padding: 13px 14px;
  display: flex;
  align-items: center;
}
.cta-btn {
  padding: 6px 12px;
  background: var(--ink);
  color: var(--accent);
  border: none;
  border-radius: 2px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  font-family: 'Bricolage Grotesque', sans-serif;
  transition: all 0.12s;
  white-space: nowrap;
}
.cta-btn:hover { background: #333; }
.cta-btn.ghost { background: transparent; color: var(--ink); border: 1px solid var(--line); }
.cta-btn.ghost:hover { border-color: var(--ink); }

/* BOTTOM GRID */
.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  animation: riseUp 0.5s 0.34s ease both;
}

/* TABLE */
.tbl { width: 100%; border-collapse: collapse; }
.tbl th {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--muted);
  font-weight: 800;
  padding: 0 16px 10px;
  text-align: left;
  border-bottom: 1px solid var(--line);
}
.tbl td {
  padding: 11px 16px;
  font-size: 13px;
  border-bottom: 1px solid var(--line2);
  vertical-align: middle;
}
.tbl tr:last-child td { border-bottom: none; }
.tbl tr:hover td { background: var(--cream); }

.stage-lbl {
  font-size: 9px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 3px 8px;
  border-radius: 1px;
}
.sl-prop { background: #dbeafe; color: #1d4ed8; }
.sl-neg { background: #ede9fe; color: #6d28d9; }
.sl-disc { background: #fef3c7; color: #b45309; }
.sl-won { background: #dcfce7; color: #15803d; }

.val-big { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 0.04em; }
.vb-blue { color: var(--blue); }
.vb-ind { color: #6d28d9; }
.vb-amb { color: #b45309; }
.vb-grn { color: #15803d; }

.exp-lbl {
  font-size: 11px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 1px;
  font-family: 'Bebas Neue', sans-serif;
  letter-spacing: 0.08em;
  font-size: 13px;
}
.el-red { background: #fee2e2; color: var(--accent2); }
.el-amb { background: #fef3c7; color: #b45309; }
.el-grn { background: #dcfce7; color: #15803d; }
</style>
</head>
<body>

<div class="grid-bg"></div>

<!-- SIDEBAR -->
<aside class="sidebar">
  <div class="logo-block">
    <div class="logo-type">SISWIT</div>
    <div class="logo-sub">Owner · Command Center</div>
  </div>

  <div class="nav-block">
    <div class="nav-section-lbl">Overview</div>
    <a class="nav-link on">
      <svg class="nav-ic" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor"/><rect x="8" y="1" width="5" height="5" rx="1" fill="currentColor" opacity="0.4"/><rect x="1" y="8" width="5" height="5" rx="1" fill="currentColor" opacity="0.4"/><rect x="8" y="8" width="5" height="5" rx="1" fill="currentColor" opacity="0.4"/></svg>
      Dashboard
    </a>

    <div class="nav-section-lbl">Operations</div>
    <a class="nav-link">
      <svg class="nav-ic" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="4.5" r="2.5" stroke="currentColor" stroke-width="1.4"/><path d="M1.5 12c0-3 2.5-4.5 5.5-4.5s5.5 1.5 5.5 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
      Team
    </a>
    <a class="nav-link">
      <svg class="nav-ic" viewBox="0 0 14 14" fill="none"><rect x="1" y="2" width="12" height="10" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M4 1v2M10 1v2M1 5.5h12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
      Attendance
    </a>

    <div class="nav-section-lbl">Finance</div>
    <a class="nav-link">
      <svg class="nav-ic" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M4.5 3.5h4a2 2 0 010 4H4.5m0 0h3.5a2 2 0 010 4H4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
      Billing
    </a>
    <a class="nav-link">
      <svg class="nav-ic" viewBox="0 0 14 14" fill="none"><path d="M7 1L8.8 5H13L9.5 7.5L10.9 11.5L7 9L3.1 11.5L4.5 7.5L1 5H5.2L7 1Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>
      Approvals
      <div class="notif-badge">2</div>
    </a>

    <div class="nav-section-lbl">Admin</div>
    <a class="nav-link">
      <svg class="nav-ic" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="2.5" stroke="currentColor" stroke-width="1.4"/><path d="M7 1v2M7 11v2M1 7h2M11 7h2M2.64 2.64l1.41 1.41M9.95 9.95l1.41 1.41M2.64 11.36l1.41-1.41M9.95 4.05l1.41-1.41" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
      Settings
    </a>
  </div>

  <div class="sidebar-bottom">
    <div class="user-block">
      <div class="ava">PS</div>
      <div>
        <div class="u-name">Piyush Solanki</div>
        <div class="u-role">System Owner</div>
      </div>
    </div>
  </div>
</aside>

<!-- MAIN -->
<main class="main">

  <!-- TOP STRIP -->
  <div class="topstrip">
    <div class="breadcrumb">
      SISWIT &nbsp;/&nbsp; <span>Owner Dashboard</span>
    </div>
    <div class="topstrip-right">
      <span class="date-chip">FRI · 20 FEB 2026</span>
      <div class="toggle-seg">
        <button class="seg-btn on" onclick="segClick(this)">6M</button>
        <button class="seg-btn" onclick="segClick(this)">12M</button>
      </div>
      <button class="btn-ghost2">↓ Export</button>
      <button class="btn-ink">Download Report</button>
    </div>
  </div>

  <!-- HERO SECTION -->
  <div class="hero-section">
    <div class="hero-inner">
      <div>
        <div class="hero-title">
          OWNER<br>
          <span class="accent-word">COMMAND</span>
        </div>
        <div class="hero-sub">Your full business picture — revenue, pipeline, contracts, and actions that need you right now.</div>
      </div>

      <div class="hero-stats">
        <div class="hstat active-stat">
          <div class="hstat-val">$248K</div>
          <div class="hstat-lbl">Revenue · Feb</div>
        </div>
        <div class="hstat">
          <div class="hstat-val">$1.2M</div>
          <div class="hstat-lbl">Pipeline</div>
        </div>
        <div class="hstat">
          <div class="hstat-val">34</div>
          <div class="hstat-lbl">Contracts</div>
        </div>
        <div class="hstat">
          <div class="hstat-val" style="color:var(--accent2)">4</div>
          <div class="hstat-lbl">Urgent Items</div>
        </div>
      </div>
    </div>
  </div>

  <!-- CONTENT -->
  <div class="content">

    <!-- METRIC ROW -->
    <div class="metrics-row">
      <div class="mcard mc-rev">
        <div class="mcard-label">Total Revenue</div>
        <div class="mcard-num">$248K</div>
        <div class="mcard-change"><span class="chg-up">↑ 12.4%</span><span class="chg-meta">vs last month</span></div>
        <div class="mcard-deco">💰</div>
      </div>
      <div class="mcard mc-pipe">
        <div class="mcard-label">Pipeline Value</div>
        <div class="mcard-num">$1.2M</div>
        <div class="mcard-change"><span class="chg-up">↑ 8.1%</span><span class="chg-meta">14 open deals</span></div>
        <div class="mcard-deco">📊</div>
      </div>
      <div class="mcard mc-inv">
        <div class="mcard-label">Open Invoices</div>
        <div class="mcard-num">$86K</div>
        <div class="mcard-change"><span class="chg-warn">3 overdue</span><span class="chg-meta">need action</span></div>
        <div class="mcard-deco">🧾</div>
      </div>
      <div class="mcard mc-cont">
        <div class="mcard-label">Active Contracts</div>
        <div class="mcard-num">34</div>
        <div class="mcard-change"><span class="chg-up">↑ 5 new</span><span class="chg-meta">this month</span></div>
        <div class="mcard-deco">📄</div>
      </div>
    </div>

    <!-- MAIN GRID -->
    <div class="main-grid">

      <!-- Chart -->
      <div class="panel">
        <div class="panel-head">
          <div>
            <div class="panel-title">Revenue Trend</div>
            <div class="panel-subtitle">Monthly — last 6 months</div>
          </div>
          <button class="panel-action">View Full Report →</button>
        </div>
        <div class="chart-body">
          <div class="chart-area" id="chartArea"></div>
          <div style="display:flex;gap:8px;margin-top:12px;" id="chartMonths"></div>
        </div>
      </div>

      <!-- Actions -->
      <div class="panel">
        <div class="panel-head">
          <div>
            <div class="panel-title">Action Required</div>
            <div class="panel-subtitle">4 items need your attention</div>
          </div>
        </div>
        <div class="action-seg">
          <button class="aseg on" onclick="asegClick(this)">All</button>
          <button class="aseg" onclick="asegClick(this)">High</button>
          <button class="aseg" onclick="asegClick(this)">Medium</button>
        </div>
        <div class="action-body2">
          <div class="aitem">
            <div class="aitem-priority pri-high"></div>
            <div class="aitem-content">
              <div class="aitem-title">Quote Approval Needed</div>
              <div class="aitem-desc">Acme Corp — $125,000 (Discount: 15%)</div>
              <div class="aitem-foot">
                <span class="pri-tag pt-high">High</span>
                <span class="days-tag">2 days left</span>
              </div>
            </div>
            <div class="aitem-cta"><button class="cta-btn">Review</button></div>
          </div>
          <div class="aitem">
            <div class="aitem-priority pri-high"></div>
            <div class="aitem-content">
              <div class="aitem-title">Contract Expiry Warning</div>
              <div class="aitem-desc">TechSoft Inc — Expires in 15 days</div>
              <div class="aitem-foot">
                <span class="pri-tag pt-high">High</span>
                <span class="days-tag">15 days left</span>
              </div>
            </div>
            <div class="aitem-cta"><button class="cta-btn ghost">View</button></div>
          </div>
          <div class="aitem">
            <div class="aitem-priority pri-med"></div>
            <div class="aitem-content">
              <div class="aitem-title">New User Request</div>
              <div class="aitem-desc">John Doe (Sales) requested access</div>
              <div class="aitem-foot">
                <span class="pri-tag pt-med">Med</span>
                <span class="days-tag">5 days left</span>
              </div>
            </div>
            <div class="aitem-cta"><button class="cta-btn">Approve</button></div>
          </div>
          <div class="aitem">
            <div class="aitem-priority pri-med"></div>
            <div class="aitem-content">
              <div class="aitem-title">Billing Issue Flagged</div>
              <div class="aitem-desc">Missing PO — INV-0198</div>
              <div class="aitem-foot">
                <span class="pri-tag pt-med">Med</span>
                <span class="days-tag">3 days left</span>
              </div>
            </div>
            <div class="aitem-cta"><button class="cta-btn ghost">Fix</button></div>
          </div>
        </div>
      </div>
    </div>

    <!-- BOTTOM GRID -->
    <div class="bottom-grid">

      <!-- Pipeline -->
      <div class="panel">
        <div class="panel-head">
          <div>
            <div class="panel-title">Pipeline · Top 5</div>
            <div class="panel-subtitle">By deal value</div>
          </div>
          <button class="panel-action">View CRM →</button>
        </div>
        <table class="tbl">
          <thead>
            <tr>
              <th>Account</th>
              <th>Stage</th>
              <th>Value</th>
              <th>Close</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>GlobalTech</strong></td>
              <td><span class="stage-lbl sl-neg">Negotiation</span></td>
              <td><span class="val-big vb-ind">$340K</span></td>
              <td style="color:var(--muted);font-size:12px">Mar 28</td>
            </tr>
            <tr>
              <td><strong>Orion Ltd</strong></td>
              <td><span class="stage-lbl sl-prop">Proposal</span></td>
              <td><span class="val-big vb-blue">$210K</span></td>
              <td style="color:var(--muted);font-size:12px">Apr 5</td>
            </tr>
            <tr>
              <td><strong>BlueWave Inc</strong></td>
              <td><span class="stage-lbl sl-won">Closed Won</span></td>
              <td><span class="val-big vb-grn">$175K</span></td>
              <td style="color:var(--muted);font-size:12px">Feb 18</td>
            </tr>
            <tr>
              <td><strong>Acme Corp</strong></td>
              <td><span class="stage-lbl sl-prop">Proposal</span></td>
              <td><span class="val-big vb-blue">$125K</span></td>
              <td style="color:var(--muted);font-size:12px">Mar 15</td>
            </tr>
            <tr>
              <td><strong>Nexus Systems</strong></td>
              <td><span class="stage-lbl sl-disc">Discovery</span></td>
              <td><span class="val-big vb-amb">$88K</span></td>
              <td style="color:var(--muted);font-size:12px">Apr 10</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Renewals -->
      <div class="panel">
        <div class="panel-head">
          <div>
            <div class="panel-title">Contract Renewals</div>
            <div class="panel-subtitle">Expiring in 30 days</div>
          </div>
          <button class="panel-action">Manage →</button>
        </div>
        <table class="tbl">
          <thead>
            <tr>
              <th>Contract</th>
              <th>Client</th>
              <th>Expiry</th>
              <th>Left</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="color:var(--muted);font-size:12px">#CLM-0042</td>
              <td><strong>TechSoft Inc</strong></td>
              <td style="color:var(--muted);font-size:12px">Mar 7</td>
              <td><span class="exp-lbl el-red">15D</span></td>
            </tr>
            <tr>
              <td style="color:var(--muted);font-size:12px">#CLM-0038</td>
              <td><strong>Vertex Corp</strong></td>
              <td style="color:var(--muted);font-size:12px">Mar 12</td>
              <td><span class="exp-lbl el-amb">20D</span></td>
            </tr>
            <tr>
              <td style="color:var(--muted);font-size:12px">#CLM-0031</td>
              <td><strong>Acme Corp</strong></td>
              <td style="color:var(--muted);font-size:12px">Mar 18</td>
              <td><span class="exp-lbl el-amb">26D</span></td>
            </tr>
            <tr>
              <td style="color:var(--muted);font-size:12px">#CLM-0029</td>
              <td><strong>SkyNet LLC</strong></td>
              <td style="color:var(--muted);font-size:12px">Mar 22</td>
              <td><span class="exp-lbl el-grn">30D</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div><!-- /content -->
</main>

<script>
// Chart
const data = [
  { m: 'SEP', v: 142, now: false },
  { m: 'OCT', v: 198, now: false },
  { m: 'NOV', v: 175, now: false },
  { m: 'DEC', v: 220, now: false },
  { m: 'JAN', v: 210, now: false },
  { m: 'FEB', v: 248, now: true },
];
const max = Math.max(...data.map(d => d.v));
const area = document.getElementById('chartArea');
const months = document.getElementById('chartMonths');

data.forEach(d => {
  const pct = (d.v / max) * 100;
  const g = document.createElement('div');
  g.className = 'bar-g';
  g.innerHTML = `
    <div class="bar-t">
      <div class="b-fill ${d.now ? 'is-now' : 'is-past'}" style="height:${pct}%;min-height:6px;">
        <div class="b-val">$${d.v}K</div>
      </div>
    </div>
  `;
  area.appendChild(g);

  const lbl = document.createElement('div');
  lbl.style.cssText = `flex:1;text-align:center`;
  lbl.innerHTML = `<span class="b-month ${d.now ? 'now' : ''}">${d.m}</span>`;
  months.appendChild(lbl);
});

function segClick(el) {
  el.closest('.toggle-seg').querySelectorAll('.seg-btn').forEach(b => b.classList.remove('on'));
  el.classList.add('on');
}
function asegClick(el) {
  el.closest('.action-seg').querySelectorAll('.aseg').forEach(b => b.classList.remove('on'));
  el.classList.add('on');
}
</script>
</body>
</html>
