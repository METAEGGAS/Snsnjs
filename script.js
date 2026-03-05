/* ══════════════════════════════════════════════════════════════════════════
   app.js  —  نسخة Supabase الكاملة (استبدال Firebase بالكامل)
   ══════════════════════════════════════════════════════════════════════════
   ⚠️  ضع بيانات مشروعك هنا بعد إنشائه في supabase.com
   ══════════════════════════════════════════════════════════════════════════ */


<script type="module">
import{createClient}from'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const SB_URL='https://ybpohyvkdjegyozxfset.supabase.co';
const SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlicG9oeXZrZGplZ3lvenhmc2V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2OTQwMTgsImV4cCI6MjA4ODI3MDAxOH0.Mp7FmHUxlgF8zmnlrXxvWMKHvzNuFmeS5KFs4Y7nnbE';
const sb=createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true}});

// ══════════════════════════════════════════════════════════════════════════
//  2. إعدادات أزواج العملات (لم تتغير)
// ══════════════════════════════════════════════════════════════════════════
const PAIR_CONFIG = {
  'EUR/USD': {basePrice:1.08540,seed:11001,digits:5,vb:8e-4,tb:5e-5},
  'AUD/CAD': {basePrice:0.89520,seed:22002,digits:5,vb:7e-4,tb:4e-5},
  'AUD/CHF': {basePrice:0.57480,seed:33003,digits:5,vb:6e-4,tb:4e-5},
  'USD/CHF': {basePrice:0.90520,seed:44004,digits:5,vb:7e-4,tb:4e-5},
  'EUR/RUB': {basePrice:95.5000,seed:55005,digits:3,vb:0.08,tb:5e-3},
  'AED/CNY': {basePrice:1.95300,seed:66006,digits:5,vb:8e-4,tb:5e-5},
  'BHD/CNY': {basePrice:18.5400,seed:77007,digits:4,vb:0.015,tb:1e-3},
  'KES/USD': {basePrice:0.00771,seed:88008,digits:6,vb:5e-5,tb:3e-6},
  'LBP/USD': {basePrice:0.000067,seed:99009,digits:7,vb:5e-7,tb:3e-8},
  'QAR/CNY': {basePrice:1.97200,seed:10010,digits:5,vb:8e-4,tb:5e-5},
  'SYP/TRY': {basePrice:0.000950,seed:21021,digits:6,vb:5e-6,tb:3e-7},
  'EGP/USD': {basePrice:0.020500,seed:32032,digits:6,vb:1e-4,tb:6e-6},
  'USD/INR': {basePrice:83.5200,seed:43043,digits:4,vb:0.07,tb:4e-3}
};

// ══════════════════════════════════════════════════════════════════════════
//  3. الحالة العامة
// ══════════════════════════════════════════════════════════════════════════
window._curAcc      = localStorage.getItem('_curAcc') || 'demo';
window._demoBalance = 10000;
window._realBalance = 0;
let _uid = null, _userUnsub = null;

// ══════════════════════════════════════════════════════════════════════════
//  4. مساعدات التحويل بين camelCase ↔ snake_case
// ══════════════════════════════════════════════════════════════════════════
function _tradeToDb(t) {
  return {
    uid:              t.uid,
    type:             t.type,
    pair:             t.pair,
    entry_price:      t.entryPrice,
    amount:           t.amount,
    duration:         t.duration,
    start_time:       t.startTime,
    end_time:         t.endTime,
    status:           t.status   || 'active',
    close_price:      t.closePrice   ?? null,
    pnl:              t.pnl          ?? null,
    marker_price:     t.markerPrice,
    candle_timestamp: t.candleTimestamp,
    candle_index:     t.candleIndex,
    account:          t.account  || 'demo'
  };
}

function _tradeFromDb(d) {
  return {
    id:              d.id,
    uid:             d.uid,
    type:            d.type,
    pair:            d.pair,
    entryPrice:      d.entry_price,
    amount:          d.amount,
    duration:        d.duration,
    startTime:       d.start_time,
    endTime:         d.end_time,
    status:          d.status,
    closePrice:      d.close_price,
    pnl:             d.pnl,
    markerPrice:     d.marker_price,
    candleTimestamp: d.candle_timestamp,
    candleIndex:     d.candle_index,
    account:         d.account,
    createdAt: d.created_at ? new Date(d.created_at).getTime() : null,
    closedAt:  d.closed_at  ? new Date(d.closed_at).getTime()  : null
  };
}

function getTradesRef() { return _uid ? true : null; }

// ══════════════════════════════════════════════════════════════════════════
//  5. واجهة المستخدم (refreshUI + helpers)
// ══════════════════════════════════════════════════════════════════════════
const _fmtBal = v => '$' + Number(v).toLocaleString('en', {minimumFractionDigits:2, maximumFractionDigits:2});

function refreshUI() {
  const ac  = window._curAcc;
  const cur = ac === 'demo' ? window._demoBalance : window._realBalance;
  const el  = id => document.getElementById(id);

  if (el('balanceAmount'))  el('balanceAmount').textContent  = _fmtBal(cur);
  if (el('demoAmt'))        el('demoAmt').textContent        = _fmtBal(window._demoBalance);
  if (el('realAmt'))        el('realAmt').textContent        = _fmtBal(window._realBalance);
  if (el('circleDemo'))     el('circleDemo').classList.toggle('sel', ac === 'demo');
  if (el('circleReal'))     el('circleReal').classList.toggle('sel', ac === 'real');
  if (el('accItemDemo'))    el('accItemDemo').classList.toggle('active', ac === 'demo');
  if (el('accItemReal'))    el('accItemReal').classList.toggle('active', ac === 'real');
  if (el('topAccIcon'))     el('topAccIcon').src = ac === 'demo'
    ? 'https://cdn-icons-png.flaticon.com/128/1344/1344761.png'
    : 'https://flagcdn.com/w40/us.png';
  if (el('refillRow'))      el('refillRow').style.display = ac === 'demo' ? 'flex' : 'none';
  const hp = document.getElementById('historyPanel');
  if (hp && hp.classList.contains('show')) loadHistory();
}

function setAvatar(url) {
  const l = document.getElementById('topLogoImg');
  if (!l) return;
  l.src = (url && url.startsWith('http'))
    ? url
    : 'https://cdn-icons-png.flaticon.com/128/18921/18921105.png';
}

function updateBalanceDisplay() { refreshUI(); }

// ══════════════════════════════════════════════════════════════════════════
//  6. إعداد حقول المستخدم عند أول تسجيل دخول
// ══════════════════════════════════════════════════════════════════════════
async function _initUserFields(userId) {
  const { data: existing } = await _supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (!existing) {
    await _supabase.from('users').insert({
      id:           userId,
      demo_balance: 10000,
      real_balance: 0,
      avatar:       '',
      email:        ''
    }).select();
    return;
  }

  const updates = {};
  if (existing.demo_balance == null) updates.demo_balance = 10000;
  if (existing.real_balance == null) updates.real_balance = 0;
  if (existing.avatar       == null) updates.avatar       = '';
  if (Object.keys(updates).length) {
    await _supabase.from('users').update(updates).eq('id', userId);
  }
}

// ══════════════════════════════════════════════════════════════════════════
//  7. الاستماع لتغييرات المستخدم في الوقت الفعلي
// ══════════════════════════════════════════════════════════════════════════
function _listenUser(userId) {
  if (_userUnsub) _userUnsub();
  const ch = _supabase
    .channel('user-rt-' + userId)
    .on('postgres_changes', {
      event:  '*',
      schema: 'public',
      table:  'users',
      filter: `id=eq.${userId}`
    }, payload => {
      const d = payload.new;
      if (!d) return;
      if (typeof d.demo_balance === 'number') window._demoBalance = d.demo_balance;
      if (typeof d.real_balance === 'number') window._realBalance = d.real_balance;
      refreshUI();
      setAvatar(d.avatar || '');
    })
    .subscribe();
  _userUnsub = () => _supabase.removeChannel(ch);
}

// ══════════════════════════════════════════════════════════════════════════
//  8. مراقبة حالة المصادقة (بديل auth.onAuthStateChanged)
// ══════════════════════════════════════════════════════════════════════════
_supabase.auth.onAuthStateChange(async (event, session) => {
  const user = session?.user;
  if (user) {
    _uid = user.id;
    // upsert بيانات المستخدم الأساسية
    await _supabase.from('users')
      .upsert({ id: _uid, email: user.email || '' }, { onConflict: 'id' });
    await _initUserFields(_uid);
    _listenUser(_uid);
    if (user.user_metadata?.avatar_url) setAvatar(user.user_metadata.avatar_url);
    activeTrades = [];
    if (window.chart) window.chart.clearAllTradeMarkers();
    loadActiveTrades();
  } else {
    _uid = null;
    if (_userUnsub) { _userUnsub(); _userUnsub = null; }
    activeTrades = [];
    if (window.chart) window.chart.clearAllTradeMarkers();
    window._demoBalance = 10000;
    window._realBalance = 0;
    refreshUI();
    setAvatar('');
  }
});

// ══════════════════════════════════════════════════════════════════════════
//  9. Auth helpers (للاستخدام من صفحة تسجيل الدخول / الإنشاء)
// ══════════════════════════════════════════════════════════════════════════
window.authSignUp = async (email, password) => {
  const { data, error } = await _supabase.auth.signUp({ email, password });
  return { data, error };
};
window.authSignIn = async (email, password) => {
  const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};
window.authSignOut = async () => {
  const { error } = await _supabase.auth.signOut();
  return { error };
};
window.authSignInGoogle = async () => {
  const { data, error } = await _supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  });
  return { data, error };
};

// ══════════════════════════════════════════════════════════════════════════
//  10. قائمة الحساب (Balance Box / AccMenu)
// ══════════════════════════════════════════════════════════════════════════
const _balBox  = document.getElementById('balanceBox');
const _accMenu = document.getElementById('accMenu');

if (_balBox) {
  _balBox.addEventListener('click', function(e) {
    if (e.target.closest('.accMenu')) return;
    e.stopPropagation();
    _accMenu.classList.toggle('show');
    _balBox.classList.toggle('open');
  });
}
document.addEventListener('click', e => {
  if (!e.target.closest('#balanceBox')) {
    if (_accMenu) _accMenu.classList.remove('show');
    if (_balBox)  _balBox.classList.remove('open');
  }
});

