/* ════════════════════════════════════════════════════════════════
   DRAWINGS / INDICATORS PANEL + TRENDLINE TOOL
   - UI مطابق لروح الصورة (الرسومات + X + قائمة)
   - Trendline داخل نفس Canvas (مش Overlay فوق الشارت)
   - 3 نقاط: يسار/يمين للتمديد + وسط للتحريك
   - Badge جنب زر الحقيبة + Popover إعدادات (سُمك/لون/نسخ/تكرار/إغلاق)
   ════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const TOOL = {
    NONE: "none",
    TRENDLINE: "trendline",
  };

  const COLORS = [
    { name: "ذهبي", value: "#ffd700" },
    { name: "أبيض", value: "#ffffff" },
    { name: "أخضر", value: "#00dd00" },
    { name: "أحمر", value: "#ff3333" },
    { name: "أزرق", value: "#4aa3ff" },
  ];

  const DRAWINGS_MENU = [
    { key: "hline", label: "خط أفقي", icon: "—•—" },
    { key: "vline", label: "خط رأسي", icon: "│•" },
    { key: "ray", label: "شعاع", icon: "⟍•" },
    { key: "fib", label: "ارتدادات فيبوناتشي", icon: "≋" },
    { key: "fan", label: "مروحة فيبوناتشي", icon: "⟋⟋" },
    { key: "trendline", label: "خط الاتجاه", icon: "⟍•" },
    { key: "parallel", label: "قناة موازية", icon: "∥" },
    { key: "rect", label: "مستطيل", icon: "▭" },
    { key: "pitchfork", label: "شوكة أندروز", icon: "⑂" },
  ];

  // ---------- Helpers ----------
  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function uid() {
    return (
      "d_" +
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 9)
    );
  }

  function raf(fn) {
    requestAnimationFrame(fn);
  }

  function getRelPos(el, clientX, clientY) {
    const r = el.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  }

  function distPointToSegment(px, py, x1, y1, x2, y2) {
    const vx = x2 - x1,
      vy = y2 - y1;
    const wx = px - x1,
      wy = py - y1;

    const c1 = vx * wx + vy * wy;
    if (c1 <= 0) return Math.hypot(px - x1, py - y1);

    const c2 = vx * vx + vy * vy;
    if (c2 <= c1) return Math.hypot(px - x2, py - y2);

    const b = c1 / c2;
    const bx = x1 + b * vx;
    const by = y1 + b * vy;
    return Math.hypot(px - bx, py - by);
  }

  function safeClipboardWrite(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      }
    } catch (e) {}
    // fallback
    return new Promise((resolve) => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand("copy");
      } catch (e) {}
      document.body.removeChild(ta);
      resolve();
    });
  }

  function ensurePlotRelative(chart) {
    if (!chart || !chart.plot) return;
    const pos = getComputedStyle(chart.plot).position;
    if (pos === "static") chart.plot.style.position = "relative";
  }

  // ---------- Main init wait ----------
  function waitReady() {
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
  }
  waitReady();

  // ---------- Init ----------
  function init(chart) {
    ensurePlotRelative(chart);
    injectCSS();
    const ui = buildUI(chart);
    const drawing = buildDrawingEngine(chart, ui);

    // Patch draw to render drawings on top
    patchChartDraw(chart, drawing);

    // Hook options button (المؤشرات/الرسومات)
    hookIndicatorsButton(ui);

    // Close panel on outside click (داخل نفس الشارت)
    hookOutsideClose(ui);

    // Pointer handling (capture) so it doesn't conflict with pan/zoom
    hookPointerHandlers(chart, drawing, ui);

    // Expose for debugging if needed
    window.__drawings = { ui, drawing };
  }

  // ---------- CSS ----------
  function injectCSS() {
    if (document.getElementById("__drawings_css")) return;
    const s = document.createElement("style");
    s.id = "__drawings_css";
    s.textContent = `
/* Overlay داخل الشارت */
#drawingsOverlay{
  position:absolute;
  inset:0;
  z-index:260; /* أعلى من الرسم، أقل من أي Skeleton=9999 */
  display:none;
}
#drawingsOverlay.show{ display:block; }

