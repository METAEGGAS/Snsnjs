(function(){
  // ملف حقن ديناميكي لقسم "صفقة تعاقدية"
  // التصميم مطابق 100% لقسم تداول العملات (نسخ حرفي)
  // يمكنك تعديل القيم هنا لتغيير محتوى صفقة تعاقدية ديناميكياً
  
  const CONTRACT_DATA = {
    pair: "BTC/USDT",
    change: "+2.45%",
    price: "65420.50",
    direction: "up", // up أو dn
    times: ["s600","s1200","s2400","s3600"],
    asks: [[65425.5,1.2345],[65424.3,0.5678],[65423.1,2.4567],[65422.8,0.9876],[65421.5,3.1234]],
    bids: [[65419.2,1.5432],[65418.0,2.1098],[65417.5,0.7654],[65416.3,4.3210],[65415.0,1.8765]]
  };

  // تحديث زوج التداول
  const pairBox = document.querySelector(".pair .l b");
  if(pairBox) pairBox.textContent = CONTRACT_DATA.pair;
  
  const chgEl = document.querySelector("#chg24");
  if(chgEl){
    chgEl.textContent = CONTRACT_DATA.change;
    chgEl.style.color = CONTRACT_DATA.change.startsWith("+") ? "#47d88c" : "#ff6871";
  }

  // تحديث الأزواج داخل اللوحة
  document.querySelectorAll(".r b").forEach(el=>{
    if(el.textContent.includes("AAVE/USDT")) el.textContent = CONTRACT_DATA.pair;
  });

  // تحديث وحدة العملة في رأس دفتر الطلبات
  const symbol = CONTRACT_DATA.pair.split("/")[0];
  const headerCols = document.querySelectorAll(".book .h div");
  if(headerCols[1]) headerCols[1].innerHTML = "الكمية<br>("+symbol+")";

  // تحديث السعر السوقي
  const mp = document.querySelector("#mp");
  const mid = document.querySelector("#mid");
  if(mp) mp.textContent = CONTRACT_DATA.price + " USDT";
  if(mid) mid.textContent = "≈" + CONTRACT_DATA.price + " USDT";

  // تحديث الاتجاه
  if(CONTRACT_DATA.direction === "dn"){
    const dn = document.querySelector(".dn");
    const up = document.querySelector(".up");
    const sb = document.querySelector(".sb");
    const dir = document.querySelector("#dir");
    if(dn && up && sb && dir){
      up.classList.remove("on");
      dn.classList.add("on");
      dir.textContent = "هبوط السعر";
      dir.className = "r1";
      sb.className = "sb red";
    }
  }

  // علامة مرئية صغيرة (اختياري) - يمكن حذفها
  console.log("✅ تم حقن tkadh.js - وضع: صفقة تعاقدية");
})();
