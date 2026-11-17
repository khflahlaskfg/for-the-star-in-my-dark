/* ============================================================
   ⚙️ CONFIG — كل الإعدادات اللي ممكن تعدّليها موجودة هون
   ============================================================ */
const CONFIG = {
  from: 'أنس',
  to: 'لين',

  // 🎵 الموسيقى الخلفية: حطّي مسار ملفك هون (مثال: 'audio/music.mp3')
  //    إذا تركتيه فاضي '' رح تشتغل موسيقى هادئة مولّدة تلقائياً
  music:'audio/music.mp3',
  musicVolume: 0.45, // من 0 إلى 1

  // 🎙️ ملف الأسطوانة (تسجيل صوتي من أنس أو أغنيتكم): مثال 'audio/voice.mp3'
  //    إذا تركتيه فاضي '' رح يشتغل لحن صندوق موسيقى صغير
  vinylAudio: 'audio/voice.mp3',
  vinylTitle: 'لحنُنا الصغير… من قلبي لقلبك',

  // 🗓️ نصوص أسابيع الشهر (بتظهر لما تضغط لين على كل أسبوع)
  weeks: [
    'أول رسالة، أول ضحكة، وأول مرة حسّيت إنّ في إشي حلو عم يبلّش بيني وبينك.',
    'صرت أستنّى رسايلك أكثر من أي إشي، وصار صوتك أحلى خبر بيومي.',
    'صار إلك أثر بكل تفاصيلي… حتى بالأغاني اللي بسمعها وبالطرق اللي بمشيها.',
    'ثلاثين يوم، وكل يوم كان أحلى من اللي قبله… وهاد بس أول سطر بحكايتنا.'
  ],

  // 💌 ردود أنس على اختيارات لين (بنفس ترتيب الأزرار)
  replies: [
    'وإنتِ أحلى شهر بحياتي يا لين… والعمر كله إلنا سوا، وعد مني ♥️',
    'من عيوني يا دلوعتي! الورد إلكِ كل يوم… مع إنّه ولا وردة بتشبهك 🌸',
    'أنا هون يا روحي، وكلّي آذان صاغية… احكيلي كل اللي بقلبك 💌'
  ],

  // ✉️ نص رسالة الواتساب اللي بتنبعت لأنس
  shareMessage: (choice) =>
    `أنس ♥️\nخلّصت موقع شهرنا الأول… وهاد اللي ببالي:\n«${choice}»\n— لين`
};

/* ============================================================
   أدوات عامة
   ============================================================ */
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const inv = (a, b, v) => clamp((v - a) / (b - a), 0, 1);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutBack = (t) => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[(Math.random() * arr.length) | 0];
const toAr = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
const DPR = () => Math.min(window.devicePixelRatio || 1, 2);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const isArabic = (s) => /[\u0600-\u06FF]/.test(s);

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function mk(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return c;
}

// نبضة القلب: دقّتين ثم سكون
function heartbeat(t, period = 1.25) {
  const p = (t % period) / period;
  const a = Math.exp(-Math.pow((p - 0.08) / 0.05, 2));
  const b = 0.6 * Math.exp(-Math.pow((p - 0.26) / 0.06, 2));
  return a + b;
}

/* ============================================================
   أدوات رسم الأشكال (أقنعة، حدود، عيّنات)
   ============================================================ */
const Shape = {
  blob(g, x, y, rx, ry, rot = 0) {
    g.beginPath();
    g.ellipse(x, y, rx, ry, rot, 0, TAU);
    g.fill();
  },
  path(g, d) { g.fill(new Path2D(d)); },
  bez(pts, t) {
    const n = pts.length;
    if (n === 2) return [lerp(pts[0][0], pts[1][0], t), lerp(pts[0][1], pts[1][1], t)];
    if (n === 3) {
      const u = 1 - t;
      return [u * u * pts[0][0] + 2 * u * t * pts[1][0] + t * t * pts[2][0], u * u * pts[0][1] + 2 * u * t * pts[1][1] + t * t * pts[2][1]];
    }
    const u = 1 - t;
    return [
      u * u * u * pts[0][0] + 3 * u * u * t * pts[1][0] + 3 * u * t * t * pts[2][0] + t * t * t * pts[3][0],
      u * u * u * pts[0][1] + 3 * u * u * t * pts[1][1] + 3 * u * t * t * pts[2][1] + t * t * t * pts[3][1]
    ];
  },
  // أنبوب مستدق على منحنى بيزييه (للأذرع والسيقان)
  tube(g, pts, rs) {
    const R = (t) => {
      const k = (rs.length - 1) * t;
      const i = Math.min(rs.length - 2, Math.floor(k));
      return lerp(rs[i], rs[i + 1], k - i);
    };
    let L = 0, prev = Shape.bez(pts, 0);
    for (let i = 1; i <= 24; i++) { const p = Shape.bez(pts, i / 24); L += Math.hypot(p[0] - prev[0], p[1] - prev[1]); prev = p; }
    const steps = Math.max(10, Math.ceil(L / (Math.min(...rs) * 0.3)));
    g.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = i / steps, p = Shape.bez(pts, t), r = R(t);
      g.moveTo(p[0] + r, p[1]);
      g.arc(p[0], p[1], r, 0, TAU);
    }
    g.fill();
  }
};

function renderMask(drawFn, W, H, s) {
  const c = mk(W * s, H * s);
  const g = c.getContext('2d', { willReadFrequently: true });
  g.setTransform(s, 0, 0, s, 0, 0);
  g.fillStyle = '#fff';
  drawFn(g);
  const d = g.getImageData(0, 0, c.width, c.height).data;
  const a = new Uint8Array(c.width * c.height);
  for (let i = 0; i < a.length; i++) a[i] = d[i * 4 + 3];
  return { a, w: c.width, h: c.height, s };
}

function maskBBox(m) {
  let x0 = m.w, y0 = m.h, x1 = 0, y1 = 0;
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    if (m.a[y * m.w + x] > 127) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  return { x: x0 / m.s, y: y0 / m.s, w: (x1 - x0 + 1) / m.s, h: (y1 - y0 + 1) / m.s };
}

function sampleMask(m, n, rng = Math.random) {
  const idx = [];
  for (let i = 0; i < m.a.length; i++) if (m.a[i] > 127) idx.push(i);
  const out = [];
  if (!idx.length) return out;
  for (let k = 0; k < n; k++) {
    const i = idx[(rng() * idx.length) | 0];
    out.push([((i % m.w) + rng()) / m.s, (((i / m.w) | 0) + rng()) / m.s]);
  }
  return out;
}

// تتبّع حدود القناع (marching squares) → مسارات مغلقة
function maskContours(m, minLen = 24) {
  const { a, w, h } = m;
  const inside = (x, y) => (x >= 0 && y >= 0 && x < w && y < h && a[y * w + x] > 127 ? 1 : 0);
  const K = 2 * w + 8;
  const key = (X, Y) => (Y + 2) * K + (X + 2);
  const adj = new Map();
  const link = (k1, k2) => {
    if (!adj.has(k1)) adj.set(k1, []);
    if (!adj.has(k2)) adj.set(k2, []);
    adj.get(k1).push(k2); adj.get(k2).push(k1);
  };
  for (let y = -1; y < h; y++) {
    for (let x = -1; x < w; x++) {
      const A = inside(x, y), B = inside(x + 1, y), C = inside(x + 1, y + 1), D = inside(x, y + 1);
      const idx = (A << 3) | (B << 2) | (C << 1) | D;
      if (idx === 0 || idx === 15) continue;
      const T = key(2 * x + 1, 2 * y), R = key(2 * x + 2, 2 * y + 1), Bo = key(2 * x + 1, 2 * y + 2), L = key(2 * x, 2 * y + 1);
      switch (idx) {
        case 1: case 14: link(L, Bo); break;
        case 2: case 13: link(Bo, R); break;
        case 3: case 12: link(L, R); break;
        case 4: case 11: link(T, R); break;
        case 6: case 9: link(T, Bo); break;
        case 7: case 8: link(L, T); break;
        case 5: link(L, T); link(Bo, R); break;
        case 10: link(T, R); link(L, Bo); break;
      }
    }
  }
  const seen = new Set();
  const loops = [];
  for (const k0 of adj.keys()) {
    if (seen.has(k0)) continue;
    const loop = [];
    let cur = k0, prev = -1;
    while (cur !== undefined && !seen.has(cur)) {
      seen.add(cur);
      const X = (cur % K) - 2, Y = Math.floor(cur / K) - 2;
      loop.push([X / 2 / m.s, Y / 2 / m.s]);
      const nb = adj.get(cur);
      const nxt = nb[0] !== prev ? nb[0] : nb[1];
      prev = cur; cur = nxt;
    }
    if (loop.length >= minLen) loops.push(smoothLoop(simplify(loop, 0.7 / m.s), 2));
  }
  return loops;
}

function simplify(pts, eps) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop();
    let dmax = 0, idx = -1;
    const [x1, y1] = pts[s], [x2, y2] = pts[e];
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
    for (let i = s + 1; i < e; i++) {
      const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + x2 * y1 - y2 * x1) / len;
      if (d > dmax) { dmax = d; idx = i; }
    }
    if (dmax > eps && idx > 0) { keep[idx] = 1; stack.push([s, idx], [idx, e]); }
  }
  return pts.filter((_, i) => keep[i]);
}

function smoothLoop(pts, iter) {
  let p = pts;
  for (let k = 0; k < iter; k++) {
    const q = [];
    for (let i = 0; i < p.length; i++) {
      const a = p[i], b = p[(i + 1) % p.length];
      q.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    p = q;
  }
  return p;
}

function resample(pts, step, closed = false) {
  const src = closed ? pts.concat([pts[0]]) : pts;
  const out = [src[0].slice()];
  let carry = 0;
  for (let i = 1; i < src.length; i++) {
    const [x0, y0] = src[i - 1], [x1, y1] = src[i];
    const seg = Math.hypot(x1 - x0, y1 - y0);
    let d = step - carry;
    while (d <= seg) {
      const t = d / seg;
      out.push([lerp(x0, x1, t), lerp(y0, y1, t)]);
      d += step;
    }
    carry = seg - (d - step);
  }
  return out;
}

// عيّنات من مسار SVG (للرسم الخطي)
const svgNS = 'http://www.w3.org/2000/svg';
let svgHost = null;
function samplePath(d, step) {
  if (!svgHost) {
    svgHost = document.createElementNS(svgNS, 'svg');
    svgHost.setAttribute('width', '0'); svgHost.setAttribute('height', '0');
    svgHost.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;visibility:hidden';
    document.body.appendChild(svgHost);
  }
  const p = document.createElementNS(svgNS, 'path');
  p.setAttribute('d', d);
  svgHost.appendChild(p);
  const L = p.getTotalLength();
  const n = Math.max(2, Math.ceil(L / step));
  const out = [];
  for (let i = 0; i <= n; i++) { const q = p.getPointAtLength((L * i) / n); out.push([q.x, q.y]); }
  svgHost.removeChild(p);
  return out;
}

/* ============================================================
   نصوص متوهجة داخل الـ Canvas + الكتابة التدريجية من اليمين
   ============================================================ */
function textSprite(text, font, size, color, glow, blur, dpr) {
  const g0 = mk(2, 2).getContext('2d');
  g0.font = font;
  const tw = g0.measureText(text).width;
  const pad = Math.ceil(blur * 1.6 + 6);
  const w = tw + pad * 2, h = size * 1.7 + pad * 2;
  const c = mk(w * dpr, h * dpr);
  const g = c.getContext('2d');
  g.scale(dpr, dpr);
  g.font = font;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.direction = isArabic(text) ? 'rtl' : 'ltr';
  g.fillStyle = color;
  if (blur > 0) {
    g.shadowColor = glow; g.shadowBlur = blur;
    g.fillText(text, w / 2, h / 2);
    g.shadowBlur = blur * 0.35;
    g.fillText(text, w / 2, h / 2);
    g.shadowBlur = 0;
  }
  g.fillText(text, w / 2, h / 2);
  return { c, w, h, tw, pad, dpr };
}

class RevealText {
  constructor(lines, opts) { this.lines = lines; this.o = Object.assign({ weight: 700, family: '"Aref Ruqaa", "Amiri", serif', color: '#fff1f6', glow: 'rgba(255,140,200,0.95)', minSize: 15 }, opts); }
  build(maxW, size, dpr) {
    const o = this.o;
    const g = mk(2, 2).getContext('2d');
    const font = (s) => `${o.weight} ${s}px ${o.family}`;
    let lines = this.lines.slice();
    let s = size;
    const widest = (ls, sz) => { g.font = font(sz); return Math.max(...ls.map((l) => g.measureText(l).width)); };
    while (widest(lines, s) > maxW && s > o.minSize) s -= 1;
    if (widest(lines, s) > maxW) {
      lines = lines.flatMap((l) => {
        g.font = font(s);
        if (g.measureText(l).width <= maxW) return [l];
        const words = l.split(' ');
        const half = Math.ceil(words.length / 2);
        return [words.slice(0, half).join(' '), words.slice(half).join(' ')];
      });
    }
    this.size = s;
    this.lh = s * 1.55;
    this.sprites = lines.map((l) => textSprite(l, font(s), s, o.color, o.glow, s * 0.7, dpr));
    const mw = Math.max(...this.sprites.map((sp) => sp.c.width)), mh = Math.max(...this.sprites.map((sp) => sp.c.height));
    this.tmp = mk(mw, mh);
    this.height = this.lh * lines.length;
  }
  draw(ctx, cx, y0, p) {
    if (!this.sprites || p <= 0) return;
    const n = this.sprites.length;
    for (let i = 0; i < n; i++) {
      const lp = clamp(p * n - i, 0, 1);
      if (lp <= 0) continue;
      const s = this.sprites[i];
      const x = cx - s.w / 2, y = y0 + i * this.lh - s.h / 2;
      if (lp >= 1) { ctx.drawImage(s.c, x, y, s.w, s.h); continue; }
      const tg = this.tmp.getContext('2d');
      const W = s.c.width, H = s.c.height, pad = s.pad * s.dpr, f = 46 * s.dpr;
      tg.setTransform(1, 0, 0, 1, 0, 0);
      tg.clearRect(0, 0, this.tmp.width, this.tmp.height);
      tg.globalCompositeOperation = 'source-over';
      tg.drawImage(s.c, 0, 0);
      tg.globalCompositeOperation = 'destination-in';
      const e = W - pad - lp * (W - 2 * pad + f);
      const grad = tg.createLinearGradient(e - f, 0, e, 0);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,1)');
      tg.fillStyle = grad;
      tg.fillRect(0, 0, W, H);
      tg.globalCompositeOperation = 'source-over';
      ctx.drawImage(this.tmp, 0, 0, W, H, x, y, s.w, s.h);
      // رأس القلم المضيء
      const ex = x + (e - f * 0.5) / s.dpr, ey = y + s.h / 2;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const rg = ctx.createRadialGradient(ex, ey, 0, ex, ey, this.size * 0.9);
      rg.addColorStop(0, 'rgba(255,240,248,0.9)');
      rg.addColorStop(0.3, 'rgba(255,150,205,0.35)');
      rg.addColorStop(1, 'rgba(255,120,190,0)');
      ctx.fillStyle = rg;
      ctx.fillRect(ex - this.size, ey - this.size, this.size * 2, this.size * 2);
      ctx.restore();
    }
  }
}

