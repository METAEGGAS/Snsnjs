import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, where, serverTimestamp, doc, getDoc, setDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

const firebaseConfig = {apiKey: "AIzaSyBOUqLixfphg3b8hajc4hkwV-VJmldGBVw",authDomain: "randers-c640b.firebaseapp.com",projectId: "randers-c640b",storageBucket: "randers-c640b.firebasestorage.app",messagingSenderId: "391496092929",appId: "1:391496092929:web:58208b4eb3e6f9a8571f00",measurementId: "G-DBDSVVF7PS"};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/* ============================================================
   💉 حقن CSS مربع تبديل الحسابات
   ============================================================ */
(function injectAccMenuStyles() {
  if (document.getElementById('qtAccMenuCSS')) return;
  const st = document.createElement('style');
  st.id = 'qtAccMenuCSS';
  st.textContent = `
    .qt-bal-wrap{position:relative;display:inline-flex;align-items:center;cursor:pointer;z-index:2601}
    .qt-acc-menu{
      position:absolute;
      top:calc(100% + 10px);
      left:0;
      width:248px;
      background:linear-gradient(145deg,#101a2f 0%,#0d1117 100%);
      border:2px solid rgba(255,255,255,.10);
      border-radius:16px;
      box-shadow:0 12px 40px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.04) inset;
      padding:10px;
      z-index:99999;
      display:none;
      animation:qtMenuIn .18s cubic-bezier(.34,1.3,.64,1) both;
    }
    .qt-acc-menu.show{display:block}
    @keyframes qtMenuIn{
      from{opacity:0;transform:translateY(-8px) scale(.97)}
      to{opacity:1;transform:translateY(0) scale(1)}
    }
    .qt-acc-switch{
      display:flex;gap:7px;
      background:#0d1117;
      border-radius:10px;padding:4px;margin-bottom:11px;
    }
    .qt-sw-btn{
      flex:1;padding:8px 4px;border-radius:8px;
      font-size:11px;font-weight:900;letter-spacing:.4px;
      transition:.2s;border:1.5px solid transparent;
      display:flex;align-items:center;justify-content:center;gap:5px;
      background:transparent;color:#fff;cursor:pointer;
    }
    .qt-sw-btn.qt-live{color:#00ff41}
    .qt-sw-btn.qt-demo{color:#ffd700}
    .qt-sw-btn.active{background:rgba(255,255,255,.10);border-color:currentColor;box-shadow:0 0 8px rgba(255,255,255,.08)}
    .qt-acc-item{
      background:rgba(255,255,255,.03);
      border:1.3px solid rgba(255,255,255,.10);
      border-radius:12px;padding:10px 12px;margin-bottom:9px;
      cursor:pointer;transition:.15s;
      display:flex;align-items:center;justify-content:space-between;gap:10px;
    }
    .qt-acc-item:hover{background:rgba(255,255,255,.06);transform:translateY(-1px)}
    .qt-acc-item.active{
      background:linear-gradient(135deg,rgba(66,153,225,.16) 0%,rgba(49,130,206,.10) 100%);
      border-color:#4299e1;
      box-shadow:0 0 14px rgba(66,153,225,.22);
    }
    .qt-acc-left{display:flex;align-items:center;gap:10px;min-width:0}
    .qt-acc-ico{width:26px;height:26px;object-fit:contain;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.4)}
    .qt-acc-info{display:flex;flex-direction:column;gap:2px}
    .qt-acc-label{font-size:10px;color:rgba(255,255,255,.45);font-weight:700;letter-spacing:.4px;text-transform:uppercase}
    .qt-acc-amt{font-size:16px;font-weight:1000;color:#fff;white-space:nowrap}
    .qt-acc-badge{
      font-size:9px;font-weight:900;letter-spacing:.6px;
      padding:3px 7px;border-radius:6px;white-space:nowrap;
    }
    .qt-acc-badge.live{background:rgba(0,255,65,.12);color:#00ff41;border:1px solid rgba(0,255,65,.3)}
    .qt-acc-badge.demo{background:rgba(255,215,0,.12);color:#ffd700;border:1px solid rgba(255,215,0,.3)}
    .qt-refill-btn{
      width:100%;
      background:linear-gradient(135deg,#4299e1 0%,#3182ce 100%);
      border-radius:10px;padding:10px;
      font-size:12px;font-weight:1000;color:#fff;
      letter-spacing:.5px;cursor:pointer;
      box-shadow:0 4px 14px rgba(66,153,225,.35);
      transition:.2s;border:none;
    }
    .qt-refill-btn:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(66,153,225,.45)}
    .qt-refill-btn:active{transform:scale(.97)}
  `;
  document.head.appendChild(st);
})();

/* ============================================================
   🔐 AuthManager — مع مربع تبديل الحسابات المدمج
   ============================================================ */
class AuthManager {
  constructor() {
    this.user         = null;
    this.unsubscribeBalance = null;
    this.balanceEl    = document.getElementById("userBalance");

    // حالة الحسابات
    this.activeAccount = 'demo';
    this.realBalance   = 0;
    this.demoBalance   = 10000;
    this.menuVisible   = false;

    // بناء واجهة المنيو
    this.initMenuUI();
    // تهيئة المصادقة
    this.init();
  }

