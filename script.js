/* ============================================================
   Live Time (UTC+3)
   ============================================================ */
function updateLiveTime() {
  const d = new Date(),
    u = d.getTime() + d.getTimezoneOffset() * 6e4,
    t = new Date(u + 108e5),
    h = String(t.getHours()).padStart(2, "0"),
    m = String(t.getMinutes()).padStart(2, "0"),
    s = String(t.getSeconds()).padStart(2, "0");
  const el = document.getElementById("liveTime");
  if (el) el.textContent = `${h}:${m}:${s} UTC+3`;
}
updateLiveTime();
setInterval(updateLiveTime, 1000);

/* ============================================================
   Firebase (Firestore) - Candles Public + Trades Per User
   ============================================================ */
import { getApps, initializeApp, getApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  writeBatch,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

/* نفس config اللي عندك في HTML (Fallback) */
const firebaseConfig = {
  apiKey: "AIzaSyBOUqLixfphg3b8hajc4hkwV-VJmldGBVw",
  authDomain: "randers-c640b.firebaseapp.com",
  projectId: "randers-c640b",
  storageBucket: "randers-c640b.firebasestorage.app",
  messagingSenderId: "391496092929",
  appId: "1:391496092929:web:58208b4eb3e6f9a8571f00",
  measurementId: "G-DBDSVVF7PS"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/* ============================================================
   Helpers
   ============================================================ */
const CANDLE_LIMIT = 2000;          // المطلوب: آخر 2000 شمعة فقط
const CANDLE_CHUNK_SIZE = 500;      // 4 chunks = 2000

function pairToKey(pair) {
  return String(pair || "EUR/USD").trim().replace(/\s+/g, "").replace("/", "_");
}

/* خريطة أعلام زي اللي عندك في UI */
const CUR_TO_FLAG = {
  AED: "ae", CNY: "cn", AUD: "au", CAD: "ca", CHF: "ch", BHD: "bh",
  EUR: "eu", RUB: "ru", USD: "us", KES: "ke", LBP: "lb", QAR: "qa",
  TRY: "tr", SYP: "sy", EGP: "eg", INR: "in", IRR: "ir"
};
function flagsFromPair(pair) {
  const ab = String(pair || "EUR/USD").split("/");
  const f0 = (CUR_TO_FLAG[ab[0]] || ab[0] || "us").toLowerCase();
  const f1 = (CUR_TO_FLAG[ab[1]] || ab[1] || "us").toLowerCase();
  return [f0, f1];
}

/* payouts (اختياري) */
const PAIR_PAYOUT = {
  "AED/CNY": 0.91, "AUD/CAD": 0.88, "AUD/CHF": 0.92, "BHD/CNY": 0.86,
  "EUR/RUB": 0.77, "EUR/USD": 0.92, "KES/USD": 0.84, "LBP/USD": 0.79,
  "QAR/CNY": 0.83, "USD/CHF": 0.89, "SYP/TRY": 0.87, "EGP/USD": 0.78,
  "USD/INR": 0.90
};
function payoutForPair(pair) {
  return +PAIR_PAYOUT[pair] || 0.85;
}

function showLoading(on) {
  const ov = document.getElementById("loadingOverlay");
  if (!ov) return;
  ov.classList.toggle("show", !!on);
}

/* ضغط بيانات الشمعة لتقليل الحجم */
function packCandle(c) {
  return { t: c.timestamp, o: c.open, h: c.high, l: c.low, c: c.close };
}
function unpackCandle(x) {
  return { timestamp: x.t, open: x.o, high: x.h, low: x.l, close: x.c };
}

/* ============================================================
   Firestore: Candles (Public Per Pair)
   ============================================================ */
async function loadPairCandles(pair) {
  const key = pairToKey(pair);
  const chunksCol = collection(db, "qt_pairs", key, "candle_chunks");
  const snap = await getDocs(chunksCol);

  if (snap.empty) return null;

  const chunks = [];
  snap.forEach(d => {
    const data = d.data() || {};
    chunks.push({ idx: +data.idx || 0, candles: Array.isArray(data.candles) ? data.candles : [] });
  });
  chunks.sort((a, b) => a.idx - b.idx);

  const packed = chunks.flatMap(ch => ch.candles);
  const last = packed.slice(-CANDLE_LIMIT);
  return last.map(unpackCandle);
}

let _saveDebounce = null;
async function savePairCandles(pair, candles) {
  const key = pairToKey(pair);
  const last = (Array.isArray(candles) ? candles : []).slice(-CANDLE_LIMIT);
  const packed = last.map(packCandle);

  const chunks = [];
  for (let i = 0; i < packed.length; i += CANDLE_CHUNK_SIZE) {
    chunks.push(packed.slice(i, i + CANDLE_CHUNK_SIZE));
  }
  while (chunks.length < Math.ceil(CANDLE_LIMIT / CANDLE_CHUNK_SIZE)) chunks.push([]);

  const batch = writeBatch(db);

  // meta
  batch.set(doc(db, "qt_pairs", key), {
    pair: String(pair),
    updatedAt: serverTimestamp(),
    candleLimit: CANDLE_LIMIT
  }, { merge: true });

  // chunks c0..c3
  for (let i = 0; i < 4; i++) {
    batch.set(doc(db, "qt_pairs", key, "candle_chunks", "c" + i), {
      idx: i,
      candles: chunks[i] || [],
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  await batch.commit();
}

function scheduleSaveCandles(pair, candles) {
  if (_saveDebounce) clearTimeout(_saveDebounce);
  _saveDebounce = setTimeout(() => {
    savePairCandles(pair, candles).catch(() => {});
  }, 1200);
}

/* ============================================================
   AdvancedTradingChart (مع Pair Switching + 2000 candles)
   ============================================================ */
class AdvancedTradingChart {
  constructor() {
    this.plot = document.getElementById("plot");
    this.canvas = document.getElementById("chartCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.timeLabels = document.getElementById("timeLabels");
    this.candleTimer = document.getElementById("candleTimer");
    this.priceLine = document.getElementById("priceLine");
    this.priceScaleLabels = document.getElementById("priceScaleLabels");
    this.currentPriceEl = document.getElementById("currentPrice");

    this.pair = "EUR/USD";

    this.candles = [];
    this.currentCandle = null;

    this.maxCandles = CANDLE_LIMIT;

    this.basePrice = 1.95;
    this.currentPrice = 1.9518;
    this.seed = 11001;
    this.digits = 5;
    this.priceRange = { min: 1.9, max: 2 };

    this.baseSpacing = 12;
    this.zoom = 1;
    this.targetZoom = 1;
    this.minZoom = 0.425;
    this.maxZoom = 2.25;
    this.zoomEase = 0.28;

    this.targetOffsetX = 0;
    this.offsetX = 0;
    this.panEase = 0.38;
    this.velocity = 0;

    this.drag = 0;
    this.dragStartX = 0;
    this.dragStartOffset = 0;
    this.lastDragX = 0;
    this.lastDragTime = 0;

    this.pinch = 0;
    this.p0 = 0;
    this.pMidX = 0;
    this.pMidY = 0;

    this.timeframe = 60_000;
    this.t0 = Math.floor(Date.now() / this.timeframe) * this.timeframe;

    this.smin = null;
    this.smax = null;
    this.sre = 0.088;
    this._fr = 0;

    this.markers = [];
    this.tradeMarkerIds = new Set();

    this.selectedTime = 5; // seconds

    this.setup();
    this.initEvents();
    this.startRealtime();
    this.loop();
  }

  /* ===== Pair API ===== */
  async switchPair(pair) {
    pair = String(pair || "EUR/USD");
    if (pair === this.pair) return;

    showLoading(true);

    // احفظ شموع الزوج الحالي قبل التبديل (آخر 2000)
    try { scheduleSaveCandles(this.pair, this.candles); } catch (_) {}

    this.pair = pair;
    this.tradeMarkerIds.clear();
    this.markers = [];

    // تحميل شموع من Firestore (آخر 2000 فقط)
    try {
      const loaded = await loadPairCandles(pair);
      if (loaded && loaded.length) {
        this.setCandles(loaded);
      } else {
        // لو مفيش بيانات: ولّد تاريخ 2000 شمعة ثم احفظه
        this.generateInitialCandles();
        scheduleSaveCandles(pair, this.candles);
      }
    } catch (e) {
      // fallback
      this.generateInitialCandles();
    }

    // بعد ما الزوج يتغير: خلي مدير الصفقات يبدّل listeners لهذا الزوج
    if (window.__qtTrades && typeof window.__qtTrades.onPairChanged === "function") {
      window.__qtTrades.onPairChanged(pair);
    }

    showLoading(false);
  }

  setCandles(arr) {
    this.candles = (Array.isArray(arr) ? arr : []).slice(-this.maxCandles);
    this.currentCandle = null;

    // اضبط السعر الحالي
    if (this.candles.length) {
      this.currentPrice = this.candles[this.candles.length - 1].close;
      this.basePrice = this.currentPrice;
      this.t0 = Math.floor(Date.now() / this.timeframe) * this.timeframe;
    }

    this.snapToLive();
    this.updateTimeLabels();
    this.updatePriceRange();
    this.smin = this.priceRange.min;
    this.smax = this.priceRange.max;
    this.updatePriceScale();
    this.updatePriceLabel();

    // السعر العام للتاريخ (لـ tradeHistory)
    window.__qt_price = this.currentPrice;
  }

  generateInitialCandles() {
    this.candles = [];
    this.currentCandle = null;

    // سعر ابتدائي "ثابت" حسب اسم الزوج (عشان كل زوج يبقى مختلف)
    const key = pairToKey(this.pair);
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    this.seed = 10000 + (h % 90000);

    const base = 1 + ((h % 10_000) / 10_000); // 1.0000 -> 1.9999
    this.basePrice = +base.toFixed(this.digits);

    let p = this.basePrice;
    let t = Date.now() - this.maxCandles * this.timeframe;
    for (let i = 0; i < this.maxCandles; i++) {
      const c = this.genCandle(t, p);
      this.candles.push(c);
      p = c.close;
      t += this.timeframe;
    }
    this.currentPrice = this.candles[this.candles.length - 1].close;
    window.__qt_price = this.currentPrice;

    this.snapToLive();
    this.updateTimeLabels();
    this.updatePriceRange();
    this.smin = this.priceRange.min;
    this.smax = this.priceRange.max;
    this.updatePriceScale();
    this.updatePriceLabel();
  }

  /* ===== Drawing Setup ===== */
  setup() {
    const dpr = window.devicePixelRatio || 1,
      r = this.plot.getBoundingClientRect();
    this.w = r.width;
    this.h = r.height - 24;

    this.canvas.width = this.w * dpr;
    this.canvas.height = this.h * dpr;
    this.canvas.style.width = this.w + "px";
    this.canvas.style.height = this.h + "px";
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);

    this.updatePriceLabel();
    this.updatePriceScale();
    this.updateTimeLabels();
  }

  rnd(s) { const x = Math.sin(s) * 1e4; return x - Math.floor(x); }
  rndG(s) {
    const u1 = this.rnd(s), u2 = this.rnd(s + 1e5);
    return Math.sqrt(-2 * Math.log(u1 + 1e-5)) * Math.cos(2 * Math.PI * u2);
  }

  genCandle(t, o) {
    const s = this.seed + Math.floor(t / this.timeframe),
      vb = 8e-4, tb = 5e-5,
      r1 = this.rndG(s), r2 = this.rndG(s + 1), r3 = this.rndG(s + 2),
      r4 = this.rnd(s + 3), r5 = this.rnd(s + 4), r6 = this.rnd(s + 5),
      v = vb * (0.7 + Math.abs(r1) * 0.8),
      tr = tb * r2 * 0.6,
      dir = r3 > 0 ? 1 : -1,
      tc = o + (dir * v + tr),
      rg = v * (0.2 + r4 * 0.6),
      hm = rg * (0.3 + r5 * 0.7),
      lm = rg * (0.3 + (1 - r5) * 0.7),
      c = +(tc + (r6 - 0.5) * v * 0.1).toFixed(this.digits),
      op = +o.toFixed(this.digits);

    return {
      open: op,
      close: c,
      high: +Math.max(op, c, op + hm, c + hm).toFixed(this.digits),
      low: +Math.min(op, c, op - lm, c - lm).toFixed(this.digits),
      timestamp: t
    };
  }

  getSpacing() { return this.baseSpacing * this.zoom; }
  getCandleWidth() { return this.getSpacing() * 0.8; }
  getMinOffset() { return this.w / 2 - this.candles.length * this.getSpacing(); }
  getMaxOffset() { return this.w / 2; }

  clampPan() {
    const mn = this.getMinOffset(), mx = this.getMaxOffset();
    this.targetOffsetX = Math.max(mn, Math.min(mx, this.targetOffsetX));
    this.offsetX = Math.max(mn, Math.min(mx, this.offsetX));
  }
  snapToLive() {
    this.targetOffsetX = this.getMinOffset();
    this.offsetX = this.targetOffsetX;
    this.velocity = 0;
    this.clampPan();
  }
  updatePan() {
    const diff = this.targetOffsetX - this.offsetX;
    if (Math.abs(diff) > 0.003) this.offsetX += diff * this.panEase;
    else this.offsetX = this.targetOffsetX;

    if (Math.abs(this.velocity) > 0.01) {
      this.targetOffsetX += this.velocity;
      this.velocity *= 0.972;
      this.clampPan();
    } else this.velocity = 0;
  }
  tickZoom() {
    const d = this.targetZoom - this.zoom;
    Math.abs(d) > 0.0001 ? this.zoom += d * this.zoomEase : this.zoom = this.targetZoom;
  }

  tickSR() {
    const r = this.priceRange;
    if (this.smin === null) { this.smin = r.min; this.smax = r.max; return; }
    this.smin += (r.min - this.smin) * this.sre;
    this.smax += (r.max - this.smax) * this.sre;
  }

  applyZoomAround(mx, my, sc) {
    const oz = this.targetZoom, nz = Math.max(this.minZoom, Math.min(this.maxZoom, oz * sc));
    if (Math.abs(nz - oz) < 1e-6) return;
    const idx = this.xToIndex(mx);
    this.targetZoom = nz;
    this.zoom = nz;
    const nx = mx - idx * this.getSpacing();
    this.targetOffsetX = nx;
    this.offsetX = nx;
    this.clampPan();
    this.updateTimeLabels();
  }

  indexToX(i) { return this.offsetX + i * this.getSpacing(); }
  xToIndex(x) { return (x - this.offsetX) / this.getSpacing(); }

  getPriceRange() {
    const mn = this.smin !== null ? this.smin : this.priceRange.min,
      mx = this.smax !== null ? this.smax : this.priceRange.max;
    return { min: mn, max: mx };
  }

  niceNum(v, rnd) {
    const e = Math.floor(Math.log10(v)), p = Math.pow(10, e), f = v / p;
    let nf;
    if (rnd) {
      if (f < 1.5) nf = 1; else if (f < 3) nf = 2; else if (f < 7) nf = 5; else nf = 10;
    } else {
      if (f <= 1) nf = 1; else if (f <= 2) nf = 2; else if (f <= 5) nf = 5; else nf = 10;
    }
    return nf * p;
  }

  calcNiceGrid() {
    const r = this.getPriceRange(), rng = r.max - r.min,
      d = this.niceNum(rng / 7, 0),
      g0 = Math.floor(r.min / d) * d,
      g1 = Math.ceil(r.max / d) * d;
    return { min: g0, max: g1, step: d, count: Math.round((g1 - g0) / d) };
  }

  drawGrid() {
    const { min, step, count } = this.calcNiceGrid();

    for (let i = 0; i <= count; i++) {
      const p = min + i * step, y = this.priceToY(p);
      if (y < -5 || y > this.h + 5) continue;
      const mj = i % 5 === 0;
      this.ctx.strokeStyle = mj ? "rgba(255,215,0,.12)" : "rgba(255,255,255,.05)";
      this.ctx.lineWidth = mj ? 1 : 0.8;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y + 0.5);
      this.ctx.lineTo(this.w, y + 0.5);
      this.ctx.stroke();
    }

    const visC = this.w / this.getSpacing(), targetL = 9,
      stepC = Math.max(1, Math.round(visC / targetL)),
      s = Math.floor(this.xToIndex(0)),
      e = Math.ceil(this.xToIndex(this.w));

    for (let i = s; i <= e; i++) {
      if (i % stepC !== 0) continue;
      const x = this.indexToX(i);
      if (x < -5 || x > this.w + 5) continue;
      const mj = i % Math.round(stepC * 5) === 0;
      this.ctx.strokeStyle = mj ? "rgba(255,215,0,.12)" : "rgba(255,255,255,.05)";
      this.ctx.lineWidth = mj ? 1 : 0.8;
      this.ctx.beginPath();
      this.ctx.moveTo(x + 0.5, 0);
      this.ctx.lineTo(x + 0.5, this.h);
      this.ctx.stroke();
    }
  }

  updateTimeLabels() {
    const tl = this.timeLabels;
    if (!tl) return;
    tl.innerHTML = "";

    const visC = this.w / this.getSpacing(), targetL = 9,
      stepC = Math.max(1, Math.round(visC / targetL)),
      s = Math.floor(this.xToIndex(0)),
      e = Math.ceil(this.xToIndex(this.w)),
      tS = this.candles.length ? this.candles[0].timestamp : this.t0;

    for (let i = s; i <= e; i++) {
      if (i % stepC !== 0) continue;
      const x = this.indexToX(i);
      if (x < 5 || x > this.w - 5) continue;
      const t = tS + i * this.timeframe, d = new Date(t),
        hh = String(d.getHours()).padStart(2, "0"),
        mm = String(d.getMinutes()).padStart(2, "0");

      const lb = document.createElement("div");
      lb.className = "timeLabel";
      (i % Math.round(stepC * 5) === 0) && lb.classList.add("major");
      lb.style.left = x + "px";
      lb.textContent = `${hh}:${mm}`;
      tl.appendChild(lb);
    }
  }

  updatePriceScale() {
    const { min, step, count } = this.calcNiceGrid();
    let h = "";
    for (let i = 0; i <= count; i++) {
      const p = min + i * step, y = this.priceToY(p);
      if (y < -8 || y > this.h + 8) continue;
      const mj = i % 5 === 0;
      h += `<div class="pLabel${mj ? " major" : ""}" style="top:${y}px">${p.toFixed(this.digits)}</div>`;
    }
    if (this.priceScaleLabels) this.priceScaleLabels.innerHTML = h;
  }

  updatePriceLabel() {
    const py = this.priceToY(this.currentPrice);
    if (this.priceLine) this.priceLine.style.top = py + "px";
    if (this.currentPriceEl) {
      this.currentPriceEl.style.top = py + "px";
      this.currentPriceEl.textContent = this.currentPrice.toFixed(this.digits);
    }
  }

  updateCandleTimer() {
    if (!this.currentCandle || !this.candleTimer) return;
    const n = Date.now(), e = n - this.t0, r = this.timeframe - e, s = Math.floor(r / 1e3);
    this.candleTimer.textContent = s >= 0 ? s : 0;
    const cx = this.indexToX(this.candles.length);
    this.candleTimer.style.left = cx + 15 + "px";
    this.candleTimer.style.top = "10px";
    this.candleTimer.style.display = "block";
  }

  priceToY(p) {
    const r = this.getPriceRange(), n = (p - r.min) / (r.max - r.min);
    return this.h * (1 - n);
  }

  drawCandle(c, x, glow) {
    const oy = this.priceToY(c.open),
      cy = this.priceToY(c.close),
      hy = this.priceToY(c.high),
      ly = this.priceToY(c.low),
      b = c.close >= c.open,
      w = this.getCandleWidth();

    this.ctx.strokeStyle = b ? "#0f0" : "#f00";
    this.ctx.lineWidth = Math.max(1, 0.18 * w);

    this.ctx.beginPath();
    this.ctx.moveTo(x, hy);
    this.ctx.lineTo(x, ly);
    this.ctx.stroke();

    const bh = Math.max(1, Math.abs(cy - oy)),
      bt = Math.min(oy, cy),
      g = this.ctx.createLinearGradient(x, bt, x, bt + bh);

    if (b) { g.addColorStop(0, "#0f0"); g.addColorStop(0.5, "#0f0"); g.addColorStop(1, "#0c0"); }
    else { g.addColorStop(0, "#f00"); g.addColorStop(0.5, "#f00"); g.addColorStop(1, "#c00"); }

    this.ctx.fillStyle = g;

    if (glow) { this.ctx.shadowColor = b ? "rgba(0,255,0,.8)" : "rgba(255,0,0,.8)"; this.ctx.shadowBlur = 12; }
    this.ctx.fillRect(x - w / 2, bt, w, bh);
    if (glow) this.ctx.shadowBlur = 0;
  }

  /* ===== Trade Markers ===== */
  addTradeMarker(trade) {
    if (!trade || !trade.id) return;
    if (this.tradeMarkerIds.has(trade.id)) return;

    const cTs = Math.floor((trade.openedAt || Date.now()) / this.timeframe) * this.timeframe;
    let idx = -1;
    for (let i = 0; i < this.candles.length; i++) {
      if (this.candles[i].timestamp === cTs) { idx = i; break; }
    }
    if (idx < 0) idx = Math.max(0, this.candles.length - 1);

    this.markers.push({
      type: trade.dir === "up" ? "buy" : "sell",
      ts: trade.openedAt || Date.now(),
      price: +trade.entry,
      candleIndex: idx,
      candleTimestamp: cTs,
      tradeId: trade.id
    });
    this.tradeMarkerIds.add(trade.id);
  }

  drawMarker(m) {
    let actualIdx = m.candleIndex;
    for (let i = 0; i < this.candles.length; i++) {
      if (this.candles[i].timestamp === m.candleTimestamp) { actualIdx = i; break; }
    }
    const x = this.indexToX(actualIdx);
    if (x < -200 || x > this.w + 50) return;

    const y = this.priceToY(m.price),
      w = this.getCandleWidth(),
      ib = m.type === "buy",
      cl = ib ? "#16a34a" : "#ff3b3b",
      r = 5.5;

    this.ctx.save();

    const lsx = x;
    this.ctx.shadowColor = cl;
    this.ctx.shadowBlur = 9;
    this.ctx.fillStyle = cl;
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    this.ctx.fillStyle = "#fff";
    this.ctx.save();
    this.ctx.translate(x, y);
    if (!ib) this.ctx.rotate(Math.PI);

    this.ctx.beginPath();
    this.ctx.moveTo(0, -2.8);
    this.ctx.lineTo(-2, 0.8);
    this.ctx.lineTo(-0.65, 0.8);
    this.ctx.lineTo(-0.65, 2.8);
    this.ctx.lineTo(0.65, 2.8);
    this.ctx.lineTo(0.65, 0.8);
    this.ctx.lineTo(2, 0.8);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();

    const lx = lsx + w / 2 + 3,
      lw = Math.min(95, this.w - lx - 22);

    this.ctx.strokeStyle = ib ? "rgba(22,163,74,.7)" : "rgba(255,59,59,.7)";
    this.ctx.lineWidth = 1.2;

    this.ctx.beginPath();
    this.ctx.moveTo(lsx + w / 2, y);
    this.ctx.lineTo(lx, y);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(lx, y);
    this.ctx.lineTo(lx + lw, y);
    this.ctx.stroke();

    const ex = lx + lw, er = 5;
    this.ctx.strokeStyle = cl;
    this.ctx.lineWidth = 2;
    this.ctx.fillStyle = "#fff";
    this.ctx.beginPath();
    this.ctx.arc(ex, y, er, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.strokeStyle = ib ? "rgba(22,163,74,.5)" : "rgba(255,59,59,.5)";
    this.ctx.lineWidth = 1.2;
    this.ctx.beginPath();
    this.ctx.moveTo(ex + er, y);
    this.ctx.lineTo(ex + 65, y);
    this.ctx.stroke();

    this.ctx.restore();
  }

  /* ===== Draw Loop ===== */
  draw() {
    this.tickZoom();
    this.updatePan();
    this.updatePriceRange();
    this.tickSR();

    this.ctx.clearRect(0, 0, this.w, this.h);
    this.drawGrid();

    for (let i = 0; i < this.candles.length; i++) {
      const x = this.indexToX(i);
      if (x < -60 || x > this.w + 60) continue;
      this.drawCandle(this.candles[i], x, 0);
    }

    if (this.currentCandle && (!this.candles.length || this.currentCandle.timestamp !== this.candles[this.candles.length - 1].timestamp)) {
      const lx = this.indexToX(this.candles.length);
      if (lx >= -60 && lx <= this.w + 60) this.drawCandle(this.currentCandle, lx, 1);
    }

    for (let mk of this.markers) this.drawMarker(mk);

    if (++this._fr % 2 === 0) {
      this.updatePriceScale();
      this.updateTimeLabels();
    }

    this.updatePriceLabel();
    this.updateCandleTimer();
  }

  stepTowards(c, t, m) {
    const d = t - c;
    return Math.abs(d) <= m ? t : c + Math.sign(d) * m;
  }

  updateCurrentCandle() {
    if (!this.currentCandle) {
      const lp = this.candles.length ? this.candles[this.candles.length - 1].close : this.currentPrice;
      this.currentCandle = this.genCandle(this.t0, lp);
      this.currentCandle.close = lp;
      this.currentCandle.high = Math.max(this.currentCandle.open, this.currentCandle.close);
      this.currentCandle.low = Math.min(this.currentCandle.open, this.currentCandle.close);
      return;
    }

    const n = Date.now(),
      r = this.rnd(this.seed + n),
      dir = (r - 0.5) * 4e-4,
      t = this.currentCandle.close + dir,
      ms = 8e-4 * 0.18,
      nc = +this.stepTowards(this.currentCandle.close, t, ms).toFixed(this.digits);

    this.currentCandle.close = nc;
    this.currentCandle.high = +Math.max(this.currentCandle.high, nc).toFixed(this.digits);
    this.currentCandle.low = +Math.min(this.currentCandle.low, nc).toFixed(this.digits);
    this.currentPrice = nc;

    // السعر الحالي للجميع (tradeHistory بيقرأه)
    window.__qt_price = this.currentPrice;
  }

  startRealtime() {
    setInterval(() => {
      const n = Date.now(), e = n - this.t0;

      if (e >= this.timeframe) {
        // close previous candle
        if (this.currentCandle && (!this.candles.length || this.candles[this.candles.length - 1].timestamp !== this.currentCandle.timestamp)) {
          const closed = { ...this.currentCandle };
          this.candles.push(closed);
          if (this.candles.length > this.maxCandles) this.candles.shift();

          // ✅ حفظ عام لشموع الزوج (آخر 2000 فقط)
          scheduleSaveCandles(this.pair, this.candles);
        }

        this.t0 = Math.floor(n / this.timeframe) * this.timeframe;
        const lp = this.currentCandle ? this.currentCandle.close : this.currentPrice;

        this.currentCandle = this.genCandle(this.t0, lp);
        this.currentCandle.open = lp;
        this.currentCandle.close = lp;
        this.currentCandle.high = lp;
        this.currentCandle.low = lp;
        this.currentPrice = lp;
        window.__qt_price = this.currentPrice;
      } else {
        this.updateCurrentCandle();
      }
    }, 200);
  }

  updatePriceRange() {
    let v = [...this.candles];
    if (this.currentCandle && (!v.length || this.currentCandle.timestamp !== v[v.length - 1].timestamp)) v.push(this.currentCandle);

    if (!v.length) { this.priceRange = { min: 0.95 * this.basePrice, max: 1.05 * this.basePrice }; return; }

    const si = Math.floor(this.xToIndex(0)),
      ei = Math.ceil(this.xToIndex(this.w)),
      sl = v.slice(Math.max(0, si - 5), Math.min(v.length, ei + 5));

    if (!sl.length) { this.priceRange = { min: 0.95 * this.basePrice, max: 1.05 * this.basePrice }; return; }

    const lo = sl.map(c => c.low),
      hi = sl.map(c => c.high),
      mn = Math.min(...lo),
      mx = Math.max(...hi),
      pd = 0.15 * (mx - mn) || 1e-9;

    this.priceRange = { min: mn - pd, max: mx + pd };
  }

  initEvents() {
    addEventListener("resize", () => this.setup());

    this.canvas.addEventListener("wheel", e => {
      e.preventDefault();
      const r = this.canvas.getBoundingClientRect(),
        x = e.clientX - r.left,
        y = e.clientY - r.top,
        sc = e.deltaY > 0 ? 1 / 1.1 : 1.1;
      this.applyZoomAround(x, y, sc);
    }, { passive: false });

    const md = (x, t) => {
      this.drag = 1;
      this.dragStartX = x;
      this.dragStartOffset = this.targetOffsetX;
      this.velocity = 0;
      this.lastDragX = x;
      this.lastDragTime = t;
    };
    const mm = (x, t) => {
      if (this.drag) {
        const d = x - this.dragStartX;
        this.targetOffsetX = this.dragStartOffset + d;
        this.clampPan();
        const dt = t - this.lastDragTime;
        if (dt > 0 && dt < 80) this.velocity = (x - this.lastDragX) / dt * 26;
        this.lastDragX = x;
        this.lastDragTime = t;
      }
    };
    const mu = () => { this.drag = 0; this.updateTimeLabels(); };

    this.canvas.addEventListener("mousedown", e => {
      const r = this.canvas.getBoundingClientRect();
      md(e.clientX - r.left, Date.now());
    });
    addEventListener("mousemove", e => {
      const r = this.canvas.getBoundingClientRect();
      mm(e.clientX - r.left, Date.now());
    });
    addEventListener("mouseup", mu);

    const db = (a, b) => Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
    this.canvas.addEventListener("touchstart", e => {
      const r = this.canvas.getBoundingClientRect();
      if (e.touches.length === 1) md(e.touches[0].clientX - r.left, Date.now());
      else if (e.touches.length === 2) {
        this.drag = 0;
        this.pinch = 1;
        this.p0 = db(e.touches[0], e.touches[1]);
        this.pMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
        this.pMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top;
      }
    }, { passive: false });

    this.canvas.addEventListener("touchmove", e => {
      e.preventDefault();
      const r = this.canvas.getBoundingClientRect();
      if (this.pinch && e.touches.length === 2) {
        const d = db(e.touches[0], e.touches[1]);
        if (this.p0 > 0) {
          const sc = Math.max(0.2, Math.min(5, d / (this.p0 || d)));
          this.applyZoomAround(this.pMidX, this.pMidY, sc);
        }
        this.p0 = d;
      } else if (!this.pinch && e.touches.length === 1) {
        mm(e.touches[0].clientX - r.left, Date.now());
      }
    }, { passive: false });

    this.canvas.addEventListener("touchend", e => {
      if (e.touches.length < 2) { this.pinch = 0; this.p0 = 0; }
      if (e.touches.length === 0) mu();
    }, { passive: false });

    this.canvas.addEventListener("touchcancel", () => { this.pinch = 0; this.p0 = 0; mu(); }, { passive: false });
  }

  loop() {
    this.draw();
    requestAnimationFrame(() => this.loop());
  }
}

/* ============================================================
   Init Chart + Load First Pair Candles
   ============================================================ */
window.chart = new AdvancedTradingChart();

/* أول تحميل: حاول تجيب شموع EUR/USD من Firestore */
(async () => {
  showLoading(true);
  try {
    const initialPair = "EUR/USD";
    const loaded = await loadPairCandles(initialPair);
    if (loaded && loaded.length) window.chart.setCandles(loaded);
    else {
      window.chart.generateInitialCandles();
      scheduleSaveCandles(initialPair, window.chart.candles);
    }
  } catch (_) {
    window.chart.generateInitialCandles();
  }
  showLoading(false);
})();

/* ============================================================
   Time / Amount UI (Fix Custom Time + Set chart.selectedTime فعليًا)
   ============================================================ */
const timeSelector = document.getElementById("timeSelector"),
  timeDropdown = document.getElementById("timeDropdown"),
  timeDisplay = document.getElementById("timeDisplay"),
  tabCompensation = document.getElementById("tabCompensation"),
  tabCustom = document.getElementById("tabCustom"),
  compensationList = document.getElementById("compensationList"),
  amountDisplay = document.getElementById("amountDisplay"),
  amountContainer = document.getElementById("amountContainer");

let isEditingTime = false, savedTimeValue = "00:05";

function parseTimeLabelToSeconds(label) {
  const parts = String(label || "").trim().split(":").map(x => parseInt(x, 10));
  if (parts.length === 2) {
    const mm = parts[0] || 0, ss = parts[1] || 0;
    return Math.max(1, mm * 60 + ss);
  }
  if (parts.length === 3) {
    const hh = parts[0] || 0, mm = parts[1] || 0, ss = parts[2] || 0;
    return Math.max(1, hh * 3600 + mm * 60 + ss);
  }
  return 5;
}

function setTimeEditing(on) {
  isEditingTime = !!on;
  if (!timeDisplay) return;
  if (on) {
    timeDisplay.setAttribute("contenteditable", "true");
    timeDisplay.classList.add("editing");
    timeDisplay.focus();
  } else {
    timeDisplay.removeAttribute("contenteditable");
    timeDisplay.classList.remove("editing");
  }
}

timeSelector?.addEventListener("click", e => {
  e.stopPropagation();
  if (!isEditingTime) timeDropdown?.classList.toggle("show");
});

document.addEventListener("click", () => {
  timeDropdown?.classList.remove("show");
  if (isEditingTime) {
    timeDisplay.textContent = savedTimeValue;
    setTimeEditing(false);
  }
});

timeDropdown?.addEventListener("click", e => e.stopPropagation());

tabCompensation?.addEventListener("click", () => {
  tabCompensation.classList.add("active");
  tabCustom.classList.remove("active");
  if (compensationList) compensationList.style.display = "grid";
  if (isEditingTime) {
    timeDisplay.textContent = savedTimeValue;
    setTimeEditing(false);
  }
});

tabCustom?.addEventListener("click", () => {
  tabCustom.classList.add("active");
  tabCompensation.classList.remove("active");
  if (compensationList) compensationList.style.display = "none";
  timeDisplay.textContent = "";
  setTimeEditing(true);
});

compensationList?.addEventListener("click", e => {
  if (e.target.classList.contains("dropdown-item")) {
    savedTimeValue = e.target.textContent.trim();
    timeDisplay.textContent = savedTimeValue;
    window.chart.selectedTime = parseInt(e.target.getAttribute("data-sec"), 10) || parseTimeLabelToSeconds(savedTimeValue);
    timeDropdown.classList.remove("show");
  }
});

timeDisplay?.addEventListener("input", () => {
  if (!isEditingTime) return;
  // custom: MMSS (4 digits) => MM:SS
  let v = timeDisplay.textContent.replace(/[^0-9]/g, "");
  if (v.length > 4) v = v.slice(0, 4);
  timeDisplay.textContent = v;
});

timeDisplay?.addEventListener("blur", () => {
  if (!isEditingTime) return;
  let v = timeDisplay.textContent.replace(/[^0-9]/g, "");
  if (v.length === 0) v = "0005";
  v = v.padStart(4, "0");
  const mm = v.slice(0, 2), ss = v.slice(2, 4);
  savedTimeValue = `${mm}:${ss}`;
  timeDisplay.textContent = savedTimeValue;
  window.chart.selectedTime = Math.max(1, (parseInt(mm, 10) || 0) * 60 + (parseInt(ss, 10) || 0));
  setTimeEditing(false);
});

amountContainer?.addEventListener("click", () => amountDisplay?.focus());

amountDisplay?.addEventListener("focus", function () {
  let v = this.value.replace("$", "");
  this.value = v;
  setTimeout(() => this.setSelectionRange(0, this.value.length), 10);
});
amountDisplay?.addEventListener("input", function () {
  this.value = this.value.replace(/[^0-9]/g, "");
});
amountDisplay?.addEventListener("blur", function () {
  let val = parseFloat(this.value) || 50;
  this.value = val + "$";
});
amountDisplay?.addEventListener("keydown", function (e) {
  if (e.key === "Enter") { e.preventDefault(); this.blur(); }
});

/* ============================================================
   Trades Manager (Active -> Closed + Restore + Markers + Firestore)
   ============================================================ */
class QtTradesManager {
  constructor() {
    this.user = null;
    this.pair = "EUR/USD";
    this.unsubActive = null;
    this.activeTrades = [];
  }

  onPairChanged(pair) {
    this.pair = pair;
    this.resubscribe();
    this.loadClosedHistory();
  }

  start() {
    onAuthStateChanged(auth, (user) => {
      this.user = user || null;
      this.resubscribe();
      this.loadClosedHistory();
    });

    // كل 1 ثانية: حدّث remain في UI + اقفل المنتهي
    setInterval(() => this.tick(), 1000);
  }

  tradesActiveCol() {
    if (!this.user) return null;
    return collection(db, "users", this.user.uid, "qt_trades_active");
  }
  tradesClosedCol() {
    if (!this.user) return null;
    return collection(db, "users", this.user.uid, "qt_trades_closed");
  }

  resubscribe() {
    if (this.unsubActive) { try { this.unsubActive(); } catch (_) {} this.unsubActive = null; }
    this.activeTrades = [];
    if (window.tradeHistory) window.tradeHistory.setTrades([]);

    if (!this.user) return;

    const col = this.tradesActiveCol();
    const qy = query(col, where("pair", "==", this.pair), orderBy("openedAt", "desc"), limit(50));

    this.unsubActive = onSnapshot(qy, (snap) => {
      const arr = [];
      snap.forEach(d => {
        const t = d.data() || {};
        t.id = t.id || d.id;
        arr.push(t);
      });

      this.activeTrades = arr;

      // رسم markers للصفقات النشطة المستعادة
      for (const t of this.activeTrades) {
        if (t.pair === window.chart.pair) window.chart.addTradeMarker(t);
      }

      // عرضهم في سجل "مفتوحة"
      this.pushActiveToUI();

      // اقفل أي صفقات انتهت بالفعل (حتى لو كانت محفوظة)
      this.settleExpired();
    }, () => {});
  }

  pushActiveToUI() {
    if (!window.tradeHistory) return;
    const now = Date.now();

    const uiTrades = this.activeTrades.map(t => {
      const remain = Math.max(0, Math.ceil(((t.expiresAt || now) - now) / 1000));
      return {
        id: t.id,
        open: true,
        remain,
        pair: t.pair,
        dir: t.dir,
        entry: t.entry,
        stake: t.stake,
        payout: t.payout,
        amountTxt: t.amountTxt,
        flags: t.flags
      };
    });

    window.tradeHistory.setTrades(uiTrades);
  }

  async loadClosedHistory() {
    if (!this.user) {
      // فاضي
      window.dispatchEvent(new CustomEvent("qt_history_loaded", { detail: [] }));
      return;
    }

    try {
      const col = this.tradesClosedCol();
      const qy = query(col, where("pair", "==", this.pair), orderBy("closedAt", "desc"), limit(200));
      const snap = await getDocs(qy);

      const hist = [];
      snap.forEach(d => {
        const t = d.data() || {};
        t.id = t.id || d.id;
        hist.push(t);
      });

      // tradeHistory listener جاهز عندك في HTML
      window.dispatchEvent(new CustomEvent("qt_history_loaded", { detail: hist }));
    } catch (_) {
      window.dispatchEvent(new CustomEvent("qt_history_loaded", { detail: [] }));
    }
  }

  tick() {
    if (!this.activeTrades.length) return;
    this.pushActiveToUI();
    this.settleExpired();
  }

  async settleExpired() {
    if (!this.user) return;
    const now = Date.now();
    const expired = this.activeTrades.filter(t => (t.expiresAt || 0) <= now);
    for (const t of expired) {
      await this.closeTrade(t.id).catch(() => {});
    }
  }

  async openTrade(dir /* "up" | "down" */) {
    if (!this.user) {
      alert("لازم تسجل دخول الأول عشان نحفظ الصفقات على Firebase.");
      return;
    }

    const pair = window.chart.pair;
    const entry = +window.chart.currentPrice;
    const stake = parseFloat(String(amountDisplay?.value || "50").replace(/[^0-9.]/g, "")) || 50;
    const payout = payoutForPair(pair);
    const openedAt = Date.now();
    const expiresAt = openedAt + (Math.max(1, window.chart.selectedTime || 5) * 1000);

    const tradeId = `${openedAt}_${Math.random().toString(16).slice(2)}`;
    const flags = flagsFromPair(pair);

    const trade = {
      id: tradeId,
      pair,
      dir: dir === "up" ? "up" : "down",
      entry,
      stake,
      payout,
      amountTxt: `${stake}`,
      flags,
      openedAt,
      expiresAt,
      createdAt: serverTimestamp()
    };

    // save active
    await setDoc(doc(db, "users", this.user.uid, "qt_trades_active", tradeId), trade, { merge: true });

    // marker + UI فورًا
    window.chart.addTradeMarker(trade);
  }

  async closeTrade(tradeId) {
    if (!this.user) return;

    const activeRef = doc(db, "users", this.user.uid, "qt_trades_active", tradeId);
    const snap = await getDoc(activeRef);
    if (!snap.exists()) return;

    const t = snap.data() || {};
    const now = Date.now();

    // السعر الحالي وقت الإغلاق
    const closePrice = +window.chart.currentPrice;
    const entry = +t.entry;
    const dir = t.dir === "up" ? "up" : "down";
    const isWin = dir === "up" ? (closePrice >= entry) : (closePrice <= entry);

    const profitLoss = isWin ? (+t.stake * +t.payout) : (-Math.abs(+t.stake));
    const closedTrade = {
      ...t,
      open: false,
      closePrice,
      closedAt: now,
      result: isWin ? "win" : "loss",
      profitLoss
    };

    const batch = writeBatch(db);
    batch.set(doc(db, "users", this.user.uid, "qt_trades_closed", tradeId), closedTrade, { merge: true });
    batch.delete(activeRef);
    await batch.commit();

    // ابعت event للوحة السجل (عشان تنتقل لمنتهية)
    window.dispatchEvent(new CustomEvent("qt_trade_closed", { detail: { trade: closedTrade } }));
  }
}

window.__qtTrades = new QtTradesManager();
window.__qtTrades.start();

/* ============================================================
   BUY / SELL Buttons => فتح صفقة فعليًا (مع وقت selectedTime)
   ============================================================ */
document.getElementById("buyBtn")?.addEventListener("click", () => window.__qtTrades.openTrade("up"));
document.getElementById("sellBtn")?.addEventListener("click", () => window.__qtTrades.openTrade("down"));
