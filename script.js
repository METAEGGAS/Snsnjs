function updateLiveTime(){
    const d=new Date,u=d.getTime()+d.getTimezoneOffset()*6e4,t=new Date(u+108e5),h=String(t.getHours()).padStart(2,"0"),m=String(t.getMinutes()).padStart(2,"0"),s=String(t.getSeconds()).padStart(2,"0");
    document.getElementById("liveTime").textContent=`${h}:${m}:${s} UTC+3`
}
updateLiveTime();
setInterval(updateLiveTime,1e3);

class AdvancedTradingChart{
    constructor(){
        this.plot=document.getElementById("plot");
        this.canvas=document.getElementById("chartCanvas");
        this.ctx=this.canvas.getContext("2d");
        this.timeLabels=document.getElementById("timeLabels");
        this.candleTimer=document.getElementById("candleTimer");
        this.priceLine=document.getElementById("priceLine");
        this.priceScaleLabels=document.getElementById("priceScaleLabels");
        this.currentPriceEl=document.getElementById("currentPrice");
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
        this.timeframe=6e4;
        this.t0=Math.floor(Date.now()/6e4)*6e4;
        this.smin=null;
        this.smax=null;
        this.sre=0.088;
        this._fr=0;
        this.markers=[];
        this.selectedTime=5;
        this.setup();
        this.initHistoricalData();
        this.initEvents();
        this.startRealtime();
        this.loop()
    }
    setup(){
        const dpr=window.devicePixelRatio||1,r=this.plot.getBoundingClientRect();
        this.w=r.width;
        this.h=r.height-24;
        this.canvas.width=this.w*dpr;
        this.canvas.height=this.h*dpr;
        this.canvas.style.width=this.w+"px";
        this.canvas.style.height=this.h+"px";
        this.ctx.scale(dpr,dpr);
        this.updatePriceLabel();
        this.updatePriceScale();
        this.updateTimeLabels()
    }
    rnd(s){
        const x=Math.sin(s)*1e4;
        return x-Math.floor(x)
    }
    rndG(s){
        const u1=this.rnd(s),u2=this.rnd(s+1e5);
        return Math.sqrt(-2*Math.log(u1+1e-5))*Math.cos(2*Math.PI*u2)
    }
    genCandle(t,o){
        const s=this.seed+Math.floor(t/this.timeframe),vb=8e-4,tb=5e-5,r1=this.rndG(s),r2=this.rndG(s+1),r3=this.rndG(s+2),r4=this.rnd(s+3),r5=this.rnd(s+4),r6=this.rnd(s+5),v=vb*(.7+Math.abs(r1)*.8),tr=tb*r2*.6,dir=r3>0?1:-1,tc=o+(dir*v+tr),rg=v*(.2+r4*.6),hm=rg*(.3+r5*.7),lm=rg*(.3+(1-r5)*.7),c=+(tc+(r6-.5)*v*.1).toFixed(this.digits),op=+o.toFixed(this.digits);
        return{open:op,close:c,high:+Math.max(op,c,op+hm,c+hm).toFixed(this.digits),low:+Math.min(op,c,op-lm,c-lm).toFixed(this.digits),timestamp:t}
    }
    initHistoricalData(){
        let p=this.basePrice,t=Date.now()-this.maxCandles*this.timeframe;
        for(let i=0;i<this.maxCandles;i++){
            const c=this.genCandle(t,p);
            this.candles.push(c);
            p=c.close;
            t+=this.timeframe
        }
        this.currentPrice=this.candles[this.candles.length-1].close;
        this.snapToLive();
        this.updateTimeLabels();
        this.updatePriceRange();
        this.smin=this.priceRange.min;
        this.smax=this.priceRange.max;
        this.updatePriceScale();
        this.updatePriceLabel()
    }
    getSpacing(){
        return this.baseSpacing*this.zoom
    }
    getCandleWidth(){
        return this.getSpacing()*.8
    }
    getMinOffset(){
        return this.w/2-this.candles.length*this.getSpacing()
    }
    getMaxOffset(){
        return this.w/2
    }
    clampPan(){
        const mn=this.getMinOffset(),mx=this.getMaxOffset();
        this.targetOffsetX=Math.max(mn,Math.min(mx,this.targetOffsetX));
        this.offsetX=Math.max(mn,Math.min(mx,this.offsetX))
    }
    snapToLive(){
        this.targetOffsetX=this.getMinOffset();
        this.offsetX=this.targetOffsetX;
        this.velocity=0;
        this.clampPan()
    }
    updatePan(){
        const diff=this.targetOffsetX-this.offsetX;
        if(Math.abs(diff)>.003)this.offsetX+=diff*this.panEase;
        else this.offsetX=this.targetOffsetX;
        if(Math.abs(this.velocity)>.01){
            this.targetOffsetX+=this.velocity;
            this.velocity*=.972;
            this.clampPan()
        }else this.velocity=0
    }
    tickZoom(){
        const d=this.targetZoom-this.zoom;
        Math.abs(d)>.0001?this.zoom+=d*this.zoomEase:this.zoom=this.targetZoom
    }
    tickSR(){
        const r=this.priceRange;
        if(this.smin===null){
            this.smin=r.min;
            this.smax=r.max;
            return
        }
        this.smin+=(r.min-this.smin)*this.sre;
        this.smax+=(r.max-this.smax)*this.sre
    }
    applyZoomAround(mx,my,sc){
        const oz=this.targetZoom,nz=Math.max(this.minZoom,Math.min(this.maxZoom,oz*sc));
        if(Math.abs(nz-oz)<1e-6)return;
        const idx=this.xToIndex(mx);
        this.targetZoom=nz;
        this.zoom=nz;
        const nx=mx-idx*this.getSpacing();
        this.targetOffsetX=nx;
        this.offsetX=nx;
        this.clampPan();
        this.updateTimeLabels()
    }
    indexToX(i){
        return this.offsetX+i*this.getSpacing()
    }
    xToIndex(x){
        return(x-this.offsetX)/this.getSpacing()
    }
    getPriceRange(){
        const mn=this.smin!==null?this.smin:this.priceRange.min,mx=this.smax!==null?this.smax:this.priceRange.max;
        return{min:mn,max:mx}
    }
    niceNum(v,rnd){
        const e=Math.floor(Math.log10(v)),p=Math.pow(10,e),f=v/p;
        let nf;
        if(rnd){
            if(f<1.5)nf=1;
            else if(f<3)nf=2;
            else if(f<7)nf=5;
            else nf=10
        }else{
            if(f<=1)nf=1;
            else if(f<=2)nf=2;
            else if(f<=5)nf=5;
            else nf=10
        }
        return nf*p
    }
    calcNiceGrid(){
        const r=this.getPriceRange(),rng=r.max-r.min,d=this.niceNum(rng/7,0),g0=Math.floor(r.min/d)*d,g1=Math.ceil(r.max/d)*d;
        return{min:g0,max:g1,step:d,count:Math.round((g1-g0)/d)}
    }
    drawGrid(){
        const{min,max,step,count}=this.calcNiceGrid();
        for(let i=0;i<=count;i++){
            const p=min+i*step,y=this.priceToY(p);
            if(y<-5||y>this.h+5)continue;
            const mj=i%5===0;
            this.ctx.strokeStyle=mj?"rgba(255,215,0,.12)":"rgba(255,255,255,.05)";
            this.ctx.lineWidth=mj?1:.8;
            this.ctx.beginPath();
            this.ctx.moveTo(0,y+.5);
            this.ctx.lineTo(this.w,y+.5);
            this.ctx.stroke()
        }
        const visC=this.w/this.getSpacing(),targetL=9,stepC=Math.max(1,Math.round(visC/targetL)),s=Math.floor(this.xToIndex(0)),e=Math.ceil(this.xToIndex(this.w));
        for(let i=s;i<=e;i++){
            if(i%stepC!==0)continue;
            const x=this.indexToX(i);
            if(x<-5||x>this.w+5)continue;
            const mj=i%Math.round(stepC*5)===0;
            this.ctx.strokeStyle=mj?"rgba(255,215,0,.12)":"rgba(255,255,255,.05)";
            this.ctx.lineWidth=mj?1:.8;
            this.ctx.beginPath();
            this.ctx.moveTo(x+.5,0);
            this.ctx.lineTo(x+.5,this.h);
            this.ctx.stroke()
        }
    }
    updateTimeLabels(){
        const tl=this.timeLabels;
        tl.innerHTML="";
        const visC=this.w/this.getSpacing(),targetL=9,stepC=Math.max(1,Math.round(visC/targetL)),s=Math.floor(this.xToIndex(0)),e=Math.ceil(this.xToIndex(this.w)),tS=this.candles.length?this.candles[0].timestamp:this.t0;
        for(let i=s;i<=e;i++){
            if(i%stepC!==0)continue;
            const x=this.indexToX(i);
            if(x<5||x>this.w-5)continue;
            const t=tS+i*this.timeframe,d=new Date(t),hh=String(d.getHours()).padStart(2,"0"),mm=String(d.getMinutes()).padStart(2,"0"),lb=document.createElement("div");
            lb.className="timeLabel";
            (i%Math.round(stepC*5)===0)&&lb.classList.add("major");
            lb.style.left=x+"px";
            lb.textContent=`${hh}:${mm}`;
            tl.appendChild(lb)
        }
    }
    updatePriceScale(){
        const{min,step,count}=this.calcNiceGrid();
        let h="";
        for(let i=0;i<=count;i++){
            const p=min+i*step,y=this.priceToY(p);
            if(y<-8||y>this.h+8)continue;
            const mj=i%5===0;
            h+=`<div class="pLabel${mj?" major":""}" style="top:${y}px">${p.toFixed(this.digits)}</div>`
        }
        this.priceScaleLabels.innerHTML=h
    }
    updatePriceLabel(){
        const py=this.priceToY(this.currentPrice);
        this.priceLine.style.top=py+"px";
        this.currentPriceEl.style.top=py+"px";
        this.currentPriceEl.textContent=this.currentPrice.toFixed(this.digits)
    }
    updateCandleTimer(){
        if(!this.currentCandle)return;
        const n=Date.now(),e=n-this.t0,r=this.timeframe-e,s=Math.floor(r/1e3);
        this.candleTimer.textContent=s>=0?s:0;
        const cx=this.indexToX(this.candles.length);
        this.candleTimer.style.left=cx+15+"px";
        this.candleTimer.style.top="10px";
        this.candleTimer.style.display='block'
    }
    priceToY(p){
        const r=this.getPriceRange(),n=(p-r.min)/(r.max-r.min);
        return this.h*(1-n)
    }
    drawCandle(c,x,glow){
        const oy=this.priceToY(c.open),cy=this.priceToY(c.close),hy=this.priceToY(c.high),ly=this.priceToY(c.low),b=c.close>=c.open,w=this.getCandleWidth();
        this.ctx.strokeStyle=b?"#0f0":"#f00";
        this.ctx.lineWidth=Math.max(1,.18*w);
        this.ctx.beginPath();
        this.ctx.moveTo(x,hy);
        this.ctx.lineTo(x,ly);
        this.ctx.stroke();
        const bh=Math.max(1,Math.abs(cy-oy)),bt=Math.min(oy,cy),g=this.ctx.createLinearGradient(x,bt,x,bt+bh);
        b?(g.addColorStop(0,"#0f0"),g.addColorStop(.5,"#0f0"),g.addColorStop(1,"#0c0")):(g.addColorStop(0,"#f00"),g.addColorStop(.5,"#f00"),g.addColorStop(1,"#c00"));
        this.ctx.fillStyle=g;
        if(glow){
            this.ctx.shadowColor=b?"rgba(0,255,0,.8)":"rgba(255,0,0,.8)";
            this.ctx.shadowBlur=12
        }
        this.ctx.fillRect(x-w/2,bt,w,bh);
        if(glow)this.ctx.shadowBlur=0
    }
    addMarker(t){
        const op=this.currentPrice,c=this.currentCandle;
        if(!c)return;
        const bt=Math.max(c.open,c.close),bb=Math.min(c.open,c.close);
        let fp=op;
        op>bt?fp=bt:op<bb&&(fp=bb);
        const fi=this.candles.length;
        this.markers.push({type:t,ts:Date.now(),price:fp,candleIndex:fi,candleTimestamp:c.timestamp})
    }
    drawMarker(m){
        let actualIdx=m.candleIndex;
        for(let i=0;i<this.candles.length;i++){
            if(this.candles[i].timestamp===m.candleTimestamp){
                actualIdx=i;
                break
            }
        }
        const x=this.indexToX(actualIdx);
        if(x<-200||x>this.w+50)return;
        const y=this.priceToY(m.price),w=this.getCandleWidth(),ib=m.type==="buy",cl=ib?"#16a34a":"#ff3b3b",r=5.5;
        this.ctx.save();
        const lsx=x;
        this.ctx.shadowColor=cl;
        this.ctx.shadowBlur=9;
        this.ctx.fillStyle=cl;
        this.ctx.beginPath();
        this.ctx.arc(x,y,r,0,2*Math.PI);
        this.ctx.fill();
        this.ctx.shadowBlur=0;
        this.ctx.fillStyle="#fff";
        this.ctx.save();
        this.ctx.translate(x,y);
        ib||this.ctx.rotate(Math.PI);
        this.ctx.beginPath();
        this.ctx.moveTo(0,-2.8);
        this.ctx.lineTo(-2,.8);
        this.ctx.lineTo(-.65,.8);
        this.ctx.lineTo(-.65,2.8);
        this.ctx.lineTo(.65,2.8);
        this.ctx.lineTo(.65,.8);
        this.ctx.lineTo(2,.8);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
        const lx=lsx+w/2+3,lw=Math.min(95,this.w-lx-22);
        this.ctx.strokeStyle=ib?"rgba(22,163,74,.7)":"rgba(255,59,59,.7)";
        this.ctx.lineWidth=1.2;
        this.ctx.beginPath();
        this.ctx.moveTo(lsx+w/2,y);
        this.ctx.lineTo(lx,y);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(lx,y);
        this.ctx.lineTo(lx+lw,y);
        this.ctx.stroke();
        const ex=lx+lw,er=5;
        this.ctx.strokeStyle=cl;
        this.ctx.lineWidth=2;
        this.ctx.fillStyle="#fff";
        this.ctx.beginPath();
        this.ctx.arc(ex,y,er,0,2*Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.strokeStyle=ib?"rgba(22,163,74,.5)":"rgba(255,59,59,.5)";
        this.ctx.lineWidth=1.2;
        this.ctx.beginPath();
        this.ctx.moveTo(ex+er,y);
        this.ctx.lineTo(ex+65,y);
        this.ctx.stroke();
        this.ctx.restore()
    }
    draw(){
        this.tickZoom();
        this.updatePan();
        this.updatePriceRange();
        this.tickSR();
        this.ctx.clearRect(0,0,this.w,this.h);
        this.drawGrid();
        for(let i=0;i<this.candles.length;i++){
            const x=this.indexToX(i);
            if(x<-60||x>this.w+60)continue;
            this.drawCandle(this.candles[i],x,0)
        }
        if(this.currentCandle&&(!this.candles.length||this.currentCandle.timestamp!==this.candles[this.candles.length-1].timestamp)){
            const lx=this.indexToX(this.candles.length);
            lx>=-60&&lx<=this.w+60&&this.drawCandle(this.currentCandle,lx,1)
        }
        for(let mk of this.markers)this.drawMarker(mk);
        if(++this._fr%2===0){
            this.updatePriceScale();
            this.updateTimeLabels()
        }
        this.updatePriceLabel();
        this.updateCandleTimer()
    }
    stepTowards(c,t,m){
        const d=t-c;
        return Math.abs(d)<=m?t:c+Math.sign(d)*m
    }
    updateCurrentCandle(){
        if(!this.currentCandle){
            const lp=this.candles.length?this.candles[this.candles.length-1].close:this.currentPrice;
            this.currentCandle=this.genCandle(this.t0,lp);
            this.currentCandle.close=lp;
            this.currentCandle.high=Math.max(this.currentCandle.open,this.currentCandle.close);
            this.currentCandle.low=Math.min(this.currentCandle.open,this.currentCandle.close);
            return
        }
        const n=Date.now(),r=this.rnd(this.seed+n),dir=(r-.5)*4e-4,t=this.currentCandle.close+dir,ms=8e-4*.18,nc=+this.stepTowards(this.currentCandle.close,t,ms).toFixed(this.digits);
        this.currentCandle.close=nc;
        this.currentCandle.high=+Math.max(this.currentCandle.high,nc).toFixed(this.digits);
        this.currentCandle.low=+Math.min(this.currentCandle.low,nc).toFixed(this.digits);
        this.currentPrice=nc
    }
    startRealtime(){
        setInterval(()=>{
            const n=Date.now(),e=n-this.t0;
            if(e>=this.timeframe){
                if(this.currentCandle&&(!this.candles.length||this.candles[this.candles.length-1].timestamp!==this.currentCandle.timestamp)){
                    this.candles.push({...this.currentCandle});
                    if(this.candles.length>this.maxCandles)this.candles.shift()
                }
                this.t0=Math.floor(n/this.timeframe)*this.timeframe;
                const lp=this.currentCandle?this.currentCandle.close:this.currentPrice;
                this.currentCandle=this.genCandle(this.t0,lp);
                this.currentCandle.open=lp;
                this.currentCandle.close=lp;
                this.currentCandle.high=lp;
                this.currentCandle.low=lp;
                this.currentPrice=lp
            }else this.updateCurrentCandle()
        },200)
    }
    updatePriceRange(){
        let v=[...this.candles];
        this.currentCandle&&(!v.length||this.currentCandle.timestamp!==v[v.length-1].timestamp)&&v.push(this.currentCandle);
        if(!v.length){
            this.priceRange={min:.95*this.basePrice,max:1.05*this.basePrice};
            return
        }
        const si=Math.floor(this.xToIndex(0)),ei=Math.ceil(this.xToIndex(this.w)),sl=v.slice(Math.max(0,si-5),Math.min(v.length,ei+5));
        if(!sl.length){
            this.priceRange={min:.95*this.basePrice,max:1.05*this.basePrice};
            return
        }
        const lo=sl.map(c=>c.low),hi=sl.map(c=>c.high),mn=Math.min(...lo),mx=Math.max(...hi),pd=.15*(mx-mn)||1e-9;
        this.priceRange={min:mn-pd,max:mx+pd}
    }
    initEvents(){
        addEventListener("resize",()=>this.setup());
        this.canvas.addEventListener("wheel",e=>{
            e.preventDefault();
            const r=this.canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,sc=e.deltaY>0?1/1.1:1.1;
            this.applyZoomAround(x,y,sc)
        },{passive:!1});
        const md=(x,t)=>{
            this.drag=1;
            this.dragStartX=x;
            this.dragStartOffset=this.targetOffsetX;
            this.velocity=0;
            this.lastDragX=x;
            this.lastDragTime=t
        };
        const mm=(x,t)=>{
            if(this.drag){
                const d=x-this.dragStartX;
                this.targetOffsetX=this.dragStartOffset+d;
                this.clampPan();
                const dt=t-this.lastDragTime;
                if(dt>0&&dt<80)this.velocity=(x-this.lastDragX)/dt*26;
                this.lastDragX=x;
                this.lastDragTime=t
            }
        };
        const mu=()=>{
            this.drag=0;
            this.updateTimeLabels()
        };
        this.canvas.addEventListener("mousedown",e=>{
            const r=this.canvas.getBoundingClientRect();
            md(e.clientX-r.left,Date.now())
        });
        addEventListener("mousemove",e=>{
            const r=this.canvas.getBoundingClientRect();
            mm(e.clientX-r.left,Date.now())
        });
        addEventListener("mouseup",mu);
        const db=(a,b)=>Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY);
        this.canvas.addEventListener("touchstart",e=>{
            const r=this.canvas.getBoundingClientRect();
            if(e.touches.length===1)md(e.touches[0].clientX-r.left,Date.now());
            else if(e.touches.length===2){
                this.drag=0;
                this.pinch=1;
                this.p0=db(e.touches[0],e.touches[1]);
                this.pMidX=(e.touches[0].clientX+e.touches[1].clientX)/2-r.left;
                this.pMidY=(e.touches[0].clientY+e.touches[1].clientY)/2-r.top
            }
        },{passive:!1});
        this.canvas.addEventListener("touchmove",e=>{
            e.preventDefault();
            const r=this.canvas.getBoundingClientRect();
            if(this.pinch&&e.touches.length===2){
                const d=db(e.touches[0],e.touches[1]);
                if(this.p0>0){
                    const sc=Math.max(.2,Math.min(5,d/(this.p0||d)));
                    this.applyZoomAround(this.pMidX,this.pMidY,sc)
                }
                this.p0=d
            }else if(!this.pinch&&e.touches.length===1)mm(e.touches[0].clientX-r.left,Date.now())
        },{passive:!1});
        this.canvas.addEventListener("touchend",e=>{
            e.touches.length<2&&(this.pinch=0,this.p0=0);
            e.touches.length===0&&mu()
        },{passive:!1});
        this.canvas.addEventListener("touchcancel",()=>{
            this.pinch=0;
            this.p0=0;
            mu()
        },{passive:!1})
    }
    loop(){
        this.draw();
        requestAnimationFrame(()=>this.loop())
    }
}

