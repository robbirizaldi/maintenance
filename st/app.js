const $ = (selector) => document.querySelector(selector);

const ui = {
  phase: $("#phase"),
  gaugePhase: $("#gaugePhase"),
  speedValue: $("#speedValue"),
  speedUnit: $("#speedUnit"),
  gauge: $("#gauge"),
  start: $("#startBtn"),
  startText: $("#startText"),
  connectionText: $("#connectionText"),
  clock: $("#clock"),
  download: $("#downloadValue"),
  upload: $("#uploadValue"),
  ping: $("#pingValue"),
  downloadBar: $("#downloadBar"),
  uploadBar: $("#uploadBar"),
  progress: $("#progress"),
  note: $("#testNote"),
  connectionType: $("#connectionType"),
  connectionMeta: $("#connectionMeta"),
  quality: $("#quality"),
  qualityMeta: $("#qualityMeta"),
  history: $("#historyList"),
};

const CLOUDFLARE = "https://speed.cloudflare.com";
const MAX_GAUGE = 500; // Mbps shown as full gauge. Values above are clamped visually.
let running = false;

function nowClock() {
  ui.clock.textContent = new Date().toLocaleTimeString("en-GB", { hour12: false });
}
setInterval(nowClock, 1000);
nowClock();

function setGauge(value, phase = "") {
  const safe = Number.isFinite(value) ? Math.max(0, value) : 0;
  const visual = Math.min(safe, MAX_GAUGE);
  const deg = Math.round((visual / MAX_GAUGE) * 280);
  ui.gauge.style.setProperty("--progress", `${deg}deg`);
  ui.speedValue.textContent = safe >= 100 ? Math.round(safe) : safe.toFixed(1);
  ui.gaugePhase.textContent = phase;
}

function setPhase(text) {
  ui.phase.textContent = text;
  ui.connectionText.textContent = text;
}

function setProgress(percent) {
  const p = Math.max(0, Math.min(100, percent));
  ui.progress.textContent = `${Math.round(p)}%`;
}

function connectionInfo() {
  const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!c) {
    ui.connectionType.textContent = "Browser API unavailable";
    ui.connectionMeta.textContent = "Connection details will be inferred from the test.";
    return;
  }
  const type = c.effectiveType ? c.effectiveType.toUpperCase() : "UNKNOWN";
  const down = c.downlink ? `${c.downlink} Mbps estimated` : "estimate unavailable";
  const rtt = c.rtt ? `${c.rtt} ms browser estimate` : "RTT unavailable";
  ui.connectionType.textContent = type;
  ui.connectionMeta.textContent = `${down} · ${rtt}`;
}
connectionInfo();

function qualityFor(down, ping) {
  if (down >= 100 && ping <= 30) return ["EXCELLENT", "Fast line / low response time"];
  if (down >= 50 && ping <= 60) return ["GOOD", "Comfortable for streaming and calls"];
  if (down >= 15 && ping <= 100) return ["FAIR", "Fine for normal browsing"];
  return ["LIMITED", "High latency or low throughput detected"];
}

async function measurePing(samples = 4) {
  const values = [];
  for (let i = 0; i < samples; i++) {
    const t0 = performance.now();
    const url = `${CLOUDFLARE}/cdn-cgi/trace?nm=${Date.now()}-${Math.random()}`;
    try {
      await fetch(url, { cache: "no-store", mode: "cors" });
      values.push(performance.now() - t0);
    } catch {
      // If CORS/network blocks the probe, ignore this sample.
    }
    await new Promise(r => setTimeout(r, 100));
  }
  if (!values.length) throw new Error("Ping probe unavailable");
  values.sort((a, b) => a - b);
  return values[Math.floor(values.length / 2)];
}

async function measureDownload(seconds = 6) {
  const started = performance.now();
  let loaded = 0;
  let latest = 0;
  let latestSpeed = 0;

  // Multiple sizes keep the test usable on both mobile and desktop.
  const sizes = [2_000_000, 5_000_000, 10_000_000, 20_000_000];
  let i = 0;

  while ((performance.now() - started) < seconds) {
    const bytes = sizes[Math.min(i++, sizes.length - 1)];
    const response = await fetch(`${CLOUDFLARE}/__down?bytes=${bytes}&cacheBust=${crypto.randomUUID()}`, {
      cache: "no-store",
      mode: "cors"
    });
    if (!response.ok || !response.body) throw new Error("Download stream unavailable");

    const reader = response.body.getReader();
    const t0 = performance.now();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      loaded += value.byteLength;

      const elapsed = (performance.now() - started) / 1000;
      latestSpeed = (loaded * 8 / elapsed) / 1e6;
      const localElapsed = (performance.now() - t0) / 1000;
      const localBytes = value.byteLength;
      const instant = localElapsed > 0 ? (localBytes * 8 / localElapsed) / 1e6 : latestSpeed;

      const display = Math.max(0, Math.min(latestSpeed * 0.8 + instant * 0.2, 9999));
      ui.download.textContent = display >= 100 ? Math.round(display) : display.toFixed(1);
      ui.speedValue.textContent = display >= 100 ? Math.round(display) : display.toFixed(1);
      setGauge(display, "DOWNLOADING");
      ui.downloadBar.style.width = `${Math.min(100, display / MAX_GAUGE * 100)}%`;
      setProgress(Math.min(50, (performance.now() - started) / seconds / 2 * 100));
    }
  }
  return latestSpeed;
}

