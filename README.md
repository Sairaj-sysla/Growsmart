<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Enterprise Playwright Framework</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Sora:wght@300;400;600;700&display=swap');

  :root {
    --bg: #0d0f14;
    --surface: #141720;
    --surface2: #1c2030;
    --border: #252a3a;
    --accent: #4f8ef7;
    --accent2: #7c3aed;
    --green: #22c55e;
    --amber: #f59e0b;
    --red: #ef4444;
    --text: #e2e8f0;
    --muted: #64748b;
    --mono: 'JetBrains Mono', monospace;
    --sans: 'Sora', sans-serif;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: var(--sans);
    background: var(--bg);
    color: var(--text);
    line-height: 1.7;
    font-size: 15px;
  }

  /* ── HERO ── */
  .hero {
    padding: 60px 48px 48px;
    border-bottom: 1px solid var(--border);
    background: linear-gradient(135deg, #0d0f14 0%, #141a2e 100%);
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    top: -80px; right: -80px;
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(79,142,247,0.08) 0%, transparent 70%);
    pointer-events: none;
  }
  .badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(79,142,247,0.12);
    border: 1px solid rgba(79,142,247,0.25);
    color: var(--accent);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-family: var(--mono);
    font-weight: 600;
    letter-spacing: 0.05em;
    margin-bottom: 20px;
  }
  .badge::before { content: '●'; font-size: 8px; }
  h1 {
    font-size: 42px;
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 12px;
    background: linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hero p {
    color: var(--muted);
    font-size: 16px;
    max-width: 600px;
    font-weight: 300;
  }
  .tech-pills {
    display: flex; flex-wrap: wrap; gap: 8px;
    margin-top: 24px;
  }
  .pill {
    background: var(--surface2);
    border: 1px solid var(--border);
    color: var(--muted);
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-family: var(--mono);
  }

  /* ── LAYOUT ── */
  .container { max-width: 1100px; margin: 0 auto; }
  .layout {
    display: grid;
    grid-template-columns: 220px 1fr;
    min-height: calc(100vh - 220px);
  }

  /* ── SIDEBAR ── */
  .sidebar {
    border-right: 1px solid var(--border);
    padding: 32px 0;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
  }
  .nav-section {
    padding: 0 20px;
    margin-bottom: 8px;
    font-size: 10px;
    font-family: var(--mono);
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--muted);
    text-transform: uppercase;
  }
  .nav-item {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 20px;
    color: var(--muted);
    text-decoration: none;
    font-size: 13px;
    transition: all 0.15s;
    cursor: pointer;
    border-left: 2px solid transparent;
  }
  .nav-item:hover { color: var(--text); background: var(--surface); }
  .nav-item.active { color: var(--accent); border-left-color: var(--accent); background: rgba(79,142,247,0.06); }
  .nav-icon { font-size: 14px; width: 16px; text-align: center; }

  /* ── CONTENT ── */
  .content { padding: 40px 48px; }

  .section { display: none; }
  .section.active { display: block; }

  h2 {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 24px;
    color: var(--text);
    display: flex; align-items: center; gap: 10px;
  }
  h2::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }
  h3 {
    font-size: 14px;
    font-weight: 600;
    color: var(--accent);
    margin: 24px 0 12px;
    font-family: var(--mono);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  /* ── FLOW DIAGRAM ── */
  .flow {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin: 20px 0;
  }
  .flow-item {
    display: flex; align-items: flex-start; gap: 16px;
    padding: 16px 20px;
    background: var(--surface);
    border: 1px solid var(--border);
    position: relative;
  }
  .flow-item:first-child { border-radius: 8px 8px 0 0; }
  .flow-item:last-child  { border-radius: 0 0 8px 8px; }
  .flow-item + .flow-item { border-top: none; }
  .flow-arrow {
    position: absolute;
    left: 32px;
    bottom: -10px;
    z-index: 1;
    color: var(--accent);
    font-size: 14px;
  }
  .flow-num {
    width: 28px; height: 28px;
    border-radius: 50%;
    background: rgba(79,142,247,0.15);
    border: 1px solid rgba(79,142,247,0.3);
    color: var(--accent);
    font-family: var(--mono);
    font-size: 12px;
    font-weight: 600;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .flow-label { font-weight: 600; font-size: 14px; color: var(--text); }
  .flow-desc  { font-size: 12px; color: var(--muted); margin-top: 2px; }

  /* ── CARDS ── */
  .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; margin: 20px 0; }
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 20px;
    transition: border-color 0.2s;
  }
  .card:hover { border-color: rgba(79,142,247,0.4); }
  .card-icon { font-size: 22px; margin-bottom: 10px; }
  .card-title { font-weight: 600; font-size: 14px; margin-bottom: 6px; }
  .card-desc  { font-size: 12px; color: var(--muted); line-height: 1.6; }

  /* ── TABLE ── */
  .table-wrap { overflow-x: auto; margin: 16px 0; border-radius: 8px; border: 1px solid var(--border); }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th {
    background: var(--surface2);
    padding: 10px 16px;
    text-align: left;
    font-family: var(--mono);
    font-size: 11px;
    font-weight: 600;
    color: var(--muted);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border-bottom: 1px solid var(--border);
  }
  td { padding: 10px 16px; border-bottom: 1px solid var(--border); vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(255,255,255,0.02); }
  .mono { font-family: var(--mono); font-size: 12px; color: var(--accent); }
  .muted { color: var(--muted); font-size: 12px; }

  /* ── CODE ── */
  .code-block {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 16px 20px;
    font-family: var(--mono);
    font-size: 13px;
    color: #a5d6ff;
    overflow-x: auto;
    margin: 12px 0;
    line-height: 1.8;
  }
  .code-block .comment { color: var(--muted); }
  .code-block .cmd { color: var(--green); }
  .code-block .flag { color: var(--amber); }
  .code-block .string { color: #fca5a5; }

  /* ── COMMAND GRID ── */
  .cmd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }
  .cmd-item {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 14px 16px;
    display: flex; flex-direction: column; gap: 6px;
  }
  .cmd-name { font-family: var(--mono); font-size: 12px; color: var(--green); }
  .cmd-desc { font-size: 12px; color: var(--muted); }

  /* ── STATUS BADGES ── */
  .status {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px; border-radius: 4px;
    font-size: 11px; font-family: var(--mono); font-weight: 600;
  }
  .status.pass { background: rgba(34,197,94,0.12); color: var(--green); }
  .status.warn { background: rgba(245,158,11,0.12); color: var(--amber); }
  .status.fail { background: rgba(239,68,68,0.12); color: var(--red); }
  .status.info { background: rgba(79,142,247,0.12); color: var(--accent); }

  /* ── HEAL CHAIN ── */
  .heal-chain {
    display: flex; flex-direction: column; gap: 4px;
    margin: 16px 0;
    padding: 20px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
  }
  .heal-step {
    display: flex; align-items: center; gap: 12px;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 13px;
  }
  .heal-step.active { background: rgba(79,142,247,0.08); border: 1px solid rgba(79,142,247,0.2); }
  .heal-step.found  { background: rgba(34,197,94,0.08);  border: 1px solid rgba(34,197,94,0.2); }
  .heal-step.fail   { background: rgba(239,68,68,0.06);  border: 1px solid rgba(239,68,68,0.15); }
  .heal-arrow { color: var(--muted); font-size: 11px; margin: 0 0 0 24px; }

  /* ── ALERT ── */
  .alert {
    padding: 12px 16px;
    border-radius: 8px;
    margin: 12px 0;
    font-size: 13px;
    display: flex; gap: 10px; align-items: flex-start;
  }
  .alert.tip  { background: rgba(79,142,247,0.08); border-left: 3px solid var(--accent); }
  .alert.warn { background: rgba(245,158,11,0.08);  border-left: 3px solid var(--amber); }
  .alert.note { background: rgba(34,197,94,0.08);   border-left: 3px solid var(--green); }

  /* ── STRUCTURE TREE ── */
  .tree {
    font-family: var(--mono);
    font-size: 12px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 20px;
    line-height: 2;
  }
  .tree .dir  { color: var(--accent); font-weight: 600; }
  .tree .file { color: var(--text); }
  .tree .desc { color: var(--muted); }

  /* ── SCORE BAR ── */
  .score-row { display: flex; align-items: center; gap: 12px; margin: 6px 0; font-size: 13px; }
  .score-label { width: 120px; color: var(--muted); font-family: var(--mono); font-size: 12px; }
  .score-bar-wrap { flex: 1; background: var(--surface2); border-radius: 4px; height: 6px; }
  .score-bar { height: 6px; border-radius: 4px; background: var(--accent); }
  .score-val { width: 40px; text-align: right; font-family: var(--mono); font-size: 12px; color: var(--accent); }

  /* ── ENV TABLE ── */
  .env-row { display: flex; align-items: center; gap: 0; margin: 4px 0; }
  .env-key {
    font-family: var(--mono); font-size: 12px; color: var(--amber);
    background: rgba(245,158,11,0.08);
    padding: 4px 12px; border-radius: 4px 0 0 4px;
    border: 1px solid rgba(245,158,11,0.2);
    min-width: 220px;
  }
  .env-val {
    font-family: var(--mono); font-size: 12px; color: var(--muted);
    background: var(--surface);
    padding: 4px 12px; border-radius: 0 4px 4px 0;
    border: 1px solid var(--border); border-left: none;
    flex: 1;
  }
