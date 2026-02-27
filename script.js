/* ============================================================
   QT Trading - Public Candles per Pair (Last 2000)
   + Master/Viewer Live Candle
   + Trades: Active -> Closed (saved/restored) + Markers
   Compatible with your HTML (pairPanel + tradeHistory)
   ============================================================ */

/* ===================== Firebase imports (12.9.0) ===================== */
import { getApps, getApp, initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  runTransaction
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

/* ===================== Firebase init (safe) ===================== */
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

/* ===================== Constants ===================== */
const CANDLE_LIMIT = 2000;
const CHUNK_SIZE = 500; // 4 chunks = 2000

const MASTER_TIMEOUT_MS = 12_000;
const MASTER_HEARTBEAT_MS = 1_000;
const VIEWER_RENDER_THROTTLE_MS = 150;

/* ===================== Helpers ===================== */
function pairToKey(pair) {
  return String(pair || "EUR/USD").trim().replace(/\s+/g, "").replace("/", "_");
}

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

function packCandle(c) {
  return { t: c.timestamp, o: c.open, h: c.high, l: c.low, c: c.close };
}
function unpackCandle(x) {
  return { timestamp: x.t, open: x.o, high: x.h, low: x.l, close: x.c };
}

function nowMs() { return Date.now(); }
function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

/* ===================== Firestore Candle Store (public) ===================== */
/*
  qt_pairs/{pairKey}
    - meta doc (pair, updatedAt)
    /candle_chunks/c0..c3  (idx, candles[])
*/
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

  const packed = chunks.flatMap(x => x.candles);
  const last = packed.slice(-CANDLE_LIMIT);
  return last.map(unpackCandle);
}

let _saveTimer = null;
function scheduleSavePairCandles(pair, candles, delay = 1200) {
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => {
    savePairCandles(pair, candles).catch(() => {});
  }, delay);
}