async function measureUpload(seconds = 5) {
  const started = performance.now();
  let sent = 0;
  let latestSpeed = 0;
  const sizes = [500_000, 1_000_000, 2_000_000];

  while ((performance.now() - started) < seconds) {
    const size = sizes[Math.floor((sent / 1_000_000)) % sizes.length];
    const blob = new Blob([new Uint8Array(size)]);
    const t0 = performance.now();

    const response = await fetch(`${CLOUDFLARE}/__up?cacheBust=${crypto.randomUUID()}`, {
      method: "POST",
      body: blob,
      cache: "no-store",
      mode: "cors"
    });
    if (!response.ok) throw new Error("Upload probe unavailable");

    const elapsed = (performance.now() - t0) / 1000;
    sent += size;
    latestSpeed = (sent * 8 / ((performance.now() - started) / 1000)) / 1e6;

    ui.upload.textContent = latestSpeed >= 100 ? Math.round(latestSpeed) : latestSpeed.toFixed(1);
    ui.speedValue.textContent = latestSpeed >= 100 ? Math.round(latestSpeed) : latestSpeed.toFixed(1);
    setGauge(latestSpeed, "UPLOADING");
    ui.uploadBar.style.width = `${Math.min(100, latestSpeed / MAX_GAUGE * 100)}%`;
    setProgress(50 + Math.min(45, ((performance.now() - started) / seconds) * 45));

    if (elapsed < 0.04) await new Promise(r => setTimeout(r, 40));
  }
  return latestSpeed;
}

function saveHistory(result) {
  const key = "netmeter-history";
  const old = JSON.parse(localStorage.getItem(key) || "[]");
  old.unshift({ ...result, time: Date.now() });
  localStorage.setItem(key, JSON.stringify(old.slice(0, 8)));
  renderHistory();
}

function renderHistory() {
  const rows = JSON.parse(localStorage.getItem("netmeter-history") || "[]");
  if (!rows.length) {
    ui.history.innerHTML = '<div class="empty-history">No readings yet.</div>';
    return;
  }
  ui.history.innerHTML = rows.map(row => {
    const d = new Date(row.time);
    return `
      <div class="history-item">
        <span class="date">${d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" })}</span>
        <span class="down">${row.down.toFixed(1)} Mbps ↓</span>
        <span class="up">${row.up.toFixed(1)} Mbps ↑</span>
        <span class="ping">${Math.round(row.ping)} ms</span>
      </div>`;
  }).join("");
}
renderHistory();

$("#clearHistory").addEventListener("click", () => {
  localStorage.removeItem("netmeter-history");
  renderHistory();
});

async function runTest() {
  if (running) return;
  running = true;
  ui.start.disabled = true;
  ui.startText.textContent = "RUNNING";
  ui.note.textContent = "Sampling latency and throughput from the nearest edge.";
  setProgress(0);

  let ping = 0, down = 0, up = 0;

  try {
    setPhase("PING");
    setGauge(0, "LATENCY");
    try {
      ping = await measurePing();
      ui.ping.textContent = Math.round(ping);
    } catch {
      ping = 0;
      ui.ping.textContent = "N/A";
    }

    setPhase("DOWNLOAD");
    down = await measureDownload();
    ui.download.textContent = down.toFixed(1);
    setProgress(50);

    setPhase("UPLOAD");
    up = await measureUpload();
    ui.upload.textContent = up.toFixed(1);
    setProgress(100);

    const [label, meta] = qualityFor(down, ping || 999);
    ui.quality.textContent = label;
    ui.qualityMeta.textContent = meta;
    ui.note.textContent = "Measurement complete. Results are stored locally on this device.";
    setPhase("COMPLETE");
    setGauge(down, "COMPLETE");

    saveHistory({ down, up, ping });
  } catch (error) {
    console.error(error);
    setPhase("ERROR");
    ui.gaugePhase.textContent = "RETRY";
    ui.note.textContent = "The network probe was blocked or interrupted. Try again.";
  } finally {
    running = false;
    ui.start.disabled = false;
    ui.startText.textContent = "RUN AGAIN";
  }
}

ui.start.addEventListener("click", runTest);