// نقطة متوهجة جاهزة (sprite)
function glowDot(color, r = 16) {
  const c = mk(r * 2, r * 2);
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(r, r, 0, r, r, r);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.18, color);
  gr.addColorStop(0.45, color.replace(/[\d.]+\)$/, '0.25)'));
  gr.addColorStop(1, color.replace(/[\d.]+\)$/, '0)'));
  g.fillStyle = gr;
  g.fillRect(0, 0, r * 2, r * 2);
  return c;
}
function sparkleSprite(color, r = 20) {
  const c = mk(r * 2, r * 2);
  const g = c.getContext('2d');
  g.translate(r, r);
  g.globalCompositeOperation = 'lighter';
  const core = g.createRadialGradient(0, 0, 0, 0, 0, r * 0.5);
  core.addColorStop(0, 'rgba(255,255,255,1)');
  core.addColorStop(0.3, color);
  core.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = core;
  g.fillRect(-r, -r, r * 2, r * 2);
  g.fillStyle = color;
  for (let k = 0; k < 2; k++) {
    g.save();
    g.rotate((k * Math.PI) / 2);
    const lg = g.createLinearGradient(-r, 0, r, 0);
    lg.addColorStop(0, 'rgba(255,255,255,0)');
    lg.addColorStop(0.5, 'rgba(255,255,255,0.9)');
    lg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = lg;
    g.fillRect(-r, -0.8, r * 2, 1.6);
    g.restore();
  }
  return c;
}

/* ============================================================
   المشهد الأساسي (Scene) + مدير المشاهد
   ============================================================ */
class Scene {
  constructor(el) {
    this.el = el;
    this.canvas = el.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.t = 0;
    this.started = false;
    this.visible = false;
    this.built = false;
    this.w = 0; this.h = 0; this.dpr = 1;
    this.duration = 8;
    this.ptr = { x: -1e4, y: -1e4, in: false };
    const pos = (e) => { const r = this.canvas.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    this.canvas.addEventListener('pointermove', (e) => { const p = pos(e); this.ptr.x = p.x; this.ptr.y = p.y; this.ptr.in = true; this.onMove && this.onMove(p); });
    this.canvas.addEventListener('pointerdown', (e) => { const p = pos(e); this.ptr.x = p.x; this.ptr.y = p.y; this.ptr.in = true; this.onTap && this.onTap(p); });
    this.canvas.addEventListener('pointerleave', () => { this.ptr.in = false; this.ptr.x = this.ptr.y = -1e4; });
    this.canvas.addEventListener('pointercancel', () => { this.ptr.in = false; this.ptr.x = this.ptr.y = -1e4; });
    this.canvas.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') setTimeout(() => { this.ptr.in = false; this.ptr.x = this.ptr.y = -1e4; }, 450); });
  }
  measure() {
    const r = this.el.getBoundingClientRect();
    const w = Math.round(r.width), h = Math.round(r.height), d = DPR();
    if (!w || !h) return false;
    if (w === this.w && h === this.h && d === this.dpr && this.built) return false;
    this.w = w; this.h = h; this.dpr = d;
    this.canvas.width = Math.round(w * d);
    this.canvas.height = Math.round(h * d);
    return true;
  }
  resize() {
    if (!this.measure()) return;
    this.build();
    this.built = true;
    if (this.started) { this.restore && this.restore(); this.render(); }
  }
  start() {
    if (this.started) return;
    if (!this.built) this.resize();
    this.started = true;
    this.reset();
  }
  reset() {
    this.t = 0;
    this.onReset();
    if (reducedMotion) this.t = this.duration;
  }
  tick(dt) {
    this.t += dt;
    this.update(dt);
    this.render();
  }
  begin() {
    const c = this.ctx;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    c.globalCompositeOperation = 'source-over';
    c.globalAlpha = 1;
    c.clearRect(0, 0, this.w, this.h);
    return c;
  }
}

/* ------------------------------------------------------------
   المشهد ١ — قلب كلمات الحب
   ------------------------------------------------------------ */
const FEATURED = [
  { text: 'لولتي', x: -7.6, y: -6.4, s: 1.75 },
  { text: 'دلوعتي', x: 7.6, y: -6.4, s: 1.75 },
  { text: 'روح روحي', x: -6.6, y: -2.0, s: 1.6 },
  { text: 'أنتِ قلبي', x: 6.6, y: -2.0, s: 1.6 },
  { text: 'بحبك يا لين', x: 0, y: 2.6, s: 2.55 },
  { text: 'عيوني إلك', x: -5.0, y: 7.0, s: 1.55 },
  { text: 'بحبك', x: 5.2, y: 7.0, s: 1.8 },
  { text: 'عمري ', x: 0, y: 11.2, s: 1.5 }
];
const WORLD = ['I love you', "Je t'aime", 'Te amo', 'Ti amo', 'Ich liebe dich', 'Eu te amo', 'Seni seviyorum', 'Я тебя люблю', '愛してる', '사랑해', '我爱你', "S'agapo", 'Ik hou van je', 'Jag älskar dig', 'Kocham cię', 'Aku cinta kamu', 'Te iubesc', 'Mahal kita', 'Anh yêu em', 'Szeretlek', 'Volim te', 'Miluji tě', 'Nakupenda', 'Rakastan sinua', 'Je t’adore', 'Mi amas vin'];
const AR_SMALL = ['حبيبتي', 'قلبي', 'روحي', 'عمري', 'حياتي', 'نور عيني', 'يا قمري', 'يا بعد تسبدي', 'غلاتي'];

class HeartScene extends Scene {
  constructor(el) { super(el); this.duration = 6.4; }
  build() {
    const { w, h, dpr } = this;
    const rng = mulberry32(7);
    const k = Math.min((w * 0.8) / 32, (h * 0.84) / 29.5);
    this.k = k;
    const cx = w / 2, cy = h / 2 - 2.4 * k;
    this.cx = cx; this.cy = cy;
    const H = (t) => [cx + 16 * Math.pow(Math.sin(t), 3) * k, cy - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * k];
    const poly = [];
    for (let i = 0; i < 480; i++) poly.push(H((i / 480) * TAU));
    this.poly = poly;
    const inside = (x, y) => {
      let c = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, yi] = poly[i], [xj, yj] = poly[j];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
      }
      return c;
    };
    const fs = clamp(k * 0.74, 8.5, 16);
    this.fs = fs;
    const fWorld = (s) => `500 ${s}px "Readex Pro", system-ui, sans-serif`;
    const fArSmall = (s) => `700 ${s}px "Amiri", serif`;
    const fFeat = (s) => `700 ${s}px "Aref Ruqaa", "Amiri", serif`;
    const g = mk(2, 2).getContext('2d');
    // نحافظ على مساحات الكلمات في رسمة القلب الأصلية
    const layoutText = new Map([
      ['روح روحي', 'يا روحي'],
      ['بحبك يا لين', 'أحبكِ يا لين'],
      ['عمري ', 'عمري كله'],
      ['يا قمري', 'يا قمر'],
      ['يا بعد تسبدي', 'يا بعد قلبي']
    ]);

    const rawMeasure = (text, font) => {
      g.font = font;
      return g.measureText(text).width;
    };

    const measure = (text, font) => {
      return rawMeasure(layoutText.get(text) ?? text, font);
    };    const boxes = [];
    const hits = (b) => boxes.some((o) => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
    const words = [];

    const mkWord = (text, kind, size, x, y, time) => {
      const font =
        kind === 'feat' ? fFeat :
        kind === 'ar' ? fArSmall :
        fWorld;

      const availableWidth = measure(text, font(size));
      const actualWidth = rawMeasure(text, font(size));

      // تصغير العبارة الأطول لتناسب مساحتها الأصلية
      if (actualWidth > availableWidth && actualWidth > 0) {
        size *= availableWidth / actualWidth;
      }

      let sp;
      if (kind === 'feat') sp = textSprite(text, fFeat(size), size, '#fff3f8', 'rgba(255,120,185,1)', size * 0.9, dpr);
      else if (kind === 'ar') sp = textSprite(text, fArSmall(size), size, '#f4c6cc', 'rgba(232,120,150,0.85)', size * 0.6, dpr);
      else sp = textSprite(text, fWorld(size), size, 'rgba(236,72,103,0.95)', 'rgba(255,60,100,0.7)', size * 0.55, dpr);
      words.push({ text, kind, x, y, sp, time, s: 1, v: 0, boost: 0 });
    };

    // ١) الكلمات المميّزة
    for (const f of FEATURED) {
      let size = fs * f.s;
      const x = cx + f.x * k, y = cy + f.y * k;
      for (let tries = 0; tries < 12; tries++) {
        const tw = measure(f.text, fFeat(size));
        const b = { x0: x - tw / 2 - 4, x1: x + tw / 2 + 4, y0: y - size * 0.62, y1: y + size * 0.62 };
        const ok = inside(b.x0, b.y0) && inside(b.x1, b.y0) && inside(b.x0, b.y1) && inside(b.x1, b.y1) && !hits(b);
        if (ok || tries === 11) { boxes.push(b); f._b = b; break; }
        size *= 0.92;
      }
      mkWord(f.text, 'feat', size, x, y, 0);
    }

    // ٢) كلمات على حدود القلب
    const perim = [];
    let P = 0;
    for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; perim.push(P); P += Math.hypot(b[0] - a[0], b[1] - a[1]); }
    const at = (s) => {
      s = ((s % P) + P) % P;
      let i = 0;
      while (i < perim.length - 1 && perim[i + 1] < s) i++;
      const a = poly[i], b = poly[(i + 1) % poly.length];
      const seg = (perim[i + 1] ?? P) - perim[i];
      const tt = seg ? (s - perim[i]) / seg : 0;
      return { x: lerp(a[0], b[0], tt), y: lerp(a[1], b[1], tt), tx: b[0] - a[0], ty: b[1] - a[1] };
    };
    const oSize = fs * 0.95, lh = oSize * 1.3, gap = fs * 0.55;
    let s = 0;
    let prevW = 0;
    const outline = [];
    let guard = 0;
    while (s < P - fs * 2 && guard++ < 400) {
      const isAr = rng() < 0.28;
      const text = isAr ? AR_SMALL[(rng() * AR_SMALL.length) | 0] : WORLD[(rng() * WORLD.length) | 0];
      const size = isAr ? oSize * 1.15 : oSize;
      const tw = measure(text, isAr ? fArSmall(size) : fWorld(size));
      if (outline.length) {
        const p = at(s);
        const tl = Math.hypot(p.tx, p.ty) || 1;
        const cx2 = Math.abs(p.tx / tl), cy2 = Math.abs(p.ty / tl);
        const dx = cx2 > 0.01 ? ((prevW + tw) / 2 + gap) / cx2 : Infinity;
        const dy = cy2 > 0.01 ? (lh + gap * 0.4) / cy2 : Infinity;
        s += Math.min(dx, dy);
        if (s > P - (tw / 2 + gap)) break;
      }
      let p = at(s);
      const bx = (q) => ({ x0: q.x - tw / 2 - 2, x1: q.x + tw / 2 + 2, y0: q.y - lh / 2, y1: q.y + lh / 2 });
      let tries = 0;
      while (hits(bx(p)) && tries++ < 40 && s < P - tw / 2) { s += fs * 0.5; p = at(s); }
      if (hits(bx(p)) || s > P - (tw / 2 + gap)) { s += fs; continue; }
      outline.push({ text, isAr, size, x: p.x, y: p.y, s, tw });
      boxes.push(bx(p));
      prevW = tw;
    }
    for (const o of outline) {
      const d = Math.min(o.s, P - o.s) / (P / 2);
      mkWord(o.text, o.isAr ? 'ar' : 'world', o.size, o.x, o.y, 0.25 + d * 1.6);
    }

    // ٣) تعبئة داخل القلب سطراً بسطر
    let minY = Infinity, maxY = -Infinity;
    for (const p of poly) { minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); }
    const rowH = fs * 1.62;
    const rows = [];
    for (let y = minY + rowH; y < maxY - rowH * 0.6; y += rowH) rows.push(y);
    rows.forEach((y, ri) => {
      const xs = [];
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, yi] = poly[i], [xj, yj] = poly[j];
        if ((yi > y) !== (yj > y)) xs.push(xi + ((y - yi) * (xj - xi)) / (yj - yi));
      }
      xs.sort((a, b) => a - b);
      for (let q = 0; q + 1 < xs.length; q += 2) {
        const a = xs[q], b = xs[q + 1];
        let x = b - fs * 0.4;
        let fails = 0;
        while (x > a + fs && fails < 30) {
          const isAr = rng() < 0.3;
          const text = isAr ? AR_SMALL[(rng() * AR_SMALL.length) | 0] : WORLD[(rng() * WORLD.length) | 0];
          const size = isAr ? fs * 1.15 : fs;
          const tw = measure(text, isAr ? fArSmall(size) : fWorld(size));
          const bx = { x0: x - tw - 2, x1: x + 2, y0: y - rowH * 0.42, y1: y + rowH * 0.42 };
          const ok = bx.x0 > a && inside(bx.x0, bx.y0) && inside(bx.x0, bx.y1) && inside(bx.x1, bx.y0) && inside(bx.x1, bx.y1) && !hits(bx);
          if (ok) {
            boxes.push(bx);
            const frac = (b - x) / Math.max(1, b - a);
            mkWord(text, isAr ? 'ar' : 'world', size, x - tw / 2, y, 2.0 + (ri / rows.length) * 2.8 + frac * 0.35);
            x -= tw + fs * (0.6 + rng() * 0.7);
            fails = 0;
          } else {
            x -= fs * 0.7;
            fails++;
          }
        }
      }
    });
    // توقيت ظهور المميّزة حسب صفّها
    for (const wd of words) if (wd.kind === 'feat') wd.time = 2.0 + inv(minY, maxY, wd.y) * 2.8 + 0.15;
    this.words = words;

    // لمعات صغيرة حول القلب
    this.sparks = [];
    for (let i = 0; i < 46; i++) this.sparks.push({ x: rand(0, w), y: rand(0, h), r: rand(0.5, 1.6), ph: rand(0, TAU), sp: rand(0.6, 1.6), vy: rand(-6, -2) });
    this.dot = glowDot('rgba(255,150,190,0.9)', 12);
  }
  onReset() { for (const wd of this.words || []) { wd.s = 1; wd.v = 0; wd.boost = 0; } }
  update(dt) {
    const R = this.k * 6.2;
    const { x: px, y: py, in: pin } = this.ptr;
    for (const wd of this.words) {
      let target = 1, glow = 0;
      if (pin) {
        const d = Math.hypot(wd.x - px, wd.y - py);
        if (d < R) { const f = Math.pow(1 - d / R, 2); target += f * (wd.kind === 'feat' ? 0.24 : 0.55); glow = f; }
      }
      const a = (target - wd.s) * 180 - wd.v * 15;
      wd.v += a * dt; wd.s += wd.v * dt;
      wd.boost += (glow - wd.boost) * Math.min(1, dt * 10);
    }
    for (const sp of this.sparks) { sp.y += sp.vy * dt; if (sp.y < -4) { sp.y = this.h + 4; sp.x = rand(0, this.w); } }
  }
  render() {
    const c = this.begin();
    const { t, w, h, cx, cy, k } = this;
    // توهّج خلفي
    const appear = easeOut(inv(0, 2.5, t));
    const beat = t > 5.4 ? heartbeat(t - 5.4) : 0;
    const bg = c.createRadialGradient(cx, cy + 2 * k, 0, cx, cy + 2 * k, 20 * k);
    bg.addColorStop(0, `rgba(160,30,70,${0.28 * appear + beat * 0.08})`);
    bg.addColorStop(0.6, `rgba(90,20,45,${0.12 * appear})`);
    bg.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = bg;
    c.fillRect(0, 0, w, h);

    // لمعات
    c.globalCompositeOperation = 'lighter';
    for (const sp of this.sparks) {
      const a = (0.5 + 0.5 * Math.sin(t * sp.sp * 2 + sp.ph)) * 0.6 * appear;
      if (a < 0.02) continue;
      c.globalAlpha = a;
      const r = sp.r * 6;
      c.drawImage(this.dot, sp.x - r, sp.y - r, r * 2, r * 2);
    }
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';

    // نبض القلب الكامل
    const sc = 1 + beat * 0.022;
    c.save();
    c.translate(cx, cy + 2.4 * k);
    c.scale(sc, sc);
    c.translate(-cx, -(cy + 2.4 * k));
    for (const wd of this.words) {
      const p = inv(wd.time, wd.time + (wd.kind === 'feat' ? 0.9 : 0.55), t);
      if (p <= 0) continue;
      const e = easeOut(p);
      let s = wd.s;
      if (wd.kind === 'feat') s *= lerp(1.35, 1, easeOutQuint(p));
      else s *= lerp(0.85, 1, e);
      const sp = wd.sp;
      const dw = sp.w * s, dh = sp.h * s;
      const yo = wd.kind === 'feat' ? 0 : (1 - e) * 6;
      c.globalAlpha = e;
      c.drawImage(sp.c, wd.x - dw / 2, wd.y - dh / 2 + yo, dw, dh);
      const flash = wd.kind === 'feat' ? (1 - p) * 0.9 : 0;
      const extra = wd.boost * 0.9 + flash;
      if (extra > 0.02) {
        c.globalCompositeOperation = 'lighter';
        c.globalAlpha = Math.min(1, extra) * e;
        c.drawImage(sp.c, wd.x - dw / 2, wd.y - dh / 2 + yo, dw, dh);
        c.globalCompositeOperation = 'source-over';
      }
    }
    c.restore();
    c.globalAlpha = 1;
  }
}

