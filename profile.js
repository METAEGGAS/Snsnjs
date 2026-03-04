
/* ============================================================
   profile.js  —  Injectable Profile Panel
   ✅ لا يفتح أي شيء تلقائياً عند تحميل الصفحة
   ✅ المحتوى يُحقن ديناميكياً فقط عند استدعاء openProfile()
   ✅ لا توجيه لأي صفحة خارجية أو إعادة تحميل
   ✅ يستخدم Firebase compat SDK الموجود في index.html
   ============================================================ */

(function () {
  'use strict';

  /* ─── STATE ─────────────────────────────────────────────── */
  let _cssInjected  = false;
  let _panelCreated = false;
  let _fbStarted    = false;
  let _uid          = null;   // Firebase full UID
  let _shortId      = null;   // رقم مختصر
  let _unsub        = null;   // Firestore listener

  /* ─── CSS (مُقيَّد بـ #profilePanel لمنع التعارض) ─────── */
  const CSS = `
  #profilePanel{
    position:fixed;inset:0;bottom:60px;
    background:linear-gradient(180deg,#0a0e1a 0%,#080c18 100%);
    z-index:400;
    transform:translateY(110%);
    transition:transform .3s cubic-bezier(.4,0,.2,1);
    display:flex;flex-direction:column;overflow:hidden;
    direction:rtl;font-family:Arial,sans-serif;color:#fff;
  }
  #profilePanel.show{transform:translateY(0)}

  /* ── شريط العنوان ── */
  #profilePanel .P-top{
    background:linear-gradient(135deg,#0d1527 0%,#1a1000 50%,#0d1527 100%);
    border-bottom:2px solid #ffd700;padding:8px 12px 4px;flex-shrink:0;
    box-shadow:0 3px 14px rgba(255,215,0,.12);
  }
  #profilePanel .P-toprow{display:flex;align-items:center;justify-content:space-between;gap:8px}
  #profilePanel .P-close{
    width:34px;height:34px;border-radius:10px;
    background:rgba(255,215,0,.1);border:1.5px solid rgba(255,215,0,.35);
    color:#ffd700;font-size:18px;display:flex;align-items:center;
    justify-content:center;cursor:pointer;font-weight:900;flex-shrink:0;
  }
  #profilePanel .P-title{font-size:14px;font-weight:900;color:#ffd700;text-shadow:0 0 9px rgba(255,215,0,.3)}
  #profilePanel .P-topright{display:flex;align-items:center;gap:6px}
  #profilePanel .P-balpill{
    display:flex;align-items:center;gap:4px;
    background:linear-gradient(135deg,#1a1200,#0d1020);
    border:2px solid #ffd700;border-radius:12px;padding:5px 8px;
    box-shadow:0 3px 12px rgba(255,215,0,.15);
  }
  #profilePanel .P-balpill b{font-size:13px;font-weight:900;color:#ffd700}
  #profilePanel .P-usd{width:18px;height:18px}
  #profilePanel .P-menuBtn{
    width:34px;height:34px;border-radius:10px;
    background:rgba(255,215,0,.08);border:1.5px solid rgba(255,215,0,.3);
    color:#ffd700;font-size:18px;display:flex;align-items:center;
    justify-content:center;cursor:pointer;flex-shrink:0;
  }

  /* ── تبويبات ── */
  #profilePanel .P-tabs{
    display:flex;align-items:center;margin-top:8px;padding:0 2px 4px;
  }
  #profilePanel .P-tab{
    color:rgba(255,215,0,.45);font-size:11px;white-space:nowrap;cursor:pointer;
    position:relative;padding:7px 4px;flex:1;text-align:center;font-weight:700;
    border:none;background:transparent;
  }
  #profilePanel .P-tab.active{color:#ffd700;text-shadow:0 0 8px rgba(255,215,0,.4)}
  #profilePanel .P-tab.active:after{
    content:"";position:absolute;left:0;right:0;bottom:-2px;height:3px;
    border-radius:3px;background:#ffd700;box-shadow:0 0 8px rgba(255,215,0,.5);
  }

  /* ── المحتوى القابل للتمرير ── */
  #profilePanel .P-body{flex:1;overflow-y:auto;padding:12px 12px 16px;-webkit-overflow-scrolling:touch}

  /* ── البطاقات ── */
  #profilePanel .P-card{
    background:#12192e;border:1.5px solid rgba(255,215,0,.2);
    border-radius:14px;padding:14px;margin-bottom:14px;
    box-shadow:0 8px 20px rgba(0,0,0,.4);
  }
  #profilePanel .P-row{display:flex;align-items:center;justify-content:space-between;gap:10px}
  #profilePanel .P-muted{color:rgba(255,215,0,.6);font-size:12px}

  /* ── أزرار ── */
  #profilePanel .P-btn{
    background:rgba(255,215,0,.06);border:1.5px solid rgba(255,215,0,.35);
    color:#e5e7eb;border-radius:10px;padding:9px 13px;
    font-size:12px;cursor:pointer;font-weight:700;transition:.18s;
  }
  #profilePanel .P-btn:hover{background:rgba(255,215,0,.12);border-color:#ffd700}
  #profilePanel .P-btn:active{transform:scale(.98)}
  #profilePanel .P-btn.blue{
    background:linear-gradient(135deg,#ffd700,#b8860b);border-color:#ffd700;
    color:#000;font-weight:900;box-shadow:0 3px 12px rgba(255,215,0,.25);
  }
  #profilePanel .P-btn.green{
    background:linear-gradient(135deg,#22c55e,#16a34a);
    border-color:#22c55e;color:#000;font-weight:900;
  }
  #profilePanel .P-btn.red{
    background:linear-gradient(135deg,#ef4444,#b91c1c);
    border-color:#ef4444;color:#fff;font-weight:900;
  }
  #profilePanel .P-btn.yellow{
    background:linear-gradient(135deg,#f59e0b,#d97706);
    border-color:#f59e0b;color:#000;font-weight:900;
  }

  /* ── حقول الإدخال ── */
  #profilePanel .P-field{margin-top:12px}
  #profilePanel .P-field label{display:block;color:rgba(255,215,0,.6);font-size:12px;margin:0 0 7px;font-weight:700}
  #profilePanel .P-field input,#profilePanel .P-field select{
    width:100%;background:rgba(17,31,53,.65);border:1.5px solid rgba(255,215,0,.3);
    color:#fff;border-radius:10px;padding:11px;outline:none;transition:.2s;font-weight:700;
  }
  #profilePanel .P-field input:focus,#profilePanel .P-field select:focus{
    border-color:#ffd700;box-shadow:0 0 0 3px rgba(255,215,0,.1);
  }

  /* ── بطاقة الصورة الشخصية ── */
  #profilePanel .P-pic{display:flex;align-items:center;justify-content:space-between;gap:12px}
  #profilePanel .P-avatarbox{display:flex;align-items:center;gap:12px}
  #profilePanel .P-avatar{
    width:48px;height:48px;border-radius:12px;background:#0d1020;
    border:2px solid rgba(255,215,0,.35);display:flex;align-items:center;
    justify-content:center;color:rgba(255,215,0,.6);font-size:22px;overflow:hidden;
  }
  #profilePanel .P-avatar img{width:100%;height:100%;object-fit:cover;display:block}

  /* ── التحقق ── */
  #profilePanel .P-vgrid{display:grid;grid-template-columns:1fr;gap:10px}
  #profilePanel .P-vitem{
    display:flex;justify-content:space-between;align-items:center;gap:10px;
    padding:12px;border-radius:12px;background:#0d1020;border:1.5px solid rgba(255,215,0,.2);
  }
  #profilePanel .P-vitem h4{font-size:13px;font-weight:700;color:#fff}
  #profilePanel .P-vitem small{display:block;font-size:11px;margin-top:3px}
  #profilePanel .P-check{color:#22c55e;font-weight:900}
  #profilePanel .P-progbar{width:100%;height:6px;background:#0d1020;border-radius:10px;overflow:hidden;margin-top:10px}
  #profilePanel .P-progfill{height:100%;background:linear-gradient(90deg,#ffd700,#b8860b);border-radius:10px;transition:width .3s}
  #profilePanel .P-note{text-align:center;color:rgba(255,215,0,.6);font-size:12px;line-height:1.8;margin:10px 0;font-weight:700}
  #profilePanel .P-chk{display:flex;align-items:center;gap:10px;margin:14px 0 6px;color:rgba(255,215,0,.8);font-weight:700}
  #profilePanel .P-chk input{width:16px;height:16px;accent-color:#ffd700}
  #profilePanel .P-warn{display:flex;gap:10px;align-items:flex-start;margin-top:14px}
  #profilePanel .P-warn i{
    width:18px;height:18px;border-radius:50%;border:1.5px solid #ffd700;color:#ffd700;
    display:inline-flex;align-items:center;justify-content:center;
    font-style:normal;font-size:12px;flex:0 0 18px;margin-top:2px;
  }
  #profilePanel .P-links{margin-top:10px;display:flex;flex-direction:column;gap:10px;align-items:center}
  #profilePanel .P-links a{color:rgba(255,215,0,.8);text-decoration:none;font-size:13px}
  #profilePanel .P-links a:before{content:"↗ ";opacity:.9}

  /* ── حالات ── */
  #profilePanel .sok{color:#22c55e;font-weight:900}
  #profilePanel .sbad{color:#ef4444;font-weight:900}
  #profilePanel .swarn{color:#ffd700;font-weight:900}

  /* ── مستويات ── */
  #profilePanel .P-rank-hero{
    background:linear-gradient(135deg,#1a1200 0%,#2a1a00 50%,#1a1200 100%);
    border:2px solid #ffd700;border-radius:20px;padding:24px 20px;margin-bottom:20px;
    text-align:center;box-shadow:0 10px 40px rgba(255,215,0,.15);position:relative;overflow:hidden;
  }
  #profilePanel .P-rank-hero h3{font-size:16px;font-weight:700;color:rgba(255,215,0,.8);margin-bottom:12px}
  #profilePanel .P-rank-num{
    font-size:64px;font-weight:900;
    background:linear-gradient(135deg,#ffd700,#f59e0b,#b8860b);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    line-height:1;margin-bottom:8px;
  }
  #profilePanel .P-rank-total{font-size:14px;color:rgba(255,215,0,.7)}
  #profilePanel .P-rank-badge{
    display:inline-block;background:rgba(255,215,0,.12);border:1.5px solid #ffd700;
    color:#ffd700;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;margin-top:12px;
  }
  #profilePanel .P-lv-head{display:flex;align-items:flex-start;justify-content:space-between;margin:8px 0 12px}
  #profilePanel .P-lv-head h2{font-size:20px;font-weight:900;color:#ffd700}
  #profilePanel .P-lv-right{display:flex;flex-direction:column;gap:6px;align-items:flex-end}
  #profilePanel .P-pill{background:#0d1020;border:1.5px solid rgba(255,215,0,.35);color:#ffd700;border-radius:10px;padding:6px 10px;font-size:12px;font-weight:900}
  #profilePanel .P-lv-stats{display:flex;justify-content:space-between;gap:10px;margin:10px 0 14px;color:rgba(255,215,0,.6)}
  #profilePanel .P-stat{flex:1;display:flex;flex-direction:column;gap:4px;align-items:flex-end}
  #profilePanel .P-stat b{color:#ffd700;font-size:14px}
  #profilePanel .P-how{color:rgba(255,215,0,.8);text-decoration:none;font-size:13px}
  #profilePanel .P-how:before{content:"↗ ";opacity:.9}
  #profilePanel .P-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  #profilePanel .P-lcard{background:#12192e;border:1.5px solid rgba(255,215,0,.25);border-radius:16px;padding:18px;min-height:140px;position:relative}
  #profilePanel .P-lcard h3{font-size:22px;font-weight:900;color:#ffd700}
  #profilePanel .P-lmeta{position:absolute;left:16px;top:16px;color:rgba(255,215,0,.6);font-size:12px}
  #profilePanel .P-lmid{margin-top:28px;color:#cbd5e1;font-size:13px;line-height:1.9}
  #profilePanel .P-lbtn{
    margin-top:12px;width:100%;background:linear-gradient(135deg,#ffd700,#b8860b);
    border:0;color:#000;padding:12px 14px;border-radius:12px;
    font-size:14px;cursor:pointer;font-weight:900;box-shadow:0 3px 12px rgba(255,215,0,.3);
  }
  #profilePanel .P-smallcard{
    background:#12192e;border:1.5px solid rgba(255,215,0,.2);
    border-radius:16px;padding:18px;min-height:150px;
    display:flex;flex-direction:column;justify-content:space-between;
  }
  #profilePanel .P-smallcard h4{font-size:22px;font-weight:900;text-align:center;color:#ffd700}
  #profilePanel .P-smrow{display:flex;justify-content:space-between;align-items:center;color:#cbd5e1}
  #profilePanel .P-smrow b{font-size:18px;color:#fff}
  #profilePanel .P-smrow span{font-size:12px;color:rgba(255,215,0,.6)}
  #profilePanel .P-smrow2{display:flex;justify-content:space-between;align-items:center;margin-top:10px}
  #profilePanel .P-smrow2 b{color:#fff}
  #profilePanel .P-smrow2 span{color:rgba(255,215,0,.6);font-size:12px}
  #profilePanel .P-glow{border:2px solid #ffd700 !important;box-shadow:0 0 0 1px rgba(255,215,0,.2),0 0 30px rgba(255,215,0,.15)}

  /* ── موداليات ── */
  #profilePanel .P-modal{
    position:fixed;inset:0;display:none;align-items:flex-end;justify-content:center;
    background:rgba(0,0,0,.65);z-index:9999;
  }
  #profilePanel .P-sheet{
    width:100%;max-width:720px;
    background:linear-gradient(145deg,#12192e,#0d1020);
    border:1.5px solid rgba(255,215,0,.35);border-radius:16px 16px 0 0;
    padding:14px 14px 18px;box-shadow:0 -10px 30px rgba(0,0,0,.5);
  }
  #profilePanel .P-mh{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
  #profilePanel .P-mh b{color:#ffd700;font-size:15px;font-weight:900}
  #profilePanel .P-x{
    width:34px;height:34px;border-radius:10px;background:rgba(255,215,0,.08);
    border:1.5px solid rgba(255,215,0,.35);color:#ffd700;
    display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;
  }
  #profilePanel .P-pm{display:flex;flex-direction:column;gap:10px}
  #profilePanel .P-opt{
    display:flex;align-items:center;justify-content:space-between;gap:12px;
    padding:12px;border-radius:12px;background:#0d1020;
    border:1.5px solid rgba(255,215,0,.2);cursor:pointer;transition:.2s;
  }
  #profilePanel .P-opt:hover{border-color:#ffd700;background:rgba(255,215,0,.05)}
  #profilePanel .P-lx{display:flex;align-items:center;gap:10px;min-width:0}
  #profilePanel .P-ico{display:flex;align-items:center;gap:6px;flex:0 0 auto}
  #profilePanel .P-ico img{width:22px;height:22px;display:block}
  #profilePanel .P-txt{display:flex;flex-direction:column;gap:2px;min-width:0}
  #profilePanel .P-txt span{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#fff;font-weight:700}
  #profilePanel .P-txt small{font-size:11px;color:rgba(255,215,0,.6)}
  #profilePanel .P-ck{color:#ffd700;font-size:14px;opacity:0}
  #profilePanel .P-opt.active .P-ck{opacity:1}
  #profilePanel .P-pwmodal{
    position:fixed;inset:0;display:none;align-items:center;justify-content:center;
    background:rgba(0,0,0,.75);z-index:9999;padding:20px;
  }
  #profilePanel .P-pwbox{
    width:100%;max-width:500px;
    background:linear-gradient(145deg,#12192e,#0d1020);
    border:1.5px solid rgba(255,215,0,.35);border-radius:16px;padding:20px;
    box-shadow:0 10px 40px rgba(0,0,0,.6);
  }
  #profilePanel .P-pwbox h3{font-size:18px;margin-bottom:16px;color:#ffd700}
  #profilePanel .P-closebtn{
    float:left;width:32px;height:32px;border-radius:8px;
    background:rgba(255,215,0,.08);border:1.5px solid rgba(255,215,0,.35);
    color:#ffd700;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px;
  }

  /* ── الشريط الجانبي ── */
  #profilePanel .P-sb{position:fixed;top:0;bottom:60px;right:0;z-index:20000;display:flex;pointer-events:none}
  #profilePanel .P-sb-panel{
    width:300px;max-width:82vw;
    background:linear-gradient(180deg,#0d1527 0%,#0a0e1a 100%);
    border-left:2px solid #ffd700;
    box-shadow:-12px 0 28px rgba(0,0,0,.6);
    transform:translateX(102%);transition:.22s ease;pointer-events:auto;
    padding:14px 14px 16px;
  }
  #profilePanel .P-sb.on{pointer-events:auto}
  #profilePanel .P-sb.on .P-sb-panel{transform:translateX(0)}
  #profilePanel .P-brand{display:flex;align-items:center;gap:10px;margin:4px 0 14px}
  #profilePanel .P-mark{
    width:30px;height:30px;border-radius:9px;background:#0d1020;
    border:1.5px solid rgba(255,215,0,.35);display:flex;align-items:center;
    justify-content:center;color:#ffd700;font-weight:900;font-size:16px;
  }
  #profilePanel .P-brand-name{font-weight:900;font-size:18px;color:#fff}
  #profilePanel .P-brand-name .b{color:#ffd700}
  #profilePanel .P-ucard{
    background:#0d1020;border:1.5px solid rgba(255,215,0,.2);border-radius:14px;
    padding:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;
  }
  #profilePanel .P-ucard .pt{min-width:0}
  #profilePanel .P-ucard .pt b{display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #profilePanel .P-ucard .pt small{display:flex;align-items:center;gap:6px;color:rgba(255,215,0,.6);font-size:12px;margin-top:4px}
  #profilePanel .P-ucard .av{
    width:42px;height:42px;border-radius:12px;background:#0d1020;
    border:1.5px solid rgba(255,215,0,.35);display:flex;align-items:center;
    justify-content:center;overflow:hidden;font-size:20px;
  }
  #profilePanel .P-ucard .av img{width:100%;height:100%;object-fit:cover;display:block}
  #profilePanel .P-nav{margin-top:12px;display:flex;flex-direction:column;gap:10px}
  #profilePanel .P-mi{
    display:flex;align-items:center;justify-content:space-between;gap:12px;
    padding:12px;border-radius:12px;background:transparent;
    border:1.5px solid transparent;color:#dbe3ee;cursor:pointer;transition:.18s;
  }
  #profilePanel .P-mi:hover{background:rgba(255,215,0,.05);border-color:rgba(255,215,0,.2)}
  #profilePanel .P-mi .r{display:flex;align-items:center;gap:10px;min-width:0}
  #profilePanel .P-mi .tx{font-weight:900;font-size:14px;color:#fff}
  #profilePanel .P-mi .ic{width:24px;height:24px;display:flex;align-items:center;justify-content:center}
  #profilePanel .P-mi .ic img{width:100%;height:100%;object-fit:contain;filter:brightness(0) invert(1) sepia(1) saturate(2) hue-rotate(10deg)}
  #profilePanel .P-mi.active{background:linear-gradient(135deg,rgba(255,215,0,.15),rgba(184,134,11,.1));border-color:#ffd700}
  #profilePanel .P-mi.active .tx{color:#ffd700}
  #profilePanel .P-dot{width:8px;height:8px;border-radius:50%;background:#ef4444;display:inline-block;margin-inline-start:6px}
  #prfSbOv{position:fixed;inset:0;bottom:60px;background:rgba(0,0,0,.4);z-index:19999;opacity:0;pointer-events:none;transition:.22s}

  /* ── شرائط المكافآت ── */
  #profilePanel .P-tab-btns{display:flex;gap:8px;background:#0d1020;border:1.5px solid rgba(255,215,0,.2);border-radius:12px;padding:6px}
  #profilePanel .P-sub-btn{flex:1;padding:8px 12px;border-radius:8px;font-size:12px;cursor:pointer;font-weight:700;transition:.18s;text-align:center;border:1.5px solid transparent}
  #profilePanel .P-sub-btn.on{background:rgba(255,215,0,.12);border-color:#ffd700;color:#ffd700}
  #profilePanel .P-sub-btn.off{background:transparent;color:rgba(255,255,255,.5)}

  @media(max-width:520px){
    #profilePanel .P-grid{grid-template-columns:1fr}
    #profilePanel .P-lv-stats{flex-wrap:wrap}
    #profilePanel .P-stat{flex:0 0 48%}
  }
  `;

  /* ─── HTML للبانيل ─────────────────────────────────────── */
  const PANEL_HTML = `
  <div class="P-top">
    <div class="P-toprow">
      <button class="P-close" id="prfCloseBtn">✕</button>
      <div class="P-title">👤 الملف الشخصي</div>
      <div class="P-topright">
        <div class="P-balpill">
          <img class="P-usd" alt="$" src="https://binolla.com/static/common/images/currencies/usd.svg">
          <b id="prfBalDisp">0.00$</b>
        </div>
        <button class="P-menuBtn" id="prfMenuBtn">☰</button>
      </div>
    </div>
    <div class="P-tabs">
      <button class="P-tab active" id="prfT-profile">الملف</button>
      <button class="P-tab" id="prfT-rewards">المكافآت</button>
      <button class="P-tab" id="prfT-withdraw">السحب</button>
      <button class="P-tab" id="prfT-levels">درجات</button>
    </div>
  </div>

  <div class="P-body">

    <!-- صفحة الملف الشخصي -->
    <div id="prfPage-profile">

      <div class="P-card P-pic">
        <div class="P-avatarbox">
          <div class="P-avatar" id="prfAvatarBox">👤</div>
          <div><div class="P-muted">صورة الملف الشخصي</div></div>
        </div>
        <button class="P-btn blue" id="prfAvatarUpBtn">تحميل</button>
        <input id="prfAvatarFile" type="file" accept="image/*" style="display:none">
      </div>

      <div class="P-card">
        <div class="P-row"><div class="P-muted">اسم العرض</div><div class="P-muted">ⓘ</div></div>
        <div class="P-field"><input id="prfDisplayName" value="..." readonly style="opacity:.9"></div>
      </div>

      <div class="P-card">
        <div class="P-row">
          <b style="color:#ffd700">تقدم التحقق</b>
          <span class="P-muted">المنجز <span id="prfVDone">0</span> من 2</span>
        </div>
        <div class="P-progbar"><div class="P-progfill" id="prfVBar" style="width:0%"></div></div>
        <div style="height:10px"></div>
        <div class="P-vgrid">
          <div class="P-vitem">
            <div style="flex:1">
              <h4>تأكيد البريد الإلكتروني</h4>
              <small id="prfEmailSt" class="sbad">غير مكتمل</small>
              <div class="P-progbar" style="margin-top:6px">
                <div class="P-progfill" id="prfEmailBar" style="width:0%;background:#ef4444"></div>
              </div>
            </div>
            <button class="P-btn red" id="prfEmailBtn" disabled>غير مكتمل</button>
          </div>
          <div class="P-vitem">
            <div style="flex:1">
              <h4><span id="prfIdCheck" class="P-check" style="display:none">✓</span> التحقق من الهوية</h4>
              <small id="prfIdSt" class="sbad">غير مكتمل</small>
              <div class="P-progbar" style="margin-top:6px">
                <div class="P-progfill" id="prfIdBar" style="width:0%;background:#ef4444"></div>
              </div>
            </div>
            <button class="P-btn red" id="prfIdBtn">غير مكتمل</button>
          </div>
        </div>
        <div id="prfIdForm" class="P-card" style="display:none;margin-top:8px">
          <div class="P-muted" style="line-height:1.7">ارفع صورة الهوية (أمام/خلف) ثم اضغط تقديم</div>
          <div class="P-field"><label>الوجه الأمامي</label><input id="prfIdFront" type="file" accept="image/*"></div>
          <div class="P-field"><label>الوجه الخلفي</label><input id="prfIdBack" type="file" accept="image/*"></div>
          <button class="P-btn blue" id="prfIdSubmit" style="width:100%;margin-top:10px">تقديم</button>
          <div class="P-note" style="margin:10px 0 0">سيتم التحويل إلى "جاري التحقق" لحين اعتماد الإدارة</div>
        </div>
      </div>

      <div class="P-card">
        <div class="P-row"><b style="color:#ffd700">المصادقة الثنائية</b><span class="P-muted">🔒</span></div>
        <div class="P-muted" style="margin-top:8px;line-height:1.7">أمان متعدد - يُفعَّل عند تسجيل الدخول والمعاملات المالية</div>
        <div style="height:10px"></div>
        <button class="P-btn">ربط</button>
      </div>

      <div class="P-card">
        <div class="P-row"><b style="color:#ffd700">تغيير كلمة المرور</b><span class="P-muted">🔑</span></div>
        <div class="P-muted" style="margin-top:8px">يوصى بتغيير كلمة مرورك كل 30 يوماً</div>
        <div style="height:10px"></div>
        <button class="P-btn" id="prfOpenPwBtn">تغيير</button>
      </div>
    </div>

    <!-- صفحة المكافآت -->
    <div id="prfPage-rewards" style="display:none">
      <div class="P-card" id="prfRewardAlert"
        style="background:linear-gradient(135deg,#2a0000,#1a0000);border-color:#ef4444;color:#ef4444;text-align:center;font-weight:700">
        إكمال التحقق من الملف الشخصي لتلقي المكافآت
      </div>
      <div class="P-card">
        <div class="P-tab-btns">
          <button id="prfBtnCenter" class="P-sub-btn on">مركز</button>
          <button id="prfBtnHist" class="P-sub-btn off">التاريخ</button>
        </div>
      </div>
      <div id="prfCenterView"><div class="P-card" style="color:#ffd700">مركز المكافآت</div></div>
      <div id="prfHistView" style="display:none">
        <div class="P-card" style="text-align:center;color:rgba(255,215,0,.6);padding:60px 14px">
          <div style="font-size:50px;opacity:.6">📋</div>
          <div style="margin-top:10px">ليس لديك سجل مكافأة</div>
        </div>
      </div>
    </div>

    <!-- صفحة السحب -->
    <div id="prfPage-withdraw" style="display:none">
      <div class="P-row" style="padding:6px 2px 12px">
        <b style="font-size:18px;color:#ffd700">سحب الأموال</b><span class="P-muted">✓</span>
      </div>
      <div class="P-card">
        <div class="P-row">
          <span class="P-muted">متاح للسحب</span>
          <b style="font-size:22px;color:#ffd700" id="prfWdBal">0$</b>
        </div>
      </div>
      <div class="P-card">
        <div class="P-field">
          <label>طريقة السحب</label>
          <button id="prfPmBtn" class="P-btn" style="width:100%;text-align:right">Volet.com</button>
        </div>
        <div class="P-field"><label>المبلغ $</label><input id="prfWdAmt" value="10" inputmode="decimal"></div>
        <div class="P-field"><label>معرّف المحفظة</label><input id="prfWdWallet"></div>
        <div class="P-chk"><input id="prfWdTerms" type="checkbox"><label for="prfWdTerms">أقبل الأحكام والشروط</label></div>
        <div class="P-note">قد يتم إرسال الدفعة على أجزاء خلال 48 ساعة</div>
        <button class="P-btn blue" id="prfWdBtn" style="width:100%">متابعة السحب</button>
      </div>
      <div class="P-warn">
        <i>!</i>
        <div>
          <b style="color:#ffd700">تنبيه:</b> سيتم إلغاء المكافأة وصندوق الغموض غير المفتوح<br>
          <span class="P-muted">رصيدك يحتوي على مكافأة وصندوق غموض غير مفتوح</span>
        </div>
      </div>
      <div class="P-links">
        <a href="javascript:void(0)">More about bonuses</a>
        <a href="javascript:void(0)">More about Mystery boxes</a>
      </div>
    </div>

    <!-- صفحة المستويات -->
    <div id="prfPage-levels" style="display:none">
      <div class="P-rank-hero">
        <h3>🏆 ترتيبك العالمي</h3>
        <div class="P-rank-num">#1,247</div>
        <div class="P-rank-total">من أصل 50,000 متداول نشط</div>
        <div class="P-rank-badge">⭐ Top 3%</div>
      </div>
      <div class="P-lv-head">
        <h2>مستويات</h2>
        <div class="P-lv-right">
          <div class="P-muted">مستواك</div>
          <span class="P-pill">Starter</span>
          <div class="P-muted">رصيد XP</div>
          <b style="color:#ffd700">0</b>
        </div>
      </div>
      <div style="display:flex;justify-content:flex-start;margin:6px 0 8px">
        <a class="P-how" href="javascript:void(0)">How it works?</a>
      </div>
      <div class="P-lv-stats">
        <div class="P-stat"><span>إيداع</span><b>0</b></div>
        <div class="P-stat"><span>حجم التداول</span><b>0</b></div>
        <div class="P-stat"><span>صفقات</span><b>0</b></div>
      </div>
      <div class="P-grid">
        <div class="P-smallcard">
          <h4>Bronze</h4>
          <div><div class="P-smrow"><span>بدون مخاطر</span><b>2.5$</b></div><div class="P-smrow2"><span>مضاعف XP</span><b>+10%</b></div></div>
        </div>
        <div class="P-lcard P-glow">
          <div class="P-lmeta">المستوى الحالي</div>
          <h3>Starter</h3>
          <div class="P-lmid">اكسب 100 XP لكل 100$ تداول.<br>تداول لفتح مستوى البرونز!</div>
          <button class="P-lbtn" id="prfStartTrade">ابدأ التداول</button>
        </div>
        <div class="P-smallcard">
          <h4>Silver</h4>
          <div><div class="P-smrow"><span>بدون مخاطر</span><b>5$</b></div><div class="P-smrow2"><span>مضاعف XP</span><b>+20%</b></div></div>
        </div>
        <div class="P-smallcard">
          <h4>Gold</h4>
          <div><div class="P-smrow"><span>بدون مخاطر</span><b>10$</b></div><div class="P-smrow2"><span>مضاعف XP</span><b>+30%</b></div></div>
        </div>
        <div class="P-smallcard" style="grid-column:1/-1">
          <h4>Platinum</h4>
          <div><div class="P-smrow"><span>بدون مخاطر</span><b>25$</b></div><div class="P-smrow2"><span>مضاعف XP</span><b>+40%</b></div></div>
        </div>
      </div>
    </div>

  </div><!-- /P-body -->

  <!-- مودال طريقة السحب -->
  <div id="prfPmModal" class="P-modal">
    <div class="P-sheet">
      <div class="P-mh"><b>اختيار طريقة السحب</b><div class="P-x" id="prfPmClose">✕</div></div>
      <div class="P-pm">
        <div class="P-opt" data-label="Tether (USDT/ERC20)">
          <div class="P-lx">
            <div class="P-ico">
              <img src="https://binolla.com/static/common/images/payment/method/usdt.svg">
              <img src="https://binolla.com/static/common/images/payment/crypto/ethereum.svg">
            </div>
            <div class="P-txt"><span>Tether (USDT/ERC20)</span><small>USDT + ERC20</small></div>
          </div>
          <div class="P-ck">✓</div>
        </div>
        <div class="P-opt" data-label="Tether (USDT/TRC20)">
          <div class="P-lx">
            <div class="P-ico">
              <img src="https://binolla.com/static/common/images/payment/method/usdt.svg">
              <img src="https://binolla.com/static/common/images/payment/crypto/tron.svg">
            </div>
            <div class="P-txt"><span>Tether (USDT/TRC20)</span><small>USDT + TRC20</small></div>
          </div>
          <div class="P-ck">✓</div>
        </div>
        <div class="P-opt" data-label="Tether (USDT/BEP20)">
          <div class="P-lx">
            <div class="P-ico">
              <img src="https://binolla.com/static/common/images/payment/method/usdt.svg">
              <img src="https://binolla.com/static/common/images/payment/crypto/binancecoin.svg">
            </div>
            <div class="P-txt"><span>Tether (USDT/BEP20)</span><small>USDT + BEP20</small></div>
          </div>
          <div class="P-ck">✓</div>
        </div>
      </div>
    </div>
  </div>

  <!-- مودال كلمة المرور -->
  <div id="prfPwModal" class="P-pwmodal">
    <div class="P-pwbox">
      <div style="overflow:hidden;margin-bottom:20px">
        <h3 style="float:right">تغيير كلمة المرور</h3>
        <button class="P-closebtn" id="prfPwClose">✕</button>
      </div>
      <div class="P-field"><label>كلمة المرور القديمة</label><input type="password"></div>
      <div class="P-field"><label>كلمة المرور الجديدة</label><input type="password"></div>
      <div class="P-field"><label>تأكيد كلمة المرور الجديدة</label><input type="password"></div>
      <div style="margin:16px 0;text-align:center;color:rgba(255,215,0,.8);font-size:12px">
        سيتم إرسال بريد إلكتروني لإعادة تعيين كلمة المرور
      </div>
      <div style="display:flex;gap:10px">
        <button class="P-btn" style="flex:1" id="prfPwCancel">إلغاء</button>
        <button class="P-btn blue" style="flex:1">حفظ</button>
      </div>
    </div>
  </div>

  <!-- الشريط الجانبي -->
  <div class="P-sb" id="prfSb">
    <div class="P-sb-panel">
      <div class="P-brand">
        <div class="P-mark">B</div>
        <div class="P-brand-name">Bin<span class="b">exia</span></div>
      </div>
      <div class="P-ucard">
        <div class="pt">
          <b id="prfSbName">...</b>
          <small>🙈 ID: <span id="prfSbId">...</span></small>
        </div>
        <div class="av" id="prfSbAv">👤</div>
      </div>
      <nav class="P-nav">
        <div class="P-mi active" id="prfSbProfile">
          <div class="r"><span class="tx">المنطقة الشخصية</span><span class="P-dot"></span></div>
          <span class="ic"><img src="https://cdn-icons-png.flaticon.com/128/3024/3024605.png"></span>
        </div>
        <div class="P-mi" id="prfSbRewards">
          <div class="r"><span class="tx">متجر المكافآت</span></div>
          <span class="ic"><img src="https://cdn-icons-png.flaticon.com/128/3179/3179608.png"></span>
        </div>
        <div class="P-mi" id="prfSbTrade">
          <div class="r"><span class="tx">منصة التداول</span></div>
          <span class="ic"><img src="https://cdn-icons-png.flaticon.com/128/6516/6516126.png"></span>
        </div>
      </nav>
    </div>
  </div>
  <div id="prfSbOv"></div>
  `;

  /* ─── CSS INJECTION ─────────────────────────────────────── */
  function injectCSS() {
    if (_cssInjected) return;
    _cssInjected = true;
    const s = document.createElement('style');
    s.id = 'prfCSS';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ─── PANEL CREATION ────────────────────────────────────── */
  function createPanel() {
    if (_panelCreated) return;
    _panelCreated = true;
    const div = document.createElement('div');
    div.id = 'profilePanel';
    div.innerHTML = PANEL_HTML;
    document.body.appendChild(div);
    _bindEvents();
  }

  /* ─── HELPERS ───────────────────────────────────────────── */
  const $ = id => document.getElementById(id);

  const PAGES = ['profile','rewards','withdraw','levels'];
  const TABS  = {profile:'prfT-profile',rewards:'prfT-rewards',withdraw:'prfT-withdraw',levels:'prfT-levels'};

  function showPage(p) {
    PAGES.forEach(x => {
      const el = $('prfPage-'+x);
      if (el) el.style.display = x===p ? 'block' : 'none';
    });
    Object.values(TABS).forEach(id => {
      const el = $(id);
      if (el) el.classList.remove('active');
    });
    const t = $(TABS[p]);
    if (t) t.classList.add('active');
  }

  function closeSb() {
    const sb = $('prfSb'), ov = $('prfSbOv');
    if (sb) sb.classList.remove('on');
    if (ov) { ov.style.opacity='0'; ov.style.pointerEvents='none'; }
  }

  function openSb() {
    const sb = $('prfSb'), ov = $('prfSbOv');
    if (sb) sb.classList.add('on');
    if (ov) { ov.style.opacity='1'; ov.style.pointerEvents='auto'; }
  }

  function closePanel() {
    const p = $('profilePanel');
    if (p) p.classList.remove('show');
    if (window.setNav) window.setNav('navChart');
  }

  function setAvatarUI(url) {
    const a = url && url.startsWith('data:image') ? url : '';
    const set = el => { if (!el) return; el.innerHTML = a ? `<img alt="avatar" src="${a}">` : '👤'; };
    set($('prfAvatarBox'));
    set($('prfSbAv'));
    // also sync main header avatar if using Firebase Auth
    const hdrImg = document.getElementById('topLogoImg');
    if (hdrImg && a) { hdrImg.src = a; }
  }

  function setVerUI(v) {
    const emailOk = !!(v && v.email);
    const idOk    = !!(v && v.id);
    const st      = (v && v.idStatus) || 'not_submitted';
    const done    = (emailOk?1:0)+(idOk?1:0);

    const vd  = $('prfVDone'),  vmb = $('prfVBar');
    if (vd)  vd.textContent  = done;
    if (vmb) vmb.style.width = (done/2*100)+'%';

    /* بريد → دائماً مكتمل */
    const es=$('prfEmailSt'), eb=$('prfEmailBar'), eBtn=$('prfEmailBtn');
    if (es)  { es.textContent='مكتمل'; es.className='sok'; }
    if (eb)  { eb.style.width='100%'; eb.style.background='linear-gradient(90deg,#ffd700,#b8860b)'; }
    if (eBtn){ eBtn.textContent='مكتمل'; eBtn.className='P-btn green'; eBtn.disabled=true; }

    /* هوية */
    const ids=$('prfIdSt'), idb=$('prfIdBar'), idBtn=$('prfIdBtn'), idChk=$('prfIdCheck'), idForm=$('prfIdForm');
    if (idOk) {
      if (ids)  { ids.textContent='مكتمل'; ids.className='sok'; }
      if (idb)  { idb.style.width='100%'; idb.style.background='linear-gradient(90deg,#ffd700,#b8860b)'; }
      if (idBtn){ idBtn.textContent='مكتمل'; idBtn.className='P-btn green'; }
      if (idChk) idChk.style.display='inline';
      if (idForm) idForm.style.display='none';
    } else if (st==='pending') {
      if (ids)  { ids.textContent='جاري التحقق'; ids.className='swarn'; }
      if (idb)  { idb.style.width='70%'; idb.style.background='#f59e0b'; }
      if (idBtn){ idBtn.textContent='جاري التحقق'; idBtn.className='P-btn yellow'; }
      if (idChk) idChk.style.display='none';
      if (idForm) idForm.style.display='none';
    } else {
      if (ids)  { ids.textContent='غير مكتمل'; ids.className='sbad'; }
      if (idb)  { idb.style.width='0%'; idb.style.background='#ef4444'; }
      if (idBtn){ idBtn.textContent='غير مكتمل'; idBtn.className='P-btn red'; }
      if (idChk) idChk.style.display='none';
    }

    const ra = $('prfRewardAlert');
    if (ra) {
      if (emailOk && idOk) {
        ra.style.background='linear-gradient(135deg,#1a1200,#2a1a00)';
        ra.style.borderColor='#ffd700'; ra.style.color='#ffd700';
        ra.textContent='تم التحقق من ملفك الشخصي بنجاح ✓';
      } else {
        ra.style.background='linear-gradient(135deg,#2a0000,#1a0000)';
        ra.style.borderColor='#ef4444'; ra.style.color='#ef4444';
        ra.textContent='إكمال التحقق من الملف الشخصي لتلقي المكافآت';
      }
    }
  }

  function fileToDataUrl(f) {
    return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(String(r.result||'')); r.onerror=rej; r.readAsDataURL(f); });
  }

  /* ─── BIND EVENTS ───────────────────────────────────────── */
  function _bindEvents() {
    /* إغلاق البانيل */
    $('prfCloseBtn').onclick = closePanel;

    /* تبويبات رئيسية */
    $('prfT-profile').onclick  = ()=>showPage('profile');
    $('prfT-rewards').onclick  = ()=>showPage('rewards');
    $('prfT-withdraw').onclick = ()=>showPage('withdraw');
    $('prfT-levels').onclick   = ()=>showPage('levels');

    /* مركز / تاريخ المكافآت */
    $('prfBtnCenter').onclick = ()=>{
      $('prfCenterView').style.display='block'; $('prfHistView').style.display='none';
      $('prfBtnCenter').className='P-sub-btn on'; $('prfBtnHist').className='P-sub-btn off';
    };
    $('prfBtnHist').onclick = ()=>{
      $('prfCenterView').style.display='none'; $('prfHistView').style.display='block';
      $('prfBtnHist').className='P-sub-btn on'; $('prfBtnCenter').className='P-sub-btn off';
    };

    /* مودال طريقة السحب */
    $('prfPmBtn').onclick  = ()=>{ $('prfPmModal').style.display='flex'; };
    $('prfPmClose').onclick = ()=>{ $('prfPmModal').style.display='none'; };
    $('prfPmModal').onclick = e=>{ if(e.target.id==='prfPmModal') $('prfPmModal').style.display='none'; };
    document.querySelectorAll('#profilePanel .P-opt').forEach(opt=>{
      opt.onclick=()=>{
        document.querySelectorAll('#profilePanel .P-opt').forEach(o=>o.classList.remove('active'));
        opt.classList.add('active');
        $('prfPmBtn').textContent = opt.getAttribute('data-label')||'';
        $('prfPmModal').style.display='none';
      };
    });

    /* مودال كلمة المرور */
    $('prfOpenPwBtn').onclick = ()=>{ $('prfPwModal').style.display='flex'; };
    $('prfPwClose').onclick   = ()=>{ $('prfPwModal').style.display='none'; };
    $('prfPwCancel').onclick  = ()=>{ $('prfPwModal').style.display='none'; };
    $('prfPwModal').onclick   = e=>{ if(e.target.id==='prfPwModal') $('prfPwModal').style.display='none'; };

    /* زر القائمة الجانبية */
    $('prfMenuBtn').onclick = openSb;
    $('prfSbOv').onclick    = closeSb;

    /* روابط الشريط الجانبي */
    $('prfSbProfile').onclick = ()=>{ showPage('profile'); closeSb(); };
    $('prfSbRewards').onclick = ()=>{ showPage('rewards'); closeSb(); };
    /* منصة التداول → فقط إغلاق البانيل (لسنا بحاجة للتنقل) */
    $('prfSbTrade').onclick   = ()=>{ closeSb(); closePanel(); };

    /* زر "ابدأ التداول" في المستويات */
    $('prfStartTrade').onclick = closePanel;

    /* التحقق من الهوية */
    $('prfIdBtn').onclick = ()=>{
      const f=$('prfIdForm');
      if (f) f.style.display = (f.style.display==='none'||!f.style.display)?'block':'none';
    };

    /* رفع الصورة الشخصية */
    $('prfAvatarUpBtn').onclick = ()=>$('prfAvatarFile').click();
    $('prfAvatarFile').onchange = async ()=>{
      const f=$('prfAvatarFile').files&&$('prfAvatarFile').files[0];
      if (!f||!_uid) return;
      try {
        const url = await fileToDataUrl(f);
        setAvatarUI(url);
        if (window.firebase&&window.firebase.firestore) {
          await window.firebase.firestore().collection('users').doc(_uid)
            .update({avatar:url, avatarUpdatedAt:window.firebase.firestore.FieldValue.serverTimestamp()});
        }
        $('prfAvatarFile').value='';
      } catch(e){ console.error(e); }
    };

    /* Escape يغلق البانيل */
    document.addEventListener('keydown', e=>{ if(e.key==='Escape') closePanel(); });
  }

  /* ─── FIREBASE (باستخدام compat SDK الموجود في index.html) */
  function _startFirebase() {
    /* إذا لم يكن Firebase محمّلاً بعد، ننتظر */
    if (!window.firebase || !window.firebase.auth) {
      setTimeout(_startFirebase, 300);
      return;
    }

    const auth = window.firebase.auth();
    const db   = window.firebase.firestore();

    /* تسجيل دخول مجهول إذا لم يكن هناك مستخدم */
    auth.signInAnonymously().catch(e=>console.warn('signIn:',e));

    auth.onAuthStateChanged(async u=>{
      if (!u) return;
      _uid     = u.uid;
      _shortId = (u.uid.match(/\d+/g)||[]).join('').slice(0,9) || '000000';

      const name = 'User'+_shortId;
      const dn=$('prfDisplayName'), sn=$('prfSbName'), si=$('prfSbId');
      if (dn) dn.value      = name;
      if (sn) sn.textContent = name;
      if (si) si.textContent = _shortId;

      /* إنشاء وثيقة المستخدم إن لم تكن موجودة */
      try {
        const ref  = db.collection('users').doc(_uid);
        const snap = await ref.get();
        if (!snap.exists) {
          await ref.set({
            userId:_shortId, balance:0, avatar:'',
            verified:{email:true,id:false,idStatus:'not_submitted'},
            createdAt:window.firebase.firestore.FieldValue.serverTimestamp()
          });
        } else {
          const d=snap.data()||{}, v=d.verified||{};
          if (v.email!==true)     await ref.update({'verified.email':true});
          if (!('idStatus' in v)) await ref.update({'verified.idStatus':v.id?'approved':'not_submitted'});
          if (!('avatar' in d))   await ref.update({avatar:''});
        }
      } catch(e){ console.error(e); }

      /* الاستماع للتغييرات */
      if (_unsub) _unsub();
      _unsub = db.collection('users').doc(_uid).onSnapshot(snap=>{
        if (!snap.exists) return;
        const d=snap.data()||{}, bal=Number(d.balance||0);
        const bd=$('prfBalDisp'), wb=$('prfWdBal');
        if (bd) bd.textContent = bal.toFixed(2)+'$';
        if (wb) wb.textContent = bal.toFixed(2)+'$';
        setVerUI(d.verified||{email:true,id:false,idStatus:'not_submitted'});
        setAvatarUI(d.avatar||'');
      });

      /* زر السحب */
      const wBtn = $('prfWdBtn');
      if (wBtn) wBtn.onclick = async()=>{
        const amt    = parseFloat(($('prfWdAmt')?.value||'').replace(',','.'));
        const wallet = ($('prfWdWallet')?.value||'').trim();
        const method = ($('prfPmBtn')?.textContent||'').trim();
        const ok     = $('prfWdTerms')?.checked;
        if (!ok)           return alert('لازم توافق على الأحكام والشروط');
        if (!amt||amt<=0)  return alert('اكتب مبلغ صحيح');
        if (!wallet)       return alert('اكتب معرّف المحفظة');
        try {
          const s   = await db.collection('users').doc(_uid).get();
          const bal = Number(s.data()?.balance||0);
          if (amt>bal) return alert('الرصيد غير كافي');
          await db.collection('users').doc(_uid).update({
            balance: window.firebase.firestore.FieldValue.increment(-amt)
          });
          await db.collection('withdraw_requests').add({
            userId:_uid, userShortId:_shortId,
            amount:amt, method, wallet, status:'pending',
            createdAt:window.firebase.firestore.FieldValue.serverTimestamp()
          });
          alert('تم تقديم طلب السحب بنجاح');
        } catch(e){ console.error(e); alert('حصل خطأ، حاول تاني'); }
      };

      /* زر تقديم الهوية */
      const idSub = $('prfIdSubmit');
      if (idSub) idSub.onclick = async()=>{
        const front=$('prfIdFront')?.files?.[0];
        const back =$('prfIdBack')?.files?.[0];
        if (!front||!back) return alert('لازم ترفع صورة أمام وصورة خلف');
        try {
          await db.collection('kyc_requests').add({
            userId:_uid, userShortId:_shortId,
            frontName:front.name, frontSize:front.size,
            backName:back.name,   backSize:back.size,
            status:'pending',
            createdAt:window.firebase.firestore.FieldValue.serverTimestamp()
          });
          await db.collection('users').doc(_uid).update({
            'verified.idStatus':'pending','verified.id':false
          });
          const ff=$('prfIdFront'),fb=$('prfIdBack'),fm=$('prfIdForm');
          if (ff) ff.value=''; if (fb) fb.value=''; if (fm) fm.style.display='none';
          alert('تم التقديم بنجاح - جاري التحقق');
        } catch(e){ console.error(e); alert('حصل خطأ، حاول تاني'); }
      };
    });
  }

  /* ─── PUBLIC API ────────────────────────────────────────── */
  window.openProfile = function () {
    injectCSS();
    createPanel();
    const panel = $('profilePanel');
    if (panel) panel.classList.add('show');
    if (window.setNav) window.setNav('navProfile');
    if (!_fbStarted) { _fbStarted=true; _startFirebase(); }
  };

})();