const _accItemDemo = document.getElementById('accItemDemo');
if (_accItemDemo) {
  _accItemDemo.addEventListener('click', e => {
    if (e.target.closest('#refillRow')) return;
    window._curAcc = 'demo';
    localStorage.setItem('_curAcc', 'demo');
    refreshUI();
    if (_accMenu) _accMenu.classList.remove('show');
    if (_balBox)  _balBox.classList.remove('open');
  });
}

const _accItemReal = document.getElementById('accItemReal');
if (_accItemReal) {
  _accItemReal.addEventListener('click', () => {
    window._curAcc = 'real';
    localStorage.setItem('_curAcc', 'real');
    refreshUI();
    if (_accMenu) _accMenu.classList.remove('show');
    if (_balBox)  _balBox.classList.remove('open');
  });
}

const _switchAccBtn = document.getElementById('switchAccBtn');
if (_switchAccBtn) {
  _switchAccBtn.addEventListener('click', e => {
    e.stopPropagation();
    window._curAcc = window._curAcc === 'demo' ? 'real' : 'demo';
    localStorage.setItem('_curAcc', window._curAcc);
    refreshUI();
    showInfoToast(window._curAcc === 'demo'
      ? '✅ تم التبديل إلى الحساب التجريبي'
      : '✅ تم التبديل إلى الحساب الحقيقي');
  });
}

// زر إعادة تعبئة الحساب التجريبي
const _refillBtn = document.getElementById('refillBtn');
if (_refillBtn) {
  _refillBtn.addEventListener('click', async e => {
    e.stopPropagation();
    if (!_uid) { showInfoToast('❌ لازم تسجّل دخول الأول', 'error'); return; }
    window._demoBalance = 10000;
    refreshUI();
    try {
      await _supabase.from('users').update({ demo_balance: 10000 }).eq('id', _uid);
      showInfoToast('✅ تم تعبئة الحساب التجريبي بـ $10,000');
    } catch(err) { console.warn('refill:', err); }
  });
}

// حماية أزرار Buy/Sell
document.addEventListener('click', e => {
  const buyB  = document.getElementById('buyBtn');
  const sellB = document.getElementById('sellBtn');
  if (e.target !== buyB && e.target !== sellB) return;
  const bal = window.getCurrentBalance();
  const amt = parseFloat((document.getElementById('amountDisplay').value || '0').replace(/[^0-9.]/g, '')) || 0;
  if (bal <= 0) { e.stopImmediatePropagation(); showInfoToast('❌ الرصيد فارغ! قم بتعبئة الحساب أولاً', 'error'); return; }
  if (amt > bal) { e.stopImmediatePropagation(); showInfoToast('❌ المبلغ أكبر من رصيدك المتاح!', 'error'); }
}, true);

// ══════════════════════════════════════════════════════════════════════════
//  11. دوال الرصيد المشتركة
// ══════════════════════════════════════════════════════════════════════════
window.getCurrentBalance  = () => window._curAcc === 'demo' ? window._demoBalance : window._realBalance;
window.getCurrentAccount  = () => window._curAcc;

window.deductBalance = async amt => {
  if (window._curAcc === 'demo') window._demoBalance = Math.max(0, window._demoBalance - amt);
  else                           window._realBalance  = Math.max(0, window._realBalance  - amt);
  refreshUI();
  if (!_uid) return;
  const field = window._curAcc === 'demo' ? 'demo_balance' : 'real_balance';
  const val   = window._curAcc === 'demo' ? window._demoBalance : window._realBalance;
  try { await _supabase.from('users').update({ [field]: val }).eq('id', _uid); }
  catch(err) { console.warn('deductBalance:', err); }
};

window.addBalance = async amt => {
  if (window._curAcc === 'demo') window._demoBalance += amt;
  else                           window._realBalance  += amt;
  refreshUI();
  if (!_uid) return;
  const field = window._curAcc === 'demo' ? 'demo_balance' : 'real_balance';
  const val   = window._curAcc === 'demo' ? window._demoBalance : window._realBalance;
  try { await _supabase.from('users').update({ [field]: val }).eq('id', _uid); }
  catch(err) { console.warn('addBalance:', err); }
};

window.setUserAvatar = async url => {
  setAvatar(url);
  if (!_uid) return;
  try { await _supabase.from('users').update({ avatar: url }).eq('id', _uid); }
  catch(err) { console.warn('setUserAvatar:', err); }
};

refreshUI();

// ══════════════════════════════════════════════════════════════════════════
//  12. Toast + Overlay
// ══════════════════════════════════════════════════════════════════════════
let _infoTimer = null;
function showInfoToast(msg, type = 'info', dur = 3000) {
  const el = document.getElementById('infoToast');
  if (!el) return;
  el.textContent = msg;
  el.className   = 'info-toast show ' + type;
  if (_infoTimer) clearTimeout(_infoTimer);
  _infoTimer = setTimeout(() => el.classList.remove('show'), dur);
}

