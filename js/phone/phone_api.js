export const PhoneAPI = {
    SUPABASE_URL: 'https://surgrksyiscmaxgggitx.supabase.co',
    SUPABASE_KEY: 'sb_publishable_Q1a5lFcqiUK1t2UHH3P2bQ_jw3LFoaa',
    
    // 🌟 全局日志与报错记录器
    logger: {
        getLogs() {
            try { return JSON.parse(localStorage.getItem('sys_error_logs') || '[]'); } catch(e) { return []; }
        },
        log(type, msg, detail = '') {
            try {
                let logs = this.getLogs();
                const now = new Date();
                const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
                logs.unshift({ type, time: timeStr, msg: String(msg), detail: String(detail) });
                if (logs.length > 60) logs = logs.slice(0, 60);
                localStorage.setItem('sys_error_logs', JSON.stringify(logs));
            } catch(e) {}
        },
        clear() {
            localStorage.removeItem('sys_error_logs');
        }
    },

    LocalDB: {
        dbName: 'cc-assets', storeName: 'img', _db: null, _urls: {},
        init() {
            return new Promise((res, rej) => {
                const r = indexedDB.open(this.dbName, 1);
                r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains(this.storeName)) r.result.createObjectStore(this.storeName); };
                r.onsuccess = () => { this._db = r.result; res(this._db); };
                r.onerror = () => rej(r.error);
            });
        },
        async get(key) {
            try {
                if (!this._db) await this.init();
                return new Promise((res, rej) => {
                    const r = this._db.transaction(this.storeName, 'readonly').objectStore(this.storeName).get(key);
                    r.onsuccess = () => res(r.result || null);
                    r.onerror = () => rej(r.error);
                });
            } catch(e) { return null; }
        },
        async set(key, val) {
            if (!this._db) await this.init();
            return new Promise((res, rej) => {
                const t = this._db.transaction(this.storeName, 'readwrite');
                t.objectStore(this.storeName).put(val, key);
                t.oncomplete = () => res();
                t.onerror = () => rej(t.error);
            });
        },
        async delete(key) {
            if (!this._db) await this.init();
            return new Promise((res, rej) => {
                const t = this._db.transaction(this.storeName, 'readwrite');
                t.objectStore(this.storeName).delete(key);
                t.oncomplete = () => res();
                t.onerror = () => rej(t.error);
            });
        },
        shrink(file, maxW) {
            return new Promise((res, rej) => {
                const url = URL.createObjectURL(file);
                const im = new Image();
                im.onload = () => {
                    URL.revokeObjectURL(url);
                    let w = im.naturalWidth, h = im.naturalHeight;
                    if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
                    const c = document.createElement('canvas');
                    c.width = w; c.height = h;
                    c.getContext('2d').drawImage(im, 0, 0, w, h);
                    c.toBlob(b => b ? res(b) : rej(new Error('压缩失败')), 'image/jpeg', 0.85);
                };
                im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('文件打不开')); };
                im.src = url;
            });
        },
        urlOf(key, blob) {
            if (!blob) return '';
            if (typeof blob === 'string') return blob;
            if (this._urls[key]) URL.revokeObjectURL(this._urls[key]);
            this._urls[key] = URL.createObjectURL(blob);
            return this._urls[key];
        }
    },

    EchoVault: {
        getData() {
            const raw = localStorage.getItem('echovault_data');
            let parsed = raw ? JSON.parse(raw) : null;
            if (!parsed || (Object.keys(parsed.daily || {}).length === 0 && Object.keys(parsed.permanent || {}).length === 0)) {
                return { daily: {}, permanent: {}, archive: {} };
            }
            if (!parsed.daily) parsed.daily = {};
            if (!parsed.permanent) parsed.permanent = {};
            if (!parsed.archive) parsed.archive = {};
            return parsed;
        },
        saveData(data) { 
            try {
                localStorage.setItem('echovault_data', JSON.stringify(data)); 
            } catch(e) {
                PhoneAPI.logger.log('ERROR', 'EchoVault 写入超限', e.message);
            }
        },
        write(content, type = 'daily', importance = 5, tags = '', title = '') {
            const data = this.getData();
            const now = new Date();
            const dateStr = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0]; 
            const created = now.toLocaleString('zh-CN', { hour12: false });
            if (type === 'daily') {
                if (data.daily[dateStr]) data.daily[dateStr].content += `\n\n---\n\n${content}`;
                else data.daily[dateStr] = { type: 'daily', created, importance, tags, hits: 0, content, comments: [] };
            } else if (type === 'permanent') {
                const key = title || content.substring(0, 10).replace(/\s/g, '_') + '_' + now.getHours() + now.getMinutes();
                data.permanent[key] = { type: 'permanent', created, importance, tags, hits: 0, content, comments: [] };
            }
            this.saveData(data);
            return true;
        },
        deleteItem(type, key) {
            const data = this.getData();
            if (data[type] && data[type][key]) { delete data[type][key]; this.saveData(data); }
        }
    },
    
    showToast(msg) {
        const toast = document.getElementById('toast');
        const toastMsg = document.getElementById('toast-msg');
        if (toast && toastMsg) {
            toastMsg.innerText = msg;
            toast.classList.add('show');
            setTimeout(() => { toast.classList.remove('show'); }, 3000);
        }
    },
    
    _doSave() {
        const saveIfExist = (id, key, isCheckbox = false) => { 
            const el = document.getElementById(id); 
            if (el) {
                const val = isCheckbox ? el.checked : el.value.trim();
                const oldVal = localStorage.getItem(key);
                try { localStorage.setItem(key, val); } catch(e){}
                if (key.startsWith('bg_') && val !== oldVal && this.LocalDB) {
                    this.LocalDB.delete(key);
                }
            }
        };

        saveIfExist('my-name', 'my_name'); 
        saveIfExist('char-name', 'char_name');
        saveIfExist('love-start-date', 'love_start_date');
        saveIfExist('diary-title', 'diary_title'); 
        saveIfExist('diary-start-date', 'diary_start_date');

        saveIfExist('bg-global', 'bg_global'); 
        saveIfExist('bg-chat', 'bg_chat');
        saveIfExist('bg-diary-cover', 'bg_diary_cover'); 
        saveIfExist('bg-diary-page', 'bg_diary_page');
        
        try { this.applyUITheme(); } catch(e) {}
        
        saveIfExist('img-api-url', 'img_api_url'); 
        saveIfExist('img-api-key', 'img_api_key'); 
        saveIfExist('img-api-model', 'img_api_model');

        const charName = localStorage.getItem('char_name'); 
        const myName = localStorage.getItem('my_name');
        if (charName && myName) { 
            const titleEl = document.getElementById('top-title'); 
            if (titleEl) titleEl.innerText = `${myName} & ${charName}`; 
        }
    },
    
    autoSave() { try { this._doSave(); } catch (e) {} },
    
    loadSettings() {
        try {
            const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
            setVal('my-name', localStorage.getItem('my_name') || ''); 
            setVal('char-name', localStorage.getItem('char_name') || '');

            setVal('bg-global', localStorage.getItem('bg_global') || ''); 
            setVal('bg-chat', localStorage.getItem('bg_chat') || '');
            setVal('bg-diary-cover', localStorage.getItem('bg_diary_cover') || ''); 
            setVal('bg-diary-page', localStorage.getItem('bg_diary_page') || '');
            setVal('diary-title', localStorage.getItem('diary_title') || 'His Diary');

            const today = new Date(); 
            const defaultDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
            setVal('diary-start-date', localStorage.getItem('diary_start_date') || defaultDate);
            setVal('love-start-date', localStorage.getItem('love_start_date') || defaultDate);
            
            try { this.applyUITheme(); } catch(e){}
            
            setVal('img-api-url', localStorage.getItem('img_api_url') || ''); 
            setVal('img-api-key', localStorage.getItem('img_api_key') || ''); 
            setVal('img-api-model', localStorage.getItem('img_api_model') || 'dall-e-3');

            const savedCharName = localStorage.getItem('char_name'); 
            const savedMyName = localStorage.getItem('my_name');
            if (savedCharName && savedMyName) { 
                const titleEl = document.getElementById('top-title'); 
                if (titleEl) titleEl.innerText = `${savedMyName} & ${savedCharName}`; 
            }
        } catch (error) {}
    },
    
    applyUITheme() {
        const appColor = localStorage.getItem('app_color') || 'blue';
        document.documentElement.setAttribute('data-color', appColor);

        let globalBg = localStorage.getItem('bg_global'); 
        let chatBg = localStorage.getItem('bg_chat');
        let diaryCover = localStorage.getItem('bg_diary_cover');
        let diaryPage = localStorage.getItem('bg_diary_page');
        
        if (globalBg) document.documentElement.style.setProperty('--bg-image-global', `url('${globalBg}')`); else document.documentElement.style.removeProperty('--bg-image-global');
        if (chatBg) document.documentElement.style.setProperty('--bg-image-chat', `url('${chatBg}')`); else document.documentElement.style.removeProperty('--bg-image-chat');
        if (diaryCover) document.documentElement.style.setProperty('--bg-image-diary-cover', `url('${diaryCover}')`); else document.documentElement.style.removeProperty('--bg-image-diary-cover');
        if (diaryPage) document.documentElement.style.setProperty('--bg-image-diary-page', `url('${diaryPage}')`); else document.documentElement.style.removeProperty('--bg-image-diary-page');
        
        this._applyIndexedDBThemes();
    },
    
    async _applyIndexedDBThemes() {
        if (!this.LocalDB || !this.LocalDB._db) return;
        try {
            const keys = ['bg_global', 'bg_chat', 'bg_diary_cover', 'bg_diary_page'];
            for (let key of keys) {
                const urlSetting = localStorage.getItem(key);
                if (!urlSetting || urlSetting.trim() === '') {
                    const blob = await this.LocalDB.get(key);
                    if (blob) {
                        const url = this.LocalDB.urlOf(key, blob);
                        let cssVar = '--bg-image-' + key.replace('bg_', '').replace(/_/g, '-');
                        if (key === 'bg_global') cssVar = '--bg-image-global';
                        document.documentElement.style.setProperty(cssVar, `url('${url}')`);
                    }
                }
            }
        } catch(e) {}
    },
    
    getPresets() { return JSON.parse(localStorage.getItem('ai_api_presets') || '[]'); },
    refreshPresetDropdowns() {
        const presets = this.getPresets();
        const mainSelect = document.getElementById('quick-main-engine');
        const delSelect = document.getElementById('preset-delete-select');
        if (!mainSelect) return;
        let optionsHtml = '<option value="">-- 请选择 --</option>';
        presets.forEach(p => { optionsHtml += `<option value="${p.id}">${p.name} (${p.model})</option>`; });
        mainSelect.innerHTML = optionsHtml;
        mainSelect.value = localStorage.getItem('main_engine_id') || '';
        if (delSelect) delSelect.innerHTML = optionsHtml;
    },
    assignEngine(type, presetId) {
        if (type === 'main') { 
            localStorage.setItem('main_engine_id', presetId); 
            this.showToast('✅ 主引擎切换成功！'); 
            this.refreshPresetDropdowns(); 
            if (window.PhoneUI && window.PhoneUI.renderApiModalContent) {
                window.PhoneUI.renderApiModalContent();
            }
        }
    },
    getEngineConfig() {
        let presetId = localStorage.getItem('main_engine_id');
        if (!presetId) return null;
        return this.getPresets().find(p => p.id === presetId);
    },
    
    clearChat() {
        if(confirm("危险操作：确定要清空所有记录吗？清空后无法恢复！")) {
            const roleId = window.Config?.currentContactId;
            if(roleId && window.Config?.phoneData?.[roleId]) {
                window.Config.phoneData[roleId].wechat = { items: [] };
                try {
                    localStorage.setItem('phone_data', JSON.stringify(window.Config.phoneData));
                } catch(e){}
            }
            if (window.PhoneUI && window.PhoneUI.renderAppContent) window.PhoneUI.renderAppContent('wechat');
            this.showToast("🗑️ 所有记录已清空！");
        }
    },
    
    getMemoryVault() { 
        try {
            const ev = this.EchoVault.getData(); 
            let arr = [];
            if (ev?.daily) {
                Object.keys(ev.daily).forEach(date => { 
                    if (ev.daily[date]) {
                        arr.push({ id: date, date: date, time: '00:00', source: ev.daily[date].tags || '日常', content: ev.daily[date].content || '', isCore: false, keywords: ev.daily[date].tags || '' }); 
                    }
                });
            }
            if (ev?.permanent) {
                Object.keys(ev.permanent).forEach(title => { 
                    if (ev.permanent[title]) {
                        arr.push({ id: title, date: (ev.permanent[title].created || '').split(' ')[0] || '2025-01-01', time: '00:00', source: ev.permanent[title].tags || '锚点', content: ev.permanent[title].content || '', isCore: true, keywords: title }); 
                    }
                });
            }
            return arr;
        } catch(e) {
            return [];
        }
    },

    recordTokenUsage(usage) {
        if (!usage) return;
        const total = usage.total_tokens || (usage.prompt_tokens + usage.completion_tokens) || 0;
        const prompt = usage.prompt_tokens || 0;
        const completion = usage.completion_tokens || 0;
        try {
            localStorage.setItem('token_last_usage', JSON.stringify({ prompt, completion, total, time: Date.now() }));
            const historyTotal = parseInt(localStorage.getItem('token_total_count') || '0', 10) + total;
            localStorage.setItem('token_total_count', historyTotal.toString());
        } catch(e){}
    },

    getTokenStats() {
        const totalCount = parseInt(localStorage.getItem('token_total_count') || '0', 10);
        let lastUsage = null;
        try { lastUsage = JSON.parse(localStorage.getItem('token_last_usage') || 'null'); } catch(e){}
        const pricePerM = parseFloat(localStorage.getItem('token_price_per_m') || '2.0');
        const totalCost = ((totalCount / 1000000) * pricePerM).toFixed(4);
        const lastCost = lastUsage ? (((lastUsage.total || 0) / 1000000) * pricePerM).toFixed(4) : '0.0000';
        return { totalCount, totalCost, lastUsage, lastCost, pricePerM };
    },

    resetTokenStats() {
        localStorage.setItem('token_total_count', '0');
        localStorage.removeItem('token_last_usage');
        this.showToast('✅ 本地统计已清零！');
    },

    async chatWithAI(messages) {
        const config = this.getEngineConfig();
        if (!config) {
            const err = "请先去【系统设置】里分配引擎配置！";
            PhoneAPI.logger.log('ERROR', '未配置引擎', err);
            throw new Error(err);
        }
        const endpoint = config.url.endsWith('/chat/completions') ? config.url : config.url.replace(/\/$/, '') + '/chat/completions';
        
        try {
            const response = await fetch(endpoint, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.key}` }, 
                body: JSON.stringify({ model: config.model, messages: messages, temperature: 0.7 }) 
            });

            if (!response.ok) {
                let errDetail = `${response.status}`;
                try {
                    const errData = await response.json();
                    if (errData?.error?.message) errDetail += `: ${errData.error.message}`;
                } catch(e){}
                PhoneAPI.logger.log('ERROR', '模型请求返回错误', errDetail);
                throw new Error(`API 报错: ${errDetail}`);
            }

            const data = await response.json();

            if (data.usage) {
                this.recordTokenUsage(data.usage);
            }
            PhoneAPI.logger.log('INFO', '成功调用大模型', `Tokens: ${data.usage?.total_tokens || '未知'}`);

            let reply = data.choices?.[0]?.message?.content || '';
            return reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        } catch (error) { 
            PhoneAPI.logger.log('ERROR', 'chatWithAI 异常中断', error.message);
            throw new Error(error.message || "网络错误或 API 配置不正确"); 
        }
    },

    async generateImage(promptText, options = {}) {
        if (window.DrawEngine && window.DrawEngine.generateImage) {
            return await window.DrawEngine.generateImage(promptText, options);
        }
        return `https://image.pollinations.ai/prompt/${encodeURIComponent(promptText)}?width=512&height=512&nologo=true`;
    },
    
    getFavorites() { return JSON.parse(localStorage.getItem('starry_favorites') || '[]'); },
    saveFavorite(text, source, sender) { 
        const favs = this.getFavorites(); 
        favs.push({ id: 'fav_' + Date.now(), content: text, source: source, sender: sender, time: new Date().toISOString().split('T')[0] }); 
        try { localStorage.setItem('starry_favorites', JSON.stringify(favs)); } catch(e){}
        this.showToast('⭐ 已存入星海收藏夹！'); 
    },
    deleteFavorite(id) { 
        if (!confirm('确定删除吗？')) return; 
        let favs = this.getFavorites(); 
        favs = favs.filter(f => f.id !== id); 
        try { localStorage.setItem('starry_favorites', JSON.stringify(favs)); } catch(e){}
        if (window.PhoneUI && window.PhoneUI.renderAppContent) window.PhoneUI.renderAppContent('favorites'); 
        this.showToast('🗑️ 已删除'); 
    },

    async forceUpdate() {
        if (!confirm("确定要强制刷新并获取最新代码吗？")) return;

        try {
            // 只清理“代码缓存”，不碰 localStorage / IndexedDB，避免误伤聊天、日记和图片。
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const reg of registrations) await reg.unregister();
            }
            if ('caches' in window) {
                const keys = await caches.keys();
                for (const key of keys) await caches.delete(key);
            }

            // 先从网络拿一次最新首页，再带时间戳重新进入。
            // 这样桌面 PWA 不会一直拿着旧的启动文档。
            const stamp = Date.now();
            try {
                await fetch('./index.html?force=' + stamp, {
                    cache: 'no-store',
                    headers: { 'Cache-Control': 'no-cache' }
                });
            } catch (e) {}

            window.location.replace('./index.html?force=' + stamp);
        } catch (e) {
            window.location.replace('./index.html?force=' + Date.now());
        }
    }
};

// 🌟 全局未捕获异常自动录入日志面板
if (typeof window !== 'undefined') {
    window.PhoneAPI = PhoneAPI;
    window.addEventListener('error', (e) => {
        PhoneAPI.logger.log('CRASH', e.message, `${e.filename}:${e.lineno}`);
    });
    window.addEventListener('unhandledrejection', (e) => {
        PhoneAPI.logger.log('PROMISE', e.reason?.message || e.reason, '');
    });
}
