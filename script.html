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
   💾 LocalStorageManager — بدون تغيير
   ============================================================ */
class LocalStorageManager {constructor(){this.CANDLES_KEY='qt_trading_candles';this.LAST_SYNC_KEY='qt_last_sync';}saveCandles(candles){try{localStorage.setItem(this.CANDLES_KEY,JSON.stringify(candles));localStorage.setItem(this.LAST_SYNC_KEY,Date.now().toString());console.log('✅ Candles saved:',candles.length);}catch(e){console.error('❌ Save error:',e);}}loadCandles(){try{const data=localStorage.getItem(this.CANDLES_KEY);if(data){const candles=JSON.parse(data);console.log('✅ Candles loaded:',candles.length);return candles;}}catch(e){console.error('❌ Load error:',e);}return null;}getLastSyncTime(){const t=localStorage.getItem(this.LAST_SYNC_KEY);return t?parseInt(t):0;}clear(){localStorage.removeItem(this.CANDLES_KEY);localStorage.removeItem(this.LAST_SYNC_KEY);console.log('🗑️ Storage cleared');}}

/* ============================================================
   🔥 FirebaseManager — مع تعديل لحفظ الشموع لكل زوج
   ============================================================ */
class FirebaseManager {
  constructor(){
    this.db=db;
    this.candlesCollection='candles';
    this.saveBatchSize=50;
    this.saveInterval=30000;
    this.lastSaveTime=0;
    this.pendingCandles=[];
    this.isSaving=false;
    this.startAutoSave();
  }

  async saveCandles(candles, pairName = 'EUR/USD'){
    if(this.isSaving){
      console.log('⏳ Save in progress...');
      return false;
    }
    try{
      this.isSaving=true;
      console.log(`💾 Saving candles for ${pairName}:`, candles.length);
      const batch=[];
      for(const candle of candles){
        const candleData={
          open:candle.open,
          high:candle.high,
          low:candle.low,
          close:candle.close,
          timestamp:candle.timestamp,
          pairName: pairName, // إضافة اسم الزوج
          savedAt:serverTimestamp()
        };
        batch.push(candleData);
        if(batch.length>=this.saveBatchSize){
          await this.saveBatch(batch);
          batch.length=0;
          await this.delay(100);
        }
      }
      if(batch.length>0){
        await this.saveBatch(batch);
      }
      this.lastSaveTime=Date.now();
      console.log(`✅ Saved to Firebase for ${pairName}`);
      return true;
    }catch(e){
      console.error('❌ Save error:',e);
      return false;
    }finally{
      this.isSaving=false;
    }
  }

  async saveBatch(batch){
    const promises=batch.map(candleData=>addDoc(collection(this.db,this.candlesCollection),candleData));
    await Promise.all(promises);
    console.log(`✅ Batch saved: ${batch.length}`);
  }

  async loadCandles(pairName = 'EUR/USD', maxCandles=200){
    try{
      console.log(`📥 Loading from Firebase for ${pairName}...`);
      const q=query(
        collection(this.db,this.candlesCollection),
        where('pairName', '==', pairName), // تصفية حسب اسم الزوج
        orderBy('timestamp','desc'),
        limit(maxCandles)
      );
      const querySnapshot=await getDocs(q);
      const candles=[];
      querySnapshot.forEach((doc)=>{
        const data=doc.data();
        candles.push({
          open:data.open,
          high:data.high,
          low:data.low,
          close:data.close,
          timestamp:data.timestamp
        });
      });
      candles.reverse();
      console.log(`✅ Loaded from Firebase for ${pairName}:`,candles.length);
      return candles;
    }catch(e){
      console.error('❌ Load error:',e);
      return null;
    }
  }

  async clearOldCandles(daysToKeep=7){
    try{
      const cutoffTime=Date.now()-(daysToKeep*24*60*60*1000);
      const q=query(collection(this.db,this.candlesCollection),where('timestamp','<',cutoffTime));
      const querySnapshot=await getDocs(q);
      console.log(`🗑️ Found ${querySnapshot.size} old candles`);
    }catch(e){
      console.error('❌ Clear error:',e);
    }
  }

  addPendingCandle(candle){
    this.pendingCandles.push(candle);
  }

  startAutoSave(){
    setInterval(()=>{
      if(this.pendingCandles.length>0&&!this.isSaving){
        const candlesToSave=[...this.pendingCandles];
        this.pendingCandles=[];
        this.saveCandles(candlesToSave);
      }
    },this.saveInterval);
  }

  delay(ms){
    return new Promise(resolve=>setTimeout(resolve,ms));
  }
}