#drawingsBackdrop{
  position:absolute;
  inset:0;
  background:rgba(8,12,28,.35);
  backdrop-filter: blur(6px);
}

#drawingsPanel{
  position:absolute;
  left:12px;
  right:12px;
  top:14px;
  margin:auto;
  max-width:520px;
  background:linear-gradient(180deg, rgba(18,25,46,.98), rgba(13,16,32,.98));
  border:2.5px solid rgba(255,215,0,.22);
  border-radius:16px;
  box-shadow:0 18px 55px rgba(0,0,0,.65), 0 0 24px rgba(255,215,0,.08);
  overflow:hidden;
  transform: translateY(-10px);
  opacity:0;
  transition: transform .22s ease, opacity .22s ease;
}
#drawingsOverlay.show #drawingsPanel{
  transform: translateY(0);
  opacity:1;
}

#drawingsHead{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:14px 14px 10px;
  color:#e9eefc;
  font-weight:900;
  font-size:16px;
}
#drawingsClose{
  width:40px;height:40px;
  border-radius:10px;
  border:2px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.06);
  color:#cfd7ef;
  font-size:22px;
  cursor:pointer;
}
#drawingsClose:active{ transform:scale(.97); }

#drawingsList{
  padding:8px 10px 14px;
  display:flex;
  flex-direction:column;
  gap:4px;
}
.drowItem{
  display:flex;
  align-items:center;
  gap:12px;
  padding:12px 12px;
  border-radius:12px;
  cursor:pointer;
  color:#e9eefc;
  border:1.5px solid rgba(255,255,255,.06);
  background:rgba(255,255,255,.02);
}
.drowItem:hover{
  background:rgba(255,215,0,.06);
  border-color:rgba(255,215,0,.18);
}
.drowItem .ico{
  width:28px;height:28px;
  display:grid;
  place-items:center;
  font-weight:900;
  color:#cfd7ef;
  opacity:.95;
}
.drowItem .txt{
  font-size:18px;
  font-weight:800;
  letter-spacing:.2px;
  flex:1;
}
.drowItem.active{
  background:rgba(255,255,255,.06);
  border-color:rgba(255,255,255,.10);
}
.drowItem.active .txt{ color:#ffffff; }
.drowItem.active{
  box-shadow: inset 0 0 0 999px rgba(255,255,255,.02);
}
.drowItem.sel{
  background:rgba(255,255,255,.08);
}

/* Badge جنب زر الحقيبة */
#activeToolBadge{
  position:absolute;
  top:52px;           /* نفس مكان quick-actions تقريبًا */
  left:62px;          /* 8 + 46 + 8 */
  z-index:210;
  display:none;
  align-items:center;
  gap:8px;
  padding:8px 10px;
  border-radius:12px;
  border:2px solid rgba(255,215,0,.25);
  background:linear-gradient(135deg, rgba(18,25,46,.95), rgba(13,16,32,.95));
  box-shadow:0 10px 26px rgba(0,0,0,.55);
  max-width:260px;
}
#activeToolBadge.show{ display:flex; }

#activeToolName{
  font-size:12px;
  font-weight:900;
  color:#ffd700;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
  cursor:pointer;
}
#activeToolX{
  width:26px;height:26px;
  border-radius:9px;
  border:2px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.06);
  color:#dbe3ff;
  font-weight:900;
  cursor:pointer;
  display:grid;
  place-items:center;
  line-height:1;
}
#activeToolX:active{ transform:scale(.97); }

/* Popover إعدادات */
#toolPopover{
  position:absolute;
  top:calc(100% + 8px);
  left:0;
  width:280px;
  border-radius:14px;
  border:2px solid rgba(255,215,0,.18);
  background:linear-gradient(180deg, rgba(18,25,46,.98), rgba(13,16,32,.98));
  box-shadow:0 16px 44px rgba(0,0,0,.65);
  padding:10px;
  display:none;
}
#toolPopover.show{ display:block; }