async function savePairCandles(pair, candles) {
  const key = pairToKey(pair);
  const last = (Array.isArray(candles) ? candles : []).slice(-CANDLE_LIMIT);
  const packed = last.map(packCandle);

  const chunks = [];
  for (let i = 0; i < packed.length; i += CHUNK_SIZE) {
    chunks.push(packed.slice(i, i + CHUNK_SIZE));
  }
  while (chunks.length < 4) chunks.push([]);

  const batch = writeBatch(db);

  batch.set(doc(db, "qt_pairs", key), {
    pair: String(pair),
    updatedAt: serverTimestamp(),
    candleLimit: CANDLE_LIMIT
  }, { merge: true });

  for (let i = 0; i < 4; i++) {
    batch.set(doc(db, "qt_pairs", key, "candle_chunks", "c" + i), {
      idx: i,
      candles: chunks[i] || [],
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  await batch.commit();
}

/* ===================== Live State (Master/Viewer) ===================== */
/*
  qt_live/{pairKey}
    masterId, masterHeartbeat
    liveT0
    liveCandle
    updatedAt
*/
function liveRefForPair(pair) {
  return doc(db, "qt_live", pairToKey(pair));
}

/* ===================== Trading Chart ===================== */
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

    this.PAIR_CONFIG = {
      "EUR/USD": { base: 1.9500, digits: 5, seed: 11001, volScale: 1.0 },
      "AUD/CAD": { base: 0.9100, digits: 5, seed: 22001, volScale: 0.95 },
      "AUD/CHF": { base: 0.5700, digits: 5, seed: 33001, volScale: 0.60 },
      "BHD/CNY": { base: 2.6500, digits: 4, seed: 44001, volScale: 2.70 },
      "EUR/RUB": { base: 98.000, digits: 3, seed: 55001, volScale: 100 },
      "KES/USD": { base: 0.0077, digits: 6, seed: 66001, volScale: 0.008 },
      "LBP/USD": { base: 0.0111, digits: 6, seed: 77001, volScale: 0.011 },
      "QAR/CNY": { base: 1.9800, digits: 5, seed: 88001, volScale: 2.00 },
      "USD/CHF": { base: 0.8900, digits: 5, seed: 99001, volScale: 0.90 },
      "SYP/TRY": { base: 0.2800, digits: 5, seed: 10501, volScale: 0.30 },
      "EGP/USD": { base: 0.0205, digits: 5, seed: 11501, volScale: 0.021 },
      "USD/INR": { base: 83.500, digits: 3, seed: 12501, volScale: 85.0 },
      "AED/CNY": { base: 1.9800, digits: 5, seed: 13501, volScale: 2.00 }
    };

    this.currentPair = "EUR/USD";
    this.maxCandles = CANDLE_LIMIT;

    this.candles = [];
    this.currentCandle = null;

    this.basePrice = 1.95;
    this.currentPrice = 1.9518;
    this.seed = 11001;
    this.digits = 5;
    this.volScale = 1;

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
    this.t0 = Math.floor(nowMs() / this.timeframe) * this.timeframe;

    this.smin = null;
    this.smax = null;
    this.sre = 0.088;
    this._fr = 0;

    this.markers = [];
    this.tradeMarkerIds = new Set();

    this.selectedTime = 5; // seconds

    // master/viewer
    this.instanceId = "inst_" + nowMs() + "_" + Math.random().toString(16).slice(2);
    this.isMaster = false;
    this._masterHeartbeatTimer = null;
    this._priceLoopTimer = null;
    this._viewerUnsub = null;
    this._watchdogTimer = null;
    this._viewerLastApply = 0;

    this.setup();
    this.initEvents();
  }

  /* ========== Core Seeded Random ========== */
  rnd(s) { const x = Math.sin(s) * 1e4; return x - Math.floor(x); }
  rndG(s) {
    const u1 = this.rnd(s), u2 = this.rnd(s + 1e5);
    return Math.sqrt(-2 * Math.log(u1 + 1e-5)) * Math.cos(2 * Math.PI * u2);
  }

  genCandle(t, o) {
    const s = this.seed + Math.floor(t / this.timeframe);
    const vb = 8e-4 * (this.volScale || 1);
    const tb = 5e-5 * (this.volScale || 1);

    const r1 = this.rndG(s), r2 = this.rndG(s + 1), r3 = this.rndG(s + 2);
    const r4 = this.rnd(s + 3), r5 = this.rnd(s + 4), r6 = this.rnd(s + 5);

    const v = vb * (0.7 + Math.abs(r1) * 0.8);
    const tr = tb * r2 * 0.6;
    const dir = r3 > 0 ? 1 : -1;
    const tc = o + (dir * v + tr);

    const rg = v * (0.2 + r4 * 0.6);
    const hm = rg * (0.3 + r5 * 0.7);
    const lm = rg * (0.3 + (1 - r5) * 0.7);

    const c = +(tc + (r6 - 0.5) * v * 0.1).toFixed(this.digits);
    const op = +o.toFixed(this.digits);

    return {
      open: op,
      close: c,
      high: +Math.max(op, c, op + hm, c + hm).toFixed(this.digits),
      low: +Math.min(op, c, op - lm, c - lm).toFixed(this.digits),
      timestamp: t
    };
  }

  /* ========== UI Setup ========== */
  setup() {
    const dpr = window.devicePixelRatio || 1;
    const r = this.plot.getBoundingClientRect();
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

  /* ========== Candle Store Load/Init ========== */
  async initForPair(pair) {
    this.applyPairConfig(pair);
    showLoading(true);

    try {
      const loaded = await loadPairCandles(pair);
      if (loaded && loaded.length) {
        this.setCandles(loaded);
      } else {
        this.generateInitialCandles();
        // أول مرة: احفظها (هيبقى الماستر اللي يحفظها بعد ما يبقى ماستر)
        // لكن لو مفيش حد ماستر، هنحفظها هنا كـ bootstrap
        scheduleSavePairCandles(pair, this.candles, 500);
      }
    } catch (_) {
      this.generateInitialCandles();
    }

    // start live master/viewer
    await this.startMasterViewer();

    showLoading(false);
  }

  applyPairConfig(pair) {
    this.currentPair = String(pair || "EUR/USD");
    const cfg = this.PAIR_CONFIG[this.currentPair];
    if (cfg) {
      this.basePrice = +cfg.base;
      this.digits = +cfg.digits;
      this.seed = +cfg.seed;
      this.volScale = +cfg.volScale || 1;
    } else {
      // fallback derive a seed
      const key = pairToKey(this.currentPair);
      let h = 0;
      for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
      this.seed = 10000 + (h % 90000);
      this.digits = 5;
      this.volScale = 1;
      this.basePrice = 1 + ((h % 10_000) / 10_000);
    }
  }

  setCandles(arr) {
    this.candles = (Array.isArray(arr) ? arr : []).slice(-this.maxCandles);
    this.currentCandle = null;

    if (this.candles.length) {
      this.currentPrice = this.candles[this.candles.length - 1].close;
      this.t0 = Math.floor(nowMs() / this.timeframe) * this.timeframe;
    }
    window.__qt_price = this.currentPrice;

    this.snapToLive();
    this.updateTimeLabels();
    this.updatePriceRange();
    this.smin = this.priceRange.min;
    this.smax = this.priceRange.max;
    this.updatePriceScale();
    this.updatePriceLabel();
  }

  generateInitialCandles() {
    this.candles = [];
    this.currentCandle = null;

    let p = this.basePrice;
    let t = nowMs() - this.maxCandles * this.timeframe;

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

  /* ========== Master/Viewer Logic ========== */
  async startMasterViewer() {
    await this.stopMasterViewer();

    // try claim master
    const claimed = await this.tryClaimMaster();
    if (claimed) {
      this.becomeMaster();
    } else {
      this.becomeViewer();
    }

    // watchdog: لو الماستر مات، خليك ماستر
    this._watchdogTimer = setInterval(() => this.watchdogTick(), 2000);
  }

  async stopMasterViewer() {
    if (this._masterHeartbeatTimer) { clearInterval(this._masterHeartbeatTimer); this._masterHeartbeatTimer = null; }
    if (this._priceLoopTimer) { clearInterval(this._priceLoopTimer); this._priceLoopTimer = null; }
    if (this._watchdogTimer) { clearInterval(this._watchdogTimer); this._watchdogTimer = null; }
    if (this._viewerUnsub) { try { this._viewerUnsub(); } catch (_) {} this._viewerUnsub = null; }

    // release master if we are master
    if (this.isMaster) {
      try {
        const ref = liveRefForPair(this.currentPair);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const d = snap.data() || {};
          if (d.masterId === this.instanceId) {
            await updateDoc(ref, { masterId: null, masterHeartbeat: 0, updatedAt: nowMs() });
          }
        }
      } catch (_) {}
    }

    this.isMaster = false;
  }

  async tryClaimMaster() {
    const ref = liveRefForPair(this.currentPair);
    try {
      const ok = await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        const t = nowMs();

        if (!snap.exists()) {
          tx.set(ref, {
            pair: this.currentPair,
            masterId: this.instanceId,
            masterHeartbeat: t,
            liveT0: this.t0,
            liveCandle: this.currentCandle ? { ...this.currentCandle } : null,
            updatedAt: t
          });
          return true;
        }

        const data = snap.data() || {};
        const hb = +data.masterHeartbeat || 0;
        const alive = (t - hb) < MASTER_TIMEOUT_MS;

        if (!alive || !data.masterId) {
          tx.update(ref, {
            masterId: this.instanceId,
            masterHeartbeat: t,
            updatedAt: t,
            pair: this.currentPair
          });
          return true;
        }

        // already has alive master
        if (data.masterId === this.instanceId) return true;
        return false;
      });

      return !!ok;
    } catch (_) {
      // fallback
      try {
        const snap = await getDoc(ref);
        const t = nowMs();
        if (!snap.exists()) {
          await setDoc(ref, {
            pair: this.currentPair,
            masterId: this.instanceId,
            masterHeartbeat: t,
            liveT0: this.t0,
            liveCandle: null,
            updatedAt: t
          }, { merge: true });
          return true;
        }
        const d = snap.data() || {};
        const alive = (t - (+d.masterHeartbeat || 0)) < MASTER_TIMEOUT_MS;
        if (!alive) {
          await updateDoc(ref, { masterId: this.instanceId, masterHeartbeat: t, updatedAt: t });
          return true;
        }
        return false;
      } catch {
        return true; // if firestore fails, act as master locally
      }
    }
  }

  becomeMaster() {
    this.isMaster = true;

    // init current candle
    this.t0 = Math.floor(nowMs() / this.timeframe) * this.timeframe;
    if (!this.currentCandle) {
      const lp = this.candles.length ? this.candles[this.candles.length - 1].close : this.currentPrice;
      this.currentCandle = this.genCandle(this.t0, lp);
      this.currentCandle.open = lp;
      this.currentCandle.close = lp;
      this.currentCandle.high = lp;
      this.currentCandle.low = lp;
      this.currentPrice = lp;
      window.__qt_price = this.currentPrice;
    }

    // heartbeat + live candle broadcast
    this._masterHeartbeatTimer = setInterval(() => this.broadcastLive(), MASTER_HEARTBEAT_MS);

    // price loop (create/close candles)
    this._priceLoopTimer = setInterval(() => this.masterPriceTick(), 200);
  }

  becomeViewer() {
    this.isMaster = false;

    const ref = liveRefForPair(this.currentPair);
    this._viewerUnsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const d = snap.data() || {};
      if (!d.liveCandle) return;

      const t = nowMs();
      if (t - this._viewerLastApply < VIEWER_RENDER_THROTTLE_MS) return;
      this._viewerLastApply = t;

      // if new candle started -> push previous currentCandle to history (viewer side display only)
      if (d.liveT0 && d.liveT0 !== this.t0 && this.currentCandle) {
        // close prev
        const closed = { ...this.currentCandle };
        if (!this.candles.length || this.candles[this.candles.length - 1].timestamp !== closed.timestamp) {
          this.candles.push(closed);
          if (this.candles.length > this.maxCandles) this.candles.shift();
        }
      }

      if (d.liveT0) this.t0 = d.liveT0;
      this.currentCandle = { ...d.liveCandle };
      this.currentPrice = +d.liveCandle.close;
      window.__qt_price = this.currentPrice;
    }, () => {});
  }

  async watchdogTick() {
    if (this.isMaster) return;
    try {
      const ref = liveRefForPair(this.currentPair);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        const claimed = await this.tryClaimMaster();
        if (claimed) this.becomeMaster();
        return;
      }
      const d = snap.data() || {};
      const hb = +d.masterHeartbeat || 0;
      const alive = (nowMs() - hb) < MASTER_TIMEOUT_MS;
      if (!alive) {
        const claimed = await this.tryClaimMaster();
        if (claimed) {
          if (this._viewerUnsub) { try { this._viewerUnsub(); } catch(_){} this._viewerUnsub = null; }
          this.becomeMaster();
        }
      }
    } catch (_) {}
  }

  async broadcastLive() {
    if (!this.isMaster) return;
    try {
      const ref = liveRefForPair(this.currentPair);
      await setDoc(ref, {
        pair: this.currentPair,
        masterId: this.instanceId,
        masterHeartbeat: nowMs(),
        liveT0: this.t0,
        liveCandle: this.currentCandle ? { ...this.currentCandle } : null,
        updatedAt: nowMs()
      }, { merge: true });
    } catch (_) {}
  }

  masterPriceTick() {
    if (!this.isMaster) return;

    const n = nowMs();
    const elapsed = n - this.t0;

    if (elapsed >= this.timeframe) {
      // close candle
      if (this.currentCandle) {
        const closed = { ...this.currentCandle };
        if (!this.candles.length || this.candles[this.candles.length - 1].timestamp !== closed.timestamp) {
          this.candles.push(closed);
          if (this.candles.length > this.maxCandles) this.candles.shift();

          // ✅ master only saves public candle history (last 2000)
          scheduleSavePairCandles(this.currentPair, this.candles, 800);
        }
      }

      // new candle
      this.t0 = Math.floor(n / this.timeframe) * this.timeframe;
      const lp = this.currentCandle ? this.currentCandle.close : this.currentPrice;

      this.currentCandle = this.genCandle(this.t0, lp);
      this.currentCandle.open = lp;
      this.currentCandle.close = lp;
      this.currentCandle.high = lp;
      this.currentCandle.low = lp;

      this.currentPrice = lp;
      window.__qt_price = this.currentPrice;
      return;
    }

    // update current candle smoothly
    if (!this.currentCandle) {
      const lp = this.candles.length ? this.candles[this.candles.length - 1].close : this.currentPrice;
      this.currentCandle = this.genCandle(this.t0, lp);
      this.currentCandle.close = lp;
      this.currentCandle.high = Math.max(this.currentCandle.open, this.currentCandle.close);
      this.currentCandle.low = Math.min(this.currentCandle.open, this.currentCandle.close);
    } else {
      const r = this.rnd(this.seed + n);
      const dir = (r - 0.5) * 4e-4 * (this.volScale || 1);
      const target = this.currentCandle.close + dir;
      const maxStep = 8e-4 * 0.18 * (this.volScale || 1);
      const next = this.stepTowards(this.currentCandle.close, target, maxStep);

      const nc = +next.toFixed(this.digits);
      this.currentCandle.close = nc;
      this.currentCandle.high = +Math.max(this.currentCandle.high, nc).toFixed(this.digits);
      this.currentCandle.low = +Math.min(this.currentCandle.low, nc).toFixed(this.digits);
      this.currentPrice = nc;
      window.__qt_price = this.currentPrice;
    }
  }

  /* ========== Pair Switch (called from your pair panel) ========== */
  async switchPair(pair) {
    pair = String(pair || "EUR/USD");
    if (pair === this.currentPair) return;

    showLoading(true);

    // stop live & clear markers for new pair view
    await this.stopMasterViewer();
    this.markers = [];
    this.tradeMarkerIds.clear();

    // init pair
    await this.initForPair(pair);

    // notify trades manager
    if (window.__qtTrades && typeof window.__qtTrades.onPairChanged === "function") {
      window.__qtTrades.onPairChanged(pair);
    }

    showLoading(false);
  }

  /* ========== Markers API (Trade markers restored from Firebase) ========== */
  addTradeMarker(trade) {
    if (!trade || !trade.id) return;
    if (this.tradeMarkerIds.has(trade.id)) return;

    const ts = +trade.markerCandleTimestamp || Math.floor((+trade.openedAt || nowMs()) / this.timeframe) * this.timeframe;

    let idx = -1;
    for (let i = 0; i < this.candles.length; i++) {
      if (this.candles[i].timestamp === ts) { idx = i; break; }
    }
    if (idx < 0) idx = Math.max(0, this.candles.length - 1);

    this.markers.push({
      type: (trade.dir === "up") ? "buy" : "sell",
      ts: +trade.openedAt || nowMs(),
      price: +trade.entry,
      candleIndex: idx,
      candleTimestamp: ts,
      tradeId: trade.id,
      closed: !!trade.closedAt,
      profitLoss: (trade.profitLoss != null) ? +trade.profitLoss : null
    });

    this.tradeMarkerIds.add(trade.id);
  }

  /* ========== Drawing / Grid / Labels (same style as your original) ========== */
  getSpacing() { return this.baseSpacing * this.zoom; }
  getCandleWidth() { return this.getSpacing() * 0.8; }
  getMinOffset() { return this.w / 2 - this.candles.length * this.getSpacing(); }
  getMaxOffset() { return this.w / 2; }

  clampPan() {
    const mn = this.getMinOffset(), mx = this.getMaxOffset();
    this.targetOffsetX = clamp(this.targetOffsetX, mn, mx);
    this.offsetX = clamp(this.offsetX, mn, mx);
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
    const oz = this.targetZoom;
    const nz = clamp(oz * sc, this.minZoom, this.maxZoom);
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
    const mn = this.smin !== null ? this.smin : this.priceRange.min;
    const mx = this.smax !== null ? this.smax : this.priceRange.max;
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
    const r = this.getPriceRange();
    const rng = r.max - r.min;
    const d = this.niceNum(rng / 7, 0);
    const g0 = Math.floor(r.min / d) * d;
    const g1 = Math.ceil(r.max / d) * d;
    return { min: g0, max: g1, step: d, count: Math.round((g1 - g0) / d) };
  }

  priceToY(p) {
    const r = this.getPriceRange();
    const n = (p - r.min) / (r.max - r.min);
    return this.h * (1 - n);
  }

  updatePriceRange() {
    let v = [...this.candles];
    if (this.currentCandle && (!v.length || this.currentCandle.timestamp !== v[v.length - 1].timestamp)) v.push(this.currentCandle);

    if (!v.length) {
      this.priceRange = { min: 0.95 * this.basePrice, max: 1.05 * this.basePrice };
      return;
    }

    const si = Math.floor(this.xToIndex(0));
    const ei = Math.ceil(this.xToIndex(this.w));
    const sl = v.slice(Math.max(0, si - 5), Math.min(v.length, ei + 5));

    if (!sl.length) {
      this.priceRange = { min: 0.95 * this.basePrice, max: 1.05 * this.basePrice };
      return;
    }

    const lo = sl.map(c => c.low);
    const hi = sl.map(c => c.high);
    const mn = Math.min(...lo);
    const mx = Math.max(...hi);
    const pad = 0.15 * (mx - mn) || 1e-9;
    this.priceRange = { min: mn - pad, max: mx + pad };
  }

  updateTimeLabels() {
    if (!this.timeLabels) return;
    const tl = this.timeLabels;
    tl.innerHTML = "";

    const visC = this.w / this.getSpacing();
    const targetL = 9;
    const stepC = Math.max(1, Math.round(visC / targetL));
    const s = Math.floor(this.xToIndex(0));
    const e = Math.ceil(this.xToIndex(this.w));
    const tS = this.candles.length ? this.candles[0].timestamp : this.t0;

    for (let i = s; i <= e; i++) {
      if (i % stepC !== 0) continue;
      const x = this.indexToX(i);
      if (x < 5 || x > this.w - 5) continue;

      const t = tS + i * this.timeframe;
      const d = new Date(t);
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");

      const lb = document.createElement("div");
      lb.className = "timeLabel";
      if (i % Math.round(stepC * 5) === 0) lb.classList.add("major");
      lb.style.left = x + "px";
      lb.textContent = `${hh}:${mm}`;
      tl.appendChild(lb);
    }
  }

  updatePriceScale() {
    if (!this.priceScaleLabels) return;
    const { min, step, count } = this.calcNiceGrid();
    let h = "";

    for (let i = 0; i <= count; i++) {
      const p = min + i * step;
      const y = this.priceToY(p);
      if (y < -8 || y > this.h + 8) continue;
      const mj = i % 5 === 0;
      h += `<div class="pLabel${mj ? " major" : ""}" style="top:${y}px">${p.toFixed(this.digits)}</div>`;
    }
    this.priceScaleLabels.innerHTML = h;
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
    const n = nowMs();
    const e = n - this.t0;
    const r = this.timeframe - e;
    const s = Math.floor(r / 1000);
    this.candleTimer.textContent = s >= 0 ? s : 0;

    const cx = this.indexToX(this.candles.length);
    this.candleTimer.style.left = (cx + 15) + "px";
    this.candleTimer.style.top = "10px";
    this.candleTimer.style.display = "block";
  }

  drawGrid() {
    const { min, step, count } = this.calcNiceGrid();
    for (let i = 0; i <= count; i++) {
      const p = min + i * step;
      const y = this.priceToY(p);
      if (y < -5 || y > this.h + 5) continue;
      const mj = i % 5 === 0;
      this.ctx.strokeStyle = mj ? "rgba(255,215,0,.12)" : "rgba(255,255,255,.05)";
      this.ctx.lineWidth = mj ? 1 : 0.8;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y + 0.5);
      this.ctx.lineTo(this.w, y + 0.5);
      this.ctx.stroke();
    }

    const visC = this.w / this.getSpacing();
    const targetL = 9;
    const stepC = Math.max(1, Math.round(visC / targetL));
    const s = Math.floor(this.xToIndex(0));
    const e = Math.ceil(this.xToIndex(this.w));

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

  drawCandle(c, x, glow) {
    const oy = this.priceToY(c.open);
    const cy = this.priceToY(c.close);
    const hy = this.priceToY(c.high);
    const ly = this.priceToY(c.low);
    const bull = c.close >= c.open;
    const w = this.getCandleWidth();

    this.ctx.strokeStyle = bull ? "#0f0" : "#f00";
    this.ctx.lineWidth = Math.max(1, 0.18 * w);

    this.ctx.beginPath();
    this.ctx.moveTo(x, hy);
    this.ctx.lineTo(x, ly);
    this.ctx.stroke();

    const bh = Math.max(1, Math.abs(cy - oy));
    const bt = Math.min(oy, cy);
    const g = this.ctx.createLinearGradient(x, bt, x, bt + bh);

    if (bull) { g.addColorStop(0, "#0f0"); g.addColorStop(0.5, "#0f0"); g.addColorStop(1, "#0c0"); }
    else { g.addColorStop(0, "#f00"); g.addColorStop(0.5, "#f00"); g.addColorStop(1, "#c00"); }

    this.ctx.fillStyle = g;

    if (glow) {
      this.ctx.shadowColor = bull ? "rgba(0,255,0,.8)" : "rgba(255,0,0,.8)";
      this.ctx.shadowBlur = 12;
    }

    this.ctx.fillRect(x - w / 2, bt, w, bh);

    if (glow) this.ctx.shadowBlur = 0;
  }

  drawMarker(m) {
    let actualIdx = m.candleIndex;
    for (let i = 0; i < this.candles.length; i++) {
      if (this.candles[i].timestamp === m.candleTimestamp) { actualIdx = i; break; }
    }

    const x = this.indexToX(actualIdx);
    if (x < -200 || x > this.w + 50) return;

    const y = this.priceToY(m.price);
    const w = this.getCandleWidth();
    const isBuy = m.type === "buy";
    const cl = isBuy ? "#16a34a" : "#ff3b3b";
    const r = 5.5;

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
    if (!isBuy) this.ctx.rotate(Math.PI);

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

    const lx = lsx + w / 2 + 3;
    const lw = Math.min(95, this.w - lx - 22);

    this.ctx.strokeStyle = isBuy ? "rgba(22,163,74,.7)" : "rgba(255,59,59,.7)";
    this.ctx.lineWidth = 1.2;

    this.ctx.beginPath();
    this.ctx.moveTo(lsx + w / 2, y);
    this.ctx.lineTo(lx, y);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(lx, y);
    this.ctx.lineTo(lx + lw, y);
    this.ctx.stroke();

    const ex = lx + lw;
    const er = 5;

    this.ctx.strokeStyle = cl;
    this.ctx.lineWidth = 2;
    this.ctx.fillStyle = "#fff";

    this.ctx.beginPath();
    this.ctx.arc(ex, y, er, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.restore();
  }

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
      this.drawCandle(this.candles[i], x, false);
    }

    if (this.currentCandle && (!this.candles.length || this.currentCandle.timestamp !== this.candles[this.candles.length - 1].timestamp)) {
      const lx = this.indexToX(this.candles.length);
      if (lx >= -60 && lx <= this.w + 60) this.drawCandle(this.currentCandle, lx, true);
    }

    for (const mk of this.markers) this.drawMarker(mk);

    if (++this._fr % 2 === 0) {
      this.updatePriceScale();
      this.updateTimeLabels();
    }

    this.updatePriceLabel();
    this.updateCandleTimer();
  }

  loop() {
    this.draw();
    requestAnimationFrame(() => this.loop());
  }

  stepTowards(c, t, m) {
    const d = t - c;
    return Math.abs(d) <= m ? t : c + Math.sign(d) * m;
  }

  initEvents() {
    addEventListener("resize", () => this.setup());

    this.canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const r = this.canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const sc = e.deltaY > 0 ? 1 / 1.1 : 1.1;
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
      if (!this.drag) return;
      const d = x - this.dragStartX;
      this.targetOffsetX = this.dragStartOffset + d;
      this.clampPan();

      const dt = t - this.lastDragTime;
      if (dt > 0 && dt < 80) this.velocity = (x - this.lastDragX) / dt * 26;
      this.lastDragX = x;
      this.lastDragTime = t;
    };

    const mu = () => { this.drag = 0; this.updateTimeLabels(); };

    this.canvas.addEventListener("mousedown", (e) => {
      const r = this.canvas.getBoundingClientRect();
      md(e.clientX - r.left, nowMs());
    });
    addEventListener("mousemove", (e) => {
      const r = this.canvas.getBoundingClientRect();
      mm(e.clientX - r.left, nowMs());
    });
    addEventListener("mouseup", mu);

    const dist = (a, b) => Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);

    this.canvas.addEventListener("touchstart", (e) => {
      const r = this.canvas.getBoundingClientRect();
      if (e.touches.length === 1) md(e.touches[0].clientX - r.left, nowMs());
      else if (e.touches.length === 2) {
        this.drag = 0;
        this.pinch = 1;
        this.p0 = dist(e.touches[0], e.touches[1]);
        this.pMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
        this.pMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top;
      }
    }, { passive: false });

    this.canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      const r = this.canvas.getBoundingClientRect();
      if (this.pinch && e.touches.length === 2) {
        const d = dist(e.touches[0], e.touches[1]);
        if (this.p0 > 0) {
          const sc = clamp(d / (this.p0 || d), 0.2, 5);
          this.applyZoomAround(this.pMidX, this.pMidY, sc);
        }
        this.p0 = d;
      } else if (!this.pinch && e.touches.length === 1) {
        mm(e.touches[0].clientX - r.left, nowMs());
      }
    }, { passive: false });

    this.canvas.addEventListener("touchend", (e) => {
      if (e.touches.length < 2) { this.pinch = 0; this.p0 = 0; }
      if (e.touches.length === 0) mu();
    }, { passive: false });
  }
}

