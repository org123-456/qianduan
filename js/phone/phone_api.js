import { LocalDB } from './api/db_api.js';
import { EchoVault } from './api/vault_api.js';
import { CloudAPI } from './api/cloud_api.js';

export const PhoneAPI = {
    // 挂载拆分出去的模块
    LocalDB: LocalDB,
    EchoVault: EchoVault,
    ...CloudAPI,
    
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
    
    applyUITheme() {
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
            if (window.PhoneUI && window.PhoneUI.renderAppContent) window.PhoneUI.renderAppContent('wechat');
            this.showToast("🗑️ 所有记录已清空！");
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
        if (window.PhoneUI && window.PhoneUI.renderMemoryVault) window.PhoneUI.renderMemoryVault(); 
        this.showToast('🗑️ 记忆已消除'); 
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
    deleteFavorite(id) { if (!confirm('确定删除吗？')) return; let favs = this.getFavorites(); favs = favs.filter(f => f.id !== id); localStorage.setItem('starry_favorites', JSON.stringify(favs)); if (window.PhoneUI && window.PhoneUI.renderAppContent) window.PhoneUI.renderAppContent('favorites'); this.showToast('🗑️ 已删除'); },

    async forceUpdate() { 
        if (confirm("确定要强制刷新并获取最新代码吗？")) { 
            if ('serviceWorker' in navigator) { const registrations = await navigator.serviceWorker.getRegistrations(); for (let reg of registrations) { await reg.unregister(); } } 
            if ('caches' in window) { const keys = await caches.keys(); for (let key of keys) { await caches.delete(key); } } 
            window.location.href = window.location.pathname + '?t=' + new Date().getTime(); 
        } 
    }
};

if (typeof window !== 'undefined') { window.PhoneAPI = PhoneAPI; }