window.chart=new AdvancedTradingChart;

const timeSelector=document.getElementById("timeSelector"),timeDropdown=document.getElementById("timeDropdown"),timeDisplay=document.getElementById("timeDisplay"),tabCompensation=document.getElementById("tabCompensation"),tabCustom=document.getElementById("tabCustom"),compensationList=document.getElementById("compensationList"),amountDisplay=document.getElementById("amountDisplay"),amountContainer=document.getElementById("amountContainer");

let isEditingTime=false,savedTimeValue="00:05";

timeSelector.addEventListener("click",e=>{
    e.stopPropagation();
    if(!isEditingTime)timeDropdown.classList.toggle("show")
});

document.addEventListener("click",()=>{
    timeDropdown.classList.remove("show");
    if(isEditingTime){
        timeDisplay.textContent=savedTimeValue;
        isEditingTime=false
    }
});

timeDropdown.addEventListener("click",e=>e.stopPropagation());

tabCompensation.addEventListener("click",()=>{
    tabCompensation.classList.add("active");
    tabCustom.classList.remove("active");
    compensationList.style.display="grid";
    if(isEditingTime){
        timeDisplay.textContent=savedTimeValue;
        isEditingTime=false
    }
});

tabCustom.addEventListener("click",()=>{
    tabCustom.classList.add("active");
    tabCompensation.classList.remove("active");
    compensationList.style.display="none";
    timeDisplay.textContent="";
    isEditingTime=true;
    setTimeout(()=>timeDisplay.focus(),50)
});

