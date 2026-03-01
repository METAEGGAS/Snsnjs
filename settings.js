/**
 * settings.js — QT Real Trading
 * =====================================================
 * يُضيف صفحة الإعدادات كـ Overlay داخل الموقع الرئيسي.
 * استخدام:  window.openSettings()
 * تضمين:   <script src="settings.js"></script>
 * =====================================================
 */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════
     1. INJECT TAJAWAL FONT
  ═══════════════════════════════════════════════════ */
  if (!document.querySelector('link[href*="Tajawal"]')) {
    var lnk = document.createElement('link');
    lnk.rel = 'stylesheet';
    lnk.href = 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap';
    document.head.appendChild(lnk);
  }

  /* ═══════════════════════════════════════════════════
     2. INJECT CSS  (all scoped to #settingsOverlay)
  ═══════════════════════════════════════════════════ */
  var CSS = `
/* ─── BASE OVERLAY ─── */
#settingsOverlay {
  position: fixed; inset: 0;
  background: #0a0e1a;
  z-index: 9999;
  display: none;
  flex-direction: column;
  font-family: 'Tajawal', Arial, sans-serif;
  direction: rtl;
  color: #eaf0ff;
  overflow: hidden;
}
#settingsOverlay.s-show { display: flex; }
#settingsOverlay * { box-sizing: border-box; margin: 0; padding: 0; }
#settingsOverlay img { display: block; }
#settingsOverlay button,
#settingsOverlay input,
#settingsOverlay select { font-family: 'Tajawal', Arial, sans-serif; }
#settingsOverlay ::-webkit-scrollbar { width: 6px; }
#settingsOverlay ::-webkit-scrollbar-thumb {
  background: rgba(255,215,0,.25); border-radius: 10px;
}

/* ─── HEADER ─── */
#settingsOverlay .s-hdr {
  height: 56px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 14px;
  background: linear-gradient(135deg,#0d1527 0%,#1a1000 50%,#0d1527 100%);
  border-bottom: 3px solid rgba(255,215,0,.35);
  box-shadow: 0 4px 20px rgba(255,215,0,.1);
}
#settingsOverlay .s-hdr-l { display: flex; align-items: center; gap: 10px; }
#settingsOverlay .s-hdr h1 {
  font-size: 16px; font-weight: 900;
  color: #ffd700; text-shadow: 0 0 12px rgba(255,215,0,.4);
}
#settingsOverlay .s-back {
  width: 36px; height: 36px; border-radius: 10px;
  background: rgba(255,215,0,.08);
  border: 2px solid rgba(255,215,0,.3);
  color: #ffd700; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 900; transition: .15s;
}
#settingsOverlay .s-back:active { transform: translateY(1px); opacity: .85; }

/* ─── MAIN SCROLL AREA ─── */
#settingsOverlay .s-main {
  flex: 1; overflow-y: auto; padding: 8px 0 0;
}

/* ─── MENU ITEM ─── */
#settingsOverlay .s-mi {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid rgba(255,215,0,.1);
  cursor: pointer; transition: background .2s;
}
#settingsOverlay .s-mi:hover { background: rgba(255,215,0,.06); }
#settingsOverlay .s-mi span {
  font-size: 15px; font-weight: 900; color: #eaf0ff;
}
#settingsOverlay .s-mi img {
  width: 22px; height: 22px;
  filter: sepia(1) saturate(4) hue-rotate(5deg) brightness(1.15);
}

/* ─── SUBMENU ─── */
#settingsOverlay .s-sub {
  background: rgba(255,215,0,.03);
  border-top: 1px solid rgba(255,215,0,.07);
  border-bottom: 1px solid rgba(255,215,0,.07);
  padding: 6px 18px;
}
#settingsOverlay .s-sub-item {
  padding: 10px 0;
  color: rgba(255,215,0,.65); font-size: 14px; font-weight: 800;
  cursor: pointer;
  border-bottom: 1px solid rgba(255,215,0,.06);
  transition: color .15s;
}
#settingsOverlay .s-sub-item:last-child { border-bottom: 0; }
#settingsOverlay .s-sub-item:hover { color: #ffd700; }

/* ─── LOGOUT ─── */
#settingsOverlay .s-logout-w { padding: 18px 14px 0; }
#settingsOverlay .s-logout-btn {
  width: 100%; max-width: 420px; margin: 0 auto; display: block;
  border-radius: 12px; padding: 13px 12px;
  font-size: 14px; font-weight: 900; cursor: pointer;
  background: rgba(255,77,77,.12); color: #ff4d4d;
  border: 1px solid rgba(255,77,77,.28);
  transition: .15s;
}
#settingsOverlay .s-logout-btn:active { opacity: .88; transform: translateY(1px); }

/* ─── BOTTOM NAV ─── */
#settingsOverlay .s-bnav {
  flex-shrink: 0;
  background: linear-gradient(180deg,#0d1527 0%,#080c18 100%);
  display: flex; justify-content: space-around;
  padding: 8px 0;
  border-top: 3px solid rgba(255,215,0,.3);
  box-shadow: 0 -4px 16px rgba(0,0,0,.5);
}
#settingsOverlay .s-nitem {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  color: rgba(255,215,0,.4); font-size: 9.5px; font-weight: 700;
  cursor: pointer; transition: color .2s; user-select: none;
}
#settingsOverlay .s-nitem.active,
#settingsOverlay .s-nitem:hover {
  color: #ffd700; text-shadow: 0 0 8px rgba(255,215,0,.5);
}
#settingsOverlay .s-nico {
  width: 23px; height: 23px;
  display: flex; align-items: center; justify-content: center;
}

/* ═══════ SECURITY SUB-PAGE ═══════ */
#settingsOverlay .s-sec-page {
  position: absolute; inset: 0;
  background: #0a0e1a; z-index: 10;
  display: none; flex-direction: column; overflow: hidden;
}
#settingsOverlay .s-sec-page.s-show { display: flex; }

#settingsOverlay .s-shdr {
  flex-shrink: 0; padding: 13px 14px;
  background: linear-gradient(135deg,#0d1527,#1a1000);
  border-bottom: 2px solid rgba(255,215,0,.3);
  display: flex; align-items: center; justify-content: space-between;
}
#settingsOverlay .s-shdr .ttl { display: flex; align-items: center; gap: 10px; }
#settingsOverlay .s-shdr h2 { font-size: 16px; font-weight: 900; color: #ffd700; }
#settingsOverlay .s-sscroll { flex: 1; overflow-y: auto; padding-bottom: 18px; }

#settingsOverlay .s-sect {
  margin: 14px 14px 0; border-radius: 14px;
  background: linear-gradient(180deg,#0d1527,#0a0e1a);
  border: 2px solid rgba(255,215,0,.2); padding: 14px;
}
#settingsOverlay .s-sect h3 {
  font-size: 14px; font-weight: 900; color: #ffd700; margin-bottom: 10px;
  text-shadow: 0 0 8px rgba(255,215,0,.3);
}

/* AUTH BOX */
#settingsOverlay .s-auth-box {
  border-radius: 14px; background: rgba(255,215,0,.04);
  border: 2px solid rgba(255,215,0,.18); padding: 14px 12px; text-align: center;
}
#settingsOverlay .s-auth-box img { width: 44px; height: 44px; margin: 0 auto 8px; }
#settingsOverlay .s-auth-box h4 { font-size: 14px; font-weight: 900; color: #eaf0ff; margin-bottom: 4px; }
#settingsOverlay .s-auth-box p  { font-size: 12px; font-weight: 900; color: rgba(255,215,0,.45); }
#settingsOverlay .s-auth-box p.active { color: #12e957; }

/* TOGGLE ROW */
#settingsOverlay .s-trow {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 2px; border-bottom: 1px solid rgba(255,215,0,.08);
}
#settingsOverlay .s-trow:last-child { border-bottom: 0; }
#settingsOverlay .s-trow span {
  font-size: 13px; font-weight: 900; color: #dbe6ff; max-width: 78%;
}
#settingsOverlay .s-tog {
  width: 46px; height: 26px; border-radius: 999px;
  background: rgba(255,215,0,.08); position: relative;
  cursor: pointer; flex: 0 0 auto; border: 2px solid rgba(255,215,0,.2);
  transition: background .22s;
}
#settingsOverlay .s-tog::after {
  content: ''; position: absolute; top: 2px; right: 2px;
  width: 22px; height: 22px; border-radius: 50%;
  background: rgba(255,215,0,.45); transition: .22s;
}
#settingsOverlay .s-tog.on { background: rgba(18,233,87,.9); }
#settingsOverlay .s-tog.on::after { right: 22px; background: #0a0e1a; }

/* SESSION CARD */
#settingsOverlay .s-sess-card {
  border-radius: 14px; background: rgba(255,215,0,.04);
  border: 2px solid rgba(255,215,0,.18); padding: 14px;
}
#settingsOverlay .s-srow {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; margin: 7px 0;
}
#settingsOverlay .s-slbl { font-size: 12px; font-weight: 900; color: rgba(255,215,0,.5); }
#settingsOverlay .s-sval { font-size: 12.5px; font-weight: 900; color: #fff; }
#settingsOverlay .s-sflag {
  width: 22px; height: 16px; border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,.4);
}
#settingsOverlay .s-end-btn {
  width: 100%; margin-top: 10px; border-radius: 10px; padding: 11px 10px;
  font-size: 13px; font-weight: 900; cursor: pointer;
  background: rgba(255,77,77,.1); color: #ff4d4d; border: 1px solid rgba(255,77,77,.3);
}
#settingsOverlay .s-end-btn:active { opacity: .88; transform: translateY(1px); }
#settingsOverlay .s-loading {
  text-align: center; color: rgba(255,215,0,.45);
  font-size: 13px; font-weight: 900; padding: 14px;
}

/* ═══════ DEP/WITHDRAW PAGE ═══════ */
#settingsOverlay .s-dep-page {
  position: absolute; inset: 0; background: #0a0e1a;
  z-index: 10; display: none; flex-direction: column; overflow: hidden;
}
#settingsOverlay .s-dep-page.s-show { display: flex; }
#settingsOverlay .s-dscroll { flex: 1; overflow-y: auto; padding-bottom: 14px; }
#settingsOverlay .s-ditem {
  margin: 14px 14px 0; border-radius: 14px;
  background: linear-gradient(180deg,#0d1527,#0a0e1a);
  border: 2px solid rgba(255,215,0,.2); padding: 14px;
}
#settingsOverlay .s-drow {
  display: flex; justify-content: space-between; margin: 6px 0; font-size: 13px;
}
#settingsOverlay .s-drow span:first-child { color: rgba(255,215,0,.5); font-weight: 900; }
#settingsOverlay .s-drow span:last-child { color: #fff; font-weight: 900; }
#settingsOverlay .s-dep-amt  { color: #12e957 !important; font-weight: 900; }
#settingsOverlay .s-wdr-amt  { color: #ff4d4d !important; font-weight: 900; }
#settingsOverlay .s-dst {
  display: inline-block; padding: 4px 10px; border-radius: 6px;
  font-size: 11px; font-weight: 900; margin-top: 4px;
}
#settingsOverlay .s-dst.success { background: rgba(18,233,87,.15); color: #12e957; }
#settingsOverlay .s-dst.pending { background: rgba(255,193,7,.15); color: #d4a206; }
#settingsOverlay .s-dst.fail    { background: rgba(255,77,77,.15);  color: #ff4d4d; }
#settingsOverlay .s-empty {
  margin: 22px 14px; border-radius: 14px;
  background: rgba(255,215,0,.02);
  border: 2px dashed rgba(255,215,0,.18);
  padding: 26px 14px; text-align: center;
  color: rgba(255,215,0,.38); font-weight: 900; font-size: 14px;
}

/* ═══════ MODALS ═══════ */
#settingsOverlay .s-modal {
  position: absolute; inset: 0;
  display: none; align-items: center; justify-content: center; z-index: 20;
}
#settingsOverlay .s-modal.s-show { display: flex; }
#settingsOverlay .s-ov {
  position: absolute; inset: 0;
  background: rgba(0,0,0,.65); backdrop-filter: blur(3px);
}
#settingsOverlay .s-bx {
  position: relative; width: min(94vw,420px);
  border-radius: 16px;
  background: linear-gradient(180deg,#0d1527,#0a0e1a);
  border: 2px solid rgba(255,215,0,.4); padding: 16px;
  box-shadow: 0 0 40px rgba(255,215,0,.15), 0 20px 60px rgba(0,0,0,.6);
}
#settingsOverlay .s-mt {
  font-size: 14.5px; font-weight: 900; color: #ffd700;
  margin-bottom: 12px; text-shadow: 0 0 8px rgba(255,215,0,.3);
}

/* CODE BOX */
#settingsOverlay .s-code {
  display: flex; gap: 8px; direction: ltr; justify-content: center;
  margin: 10px 0 4px;
}
#settingsOverlay .s-code input {
  width: 38px; height: 48px; text-align: center;
  font-size: 20px; font-weight: 900; border-radius: 10px;
  background: #0a0e1a; border: 2px solid rgba(255,215,0,.25);
  color: #ffd700; outline: none; transition: border .15s;
}
#settingsOverlay .s-code input:focus { border-color: #ffd700; }

/* ERROR */
#settingsOverlay .s-err {
  min-height: 18px; text-align: center;
  font-size: 12px; font-weight: 900; color: #ff6b6b;
  margin-top: 6px; display: none;
}

/* BUTTONS ROW */
#settingsOverlay .s-btns { display: flex; gap: 10px; margin-top: 14px; }
#settingsOverlay .s-btn {
  flex: 1; border: 0; border-radius: 10px;
  padding: 12px 10px; font-size: 14px; font-weight: 900; cursor: pointer;
  transition: .15s;
}
#settingsOverlay .s-save {
  background: linear-gradient(180deg,#ffd700,#b8860b); color: #000;
  box-shadow: 0 3px 12px rgba(255,215,0,.35);
}
#settingsOverlay .s-save:active { transform: scale(.97); }
#settingsOverlay .s-cancel {
  background: rgba(255,215,0,.07); color: #ffd700;
  border: 2px solid rgba(255,215,0,.25) !important;
}
#settingsOverlay .s-cancel:active { transform: scale(.97); }

/* INPUTS */
#settingsOverlay .s-inp {
  width: 100%; background: rgba(255,215,0,.04);
  border: 2px solid rgba(255,215,0,.22); border-radius: 10px;
  padding: 11px 12px; color: #fff; font-size: 14px; outline: none;
  font-family: 'Tajawal', Arial, sans-serif; transition: border .15s;
}
#settingsOverlay .s-inp::placeholder { color: rgba(255,215,0,.3); font-weight: 900; }
#settingsOverlay .s-inp:focus { border-color: rgba(255,215,0,.55); }
#settingsOverlay select.s-inp { appearance: none; }

/* MINI BUTTONS ROW */
#settingsOverlay .s-row { display: flex; gap: 8px; flex-wrap: wrap; }
#settingsOverlay .s-mini {
  flex: 1; min-width: 130px; border: 2px solid rgba(255,215,0,.22);
  background: rgba(255,215,0,.05); color: #ffd700;
  border-radius: 10px; padding: 10px; font-weight: 900; font-size: 12.5px;
  cursor: pointer; transition: .15s;
}
#settingsOverlay .s-mini:hover   { background: rgba(255,215,0,.12); }
#settingsOverlay .s-mini:active  { transform: translateY(1px); }
#settingsOverlay .s-mini.alt     { background: rgba(255,215,0,.02); }
`;

  var st = document.createElement('style');
  st.textContent = CSS;
  document.head.appendChild(st);

  /* ═══════════════════════════════════════════════════
     3. BUILD HTML
  ═══════════════════════════════════════════════════ */
  var ov = document.createElement('div');
  ov.id = 'settingsOverlay';
  ov.innerHTML = `

  <!-- ══ MAIN SETTINGS ══ -->
  <div class="s-hdr">
    <div class="s-hdr-l">
      <button class="s-back" id="s_backBtn">←</button>
      <h1>الإعدادات</h1>
    </div>
    <div style="width:36px"></div>
  </div>

  <div class="s-main">
    <div class="s-mi" id="s_secBtn">
      <span>الحماية والأمان</span>
      <img src="https://cdn-icons-png.flaticon.com/128/543/543116.png" alt="">
    </div>
    <div class="s-mi" id="s_wdrHistBtn">
      <span>سجل السحب</span>
      <img src="https://cdn-icons-png.flaticon.com/128/1603/1603847.png" alt="">
    </div>
    <div class="s-mi" id="s_depHistBtn">
      <span>سجل الايداعات</span>
      <img src="https://cdn-icons-png.flaticon.com/128/8916/8916557.png" alt="">
    </div>
    <div class="s-sub">
      <div class="s-sub-item" id="s_goDeposit">إيداع</div>
      <div class="s-sub-item" id="s_goWithdraw">سحب</div>
    </div>
    <div class="s-logout-w">
      <button class="s-logout-btn" id="s_logoutBtn">تسجيل خروج</button>
    </div>
  </div>

  <!-- ══ BOTTOM NAV (نفس الموقع الرئيسي) ══ -->
  <div class="s-bnav">
    <div class="s-nitem" data-snav="chart">
      <div class="s-nico">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
          <line x1="4" y1="20" x2="20" y2="20" stroke="currentColor" stroke-width="1"/>
          <line x1="4" y1="4"  x2="4"  y2="20" stroke="currentColor" stroke-width="1"/>
          <polyline points="4,16 8,12 12,14 16,8 20,10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="4"  cy="16" r="1.4" fill="currentColor"/>
          <circle cx="8"  cy="12" r="1.4" fill="currentColor"/>
          <circle cx="12" cy="14" r="1.4" fill="currentColor"/>
          <circle cx="16" cy="8"  r="1.4" fill="currentColor"/>
          <circle cx="20" cy="10" r="1.4" fill="currentColor"/>
        </svg>
      </div>
      <div>Chart</div>
    </div>
    <div class="s-nitem" data-snav="history">
      <div class="s-nico">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="7" width="18" height="14" rx="2" fill="currentColor"/>
          <rect x="8" y="3" width="8"  height="4"  rx="1" fill="currentColor"/>
          <line x1="6" y1="11" x2="18" y2="11" stroke="#0a0e1a" stroke-width="1.2"/>
          <line x1="6" y1="14" x2="18" y2="14" stroke="#0a0e1a" stroke-width="1.2"/>
          <line x1="6" y1="17" x2="18" y2="17" stroke="#0a0e1a" stroke-width="1.2"/>
        </svg>
      </div>
      <div>History</div>
    </div>
    <div class="s-nitem" data-snav="profile">
      <div class="s-nico">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="11" stroke="currentColor" stroke-width="2.5" fill="none"/>
          <circle cx="12" cy="8"  r="3"  fill="currentColor"/>
          <path d="M6 20c0-3.3 5-5 6-5s6 1.7 6 5" fill="currentColor"/>
        </svg>
      </div>
      <div>Profile</div>
    </div>
    <div class="s-nitem" data-snav="rank">
      <div class="s-nico">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="2" fill="none"/>
          <rect x="8"  y="18" width="8" height="2" fill="currentColor"/>
          <rect x="11" y="10" width="2" height="8" fill="currentColor"/>
          <path d="M6 10 C6 6,18 6,18 10 C18 14,6 14,6 10 Z" fill="currentColor"/>
          <path d="M6 10 C4 10,4 12,6 12" stroke="currentColor" stroke-width="2" fill="none"/>
          <path d="M18 10 C20 10,20 12,18 12" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
      </div>
      <div>Rank</div>
    </div>
    <div class="s-nitem active" data-snav="settings">
      <div class="s-nico">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" stroke-width="2" fill="none"/>
          <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2.5" fill="currentColor"/>
          <line x1="12" y1="2"  x2="12" y2="5"  stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="2"  y1="12" x2="5"  y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="19" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="5"  y1="5"  x2="7"  y2="7"  stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="17" y1="17" x2="19" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="5"  y1="19" x2="7"  y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line x1="17" y1="7"  x2="19" y2="5"  stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <div>Settings</div>
    </div>
  </div>

  <!-- ══ SECURITY SUB-PAGE ══ -->
  <div class="s-sec-page" id="s_secPage">
    <div class="s-shdr">
      <div class="ttl">
        <button class="s-back" id="s_secBack">←</button>
        <h2>الأمن</h2>
      </div>
      <div style="width:36px"></div>
    </div>
    <div class="s-sscroll">
      <div class="s-sect">
        <h3>تغيير كلمة السر</h3>
        <div class="s-row">
          <button class="s-mini"     id="s_openCp">تغيير كلمة السر</button>
          <button class="s-mini alt" id="s_showMasked">إظهار كلمة السر (مشفّر)</button>
          <button class="s-mini alt" id="s_showPlain">إظهار كلمة السر (عادي)</button>
        </div>
      </div>
      <div class="s-sect">
        <h3>المصادقة الثنائية (2FA)</h3>
        <div class="s-auth-box">
          <img src="https://www.gstatic.com/images/branding/product/1x/authenticator_48dp.png" alt="">
          <h4>Google Authenticator</h4>
          <p id="s_gaStatus">غير نشط</p>
        </div>
        <div class="s-trow">
          <span>المصادقة الثنائية على تسجيل الدخول</span>
          <div class="s-tog" id="s_login2fa" role="switch" aria-checked="false" tabindex="0"></div>
        </div>
        <div class="s-trow">
          <span>المصادقة الثنائية على السحب</span>
          <div class="s-tog" id="s_wdr2fa" role="switch" aria-checked="false" tabindex="0"></div>
        </div>
      </div>
      <div class="s-sect">
        <h3>جلسات نشطة</h3>
        <div id="s_sessBox" class="s-loading">جاري التحميل...</div>
      </div>
    </div>
  </div>

  <!-- ══ HISTORY SUB-PAGE ══ -->
  <div class="s-dep-page" id="s_depPage">
    <div class="s-shdr">
      <div class="ttl">
        <button class="s-back" id="s_depBack">←</button>
        <h2 id="s_depTitle">السجل</h2>
      </div>
      <div style="width:36px"></div>
    </div>
    <div class="s-dscroll">
      <div id="s_depList"></div>
    </div>
  </div>

  <!-- ══ MODAL: رمز التحقق ══ -->
  <div class="s-modal" id="s_mCode">
    <div class="s-ov"></div>
    <div class="s-bx">
      <div class="s-mt" id="s_codeTitle">أدخل رمز التحقق (6 أرقام)</div>
      <div class="s-code" id="s_code"></div>
      <div class="s-err" id="s_codeErr"></div>
      <div class="s-btns">
        <button class="s-btn s-cancel" id="s_codeCancBtn">إلغاء</button>
        <button class="s-btn s-save"   id="s_codeSaveBtn">حفظ</button>
      </div>
    </div>
  </div>

  <!-- ══ MODAL: بيانات الحساب ══ -->
  <div class="s-modal" id="s_mInfo">
    <div class="s-ov"></div>
    <div class="s-bx">
      <div class="s-mt">بيانات الحساب</div>
      <div id="s_infoBody" style="font-size:13px;font-weight:900;line-height:1.9;color:#eaf0ff"></div>
      <div class="s-btns">
        <button class="s-btn s-cancel" id="s_infoCloseBtn">إغلاق</button>
      </div>
    </div>
  </div>

  <!-- ══ MODAL: تغيير كلمة السر ══ -->
  <div class="s-modal" id="s_mCp">
    <div class="s-ov"></div>
    <div class="s-bx">
      <div class="s-mt">تغيير كلمة السر</div>
      <input class="s-inp" id="s_oldP"  type="password" placeholder="كلمة السر القديمة">
      <div style="height:8px"></div>
      <input class="s-inp" id="s_newP"  type="password" placeholder="كلمة السر الجديدة">
      <div style="height:8px"></div>
      <input class="s-inp" id="s_newP2" type="password" placeholder="تأكيد كلمة السر الجديدة">
      <div class="s-err" id="s_cpErr"></div>
      <div class="s-btns">
        <button class="s-btn s-cancel" id="s_cpCancBtn">إلغاء</button>
        <button class="s-btn s-save"   id="s_cpSaveBtn">حفظ</button>
      </div>
    </div>
  </div>

  <!-- ══ MODAL: سجل وهمي ══ -->
  <div class="s-modal" id="s_mFake">
    <div class="s-ov"></div>
    <div class="s-bx">
      <div class="s-mt">إضافة طلب وهمي</div>
      <select class="s-inp" id="s_fType">
        <option value="deposit">إيداع</option>
        <option value="withdraw">سحب</option>
      </select>
      <div style="height:8px"></div>
      <input class="s-inp" id="s_fId"   placeholder="الايدي / معرف المعاملة">
      <div style="height:8px"></div>
      <input class="s-inp" id="s_fCoin" placeholder="النوع (مثال: USDT (TRC-20))">
      <div style="height:8px"></div>
      <input class="s-inp" id="s_fAmt"  placeholder="المبلغ (مثال: $100.00+)">
      <div style="height:8px"></div>
      <select class="s-inp" id="s_fStatus">
        <option value="pending">قيد الانتظار</option>
        <option value="success">ناجح</option>
        <option value="fail">فشل</option>
      </select>
      <div style="height:8px"></div>
      <input class="s-inp" id="s_fDate" placeholder="التاريخ/الوقت (اختياري)">
      <div class="s-err" id="s_fErr"></div>
      <div class="s-btns">
        <button class="s-btn s-cancel" id="s_fCancBtn">إلغاء</button>
        <button class="s-btn s-save"   id="s_fSaveBtn">حفظ</button>
      </div>
    </div>
  </div>
  `;

  document.body.appendChild(ov);

  /* ═══════════════════════════════════════════════════
     4. HELPERS
  ═══════════════════════════════════════════════════ */
  var G = function(id){ return document.getElementById(id); };

  /* Firebase — يستخدم instance الموجود بالموقع الرئيسي */
  function getFB() {
    try {
      if (typeof firebase === 'undefined') throw new Error('no firebase');
      if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp({
          apiKey: "AIzaSyBOUqLixfphg3b8hajc4hkwV-VJmldGBVw",
          authDomain: "randers-c640b.firebaseapp.com",
          projectId: "randers-c640b",
          storageBucket: "randers-c640b.firebasestorage.app",
          messagingSenderId: "391496092929",
          appId: "1:391496092929:web:58208b4eb3e6f9a8571f00"
        });
      }
      return { auth: firebase.auth(), db: firebase.firestore() };
    } catch(e) { return null; }
  }

  function mustEP() {
    var fb = getFB();
    if (!fb) { alert('Firebase غير متاح'); return false; }
    var u = fb.auth.currentUser;
    if (!u) { alert('لازم تسجل دخول أولاً'); return false; }
    var ok = (u.providerData||[]).some(function(p){ return p.providerId === 'password'; });
    if (!ok) { alert('الحساب لازم يكون Email/Password فقط.'); return false; }
    return true;
  }

  /* ═══════════════════════════════════════════════════
     5. TOGGLE
  ═══════════════════════════════════════════════════ */
  function setTog(el, v) {
    el.classList.toggle('on', !!v);
    el.setAttribute('aria-checked', v ? 'true' : 'false');
  }
  function refreshGA() {
    var l  = G('s_login2fa'), w = G('s_wdr2fa'), gs = G('s_gaStatus');
    var on = l.classList.contains('on') || w.classList.contains('on');
    gs.textContent  = on ? 'نشط' : 'غير نشط';
    gs.className    = on ? 'active' : '';
  }

  /* ═══════════════════════════════════════════════════
     6. OTP CODE INPUT
  ═══════════════════════════════════════════════════ */
  function buildCode() {
    var box = G('s_code');
    box.innerHTML = '';
    for (var i = 0; i < 6; i++) {
      var inp = document.createElement('input');
      inp.inputMode = 'numeric';
      inp.maxLength = 1;
      inp.autocomplete = 'one-time-code';
      inp.addEventListener('input', (function(el){
        return function(){
          el.value = el.value.replace(/\D/g,'').slice(0,1);
          if (el.value && el.nextElementSibling) el.nextElementSibling.focus();
        };
      })(inp));
      inp.addEventListener('keydown', (function(el){
        return function(e){
          if (e.key === 'Backspace' && !el.value && el.previousElementSibling)
            el.previousElementSibling.focus();
        };
      })(inp));
      inp.addEventListener('paste', function(e){
        e.preventDefault();
        var txt = ((e.clipboardData||window.clipboardData).getData('text')||'').replace(/\D/g,'').slice(0,6);
        var inputs = box.querySelectorAll('input');
        txt.split('').forEach(function(ch,idx){ if(inputs[idx]) inputs[idx].value = ch; });
        if (inputs[txt.length]) inputs[txt.length].focus();
      });
      box.appendChild(inp);
    }
  }
  function getCode() {
    return Array.from(G('s_code').querySelectorAll('input')).map(function(i){return i.value;}).join('');
  }
  function clearCode() {
    G('s_code').querySelectorAll('input').forEach(function(i){ i.value = ''; });
  }

  var twoFAMode = 'login';
  function openCodeModal(title) {
    G('s_codeTitle').textContent = title;
    G('s_codeErr').style.display = 'none';
    G('s_mCode').classList.add('s-show');
    setTimeout(function(){ var f = G('s_code').querySelector('input'); if(f) f.focus(); }, 120);
  }
  function closeCodeModal() {
    G('s_mCode').classList.remove('s-show');
    clearCode();
  }

  /* ═══════════════════════════════════════════════════
     7. FIREBASE ACTIONS
  ═══════════════════════════════════════════════════ */
  async function load2FA() {
    try {
      var fb = getFB(); if (!fb) return;
      var u = fb.auth.currentUser; if (!u) return;
      var snap = await fb.db.collection('security').doc(u.uid).get();
      if (snap.exists()) {
        var d = snap.data();
        if (d.login_enabled)    { setTog(G('s_login2fa'), true); }
        if (d.withdraw_enabled) { setTog(G('s_wdr2fa'), true);   }
        refreshGA();
      }
    } catch(e) { console.warn('load2FA', e); }
  }

  async function save2FA(key, code) {
    var fb = getFB(); if (!fb) throw new Error('no fb');
    var u = fb.auth.currentUser; if (!u) throw new Error('no user');
    var data = {};
    data[key + '_enabled'] = true;
    data[key + '_code']    = code;
    data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    await fb.db.collection('security').doc(u.uid).set(data, { merge: true });
    key === 'login' ? setTog(G('s_login2fa'), true) : setTog(G('s_wdr2fa'), true);
    refreshGA();
  }

  async function loadSession() {
    var box = G('s_sessBox');
    try {
      var r = await fetch('https://ipapi.co/json/');
      var d = await r.json();
      var now = new Date().toISOString().slice(0,19).replace('T',' ');
      var ip  = d.ip || 'غير متوفر';
      var plt = navigator.platform || 'Unknown';
      var br  = (navigator.userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)/)||['Mozilla'])[0];
      var cc  = (d.country_code||'xx').toLowerCase();
      var ct  = d.city || 'غير متوفر';
      box.innerHTML = `
        <div class="s-sess-card">
          <div class="s-srow"><span class="s-slbl">النشاط الأخير:</span><span class="s-sval">${now}</span></div>
          <div class="s-srow"><span class="s-slbl">IP:</span><span class="s-sval">${ip}</span></div>
          <div class="s-srow"><span class="s-slbl">جهاز / نظام:</span><span class="s-sval">${plt}</span></div>
          <div class="s-srow"><span class="s-slbl">المتصفح:</span><span class="s-sval">${br}</span></div>
          <div class="s-srow"><span class="s-slbl">الدولة:</span><span class="s-sval"><img class="s-sflag" src="https://flagcdn.com/w40/${cc}.png" alt=""></span></div>
          <div class="s-srow"><span class="s-slbl">المدينة:</span><span class="s-sval">${ct}</span></div>
          <button class="s-end-btn" id="s_endAllBtn">إنهاء جميع الجلسات</button>
        </div>`;
      G('s_endAllBtn').onclick = function(){ alert('تم إنهاء جميع الجلسات'); };
    } catch(e) {
      box.innerHTML = '<div class="s-sess-card"><div style="text-align:center;color:#ff6b6b;font-size:13px;padding:20px;font-weight:900">فشل تحميل معلومات الجلسة</div></div>';
    }
  }

  /* ═══════════════════════════════════════════════════
     8. FAKE HISTORY
  ═══════════════════════════════════════════════════ */
  var HKEY = 'fake_history_v1';
  var curMode = 'deposit';
  var lpT = null;

  function loadH() { try { return JSON.parse(localStorage.getItem(HKEY)||'[]'); } catch(e){ return []; } }
  function saveH(a) { localStorage.setItem(HKEY, JSON.stringify(a)); }
  var stTxt = function(s){ return s==='success'?'ناجح':s==='pending'?'قيد الانتظار':'فشل'; };

  function renderH() {
    var dl  = G('s_depList');
    var arr = loadH().filter(function(x){ return x.type === curMode; });
    if (!arr.length) {
      dl.innerHTML = '<div class="s-empty" id="s_emptyBox">لا توجد بيانات</div>';
      hookLP(); return;
    }
    var html = '';
    arr.slice().reverse().forEach(function(d){
      var sc  = d.status==='success'?'success':d.status==='pending'?'pending':'fail';
      var amc = curMode==='withdraw' ? 's-wdr-amt' : 's-dep-amt';
      var act = curMode==='withdraw' ? 'Withdraw' : 'Deposit';
      html += `<div class="s-ditem">
        <div class="s-drow"><span>معرف المعاملة</span><span>${d.id}</span></div>
        <div class="s-drow"><span>المبلغ</span><span class="${amc}">${d.amt}</span></div>
        <div class="s-drow"><span>${d.coin||'—'}</span><span>${act}</span></div>
        <div class="s-drow"><span>${d.date}</span><span></span></div>
        <div><span class="s-dst ${sc}">${stTxt(d.status)}</span></div>
      </div>`;
    });
    dl.innerHTML = html;
  }

  function hookLP() {
    var box = G('s_emptyBox'); if (!box) return;
    var start = function(){ clearTimeout(lpT); lpT = setTimeout(function(){ fakeOpen(curMode); }, 5000); };
    var end   = function(){ clearTimeout(lpT); lpT = null; };
    ['touchstart','mousedown'].forEach(function(ev){ box.addEventListener(ev, start, {passive:true}); });
    ['touchend','touchcancel','mouseup','mouseleave'].forEach(function(ev){ box.addEventListener(ev, end, {passive:true}); });
  }

  function openHist(mode) {
    curMode = mode;
    G('s_depTitle').textContent = mode==='deposit' ? 'سجل الايداعات' : 'سجل السحب';
    G('s_depPage').classList.add('s-show');
    renderH();
  }

  function fakeOpen(mode) {
    G('s_fErr').style.display = 'none';
    G('s_fType').value  = mode;
    G('s_fId').value    = '';
    G('s_fCoin').value  = 'USDT (TRC-20)';
    G('s_fAmt').value   = mode==='deposit' ? '$100.00+' : '-$120.00';
    G('s_fStatus').value= 'pending';
    G('s_fDate').value  = '';
    G('s_mFake').classList.add('s-show');
  }

  /* ═══════════════════════════════════════════════════
     9. ACCOUNT INFO
  ═══════════════════════════════════════════════════ */
  var fmtT = function(t){ return t ? new Date(t).toISOString().slice(0,19).replace('T',' ') : 'غير متوفر'; };

  function showAcc(mode) {
    var fb = getFB(); if (!fb) { alert('Firebase غير متاح'); return; }
    var u  = fb.auth.currentUser;
    if (!u) { alert('لازم تسجل دخول'); return; }
    var email = u.email || 'غير متوفر';
    var ct    = fmtT(u.metadata && u.metadata.creationTime);
    var ls    = fmtT(u.metadata && u.metadata.lastSignInTime);
    var pass  = mode==='plain' ? 'غير متاح عرض كلمة السر من Firebase' : '••••••••••';
    G('s_infoBody').innerHTML = `
      <div style="background:rgba(255,215,0,.05);border:2px solid rgba(255,215,0,.2);border-radius:12px;padding:12px">
        <div style="margin-bottom:6px"><span style="color:rgba(255,215,0,.55)">البريد:</span> <b>${email}</b></div>
        <div style="margin-bottom:6px"><span style="color:rgba(255,215,0,.55)">تاريخ الإنشاء:</span> <b>${ct}</b></div>
        <div style="margin-bottom:6px"><span style="color:rgba(255,215,0,.55)">آخر دخول:</span> <b>${ls}</b></div>
        <div><span style="color:rgba(255,215,0,.55)">كلمة السر:</span> <b>${pass}</b></div>
      </div>`;
    G('s_mInfo').classList.add('s-show');
  }

  /* ═══════════════════════════════════════════════════
     10. INIT EVENT LISTENERS
  ═══════════════════════════════════════════════════ */
  function init() {
    buildCode();

    /* ── رجوع رئيسي ── */
    G('s_backBtn').onclick = closeSettings;

    /* ── الأمان ── */
    G('s_secBtn').onclick = function(){
      if (!mustEP()) return;
      G('s_secPage').classList.add('s-show');
      load2FA();
      loadSession();
    };
    G('s_secBack').onclick = function(){ G('s_secPage').classList.remove('s-show'); };

    /* ── السجلات ── */
    G('s_depHistBtn').onclick = function(){ openHist('deposit');  };
    G('s_wdrHistBtn').onclick = function(){ openHist('withdraw'); };
    G('s_depBack').onclick    = function(){ G('s_depPage').classList.remove('s-show'); };

    /* ── إيداع / سحب ── */
    G('s_goDeposit').onclick = function(){ closeSettings(); window.location.href = 'deposit.html'; };
    G('s_goWithdraw').onclick= function(){ closeSettings(); window.location.href = 'profile.html'; };

    /* ── 2FA toggles ── */
    G('s_login2fa').onclick = function(){
      if (!mustEP()) return;
      twoFAMode = 'login';
      openCodeModal('أدخل رمز التحقق لتفعيل حماية تسجيل الدخول');
    };
    G('s_wdr2fa').onclick = function(){
      if (!mustEP()) return;
      twoFAMode = 'withdraw';
      openCodeModal('أدخل رمز التحقق لتفعيل حماية السحب');
    };

    /* ── حفظ كود ── */
    G('s_codeSaveBtn').onclick = async function(){
      if (!mustEP()) return;
      var v = getCode();
      if (!/^\d{6}$/.test(v)) {
        G('s_codeErr').textContent = 'لازم تدخل 6 أرقام.';
        G('s_codeErr').style.display = 'block'; return;
      }
      try {
        await save2FA(twoFAMode, v);
        closeCodeModal();
        alert('✅ تم حفظ الإعدادات بنجاح');
      } catch(e) {
        G('s_codeErr').textContent = 'حصل خطأ في الحفظ';
        G('s_codeErr').style.display = 'block';
      }
    };
    G('s_codeCancBtn').onclick = closeCodeModal;
    G('s_mCode').querySelector('.s-ov').onclick = function(){};

    /* ── بيانات الحساب ── */
    G('s_showMasked').onclick = function(){ showAcc('mask');  };
    G('s_showPlain').onclick  = function(){ showAcc('plain'); };
    G('s_infoCloseBtn').onclick = function(){ G('s_mInfo').classList.remove('s-show'); };
    G('s_mInfo').querySelector('.s-ov').onclick = function(){};

    /* ── تغيير كلمة السر ── */
    G('s_openCp').onclick = function(){
      if (!mustEP()) return;
      G('s_cpErr').style.display = 'none';
      ['s_oldP','s_newP','s_newP2'].forEach(function(id){ G(id).value = ''; });
      G('s_mCp').classList.add('s-show');
    };
    G('s_cpCancBtn').onclick = function(){ G('s_mCp').classList.remove('s-show'); };
    G('s_mCp').querySelector('.s-ov').onclick = function(){};
    G('s_cpSaveBtn').onclick = async function(){
      if (!mustEP()) return;
      var fb  = getFB(); if (!fb) return;
      var u   = fb.auth.currentUser;
      var ep  = G('s_cpErr');
      ep.style.display = 'none';
      var oldP = G('s_oldP').value.trim();
      var newP = G('s_newP').value.trim();
      var np2  = G('s_newP2').value.trim();
      if (!oldP || !newP || newP !== np2 || newP.length < 6) {
        ep.textContent = 'راجع البيانات (تأكيد / طول 6+ أحرف).';
        ep.style.display = 'block'; return;
      }
      try {
        var cred = firebase.auth.EmailAuthProvider.credential(u.email, oldP);
        await u.reauthenticateWithCredential(cred);
        await u.updatePassword(newP);
        alert('✅ تم تغيير كلمة السر بنجاح.');
        G('s_mCp').classList.remove('s-show');
      } catch(e) {
        ep.textContent = 'فشل: كلمة السر القديمة غلط أو الجلسة تحتاج إعادة تحقق.';
        ep.style.display = 'block';
      }
    };

    /* ── السجل الوهمي ── */
    G('s_fCancBtn').onclick = function(){ G('s_mFake').classList.remove('s-show'); };
    G('s_mFake').querySelector('.s-ov').onclick = function(){};
    G('s_fSaveBtn').onclick = function(){
      var fe   = G('s_fErr');
      var type = G('s_fType').value;
      var id   = G('s_fId').value.trim();
      var coin = G('s_fCoin').value.trim();
      var amt  = G('s_fAmt').value.trim();
      var stat = G('s_fStatus').value;
      var din  = G('s_fDate').value.trim();
      if (!id || !amt) {
        fe.textContent = 'لازم تكتب الايدي + المبلغ.';
        fe.style.display = 'block'; return;
      }
      var date = din || new Date().toISOString().slice(0,19).replace('T',' ');
      var arr  = loadH();
      arr.push({ type:type, id:id, coin:coin, amt:amt, status:stat, date:date });
      saveH(arr);
      G('s_mFake').classList.remove('s-show');
      openHist(type);
    };

    /* ── تسجيل خروج ── */
    G('s_logoutBtn').onclick = async function(){
      var fb = getFB();
      try {
        if (fb) await fb.auth.signOut();
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = 'login.html';
      } catch(e) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = 'login.html';
      }
    };

    /* ── Bottom Nav ── */
    ov.querySelectorAll('.s-nitem[data-snav]').forEach(function(item){
      item.onclick = function(){
        var nav = item.dataset.snav;
        if (nav === 'settings') return;
        closeSettings();
        if (nav === 'history') {
          var hp = document.getElementById('historyPanel');
          if (hp) { setTimeout(function(){ hp.classList.add('show'); }, 80); }
        } else if (nav === 'profile') {
          window.location.href = 'profile.html';
        } else if (nav === 'rank') {
          window.location.href = 'ranked.html';
        }
        /* nav === 'chart' : نغلق فقط → يظهر الشارت */
      };
    });
  }

  /* ═══════════════════════════════════════════════════
     11. OPEN / CLOSE
  ═══════════════════════════════════════════════════ */
  function closeSettings() {
    ov.classList.remove('s-show');
    ['s_secPage','s_depPage'].forEach(function(id){ G(id).classList.remove('s-show'); });
    ['s_mCode','s_mInfo','s_mCp','s_mFake'].forEach(function(id){ G(id).classList.remove('s-show'); });
  }

  /* ═══════════════════════════════════════════════════
     12. RUN
  ═══════════════════════════════════════════════════ */
  init();

  /* Public API */
  window.openSettings = function() {
    ov.classList.add('s-show');
  };

})();
