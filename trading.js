/* ============================================================
   BINEXIA TRADING AI — Full Website Builder (Pure JS)
   ============================================================ */

(function () {

  /* ─────────────── 1. INJECT CSS ─────────────── */
  const CSS = `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    ::-webkit-scrollbar{width:7px}
    ::-webkit-scrollbar-track{background:#1a1000}
    ::-webkit-scrollbar-thumb{background:linear-gradient(#DAA520,#B8860B);border-radius:99px}

    :root{
      --g1:#FFF8DC;--g2:#FFD700;--g3:#DAA520;--g4:#B8860B;--g5:#8B6914;
      --dark:#0a0700;
      --card-bg:rgba(255,230,50,0.08);
      --card-border:rgba(218,165,32,0.30);
      --text-light:rgba(255,240,180,0.92);
      --text-muted:rgba(255,220,100,0.65);
      --ease:cubic-bezier(.2,.8,.2,1);
      --radius:18px;
    }

    body{
      font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;
      background:#0a0700;color:#fff;overflow-x:hidden;
    }

    /* ── NAV ── */
    #bnx-nav{
      position:fixed;top:0;left:0;right:0;z-index:1000;
      padding:0 6vw;height:64px;
      display:flex;align-items:center;justify-content:space-between;
      background:rgba(10,7,0,0.82);
      border-bottom:1px solid rgba(218,165,32,0.20);
      backdrop-filter:blur(14px);
      transition:background .3s;
    }
    #bnx-nav.scrolled{background:rgba(10,7,0,0.97);border-bottom-color:rgba(218,165,32,0.35)}
    .nav-logo{
      font-size:18px;font-weight:900;letter-spacing:.04em;
      background:linear-gradient(90deg,#FFF8DC,#FFD700,#DAA520);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    }
    .nav-links{display:flex;gap:28px;list-style:none}
    .nav-links a{
      color:var(--text-muted);font-size:14px;font-weight:700;
      text-decoration:none;letter-spacing:.04em;
      transition:color .2s;
    }
    .nav-links a:hover{color:var(--g2)}
    .nav-cta{
      padding:9px 22px;border-radius:999px;border:0;
      background:linear-gradient(90deg,var(--g4),var(--g2),var(--g3));
      color:#120C02;font-weight:950;font-size:13px;cursor:pointer;
      box-shadow:0 4px 18px rgba(218,165,32,0.38);
      transition:filter .15s,transform .15s;
      text-shadow:0 1px 2px rgba(60,30,0,0.30);
    }
    .nav-cta:hover{filter:brightness(1.10);transform:translateY(-1px)}
    .nav-burger{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:6px}
    .nav-burger span{width:24px;height:2px;background:var(--g2);border-radius:2px;transition:.3s}
    .nav-mobile{
      display:none;flex-direction:column;gap:0;
      position:fixed;top:64px;left:0;right:0;z-index:999;
      background:rgba(10,7,0,0.97);border-bottom:1px solid rgba(218,165,32,0.20);
      padding:16px 6vw;
    }
    .nav-mobile.open{display:flex}
    .nav-mobile a{
      color:var(--text-muted);font-size:15px;font-weight:700;
      text-decoration:none;padding:12px 0;
      border-bottom:1px solid rgba(218,165,32,0.10);
      transition:color .2s;
    }
    .nav-mobile a:hover{color:var(--g2)}
    @media(max-width:720px){
      .nav-links,.nav-cta{display:none}
      .nav-burger{display:flex}
    }

    /* ── HERO ── */
    #bnx-hero{
      min-height:100vh;display:flex;align-items:center;justify-content:center;
      text-align:center;padding:100px 6vw 60px;
      background:
        radial-gradient(900px 500px at 20% 10%, rgba(255,215,0,0.14), transparent 60%),
        radial-gradient(800px 500px at 80% 5%,  rgba(218,165,32,0.12), transparent 60%),
        radial-gradient(600px 500px at 50% 90%, rgba(184,134,11,0.18), transparent 58%),
        #0a0700;
      position:relative;overflow:hidden;
    }
    .hero-orb{
      position:absolute;border-radius:999px;pointer-events:none;
      animation:floatOrb 8s ease-in-out infinite;
    }
    .hero-orb-1{
      width:380px;height:380px;top:-80px;left:-80px;
      background:radial-gradient(circle,rgba(255,215,0,0.12),transparent 70%);
    }
    .hero-orb-2{
      width:320px;height:320px;bottom:-60px;right:-60px;
      background:radial-gradient(circle,rgba(218,165,32,0.14),transparent 70%);
      animation-delay:-4s;
    }
    @keyframes floatOrb{
      0%,100%{transform:translateY(0) scale(1)}
      50%{transform:translateY(-30px) scale(1.06)}
    }
    .hero-badge{
      display:inline-flex;align-items:center;gap:8px;
      padding:8px 18px;border-radius:999px;margin-bottom:28px;
      border:1px solid rgba(218,165,32,0.35);
      background:rgba(255,215,0,0.08);
      font-size:12px;font-weight:900;letter-spacing:.14em;
      color:var(--g2);text-transform:uppercase;
    }
    .hero-dot{
      width:8px;height:8px;border-radius:999px;background:#2ECC71;
      box-shadow:0 0 0 3px rgba(46,204,113,0.22);
      animation:pulse 2s ease-in-out infinite;
    }
    @keyframes pulse{0%,100%{box-shadow:0 0 0 3px rgba(46,204,113,0.22)}50%{box-shadow:0 0 0 8px rgba(46,204,113,0.08)}}
    .hero-h1{
      font-size:clamp(34px,6vw,72px);font-weight:950;line-height:1.10;
      margin-bottom:22px;letter-spacing:-.02em;
      background:linear-gradient(135deg,#FFF8DC 0%,#FFD700 40%,#DAA520 70%,#B8860B 100%);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    }
    .hero-sub{
      font-size:clamp(15px,2.2vw,20px);color:var(--text-muted);
      max-width:600px;margin:0 auto 38px;line-height:1.70;
    }
    .hero-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
    .btn-gold{
      padding:14px 32px;border-radius:14px;border:0;
      background:linear-gradient(90deg,var(--g4),var(--g2),var(--g3),var(--g4));
      background-size:220% 100%;
      color:#120C02;font-weight:950;font-size:16px;cursor:pointer;
      box-shadow:0 8px 32px rgba(218,165,32,0.42);
      transition:transform .15s,filter .15s;
      animation:shineBtn 3s linear infinite;
      text-shadow:0 1px 2px rgba(60,30,0,0.30);
    }
    .btn-gold:hover{transform:translateY(-2px);filter:brightness(1.10)}
    @keyframes shineBtn{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
    .btn-outline{
      padding:14px 32px;border-radius:14px;
      border:2px solid rgba(218,165,32,0.45);
      background:transparent;color:var(--g2);
      font-weight:900;font-size:16px;cursor:pointer;
      transition:background .15s,transform .15s;
    }
    .btn-outline:hover{background:rgba(218,165,32,0.10);transform:translateY(-2px)}
    .hero-stats{
      display:flex;gap:clamp(16px,4vw,50px);justify-content:center;
      flex-wrap:wrap;margin-top:56px;padding-top:40px;
      border-top:1px solid rgba(218,165,32,0.15);
    }
    .h-stat{text-align:center}
    .h-stat-val{
      font-size:clamp(22px,3.5vw,38px);font-weight:950;
      background:linear-gradient(90deg,#FFD700,#DAA520);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    }
    .h-stat-lbl{font-size:12px;color:var(--text-muted);letter-spacing:.10em;text-transform:uppercase;margin-top:4px}

    /* ── SECTION COMMON ── */
    .bnx-section{padding:90px 6vw;position:relative}
    .bnx-section.dark-bg{background:#050400}
    .bnx-section.mid-bg{
      background:
        radial-gradient(700px 400px at 80% 50%, rgba(255,215,0,0.07), transparent 65%),
        radial-gradient(500px 350px at 15% 50%, rgba(218,165,32,0.06), transparent 65%),
        #080600;
    }
    .section-tag{
      display:inline-block;margin-bottom:14px;
      font-size:11px;font-weight:900;letter-spacing:.20em;text-transform:uppercase;
      color:var(--g3);
    }
    .section-h2{
      font-size:clamp(26px,4vw,46px);font-weight:950;line-height:1.15;
      margin-bottom:14px;
      background:linear-gradient(135deg,#FFF8DC,#FFD700,#DAA520);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    }
    .section-sub{
      font-size:15px;color:var(--text-muted);max-width:560px;line-height:1.75;margin-bottom:50px;
    }
    .center-text{text-align:center}
    .center-text .section-sub{margin-left:auto;margin-right:auto}

    /* ── FEATURES GRID ── */
    .features-grid{
      display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));
      gap:20px;
    }
    .feat-card{
      padding:28px 22px;border-radius:var(--radius);
      border:1px solid var(--card-border);
      background:var(--card-bg);
      backdrop-filter:blur(10px);
      transition:transform .22s var(--ease),border-color .22s,box-shadow .22s;
    }
    .feat-card:hover{
      transform:translateY(-4px);
      border-color:rgba(218,165,32,0.55);
      box-shadow:0 16px 48px rgba(180,120,0,0.22);
    }
    .feat-icon{
      width:52px;height:52px;border-radius:14px;margin-bottom:18px;
      display:grid;place-items:center;font-size:24px;
      background:linear-gradient(135deg,rgba(255,215,0,0.18),rgba(218,165,32,0.08));
      border:1px solid rgba(218,165,32,0.25);
    }
    .feat-title{font-size:16px;font-weight:900;color:var(--g1);margin-bottom:8px}
    .feat-desc{font-size:13px;color:var(--text-muted);line-height:1.70}

    /* ── HOW IT WORKS ── */
    .steps-grid{
      display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));
      gap:24px;counter-reset:step;
    }
    .step-card{
      padding:28px 22px;border-radius:var(--radius);
      border:1px solid var(--card-border);
      background:var(--card-bg);text-align:center;
      position:relative;overflow:hidden;
      transition:transform .22s var(--ease),box-shadow .22s;
    }
    .step-card::before{
      counter-increment:step;content:counter(step);
      position:absolute;top:-12px;left:50%;transform:translateX(-50%);
      font-size:96px;font-weight:950;line-height:1;
      color:rgba(218,165,32,0.06);pointer-events:none;
    }
    .step-card:hover{transform:translateY(-4px);box-shadow:0 18px 50px rgba(180,120,0,0.22)}
    .step-icon{font-size:32px;margin-bottom:14px}
    .step-title{font-size:15px;font-weight:900;color:var(--g1);margin-bottom:8px}
    .step-desc{font-size:13px;color:var(--text-muted);line-height:1.70}

    /* ── TICKER STRIP ── */
    #bnx-ticker{
      background:rgba(255,215,0,0.06);
      border-top:1px solid rgba(218,165,32,0.18);
      border-bottom:1px solid rgba(218,165,32,0.18);
      overflow:hidden;padding:12px 0;
    }
    .ticker-track{
      display:flex;gap:0;white-space:nowrap;
      animation:tickerScroll 22s linear infinite;
    }
    @keyframes tickerScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
    .ticker-item{
      display:inline-flex;align-items:center;gap:8px;
      padding:0 30px;font-size:13px;font-weight:700;
      color:var(--text-light);border-right:1px solid rgba(218,165,32,0.15);
    }
    .t-up{color:#2ECC71}.t-dn{color:#FF4757}

    /* ── ACTIVATION PANEL ── */
    #bnx-activate{
      background:
        radial-gradient(800px 500px at 50% 50%, rgba(255,215,0,0.09), transparent 65%),
        #060500;
    }
    .activate-wrap{
      max-width:820px;margin:0 auto;
      border:1.5px solid rgba(218,165,32,0.35);
      background:rgba(255,215,0,0.06);
      border-radius:24px;padding:32px;
      backdrop-filter:blur(14px);
      box-shadow:0 24px 70px rgba(0,0,0,0.55);
      position:relative;overflow:hidden;
    }
    .activate-wrap::before{
      content:"";position:absolute;top:0;left:-100%;
      width:55%;height:100%;
      background:linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent);
      animation:shimmer 5s ease-in-out infinite;pointer-events:none;
    }
    @keyframes shimmer{0%{left:-100%}45%{left:160%}100%{left:160%}}
    .section-title-sm{
      font-size:11px;letter-spacing:.18em;text-transform:uppercase;
      font-weight:900;color:rgba(255,215,0,0.75);margin-bottom:16px;
    }
    .amount-grid{
      display:grid;grid-template-columns:repeat(5,minmax(0,1fr));
      gap:10px;margin-bottom:14px;
    }
    .amount-btn{
      position:relative;
      border:1.5px solid rgba(218,165,32,0.28);
      background:rgba(255,215,0,0.07);
      color:var(--text-light);border-radius:14px;
      padding:13px 10px;font-weight:900;font-size:15px;
      cursor:pointer;
      transition:transform .14s,border-color .14s,background .14s,box-shadow .14s;
      user-select:none;outline:none;
    }
    .amount-btn:hover{
      transform:translateY(-2px);
      border-color:rgba(255,215,0,0.65);
      background:rgba(255,215,0,0.14);
      box-shadow:0 8px 24px rgba(180,120,0,0.28);
    }
    .amount-btn.selected{
      border-color:#2ECC71;
      background:rgba(46,204,113,0.12);
      box-shadow:0 0 0 3px rgba(46,204,113,0.20);
      color:#D7FFE9;
    }
    .amount-btn.selected::after{
      content:"";position:absolute;right:10px;top:10px;
      width:9px;height:9px;border-radius:999px;
      background:#2ECC71;box-shadow:0 0 0 4px rgba(46,204,113,0.18);
    }
    .info-bar{
      display:flex;align-items:center;justify-content:space-between;
      gap:10px;margin:6px 0 14px;padding:12px 14px;
      border-radius:14px;border:1px solid rgba(218,165,32,0.22);
      background:rgba(0,0,0,0.22);color:var(--text-muted);font-size:13px;
    }
    .info-bar strong{color:var(--g1);font-weight:950;font-size:15px}
    .act-btn{
      width:100%;border:0;border-radius:14px;padding:15px 16px;
      font-size:17px;font-weight:950;color:#120C02;
      background:linear-gradient(90deg,var(--g4),var(--g2),var(--g3),var(--g4));
      background-size:220% 100%;cursor:pointer;
      transition:transform .12s,filter .12s,opacity .12s;
      box-shadow:0 8px 32px rgba(218,165,32,0.38);
      letter-spacing:.06em;
      text-shadow:0 1px 3px rgba(80,40,0,0.40);
      animation:shineBtn 3s linear infinite;
    }
    .act-btn:hover{filter:brightness(1.10);transform:translateY(-1px)}
    .act-btn:active{transform:translateY(1px) scale(.99)}
    .act-btn[disabled]{opacity:.50;cursor:not-allowed;filter:grayscale(.3);animation:none}
    .status-box{
      margin-top:16px;padding:16px;border-radius:14px;
      border:1.5px dashed rgba(218,165,32,0.28);
      background:rgba(0,0,0,0.18);display:none;gap:14px;align-items:center;
    }
    .status-box.active{display:flex}
    .run-badge{
      position:relative;flex:0 0 auto;min-width:115px;
      padding:11px 14px;border-radius:999px;font-weight:950;
      font-size:12px;letter-spacing:.16em;text-transform:uppercase;
      color:#120C02;
      background:linear-gradient(90deg,var(--g4),var(--g2),var(--g3));
      display:inline-flex;align-items:center;justify-content:center;
      box-shadow:0 8px 28px rgba(180,120,0,0.50);
      isolation:isolate;
      text-shadow:0 1px 2px rgba(60,30,0,0.40);
    }
    .run-badge::before,.run-badge::after{
      content:"";position:absolute;inset:-12px;border-radius:999px;
      pointer-events:none;z-index:-1;
    }
    .run-badge::before{
      border:2.5px solid rgba(255,200,0,0.18);
      border-top-color:rgba(255,200,0,0.95);
      animation:spin 1.05s linear infinite;
    }
    .run-badge::after{
      inset:-20px;border:2px dashed rgba(255,165,0,0.40);
      border-left-color:rgba(255,165,0,1);
      animation:spinRev 1.35s linear infinite;
    }
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes spinRev{to{transform:rotate(-360deg)}}
    .status-text strong{font-size:14px;color:var(--g1)}
    .status-text span{color:var(--text-muted);font-size:13px;display:block;margin-top:3px}

    /* ── STATS BANNER ── */
    .stats-banner{
      display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));
      gap:16px;
    }
    .stat-card{
      padding:24px 20px;border-radius:var(--radius);text-align:center;
      border:1px solid var(--card-border);background:var(--card-bg);
      transition:transform .22s,box-shadow .22s;
    }
    .stat-card:hover{transform:translateY(-3px);box-shadow:0 14px 42px rgba(180,120,0,0.22)}
    .stat-val{
      font-size:clamp(24px,4vw,40px);font-weight:950;
      background:linear-gradient(90deg,#FFD700,#DAA520);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
      margin-bottom:6px;
    }
    .stat-lbl{font-size:12px;color:var(--text-muted);letter-spacing:.10em;text-transform:uppercase}

    /* ── TESTIMONIALS ── */
    .testi-grid{
      display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));
      gap:20px;
    }
    .testi-card{
      padding:26px 22px;border-radius:var(--radius);
      border:1px solid var(--card-border);background:var(--card-bg);
      transition:transform .22s,box-shadow .22s;
    }
    .testi-card:hover{transform:translateY(-4px);box-shadow:0 18px 50px rgba(180,120,0,0.22)}
    .stars{color:#FFD700;font-size:15px;margin-bottom:14px;letter-spacing:2px}
    .testi-text{font-size:14px;color:var(--text-muted);line-height:1.80;margin-bottom:18px}
    .testi-user{display:flex;align-items:center;gap:12px}
    .testi-avatar{
      width:42px;height:42px;border-radius:999px;
      background:linear-gradient(135deg,var(--g3),var(--g4));
      display:grid;place-items:center;
      font-size:16px;font-weight:950;color:#120C02;flex:0 0 auto;
    }
    .testi-name{font-size:14px;font-weight:900;color:var(--g1)}
    .testi-role{font-size:12px;color:var(--text-muted);margin-top:2px}

    /* ── FAQ ── */
    .faq-list{max-width:700px;margin:0 auto;display:flex;flex-direction:column;gap:12px}
    .faq-item{
      border:1px solid var(--card-border);border-radius:var(--radius);
      background:var(--card-bg);overflow:hidden;
    }
    .faq-q{
      width:100%;background:none;border:0;
      padding:18px 22px;text-align:left;cursor:pointer;
      display:flex;align-items:center;justify-content:space-between;gap:12px;
      font-size:15px;font-weight:900;color:var(--g1);
      transition:background .15s;
    }
    .faq-q:hover{background:rgba(255,215,0,0.04)}
    .faq-arr{
      width:28px;height:28px;border-radius:8px;flex:0 0 auto;
      border:1px solid rgba(218,165,32,0.30);background:rgba(218,165,32,0.08);
      display:grid;place-items:center;
      color:var(--g2);font-size:16px;font-weight:900;
      transition:transform .25s,background .15s;
    }
    .faq-item.open .faq-arr{transform:rotate(45deg);background:rgba(218,165,32,0.18)}
    .faq-a{
      max-height:0;overflow:hidden;
      transition:max-height .35s var(--ease),padding .25s;
      font-size:14px;color:var(--text-muted);line-height:1.80;
    }
    .faq-item.open .faq-a{max-height:300px;padding:0 22px 18px}

    /* ── CTA BANNER ── */
    #bnx-cta{
      padding:80px 6vw;text-align:center;position:relative;overflow:hidden;
      background:
        radial-gradient(900px 500px at 50% 50%, rgba(255,215,0,0.11), transparent 62%),
        #050400;
    }
    #bnx-cta::before{
      content:"";position:absolute;
      inset:0;background:
        radial-gradient(600px 300px at 20% 50%, rgba(218,165,32,0.08), transparent 65%),
        radial-gradient(500px 300px at 80% 50%, rgba(184,134,11,0.08), transparent 65%);
      pointer-events:none;
    }
    .cta-inner{position:relative;z-index:1}
    .cta-h2{
      font-size:clamp(28px,5vw,56px);font-weight:950;line-height:1.10;
      margin-bottom:18px;
      background:linear-gradient(135deg,#FFF8DC,#FFD700,#DAA520);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    }
    .cta-sub{font-size:16px;color:var(--text-muted);max-width:500px;margin:0 auto 36px;line-height:1.70}

    /* ── FOOTER ── */
    footer{
      padding:50px 6vw 28px;
      border-top:1px solid rgba(218,165,32,0.15);
      background:#030200;
    }
    .footer-grid{
      display:grid;grid-template-columns:2fr 1fr 1fr 1fr;
      gap:40px;margin-bottom:44px;
    }
    .footer-brand-logo{
      font-size:20px;font-weight:950;margin-bottom:14px;
      background:linear-gradient(90deg,#FFD700,#DAA520);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    }
    .footer-brand-desc{font-size:13px;color:var(--text-muted);line-height:1.80;max-width:260px}
    .footer-col-title{
      font-size:11px;font-weight:900;letter-spacing:.16em;
      text-transform:uppercase;color:var(--g3);margin-bottom:16px;
    }
    .footer-links{list-style:none;display:flex;flex-direction:column;gap:10px}
    .footer-links a{
      font-size:13px;color:var(--text-muted);text-decoration:none;
      transition:color .15s;
    }
    .footer-links a:hover{color:var(--g2)}
    .footer-bottom{
      display:flex;align-items:center;justify-content:space-between;
      flex-wrap:wrap;gap:12px;
      padding-top:24px;border-top:1px solid rgba(218,165,32,0.10);
      font-size:12px;color:rgba(218,165,32,0.40);
    }
    .footer-socials{display:flex;gap:12px}
    .social-btn{
      width:36px;height:36px;border-radius:10px;
      border:1px solid rgba(218,165,32,0.22);
      background:rgba(218,165,32,0.06);
      display:grid;place-items:center;cursor:pointer;
      font-size:15px;transition:background .15s,border-color .15s;
    }
    .social-btn:hover{background:rgba(218,165,32,0.14);border-color:rgba(218,165,32,0.45)}

    /* ── MODAL ── */
    #bnx-modal{
      position:fixed;inset:0;z-index:2000;
      background:rgba(0,0,0,0.72);backdrop-filter:blur(10px);
      display:none;align-items:center;justify-content:center;padding:18px;
    }
    #bnx-modal.show{display:flex}
    .modal-box{
      width:min(720px,100%);border-radius:20px;
      border:1.5px solid rgba(218,165,32,0.40);
      background:linear-gradient(160deg,#0e0a00,#0a0700);
      box-shadow:0 40px 100px rgba(0,0,0,0.70);
      overflow:hidden;
      transform:translateY(8px) scale(.98);
      animation:popIn .22s var(--ease) forwards;
    }
    @keyframes popIn{to{transform:translateY(0) scale(1)}}
    .modal-head{
      padding:16px 20px;
      display:flex;align-items:center;justify-content:space-between;
      border-bottom:1px solid rgba(218,165,32,0.18);
      background:rgba(255,215,0,0.05);
    }
    .modal-title{
      font-size:13px;letter-spacing:.16em;text-transform:uppercase;
      font-weight:950;color:var(--g2);
    }
    .modal-x{
      border:0;background:rgba(218,165,32,0.10);color:var(--g2);
      font-size:20px;cursor:pointer;padding:5px 10px;
      border-radius:8px;line-height:1;transition:background .15s;
    }
    .modal-x:hover{background:rgba(218,165,32,0.20)}
    .modal-body{padding:20px;line-height:1.90;font-size:14px;color:var(--text-light)}
    .modal-chips{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:16px}
    .chip{
      border:1px solid rgba(218,165,32,0.25);background:rgba(255,215,0,0.07);
      padding:8px 13px;border-radius:999px;
      font-weight:900;font-size:13px;color:var(--text-light);
    }
    .chip .gv{color:var(--g2);font-weight:950}
    .chip .gg{color:#2ECC71;font-weight:950}
    .modal-foot{
      padding:14px 20px;display:flex;gap:10px;flex-wrap:wrap;
      border-top:1px solid rgba(218,165,32,0.14);justify-content:flex-end;
    }
    .mbtn-sec{
      flex:1 1 160px;border:1.5px solid rgba(218,165,32,0.28);
      background:transparent;color:var(--text-light);
      border-radius:14px;padding:12px 16px;font-weight:900;cursor:pointer;
      transition:background .15s;
    }
    .mbtn-sec:hover{background:rgba(218,165,32,0.08)}
    .mbtn-pri{
      flex:1 1 160px;border:0;
      background:linear-gradient(90deg,var(--g4),var(--g2),var(--g3));
      color:#120C02;border-radius:14px;padding:12px 16px;
      font-weight:950;cursor:pointer;
      box-shadow:0 6px 22px rgba(218,165,32,0.38);
      transition:filter .15s,transform .15s;
      text-shadow:0 1px 2px rgba(60,30,0,0.35);
    }
    .mbtn-pri:hover{filter:brightness(1.10);transform:translateY(-1px)}

    /* ── NOTIFICATION TOAST ── */
    #bnx-toast{
      position:fixed;bottom:28px;right:28px;z-index:3000;
      padding:14px 20px;border-radius:14px;
      border:1px solid rgba(218,165,32,0.45);
      background:linear-gradient(135deg,#1a1200,#0e0a00);
      box-shadow:0 12px 40px rgba(0,0,0,0.55);
      display:none;align-items:center;gap:12px;
      font-size:14px;font-weight:700;color:var(--g1);
      transform:translateY(10px);
      animation:toastIn .25s var(--ease) forwards;
      max-width:320px;
    }
    #bnx-toast.show{display:flex}
    @keyframes toastIn{to{transform:translateY(0)}}
    .toast-icon{font-size:20px}

    /* ── BACK TO TOP ── */
    #back-top{
      position:fixed;bottom:28px;left:28px;z-index:900;
      width:44px;height:44px;border-radius:12px;border:0;
      background:linear-gradient(135deg,var(--g4),var(--g2));
      color:#120C02;font-size:18px;cursor:pointer;
      box-shadow:0 8px 24px rgba(218,165,32,0.38);
      display:none;place-items:center;
      transition:transform .15s,filter .15s;
    }
    #back-top.show{display:grid}
    #back-top:hover{transform:translateY(-2px);filter:brightness(1.10)}

    /* ── RESPONSIVE ── */
    @media(max-width:900px){
      .footer-grid{grid-template-columns:1fr 1fr}
    }
    @media(max-width:600px){
      .amount-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
      .footer-grid{grid-template-columns:1fr}
      .hero-btns{flex-direction:column;align-items:center}
    }
  `;

  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);
  document.title = 'Binexia • Trading AI';

  /* ─────────────── 2. DATA ─────────────── */
  const FEATURES = [
    { icon:'🤖', title:'AI-Powered Engine',       desc:'Advanced machine learning algorithms analyze 200+ market signals in real time to execute precision trades.' },
    { icon:'⚡', title:'Lightning Execution',      desc:'Sub-millisecond order execution ensures you never miss a profitable opportunity in volatile markets.' },
    { icon:'🛡️', title:'Risk Management',          desc:'Multi-layer stop-loss and position sizing protect your capital automatically around the clock.' },
    { icon:'📊', title:'Live Analytics',           desc:'Real-time dashboard with performance metrics, P&L charts, and trade history at your fingertips.' },
    { icon:'🌍', title:'Global Markets',           desc:'Trade Forex, Crypto, Indices, and Commodities — all from a single unified platform.' },
    { icon:'🔒', title:'Bank-Grade Security',      desc:'256-bit AES encryption, 2FA, and cold-storage protocols keep your funds and data safe.' },
  ];

  const STEPS = [
    { icon:'💰', title:'Choose Your Amount', desc:'Pick an investment amount that suits your goals — starting from just $200.' },
    { icon:'🚀', title:'Activate the Bot',   desc:'Click Activate and confirm. Our AI engine starts scanning and trading immediately.' },
    { icon:'📈', title:'Watch It Grow',      desc:'Sit back while the bot works 24/7 generating up to 6.70% daily returns for you.' },
    { icon:'💸', title:'Withdraw Profits',   desc:'Request a withdrawal anytime. Funds are processed and delivered within 24 hours.' },
  ];

  const TESTI = [
    { name:'James K.',   role:'Day Trader, London',       stars:5, text:'"I was skeptical at first, but after 3 weeks the numbers speak for themselves. Best automated trading system I\'ve ever used."' },
    { name:'Sara M.',    role:'Crypto Investor, Dubai',   stars:5, text:'"The 6.70% daily rate sounds crazy but it\'s real. Withdrew my profits twice already with zero issues."' },
    { name:'Luca R.',    role:'Portfolio Manager, Milan', stars:5, text:'"Binexia\'s risk management is outstanding. I\'ve tested 12 bots — none come close to this level of consistency."' },
    { name:'Aisha T.',   role:'Freelancer, Nairobi',      stars:5, text:'"Super easy to set up. I activated the bot in 2 minutes and it has been running flawlessly for 6 weeks."' },
    { name:'David L.',   role:'Engineer, New York',       stars:5, text:'"The transparency and live analytics are what sold me. I can see every single trade in real time."' },
    { name:'Fatima A.',  role:'Entrepreneur, Riyadh',     stars:5, text:'"Customer support is responsive and the platform is intuitive. My portfolio grew 40% in the first month."' },
  ];

  const FAQS = [
    { q:'What is Binexia Trading AI?',         a:'Binexia is an AI-powered automated trading platform that uses machine learning algorithms to analyze markets and execute trades on your behalf, generating consistent daily returns.' },
    { q:'How does the 6.70% daily rate work?', a:'Our AI engine trades across multiple asset classes simultaneously. The 6.70% rate represents the average daily return generated by the algorithm based on historical and live performance data.' },
    { q:'Is my investment safe?',              a:'All trading operations are covered by the company, not by you personally. We employ multi-layer risk management, encrypted fund storage, and strict stop-loss protocols to protect every account.' },
    { q:'How do I withdraw my profits?',       a:'Simply navigate to your wallet section and submit a withdrawal request. Funds are typically processed within 24 hours directly to your preferred payment method.' },
    { q:'Can I cancel my subscription?',       a:'Yes, you can cancel your subscription to the bot at any time with no restrictions or penalties. Your funds remain accessible at all times.' },
  ];

  const TICKER_DATA = [
    { sym:'BTC/USD', price:'$67,420', chg:'+2.34%', up:true },
    { sym:'ETH/USD', price:'$3,512',  chg:'+1.87%', up:true },
    { sym:'EUR/USD', price:'1.0842',  chg:'-0.12%', up:false},
    { sym:'GBP/USD', price:'1.2698',  chg:'+0.44%', up:true },
    { sym:'XAU/USD', price:'$2,318',  chg:'+0.91%', up:true },
    { sym:'SPX500',  price:'5,204',   chg:'+0.65%', up:true },
    { sym:'NASDAQ',  price:'16,340',  chg:'+0.78%', up:true },
    { sym:'SOL/USD', price:'$175.30', chg:'+3.21%', up:true },
  ];

  /* ─────────────── 3. HELPERS ─────────────── */
  const el  = (tag, cls, html) => { const e=document.createElement(tag); if(cls) e.className=cls; if(html!==undefined) e.innerHTML=html; return e; };
  const $   = id => document.getElementById(id);

  /* ─────────────── 4. BUILD NAV ─────────────── */
  function buildNav() {
    const nav = el('nav'); nav.id = 'bnx-nav';
    const logo = el('div','nav-logo','Binexia ✦ AI');
    const ul = el('ul','nav-links');
    ['#bnx-features','#bnx-how','#bnx-activate','#bnx-faq'].forEach((href,i) => {
      const labels = ['Features','How It Works','Activate','FAQ'];
      const li = el('li'); const a = el('a'); a.href=href; a.textContent=labels[i]; li.appendChild(a); ul.appendChild(li);
    });
    const cta = el('button','nav-cta','Start Trading');
    cta.onclick = () => document.querySelector('#bnx-activate').scrollIntoView({behavior:'smooth'});
    const burger = el('div','nav-burger');
    burger.innerHTML='<span></span><span></span><span></span>';
    nav.append(logo, ul, cta, burger);
    document.body.appendChild(nav);

    // Mobile menu
    const mob = el('div','nav-mobile'); mob.id='bnx-mob';
    ['#bnx-features','#bnx-how','#bnx-activate','#bnx-faq'].forEach((href,i) => {
      const labels=['Features','How It Works','Activate','FAQ'];
      const a=el('a'); a.href=href; a.textContent=labels[i];
      a.onclick=()=>mob.classList.remove('open');
      mob.appendChild(a);
    });
    document.body.appendChild(mob);
    burger.onclick=()=>mob.classList.toggle('open');

    window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>40));
  }

  /* ─────────────── 5. BUILD HERO ─────────────── */
  function buildHero() {
    const sec = el('section'); sec.id='bnx-hero';
    sec.innerHTML=`
      <div class="hero-orb hero-orb-1"></div>
      <div class="hero-orb hero-orb-2"></div>
      <div style="position:relative;z-index:1;max-width:900px;margin:0 auto">
        <div class="hero-badge"><span class="hero-dot"></span> Live AI Trading System</div>
        <h1 class="hero-h1">Trade Smarter.<br>Earn Daily.</h1>
        <p class="hero-sub">Binexia's AI engine works 24/7 across global markets — analyzing signals, executing trades, and growing your portfolio automatically.</p>
        <div class="hero-btns">
          <button class="btn-gold" onclick="document.querySelector('#bnx-activate').scrollIntoView({behavior:'smooth'})">🚀 Activate Bot Now</button>
          <button class="btn-outline" onclick="document.querySelector('#bnx-how').scrollIntoView({behavior:'smooth'})">How It Works →</button>
        </div>
        <div class="hero-stats">
          <div class="h-stat"><div class="h-stat-val" data-count="6.70" data-dec="2" data-sfx="%">0%</div><div class="h-stat-lbl">Daily Return</div></div>
          <div class="h-stat"><div class="h-stat-val" data-count="48000" data-dec="0" data-pfx="$" data-sfx="+">$0</div><div class="h-stat-lbl">Users Active</div></div>
          <div class="h-stat"><div class="h-stat-val" data-count="99.8" data-dec="1" data-sfx="%">0%</div><div class="h-stat-lbl">Uptime</div></div>
          <div class="h-stat"><div class="h-stat-val" data-count="2.4" data-dec="1" data-sfx="B+">$0</div><div class="h-stat-lbl">Volume Traded</div></div>
        </div>
      </div>`;
    document.body.appendChild(sec);
  }

  /* ─────────────── 6. TICKER ─────────────── */
  function buildTicker() {
    const wrap = el('div'); wrap.id='bnx-ticker';
    const track = el('div','ticker-track');
    const items = [...TICKER_DATA,...TICKER_DATA];
    items.forEach(d => {
      const s = el('div','ticker-item');
      s.innerHTML=`<strong>${d.sym}</strong> <span>${d.price}</span> <span class="${d.up?'t-up':'t-dn'}">${d.chg}</span>`;
      track.appendChild(s);
    });
    wrap.appendChild(track);
    document.body.appendChild(wrap);
  }

  /* ─────────────── 7. FEATURES ─────────────── */
  function buildFeatures() {
    const sec = el('section','bnx-section mid-bg'); sec.id='bnx-features';
    const hdr = el('div','center-text');
    hdr.innerHTML=`<div class="section-tag">⚙️ What We Offer</div><h2 class="section-h2">Everything You Need to Win</h2><p class="section-sub">Powerful tools and cutting-edge technology designed to maximize your returns while minimizing risk.</p>`;
    const grid = el('div','features-grid');
    FEATURES.forEach(f => {
      const c = el('div','feat-card');
      c.innerHTML=`<div class="feat-icon">${f.icon}</div><div class="feat-title">${f.title}</div><div class="feat-desc">${f.desc}</div>`;
      grid.appendChild(c);
    });
    sec.append(hdr, grid);
    document.body.appendChild(sec);
  }

  /* ─────────────── 8. STATS BANNER ─────────────── */
  function buildStats() {
    const sec = el('section','bnx-section dark-bg');
    const banner = el('div','stats-banner');
    [
      { val:'$2.4B+',  lbl:'Total Volume Traded' },
      { val:'48,000+', lbl:'Active Users' },
      { val:'6.70%',   lbl:'Avg Daily Return' },
      { val:'99.8%',   lbl:'Platform Uptime' },
      { val:'140+',    lbl:'Countries Supported' },
      { val:'24/7',    lbl:'AI Always Running' },
    ].forEach(s => {
      const c = el('div','stat-card');
      c.innerHTML=`<div class="stat-val">${s.val}</div><div class="stat-lbl">${s.lbl}</div>`;
      banner.appendChild(c);
    });
    sec.appendChild(banner);
    document.body.appendChild(sec);
  }

  /* ─────────────── 9. HOW IT WORKS ─────────────── */
  function buildHow() {
    const sec = el('section','bnx-section mid-bg'); sec.id='bnx-how';
    const hdr = el('div','center-text');
    hdr.innerHTML=`<div class="section-tag">📌 Process</div><h2 class="section-h2">Up & Running in 4 Steps</h2><p class="section-sub">Getting started with Binexia is fast, simple, and completely transparent.</p>`;
    const grid = el('div','steps-grid');
    STEPS.forEach(s => {
      const c = el('div','step-card');
      c.innerHTML=`<div class="step-icon">${s.icon}</div><div class="step-title">${s.title}</div><div class="step-desc">${s.desc}</div>`;
      grid.appendChild(c);
    });
    sec.append(hdr, grid);
    document.body.appendChild(sec);
  }

  /* ─────────────── 10. ACTIVATION PANEL ─────────────── */
  function buildActivate() {
    const sec = el('section','bnx-section'); sec.id='bnx-activate';
    sec.style.background='radial-gradient(800px 500px at 50% 50%,rgba(255,215,0,0.09),transparent 65%),#060500';
    const hdr = el('div','center-text');
    hdr.style.marginBottom='36px';
    hdr.innerHTML=`<div class="section-tag">💎 Activate</div><h2 class="section-h2">Start Your AI Journey</h2><p class="section-sub">Select your investment amount and launch the bot — it handles everything from there.</p>`;

    const wrap = el('div','activate-wrap');
    wrap.innerHTML=`
      <div class="section-title-sm">Investment Amount</div>
      <div class="amount-grid" id="amountGrid"></div>
      <div class="info-bar">
        <span>Selected amount</span>
        <strong id="pickedAmt">—</strong>
      </div>
      <button class="act-btn" id="actBtn" disabled>⚡ Activate Bot</button>
      <div class="status-box" id="statusBox">
        <div class="run-badge">RUNNING</div>
        <div class="status-text">
          <strong>Trading is Live ✓</strong>
          <span id="statusLine">Daily rate: 6.70% • Amount: —</span>
        </div>
      </div>`;

    sec.append(hdr, wrap);
    document.body.appendChild(sec);

    // Amount buttons
    const amounts = [200,300,400,500,600];
    const grid = $('amountGrid');
    let selected = null;

    amounts.forEach(a => {
      const btn = el('button','amount-btn',`$${a}`);
      btn.dataset.amount = a;
      btn.onclick = () => {
        selected = a;
        $('pickedAmt').textContent = `$${a}`;
        grid.querySelectorAll('.amount-btn').forEach(b=>b.classList.remove('selected'));
        btn.classList.add('selected');
        $('actBtn').disabled = false;
      };
      grid.appendChild(btn);
    });

    $('actBtn').onclick = () => {
      if(!selected) return;
      openModal(selected);
    };
  }

  /* ─────────────── 11. TESTIMONIALS ─────────────── */
  function buildTestimonials() {
    const sec = el('section','bnx-section mid-bg');
    const hdr = el('div','center-text');
    hdr.innerHTML=`<div class="section-tag">💬 Reviews</div><h2 class="section-h2">Trusted by Thousands</h2><p class="section-sub">Real results from real users around the world.</p>`;
    const grid = el('div','testi-grid');
    TESTI.forEach(t => {
      const c = el('div','testi-card');
      c.innerHTML=`
        <div class="stars">${'★'.repeat(t.stars)}</div>
        <div class="testi-text">${t.text}</div>
        <div class="testi-user">
          <div class="testi-avatar">${t.name[0]}</div>
          <div><div class="testi-name">${t.name}</div><div class="testi-role">${t.role}</div></div>
        </div>`;
      grid.appendChild(c);
    });
    sec.append(hdr, grid);
    document.body.appendChild(sec);
  }

  /* ─────────────── 12. FAQ ─────────────── */
  function buildFAQ() {
    const sec = el('section','bnx-section dark-bg'); sec.id='bnx-faq';
    const hdr = el('div','center-text'); hdr.style.marginBottom='40px';
    hdr.innerHTML=`<div class="section-tag">❓ FAQ</div><h2 class="section-h2">Common Questions</h2>`;
    const list = el('div','faq-list');
    FAQS.forEach(f => {
      const item = el('div','faq-item');
      const q = el('button','faq-q'); q.innerHTML=`${f.q}<span class="faq-arr">+</span>`;
      const a = el('div','faq-a'); a.textContent = f.a;
      item.append(q,a);
      q.onclick=()=>{ item.classList.toggle('open'); };
      list.appendChild(item);
    });
    sec.append(hdr, list);
    document.body.appendChild(sec);
  }

  /* ─────────────── 13. CTA BANNER ─────────────── */
  function buildCTA() {
    const sec = el('section'); sec.id='bnx-cta';
    sec.innerHTML=`
      <div class="cta-inner">
        <h2 class="cta-h2">Ready to Grow<br>Your Wealth?</h2>
        <p class="cta-sub">Join 48,000+ traders using Binexia AI to earn consistent daily returns. Activation takes under 60 seconds.</p>
        <button class="btn-gold" style="font-size:17px;padding:16px 40px" onclick="document.querySelector('#bnx-activate').scrollIntoView({behavior:'smooth'})">🚀 Get Started Now</button>
      </div>`;
    document.body.appendChild(sec);
  }

  /* ─────────────── 14. FOOTER ─────────────── */
  function buildFooter() {
    const ft = el('footer');
    ft.innerHTML=`
      <div class="footer-grid">
        <div>
          <div class="footer-brand-logo">Binexia ✦ AI</div>
          <p class="footer-brand-desc">Next-generation AI trading platform delivering consistent daily returns for users worldwide.</p>
        </div>
        <div>
          <div class="footer-col-title">Platform</div>
          <ul class="footer-links">
            <li><a href="#">Dashboard</a></li>
            <li><a href="#">Live Trades</a></li>
            <li><a href="#">Analytics</a></li>
            <li><a href="#">Wallet</a></li>
          </ul>
        </div>
        <div>
          <div class="footer-col-title">Company</div>
          <ul class="footer-links">
            <li><a href="#">About Us</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
        <div>
          <div class="footer-col-title">Legal</div>
          <ul class="footer-links">
            <li><a href="#">Terms of Use</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Risk Disclosure</a></li>
            <li><a href="#">Compliance</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2025 Binexia Trading AI. All rights reserved.</span>
        <div class="footer-socials">
          <div class="social-btn">𝕏</div>
          <div class="social-btn">in</div>
          <div class="social-btn">📱</div>
          <div class="social-btn">✉</div>
        </div>
      </div>`;
    document.body.appendChild(ft);
  }

  /* ─────────────── 15. MODAL ─────────────── */
  function buildModal() {
    const ov = el('div'); ov.id='bnx-modal';
    ov.innerHTML=`
      <div class="modal-box">
        <div class="modal-head">
          <span class="modal-title">⚡ Activation Confirmation</span>
          <button class="modal-x" id="mClose">✕</button>
        </div>
        <div class="modal-body">
          <div class="modal-chips">
            <div class="chip">Daily Rate: <span class="gv">6.70%</span></div>
            <div class="chip">Amount: <span class="gg" id="mAmt">—</span></div>
            <div class="chip">Status: <span class="gv">RUNNING</span></div>
          </div>
          <p>Hello, please note that all trading operations are executed by the company on your behalf — not directly by you. Binexia provides a safe, AI-driven environment for its users. You will receive the agreed daily percentage and may cancel your subscription at any time without any restrictions.</p>
        </div>
        <div class="modal-foot">
          <button class="mbtn-sec" id="mCancel">Cancel</button>
          <button class="mbtn-pri" id="mConfirm">✓ Confirm & Activate</button>
        </div>
      </div>`;
    document.body.appendChild(ov);

    $('mClose').onclick  = closeModal;
    $('mCancel').onclick = closeModal;
    $('mConfirm').onclick = confirmActivate;
    ov.onclick = e => { if(e.target===ov) closeModal(); };
    document.addEventListener('keydown', e => { if(e.key==='Escape') closeModal(); });
  }

  let _pendingAmt = null;
  function openModal(amount) {
    _pendingAmt = amount;
    $('mAmt').textContent = `$${amount}`;
    $('bnx-modal').classList.add('show');
    setTimeout(()=>$('mConfirm').focus(),0);
  }
  function closeModal() { $('bnx-modal').classList.remove('show'); }
  function confirmActivate() {
    closeModal();
    const sb = $('statusBox');
    sb.classList.add('active');
    $('statusLine').textContent = `Daily rate: 6.70% • Amount: $${_pendingAmt}`;
    const ab = $('actBtn');
    ab.textContent = '✓ Bot Activated';
    ab.disabled = true;
    document.querySelectorAll('.amount-btn').forEach(b=>{
      b.disabled=true; b.style.opacity='.60'; b.style.cursor='not-allowed';
    });
    showToast('🚀 Bot activated! Your AI is now trading live.');
  }

  /* ─────────────── 16. TOAST ─────────────── */
  function buildToast() {
    const t = el('div'); t.id='bnx-toast';
    t.innerHTML=`<span class="toast-icon">✦</span><span id="toastMsg">—</span>`;
    document.body.appendChild(t);
  }
  function showToast(msg, dur=4500) {
    const t = $('bnx-toast');
    $('toastMsg').textContent = msg;
    t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'), dur);
  }

  /* ─────────────── 17. BACK TO TOP ─────────────── */
  function buildBackTop() {
    const btn = el('button'); btn.id='back-top'; btn.innerHTML='↑'; btn.title='Back to top';
    btn.onclick = () => window.scrollTo({top:0,behavior:'smooth'});
    document.body.appendChild(btn);
    window.addEventListener('scroll',()=>btn.classList.toggle('show',scrollY>400));
  }

  /* ─────────────── 18. COUNT-UP ANIMATION ─────────────── */
  function initCountUp() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if(!en.isIntersecting) return;
        const el = en.target;
        const end  = parseFloat(el.dataset.count);
        const dec  = parseInt(el.dataset.dec||'0');
        const pfx  = el.dataset.pfx||'';
        const sfx  = el.dataset.sfx||'';
        const dur  = 1800;
        const step = 16;
        let cur = 0;
        const timer = setInterval(()=>{
          cur += end/(dur/step);
          if(cur>=end){ cur=end; clearInterval(timer); }
          el.textContent = pfx + cur.toFixed(dec) + sfx;
        }, step);
        obs.unobserve(el);
      });
    }, { threshold:.4 });
    document.querySelectorAll('[data-count]').forEach(e=>obs.observe(e));
  }

  /* ─────────────── 19. SCROLL REVEAL ─────────────── */
  function initReveal() {
    const style = document.createElement('style');
    style.textContent=`
      .reveal{opacity:0;transform:translateY(28px);transition:opacity .6s var(--ease),transform .6s var(--ease)}
      .reveal.visible{opacity:1;transform:none}
    `;
    document.head.appendChild(style);
    const obs = new IntersectionObserver(entries=>{
      entries.forEach(en=>{ if(en.isIntersecting) en.target.classList.add('visible'); });
    },{threshold:.12});
    document.querySelectorAll('.feat-card,.step-card,.testi-card,.stat-card,.faq-item').forEach(e=>{
      e.classList.add('reveal'); obs.observe(e);
    });
  }

  /* ─────────────── 20. INIT ─────────────── */
  function init() {
    buildNav();
    buildHero();
    buildTicker();
    buildFeatures();
    buildStats();
    buildHow();
    buildActivate();
    buildTestimonials();
    buildFAQ();
    buildCTA();
    buildFooter();
    buildModal();
    buildToast();
    buildBackTop();
    setTimeout(()=>{ initCountUp(); initReveal(); }, 100);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