</style>
</head>
<body>

<div class="hero">
  <div class="badge">v2.0.0 Enterprise</div>
  <h1>Playwright Automation Framework</h1>
  <p>TypeScript · Page Object Model · Auto-Heal · CI/CD · Allure · Excel Output</p>
  <div class="tech-pills">
    <span class="pill">Playwright 1.56</span>
    <span class="pill">TypeScript 5.4</span>
    <span class="pill">Node.js</span>
    <span class="pill">Zod Validation</span>
    <span class="pill">ExcelJS</span>
    <span class="pill">Allure</span>
    <span class="pill">Jenkins</span>
    <span class="pill">Auto-Heal Engine</span>
  </div>
</div>

<div class="container">
<div class="layout">

<!-- ── SIDEBAR ── -->
<nav class="sidebar">
  <div style="padding: 0 20px 16px; margin-bottom: 8px;">
    <div class="nav-section">Navigation</div>
  </div>
  <a class="nav-item active" onclick="show('overview')"><span class="nav-icon">⬡</span> Overview</a>
  <a class="nav-item" onclick="show('structure')"><span class="nav-icon">⊞</span> Structure</a>
  <a class="nav-item" onclick="show('tests')"><span class="nav-icon">✓</span> Test Cases</a>
  <a class="nav-item" onclick="show('commands')"><span class="nav-icon">▶</span> Commands</a>
  <a class="nav-item" onclick="show('config')"><span class="nav-icon">⚙</span> Config</a>
  <a class="nav-item" onclick="show('autoheal')"><span class="nav-icon">⟳</span> Auto-Heal</a>
  <a class="nav-item" onclick="show('reports')"><span class="nav-icon">◫</span> Reports</a>
  <a class="nav-item" onclick="show('troubleshoot')"><span class="nav-icon">⚡</span> Troubleshoot</a>