/* ===================== Trades Manager (per user) ===================== */
/*
  users/{uid}/qt_trades_active/{tradeId}
  users/{uid}/qt_trades_closed/{tradeId}
*/
class QtTradesManager {
  constructor(chart) {
    this.chart = chart;
    this.user = null;
    this.pair = chart.currentPair;

    this.unsubActive = null;

    onAuthStateChanged(auth, (u) => {
      this.user = u || null;
      this.resubscribe();
      this.loadClosedHistory();
    });

    setInterval(() => {
      this.pushActiveToUI();
      this.settleExpired();
    }, 1000);
  }

  onPairChanged(pair) {
    this.pair = pair;
    this.resubscribe();
    this.loadClosedHistory();
  }

  activeCol() {
    if (!this.user) return null;
    return collection(db, "users", this.user.uid, "qt_trades_active");
  }
  closedCol() {
    if (!this.user) return null;
    return collection(db, "users", this.user.uid, "qt_trades_closed");
  }

  resubscribe() {
    if (this.unsubActive) { try { this.unsubActive(); } catch(_){} this.unsubActive = null; }

    if (!window.tradeHistory) return;

    // clear UI
    window.tradeHistory.setTrades([]);

    if (!this.user) return;

    const qy = query(
      this.activeCol(),
      where("pair", "==", this.pair),
      orderBy("openedAt", "desc"),
      limit(50)
    );

    this.unsubActive = onSnapshot(qy, (snap) => {
      const arr = [];
      snap.forEach(d => {
        const t = d.data() || {};
        t.id = t.id || d.id;
        arr.push(t);

        // restore marker
        if (t.pair === this.chart.currentPair) this.chart.addTradeMarker(t);
      });

      this._active = arr;
      this.pushActiveToUI();
      this.settleExpired();
    }, () => {});
  }