compensationList.addEventListener("click",e=>{
    if(e.target.classList.contains("dropdown-item")){
        savedTimeValue=e.target.textContent;
        timeDisplay.textContent=savedTimeValue;
        chart.selectedTime=parseInt(e.target.getAttribute("data-sec"));
        timeDropdown.classList.remove("show")
    }
});

timeDisplay.addEventListener("input",e=>{
    if(isEditingTime){
        let v=e.target.textContent.replace(/[^0-9]/g,"");
        if(v.length>4)v=v.slice(0,4);
        e.target.textContent=v
    }
});

timeDisplay.addEventListener("blur",()=>{
    if(isEditingTime){
        let v=timeDisplay.textContent.replace(/[^0-9]/g,"");
        if(v.length===0)v="0005";
        v=v.padStart(4,"0");
        const h=v.slice(0,2),m=v.slice(2,4);
        savedTimeValue=`${h}:${m}`;
        timeDisplay.textContent=savedTimeValue;
        isEditingTime=false
    }
});

amountContainer.addEventListener("click",()=>{
    amountDisplay.focus()
});

amountDisplay.addEventListener("focus",function(){
    let v=this.value.replace("$","");
    this.value=v;
    setTimeout(()=>{
        this.setSelectionRange(0,this.value.length)
    },10)
});

amountDisplay.addEventListener("input",function(){
    this.value=this.value.replace(/[^0-9]/g,"")
});

amountDisplay.addEventListener("blur",function(){
    let val=parseFloat(this.value)||50;
    this.value=val+"$"
});

amountDisplay.addEventListener("keydown",function(e){
    if(e.key==="Enter"){
        e.preventDefault();
        this.blur()
    }
});

document.getElementById("buyBtn").addEventListener("click",()=>chart.addMarker("buy"));
document.getElementById("sellBtn").addEventListener("click",()=>chart.addMarker("sell"));