  /* ── بناء HTML + أحداث المنيو ── */
  initMenuUI() {
    const balEl = this.balanceEl;
    if (!balEl) return;

    const wrap = balEl.parentElement;
    if (!wrap) return;

    // إضافة الكلاس الوالد لتحديد الموضع
    wrap.classList.add('qt-bal-wrap');

    // إنشاء حاوية المنيو
    const menu = document.createElement('div');
    menu.id        = 'qtAccMenu';
    menu.className = 'qt-acc-menu';
    menu.innerHTML = `
      <!-- زر التبديل LIVE / Demo -->
      <div class="qt-acc-switch">
        <button class="qt-sw-btn qt-live"  data-acc="real">● LIVE</button>
        <button class="qt-sw-btn qt-demo active" data-acc="demo">◆ Demo</button>
      </div>

      <!-- حساب حقيقي -->
      <div class="qt-acc-item" data-type="real">
        <div class="qt-acc-left">
          <img class="qt-acc-ico" src="https://flagcdn.com/w40/us.png" alt="USD">
          <div class="qt-acc-info">
            <div class="qt-acc-label">Real Account</div>
            <div class="qt-acc-amt" id="qtRealAmt">$0.00</div>
          </div>
        </div>
        <div class="qt-acc-badge live">LIVE</div>
      </div>

      <!-- حساب تجريبي -->
      <div class="qt-acc-item active" data-type="demo">
        <div class="qt-acc-left">
          <img class="qt-acc-ico" src="https://cdn-icons-png.flaticon.com/128/1344/1344761.png" alt="Demo">
          <div class="qt-acc-info">
            <div class="qt-acc-label">Demo Account</div>
            <div class="qt-acc-amt" id="qtDemoAmt">$10,000.00</div>
          </div>
        </div>
        <div class="qt-acc-badge demo">DEMO</div>
      </div>

      <!-- زر إعادة الشحن -->
      <button class="qt-refill-btn" id="qtRefillBtn">🔄 Refill Demo Account</button>
    `;
    wrap.appendChild(menu);

    /* ── فتح/إغلاق المنيو عند الضغط على الرصيد ── */
    wrap.addEventListener('click', (e) => {
      e.stopPropagation();
      if (e.target.closest('#qtAccMenu')) return;
      this.toggleMenu();
    });

    /* ── إغلاق عند الضغط خارجه ── */
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.qt-bal-wrap')) this.closeMenu();
    });

    /* ── أزرار LIVE / Demo ── */
    menu.querySelectorAll('.qt-sw-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = btn.dataset.acc;
        this.switchAccount(type);
        menu.querySelectorAll('.qt-sw-btn').forEach(b => b.classList.toggle('active', b === btn));
        menu.querySelectorAll('.qt-acc-item').forEach(it => it.classList.toggle('active', it.dataset.type === type));
      });
    });

    /* ── عناصر الحسابات ── */
    menu.querySelectorAll('.qt-acc-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const type = item.dataset.type;
        this.switchAccount(type);
        menu.querySelectorAll('.qt-acc-item').forEach(i => i.classList.toggle('active', i === item));
        menu.querySelectorAll('.qt-sw-btn').forEach(b => b.classList.toggle('active', b.dataset.acc === type));
        this.closeMenu();
      });
    });

    /* ── زر إعادة شحن Demo ── */
    document.getElementById('qtRefillBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.demoBalance = 10000;
      const el = document.getElementById('qtDemoAmt');
      if (el) el.textContent = '$10,000.00';
      if (this.activeAccount === 'demo' && this.balanceEl)
        this.balanceEl.textContent = '$10,000.00';
      const btn = document.getElementById('qtRefillBtn');
      btn.textContent = '✅ Refilled!';
      setTimeout(() => { btn.textContent = '🔄 Refill Demo Account'; }, 1500);
    });
  }

  toggleMenu() {
    const menu = document.getElementById('qtAccMenu');
    if (!menu) return;
    this.menuVisible = !this.menuVisible;
    menu.classList.toggle('show', this.menuVisible);
  }

  closeMenu() {
    const menu = document.getElementById('qtAccMenu');
    if (!menu) return;
    this.menuVisible = false;
    menu.classList.remove('show');
  }

  switchAccount(type) {
    this.activeAccount = type;
    if (!this.balanceEl) return;
    this.balanceEl.textContent = type === 'real'
      ? `$${this.realBalance.toFixed(2)}`
      : `$${this.demoBalance.toFixed(2)}`;
  }

  /* ── تهيئة Firebase Auth ── */
  async init() {
    onAuthStateChanged(auth, async (u) => {
      if (u) {
        this.user = u;
        await this.loadUserBalance();
      } else {
        if (this.balanceEl)
          this.balanceEl.textContent = this.activeAccount === 'demo'
            ? `$${this.demoBalance.toFixed(2)}`
            : '$0.00';
      }
    });
  }

  async loadUserBalance() {
    const userRef  = doc(db, "users", this.user.email);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists() || !userSnap.data().balance) {
      await setDoc(userRef, { balance: 0, email: this.user.email, createdAt: serverTimestamp() }, { merge: true });
    }
    this.unsubscribeBalance = onSnapshot(userRef, (d) => {
      const data = d.data();
      if (data) {
        this.realBalance = data.balance !== undefined ? data.balance : 0;
        const realEl = document.getElementById('qtRealAmt');
        if (realEl) realEl.textContent = `$${this.realBalance.toFixed(2)}`;
        // تحديث الشاشة الرئيسية فقط لو الحساب الحقيقي هو الفعّال
        if (this.activeAccount === 'real' && this.balanceEl)
          this.balanceEl.textContent = `$${this.realBalance.toFixed(2)}`;
      }
    });
  }

  async updateBalance(amount) {
    if (!this.user) return;
    const userRef  = doc(db, "users", this.user.email);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const currentBalance = userSnap.data().balance || 0;
      await updateDoc(userRef, { balance: currentBalance + amount });
    }
  }
}

/* ============================================================
   💾 LocalStorageManager — مع دعم الأزواج ✅
   ============================================================ */
class LocalStorageManager {
  constructor(){
    this.CANDLES_KEY='qt_trading_candles';
    this.LAST_SYNC_KEY='qt_last_sync';
  }
  /* مفاتيح ديناميكية حسب الزوج */
  _ck(pair){return pair?'qt_trading_candles_'+pair.replace('/','_'):this.CANDLES_KEY;}
  _sk(pair){return pair?'qt_last_sync_'+pair.replace('/','_'):this.LAST_SYNC_KEY;}

