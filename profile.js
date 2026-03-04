/* app.js - Full JS version (builds the whole page + Firebase + UI logic) */

(async function () {
  // ---------- Head / Meta ----------
  document.documentElement.lang = "ar";
  document.documentElement.dir = "rtl";
  document.title = "الملف الشخصي";

  // meta charset (can't be reliably changed after parsing, but keep viewport)
  if (!document.querySelector('meta[name="viewport"]')) {
    const metaViewport = document.createElement("meta");
    metaViewport.name = "viewport";
    metaViewport.content = "width=device-width,initial-scale=1";
    document.head.appendChild(metaViewport);
  }
  if (!document.querySelector('meta[charset]')) {
    const metaCharset = document.createElement("meta");
    metaCharset.setAttribute("charset", "utf-8");
    document.head.prepend(metaCharset);
  }

  // ---------- CSS (same as original) ----------
  const STYLE_CSS = `
*{margin:0;padding:0;box-sizing:border-box}html,body{height:100%}
:root{--bg:#0a0e1a;--p:#12192e;--p2:#0d1020;--gold:#ffd700;--gold2:#b8860b;--b:rgba(255,215,0,.2);--b2:rgba(255,215,0,.35);--m:rgba(255,215,0,.6);--t:#fff;--g:#22c55e;--r:#ff4d5a}
body{font-family:Arial,sans-serif;background:var(--bg);color:var(--t);direction:rtl;overflow-x:hidden}
a{color:inherit}.app{width:100%;min-height:100vh;background:var(--bg)}
.topbar{background:linear-gradient(135deg,#0d1527 0%,#1a1000 50%,#0d1527 100%);border-bottom:2px solid var(--gold);padding:10px 12px 6px;position:sticky;top:0;z-index:50;box-shadow:0 3px 14px rgba(255,215,0,.12)}
.toprow{display:flex;align-items:center;justify-content:space-between;gap:10px}
.iconbtn{width:40px;height:40px;border-radius:12px;background:rgba(255,215,0,.08);border:1.5px solid var(--b2);color:var(--gold);font-size:22px;display:flex;align-items:center;justify-content:center;cursor:pointer}
.rightpack{display:flex;align-items:center;gap:8px}
.balpill{display:flex;align-items:center;gap:4px;background:linear-gradient(135deg,#1a1200,var(--p2));border:2px solid var(--gold);border-radius:12px;padding:9px 8px 9px 10px;box-shadow:0 3px 12px rgba(255,215,0,.15)}
.balpill b{font-size:14px;font-weight:900;color:var(--gold);text-shadow:0 0 8px rgba(255,215,0,.4)}.usd{width:22px;height:22px}
.tabs{display:flex;gap:0;align-items:center;justify-content:space-around;margin-top:10px;padding:0 2px 6px}
.tab{color:rgba(255,215,0,.45);font-size:15px;white-space:nowrap;cursor:pointer;position:relative;padding:10px 8px;flex:1;text-align:center;font-weight:700}
.tab.active{color:var(--gold);text-shadow:0 0 8px rgba(255,215,0,.4)}
.tab.active:after{content:"";position:absolute;left:0;right:0;bottom:-2px;height:3px;border-radius:3px;background:var(--gold);box-shadow:0 0 8px rgba(255,215,0,.5)}
.container{padding:14px 12px 22px}
.card{background:var(--p);border:1.5px solid var(--b);border-radius:14px;padding:14px;margin-bottom:14px;box-shadow:0 8px 20px rgba(0,0,0,.4)}
.row{display:flex;align-items:center;justify-content:space-between;gap:10px}
.muted{color:var(--m);font-size:12px}
.btn{background:rgba(255,215,0,.06);border:1.5px solid var(--b2);color:#e5e7eb;border-radius:10px;padding:10px 14px;font-size:13px;cursor:pointer;font-weight:700;transition:.18s}
.btn:hover{background:rgba(255,215,0,.12);border-color:var(--gold)}
.btn.blue{background:linear-gradient(135deg,var(--gold),var(--gold2));border-color:var(--gold);color:#000;font-weight:900;box-shadow:0 3px 12px rgba(255,215,0,.25)}
.btn.green{background:linear-gradient(135deg,#22c55e,#16a34a);border-color:#22c55e;color:#000;font-weight:900}
.btn.red{background:linear-gradient(135deg,#ef4444,#b91c1c);border-color:#ef4444;color:#fff;font-weight:900}
.btn.yellow{background:linear-gradient(135deg,#f59e0b,#d97706);border-color:#f59e0b;color:#000;font-weight:900}
.btn:active{transform:scale(.99)}
.field{margin-top:12px}.field label{display:block;color:var(--m);font-size:12px;margin:0 0 8px;font-weight:700}
.field input,.field select{width:100%;background:rgba(17,31,53,.65);border:1.5px solid rgba(255,215,0,.3);color:#fff;border-radius:10px;padding:12px;outline:none;transition:.2s;font-weight:700}
.field input:focus,.field select:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(255,215,0,.1)}
.profile-pic{display:flex;align-items:center;justify-content:space-between;gap:12px}
.avatarbox{display:flex;align-items:center;gap:12px}
.avatar{width:48px;height:48px;border-radius:12px;background:var(--p);border:2px solid var(--b2);display:flex;align-items:center;justify-content:center;color:var(--m);font-size:22px;overflow:hidden}
.avatar img{width:100%;height:100%;object-fit:cover;display:block}.readonly{opacity:.95}
.vgrid{display:grid;grid-template-columns:1fr;gap:10px}
.vitem{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px;border-radius:12px;background:var(--p2);border:1.5px solid var(--b)}
.vitem h4{font-size:13px;font-weight:700;color:var(--t)}.vitem small{display:block;font-size:11px;margin-top:3px}
.check{color:#22c55e;font-weight:900}
.note{text-align:center;color:var(--m);font-size:12px;line-height:1.8;margin:10px 0;font-weight:700}
.chk{display:flex;align-items:center;gap:10px;margin:14px 0 6px;color:rgba(255,215,0,.8);font-weight:700}
.chk input{width:16px;height:16px;accent-color:var(--gold)}
.warn{display:flex;gap:10px;align-items:flex-start;margin-top:14px}
.warn i{width:18px;height:18px;border-radius:50%;border:1.5px solid var(--gold);color:var(--gold);display:inline-flex;align-items:center;justify-content:center;font-style:normal;font-size:12px;flex:0 0 18px;margin-top:2px}
.links{margin-top:10px;display:flex;flex-direction:column;gap:10px;align-items:center}
.links a{color:rgba(255,215,0,.8);text-decoration:none;font-size:13px}.links a:before{content:"↗ ";opacity:.9}
.modal{position:fixed;inset:0;display:none;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.65);z-index:9999}
.sheet{width:100%;max-width:720px;background:linear-gradient(145deg,var(--p),var(--p2));border:1.5px solid var(--b2);border-radius:16px 16px 0 0;padding:14px 14px 18px;box-shadow:0 -10px 30px rgba(0,0,0,.5)}
.mh{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.mh b{color:var(--gold);font-size:15px;font-weight:900}
.x{width:34px;height:34px;border-radius:10px;background:rgba(255,215,0,.08);border:1.5px solid var(--b2);color:var(--gold);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px}
.pm{display:flex;flex-direction:column;gap:10px}
.opt{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px;border-radius:12px;background:var(--p2);border:1.5px solid var(--b);cursor:pointer;transition:.2s}
.opt:hover{border-color:var(--gold);background:rgba(255,215,0,.05)}
.lx{display:flex;align-items:center;gap:10px;min-width:0}
.ico{display:flex;align-items:center;gap:6px;flex:0 0 auto}.ico img{width:22px;height:22px;display:block}
.txt{display:flex;flex-direction:column;gap:2px;min-width:0}
.txt span{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--t);font-weight:700}
.txt small{font-size:11px;color:var(--m)}
.ck{color:var(--gold);font-size:14px;opacity:0}.opt.active .ck{opacity:1}
.lv-head{display:flex;align-items:flex-start;justify-content:space-between;margin:8px 0 12px}
.lv-head h2{font-size:20px;font-weight:900;color:var(--gold)}
.lv-right{display:flex;flex-direction:column;gap:6px;align-items:flex-end}
.pill{background:var(--p2);border:1.5px solid var(--b2);color:var(--gold);border-radius:10px;padding:6px 10px;font-size:12px;font-weight:900}
.lv-stats{display:flex;justify-content:space-between;gap:10px;margin:10px 0 14px;color:var(--m)}
.stat{flex:1;display:flex;flex-direction:column;gap:4px;align-items:flex-end}.stat b{color:var(--gold);font-size:14px}
.how{color:rgba(255,215,0,.8);text-decoration:none;font-size:13px}.how:before{content:"↗ ";opacity:.9}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.lcard{background:var(--p);border:1.5px solid rgba(255,215,0,.25);border-radius:16px;padding:18px;min-height:140px;position:relative}
.lcard h3{font-size:22px;font-weight:900;color:var(--gold)}
.lmeta{position:absolute;left:16px;top:16px;color:var(--m);font-size:12px}
.lmid{margin-top:28px;color:#cbd5e1;font-size:13px;line-height:1.9}
.lbtn{margin-top:12px;width:100%;background:linear-gradient(135deg,var(--gold),var(--gold2));border:0;color:#000;padding:12px 14px;border-radius:12px;font-size:14px;cursor:pointer;font-weight:900;box-shadow:0 3px 12px rgba(255,215,0,.3)}
.smallcard{background:var(--p);border:1.5px solid var(--b);border-radius:16px;padding:18px;min-height:150px;display:flex;flex-direction:column;justify-content:space-between}
.smallcard h4{font-size:22px;font-weight:900;text-align:center;color:var(--gold)}
.smrow{display:flex;justify-content:space-between;align-items:center;color:#cbd5e1}
.smrow b{font-size:18px;color:var(--t)}.smrow span{font-size:12px;color:var(--m)}
.smrow2{display:flex;justify-content:space-between;align-items:center;margin-top:10px}
.smrow2 b{color:var(--t)}.smrow2 span{color:var(--m);font-size:12px}
.glow{border:2px solid var(--gold);box-shadow:0 0 0 1px rgba(255,215,0,.2),0 0 30px rgba(255,215,0,.15)}
.pwmodal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.75);z-index:9999;padding:20px}
.pwbox{width:100%;max-width:500px;background:linear-gradient(145deg,var(--p),var(--p2));border:1.5px solid var(--b2);border-radius:16px;padding:20px;box-shadow:0 10px 40px rgba(0,0,0,.6)}
.pwbox h3{font-size:18px;margin-bottom:16px;color:var(--gold)}
.pwbox .closebtn{float:left;width:32px;height:32px;border-radius:8px;background:rgba(255,215,0,.08);border:1.5px solid var(--b2);color:var(--gold);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:18px}
.progbar{width:100%;height:6px;background:var(--p2);border-radius:10px;overflow:hidden;margin-top:10px}
.progfill{height:100%;background:linear-gradient(90deg,var(--gold),var(--gold2));border-radius:10px;transition:width .3s}
.rank-hero{background:linear-gradient(135deg,#1a1200 0%,#2a1a00 50%,#1a1200 100%);border:2px solid var(--gold);border-radius:20px;padding:24px 20px;margin-bottom:20px;text-align:center;box-shadow:0 10px 40px rgba(255,215,0,.15);position:relative;overflow:hidden}
.rank-hero:before{content:"";position:absolute;top:-50%;right:-50%;width:200%;height:200%;background:radial-gradient(circle,rgba(255,215,0,.07) 0%,transparent 70%);animation:pulse 3s ease-in-out infinite}
.rank-hero h3{font-size:16px;font-weight:700;color:rgba(255,215,0,.8);margin-bottom:12px;text-transform:uppercase;letter-spacing:1px}
.rank-num{font-size:64px;font-weight:900;background:linear-gradient(135deg,var(--gold) 0%,#f59e0b 50%,var(--gold2) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1;margin-bottom:8px}
.rank-total{font-size:14px;color:rgba(255,215,0,.7);font-weight:500}
.rank-badge{display:inline-block;background:rgba(255,215,0,.12);border:1.5px solid var(--gold);color:var(--gold);padding:6px 14px;border-radius:20px;font-size:12px;font-weight:700;margin-top:12px}
@keyframes pulse{0%,100%{opacity:.5}50%{opacity:.9}}
@media(max-width:520px){.grid{grid-template-columns:1fr}.lv-stats{flex-wrap:wrap}.stat{flex:0 0 48%}}
.sb{position:fixed;top:0;bottom:0;right:0;z-index:20000;display:flex;pointer-events:none}
.sb .panel{width:320px;max-width:82vw;background:linear-gradient(180deg,#0d1527 0%,var(--bg) 100%);border-left:2px solid var(--gold);box-shadow:-12px 0 28px rgba(0,0,0,.6);transform:translateX(102%);transition:.22s ease;pointer-events:auto;padding:14px 14px 16px}
.sb.on{pointer-events:auto}.sb.on .panel{transform:translateX(0)}
.brand{display:flex;align-items:center;gap:10px;margin:4px 0 14px}
.brand .mark{width:30px;height:30px;border-radius:9px;background:var(--p2);border:1.5px solid var(--b2);display:flex;align-items:center;justify-content:center;color:var(--gold);font-weight:900;font-size:16px}
.brand .name{font-weight:900;letter-spacing:.2px;font-size:18px;color:var(--t)}
.brand .name .b{color:var(--gold)}
.uCard{background:var(--p2);border:1.5px solid var(--b);border-radius:14px;padding:12px;display:flex;align-items:center;justify-content:space-between;gap:10px}
.uCard .t{min-width:0}.uCard .t b{display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--t)}
.uCard .t small{display:flex;align-items:center;gap:6px;color:var(--m);font-size:12px;margin-top:4px}
.uCard .av{width:42px;height:42px;border-radius:12px;background:var(--p2);border:1.5px solid var(--b2);display:flex;align-items:center;justify-content:center;color:var(--m);overflow:hidden}
.uCard .av img{width:100%;height:100%;object-fit:cover;display:block}
.m{margin-top:12px;display:flex;flex-direction:column;gap:10px}
.mi{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px;border-radius:12px;background:transparent;border:1.5px solid transparent;color:#dbe3ee;text-decoration:none;transition:.18s}
.mi:hover{background:rgba(255,215,0,.05);border-color:var(--b)}
.mi .r{display:flex;align-items:center;gap:10px;min-width:0}.mi .tx{font-weight:900;font-size:14px;color:var(--t)}
.mi .ic{width:24px;height:24px;display:flex;align-items:center;justify-content:center;opacity:.9}
.mi .ic img{width:100%;height:100%;object-fit:contain;filter:brightness(0)invert(1) sepia(1) saturate(2) hue-rotate(10deg)}
.mi.active{background:linear-gradient(135deg,rgba(255,215,0,.15),rgba(184,134,11,.1));border-color:var(--gold)}
.mi.active .tx{color:var(--gold)}
.dot{width:8px;height:8px;border-radius:50%;background:#ef4444;display:inline-block;margin-inline-start:6px;box-shadow:0 0 0 2px rgba(255,215,0,.15)}
.sbOv{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:19999;opacity:0;pointer-events:none;transition:.22s}.sb.on~.sbOv{opacity:1;pointer-events:auto}
.sok{color:#22c55e;font-weight:900}.sbad{color:#ef4444;font-weight:900}.swarn{color:var(--gold);font-weight:900}
`;

  const style = document.createElement("style");
  style.textContent = STYLE_CSS;
  document.head.appendChild(style);

  // ---------- Body HTML (same structure, no script tags) ----------
  const BODY_HTML = `
<div class="app" id="mainApp">
  <div class="topbar">
    <div class="toprow">
      <div class="rightpack">
        <div class="balpill">
          <img class="usd" alt="$" src="https://binolla.com/static/common/images/currencies/usd.svg">
          <b id="balanceDisplay">0.00$</b>
        </div>
      </div>
      <button class="iconbtn" id="menuBtn">☰</button>
    </div>
    <div class="tabs">
      <span class="tab active" id="t-profile">الملف الشخصي</span>
      <span class="tab" id="t-rewards">المكافآت</span>
      <span class="tab" id="t-withdraw">عمليات السحب</span>
      <span class="tab" id="t-levels">درجات</span>
    </div>
  </div>

  <div class="container">

    <!-- ===== صفحة الملف الشخصي ===== -->
    <div id="page-profile">
      <div class="card profile-pic">
        <div class="avatarbox">
          <div class="avatar" id="avatarBox">👤</div>
          <div><div class="muted">صورة الملف الشخصي</div></div>
        </div>
        <button class="btn blue" id="avatarUploadBtn">تحميل</button>
        <input id="avatarFile" type="file" accept="image/*" style="display:none">
      </div>

      <div class="card">
        <div class="row"><div class="muted">اسم العرض</div><div class="muted">ⓘ</div></div>
        <div class="field"><input class="readonly" id="userDisplayName" value="User529391" readonly></div>
      </div>

      <div class="card">
        <div class="row"><b style="color:var(--gold)">تقدم التحقق</b><span class="muted">المنجز <span id="vDone">0</span> من 2</span></div>
        <div class="progbar"><div class="progfill" id="vMainBar" style="width:0%"></div></div>
        <div style="height:10px"></div>
        <div class="vgrid">
          <div class="vitem">
            <div style="flex:1">
              <h4>تأكيد البريد الإلكتروني</h4>
              <small id="emailStatus" class="sbad">غير مكتمل</small>
              <div class="progbar" style="margin-top:6px"><div class="progfill" id="emailBar" style="width:0%;background:#ef4444"></div></div>
            </div>
            <button class="btn red" id="emailRetryBtn">غير مكتمل</button>
          </div>
          <div class="vitem">
            <div style="flex:1">
              <h4 id="idTitle"><span id="idCheck" class="check" style="display:none">✓</span> التحقق من الهوية</h4>
              <small id="idStatus" class="sbad">غير مكتمل</small>
              <div class="progbar" style="margin-top:6px"><div class="progfill" id="idBar" style="width:0%;background:#ef4444"></div></div>
            </div>
            <button class="btn red" id="idRetryBtn">غير مكتمل</button>
          </div>
        </div>
        <div id="idForm" class="card" style="display:none;margin-top:-6px">
          <div class="muted" style="line-height:1.7">ارفع صورة الهوية (أمام/خلف) ثم اضغط تقديم</div>
          <div class="field"><label>صورة الهوية (الوجه الأمامي)</label><input id="idFront" type="file" accept="image/*"></div>
          <div class="field"><label>صورة الهوية (الوجه الخلفي)</label><input id="idBack" type="file" accept="image/*"></div>
          <button class="btn blue" id="idSubmitBtn" style="width:100%;margin-top:10px">تقديم</button>
          <div class="note" style="margin:10px 0 0">بعد التقديم: سيتم تحويل الحالة إلى جاري التحقق لحين اعتماد الإدارة.</div>
        </div>
      </div>

      <div class="card">
        <div class="row"><b style="color:var(--gold)">المصادقة الثنائية باستخدام مصادق جوجل</b><span class="muted">🔒</span></div>
        <div class="muted" style="margin-top:8px;line-height:1.7">أمان متعدد - وأكثر إضافي يعفى عند تسجيل الدخول وإجراء المعاملات المالية</div>
        <div style="height:10px"></div>
        <button class="btn">ربط</button>
      </div>

      <div class="card">
        <div class="row"><b style="color:var(--gold)">تغيير كلمة المرور</b><span class="muted">🔑</span></div>
        <div class="muted" style="margin-top:8px">يوصى بتغيير كلمة مرورك كل 30 يوماً</div>
        <div style="height:10px"></div>
        <button class="btn" id="openPwBtn">تغيير</button>
      </div>
    </div>

    <!-- ===== صفحة المكافآت ===== -->
    <div id="page-rewards" style="display:none">
      <div class="card" id="rewardAlert" style="background:linear-gradient(135deg,#1a1200,#2a1a00);border-color:var(--gold);color:var(--gold);text-align:center;font-weight:700;border:1.5px solid var(--gold)">إكمال التحقق من الملف الشخصي لتلقي المكافآت</div>
      <div class="card">
        <div style="display:flex;gap:8px;background:var(--p2);border:1.5px solid var(--b);border-radius:12px;padding:6px">
          <button id="btn-center" class="btn" style="flex:1;background:rgba(255,215,0,.12);border-color:var(--gold);color:var(--gold)">مركز</button>
          <button id="btn-history" class="btn" style="flex:1;background:transparent">التاريخ</button>
        </div>
      </div>
      <div id="center-view"><div class="card" style="color:var(--gold)">مركز المكافآت</div></div>
      <div id="history-view" style="display:none">
        <div class="card" style="text-align:center;color:var(--m);padding:70px 14px">
          <div style="font-size:50px;opacity:.6">📋</div>
          <div style="margin-top:10px">ليس لديك سجل مكافأة</div>
        </div>
      </div>
    </div>

    <!-- ===== صفحة السحب ===== -->
    <div id="page-withdraw" style="display:none">
      <div class="row" style="padding:6px 2px 12px"><b style="font-size:18px;color:var(--gold)">سحب الأموال</b><span class="muted">✓</span></div>
      <div class="card">
        <div class="row"><span class="muted">متاح للسحب</span><b style="font-size:22px;color:var(--gold)" id="withdrawBalance">0$</b></div>
      </div>
      <div class="card">
        <div class="field"><label>طريقة السحب</label><button id="pmBtn" class="btn" style="width:100%;text-align:right">Volet.com</button></div>
        <div class="field"><label>المبلغ $</label><input id="wdAmount" value="10" inputmode="decimal"></div>
        <div class="field"><label>معرّف المحفظة</label><input id="wdWallet"></div>
        <div class="chk"><input id="t" type="checkbox"><label for="t">أقبل الأحكام والشروط</label></div>
        <div class="note">قد يتم إرسال الدفعة على أجزاء خلال 48 ساعة</div>
        <button class="btn blue" id="withdrawBtn" style="width:100%">متابعة السحب</button>
      </div>
      <div class="warn"><i>!</i><div><b style="color:var(--gold)">تنبيه:</b> سيتم إلغاء المكافأة وصندوق الغموض غير المفتوح<br><span class="muted">رصيدك يحتوي على مكافأة وصندوق غموض غير مفتوح</span></div></div>
      <div class="links"><a href="#">More about bonuses</a><a href="#">More about Mystery boxes</a></div>
    </div>

    <!-- ===== صفحة المستويات ===== -->
    <div id="page-levels" style="display:none">
      <div class="rank-hero">
        <h3>🏆 ترتيبك العالمي</h3>
        <div class="rank-num">#1,247</div>
        <div class="rank-total">من أصل 50,000 متداول نشط</div>
        <div class="rank-badge">⭐ Top 3%</div>
      </div>
      <div class="lv-head">
        <h2>مستويات</h2>
        <div class="lv-right">
          <div class="muted">مستواك</div>
          <span class="pill">Starter</span>
          <div class="muted">رصيد XP</div>
          <b style="color:var(--gold)">0</b>
        </div>
      </div>
      <div style="display:flex;justify-content:flex-start;margin:6px 0 8px"><a class="how" href="#">How it works?</a></div>
      <div class="lv-stats">
        <div class="stat"><span>إيداع</span><b>0</b></div>
        <div class="stat"><span>حجم التداول</span><b>0</b></div>
        <div class="stat"><span>صفقات</span><b>0</b></div>
      </div>
      <div class="grid">
        <div class="smallcard"><h4>Bronze</h4><div><div class="smrow"><span>واحدة بدون مخاطر</span><b>2.5$</b></div><div class="smrow2"><span>مضاعف XP</span><b>+10%</b></div></div></div>
        <div class="lcard glow"><div class="lmeta">المستوى الحالي</div><h3>Starter</h3><div class="lmid">اكسب 100 XP لكل 100$ تداول.<br>تداول لفتح مستوى البرونز!</div><button class="lbtn">ابدأ التداول</button></div>
        <div class="smallcard"><h4>Gold</h4><div><div class="smrow"><span>واحدة بدون مخاطر</span><b>10$</b></div><div class="smrow2"><span>مضاعف XP</span><b>+30%</b></div></div></div>
        <div class="smallcard"><h4>Silver</h4><div><div class="smrow"><span>واحدة بدون مخاطر</span><b>5$</b></div><div class="smrow2"><span>مضاعف XP</span><b>+20%</b></div></div></div>
        <div class="smallcard" style="grid-column:1/-1"><h4>Platinum</h4><div><div class="smrow"><span>واحدة بدون مخاطر</span><b>25$</b></div><div class="smrow2"><span>مضاعف XP</span><b>+40%</b></div></div></div>
      </div>
    </div>

  </div><!-- /container -->

  <!-- ===== مودال طريقة السحب ===== -->
  <div id="pmModal" class="modal">
    <div class="sheet">
      <div class="mh"><b>اختيار طريقة السحب</b><div class="x" id="pmCloseBtn">✕</div></div>
      <div class="pm">
        <div class="opt" data-label="Tether (USDT/ERC20)">
          <div class="lx">
            <div class="ico">
              <img src="https://binolla.com/static/common/images/payment/method/usdt.svg">
              <img src="https://binolla.com/static/common/images/payment/crypto/ethereum.svg">
            </div>
            <div class="txt"><span>Tether (USDT/ERC20)</span><small>USDT + ERC20</small></div>
          </div>
          <div class="ck">✓</div>
        </div>

        <div class="opt" data-label="Tether (USDT/TRC20)">
          <div class="lx">
            <div class="ico">
              <img src="https://binolla.com/static/common/images/payment/method/usdt.svg">
              <img src="https://binolla.com/static/common/images/payment/crypto/tron.svg">
            </div>
            <div class="txt"><span>Tether (USDT/TRC20)</span><small>USDT + TRC20</small></div>
          </div>
          <div class="ck">✓</div>
        </div>

        <div class="opt" data-label="Tether (USDT/BEP20)">
          <div class="lx">
            <div class="ico">
              <img src="https://binolla.com/static/common/images/payment/method/usdt.svg">
              <img src="https://binolla.com/static/common/images/payment/crypto/binancecoin.svg">
            </div>
            <div class="txt"><span>Tether (USDT/BEP20)</span><small>USDT + BEP20</small></div>
          </div>
          <div class="ck">✓</div>
        </div>

      </div>
    </div>
  </div>

  <!-- ===== مودال تغيير كلمة المرور ===== -->
  <div id="pwModal" class="pwmodal">
    <div class="pwbox">
      <div style="overflow:hidden;margin-bottom:20px">
        <h3 style="float:right">تغيير كلمة المرور</h3>
        <button class="closebtn" id="pwCloseBtn">✕</button>
      </div>
      <div class="field"><label>كلمة المرور القديمة</label><input type="password"></div>
      <div class="field"><label>كلمة المرور الجديدة</label><input type="password"></div>
      <div class="field"><label>تأكيد كلمة المرور الجديدة</label><input type="password"></div>
      <div style="margin:16px 0;text-align:center;color:rgba(255,215,0,.8);font-size:12px">تم إرسال بريد إلكتروني إلى <span style="text-decoration:underline">email</span> مع معلومات حول كيفية إعادة تعيين كلمة المرور الخاصة بك.</div>
      <div style="display:flex;gap:10px">
        <button class="btn" style="flex:1" id="pwCancelBtn">إلغاء</button>
        <button class="btn blue" style="flex:1">حفظ</button>
      </div>
    </div>
  </div>

  <!-- ===== الشريط الجانبي ===== -->
  <div class="sb" id="sb">
    <div class="panel">
      <div class="brand">
        <div class="mark">B</div>
        <div class="name">Bin<span class="b">exia</span></div>
      </div>
      <div class="uCard">
        <div class="t">
          <b id="sidebarUserName">User530872</b>
          <small>🙈 <span>ID:</span> <span id="sidebarUserId">530872</span></small>
        </div>
        <div class="av" id="sbAvatar">👤</div>
      </div>
      <nav class="m">
        <a class="mi active" href="javascript:void(0)" data-page="profile" id="nav-profile">
          <div class="r"><span class="tx">المنطقة الشخصية</span><span class="dot"></span></div>
          <span class="ic"><img src="https://cdn-icons-png.flaticon.com/128/3024/3024605.png"></span>
        </a>
        <a class="mi" href="javascript:void(0)" data-page="rewards" id="nav-rewards">
          <div class="r"><span class="tx">متجر المكافآت</span></div>
          <span class="ic"><img src="https://cdn-icons-png.flaticon.com/128/3179/3179608.png"></span>
        </a>
        <a class="mi" href="index.html" id="nav-trade">
          <div class="r"><span class="tx">منصة التداول</span></div>
          <span class="ic"><img src="https://cdn-icons-png.flaticon.com/128/6516/6516126.png"></span>
        </a>
      </nav>
    </div>
  </div>
  <div class="sbOv" id="sbOv"></div>
</div>
`;

  // ensure body exists
  if (!document.body) {
    await new Promise((r) => document.addEventListener("DOMContentLoaded", r, { once: true }));
  }
  document.body.innerHTML = BODY_HTML;

  // ---------- UI Logic (converted from the regular script, same behavior) ----------
  const pages = ["profile", "rewards", "withdraw", "levels"];
  const tabs = { profile: "t-profile", rewards: "t-rewards", withdraw: "t-withdraw", levels: "t-levels" };

  function showPage(p) {
    pages.forEach((x) => {
      const el = document.getElementById("page-" + x);
      if (el) el.style.display = x === p ? "block" : "none";
    });

    Object.values(tabs).forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.remove("active");
    });
    if (tabs[p]) {
      const t = document.getElementById(tabs[p]);
      if (t) t.classList.add("active");
    }
  }

  function showCenter() {
    document.getElementById("center-view").style.display = "block";
    document.getElementById("history-view").style.display = "none";
    document.getElementById("btn-center").style.background = "rgba(255,215,0,.12)";
    document.getElementById("btn-center").style.borderColor = "var(--gold)";
    document.getElementById("btn-history").style.background = "transparent";
    document.getElementById("btn-history").style.borderColor = "rgba(255,215,0,.2)";
  }

  function showHistory() {
    document.getElementById("center-view").style.display = "none";
    document.getElementById("history-view").style.display = "block";
    document.getElementById("btn-center").style.background = "transparent";
    document.getElementById("btn-center").style.borderColor = "rgba(255,215,0,.2)";
    document.getElementById("btn-history").style.background = "rgba(255,215,0,.12)";
    document.getElementById("btn-history").style.borderColor = "var(--gold)";
  }

  function openPM() { document.getElementById("pmModal").style.display = "flex"; }
  function closePM() { document.getElementById("pmModal").style.display = "none"; }

  function pickPM(el, label) {
    document.querySelectorAll(".opt").forEach((o) => o.classList.remove("active"));
    el.classList.add("active");
    document.getElementById("pmBtn").innerText = label;
    closePM();
  }

  function openPW() { document.getElementById("pwModal").style.display = "flex"; }
  function closePW() { document.getElementById("pwModal").style.display = "none"; }

  function navTo(p, clickedEl) {
    showPage(p);
    document.getElementById("sb").classList.remove("on");
    document.querySelectorAll(".mi").forEach((m) => m.classList.remove("active"));
    if (clickedEl) clickedEl.classList.add("active");
  }

  // initial
  showPage("profile");

  // tab clicks
  document.getElementById("t-profile").addEventListener("click", () => showPage("profile"));
  document.getElementById("t-rewards").addEventListener("click", () => showPage("rewards"));
  document.getElementById("t-withdraw").addEventListener("click", () => showPage("withdraw"));
  document.getElementById("t-levels").addEventListener("click", () => showPage("levels"));

  // rewards sub-tabs
  document.getElementById("btn-center").addEventListener("click", showCenter);
  document.getElementById("btn-history").addEventListener("click", showHistory);

  // withdraw payment method modal
  document.getElementById("pmBtn").addEventListener("click", openPM);
  document.getElementById("pmCloseBtn").addEventListener("click", closePM);
  document.getElementById("pmModal").addEventListener("click", (e) => {
    if (e.target && e.target.id === "pmModal") closePM();
  });
  document.querySelectorAll(".opt").forEach((opt) => {
    opt.addEventListener("click", () => pickPM(opt, opt.getAttribute("data-label") || opt.innerText.trim()));
  });

  // password modal
  document.getElementById("openPwBtn").addEventListener("click", openPW);
  document.getElementById("pwCloseBtn").addEventListener("click", closePW);
  document.getElementById("pwCancelBtn").addEventListener("click", closePW);
  document.getElementById("pwModal").addEventListener("click", (e) => {
    if (e.target && e.target.id === "pwModal") closePW();
  });

  // sidebar
  const sb = document.getElementById("sb");
  const sbOv = document.getElementById("sbOv");
  const menuBtn = document.getElementById("menuBtn");
  function toggleSB() { sb.classList.toggle("on"); }

  menuBtn.addEventListener("click", toggleSB);
  sbOv.addEventListener("click", () => sb.classList.remove("on"));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") sb.classList.remove("on"); });

  // sidebar nav links
  document.querySelectorAll('.mi[data-page]').forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const p = a.getAttribute("data-page");
      navTo(p, a);
    });
  });

  // ---------- Firebase Module Script (same logic, using dynamic import) ----------
  const {
    initializeApp
  } = await import("https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js");

  let getAnalytics;
  try {
    ({ getAnalytics } = await import("https://www.gstatic.com/firebasejs/12.8.0/firebase-analytics.js"));
  } catch (e) {
    // ignore
  }

  const {
    getAuth, signInAnonymously, onAuthStateChanged
  } = await import("https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js");

  const {
    getFirestore, collection, addDoc, onSnapshot, serverTimestamp,
    doc, setDoc, getDoc, updateDoc, increment
  } = await import("https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js");

  const firebaseConfig = {
    apiKey: "AIzaSyBOUqLixfphg3b8hajc4hkwV-VJmldGBVw",
    authDomain: "randers-c640b.firebaseapp.com",
    projectId: "randers-c640b",
    storageBucket: "randers-c640b.firebasestorage.app",
    messagingSenderId: "391496092929",
    appId: "1:391496092929:web:58208b4eb3e6f9a8571f00",
    measurementId: "G-DBDSVVF7PS"
  };

  const app = initializeApp(firebaseConfig);
  try { if (getAnalytics) getAnalytics(app); } catch (e) { }
  const auth = getAuth(app), db = getFirestore(app);

  let currentUser = null, currentUserId = null;

  const ABOX = document.getElementById("avatarBox");
  const AF = document.getElementById("avatarFile");
  const AUP = document.getElementById("avatarUploadBtn");
  const SBAV = document.getElementById("sbAvatar");

  const setAvatarUI = (u) => {
    const a = u && u.startsWith("data:image") ? u : "";
    const set = (el) => { if (!el) return; el.innerHTML = a ? '<img alt="avatar" src="' + a + '">' : "👤"; };
    set(ABOX); set(SBAV);
  };

  const fileToDataUrl = (f) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result || ""));
    r.onerror = rej;
    r.readAsDataURL(f);
  });

  AUP.onclick = () => AF.click();

  AF.onchange = async () => {
    const f = AF.files && AF.files[0];
    if (!f || !currentUserId) return;
    try {
      const url = await fileToDataUrl(f);
      setAvatarUI(url);
      await updateDoc(doc(db, "users", currentUserId), { avatar: url, avatarUpdatedAt: serverTimestamp() });
      AF.value = "";
    } catch (e) { console.error(e); alert("تعذر رفع الصورة"); }
  };

  signInAnonymously(auth).catch((e) => console.error(e));

  onAuthStateChanged(auth, async (u) => {
    if (!u) return;
    currentUser = u;
    currentUserId = u.uid;

    const uid = u.uid.match(/\d+/g)?.join("") || "000000";
    window.currentUserId = uid;
    window.currentUserFullId = currentUserId;

    document.getElementById("userDisplayName").value = "User" + uid;
    document.getElementById("sidebarUserName").textContent = "User" + uid;
    document.getElementById("sidebarUserId").textContent = uid;

    await initUser();
    listenToUserDoc();
  });

  async function initUser() {
    try {
      const r = doc(db, "users", currentUserId), s = await getDoc(r);
      if (!s.exists()) {
        await setDoc(r, {
          userId: window.currentUserId,
          balance: 0,
          avatar: "",
          verified: { email: true, id: false, idStatus: "not_submitted" },
          createdAt: serverTimestamp()
        });
      } else {
        const d = s.data() || {}, v = d.verified || {};
        if (v.email !== true) await updateDoc(r, { "verified.email": true });
        if (!("idStatus" in v)) await updateDoc(r, { "verified.idStatus": v.id ? "approved" : "not_submitted" });
        if (!("avatar" in d)) await updateDoc(r, { avatar: "" });
      }
    } catch (e) { console.error(e); }
  }

  function setVerUI(v) {
    const emailOk = !!v?.email, idOk = !!v?.id, st = v?.idStatus || "not_submitted";
    const done = (emailOk ? 1 : 0) + (idOk ? 1 : 0);
    document.getElementById("vDone").textContent = done;
    document.getElementById("vMainBar").style.width = (done / 2 * 100) + "%";

    document.getElementById("emailStatus").textContent = "مكتمل";
    document.getElementById("emailStatus").className = "sok";
    document.getElementById("emailBar").style.width = "100%";
    document.getElementById("emailBar").style.background = "linear-gradient(90deg,#ffd700,#b8860b)";
    const emailBtn = document.getElementById("emailRetryBtn");
    emailBtn.textContent = "مكتمل"; emailBtn.className = "btn green"; emailBtn.disabled = true;

    const idBtn = document.getElementById("idRetryBtn");
    const idCheck = document.getElementById("idCheck");
    const idForm = document.getElementById("idForm");

    if (idOk) {
      document.getElementById("idStatus").textContent = "مكتمل";
      document.getElementById("idStatus").className = "sok";
      document.getElementById("idBar").style.width = "100%";
      document.getElementById("idBar").style.background = "linear-gradient(90deg,#ffd700,#b8860b)";
      idBtn.textContent = "مكتمل"; idBtn.className = "btn green";
      idCheck.style.display = "inline";
      if (idForm) idForm.style.display = "none";
    } else if (st === "pending") {
      document.getElementById("idStatus").textContent = "جاري التحقق";
      document.getElementById("idStatus").className = "swarn";
      document.getElementById("idBar").style.width = "70%";
      document.getElementById("idBar").style.background = "#f59e0b";
      idBtn.textContent = "جاري التحقق"; idBtn.className = "btn yellow";
      idCheck.style.display = "none";
      if (idForm) idForm.style.display = "none";
    } else {
      document.getElementById("idStatus").textContent = "غير مكتمل";
      document.getElementById("idStatus").className = "sbad";
      document.getElementById("idBar").style.width = "0%";
      document.getElementById("idBar").style.background = "#ef4444";
      idBtn.textContent = "غير مكتمل"; idBtn.className = "btn red";
      idCheck.style.display = "none";
    }

    const alert = document.getElementById("rewardAlert");
    if (alert) {
      if (emailOk && idOk) {
        alert.style.background = "linear-gradient(135deg,#1a1200,#2a1a00)";
        alert.style.borderColor = "var(--gold)";
        alert.textContent = "تم التحقق من ملفك الشخصي بنجاح يمكنك الحصول على الجائزة";
      } else {
        alert.style.background = "linear-gradient(135deg,#2a0000,#1a0000)";
        alert.style.borderColor = "#ef4444";
        alert.textContent = "إكمال التحقق من الملف الشخصي لتلقي المكافآت";
      }
    }
  }

  function listenToUserDoc() {
    const r = doc(db, "users", currentUserId);
    onSnapshot(r, (s) => {
      if (!s.exists()) return;
      const d = s.data() || {}, b = Number(d.balance || 0);
      document.getElementById("balanceDisplay").textContent = b.toFixed(2) + "$";
      document.getElementById("withdrawBalance").textContent = b.toFixed(2) + "$";
      setVerUI(d.verified || { email: true, id: false, idStatus: "not_submitted" });
      setAvatarUI(d.avatar || "");
    });
  }

  document.getElementById("emailRetryBtn").onclick = () => { };

  document.getElementById("idRetryBtn").onclick = () => {
    const f = document.getElementById("idForm");
    if (!f) return;
    f.style.display = (f.style.display === "none" || !f.style.display) ? "block" : "none";
  };

  document.getElementById("idSubmitBtn").onclick = async () => {
    if (!currentUserId) return;
    const front = document.getElementById("idFront")?.files?.[0];
    const back = document.getElementById("idBack")?.files?.[0];
    if (!front || !back) return alert("لازم ترفع صورة أمام وصورة خلف");
    try {
      await addDoc(collection(db, "kyc_requests"), {
        userId: currentUserId, userShortId: window.currentUserId,
        frontName: front.name, frontSize: front.size,
        backName: back.name, backSize: back.size,
        status: "pending", createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, "users", currentUserId), { "verified.idStatus": "pending", "verified.id": false });
      document.getElementById("idFront").value = "";
      document.getElementById("idBack").value = "";
      document.getElementById("idForm").style.display = "none";
      alert("تم التقديم بنجاح - جاري التحقق");
    } catch (e) { console.error(e); alert("حصل خطأ، حاول تاني"); }
  };

  document.getElementById("withdrawBtn").onclick = async () => {
    if (!currentUserId || !window.currentUserFullId) return;
    const amt = parseFloat((document.getElementById("wdAmount").value || "").toString().replace(",", "."));
    const wallet = (document.getElementById("wdWallet").value || "").trim();
    const method = (document.getElementById("pmBtn").innerText || "").trim();
    const ok = document.getElementById("t").checked;
    if (!ok) return alert("لازم توافق على الأحكام والشروط");
    if (!amt || amt <= 0) return alert("اكتب مبلغ صحيح");
    if (!wallet) return alert("اكتب معرّف المحفظة");
    const uref = doc(db, "users", currentUserId);

    try {
      const snap = await getDoc(uref);
      const bal = Number(snap.data()?.balance || 0);
      if (amt > bal) return alert("الرصيد غير كافي");
      await updateDoc(uref, { balance: increment(-amt) });
      await addDoc(collection(db, "withdraw_requests"), {
        userId: window.currentUserFullId, userShortId: window.currentUserId,
        amount: amt, method, wallet, status: "pending", createdAt: serverTimestamp()
      });
      alert("تم تقديم طلب السحب بنجاح");
    } catch (e) { console.error(e); alert("حصل خطأ، حاول تاني"); }
  };

})();