.tpRow{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  margin-bottom:8px;
}
.tpLabel{
  font-size:11px;
  font-weight:900;
  color:rgba(255,215,0,.85);
}
.tpBtns{
  display:flex; gap:7px; align-items:center;
}
.tpBtn{
  padding:7px 10px;
  border-radius:10px;
  border:2px solid rgba(255,215,0,.20);
  background:rgba(255,215,0,.06);
  color:#ffd700;
  font-weight:900;
  font-size:11px;
  cursor:pointer;
}
.tpBtn:active{ transform:scale(.98); }
.tpBtn.primary{
  background:linear-gradient(135deg,#ffd700,#b8860b);
  color:#000;
  border:0;
}
.tpBtn.danger{
  border-color:rgba(255,80,80,.25);
  color:#ff7777;
  background:rgba(255,80,80,.07);
}
.colorDots{
  display:flex; gap:7px; align-items:center;
}
.cDot{
  width:18px;height:18px;border-radius:999px;
  border:2px solid rgba(255,255,255,.16);
  cursor:pointer;
}
.cDot.sel{
  outline:2px solid rgba(255,215,0,.7);
  outline-offset:2px;
}
.smallNote{
  margin-top:6px;
  font-size:10px;
  color:rgba(217,230,255,.7);
}
`;
    document.head.appendChild(s);
  }

  // ---------- UI ----------
  function buildUI(chart) {
    const plot = chart.plot;

    const overlay = document.createElement("div");
    overlay.id = "drawingsOverlay";

    overlay.innerHTML = `
      <div id="drawingsBackdrop"></div>
      <div id="drawingsPanel" dir="rtl" lang="ar">
        <div id="drawingsHead">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="font-size:18px;font-weight:900;">الرسومات</div>
          </div>
          <button id="drawingsClose" aria-label="Close">×</button>
        </div>
        <div id="drawingsList"></div>
      </div>
    `;

    plot.appendChild(overlay);

    // Badge
    const badge = document.createElement("div");
    badge.id = "activeToolBadge";
    badge.innerHTML = `
      <div id="activeToolName" title="اضغط للإعدادات"></div>
      <button id="activeToolX" aria-label="Close tool">×</button>
      <div id="toolPopover">
        <div class="tpRow">
          <div class="tpLabel">السُمك</div>
          <div class="tpBtns">
            <button class="tpBtn" id="wMinus">-</button>
            <button class="tpBtn" id="wPlus">+</button>
          </div>
        </div>

        <div class="tpRow">
          <div class="tpLabel">اللون</div>
          <div class="colorDots" id="colorDots"></div>
        </div>

        <div class="tpRow">
          <div class="tpBtns" style="width:100%;justify-content:space-between;">
            <button class="tpBtn" id="btnCopy">نسخ</button>
            <button class="tpBtn primary" id="btnDup">تكرار</button>
            <button class="tpBtn danger" id="btnHidePop">إغلاق</button>
          </div>
        </div>

        <div class="smallNote">نصيحة: ارسم بسحب إصبعك/الماوس من نقطة البداية للنهاية.</div>
      </div>
    `;
    plot.appendChild(badge);

    // Fill list
    const list = overlay.querySelector("#drawingsList");
    list.innerHTML = DRAWINGS_MENU.map((it) => {
      const activeClass = it.key === "trendline" ? "active" : "";
      return `
        <div class="drowItem ${activeClass}" data-key="${it.key}">
          <div class="ico">${it.icon}</div>
          <div class="txt">${it.label}</div>
        </div>
      `;
    }).join("");

    const el = {
      overlay,
      panel: overlay.querySelector("#drawingsPanel"),
      backdrop: overlay.querySelector("#drawingsBackdrop"),
      closeBtn: overlay.querySelector("#drawingsClose"),
      list,
      badge,
      badgeName: badge.querySelector("#activeToolName"),
      badgeX: badge.querySelector("#activeToolX"),
      pop: badge.querySelector("#toolPopover"),
      wMinus: badge.querySelector("#wMinus"),
      wPlus: badge.querySelector("#wPlus"),
      colorDots: badge.querySelector("#colorDots"),
      btnCopy: badge.querySelector("#btnCopy"),
      btnDup: badge.querySelector("#btnDup"),
      btnHidePop: badge.querySelector("#btnHidePop"),
    };

    // Colors UI
    el.colorDots.innerHTML = COLORS.map(
      (c) => `<div class="cDot" data-color="${c.value}" title="${c.name}" style="background:${c.value}"></div>`
    ).join("");

    // Close panel
    el.closeBtn.addEventListener("click", () => hideOverlay(el));
    el.backdrop.addEventListener("click", () => hideOverlay(el));

    // Badge popover toggle
    el.badgeName.addEventListener("click", (e) => {
      e.stopPropagation();
      el.pop.classList.toggle("show");
    });

    el.btnHidePop.addEventListener("click", (e) => {
      e.stopPropagation();
      el.pop.classList.remove("show");
    });

    // Badge close tool
    el.badgeX.addEventListener("click", (e) => {
      e.stopPropagation();
      el.pop.classList.remove("show");
      hideBadge(el);
      // tool off handled by engine
      if (window.__drawings && window.__drawings.drawing) {
        window.__drawings.drawing.setTool(TOOL.NONE);
      }
    });

    return el;
  }

  function showOverlay(ui) {
    ui.overlay.classList.add("show");
  }
  function hideOverlay(ui) {
    ui.overlay.classList.remove("show");
  }
  function showBadge(ui, name) {
    ui.badgeName.textContent = name;
    ui.badge.classList.add("show");
  }
  function hideBadge(ui) {
    ui.badge.classList.remove("show");
    ui.badgeName.textContent = "";
  }

  function hookIndicatorsButton(ui) {
    const btn =
      document.querySelector('.quick-actions button[aria-label="Options"]') ||
      null;

    if (!btn) {
      console.warn("Indicators/Options button not found.");
      return;
    }

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      showOverlay(ui);
    });
  }

  function hookOutsideClose(ui) {
    // لو ضغط برا البوب أوفر نخفيه
    document.addEventListener("click", (e) => {
      if (!ui.badge.classList.contains("show")) return;
      if (ui.pop.classList.contains("show") && !e.target.closest("#activeToolBadge")) {
        ui.pop.classList.remove("show");
      }
    });
  }

  // ---------- Drawing Engine ----------
  function buildDrawingEngine(chart, ui) {
    const state = {
      tool: TOOL.NONE,
      drawings: [],
      selectedId: null,
      dragging: null, // {mode, id, start:{x,y}, orig}
      creating: null, // {id}
      lastPointerId: null,
    };

    function getRange() {
      return chart.getPriceRange ? chart.getPriceRange() : chart.priceRange;
    }

    function yToPrice(y) {
      const r = getRange();
      const n = clamp(1 - y / chart.h, 0, 1);
      return r.min + n * (r.max - r.min);
    }

    function toData(x, y) {
      return {
        i: chart.xToIndex(x),
        p: yToPrice(y),
      };
    }

    function getHandles(d) {
      const ax = chart.indexToX(d.a.i),
        ay = chart.priceToY(d.a.p);
      const bx = chart.indexToX(d.b.i),
        by = chart.priceToY(d.b.p);
      const mx = (ax + bx) / 2,
        my = (ay + by) / 2;
      return { ax, ay, bx, by, mx, my };
    }

    function hitTest(x, y) {
      // handles first (if selected)
      const sel = state.drawings.find((d) => d.id === state.selectedId);
      if (sel) {
        const h = getHandles(sel);
        const R = 10;
        if (Math.hypot(x - h.ax, y - h.ay) <= R) return { kind: "handleA", id: sel.id };
        if (Math.hypot(x - h.bx, y - h.by) <= R) return { kind: "handleB", id: sel.id };
        if (Math.hypot(x - h.mx, y - h.my) <= R) return { kind: "handleM", id: sel.id };
      }

      // line hit test for all
      const tol = 8;
      for (let i = state.drawings.length - 1; i >= 0; i--) {
        const d = state.drawings[i];
        if (d.type !== "trendline") continue;
        const h = getHandles(d);
        const dist = distPointToSegment(x, y, h.ax, h.ay, h.bx, h.by);
        if (dist <= tol) return { kind: "line", id: d.id };
      }
      return null;
    }

    function select(id) {
      state.selectedId = id;
      syncPopoverFromSelected();
    }

    function deselect() {
      state.selectedId = null;
      syncPopoverFromSelected();
    }

    function setTool(toolName) {
      state.tool = toolName;
      if (toolName === TOOL.NONE) {
        ui.pop.classList.remove("show");
        hideBadge(ui);
        state.creating = null;
        state.dragging = null;
      }
      if (toolName === TOOL.TRENDLINE) {
        showBadge(ui, "خط الاتجاه");
        // highlight menu item
        ui.list.querySelectorAll(".drowItem").forEach((n) => n.classList.remove("sel"));
        const it = ui.list.querySelector('.drowItem[data-key="trendline"]');
        if (it) it.classList.add("sel");
      }
    }

    function syncPopoverFromSelected() {
      const sel = state.drawings.find((d) => d.id === state.selectedId);
      ui.btnDup.disabled = !sel;
      ui.btnCopy.disabled = !sel;
      if (!sel) {
        // remove selected dots
        ui.colorDots.querySelectorAll(".cDot").forEach((n) => n.classList.remove("sel"));
        return;
      }
      // color dots
      ui.colorDots.querySelectorAll(".cDot").forEach((n) => {
        n.classList.toggle("sel", n.getAttribute("data-color") === sel.color);
      });
    }

    function addTrendline(a, b) {
      const d = {
        id: uid(),
        type: "trendline",
        a: { i: a.i, p: a.p },
        b: { i: b.i, p: b.p },
        color: "#ffd700",
        width: 2.2,
      };
      state.drawings.push(d);
      select(d.id);
      return d;
    }

    function duplicateSelected() {
      const sel = state.drawings.find((d) => d.id === state.selectedId);
      if (!sel) return;

      // offset بسيط
      const r = getRange();
      const dp = (r.max - r.min) * 0.01;
      const di = 2;

      const copy = {
        ...sel,
        id: uid(),
        a: { i: sel.a.i + di, p: sel.a.p + dp },
        b: { i: sel.b.i + di, p: sel.b.p + dp },
      };
      state.drawings.push(copy);
      select(copy.id);
      if (window.showInfoToast) window.showInfoToast("✅ تم تكرار خط الاتجاه", "info", 2200);
    }

    function copySelected() {
      const sel = state.drawings.find((d) => d.id === state.selectedId);
      if (!sel) return;
      const payload = JSON.stringify(sel, null, 2);
      safeClipboardWrite(payload).then(() => {
        if (window.showInfoToast) window.showInfoToast("✅ تم نسخ إعدادات الخط", "info", 2200);
      });
    }

    // UI menu click
    ui.list.addEventListener("click", (e) => {
      const row = e.target.closest(".drowItem");
      if (!row) return;
      const key = row.getAttribute("data-key");

      if (key === "trendline") {
        setTool(TOOL.TRENDLINE);
        hideOverlay(ui);
        if (window.showInfoToast) window.showInfoToast("🎯 اختر نقطة البداية واسحب للنهاية", "info", 2500);
      } else {
        // باقي الأدوات شكل فقط حالياً (حسب طلبك ركز على خط الاتجاه)
        if (window.showInfoToast) window.showInfoToast("⏳ الأداة دي هتتفعّل قريبًا", "info", 2000);
      }
    });

    // Popover controls
    ui.wMinus.addEventListener("click", (e) => {
      e.stopPropagation();
      const sel = state.drawings.find((d) => d.id === state.selectedId);
      if (!sel) return;
      sel.width = clamp(sel.width - 0.4, 1.2, 6.0);
    });

    ui.wPlus.addEventListener("click", (e) => {
      e.stopPropagation();
      const sel = state.drawings.find((d) => d.id === state.selectedId);
      if (!sel) return;
      sel.width = clamp(sel.width + 0.4, 1.2, 6.0);
    });

    ui.colorDots.addEventListener("click", (e) => {
      const dot = e.target.closest(".cDot");
      if (!dot) return;
      const sel = state.drawings.find((d) => d.id === state.selectedId);
      if (!sel) return;
      sel.color = dot.getAttribute("data-color");
      syncPopoverFromSelected();
    });

    ui.btnDup.addEventListener("click", (e) => {
      e.stopPropagation();
      duplicateSelected();
    });

    ui.btnCopy.addEventListener("click", (e) => {
      e.stopPropagation();
      copySelected();
    });

    // Render
    function drawAll(ctx) {
      // trendlines
      for (const d of state.drawings) {
        if (d.type !== "trendline") continue;
        drawTrendline(ctx, d, d.id === state.selectedId);
      }
    }

    function drawTrendline(ctx, d, selected) {
      const h = getHandles(d);

      ctx.save();
      ctx.lineWidth = d.width || 2.2;
      ctx.strokeStyle = d.color || "#ffd700";
      ctx.globalAlpha = 0.95;

      // خط الاتجاه
      ctx.beginPath();
      ctx.moveTo(h.ax, h.ay);
      ctx.lineTo(h.bx, h.by);
      ctx.stroke();

      // نقاط التحكم (3)
      if (selected) {
        const R = 6.5;

        // endpoints
        drawHandle(ctx, h.ax, h.ay, R, d.color, false);
        drawHandle(ctx, h.bx, h.by, R, d.color, false);

        // mid
        drawHandle(ctx, h.mx, h.my, R, "#ffffff", true);

        // subtle glow
        ctx.shadowColor = "rgba(255,215,0,.25)";
        ctx.shadowBlur = 10;
      }

      ctx.restore();
    }

    function drawHandle(ctx, x, y, r, color, filled) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(0,0,0,.55)";
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255,255,255,.28)";
      ctx.stroke();

      if (filled) {
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.95;
        ctx.fill();
      } else {
        ctx.fillStyle = "rgba(255,255,255,.12)";
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.2;
        ctx.stroke();
      }
      ctx.restore();
    }

    // Interaction
    function onPointerDown(x, y, pointerId) {
      state.lastPointerId = pointerId;

      // لو الـ panel مفتوح، متتعاملش مع الشارت
      if (ui.overlay.classList.contains("show")) return { consumed: true };

      // create trendline by drag
      if (state.tool === TOOL.TRENDLINE) {
        const a = toData(x, y);
        const d = addTrendline(a, a);
        state.creating = { id: d.id };
        state.dragging = {
          mode: "createB",
          id: d.id,
        };
        return { consumed: true };
      }

      // selection / drag handles
      const hit = hitTest(x, y);
      if (hit) {
        select(hit.id);
        if (hit.kind === "line") {
          // مجرد تحديد
          return { consumed: true };
        }

        const sel = state.drawings.find((d) => d.id === hit.id);
        if (!sel) return { consumed: true };

        const orig = JSON.parse(JSON.stringify(sel));
        state.dragging = {
          mode: hit.kind,
          id: hit.id,
          start: { x, y },
          orig,
        };
        return { consumed: true };
      }

      // click empty -> deselect (بس من غير ما نمنع سحب الشارت)
      deselect();
      return { consumed: false };
    }

    function onPointerMove(x, y) {
      if (!state.dragging) return false;

      const d = state.drawings.find((dd) => dd.id === state.dragging.id);
      if (!d) return true;

      // create end point while dragging
      if (state.dragging.mode === "createB") {
        const b = toData(x, y);
        d.b.i = b.i;
        d.b.p = b.p;
        return true;
      }

      const orig = state.dragging.orig;
      if (!orig) return true;

      if (state.dragging.mode === "handleA") {
        const a = toData(x, y);
        d.a.i = a.i;
        d.a.p = a.p;
        return true;
      }

      if (state.dragging.mode === "handleB") {
        const b = toData(x, y);
        d.b.i = b.i;
        d.b.p = b.p;
        return true;
      }

      if (state.dragging.mode === "handleM") {
        // move whole line (translate)
        const dx = x - state.dragging.start.x;
        const dy = y - state.dragging.start.y;

        // translate in data space:
        const di = dx / chart.getSpacing();
        const r = getRange();
        const dp = (1 - (dy / chart.h)) * (r.max - r.min) - (r.max - r.min); 
        // ↑ ده بيطلع قيمة تقريبية، هنستخدم تحويل أدق:
        const p0 = yToPrice(state.dragging.start.y);
        const p1 = yToPrice(y);
        const dPrice = p1 - p0;

        d.a.i = orig.a.i + di;
        d.b.i = orig.b.i + di;
        d.a.p = orig.a.p + dPrice;
        d.b.p = orig.b.p + dPrice;
        return true;
      }

      return true;
    }

    function onPointerUp() {
      if (!state.dragging) return false;

      // finish create
      if (state.dragging.mode === "createB") {
        const d = state.drawings.find((dd) => dd.id === state.dragging.id);
        if (d) {
          const tooSmall =
            Math.hypot(d.a.i - d.b.i, d.a.p - d.b.p) < 1e-6;
          if (tooSmall) {
            // لو ضغطه بسيطة من غير سحب -> نخليها خط صغير قابل للتعديل
            d.b.i = d.a.i + 3;
          }
          select(d.id);
          if (window.showInfoToast) window.showInfoToast("✅ تم إضافة خط الاتجاه", "info", 2000);
        }
        state.creating = null;
      }

      state.dragging = null;
      return true;
    }

    return {
      state,
      drawAll,
      setTool,
      onPointerDown,
      onPointerMove,
      onPointerUp,
    };
  }

  function patchChartDraw(chart, drawing) {
    if (chart.__drawingsPatched) return;
    chart.__drawingsPatched = true;

    const origDraw = chart.draw.bind(chart);
    chart.draw = function () {
      origDraw();
      // Draw drawings on top
      try {
        drawing.drawAll(chart.ctx);
      } catch (e) {
        // no crash
      }
    };
  }

  // ---------- Pointer handlers (capture) ----------
  function hookPointerHandlers(chart, drawing, ui) {
    const canvas = chart.canvas;

    // IMPORTANT: capture true so we can stop قبل pan/zoom
    canvas.addEventListener(
      "pointerdown",
      (e) => {
        // ignore right click
        if (e.button !== undefined && e.button === 2) return;

        const p = getRelPos(canvas, e.clientX, e.clientY);
        const res = drawing.onPointerDown(p.x, p.y, e.pointerId);

        if (res && res.consumed) {
          try {
            canvas.setPointerCapture(e.pointerId);
          } catch (err) {}

          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
      },
      { capture: true, passive: false }
    );

    canvas.addEventListener(
      "pointermove",
      (e) => {
        const p = getRelPos(canvas, e.clientX, e.clientY);
        const consumed = drawing.onPointerMove(p.x, p.y);
        if (consumed) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
      },
      { capture: true, passive: false }
    );

    canvas.addEventListener(
      "pointerup",
      (e) => {
        const consumed = drawing.onPointerUp();
        if (consumed) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
      },
      { capture: true, passive: false }
    );

    // لو فتحنا overlay وعايز تقفل على ESC (اختياري)
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        ui.overlay.classList.remove("show");
        ui.pop.classList.remove("show");
      }
    });
  }
})();
