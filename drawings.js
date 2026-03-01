/* ════════════════════════════════════════════════════════════════
   DRAWINGS / INDICATORS PANEL  v3.1
   ✅ ثيم ذهبي كامل
   ✅ خط الاتجاه يظهر فورًا في منتصف الشارت المرئي الحالي
   ✅ لا يظهر أي نص تعليمات عند إضافة خط الاتجاه
   ✅ Badge صغير جداً وواضح — عند إغلاقه يُحذف الخط كليًا
   ✅ الشارت يتوقف تمامًا أثناء سحب/مط الخط
   ✅ Bollinger Bands يتفعل باللون الأزرق (ثاني من اليمين)
   ✅ مؤشر فراكتالز (Williams Fractals)
════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ══════════════════════════════════════════════
     CONSTANTS
  ══════════════════════════════════════════════ */
  const TOOL = { NONE: "none" };

  const LINE_COLORS = [
    { name: "ذهبي",  value: "#ffd700" },
    { name: "أبيض",  value: "#ffffff" },
    { name: "أخضر", value: "#00dd00" },
    { name: "أحمر", value: "#ff3333" },
    { name: "أزرق", value: "#4aa3ff" },
    { name: "وردي", value: "#ff69b4" },
  ];

  const BB_FILL_COLORS = [
    { name: "ذهبي",    fill: "rgba(255,215,0,0.10)",  line: "rgba(255,215,0,0.75)"  },
    { name: "أزرق",    fill: "rgba(74,163,255,0.10)",  line: "rgba(74,163,255,0.80)" },
    { name: "أخضر",   fill: "rgba(0,221,0,0.10)",     line: "rgba(0,221,0,0.75)"    },
    { name: "بنفسجي", fill: "rgba(160,80,255,0.10)",  line: "rgba(160,80,255,0.75)" },
    { name: "رمادي",  fill: "rgba(180,180,200,0.08)", line: "rgba(180,180,200,0.5)" },
  ];

  const DRAWINGS_MENU = [
    { key: "hline",     label: "خط أفقي",           icon: "—•—" },
    { key: "vline",     label: "خط رأسي",            icon: "│•"  },
    { key: "ray",       label: "شعاع",               icon: "⟍•" },
    { key: "fib",       label: "ارتدادات فيبوناتشي", icon: "≋"   },
    { key: "fan",       label: "مروحة فيبوناتشي",    icon: "⟋⟋" },
    { key: "trendline", label: "خط الاتجاه",         icon: "⟍•" },
    { key: "parallel",  label: "قناة موازية",        icon: "∥"   },
    { key: "rect",      label: "مستطيل",             icon: "▭"   },
    { key: "pitchfork", label: "شوكة أندروز",         icon: "⑂"   },
  ];

  /* ══════════════════════════════════════════════
     HELPERS
  ══════════════════════════════════════════════ */
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function uid() {
    return "d_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
  }

  function getRelPos(el, cx, cy) {
    const r = el.getBoundingClientRect();
    return { x: cx - r.left, y: cy - r.top };
  }

  function distPtSeg(px, py, x1, y1, x2, y2) {
    const vx = x2 - x1, vy = y2 - y1, wx = px - x1, wy = py - y1;
    const c1 = vx * wx + vy * wy;
    if (c1 <= 0) return Math.hypot(px - x1, py - y1);
    const c2 = vx * vx + vy * vy;
    if (c2 <= c1) return Math.hypot(px - x2, py - y2);
    const b = c1 / c2;
    return Math.hypot(px - (x1 + b * vx), py - (y1 + b * vy));
  }

  function safeClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText)
        return navigator.clipboard.writeText(text);
    } catch (e) {}
    return new Promise((res) => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;left:-9999px;top:-9999px;";
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta);
      res();
    });
  }

  function ensureRelative(el) {
    if (el && getComputedStyle(el).position === "static")
      el.style.position = "relative";
  }

  function getCloses(chart) {
    const data = chart.candles || chart.data || chart.ohlc || [];
    return data.map((c) => {
      if (!c) return 0;
      return typeof c === "number" ? c : c.close || c.c || c[4] || c[3] || 0;
    });
  }

  function getHighsLows(chart) {
    const data = chart.candles || chart.data || chart.ohlc || [];
    const highs = [], lows = [];
    data.forEach((c) => {
      if (!c) { highs.push(0); lows.push(0); return; }
      if (typeof c === "number") { highs.push(c); lows.push(c); return; }
      highs.push(c.high || c.h || c[2] || c.close || c.c || 0);
      lows.push(c.low  || c.l || c[3] || c.close || c.c || 0);
    });
    return { highs, lows };
  }

  function getSpacing(chart) {
    return chart.getSpacing
      ? chart.getSpacing()
      : chart.spacing || chart.candleWidth || chart.barWidth || 8;
  }

  function getOffset(chart) {
    return chart.offset || chart.scrollOffset || chart.viewOffset || 0;
  }

  /* ══════════════════════════════════════════════
     WAIT FOR CHART READY
  ══════════════════════════════════════════════ */
  (function waitReady() {
    if (
      window.chart &&
      window.chart.canvas &&
      window.chart.ctx &&
      window.chart.plot
    ) {
      init(window.chart);
    } else {
      setTimeout(waitReady, 60);
    }
  })();

  /* ══════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════ */
  function init(chart) {
    ensureRelative(chart.plot);
    injectCSS();

    /* ★ BB يتفعل تلقائيًا باللون الأزرق (index 1) */
    const indState = {
      bb: {
        active: true,
        fill: BB_FILL_COLORS[1].fill,
        line: BB_FILL_COLORS[1].line,
      },
      frac: {
        active: false,
      },
    };

    const ui      = buildUI(chart, indState);
    const drawing = buildDrawingEngine(chart, ui, indState);

    patchChartDraw(chart, drawing, indState);
    hookIndicatorsButton(ui);
    hookOutsideClose(ui);
    hookPointerHandlers(chart, drawing, ui);

    window.__drawings = { ui, drawing, indState };
  }

  /* ══════════════════════════════════════════════
     CSS
  ══════════════════════════════════════════════ */
  function injectCSS() {
    if (document.getElementById("__dw_css")) return;
    const s = document.createElement("style");
    s.id = "__dw_css";
    s.textContent = `
/* ────── Global font baseline ────── */
#dwOverlay,#dwBadge,#dwPop{
  font-family:'Segoe UI',Tahoma,Arial,sans-serif;
  direction:rtl;
}

/* ────── Overlay ────── */
#dwOverlay{
  position:absolute;inset:0;z-index:260;
  display:none;pointer-events:none;
}
#dwOverlay.show{display:block;pointer-events:auto;}

#dwBackdrop{
  position:absolute;inset:0;
  background:rgba(4,8,20,.45);
  backdrop-filter:blur(8px);
}

/* ────── Panel ────── */
#dwPanel{
  position:absolute;
  left:10px;right:10px;top:12px;
  margin:0 auto;max-width:480px;
  background:linear-gradient(175deg,#0c1120 0%,#070d1a 100%);
  border:2px solid #ffd700;
  border-radius:18px;
  box-shadow:
    0 0 0 1px rgba(255,215,0,.06),
    0 22px 65px rgba(0,0,0,.75),
    inset 0 1px 0 rgba(255,215,0,.14);
  overflow:hidden;
  transform:translateY(-14px);opacity:0;
  transition:transform .22s cubic-bezier(.22,1,.36,1),opacity .22s ease;
  max-height:80vh;
  overflow-y:auto;
}
#dwPanel::-webkit-scrollbar{width:4px;}
#dwPanel::-webkit-scrollbar-track{background:transparent;}
#dwPanel::-webkit-scrollbar-thumb{background:rgba(255,215,0,.25);border-radius:99px;}

#dwOverlay.show #dwPanel{transform:translateY(0);opacity:1;}

/* ────── Panel Header ────── */
#dwHead{
  display:flex;align-items:center;justify-content:space-between;
  padding:14px 14px 11px;
  background:linear-gradient(90deg,rgba(255,215,0,.10) 0%,transparent 100%);
  border-bottom:1.5px solid rgba(255,215,0,.18);
  position:sticky;top:0;z-index:2;
  backdrop-filter:blur(12px);
}
#dwHeadTitle{
  font-size:13px;font-weight:900;color:#ffd700;
  letter-spacing:.6px;
}
#dwCloseBtn{
  width:33px;height:33px;border-radius:9px;
  border:1.5px solid rgba(255,215,0,.30);
  background:rgba(255,215,0,.07);
  color:#ffd700;font-size:19px;line-height:1;
  cursor:pointer;display:grid;place-items:center;
}
#dwCloseBtn:active{transform:scale(.95);}

/* ────── Section Labels ────── */
.dwSec{
  padding:9px 14px 5px;
  font-size:9.5px;font-weight:900;
  color:rgba(255,215,0,.55);
  letter-spacing:1.4px;text-transform:uppercase;
  border-bottom:1px solid rgba(255,215,0,.09);
  margin:0 10px;
}

/* ────── Drawings & Indicators Lists ────── */
#dwList,#dwIndList{
  padding:5px 10px 8px;
  display:flex;flex-direction:column;gap:3px;
}

/* ────── Menu Item ────── */
.dwItem{
  display:flex;align-items:center;gap:9px;
  padding:7px 10px;border-radius:10px;
  cursor:pointer;color:#d4ddf5;
  border:1.5px solid transparent;
  background:rgba(255,255,255,.013);
  transition:background .14s,border-color .14s;
}
.dwItem:hover{
  background:rgba(255,215,0,.07);
  border-color:rgba(255,215,0,.22);
}
.dwItem .ico{
  width:20px;height:20px;
  display:grid;place-items:center;
  font-size:10px;font-weight:900;
  color:rgba(255,215,0,.72);
  flex-shrink:0;
}
.dwItem .lbl{
  font-size:11.5px;font-weight:700;
  flex:1;letter-spacing:.1px;
  color:#c8d4ef;
}
.dwItem.sel .lbl{color:#ffd700;}
.dwItem.sel{
  background:rgba(255,215,0,.07);
  border-color:rgba(255,215,0,.24);
}
.dwItem.activeKey .lbl{
  color:#ffd700;
  text-shadow:0 0 8px rgba(255,215,0,.35);
}

/* ────── Indicator: Toggle ────── */
.tgWrap{display:flex;align-items:center;gap:7px;}
.tgBtn{
  width:34px;height:18px;border-radius:9px;
  border:1.5px solid rgba(255,215,0,.28);
  background:rgba(255,255,255,.05);
  cursor:pointer;position:relative;
  transition:background .2s,border-color .2s;
  flex-shrink:0;
}
.tgBtn.on{background:#ffd700;border-color:#ffd700;}
.tgBtn::after{
  content:'';
  position:absolute;top:2px;left:2px;
  width:11px;height:11px;border-radius:50%;
  background:rgba(255,255,255,.45);
  transition:transform .2s;
}
.tgBtn.on::after{transform:translateX(15px);background:#000;}

/* ────── BB color dots ────── */
.bbColorRow{
  display:none;
  gap:6px;padding:5px 0 2px 0;
  flex-wrap:wrap;align-items:center;
}
.bbColorRow.show{display:flex;}
.bbColorRow .cLbl{
  font-size:9px;font-weight:900;
  color:rgba(255,215,0,.55);
  margin-left:4px;
}
.bbCDot{
  width:15px;height:15px;border-radius:50%;
  border:2px solid rgba(255,255,255,.12);
  cursor:pointer;transition:transform .15s;
}
.bbCDot:hover{transform:scale(1.15);}
.bbCDot.sel{
  outline:2.5px solid rgba(255,215,0,.85);
  outline-offset:2px;
}

/* ════════════════════════════════════════════
   ★ BADGE — صغير جداً وواضح
════════════════════════════════════════════ */
#dwBadge{
  position:absolute;
  top:8px;
  left:8px;
  z-index:270;
  display:none;
  align-items:center;
  gap:5px;
  padding:3px 7px 3px 5px;
  border-radius:7px;
  border:1px solid rgba(255,215,0,.45);
  background:rgba(7,13,26,0.88);
  box-shadow:0 3px 12px rgba(0,0,0,.55),0 0 0 1px rgba(255,215,0,.06);
  backdrop-filter:blur(8px);
  pointer-events:auto;
}
#dwBadge.show{display:flex;}

#dwBadgeName{
  font-size:9px;
  font-weight:800;
  color:#ffd700;
  white-space:nowrap;
  cursor:pointer;
  user-select:none;
  letter-spacing:.3px;
}
#dwBadgeX{
  width:16px;height:16px;
  border-radius:5px;
  border:1px solid rgba(255,80,80,.40);
  background:rgba(255,80,80,.10);
  color:#ff7777;
  font-weight:900;
  font-size:11px;
  cursor:pointer;
  display:grid;
  place-items:center;
  line-height:1;
  flex-shrink:0;
  transition:background .14s;
}
#dwBadgeX:hover{background:rgba(255,80,80,.22);}
#dwBadgeX:active{transform:scale(.93);}

/* ────── Popover Settings ────── */
#dwPop{
  position:absolute;top:calc(100% + 6px);left:0;
  width:260px;border-radius:13px;
  border:1.5px solid rgba(255,215,0,.22);
  background:linear-gradient(175deg,#0c1120,#070d1a);
  box-shadow:0 16px 45px rgba(0,0,0,.7);
  padding:11px;display:none;z-index:30;
}
#dwPop.show{display:block;}

.pRow{
  display:flex;align-items:center;
  justify-content:space-between;
  gap:8px;margin-bottom:9px;
}
.pLabel{
  font-size:10px;font-weight:900;
  color:rgba(255,215,0,.8);letter-spacing:.5px;
}
.pBtns{display:flex;gap:6px;align-items:center;}

.pBtn{
  padding:6px 10px;border-radius:9px;
  border:1.5px solid rgba(255,215,0,.25);
  background:rgba(255,215,0,.06);
  color:#ffd700;font-weight:900;font-size:10px;
  cursor:pointer;transition:background .14s,transform .1s;
}
.pBtn:hover{background:rgba(255,215,0,.11);}
.pBtn:active{transform:scale(.96);}
.pBtn.prim{
  background:linear-gradient(135deg,#ffd700,#c49000);
  color:#000;border:0;
}
.pBtn.prim:hover{background:linear-gradient(135deg,#ffe033,#d4a000);}
.pBtn.dng{
  border-color:rgba(255,80,80,.22);
  color:#ff7777;background:rgba(255,80,80,.06);
}
.pBtn.dng:hover{background:rgba(255,80,80,.12);}

.pColorDots{display:flex;gap:6px;align-items:center;flex-wrap:wrap;}
.pCDot{
  width:16px;height:16px;border-radius:50%;
  border:2px solid rgba(255,255,255,.14);
  cursor:pointer;transition:transform .15s;
}
.pCDot:hover{transform:scale(1.15);}
.pCDot.sel{
  outline:2.5px solid rgba(255,215,0,.75);
  outline-offset:2px;
}
.pNote{
  margin-top:5px;font-size:9px;
  color:rgba(170,190,255,.6);line-height:1.5;
}

/* ── مربعات النصوص الذهبية ── */
.dw-input{
  background:rgba(255,215,0,.04);
  border:1.5px solid rgba(255,215,0,.28);
  border-radius:8px;color:#ffd700;
  padding:5px 9px;
  font-size:11px;font-weight:700;
  outline:none;
  transition:border-color .15s,box-shadow .15s;
}
.dw-input:focus{
  border-color:rgba(255,215,0,.65);
  box-shadow:0 0 0 3px rgba(255,215,0,.12);
}
`;
    document.head.appendChild(s);
  }

  /* ══════════════════════════════════════════════
     BUILD UI
  ══════════════════════════════════════════════ */
  function buildUI(chart, indState) {
    const plot = chart.plot;

    /* ── Overlay ── */
    const overlay = document.createElement("div");
    overlay.id = "dwOverlay";
    overlay.innerHTML = `
      <div id="dwBackdrop"></div>
      <div id="dwPanel" dir="rtl" lang="ar">
        <div id="dwHead">
          <div id="dwHeadTitle">🎨 الأدوات والمؤشرات</div>
          <button id="dwCloseBtn" aria-label="إغلاق">×</button>
        </div>

        <div class="dwSec">✏️ الرسومات</div>
        <div id="dwList"></div>

        <div class="dwSec">📊 المؤشرات</div>
        <div id="dwIndList"></div>
      </div>
    `;
    plot.appendChild(overlay);

    /* ── Fill Drawing List ── */
    const dwList = overlay.querySelector("#dwList");
    dwList.innerHTML = DRAWINGS_MENU.map(
      (it) => `
      <div class="dwItem" data-key="${it.key}">
        <div class="ico">${it.icon}</div>
        <div class="lbl">${it.label}</div>
      </div>`
    ).join("");

    /* ── Fill Indicators List ── */
    const dwIndList = overlay.querySelector("#dwIndList");
    dwIndList.innerHTML = `
      <!-- Bollinger Bands -->
      <div class="dwItem" data-ind="bb" style="flex-direction:column;align-items:stretch;gap:0;">
        <div style="display:flex;align-items:center;gap:9px;width:100%;">
          <div class="ico" style="font-size:9px;font-weight:900;letter-spacing:-0.5px;color:rgba(255,215,0,.72);">BB</div>
          <div class="lbl" style="flex:1;">
            Bollinger Bands
            <span style="font-size:9px;opacity:.5;font-weight:600;">(20, 2)</span>
          </div>
          <div class="tgWrap">
            <div class="tgBtn ${indState.bb.active ? 'on' : ''}" id="bbToggle"></div>
          </div>
        </div>
        <div class="bbColorRow ${indState.bb.active ? 'show' : ''}" id="bbColors">
          <span class="cLbl">لون:</span>
          ${BB_FILL_COLORS.map(
            (c, i) => `
            <div class="bbCDot ${i === 1 ? "sel" : ""}"
                 data-fill="${c.fill}" data-line="${c.line}"
                 title="${c.name}"
                 style="background:${c.line};"></div>`
          ).join("")}
        </div>
      </div>

      <!-- Fractals -->
      <div class="dwItem" data-ind="frac" style="flex-direction:column;align-items:stretch;gap:0;">
        <div style="display:flex;align-items:center;gap:9px;width:100%;">
          <div class="ico" style="font-size:12px;font-weight:900;color:rgba(255,215,0,.72);">⟨⟩</div>
          <div class="lbl" style="flex:1;">
            فراكتالز
            <span style="font-size:9px;opacity:.5;font-weight:600;">(Williams)</span>
          </div>
          <div class="tgWrap">
            <div class="tgBtn" id="fracToggle"></div>
          </div>
        </div>
      </div>
    `;

    /* ── Badge + Popover ── */
    const badge = document.createElement("div");
    badge.id = "dwBadge";
    badge.innerHTML = `
      <div id="dwBadgeName" title="اضغط للإعدادات">✏️ خط الاتجاه</div>
      <button id="dwBadgeX" aria-label="حذف الخط" title="حذف الخط">×</button>
      <div id="dwPop">
        <div class="pRow">
          <div class="pLabel">السُمك</div>
          <div class="pBtns">
            <button class="pBtn" id="pwMinus">−</button>
            <button class="pBtn" id="pwPlus">+</button>
          </div>
        </div>
        <div class="pRow">
          <div class="pLabel">اللون</div>
          <div class="pColorDots" id="pColorDots">
            ${LINE_COLORS.map(
              (c) => `<div class="pCDot" data-c="${c.value}"
                        title="${c.name}"
                        style="background:${c.value};"></div>`
            ).join("")}
          </div>
        </div>
        <div class="pRow">
          <div class="pBtns" style="width:100%;justify-content:space-between;">
            <button class="pBtn" id="pBtnCopy">نسخ</button>
            <button class="pBtn prim" id="pBtnDup">تكرار</button>
            <button class="pBtn dng" id="pBtnClose">إخفاء</button>
          </div>
        </div>
        <div class="pNote">💡 اسحب الدائرتين لتمديد • اسحب الوسط للتحريك</div>
      </div>
    `;
    plot.appendChild(badge);

    /* ── Gather refs ── */
    const el = {
      overlay,
      panel:       overlay.querySelector("#dwPanel"),
      backdrop:    overlay.querySelector("#dwBackdrop"),
      closeBtn:    overlay.querySelector("#dwCloseBtn"),
      dwList,
      dwIndList,
      badge,
      badgeName:   badge.querySelector("#dwBadgeName"),
      badgeX:      badge.querySelector("#dwBadgeX"),
      pop:         badge.querySelector("#dwPop"),
      pwMinus:     badge.querySelector("#pwMinus"),
      pwPlus:      badge.querySelector("#pwPlus"),
      pColorDots:  badge.querySelector("#pColorDots"),
      pBtnCopy:    badge.querySelector("#pBtnCopy"),
      pBtnDup:     badge.querySelector("#pBtnDup"),
      pBtnClose:   badge.querySelector("#pBtnClose"),
      bbToggle:    dwIndList.querySelector("#bbToggle"),
      bbColors:    dwIndList.querySelector("#bbColors"),
      fracToggle:  dwIndList.querySelector("#fracToggle"),
    };

    /* ── Panel events ── */
    el.closeBtn.addEventListener("click",  () => hideOverlay(el));
    el.backdrop.addEventListener("click",  () => hideOverlay(el));

    /* ── Badge name click → toggle popover ── */
    el.badgeName.addEventListener("click", (e) => {
      e.stopPropagation();
      el.pop.classList.toggle("show");
    });

    /* ── "إخفاء" button inside popover → just close popover ── */
    el.pBtnClose.addEventListener("click", (e) => {
      e.stopPropagation();
      el.pop.classList.remove("show");
    });

    /* ════════════════════════════════════════════
       ★ زر X في Badge → يحذف الخط كليًا من الشارت
    ════════════════════════════════════════════ */
    el.badgeX.addEventListener("click", (e) => {
      e.stopPropagation();
      el.pop.classList.remove("show");

      if (window.__drawings && window.__drawings.drawing) {
        const eng   = window.__drawings.drawing;
        const selId = eng.state.selectedId;
        if (selId) {
          /* حذف الخط من المصفوفة */
          eng.state.drawings = eng.state.drawings.filter((d) => d.id !== selId);
        }
        eng.deselect();
      }
      hideBadge(el);
    });

    /* ── BB Toggle ── */
    el.bbToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      indState.bb.active = !indState.bb.active;
      el.bbToggle.classList.toggle("on", indState.bb.active);
      el.bbColors.classList.toggle("show", indState.bb.active);
    });

    /* ── BB Color Dots ── */
    el.bbColors.addEventListener("click", (e) => {
      const dot = e.target.closest(".bbCDot");
      if (!dot) return;
      el.bbColors.querySelectorAll(".bbCDot").forEach((d) => d.classList.remove("sel"));
      dot.classList.add("sel");
      indState.bb.fill = dot.dataset.fill;
      indState.bb.line = dot.dataset.line;
    });

    /* ── Fractals Toggle ── */
    el.fracToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      indState.frac.active = !indState.frac.active;
      el.fracToggle.classList.toggle("on", indState.frac.active);
    });

    return el;
  }

  function showOverlay(ui) { ui.overlay.classList.add("show"); }
  function hideOverlay(ui) { ui.overlay.classList.remove("show"); }
  function showBadge(ui, name) { ui.badgeName.textContent = name; ui.badge.classList.add("show"); }
  function hideBadge(ui)       { ui.badge.classList.remove("show"); }

  function hookIndicatorsButton(ui) {
    const btn =
      document.querySelector('.quick-actions button[aria-label="Options"]') || null;
    if (!btn) { console.warn("[drawings] Options button not found"); return; }
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      showOverlay(ui);
    });
  }

  function hookOutsideClose(ui) {
    document.addEventListener("click", (e) => {
      if (
        ui.pop.classList.contains("show") &&
        !e.target.closest("#dwBadge")
      ) {
        ui.pop.classList.remove("show");
      }
    });
  }

  /* ══════════════════════════════════════════════
     BOLLINGER BANDS — حساب
  ══════════════════════════════════════════════ */
  function calcBB(closes, period, mult) {
    const upper = [], lower = [], mid = [];
    for (let i = period - 1; i < closes.length; i++) {
      const slice = closes.slice(i - period + 1, i + 1);
      const sma = slice.reduce((a, b) => a + b, 0) / period;
      const variance =
        slice.reduce((a, b) => a + Math.pow(b - sma, 2), 0) / period;
      const sd = Math.sqrt(variance);
      upper.push({ i, v: sma + mult * sd });
      lower.push({ i, v: sma - mult * sd });
      mid.push({ i, v: sma });
    }
    return { upper, lower, mid };
  }

  /* ══════════════════════════════════════════════
     BOLLINGER BANDS — رسم (بدون فلترة)
  ══════════════════════════════════════════════ */
  function drawBollingerBands(ctx, chart, indState) {
    if (!indState.bb.active) return;

    const closes = getCloses(chart);
    if (closes.length < 22) return;

    const { upper, lower, mid } = calcBB(closes, 20, 2);
    if (upper.length < 2) return;

    const fillColor = indState.bb.fill;
    const lineColor = indState.bb.line;

    ctx.save();

    /* fill */
    ctx.beginPath();
    upper.forEach((p, idx) => {
      const x = chart.indexToX(p.i), y = chart.priceToY(p.v);
      idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    [...lower].reverse().forEach((p) =>
      ctx.lineTo(chart.indexToX(p.i), chart.priceToY(p.v))
    );
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    /* الخط العلوي */
    ctx.beginPath();
    upper.forEach((p, idx) => {
      const x = chart.indexToX(p.i), y = chart.priceToY(p.v);
      idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    /* الخط السفلي */
    ctx.beginPath();
    lower.forEach((p, idx) => {
      const x = chart.indexToX(p.i), y = chart.priceToY(p.v);
      idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    /* الوسط — متقطع */
    ctx.beginPath();
    mid.forEach((p, idx) => {
      const x = chart.indexToX(p.i), y = chart.priceToY(p.v);
      idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = lineColor.replace(/[\d.]+\)$/, "0.35)");
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  }

  /* ══════════════════════════════════════════════
     FRACTALS — حساب ورسم
  ══════════════════════════════════════════════ */
  function calcFractals(chart) {
    const { highs, lows } = getHighsLows(chart);
    const bullFractals = [];
    const bearFractals = [];

    for (let i = 2; i < highs.length - 2; i++) {
      const h = highs[i];
      if (
        h > 0 &&
        h > highs[i - 1] && h > highs[i - 2] &&
        h > highs[i + 1] && h > highs[i + 2]
      ) {
        bearFractals.push({ i, v: h });
      }
      const l = lows[i];
      if (
        l > 0 &&
        l < lows[i - 1] && l < lows[i - 2] &&
        l < lows[i + 1] && l < lows[i + 2]
      ) {
        bullFractals.push({ i, v: l });
      }
    }
    return { bullFractals, bearFractals };
  }

  function drawArrowUp(ctx, x, y, sz, color) {
    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.beginPath();
    ctx.moveTo(x,      y - sz * 1.1);
    ctx.lineTo(x - sz, y + sz * 0.55);
    ctx.lineTo(x + sz, y + sz * 0.55);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.30)";
    ctx.lineWidth = 0.7;
    ctx.stroke();
    ctx.restore();
  }

  function drawArrowDown(ctx, x, y, sz, color) {
    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.beginPath();
    ctx.moveTo(x,      y + sz * 1.1);
    ctx.lineTo(x - sz, y - sz * 0.55);
    ctx.lineTo(x + sz, y - sz * 0.55);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.30)";
    ctx.lineWidth = 0.7;
    ctx.stroke();
    ctx.restore();
  }

  function drawFractals(ctx, chart, indState) {
    if (!indState.frac.active) return;

    const { bullFractals, bearFractals } = calcFractals(chart);
    const SZ     = 5.5;
    const OFFSET = 12;

    ctx.save();

    for (const f of bearFractals) {
      const x = chart.indexToX(f.i);
      const y = chart.priceToY(f.v) - OFFSET;
      drawArrowDown(ctx, x, y, SZ, "#ff4444");
    }

    for (const f of bullFractals) {
      const x = chart.indexToX(f.i);
      const y = chart.priceToY(f.v) + OFFSET;
      drawArrowUp(ctx, x, y, SZ, "#00cc88");
    }

    ctx.restore();
  }

  /* ══════════════════════════════════════════════
     DRAWING ENGINE
  ══════════════════════════════════════════════ */
  function buildDrawingEngine(chart, ui, indState) {
    const state = {
      tool: TOOL.NONE,
      drawings: [],
      selectedId: null,
      dragging: null,
    };

    /* ── Coordinate helpers ── */
    function getPR() {
      return chart.getPriceRange ? chart.getPriceRange() : chart.priceRange;
    }
    function yToP(y) {
      const r = getPR();
      if (!r) return 0;
      const n = clamp(1 - y / (chart.h || chart.canvas.height), 0, 1);
      return r.min + n * (r.max - r.min);
    }
    function xToIdx(x) {
      if (chart.xToIndex) return chart.xToIndex(x);
      const sp = Math.max(getSpacing(chart), 1);
      return getOffset(chart) + x / sp;
    }
    function toData(x, y) {
      return { i: xToIdx(x), p: yToP(y) };
    }
    function handles(d) {
      const ax = chart.indexToX(d.a.i), ay = chart.priceToY(d.a.p);
      const bx = chart.indexToX(d.b.i), by = chart.priceToY(d.b.p);
      return { ax, ay, bx, by, mx: (ax + bx) / 2, my: (ay + by) / 2 };
    }

    /* ── Hit areas ── */
    const HIT_H = 22;
    const HIT_L = 16;
    const VIS_H = 6.5;

    function hitTest(x, y) {
      const sel = state.drawings.find((d) => d.id === state.selectedId);
      if (sel) {
        const h = handles(sel);
        if (Math.hypot(x - h.ax, y - h.ay) <= HIT_H) return { kind: "handleA", id: sel.id };
        if (Math.hypot(x - h.bx, y - h.by) <= HIT_H) return { kind: "handleB", id: sel.id };
        if (Math.hypot(x - h.mx, y - h.my) <= HIT_H) return { kind: "handleM", id: sel.id };
      }
      for (let i = state.drawings.length - 1; i >= 0; i--) {
        const d = state.drawings[i];
        if (d.type !== "trendline") continue;
        const h = handles(d);
        if (distPtSeg(x, y, h.ax, h.ay, h.bx, h.by) <= HIT_L)
          return { kind: "line", id: d.id };
      }
      return null;
    }

    /* ── select / deselect ── */
    function select(id) {
      state.selectedId = id;
      if (id) {
        const d = state.drawings.find((dd) => dd.id === id);
        if (d && d.type === "trendline")
          showBadge(ui, "✏️ خط الاتجاه");
      } else {
        hideBadge(ui);
      }
      syncPop();
    }

    function deselect() {
      state.selectedId = null;
      hideBadge(ui);
      ui.pop.classList.remove("show");
      syncPop();
    }

    function syncPop() {
      const sel = state.drawings.find((d) => d.id === state.selectedId);
      ui.pColorDots.querySelectorAll(".pCDot").forEach((n) =>
        n.classList.toggle("sel", !!sel && n.dataset.c === sel.color)
      );
    }

    function setTool(name) {
      state.tool = TOOL.NONE;
      state.dragging = null;
      state.selectedId = null;
      hideBadge(ui);
      ui.pop.classList.remove("show");
      ui.dwList.querySelectorAll(".dwItem").forEach((n) =>
        n.classList.remove("activeKey")
      );
    }

    function addLine(a, b) {
      const d = {
        id: uid(), type: "trendline",
        a: { i: a.i, p: a.p },
        b: { i: b.i, p: b.p },
        color: "#ffd700",
        width: 2.2,
      };
      state.drawings.push(d);
      select(d.id);
      return d;
    }

    /* ════════════════════════════════════════════
       ★ createDefaultLine
       يضع الخط في منتصف المنطقة المرئية الحالية
       بدقة باستخدام toData() مباشرة
    ════════════════════════════════════════════ */
    function createDefaultLine() {
      try {
        const cw   = chart.canvas ? chart.canvas.width  : (chart.w || 800);
        const ch   = chart.canvas ? chart.canvas.height : (chart.h || 400);

        /* مركز الشارت بالبكسل */
        const cx   = cw / 2;
        const cy   = ch / 2;
        /* امتداد أفقي (ربع العرض من كل طرف) */
        const span = Math.max(cw / 5, 60);

        /* تحويل البكسل → إحداثيات البيانات */
        const a = toData(cx - span, cy);
        const b = toData(cx + span, cy);

        return addLine(a, b);
      } catch (_) {
        return addLine({ i: 10, p: 100 }, { i: 30, p: 100 });
      }
    }

    function duplicate() {
      const sel = state.drawings.find((d) => d.id === state.selectedId);
      if (!sel) return;
      const pr = getPR();
      const dp  = pr ? (pr.max - pr.min) * 0.01 : 1;
      const copy = {
        ...sel, id: uid(),
        a: { i: sel.a.i + 2, p: sel.a.p + dp },
        b: { i: sel.b.i + 2, p: sel.b.p + dp },
      };
      state.drawings.push(copy);
      select(copy.id);
    }

    function copyLine() {
      const sel = state.drawings.find((d) => d.id === state.selectedId);
      if (!sel) return;
      safeClipboard(JSON.stringify(sel, null, 2));
    }

    /* ════════════════════════════════════════════
       ★ Menu click — لا يظهر أي toast
    ════════════════════════════════════════════ */
    ui.dwList.addEventListener("click", (e) => {
      const row = e.target.closest(".dwItem");
      if (!row) return;
      const key = row.getAttribute("data-key");
      if (key === "trendline") {
        createDefaultLine();   /* ← يضهر فوراً في المكان الحالي */
        hideOverlay(ui);
        /* ★ لا showInfoToast هنا إطلاقاً */
      } else {
        if (window.showInfoToast)
          window.showInfoToast("⏳ ستتوفر هذه الأداة قريبًا", "info", 2000);
      }
    });

    /* ── Popover controls ── */
    ui.pwMinus.addEventListener("click", (e) => {
      e.stopPropagation();
      const sel = state.drawings.find((d) => d.id === state.selectedId);
      if (sel) sel.width = clamp(sel.width - 0.4, 1.2, 6.0);
    });
    ui.pwPlus.addEventListener("click", (e) => {
      e.stopPropagation();
      const sel = state.drawings.find((d) => d.id === state.selectedId);
      if (sel) sel.width = clamp(sel.width + 0.4, 1.2, 6.0);
    });
    ui.pColorDots.addEventListener("click", (e) => {
      const dot = e.target.closest(".pCDot");
      if (!dot) return;
      const sel = state.drawings.find((d) => d.id === state.selectedId);
      if (!sel) return;
      sel.color = dot.dataset.c;
      syncPop();
    });
    ui.pBtnDup.addEventListener("click",  (e) => { e.stopPropagation(); duplicate(); });
    ui.pBtnCopy.addEventListener("click", (e) => { e.stopPropagation(); copyLine();  });

    /* ══ RENDER ══ */
    function drawAll(ctx) {
      for (const d of state.drawings)
        if (d.type === "trendline")
          drawTrendline(ctx, d, d.id === state.selectedId);
    }

    function drawTrendline(ctx, d, selected) {
      const h = handles(d);
      ctx.save();

      if (selected) {
        ctx.shadowColor  = d.color || "#ffd700";
        ctx.shadowBlur   = 10;
        ctx.globalAlpha  = 0.18;
        ctx.lineWidth    = (d.width || 2.2) + 6;
        ctx.strokeStyle  = d.color || "#ffd700";
        ctx.beginPath();
        ctx.moveTo(h.ax, h.ay);
        ctx.lineTo(h.bx, h.by);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.globalAlpha = 0.96;
      ctx.lineWidth   = d.width || 2.2;
      ctx.strokeStyle = d.color || "#ffd700";
      ctx.beginPath();
      ctx.moveTo(h.ax, h.ay);
      ctx.lineTo(h.bx, h.by);
      ctx.stroke();

      if (selected) {
        drawHandle(ctx, h.ax, h.ay, VIS_H,       d.color || "#ffd700", false);
        drawHandle(ctx, h.bx, h.by, VIS_H,       d.color || "#ffd700", false);
        drawHandle(ctx, h.mx, h.my, VIS_H * 0.8, "#ffffff",            true);
      }

      ctx.restore();
    }

    function drawHandle(ctx, x, y, r, color, filled) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      if (filled) {
        ctx.fillStyle   = color;
        ctx.globalAlpha = 0.95;
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,.4)";
        ctx.lineWidth   = 1.5;
        ctx.stroke();
      } else {
        ctx.fillStyle   = "rgba(10,15,35,.85)";
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth   = 2;
        ctx.globalAlpha = 0.95;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, r * 0.32, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
      ctx.restore();
    }

    /* ══ POINTER HANDLERS ══ */
    function onPointerDown(x, y) {
      if (ui.overlay.classList.contains("show")) return { consumed: false };

      const hit = hitTest(x, y);
      if (hit) {
        select(hit.id);
        const sel = state.drawings.find((d) => d.id === hit.id);
        if (sel) {
          const mode = hit.kind === "line" ? "handleM" : hit.kind;
          state.dragging = {
            mode, id: hit.id,
            start: { x, y },
            orig:  JSON.parse(JSON.stringify(sel)),
          };
        }
        return { consumed: true };
      }
      deselect();
      return { consumed: false };
    }

    function onPointerMove(x, y) {
      if (!state.dragging) return false;
      const d = state.drawings.find((dd) => dd.id === state.dragging.id);
      if (!d) { state.dragging = null; return false; }

      const orig = state.dragging.orig;
      if (!orig) return true;

      if (state.dragging.mode === "handleA") {
        const a = toData(x, y); d.a.i = a.i; d.a.p = a.p; return true;
      }
      if (state.dragging.mode === "handleB") {
        const b = toData(x, y); d.b.i = b.i; d.b.p = b.p; return true;
      }
      if (state.dragging.mode === "handleM") {
        const dx = x - state.dragging.start.x;
        const di = dx / getSpacing(chart);
        const dp = yToP(y) - yToP(state.dragging.start.y);
        d.a.i = orig.a.i + di; d.b.i = orig.b.i + di;
        d.a.p = orig.a.p + dp; d.b.p = orig.b.p + dp;
        return true;
      }
      return true;
    }

    function onPointerUp() {
      if (!state.dragging) return false;
      state.dragging = null;
      return true;
    }

    return { state, drawAll, setTool, deselect, onPointerDown, onPointerMove, onPointerUp };
  }

  /* ══════════════════════════════════════════════
     PATCH CHART DRAW
  ══════════════════════════════════════════════ */
  function patchChartDraw(chart, drawing, indState) {
    if (chart.__dwPatched) return;
    chart.__dwPatched = true;
    const orig = chart.draw.bind(chart);
    chart.draw = function () {
      orig();
      try { drawBollingerBands(chart.ctx, chart, indState); } catch (e) {}
      try { drawFractals(chart.ctx, chart, indState);       } catch (e) {}
      try { drawing.drawAll(chart.ctx);                     } catch (e) {}
    };
  }

  /* ══════════════════════════════════════════════
     POINTER HANDLERS
     ★ يوقف الشارت تمامًا أثناء السحب:
       1- stopImmediatePropagation في capture phase
       2- canvas.style.pointerEvents = "none" أثناء الدراج
       3- Blocker يستلم كل الأحداث
  ══════════════════════════════════════════════ */
  function hookPointerHandlers(chart, drawing, ui) {
    const canvas  = chart.canvas;
    const plot    = chart.plot;

    /* ── Blocker div ── */
    const blocker = document.createElement("div");
    Object.assign(blocker.style, {
      position:    "absolute",
      inset:       "0",
      zIndex:      "255",
      display:     "none",
      touchAction: "none",
      cursor:      "crosshair",
    });
    plot.appendChild(blocker);

    /* ════════════════════════════════════════════
       ★ activate: يعطّل أحداث الـ canvas تمامًا
         حتى لا يتحرك الشارت أثناء السحب
    ════════════════════════════════════════════ */
    function activate(pid) {
      blocker.style.display = "block";
      /* منع الشارت من استقبال أي حدث pointermove/pointerup */
      canvas.style.pointerEvents = "none";
      try { blocker.setPointerCapture(pid); } catch (e) {}
    }

    function deactivate() {
      blocker.style.display   = "none";
      canvas.style.pointerEvents = "auto";
    }

    /* ── canvas: pointerdown (capture phase أعلى أولوية) ── */
    canvas.addEventListener(
      "pointerdown",
      (e) => {
        if (e.button === 2) return;
        const p   = getRelPos(canvas, e.clientX, e.clientY);
        const res = drawing.onPointerDown(p.x, p.y);
        if (res && res.consumed) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          activate(e.pointerId);
        }
      },
      { capture: true, passive: false }
    );

    /* ── canvas: pointermove — يمنع التحريك عند الدراج ── */
    canvas.addEventListener(
      "pointermove",
      (e) => {
        if (drawing.state.dragging) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
      },
      { capture: true, passive: false }
    );

    /* ── blocker: pointermove ── */
    blocker.addEventListener(
      "pointermove",
      (e) => {
        const p = getRelPos(canvas, e.clientX, e.clientY);
        drawing.onPointerMove(p.x, p.y);
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      },
      { passive: false }
    );

    /* ── blocker: pointerup ── */
    blocker.addEventListener(
      "pointerup",
      (e) => {
        drawing.onPointerUp();
        deactivate();
        e.preventDefault();
        e.stopPropagation();
      },
      { passive: false }
    );

    /* ── blocker: pointercancel ── */
    blocker.addEventListener("pointercancel", () => {
      drawing.onPointerUp();
      deactivate();
    });

    /* ── ESC ── */
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        ui.overlay.classList.remove("show");
        ui.pop.classList.remove("show");
      }
    });
  }
})();
