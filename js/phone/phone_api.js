export const PhoneAPI = {
    SUPABASE_URL: 'https://kkzztqbxjzskrsapiils.supabase.co',
    SUPABASE_KEY: 'sb_publishable_h1SIixE2PCM2hrjXvt1I4w_eKYSQCE0',
    
    // IndexedDB 本地存图神技
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
            if (!this._db) await this.init();
            return new Promise((res, rej) => {
                const r = this._db.transaction(this.storeName, 'readonly').objectStore(this.storeName).get(key);
                r.onsuccess = () => res(r.result || null);
                r.onerror = () => rej(r.error);
            });
        },
        async set(key, blob) {
            if (!this._db) await this.init();
            return new Promise((res, rej) => {
                const t = this._db.transaction(this.storeName, 'readwrite');
                t.objectStore(this.storeName).put(blob, key);
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
            if (this._urls[key]) URL.revokeObjectURL(this._urls[key]);
            this._urls[key] = URL.createObjectURL(blob);
            return this._urls[key];
        }
    },

    // 🌟 修复：EchoVault 记忆库强制拉取备份
    EchoVault: {
        getData() {
            const raw = localStorage.getItem('echovault_data');
            let parsed = raw ? JSON.parse(raw) : null;
            
            // 如果数据为空，或者压根没数据，强制去备份库里捞！
            if (!parsed || (Object.keys(parsed.daily).length === 0 && Object.keys(parsed.permanent).length === 0)) {
                const defaultData = { daily: {}, permanent: {}, archive: {} };
                let oldVaultRaw = localStorage.getItem('memory_vault_entries');
                if (!oldVaultRaw) oldVaultRaw = localStorage.getItem('memory_vault_entries_backup');
                
                if (oldVaultRaw) {
                    try {
                        const oldVault = JSON.parse(oldVaultRaw);
                        oldVault.forEach(item => {
                            if (item.isCore) {
                                const title = item.keywords || item.content.substring(0, 10) + '...';
                                defaultData.permanent[title] = { type: 'permanent', created: `${item.date} ${item.time}`, importance: 10, tags: item.source, hits: 0, content: item.content, comments: [] };
                            } else {
                                const dateStr = item.date || new Date().toISOString().split('T')[0];
                                if (defaultData.daily[dateStr]) defaultData.daily[dateStr].content += `\n\n---\n\n${item.content}`;
                                else defaultData.daily[dateStr] = { type: 'daily', created: `${item.date} ${item.time}`, importance: 5, tags: item.source, hits: 0, content: item.content, comments: [] };
                            }
                        });
                        localStorage.setItem('memory_vault_entries_backup', oldVaultRaw);
                        localStorage.removeItem('memory_vault_entries');
                        localStorage.setItem('echovault_data', JSON.stringify(defaultData));
                        console.log("✅ 成功从备份恢复记忆！");
                        return defaultData;
                    } catch(e) { console.error("记忆恢复失败", e); }
                }
                return defaultData;
            }
            return parsed;
        },
        saveData(data) { localStorage.setItem('echovault_data', JSON.stringify(data)); },
        calculateScore(meta, daysOld) {
            const importance = parseInt(meta.importance) || 5;
            const hits = parseInt(meta.hits) || 0;
            const halfLife = Math.max(importance * 10, 1);
            const decay = Math.exp(-Math.LN2 / halfLife * daysOld);
            const bonus = 1 + 0.35 * Math.log(1 + hits);
            return parseFloat((importance * decay * bonus).toFixed(2));
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
        dream() {
            const data = this.getData();
            const dates = Object.keys(data.daily).sort((a, b) => new Date(b) - new Date(a));
            return dates.slice(0, 3).map(date => ({ date, ...data.daily[date] }));
        },
        remind() {
            const data = this.getData();
            const dates = Object.keys(data.daily);
            if (dates.length === 0) return null;
            const now = new Date();
            let scoredFiles = dates.map(date => {
                const meta = data.daily[date];
                const createdDate = new Date(meta.created.split(' ')[0]);
                const daysOld = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
                return { date, meta, score: this.calculateScore(meta, daysOld) };
            });
            scoredFiles.sort((a, b) => a.score - b.score);
            const poolSize = Math.max(1, Math.floor(scoredFiles.length / 3));
            const chosen = scoredFiles[Math.floor(Math.random() * poolSize)];
            this.incrementHits('daily', chosen.date);
            return chosen;
        },
        incrementHits(type, key) {
            const data = this.getData();
            if (data[type] && data[type][key]) { data[type][key].hits = (data[type][key].hits || 0) + 1; this.saveData(data); }
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
                localStorage.setItem(key, val);
                // 🌟 修复：如果用户在设置里手动改了 URL，就删掉长按存的本地图，让 URL 生效
                if (key.startsWith('bg_') && val !== oldVal && this.LocalDB) {
                    this.LocalDB.delete(key);
                }
            }
        };
        saveIfExist('my-name', 'my_name'); saveIfExist('char-name', 'char_name');
        saveIfExist('bg-global', 'bg_global'); saveIfExist('bg-chat', 'bg_chat');
        saveIfExist('bg-diary-cover', 'bg_diary_cover'); saveIfExist('bg-diary-page', 'bg_diary_page');
        saveIfExist('love-start-date', 'love_start_date');
        saveIfExist('diary-title', 'diary_title'); saveIfExist('diary-start-date', 'diary_start_date');
        
        this.applyUITheme();
        
        saveIfExist('system-prompt', 'system_prompt'); saveIfExist('char-persona', 'char_persona'); saveIfExist('novel-style', 'novel_style');
        saveIfExist('img-api-url', 'img_api_url'); saveIfExist('img-api-key', 'img_api_key'); saveIfExist('img-api-model', 'img_api_model');
        const charName = localStorage.getItem('char_name'); const myName = localStorage.getItem('my_name');
        if (charName && myName) { const titleEl = document.getElementById('top-title'); if (titleEl) titleEl.innerText = `${myName} & ${charName}`; }
    },
    
    autoSave() { try { this._doSave(); } catch (e) {} },
    
    loadSettings() {
        try {
            const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
            setVal('my-name', localStorage.getItem('my_name') || ''); setVal('char-name', localStorage.getItem('char_name') || '');
            setVal('bg-global', localStorage.getItem('bg_global') || ''); setVal('bg-chat', localStorage.getItem('bg_chat') || '');
            setVal('bg-diary-cover', localStorage.getItem('bg_diary_cover') || ''); setVal('bg-diary-page', localStorage.getItem('bg_diary_page') || '');
            setVal('diary-title', localStorage.getItem('diary_title') || 'His Diary');
            const today = new Date(); const defaultDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
            setVal('diary-start-date', localStorage.getItem('diary_start_date') || defaultDate);
            setVal('love-start-date', localStorage.getItem('love_start_date') || defaultDate);
            
            this.applyUITheme();
            
            setVal('system-prompt', localStorage.getItem('system_prompt') || ''); setVal('char-persona', localStorage.getItem('char_persona') || ''); setVal('novel-style', localStorage.getItem('novel_style') || '');
            setVal('img-api-url', localStorage.getItem('img_api_url') || ''); setVal('img-api-key', localStorage.getItem('img_api_key') || ''); setVal('img-api-model', localStorage.getItem('img_api_model') || 'dall-e-3');
            const savedCharName = localStorage.getItem('char_name'); const savedMyName = localStorage.getItem('my_name');
            if (savedCharName && savedMyName) { const titleEl = document.getElementById('top-title'); if (titleEl) titleEl.innerText = `${savedMyName} & ${savedCharName}`; }
        } catch (error) {}
    },
    
    // 🌟 修复：双通道壁纸渲染逻辑 (优先用 IndexedDB 本地长按图，没有再用 URL)
    applyUITheme() {
        let globalBg = localStorage.getItem('bg_global'); 
        let chatBg = localStorage.getItem('bg_chat');
        let diaryCover = localStorage.getItem('bg_diary_cover');
        let diaryPage = localStorage.getItem('bg_diary_page');
        
        // 先应用 URL
        if (globalBg) document.documentElement.style.setProperty('--bg-image-global', `url('${globalBg}')`); else document.documentElement.style.removeProperty('--bg-image-global');
        if (chatBg) document.documentElement.style.setProperty('--bg-image-chat', `url('${chatBg}')`); else document.documentElement.style.removeProperty('--bg-image-chat');
        if (diaryCover) document.documentElement.style.setProperty('--bg-image-diary-cover', `url('${diaryCover}')`); else document.documentElement.style.removeProperty('--bg-image-diary-cover');
        if (diaryPage) document.documentElement.style.setProperty('--bg-image-diary-page', `url('${diaryPage}')`); else document.documentElement.style.removeProperty('--bg-image-diary-page');
        
        // 然后异步检查 IndexedDB 是否有本地图，有的话覆盖
        this._applyIndexedDBThemes();
    },
    
    async _applyIndexedDBThemes() {
        if (!this.LocalDB || !this.LocalDB._db) return;
        try {
            const keys = ['bg_global', 'bg_chat', 'bg_diary_cover', 'bg_diary_page'];
            for (let key of keys) {
                // 如果用户没有在设置里填 URL，才去加载本地长按存的图
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
    
    async searchMusic(keyword) {
        this.showToast("🎵 正在云端检索歌曲...");
        try {
            const apis = [ `https://api.injahow.cn/meting/?type=search&search=${encodeURIComponent(keyword)}`, `https://netease-cloud-music-api-teal-roan.vercel.app/search?keywords=${encodeURIComponent(keyword)}&limit=1` ];
            let data = null;
            for (let api of apis) {
                try {
                    const res = await fetch(api); data = await res.json();
                    if (data.result && data.result.songs && data.result.songs.length > 0) break;
                } catch(e) {}
            }
            if (data && data.result && data.result.songs && data.result.songs.length > 0) {
                const song = data.result.songs[0];
                return { id: song.id, name: song.name, artist: song.ar ? song.ar.map(a => a.name).join(' / ') : '未知', cover: (song.al && song.al.picUrl) ? song.al.picUrl + '?param=300y300' : 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop', url: `https://music.163.com/song/media/outer/url?id=${song.id}.mp3` };
            }
            throw new Error("API全挂了");
        } catch (e) {
            this.showToast("⚠️ 网络节点受限，已切换至【系统专属歌单】");
            const fallbackSongs = [ { id: 999001, name: "Cyberpunk Ambient", artist: "Night Glow", cover: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1000&auto=format&fit=crop", url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3" } ];
            return fallbackSongs[0];
        }
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
        if (delSelect) {
            delSelect.innerHTML = optionsHtml;
        }
    },
    assignEngine(type, presetId) {
        if (type === 'main') { localStorage.setItem('main_engine_id', presetId); this.showToast('✅ 主引擎切换成功！'); this.refreshPresetDropdowns(); }
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
                window.Config.phoneData[roleId].wechat = { items: [] }; window.Config.phoneData[roleId].novel = { items: [] };
                localStorage.setItem('phone_data', JSON.stringify(window.Config.phoneData));
            }
            window.PhoneUI?.renderAppContent?.('wechat'); this.showToast("🗑️ 所有记录已清空！");
        }
    },
    
    getWorldbookData() { return JSON.parse(localStorage.getItem('worldbook_entries') || '[]'); },
    getArchives() { return JSON.parse(localStorage.getItem('story_archives') || '[]'); },
    
    getMemoryVault() { 
        const ev = this.EchoVault.getData(); let arr = [];
        Object.keys(ev.daily).forEach(date => { arr.push({ id: date, date: date, time: '00:00', source: ev.daily[date].tags || '日常', content: ev.daily[date].content, isCore: false, keywords: ev.daily[date].tags }); });
        Object.keys(ev.permanent).forEach(title => { arr.push({ id: title, date: ev.permanent[title].created.split(' ')[0], time: '00:00', source: ev.permanent[title].tags || '锚点', content: ev.permanent[title].content, isCore: true, keywords: title }); });
        return arr;
    },
    saveToMemoryVault(summaries, source, isCore = false) {
        let summaryArray = Array.isArray(summaries) ? summaries : [summaries];
        summaryArray.forEach((item) => {
            let content = typeof item === 'string' ? item : item.content;
            let keywords = typeof item === 'string' ? "" : (item.keywords || "");
            if (isCore) this.EchoVault.write(content, 'permanent', 10, source, keywords);
            else this.EchoVault.write(content, 'daily', 5, source);
        });
        this.showToast(`🧠 成功存入 ${summaryArray.length} 条记忆档案！`);
    },
    deleteFromMemoryVault(id) { 
        if(!confirm('确定删除吗？')) return; 
        const ev = this.EchoVault.getData();
        if (ev.daily[id]) this.EchoVault.deleteItem('daily', id); else if (ev.permanent[id]) this.EchoVault.deleteItem('permanent', id);
        window.PhoneUI?.renderMemoryVault?.(); this.showToast('🗑️ 记忆已消除'); 
    },
    
    async chatWithAI(messages) {
        const config = this.getEngineConfig();
        if (!config) throw new Error("请先去【系统设置】里分配引擎配置！");
        const endpoint = config.url.endsWith('/chat/completions') ? config.url : config.url.replace(/\/$/, '') + '/chat/completions';
        try {
            const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.key}` }, body: JSON.stringify({ model: config.model, messages: messages, temperature: 0.7 }) });
            if (!response.ok) throw new Error(`API 报错: ${response.status}`);
            const data = await response.json();
            let reply = data.choices[0].message.content || '';
            return reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        } catch (error) { throw new Error("网络错误或 API 配置不正确"); }
    },
    
    getDiaries() { return JSON.parse(localStorage.getItem('char_diaries') || '{}'); },
    saveDiary(dateStr, content) { const diaries = this.getDiaries(); diaries[dateStr] = content; localStorage.setItem('char_diaries', JSON.stringify(diaries)); },
    getFavorites() { return JSON.parse(localStorage.getItem('starry_favorites') || '[]'); },
    saveFavorite(text, source, sender) { const favs = this.getFavorites(); favs.push({ id: 'fav_' + Date.now(), content: text, source: source, sender: sender, time: new Date().toISOString().split('T')[0] }); localStorage.setItem('starry_favorites', JSON.stringify(favs)); this.showToast('⭐ 已存入星海收藏夹！'); },
    deleteFavorite(id) { if (!confirm('确定删除吗？')) return; let favs = this.getFavorites(); favs = favs.filter(f => f.id !== id); localStorage.setItem('starry_favorites', JSON.stringify(favs)); window.PhoneUI?.renderAppContent?.('favorites'); this.showToast('🗑️ 已删除'); }
};

if (typeof window !== 'undefined') { window.PhoneAPI = PhoneAPI; }