/* ------------------------------------------------------------
   المشهد ٢ — رسم العاشقين وإهداء الوردة
   ------------------------------------------------------------ */
// رؤوس جانبية (بروفايل) مرسومة يدوياً حول المركز (0,0)، الوجه نحو اليمين
const HEADS = {
  man: 'M-42 74 C -60 48, -68 4, -54 -30 C -40 -64, -2 -80, 30 -70 C 50 -64, 62 -48, 57 -30 C 55 -21, 56 -16, 58 -11 L 69 8 C 71 13, 67 16, 60 17 C 62 21, 62 24, 58 27 C 61 30, 61 34, 57 37 C 56 42, 58 47, 57 53 C 54 63, 44 69, 32 69 C 22 69, 14 72, 10 80 Z',
  woman: 'M-40 40 C -52 10, -44 -34, -10 -44 C 18 -52, 44 -38, 48 -14 C 49 -8, 49 -4, 51 0 L 59 13 C 60 17, 57 19, 52 19 C 54 22, 54 25, 51 27 C 53 30, 53 33, 50 36 C 49 41, 50 45, 48 49 C 44 57, 34 61, 22 61 C 10 61, 0 64, -4 72 Z',
  longHair: 'M-30 -36 C -58 -16, -64 34, -58 80 C -54 122, -62 172, -80 214 C -60 220, -42 200, -34 172 C -24 140, -20 96, -10 52 C -4 20, -8 -14, -30 -36 Z',
  bun: 'M-58 -26 C -64 -46, -46 -60, -30 -52 C -16 -46, -18 -24, -32 -18 C -42 -14, -54 -16, -58 -26 Z'
};
function head(g, kind, x, y, s, facing, tilt, extras = []) {
  g.save();
  g.translate(x, y);
  g.rotate(tilt);
  g.scale(facing * s, s);
  for (const e of extras) Shape.path(g, HEADS[e]);
  Shape.path(g, HEADS[kind]);
  g.restore();
}

function drawRoseCouple(g) {
  const { blob, tube, path } = Shape;
  // الشاب
  head(g, 'man', 306, 168, 0.98, 1, 0.12);
  tube(g, [[298, 226], [300, 256], [304, 284]], [20, 22]);
  path(g, 'M240 292 C 262 272, 340 270, 364 288 C 378 318, 376 382, 368 432 C 362 482, 364 530, 366 566 L 252 566 C 254 520, 250 476, 242 432 C 234 384, 230 324, 240 292 Z');
  tube(g, [[248, 304], [228, 400], [238, 486]], [24, 19]);
  tube(g, [[238, 486], [242, 506], [250, 522]], [17, 15]);
  tube(g, [[356, 306], [392, 372], [404, 404]], [24, 19]);
  tube(g, [[404, 404], [442, 414], [478, 404]], [18, 14]);
  blob(g, 486, 400, 15, 12, -0.3);
  tube(g, [[280, 556], [274, 740], [272, 916]], [34, 27, 21]);
  tube(g, [[338, 556], [346, 740], [350, 916]], [34, 27, 21]);
  path(g, 'M252 918 L 300 918 C 312 920, 318 930, 312 936 L 252 936 Z');
  path(g, 'M332 918 L 380 918 C 392 920, 398 930, 392 936 L 332 936 Z');
  // الوردة
  tube(g, [[503, 286], [496, 360], [492, 440], [498, 540]], [4, 3.8, 3.5, 3]);
  path(g, 'M497 470 C 516 452, 540 454, 552 444 C 544 470, 522 482, 497 478 Z');
  path(g, 'M494 420 C 478 404, 456 406, 446 396 C 452 420, 472 430, 494 428 Z');
  path(g, 'M484 262 C 480 246, 490 234, 503 236 C 510 226, 526 230, 526 242 C 536 248, 534 264, 526 272 C 518 284, 488 284, 484 262 Z');
  path(g, 'M490 278 L 503 294 L 516 278 Z');
  // الصبية
  head(g, 'woman', 592, 248, 0.86, -1, -0.24, ['longHair']);
  tube(g, [[594, 290], [596, 318], [598, 346]], [13, 14]);
  path(g, 'M564 352 C 582 340, 618 340, 636 354 C 642 392, 632 432, 628 470 L 572 470 C 568 432, 556 392, 564 352 Z');
  path(g, 'M570 460 L 630 460 C 654 540, 694 640, 722 762 C 666 782, 540 782, 482 762 C 512 650, 542 540, 570 460 Z');
  tube(g, [[572, 364], [552, 404], [548, 438]], [13, 10]);
  tube(g, [[548, 438], [534, 392], [524, 344]], [9.5, 7.5]);
  blob(g, 522, 336, 9, 8, 0.5);
  tube(g, [[632, 364], [648, 432], [644, 500]], [13, 10]);
  tube(g, [[590, 772], [592, 850], [594, 920]], [15, 11, 8]);
  tube(g, [[632, 772], [650, 836], [680, 888]], [15, 11, 8]);
  path(g, 'M582 916 L 606 916 C 612 926, 604 934, 590 934 L 576 934 C 574 926, 576 918, 582 916 Z');
  path(g, 'M676 880 L 694 900 L 704 918 L 694 920 L 674 898 Z');
}
const ROSE_POINT = [505, 258];

class RoseScene extends Scene {
  constructor(el) {
    super(el);
    this.duration = 9.4;
    this.text = new RevealText(['حينَ عجزت الكلمات…', 'أهديتك وردة تشبهك'], { font: '700 32px "Aref Ruqaa", "Amiri", serif', fill: '#fff3f8', stroke: 'rgba(255,120,185,0.9)', strokeWidth: 1.5, lineHeight: 1.2, align: 'center' });
    this.motes = [];
  }
  build() {
    const { w, h, dpr } = this;
    const m = renderMask(drawRoseCouple, 800, 1000, 0.5);
    const bb = maskBBox(m);
    const textSize = clamp(w * 0.066, 17, 34);
    this.text.build(w * 0.86, textSize, dpr);
    const top = h * 0.07 + this.text.height + h * 0.03;
    const f = Math.min((w * 0.86) / bb.w, (h * 0.95 - top) / bb.h);
    const ox = w / 2 - (bb.x + bb.w / 2) * f;
    const oy = h * 0.95 - (bb.y + bb.h) * f;
    this.f = f; this.ox = ox; this.oy = oy;
    this.textY = h * 0.07 + this.text.size * 0.8;
    const T = (p) => [ox + p[0] * f, oy + p[1] * f];
    this.rose = T(ROSE_POINT);
    // مسارات التتبّع: من أقرب نقطة للوردة باتجاهين
    const loops = maskContours(m).map((l) => resample(l.map(T), 2.2, true));
    const halves = [];
    for (const L of loops) {
      let bi = 0, bd = Infinity;
      L.forEach((p, i) => { const d = Math.hypot(p[0] - this.rose[0], p[1] - this.rose[1]); if (d < bd) { bd = d; bi = i; } });
      const n = L.length, half = Math.ceil(n / 2);
      const fwd = [], back = [];
      for (let i = 0; i <= half; i++) fwd.push(L[(bi + i) % n]);
      for (let i = 0; i <= n - half; i++) back.push(L[(bi - i + n) % n]);
      const delay = clamp(bd / (h * 0.9), 0, 0.35);
      halves.push({ pts: fwd, delay }, { pts: back, delay });
    }
    this.halves = halves;
    // التعبئة بالتدرج النجمي
    this.fill = mk(w * dpr, h * dpr);
    const g = this.fill.getContext('2d');
    g.setTransform(dpr * f, 0, 0, dpr * f, dpr * ox, dpr * oy);
    const gr = g.createLinearGradient(0, bb.y, 0, bb.y + bb.h);
    gr.addColorStop(0, '#f6a7cf');
    gr.addColorStop(0.35, '#d58ee0');
    gr.addColorStop(0.7, '#a98be8');
    gr.addColorStop(1, '#8aa0ef');
    g.fillStyle = gr;
    drawRoseCouple(g);
    // لمعة داخلية دافئة حول الوردة
    g.globalCompositeOperation = 'source-atop';
    const rg = g.createRadialGradient(ROSE_POINT[0], ROSE_POINT[1], 0, ROSE_POINT[0], ROSE_POINT[1], 340);
    rg.addColorStop(0, 'rgba(255,220,240,0.75)');
    rg.addColorStop(0.4, 'rgba(255,170,215,0.25)');
    rg.addColorStop(1, 'rgba(255,170,215,0)');
    g.fillStyle = rg;
    g.fillRect(0, 0, 800, 1000);
    g.globalCompositeOperation = 'source-over';
    // توهّج ناعم (تصغير ثم تكبير)
    this.glow = mk(Math.ceil((w * dpr) / 10), Math.ceil((h * dpr) / 10));
    const gg = this.glow.getContext('2d');
    gg.drawImage(this.fill, 0, 0, this.glow.width, this.glow.height);
    this.tmp = mk(w * dpr, h * dpr);
    // نجوم داخل الشكلين
    this.inner = sampleMask(m, Math.round(clamp((w * h) / 1500, 80, 240)), mulberry32(3)).map((p) => ({ p: T(p), ph: rand(0, TAU), sp: rand(1, 2.4), r: rand(0.35, 0.95) }));
    this.ground = [T([150, 946]), T([790, 946])];
    this.dot = glowDot('rgba(255,170,220,0.9)', 14);
    this.white = glowDot('rgba(255,236,246,0.95)', 14);
  }
  onReset() { this.motes = []; this.emitAcc = 0; }
  emit(n, power = 1) {
    const [x, y] = this.rose;
    for (let i = 0; i < n; i++) {
      const a = rand(-Math.PI * 0.95, -Math.PI * 0.05);
      const sp = rand(10, 46) * power;
      this.motes.push({ x: x + rand(-6, 6), y: y + rand(-6, 6), vx: Math.cos(a) * sp * 0.5, vy: Math.sin(a) * sp - 10, life: 0, max: rand(2.2, 4.2), r: rand(0.6, 1.8), ph: rand(0, TAU) });
    }
  }
  onTap(p) {
    if (!this.started) return;
    const near = Math.hypot(p.x - this.rose[0], p.y - this.rose[1]) < this.w * 0.25;
    this.emit(near ? 40 : 18, near ? 1.8 : 1.2);
  }
  update(dt) {
    if (this.t > 5.2) {
      this.emitAcc += dt * (this.ptr.in ? 26 : 12);
      while (this.emitAcc > 1) { this.emitAcc--; this.emit(1); }
    }
    for (const m of this.motes) {
      m.life += dt;
      m.vx += Math.sin(m.life * 2 + m.ph) * 6 * dt;
      m.vy -= 4 * dt;
      m.x += m.vx * dt; m.y += m.vy * dt;
    }
    this.motes = this.motes.filter((m) => m.life < m.max);
  }
  render() {
    const c = this.begin();
    const { t, w, h, dpr } = this;
    const [rx, ry] = this.rose;
    // الأرضية المضيئة
    const ga = easeOut(inv(0.2, 2.5, t));
    const [g0, g1] = this.ground;
    const lg = c.createLinearGradient(g0[0], 0, g1[0], 0);
    lg.addColorStop(0, 'rgba(255,190,220,0)');
    lg.addColorStop(0.5, `rgba(255,214,234,${0.85 * ga})`);
    lg.addColorStop(1, 'rgba(255,190,220,0)');
    c.fillStyle = lg;
    c.fillRect(g0[0], g0[1] - 1, g1[0] - g0[0], 2.2);
    const pg = c.createRadialGradient(w / 2, g0[1], 0, w / 2, g0[1], w * 0.45);
    pg.addColorStop(0, `rgba(210,140,230,${0.18 * ga})`);
    pg.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = pg;
    c.fillRect(0, g0[1] - w * 0.2, w, w * 0.3);

    // شرارة البداية عند الوردة
    const spark = easeOut(inv(0, 0.7, t)) * (1 - 0.6 * inv(4.5, 6.5, t));
    if (spark > 0) {
      c.globalCompositeOperation = 'lighter';
      const r0 = 38 + Math.sin(t * 3) * 4;
      const sg = c.createRadialGradient(rx, ry, 0, rx, ry, r0);
      sg.addColorStop(0, `rgba(255,240,248,${0.9 * spark})`);
      sg.addColorStop(0.25, `rgba(255,150,210,${0.45 * spark})`);
      sg.addColorStop(1, 'rgba(255,120,190,0)');
      c.fillStyle = sg;
      c.fillRect(rx - r0, ry - r0, r0 * 2, r0 * 2);
      c.globalCompositeOperation = 'source-over';
    }

    // التعبئة المتدرجة تنتشر من الوردة
    const fp = inv(4.3, 6.9, t);
    if (fp > 0) {
      const maxR = Math.hypot(Math.max(rx, w - rx), Math.max(ry, h - ry)) * 1.05;
      if (fp < 1) {
        const R = easeInOut(fp) * maxR;
        const tg = this.tmp.getContext('2d');
        tg.setTransform(1, 0, 0, 1, 0, 0);
        tg.globalCompositeOperation = 'source-over';
        tg.clearRect(0, 0, this.tmp.width, this.tmp.height);
        tg.drawImage(this.fill, 0, 0);
        tg.globalCompositeOperation = 'destination-in';
        const edge = 70 * dpr;
        const mg = tg.createRadialGradient(rx * dpr, ry * dpr, 0, rx * dpr, ry * dpr, R * dpr + edge);
        const inner = (R * dpr) / (R * dpr + edge);
        mg.addColorStop(0, 'rgba(0,0,0,1)');
        mg.addColorStop(clamp(inner, 0, 0.999), 'rgba(0,0,0,1)');
        mg.addColorStop(1, 'rgba(0,0,0,0)');
        tg.fillStyle = mg;
        tg.fillRect(0, 0, this.tmp.width, this.tmp.height);
        tg.globalCompositeOperation = 'source-over';
        c.drawImage(this.tmp, 0, 0, w, h);
      } else {
        c.globalCompositeOperation = 'lighter';
        c.globalAlpha = 0.35 + 0.08 * Math.sin(t * 1.4);
        c.drawImage(this.glow, -w * 0.02, -h * 0.02, w * 1.04, h * 1.04);
        c.globalAlpha = 1;
        c.globalCompositeOperation = 'source-over';
        c.drawImage(this.fill, 0, 0, w, h);
      }
    }

    // الخط المضيء
    const tp = inv(0.5, 4.6, t);
    const lineA = 1 - 0.75 * easeOut(inv(5.0, 7.0, t));
    if (tp > 0 && lineA > 0.01) {
      c.lineJoin = 'round'; c.lineCap = 'round';
      const heads = [];
      for (const hv of this.halves) {
        const lp = easeInOut(clamp((tp - hv.delay) / (1 - hv.delay), 0, 1));
        if (lp <= 0) continue;
        const n = Math.max(1, Math.floor(lp * (hv.pts.length - 1)));
        c.beginPath();
        c.moveTo(hv.pts[0][0], hv.pts[0][1]);
        for (let i = 1; i <= n; i++) c.lineTo(hv.pts[i][0], hv.pts[i][1]);
        hv._path = true;
        c.strokeStyle = `rgba(255,150,210,${0.22 * lineA})`;
        c.lineWidth = 5;
        c.stroke();
        c.strokeStyle = `rgba(255,236,246,${0.95 * lineA})`;
        c.lineWidth = 1.4;
        c.stroke();
        if (lp < 1) heads.push(hv.pts[n]);
      }
      c.globalCompositeOperation = 'lighter';
      for (const p of heads) c.drawImage(this.white, p[0] - 9, p[1] - 9, 18, 18);
      c.globalCompositeOperation = 'source-over';
    }

    // نجوم داخلية بعد التعبئة
    const ia = easeOut(inv(6.6, 8, t));
    c.globalCompositeOperation = 'lighter';
    if (ia > 0) {
      for (const s of this.inner) {
        const a = (0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(t * s.sp + s.ph), 3)) * ia * 0.75;
        c.globalAlpha = a;
        const r = s.r * 5;
        c.drawImage(this.white, s.p[0] - r, s.p[1] - r, r * 2, r * 2);
      }
    }
    // ذرات نور تتصاعد من الوردة
    for (const m of this.motes) {
      const a = Math.sin((m.life / m.max) * Math.PI);
      c.globalAlpha = a;
      const r = m.r * 6;
      c.drawImage(this.dot, m.x - r, m.y - r, r * 2, r * 2);
    }
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';