/* ============================================================
   ⏰ updateLiveTime — بدون تغيير
   ============================================================ */
function updateLiveTime(){const d=new Date();const u=d.getTime()+d.getTimezoneOffset()*60000;const t=new Date(u+(3*3600000));const h=String(t.getHours()).padStart(2,"0");const m=String(t.getMinutes()).padStart(2,"0");const s=String(t.getSeconds()).padStart(2,"0");document.getElementById("liveTime").textContent=`${h}:${m}:${s} UTC+3`;}updateLiveTime();setInterval(updateLiveTime,1000);

/* ============================================================
   📊 AdvancedTradingChart — مع تعديل لحفظ وتحميل الشموع لكل زوج
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
    
    // إضافة متغير الزوج الحالي
    this.currentPair = 'EUR/USD';
    
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
    
    // إضافة حدث تبديل الزوج
    this.initPairSwitch();
  }

  // دالة جديدة لتهيئة حدث تبديل الزوج
  initPairSwitch(){
    const pairHud = document.getElementById('pairHud');
    if(pairHud){
      pairHud.addEventListener('click', () => {
        const pairPanel = document.querySelector('.pairPanel');
        if(pairPanel){
          pairPanel.classList.toggle('on');
        }
      });
    }

    // إضافة حدث عند اختيار زوج من القائمة
    document.querySelectorAll('.pit').forEach(item => {
      item.addEventListener('click', async (e) => {
        const pairText = item.querySelector('.nm')?.textContent;
        if(pairText){
          await this.switchPair(pairText);
          // إغلاق القائمة
          const pairPanel = document.querySelector('.pairPanel');
          if(pairPanel){
            pairPanel.classList.remove('on');
          }
        }
      });
    });
  }

  // دالة جديدة لتبديل الزوج
  async switchPair(newPair){
    console.log(`🔄 Switching to ${newPair}`);
    
    // حفظ الشموع الحالية قبل التبديل
    if(this.candles.length > 0){
      await this.firebaseManager.saveCandles(this.candles, this.currentPair);
    }
    
    // تحديث الزوج الحالي
    this.currentPair = newPair;
    
    // تحديث واجهة المستخدم
    const pairHudTxt = document.getElementById('pairHudTxt');
    if(pairHudTxt){
      pairHudTxt.textContent = newPair;
    }
    
    // تحميل بيانات الزوج الجديد
    this.showLoading(true);
    await this.loadPairData(newPair);
    this.showLoading(false);
  }

  // دالة جديدة لتحميل بيانات الزوج
  async loadPairData(pairName){
    try{
      console.log(`📄 Loading data for ${pairName}...`);
      const firebaseCandles = await this.firebaseManager.loadCandles(pairName, this.maxCandles);
      
      if(firebaseCandles && firebaseCandles.length > 0){
        console.log(`✅ Using Firebase data for ${pairName}`);
        this.candles = firebaseCandles;
      } else {
        console.log(`⚠️ No data found for ${pairName}, generating new candles...`);
        this.candles = [];
        this.generateInitialCandles();
      }
      
      this.updatePriceRange();
      this.render();
    } catch(e){
      console.error('❌ Error loading pair data:', e);
      this.candles = [];
      this.generateInitialCandles();
      this.updatePriceRange();
      this.render();
    }
  }

  async initData(){
    this.showLoading(true);
    try{
      await this.loadPairData(this.currentPair);
      this.dataLoaded=true;
    } catch(e){
      console.error('❌ Init error:',e);
      this.generateInitialCandles();
      this.dataLoaded=true;
    } finally{
      this.showLoading(false);
    }
  }

  generateInitialCandles(){
    const now=Date.now();
    const start=now-this.maxCandles*this.timeframe;
    for(let i=0;i<this.maxCandles;i++){
      const timestamp=start+i*this.timeframe;
      const candle=this.generateCandle(timestamp);
      this.candles.push(candle);
    }
  }

  generateCandle(timestamp){
    this.seed=(this.seed*9301+49297)%233280;
    const r=this.seed/233280;
    const volatility=0.0015;
    const change=(r-0.5)*volatility;
    const open=this.currentPrice;
    const close=open+change;
    const high=Math.max(open,close)+(Math.abs(r-0.5)*volatility*0.5);
    const low=Math.min(open,close)-(Math.abs(r-0.5)*volatility*0.5);
    this.currentPrice=close;
    return{open,high,low,close,timestamp};
  }

  updatePriceRange(){
    if(this.candles.length===0)return;
    let min=Infinity,max=-Infinity;
    for(const c of this.candles){
      if(c.low<min)min=c.low;
      if(c.high>max)max=c.high;
    }
    const padding=(max-min)*0.1;
    this.priceRange={min:min-padding,max:max+padding};
  }

  setup(){
    this.resize();
    window.addEventListener('resize',()=>this.resize());
    this.canvas.addEventListener('wheel',e=>this.onWheel(e));
    this.canvas.addEventListener('mousedown',e=>this.onDragStart(e));
    this.canvas.addEventListener('mousemove',e=>this.onDragMove(e));
    this.canvas.addEventListener('mouseup',e=>this.onDragEnd(e));
    this.canvas.addEventListener('mouseleave',e=>this.onDragEnd(e));
    this.canvas.addEventListener('touchstart',e=>this.onTouchStart(e),{passive:false});
    this.canvas.addEventListener('touchmove',e=>this.onTouchMove(e),{passive:false});
    this.canvas.addEventListener('touchend',e=>this.onTouchEnd(e));
    this.startCandleGeneration();
    this.animate();
  }

  startCandleGeneration(){
    this.currentCandle={
      open:this.currentPrice,
      high:this.currentPrice,
      low:this.currentPrice,
      close:this.currentPrice,
      timestamp:this.t0
    };
    setInterval(()=>{
      const elapsed=Date.now()-this.t0;
      const remaining=Math.max(0,this.timeframe-elapsed);
      const sec=Math.ceil(remaining/1000);
      if(this.candleTimer)this.candleTimer.textContent=sec<10?`0${sec}`:`${sec}`;
      if(remaining<=0){
        this.candles.push({...this.currentCandle});
        if(this.candles.length>this.maxCandles)this.candles.shift();
        this.firebaseManager.addPendingCandle({...this.currentCandle});
        this.t0=Math.floor(Date.now()/this.timeframe)*this.timeframe;
        this.currentCandle={
          open:this.currentPrice,
          high:this.currentPrice,
          low:this.currentPrice,
          close:this.currentPrice,
          timestamp:this.t0
        };
        this.updatePriceRange();
      }
    },100);
    setInterval(()=>{
      this.seed=(this.seed*9301+49297)%233280;
      const r=this.seed/233280;
      const volatility=0.0008;
      const change=(r-0.5)*volatility;
      this.currentPrice+=change;
      this.currentCandle.close=this.currentPrice;
      if(this.currentPrice>this.currentCandle.high)this.currentCandle.high=this.currentPrice;
      if(this.currentPrice<this.currentCandle.low)this.currentCandle.low=this.currentPrice;
    },1000);
  }

  resize(){
    const rect=this.plot.getBoundingClientRect();
    this.canvas.width=rect.width;
    this.canvas.height=rect.height;
    this.render();
  }

  onWheel(e){
    e.preventDefault();
    const delta=e.deltaY>0?0.95:1.05;
    this.targetZoom=Math.min(this.maxZoom,Math.max(this.minZoom,this.targetZoom*delta));
  }

  onDragStart(e){
    this.drag=1;
    this.dragStartX=e.clientX;
    this.dragStartOffset=this.targetOffsetX;
    this.lastDragX=e.clientX;
    this.lastDragTime=Date.now();
    this.velocity=0;
  }

  onDragMove(e){
    if(!this.drag)return;
    const dx=e.clientX-this.dragStartX;
    this.targetOffsetX=this.dragStartOffset+dx;
    const dt=Date.now()-this.lastDragTime;
    if(dt>0)this.velocity=(e.clientX-this.lastDragX)/dt;
    this.lastDragX=e.clientX;
    this.lastDragTime=Date.now();
  }

  onDragEnd(e){
    if(!this.drag)return;
    this.drag=0;
  }

  onTouchStart(e){
    e.preventDefault();
    if(e.touches.length===1){
      this.drag=1;
      this.dragStartX=e.touches[0].clientX;
      this.dragStartOffset=this.targetOffsetX;
      this.lastDragX=e.touches[0].clientX;
      this.lastDragTime=Date.now();
      this.velocity=0;
    }else if(e.touches.length===2){
      this.drag=0;
      this.pinch=1;
      const dx=e.touches[1].clientX-e.touches[0].clientX;
      const dy=e.touches[1].clientY-e.touches[0].clientY;
      this.p0=Math.sqrt(dx*dx+dy*dy);
      this.pMidX=(e.touches[0].clientX+e.touches[1].clientX)/2;
      this.pMidY=(e.touches[0].clientY+e.touches[1].clientY)/2;
    }
  }

  onTouchMove(e){
    e.preventDefault();
    if(e.touches.length===1&&this.drag){
      const dx=e.touches[0].clientX-this.dragStartX;
      this.targetOffsetX=this.dragStartOffset+dx;
      const dt=Date.now()-this.lastDragTime;
      if(dt>0)this.velocity=(e.touches[0].clientX-this.lastDragX)/dt;
      this.lastDragX=e.touches[0].clientX;
      this.lastDragTime=Date.now();
    }else if(e.touches.length===2&&this.pinch){
      const dx=e.touches[1].clientX-e.touches[0].clientX;
      const dy=e.touches[1].clientY-e.touches[0].clientY;
      const dist=Math.sqrt(dx*dx+dy*dy);
      const scale=dist/this.p0;
      this.targetZoom=Math.min(this.maxZoom,Math.max(this.minZoom,this.zoom*scale));
      this.p0=dist;
    }
  }

  onTouchEnd(e){
    if(e.touches.length===0){
      this.drag=0;
      this.pinch=0;
    }else if(e.touches.length===1){
      this.pinch=0;
      this.onTouchStart(e);
    }
  }

  animate(){
    requestAnimationFrame(()=>this.animate());
    this.zoom+=(this.targetZoom-this.zoom)*this.zoomEase;
    if(!this.drag&&Math.abs(this.velocity)>0.01){
      this.targetOffsetX+=this.velocity*16;
      this.velocity*=0.92;
    }
    this.offsetX+=(this.targetOffsetX-this.offsetX)*this.panEase;
    this.render();
  }

  render(){
    const ctx=this.ctx;
    const w=this.canvas.width;
    const h=this.canvas.height;
    ctx.clearRect(0,0,w,h);
    const spacing=this.baseSpacing*this.zoom;
    const totalCandles=this.candles.length+(this.currentCandle?1:0);
    const chartWidth=totalCandles*spacing;
    const startX=w-chartWidth+this.offsetX;
    const priceToY=price=>{
      const pRange=this.priceRange.max-this.priceRange.min;
      return h-((price-this.priceRange.min)/pRange)*h;
    };
    this.drawPriceScale(priceToY);
    ctx.save();
    for(let i=0;i<this.candles.length;i++){
      const c=this.candles[i];
      const x=startX+i*spacing;
      if(x+spacing<0||x>w)continue;
      this.drawCandle(ctx,c,x,spacing,priceToY);
    }
    if(this.currentCandle){
      const x=startX+this.candles.length*spacing;
      this.drawCandle(ctx,this.currentCandle,x,spacing,priceToY);
    }
    ctx.restore();
    this.updateTimeLabels(startX,spacing);
    this.updatePriceLine(priceToY);
  }

  drawCandle(ctx,c,x,spacing,priceToY){
    const yOpen=priceToY(c.open);
    const yClose=priceToY(c.close);
    const yHigh=priceToY(c.high);
    const yLow=priceToY(c.low);
    const isUp=c.close>=c.open;
    const color=isUp?'#0f0':'#f00';
    ctx.strokeStyle=color;
    ctx.lineWidth=Math.max(1,spacing*0.08);
    ctx.beginPath();
    ctx.moveTo(x+spacing/2,yHigh);
    ctx.lineTo(x+spacing/2,yLow);
    ctx.stroke();
    const bodyWidth=Math.max(1,spacing*0.7);
    const bodyHeight=Math.abs(yClose-yOpen)||1;
    ctx.fillStyle=color;
    ctx.fillRect(x+(spacing-bodyWidth)/2,Math.min(yOpen,yClose),bodyWidth,bodyHeight);
  }

  drawPriceScale(priceToY){
    const scaleEl=document.getElementById('priceScale');
    if(!scaleEl)return;
    const labels=scaleEl.querySelectorAll('.pLabel:not(#currentPrice)');
    labels.forEach(l=>l.remove());
    const h=this.canvas.height;
    const pRange=this.priceRange.max-this.priceRange.min;
    const step=this.calculatePriceStep(pRange);
    const start=Math.floor(this.priceRange.min/step)*step;
    for(let price=start;price<=this.priceRange.max;price+=step){
      const y=priceToY(price);
      if(y<0||y>h)continue;
      const label=document.createElement('div');
      label.className='pLabel';
      label.textContent=price.toFixed(this.digits);
      label.style.top=`${y}px`;
      scaleEl.appendChild(label);
    }
  }

  calculatePriceStep(range){
    const roughStep=range/8;
    const magnitude=Math.pow(10,Math.floor(Math.log10(roughStep)));
    const normalized=roughStep/magnitude;
    let niceStep;
    if(normalized<1.5)niceStep=1;
    else if(normalized<3)niceStep=2;
    else if(normalized<7)niceStep=5;
    else niceStep=10;
    return niceStep*magnitude;
  }

  updateTimeLabels(startX,spacing){
    if(!this.timeLabels)return;
    this.timeLabels.innerHTML='';
    const w=this.canvas.width;
    const totalCandles=this.candles.length+(this.currentCandle?1:0);
    for(let i=0;i<totalCandles;i++){
      const x=startX+i*spacing;
      if(x<0||x>w)continue;
      const candle=i<this.candles.length?this.candles[i]:this.currentCandle;
      if(!candle)continue;
      const date=new Date(candle.timestamp);
      const min=date.getMinutes();
      if(min===0||i===0||i===totalCandles-1){
        const label=document.createElement('div');
        label.className=min===0?'timeLabel major':'timeLabel';
        label.textContent=`${String(date.getHours()).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
        label.style.left=`${x+spacing/2}px`;
        this.timeLabels.appendChild(label);
      }
    }
  }

  updatePriceLine(priceToY){
    if(!this.priceLine||!this.currentPriceEl)return;
    const y=priceToY(this.currentPrice);
    this.priceLine.style.top=`${y}px`;
    this.currentPriceEl.style.top=`${y}px`;
    this.currentPriceEl.textContent=this.currentPrice.toFixed(this.digits);
  }

  showLoading(show){
    if(this.loadingOverlay)this.loadingOverlay.classList.toggle('show',show);
  }
}

/* ============================================================
   🚀 تهيئة التطبيق — بدون تغيير
   ============================================================ */