  saveCandles(candles,pair){
    try{
      localStorage.setItem(this._ck(pair),JSON.stringify(candles));
      localStorage.setItem(this._sk(pair),Date.now().toString());
      console.log('✅ Candles saved:',candles.length,'pair:',pair||'default');
    }catch(e){console.error('❌ Save error:',e);}
  }
  loadCandles(pair){
    try{
      const data=localStorage.getItem(this._ck(pair));
      if(data){const candles=JSON.parse(data);console.log('✅ Candles loaded:',candles.length,'pair:',pair||'default');return candles;}
    }catch(e){console.error('❌ Load error:',e);}
    return null;
  }
  getLastSyncTime(){const t=localStorage.getItem(this.LAST_SYNC_KEY);return t?parseInt(t):0;}
  clear(){localStorage.removeItem(this.CANDLES_KEY);localStorage.removeItem(this.LAST_SYNC_KEY);console.log('🗑️ Storage cleared');}
}

/* ============================================================
   🔥 FirebaseManager — مع دعم تبديل الأزواج ✅
   ============================================================ */
class FirebaseManager {
  constructor(){
    this.db=db;
    this.candlesCollection='candles'; // سيتم تغييره عند setPair
    this.saveBatchSize=50;
    this.saveInterval=30000;
    this.lastSaveTime=0;
    this.pendingCandles=[];
    this.isSaving=false;
    this.startAutoSave();
  }

  /* ✅ تغيير كوليكشن Firebase حسب الزوج */
  setPair(pairName){
    const key='candles_'+pairName.replace('/','_');
    if(this.candlesCollection!==key){
      this.candlesCollection=key;
      this.pendingCandles=[];
      console.log('🔄 Firebase collection switched to:',key);
    }
  }

  async saveCandles(candles){if(this.isSaving){console.log('⏳ Save in progress...');return false;}try{this.isSaving=true;console.log('💾 Saving candles:',candles.length);const batch=[];for(const candle of candles){const candleData={open:candle.open,high:candle.high,low:candle.low,close:candle.close,timestamp:candle.timestamp,savedAt:serverTimestamp()};batch.push(candleData);if(batch.length>=this.saveBatchSize){await this.saveBatch(batch);batch.length=0;await this.delay(100);}}if(batch.length>0){await this.saveBatch(batch);}this.lastSaveTime=Date.now();console.log('✅ Saved to Firebase');return true;}catch(e){console.error('❌ Save error:',e);return false;}finally{this.isSaving=false;}}
  async saveBatch(batch){const promises=batch.map(candleData=>addDoc(collection(this.db,this.candlesCollection),candleData));await Promise.all(promises);console.log(`✅ Batch saved: ${batch.length}`);}
  async loadCandles(maxCandles=200){try{console.log('📥 Loading from Firebase collection:',this.candlesCollection);const q=query(collection(this.db,this.candlesCollection),orderBy('timestamp','desc'),limit(maxCandles));const querySnapshot=await getDocs(q);const candles=[];querySnapshot.forEach((doc)=>{const data=doc.data();candles.push({open:data.open,high:data.high,low:data.low,close:data.close,timestamp:data.timestamp});});candles.reverse();console.log('✅ Loaded from Firebase:',candles.length);return candles;}catch(e){console.error('❌ Load error:',e);return null;}}
  async clearOldCandles(daysToKeep=7){try{const cutoffTime=Date.now()-(daysToKeep*24*60*60*1000);const q=query(collection(this.db,this.candlesCollection),where('timestamp','<',cutoffTime));const querySnapshot=await getDocs(q);console.log(`🗑️ Found ${querySnapshot.size} old candles`);}catch(e){console.error('❌ Clear error:',e);}}
  addPendingCandle(candle){this.pendingCandles.push(candle);}
  startAutoSave(){setInterval(async()=>{if(this.pendingCandles.length>0&&!this.isSaving){const candlesToSave=[...this.pendingCandles];this.pendingCandles=[];await this.saveCandles(candlesToSave);}},this.saveInterval);}
  delay(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
}

/* ============================================================
   ⏰ updateLiveTime — بدون تغيير
   ============================================================ */
function updateLiveTime(){const d=new Date();const u=d.getTime()+d.getTimezoneOffset()*60000;const t=new Date(u+(3*3600000));const h=String(t.getHours()).padStart(2,"0");const m=String(t.getMinutes()).padStart(2,"0");const s=String(t.getSeconds()).padStart(2,"0");document.getElementById("liveTime").textContent=`${h}:${m}:${s} UTC+3`;}updateLiveTime();setInterval(updateLiveTime,1000);

/* ============================================================
   📊 AdvancedTradingChart — مع دعم تبديل الأزواج ✅
   ============================================================ */
class AdvancedTradingChart {
  constructor(){
    this.plot=document.getElementById("plot");
    this.canvas=document.getElementById("chartCanvas");
    this.ctx=this.canvas.getContext("2d");
    this.timeLabels=document.getElementById("timeLabels");
    this.candleTimer=document.getElementById("candleTimer");
    this.priceLine=document.getElementById("priceLine");
    this.priceScaleLabels=document.getElementById("priceScaleLabels");
    this.currentPriceEl=document.getElementById("currentPrice");
    this.loadingOverlay=document.getElementById("loadingOverlay");
    this.authManager=new AuthManager();
    this.localStorageManager=new LocalStorageManager();
    this.firebaseManager=new FirebaseManager();

    /* ✅ إعدادات الأزواج — كل زوج له: سعر قاعدي، أرقام عشرية، seed، مقياس تذبذب */
    this.PAIR_CONFIG={
      'EUR/USD':{base:1.9500,digits:5,seed:11001,volScale:1},
      'AUD/CAD':{base:0.9100,digits:5,seed:22001,volScale:0.95},
      'AUD/CHF':{base:0.5700,digits:5,seed:33001,volScale:0.6},
      'BHD/CNY':{base:2.6500,digits:4,seed:44001,volScale:2.7},
      'EUR/RUB':{base:98.000,digits:3,seed:55001,volScale:100},
      'KES/USD':{base:0.0077,digits:6,seed:66001,volScale:0.008},
      'LBP/USD':{base:0.0111,digits:6,seed:77001,volScale:0.011},
      'QAR/CNY':{base:1.9800,digits:5,seed:88001,volScale:2},
      'USD/CHF':{base:0.8900,digits:5,seed:99001,volScale:0.9},
      'SYP/TRY':{base:0.2800,digits:5,seed:10501,volScale:0.3},
      'EGP/USD':{base:0.0205,digits:5,seed:11501,volScale:0.021},
      'USD/INR':{base:83.500,digits:3,seed:12501,volScale:85},
      'AED/CNY':{base:1.9800,digits:5,seed:13501,volScale:2}
    };

    /* ✅ الزوج الحالي — يبدأ بـ EUR/USD */
    this.currentPair='EUR/USD';
    this.isSwitching=false;   // منع التبديل المتزامن
    this.volScale=1;           // مقياس التذبذب للزوج الحالي

    /* ✅ ضبط Firebase collection للزوج الافتراضي */
    this.firebaseManager.setPair(this.currentPair);

    this.candles=[];
    this.currentCandle=null;
    this.maxCandles=200;
    this.basePrice=1.95;
    this.currentPrice=1.9518;
    this.seed=11001;
    this.digits=5;
    this.priceRange={min:1.9,max:2};
    this.baseSpacing=12;
    this.zoom=1;
    this.targetZoom=1;
    this.minZoom=0.425;
    this.maxZoom=2.25;
    this.zoomEase=0.28;
    this.targetOffsetX=0;
    this.offsetX=0;
    this.panEase=0.38;
    this.velocity=0;
    this.drag=0;
    this.dragStartX=0;
    this.dragStartOffset=0;
    this.lastDragX=0;
    this.lastDragTime=0;
    this.pinch=0;
    this.p0=0;
    this.pMidX=0;
    this.pMidY=0;
    this.timeframe=60000;
    this.t0=Math.floor(Date.now()/60000)*60000;
    this.smin=null;
    this.smax=null;
    this.sre=0.088;
    this._fr=0;
    this.markers=[];
    this.selectedTime=5;
    this.dataLoaded=false;
    this.usingLocalStorage=false;
    this.setup();
    this.initData();
  }