    // الجملة تُكتب فوقهما
    this.text.draw(c, w / 2, this.textY, inv(6.8, 9.2, t));
  }
}

/* ------------------------------------------------------------
   المشهد ٣ — تفتّح زهرة الجزيئات
   ------------------------------------------------------------ */
const PETALS = [
  { a: -1.28, len: 1.0, wf: 0.3, curl: -1.0, layer: 1, order: 0 },
  { a: 1.28, len: 1.0, wf: 0.3, curl: 1.0, layer: 1, order: 1 },
  { a: -0.66, len: 1.08, wf: 0.32, curl: -0.75, layer: 0, order: 2 },
  { a: 0.66, len: 1.08, wf: 0.32, curl: 0.75, layer: 0, order: 3 },
  { a: 0.02, len: 1.12, wf: 0.3, curl: 0.05, layer: 0, order: 4 },
  { a: -0.22, len: 0.94, wf: 0.34, curl: -0.4, layer: 1, order: 5 },
  { a: 0.24, len: 0.92, wf: 0.33, curl: 0.42, layer: 1, order: 6 }
];
const FLOWER_PALETTES = [
  ['#ff8fb3', '#ffd1dc', '#ff5f95'], ['#ffd27f', '#fff1c1', '#ffb347'], ['#c4a1ff', '#efe3ff', '#a77bff'],
  ['#ff9e7a', '#ffd9c9', '#ff7a59'], ['#9ad7ff', '#e3f4ff', '#6cc2ff'], ['#ff5fa8', '#ffc2dd', '#ff2f8e'], ['#fff5f8', '#ffffff', '#ffd6e6']
];

class BloomScene extends Scene {
  constructor(el) { super(el); this.duration = 9.8; this.minis = []; this.floaters = []; }
  build() {
    const { w, h } = this;
    const S = Math.min(w, h * 0.82);
    this.S = S;
    const cx = w / 2;
    this.groundY = h * 0.885;
    this.top = [cx + S * 0.015, h * 0.395];
    this.stemPts = [[cx, this.groundY], [cx - S * 0.07, h * 0.72], [cx + S * 0.07, h * 0.55], this.top];
    this.orbitC = [cx, h * 0.43];
    const area = w * h;
    const q = clamp(area / 360000, 0.45, 1.25);
    // الأرضية
    this.groundPts = [];
    const nG = Math.round(620 * q);
    for (let i = 0; i < nG; i++) {
      const u = (Math.random() + Math.random() + Math.random()) / 3 - 0.5;
      const x = cx + u * w * 1.05;
      const spread = (1 - Math.abs(u) * 1.6) * h * 0.05;
      const y = this.groundY + Math.abs(rand(-1, 1) * rand(0, 1)) * spread * 1.2 - spread * 0.25 + rand(0, h * 0.02);
      const col = pick(['#c4b5fd', '#a78bfa', '#f9a8d4', '#ffffff', '#e9d5ff', '#f0abfc']);
      this.groundPts.push({ x, y, col, r: rand(0.5, 1.5), ph: rand(0, TAU), sp: rand(1, 3) });
    }
    // الساق
    this.stem = [];
    const nS = Math.round(300 * q);
    for (let i = 0; i < nS; i++) {
      const tt = i / nS;
      const p = Shape.bez(this.stemPts, tt);
      const off = rand(-1, 1) * S * 0.006;
      this.stem.push({ t: tt, x: p[0] + off, y: p[1], col: pick(['#4ade80', '#5eead4', '#86efac', '#34d399']), r: rand(0.7, 1.5) });
    }
    // الأوراق
    const LEAVES = [[0.22, -1, 0.22, 0.95], [0.34, 1, 0.2, 0.9], [0.49, -1, 0.16, 0.82], [0.62, 1, 0.13, 0.78]];
    this.leaves = LEAVES.map(([node, side, len, ang]) => {
      const base = Shape.bez(this.stemPts, node);
      const parts = [];
      const n = Math.round(150 * q);
      for (let i = 0; i < n; i++) {
        const u = Math.pow(Math.random(), 0.8);
        const vein = Math.random() < 0.18;
        const v = vein ? rand(-0.08, 0.08) : (Math.random() < 0.5 ? -1 : 1) * Math.sqrt(Math.random());
        parts.push({ u, v, col: vein ? '#bbf7d0' : pick(['#4ade80', '#5eead4', '#86efac', '#34d399', '#2dd4bf']), r: rand(0.6, 1.4) });
      }
      return { node, side, len: len * S, ang, base, parts };
    });
    // البتلات
    const nP = Math.round(560 * q);
    this.petals = PETALS.map((pd) => {
      const parts = [];
      for (let i = 0; i < nP * pd.len; i++) {
        const u = Math.pow(Math.random(), 0.85);
        const edge = Math.random() < 0.45;
        const v = edge ? (Math.random() < 0.5 ? -1 : 1) * rand(0.82, 1) : rand(-1, 1);
        let col;
        if (pd.layer === 0) col = u < 0.3 ? '#f5a3c7' : pick(['#c2417f', '#d9559a', '#e879b0', '#be3a7a']);
        else col = u < 0.22 ? pick(['#fff0f6', '#ffd1e6']) : u > 0.82 ? pick(['#ffc2dd', '#ff9fcb', '#fff0f6']) : pick(['#ff5fa8', '#ff7bbd', '#f472b6', '#ec4899', '#ff8cc6']);
        if (Math.random() < 0.05) col = '#ffd27f';
        parts.push({ u, v, col, r: rand(0.8, 1.8), sx: 0, sy: 0, delay: rand(0, 0.7), ph: rand(0, TAU) });
      }
      return Object.assign({}, pd, { parts, axis: [], o: 0 });
    });
    this.stamens = Array.from({ length: 6 }, (_, i) => ({ a: -0.75 + i * 0.3 + rand(-0.06, 0.06), l: rand(0.42, 0.6) }));
    this.dot = glowDot('rgba(255,140,200,0.9)', 12);
    this.gold = glowDot('rgba(255,200,120,0.95)', 12);
    this.white = glowDot('rgba(255,240,250,0.95)', 12);
    this.buckets = new Map();
    for (const m of this.minis) { m.x = clamp(m.x, 0, w); }
  }
  onReset() {
    this.minis = []; this.floaters = []; this.rise = [];
    if (this.petals) for (const p of this.petals) for (const q of p.parts) { q.sx = this.top[0] + rand(-this.S * 0.25, this.S * 0.25); q.sy = this.top[1] + rand(-this.S * 0.2, this.S * 0.12); }
  }
  restore() { this.onReset(); }
  petalAxis(pd, o, ls, t) {
    const L = pd.len * this.S * 0.215 * ls;
    const sway = Math.sin(t * 0.8) * 0.02;
    const a = lerp(pd.a * 0.1, pd.a, o) + sway;
    const curl = pd.curl * o;
    const axis = [];
    let x = this.top[0], y = this.top[1];
    axis.push([x, y, a]);
    const N = 14;
    for (let i = 1; i <= N; i++) {
      const u = i / N;
      const ang = a + curl * u * u;
      x += Math.sin(ang) * (L / N);
      y -= Math.cos(ang) * (L / N);
      axis.push([x, y, ang]);
    }
    pd.L = L;
    pd.axis = axis;
    pd.wScale = lerp(0.55, 1, o);
  }
  plant(p) {
    const { w, h, S } = this;
    let x, y, stemFrom = null;
    if (p) { x = p.x; y = p.y; }
    else {
      x = rand(w * 0.12, w * 0.88);
      if (Math.abs(x - w / 2) < S * 0.12) x += (x < w / 2 ? -1 : 1) * S * 0.14;
      const gy = this.groundY + rand(-h * 0.01, h * 0.015);
      y = gy - rand(h * 0.12, h * 0.28);
      stemFrom = [x + rand(-8, 8), gy];
    }
    const pal = pick(FLOWER_PALETTES);
    const size = rand(S * 0.05, S * 0.085);
    const nPet = pick([5, 5, 6, 8]);
    const parts = [];
    for (let k = 0; k < nPet; k++) for (let i = 0; i < 26; i++) {
      parts.push({ k, u: Math.pow(Math.random(), 0.7), v: rand(-1, 1), col: Math.random() < 0.25 ? pal[1] : Math.random() < 0.5 ? pal[0] : pal[2], r: rand(0.6, 1.5) });
    }
    this.minis.push({ x, y, born: this.t, pal, size, nPet, rot: rand(0, TAU), parts, stemFrom });
    if (this.minis.length > 12) this.minis.shift();
    for (let i = 0; i < 16; i++) {
      const a = rand(0, TAU), sp = rand(30, 110);
      this.floaters.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, rot: rand(0, TAU), vr: rand(-4, 4), s: rand(3, 6), col: pick(pal), life: 0, max: rand(2.4, 4.2) });
    }
  }
  onTap(p) {
    if (!this.started) return;
    if (p.y < this.groundY + 10) this.plant(p);
  }
  update(dt) {
    for (const m of this.floaters) { m.life += dt; m.vy += 30 * dt; m.vx *= 0.985; m.vy *= 0.985; m.vy -= 22 * dt; m.x += m.vx * dt + Math.sin(m.life * 3) * 0.4; m.y += m.vy * dt; m.rot += m.vr * dt; }
    this.floaters = this.floaters.filter((m) => m.life < m.max);
    this.minis = this.minis.filter((m) => this.t - m.born < 9);
  }
  bucket(col) {
    let b = this.buckets.get(col);
    if (!b) { b = []; this.buckets.set(col, b); }
    return b;
  }
  flush(c) {
    for (const [col, arr] of this.buckets) {
      if (!arr.length) continue;
      c.fillStyle = col;
      for (let i = 0; i < arr.length; i += 3) c.fillRect(arr[i], arr[i + 1], arr[i + 2], arr[i + 2]);
      arr.length = 0;
    }
  }
  render() {
    const c = this.begin();
    const { t, w, h, S } = this;
    const [ox, oy] = this.orbitC;

    // المدارات الهندسية
    const oa = easeOut(inv(0, 1.6, t));
    c.save();
    c.lineWidth = 1;
    [0.3, 0.41, 0.5].forEach((r, i) => {
      c.setLineDash(i === 1 ? [1, 7] : [2, 9]);
      c.lineDashOffset = -t * (6 + i * 4) * (i % 2 ? -1 : 1);
      c.strokeStyle = `rgba(232,180,220,${0.16 * oa})`;
      c.beginPath(); c.arc(ox, oy, S * r, 0, TAU); c.stroke();
      c.setLineDash([]);
      const a0 = t * (0.12 + i * 0.05) * (i % 2 ? -1 : 1) + i * 2;
      c.strokeStyle = `rgba(255,200,230,${0.32 * oa})`;
      c.beginPath(); c.arc(ox, oy, S * r, a0, a0 + 0.7); c.stroke();
      c.globalCompositeOperation = 'lighter';
      c.globalAlpha = 0.9 * oa;
      const dx = ox + Math.cos(a0 + 0.7) * S * r, dy = oy + Math.sin(a0 + 0.7) * S * r;
      c.drawImage(this.white, dx - 5, dy - 5, 10, 10);
      c.globalAlpha = 1;
      c.globalCompositeOperation = 'source-over';
    });
    c.restore();

    // هالة خلف الزهرة
    const openAvg = this.petals.reduce((s, p) => s + p.o, 0) / this.petals.length;
    const [tx, ty] = this.top;
    const halo = c.createRadialGradient(tx, ty - S * 0.08, 0, tx, ty - S * 0.08, S * 0.42);
    halo.addColorStop(0, `rgba(255,95,168,${0.28 * openAvg})`);
    halo.addColorStop(0.5, `rgba(180,60,140,${0.12 * openAvg})`);
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = halo;
    c.fillRect(0, 0, w, h);

    c.globalCompositeOperation = 'lighter';
    // غبار النجوم في الأرضية
    for (const p of this.groundPts) {
      const tw = 0.55 + 0.45 * Math.sin(t * p.sp + p.ph);
      const r = p.r * (0.6 + tw * 0.6) * oa;
      if (r < 0.2) continue;
      this.bucket(p.col).push(p.x - r / 2, p.y - r / 2, r);
    }
    // الساق
    const g = easeInOut(inv(0.8, 3.4, t));
    for (const p of this.stem) if (p.t <= g) this.bucket(p.col).push(p.x - p.r / 2, p.y - p.r / 2, p.r);
    // الأوراق
    for (const lf of this.leaves) {
      const lg = easeOutBack(inv(lf.node, lf.node + 0.25, g) * inv(0, 1, (t - 0.8 - lf.node * 2.6) / 0.9));
      if (lg <= 0) continue;
      const L = lf.len * lg;
      const ang0 = lf.side * lf.ang + Math.sin(t * 0.9 + lf.node * 6) * 0.03;
      for (const q of lf.parts) {
        const ang = ang0 + lf.side * 0.55 * q.u * q.u;
        const ax = lf.base[0] + Math.sin(lerp(ang0, ang, 0.5)) * L * q.u;
        const ay = lf.base[1] - Math.cos(lerp(ang0, ang, 0.5)) * L * q.u;
        const W = L * 0.2 * Math.sin(Math.PI * Math.pow(q.u, 0.9));
        const x = ax + Math.cos(ang) * q.v * W, y = ay + Math.sin(ang) * q.v * W;
        this.bucket(q.col).push(x - q.r / 2, y - q.r / 2, q.r);
      }
    }
    this.flush(c);

    // البرعم والبتلات
    const bud = inv(3.2, 4.4, t);
    if (bud > 0) {
      const sorted = this.petals.slice().sort((a, b) => a.layer - b.layer);
      for (const pd of sorted) {
        const st = 4.6 + pd.order * 0.42;
        const o = easeInOut(inv(st, st + 2.7, t)) * (1 + (t > 9.6 ? Math.sin((t - 9.6) * 1.1) * 0.025 : 0));
        pd.o = o;
        const ls = lerp(0.5, 1, o) * lerp(0.6, 1, easeOut(bud));
        this.petalAxis(pd, o, ls, t);
        const ax = pd.axis, N = ax.length - 1;
        for (const q of pd.parts) {
          const fi = q.u * N, i0 = Math.min(N - 1, Math.floor(fi)), fr = fi - i0;
          const a0 = ax[i0], a1 = ax[i0 + 1];
          const bx = lerp(a0[0], a1[0], fr), by = lerp(a0[1], a1[1], fr), ang = lerp(a0[2], a1[2], fr);
          const W = pd.L * pd.wf * 1.4 * pd.wScale * Math.sin(Math.PI * Math.pow(q.u, 0.75)) * (1 - 0.3 * q.u);
          let x = bx + Math.cos(ang) * q.v * W, y = by + Math.sin(ang) * q.v * W;
          const fp = easeOutQuint(clamp((bud - q.delay * 0.6) / 0.6, 0, 1));
          if (fp < 1) { x = lerp(q.sx, x, fp); y = lerp(q.sy, y, fp); }
          const tw = 0.75 + 0.25 * Math.sin(t * 3 + q.ph);
          const r = q.r * tw;
          this.bucket(q.col).push(x - r / 2, y - r / 2, r);
        }
      }
      this.flush(c);
      // الأسدية الذهبية
      const sa = easeOut(inv(7.4, 8.8, t));
      if (sa > 0) {
        c.strokeStyle = `rgba(255,214,150,${0.55 * sa})`;
        c.lineWidth = 0.9;
        for (const s of this.stamens) {
          const L = S * 0.19 * s.l * sa;
          const a = s.a + Math.sin(t * 0.8 + s.a) * 0.03;
          const ex = tx + Math.sin(a) * L, ey = ty - Math.cos(a) * L;
          c.beginPath();
          c.moveTo(tx, ty);
          c.quadraticCurveTo(tx + Math.sin(a) * L * 0.4, ty - Math.cos(a) * L * 0.7, ex, ey);
          c.stroke();
          c.drawImage(this.gold, ex - 5, ey - 5, 10, 10);
        }
      }
      // ذرات تتصاعد من الزهرة
      if (openAvg > 0.5) {
        const n = 26;
        for (let i = 0; i < n; i++) {
          const life = ((t * 0.18 + i / n) % 1);
          const x = tx + Math.sin(i * 7.3 + life * 4) * S * 0.12 * life;
          const y = ty - S * 0.1 - life * S * 0.42;
          c.globalAlpha = Math.sin(life * Math.PI) * (openAvg - 0.5) * 1.6;
          c.drawImage(i % 3 ? this.dot : this.gold, x - 4, y - 4, 8, 8);
        }
        c.globalAlpha = 1;
      }
    }

    // الورود المزروعة بلمستها
    for (const m of this.minis) {
      const age = t - m.born;
      const fade = 1 - inv(7.6, 9, age);
      if (m.stemFrom) {
        const sg = easeOut(inv(0, 0.6, age));
        const sx = m.stemFrom[0], sy = m.stemFrom[1];
        const steps = 26;
        for (let i = 0; i <= steps * sg; i++) {
          const tt = i / steps;
          const x = lerp(sx, m.x, tt) + Math.sin(tt * Math.PI) * 6;
          const y = lerp(sy, m.y, tt);
          this.bucket('#5eead4').push(x - 0.7, y - 0.7, 1.4 * fade);
        }
      }
      const o = easeOutBack(inv(m.stemFrom ? 0.45 : 0, m.stemFrom ? 1.6 : 1.1, age));
      if (o <= 0) continue;
      const L = m.size * o;
      for (const q of m.parts) {
        const a = m.rot + (q.k / m.nPet) * TAU + Math.sin(t + q.k) * 0.03;
        const W = L * 0.42 * Math.sin(Math.PI * Math.pow(q.u, 0.7));
        const x = m.x + Math.sin(a) * L * q.u + Math.cos(a) * q.v * W;
        const y = m.y - Math.cos(a) * L * q.u + Math.sin(a) * q.v * W;
        const r = q.r * fade;
        this.bucket(q.col).push(x - r / 2, y - r / 2, r);
      }
      c.globalAlpha = fade;
      c.drawImage(this.gold, m.x - 6, m.y - 6, 12, 12);
      c.globalAlpha = 1;
    }
    this.flush(c);
    c.globalCompositeOperation = 'source-over';
    // بتلات طائرة
    for (const m of this.floaters) {
      c.save();
      c.globalAlpha = Math.sin((m.life / m.max) * Math.PI) * 0.9;
      c.translate(m.x, m.y);
      c.rotate(m.rot);
      c.fillStyle = m.col;
      c.beginPath();
      c.ellipse(0, 0, m.s, m.s * 0.55, 0, 0, TAU);
      c.fill();
      c.restore();
    }
    c.globalAlpha = 1;
  }
}

