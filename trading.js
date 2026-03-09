(() => {
  // ========= [0] Document basics =========
  document.documentElement.lang = "en";
  document.documentElement.dir = "ltr";

  // Clear body
  document.body.innerHTML = "";
  document.body.style.margin = "0";

  // ========= [1] Inject CSS (Gold bright page) =========
  const style = document.createElement("style");
  style.textContent = `
    :root{
      /* ===== Bright Gold (Page) ===== */
      --gold-0:#FFFDF2;
      --gold-1:#FFF1B8;
      --gold-2:#FFD56A;
      --gold-3:#D4AF37;
      --gold-4:#8A6A12;

      /* ===== App UI ===== */
      --text:#1B1202;
      --muted: rgba(27, 18, 2, .72);

      --card: rgba(255, 255, 255, .58);
      --card-strong: rgba(255, 255, 255, .78);

      --stroke: rgba(138, 106, 18, .18);
      --stroke-strong: rgba(138, 106, 18, .32);

      --success:#16C172;
      --success-soft: rgba(22, 193, 114, .14);

      --shadow: 0 24px 70px rgba(0,0,0,.22);
      --radius: 18px;

      --ease: cubic-bezier(.2,.8,.2,1);
    }

    *{ box-sizing:border-box; }
    html, body{ height:100%; }

    body{
      font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
      color:var(--text);

      /* ===== BRIGHT GOLD BACKGROUND ===== */
      background:
        radial-gradient(1000px 520px at 15% 10%, rgba(255,255,255,.90), transparent 60%),
        radial-gradient(900px 520px at 85% 0%, rgba(255, 213, 106, .95), transparent 62%),
        radial-gradient(900px 700px at 50% 110%, rgba(212,175,55,.85), transparent 60%),
        linear-gradient(180deg, #FFFDF2 0%, #FFF1B8 30%, #FFD56A 60%, #E3A20C 100%);

      display:flex;
      flex-direction:column;
      align-items:stretch;
    }

    header{ padding: 28px 15vw 10px; }
    main{ padding: 14px 15vw 34px; display:flex; justify-content:center; }

    .hero{
      border:1px solid var(--stroke);
      background: linear-gradient(180deg, rgba(255,255,255,.65), rgba(255,255,255,.42));
      box-shadow: var(--shadow);
      border-radius: 24px;
      padding: 22px 18px;
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:16px;
      position:relative;
      overflow:hidden;
      backdrop-filter: blur(12px);
    }

    .hero::before{
      content:"";
      position:absolute;
      inset:-2px;
      background:
        radial-gradient(680px 220px at 50% 0%, rgba(255,213,106,.35), transparent 72%),
        radial-gradient(520px 220px at 20% 40%, rgba(212,175,55,.25), transparent 75%);
      pointer-events:none;
    }

    .brand{ position:relative; z-index:1; display:flex; flex-direction:column; gap:6px; }
    .brand h1{
      margin:0;
      font-size: 16px;
      font-weight: 900;
      letter-spacing: .2px;
    }
    .brand p{
      margin:0;
      color:var(--muted);
      font-size: 13px;
      line-height:1.55;
      max-width: 54ch;
    }

    .robot-wrap{
      position:relative;
      z-index:1;
      width:72px;
      height:72px;
      display:grid;
      place-items:center;
      border-radius: 18px;
      background: linear-gradient(135deg, rgba(255,241,184,.85), rgba(212,175,55,.25));
      border:1px solid var(--stroke-strong);
      box-shadow: 0 18px 46px rgba(0,0,0,.18);
    }
    .robot{
      width:46px;
      height:46px;
      filter: drop-shadow(0 12px 24px rgba(0,0,0,.20));
    }

    .panel{
      width:min(820px, 100%);
      border:1px solid var(--stroke);
      background: var(--card);
      box-shadow: var(--shadow);
      border-radius: var(--radius);
      padding: 18px;
      backdrop-filter: blur(12px);
    }

    .section-title{
      margin: 0 0 10px 0;
      font-size: 12px;
      letter-spacing: .14em;
      text-transform: uppercase;
      font-weight: 900;
      color: rgba(27, 18, 2, .82);
    }

    .amount-grid{
      display:grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap:10px;
      margin-bottom: 12px;
    }

    .amount-btn{
      position:relative;
      border:1px solid rgba(138,106,18,.22);
      background: rgba(255,255,255,.45);
      color: var(--text);
      border-radius: 14px;
      padding: 12px 10px;
      font-weight: 900;
      cursor:pointer;
      transition: transform .14s var(--ease), border-color .14s var(--ease), background .14s var(--ease), box-shadow .14s var(--ease);
      user-select:none;
      outline: none;
    }
    .amount-btn:hover{
      transform: translateY(-1px);
      border-color: rgba(212,175,55,.70);
      background: rgba(255,255,255,.62);
    }
    .amount-btn:focus-visible{
      box-shadow: 0 0 0 3px rgba(212,175,55,.22);
    }

    .amount-btn.selected{
      border-color: rgba(22,193,114,.90);
      background: var(--success-soft);
      box-shadow: 0 0 0 3px rgba(22,193,114,.18);
      color: #0A2A18;
    }
    .amount-btn.selected::after{
      content:"";
      position:absolute;
      right:10px;
      top:10px;
      width:10px;
      height:10px;
      border-radius:999px;
      background: rgba(22,193,114,.95);
      box-shadow: 0 0 0 4px rgba(22,193,114,.14);
    }

    .info-bar{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:10px;
      margin: 6px 0 14px;
      padding: 10px 12px;
      border-radius: 14px;
      border: 1px solid rgba(138,106,18,.16);
      background: rgba(255,255,255,.42);
      color: var(--muted);
      font-size: 13px;
      line-height: 1.5;
    }
    .info-bar strong{ color: var(--text); font-weight: 950; }

    .btn{
      width:100%;
      border:0;
      border-radius: 14px;
      padding: 14px 16px;
      font-size: 16px;
      font-weight: 950;
      color: #1B1202;
      background: linear-gradient(90deg, var(--gold-1), var(--gold-3), #C79C2A);
      cursor:pointer;
      transition: transform .12s var(--ease), filter .12s var(--ease), opacity .12s var(--ease);
      box-shadow: 0 20px 54px rgba(138,106,18,.18);
    }
    .btn:hover{ filter: brightness(1.05); }
    .btn:active{ transform: translateY(1px) scale(.99); }
    .btn[disabled]{ opacity:.6; cursor:not-allowed; filter: grayscale(.2); }

    .status{
      margin-top: 14px;
      padding: 14px;
      border-radius: 14px;
      border:1px dashed rgba(138,106,18,.28);
      background: rgba(255,255,255,.40);
      display:none;
      gap:12px;
      align-items:flex-start;
    }
    .status.active{ display:flex; }

    .badge{
      position:relative;
      flex: 0 0 auto;
      min-width: 110px;
      padding: 10px 14px;
      border-radius: 999px;
      font-weight: 950;
      font-size: 12px;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: #1B1202;
      background: rgba(255,241,184,.95);
      display:inline-flex;
      align-items:center;
      justify-content:center;
      box-shadow: 0 18px 40px rgba(0,0,0,.14);
      isolation:isolate;
    }

    .badge.loading::before,
    .badge.loading::after{
      content:"";
      position:absolute;
      inset:-12px;
      border-radius: 999px;
      pointer-events:none;
      z-index:-1;
    }
    .badge.loading::before{
      border: 2px solid rgba(138,106,18,.18);
      border-top-color: rgba(212,175,55,.90);
      animation: spin 1.05s linear infinite;
      filter: drop-shadow(0 12px 18px rgba(0,0,0,.12));
    }
    .badge.loading::after{
      inset:-18px;
      border: 2px dashed rgba(22,193,114,.42);
      border-left-color: rgba(22,193,114,.98);
      animation: spinReverse 1.35s linear infinite;
      opacity:.95;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes spinReverse { to { transform: rotate(-360deg); } }

    .status-text{
      display:flex;
      flex-direction:column;
      gap:4px;
      line-height:1.65;
    }
    .status-text strong{ font-size: 14px; }
    .status-text span{ color: var(--muted); font-size: 13px; }

    .modal-overlay{
      position:fixed;
      inset:0;
      background: rgba(0,0,0,.45);
      backdrop-filter: blur(8px);
      display:none;
      align-items:center;
      justify-content:center;
      padding: 18px;
      z-index: 999;
    }
    .modal-overlay.show{ display:flex; }

    .modal{
      width: min(760px, 100%);
      border-radius: 18px;
      border:1px solid var(--stroke-strong);
      background: var(--card-strong);
      box-shadow: var(--shadow);
      overflow:hidden;
      transform: translateY(6px);
      animation: pop .18s var(--ease) forwards;
    }
    @keyframes pop { to { transform: translateY(0); } }

    .modal-header{
      padding: 14px 16px;
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:10px;
      border-bottom: 1px solid rgba(138,106,18,.14);
      background: linear-gradient(90deg, rgba(255,241,184,.55), rgba(212,175,55,.16));
    }
    .modal-title{
      margin:0;
      font-size: 13px;
      letter-spacing: .14em;
      text-transform: uppercase;
      font-weight: 950;
      color: rgba(27, 18, 2, .9);
    }
    .modal-close{
      border:0;
      background: transparent;
      color: rgba(27, 18, 2, .85);
      font-size: 22px;
      cursor:pointer;
      padding: 6px 10px;
      line-height: 1;
    }

    .modal-body{ padding: 16px; line-height: 1.9; font-size: 14px; color: var(--text); }
    .meta{
      display:flex;
      flex-wrap:wrap;
      gap:10px;
      margin-bottom: 12px;
    }
    .chip{
      border: 1px solid rgba(138,106,18,.18);
      background: rgba(255,255,255,.40);
      padding: 8px 10px;
      border-radius: 999px;
      font-weight: 900;
      font-size: 13px;
      color: rgba(27, 18, 2, .92);
    }
    .chip .v{ color: #8A6A12; font-weight: 950; }
    .chip .g{ color: #0A5C33; font-weight: 950; }

    .modal-actions{
      padding: 14px 16px;
      display:flex;
      gap:10px;
      border-top: 1px solid rgba(138,106,18,.14);
      justify-content:flex-end;
      flex-wrap: wrap;
    }

    .btn-secondary{
      flex: 1 1 170px;
      border:1px solid rgba(138,106,18,.20);
      background: rgba(255,255,255,.42);
      color: var(--text);
      border-radius: 14px;
      padding: 12px 14px;
      font-weight: 900;
      cursor:pointer;
      transition: filter .12s var(--ease);
    }
    .btn-secondary:hover{ filter: brightness(1.05); }

    .btn-primary{
      flex: 1 1 170px;
      border:0;
      background: linear-gradient(90deg, var(--gold-1), var(--gold-3), #C79C2A);
      color:#1B1202;
      border-radius: 14px;
      padding: 12px 14px;
      font-weight: 950;
      cursor:pointer;
      transition: filter .12s var(--ease);
    }
    .btn-primary:hover{ filter: brightness(1.05); }

    @media (max-width: 900px){
      header, main{ padding-left: 16px; padding-right:16px; }
      .amount-grid{ grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
  `;
  document.head.appendChild(style);

  // ========= [2] Build the whole page DOM from JS =========
  const header = document.createElement("header");
  header.innerHTML = `
    <div class="hero">
      <div class="brand">
        <h1>Binexia • Trading AI</h1>
        <p>Select an amount, activate the bot, and trading will run using AI-powered algorithms.</p>
      </div>

      <div class="robot-wrap" aria-label="Robot icon">
        <svg class="robot" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
          <path d="M30 6c0-1.1.9-2 2-2s2 .9 2 2v6h-4V6Z" fill="rgba(138,106,18,.95)"/>
          <rect x="14" y="14" width="36" height="34" rx="12" fill="rgba(255,255,255,.45)" stroke="rgba(138,106,18,.70)" stroke-width="2"/>
          <rect x="10" y="26" width="6" height="10" rx="3" fill="rgba(212,175,55,.75)"/>
          <rect x="48" y="26" width="6" height="10" rx="3" fill="rgba(212,175,55,.75)"/>
          <circle cx="26" cy="30" r="5" fill="rgba(138,106,18,.55)"/>
          <circle cx="38" cy="30" r="5" fill="rgba(138,106,18,.55)"/>
          <circle cx="26" cy="30" r="2" fill="rgba(0,0,0,.75)"/>
          <circle cx="38" cy="30" r="2" fill="rgba(0,0,0,.75)"/>
          <path d="M24 40c2.3 2.2 13.7 2.2 16 0" stroke="rgba(27,18,2,.65)" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M22 54h20" stroke="rgba(138,106,18,.45)" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </div>
    </div>
  `;

  const main = document.createElement("main");
  main.innerHTML = `
    <section class="panel" aria-label="Activation panel">
      <div class="section-title">Investment Amount</div>

      <div class="amount-grid" role="list" aria-label="Amount options">
        <button class="amount-btn" type="button" data-amount="200">$200</button>
        <button class="amount-btn" type="button" data-amount="300">$300</button>
        <button class="amount-btn" type="button" data-amount="400">$400</button>
        <button class="amount-btn" type="button" data-amount="500">$500</button>
        <button class="amount-btn" type="button" data-amount="600">$600</button>
      </div>

      <div class="info-bar">
        <span>Selected amount</span>
        <strong id="pickedAmount">—</strong>
      </div>

      <button id="activateBtn" class="btn" type="button" disabled>Activate</button>

      <div id="statusBox" class="status" aria-live="polite">
        <div id="statusBadge" class="badge loading">RUNNING</div>
        <div class="status-text">
          <strong id="statusTitle">Activation in progress…</strong>
          <span id="statusLine1">Trading is running using Trading AI</span>
          <span id="statusLine2">Daily rate: 6.70% • Amount: —</span>
        </div>
      </div>
    </section>
  `;

  const modalOverlay = document.createElement("div");
  modalOverlay.id = "modalOverlay";
  modalOverlay.className = "modal-overlay";
  modalOverlay.setAttribute("role", "dialog");
  modalOverlay.setAttribute("aria-modal", "true");
  modalOverlay.setAttribute("aria-labelledby", "modalTitle");
  modalOverlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h2 id="modalTitle" class="modal-title">Activation Notice</h2>
        <button id="modalCloseX" class="modal-close" type="button" aria-label="Close">×</button>
      </div>

      <div class="modal-body">
        <div class="meta" aria-label="Activation summary">
          <div class="chip">Daily rate: <span class="v">6.70%</span></div>
          <div class="chip">Selected amount: <span class="g" id="modalAmount">—</span></div>
          <div class="chip">Status after activation: <span class="v">RUNNING</span></div>
        </div>

        <p style="margin:0;">
          Hello, please note that any trading operations here are counted on the company and not on you.
          Therefore, this is the safe environment provided by Binexia for its users to trade using artificial intelligence algorithms.
          You will receive an agreed percentage as shown, and you can cancel your subscription to this robot at any time without any announced restrictions.
        </p>
      </div>

      <div class="modal-actions">
        <button id="modalCancel" class="btn-secondary" type="button">Cancel</button>
        <button id="modalConfirm" class="btn-primary" type="button">Confirm</button>
      </div>
    </div>
  `;

  document.body.appendChild(header);
  document.body.appendChild(main);
  document.body.appendChild(modalOverlay);

  // ========= [3] Same JS Logic (activation flow) =========
  const DAILY_PERCENT = "6.70%";

  const amountButtons = Array.from(document.querySelectorAll(".amount-btn"));
  const pickedAmountEl = document.getElementById("pickedAmount");
  const activateBtn = document.getElementById("activateBtn");

  const statusBox = document.getElementById("statusBox");
  const statusLine2 = document.getElementById("statusLine2");

  const overlay = document.getElementById("modalOverlay");
  const closeX = document.getElementById("modalCloseX");
  const cancelBtn = document.getElementById("modalCancel");
  const confirmBtn = document.getElementById("modalConfirm");
  const modalAmountEl = document.getElementById("modalAmount");

  let selectedAmount = null;

  const formatAmount = (n) => (n ? `$${n}` : "—");

  function setSelectedAmount(amount) {
    selectedAmount = amount;
    pickedAmountEl.textContent = formatAmount(amount);
    modalAmountEl.textContent = formatAmount(amount);

    amountButtons.forEach((b) =>
      b.classList.toggle("selected", b.dataset.amount === String(amount))
    );
    activateBtn.disabled = !selectedAmount;
  }

  amountButtons.forEach((btn) => {
    btn.addEventListener("click", () => setSelectedAmount(btn.dataset.amount));
  });

  function openModal() {
    modalAmountEl.textContent = formatAmount(selectedAmount);
    overlay.classList.add("show");
    setTimeout(() => confirmBtn.focus(), 0);
  }

  function closeModal() {
    overlay.classList.remove("show");
    activateBtn.focus();
  }

  function startRunning() {
    statusBox.classList.add("active");
    statusLine2.textContent = `Daily rate: ${DAILY_PERCENT} • Amount: ${formatAmount(
      selectedAmount
    )}`;

    activateBtn.textContent = "Activation Sent";
    activateBtn.disabled = true;

    // lock amount selection after activation
    amountButtons.forEach((b) => {
      b.disabled = true;
      b.style.opacity = "0.85";
      b.style.cursor = "not-allowed";
    });
  }

  activateBtn.addEventListener("click", () => {
    if (!selectedAmount) return;
    openModal();
  });

  closeX.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);

  confirmBtn.addEventListener("click", () => {
    startRunning();
    closeModal();
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("show")) closeModal();
  });
})();