  async initData(){
    this.showLoading(true);
    try{
      console.log('📄 Loading from Firebase collection:',this.firebaseManager.candlesCollection);
      const firebaseCandles=await this.firebaseManager.loadCandles(this.maxCandles);
      if(firebaseCandles&&firebaseCandles.length>0){
        console.log('✅ Using Firebase data');
        this.candles=firebaseCandles;
        this.usingLocalStorage=false;
        this.localStorageManager.saveCandles(this.candles,this.currentPair); // ✅
      }else{
        console.log('⚠️ No Firebase data, trying local...');
        const localCandles=this.localStorageManager.loadCandles(this.currentPair); // ✅
        if(localCandles&&localCandles.length>0){
          console.log('✅ Using local data');
          this.candles=localCandles;
          this.usingLocalStorage=true;
        }else{
          console.log('🔨 Generating new data...');
          this.initHistoricalData();
          this.usingLocalStorage=true;
        }
      }
      if(this.candles.length>0){this.currentPrice=this.candles[this.candles.length-1].close;}
      this.snapToLive();
      this.updateTimeLabels();
      this.updatePriceRange();
      this.smin=this.priceRange.min;
      this.smax=this.priceRange.max;
      this.updatePriceScale();
      this.updatePriceLabel();
      this.dataLoaded=true;
      this.initEvents();
      this.startRealtime();
      this.loop();
    }catch(e){
      console.error('❌ Init error:',e);
      this.initHistoricalData();
      this.usingLocalStorage=true;
      this.dataLoaded=true;
      this.initEvents();
      this.startRealtime();
      this.loop();
    }finally{
      this.showLoading(false);
    }
  }

  showLoading(show){if(this.loadingOverlay){if(show){this.loadingOverlay.classList.add('show');}else{this.loadingOverlay.classList.remove('show');}}}
  setup(){const dpr=window.devicePixelRatio||1;const r=this.plot.getBoundingClientRect();this.w=r.width;this.h=r.height-24;this.canvas.width=this.w*dpr;this.canvas.height=this.h*dpr;this.canvas.style.width=this.w+"px";this.canvas.style.height=this.h+"px";this.ctx.scale(dpr,dpr);if(this.dataLoaded){this.updatePriceLabel();this.updatePriceScale();this.updateTimeLabels();}}
  rnd(s){const x=Math.sin(s)*10000;return x-Math.floor(x);}
  rndG(s){const u1=this.rnd(s);const u2=this.rnd(s+100000);return Math.sqrt(-2*Math.log(u1+0.00001))*Math.cos(2*Math.PI*u2);}

  genCandle(t,o){
    const s=this.seed+Math.floor(t/this.timeframe);
    const vb=0.0008*(this.volScale||1); // ✅ مقياس التذبذب حسب الزوج
    const tb=0.00005*(this.volScale||1);
    const r1=this.rndG(s);const r2=this.rndG(s+1);const r3=this.rndG(s+2);
    const r4=this.rnd(s+3);const r5=this.rnd(s+4);const r6=this.rnd(s+5);
    const v=vb*(0.7+Math.abs(r1)*0.8);
    const tr=tb*r2*0.6;
    const dir=r3>0?1:-1;
    const tc=o+(dir*v+tr);
    const rg=v*(0.2+r4*0.6);
    const hm=rg*(0.3+r5*0.7);
    const lm=rg*(0.3+(1-r5)*0.7);
    const c=+(tc+(r6-0.5)*v*0.1).toFixed(this.digits);
    const op=+o.toFixed(this.digits);
    return{open:op,close:c,high:+Math.max(op,c,op+hm,c+hm).toFixed(this.digits),low:+Math.min(op,c,op-lm,c-lm).toFixed(this.digits),timestamp:t};
  }

  initHistoricalData(){
    let p=this.basePrice;
    let t=Date.now()-this.maxCandles*this.timeframe;
    for(let i=0;i<this.maxCandles;i++){
      const c=this.genCandle(t,p);
      this.candles.push(c);
      p=c.close;
      t+=this.timeframe;
    }
    this.currentPrice=this.candles[this.candles.length-1].close;
    this.localStorageManager.saveCandles(this.candles,this.currentPair); // ✅
  }