/* ------------------------------------------------------------
   المشهد ٤ — النجوم تتجمع في عناق وقبلة الجبين
   ------------------------------------------------------------ */
const EMBRACE = {
  man: {
    rot: 0.5, pivot: [330, 400],
    paths: [
      'M392 214 C 410 248, 421 280, 419 302 C 418 311, 412 317, 414 325 C 423 343, 441 356, 447 367 C 448 375, 437 379, 425 381 C 427 387, 431 391, 433 397 C 431 401, 425 403, 423 406 C 429 409, 431 413, 429 417 C 426 423, 419 425, 419 433 C 421 441, 431 447, 429 457 C 425 469, 411 475, 397 477 C 381 479, 362 472, 350 462',
      'M396 478 C 398 505, 402 530, 406 560',
      'M392 214 C 380 170, 330 150, 284 166 C 240 182, 220 230, 228 280 C 232 312, 246 336, 262 352',
      'M386 210 C 360 194, 330 196, 306 216',
      'M330 168 C 296 182, 274 210, 268 244',
      'M268 368 C 278 402, 284 442, 282 480 C 274 512, 246 540, 206 560',
      'M326 338 C 340 322, 362 330, 360 352 C 358 372, 344 380, 334 370',
      'M384 300 C 394 292, 406 292, 415 297',
      'M390 322 C 396 330, 406 330, 412 324'
    ]
  },
  woman: {
    rot: -0.12, pivot: [520, 600], anchor: [454, 516],
    paths: [
      'M468 466 C 456 490, 449 516, 451 540 C 452 549, 457 553, 455 561 C 447 576, 433 589, 427 599 C 426 607, 437 611, 447 611 C 445 617, 442 621, 443 625 C 446 629, 451 629, 451 633 C 446 637, 443 639, 445 643 C 449 647, 455 649, 453 657 C 449 665, 443 669, 445 677 C 451 689, 463 695, 475 697 C 495 700, 515 696, 530 688',
      'M478 698 C 482 730, 488 765, 486 815',
      'M462 546 C 472 539, 485 539, 495 545',
      'M466 566 C 474 575, 486 575, 494 567',
      'M470 571 L 465 579', 'M478 574 L 475 582', 'M486 574 L 486 582',
      'M548 602 C 560 590, 578 598, 576 616 C 574 634, 562 640, 554 632',
      'M468 466 C 486 430, 548 414, 594 440 C 636 464, 652 516, 642 566 C 634 610, 642 650, 662 690 C 684 732, 706 772, 696 826',
      'M498 450 C 546 458, 584 494, 588 548 C 592 602, 610 642, 638 692 C 662 736, 670 782, 658 832',
      'M540 444 C 600 468, 628 520, 622 580 C 618 630, 646 676, 680 716 C 708 750, 722 792, 712 840',
      'M592 452 C 652 482, 682 542, 678 602 C 674 652, 702 702, 736 742',
      'M476 472 C 498 472, 520 482, 532 504',
      'M486 815 C 470 845, 442 866, 400 878'
    ]
  },
  extra: [],
  heart: { c: [640, 330], s: 1.25, d: 'M0 -10 C -10 -26, -34 -20, -30 0 C -27 14, -10 22, 0 32 C 10 22, 27 14, 30 0 C 34 -20, 10 -26, 0 -10 Z' }
};

function rotP(p, piv, a) {
  const s = Math.sin(a), c = Math.cos(a), dx = p[0] - piv[0], dy = p[1] - piv[1];
  return [piv[0] + dx * c - dy * s, piv[1] + dx * s + dy * c];
}

class StarsScene extends Scene {
  constructor(el) {
    super(el);
    this.duration = 8.2;
    this.text = new RevealText(['عسى ما ينتهي حبّنا أبداً']);
  }
  geometry() {
    const E = EMBRACE;
    const step = 1.5;
    const groups = [];
    const man = E.man.paths.map((d) => samplePath(d, step).map((p) => rotP(p, E.man.pivot, E.man.rot)));
    // موضع الشفاه بعد الدوران
    const lips = rotP([431, 399], E.man.pivot, E.man.rot);
    const wAnchor = rotP(E.woman.anchor, E.woman.pivot, E.woman.rot);
    const off = [lips[0] - wAnchor[0] + 7, lips[1] - wAnchor[1] + 4];
    const woman = E.woman.paths.map((d) => samplePath(d, step).map((p) => { const q = rotP(p, E.woman.pivot, E.woman.rot); return [q[0] + off[0], q[1] + off[1]]; }));
    const arm = E.extra.map((d) => samplePath(d, step));
    groups.push(...man.map((pts) => ({ pts, kind: 'line' })), ...woman.map((pts) => ({ pts, kind: 'line' })), ...arm.map((pts) => ({ pts, kind: 'line' })));
    const heart = samplePath(E.heart.d, step).map((p) => [E.heart.c[0] + p[0] * E.heart.s, E.heart.c[1] + p[1] * E.heart.s]);
    groups.push({ pts: heart, kind: 'heart' });
    return groups;
  }
  build() {
    const { w, h, dpr } = this;
    const groups = this.geometry();
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const g of groups) for (const p of g.pts) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
    const textSize = clamp(w * 0.068, 17, 34);
    this.text.build(w * 0.86, textSize, dpr);
    this.textY = h * 0.08 + this.text.size * 0.8;
    const top = h * 0.08 + this.text.height + h * 0.04;
    const f = Math.min((w * 0.84) / (x1 - x0), (h * 0.96 - top) / (y1 - y0));
    const ox = w / 2 - ((x0 + x1) / 2) * f;
    const oy = top - y0 * f + ((h * 0.96 - top) - (y1 - y0) * f) / 2;
    const T = (p) => [ox + p[0] * f, oy + p[1] * f];
    this.heartC = T(EMBRACE.heart.c);
    this.lines = groups.map((g) => ({ kind: g.kind, pts: g.pts.map(T) }));
    let total = 0;
    for (const g of this.lines) for (let i = 1; i < g.pts.length; i++) total += Math.hypot(g.pts[i][0] - g.pts[i - 1][0], g.pts[i][1] - g.pts[i - 1][1]);
    const N = Math.round(clamp((w * h) / 210, 650, 1500));
    const spacing = total / N;
    const stars = [];
    const rng = mulberry32(11);
    for (const g of this.lines) {
      const pts = resample(g.pts, spacing);
      for (const p of pts) {
        const big = rng() < 0.08;
        stars.push({
          tx: p[0] + (rng() - 0.5) * 2.2, ty: p[1] + (rng() - 0.5) * 2.2,
          x: 0, y: 0, vx: 0, vy: 0, heart: g.kind === 'heart',
          act: 0.5 + ((p[0] / w) * 0.9 + (p[1] / h) * 0.5) * 0.9 + rng() * 0.9,
          r: big ? rand(1.6, 2.4) : rand(0.6, 1.4), big, ph: rng() * TAU, sp: rand(1.5, 4),
          col: rng() < 0.25 ? 1 : rng() < 0.5 ? 2 : 0
        });
      }
    }
    this.stars = stars;
    this.bg = Array.from({ length: Math.round(clamp((w * h) / 2600, 70, 180)) }, () => ({ x: rand(0, w), y: rand(0, h), r: rand(0.3, 1.1), ph: rand(0, TAU), sp: rand(0.5, 2) }));
    this.sprites = [glowDot('rgba(255,214,232,0.95)', 10), glowDot('rgba(214,170,255,0.95)', 10), glowDot('rgba(255,170,205,0.95)', 10)];
    this.spark = sparkleSprite('rgba(255,220,240,0.9)', 22);
    this.linePaths = this.lines.map((g) => { const p = new Path2D(); p.moveTo(g.pts[0][0], g.pts[0][1]); for (let i = 1; i < g.pts.length; i++) p.lineTo(g.pts[i][0], g.pts[i][1]); return { p, kind: g.kind }; });
  }
  onReset() {
    for (const s of this.stars || []) { s.x = rand(0, this.w); s.y = rand(0, this.h); s.vx = rand(-8, 8); s.vy = rand(-8, 8); }
  }
  restore() { this.onReset(); }
  onTap(p) {
    if (!this.started) return;
    for (const s of this.stars) {
      const dx = s.x - p.x, dy = s.y - p.y, d = Math.hypot(dx, dy);
      const R = this.w * 0.22;
      if (d < R) { const f = (1 - d / R) * 520; s.vx += (dx / (d || 1)) * f; s.vy += (dy / (d || 1)) * f; }
    }
  }
  update(dt) {
    const t = this.t;
    const beat = t > 5 ? heartbeat(t - 5, 1.1) : 0;
    const [hx, hy] = this.heartC;
    const hs = 1 + beat * 0.14;
    const R = this.w * 0.12;
    const { x: px, y: py, in: pin } = this.ptr;
    for (const s of this.stars) {
      if (t >= s.act) {
        let tx = s.tx, ty = s.ty;
        if (s.heart) { tx = hx + (s.tx - hx) * hs; ty = hy + (s.ty - hy) * hs; }
        const k = 16, damp = 6.2;
        s.vx += ((tx - s.x) * k - s.vx * damp) * dt;
        s.vy += ((ty - s.y) * k - s.vy * damp) * dt;
      } else {
        s.vx *= 0.99; s.vy *= 0.99;
      }
      if (pin) {
        const dx = s.x - px, dy = s.y - py, d = Math.hypot(dx, dy);
        if (d < R && d > 0.01) { const f = Math.pow(1 - d / R, 2) * 2600; s.vx += (dx / d) * f * dt; s.vy += (dy / d) * f * dt; }
      }
      s.x += s.vx * dt; s.y += s.vy * dt;
    }
  }
  render() {
    const c = this.begin();
    const { t, w, h } = this;
    const [hx, hy] = this.heartC;
    c.globalCompositeOperation = 'lighter';
    for (const b of this.bg) {
      c.globalAlpha = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * b.sp + b.ph));
      const r = b.r * 4;
      c.drawImage(this.sprites[0], b.x - r, b.y - r, r * 2, r * 2);
    }
    // الخطوط المضيئة تحت النجوم
    const la = easeOut(inv(3.6, 5.6, t));
    if (la > 0) {
      c.lineJoin = 'round'; c.lineCap = 'round';
      const beat = t > 5 ? heartbeat(t - 5, 1.1) : 0;
      for (const lp of this.linePaths) {
        c.save();
        if (lp.kind === 'heart') { const s = 1 + beat * 0.14; c.translate(hx, hy); c.scale(s, s); c.translate(-hx, -hy); }
        c.globalAlpha = 0.07 * la;
        c.strokeStyle = '#ff9ccf'; c.lineWidth = 5; c.stroke(lp.p);
        c.globalAlpha = 0.32 * la;
        c.strokeStyle = '#ffe3f0'; c.lineWidth = 0.9; c.stroke(lp.p);
        c.restore();
      }
      if (beat > 0) {
        const hg = c.createRadialGradient(hx, hy, 0, hx, hy, w * 0.12);
        hg.addColorStop(0, `rgba(255,120,180,${0.25 * beat * la})`);
        hg.addColorStop(1, 'rgba(0,0,0,0)');
        c.globalAlpha = 1;
        c.fillStyle = hg;
        c.fillRect(hx - w * 0.12, hy - w * 0.12, w * 0.24, w * 0.24);
      }
    }
    for (const s of this.stars) {
      const tw = 0.55 + 0.45 * Math.sin(t * s.sp + s.ph);
      c.globalAlpha = 0.45 + tw * 0.55;
      const r = s.r * 3.4 * (0.8 + tw * 0.35);
      c.drawImage(this.sprites[s.col], s.x - r, s.y - r, r * 2, r * 2);
      if (s.big && tw > 0.75) {
        const rs = 9 * (tw - 0.75) * 4;
        c.globalAlpha = (tw - 0.75) * 3;
        c.drawImage(this.spark, s.x - rs, s.y - rs, rs * 2, rs * 2);
      }
    }
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
    this.text.draw(c, w / 2, this.textY, inv(5.4, 7.6, t));
  }
}

