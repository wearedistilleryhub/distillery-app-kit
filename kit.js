/* distillery app kit v0.1.0 — https://github.com/wearedistilleryhub/distillery-app-kit */
/* distillery motion marks v0.1
   Every mark is built from one rest state: two anchors, the line between them, and a center dot.
   Each app changes one element. Done always returns to the same rest state.
   draw(ctx, W, H, t, e, d, C)
     t  loop time in seconds (idle = 1x, working = 1.6x)
     e  energy 0..1 (idle ~0.35, working ~0.7)
     d  doneness 0..1 (1 = rest state)
     C  colors { mark, gray, ink, ghost, faint, surface, dark } */
const DistilleryMarks = (() => {
  const TAU = Math.PI * 2;
  const lerp = (a, b, k) => a + (b - a) * k;
  const clamp01 = x => Math.min(1, Math.max(0, x));
  const smooth = (a, b, x) => { const k = clamp01((x - a) / (b - a)); return k * k * (3 - 2 * k); };
  const easeIO = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const rand = (i, s) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
  function hexRGB(h) { h = h.trim().replace("#", ""); if (h.length === 3) h = h.split("").map(c => c + c).join(""); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function mix(a, b, k) { const A = hexRGB(a), B = hexRGB(b); return "rgb(" + A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(",") + ")"; }
  function keyframes(vals, dur, t) {
    const n = vals.length - 1, p = (((t % dur) + dur) % dur) / dur * n, i = Math.min(n - 1, Math.floor(p));
    return lerp(vals[i], vals[i + 1], easeIO(p - i));
  }

  // shared geometry: a 200 x 100 box, anchors at x 10 and 190, line and dot at y 50
  function geo(W, H) {
    const S = Math.min(W * 0.8 / 200, H * 0.75 / 100);
    const ox = (W - 200 * S) / 2, oy = (H - 100 * S) / 2;
    return { S, X: x => ox + x * S, Y: y => oy + y * S };
  }
  const lineAlpha = C => C.dark ? 0.35 : 0.55;
  function line(ctx, g, C, alpha) {
    ctx.globalAlpha = alpha == null ? lineAlpha(C) : alpha;
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.1; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(g.X(10), g.Y(50)); ctx.lineTo(g.X(190), g.Y(50)); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  function anchors(ctx, g, C) {
    ctx.fillStyle = C.ink; ctx.globalAlpha = C.dark ? 0.4 : 0.6;
    for (const x of [10, 190]) { ctx.beginPath(); ctx.arc(g.X(x), g.Y(50), 2.5 * g.S * 0.9, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
  function dot(ctx, g, C, x, y, scale = 1, alpha = 1) {
    const r = 4 * g.S * scale;
    ctx.fillStyle = C.mark;
    ctx.globalAlpha = 0.22 * alpha; ctx.beginPath(); ctx.arc(g.X(x), g.Y(y), r + 5, 0, TAU); ctx.fill();
    ctx.globalAlpha = alpha; ctx.beginPath(); ctx.arc(g.X(x), g.Y(y), r, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;
  }

  // ---------- Still (suite core): changes the anchors' role, particles settle onto the line ----------
  function still(ctx, W, H, t, e, d, C) {
    const g = geo(W, H);
    line(ctx, g, C);
    const n = Math.round(lerp(10, 36, clamp01((e - 0.2) / 0.6))) ;
    for (let i = 0; i < 36; i++) {
      if (i >= n) break;
      const period = 4 + rand(i, 1) * 2.5;
      const life = ((t / period) + rand(i, 2)) % 1;
      const sx = 10 + rand(i, 3) * 180, side = rand(i, 4) < 0.5 ? -1 : 1;
      const sy = 50 + side * (22 + rand(i, 5) * 26);
      const tx = Math.min(186, Math.max(14, sx + (rand(i, 6) - 0.5) * 30));
      const k = easeIO(life);
      const x = lerp(sx, tx, k) + Math.sin(life * Math.PI) * 6 * (rand(i, 7) - 0.5);
      const y = lerp(sy, 50, k);
      const a = smooth(0, 0.15, life) * (1 - smooth(0.85, 1, life)) * (1 - d);
      if (a <= 0.01) continue;
      ctx.globalAlpha = a * 0.9;
      ctx.fillStyle = mix(C.gray, C.mark, smooth(0.3, 0.9, life));
      ctx.beginPath(); ctx.arc(g.X(x), g.Y(y), 1.3, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
    anchors(ctx, g, C);
    const pulse = 1 + 0.12 * Math.sin(t * TAU / 3) * (1 - d);
    dot(ctx, g, C, 100, 50, pulse);
  }

  // ---------- Wave (Interview Companion): changes the line ----------
  const WAVES = [
    { cy: [10, 80, 10], dur: 4, w: 1.1, a: [0.55, 0.35] },
    { cy: [80, 20, 80], dur: 5, w: 0.8, a: [0.45, 0.25] },
    { cy: [35, 65, 35], dur: 3.5, w: 0.8, a: [0.5, 0.3] }
  ];
  function wave(ctx, W, H, t, e, d, C) {
    const g = geo(W, H), tt = t * 0.94;
    ctx.lineCap = "round"; ctx.strokeStyle = C.ink;
    for (const wv of WAVES) {
      const cy = lerp(keyframes(wv.cy, wv.dur, tt), 50, d);
      ctx.beginPath(); ctx.moveTo(g.X(10), g.Y(50));
      ctx.quadraticCurveTo(g.X(55), g.Y(cy), g.X(100), g.Y(50));
      ctx.quadraticCurveTo(g.X(145), g.Y(100 - cy), g.X(190), g.Y(50));
      ctx.globalAlpha = lerp(wv.a[C.dark ? 1 : 0], wv === WAVES[0] ? lineAlpha(C) : 0, d);
      ctx.lineWidth = wv.w; ctx.stroke();
    }
    ctx.globalAlpha = 1;
    anchors(ctx, g, C);
    dot(ctx, g, C, 100, 50 + lerp(keyframes([0, -10, 10, 0], 4, tt), 0, d));
  }

  // ---------- Ease (AI Animation Engine): changes the dot ----------
  const EASES = [
    x => easeIO(x),
    x => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x),
    x => { const c1 = 1.70158, c2 = c1 * 1.525; return x < 0.5 ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2 : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2; },
    x => 1 - Math.exp(-7 * x) * Math.cos(10 * x)
  ];
  function ease(ctx, W, H, t, e, d, C) {
    const g = geo(W, H);
    line(ctx, g, C);
    const pass = 2.4, hold = 0.5, cyc = pass + hold;
    const n = Math.floor(t / cyc), local = t - n * cyc;
    const f = EASES[((n % 4) + 4) % 4];
    const a = n % 2 === 0 ? 30 : 170, b = n % 2 === 0 ? 170 : 30;
    const p = Math.min(1, local / pass);
    // onion skin: where the dot was at even time steps, so spacing shows the pace
    const frames = 16, fadeGhost = (1 - smooth(pass, cyc, local)) * (1 - d);
    if (fadeGhost > 0.01) {
      ctx.fillStyle = C.mark;
      for (let i = 0; i <= frames; i++) {
        const q = i / frames; if (q > p) break;
        ctx.globalAlpha = 0.35 * fadeGhost;
        ctx.beginPath(); ctx.arc(g.X(lerp(a, b, f(q))), g.Y(50), 1.6, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    anchors(ctx, g, C);
    dot(ctx, g, C, lerp(lerp(a, b, f(p)), 100, d), 50);
  }

  // ---------- Route (CloudArch Studio): changes the line into a right-angle connector ----------
  const XS = [10, 46, 82, 118, 154, 190];
  const ROUTES = [[50, 26, 26, 70, 50], [50, 72, 38, 38, 50], [50, 50, 22, 72, 50], [50, 30, 66, 50, 50]];
  function route(ctx, W, H, t, e, d, C) {
    const g = geo(W, H);
    const seg = 4.2, morph = 1.1, n = Math.floor(t / seg), local = t - n * seg;
    const m = easeIO(smooth(seg - morph, seg, local));
    const A = ROUTES[((n % 4) + 4) % 4], B = ROUTES[(((n + 1) % 4) + 4) % 4];
    const L = A.map((v, i) => lerp(lerp(v, B[i], m), 50, d));
    const pts = [[XS[0], L[0]]];
    for (let i = 1; i < XS.length - 1; i++) { pts.push([XS[i], L[i - 1]]); pts.push([XS[i], L[i]]); }
    pts.push([XS[XS.length - 1], L[L.length - 1]]);
    ctx.globalAlpha = lineAlpha(C); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.1; ctx.lineJoin = "round";
    ctx.beginPath(); ctx.moveTo(g.X(pts[0][0]), g.Y(pts[0][1])); pts.slice(1).forEach(p => ctx.lineTo(g.X(p[0]), g.Y(p[1]))); ctx.stroke();
    ctx.globalAlpha = 1;
    // nodes sit on the raised or lowered runs
    for (let i = 1; i < L.length - 1; i++) {
      const lift = smooth(4, 16, Math.abs(L[i] - 50));
      if (lift < 0.02) continue;
      const cx = g.X((XS[i] + XS[i + 1]) / 2), cy = g.Y(L[i]), s = 9 * lift;
      ctx.globalAlpha = 1; ctx.fillStyle = C.surface; ctx.strokeStyle = C.mark; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.roundRect(cx - s / 2, cy - s / 2, s, s, 2); ctx.fill(); ctx.stroke();
    }
    anchors(ctx, g, C);
    // the dot travels the route left to right
    const lens = [0]; for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const u = (t / 3) % 1, want = lens[lens.length - 1] * u;
    let k = 0; while (k < pts.length - 2 && lens[k + 1] < want) k++;
    const f = (want - lens[k]) / ((lens[k + 1] - lens[k]) || 1);
    const px = lerp(pts[k][0], pts[k + 1][0], f), py = lerp(pts[k][1], pts[k + 1][1], f);
    const vis = smooth(0, 0.06, u) * (1 - smooth(0.94, 1, u));
    dot(ctx, g, C, lerp(px, 100, d), lerp(py, 50, d), 1, lerp(vis, 1, d));
  }

  // ---------- Film (Disposable Camera): changes the line into frames advancing through a gate ----------
  function film(ctx, W, H, t, e, d, C) {
    const g = geo(W, H);
    const pitch = 18, period = 0.9;
    const n = Math.floor(t / period), f = (t - n * period) / period;
    const off = (n + easeIO(Math.min(1, f / 0.35))) * pitch;
    const gap = lerp(5, 0, d);
    ctx.save(); ctx.beginPath(); ctx.rect(g.X(10), g.Y(0), g.X(190) - g.X(10), g.Y(100) - g.Y(0)); ctx.clip();
    ctx.lineCap = "butt"; ctx.lineWidth = 1.1;
    const span = 180 + pitch;
    for (let k = 0; k < Math.round(span / pitch); k++) {
      let x0 = 10 + ((((k * pitch - off) % span) + span) % span) - pitch;
      const x1 = x0 + pitch - gap, mid = (x0 + x1) / 2;
      // frames that have passed the gate are exposed: blue, cooling to gray as they move on
      const exposed = mid < 100 ? 1 - smooth(0, 70, 100 - mid) : 0;
      ctx.strokeStyle = exposed > 0.02 && d < 0.99 ? mix(C.ink, C.mark, exposed * (1 - d)) : C.ink;
      ctx.globalAlpha = lerp(lineAlpha(C) + exposed * 0.4, lineAlpha(C), d);
      ctx.beginPath(); ctx.moveTo(g.X(x0), g.Y(50)); ctx.lineTo(g.X(x1), g.Y(50)); ctx.stroke();
    }
    ctx.restore(); ctx.globalAlpha = 1;
    anchors(ctx, g, C);
    // shutter: the dot flashes as each frame lands in the gate
    const flash = f > 0.35 && f < 0.6 ? 1 - (f - 0.35) / 0.25 : 0;
    if (flash > 0 && d < 0.99) {
      ctx.strokeStyle = C.mark; ctx.lineWidth = 1.2; ctx.globalAlpha = flash * (1 - d);
      ctx.beginPath(); ctx.arc(g.X(100), g.Y(50), 4 * g.S + 4 + (1 - flash) * 10, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
    }
    dot(ctx, g, C, 100, 50, 1 + flash * 0.25 * (1 - d));
  }

  // ---------- Align (Visual QA): changes the dot into a scanner that settles a warped copy ----------
  function warp(x, s) {
    const win = Math.sin(Math.PI * (x - 10) / 180);
    return (Math.sin(x * 0.07 + rand(s, 1) * 6) * 0.6 + Math.sin(x * 0.16 + rand(s, 2) * 6) * 0.4) * win;
  }
  function align(ctx, W, H, t, e, d, C) {
    const g = geo(W, H);
    line(ctx, g, C);
    const form = 0.9, scan = 3.2, hold = 0.4, cyc = form + scan + hold;
    const n = Math.floor(t / cyc), local = t - n * cyc;
    const ltr = n % 2 === 0;                       // passes alternate: left to right, then back
    const from = ltr ? 10 : 190, to = ltr ? 190 : 10;
    const A = 13 * (1 - d);
    // the copy eases from straight to warped while the dot waits at its end, then the dot scans
    const grow = easeIO(clamp01(local / form));
    const dx = lerp(from, to, easeIO(clamp01((local - form) / scan)));
    const scanning = local >= form;
    const passed = x => ltr ? dx - x : x - dx;     // > 0 once the dot has gone by
    ctx.strokeStyle = C.mark; ctx.lineWidth = 1.1; ctx.globalAlpha = 0.75 * (1 - d);
    ctx.beginPath();
    for (let x = 10; x <= 190; x += 2) {
      const settle = scanning ? smooth(0, 14, passed(x)) : 0;
      const y = 50 + warp(x, n) * A * grow * (1 - settle);
      x === 10 ? ctx.moveTo(g.X(x), g.Y(y)) : ctx.lineTo(g.X(x), g.Y(y));
    }
    ctx.stroke();
    // flags where the copy was furthest off, left behind as the dot passes
    if (scanning && d < 0.99) {
      for (let x = 14; x <= 186; x += 2) {
        const w0 = Math.abs(warp(x - 2, n)), w1 = Math.abs(warp(x, n)), w2 = Math.abs(warp(x + 2, n));
        if (!(w1 > w0 && w1 >= w2 && w1 > 0.55) || passed(x) < 0) continue;
        const since = passed(x) / 180;
        ctx.globalAlpha = (1 - smooth(0.2, 0.9, since)) * 0.9 * (1 - d);
        ctx.beginPath(); ctx.moveTo(g.X(x), g.Y(43)); ctx.lineTo(g.X(x), g.Y(57)); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    anchors(ctx, g, C);
    dot(ctx, g, C, lerp(dx, 100, d), 50);
  }

  return { still, wave, ease, route, film, align };
})();
if (typeof window !== "undefined") window.DistilleryMarks = DistilleryMarks;

/* distillery app kit — elements: theme preference, <d-theme-toggle>, <d-loop> */
(() => {
  const VERSION = "0.1.0";
  const KEY = "distillery.theme";
  const root = document.documentElement;
  let memory = "system";                       // used when storage is blocked (some iframes)

  // ---------- theme preference ----------
  function read() {
    try { const v = localStorage.getItem(KEY); if (v === "light" || v === "dark" || v === "system") return v; } catch (e) {}
    return memory;
  }
  function apply(pref) {
    if (pref === "light" || pref === "dark") root.setAttribute("data-theme", pref);
    else root.removeAttribute("data-theme");
    root.dispatchEvent(new CustomEvent("distillery:themechange", { bubbles: true, detail: { preference: pref, resolved: resolved() } }));
  }
  function resolved() {
    const p = read();
    if (p === "light" || p === "dark") return p;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function set(pref) {
    memory = pref;
    try { localStorage.setItem(KEY, pref); } catch (e) {}
    apply(pref);
  }
  apply(read());
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { if (read() === "system") apply("system"); });
  window.addEventListener("storage", e => { if (e.key === KEY) apply(read()); });

  // ---------- <d-theme-toggle> ----------
  class DThemeToggle extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) return;
      const s = this.attachShadow({ mode: "open" });
      s.innerHTML = `
        <style>
          :host { display: inline-flex; font-family: var(--d-font); }
          .seg { display: inline-flex; background: var(--d-surface); border: 1px solid var(--d-line); border-radius: 999px; padding: 3px; }
          button { font: 500 13px/1 var(--d-font); color: var(--d-ink-soft); background: transparent; border: 0; padding: 7px 12px; border-radius: 999px; cursor: pointer; }
          button[aria-pressed="true"] { background: var(--d-accent); color: var(--d-accent-ink); }
          button:focus-visible { outline: 2px solid var(--d-accent); outline-offset: 2px; }
        </style>
        <div class="seg" role="group" aria-label="Theme">
          <button type="button" data-v="light">Light</button>
          <button type="button" data-v="dark">Dark</button>
          <button type="button" data-v="system">System</button>
        </div>`;
      const sync = () => s.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v === read())));
      s.querySelectorAll("button").forEach(b => b.addEventListener("click", () => { set(b.dataset.v); sync(); }));
      root.addEventListener("distillery:themechange", sync);
      sync();
    }
  }

  // ---------- <d-loop mark="wave" state="idle|working|done"> ----------
  const STATES = { idle: { speed: 1, energy: 0.35 }, working: { speed: 1.6, energy: 0.7 }, done: { speed: 0.5, energy: 0 } };
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  class DLoop extends HTMLElement {
    static get observedAttributes() { return ["state", "mark"]; }
    get state() { return this.getAttribute("state") || "idle"; }
    set state(v) { this.setAttribute("state", v); }
    connectedCallback() {
      if (!this.shadowRoot) {
        const s = this.attachShadow({ mode: "open" });
        s.innerHTML = `<style>:host{display:block;position:relative;width:100%;aspect-ratio:2/1;min-height:60px}canvas{position:absolute;inset:0;width:100%;height:100%}</style><canvas aria-hidden="true"></canvas>`;
        this.canvas = s.querySelector("canvas");
        this.setAttribute("role", "img");
        if (!this.hasAttribute("aria-label")) this.setAttribute("aria-label", "Working indicator");
      }
      this.live = { speed: 1, energy: 0.35, done: this.state === "done" ? 1 : 0 };
      this.clock = 0; this.last = performance.now();
      this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(this);
      this.onTheme = () => this.readColors(); root.addEventListener("distillery:themechange", this.onTheme);
      this.readColors(); this.resize();
      this.running = true; requestAnimationFrame(n => this.frame(n));
    }
    disconnectedCallback() { this.running = false; this.ro && this.ro.disconnect(); root.removeEventListener("distillery:themechange", this.onTheme); }
    attributeChangedCallback() { if (reduce && this.ctx) this.frame(performance.now()); }
    readColors() {
      const cs = getComputedStyle(this), v = n => cs.getPropertyValue(n).trim();
      this.C = { mark: v("--d-mark") || "#296BFF", gray: v("--d-mark-gray") || "#B7B7B7", ink: v("--d-ink") || "#12151A",
        ghost: v("--d-mark-ghost"), faint: v("--d-mark-faint"), surface: v("--d-surface") || "#FFFFFF",
        dark: getComputedStyle(root).colorScheme === "dark" };
    }
    resize() {
      const r = this.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.w = r.width; this.h = r.height;
      this.canvas.width = Math.round(r.width * dpr); this.canvas.height = Math.round(r.height * dpr);
      this.ctx = this.canvas.getContext("2d"); this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    frame(now) {
      if (!this.running) return;
      const dt = Math.min(0.05, (now - this.last) / 1000); this.last = now;
      const tg = STATES[this.state] || STATES.idle, L = this.live;
      const k = (b) => 1 - Math.pow(b, dt);
      L.speed += (tg.speed - L.speed) * k(0.02);
      L.energy += (tg.energy - L.energy) * k(0.05);
      L.done += ((this.state === "done" ? 1 : 0) - L.done) * k(0.03);
      if (reduce) { L.speed = tg.speed; L.energy = tg.energy; L.done = this.state === "done" ? 1 : 0; }
      this.clock += dt * L.speed;
      const draw = window.DistilleryMarks[this.getAttribute("mark") || "still"] || window.DistilleryMarks.still;
      if (this.ctx && this.w) {
        this.ctx.clearRect(0, 0, this.w, this.h);
        draw(this.ctx, this.w, this.h, reduce ? 1.5 : this.clock, L.energy, L.done, this.C);
      }
      if (!reduce) requestAnimationFrame(n => this.frame(n));
    }
  }

  if (!customElements.get("d-theme-toggle")) customElements.define("d-theme-toggle", DThemeToggle);
  if (!customElements.get("d-loop")) customElements.define("d-loop", DLoop);
  window.distillery = Object.assign(window.distillery || {}, { version: VERSION, theme: { get: read, set, resolved } });
})();