  getSpacing(){return this.baseSpacing*this.zoom;}
  getCandleWidth(){return this.getSpacing()*0.8;}
  getMinOffset(){return this.w/2-this.candles.length*this.getSpacing();}
  getMaxOffset(){return this.w/2;}
  clampPan(){const mn=this.getMinOffset();const mx=this.getMaxOffset();this.targetOffsetX=Math.max(mn,Math.min(mx,this.targetOffsetX));this.offsetX=Math.max(mn,Math.min(mx,this.offsetX));}
  snapToLive(){this.targetOffsetX=this.getMinOffset();this.offsetX=this.targetOffsetX;this.velocity=0;this.clampPan();}
  updatePan(){const diff=this.targetOffsetX-this.offsetX;if(Math.abs(diff)>0.003){this.offsetX+=diff*this.panEase;}else{this.offsetX=this.targetOffsetX;}if(Math.abs(this.velocity)>0.01){this.targetOffsetX+=this.velocity;this.velocity*=0.972;this.clampPan();}else{this.velocity=0;}}
  tickZoom(){const d=this.targetZoom-this.zoom;if(Math.abs(d)>0.0001){this.zoom+=d*this.zoomEase;}else{this.zoom=this.targetZoom;}}
  tickSR(){const r=this.priceRange;if(this.smin===null){this.smin=r.min;this.smax=r.max;return;}this.smin+=(r.min-this.smin)*this.sre;this.smax+=(r.max-this.smax)*this.sre;}
  applyZoomAround(mx,my,sc){const oz=this.targetZoom;const nz=Math.max(this.minZoom,Math.min(this.maxZoom,oz*sc));if(Math.abs(nz-oz)<0.000001)return;const idx=this.xToIndex(mx);this.targetZoom=nz;this.zoom=nz;const nx=mx-idx*this.getSpacing();this.targetOffsetX=nx;this.offsetX=nx;this.clampPan();this.updateTimeLabels();}
  indexToX(i){return this.offsetX+i*this.getSpacing();}
  xToIndex(x){return(x-this.offsetX)/this.getSpacing();}
  getPriceRange(){const mn=this.smin!==null?this.smin:this.priceRange.min;const mx=this.smax!==null?this.smax:this.priceRange.max;return{min:mn,max:mx};}
  niceNum(v,rnd){const e=Math.floor(Math.log10(v));const p=Math.pow(10,e);const f=v/p;let nf;if(rnd){if(f<1.5)nf=1;else if(f<3)nf=2;else if(f<7)nf=5;else nf=10;}else{if(f<=1)nf=1;else if(f<=2)nf=2;else if(f<=5)nf=5;else nf=10;}return nf*p;}
  calcNiceGrid(){const r=this.getPriceRange();const rng=r.max-r.min;const d=this.niceNum(rng/7,false);const g0=Math.floor(r.min/d)*d;const g1=Math.ceil(r.max/d)*d;return{min:g0,max:g1,step:d,count:Math.round((g1-g0)/d)};}
  drawGrid(){const{min,max,step,count}=this.calcNiceGrid();for(let i=0;i<=count;i++){const p=min+i*step;const y=this.priceToY(p);if(y<-5||y>this.h+5)continue;const mj=i%5===0;this.ctx.strokeStyle=mj?"rgba(255,215,0,.12)":"rgba(255,255,255,.05)";this.ctx.lineWidth=mj?1:0.8;this.ctx.beginPath();this.ctx.moveTo(0,y+0.5);this.ctx.lineTo(this.w,y+0.5);this.ctx.stroke();}const visC=this.w/this.getSpacing();const targetL=9;const stepC=Math.max(1,Math.round(visC/targetL));const s=Math.floor(this.xToIndex(0));const e=Math.ceil(this.xToIndex(this.w));for(let i=s;i<=e;i++){if(i%stepC!==0)continue;const x=this.indexToX(i);if(x<-5||x>this.w+5)continue;const mj=i%Math.round(stepC*5)===0;this.ctx.strokeStyle=mj?"rgba(255,215,0,.12)":"rgba(255,255,255,.05)";this.ctx.lineWidth=mj?1:0.8;this.ctx.beginPath();this.ctx.moveTo(x+0.5,0);this.ctx.lineTo(x+0.5,this.h);this.ctx.stroke();}}
  updateTimeLabels(){const tl=this.timeLabels;tl.innerHTML="";const visC=this.w/this.getSpacing();const targetL=9;const stepC=Math.max(1,Math.round(visC/targetL));const s=Math.floor(this.xToIndex(0));const e=Math.ceil(this.xToIndex(this.w));const tS=this.candles.length?this.candles[0].timestamp:this.t0;for(let i=s;i<=e;i++){if(i%stepC!==0)continue;const x=this.indexToX(i);if(x<5||x>this.w-5)continue;const t=tS+i*this.timeframe;const d=new Date(t);const hh=String(d.getHours()).padStart(2,"0");const mm=String(d.getMinutes()).padStart(2,"0");const lb=document.createElement("div");lb.className="timeLabel";if(i%Math.round(stepC*5)===0){lb.classList.add("major");}lb.style.left=x+"px";lb.textContent=`${hh}:${mm}`;tl.appendChild(lb);}}
  updatePriceScale(){const{min,step,count}=this.calcNiceGrid();let h="";for(let i=0;i<=count;i++){const p=min+i*step;const y=this.priceToY(p);if(y<-8||y>this.h+8)continue;const mj=i%5===0;h+=`<div class="pLabel${mj?" major":""}" style="top:${y}px">${p.toFixed(this.digits)}</div>`;}this.priceScaleLabels.innerHTML=h;}
  updatePriceLabel(){const py=this.priceToY(this.currentPrice);this.priceLine.style.top=py+"px";this.currentPriceEl.style.top=py+"px";this.currentPriceEl.textContent=this.currentPrice.toFixed(this.digits);}
  updateCandleTimer(){if(!this.currentCandle)return;const n=Date.now();const e=n-this.t0;const r=this.timeframe-e;const s=Math.floor(r/1000);this.candleTimer.textContent=s>=0?s:0;const cx=this.indexToX(this.candles.length);this.candleTimer.style.left=cx+15+"px";this.candleTimer.style.top="10px";this.candleTimer.style.display='block';}
  priceToY(p){const r=this.getPriceRange();const n=(p-r.min)/(r.max-r.min);return this.h*(1-n);}
  drawCandle(c,x,glow){const oy=this.priceToY(c.open);const cy=this.priceToY(c.close);const hy=this.priceToY(c.high);const ly=this.priceToY(c.low);const b=c.close>=c.open;const w=this.getCandleWidth();this.ctx.strokeStyle=b?"#0f0":"#f00";this.ctx.lineWidth=Math.max(1,0.18*w);this.ctx.beginPath();this.ctx.moveTo(x,hy);this.ctx.lineTo(x,ly);this.ctx.stroke();const bh=Math.max(1,Math.abs(cy-oy));const bt=Math.min(oy,cy);const g=this.ctx.createLinearGradient(x,bt,x,bt+bh);if(b){g.addColorStop(0,"#0f0");g.addColorStop(0.5,"#0f0");g.addColorStop(1,"#0c0");}else{g.addColorStop(0,"#f00");g.addColorStop(0.5,"#f00");g.addColorStop(1,"#c00");}this.ctx.fillStyle=g;if(glow){this.ctx.shadowColor=b?"rgba(0,255,0,.8)":"rgba(255,0,0,.8)";this.ctx.shadowBlur=12;}this.ctx.fillRect(x-w/2,bt,w,bh);if(glow){this.ctx.shadowBlur=0;}}
  addMarker(t){const op=this.currentPrice;const c=this.currentCandle;if(!c)return;const bt=Math.max(c.open,c.close);const bb=Math.min(c.open,c.close);let fp=op;if(op>bt){fp=bt;}else if(op<bb){fp=bb;}const fi=this.candles.length;this.markers.push({type:t,ts:Date.now(),price:fp,candleIndex:fi,candleTimestamp:c.timestamp});}
  drawMarker(m){let actualIdx=m.candleIndex;for(let i=0;i<this.candles.length;i++){if(this.candles[i].timestamp===m.candleTimestamp){actualIdx=i;break;}}const x=this.indexToX(actualIdx);if(x<-200||x>this.w+50)return;const y=this.priceToY(m.price);const w=this.getCandleWidth();const ib=m.type==="buy";const cl=ib?"#16a34a":"#ff3b3b";const r=5.5;this.ctx.save();const lsx=x;this.ctx.shadowColor=cl;this.ctx.shadowBlur=9;this.ctx.fillStyle=cl;this.ctx.beginPath();this.ctx.arc(x,y,r,0,2*Math.PI);this.ctx.fill();this.ctx.shadowBlur=0;this.ctx.fillStyle="#fff";this.ctx.save();this.ctx.translate(x,y);if(!ib)this.ctx.rotate(Math.PI);this.ctx.beginPath();this.ctx.moveTo(0,-2.8);this.ctx.lineTo(-2,0.8);this.ctx.lineTo(-0.65,0.8);this.ctx.lineTo(-0.65,2.8);this.ctx.lineTo(0.65,2.8);this.ctx.lineTo(0.65,0.8);this.ctx.lineTo(2,0.8);this.ctx.closePath();this.ctx.fill();this.ctx.restore();const lx=lsx+w/2+3;const lw=Math.min(95,this.w-lx-22);this.ctx.strokeStyle=ib?"rgba(22,163,74,.7)":"rgba(255,59,59,.7)";this.ctx.lineWidth=1.2;this.ctx.beginPath();this.ctx.moveTo(lsx+w/2,y);this.ctx.lineTo(lx,y);this.ctx.stroke();this.ctx.beginPath();this.ctx.moveTo(lx,y);this.ctx.lineTo(lx+lw,y);this.ctx.stroke();const ex=lx+lw;const er=5;this.ctx.strokeStyle=cl;this.ctx.lineWidth=2;this.ctx.fillStyle="#fff";this.ctx.beginPath();this.ctx.arc(ex,y,er,0,2*Math.PI);this.ctx.fill();this.ctx.stroke();this.ctx.strokeStyle=ib?"rgba(22,163,74,.5)":"rgba(255,59,59,.5)";this.ctx.lineWidth=1.2;this.ctx.beginPath();this.ctx.moveTo(ex+er,y);this.ctx.lineTo(ex+65,y);this.ctx.stroke();this.ctx.restore();}
  draw(){this.tickZoom();this.updatePan();this.updatePriceRange();this.tickSR();this.ctx.clearRect(0,0,this.w,this.h);this.drawGrid();for(let i=0;i<this.candles.length;i++){const x=this.indexToX(i);if(x<-60||x>this.w+60)continue;this.drawCandle(this.candles[i],x,false);}if(this.currentCandle&&(!this.candles.length||this.currentCandle.timestamp!==this.candles[this.candles.length-1].timestamp)){const lx=this.indexToX(this.candles.length);if(lx>=-60&&lx<=this.w+60){this.drawCandle(this.currentCandle,lx,true);}}for(let mk of this.markers){this.drawMarker(mk);}if(++this._fr%2===0){this.updatePriceScale();this.updateTimeLabels();}this.updatePriceLabel();this.updateCandleTimer();}
  stepTowards(c,t,m){const d=t-c;return Math.abs(d)<=m?t:c+Math.sign(d)*m;}
  updateCurrentCandle(){if(!this.currentCandle){const lp=this.candles.length?this.candles[this.candles.length-1].close:this.currentPrice;this.currentCandle=this.genCandle(this.t0,lp);this.currentCandle.close=lp;this.currentCandle.high=Math.max(this.currentCandle.open,this.currentCandle.close);this.currentCandle.low=Math.min(this.currentCandle.open,this.currentCandle.close);return;}const n=Date.now();const r=this.rnd(this.seed+n);const dir=(r-0.5)*0.0004;const t=this.currentCandle.close+dir;const ms=0.0008*0.18*(this.volScale||1); // ✅
  const nc=+this.stepTowards(this.currentCandle.close,t,ms).toFixed(this.digits);this.currentCandle.close=nc;this.currentCandle.high=+Math.max(this.currentCandle.high,nc).toFixed(this.digits);this.currentCandle.low=+Math.min(this.currentCandle.low,nc).toFixed(this.digits);this.currentPrice=nc;}