/* ------------------------------------------------------------
   المشهد ٥ — مطر النور والمظلة
   ------------------------------------------------------------ */
function drawUmbrella(g) {
  const { blob, tube, path } = Shape;
  path(g, 'M410 226 C 418 146, 482 108, 540 112 C 600 116, 660 154, 676 210 C 660 200, 640 198, 626 210 C 610 196, 586 192, 572 206 C 554 190, 528 190, 514 206 C 496 192, 470 194, 458 212 C 442 202, 422 206, 410 226 Z');
  blob(g, 541, 104, 4.5, 9, 0.2);
  tube(g, [[536, 116], [490, 230], [440, 352]], [3.4, 3.4]);
  tube(g, [[440, 352], [432, 374], [444, 384], [456, 372]], [3.4, 3.2, 3, 2.8]);
}
function drawRainCouple(g) {
  const { blob, tube, path } = Shape;
  // عمود الإنارة
  path(g, 'M148 968 L 232 968 L 224 944 L 212 932 L 208 862 L 172 862 L 168 932 L 156 944 Z');
  tube(g, [[190, 870], [190, 560], [190, 262]], [10, 9, 8]);
  blob(g, 190, 640, 15, 7, 0);
  blob(g, 190, 860, 21, 8, 0);
  blob(g, 190, 470, 13, 6, 0);
  path(g, 'M172 246 L 208 246 L 200 266 L 180 266 Z');
  path(g, 'M160 248 L 220 248 L 232 176 L 148 176 Z');
  path(g, 'M138 180 L 242 180 L 206 150 L 174 150 Z');
  path(g, 'M172 152 C 174 128, 206 128, 208 152 Z');
  blob(g, 190, 120, 6, 9, 0);
  // الشاب: يتمسك بالعمود ويمدّ المظلة
  head(g, 'man', 318, 392, 0.62, 1, -0.08);
  tube(g, [[314, 428], [316, 442], [318, 456]], [12, 13]);
  path(g, 'M280 458 C 298 446, 346 446, 362 460 C 370 500, 362 548, 358 598 L 292 604 C 288 556, 272 502, 280 458 Z');
  tube(g, [[288, 468], [244, 470], [206, 438]], [16, 13, 11]);
  blob(g, 199, 434, 12, 10, 0);
  tube(g, [[354, 470], [400, 432], [436, 362]], [16, 13, 11]);
  blob(g, 440, 356, 11, 10, 0);
  tube(g, [[302, 596], [250, 668], [212, 738]], [24, 19, 14]);
  path(g, 'M216 726 L 196 756 L 186 750 L 202 722 Z');
  tube(g, [[346, 598], [384, 734], [378, 902]], [24, 19, 14]);
  path(g, 'M362 896 L 408 902 C 416 912, 410 922, 396 922 L 360 920 Z');
  drawUmbrella(g);
  // الصبية تحت المظلة
  head(g, 'woman', 582, 436, 0.66, -1, 0.06, ['bun']);
  tube(g, [[586, 470], [587, 484], [588, 498]], [9.5, 10.5]);
  path(g, 'M564 500 C 576 490, 602 490, 614 502 C 618 528, 610 550, 608 570 L 568 570 C 564 550, 556 528, 564 500 Z');
  path(g, 'M568 562 L 608 562 C 636 602, 674 680, 688 762 C 644 780, 534 780, 490 762 C 506 682, 540 602, 568 562 Z');
  tube(g, [[566, 510], [546, 548], [540, 584]], [10, 8, 6.5]);
  tube(g, [[612, 510], [634, 546], [612, 572]], [10, 8, 6.5]);
  tube(g, [[574, 770], [572, 852], [570, 924]], [11, 8.5, 6.5]);
  tube(g, [[606, 770], [614, 852], [620, 924]], [11, 8.5, 6.5]);
  path(g, 'M556 920 L 578 920 L 580 934 L 554 934 Z');
  path(g, 'M612 920 L 634 922 L 638 934 L 614 934 Z');
}
const LANTERN = [190, 212];

class RainScene extends Scene {
  constructor(el) {
    super(el);
    this.duration = 9.6;
    this.text = new RevealText(['معك… حتى المطر بصير أكثر أمآن و دفئ']);
    this.angle = 0.2; this.targetAngle = 0.2;
  }
  build() {
    const { w, h, dpr } = this;
    const m = renderMask(drawRainCouple, 800, 1000, 0.5);
    const bb = maskBBox(m);
    const textSize = clamp(w * 0.062, 16, 32);
    this.text.build(w * 0.86, textSize, dpr);
    this.textY = h * 0.07 + this.text.size * 0.8;
    const top = h * 0.07 + this.text.height + h * 0.035;
    const f = Math.min((w * 0.86) / bb.w, (h * 0.955 - top) / bb.h);
    const ox = w / 2 - (bb.x + bb.w / 2) * f;
    const oy = h * 0.955 - (bb.y + bb.h) * f;
    const T = (p) => [ox + p[0] * f, oy + p[1] * f];
    this.lantern = T(LANTERN);
    this.groundY = oy + 968 * f;
    // نقاط الهدف لقطرات المطر
    const N = Math.round(clamp((w * h) / 78, 2000, 5200));
    const pts = sampleMask(m, N, mulberry32(5)).map(T);
    const yTop = oy + bb.y * f, yBot = oy + (bb.y + bb.h) * f;
    const stops = [[255, 166, 216], [222, 140, 236], [176, 146, 250], [140, 168, 255]];
    const colAt = (u) => { const k = u * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(k)), fr = k - i; const a = stops[i], b = stops[i + 1]; return `rgb(${Math.round(lerp(a[0], b[0], fr))},${Math.round(lerp(a[1], b[1], fr))},${Math.round(lerp(a[2], b[2], fr))})`; };
    this.palette = Array.from({ length: 12 }, (_, i) => colAt(i / 11));
    this.drops = pts.map(([x, y]) => {
      const u = clamp((y - yTop) / (yBot - yTop), 0, 1);
      return { x, y, ci: Math.round(u * 11), r: rand(0.8, 1.9), ph: rand(0, TAU), spawn: 0.7 + Math.pow(Math.random(), 0.85) * 4.6, v: rand(820, 1180) };
    });
    // قمة المظلة لكل عمود (لتوقيف المطر فوقها)
    const um = mk(w, h);
    const ug = um.getContext('2d', { willReadFrequently: true });
    ug.setTransform(f, 0, 0, f, ox, oy);
    ug.fillStyle = '#fff';
    Shape.path(ug, 'M410 226 C 418 146, 482 108, 540 112 C 600 116, 660 154, 676 210 L 410 226 Z');
    const ud = ug.getImageData(0, 0, w, h).data;
    this.canopy = new Float32Array(w).fill(Infinity);
    for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) if (ud[(y * w + x) * 4 + 3] > 127) { this.canopy[x] = y; break; }
    // المطر المحيط
    const nR = Math.round(clamp((w * h) / 2600, 60, 170));
    this.rain = Array.from({ length: nR }, () => this.newStreak(true));
    this.splashes = [];
    this.ripples = [];
    this.white = glowDot('rgba(255,236,248,0.95)', 10);
    this.warm = glowDot('rgba(255,214,160,0.95)', 16);
  }
  newStreak(anywhere) {
    const { w, h } = this;
    return { x: rand(-w * 0.1, w * 1.25), y: anywhere ? rand(-h, h) : rand(-h * 0.3, -10), len: rand(10, 26), v: rand(560, 900), a: rand(0.15, 0.55), col: Math.random() < 0.5 ? '255,170,220' : '200,160,255' };
  }
  onReset() { this.splashes = []; this.ripples = []; }
  onMove(p) { this.targetAngle = 0.2 + ((p.x - this.w / 2) / this.w) * -0.5; }
  onTap(p) {
    if (!this.started) return;
    this.ripples.push({ x: p.x, y: Math.min(p.y, this.groundY), t: 0 });
    for (let i = 0; i < 14; i++) { const a = rand(-Math.PI, 0); const sp = rand(40, 140); this.splashes.push({ x: p.x, y: p.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: rand(0.4, 0.8) }); }
  }
  update(dt) {
    if (!this.ptr.in) this.targetAngle = 0.2;
    this.angle += (this.targetAngle - this.angle) * Math.min(1, dt * 3);
    const sx = -Math.sin(this.angle), sy = Math.cos(this.angle);
    const umbrellaOn = this.t > 5.2;
    for (let i = 0; i < this.rain.length; i++) {
      const r = this.rain[i];
      r.x += sx * r.v * dt; r.y += sy * r.v * dt;
      const xi = Math.round(r.x);
      if (umbrellaOn && xi >= 0 && xi < this.w && r.y > this.canopy[xi] && r.y < this.canopy[xi] + 40) {
        this.splashes.push({ x: r.x, y: this.canopy[xi], vx: rand(-40, 40), vy: rand(-60, -20), life: 0, max: 0.35 });
        this.rain[i] = this.newStreak(false);
      } else if (r.y > this.h + 30 || r.x < -40) this.rain[i] = this.newStreak(false);
    }
    for (const s of this.splashes) { s.life += dt; s.vy += 260 * dt; s.x += s.vx * dt; s.y += s.vy * dt; }
    this.splashes = this.splashes.filter((s) => s.life < s.max);
    for (const r of this.ripples) r.t += dt;
    this.ripples = this.ripples.filter((r) => r.t < 1.4);
  }
  render() {
    const c = this.begin();
    const { t, w, h } = this;
    const formed = easeOut(inv(5.6, 7.2, t));
    // ضوء الفانوس الدافئ
    if (formed > 0) {
      const [lx, ly] = this.lantern;
      const fl = 0.92 + Math.sin(t * 7) * 0.03 + Math.sin(t * 2.3) * 0.04;
      const R = w * 0.42;
      const lg = c.createRadialGradient(lx, ly, 0, lx, ly, R);
      lg.addColorStop(0, `rgba(255,214,160,${0.42 * formed * fl})`);
      lg.addColorStop(0.25, `rgba(255,170,150,${0.14 * formed * fl})`);
      lg.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = lg;
      c.fillRect(lx - R, ly - R, R * 2, R * 2);
      // انعكاس على الأرض
      const pg = c.createRadialGradient(w / 2, this.groundY, 0, w / 2, this.groundY, w * 0.5);
      pg.addColorStop(0, `rgba(200,150,255,${0.18 * formed})`);
      pg.addColorStop(1, 'rgba(0,0,0,0)');
      c.save();
      c.translate(0, this.groundY);
      c.scale(1, 0.18);
      c.translate(0, -this.groundY);
      c.fillStyle = pg;
      c.fillRect(0, this.groundY - w * 0.5, w, w);
      c.restore();
    }
    c.globalCompositeOperation = 'lighter';
    // المطر المحيط
    const sx = -Math.sin(this.angle), sy = Math.cos(this.angle);
    c.lineCap = 'round';
    c.lineWidth = 1;
    for (const r of this.rain) {
      const gr = c.createLinearGradient(r.x, r.y, r.x - sx * r.len, r.y - sy * r.len);
      gr.addColorStop(0, `rgba(${r.col},${r.a})`);
      gr.addColorStop(1, `rgba(${r.col},0)`);
      c.strokeStyle = gr;
      c.beginPath(); c.moveTo(r.x, r.y); c.lineTo(r.x - sx * r.len, r.y - sy * r.len); c.stroke();
    }
    // القطرات التي تستقر لتشكّل المشهد
    const dsx = -Math.sin(0.2), dsy = Math.cos(0.2);
    const buckets = this.palette.map(() => []);
    const falling = [];
    for (const d of this.drops) {
      if (t < d.spawn) continue;
      const travel = (d.y + 30) / dsy;
      const arrive = d.spawn + travel / d.v;
      if (t < arrive) {
        const rem = (arrive - t) * d.v;
        falling.push(d.x - dsx * rem, d.y - dsy * rem, d.ci);
      } else {
        const age = t - arrive;
        const tw = 0.8 + 0.2 * Math.sin(t * 2 + d.ph);
        const r = d.r * tw * (age < 0.25 ? 1 + (0.25 - age) * 4 : 1);
        buckets[d.ci].push(d.x - r / 2, d.y - r / 2, r);
      }
    }
    for (let i = 0; i < buckets.length; i++) {
      const arr = buckets[i];
      if (!arr.length) continue;
      c.fillStyle = this.palette[i];
      for (let j = 0; j < arr.length; j += 3) c.fillRect(arr[j], arr[j + 1], arr[j + 2], arr[j + 2]);
    }
    c.lineWidth = 1.2;
    for (let j = 0; j < falling.length; j += 3) {
      const x = falling[j], y = falling[j + 1];
      c.strokeStyle = this.palette[falling[j + 2]];
      c.globalAlpha = 0.75;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x - dsx * 16, y - dsy * 16); c.stroke();
    }
    c.globalAlpha = 1;
    for (const s of this.splashes) {
      c.globalAlpha = 1 - s.life / s.max;
      c.drawImage(this.white, s.x - 3, s.y - 3, 6, 6);
    }
    c.globalAlpha = 1;
    if (formed > 0) {
      const [lx, ly] = this.lantern;
      c.globalAlpha = formed;
      c.drawImage(this.warm, lx - 22, ly - 22, 44, 44);
      c.globalAlpha = 1;
    }
    c.globalCompositeOperation = 'source-over';
    for (const r of this.ripples) {
      const p = r.t / 1.4;
      c.strokeStyle = `rgba(255,200,235,${0.5 * (1 - p)})`;
      c.lineWidth = 1;
      for (let k = 0; k < 2; k++) {
        const rr = (p * 70 + k * 18) * (w / 400);
        c.beginPath(); c.ellipse(r.x, r.y, rr, rr * 0.32, 0, 0, TAU); c.stroke();
      }
    }
    this.text.draw(c, w / 2, this.textY, inv(7.0, 9.4, t));
  }
}