  pushActiveToUI() {
    if (!window.tradeHistory) return;
    const list = Array.isArray(this._active) ? this._active : [];
    const now = nowMs();

    const uiTrades = list.map(t => {
      const remain = Math.max(0, Math.ceil(((+t.expiresAt || now) - now) / 1000));
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
      window.dispatchEvent(new CustomEvent("qt_history_loaded", { detail: [] }));
      return;
    }

    try {
      const qy = query(
        this.closedCol(),
        where("pair", "==", this.pair),
        orderBy("closedAt", "desc"),
        limit(200)
      );

      const snap = await getDocs(qy);
      const hist = [];
      snap.forEach(d => {
        const t = d.data() || {};
        t.id = t.id || d.id;
        hist.push(t);
      });

      window.dispatchEvent(new CustomEvent("qt_history_loaded", { detail: hist }));
    } catch (_) {
      window.dispatchEvent(new CustomEvent("qt_history_loaded", { detail: [] }));
    }
  }

  async openTrade(dir /* up/down */) {
    if (!this.user) {
      alert("لازم تسجل دخول عشان نحفظ الصفقات على Firebase.");
      return;
    }

    const pair = this.chart.currentPair;
    const entry = +this.chart.currentPrice;
    const openedAt = nowMs();
    const durationSec = Math.max(1, +this.chart.selectedTime || 5);
    const expiresAt = openedAt + durationSec * 1000;

    // amount from UI
    const amountEl = document.getElementById("amountDisplay");
    const stake = parseFloat(String(amountEl?.value || "50").replace(/[^0-9.]/g, "")) || 50;

    const tradeId = `${openedAt}_${Math.random().toString(16).slice(2)}`;

    const trade = {
      id: tradeId,
      pair,
      dir: (dir === "up") ? "up" : "down",
      entry,
      stake,
      payout: payoutForPair(pair),
      amountTxt: String(stake),
      flags: flagsFromPair(pair),
      openedAt,
      expiresAt,

      // marker positioning
      markerCandleTimestamp: Math.floor(openedAt / this.chart.timeframe) * this.chart.timeframe,

      createdAt: serverTimestamp()
    };

    await setDoc(doc(db, "users", this.user.uid, "qt_trades_active", tradeId), trade, { merge: true });

    // add marker instantly
    this.chart.addTradeMarker(trade);
  }

  async settleExpired() {
    if (!this.user) return;
    const list = Array.isArray(this._active) ? this._active : [];
    const now = nowMs();

    const expired = list.filter(t => (+t.expiresAt || 0) <= now);
    for (const t of expired) {
      await this.closeTrade(t.id).catch(() => {});
    }
  }

  async closeTrade(tradeId) {
    if (!this.user) return;

    const activeRef = doc(db, "users", this.user.uid, "qt_trades_active", tradeId);
    const snap = await getDoc(activeRef);
    if (!snap.exists()) return;

    const t = snap.data() || {};
    const closePrice = +this.chart.currentPrice;
    const entry = +t.entry;
    const dir = (t.dir === "up") ? "up" : "down";
    const isWin = (dir === "up") ? (closePrice >= entry) : (closePrice <= entry);

    const profitLoss = isWin ? (+t.stake * +t.payout) : (-Math.abs(+t.stake));

    const closedTrade = {
      ...t,
      closePrice,
      closedAt: nowMs(),
      result: isWin ? "win" : "loss",
      profitLoss,
      open: false
    };

    const batch = writeBatch(db);
    batch.set(doc(db, "users", this.user.uid, "qt_trades_closed", tradeId), closedTrade, { merge: true });
    batch.delete(activeRef);
    await batch.commit();

    // send event to history panel
    window.dispatchEvent(new CustomEvent("qt_trade_closed", { detail: { trade: closedTrade } }));
  }
}

/* ===================== Time/Amount UI (selectedTime real seconds) ===================== */
function initTimeAmountUI(chart) {
  const timeSelector = document.getElementById("timeSelector");
  const timeDropdown = document.getElementById("timeDropdown");
  const timeDisplay = document.getElementById("timeDisplay");
  const tabCompensation = document.getElementById("tabCompensation");
  const tabCustom = document.getElementById("tabCustom");
  const compensationList = document.getElementById("compensationList");

  let isEditing = false;
  let savedTimeValue = "00:05";

  function setEditing(on) {
    isEditing = !!on;
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

  timeSelector?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!isEditing) timeDropdown?.classList.toggle("show");
  });

  document.addEventListener("click", () => {
    timeDropdown?.classList.remove("show");
    if (isEditing) {
      timeDisplay.textContent = savedTimeValue;
      setEditing(false);
    }
  });

  timeDropdown?.addEventListener("click", (e) => e.stopPropagation());

  tabCompensation?.addEventListener("click", () => {
    tabCompensation.classList.add("active");
    tabCustom.classList.remove("active");
    if (compensationList) compensationList.style.display = "grid";
    if (isEditing) {
      timeDisplay.textContent = savedTimeValue;
      setEditing(false);
    }
  });

  tabCustom?.addEventListener("click", () => {
    tabCustom.classList.add("active");
    tabCompensation.classList.remove("active");
    if (compensationList) compensationList.style.display = "none";
    timeDisplay.textContent = "";
    setEditing(true);
  });

  compensationList?.addEventListener("click", (e) => {
    if (e.target.classList.contains("dropdown-item")) {
      savedTimeValue = e.target.textContent.trim();
      timeDisplay.textContent = savedTimeValue;
      chart.selectedTime = parseInt(e.target.getAttribute("data-sec"), 10) || 5;
      timeDropdown.classList.remove("show");
    }
  });

  timeDisplay?.addEventListener("input", () => {
    if (!isEditing) return;
    let v = timeDisplay.textContent.replace(/[^0-9]/g, "");
    if (v.length > 4) v = v.slice(0, 4);
    timeDisplay.textContent = v;
  });

  timeDisplay?.addEventListener("blur", () => {
    if (!isEditing) return;
    let v = timeDisplay.textContent.replace(/[^0-9]/g, "");
    if (v.length === 0) v = "0005";
    v = v.padStart(4, "0");

    const mm = v.slice(0, 2);
    const ss = v.slice(2, 4);

    savedTimeValue = `${mm}:${ss}`;
    timeDisplay.textContent = savedTimeValue;

    const totalSec = (parseInt(mm, 10) || 0) * 60 + (parseInt(ss, 10) || 0);
    chart.selectedTime = totalSec > 0 ? totalSec : 5;

    setEditing(false);
  });
}

/* ===================== Boot ===================== */
window.chart = new AdvancedTradingChart();
window.chart.loop();

// init first pair
await window.chart.initForPair("EUR/USD");

// init trades manager global
window.__qtTrades = new QtTradesManager(window.chart);

// time UI
initTimeAmountUI(window.chart);

// buy/sell => open real trade (saved + restored + closes by time)
document.getElementById("buyBtn")?.addEventListener("click", () => window.__qtTrades.openTrade("up"));
document.getElementById("sellBtn")?.addEventListener("click", () => window.__qtTrades.openTrade("down"));

/* ===================== expose for pairPanel script ===================== */
window.chart.switchPair = window.chart.switchPair.bind(window.chart);