window.chart=new AdvancedTradingChart();const timeSelector=document.getElementById("timeSelector");const timeDropdown=document.getElementById("timeDropdown");const timeDisplay=document.getElementById("timeDisplay");const tabCompensation=document.getElementById("tabCompensation");const tabCustom=document.getElementById("tabCustom");const compensationList=document.getElementById("compensationList");const amountDisplay=document.getElementById("amountDisplay");const amountContainer=document.getElementById("amountContainer");let isEditingTime=false;let savedTimeValue="00:05";timeSelector.addEventListener("click",e=>{e.stopPropagation();if(!isEditingTime){timeDropdown.classList.toggle("show");}});document.addEventListener("click",()=>{timeDropdown.classList.remove("show");if(isEditingTime){timeDisplay.textContent=savedTimeValue;isEditingTime=false;}});timeDropdown.addEventListener("click",e=>e.stopPropagation());tabCompensation.addEventListener("click",()=>{tabCompensation.classList.add("active");tabCustom.classList.remove("active");compensationList.style.display="grid";if(isEditingTime){timeDisplay.textContent=savedTimeValue;isEditingTime=false;}});tabCustom.addEventListener("click",()=>{tabCustom.classList.add("active");tabCompensation.classList.remove("active");compensationList.style.display="none";timeDisplay.textContent="";isEditingTime=true;setTimeout(()=>timeDisplay.focus(),50);});compensationList.addEventListener("click",e=>{if(e.target.classList.contains("dropdown-item")){savedTimeValue=e.target.textContent;timeDisplay.textContent=savedTimeValue;chart.selectedTime=parseInt(e.target.getAttribute("data-sec"));timeDropdown.classList.remove("show");}});timeDisplay.addEventListener("input",e=>{if(isEditingTime){let v=e.target.textContent.replace(/[^0-9]/g,"");if(v.length>4)v=v.slice(0,4);e.target.textContent=v;}});timeDisplay.addEventListener("blur",()=>{if(isEditingTime){let v=timeDisplay.textContent.replace(/[^0-9]/g,"");if(v.length===0)v="0005";v=v.padStart(4,"0");const mm=v.slice(0,2);const ss=v.slice(2,4);const formatted=`${mm}:${ss}`;savedTimeValue=formatted;timeDisplay.textContent=formatted;chart.selectedTime=parseInt(mm)*60+parseInt(ss);isEditingTime=false;}});timeDisplay.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();timeDisplay.blur();}});amountDisplay.addEventListener("input",e=>{let v=e.target.value.replace(/[^0-9]/g,"");if(v.length>0){e.target.value=v+"$";}else{e.target.value="0$";}});amountDisplay.addEventListener("focus",e=>{e.target.value=e.target.value.replace("$","");});amountDisplay.addEventListener("blur",e=>{let v=e.target.value.replace(/[^0-9]/g,"");if(v.length===0)v="0";e.target.value=v+"$";});
