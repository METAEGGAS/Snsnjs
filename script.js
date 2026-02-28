/* ════════════════════════════════════════════════════════════════
   FIREBASE INIT  –  QT Real Trading
   ════════════════════════════════════════════════════════════════ */
const firebaseConfig = {
    apiKey: "AIzaSyBOUqLixfphg3b8hajc4hkwV-VJmldGBVw",
    authDomain: "randers-c640b.firebaseapp.com",
    projectId: "randers-c640b",
    storageBucket: "randers-c640b.firebasestorage.app",
    messagingSenderId: "391496092929",
    appId: "1:391496092929:web:58208b4eb3e6f9a8571f00",
    measurementId: "G-DBDSVVF7PS"
};
firebase.initializeApp(firebaseConfig);
const db   = firebase.firestore();
const auth = firebase.auth();

/* ════════════════════════════════════════════════════════════════
   ★ PAIR CONFIG
   ════════════════════════════════════════════════════════════════ */
const PAIR_CONFIG = {
    'EUR/USD': { basePrice: 1.08540, seed: 11001, digits: 5, vb: 8e-4,  tb: 5e-5  },
    'AUD/CAD': { basePrice: 0.89520, seed: 22002, digits: 5, vb: 7e-4,  tb: 4e-5  },
    'AUD/CHF': { basePrice: 0.57480, seed: 33003, digits: 5, vb: 6e-4,  tb: 4e-5  },
    'USD/CHF': { basePrice: 0.90520, seed: 44004, digits: 5, vb: 7e-4,  tb: 4e-5  },
    'EUR/RUB': { basePrice: 95.5000, seed: 55005, digits: 3, vb: 0.08,  tb: 5e-3  },
    'AED/CNY': { basePrice: 1.95300, seed: 66006, digits: 5, vb: 8e-4,  tb: 5e-5  },
    'BHD/CNY': { basePrice: 18.5400, seed: 77007, digits: 4, vb: 0.015, tb: 1e-3  },
    'KES/USD': { basePrice: 0.00771, seed: 88008, digits: 6, vb: 5e-5,  tb: 3e-6  },
    'LBP/USD': { basePrice: 0.000067,seed: 99009, digits: 7, vb: 5e-7,  tb: 3e-8  },
    'QAR/CNY': { basePrice: 1.97200, seed: 10010, digits: 5, vb: 8e-4,  tb: 5e-5  },
    'SYP/TRY': { basePrice: 0.000950,seed: 21021, digits: 6, vb: 5e-6,  tb: 3e-7  },
    'EGP/USD': { basePrice: 0.020500,seed: 32032, digits: 6, vb: 1e-4,  tb: 6e-6  },
    'USD/INR': { basePrice: 83.5200, seed: 43043, digits: 4, vb: 0.07,  tb: 4e-3  }
};

/* ════════════════════════════════════════════════════════════════
   ★ ACCOUNT MANAGER
   ════════════════════════════════════════════════════════════════ */

window._curAcc      = localStorage.getItem('_curAcc') || 'demo';
window._demoBalance = 10000;
window._realBalance = 0;

let _uid      = null;
let _userUnsub = null;

const _fmtBal = v =>
    '$' + Number(v).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ★ مرجع صفقات المستخدم (لكل مستخدم لوحده) */
function getTradesRef() {
    if (!_uid) return null;
    return db.collection('users').doc(_uid).collection('trades');
}

/* ── تحديث واجهة الرصيد بالكامل ── */
function refreshUI() {
    const ac  = window._curAcc;
    const cur = ac === 'demo' ? window._demoBalance : window._realBalance;

    const el = id => document.getElementById(id);

    if (el('balanceAmount')) el('balanceAmount').textContent = _fmtBal(cur);
    if (el('demoAmt'))       el('demoAmt').textContent       = _fmtBal(window._demoBalance);
    if (el('realAmt'))       el('realAmt').textContent       = _fmtBal(window._realBalance);

    if (el('circleDemo')) el('circleDemo').classList.toggle('sel', ac === 'demo');
    if (el('circleReal')) el('circleReal').classList.toggle('sel', ac === 'real');

    if (el('accItemDemo')) el('accItemDemo').classList.toggle('active', ac === 'demo');
    if (el('accItemReal')) el('accItemReal').classList.toggle('active', ac === 'real');

    if (el('topAccIcon')) el('topAccIcon').src = ac === 'demo'
        ? 'https://cdn-icons-png.flaticon.com/128/1344/1344761.png'
        : 'https://flagcdn.com/w40/us.png';

    if (el('refillRow')) el('refillRow').style.display = ac === 'demo' ? 'flex' : 'none';

    /* ★ إعادة تحميل السجل تلقائياً عند تبديل الحساب إذا كان لوح السجل مفتوحاً */
    const hp = document.getElementById('historyPanel');
    if (hp && hp.classList.contains('show')) loadHistory();
}

function setAvatar(url) {
    const logoImg = document.getElementById('topLogoImg');
    if (!logoImg) return;
    logoImg.src = (url && url.startsWith('http'))
        ? url
        : 'https://cdn-icons-png.flaticon.com/128/18921/18921105.png';
}

function updateBalanceDisplay() { refreshUI(); }

async function _initUserFields(userId) {
    const ref  = db.collection('users').doc(userId);
    const snap = await ref.get();
    const d    = snap.exists ? snap.data() : {};
    const up   = {};
    if (d.demoBalance === undefined) up.demoBalance = 10000;
    if (d.realBalance === undefined) up.realBalance = 0;
    if (d.avatar      === undefined) up.avatar      = '';
    if (d.email       === undefined) up.email       = '';
    if (Object.keys(up).length) await ref.set(up, { merge: true });
}

function _listenUser(userId) {
    if (_userUnsub) _userUnsub();
    _userUnsub = db.collection('users').doc(userId).onSnapshot(snap => {
        if (!snap.exists) return;
        const d = snap.data();
        if (typeof d.demoBalance === 'number') window._demoBalance = d.demoBalance;
        if (typeof d.realBalance === 'number') window._realBalance = d.realBalance;
        refreshUI();
        setAvatar(d.avatar || '');
    });
}

auth.onAuthStateChanged(async user => {
    if (user) {
        _uid = user.uid;
        await db.collection('users').doc(_uid).set(
            { email: user.email || '' }, { merge: true }
        );
        await _initUserFields(_uid);
        _listenUser(_uid);
        if (user.photoURL) setAvatar(user.photoURL);

        /* ★ تحميل صفقات المستخدم النشطة فور تسجيل الدخول */
        activeTrades = [];
        if (window.chart) window.chart.clearAllTradeMarkers();
        loadActiveTrades();

    } else {
        _uid = null;
        if (_userUnsub) { _userUnsub(); _userUnsub = null; }

        /* ★ تفريغ صفقات/Markers عند الخروج */
        activeTrades = [];
        if (window.chart) window.chart.clearAllTradeMarkers();

        window._demoBalance = 10000;
        window._realBalance = 0;
        refreshUI();
        setAvatar('');
    }
});

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
        showInfoToast(
            window._curAcc === 'demo'
                ? '✅ تم التبديل إلى الحساب التجريبي'
                : '✅ تم التبديل إلى الحساب الحقيقي'
        );
    });
}

const _refillBtn = document.getElementById('refillBtn');
if (_refillBtn) {
    _refillBtn.addEventListener('click', async e => {
        e.stopPropagation();
        if (!_uid) {
            showInfoToast('❌ لازم تسجّل دخول الأول', 'error');
            return;
        }
        window._demoBalance = 10000;
        refreshUI();
        try {
            await db.collection('users').doc(_uid).update({ demoBalance: 10000 });
            showInfoToast('✅ تم تعبئة الحساب التجريبي بـ $10,000');
        } catch (e) {
            console.warn('refill:', e);
        }
    });
}

document.addEventListener('click', e => {
    const buyB  = document.getElementById('buyBtn');
    const sellB = document.getElementById('sellBtn');
    if (e.target !== buyB && e.target !== sellB) return;
    const bal = window.getCurrentBalance();
    const amt = parseFloat(
        (document.getElementById('amountDisplay').value || '0').replace(/[^0-9.]/g, '')
    ) || 0;
    if (bal <= 0) {
        e.stopImmediatePropagation();
        showInfoToast('❌ الرصيد فارغ! قم بتعبئة الحساب أولاً', 'error');
        return;
    }
    if (amt > bal) {
        e.stopImmediatePropagation();
        showInfoToast('❌ المبلغ أكبر من رصيدك المتاح!', 'error');
    }
}, true);

window.getCurrentBalance = () =>
    window._curAcc === 'demo' ? window._demoBalance : window._realBalance;

window.getCurrentAccount = () => window._curAcc;

window.deductBalance = async amt => {
    if (window._curAcc === 'demo') window._demoBalance = Math.max(0, window._demoBalance - amt);
    else                           window._realBalance  = Math.max(0, window._realBalance  - amt);
    refreshUI();
    if (!_uid) return;
    const field = window._curAcc === 'demo' ? 'demoBalance' : 'realBalance';
    const val   = window._curAcc === 'demo' ? window._demoBalance : window._realBalance;
    try { await db.collection('users').doc(_uid).update({ [field]: val }); }
    catch (e) { console.warn('deductBalance:', e); }
};

window.addBalance = async amt => {
    if (window._curAcc === 'demo') window._demoBalance += amt;
    else                           window._realBalance  += amt;
    refreshUI();
    if (!_uid) return;
    const field = window._curAcc === 'demo' ? 'demoBalance' : 'realBalance';
    const val   = window._curAcc === 'demo' ? window._demoBalance : window._realBalance;
    try { await db.collection('users').doc(_uid).update({ [field]: val }); }
    catch (e) { console.warn('addBalance:', e); }
};