let _chartResTimer = null;
function showChartPnlOverlay(pnlStr, amount) {
  const plot = document.getElementById('plot');
  if (!plot) return;
  if (!document.getElementById('_chartPnlCSS')) {
    const s = document.createElement('style');
    s.id = '_chartPnlCSS';
    s.textContent = `#chartPnlOverlay{position:absolute;top:10px;left:10px;z-index:80;padding:6px 10px;border-radius:8px;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.10);color:#fff;font-size:11px;font-family:monospace;letter-spacing:.3px;opacity:0;transform:translateY(-6px);transition:opacity .25s ease,transform .25s ease;pointer-events:none;white-space:nowrap;}#chartPnlOverlay.show{opacity:1;transform:translateY(0);}`;
    document.head.appendChild(s);
  }
  let el = document.getElementById('chartPnlOverlay');
  if (!el) { el = document.createElement('div'); el.id = 'chartPnlOverlay'; plot.appendChild(el); }
  el.textContent = `${pnlStr}  |  رأس المال: $${amount.toFixed(2)}`;
  el.classList.add('show');
  if (_chartResTimer) clearTimeout(_chartResTimer);
  _chartResTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

// ══════════════════════════════════════════════════════════════════════════
//  13. مساعدات التنسيق
// ══════════════════════════════════════════════════════════════════════════
function fmtCountdown(sec) {
  sec = Math.max(0, Math.floor(sec));
  if (sec >= 3600) {
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  } else if (sec >= 60) {
    const m = Math.floor(sec / 60), s = sec % 60;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  return String(sec).padStart(2, '0') + 's';
}

function fmtDate(ts) {
  if (!ts) return '--';
  const d = new Date(ts);
  const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} • ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

// ══════════════════════════════════════════════════════════════════════════
//  14. الصفقات النشطة
// ══════════════════════════════════════════════════════════════════════════
let activeTrades = [];

async function openTrade(type) {
  if (!_uid) return showInfoToast('❌ لازم تسجّل دخول عشان الصفقات تبقى خاصة بيك', 'error');
  const raw    = document.getElementById('amountDisplay').value.replace(/[^0-9.]/g, '');
  const amount = parseFloat(raw) || 50;
  const bal    = window.getCurrentBalance();
  if (amount <= 0) return showInfoToast('❌ مبلغ غير صالح', 'error');
  if (amount > bal) return showInfoToast('❌ رصيد غير كافٍ', 'error');
  if (!window.chart || !window.chart.currentCandle) return showInfoToast('⏳ الرسم غير جاهز', 'error');

  const entryPrice      = window.chart.currentPrice;
  const duration        = window.chart.selectedTime;
  const startTime       = Date.now();
  const endTime         = startTime + duration * 1000;
  const pairName        = (window.chart.currentPair || 'EUR/USD') + ' OTC';
  const cc              = window.chart.currentCandle;
  const candleTimestamp = cc ? cc.timestamp : Math.floor(startTime / window.chart.timeframe) * window.chart.timeframe;
  const candleIndex     = window.chart.candles.length;

  let markerPrice = entryPrice;
  if (cc) {
    const bt = Math.max(cc.open, cc.close), bb = Math.min(cc.open, cc.close);
    if (markerPrice > bt) markerPrice = bt;
    else if (markerPrice < bb) markerPrice = bb;
  }

  await window.deductBalance(amount);

  const tradeData = {
    uid: _uid, type, pair: pairName, entryPrice, amount, duration,
    startTime, endTime, status: 'active', closePrice: null, pnl: null,
    markerPrice, candleTimestamp, candleIndex, account: window._curAcc
  };

  try {
    const { data: row, error } = await _supabase
      .from('trades')
      .insert(_tradeToDb(tradeData))
      .select()
      .single();
    if (error) throw error;

    const trade = { ...tradeData, id: row.id };
    activeTrades.push(trade);
    window.chart.addMarkerForTrade(type, trade);
    renderActiveTrades();

    const rem = Math.max(0, endTime - Date.now());
    setTimeout(() => closeTrade(trade), rem);
    showInfoToast(`${type === 'buy' ? '↗ شراء' : '↘ بيع'}  $${amount}  @  ${entryPrice.toFixed(5)}`, type, 2500);
  } catch(err) {
    await window.addBalance(amount);
    console.error('openTrade:', err);
    showInfoToast('❌ خطأ في فتح الصفقة', 'error');
  }
}

async function closeTrade(trade) {
  activeTrades = activeTrades.filter(t => t.id !== trade.id);
  const closePrice = window.chart ? window.chart.currentPrice : trade.entryPrice;
  const won        = trade.type === 'buy' ? closePrice > trade.entryPrice : closePrice < trade.entryPrice;
  const profit     = won ? +(trade.amount * 0.8).toFixed(2) : 0;
  const pnl        = won ? profit : -trade.amount;
  const newStatus  = won ? 'won' : 'lost';

  if (won) await window.addBalance(trade.amount + profit);

  try {
    await _supabase.from('trades').update({
      status:      newStatus,
      close_price: closePrice,
      pnl:         pnl,
      closed_at:   new Date().toISOString()
    }).eq('id', trade.id);
  } catch(err) { console.warn('closeTrade update:', err); }

  if (window.chart) window.chart.removeMarkerByTradeId(trade.id);
  renderActiveTrades();
  showChartPnlOverlay(won ? `+$${profit.toFixed(2)}` : `-$${trade.amount.toFixed(2)}`, trade.amount);
  const hp = document.getElementById('historyPanel');
  if (hp && hp.classList.contains('show')) loadHistory();
}

async function loadActiveTrades() {
  if (!_uid) return;
  try {
    const { data: rows, error } = await _supabase
      .from('trades')
      .select('*')
      .eq('uid', _uid)
      .eq('status', 'active');
    if (error) throw error;

    const now = Date.now();
    for (const d of (rows || [])) {
      const trade = _tradeFromDb(d);
      if (!trade.endTime) continue;
      if (trade.endTime <= now) { closeTrade(trade); continue; }
      activeTrades.push(trade);
      if (window.chart) window.chart.addMarkerFromTrade(trade);
      setTimeout(() => closeTrade(trade), trade.endTime - now);
    }
    renderActiveTrades();
  } catch(err) { console.warn('loadActiveTrades:', err); }
}

function renderActiveTrades() {
  const panel = document.getElementById('activeTradesPanel');
  if (!panel) return;
  panel.innerHTML = '';
  panel.style.display = 'none';
}

setInterval(() => {
  const now = Date.now();
  for (const t of activeTrades) {
    const el = document.getElementById(`histTimer-${t.id}`);
    if (el) el.textContent = '⏱ ' + fmtCountdown(Math.max(0, (t.endTime - now) / 1000));
  }
}, 1000);

// ══════════════════════════════════════════════════════════════════════════
//  15. سجل الصفقات
// ══════════════════════════════════════════════════════════════════════════
async function loadHistory() {
  const content = document.getElementById('historyContent');
  if (!content) return;
  if (!_uid) {
    content.innerHTML = '<div class="empty-history">لازم تسجّل دخول عشان تشوف سجلّك</div>';
    return;
  }
  content.innerHTML = '<div class="loading-text">⏳ جاري التحميل...</div>';

  try {
    const { data: rows, error } = await _supabase
      .from('trades')
      .select('*')
      .eq('uid', _uid)
      .order('start_time', { ascending: false })
      .limit(100);
    if (error) throw error;

    const curAcc    = window._curAcc;
    const allSnap   = (rows || []).map(_tradeFromDb);
    const accFilter = t => curAcc === 'demo' ? (!t.account || t.account === 'demo') : t.account === curAcc;
    const accTrades = allSnap.filter(accFilter);

    const activeTab = document.querySelector('#historyPanel .htab.active');
    const tab       = activeTab ? activeTab.getAttribute('data-tab') : 'all';
    let trades      = [...accTrades];
    if (tab === 'active') trades = trades.filter(t => t.status === 'active');
    else if (tab === 'closed') trades = trades.filter(t => t.status === 'won' || t.status === 'lost');

    const wonT   = accTrades.filter(t => t.status === 'won');
    const lostT  = accTrades.filter(t => t.status === 'lost');
    const netPnl = wonT.reduce((s,t) => s + (t.pnl || 0), 0) + lostT.reduce((s,t) => s + (t.pnl || 0), 0);

    const se = id => document.getElementById(id);
    if (se('statTotal')) se('statTotal').textContent = accTrades.length;
    if (se('statWon'))   se('statWon').textContent   = wonT.length;
    if (se('statLost'))  se('statLost').textContent  = lostT.length;
    if (se('statPnl'))  {
      se('statPnl').textContent    = (netPnl >= 0 ? '+' : '') + `$${netPnl.toFixed(2)}`;
      se('statPnl').style.color    = netPnl >= 0 ? '#00cc00' : '#ff5555';
    }

    if (!trades.length) {
      content.innerHTML = '<div class="empty-history">لا توجد صفقات في هذا القسم</div>';
      return;
    }
    content.innerHTML = trades.map(renderTradeRecord).join('');
  } catch(err) {
    console.error('loadHistory:', err);
    content.innerHTML = '<div class="empty-history">⚠️ خطأ في تحميل السجل</div>';
  }
}

function renderTradeRecord(t) {
  const tc     = t.type === 'buy' ? 'buy' : 'sell';
  const dir    = t.type === 'buy' ? '↗ شراء' : '↘ بيع';
  let stLbl, stCls, pnlCls, pnlStr;

  if (t.status === 'active') {
    const rem = Math.max(0, ((t.endTime || Date.now()) - Date.now()) / 1000);
    stLbl  = '● نشطة'; stCls = 'active'; pnlCls = 'active-pnl';
    pnlStr = `<span id="histTimer-${t.id}">⏱ ${fmtCountdown(rem)}</span>`;
  } else if (t.status === 'won') {
    stLbl = '✓ ربح'; stCls = 'won'; pnlCls = 'win';
    pnlStr = `+$${(t.pnl || 0).toFixed(2)}`;
  } else {
    stLbl = '✗ خسارة'; stCls = 'lost'; pnlCls = 'loss';
    pnlStr = `-$${(t.amount || 0).toFixed(2)}`;
  }

  const dur   = fmtCountdown(t.duration || 0);
  const date  = fmtDate(t.startTime);
  const close = t.closePrice
    ? t.closePrice.toFixed(5)
    : (t.status === 'active' ? '⏳' : '--');

  return `<div class="trade-record">
    <div class="tr-top">
      <div class="tr-badge">
        <span class="tr-type ${tc}">${dir}</span>
        <span class="tr-status ${stCls}">${stLbl}</span>
      </div>
      <span class="tr-pnl ${pnlCls}">${pnlStr}</span>
    </div>
    <div class="tr-details">
      <div class="tr-detail"><span class="tr-detail-label">المبلغ</span><span class="tr-detail-value">$${(t.amount||0).toFixed(2)}</span></div>
      <div class="tr-detail"><span class="tr-detail-label">سعر الدخول</span><span class="tr-detail-value">${(t.entryPrice||0).toFixed(5)}</span></div>
      <div class="tr-detail"><span class="tr-detail-label">سعر الإغلاق</span><span class="tr-detail-value">${close}</span></div>
      <div class="tr-detail"><span class="tr-detail-label">الزوج</span><span class="tr-detail-value">${t.pair||'EUR/USD'}</span></div>
      <div class="tr-detail"><span class="tr-detail-label">المدة</span><span class="tr-detail-value">${dur}</span></div>
      <div class="tr-detail"><span class="tr-detail-label">الوقت</span><span class="tr-detail-value" style="font-size:8px">${date}</span></div>
    </div>
  </div>`;
}

// ══════════════════════════════════════════════════════════════════════════
//  16. الوقت المباشر
// ══════════════════════════════════════════════════════════════════════════
function updateLiveTime() {
  const d  = new Date();
  const u  = d.getTime() + d.getTimezoneOffset() * 6e4;
  const t  = new Date(u + 108e5);
  const h  = String(t.getHours()).padStart(2, '0');
  const m  = String(t.getMinutes()).padStart(2, '0');
  const s  = String(t.getSeconds()).padStart(2, '0');
  const el = document.getElementById('liveTime');
  if (el) el.textContent = `${h}:${m}:${s} UTC+3`;
}
updateLiveTime();
setInterval(updateLiveTime, 1e3);

// ══════════════════════════════════════════════════════════════════════════
//  17. ChartMasterManager — Supabase version
// ══════════════════════════════════════════════════════════════════════════
class ChartMasterManager {
  constructor() {
    this.sessionId    = Date.now().toString(36) + Math.random().toString(36).substr(2, 8);
    this.masterPairs  = new Set();
    this._hbTimers    = {};
    this._watchTimers = {};
    this._liveUnsub   = null;
    this._lastBroadcast = 0;
    this._registerSession();
    window.addEventListener('beforeunload', () => this._cleanup());
  }

  _masterKey(pair) { return 'master_' + pair.replace('/', '_'); }
  _liveKey(pair)   { return 'live_'   + pair.replace('/', '_'); }

  _registerSession() {
    _supabase.from('chart_sessions').upsert({
      session_id: this.sessionId,
      last_seen:  new Date().toISOString(),
      active:     true
    }, { onConflict: 'session_id' }).catch(() => {});

    setInterval(() => {
      _supabase.from('chart_sessions')
        .update({ last_seen: new Date().toISOString() })
        .eq('session_id', this.sessionId)
        .catch(() => {});
    }, 5000);
  }

  async claimMaster(pair) {
    const key = this._masterKey(pair);
    let claimed = false;
    try {
      const { data, error } = await _supabase.rpc('claim_master', {
        p_key:        key,
        p_session_id: this.sessionId
      });
      claimed = (data === true);
    } catch(err) {
      console.warn('claimMaster error:', err);
      claimed = true; // fallback: تصرف كماستر
    }

    if (claimed) {
      this.masterPairs.add(pair);
      this._startHeartbeat(pair);
      this._stopWatch(pair);
      console.log(`🎯 [Master] ${this.sessionId.slice(-6)} → ${pair}`);
    } else {
      this._startWatch(pair);
      console.log(`👁️ [Viewer] ${this.sessionId.slice(-6)} → ${pair}`);
    }
    return claimed;
  }

  _startHeartbeat(pair) {
    if (this._hbTimers[pair]) clearInterval(this._hbTimers[pair]);
    this._hbTimers[pair] = setInterval(async () => {
      if (!this.masterPairs.has(pair)) {
        clearInterval(this._hbTimers[pair]);
        delete this._hbTimers[pair];
        return;
      }
      await _supabase.from('chart_control')
        .update({ last_heartbeat: new Date().toISOString(), is_active: true })
        .eq('id', this._masterKey(pair))
        .catch(() => {});
    }, 3000);
  }

  _startWatch(pair) {
    if (this._watchTimers[pair]) return;
    this._watchTimers[pair] = setInterval(async () => {
      if (this.masterPairs.has(pair)) { this._stopWatch(pair); return; }
      try {
        const { data } = await _supabase.from('chart_control')
          .select('*').eq('id', this._masterKey(pair)).maybeSingle();
        const now    = Date.now();
        const isDead = !data || !data.is_active || !data.last_heartbeat ||
          (now - new Date(data.last_heartbeat).getTime()) > 12000;
        if (isDead) {
          const became = await this.claimMaster(pair);
          if (became && window.chart && window.chart.currentPair === pair)
            window.chart._onBecameMaster(pair);
        }
      } catch(err) {}
    }, 7000);
  }

  _stopWatch(pair) {
    if (this._watchTimers[pair]) { clearInterval(this._watchTimers[pair]); delete this._watchTimers[pair]; }
  }

  isMaster(pair) { return this.masterPairs.has(pair); }

  broadcastLiveCandle(candle, pair) {
    if (!this.masterPairs.has(pair) || !candle) return;
    const now = Date.now();
    if ((now - this._lastBroadcast) < 200) return;
    this._lastBroadcast = now;
    _supabase.from('chart_control').upsert({
      id:         this._liveKey(pair),
      candle:     candle,
      pair:       pair,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' }).catch(() => {});
  }

  subscribeToLiveCandle(pair, callback) {
    if (this._liveUnsub) { this._liveUnsub(); this._liveUnsub = null; }
    const ch = _supabase
      .channel('live-candle-' + pair.replace('/', '_'))
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'chart_control',
        filter: `id=eq.${this._liveKey(pair)}`
      }, payload => {
        const d = payload.new;
        if (d && d.pair === pair && d.candle) callback(d.candle);
      })
      .subscribe();
    this._liveUnsub = () => _supabase.removeChannel(ch);
  }

  unsubscribeLive() {
    if (this._liveUnsub) { this._liveUnsub(); this._liveUnsub = null; }
  }

  releaseMaster(pair) {
    if (!this.masterPairs.has(pair)) return;
    this.masterPairs.delete(pair);
    if (this._hbTimers[pair]) { clearInterval(this._hbTimers[pair]); delete this._hbTimers[pair]; }
    _supabase.from('chart_control').update({ is_active: false }).eq('id', this._masterKey(pair)).catch(() => {});
    this._startWatch(pair);
  }

  _cleanup() {
    this.masterPairs.forEach(pair => {
      try { _supabase.from('chart_control').update({ is_active: false }).eq('id', this._masterKey(pair)); } catch(e) {}
      if (this._hbTimers[pair]) clearInterval(this._hbTimers[pair]);
    });
    try { _supabase.from('chart_sessions').update({ active: false }).eq('session_id', this.sessionId); } catch(e) {}
  }
}

// ══════════════════════════════════════════════════════════════════════════
//  18. AdvancedTradingChart — Supabase version
// ══════════════════════════════════════════════════════════════════════════
class AdvancedTradingChart {
  constructor() {
    this.plot             = document.getElementById('plot');
    this.canvas           = document.getElementById('chartCanvas');
    this.ctx              = this.canvas.getContext('2d');
    this.timeLabels       = document.getElementById('timeLabels');
    this.candleTimer      = document.getElementById('candleTimer');
    this.priceLine        = document.getElementById('priceLine');
    this.priceScaleLabels = document.getElementById('priceScaleLabels');
    this.currentPriceEl   = document.getElementById('currentPrice');

    this.candles      = []; this.currentCandle = null;
    this.maxCandles   = 5000;
    this.currentPair  = 'EUR/USD';
    this.pairStates   = new Map();
    this._switching   = false;

    const _cfg        = PAIR_CONFIG['EUR/USD'];
    this.basePrice    = _cfg.basePrice; this.seed = _cfg.seed;
    this.digits       = _cfg.digits;    this.vb   = _cfg.vb; this.tb = _cfg.tb;
    this.currentPrice = this.basePrice;
    this.priceRange   = { min: this.basePrice * .99, max: this.basePrice * 1.01 };

    this.baseSpacing = 12; this.zoom = 1; this.targetZoom = 1;
    this.minZoom = 0.425;  this.maxZoom = 2.25;
    this.zoomEase = 0.28;  this.targetOffsetX = 0; this.offsetX = 0;
    this.panEase  = 0.38;  this.velocity = 0;
    this.drag = 0; this.dragStartX = 0; this.dragStartOffset = 0;
    this.lastDragX = 0; this.lastDragTime = 0;
    this.pinch = 0; this.p0 = 0; this.pMidX = 0; this.pMidY = 0;

    this.timeframe  = 6e4;
    this.t0         = Math.floor(Date.now() / 6e4) * 6e4;
    this.smin       = null; this.smax = null; this.sre = 0.088; this._fr = 0;
    this.markers    = []; this.selectedTime = 5;
    this._realtimeStarted = false;
    this._isViewerMode    = false;
    this._viewerUnsub     = null;
    this._skeletonEl      = null;
    this._forcedCandles   = {};
    this._ccpCountdownTimer = null;

    this.setup();
    this._createSkeleton();
    this.initEvents();
    this.loop();
  }

  // — Skeleton —
  _injectSkeletonStyles() {
    if (document.getElementById('_skelCSS')) return;
    const s = document.createElement('style'); s.id = '_skelCSS';
    s.textContent = `#chartSkeleton{position:absolute;inset:0;z-index:9999;background:url("https://xdcbitr.com/h5/chart-loading-animation.gif") center center/100% 100% no-repeat;pointer-events:none;opacity:1;transition:opacity .25s ease;}#chartSkeleton.sk-hidden{opacity:0;}`;
    document.head.appendChild(s);
  }
  _createSkeleton() {
    if (document.getElementById('chartSkeleton')) { this._skeletonEl = document.getElementById('chartSkeleton'); return; }
    this._injectSkeletonStyles();
    const sk = document.createElement('div'); sk.id = 'chartSkeleton';
    if (getComputedStyle(this.plot).position === 'static') this.plot.style.position = 'relative';
    this.plot.appendChild(sk); this._skeletonEl = sk;
  }
  showSkeleton() { if (!this._skeletonEl) this._createSkeleton(); this._skeletonEl.classList.remove('sk-hidden'); }
  hideSkeleton() { if (this._skeletonEl) this._skeletonEl.classList.add('sk-hidden'); }

  // — CandleControlPanel —
  _injectCCPStyles() {
    if (document.getElementById('_ccpCSS')) return;
    const s = document.createElement('style'); s.id = '_ccpCSS';
    s.textContent = `#candleControlPanel{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.88);z-index:500;background:rgba(10,12,22,0.94);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,215,0,0.22);border-radius:14px;padding:11px 13px 10px;min-width:230px;color:#fff;font-family:'Segoe UI',Tahoma,sans-serif;box-shadow:0 10px 40px rgba(0,0,0,0.7),0 0 0 1px rgba(255,215,0,0.06);opacity:0;pointer-events:none;transition:opacity 0.22s ease,transform 0.22s ease;direction:rtl;user-select:none;}#candleControlPanel.ccp-visible{opacity:1;pointer-events:all;transform:translate(-50%,-50%) scale(1);}.ccp-header{display:flex;align-items:center;gap:6px;margin-bottom:7px;}.ccp-title{flex:1;font-size:11.5px;font-weight:700;color:#ffd700;letter-spacing:.3px;}.ccp-timer-badge{background:rgba(255,215,0,0.12);border:1px solid rgba(255,215,0,0.28);border-radius:20px;padding:2px 8px;font-size:10.5px;font-weight:700;color:#ffd700;min-width:28px;text-align:center;font-variant-numeric:tabular-nums;}.ccp-close-btn{cursor:pointer;color:#666;font-size:15px;line-height:1;padding:0 1px;transition:color .15s;}.ccp-close-btn:hover{color:#ccc;}.ccp-subtitle{font-size:9px;color:#888;margin-bottom:9px;text-align:center;letter-spacing:.2px;}.ccp-divider{height:1px;background:rgba(255,255,255,0.06);margin:7px 0;}.ccp-row{display:flex;align-items:center;gap:5px;margin-bottom:5px;padding:5px 7px;border-radius:8px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);transition:background .15s,border-color .15s;}.ccp-row:last-of-type{margin-bottom:0;}.ccp-row:hover{background:rgba(255,255,255,0.07);border-color:rgba(255,255,255,0.1);}.ccp-candle-label{font-size:9px;color:#666;min-width:34px;text-align:right;}.ccp-time{flex:1;font-size:12.5px;font-weight:700;color:#ddd;font-family:'Courier New',monospace;direction:ltr;text-align:left;letter-spacing:.5px;}.ccp-btn{border:none;border-radius:6px;padding:4px 9px;font-size:10px;font-weight:700;cursor:pointer;transition:all 0.18s;outline:none;letter-spacing:.2px;}.ccp-btn:hover{transform:scale(1.07);}.ccp-btn:active{transform:scale(0.96);}.ccp-btn.ccp-up{background:rgba(0,200,80,0.14);border:1px solid rgba(0,200,80,0.40);color:#00e060;}.ccp-btn.ccp-up:hover{background:rgba(0,200,80,0.25);}.ccp-btn.ccp-up.ccp-selected{background:rgba(0,200,80,0.42);border-color:#00dd55;color:#fff;box-shadow:0 0 10px rgba(0,230,100,0.50);}.ccp-btn.ccp-down{background:rgba(255,55,55,0.14);border:1px solid rgba(255,55,55,0.40);color:#ff5555;}.ccp-btn.ccp-down:hover{background:rgba(255,55,55,0.25);}.ccp-btn.ccp-down.ccp-selected{background:rgba(255,55,55,0.42);border-color:#ff3333;color:#fff;box-shadow:0 0 10px rgba(255,60,60,0.50);}.ccp-progress-bar{height:3px;background:rgba(255,215,0,0.12);border-radius:3px;margin-top:9px;overflow:hidden;}.ccp-progress-fill{height:100%;background:linear-gradient(90deg,#ffd700,#ffaa00);border-radius:3px;transition:width 0.95s linear;}`;
    document.head.appendChild(s);
  }
  _createCandleControlPanel() {
    this._injectCCPStyles();
    if (document.getElementById('candleControlPanel')) return;
    const el = document.createElement('div'); el.id = 'candleControlPanel';
    if (getComputedStyle(this.plot).position === 'static') this.plot.style.position = 'relative';
    this.plot.appendChild(el);
  }
  showCandleControlPanel() {
    if (!window.masterManager || !window.masterManager.isMaster(this.currentPair)) return;
    this._createCandleControlPanel();
    const panel = document.getElementById('candleControlPanel'); if (!panel) return;
    if (this._ccpCountdownTimer) { clearInterval(this._ccpCountdownTimer); this._ccpCountdownTimer = null; }
    let timeLeft = 10;
    panel.innerHTML = this._buildCCPHtml(timeLeft);
    panel.classList.add('ccp-visible');
    panel.querySelectorAll('.ccp-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const ts  = parseInt(btn.closest('.ccp-row').getAttribute('data-ts'));
        const dir = btn.getAttribute('data-dir');
        if (this._forcedCandles[ts] === dir) delete this._forcedCandles[ts];
        else {
          this._forcedCandles[ts] = dir;
          const timeEl  = btn.closest('.ccp-row').querySelector('.ccp-time');
          const timeStr = timeEl ? timeEl.textContent : '';
          showInfoToast(dir === 'up' ? `🟢 شمعة ${timeStr} ستُغلق صاعدة ↗` : `🔴 شمعة ${timeStr} ستُغلق هابطة ↘`, dir === 'up' ? 'buy' : 'sell', 2200);
        }
        this._syncCCPSelections();
      });
    });
    const closeBtn = document.getElementById('ccpCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.hideCandleControlPanel());
    this._syncCCPSelections();
    this._ccpCountdownTimer = setInterval(() => {
      timeLeft--;
      const badge = document.getElementById('ccpTimerBadge');
      const fill  = document.getElementById('ccpProgressFill');
      if (badge) badge.textContent = timeLeft + 's';
      if (fill)  fill.style.width  = (timeLeft * 10) + '%';
      if (timeLeft <= 0) this.hideCandleControlPanel();
    }, 1000);
  }
  _buildCCPHtml(timeLeft) {
    const rows = [];
    for (let i = 0; i < 3; i++) {
      const ts    = this.t0 + i * this.timeframe;
      const d     = new Date(ts);
      const hh    = String(d.getHours()).padStart(2, '0');
      const mm    = String(d.getMinutes()).padStart(2, '0');
      const label = i === 0 ? 'الحالية' : i === 1 ? 'التالية' : 'بعدها ';
      const sel   = this._forcedCandles[ts] || '';
      rows.push(`<div class="ccp-row" data-ts="${ts}"><span class="ccp-candle-label">${label}</span><span class="ccp-time">${hh}:${mm}</span><button class="ccp-btn ccp-up${sel==='up'?' ccp-selected':''}" data-dir="up">↗ صعود</button><button class="ccp-btn ccp-down${sel==='down'?' ccp-selected':''}" data-dir="down">↘ هبوط</button></div>`);
    }
    return `<div class="ccp-header"><span class="ccp-title">🎯 التحكم بالشمعة</span><span class="ccp-timer-badge" id="ccpTimerBadge">${timeLeft}s</span><span class="ccp-close-btn" id="ccpCloseBtn">✕</span></div><div class="ccp-subtitle">اختر شمعة وحدد اتجاه الإغلاق — ماستر فقط</div>${rows.join('')}<div class="ccp-progress-bar"><div class="ccp-progress-fill" id="ccpProgressFill" style="width:100%"></div></div>`;
  }
  _syncCCPSelections() {
    const panel = document.getElementById('candleControlPanel'); if (!panel) return;
    panel.querySelectorAll('.ccp-row').forEach(row => {
      const ts  = parseInt(row.getAttribute('data-ts'));
      const dir = this._forcedCandles[ts] || '';
      row.querySelectorAll('.ccp-btn').forEach(btn => btn.classList.toggle('ccp-selected', btn.getAttribute('data-dir') === dir));
    });
  }
  hideCandleControlPanel() {
    const panel = document.getElementById('candleControlPanel');
    if (panel) panel.classList.remove('ccp-visible');
    if (this._ccpCountdownTimer) { clearInterval(this._ccpCountdownTimer); this._ccpCountdownTimer = null; }
  }

  // — Setup & resize —
  setup() {
    const dpr = window.devicePixelRatio || 1;
    const r   = this.plot.getBoundingClientRect();
    this.w = r.width; this.h = r.height - 24;
    this.canvas.width  = this.w * dpr; this.canvas.height = this.h * dpr;
    this.canvas.style.width  = this.w + 'px'; this.canvas.style.height = this.h + 'px';
    this.ctx.setTransform(1,0,0,1,0,0); this.ctx.scale(dpr, dpr);
    this.updatePriceLabel(); this.updatePriceScale(); this.updateTimeLabels();
  }

  // — RNG —
  rnd(s)  { const x = Math.sin(s) * 1e4; return x - Math.floor(x); }
  rndG(s) { const u1 = this.rnd(s), u2 = this.rnd(s + 1e5); return Math.sqrt(-2 * Math.log(u1 + 1e-5)) * Math.cos(2 * Math.PI * u2); }
  genCandle(t, o) {
    const vb=this.vb||8e-4,tb=this.tb||5e-5,s=this.seed+Math.floor(t/this.timeframe);
    const r1=this.rndG(s),r2=this.rndG(s+1),r3=this.rndG(s+2),r4=this.rnd(s+3),r5=this.rnd(s+4),r6=this.rnd(s+5);
    const v=vb*(.7+Math.abs(r1)*.8),tr=tb*r2*.6,dir=r3>0?1:-1,tc=o+(dir*v+tr);
    const rg=v*(.2+r4*.6),hm=rg*(.3+r5*.7),lm=rg*(.3+(1-r5)*.7);
    const c=+(tc+(r6-.5)*v*.1).toFixed(this.digits),op=+o.toFixed(this.digits);
    return {open:op,close:c,high:+Math.max(op,c,op+hm,c+hm).toFixed(this.digits),low:+Math.min(op,c,op-lm,c-lm).toFixed(this.digits),timestamp:t};
  }

  // — Pair key for Supabase candles table —
  getPairCollection(pair) { return (pair || this.currentPair).replace('/', '_'); }

  _onBecameMaster(pair) {
    if (pair !== this.currentPair) return;
    this._stopViewerListener();
    this._isViewerMode = false;
    console.log(`🎯 [Chart] ترقية إلى مدير لـ ${pair}`);
  }

  async switchPair(newPair) {
    if (newPair === this.currentPair) return;
    this._stopViewerListener();
    this.hideCandleControlPanel();
    this._switching = true;
    this.showSkeleton();
    this.currentPair = newPair;
    const cfg = PAIR_CONFIG[newPair] || PAIR_CONFIG['EUR/USD'];
    this.basePrice = cfg.basePrice; this.seed = cfg.seed;
    this.digits    = cfg.digits;    this.vb   = cfg.vb; this.tb = cfg.tb;

    const isMaster = window.masterManager ? await window.masterManager.claimMaster(newPair) : true;
    this.candles = []; this.currentCandle = null; this.markers = [];
    this.smin = null; this.smax = null; this._forcedCandles = {};
    await this.loadCandlesFromSupabase(newPair, isMaster);
    this._switching = false;
  }

  // ── Supabase candle loading ──
  async loadCandlesFromSupabase(pair = null, isMaster = true) {
    const targetPair = pair || this.currentPair;
    const pairKey    = this.getPairCollection(targetPair);

    try {
      const { data: rows, error } = await _supabase
        .from('candles')
        .select('*')
        .eq('pair', pairKey)
        .order('timestamp', { ascending: false })
        .limit(this.maxCandles);

      if (!error && rows && rows.length >= 10) {
        this.candles = rows.reverse().map(r => ({
          open: r.open, close: r.close, high: r.high, low: r.low, timestamp: Number(r.timestamp)
        }));
        this.currentPrice = this.candles[this.candles.length - 1].close;
      } else {
        const generated = [];
        let startP = this.basePrice;
        let startT = Math.floor(Date.now() / this.timeframe) * this.timeframe - 30 * this.timeframe;
        for (let i = 0; i < 30; i++) {
          const c = this.genCandle(startT, startP);
          generated.push(c); startP = c.close; startT += this.timeframe;
        }
        if (isMaster) await this._batchSaveCandles(pairKey, generated);
        this.candles      = generated;
        this.currentPrice = this.candles[this.candles.length - 1].close;
      }
      await this._fillAndSaveGaps(pairKey, isMaster);
    } catch(err) {
      console.error('loadCandlesFromSupabase:', err);
      this._initLocalFallback();
    }

    this._isViewerMode = !isMaster;
    this._afterCandlesLoaded();
    if (!this._realtimeStarted) this.startRealtime();
    if (!isMaster) this._startViewerListener(targetPair);
  }

  async _fillAndSaveGaps(pairKey, isMaster) {
    if (!this.candles.length) return;
    const lastCandle = this.candles[this.candles.length - 1];
    const now        = Date.now();
    const currentT0  = Math.floor(now / this.timeframe) * this.timeframe;
    let t = lastCandle.timestamp + this.timeframe, p = lastCandle.close;
    const gaps = [];
    while (t < currentT0 && gaps.length < 300) {
      const c = this.genCandle(t, p); gaps.push(c); p = c.close; t += this.timeframe;
    }
    if (gaps.length > 0) {
      this.candles.push(...gaps);
      if (this.candles.length > this.maxCandles) this.candles = this.candles.slice(-this.maxCandles);
      this.currentPrice = this.candles[this.candles.length - 1].close;
      if (isMaster) await this._batchSaveCandles(pairKey, gaps);
      console.log(`📊 [Gap-Fill] ${pairKey}: +${gaps.length} شمعة`);
    }
  }

  async _batchSaveCandles(pairKey, candles) {
    if (!candles || !candles.length) return;
    const rows = candles.map(c => ({ pair: pairKey, timestamp: c.timestamp, open: c.open, close: c.close, high: c.high, low: c.low }));
    const chunks = [];
    for (let i = 0; i < rows.length; i += 500) chunks.push(rows.slice(i, i + 500));
    for (const chunk of chunks) {
      try {
        await _supabase.from('candles').upsert(chunk, { onConflict: 'pair,timestamp' });
      } catch(err) { console.warn('_batchSaveCandles:', err); }
    }
  }

  _initLocalFallback() {
    let p = this.basePrice, t = Date.now() - 30 * this.timeframe;
    for (let i = 0; i < 30; i++) {
      const c = this.genCandle(t, p); this.candles.push(c); p = c.close; t += this.timeframe;
    }
    this.currentPrice = this.candles[this.candles.length - 1].close;
  }

  saveCandleToSupabase(candle, pair = null) {
    const targetPair = pair || this.currentPair;
    if (window.masterManager && !window.masterManager.isMaster(targetPair)) return;
    const pairKey = this.getPairCollection(targetPair);
    _supabase.from('candles').upsert({
      pair: pairKey, timestamp: candle.timestamp,
      open: candle.open, close: candle.close, high: candle.high, low: candle.low
    }, { onConflict: 'pair,timestamp' }).catch(err => console.warn('saveCandleToSupabase:', err));
  }

  _startViewerListener(pair) {
    this._stopViewerListener();
    if (!window.masterManager) return;
    const liveKey = window.masterManager._liveKey(pair);
    const ch = _supabase
      .channel('viewer-' + pair.replace('/', '_'))
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'chart_control',
        filter: `id=eq.${liveKey}`
      }, payload => {
        if (this._switching) return;
        if (window.masterManager && window.masterManager.isMaster(pair)) return;
        const d = payload.new;
        if (d && d.pair === pair && d.candle) this._applyRemoteCandle(d.candle);
      })
      .subscribe();
    this._viewerUnsub = () => _supabase.removeChannel(ch);
  }

  _stopViewerListener() {
    if (this._viewerUnsub) { this._viewerUnsub(); this._viewerUnsub = null; }
  }

  _applyRemoteCandle(remote) {
    if (!remote) return;
    if (this.currentCandle && this.currentCandle.timestamp !== remote.timestamp) {
      const prev = { ...this.currentCandle };
      const last = this.candles[this.candles.length - 1];
      if (!last || last.timestamp !== prev.timestamp) {
        this.candles.push(prev);
        if (this.candles.length > this.maxCandles) this.candles.shift();
      }
    }
    this.currentCandle = { ...remote };
    this.currentPrice  = remote.close;
    this.t0            = remote.timestamp;
  }

  _afterCandlesLoaded() {
    this.hideSkeleton();
    if (!this.currentCandle && this.candles.length) {
      const last   = this.candles[this.candles.length - 1];
      const now    = Date.now();
      const t0now  = Math.floor(now / this.timeframe) * this.timeframe;
      this.currentCandle = { open: last.close, close: last.close, high: last.close, low: last.close, timestamp: t0now };
      this.currentPrice  = last.close;
    }
    this.t0 = Math.floor(Date.now() / this.timeframe) * this.timeframe;
    this.snapToLive(); this.updateTimeLabels(); this.updatePriceRange();
    this.smin = this.priceRange.min; this.smax = this.priceRange.max;
    this.updatePriceScale(); this.updatePriceLabel();
  }

  // — Pan / Zoom helpers —
  getSpacing()    { return this.baseSpacing * this.zoom; }
  getCandleWidth(){ return this.getSpacing() * .8; }
  getMinOffset()  { return this.w / 2 - this.candles.length * this.getSpacing(); }
  getMaxOffset()  { return this.w / 2; }
  getIndexForCandleTimestamp(ts) {
    if (ts === undefined || ts === null) return null;
    if (this.currentCandle && this.currentCandle.timestamp === ts) return this.candles.length;
    for (let i = 0; i < this.candles.length; i++) if (this.candles[i].timestamp === ts) return i;
    const tS = this.candles.length ? this.candles[0].timestamp : this.t0;
    let idx = Math.round((ts - tS) / this.timeframe);
    idx = Math.max(0, Math.min(idx, this.candles.length));
    return idx;
  }
  clampPan() {
    const mn = this.getMinOffset(), mx = this.getMaxOffset();
    this.targetOffsetX = Math.max(mn, Math.min(mx, this.targetOffsetX));
    this.offsetX       = Math.max(mn, Math.min(mx, this.offsetX));
  }
  snapToLive() { this.targetOffsetX = this.getMinOffset(); this.offsetX = this.targetOffsetX; this.velocity = 0; this.clampPan(); }
  updatePan() {
    const diff = this.targetOffsetX - this.offsetX;
    if (Math.abs(diff) > .003) this.offsetX += diff * this.panEase; else this.offsetX = this.targetOffsetX;
    if (Math.abs(this.velocity) > .01) { this.targetOffsetX += this.velocity; this.velocity *= .972; this.clampPan(); } else this.velocity = 0;
  }
  tickZoom() { const d = this.targetZoom - this.zoom; Math.abs(d) > .0001 ? this.zoom += d * this.zoomEase : this.zoom = this.targetZoom; }
  tickSR() {
    const r = this.priceRange;
    if (this.smin === null) { this.smin = r.min; this.smax = r.max; return; }
    this.smin += (r.min - this.smin) * this.sre; this.smax += (r.max - this.smax) * this.sre;
  }
  applyZoomAround(mx, my, sc) {
    const oz = this.targetZoom, nz = Math.max(this.minZoom, Math.min(this.maxZoom, oz * sc));
    if (Math.abs(nz - oz) < 1e-6) return;
    const idx = this.xToIndex(mx);
    this.targetZoom = nz; this.zoom = nz;
    const nx = mx - idx * this.getSpacing();
    this.targetOffsetX = nx; this.offsetX = nx;
    this.clampPan(); this.updateTimeLabels();
  }
  indexToX(i) { return this.offsetX + i * this.getSpacing(); }
  xToIndex(x) { return (x - this.offsetX) / this.getSpacing(); }
  getPriceRange() {
    const mn = this.smin !== null ? this.smin : this.priceRange.min;
    const mx = this.smax !== null ? this.smax : this.priceRange.max;
    return { min: mn, max: mx };
  }
  niceNum(v, rnd) {
    const e = Math.floor(Math.log10(v)), p = Math.pow(10, e), f = v / p; let nf;
    if (rnd) { if (f<1.5)nf=1;else if(f<3)nf=2;else if(f<7)nf=5;else nf=10; }
    else     { if (f<=1)nf=1;else if(f<=2)nf=2;else if(f<=5)nf=5;else nf=10; }
    return nf * p;
  }
  calcNiceGrid() {
    const r = this.getPriceRange(), rng = r.max - r.min, d = this.niceNum(rng / 7, 0);
    const g0 = Math.floor(r.min / d) * d, g1 = Math.ceil(r.max / d) * d;
    return { min: g0, max: g1, step: d, count: Math.round((g1 - g0) / d) };
  }

  // — Draw —
  drawGrid() {
    const { min, max, step, count } = this.calcNiceGrid();
    for (let i = 0; i <= count; i++) {
      const p = min + i * step, y = this.priceToY(p);
      if (y < -5 || y > this.h + 5) continue;
      const mj = i % 5 === 0;
      this.ctx.strokeStyle = mj ? 'rgba(255,215,0,.12)' : 'rgba(255,255,255,.05)';
      this.ctx.lineWidth   = mj ? 1 : .8;
      this.ctx.beginPath(); this.ctx.moveTo(0, y + .5); this.ctx.lineTo(this.w, y + .5); this.ctx.stroke();
    }
    const visC = this.w / this.getSpacing(), targetL = 9;
    const stepC = Math.max(1, Math.round(visC / targetL));
    const s = Math.floor(this.xToIndex(0)), e = Math.ceil(this.xToIndex(this.w));
    for (let i = s; i <= e; i++) {
      if (i % stepC !== 0) continue;
      const x = this.indexToX(i);
      if (x < -5 || x > this.w + 5) continue;
      const mj = i % Math.round(stepC * 5) === 0;
      this.ctx.strokeStyle = mj ? 'rgba(255,215,0,.12)' : 'rgba(255,255,255,.05)';
      this.ctx.lineWidth   = mj ? 1 : .8;
      this.ctx.beginPath(); this.ctx.moveTo(x + .5, 0); this.ctx.lineTo(x + .5, this.h); this.ctx.stroke();
    }
  }
  updateTimeLabels() {
    const tl = this.timeLabels; tl.innerHTML = '';
    const visC = this.w / this.getSpacing(), targetL = 9, stepC = Math.max(1, Math.round(visC / targetL));
    const s = Math.floor(this.xToIndex(0)), e = Math.ceil(this.xToIndex(this.w));
    const tS = this.candles.length ? this.candles[0].timestamp : this.t0;
    for (let i = s; i <= e; i++) {
      if (i % stepC !== 0) continue;
      const x = this.indexToX(i);
      if (x < 5 || x > this.w - 5) continue;
      const t = tS + i * this.timeframe, d = new Date(t);
      const hh = String(d.getHours()).padStart(2, '0'), mm = String(d.getMinutes()).padStart(2, '0');
      const lb = document.createElement('div'); lb.className = 'timeLabel';
      if (i % Math.round(stepC * 5) === 0) lb.classList.add('major');
      lb.style.left = x + 'px'; lb.textContent = `${hh}:${mm}`; tl.appendChild(lb);
    }
  }
  updatePriceScale() {
    const { min, step, count } = this.calcNiceGrid(); let h = '';
    for (let i = 0; i <= count; i++) {
      const p = min + i * step, y = this.priceToY(p);
      if (y < -8 || y > this.h + 8) continue;
      const mj = i % 5 === 0;
      h += `<div class="pLabel${mj?' major':''}" style="top:${y}px">${p.toFixed(this.digits)}</div>`;
    }
    this.priceScaleLabels.innerHTML = h;
  }
  updatePriceLabel() {
    const py = this.priceToY(this.currentPrice);
    this.priceLine.style.top      = py + 'px';
    this.currentPriceEl.style.top = py + 'px';
    this.currentPriceEl.textContent = this.currentPrice.toFixed(this.digits);
  }
  updateCandleTimer() {
    if (!this.currentCandle) return;
    const n = Date.now(), e = n - this.t0, r = this.timeframe - e, s = Math.floor(r / 1e3);
    this.candleTimer.textContent  = s >= 0 ? s : 0;
    this.candleTimer.style.left   = this.indexToX(this.candles.length) + 15 + 'px';
    this.candleTimer.style.top    = '10px';
    this.candleTimer.style.display = 'block';
  }
  priceToY(p) {
    const r = this.getPriceRange(), n = (p - r.min) / (r.max - r.min);
    return this.h * (1 - n);
  }
  drawCandle(c, x, glow) {
    const oy = this.priceToY(c.open), cy = this.priceToY(c.close);
    const hy = this.priceToY(c.high), ly = this.priceToY(c.low);
    const b = c.close >= c.open, w = this.getCandleWidth();
    this.ctx.strokeStyle = b ? '#0f0' : '#f00';
    this.ctx.lineWidth   = Math.max(1, .18 * w);
    this.ctx.beginPath(); this.ctx.moveTo(x, hy); this.ctx.lineTo(x, ly); this.ctx.stroke();
    const bh = Math.max(1, Math.abs(cy - oy)), bt = Math.min(oy, cy);
    const g = this.ctx.createLinearGradient(x, bt, x, bt + bh);
    b ? (g.addColorStop(0,'#0f0'),g.addColorStop(.5,'#0f0'),g.addColorStop(1,'#0c0'))
      : (g.addColorStop(0,'#f00'),g.addColorStop(.5,'#f00'),g.addColorStop(1,'#c00'));
    this.ctx.fillStyle = g;
    if (glow) { this.ctx.shadowColor = b ? 'rgba(0,255,0,.8)' : 'rgba(255,0,0,.8)'; this.ctx.shadowBlur = 12; }
    this.ctx.fillRect(x - w / 2, bt, w, bh);
    if (glow) this.ctx.shadowBlur = 0;
  }
  addMarker(t, tradeData = null) {
    const c = this.currentCandle; if (!c) return null;
    let fp;
    if (tradeData && tradeData.markerPrice !== undefined) fp = tradeData.markerPrice;
    else {
      const bt = Math.max(c.open, c.close), bb = Math.min(c.open, c.close), op = this.currentPrice;
      fp = op; if (op > bt) fp = bt; else if (op < bb) fp = bb;
    }
    const marker = {
      type: t, ts: tradeData ? (tradeData.startTime || Date.now()) : Date.now(), price: fp,
      candleIndex: tradeData && tradeData.candleIndex !== undefined ? tradeData.candleIndex : this.candles.length,
      candleTimestamp: tradeData && tradeData.candleTimestamp !== undefined ? tradeData.candleTimestamp : c.timestamp,
      tradeId: tradeData ? tradeData.id : null, endTime: tradeData ? tradeData.endTime : null,
      status: tradeData ? (tradeData.status || 'active') : null, closePrice: null, duration: tradeData ? tradeData.duration : null
    };
    this.markers.push(marker); return marker;
  }
  addMarkerForTrade(type, trade) { return this.addMarker(type, trade); }
  addMarkerFromTrade(trade) {
    const candleTs = (trade.candleTimestamp !== undefined && trade.candleTimestamp !== null)
      ? trade.candleTimestamp
      : Math.floor((trade.startTime || Date.now()) / this.timeframe) * this.timeframe;
    const idx = this.getIndexForCandleTimestamp(candleTs);
    const markerPrice = (trade.markerPrice !== undefined && trade.markerPrice !== null) ? trade.markerPrice : trade.entryPrice;
    this.markers.push({
      type: trade.type, ts: trade.startTime, price: markerPrice,
      candleIndex: idx !== null ? idx : (trade.candleIndex || 0), candleTimestamp: candleTs,
      tradeId: trade.id, endTime: trade.endTime, status: trade.status || 'active',
      closePrice: trade.closePrice, duration: trade.duration
    });
  }
  removeMarkerByTradeId(tradeId) { this.markers = this.markers.filter(mk => mk.tradeId !== tradeId); }
  clearAllTradeMarkers()         { this.markers = []; }
  drawMarker(m) {
    let actualIdx = this.getIndexForCandleTimestamp(m.candleTimestamp);
    if (actualIdx === null || actualIdx === undefined) actualIdx = (m.candleIndex !== undefined && m.candleIndex !== null) ? m.candleIndex : this.candles.length;
    const x = this.indexToX(actualIdx); if (x < -200 || x > this.w + 50) return;
    const y = this.priceToY(m.price), cw = this.getCandleWidth();
    const ib = m.type === 'buy', cl = ib ? '#16a34a' : '#ff3b3b', r = 5.5;
    this.ctx.save();
    this.ctx.shadowColor = cl; this.ctx.shadowBlur = 9; this.ctx.fillStyle = cl;
    this.ctx.beginPath(); this.ctx.arc(x, y, r, 0, 2 * Math.PI); this.ctx.fill();
    this.ctx.shadowBlur = 0; this.ctx.fillStyle = '#fff';
    this.ctx.save(); this.ctx.translate(x, y); if (!ib) this.ctx.rotate(Math.PI);
    this.ctx.beginPath();
    this.ctx.moveTo(0,-2.8); this.ctx.lineTo(-2,.8); this.ctx.lineTo(-.65,.8);
    this.ctx.lineTo(-.65,2.8); this.ctx.lineTo(.65,2.8); this.ctx.lineTo(.65,.8);
    this.ctx.lineTo(2,.8); this.ctx.closePath(); this.ctx.fill(); this.ctx.restore();
    const lx = x + cw / 2 + 3; let lw;
    if (m.duration) { const cForTrade = (m.duration * 1000) / this.timeframe; lw = Math.min(Math.max(cForTrade * this.getSpacing(), 55), Math.max(this.w - lx - 18, 55)); }
    else lw = Math.min(95, this.w - lx - 22);
    const lineColor = ib ? 'rgba(22,163,74,.65)' : 'rgba(255,59,59,.65)';
    this.ctx.strokeStyle = lineColor; this.ctx.lineWidth = 1.2;
    this.ctx.beginPath(); this.ctx.moveTo(x + cw / 2, y); this.ctx.lineTo(lx, y); this.ctx.stroke();
    this.ctx.setLineDash([4,3]);
    this.ctx.beginPath(); this.ctx.moveTo(lx, y); this.ctx.lineTo(lx + lw, y); this.ctx.stroke();
    this.ctx.setLineDash([]); this.ctx.restore();
  }
  draw() {
    this.tickZoom(); this.updatePan(); this.updatePriceRange(); this.tickSR();
    this.ctx.clearRect(0, 0, this.w, this.h); this.drawGrid();
    for (let i = 0; i < this.candles.length; i++) {
      const x = this.indexToX(i); if (x < -60 || x > this.w + 60) continue;
      this.drawCandle(this.candles[i], x, 0);
    }
    if (this.currentCandle && (!this.candles.length || this.currentCandle.timestamp !== this.candles[this.candles.length - 1].timestamp)) {
      const lx = this.indexToX(this.candles.length);
      if (lx >= -60 && lx <= this.w + 60) this.drawCandle(this.currentCandle, lx, 1);
    }
    for (const mk of this.markers) this.drawMarker(mk);
    if (++this._fr % 2 === 0) { this.updatePriceScale(); this.updateTimeLabels(); }
    this.updatePriceLabel(); this.updateCandleTimer();
  }
  stepTowards(c, t, m) { const d = t - c; return Math.abs(d) <= m ? t : c + Math.sign(d) * m; }
  updateCurrentCandle() {
    const vb = this.vb || 8e-4;
    if (!this.currentCandle) {
      const lp = this.candles.length ? this.candles[this.candles.length - 1].close : this.currentPrice;
      this.currentCandle = this.genCandle(this.t0, lp);
      this.currentCandle.close = lp;
      this.currentCandle.high  = Math.max(this.currentCandle.open, this.currentCandle.close);
      this.currentCandle.low   = Math.min(this.currentCandle.open, this.currentCandle.close);
      return;
    }
    const n = Date.now(), r = this.rnd(this.seed + n), dir = (r - .5) * vb * 0.5;
    const tgt = this.currentCandle.close + dir, ms = vb * .18;
    let nc = +this.stepTowards(this.currentCandle.close, tgt, ms).toFixed(this.digits);
    const forced = this._forcedCandles[this.t0];
    if (forced && window.masterManager && window.masterManager.isMaster(this.currentPair)) {
      const elapsed = n - this.t0, progress = Math.min(1, elapsed / this.timeframe);
      if (progress >= 0.60 && progress < 0.95) {
        const strength = Math.pow((progress - 0.60) / 0.35, 1.8);
        const open = this.currentCandle.open, margin = vb * 0.40;
        const target = forced === 'up' ? open + margin : open - margin;
        nc = +(nc + (target - nc) * strength * 0.50).toFixed(this.digits);
      }
      if (progress >= 0.95) {
        const open = this.currentCandle.open;
        const minMargin = Math.max((this.tb || 5e-5) * 4, vb * 0.05);
        if (forced === 'up'   && nc <= open) nc = +(open + minMargin).toFixed(this.digits);
        if (forced === 'down' && nc >= open) nc = +(open - minMargin).toFixed(this.digits);
      }
    }
    this.currentCandle.close = nc;
    this.currentCandle.high  = +Math.max(this.currentCandle.high, nc).toFixed(this.digits);
    this.currentCandle.low   = +Math.min(this.currentCandle.low,  nc).toFixed(this.digits);
    this.currentPrice = nc;
  }
  startRealtime() {
    if (this._realtimeStarted) return;
    this._realtimeStarted = true;
    const MAX_CATCHUP = 20;
    setInterval(() => {
      if (this._switching || this._isViewerMode) return;
      const now = Date.now();
      if (!this.currentCandle) {
        const lastClose = this.candles.length ? this.candles[this.candles.length - 1].close : this.currentPrice;
        this.t0 = Math.floor(now / this.timeframe) * this.timeframe;
        this.currentCandle = { open: lastClose, close: lastClose, high: lastClose, low: lastClose, timestamp: this.t0 };
        this.currentPrice  = lastClose;
      }
      let catchupCount = 0;
      while ((now - this.t0) >= this.timeframe && catchupCount < MAX_CATCHUP) {
        const closedCandle = { ...this.currentCandle };
        if (!this.candles.length || this.candles[this.candles.length - 1].timestamp !== closedCandle.timestamp) {
          this.candles.push(closedCandle);
          if (this.candles.length > this.maxCandles) this.candles.shift();
        }
        if (this._forcedCandles[closedCandle.timestamp]) delete this._forcedCandles[closedCandle.timestamp];
        this.saveCandleToSupabase(closedCandle, this.currentPair);
        if (window.masterManager && window.masterManager.isMaster(this.currentPair))
          window.masterManager.broadcastLiveCandle({ ...closedCandle }, this.currentPair);
        this.t0 += this.timeframe;
        const lp = closedCandle.close;
        this.currentCandle = { open: lp, close: lp, high: lp, low: lp, timestamp: this.t0 };
        this.currentPrice  = lp;
        if (window.masterManager && window.masterManager.isMaster(this.currentPair))
          window.masterManager.broadcastLiveCandle({ ...this.currentCandle }, this.currentPair);
        catchupCount++;
      }
      this.updateCurrentCandle();
      if (this.currentCandle && window.masterManager && window.masterManager.isMaster(this.currentPair))
        window.masterManager.broadcastLiveCandle({ ...this.currentCandle }, this.currentPair);
    }, 200);
  }
  updatePriceRange() {
    let v = [...this.candles];
    this.currentCandle && (!v.length || this.currentCandle.timestamp !== v[v.length-1].timestamp) && v.push(this.currentCandle);
    if (!v.length) { this.priceRange = { min: .95 * this.basePrice, max: 1.05 * this.basePrice }; return; }
    const si = Math.floor(this.xToIndex(0)), ei = Math.ceil(this.xToIndex(this.w));
    const sl = v.slice(Math.max(0, si - 5), Math.min(v.length, ei + 5));
    if (!sl.length) { this.priceRange = { min: .95 * this.basePrice, max: 1.05 * this.basePrice }; return; }
    const mn = Math.min(...sl.map(c => c.low)), mx = Math.max(...sl.map(c => c.high));
    const pd = .15 * (mx - mn) || 1e-9;
    this.priceRange = { min: mn - pd, max: mx + pd };
  }
  initEvents() {
    addEventListener('resize', () => this.setup());
    this.canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const r = this.canvas.getBoundingClientRect();
      this.applyZoomAround(e.clientX - r.left, e.clientY - r.top, e.deltaY > 0 ? 1/1.1 : 1.1);
    }, { passive: false });
    const md = (x,t) => { this.drag=1;this.dragStartX=x;this.dragStartOffset=this.targetOffsetX;this.velocity=0;this.lastDragX=x;this.lastDragTime=t; };
    const mm = (x,t) => { if(this.drag){const d=x-this.dragStartX;this.targetOffsetX=this.dragStartOffset+d;this.clampPan();const dt=t-this.lastDragTime;if(dt>0&&dt<80)this.velocity=(x-this.lastDragX)/dt*26;this.lastDragX=x;this.lastDragTime=t;} };
    const mu = () => { this.drag=0;this.updateTimeLabels(); };
    this.canvas.addEventListener('mousedown', e => { const r=this.canvas.getBoundingClientRect();md(e.clientX-r.left,Date.now()); });
    addEventListener('mousemove', e => { const r=this.canvas.getBoundingClientRect();mm(e.clientX-r.left,Date.now()); });
    addEventListener('mouseup', mu);
    const db2 = (a,b) => Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY);
    this.canvas.addEventListener('touchstart', e => {
      const r=this.canvas.getBoundingClientRect();
      if(e.touches.length===1) md(e.touches[0].clientX-r.left,Date.now());
      else if(e.touches.length===2){this.drag=0;this.pinch=1;this.p0=db2(e.touches[0],e.touches[1]);this.pMidX=(e.touches[0].clientX+e.touches[1].clientX)/2-r.left;this.pMidY=(e.touches[0].clientY+e.touches[1].clientY)/2-r.top;}
    }, { passive: false });
    this.canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      const r=this.canvas.getBoundingClientRect();
      if(this.pinch&&e.touches.length===2){const d=db2(e.touches[0],e.touches[1]);if(this.p0>0){const sc=Math.max(.2,Math.min(5,d/(this.p0||d)));this.applyZoomAround(this.pMidX,this.pMidY,sc);}this.p0=d;}
      else if(!this.pinch&&e.touches.length===1) mm(e.touches[0].clientX-r.left,Date.now());
    }, { passive: false });
    this.canvas.addEventListener('touchend', e => { e.touches.length<2&&(this.pinch=0,this.p0=0);e.touches.length===0&&mu(); }, { passive: false });
    this.canvas.addEventListener('touchcancel', () => { this.pinch=0;this.p0=0;mu(); }, { passive: false });
  }
  loop() { this.draw(); requestAnimationFrame(() => this.loop()); }
}