/* ============================================================
   طبقة المؤثرات العامة (انفجار البوابة، بتلات وقلوب)
   ============================================================ */
const FX = {
  canvas: null, ctx: null, parts: [], blooms: [], w: 0, h: 0, dpr: 1,
  init() {
    this.canvas = document.querySelector('.fx-layer');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    this.spark = glowDot('rgba(255,190,220,0.95)', 14);
  },
  resize() {
    this.w = window.innerWidth; this.h = window.innerHeight; this.dpr = DPR();
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
  },
  bloom(x, y) {
    this.blooms.push({ x, y, t: 0 });
    for (let i = 0; i < 70; i++) {
      const a = rand(0, TAU), sp = rand(80, 520);
      this.parts.push({ type: 'spark', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: rand(0.8, 1.8), s: rand(2, 5) });
    }
    for (let i = 0; i < 18; i++) {
      const a = rand(0, TAU), sp = rand(60, 260);
      this.parts.push({ type: 'petal', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, rot: rand(0, TAU), vr: rand(-5, 5), life: 0, max: rand(1.6, 2.8), s: rand(5, 9), col: pick(['#f7d6e0', '#e8b4b8', '#ff9fc4', '#ffd1dc']) });
    }
  },
  burst(kind, x, y) {
    if (reducedMotion) return;
    const W = this.w, H = this.h;
    const n = kind === 0 ? 90 : 70;
    for (let i = 0; i < n; i++) {
      const fromTop = Math.random() < 0.55;
      const px = fromTop ? rand(0, W) : x + rand(-20, 20);
      const py = fromTop ? rand(-H * 0.3, -10) : y + rand(-10, 10);
      const a = rand(-Math.PI, 0), sp = fromTop ? rand(20, 80) : rand(150, 520);
      let type, col;
      if (kind === 0) { type = Math.random() < 0.5 ? 'heart' : 'petal'; col = pick(['#ffffff', '#f7d6e0', '#e8b4b8', '#ff9fc4']); }
      else if (kind === 1) { type = Math.random() < 0.75 ? 'petal' : 'heart'; col = pick(['#ff5f95', '#ff8fb3', '#ffd1dc', '#e11d48', '#fb7185']); }
      else { type = Math.random() < 0.6 ? 'heart' : 'spark'; col = pick(['#f7d6e0', '#e8b4b8', '#c4a1ff', '#ffd1dc']); }
      this.parts.push({ type, x: px, y: py, vx: fromTop ? rand(-20, 20) : Math.cos(a) * sp, vy: fromTop ? sp : Math.sin(a) * sp, rot: rand(0, TAU), vr: rand(-3, 3), life: 0, max: fromTop ? rand(3, 5.5) : rand(2, 3.4), s: type === 'heart' ? rand(6, 12) : rand(5, 10), col, ph: rand(0, TAU) });
    }
  },
  active() { return this.parts.length > 0 || this.blooms.length > 0; },
  tick(dt) {
    if (!this.active()) return false;
    const c = this.ctx;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    c.clearRect(0, 0, this.w, this.h);
    for (const b of this.blooms) {
      b.t += dt;
      const p = b.t / 1.6;
      const R = easeOut(Math.min(1, p)) * Math.hypot(this.w, this.h);
      const a = 1 - p;
      if (a <= 0) continue;
      c.globalCompositeOperation = 'lighter';
      const g = c.createRadialGradient(b.x, b.y, 0, b.x, b.y, Math.max(1, R));
      g.addColorStop(0, `rgba(255,236,244,${0.85 * a})`);
      g.addColorStop(0.22, `rgba(255,160,200,${0.42 * a})`);
      g.addColorStop(0.6, `rgba(160,60,110,${0.16 * a})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g;
      c.fillRect(0, 0, this.w, this.h);
    }
    this.blooms = this.blooms.filter((b) => b.t < 1.6);
    for (const p of this.parts) {
      p.life += dt;
      if (p.type === 'spark') { p.vx *= 0.96; p.vy *= 0.96; p.vy += 30 * dt; }
      else { p.vx *= 0.985; p.vy = p.vy * 0.985 + 46 * dt; p.vx += Math.sin(p.life * 2.4 + (p.ph || 0)) * 18 * dt; p.rot += p.vr * dt; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      const a = Math.min(1, (p.max - p.life) * 2) * Math.min(1, p.life * 8);
      if (a <= 0) continue;
      c.globalAlpha = a;
      if (p.type === 'spark') {
        c.globalCompositeOperation = 'lighter';
        c.drawImage(this.spark, p.x - p.s * 2, p.y - p.s * 2, p.s * 4, p.s * 4);
      } else {
        c.globalCompositeOperation = 'source-over';
        c.save();
        c.translate(p.x, p.y);
        c.rotate(p.rot);
        c.fillStyle = p.col;
        c.beginPath();
        if (p.type === 'petal') c.ellipse(0, 0, p.s, p.s * 0.55, 0, 0, TAU);
        else {
          const s = p.s / 16;
          c.moveTo(0, 4 * s);
          c.bezierCurveTo(-10 * s, -6 * s, -18 * s, 4 * s, 0, 16 * s);
          c.bezierCurveTo(18 * s, 4 * s, 10 * s, -6 * s, 0, 4 * s);
        }
        c.fill();
        c.restore();
      }
    }
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
    this.parts = this.parts.filter((p) => p.life < p.max && p.y < this.h + 60);
    if (!this.active()) c.clearRect(0, 0, this.w, this.h);
    return true;
  }
};

/* ============================================================
   الصوت: موسيقى خلفية (ملف أو مولّدة) + الأسطوانة
   ============================================================ */
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

const Sound = {
  ctx: null, master: null, musicBus: null, vinylBus: null, rev: null,
  musicOn: false, musicEl: null, gen: null, duck: 1,
  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      const c = this.ctx;
      this.master = c.createGain();
      this.master.gain.value = 1;
      const comp = c.createDynamicsCompressor();
      comp.threshold.value = -18; comp.ratio.value = 3;
      this.master.connect(comp).connect(c.destination);
      this.rev = c.createConvolver();
      this.rev.buffer = this.impulse(3.6, 2.6);
      const wet = c.createGain(); wet.gain.value = 0.5;
      this.rev.connect(wet).connect(this.master);
      this.musicBus = c.createGain(); this.musicBus.gain.value = 0;
      this.musicBus.connect(this.master);
      this.vinylBus = c.createGain(); this.vinylBus.gain.value = 0.9;
      this.vinylBus.connect(this.master);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return true;
  },
  impulse(sec, decay) {
    const c = this.ctx, n = Math.floor(c.sampleRate * sec), b = c.createBuffer(2, n, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay); }
    return b;
  },
  fadeMusic(to, sec = 1.6) {
    if (!this.ctx) return;
    const g = this.musicBus.gain, now = this.ctx.currentTime;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(to, now + sec);
  },
  startMusic() {
    if (!this.ensure()) return;
    this.musicOn = true;
    if (CONFIG.music && !this.musicEl && !this.musicFailed) {
      const el = new Audio();
      el.src = CONFIG.music;
      el.loop = true;
      el.preload = 'auto';
      el.crossOrigin = 'anonymous';
      try {
        const src = this.ctx.createMediaElementSource(el);
        src.connect(this.musicBus);
      } catch (e) { /* يكمل بدون توجيه */ }
      el.addEventListener('error', () => { this.musicFailed = true; this.musicEl = null; if (this.musicOn) this.startGen(); }, { once: true });
      this.musicEl = el;
    }
    if (this.musicEl) this.musicEl.play().catch(() => { this.musicFailed = true; this.musicEl = null; this.startGen(); });
    else this.startGen();
    this.fadeMusic(CONFIG.musicVolume * this.duck, 2.4);
    UI.syncSound();
  },
  stopMusic() {
    this.musicOn = false;
    this.fadeMusic(0, 0.8);
    setTimeout(() => { if (!this.musicOn) { if (this.musicEl) this.musicEl.pause(); if (this.gen) this.gen.stop(); } }, 900);
    UI.syncSound();
  },
  startGen() {
    if (!this.gen) this.gen = new Ambient(this.ctx, this.musicBus, this.rev);
    this.gen.start();
  },
  setDuck(on) {
    this.duck = on ? 0.18 : 1;
    if (this.musicOn) this.fadeMusic(CONFIG.musicVolume * this.duck, 1.2);
  }
};

class Ambient {
  constructor(ctx, out, rev) {
    this.ctx = ctx;
    this.out = ctx.createGain();
    this.out.gain.value = 0.9;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 2600; lp.Q.value = 0.4;
    this.out.connect(lp);
    lp.connect(out);
    const send = ctx.createGain(); send.gain.value = 0.9;
    lp.connect(send).connect(rev);
    this.bar = 0;
    this.timer = null;
    this.BAR = 4.8;
    // Fmaj9 → Em7 → Dm9 → Cmaj7(add9)
    this.CHORDS = [[53, 57, 60, 64, 67], [52, 55, 59, 62, 66], [50, 53, 57, 60, 64], [48, 52, 55, 59, 62]];
  }
  start() {
    if (this.timer) return;
    this.next = this.ctx.currentTime + 0.15;
    this.timer = setInterval(() => this.schedule(), 300);
    this.schedule();
  }
  stop() { clearInterval(this.timer); this.timer = null; }
  schedule() {
    while (this.next < this.ctx.currentTime + 1.5) { this.playBar(this.next); this.next += this.BAR; this.bar++; }
  }
  voice(f, t0, dur, gain, type, attack, release, detune = 0) {
    const c = this.ctx;
    const o = c.createOscillator();
    o.type = type; o.frequency.value = f; o.detune.value = detune;
    const g = c.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + attack);
    g.gain.setValueAtTime(gain, t0 + Math.max(attack, dur - release));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(this.out);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  bell(f, t0, gain) {
    const c = this.ctx;
    [[1, 1], [2.01, 0.28], [3.98, 0.08]].forEach(([m, a]) => {
      const o = c.createOscillator();
      o.type = 'sine'; o.frequency.value = f * m;
      const g = c.createGain();
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(gain * a, t0 + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.6 / m);
      o.connect(g).connect(this.out);
      o.start(t0); o.stop(t0 + 2.7);
    });
  }
  playBar(t0) {
    const ch = this.CHORDS[this.bar % this.CHORDS.length];
    const D = this.BAR + 1.6;
    ch.slice(0, 4).forEach((n) => {
      this.voice(midi(n), t0, D, 0.045, 'sine', 1.8, 2.2, -4);
      this.voice(midi(n), t0, D, 0.03, 'triangle', 2.2, 2.2, 5);
    });
    this.voice(midi(ch[0] - 12), t0, D, 0.07, 'sine', 1.2, 2);
    const pool = ch.map((n) => n + 12).concat(ch.slice(1, 4).map((n) => n + 24));
    for (let k = 0; k < 8; k++) {
      if (Math.random() < 0.5) this.bell(midi(pick(pool)), t0 + (k * this.BAR) / 8 + rand(0, 0.06), 0.05 + Math.random() * 0.03);
    }
  }
}

// لحن صندوق موسيقى صغير للأسطوانة
const Vinyl = {
  playing: false, el: null, timer: null, noise: null,
  MELODY: [[76, 1], [79, 1], [84, 1], [83, 1], [81, 1], [79, 1], [81, 1], [79, 1], [76, 1], [74, 3],
           [76, 1], [79, 1], [84, 1], [86, 1], [84, 1], [83, 1], [81, 1], [83, 1], [79, 1], [84, 3],
           [81, 1], [84, 1], [88, 1], [86, 1], [84, 1], [83, 1], [84, 1], [81, 1], [79, 1], [77, 3],
           [76, 1], [77, 1], [79, 1], [81, 1], [79, 1], [76, 1], [74, 1], [76, 1], [71, 1], [72, 4]],
  toggle() { this.playing ? this.stop() : this.play(); },
  play() {
    if (!Sound.ensure()) return;
    this.playing = true;
    Sound.setDuck(true);
    if (CONFIG.vinylAudio) {
      if (!this.el) {
        this.el = new Audio(CONFIG.vinylAudio);
        this.el.addEventListener('ended', () => this.stop());
        this.el.addEventListener('error', () => { this.el = null; CONFIG.vinylAudio = ''; if (this.playing) this.playBox(); }, { once: true });
        try { Sound.ctx.createMediaElementSource(this.el).connect(Sound.vinylBus); } catch (e) { /* */ }
      }
      this.el.play().catch(() => { this.el = null; this.playBox(); });
    } else this.playBox();
    this.crackle(true);
    UI.syncVinyl();
  },
  stop() {
    this.playing = false;
    if (this.el) this.el.pause();
    clearTimeout(this.timer);
    this.timer = null;
    this.crackle(false);
    Sound.setDuck(false);
    UI.syncVinyl();
  },
  playBox() {
    const c = Sound.ctx;
    const beat = 0.42;
    let t0 = c.currentTime + 0.9;
    const total = this.MELODY.reduce((s, n) => s + n[1], 0) * beat;
    const out = c.createGain();
    out.gain.value = 0.9;
    out.connect(Sound.vinylBus);
    const send = c.createGain(); send.gain.value = 0.6;
    out.connect(send).connect(Sound.rev);
    this.boxOut = out;
    const schedule = () => {
      if (!this.playing) return;
      let t = t0;
      for (const [n, d] of this.MELODY) {
        [[1, 0.14], [2, 0.04], [3.01, 0.02], [5.4, 0.008]].forEach(([m, a]) => {
          const o = c.createOscillator();
          o.type = 'sine'; o.frequency.value = midi(n) * m; o.detune.value = rand(-3, 3);
          const g = c.createGain();
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(a, t + 0.004);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6 / Math.sqrt(m));
          o.connect(g).connect(out);
          o.start(t); o.stop(t + 1.7);
        });
        t += d * beat;
      }
      [[48, 0], [43, 4], [45, 8], [41, 12], [48, 16], [43, 20], [41, 24], [43, 28], [48, 32], [45, 36]].forEach(([n, b]) => {
        const o = c.createOscillator();
        o.type = 'sine'; o.frequency.value = midi(n);
        const g = c.createGain();
        const st = t0 + b * beat;
        g.gain.setValueAtTime(0, st);
        g.gain.linearRampToValueAtTime(0.05, st + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, st + beat * 3.6);
        o.connect(g).connect(out);
        o.start(st); o.stop(st + beat * 4);
      });
      t0 += total + 1.4;
      this.timer = setTimeout(schedule, (t0 - c.currentTime - 1.2) * 1000);
    };
    schedule();
  },
  crackle(on) {
    const c = Sound.ctx;
    if (!c) return;
    if (on) {
      const n = c.sampleRate * 2, b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * 0.012 + (Math.random() < 0.0006 ? (Math.random() * 2 - 1) * 0.5 : 0);
      const s = c.createBufferSource();
      s.buffer = b; s.loop = true;
      const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 900;
      const g = c.createGain(); g.gain.value = 0.35;
      s.connect(hp).connect(g).connect(Sound.vinylBus);
      s.start();
      this.noise = s;
    } else if (this.noise) { try { this.noise.stop(); } catch (e) { /* */ } this.noise = null; }
    if (!on && this.boxOut) { const g = this.boxOut.gain; g.setTargetAtTime(0, c.currentTime, 0.15); this.boxOut = null; }
  }
};

/* ============================================================
   الواجهة والتفاعلات
   ============================================================ */
const UI = {
  syncSound() {
    const b = document.querySelector('.sound-toggle');
    if (!b) return;
    b.setAttribute('aria-pressed', String(Sound.musicOn));
    b.setAttribute('aria-label', Sound.musicOn ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى');
  },
  syncVinyl() {
    const card = document.querySelector('.vinyl-card');
    const btn = card.querySelector('.btn-vinyl');
    card.classList.toggle('is-playing', Vinyl.playing);
    btn.setAttribute('aria-pressed', String(Vinyl.playing));
    btn.querySelector('.ico').textContent = Vinyl.playing ? '❚❚' : '▶';
    btn.querySelector('.lbl').textContent = Vinyl.playing ? 'أوقفي الأسطوانة' : 'شغّلي الأسطوانة';
    card.querySelector('.vinyl-status').textContent = Vinyl.playing ? 'عم تدور… وقلبي معها' : 'جاهزة للدوران';
  }
};

const SCENE_TYPES = { heart: HeartScene, rose: RoseScene, bloom: BloomScene, stars: StarsScene, rain: RainScene };
const scenes = {};
let opened = false;

function splitWords(el, start, step) {
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = '';
  words.forEach((w, i) => {
    const s = document.createElement('span');
    s.className = 'w';
    s.style.setProperty('--d', `${start + i * step}ms`);
    s.textContent = w;
    el.appendChild(s);
    if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
  });
  return start + words.length * step;
}

function grainTexture() {
  const c = mk(160, 160), g = c.getContext('2d');
  const img = g.createImageData(160, 160);
  for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  g.putImageData(img, 0, 0);
  document.querySelector('.grain').style.backgroundImage = `url(${c.toDataURL('image/png')})`;
}

function setupGate() {
  const gate = document.getElementById('gate');
  let d = 350;
  gate.querySelectorAll('[data-words]').forEach((el, i) => { d = splitWords(el, d, i === 0 ? 120 : 95) + 180; });
  const open = (x, y) => {
    if (opened) return;
    opened = true;
    gate.style.setProperty('--x', `${x}px`);
    gate.style.setProperty('--y', `${y}px`);
    gate.classList.add('is-opening');
    if (!reducedMotion) FX.bloom(x, y);
    Sound.startMusic();
    document.documentElement.classList.remove('is-locked');
    document.documentElement.classList.add('is-open');
    const st = document.querySelector('.sound-toggle');
    st.hidden = false;
    setTimeout(() => { gate.classList.add('is-gone'); gate.setAttribute('aria-hidden', 'true'); }, 2300);
    const hero = document.getElementById('hero');
    hero.setAttribute('tabindex', '-1');
    hero.focus({ preventScroll: true });
    checkScenes();
  };
  gate.addEventListener('click', (e) => open(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2));
  gate.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(window.innerWidth / 2, window.innerHeight / 2); }
  });
  gate.focus({ preventScroll: true });
}

function setupScenes() {
  document.querySelectorAll('.stage[data-scene]').forEach((el) => {
    const S = SCENE_TYPES[el.dataset.scene];
    scenes[el.dataset.scene] = new S(el);
  });
  const ro = new ResizeObserver((entries) => {
    for (const e of entries) {
      const s = scenes[e.target.dataset.scene];
      if (s && (s.started || s.visible)) s.resize();
    }
  });
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const s = scenes[e.target.dataset.scene];
      s.visible = e.isIntersecting;
      s.ratio = e.intersectionRatio;
      if (e.isIntersecting && !s.built) s.resize();
    }
    checkScenes();
  }, { threshold: [0, 0.2, 0.35, 0.6] });
  Object.values(scenes).forEach((s) => { io.observe(s.el); ro.observe(s.el); });
  document.querySelectorAll('[data-replay]').forEach((b) => b.addEventListener('click', () => {
    const s = scenes[b.dataset.replay];
    if (!s.built) s.resize();
    s.started = true;
    s.reset();
  }));
  document.querySelector('.btn-plant').addEventListener('click', () => {
    const s = scenes.bloom;
    if (!s.started) s.start();
    s.plant();
  });
}

function checkScenes() {
  if (!opened) return;
  for (const s of Object.values(scenes)) if (s.visible && (s.ratio || 0) >= 0.3 && !s.started) s.start();
}

let last = 0;
const glow = { x: -999, y: -999, cx: -999, cy: -999, on: false };
function loop(now) {
  const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
  last = now;
  for (const s of Object.values(scenes)) if (s.visible && s.started) s.tick(dt);
  FX.tick(dt);
  if (glow.on) {
    glow.cx += (glow.x - glow.cx) * Math.min(1, dt * 7);
    glow.cy += (glow.y - glow.cy) * Math.min(1, dt * 7);
    glowEl.style.transform = `translate3d(${glow.cx}px, ${glow.cy}px, 0)`;
  }
  spinRecord(dt);
  requestAnimationFrame(loop);
}

let glowEl;
function setupAmbient() {
  grainTexture();
  glowEl = document.querySelector('.cursor-glow');
  const move = (e) => {
    glow.x = e.clientX; glow.y = e.clientY;
    if (!glow.on) { glow.cx = glow.x; glow.cy = glow.y; glow.on = true; glowEl.classList.add('is-on'); }
  };
  if (!reducedMotion) {
    window.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') move(e); }, { passive: true });
    window.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') {
        move(e);
        glowEl.classList.add('is-on');
        clearTimeout(glow.tm);
        glow.tm = setTimeout(() => { glowEl.classList.remove('is-on'); glow.on = false; }, 900);
      }
    }, { passive: true });
  }
  const bar = document.querySelector('.progress span');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? clamp(window.scrollY / max, 0, 1) : 0})`;
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  const st = document.querySelector('.sound-toggle');
  st.addEventListener('click', () => (Sound.musicOn ? Sound.stopMusic() : Sound.startMusic()));
  document.addEventListener('visibilitychange', () => {
    if (!Sound.ctx) return;
    if (document.hidden) Sound.ctx.suspend();
    else if (Sound.musicOn || Vinyl.playing) Sound.ctx.resume();
  });
  window.addEventListener('resize', () => FX.resize());
}

/* ---------- العداد والأسابيع ---------- */
function setupDays() {
  const dots = document.querySelector('.day-dots');
  for (let i = 1; i <= 30; i++) {
    const li = document.createElement('li');
    li.textContent = toAr(i);
    li.setAttribute('aria-label', `اليوم ${toAr(i)}`);
    dots.appendChild(li);
  }
  const ranges = [[1, 7], [8, 14], [15, 21], [22, 30]];
  const tabs = [...document.querySelectorAll('.week-tabs [role="tab"]')];
  const panel = document.getElementById('week-panel');
  const text = panel.querySelector('.week-text');
  const select = (i, focus) => {
    tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
    panel.setAttribute('aria-labelledby', tabs[i].id);
    if (focus) tabs[i].focus();
    text.classList.add('is-swapping');
    setTimeout(() => { text.textContent = CONFIG.weeks[i]; text.classList.remove('is-swapping'); }, reducedMotion ? 0 : 200);
    [...dots.children].forEach((li, k) => li.classList.toggle('is-lit', k + 1 >= ranges[i][0] && k + 1 <= ranges[i][1]));
  };
  text.textContent = CONFIG.weeks[0];
  [...dots.children].forEach((li, k) => li.classList.toggle('is-lit', k < 7));
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i));
    t.addEventListener('keydown', (e) => {
      let n = null;
      if (e.key === 'ArrowLeft') n = (i + 1) % tabs.length;
      if (e.key === 'ArrowRight') n = (i - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') n = 0;
      if (e.key === 'End') n = tabs.length - 1;
      if (n !== null) { e.preventDefault(); select(n, true); }
    });
  });
  // عدّ تصاعدي للرقم ٣٠
  const num = document.querySelector('.days-num');
  if (!reducedMotion) {
    num.textContent = toAr(0);
    const io = new IntersectionObserver((es) => {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (now) => {
        const p = clamp((now - t0) / 1800, 0, 1);
        num.textContent = toAr(Math.round(easeOutQuint(p) * 30));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.6 });
    io.observe(num);
  }
}

/* ---------- الأسطوانة ---------- */
const rec = { a: 0, w: 0, el: null };
function spinRecord(dt) {
  if (!rec.el) return;
  const target = Vinyl.playing && !reducedMotion ? 200 : 0;
  rec.w += (target - rec.w) * Math.min(1, dt * (Vinyl.playing ? 1.4 : 1.1));
  if (Math.abs(rec.w) < 0.05 && !Vinyl.playing) return;
  rec.a = (rec.a + rec.w * dt) % 360;
  rec.el.style.transform = `rotate(${rec.a}deg)`;
}
function setupVinyl() {
  rec.el = document.querySelector('.record');
  document.querySelector('.vinyl-title').textContent = CONFIG.vinylTitle;
  document.querySelector('.btn-vinyl').addEventListener('click', () => Vinyl.toggle());
}

/* ---------- الظرف ---------- */
function setupEnvelope() {
  const stage = document.querySelector('.env-stage');
  const seal = stage.querySelector('.seal');
  const paper = stage.querySelector('.letter-paper');
  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, reducedMotion ? 0 : ms));
  seal.addEventListener('click', () => {
    if (stage.dataset.state !== 'closed') return;
    const r = seal.getBoundingClientRect();
    if (!reducedMotion) {
      for (let i = 0; i < 26; i++) {
        const a = rand(0, TAU), sp = rand(80, 300);
        FX.parts.push({ type: Math.random() < 0.5 ? 'spark' : 'heart', x: r.left + r.width / 2, y: r.top + r.height / 2, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, rot: rand(0, TAU), vr: rand(-3, 3), life: 0, max: rand(1, 2), s: rand(4, 8), col: pick(['#f7d6e0', '#e8b4b8', '#ff9fc4']), ph: rand(0, TAU) });
      }
    }
    stage.dataset.state = 'opening';
    later(() => stage.classList.add('flap-behind'), 420);
    later(() => { stage.dataset.state = 'open'; }, 760);
    later(() => {
      stage.dataset.state = 'reading';
      paper.focus({ preventScroll: true });
      const pr = paper.getBoundingClientRect();
      if (pr.top < 0 || pr.top > window.innerHeight * 0.4) paper.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    }, 1900);
  });
  stage.querySelector('.btn-reseal').addEventListener('click', () => {
    timers.forEach(clearTimeout); timers = [];
    stage.classList.remove('flap-behind');
    stage.dataset.state = 'closed';
    seal.focus({ preventScroll: true });
    stage.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
  });
}