window.setUserAvatar = async url => {
    setAvatar(url);
    if (!_uid) return;
    try { await db.collection('users').doc(_uid).update({ avatar: url }); }
    catch (e) { console.warn('setUserAvatar:', e); }
};

refreshUI();

/* ════════════════════════════════════════════════════════════════
   TOAST NOTIFICATIONS
   ════════════════════════════════════════════════════════════════ */
let _infoTimer = null;
function showInfoToast(msg, type = 'info', dur = 3000) {
    const el = document.getElementById('infoToast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'info-toast show ' + type;
    if (_infoTimer) clearTimeout(_infoTimer);
    _infoTimer = setTimeout(() => el.classList.remove('show'), dur);
}

/* ★ بدل Result Toast الكبير: Overlay صغير جوه الشارت */
let _chartResTimer = null;
function showChartPnlOverlay(pnlStr, amount) {
    const plot = document.getElementById('plot');
    if (!plot) return;

    if (!document.getElementById('_chartPnlCSS')) {
        const s = document.createElement('style');
        s.id = '_chartPnlCSS';
        s.textContent = `
        #chartPnlOverlay{
            position:absolute;
            top:10px;
            left:10px;
            z-index:80;
            padding:6px 10px;
            border-radius:8px;
            background:rgba(0,0,0,.55);
            border:1px solid rgba(255,255,255,.10);
            color:#fff;
            font-size:11px;
            font-family:monospace;
            letter-spacing:.3px;
            opacity:0;
            transform:translateY(-6px);
            transition:opacity .25s ease, transform .25s ease;
            pointer-events:none;
            white-space:nowrap;
        }
        #chartPnlOverlay.show{
            opacity:1;
            transform:translateY(0);
        }`;
        document.head.appendChild(s);
    }

    let el = document.getElementById('chartPnlOverlay');
    if (!el) {
        el = document.createElement('div');
        el.id = 'chartPnlOverlay';
        plot.appendChild(el);
    }

    el.textContent = `${pnlStr}  |  رأس المال: $${amount.toFixed(2)}`;
    el.classList.add('show');

    if (_chartResTimer) clearTimeout(_chartResTimer);
    _chartResTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

/* (تم الإبقاء على الدالة القديمة بدون استخدام، فقط لتفادي أي ربط خارجي) */
let _resTimer = null;
function showResultToast(won, pnlStr, tradeType, entryPrice, closePrice) {
    // لم يعد يتم استخدام Toast نتيجة (حسب طلبك)
}

/* ════════════════════════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════════════════════════ */
function fmtCountdown(sec) {
    sec = Math.max(0, Math.floor(sec));
    if (sec >= 3600) {
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    } else if (sec >= 60) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
    return String(sec).padStart(2,'0') + 's';
}

function fmtDate(ts) {
    if (!ts) return '--';
    const d  = new Date(ts);
    const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو',
                    'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} • ` +
           `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

/* ════════════════════════════════════════════════════════════════
   ACTIVE TRADES STATE
   ════════════════════════════════════════════════════════════════ */
let activeTrades = [];

/* ════════════════════════════════════════════════════════════════
   OPEN TRADE
   ════════════════════════════════════════════════════════════════ */
async function openTrade(type) {
    /* ★ لازم يكون فيه مستخدم عشان كل واحد يبقى ليه صفقاته */
    if (!_uid) {
        return showInfoToast('❌ لازم تسجّل دخول عشان الصفقات تبقى خاصة بيك', 'error');
    }

    const raw    = document.getElementById('amountDisplay').value.replace(/[^0-9.]/g, '');
    const amount = parseFloat(raw) || 50;
    const bal    = window.getCurrentBalance();

    if (amount <= 0)  return showInfoToast('❌ مبلغ غير صالح', 'error');
    if (amount > bal) return showInfoToast('❌ رصيد غير كافٍ', 'error');
    if (!window.chart || !window.chart.currentCandle)
                      return showInfoToast('⏳ الرسم غير جاهز', 'error');

    const entryPrice = window.chart.currentPrice;
    const duration   = window.chart.selectedTime;
    const startTime  = Date.now();
    const endTime    = startTime + duration * 1000;

    const pairName = (window.chart.currentPair || 'EUR/USD') + ' OTC';

    const cc = window.chart.currentCandle;
    const candleTimestamp = cc ? cc.timestamp : Math.floor(startTime / window.chart.timeframe) * window.chart.timeframe;
    const candleIndex     = window.chart.candles.length;

    let markerPrice = entryPrice;
    if (cc) {
        const bt = Math.max(cc.open, cc.close);
        const bb = Math.min(cc.open, cc.close);
        if (markerPrice > bt) markerPrice = bt;
        else if (markerPrice < bb) markerPrice = bb;
    }

    await window.deductBalance(amount);

    const tradeData = {
        uid: _uid, /* ★ ربط الصفقة بالمستخدم */
        type, pair: pairName, entryPrice, amount,
        duration, startTime, endTime,
        status: 'active', closePrice: null, pnl: null,
        markerPrice: markerPrice,
        candleTimestamp: candleTimestamp,
        candleIndex: candleIndex,
        account: window._curAcc   /* ★ حقل الحساب (تجريبي/حقيقي) */
    };

    try {
        const tradesRef = getTradesRef();
        if (!tradesRef) throw new Error('No tradesRef (not logged in)');

        const ref   = await tradesRef.add({
            ...tradeData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        const trade = { ...tradeData, id: ref.id };
        activeTrades.push(trade);

        window.chart.addMarkerForTrade(type, trade);
        renderActiveTrades();

        const rem = Math.max(0, endTime - Date.now());
        setTimeout(() => closeTrade(trade), rem);

        const dir = type === 'buy' ? '↗ شراء' : '↘ بيع';
        showInfoToast(`${dir}  $${amount}  @  ${entryPrice.toFixed(5)}`, type, 2500);

    } catch (e) {
        await window.addBalance(amount);
        console.error('openTrade:', e);
        showInfoToast('❌ خطأ في فتح الصفقة', 'error');
    }
}

/* ════════════════════════════════════════════════════════════════
   CLOSE TRADE
   ════════════════════════════════════════════════════════════════ */
async function closeTrade(trade) {
    activeTrades = activeTrades.filter(t => t.id !== trade.id);

    const closePrice = window.chart ? window.chart.currentPrice : trade.entryPrice;
    const won        = trade.type === 'buy'
        ? closePrice > trade.entryPrice
        : closePrice < trade.entryPrice;

    const profit    = won ? +(trade.amount * 0.8).toFixed(2) : 0;
    const pnl       = won ? profit : -trade.amount;
    const newStatus = won ? 'won' : 'lost';

    if (won) await window.addBalance(trade.amount + profit);

    try {
        const tradesRef = getTradesRef();
        if (tradesRef) {
            await tradesRef.doc(trade.id).update({
                status: newStatus, closePrice, pnl,
                closedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    } catch (e) { console.warn('closeTrade update:', e); }

    /* ★ اختفاء Marker فور انتهاء الصفقة */
    if (window.chart) window.chart.removeMarkerByTradeId(trade.id);

    renderActiveTrades();

    /* ★ نص صغير داخل الشارت: الربح/الخسارة + رأس المال */
    const pnlStr = won ? `+$${profit.toFixed(2)}` : `-$${trade.amount.toFixed(2)}`;
    showChartPnlOverlay(pnlStr, trade.amount);

    const hp = document.getElementById('historyPanel');
    if (hp && hp.classList.contains('show')) loadHistory();
}

/* ════════════════════════════════════════════════════════════════
   LOAD ACTIVE TRADES ON STARTUP
   ════════════════════════════════════════════════════════════════ */
async function loadActiveTrades() {
    if (!_uid) return;
    const tradesRef = getTradesRef();
    if (!tradesRef) return;

    try {
        const snap = await tradesRef.where('status','==','active').get();
        const now  = Date.now();

        for (const d of snap.docs) {
            const trade = { id: d.id, ...d.data() };
            if (!trade.endTime) continue;

            if (trade.endTime <= now) {
                closeTrade(trade);
            } else {
                activeTrades.push(trade);
                if (window.chart) window.chart.addMarkerFromTrade(trade);
                setTimeout(() => closeTrade(trade), trade.endTime - now);
            }
        }
        renderActiveTrades();
    } catch (e) { console.warn('loadActiveTrades:', e); }
}

/* ════════════════════════════════════════════════════════════════
   ACTIVE TRADES UI
   ════════════════════════════════════════════════════════════════ */
function renderActiveTrades() {
    const panel = document.getElementById('activeTradesPanel');
    if (!panel) return;
    panel.innerHTML = '';
    panel.style.display = 'none';
}

setInterval(() => {
    const now = Date.now();
    for (const t of activeTrades) {
        const histTimerEl = document.getElementById(`histTimer-${t.id}`);
        if (histTimerEl) {
            const rem = Math.max(0, (t.endTime - now) / 1000);
            histTimerEl.textContent = '⏱ ' + fmtCountdown(rem);
        }
    }
}, 1000);

/* ════════════════════════════════════════════════════════════════
   HISTORY PANEL
   ════════════════════════════════════════════════════════════════ */
async function loadHistory() {
    const content = document.getElementById('historyContent');
    if (!content) return;

    if (!_uid) {
        content.innerHTML = '<div class="empty-history">لازم تسجّل دخول عشان تشوف سجلّك</div>';
        return;
    }

    content.innerHTML = '<div class="loading-text">⏳ جاري التحميل...</div>';

    try {
        const tradesRef = getTradesRef();
        const snap = await tradesRef.orderBy('startTime','desc').limit(100).get();

        /* ★ فلترة بحسب الحساب الحالي (تجريبي / حقيقي) */
        const curAcc    = window._curAcc;
        const allSnap   = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const accFilter = t => {
            /* الصفقات القديمة بدون حقل account تُعامَل كـ demo */
            if (curAcc === 'demo') return !t.account || t.account === 'demo';
            return t.account === curAcc;
        };
        const accTrades = allSnap.filter(accFilter);

        let trades = [...accTrades];

        const activeTab = document.querySelector('#historyPanel .htab.active');
        const tab = activeTab ? activeTab.getAttribute('data-tab') : 'all';
        if (tab === 'active') trades = trades.filter(t => t.status === 'active');
        else if (tab === 'closed') trades = trades.filter(t => t.status === 'won' || t.status === 'lost');

        /* ★ إحصائيات خاصة بالحساب الحالي فقط */
        const wonT  = accTrades.filter(t => t.status === 'won');
        const lostT = accTrades.filter(t => t.status === 'lost');
        const netPnl = wonT.reduce((s,t)=> s+(t.pnl||0),0) + lostT.reduce((s,t)=> s+(t.pnl||0),0);
        const se = id => document.getElementById(id);
        if(se('statTotal')) se('statTotal').textContent = accTrades.length;
        if(se('statWon'))   se('statWon').textContent   = wonT.length;
        if(se('statLost'))  se('statLost').textContent  = lostT.length;
        if(se('statPnl')) {
            se('statPnl').textContent = (netPnl>=0?'+':'')+`$${netPnl.toFixed(2)}`;
            se('statPnl').style.color = netPnl>=0?'#00cc00':'#ff5555';
        }

        if (!trades.length) { content.innerHTML = '<div class="empty-history">لا توجد صفقات في هذا القسم</div>'; return; }
        content.innerHTML = trades.map(renderTradeRecord).join('');
    } catch (e) {
        console.error('loadHistory:', e);
        content.innerHTML = '<div class="empty-history">⚠️ خطأ في تحميل السجل</div>';
    }
}

function renderTradeRecord(t) {
    const tc = t.type === 'buy' ? 'buy' : 'sell';
    const dir = t.type === 'buy' ? '↗ شراء' : '↘ بيع';

    let stLbl, stCls, pnlCls, pnlStr;
    if (t.status === 'active') {
        const rem = Math.max(0, ((t.endTime || Date.now()) - Date.now()) / 1000);
        stLbl  = '● نشطة'; stCls = 'active';
        pnlCls = 'active-pnl';
        pnlStr = `<span id="histTimer-${t.id}">⏱ ${fmtCountdown(rem)}</span>`;
    } else if (t.status === 'won') {
        stLbl = '✓ ربح'; stCls = 'won';
        pnlCls = 'win'; pnlStr = `+$${(t.pnl||0).toFixed(2)}`;
    } else {
        stLbl = '✗ خسارة'; stCls = 'lost';
        pnlCls = 'loss'; pnlStr = `-$${(t.amount||0).toFixed(2)}`;
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
            <div class="tr-detail">
                <span class="tr-detail-label">المبلغ</span>
                <span class="tr-detail-value">$${(t.amount||0).toFixed(2)}</span>
            </div>
            <div class="tr-detail">
                <span class="tr-detail-label">سعر الدخول</span>
                <span class="tr-detail-value">${(t.entryPrice||0).toFixed(5)}</span>
            </div>
            <div class="tr-detail">
                <span class="tr-detail-label">سعر الإغلاق</span>
                <span class="tr-detail-value">${close}</span>
            </div>
            <div class="tr-detail">
                <span class="tr-detail-label">الزوج</span>
                <span class="tr-detail-value">${t.pair||'EUR/USD'}</span>
            </div>
            <div class="tr-detail">
                <span class="tr-detail-label">المدة</span>
                <span class="tr-detail-value">${dur}</span>
            </div>
            <div class="tr-detail">
                <span class="tr-detail-label">الوقت</span>
                <span class="tr-detail-value" style="font-size:8px">${date}</span>
            </div>
        </div>
    </div>`;
}

/* ════════════════════════════════════════════════════════════════
   LIVE TIME
   ════════════════════════════════════════════════════════════════ */
function updateLiveTime() {
    const d=new Date,u=d.getTime()+d.getTimezoneOffset()*6e4,t=new Date(u+108e5),
          h=String(t.getHours()).padStart(2,"0"),m=String(t.getMinutes()).padStart(2,"0"),
          s=String(t.getSeconds()).padStart(2,"0");
    const el = document.getElementById("liveTime");
    if (el) el.textContent=`${h}:${m}:${s} UTC+3`;
}
updateLiveTime();
setInterval(updateLiveTime,1e3);

/* ════════════════════════════════════════════════════════════════
   ★★★  CHART MASTER MANAGER
   ════════════════════════════════════════════════════════════════
   ✅ إصلاحات مهمة حسب طلبك:
   - ضمان مدير واحد لكل زوج (بدون افتراض Master عند خطأ)
   - ترقية Viewer إلى Master بسرعة (فحص كل 2s)
   - لو مفيش Master: الشمعة تتجمد تلقائياً (لأن مفيش بث)
   ════════════════════════════════════════════════════════════════ */
class ChartMasterManager {
    constructor() {
        this.sessionId   = Date.now().toString(36) + Math.random().toString(36).substr(2, 8);
        this.masterPairs = new Set();
        this._hbTimers   = {};
        this._watchTimers = {};
        this._sessionRef = db.collection('chart_sessions').doc(this.sessionId);

        this._registerSession();
        window.addEventListener('beforeunload', () => this._cleanup());
    }

    _registerSession() {
        this._sessionRef.set({
            sessionId: this.sessionId,
            lastSeen:  firebase.firestore.FieldValue.serverTimestamp(),
            active:    true
        }).catch(() => {});

        setInterval(() => {
            this._sessionRef.update({
                lastSeen: firebase.firestore.FieldValue.serverTimestamp()
            }).catch(() => {});
        }, 5000);
    }

    _masterRef(pair) {
        return db.collection('chart_control').doc('master_' + pair.replace('/', '_'));
    }

    _candleRef(pair) {
        return db.collection('chart_control').doc('live_' + pair.replace('/', '_'));
    }

    async claimMaster(pair) {
        const ref = this._masterRef(pair);
        let claimed = false;
        try {
            await db.runTransaction(async tx => {
                const snap = await tx.get(ref);
                const now  = Date.now();
                const lastHB = snap.exists && snap.data().lastHeartbeat
                    ? snap.data().lastHeartbeat.toMillis()
                    : 0;

                // Heartbeat كل 3s => اعتبره ميت بعد ~8s
                const isDeadOrAbsent =
                    !snap.exists ||
                    !snap.data().isActive ||
                    (now - lastHB) > 8000;

                if (isDeadOrAbsent) {
                    tx.set(ref, {
                        sessionId:     this.sessionId,
                        lastHeartbeat: firebase.firestore.FieldValue.serverTimestamp(),
                        isActive:      true,
                        claimedAt:     now
                    }, { merge: true });
                    claimed = true;
                }
            });
        } catch (e) {
            // مهم: ماينفعش نفترض إننا Master عند أي خطأ
            console.warn('claimMaster tx error -> stay viewer:', e);
            claimed = false;
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
        this._hbTimers[pair] = setInterval(() => {
            if (!this.masterPairs.has(pair)) {
                clearInterval(this._hbTimers[pair]);
                delete this._hbTimers[pair];
                return;
            }
            this._masterRef(pair).update({
                lastHeartbeat: firebase.firestore.FieldValue.serverTimestamp(),
                isActive:      true
            }).catch(() => {});
        }, 3000);
    }

    _startWatch(pair) {
        if (this._watchTimers[pair]) return;
        this._watchTimers[pair] = setInterval(async () => {
            if (this.masterPairs.has(pair)) {
                this._stopWatch(pair);
                return;
            }
            try {
                const snap = await this._masterRef(pair).get();
                const now  = Date.now();
                const lastHB = snap.exists && snap.data().lastHeartbeat
                    ? snap.data().lastHeartbeat.toMillis()
                    : 0;
                const isDead =
                    !snap.exists ||
                    !snap.data().isActive ||
                    (now - lastHB) > 8000;

                if (isDead) {
                    const became = await this.claimMaster(pair);
                    if (became && window.chart && window.chart.currentPair === pair) {
                        window.chart._onBecameMaster(pair);
                    }
                }
            } catch (e) { }
        }, 2000); // ✅ أسرع بدل 7000ms
    }

    _stopWatch(pair) {
        if (this._watchTimers[pair]) {
            clearInterval(this._watchTimers[pair]);
            delete this._watchTimers[pair];
        }
    }

    isMaster(pair) {
        return this.masterPairs.has(pair);
    }

    // ✅ بث لحظي: وثيقة واحدة فقط لكل زوج (live_pair)
    broadcastLiveCandle(candle, pair) {
        if (!this.masterPairs.has(pair) || !candle) return;
        const now = Date.now();
        if (this._lastBroadcast && (now - this._lastBroadcast) < 150) return;
        this._lastBroadcast = now;

        this._candleRef(pair).set({
            candle:    { ...candle },
            pair:      pair,
            masterSessionId: this.sessionId,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true }).catch(() => {});
    }

    subscribeToLiveCandle(pair, callback) {
        if (this._liveUnsub) {
            this._liveUnsub();
            this._liveUnsub = null;
        }
        this._liveUnsub = this._candleRef(pair).onSnapshot(snap => {
            if (!snap.exists) return;
            const data = snap.data();
            if (data && data.pair === pair && data.candle) {
                callback(data.candle, data);
            }
        });
    }

    unsubscribeLive() {
        if (this._liveUnsub) {
            this._liveUnsub();
            this._liveUnsub = null;
        }
    }

    releaseMaster(pair) {
        if (!this.masterPairs.has(pair)) return;
        this.masterPairs.delete(pair);
        if (this._hbTimers[pair]) {
            clearInterval(this._hbTimers[pair]);
            delete this._hbTimers[pair];
        }
        this._masterRef(pair).update({ isActive: false }).catch(() => {});
        this._startWatch(pair);
    }

    _cleanup() {
        this.masterPairs.forEach(pair => {
            try { this._masterRef(pair).update({ isActive: false }); } catch (e) {}
            if (this._hbTimers[pair]) clearInterval(this._hbTimers[pair]);
        });
        try { this._sessionRef.update({ active: false }); } catch (e) {}
    }
}

/* ════════════════════════════════════════════════════════════════
   ★★★  ADVANCED TRADING CHART  ★★★
   ════════════════════════════════════════════════════════════════
   ✅ المطلوب اللي اتنفّذ هنا:
   1) مدير واحد فقط يبث شمعة واحدة (وثيقة live_...)
   2) المشاهدين يشوفوا نفس الشمعة ونفس السعر لحظي (بدون توليد محلي)
   3) لو مفيش مدير: الشمعة تتجمد (لا تحديث)
   4) أول ما مدير يدخل/يتعيّن: يفك التجميد فوراً ويكمل
   5) حفظ الشموع المقفولة فقط في candles_* بدقة (timestamp كمفتاح)
   6) Gap-fill قوي: لو غياب 10 دقائق => يولّد 10 شمعات ويحفظهم فوراً
   7) Skeleton رمادي واضح بتموج يمين/يسار أثناء تحميل الزوج
   ════════════════════════════════════════════════════════════════ */
class AdvancedTradingChart {
    constructor() {
        this.plot              = document.getElementById("plot");
        this.canvas            = document.getElementById("chartCanvas");
        this.ctx               = this.canvas.getContext("2d");
        this.timeLabels        = document.getElementById("timeLabels");
        this.candleTimer       = document.getElementById("candleTimer");
        this.priceLine         = document.getElementById("priceLine");
        this.priceScaleLabels  = document.getElementById("priceScaleLabels");
        this.currentPriceEl    = document.getElementById("currentPrice");

        this.candles           = [];
        this.currentCandle     = null;
        this.maxCandles        = 5000;

        this.currentPair       = 'EUR/USD';
        this.pairStates        = new Map();
        this._switching        = false;

        const _cfg             = PAIR_CONFIG['EUR/USD'];
        this.basePrice         = _cfg.basePrice;
        this.seed              = _cfg.seed;
        this.digits            = _cfg.digits;
        this.vb                = _cfg.vb;
        this.tb                = _cfg.tb;

        this.currentPrice      = this.basePrice;

        this.priceRange        = { min: this.basePrice * .99, max: this.basePrice * 1.01 };
        this.baseSpacing       = 12;
        this.zoom              = 1;
        this.targetZoom        = 1;
        this.minZoom           = 0.425;
        this.maxZoom           = 2.25;
        this.zoomEase          = 0.28;
        this.targetOffsetX     = 0;
        this.offsetX           = 0;
        this.panEase           = 0.38;
        this.velocity          = 0;
        this.drag              = 0;
        this.dragStartX        = 0;
        this.dragStartOffset   = 0;
        this.lastDragX         = 0;
        this.lastDragTime      = 0;
        this.pinch             = 0;
        this.p0                = 0;
        this.pMidX             = 0;
        this.pMidY             = 0;
        this.timeframe         = 6e4;
        this.t0                = Math.floor(Date.now() / 6e4) * 6e4;
        this.smin              = null;
        this.smax              = null;
        this.sre               = 0.088;
        this._fr               = 0;
        this.markers           = [];
        this.selectedTime      = 5;
        this._realtimeStarted  = false;

        this._isViewerMode     = false;
        this._viewerUnsub      = null;
        this._skeletonEl       = null;

        this.setup();
        this._createSkeleton();
        this.initEvents();
        this.loop();
    }

    /* ════════════════════════════
       ★ SKELETON LOADING SYSTEM (رمادي واضح + تموج يمين/يسار)
       ════════════════════════════ */
    _injectSkeletonStyles() {
        if (document.getElementById('_skelCSS')) return;
        const s = document.createElement('style');
        s.id = '_skelCSS';
        s.textContent = `
        #chartSkeleton{
            position:absolute;inset:0;z-index:9999;
            display:flex;align-items:flex-end;
            gap:4px;padding:20px 14px 10px;
            background:#141414;
            pointer-events:none;
            transition:opacity .25s ease;
        }
        #chartSkeleton.sk-hidden{opacity:0;}
        .sk-col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:2px;}
        .sk-wick,.sk-body{
            background:linear-gradient(90deg,#2b2b2b 0%,#4a4a4a 50%,#2b2b2b 100%);
            background-size:250% 100%;
            animation:skShimmerX 1.15s ease-in-out infinite;
        }
        .sk-wick{width:2px;border-radius:1px;opacity:.95;}
        .sk-body{width:100%;border-radius:2px;opacity:1;}
        @keyframes skShimmerX{
            0%  {background-position:200% 0}
            100%{background-position:-200% 0}
        }`;
        document.head.appendChild(s);
    }

    _createSkeleton() {
        if (document.getElementById('chartSkeleton')) {
            this._skeletonEl = document.getElementById('chartSkeleton');
            return;
        }
        this._injectSkeletonStyles();
        const sk = document.createElement('div');
        sk.id = 'chartSkeleton';

        const bodies  = [55,38,70,48,62,35,80,52,68,42,
                         75,45,60,50,72,38,85,55,65,40,
                         78,48,58,44,70,36,82,60,74,46];
        const wicks_t = [15,10,18,12,16, 8,20,14,17,11,
                         19,13,16,15,18,10,22,15,17,12,
                         20,13,15,12,18, 9,21,16,19,13];
        const wicks_b = [10, 8,12, 9,11, 6,14,10,12, 8,
                         13, 9,11,10,12, 7,15,10,12, 9,
                         14, 9,11, 8,12, 6,14,11,13, 9];

        bodies.forEach((bh, i) => {
            const col = document.createElement('div');
            col.className = 'sk-col';

            const wt = document.createElement('div');
            wt.className = 'sk-wick';
            wt.style.height = wicks_t[i] + '%';
            wt.style.animationDelay = (i * 0.04) + 's';

            const body = document.createElement('div');
            body.className = 'sk-body';
            body.style.height = bh + '%';
            body.style.animationDelay = (i * 0.04) + 's';

            const wb = document.createElement('div');
            wb.className = 'sk-wick';
            wb.style.height = wicks_b[i] + '%';
            wb.style.animationDelay = (i * 0.04) + 's';

            col.appendChild(wt);
            col.appendChild(body);
            col.appendChild(wb);
            sk.appendChild(col);
        });

        if (getComputedStyle(this.plot).position === 'static') {
            this.plot.style.position = 'relative';
        }
        this.plot.appendChild(sk);
        this._skeletonEl = sk;
    }

    showSkeleton() {
        if (!this._skeletonEl) this._createSkeleton();
        this._skeletonEl.classList.remove('sk-hidden');
    }

    hideSkeleton() {
        if (this._skeletonEl) this._skeletonEl.classList.add('sk-hidden');
    }

    setup() {
        const dpr = window.devicePixelRatio || 1, r = this.plot.getBoundingClientRect();
        this.w = r.width;
        this.h = r.height - 24;
        this.canvas.width  = this.w * dpr;
        this.canvas.height = this.h * dpr;
        this.canvas.style.width  = this.w + "px";
        this.canvas.style.height = this.h + "px";
        this.ctx.setTransform(1,0,0,1,0,0);
        this.ctx.scale(dpr, dpr);
        this.updatePriceLabel();
        this.updatePriceScale();
        this.updateTimeLabels();
    }

    rnd(s)  { const x = Math.sin(s) * 1e4; return x - Math.floor(x); }
    rndG(s) {
        const u1 = this.rnd(s), u2 = this.rnd(s + 1e5);
        return Math.sqrt(-2 * Math.log(u1 + 1e-5)) * Math.cos(2 * Math.PI * u2);
    }

    genCandle(t, o) {
        const vb = this.vb || 8e-4,
              tb = this.tb || 5e-5;
        const s  = this.seed + Math.floor(t / this.timeframe),
              r1 = this.rndG(s), r2 = this.rndG(s+1), r3 = this.rndG(s+2),
              r4 = this.rnd(s+3), r5 = this.rnd(s+4), r6 = this.rnd(s+5),
              v  = vb * (.7 + Math.abs(r1) * .8),
              tr = tb * r2 * .6,
              dir= r3 > 0 ? 1 : -1,
              tc = o + (dir * v + tr),
              rg = v * (.2 + r4 * .6),
              hm = rg * (.3 + r5 * .7),
              lm = rg * (.3 + (1 - r5) * .7),
              c  = +(tc + (r6 - .5) * v * .1).toFixed(this.digits),
              op = +o.toFixed(this.digits);
        return {
            open:  op,
            close: c,
            high:  +Math.max(op, c, op + hm, c + hm).toFixed(this.digits),
            low:   +Math.min(op, c, op - lm, c - lm).toFixed(this.digits),
            timestamp: t
        };
    }

    getPairCollection(pair) {
        return 'candles_' + (pair || this.currentPair).replace('/', '_');
    }

    _onBecameMaster(pair) {
        if (pair !== this.currentPair) return;
        this._stopViewerListener();
        this._isViewerMode = false;
        console.log(`🎯 [Chart] ترقية إلى مدير لـ ${pair}`);

        // أول ما نبقى Master: نعمل Recover+GapFill ونبث فورا
        this._recoverAndGapFillFromLive(pair).catch(() => {});
    }

    // ✅ مهم: لما تغيّر الزوج، لازم تسيب إدارة الزوج القديم (لو كنت Master) عشان مايبقاش عندك أكتر من شمعة نشطة/زوج
    async switchPair(newPair) {
        if (newPair === this.currentPair) return;

        const oldPair = this.currentPair;
        this._stopViewerListener();
        this._switching = true;
        this.showSkeleton();

        // ✅ Release إدارة الزوج القديم لو كنت Master
        if (window.masterManager && window.masterManager.isMaster(oldPair)) {
            window.masterManager.releaseMaster(oldPair);
        }

        this.currentPair = newPair;
        const cfg        = PAIR_CONFIG[newPair] || PAIR_CONFIG['EUR/USD'];
        this.basePrice   = cfg.basePrice;
        this.seed        = cfg.seed;
        this.digits      = cfg.digits;
        this.vb          = cfg.vb;
        this.tb          = cfg.tb;

        const isMaster = window.masterManager
            ? await window.masterManager.claimMaster(newPair)
            : true;

        this.candles       = [];
        this.currentCandle = null;
        this.markers       = [];
        this.smin          = null;
        this.smax          = null;

        await this.loadCandlesFromFirebase(newPair, isMaster);
        this._switching = false;
    }

    async _fetchLiveCandle(pair) {
        if (!window.masterManager) return null;
        try {
            const snap = await window.masterManager._candleRef(pair).get();
            if (!snap.exists) return null;
            const d = snap.data();
            if (!d || !d.candle) return null;
            const c = d.candle;
            if (!c || c.timestamp === undefined || c.timestamp === null) return null;
            // أمان: تحويل للأرقام
            return {
                open: +c.open,
                close: +c.close,
                high: +c.high,
                low: +c.low,
                timestamp: +c.timestamp
            };
        } catch (e) {
            return null;
        }
    }

    // ✅ Recover + GapFill + حفظ الشموع الناقصة في Firebase (لـ Master فقط)
    async _recoverAndGapFillFromLive(pair) {
        const coll = this.getPairCollection(pair);

        // 1) لو في شمعة متجمدة في live_... استخدمها كـ currentCandle
        const live = await this._fetchLiveCandle(pair);
        const lastSavedTs = this.candles.length ? this.candles[this.candles.length - 1].timestamp : null;

        if (live && (lastSavedTs === null || live.timestamp >= lastSavedTs)) {
            // لو عندنا شمعة بنفس التايمستامب في candles (نادر)، نشيلها عشان دي active
            this.candles = this.candles.filter(c => c.timestamp !== live.timestamp);
            this.currentCandle = { ...live };
            this.currentPrice  = live.close;
            this.t0            = live.timestamp;
        }

        // 2) GapFill حسب الوقت الحالي
        const now       = Date.now();
        const currentT0 = Math.floor(now / this.timeframe) * this.timeframe;

        // لو مفيش currentCandle اصلاً: ابنِ واحدة على أساس آخر شمعة محفوظة
        if (!this.currentCandle) {
            const last = this.candles.length ? this.candles[this.candles.length - 1] : null;
            const lp   = last ? last.close : this.basePrice;
            this.currentCandle = {
                open: lp, close: lp, high: lp, low: lp, timestamp: currentT0
            };
            this.currentPrice = lp;
            this.t0 = currentT0;
        }

        // لو الشمعة المتجمدة قديمة (مثلاً غياب 10 دقائق): لازم نقفلها + نولد شمعات لكل دقيقة
        const missing = [];
        let baseClose = this.currentCandle.close;

        if (this.currentCandle.timestamp < currentT0) {
            // (a) اقفل الشمعة المتجمدة عند آخر close وصلنا له (تجميد)
            const frozenClosed = {
                ...this.currentCandle,
                open: +this.currentCandle.open,
                close: +this.currentCandle.close,
                high: +this.currentCandle.high,
                low: +this.currentCandle.low,
                timestamp: +this.currentCandle.timestamp
            };

            // إدراج/استبدال في candles ثم حفظ
            this._upsertClosedCandleLocal(frozenClosed);
            missing.push(frozenClosed);

            // (b) توليد الشموع الناقصة لكل دقيقة
            let t = frozenClosed.timestamp + this.timeframe;
            let p = frozenClosed.close;
            let safety = 0;

            while (t < currentT0 && safety < 2000) {
                const c = this.genCandle(t, p);
                missing.push(c);
                p = c.close;
                t += this.timeframe;
                safety++;
            }

            // حفظ كل الشموع الناقصة دفعة واحدة
            if (missing.length) {
                await this._batchSaveCandles(coll, missing);
            }

            // تحديث local candles
            missing.forEach(c => this._upsertClosedCandleLocal(c));
            baseClose = missing[missing.length - 1].close;

            // (c) فتح شمعة جديدة في الدقيقة الحالية
            this.currentCandle = {
                open: baseClose,
                close: baseClose,
                high: baseClose,
                low:  baseClose,
                timestamp: currentT0
            };
            this.currentPrice = baseClose;
            this.t0 = currentT0;
        }

        // 3) بث الشمعة الحالية فوراً (فك التجميد للمشاهدين)
        if (window.masterManager && window.masterManager.isMaster(pair)) {
            window.masterManager.broadcastLiveCandle({ ...this.currentCandle }, pair);
        }
    }

    _upsertClosedCandleLocal(candle) {
        if (!candle) return;
        const ts = candle.timestamp;
        const i = this.candles.findIndex(x => x.timestamp === ts);
        if (i >= 0) this.candles[i] = { ...candle };
        else this.candles.push({ ...candle });

        // حافظ على الترتيب
        this.candles.sort((a,b)=>a.timestamp-b.timestamp);
        if (this.candles.length > this.maxCandles) this.candles = this.candles.slice(-this.maxCandles);
    }

    async loadCandlesFromFirebase(pair = null, isMaster = true) {
        const targetPair = pair || this.currentPair;
        const coll       = this.getPairCollection(targetPair);

        try {
            const snap = await db.collection(coll)
                .orderBy('timestamp', 'desc')
                .limit(this.maxCandles)
                .get();

            if (!snap.empty && snap.docs.length >= 10) {
                this.candles      = snap.docs.map(d => d.data()).reverse();
                this.currentPrice = this.candles[this.candles.length - 1].close;
            } else {
                const generated = [];
                let   startP    = this.basePrice;
                let   startT    = Math.floor(Date.now() / this.timeframe) * this.timeframe
                                  - 30 * this.timeframe;

                for (let i = 0; i < 30; i++) {
                    const c = this.genCandle(startT, startP);
                    generated.push(c);
                    startP  = c.close;
                    startT += this.timeframe;
                }

                if (isMaster) {
                    await this._batchSaveCandles(coll, generated);
                }

                this.candles      = generated;
                this.currentPrice = this.candles[this.candles.length - 1].close;
            }

            // ✅ بدل fill gaps القديم: Recover + GapFill من live candle (مهم جداً لفك التجميد وتوليد الناقص)
            if (isMaster) {
                await this._recoverAndGapFillFromLive(targetPair);
            } else {
                // Viewer: لو في شمعة live موجودة، اعرضها فوراً (بدون توليد محلي)
                const live = await this._fetchLiveCandle(targetPair);
                if (live) {
                    this.currentCandle = { ...live };
                    this.currentPrice  = live.close;
                    this.t0            = live.timestamp;
                }
            }

        } catch (e) {
            console.error('loadCandlesFromFirebase:', e);
            this._initLocalFallback();
        }

        this._isViewerMode = !isMaster;
        this._afterCandlesLoaded();

        if (!this._realtimeStarted) this.startRealtime();

        if (!isMaster) {
            this._startViewerListener(targetPair);
        }
    }

    async _batchSaveCandles(coll, candles) {
        if (!candles || !candles.length) return;
        const chunks = [];
        for (let i = 0; i < candles.length; i += 499) {
            chunks.push(candles.slice(i, i + 499));
        }
        for (const chunk of chunks) {
            try {
                const batch = db.batch();
                chunk.forEach(c => {
                    batch.set(db.collection(coll).doc(String(c.timestamp)), c);
                });
                await batch.commit();
            } catch (e) {
                console.warn('_batchSaveCandles:', e);
            }
        }
    }

    _initLocalFallback() {
        let p = this.basePrice;
        let t = Date.now() - 30 * this.timeframe;
        for (let i = 0; i < 30; i++) {
            const c = this.genCandle(t, p);
            this.candles.push(c);
            p = c.close;
            t += this.timeframe;
        }
        this.currentPrice = this.candles[this.candles.length - 1].close;
    }

    saveCandleToFirebase(candle, pair = null) {
        const targetPair = pair || this.currentPair;
        if (window.masterManager && !window.masterManager.isMaster(targetPair)) return;

        const coll = this.getPairCollection(targetPair);
        db.collection(coll)
          .doc(String(candle.timestamp))
          .set(candle)
          .catch(e => console.warn('saveCandleToFirebase:', e));
    }

    _startViewerListener(pair) {
        this._stopViewerListener();
        if (!window.masterManager) return;

        // Get مرة أولى + onSnapshot (عشان يظهر فوراً حتى لو مفيش تحديث جديد)
        window.masterManager._candleRef(pair).get().then(snap => {
            if (!snap.exists) return;
            const data = snap.data();
            if (data && data.pair === pair && data.candle) {
                this._applyRemoteCandle(data.candle);
            }
        }).catch(() => {});

        this._viewerUnsub = window.masterManager._candleRef(pair).onSnapshot(snap => {
            if (this._switching) return;
            if (window.masterManager && window.masterManager.isMaster(pair)) return;
            if (!snap.exists) return;

            const data = snap.data();
            if (data && data.pair === pair && data.candle) {
                this._applyRemoteCandle(data.candle);
            }
        });
    }

    _stopViewerListener() {
        if (this._viewerUnsub) {
            this._viewerUnsub();
            this._viewerUnsub = null;
        }
    }

    _applyRemoteCandle(remote) {
        if (!remote) return;

        const rc = {
            open: +remote.open,
            close: +remote.close,
            high: +remote.high,
            low: +remote.low,
            timestamp: +remote.timestamp
        };

        // لو حصل انتقال تايمستامب: ادخل القديمة ضمن candles مرة واحدة فقط
        if (this.currentCandle && this.currentCandle.timestamp !== rc.timestamp) {
            const prev = { ...this.currentCandle };
            const last = this.candles[this.candles.length - 1];
            if (!last || last.timestamp !== prev.timestamp) {
                this.candles.push(prev);
                if (this.candles.length > this.maxCandles) this.candles.shift();
            }
        }

        this.currentCandle = { ...rc };
        this.currentPrice  = rc.close;
        this.t0            = rc.timestamp;
    }

    _afterCandlesLoaded() {
        this.hideSkeleton();

        if (!this.currentCandle && this.candles.length) {
            const last = this.candles[this.candles.length - 1];
            const now  = Date.now();
            const t0now = Math.floor(now / this.timeframe) * this.timeframe;
            this.currentCandle = {
                open:      last.close,
                close:     last.close,
                high:      last.close,
                low:       last.close,
                timestamp: t0now
            };
            this.currentPrice = last.close;
        }

        this.t0 = this.currentCandle ? this.currentCandle.timestamp : Math.floor(Date.now() / this.timeframe) * this.timeframe;
        this.snapToLive();
        this.updateTimeLabels();
        this.updatePriceRange();
        this.smin = this.priceRange.min;
        this.smax = this.priceRange.max;
        this.updatePriceScale();
        this.updatePriceLabel();
    }

    getSpacing()     { return this.baseSpacing * this.zoom; }
    getCandleWidth() { return this.getSpacing() * .8; }
    getMinOffset()   { return this.w / 2 - this.candles.length * this.getSpacing(); }
    getMaxOffset()   { return this.w / 2; }

    getIndexForCandleTimestamp(ts) {
        if (ts === undefined || ts === null) return null;
        if (this.currentCandle && this.currentCandle.timestamp === ts)
            return this.candles.length;
        for (let i = 0; i < this.candles.length; i++)
            if (this.candles[i].timestamp === ts) return i;
        const tS  = this.candles.length ? this.candles[0].timestamp : this.t0;
        let   idx = Math.round((ts - tS) / this.timeframe);
        idx = Math.max(0, Math.min(idx, this.candles.length));
        return idx;
    }

    clampPan() {
        const mn = this.getMinOffset(), mx = this.getMaxOffset();
        this.targetOffsetX = Math.max(mn, Math.min(mx, this.targetOffsetX));
        this.offsetX       = Math.max(mn, Math.min(mx, this.offsetX));
    }
    snapToLive() {
        this.targetOffsetX = this.getMinOffset();
        this.offsetX       = this.targetOffsetX;
        this.velocity      = 0;
        this.clampPan();
    }
    updatePan() {
        const diff = this.targetOffsetX - this.offsetX;
        if (Math.abs(diff) > .003) this.offsetX += diff * this.panEase;
        else this.offsetX = this.targetOffsetX;
        if (Math.abs(this.velocity) > .01) {
            this.targetOffsetX += this.velocity;
            this.velocity      *= .972;
            this.clampPan();
        } else this.velocity = 0;
    }
    tickZoom() {
        const d = this.targetZoom - this.zoom;
        Math.abs(d) > .0001 ? this.zoom += d * this.zoomEase : this.zoom = this.targetZoom;
    }
    tickSR() {
        const r = this.priceRange;
        if (this.smin === null) { this.smin = r.min; this.smax = r.max; return; }
        this.smin += (r.min - this.smin) * this.sre;
        this.smax += (r.max - this.smax) * this.sre;
    }
    applyZoomAround(mx, my, sc) {
        const oz = this.targetZoom,
              nz = Math.max(this.minZoom, Math.min(this.maxZoom, oz * sc));
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
        const mn = this.smin !== null ? this.smin : this.priceRange.min,
              mx = this.smax !== null ? this.smax : this.priceRange.max;
        return { min: mn, max: mx };
    }
    niceNum(v, rnd) {
        const e = Math.floor(Math.log10(v)), p = Math.pow(10, e), f = v / p;
        let nf;
        if (rnd) { if (f<1.5) nf=1; else if (f<3) nf=2; else if (f<7) nf=5; else nf=10; }
        else      { if (f<=1) nf=1; else if (f<=2) nf=2; else if (f<=5) nf=5; else nf=10; }
        return nf * p;
    }
    calcNiceGrid() {
        const r   = this.getPriceRange(),
              rng = r.max - r.min,
              d   = this.niceNum(rng / 7, 0),
              g0  = Math.floor(r.min / d) * d,
              g1  = Math.ceil(r.max  / d) * d;
        return { min: g0, max: g1, step: d, count: Math.round((g1 - g0) / d) };
    }

    drawGrid() {
        const { min, max, step, count } = this.calcNiceGrid();
        for (let i = 0; i <= count; i++) {
            const p = min + i * step, y = this.priceToY(p);
            if (y < -5 || y > this.h + 5) continue;
            const mj = i % 5 === 0;
            this.ctx.strokeStyle = mj ? "rgba(255,215,0,.12)" : "rgba(255,255,255,.05)";
            this.ctx.lineWidth   = mj ? 1 : .8;
            this.ctx.beginPath(); this.ctx.moveTo(0, y + .5); this.ctx.lineTo(this.w, y + .5); this.ctx.stroke();
        }
        const visC   = this.w / this.getSpacing(),
              targetL= 9,
              stepC  = Math.max(1, Math.round(visC / targetL)),
              s      = Math.floor(this.xToIndex(0)),
              e      = Math.ceil(this.xToIndex(this.w));
        for (let i = s; i <= e; i++) {
            if (i % stepC !== 0) continue;
            const x = this.indexToX(i);
            if (x < -5 || x > this.w + 5) continue;
            const mj = i % Math.round(stepC * 5) === 0;
            this.ctx.strokeStyle = mj ? "rgba(255,215,0,.12)" : "rgba(255,255,255,.05)";
            this.ctx.lineWidth   = mj ? 1 : .8;
            this.ctx.beginPath(); this.ctx.moveTo(x + .5, 0); this.ctx.lineTo(x + .5, this.h); this.ctx.stroke();
        }
    }

    updateTimeLabels() {
        const tl     = this.timeLabels; tl.innerHTML = "";
        const visC   = this.w / this.getSpacing(),
              targetL= 9,
              stepC  = Math.max(1, Math.round(visC / targetL)),
              s      = Math.floor(this.xToIndex(0)),
              e      = Math.ceil(this.xToIndex(this.w)),
              tS     = this.candles.length ? this.candles[0].timestamp : this.t0;
        for (let i = s; i <= e; i++) {
            if (i % stepC !== 0) continue;
            const x = this.indexToX(i);
            if (x < 5 || x > this.w - 5) continue;
            const t  = tS + i * this.timeframe,
                  d  = new Date(t),
                  hh = String(d.getHours()).padStart(2,"0"),
                  mm = String(d.getMinutes()).padStart(2,"0"),
                  lb = document.createElement("div");
            lb.className = "timeLabel";
            (i % Math.round(stepC * 5) === 0) && lb.classList.add("major");
            lb.style.left  = x + "px";
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
            h += `<div class="pLabel${mj?" major":""}" style="top:${y}px">${p.toFixed(this.digits)}</div>`;
        }
        this.priceScaleLabels.innerHTML = h;
    }

    updatePriceLabel() {
        const py = this.priceToY(this.currentPrice);
        this.priceLine.style.top        = py + "px";
        this.currentPriceEl.style.top   = py + "px";
        this.currentPriceEl.textContent = this.currentPrice.toFixed(this.digits);
    }

    updateCandleTimer() {
        if (!this.currentCandle) return;
        const n  = Date.now(),
              e  = n - this.t0,
              r  = this.timeframe - e,
              s  = Math.floor(r / 1e3);
        this.candleTimer.textContent  = s >= 0 ? s : 0;
        const cx = this.indexToX(this.candles.length);
        this.candleTimer.style.left    = cx + 15 + "px";
        this.candleTimer.style.top     = "10px";
        this.candleTimer.style.display = 'block';
    }

    priceToY(p) {
        const r = this.getPriceRange(), n = (p - r.min) / (r.max - r.min);
        return this.h * (1 - n);
    }

    drawCandle(c, x, glow) {
        const oy = this.priceToY(c.open),  cy = this.priceToY(c.close),
              hy = this.priceToY(c.high),  ly = this.priceToY(c.low),
              b  = c.close >= c.open,       w  = this.getCandleWidth();
        this.ctx.strokeStyle = b ? "#0f0" : "#f00";
        this.ctx.lineWidth   = Math.max(1, .18 * w);
        this.ctx.beginPath(); this.ctx.moveTo(x, hy); this.ctx.lineTo(x, ly); this.ctx.stroke();
        const bh = Math.max(1, Math.abs(cy - oy)),
              bt = Math.min(oy, cy),
              g  = this.ctx.createLinearGradient(x, bt, x, bt + bh);
        b ? (g.addColorStop(0,"#0f0"), g.addColorStop(.5,"#0f0"), g.addColorStop(1,"#0c0"))
          : (g.addColorStop(0,"#f00"), g.addColorStop(.5,"#f00"), g.addColorStop(1,"#c00"));
        this.ctx.fillStyle = g;
        if (glow) { this.ctx.shadowColor = b ? "rgba(0,255,0,.8)" : "rgba(255,0,0,.8)"; this.ctx.shadowBlur = 12; }
        this.ctx.fillRect(x - w / 2, bt, w, bh);
        if (glow) this.ctx.shadowBlur = 0;
    }

    addMarker(t, tradeData = null) {
        const c = this.currentCandle;
        if (!c) return null;
        let fp;
        if (tradeData && tradeData.markerPrice !== undefined) {
            fp = tradeData.markerPrice;
        } else {
            const bt = Math.max(c.open, c.close), bb = Math.min(c.open, c.close);
            const op = this.currentPrice;
            fp = op;
            if (op > bt) fp = bt;
            else if (op < bb) fp = bb;
        }
        const marker = {
            type:  t,
            ts:    tradeData ? (tradeData.startTime || Date.now()) : Date.now(),
            price: fp,
            candleIndex:     tradeData && tradeData.candleIndex !== undefined
                                 ? tradeData.candleIndex : this.candles.length,
            candleTimestamp: tradeData && tradeData.candleTimestamp !== undefined
                                 ? tradeData.candleTimestamp : c.timestamp,
            tradeId:    tradeData ? tradeData.id   : null,
            endTime:    tradeData ? tradeData.endTime : null,
            status:     tradeData ? (tradeData.status || 'active') : null,
            closePrice: null,
            duration:   tradeData ? tradeData.duration : null
        };
        this.markers.push(marker);
        return marker;
    }

    addMarkerForTrade(type, trade) { return this.addMarker(type, trade); }

    addMarkerFromTrade(trade) {
        const candleTs = (trade.candleTimestamp !== undefined && trade.candleTimestamp !== null)
            ? trade.candleTimestamp
            : Math.floor((trade.startTime || Date.now()) / this.timeframe) * this.timeframe;
        const idx         = this.getIndexForCandleTimestamp(candleTs);
        const markerPrice = (trade.markerPrice !== undefined && trade.markerPrice !== null)
            ? trade.markerPrice : trade.entryPrice;
        this.markers.push({
            type:  trade.type,
            ts:    trade.startTime,
            price: markerPrice,
            candleIndex:     idx !== null ? idx : (trade.candleIndex || 0),
            candleTimestamp: candleTs,
            tradeId:    trade.id,
            endTime:    trade.endTime,
            status:     trade.status || 'active',
            closePrice: trade.closePrice,
            duration:   trade.duration
        });
    }

    /* ★ حذف Marker فور إغلاق الصفقة */
    removeMarkerByTradeId(tradeId) {
        this.markers = this.markers.filter(mk => mk.tradeId !== tradeId);
    }

    /* ★ مسح كل علامات الصفقات (مثلاً عند logout) */
    clearAllTradeMarkers() {
        this.markers = [];
    }

    drawMarker(m) {
        let actualIdx = this.getIndexForCandleTimestamp(m.candleTimestamp);
        if (actualIdx === null || actualIdx === undefined)
            actualIdx = (m.candleIndex !== undefined && m.candleIndex !== null)
                        ? m.candleIndex : this.candles.length;
        const x  = this.indexToX(actualIdx);
        if (x < -200 || x > this.w + 50) return;
        const y  = this.priceToY(m.price),
              cw = this.getCandleWidth(),
              ib = m.type === "buy",
              cl = ib ? "#16a34a" : "#ff3b3b",
              r  = 5.5;
        this.ctx.save();
        this.ctx.shadowColor = cl; this.ctx.shadowBlur = 9;
        this.ctx.fillStyle   = cl;
        this.ctx.beginPath(); this.ctx.arc(x, y, r, 0, 2 * Math.PI); this.ctx.fill();
        this.ctx.shadowBlur  = 0;
        this.ctx.fillStyle   = "#fff";
        this.ctx.save();
        this.ctx.translate(x, y);
        if (!ib) this.ctx.rotate(Math.PI);
        this.ctx.beginPath();
        this.ctx.moveTo(0, -2.8); this.ctx.lineTo(-2, .8); this.ctx.lineTo(-.65, .8);
        this.ctx.lineTo(-.65, 2.8); this.ctx.lineTo(.65, 2.8); this.ctx.lineTo(.65, .8);
        this.ctx.lineTo(2, .8); this.ctx.closePath(); this.ctx.fill();
        this.ctx.restore();

        /* خط أفقي بسيط فقط (بدون نهايات ربح/خسارة) */
        const lx = x + cw / 2 + 3;
        let lw;
        if (m.duration) {
            const cForTrade  = (m.duration * 1000) / this.timeframe;
            const pxForTrade = cForTrade * this.getSpacing();
            lw = Math.min(Math.max(pxForTrade, 55), Math.max(this.w - lx - 18, 55));
        } else {
            lw = Math.min(95, this.w - lx - 22);
        }

        const lineColor = ib ? "rgba(22,163,74,.65)" : "rgba(255,59,59,.65)";
        this.ctx.strokeStyle = lineColor; this.ctx.lineWidth = 1.2;

        this.ctx.beginPath(); this.ctx.moveTo(x + cw / 2, y); this.ctx.lineTo(lx, y); this.ctx.stroke();
        this.ctx.setLineDash([4, 3]);
        this.ctx.beginPath(); this.ctx.moveTo(lx, y); this.ctx.lineTo(lx + lw, y); this.ctx.stroke();
        this.ctx.setLineDash([]);

        this.ctx.restore();
    }

    draw() {
        this.tickZoom(); this.updatePan(); this.updatePriceRange(); this.tickSR();
        this.ctx.clearRect(0, 0, this.w, this.h);
        this.drawGrid();
        for (let i = 0; i < this.candles.length; i++) {
            const x = this.indexToX(i);
            if (x < -60 || x > this.w + 60) continue;
            this.drawCandle(this.candles[i], x, 0);
        }
        if (this.currentCandle && (!this.candles.length ||
            this.currentCandle.timestamp !== this.candles[this.candles.length - 1].timestamp)) {
            const lx = this.indexToX(this.candles.length);
            lx >= -60 && lx <= this.w + 60 && this.drawCandle(this.currentCandle, lx, 1);
        }
        for (let mk of this.markers) this.drawMarker(mk);
        if (++this._fr % 2 === 0) { this.updatePriceScale(); this.updateTimeLabels(); }
        this.updatePriceLabel(); this.updateCandleTimer();
    }

    stepTowards(c, t, m) {
        const d = t - c;
        return Math.abs(d) <= m ? t : c + Math.sign(d) * m;
    }

    updateCurrentCandle() {
        const vb = this.vb || 8e-4;
        if (!this.currentCandle) {
            const lp = this.candles.length ? this.candles[this.candles.length - 1].close : this.currentPrice;
            this.currentCandle       = this.genCandle(this.t0, lp);
            this.currentCandle.close = lp;
            this.currentCandle.high  = Math.max(this.currentCandle.open, this.currentCandle.close);
            this.currentCandle.low   = Math.min(this.currentCandle.open, this.currentCandle.close);
            return;
        }
        const n   = Date.now(),
              r   = this.rnd(this.seed + n),
              dir = (r - .5) * vb * 0.5,
              t   = this.currentCandle.close + dir,
              ms  = vb * .18,
              nc  = +this.stepTowards(this.currentCandle.close, t, ms).toFixed(this.digits);
        this.currentCandle.close = nc;
        this.currentCandle.high  = +Math.max(this.currentCandle.high, nc).toFixed(this.digits);
        this.currentCandle.low   = +Math.min(this.currentCandle.low,  nc).toFixed(this.digits);
        this.currentPrice        = nc;
    }

    /* ★ حفظ الشمعة عند انتهائها + مزامنة المشاهدين */
    startRealtime() {
        if (this._realtimeStarted) return;
        this._realtimeStarted = true;

        setInterval(async () => {
            if (this._switching) return;

            // ✅ Viewer: لا توليد محلي نهائياً (كده التجميد يشتغل تلقائياً)
            if (this._isViewerMode) return;

            // ✅ لو مش Master فعلياً (حتى لو _isViewerMode غلط لأي سبب): ماينفعش يحدث
            if (window.masterManager && !window.masterManager.isMaster(this.currentPair)) {
                return;
            }

            const n = Date.now();

            // لو المدير اتعيّن بعد تجميد طويل: اعمل GapFill سريع مرة واحدة
            // (دي حماية إضافية)
            if (!this._lastGapCheck || (n - this._lastGapCheck) > 5000) {
                this._lastGapCheck = n;
                await this._recoverAndGapFillFromLive(this.currentPair).catch(()=>{});
            }

            const e = n - this.t0;

            if (e >= this.timeframe) {
                if (this.currentCandle &&
                    (!this.candles.length ||
                     this.candles[this.candles.length - 1].timestamp !== this.currentCandle.timestamp)) {

                    const closedCandle = { ...this.currentCandle };
                    this.candles.push(closedCandle);
                    if (this.candles.length > this.maxCandles) this.candles.shift();

                    /* حفظ الشمعة المغلقة (بدقة) */
                    this.saveCandleToFirebase(closedCandle, this.currentPair);
                }

                /* إنشاء الشمعة الجديدة */
                this.t0 = Math.floor(n / this.timeframe) * this.timeframe;
                const lp = this.currentCandle ? this.currentCandle.close : this.currentPrice;
                this.currentCandle = {
                    open: lp, close: lp, high: lp, low: lp, timestamp: this.t0
                };
                this.currentPrice = lp;

                /* بث الشمعة الجديدة */
                if (window.masterManager && window.masterManager.isMaster(this.currentPair)) {
                    window.masterManager.broadcastLiveCandle(
                        { ...this.currentCandle },
                        this.currentPair
                    );
                }

            } else {
                this.updateCurrentCandle();

                if (this.currentCandle && window.masterManager &&
                    window.masterManager.isMaster(this.currentPair)) {
                    window.masterManager.broadcastLiveCandle(
                        { ...this.currentCandle },
                        this.currentPair
                    );
                }
            }
        }, 200);
    }

    updatePriceRange() {
        let v = [...this.candles];
        this.currentCandle &&
        (!v.length || this.currentCandle.timestamp !== v[v.length - 1].timestamp) &&
        v.push(this.currentCandle);
        if (!v.length) { this.priceRange = { min: .95 * this.basePrice, max: 1.05 * this.basePrice }; return; }
        const si = Math.floor(this.xToIndex(0)),
              ei = Math.ceil(this.xToIndex(this.w)),
              sl = v.slice(Math.max(0, si - 5), Math.min(v.length, ei + 5));
        if (!sl.length) { this.priceRange = { min: .95 * this.basePrice, max: 1.05 * this.basePrice }; return; }
        const lo = sl.map(c => c.low), hi = sl.map(c => c.high),
              mn = Math.min(...lo),    mx = Math.max(...hi),
              pd = .15 * (mx - mn) || 1e-9;
        this.priceRange = { min: mn - pd, max: mx + pd };
    }

    initEvents() {
        addEventListener("resize", () => this.setup());
        this.canvas.addEventListener("wheel", e => {
            e.preventDefault();
            const r  = this.canvas.getBoundingClientRect(),
                  x  = e.clientX - r.left,
                  y  = e.clientY - r.top,
                  sc = e.deltaY > 0 ? 1 / 1.1 : 1.1;
            this.applyZoomAround(x, y, sc);
        }, { passive: false });
        const md = (x, t) => {
            this.drag = 1; this.dragStartX = x; this.dragStartOffset = this.targetOffsetX;
            this.velocity = 0; this.lastDragX = x; this.lastDragTime = t;
        };
        const mm = (x, t) => {
            if (this.drag) {
                const d = x - this.dragStartX;
                this.targetOffsetX = this.dragStartOffset + d; this.clampPan();
                const dt = t - this.lastDragTime;
                if (dt > 0 && dt < 80) this.velocity = (x - this.lastDragX) / dt * 26;
                this.lastDragX = x; this.lastDragTime = t;
            }
        };
        const mu = () => { this.drag = 0; this.updateTimeLabels(); };
        this.canvas.addEventListener("mousedown", e => {
            const r = this.canvas.getBoundingClientRect(); md(e.clientX - r.left, Date.now());
        });
        addEventListener("mousemove", e => {
            const r = this.canvas.getBoundingClientRect(); mm(e.clientX - r.left, Date.now());
        });
        addEventListener("mouseup", mu);
        const db2 = (a, b) => Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
        this.canvas.addEventListener("touchstart", e => {
            const r = this.canvas.getBoundingClientRect();
            if (e.touches.length === 1) md(e.touches[0].clientX - r.left, Date.now());
            else if (e.touches.length === 2) {
                this.drag = 0; this.pinch = 1;
                this.p0   = db2(e.touches[0], e.touches[1]);
                this.pMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
                this.pMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top;
            }
        }, { passive: false });
        this.canvas.addEventListener("touchmove", e => {
            e.preventDefault();
            const r = this.canvas.getBoundingClientRect();
            if (this.pinch && e.touches.length === 2) {
                const d = db2(e.touches[0], e.touches[1]);
                if (this.p0 > 0) {
                    const sc = Math.max(.2, Math.min(5, d / (this.p0 || d)));
                    this.applyZoomAround(this.pMidX, this.pMidY, sc);
                }
                this.p0 = d;
            } else if (!this.pinch && e.touches.length === 1) {
                mm(e.touches[0].clientX - r.left, Date.now());
            }
        }, { passive: false });
        this.canvas.addEventListener("touchend", e => {
            e.touches.length < 2 && (this.pinch = 0, this.p0 = 0);
            e.touches.length === 0 && mu();
        }, { passive: false });
        this.canvas.addEventListener("touchcancel", () => {
            this.pinch = 0; this.p0 = 0; mu();
        }, { passive: false });
    }

    loop() { this.draw(); requestAnimationFrame(() => this.loop()); }
}

/* ════════════════════════════════════════════════════════════════
   ★ INIT
   ════════════════════════════════════════════════════════════════ */
window.chart         = new AdvancedTradingChart();
window.masterManager = new ChartMasterManager();

async function initChartSystem() {
    try {
        const isMaster = await window.masterManager.claimMaster(window.chart.currentPair);
        await window.chart.loadCandlesFromFirebase(null, isMaster);
        console.log(`✅ Chart ready | ${isMaster ? '🎯 Master' : '👁️ Viewer'} | ${window.chart.currentPair}`);
    } catch (e) {
        console.error('initChartSystem error:', e);
        await window.chart.loadCandlesFromFirebase(null, true);
    }
}

initChartSystem();
loadActiveTrades();

/* ════════════════════════════════════════════════════════════════
   TIME SELECTOR
   ════════════════════════════════════════════════════════════════ */
const timeSelector    = document.getElementById("timeSelector");
const timeDropdown    = document.getElementById("timeDropdown");
const timeDisplay     = document.getElementById("timeDisplay");
const tabCompensation = document.getElementById("tabCompensation");
const tabCustom       = document.getElementById("tabCustom");
const compensationList= document.getElementById("compensationList");
const amountDisplay   = document.getElementById("amountDisplay");
const amountContainer = document.getElementById("amountContainer");

let isEditingTime = false, savedTimeValue = "00:05";

timeSelector.addEventListener("click", e => {
    e.stopPropagation();
    if (!isEditingTime) timeDropdown.classList.toggle("show");
});

document.addEventListener("click", () => {
    timeDropdown.classList.remove("show");
    if (isEditingTime) { timeDisplay.textContent = savedTimeValue; isEditingTime = false; }
});

timeDropdown.addEventListener("click", e => e.stopPropagation());

tabCompensation.addEventListener("click", () => {
    tabCompensation.classList.add("active"); tabCustom.classList.remove("active");
    compensationList.style.display = "grid";
    if (isEditingTime) { timeDisplay.textContent = savedTimeValue; isEditingTime = false; }
});

tabCustom.addEventListener("click", () => {
    tabCustom.classList.add("active"); tabCompensation.classList.remove("active");
    compensationList.style.display = "none";
    timeDisplay.textContent = ""; isEditingTime = true;
    setTimeout(() => timeDisplay.focus(), 50);
});

compensationList.addEventListener("click", e => {
    if (e.target.classList.contains("dropdown-item")) {
        savedTimeValue = e.target.textContent;
        timeDisplay.textContent = savedTimeValue;
        chart.selectedTime = parseInt(e.target.getAttribute("data-sec"));
        timeDropdown.classList.remove("show");
    }
});

timeDisplay.addEventListener("input", e => {
    if (isEditingTime) {
        let v = e.target.textContent.replace(/[^0-9]/g, "");
        if (v.length > 4) v = v.slice(0, 4);
        e.target.textContent = v;
    }
});

timeDisplay.addEventListener("blur", () => {
    if (isEditingTime) {
        let v = timeDisplay.textContent.replace(/[^0-9]/g, "");
        if (v.length === 0) v = "0005";
        v = v.padStart(4, "0");
        const h = v.slice(0, 2), m = v.slice(2, 4);
        savedTimeValue = `${h}:${m}`;
        timeDisplay.textContent = savedTimeValue;
        isEditingTime = false;
    }
});

/* ════════════════════════════════════════════════════════════════
   AMOUNT INPUT
   ════════════════════════════════════════════════════════════════ */
amountContainer.addEventListener("click", () => amountDisplay.focus());

amountDisplay.addEventListener("focus", function () {
    let v = this.value.replace("$", "");
    this.value = v;
    setTimeout(() => this.setSelectionRange(0, this.value.length), 10);
});

amountDisplay.addEventListener("input", function () {
    this.value = this.value.replace(/[^0-9]/g, "");
});

amountDisplay.addEventListener("blur", function () {
    let val = parseFloat(this.value) || 50;
    this.value = val + "$";
});

amountDisplay.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); this.blur(); }
});

/* ════════════════════════════════════════════════════════════════
   BUY / SELL BUTTONS
   ════════════════════════════════════════════════════════════════ */
document.getElementById("buyBtn").addEventListener("click",  () => openTrade("buy"));
document.getElementById("sellBtn").addEventListener("click", () => openTrade("sell"));

/* ════════════════════════════════════════════════════════════════
   HISTORY PANEL  –  التبويبات + الإغلاق
   ════════════════════════════════════════════════════════════════ */
function openHistoryPanel() {
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

document.getElementById('navHistory').addEventListener('click', openHistoryPanel);
document.getElementById('historyNavBtn').addEventListener('click', openHistoryPanel);
document.getElementById('historyCloseBtn').addEventListener('click', closeHistoryPanel);

document.querySelectorAll('#historyPanel .htab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('#historyPanel .htab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadHistory();
    });
});