  startRealtime(){
    setInterval(()=>{
      if(this.isSwitching) return; // ✅ تجاهل أثناء التبديل
      const n=Date.now();
      const e=n-this.t0;
      if(e>=this.timeframe){
        if(this.currentCandle&&(!this.candles.length||this.candles[this.candles.length-1].timestamp!==this.currentCandle.timestamp)){
          const completedCandle={...this.currentCandle};
          this.candles.push(completedCandle);
          this.saveCompletedCandle(completedCandle);
          if(this.candles.length>this.maxCandles){this.candles.shift();}
        }
        this.t0=Math.floor(n/this.timeframe)*this.timeframe;
        const lp=this.currentCandle?this.currentCandle.close:this.currentPrice;
        this.currentCandle=this.genCandle(this.t0,lp);
        this.currentCandle.open=lp;
        this.currentCandle.close=lp;
        this.currentCandle.high=lp;
        this.currentCandle.low=lp;
        this.currentPrice=lp;
      }else{
        this.updateCurrentCandle();
      }
    },200);

    setInterval(()=>{
      if(!this.isSwitching){ // ✅ لا تحفظ أثناء التبديل
        this.localStorageManager.saveCandles(this.candles,this.currentPair); // ✅
      }
    },10000);
  }

  async saveCompletedCandle(candle){
    try{this.firebaseManager.addPendingCandle(candle);console.log('🔨 Candle queued for pair:',this.currentPair);}
    catch(e){console.error('❌ Queue error:',e);}
  }