// ══════════════════════════════════════════════════════════════════════════
//  19. تهيئة النظام
// ══════════════════════════════════════════════════════════════════════════
window.chart         = new AdvancedTradingChart();
window.masterManager = new ChartMasterManager();

async function initChartSystem() {
  try {
    const isMaster = await window.masterManager.claimMaster(window.chart.currentPair);
    await window.chart.loadCandlesFromSupabase(null, isMaster);
    console.log(`✅ Chart ready | ${isMaster ? '🎯 Master' : '👁️ Viewer'} | ${window.chart.currentPair}`);
  } catch(err) {
    console.error('initChartSystem error:', err);
    await window.chart.loadCandlesFromSupabase(null, true);
  }
}
initChartSystem();
loadActiveTrades();

// ══════════════════════════════════════════════════════════════════════════
//  20. Long-press على BUY (10 ثوانٍ) → لوحة التحكم بالشمعة
// ══════════════════════════════════════════════════════════════════════════
(function() {
  const buyBtn = document.getElementById('buyBtn');
  if (!buyBtn) return;
  let _lpTimer = null, _lpStart = 0;
  const HOLD_MS = 10000;

  function _injectLPStyle() {
    if (document.getElementById('_lpCSS')) return;
    const s = document.createElement('style'); s.id = '_lpCSS';
    s.textContent = `#_lpBar{position:absolute;bottom:0;left:0;height:3px;width:0%;background:linear-gradient(90deg,#ffd700,#ff8c00);border-radius:0 0 6px 6px;transition:none;pointer-events:none;}`;
    document.head.appendChild(s);
  }
  function _createBar() {
    _injectLPStyle();
    if (document.getElementById('_lpBar')) return;
    if (getComputedStyle(buyBtn).position === 'static') buyBtn.style.position = 'relative';
    const bar = document.createElement('div'); bar.id = '_lpBar'; buyBtn.appendChild(bar);
  }
  function _startBar() {
    _createBar();
    const bar = document.getElementById('_lpBar');
    if (bar) { bar.style.transition = 'none'; bar.style.width = '0%'; requestAnimationFrame(() => { bar.style.transition = `width ${HOLD_MS}ms linear`; bar.style.width = '100%'; }); }
  }
  function _stopBar() { const bar = document.getElementById('_lpBar'); if (bar) { bar.style.transition = 'none'; bar.style.width = '0%'; } }
  function _cancel() { if (_lpTimer) { clearTimeout(_lpTimer); _lpTimer = null; } _stopBar(); }
  function _start()  {
    _lpStart = Date.now(); _startBar();
    _lpTimer = setTimeout(() => { _lpTimer = null; _stopBar(); if (window.chart) window.chart.showCandleControlPanel(); }, HOLD_MS);
  }

  buyBtn.addEventListener('click', e => { if (Date.now() - _lpStart >= HOLD_MS - 50) e.stopImmediatePropagation(); }, true);
  buyBtn.addEventListener('mousedown',   _start);
  buyBtn.addEventListener('mouseup',     _cancel);
  buyBtn.addEventListener('mouseleave',  _cancel);
  buyBtn.addEventListener('touchstart',  e => _start(e), { passive: true });
  buyBtn.addEventListener('touchend',    _cancel, { passive: true });
  buyBtn.addEventListener('touchcancel', _cancel, { passive: true });
})();

