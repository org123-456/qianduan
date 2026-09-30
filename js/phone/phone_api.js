export const PhoneAPI = {
    SUPABASE_URL: 'https://surgrksyiscmaxgggitx.supabase.co',
    SUPABASE_KEY: 'sb_publishable_Q1a5lFcqiUK1t2UHH3P2bQ_jw3LFoaa',
    
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

    EchoVault: {
        getData() {
            const raw = localStorage.getItem('echovault_data');
            let parsed = raw ? JSON.parse(raw) : null;
            
            if (!parsed || (Object.keys(parsed.daily || {}).length === 0 && Object.keys(parsed.permanent || {}).length === 0)) {
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
                                const created = `${item.date || ''} ${item.time || ''}`.trim() || dateStr;
                                if (defaultData.daily[dateStr]) defaultData.daily[dateStr].content += `\n\n---\n\n${item.content}`;
                                else defaultData.daily[dateStr] = { type: 'daily', created, importance: 5, tags: item.source, hits: 0, content: item.content, comments: [] };
                            }
                        });
                        localStorage.setItem('memory_vault_entries_backup', oldVaultRaw);
                        localStorage.removeItem('memory_vault_entries');
                        localStorage.setItem('echovault_data', JSON.stringify(defaultData));
                        return defaultData;
                    } catch(e) { console.error("记忆恢复失败", e); }
                }
                return defaultData;
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
                console.warn('EchoVault 保存超限', e);
            }
        },
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
        updateMemory(key, newContent) {
            const data = this.getData();
            let updated = false;
            if (data.permanent[key]) { data.permanent[key].content = newContent; updated = true; } 
            else if (data.daily[key]) { data.daily[key].content = newContent; updated = true; }
            if (updated) this.saveData(data);
            return updated;
        },
        deleteMemory(key) {
            const data = this.getData();
            let deleted = false;
            if (data.permanent[key]) { delete data.permanent[key]; deleted = true; }
            if (data.daily[key]) { delete data.daily[key]; deleted = true; }
            if (deleted) this.saveData(data);
            return deleted;
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
    
    // 🌟 核心防报错保护：优先保障名字与人设绝对写入，UI 重绘做隔离
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

        // 🌟 1. 名字、人设、系统提示词排在最首位执行，绝不受后续任何报错影响
        saveIfExist('my-name', 'my_name'); 
        saveIfExist('char-name', 'char_name');
        saveIfExist('system-prompt', 'system_prompt'); 
        saveIfExist('char-persona', 'char_persona');

        // 🌟 2. 纪念日与日记
        saveIfExist('love-start-date', 'love_start_date');
        saveIfExist('diary-title', 'diary_title'); 
        saveIfExist('diary-start-date', 'diary_start_date');

        // 🌟 3. 壁纸 URL
        saveIfExist('bg-global', 'bg_global'); 
        saveIfExist('bg-chat', 'bg_chat');
        saveIfExist('bg-diary-cover', 'bg_diary_cover'); 
        saveIfExist('bg-diary-page', 'bg_diary_page');
        
        // 🌟 4. 安全保护主题重刷，防止异常阻断
        try { 
            this.applyUITheme(); 
        } catch(e) {
            console.warn('UI主题更新跳过:', e);
        }
        
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
            setVal('system-prompt', localStorage.getItem('system_prompt') || ''); 
            setVal('char-persona', localStorage.getItem('char_persona') || '');

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
    
    getArchives() { return JSON.parse(localStorage.getItem('story_archives') || '[]'); },
    
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
            console.error('获取记忆库失败:', e);
            return [];
        }
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
        if (window.PhoneUI && window.PhoneUI.renderMemoryVault) window.PhoneUI.renderMemoryVault(); 
        this.showToast('🗑️ 记忆已消除'); 
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

    async queryRemoteBalance() {
        const config = this.getEngineConfig();
        if (!config || !config.url || !config.key) return null;

        let baseUrl = config.url.replace(/\/chat\/completions\/?$/, '').replace(/\/v1\/?$/, '').replace(/\/$/, '');
        const urlsToTry = [
            `${baseUrl}/v1/dashboard/billing/subscription`,
            `${baseUrl}/dashboard/billing/subscription`
        ];

        for (let subUrl of urlsToTry) {
            try {
                const subRes = await fetch(subUrl, {
                    headers: { 'Authorization': `Bearer ${config.key}` }
                });
                if (subRes.ok) {
                    const subData = await subRes.json();
                    const hardLimit = parseFloat(subData.hard_limit_usd) || 0;

                    const usageUrl = subUrl.replace('subscription', 'usage') + `?start_date=2020-01-01&end_date=2099-12-31`;
                    const usageRes = await fetch(usageUrl, {
                        headers: { 'Authorization': `Bearer ${config.key}` }
                    }).catch(() => null);

                    let used = 0;
                    if (usageRes && usageRes.ok) {
                        const uData = await usageRes.json();
                        used = (parseFloat(uData.total_usage) || 0) / 100;
                    } else {
                        if (hardLimit > 0 && subData.soft_limit_usd !== undefined) {
                            used = Math.max(0, hardLimit - (parseFloat(subData.soft_limit_usd) || hardLimit));
                        }
                    }

                    const isUnlimited = hardLimit >= 9999999;
                    const remaining = isUnlimited ? '不限' : Math.max(0, hardLimit - used).toFixed(2);

                    return {
                        isUnlimited,
                        remaining,
                        used: used.toFixed(4),
                        total: isUnlimited ? '无限' : hardLimit.toFixed(2)
                    };
                }
            } catch(e) {}
        }
        return null;
    },
    
    async chatWithAI(messages) {
        const config = this.getEngineConfig();
        if (!config) throw new Error("请先去【系统设置】里分配引擎配置！");
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
                throw new Error(`API 报错: ${errDetail}`);
            }

            const data = await response.json();

            if (data.usage) {
                this.recordTokenUsage(data.usage);
            } else {
                const approxPrompt = JSON.stringify(messages).length;
                const approxReply = (data.choices?.[0]?.message?.content || '').length;
                this.recordTokenUsage({ prompt_tokens: Math.round(approxPrompt / 2), completion_tokens: Math.round(approxReply / 2), total_tokens: Math.round((approxPrompt + approxReply) / 2) });
            }

            let reply = data.choices?.[0]?.message?.content || '';
            return reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        } catch (error) { 
            console.error("chatWithAI 异常:", error);
            throw new Error(error.message || "网络错误或 API 配置不正确"); 
        }
    },

    async generateImage(promptText, options = {}) {
        if (window.DrawEngine && window.DrawEngine.generateImage) {
            return await window.DrawEngine.generateImage(promptText, options);
        }
        return `https://image.pollinations.ai/prompt/${encodeURIComponent(promptText)}?width=512&height=512&nologo=true`;
    },
    
    getDiaries() { return JSON.parse(localStorage.getItem('char_diaries') || '{}'); },
    saveDiary(dateStr, content) { 
        const diaries = this.getDiaries(); 
        diaries[dateStr] = content; 
        try { localStorage.setItem('char_diaries', JSON.stringify(diaries)); } catch(e){}
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

    async syncToCloud() {
        this.showToast("☁️ 正在上传存档至 Supabase 数据库...");
        try {
            const data = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                data[key] = localStorage.getItem(key);
            }
            const headers = { 'apikey': this.SUPABASE_KEY, 'Authorization': `Bearer ${this.SUPABASE_KEY}`, 'Content-Type': 'application/json' };
            const checkRes = await fetch(`${this.SUPABASE_URL}/rest/v1/phone_sync?id=eq.1&select=id`, { headers });
            const checkData = await checkRes.json();
            let saveRes;
            if (checkData && checkData.length > 0) {
                saveRes = await fetch(`${this.SUPABASE_URL}/rest/v1/phone_sync?id=eq.1`, { method: 'PATCH', headers: headers, body: JSON.stringify({ content: JSON.stringify(data) }) });
            } else {
                saveRes = await fetch(`${this.SUPABASE_URL}/rest/v1/phone_sync`, { method: 'POST', headers: { ...headers, 'Prefer': 'return=representation' }, body: JSON.stringify({ id: 1, content: JSON.stringify(data) }) });
            }
            if (!saveRes.ok) throw new Error(`[${saveRes.status}]`);
            this.showToast("🎉 成功同步至 Supabase！云端已安全归档！");
        } catch (err) { alert("Supabase 同步失败: " + err.message); }
    },
    
    async restoreFromCloud() {
        if (!confirm("⚠️ 确定要从 Supabase 恢复存档吗？这会覆盖本地当前的数据！")) return;
        this.showToast("📥 正在从 Supabase 拉取最新存档...");
        try {
            const headers = { 'apikey': this.SUPABASE_KEY, 'Authorization': `Bearer ${this.SUPABASE_KEY}` };
            const res = await fetch(`${this.SUPABASE_URL}/rest/v1/phone_sync?id=eq.1&select=content`, { headers });
            if (!res.ok) throw new Error(`[${res.status}]`);
            const rows = await res.json();
            if (!rows || rows.length === 0 || !rows[0].content) return alert("Supabase 云端还没有备份数据哦！");
            let data = rows[0].content;
            if (typeof data === 'string') { try { data = JSON.parse(data); } catch (e) {} }
            if (typeof data === 'object' && data !== null) {
                for (const key in data) {
                    let val = data[key];
                    if (typeof val === 'object' && val !== null) localStorage.setItem(key, JSON.stringify(val));
                    else localStorage.setItem(key, String(val));
                }
            }
            this.showToast("✨ 云端恢复成功！正在重新载入...");
            setTimeout(() => { window.location.reload(); }, 1200);
        } catch (err) { alert("Supabase 恢复失败: " + err.message); }
    },
    
    async exportData() {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) { const key = localStorage.key(i); data[key] = localStorage.getItem(key); }
        const jsonStr = JSON.stringify(data, null, 2);
        const dateStr = new Date().toISOString().replace(/[:\-\sT]/g, '').slice(0, 14);
        const fileName = `ClaireClaude_Backup_${dateStr}.json`;
        try {
            const file = new File([jsonStr], fileName, { type: 'application/json' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file] });
                this.showToast("📦 备份已发送！");
                return;
            }
        } catch (err) {}
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.style.display = 'none'; a.href = url; a.download = fileName;
        document.body.appendChild(a); a.click();
        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
    },
    
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!confirm("⚠️ 警告：导入存档将覆盖当前手机里的所有记录！确定吗？")) { event.target.value = ''; return; }
                for (const key in data) {
                    let val = data[key];
                    if (typeof val === 'object' && val !== null) localStorage.setItem(key, JSON.stringify(val));
                    else localStorage.setItem(key, String(val));
                }
                this.showToast("✨ 导入成功！正在重启...");
                setTimeout(() => { window.location.reload(); }, 1500);
            } catch (err) { alert("导入失败！"); }
            event.target.value = '';
        };
        reader.readAsText(file);
    },

    async forceUpdate() { 
        if (confirm("确定要强制刷新并获取最新代码吗？")) { 
            if ('serviceWorker' in navigator) { const registrations = await navigator.serviceWorker.getRegistrations(); for (let reg of registrations) { await reg.unregister(); } } 
            if ('caches' in window) { const keys = await caches.keys(); for (let key of keys) { await caches.delete(key); } } 
            window.location.href = window.location.pathname + '?t=' + new Date().getTime(); 
        } 
    }
};

if (typeof window !== 'undefined') { window.PhoneAPI = PhoneAPI; }