  updatePriceRange(){let v=[...this.candles];if(this.currentCandle&&(!v.length||this.currentCandle.timestamp!==v[v.length-1].timestamp)){v.push(this.currentCandle);}if(!v.length){this.priceRange={min:0.95*this.basePrice,max:1.05*this.basePrice};return;}const si=Math.floor(this.xToIndex(0));const ei=Math.ceil(this.xToIndex(this.w));const sl=v.slice(Math.max(0,si-5),Math.min(v.length,ei+5));if(!sl.length){this.priceRange={min:0.95*this.basePrice,max:1.05*this.basePrice};return;}const lo=sl.map(c=>c.low);const hi=sl.map(c=>c.high);const mn=Math.min(...lo);const mx=Math.max(...hi);const pd=0.15*(mx-mn)||0.000000001;this.priceRange={min:mn-pd,max:mx+pd};}
  initEvents(){addEventListener("resize",()=>this.setup());this.canvas.addEventListener("wheel",e=>{e.preventDefault();const r=this.canvas.getBoundingClientRect();const x=e.clientX-r.left;const y=e.clientY-r.top;const sc=e.deltaY>0?1/1.1:1.1;this.applyZoomAround(x,y,sc);},{passive:false});const md=(x,t)=>{this.drag=1;this.dragStartX=x;this.dragStartOffset=this.targetOffsetX;this.velocity=0;this.lastDragX=x;this.lastDragTime=t;};const mm=(x,t)=>{if(this.drag){const d=x-this.dragStartX;this.targetOffsetX=this.dragStartOffset+d;this.clampPan();const dt=t-this.lastDragTime;if(dt>0&&dt<80){this.velocity=(x-this.lastDragX)/dt*26;}this.lastDragX=x;this.lastDragTime=t;}};const mu=()=>{this.drag=0;this.updateTimeLabels();};this.canvas.addEventListener("mousedown",e=>{const r=this.canvas.getBoundingClientRect();md(e.clientX-r.left,Date.now());});addEventListener("mousemove",e=>{const r=this.canvas.getBoundingClientRect();mm(e.clientX-r.left,Date.now());});addEventListener("mouseup",mu);const db=(a,b)=>Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY);this.canvas.addEventListener("touchstart",e=>{const r=this.canvas.getBoundingClientRect();if(e.touches.length===1){md(e.touches[0].clientX-r.left,Date.now());}else if(e.touches.length===2){this.drag=0;this.pinch=1;this.p0=db(e.touches[0],e.touches[1]);this.pMidX=(e.touches[0].clientX+e.touches[1].clientX)/2-r.left;this.pMidY=(e.touches[0].clientY+e.touches[1].clientY)/2-r.top;}},{passive:false});this.canvas.addEventListener("touchmove",e=>{e.preventDefault();const r=this.canvas.getBoundingClientRect();if(this.pinch&&e.touches.length===2){const d=db(e.touches[0],e.touches[1]);if(this.p0>0){const sc=Math.max(0.2,Math.min(5,d/(this.p0||d)));this.applyZoomAround(this.pMidX,this.pMidY,sc);}this.p0=d;}else if(!this.pinch&&e.touches.length===1){mm(e.touches[0].clientX-r.left,Date.now());}},{passive:false});this.canvas.addEventListener("touchend",e=>{if(e.touches.length<2){this.pinch=0;this.p0=0;}if(e.touches.length===0){mu();}},{passive:false});this.canvas.addEventListener("touchcancel",()=>{this.pinch=0;this.p0=0;mu();},{passive:false});}
  loop(){this.draw();requestAnimationFrame(()=>this.loop());}