// ══════════════════════════════════════════════════════════════════════════
//  21. مُختار الوقت + مُختار المبلغ
// ══════════════════════════════════════════════════════════════════════════
const timeSelector    = document.getElementById('timeSelector');
const timeDropdown    = document.getElementById('timeDropdown');
const timeDisplay     = document.getElementById('timeDisplay');
const tabCompensation = document.getElementById('tabCompensation');
const tabCustom       = document.getElementById('tabCustom');
const compensationList= document.getElementById('compensationList');
const amountDisplay   = document.getElementById('amountDisplay');
const amountContainer = document.getElementById('amountContainer');

let isEditingTime = false, savedTimeValue = '00:05';

timeSelector.addEventListener('click', e => { e.stopPropagation(); if (!isEditingTime) timeDropdown.classList.toggle('show'); });
document.addEventListener('click', () => { timeDropdown.classList.remove('show'); if (isEditingTime) { timeDisplay.textContent = savedTimeValue; isEditingTime = false; } });
timeDropdown.addEventListener('click', e => e.stopPropagation());

tabCompensation.addEventListener('click', () => {
  tabCompensation.classList.add('active'); tabCustom.classList.remove('active');
  compensationList.style.display = 'grid';
  if (isEditingTime) { timeDisplay.textContent = savedTimeValue; isEditingTime = false; }
});
tabCustom.addEventListener('click', () => {
  tabCustom.classList.add('active'); tabCompensation.classList.remove('active');
  compensationList.style.display = 'none'; timeDisplay.textContent = ''; isEditingTime = true;
  setTimeout(() => timeDisplay.focus(), 50);
});
compensationList.addEventListener('click', e => {
  if (e.target.classList.contains('dropdown-item')) {
    savedTimeValue = e.target.textContent;
    timeDisplay.textContent = savedTimeValue;
    chart.selectedTime = parseInt(e.target.getAttribute('data-sec'));
    timeDropdown.classList.remove('show');
  }
});
timeDisplay.addEventListener('input', e => {
  if (isEditingTime) { let v = e.target.textContent.replace(/[^0-9]/g,''); if (v.length > 4) v = v.slice(0,4); e.target.textContent = v; }
});
timeDisplay.addEventListener('blur', () => {
  if (isEditingTime) {
    let v = timeDisplay.textContent.replace(/[^0-9]/g,'');
    if (v.length === 0) v = '0005';
    v = v.padStart(4,'0');
    savedTimeValue = `${v.slice(0,2)}:${v.slice(2,4)}`;
    timeDisplay.textContent = savedTimeValue; isEditingTime = false;
  }
});