/* ---------- رد لين + واتساب ---------- */
function setupReply() {
  const box = document.querySelector('.choices');
  const choices = [...box.querySelectorAll('.choice')];
  const answer = document.querySelector('.answer');
  const text = answer.querySelector('.answer-text');
  const wa = answer.querySelector('.btn-whatsapp');
  const copyBtn = answer.querySelector('.btn-copy');
  const note = answer.querySelector('.copy-note');
  let message = '';
  choices.forEach((b, i) => b.addEventListener('click', () => {
    choices.forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
    box.classList.add('has-choice');
    const r = b.getBoundingClientRect();
    FX.burst(i, r.left + r.width / 2, r.top + r.height / 2);
    text.textContent = CONFIG.replies[i];
    message = CONFIG.shareMessage(b.textContent.trim());
    const num = String(CONFIG.whatsappNumber || '').replace(/\D/g, '');
    wa.href = `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
    note.textContent = '';
    if (answer.hidden) { answer.hidden = false; }
    else { answer.style.animation = 'none'; void answer.offsetWidth; answer.style.animation = ''; }
    const ar = answer.getBoundingClientRect();
    if (ar.bottom > window.innerHeight) answer.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' });
  }));
  copyBtn.addEventListener('click', async () => {
    let ok = false;
    try { await navigator.clipboard.writeText(message); ok = true; }
    catch (e) {
      const ta = document.createElement('textarea');
      ta.value = message; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0;top:0';
      document.body.appendChild(ta); ta.select();
      try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
      ta.remove();
    }
    note.textContent = ok ? 'انتسخت ✓ الصقيها عند أنس بالواتساب' : 'ما قدرت أنسخ تلقائياً، اضغطي زر الواتساب أحسن ♥️';
  });
}

/* ============================================================
   الإقلاع
   ============================================================ */
async function boot() {
  FX.init();
  setupAmbient();
  setupDays();
  setupVinyl();
  setupEnvelope();
  setupReply();
  setupGate();
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load('700 40px "Aref Ruqaa"', 'أحبكِ'),
        document.fonts.load('700 20px "Amiri"', 'حبيبتي'),
        document.fonts.load('500 14px "Readex Pro"', 'love')
      ]),
      new Promise((r) => setTimeout(r, 3000))
    ]);
  } catch (e) { /* نكمل بخطوط النظام */ }
  setupScenes();
  requestAnimationFrame(loop);
  window.__lin = { scenes, FX, Sound, Vinyl };
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