  /* ============================================================
     ✅ switchPair — تبديل الزوج مع تحميل/حفظ شموع مستقلة لكل زوج
     ============================================================ */
  async switchPair(pairName){
    // تجاهل إذا نفس الزوج أو جاري تبديل آخر
    if(this.currentPair===pairName||this.isSwitching) return;

    console.log('🔀 Switching pair:',this.currentPair,'→',pairName);
    this.isSwitching=true;
    this.showLoading(true);

    try{
      // 1) تحديث الزوج الحالي
      this.currentPair=pairName;

      // 2) ضبط إعدادات الزوج (سعر، أرقام عشرية، seed، تذبذب)
      const cfg=this.PAIR_CONFIG[pairName]||{base:1.0,digits:5,seed:Math.abs(pairName.split('').reduce((h,c)=>((h<<5)-h)+c.charCodeAt(0)|0,0))%90000+10000,volScale:1};
      this.basePrice=cfg.base;
      this.currentPrice=cfg.base;
      this.digits=cfg.digits;
      this.seed=cfg.seed;
      this.volScale=cfg.volScale;

      // 3) تبديل كوليكشن Firebase للزوج الجديد
      this.firebaseManager.setPair(pairName);

      // 4) إعادة ضبط حالة الرسم
      this.candles=[];
      this.currentCandle=null;
      this.markers=[];
      this.t0=Math.floor(Date.now()/this.timeframe)*this.timeframe;
      this.smin=null;
      this.smax=null;
      this.velocity=0;
      this._fr=0;

      // 5) تحميل شموع الزوج من Firebase
      console.log('📥 Loading candles for pair:',pairName);
      const firebaseCandles=await this.firebaseManager.loadCandles(this.maxCandles);

      if(firebaseCandles&&firebaseCandles.length>0){
        console.log('✅ Firebase candles loaded for',pairName,':',firebaseCandles.length);
        this.candles=firebaseCandles;
        this.usingLocalStorage=false;
        this.localStorageManager.saveCandles(this.candles,pairName);
      }else{
        // 6) جرّب LocalStorage لهذا الزوج
        console.log('⚠️ No Firebase data for',pairName,', trying local...');
        const localCandles=this.localStorageManager.loadCandles(pairName);
        if(localCandles&&localCandles.length>0){
          console.log('✅ Local candles loaded for',pairName,':',localCandles.length);
          this.candles=localCandles;
          this.usingLocalStorage=true;
        }else{
          // 7) توليد شموع جديدة للزوج
          console.log('🔨 Generating new candles for:',pairName);
          this.initHistoricalData();
          this.usingLocalStorage=true;
        }
      }

      // 8) تحديث السعر الحالي من آخر شمعة
      if(this.candles.length>0){
        this.currentPrice=this.candles[this.candles.length-1].close;
      }

      // 9) إعادة ضبط العرض
      this.snapToLive();
      this.updateTimeLabels();
      this.updatePriceRange();
      this.smin=this.priceRange.min;
      this.smax=this.priceRange.max;
      this.updatePriceScale();
      this.updatePriceLabel();

      console.log('✅ Pair switched successfully to:',pairName);

    }catch(e){
      console.error('❌ switchPair error:',e);
      // في حالة خطأ — توليد بيانات بديلة
      try{this.initHistoricalData();}catch(_){}
    }finally{
      this.isSwitching=false;
      this.showLoading(false);
    }
  }
}

/* ============================================================
   🚀 تهيئة التطبيق — بدون تغيير
   ============================================================ */
window.chart=new AdvancedTradingChart();const timeSelector=document.getElementById("timeSelector");const timeDropdown=document.getElementById("timeDropdown");const timeDisplay=document.getElementById("timeDisplay");const tabCompensation=document.getElementById("tabCompensation");const tabCustom=document.getElementById("tabCustom");const compensationList=document.getElementById("compensationList");const amountDisplay=document.getElementById("amountDisplay");const amountContainer=document.getElementById("amountContainer");let isEditingTime=false;let savedTimeValue="00:05";timeSelector.addEventListener("click",e=>{e.stopPropagation();if(!isEditingTime){timeDropdown.classList.toggle("show");}});document.addEventListener("click",()=>{timeDropdown.classList.remove("show");if(isEditingTime){timeDisplay.textContent=savedTimeValue;isEditingTime=false;}});timeDropdown.addEventListener("click",e=>e.stopPropagation());tabCompensation.addEventListener("click",()=>{tabCompensation.classList.add("active");tabCustom.classList.remove("active");compensationList.style.display="grid";if(isEditingTime){timeDisplay.textContent=savedTimeValue;isEditingTime=false;}});tabCustom.addEventListener("click",()=>{tabCustom.classList.add("active");tabCompensation.classList.remove("active");compensationList.style.display="none";timeDisplay.textContent="";isEditingTime=true;setTimeout(()=>timeDisplay.focus(),50);});compensationList.addEventListener("click",e=>{if(e.target.classList.contains("dropdown-item")){savedTimeValue=e.target.textContent;timeDisplay.textContent=savedTimeValue;chart.selectedTime=parseInt(e.target.getAttribute("data-sec"));timeDropdown.classList.remove("show");}});timeDisplay.addEventListener("input",e=>{if(isEditingTime){let v=e.target.textContent.replace(/[^0-9]/g,"");if(v.length>4)v=v.slice(0,4);e.target.textContent=v;}});timeDisplay.addEventListener("blur",()=>{if(isEditingTime){let v=timeDisplay.textContent.replace(/[^0-9]/g,"");if(v.length===0)v="0005";v=v.padStart(4,"0");const h=v.slice(0,2);const m=v.slice(2,4);savedTimeValue=`${h}:${m}`;timeDisplay.textContent=savedTimeValue;isEditingTime=false;}});amountContainer.addEventListener("click",()=>{amountDisplay.focus();});amountDisplay.addEventListener("focus",function(){let v=this.value.replace("$","");this.value=v;setTimeout(()=>{this.setSelectionRange(0,this.value.length);},10);});amountDisplay.addEventListener("input",function(){this.value=this.value.replace(/[^0-9]/g,"");});amountDisplay.addEventListener("blur",function(){let val=parseFloat(this.value)||50;this.value=val+"$";});amountDisplay.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();this.blur();}});document.getElementById("buyBtn").addEventListener("click",()=>chart.addMarker("buy"));document.getElementById("sellBtn").addEventListener("click",()=>chart.addMarker("sell"));console.log('🚀 QT Trading Chart — Pair Switching Ready ✅');