</nav>

<!-- ── CONTENT ── -->
<main class="content">

<!-- OVERVIEW -->
<div id="overview" class="section active">
  <h2>Overview</h2>

  <div class="cards">
    <div class="card">
      <div class="card-icon">🏨</div>
      <div class="card-title">Hotel Search UI</div>
      <div class="card-desc">EasyMyTrip hotel search, date/room selection, sort by price, export to Excel</div>
    </div>
    <div class="card">
      <div class="card-icon">✈️</div>
      <div class="card-title">Flight + Hotel UI</div>
      <div class="card-desc">Round-trip flight booking, hotel selection, passenger/class config, Excel output</div>
    </div>
    <div class="card">
      <div class="card-icon">🔌</div>
      <div class="card-title">REST API Tests</div>
      <div class="card-desc">GET, POST, PATCH, DELETE validation against restful-api.dev endpoints</div>
    </div>
    <div class="card">
      <div class="card-icon">🩹</div>
      <div class="card-title">Auto-Heal Engine</div>
      <div class="card-desc">Runtime DOM recovery — heals broken locators automatically without fingerprints</div>
    </div>
  </div>

  <h3>UI Test Flow</h3>
  <div class="flow">
    <div class="flow-item">
      <div class="flow-num">1</div>
      <div><div class="flow-label">src/tests/*.spec.ts</div><div class="flow-desc">Test entry point — defines test cases and orchestrates steps</div></div>
      <span class="flow-arrow">↓</span>
    </div>
    <div class="flow-item">
      <div class="flow-num">2</div>
      <div><div class="flow-label">src/pages/*.ts</div><div class="flow-desc">Page objects — locators and page-specific actions</div></div>
      <span class="flow-arrow">↓</span>
    </div>
    <div class="flow-item">
      <div class="flow-num">3</div>
      <div><div class="flow-label">src/pages/basePage.ts</div><div class="flow-desc">Shared foundation — logging, waits, retries, auto-heal, error handling</div></div>
      <span class="flow-arrow">↓</span>
    </div>
    <div class="flow-item">
      <div class="flow-num">4</div>
      <div><div class="flow-label">src/utils/elementUtils.ts</div><div class="flow-desc">Low-level element actions — click, fill, type with retry + auto-heal</div></div>
      <span class="flow-arrow">↓</span>
    </div>
    <div class="flow-item">
      <div class="flow-num">5</div>
      <div><div class="flow-label">Browser (Chromium)</div><div class="flow-desc">Playwright executes actions in real browser</div></div>
    </div>
  </div>

  <h3>API Test Flow</h3>
  <div class="flow">
    <div class="flow-item">
      <div class="flow-num">1</div>
      <div><div class="flow-label">src/tests/users.api.spec.ts</div><div class="flow-desc">API test spec</div></div>
      <span class="flow-arrow">↓</span>
    </div>
    <div class="flow-item">
      <div class="flow-num">2</div>
      <div><div class="flow-label">src/setup/api.setup.ts</div><div class="flow-desc">Creates Playwright APIRequestContext</div></div>
      <span class="flow-arrow">↓</span>
    </div>
    <div class="flow-item">
      <div class="flow-num">3</div>
      <div><div class="flow-label">src/clients/apiClient.ts</div><div class="flow-desc">GET / POST / PATCH / DELETE with retry, logging, token injection</div></div>
      <span class="flow-arrow">↓</span>
    </div>
    <div class="flow-item">
      <div class="flow-num">4</div>
      <div><div class="flow-label">API Server</div><div class="flow-desc">restful-api.dev endpoints</div></div>
    </div>
  </div>
</div>

<!-- STRUCTURE -->
<div id="structure" class="section">
  <h2>Project Structure</h2>
  <div class="tree">
<span class="dir">src/</span><br>
&nbsp;&nbsp;<span class="dir">tests/</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="desc">← spec files go here</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;<span class="file">easyMyTrip.spec.ts</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="desc">Hotel search UI test</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;<span class="file">esaymytripfight.spec.ts</span>&nbsp;&nbsp;<span class="desc">Flight+Hotel UI test</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;<span class="file">users.api.spec.ts</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="desc">REST API tests</span><br>
&nbsp;&nbsp;<span class="dir">pages/</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;<span class="file">basePage.ts</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="desc">Foundation — all page objects extend this</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;<span class="file">easyMyTrip.ts</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="desc">Hotel flow page object</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;<span class="file">easyMyTripForFlight.ts</span>&nbsp;&nbsp;<span class="desc">Flight+Hotel page object</span><br>
&nbsp;&nbsp;<span class="dir">utils/</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;<span class="file">autoHeal.ts</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="desc">Runtime DOM recovery engine</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;<span class="file">elementUtils.ts</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="desc">click / fill / type with retry</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;<span class="file">waitUtils.ts</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="desc">Visibility / load state waits</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;<span class="file">retryUtils.ts</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="desc">Exponential backoff retry</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;<span class="file">errorHandler.ts</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="desc">Centralized error logging</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;<span class="file">logger.ts</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="desc">DEBUG/INFO/PASS/WARN/ERROR/STEP</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;<span class="file">fileUtils.ts</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="desc">Excel / CSV / JSON writer</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;<span class="file">runtimeStore.ts</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="desc">In-memory key-value store</span><br>
&nbsp;&nbsp;<span class="dir">config/</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;<span class="file">env.index.ts</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="desc">UI config manager (dev/qa)</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;<span class="file">env.dev.ts / env.qa.ts</span>&nbsp;&nbsp;<span class="desc">Environment-specific config</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;<span class="file">globalTimeout.ts</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="desc">Shared timeout constants</span><br>
&nbsp;&nbsp;<span class="dir">clients/</span><br>
&nbsp;&nbsp;&nbsp;&nbsp;<span class="file">apiClient.ts</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="desc">HTTP client — GET/POST/PATCH/DELETE</span><br>
<span class="dir">test-data/</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="desc">JSON payloads and UI data</span><br>
<span class="file">playwright.config.ts</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="desc">Timeouts, reporters, browser, CI flags</span><br>
<span class="file">tsconfig.json</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="desc">Path aliases: @pages, @utils, @tests</span><br>
<span class="file">Jenkinsfile</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="desc">CI pipeline — install, test, report, email</span>
  </div>
</div>

<!-- TESTS -->
<div id="tests" class="section">
  <h2>Test Cases</h2>

  <h3>UI Tests</h3>
  <div class="table-wrap">
    <table>
      <tr><th>Test</th><th>File</th><th>What it does</th></tr>
      <tr>
        <td><span class="mono">EasyMyTrip Hotel Booking Test</span></td>
        <td><span class="muted">easyMyTrip.spec.ts</span></td>
        <td>Opens EasyMyTrip → Hotels tab → search Kolar → set dates → 2 rooms 6 guests → validate → sort by price high to low → export Excel</td>
      </tr>
      <tr>
        <td><span class="mono">EasyMyTrip fight Booking Test</span></td>
        <td><span class="muted">esaymytripfight.spec.ts</span></td>
        <td>Flight + Hotel → Chennai to Bengaluru → round trip → set passengers/business class → capture hotel + flight data → export Excel</td>
      </tr>
    </table>
  </div>

  <h3>API Tests</h3>
  <div class="table-wrap">
    <table>
      <tr><th>Test</th><th>Method</th><th>What it validates</th></tr>
      <tr>
        <td><span class="mono">TC01: Fetch Resource List</span></td>
        <td><span class="status info">GET</span></td>
        <td>GET /objects → HTTP 200 → response is array → print products</td>
      </tr>
      <tr>
        <td><span class="mono">TC02: Update product using PATCH</span></td>
        <td><span class="status info">POST+PATCH</span></td>
        <td>POST /objects → create temp → PATCH /objects/{id} → HTTP 200</td>
      </tr>
      <tr>
        <td><span class="mono">delete the porduct</span></td>
        <td><span class="status fail">DELETE</span></td>
        <td>POST /objects → create temp → DELETE /objects/{id} → HTTP 200</td>
      </tr>
    </table>
  </div>

  <div class="alert tip">
    <span>ℹ</span>
    <div>Run a single test: <code style="font-family:var(--mono);color:var(--green)">npx playwright test -g "EasyMyTrip Hotel Booking Test" --headed</code></div>
  </div>
</div>

<!-- COMMANDS -->
<div id="commands" class="section">
  <h2>Commands</h2>

  <h3>Setup</h3>
  <div class="code-block">
<span class="comment"># Install dependencies</span>
<span class="cmd">npm install</span>

<span class="comment"># Install Playwright browsers</span>
<span class="cmd">npm run pw:install</span>
  </div>

  <h3>Run Tests</h3>
  <div class="cmd-grid">
    <div class="cmd-item">
      <div class="cmd-name">npm test</div>
      <div class="cmd-desc">Run all tests</div>
    </div>
    <div class="cmd-item">
      <div class="cmd-name">npm run test:qa</div>
      <div class="cmd-desc">All tests — QA environment</div>
    </div>
    <div class="cmd-item">
      <div class="cmd-name">npm run test:dev</div>
      <div class="cmd-desc">All tests — DEV environment</div>
    </div>
    <div class="cmd-item">
      <div class="cmd-name">npm run test:qa:headed</div>
      <div class="cmd-desc">QA with visible browser</div>
    </div>
    <div class="cmd-item">
      <div class="cmd-name">npm run test:qa:ui</div>
      <div class="cmd-desc">Playwright UI mode</div>
    </div>
    <div class="cmd-item">
      <div class="cmd-name">npm run test:qa:debug</div>
      <div class="cmd-desc">Step-by-step debugger</div>
    </div>
    <div class="cmd-item">
      <div class="cmd-name">npm run test:ci</div>
      <div class="cmd-desc">CI mode (headless, 2 workers)</div>
    </div>
    <div class="cmd-item">
      <div class="cmd-name">npm run test:parallel</div>
      <div class="cmd-desc">4 workers in parallel</div>
    </div>
  </div>

  <h3>Run Specific Test</h3>
  <div class="code-block">
<span class="comment"># By file</span>
<span class="cmd">npx playwright test</span> <span class="string">src/tests/easyMyTrip.spec.ts</span>

<span class="comment"># By test name</span>
<span class="cmd">npx playwright test</span> <span class="flag">-g</span> <span class="string">"EasyMyTrip Hotel Booking Test"</span>

<span class="comment"># Headed + specific file</span>
<span class="cmd">npx playwright test</span> <span class="string">src/tests/easyMyTrip.spec.ts</span> <span class="flag">--headed</span>

<span class="comment"># Debug mode</span>
<span class="cmd">npx playwright test</span> <span class="string">src/tests/easyMyTrip.spec.ts</span> <span class="flag">--debug</span>
  </div>

  <h3>Reports</h3>
  <div class="code-block">
<span class="cmd">npm run report:show</span>    <span class="comment"># Open HTML report</span>
<span class="cmd">npm run report:allure</span>  <span class="comment"># Serve Allure report</span>
<span class="cmd">npx playwright show-trace</span> <span class="string">test-results/path/trace.zip</span>
  </div>

  <h3>Windows — Set Environment</h3>
  <div class="code-block">
<span class="comment"># CMD</span>
<span class="cmd">set ENVIRONMENT=dev</span> && <span class="cmd">npx playwright test</span>

<span class="comment"># PowerShell</span>
<span class="cmd">$env:ENVIRONMENT="dev"</span>; <span class="cmd">npm test</span>

<span class="comment"># cross-env (works everywhere)</span>
<span class="cmd">cross-env ENVIRONMENT=dev npx playwright test</span>
  </div>
</div>

<!-- CONFIG -->
<div id="config" class="section">
  <h2>Configuration</h2>

  <h3>UI Environment Variables</h3>
  <div style="display:flex;flex-direction:column;gap:6px;margin:12px 0;">
    <div class="env-row"><span class="env-key">ENVIRONMENT</span><span class="env-val">qa (default) or dev</span></div>
    <div class="env-row"><span class="env-key">BASE_URL</span><span class="env-val">https://www.easemytrip.com/</span></div>
    <div class="env-row"><span class="env-key">PLAYWRIGHT_USERNAME</span><span class="env-val">your login username</span></div>
    <div class="env-row"><span class="env-key">PLAYWRIGHT_PASSWORD</span><span class="env-val">your login password</span></div>
    <div class="env-row"><span class="env-key">TIMEOUT_ACTION</span><span class="env-val">60000 (ms)</span></div>
    <div class="env-row"><span class="env-key">TIMEOUT_WAIT</span><span class="env-val">60000 (ms)</span></div>
    <div class="env-row"><span class="env-key">TIMEOUT_NAVIGATION</span><span class="env-val">45000 (ms)</span></div>
    <div class="env-row"><span class="env-key">LOG_LEVEL</span><span class="env-val">DEBUG / INFO / WARN / ERROR</span></div>
  </div>

  <h3>API Environment Variables</h3>
  <div style="display:flex;flex-direction:column;gap:6px;margin:12px 0;">
    <div class="env-row"><span class="env-key">API_BASE_URL</span><span class="env-val">https://api.restful-api.dev</span></div>
    <div class="env-row"><span class="env-key">API_TIMEOUT</span><span class="env-val">30000 (ms)</span></div>
    <div class="env-row"><span class="env-key">RETRY_ATTEMPTS</span><span class="env-val">1</span></div>
    <div class="env-row"><span class="env-key">ENV</span><span class="env-val">local</span></div>
  </div>

  <h3>Playwright Config Summary</h3>
  <div class="table-wrap">
    <table>
      <tr><th>Setting</th><th>Local</th><th>CI</th></tr>
      <tr><td>Workers</td><td>4</td><td>2</td></tr>
      <tr><td>Retries</td><td>0</td><td>1</td></tr>
      <tr><td>Headless</td><td>false</td><td>true</td></tr>
      <tr><td>Max failures</td><td>—</td><td>20</td></tr>
      <tr><td>Test timeout</td><td colspan="2">900,000 ms (15 min)</td></tr>
      <tr><td>Expect timeout</td><td colspan="2">25,000 ms</td></tr>
      <tr><td>Screenshot</td><td colspan="2">Only on failure</td></tr>
      <tr><td>Video</td><td colspan="2">Retain on failure</td></tr>
      <tr><td>Trace</td><td colspan="2">Retain on failure</td></tr>
      <tr><td>Locale</td><td colspan="2">en-US</td></tr>
      <tr><td>Timezone</td><td colspan="2">Asia/Kolkata</td></tr>
    </table>
  </div>

  <h3>Path Aliases (tsconfig.json)</h3>
  <div class="code-block">
<span class="comment">// Use these in imports instead of relative paths</span>
<span class="cmd">@pages/*</span>    <span class="comment">→ src/pages/*</span>
<span class="cmd">@utils/*</span>    <span class="comment">→ src/utils/*</span>
<span class="cmd">@fixtures/*</span> <span class="comment">→ src/fixtures/*</span>
<span class="cmd">@tests/*</span>    <span class="comment">→ src/tests/*</span>

<span class="comment">// Example</span>
import { FileUtils } from <span class="string">"@utils/fileUtils"</span>;
  </div>
</div>

<!-- AUTO-HEAL -->
<div id="autoheal" class="section">
  <h2>Auto-Heal Engine</h2>

  <div class="alert note">
    <span>✓</span>
    <div>Stateless — no cache, no file I/O. Works purely from the failed locator's selector string + live DOM scan.</div>
  </div>

  <h3>Healing Strategy Chain</h3>
  <div class="heal-chain">
    <div class="heal-step active"><span class="status info">1</span> <strong>Primary locator</strong> — try original first (timeout 3s)</div>
    <div class="heal-arrow">↓ if not visible</div>
    <div class="heal-step"><span class="status warn">2</span> <strong>getByRole</strong> — semantic ARIA role + accessible name</div>
    <div class="heal-arrow">↓</div>
    <div class="heal-step"><span class="status warn">3</span> <strong>getByLabel</strong> — aria-label attribute</div>
    <div class="heal-arrow">↓</div>
    <div class="heal-step"><span class="status warn">4</span> <strong>getByPlaceholder</strong> — input placeholder text</div>
    <div class="heal-arrow">↓</div>
    <div class="heal-step"><span class="status warn">5</span> <strong>CSS selectors</strong> — #id, [data-testid], [name], [aria-label]</div>
    <div class="heal-arrow">↓</div>
    <div class="heal-step"><span class="status warn">6</span> <strong>XPath selectors</strong> — exact + contains() for partial changes</div>
    <div class="heal-arrow">↓</div>
    <div class="heal-step found"><span class="status pass">7</span> <strong>DOM similarity scoring</strong> — Levenshtein on live element attributes</div>
    <div class="heal-arrow">↓ if all fail</div>
    <div class="heal-step fail"><span class="status fail">✗</span> Return primary — test fails with clear error message</div>
  </div>

  <h3>Similarity Scoring Weights</h3>
  <div style="padding:16px 20px;background:var(--surface);border:1px solid var(--border);border-radius:8px;margin:12px 0;">
    <div class="score-row"><span class="score-label">data-testid</span><div class="score-bar-wrap"><div class="score-bar" style="width:100%"></div></div><span class="score-val">100</span></div>
    <div class="score-row"><span class="score-label">id</span><div class="score-bar-wrap"><div class="score-bar" style="width:90%"></div></div><span class="score-val">90</span></div>
    <div class="score-row"><span class="score-label">aria-label</span><div class="score-bar-wrap"><div class="score-bar" style="width:85%"></div></div><span class="score-val">85</span></div>
    <div class="score-row"><span class="score-label">name</span><div class="score-bar-wrap"><div class="score-bar" style="width:80%"></div></div><span class="score-val">80</span></div>
    <div class="score-row"><span class="score-label">role</span><div class="score-bar-wrap"><div class="score-bar" style="width:75%"></div></div><span class="score-val">75</span></div>
    <div class="score-row"><span class="score-label">placeholder</span><div class="score-bar-wrap"><div class="score-bar" style="width:70%"></div></div><span class="score-val">70</span></div>
    <div class="score-row"><span class="score-label">visible text</span><div class="score-bar-wrap"><div class="score-bar" style="width:65%"></div></div><span class="score-val">65</span></div>
    <div class="score-row"><span class="score-label">css class</span><div class="score-bar-wrap"><div class="score-bar" style="width:20%;background:var(--muted)"></div></div><span class="score-val" style="color:var(--muted)">20</span></div>
  </div>

  <h3>Example Log Output</h3>
  <div class="code-block">
<span class="comment">[WARN]  Primary not visible — 4 candidates built</span>
<span class="comment">        locator('//input[@id=\'txtCityvgfgf\']')</span>
[DEBUG] [css]   no match → #txtCityvgfgf
[DEBUG] [xpath] no match → xpath=//input[@id='txtCityvgfgf']
[DEBUG] [xpath] no match → xpath=//input[contains(@id,"txtCityvgfgf")]
<span class="cmd">[PASS]  Healed on attempt 4/4 via [dom]</span>
<span class="cmd">        → #txtCity (score=0.88 attrs={"id":"txtCity"})</span>
<span class="flag">[WARN]  💡 UPDATE YOUR POM: replace broken locator with → #txtCity</span>
  </div>

  <div class="alert warn">
    <span>⚠</span>
    <div>When you see <strong>💡 UPDATE YOUR POM</strong> in logs — update the locator in your page object. Auto-heal is a safety net, not a permanent fix.</div>
  </div>
</div>

<!-- REPORTS -->
<div id="reports" class="section">
  <h2>Reports &amp; Output</h2>

  <div class="cards">
    <div class="card">
      <div class="card-icon">📊</div>
      <div class="card-title">HTML Report</div>
      <div class="card-desc">playwright-report/ — full test results with screenshots, traces, videos</div>
    </div>
    <div class="card">
      <div class="card-icon">📈</div>
      <div class="card-title">Allure Report</div>
      <div class="card-desc">allure-results/ — rich visual report served via allure serve</div>
    </div>
    <div class="card">
      <div class="card-icon">📋</div>
      <div class="card-title">JUnit XML</div>
      <div class="card-desc">reports/results.xml — Jenkins-compatible test result format</div>
    </div>
    <div class="card">
      <div class="card-icon">📁</div>
      <div class="card-title">Excel Output</div>
      <div class="card-desc">test-results/excel/ — hotel/flight data exported by tests</div>
    </div>
    <div class="card">
      <div class="card-icon">📝</div>
      <div class="card-title">Daily Logs</div>
      <div class="card-desc">logs/api-test-YYYY-MM-DD.log — color-coded DEBUG/INFO/PASS/ERROR</div>
    </div>
    <div class="card">
      <div class="card-icon">🎬</div>
      <div class="card-title">Traces &amp; Videos</div>
      <div class="card-desc">test-results/ — screenshots, videos, traces on failure only</div>
    </div>
  </div>

  <h3>Open Reports</h3>
  <div class="code-block">
<span class="cmd">npm run report:show</span>       <span class="comment"># Playwright HTML report</span>
<span class="cmd">npm run report:allure</span>     <span class="comment"># Allure visual report</span>
<span class="cmd">npx playwright show-trace</span> <span class="string">test-results/path/trace.zip</span>
  </div>
</div>

<!-- TROUBLESHOOT -->
<div id="troubleshoot" class="section">
  <h2>Troubleshoot</h2>

  <h3>Common Issues</h3>
  <div class="table-wrap">
    <table>
      <tr><th>Problem</th><th>Fix</th></tr>
      <tr>
        <td>Browsers missing</td>
        <td><span class="mono">npm run pw:install</span></td>
      </tr>
      <tr>
        <td>Test failing — want to see browser</td>
        <td><span class="mono">npx playwright test src/tests/easyMyTrip.spec.ts --headed</span></td>
      </tr>
      <tr>
        <td>Need step-by-step debugging</td>
        <td><span class="mono">npx playwright test src/tests/easyMyTrip.spec.ts --debug</span></td>
      </tr>
      <tr>
        <td>UI config error</td>
        <td>Check <span class="mono">ENVIRONMENT</span>, <span class="mono">BASE_URL</span>, <span class="mono">TIMEOUT_ACTION</span></td>
      </tr>
      <tr>
        <td>API config error</td>
        <td>Check <span class="mono">API_BASE_URL</span>, <span class="mono">API_TIMEOUT</span>, <span class="mono">RETRY_ATTEMPTS</span></td>
      </tr>
      <tr>
        <td>Auto-heal not working</td>
        <td>Check logs for <span class="mono">[AutoHeal]</span> lines — verify score and strategy used</td>
      </tr>
      <tr>
        <td>Strict mode violation on locator</td>
        <td>Locator matches multiple elements — add <span class="mono">.first()</span> or use more specific selector</td>
      </tr>
      <tr>
        <td>HTML report not opening</td>
        <td><span class="mono">npm run report:show</span></td>
      </tr>
    </table>
  </div>

  <div class="alert tip">
    <span>ℹ</span>
    <div>Known: <code style="font-family:var(--mono)">esaymytripfight.spec.ts</code> has spelling mistake in filename and test name — use current names when running by name.</div>
  </div>

  <div class="alert warn">
    <span>⚠</span>
    <div><code style="font-family:var(--mono)">src/config/config.ts</code> imports dotenv. If install fails with missing dotenv, run <code style="font-family:var(--mono)">npm install dotenv</code>.</div>
  </div>
</div>

</main>
</div>
</div>

<script>
function show(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  event.currentTarget.classList.add('active');
}
</script>
</body>
</html>