amountContainer.addEventListener('click', () => amountDisplay.focus());
amountDisplay.addEventListener('focus', function() { let v = this.value.replace('$',''); this.value = v; setTimeout(() => this.setSelectionRange(0, this.value.length), 10); });
amountDisplay.addEventListener('input', function() { this.value = this.value.replace(/[^0-9]/g,''); });
amountDisplay.addEventListener('blur',  function() { let val = parseFloat(this.value) || 50; this.value = val + '$'; });
amountDisplay.addEventListener('keydown', function(e) { if (e.key === 'Enter') { e.preventDefault(); this.blur(); } });

// ══════════════════════════════════════════════════════════════════════════
//  22. أزرار Buy/Sell
// ══════════════════════════════════════════════════════════════════════════
document.getElementById('buyBtn').addEventListener('click',  () => openTrade('buy'));
document.getElementById('sellBtn').addEventListener('click', () => openTrade('sell'));

// ══════════════════════════════════════════════════════════════════════════
//  23. لوحة السجل (History Panel)
// ══════════════════════════════════════════════════════════════════════════
function openHistoryPanel()  {
  document.getElementById('historyPanel').classList.add('show');
  document.getElementById('navHistory').classList.add('active');
  document.getElementById('navChart').classList.remove('active');
  loadHistory();
}
function closeHistoryPanel() {
  document.getElementById('historyPanel').classList.remove('show');
  document.getElementById('navHistory').classList.remove('active');
  document.getElementById('navChart').classList.add('active');
}

document.getElementById('navHistory').addEventListener('click',    openHistoryPanel);
document.getElementById('historyNavBtn').addEventListener('click', openHistoryPanel);
document.getElementById('historyCloseBtn').addEventListener('click', closeHistoryPanel);

document.querySelectorAll('#historyPanel .htab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#historyPanel .htab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadHistory();
  });
});
