export const PhoneAPI = {
    showToast(msg) {
        const toast = document.getElementById('toast');
        const toastMsg = document.getElementById('toast-msg');
        if (toast && toastMsg) {
            toastMsg.innerText = msg;
            toast.classList.add('show');
            setTimeout(() => { toast.classList.remove('show'); }, 3000); 
        } else { alert(msg); }
    },

    _doSave() {
        const saveIfExist = (id, key, isCheckbox = false) => {
            const el = document.getElementById(id);
            if (el) localStorage.setItem(key, isCheckbox ? el.checked : el.value.trim());
        };

        saveIfExist('my-name', 'my_name'); saveIfExist('char-name', 'char_name');
        saveIfExist('my-avatar', 'my_avatar'); saveIfExist('ta-avatar', 'ta_avatar');
        
        saveIfExist('bg-global', 'bg_global'); saveIfExist('bg-chat', 'bg_chat');
        saveIfExist('bg-diary-cover', 'bg_diary_cover'); saveIfExist('bg-diary-page', 'bg_diary_page'); 
        
        saveIfExist('diary-title', 'diary_title'); saveIfExist('diary-quote', 'diary_quote'); saveIfExist('diary-start-date', 'diary_start_date'); 
        
        saveIfExist('ui-icon-novel', 'ui_icon_novel'); saveIfExist('ui-icon-worldbook', 'ui_icon_worldbook');
        saveIfExist('ui-icon-settings', 'ui_icon_settings'); saveIfExist('ui-icon-gallery', 'ui_icon_gallery');
        saveIfExist('ui-icon-shop', 'ui_icon_shop'); saveIfExist('ui-icon-task', 'ui_icon_task');
        
        this.applyUITheme(); 
        
        saveIfExist('system-prompt', 'system_prompt'); saveIfExist('char-persona', 'char_persona'); saveIfExist('novel-style', 'novel_style');
        saveIfExist('ban-emoji', 'ban_emoji', true); saveIfExist('share-memory', 'share_memory', true);
        saveIfExist('api-url-main', 'ai_api_url_main'); saveIfExist('api-key-main', 'ai_api_key_main'); saveIfExist('api-model-main', 'ai_api_model_main');
        saveIfExist('api-url-sub', 'ai_api_url_sub'); saveIfExist('api-key-sub', 'ai_api_key_sub'); saveIfExist('api-model-sub', 'ai_api_model_sub');

        const charName = localStorage.getItem('char_name'); const myName = localStorage.getItem('my_name');
        if (charName && myName) { const titleEl = document.getElementById('top-title'); if (titleEl) titleEl.innerText = `${myName} & ${charName}`; }
    },

    autoSave() { try { this._doSave(); } catch (e) { console.error("自动保存失败", e); } },
    saveSettings() { try { this._doSave(); this.showToast("✅ 设置保存成功！"); } catch (error) { alert("保存失败"); } },

    loadSettings() {
        try {
            const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
            setVal('my-name', localStorage.getItem('my_name') || ''); setVal('char-name', localStorage.getItem('char_name') || '');
            setVal('my-avatar', localStorage.getItem('my_avatar') || ''); setVal('ta-avatar', localStorage.getItem('ta_avatar') || '');
            
            setVal('bg-global', localStorage.getItem('bg_global') || ''); setVal('bg-chat', localStorage.getItem('bg_chat') || '');
            setVal('bg-diary-cover', localStorage.getItem('bg_diary_cover') || ''); setVal('bg-diary-page', localStorage.getItem('bg_diary_page') || ''); 
            
            setVal('diary-title', localStorage.getItem('diary_title') || 'His Diary'); 
            setVal('diary-quote', localStorage.getItem('diary_quote') || '“时间会磨平一切痕迹，\n除了我为你写下的字。”'); 
            
            const today = new Date();
            const defaultDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
            setVal('diary-start-date', localStorage.getItem('diary_start_date') || defaultDate); 
            
            setVal('ui-icon-novel', localStorage.getItem('ui_icon_novel') || ''); setVal('ui-icon-worldbook', localStorage.getItem('ui_icon_worldbook') || '');
            setVal('ui-icon-settings', localStorage.getItem('ui_icon_settings') || ''); setVal('ui-icon-gallery', localStorage.getItem('ui_icon_gallery') || '');
            setVal('ui-icon-shop', localStorage.getItem('ui_icon_shop') || ''); setVal('ui-icon-task', localStorage.getItem('ui_icon_task') || '');
            
            this.applyUITheme(); 

            setVal('system-prompt', localStorage.getItem('system_prompt') || ''); setVal('char-persona', localStorage.getItem('char_persona') || ''); setVal('novel-style', localStorage.getItem('novel_style') || '');
            const banEmojiEl = document.getElementById('ban-emoji'); if(banEmojiEl) banEmojiEl.checked = localStorage.getItem('ban_emoji') === 'true';
            const shareMemoryEl = document.getElementById('share-memory'); if(shareMemoryEl) shareMemoryEl.checked = localStorage.getItem('share_memory') === 'true';

            setVal('api-url-main', localStorage.getItem('ai_api_url_main') || ''); setVal('api-key-main', localStorage.getItem('ai_api_key_main') || ''); setVal('api-model-main', localStorage.getItem('ai_api_model_main') || '');
            setVal('api-url-sub', localStorage.getItem('ai_api_url_sub') || ''); setVal('api-key-sub', localStorage.getItem('ai_api_key_sub') || ''); setVal('api-model-sub', localStorage.getItem('ai_api_model_sub') || '');

            const savedCharName = localStorage.getItem('char_name'); const savedMyName = localStorage.getItem('my_name');
            if (savedCharName && savedMyName) { const titleEl = document.getElementById('top-title'); if (titleEl) titleEl.innerText = `${savedMyName} & ${savedCharName}`; }
        } catch (error) { console.error("加载设置失败:", error); }
    },

    applyUITheme() {
        const globalBg = localStorage.getItem('bg_global'); const chatBg = localStorage.getItem('bg_chat');
        const diaryCover = localStorage.getItem('bg_diary_cover'); const diaryPage = localStorage.getItem('bg_diary_page'); 
        
        if (globalBg) { document.documentElement.style.setProperty('--bg-image-global', `url('${globalBg}')`); } else { document.documentElement.style.removeProperty('--bg-image-global'); }
        if (chatBg) { document.documentElement.style.setProperty('--bg-image-chat', `url('${chatBg}')`); } else { document.documentElement.style.removeProperty('--bg-image-chat'); }
        if (diaryCover) { document.documentElement.style.setProperty('--bg-image-diary-cover', `url('${diaryCover}')`); } else { document.documentElement.style.removeProperty('--bg-image-diary-cover'); }
        if (diaryPage) { document.documentElement.style.setProperty('--bg-image-diary-page', `url('${diaryPage}')`); } else { document.documentElement.style.removeProperty('--bg-image-diary-page'); }

        const icons = [
            { id: 'novel', default: '<i class="ph-fill ph-book-open" style="color: var(--text-sub);"></i>' },
            { id: 'worldbook', default: '<i class="ph-fill ph-globe-hemisphere-west" style="color: var(--primary-color);"></i>' },
            { id: 'settings', default: '<i class="ph-fill ph-gear" style="color: var(--primary-color);"></i>' },
            { id: 'gallery', default: '<i class="ph-fill ph-images" style="color: #e5989b;"></i>' },
            { id: 'shop', default: '<i class="ph-fill ph-storefront" style="color: #f4a261;"></i>' },
            { id: 'task', default: '<i class="ph-fill ph-check-square-offset" style="color: #2a9d8f;"></i>' }
        ];

        icons.forEach(item => {
            const el = document.getElementById(`home-icon-${item.id}`);
            if (el) {
                const customUrl = localStorage.getItem(`ui_icon_${item.id}`);
                if (customUrl) {
                    el.innerHTML = `<img src="${customUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:18px;">`;
                    el.style.background = 'transparent'; el.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                } else {
                    el.innerHTML = item.default; el.style.background = 'var(--icon-bg)'; el.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                }
            }
        });
    },

    getUIPresets() { return JSON.parse(localStorage.getItem('ui_presets') || '[]'); },
    saveUIPreset() {
        const name = prompt('给这套主题装修起个名字吧 (如: 赛博朋克风):'); if (!name) return;
        const getVal = (id) => document.getElementById(id)?.value.trim() || '';
        const preset = { id: 'ui_' + Date.now(), name: name, bg_global: getVal('bg-global'), bg_chat: getVal('bg-chat'), bg_diary_cover: getVal('bg-diary-cover'), bg_diary_page: getVal('bg-diary-page'), icon_novel: getVal('ui-icon-novel'), icon_worldbook: getVal('ui-icon-worldbook'), icon_settings: getVal('ui-icon-settings'), icon_gallery: getVal('ui-icon-gallery'), icon_shop: getVal('ui-icon-shop'), icon_task: getVal('ui-icon-task') };
        let presets = this.getUIPresets(); presets = presets.filter(p => p.name !== name); presets.push(preset);
        localStorage.setItem('ui_presets', JSON.stringify(presets)); this.refreshUIDropdowns(); document.getElementById('ui-preset-select').value = preset.id; this.showToast('💾 UI 主题预设保存成功！');
    },
    loadUIPreset() {
        const id = document.getElementById('ui-preset-select').value; if (!id) return;
        const preset = this.getUIPresets().find(p => p.id === id);
        if (preset) {
            const setVal = (domId, val) => { const el = document.getElementById(domId); if(el) el.value = val || ''; };
            setVal('bg-global', preset.bg_global); setVal('bg-chat', preset.bg_chat); setVal('bg-diary-cover', preset.bg_diary_cover); setVal('bg-diary-page', preset.bg_diary_page);
            setVal('ui-icon-novel', preset.icon_novel); setVal('ui-icon-worldbook', preset.icon_worldbook); setVal('ui-icon-settings', preset.icon_settings); setVal('ui-icon-gallery', preset.icon_gallery); setVal('ui-icon-shop', preset.icon_shop); setVal('ui-icon-task', preset.icon_task);
            this.autoSave(); this.showToast('✨ 主题切换成功！');
        }
    },
    deleteUIPreset() {
        const id = document.getElementById('ui-preset-select').value; if (!id) return alert('请先选择主题！'); if (!confirm('确定删除吗？')) return;
        let presets = this.getUIPresets(); presets = presets.filter(p => p.id !== id); localStorage.setItem('ui_presets', JSON.stringify(presets)); this.refreshUIDropdowns(); this.showToast('🗑️ 主题已删除');
    },
    refreshUIDropdowns() {
        const selectEl = document.getElementById('ui-preset-select'); if (!selectEl) return;
        let optionsHtml = '<option value="">-- 切换 UI 主题预设 --</option>';
        this.getUIPresets().forEach(p => { optionsHtml += `<option value="${p.id}">${p.name}</option>`; });
        selectEl.innerHTML = optionsHtml;
    },

    getPromptPresets() { return JSON.parse(localStorage.getItem('prompt_presets') || '[]'); },
    savePromptPreset() {
        const name = prompt('起个名字吧 (如: 不死途-日常):'); if (!name) return;
        const getVal = (id) => document.getElementById(id)?.value.trim() || '';
        const preset = { id: 'pr_' + Date.now(), name: name, system: getVal('system-prompt'), persona: getVal('char-persona'), novel: getVal('novel-style') };
        let presets = this.getPromptPresets(); presets = presets.filter(p => p.name !== name); presets.push(preset);
        localStorage.setItem('prompt_presets', JSON.stringify(presets)); this.refreshPromptDropdowns(); document.getElementById('prompt-preset-select').value = preset.id; this.showToast('💾 预设保存成功！');
    },
    loadPromptPreset() {
        const id = document.getElementById('prompt-preset-select').value; if (!id) return;
        const preset = this.getPromptPresets().find(p => p.id === id);
        if (preset) {
            const setVal = (domId, val) => { const el = document.getElementById(domId); if(el) el.value = val; };
            setVal('system-prompt', preset.system); setVal('char-persona', preset.persona); setVal('novel-style', preset.novel);
            this.autoSave(); this.showToast('✨ 切换成功！');
        }
    },
    deletePromptPreset() {
        const id = document.getElementById('prompt-preset-select').value; if (!id) return alert('请先选择预设！'); if (!confirm('确定删除吗？')) return;
        let presets = this.getPromptPresets(); presets = presets.filter(p => p.id !== id); localStorage.setItem('prompt_presets', JSON.stringify(presets)); this.refreshPromptDropdowns(); this.showToast('🗑️ 预设已删除');
    },
    refreshPromptDropdowns() {
        const selectEl = document.getElementById('prompt-preset-select'); if (!selectEl) return;
        let optionsHtml = '<option value="">-- 切换人设预设 --</option>';
        this.getPromptPresets().forEach(p => { optionsHtml += `<option value="${p.id}">${p.name}</option>`; });
        selectEl.innerHTML = optionsHtml;
    },

    getPresets() { return JSON.parse(localStorage.getItem('ai_api_presets') || '[]'); },
    savePreset() {
        const nameEl = document.getElementById('preset-name'); const urlEl = document.getElementById('preset-url'); const keyEl = document.getElementById('preset-key'); const modelEl = document.getElementById('preset-model');
        const name = nameEl.value.trim(); if (!name) return alert("请给预设起个名字！");
        const preset = { id: 'p_' + Date.now(), name: name, url: urlEl.value.trim(), key: keyEl.value.trim(), model: modelEl.value.trim() };
        let presets = this.getPresets(); presets.push(preset); localStorage.setItem('ai_api_presets', JSON.stringify(presets));
        nameEl.value = ''; urlEl.value = ''; keyEl.value = ''; modelEl.value = ''; this.refreshPresetDropdowns(); this.showToast('💾 预设已存入库中！');
    },
    deletePreset() {
        const id = document.getElementById('preset-delete-select').value; if (!id) return alert('请先选择预设！'); if (!confirm('确定删除吗？')) return;
        let presets = this.getPresets(); presets = presets.filter(p => p.id !== id); localStorage.setItem('ai_api_presets', JSON.stringify(presets));
        if (localStorage.getItem('main_engine_id') === id) localStorage.removeItem('main_engine_id'); if (localStorage.getItem('sub_engine_id') === id) localStorage.removeItem('sub_engine_id');
        this.refreshPresetDropdowns(); this.showToast('🗑️ 预设已删除');
    },
    refreshPresetDropdowns() {
        const presets = this.getPresets();
        const delSelect = document.getElementById('preset-delete-select'); const mainSelect = document.getElementById('main-engine-select'); const subSelect = document.getElementById('sub-engine-select');
        if (!delSelect || !mainSelect || !subSelect) return;
        let optionsHtml = '<option value="">-- 请选择 --</option>';
        presets.forEach(p => { optionsHtml += `<option value="${p.id}">${p.name} (${p.model})</option>`; });
        delSelect.innerHTML = optionsHtml; mainSelect.innerHTML = optionsHtml; subSelect.innerHTML = '<option value="">-- 同主引擎 (自动降级) --</option>' + optionsHtml;
        mainSelect.value = localStorage.getItem('main_engine_id') || ''; subSelect.value = localStorage.getItem('sub_engine_id') || '';
        
        const quickSelect = document.getElementById('quick-main-engine');
        if (quickSelect) {
            quickSelect.innerHTML = optionsHtml;
            quickSelect.value = localStorage.getItem('main_engine_id') || '';
        }
    },
    assignEngine(type, presetId) {
        if (type === 'main') { 
            localStorage.setItem('main_engine_id', presetId); 
            this.showToast('✅ 主引擎切换成功！'); 
            this.refreshPresetDropdowns();
        } 
        else if (type === 'sub') { localStorage.setItem('sub_engine_id', presetId); this.showToast('✅ 副引擎分配成功！'); }
    },
    getEngineConfig(isSub) {
        let presetId = isSub ? localStorage.getItem('sub_engine_id') : localStorage.getItem('main_engine_id');
        if (isSub && !presetId) presetId = localStorage.getItem('main_engine_id');
        if (!presetId) return null; return this.getPresets().find(p => p.id === presetId);
    },

    clearChat() {
        if(confirm("危险操作：确定要清空【线上微信】和【线下小说】的所有记录吗？清空后无法恢复！")) {
            const roleId = window.Config.currentContactId;
            if(window.Config.phoneData[roleId]) {
                window.Config.phoneData[roleId].wechat = { items: [] }; window.Config.phoneData[roleId].novel = { items: [] };
            }
            localStorage.setItem('phone_data', JSON.stringify(window.Config.phoneData));
            window.PhoneUI.renderAppContent('wechat'); this.showToast("🗑️ 所有记录已清空！");
        }
    },

    getWorldbookData() {
        let wb = localStorage.getItem('worldbook_entries');
        if (!wb) {
            const defaultWb = [
                { id: 'wb1', title: '防八股/去AI味', content: '绝对禁止使用华丽空洞的辞藻堆砌。禁止使用"眼底闪过一丝"、"嘴角勾起一抹"、"空气中弥漫着"等AI惯用套路句式。描写必须具体、写实、接地气。', online: true, offline: true, isCustom: false },
                { id: 'wb2', title: '防抢话机制', content: '绝对禁止替用户做出决定、动作或说话，只描写你自己的反应。', online: true, offline: true, isCustom: false },
                { id: 'wb3', title: '合理制造冲突', content: '不要总是顺从用户，根据人设适度制造戏剧冲突、拒绝或傲娇反驳。', online: true, offline: true, isCustom: false },
                { id: 'wb4', title: '动作微表情', content: '说话时必须配合细腻的微表情（如挑眉、垂眸、手指的小动作）。', online: false, offline: true, isCustom: false }
            ];
            localStorage.setItem('worldbook_entries', JSON.stringify(defaultWb)); return defaultWb;
        }
        return JSON.parse(wb);
    },
    toggleWorldbook(id, type, isChecked) {
        let wb = this.getWorldbookData(); let item = wb.find(w => w.id === id);
        if (item) { item[type] = isChecked; localStorage.setItem('worldbook_entries', JSON.stringify(wb)); }
    },
    addWorldbook() {
        const title = document.getElementById('wb-new-title').value.trim(); const content = document.getElementById('wb-new-content').value.trim();
        if(!title || !content) { alert('标题和内容不能为空哦！'); return; }
        let wb = this.getWorldbookData(); wb.push({ id: 'wb_' + Date.now(), title: title, content: content, online: true, offline: true, isCustom: true });
        localStorage.setItem('worldbook_entries', JSON.stringify(wb));
        document.getElementById('wb-new-title').value = ''; document.getElementById('wb-new-content').value = '';
        window.PhoneUI.closeWbModal(); window.PhoneUI.openApp('worldbook', '世界书'); this.showToast("✅ 规则添加成功！");
    },
    deleteWorldbook(id) {
        if(!confirm('确定要删除这条自定义规则吗？')) return;
        let wb = this.getWorldbookData(); wb = wb.filter(w => w.id !== id); localStorage.setItem('worldbook_entries', JSON.stringify(wb));
        window.PhoneUI.openApp('worldbook', '世界书'); this.showToast("🗑️ 规则已删除");
    },
    saveNovelWords() { localStorage.setItem('novel_min_words', document.getElementById('novel-min-words')?.value || '150'); },
    getArchives() { return JSON.parse(localStorage.getItem('story_archives') || '[]'); },
    
    // 🌟 核心修复：存档时绑定线下记忆！
    saveArchive() {
        const nameInput = document.getElementById('archive-name'); const name = nameInput.value.trim(); if (!name) return alert('请先输入存档名称！');
        const roleId = window.Config.currentContactId; const items = window.Config.phoneData[roleId]?.novel?.items || [];
        if (items.length === 0) return alert('当前没有线下剧情可以存档哦！');
        
        const vault = this.getMemoryVault();
        const offlineVault = vault.filter(v => v.source === '线下故事' && !v.isCore);
        
        const archives = this.getArchives(); 
        archives.push({ 
            id: 'arc_' + Date.now(), 
            name: name, 
            date: new Date().toLocaleString(), 
            count: items.length, 
            data: JSON.parse(JSON.stringify(items)),
            vault: offlineVault // 存入专属记忆
        });
        localStorage.setItem('story_archives', JSON.stringify(archives)); nameInput.value = ''; window.PhoneUI.renderArchiveList(); this.showToast('💾 线下剧情存档成功！');
    },

    // 🌟 核心修复：读档时恢复线下记忆！
    loadArchive(id) {
        if (!confirm('读取存档将覆盖当前的线下剧情，确定要读取吗？')) return;
        const archives = this.getArchives(); const arc = archives.find(a => a.id === id);
        if (arc) {
            const roleId = window.Config.currentContactId;
            if (!window.Config.phoneData[roleId]) window.Config.phoneData[roleId] = {};
            if (!window.Config.phoneData[roleId].novel) window.Config.phoneData[roleId].novel = {};
            window.Config.phoneData[roleId].novel.items = JSON.parse(JSON.stringify(arc.data));
            localStorage.setItem('phone_data', JSON.stringify(window.Config.phoneData));
            
            if (arc.vault) {
                let vault = this.getMemoryVault();
                vault = vault.filter(v => !(v.source === '线下故事' && !v.isCore)); // 删掉当前的线下非核心记忆
                vault = vault.concat(arc.vault); // 注入存档里的记忆
                localStorage.setItem('memory_vault_entries', JSON.stringify(vault));
            }
            
            window.PhoneUI.closeArchiveModal(); if (window.Config.currentAppId === 'novel') window.PhoneUI.renderNovelContent(); this.showToast('✨ 线下剧情读取成功！');
        }
    },

    deleteArchive(id) {
        if (!confirm('确定要删除这个存档吗？删除后无法恢复！')) return;
        let archives = this.getArchives(); archives = archives.filter(a => a.id !== id); localStorage.setItem('story_archives', JSON.stringify(archives)); window.PhoneUI.renderArchiveList(); this.showToast('🗑️ 存档已删除');
    },

    // 🌟 核心修复：开新档时清空线下旧记忆！
    startNewTimeline() {
        if (!confirm('开启新剧情将清空当前的【线下故事】记录！确定要清空吗？')) return;
        const roleId = window.Config.currentContactId;
        if (window.Config.phoneData[roleId]?.novel) { window.Config.phoneData[roleId].novel.items = []; localStorage.setItem('phone_data', JSON.stringify(window.Config.phoneData)); }
        
        let vault = this.getMemoryVault();
        vault = vault.filter(v => !(v.source === '线下故事' && !v.isCore));
        localStorage.setItem('memory_vault_entries', JSON.stringify(vault));
        
        window.PhoneUI.closeArchiveModal(); if (window.Config.currentAppId === 'novel') window.PhoneUI.renderNovelContent(); this.showToast('🚀 已开启全新线下时间线！');
    },

    async exportData() {
        const data = {}; for (let i = 0; i < localStorage.length; i++) { const key = localStorage.key(i); data[key] = localStorage.getItem(key); }
        const jsonStr = JSON.stringify(data, null, 2); const dateStr = new Date().toISOString().replace(/[:\-\sT]/g, '').slice(0, 14); const fileName = `ClaireClaude_Backup_${dateStr}.json`;
        try {
            const file = new File([jsonStr], fileName, { type: 'application/json' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Claire & Claude 备份', }); this.showToast("📦 备份已成功发送/保存！"); return; }
        } catch (err) { console.log("分享被取消或不支持，尝试普通下载:", err); }
        try {
            const blob = new Blob([jsonStr], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.style.display = 'none'; a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200); this.showToast("📦 尝试触发浏览器下载...");
        } catch (e) { alert("下载失败：您的浏览器拦截了文件保存，请更换浏览器重试。"); }
    },
    importData(event) {
        const file = event.target.files[0]; if (!file) return; const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!confirm("⚠️ 警告：导入存档将覆盖当前手机里的【所有】聊天记录、设定和预设！确定要继续吗？")) { event.target.value = ''; return; }
                for (const key in data) { localStorage.setItem(key, data[key]); }
                this.showToast("✨ 存档导入成功！正在重启系统..."); setTimeout(() => { window.location.reload(); }, 1500);
            } catch (err) { alert("导入失败：文件格式不正确！"); console.error(err); }
            event.target.value = ''; 
        };
        reader.readAsText(file);
    },

    getDiaries() { return JSON.parse(localStorage.getItem('char_diaries') || '{}'); },
    saveDiary(dateStr, content) {
        const diaries = this.getDiaries(); diaries[dateStr] = content; localStorage.setItem('char_diaries', JSON.stringify(diaries));
    },
    getCombinedMemory() {
        const roleId = window.Config.currentContactId;
        const wechatItems = (window.Config.phoneData[roleId]?.wechat?.items || []).map(i => ({ ...i, source: 'wechat' }));
        const novelItems = (window.Config.phoneData[roleId]?.novel?.items || []).map(i => ({ ...i, source: 'novel' }));
        let combinedItems = [...wechatItems, ...novelItems];
        combinedItems.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
        return combinedItems;
    },

    getFavorites() { return JSON.parse(localStorage.getItem('starry_favorites') || '[]'); },
    saveFavorite(text, source, sender) {
        const favs = this.getFavorites();
        favs.push({ id: 'fav_' + Date.now(), content: text, source: source, sender: sender, time: new Date().toISOString().split('T')[0] });
        localStorage.setItem('starry_favorites', JSON.stringify(favs));
        this.showToast('⭐ 已存入星海收藏夹！');
    },
    deleteFavorite(id) {
        if (!confirm('确定要从星海中删除这句回忆吗？')) return;
        let favs = this.getFavorites(); favs = favs.filter(f => f.id !== id); localStorage.setItem('starry_favorites', JSON.stringify(favs));
        window.PhoneUI.renderAppContent('favorites'); this.showToast('🗑️ 已删除');
    },

    getMemoryVault() { return JSON.parse(localStorage.getItem('memory_vault_entries') || '[]'); },
    
    saveToMemoryVault(summaries, source, isCore = false) {
        const vault = this.getMemoryVault();
        const now = new Date();
        const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
        const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

        let summaryArray = Array.isArray(summaries) ? summaries : [summaries];

        summaryArray.forEach((summary, index) => {
            vault.push({
                id: 'mem_' + Date.now() + '_' + index,
                content: summary,
                source: source,
                date: dateStr,
                time: timeStr,
                isCore: isCore
            });
        });

        localStorage.setItem('memory_vault_entries', JSON.stringify(vault));
        this.showToast(`🧠 成功存入 ${summaryArray.length} 条记忆档案！`);
    },
    
    deleteFromMemoryVault(id) {
        if(!confirm('确定要删除这段记忆档案吗？')) return;
        let vault = this.getMemoryVault();
        vault = vault.filter(m => m.id !== id);
        localStorage.setItem('memory_vault_entries', JSON.stringify(vault));
        window.PhoneUI.renderMemoryVault();
        this.showToast('🗑️ 记忆已消除');
    },
    async editMemoryVault(id) {
        let vault = this.getMemoryVault();
        let item = vault.find(m => m.id === id);
        if (item) {
            const newText = await window.PhoneUI.showCustomPrompt("✏️ 修改记忆档案：", item.content);
            if (newText !== null && newText.trim() !== "") {
                item.content = newText.trim();
                localStorage.setItem('memory_vault_entries', JSON.stringify(vault));
                window.PhoneUI.renderMemoryVault();
                this.showToast('✅ 记忆已修改');
            }
        }
    },
    toggleCoreMemory(id) {
        let vault = this.getMemoryVault();
        let item = vault.find(m => m.id === id);
        if (item) {
            item.isCore = !item.isCore;
            localStorage.setItem('memory_vault_entries', JSON.stringify(vault));
            window.PhoneUI.renderMemoryVault();
            if (item.isCore) { this.showToast('📌 已设为核心记忆，他永远不会忘记！'); } else { this.showToast('取消核心记忆'); }
        }
    },

    async forceUpdate() {
        if (confirm("确定要强制刷新并获取最新代码吗？（这不会清除你的聊天记录和设置）")) {
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (let reg of registrations) { await reg.unregister(); }
            }
            if ('caches' in window) {
                const keys = await caches.keys();
                for (let key of keys) { await caches.delete(key); }
            }
            window.location.href = window.location.pathname + '?t=' + new Date().getTime();
        }
    },

    async chatWithAI(messages, useSubEngine = false) {
        const config = this.getEngineConfig(useSubEngine);
        if (!config) throw new Error("请先去【系统设置】里分配引擎配置！");
        
        const fab = document.getElementById('api-fab');
        const statusText = document.getElementById('api-status-text');
        if (fab) { fab.classList.add('loading'); fab.classList.remove('error'); }
        if (statusText) { statusText.innerText = '正在思考中...'; statusText.style.color = 'var(--primary-color)'; }

        const endpoint = config.url.endsWith('/chat/completions') ? config.url : config.url.replace(/\/$/, '') + '/chat/completions';
        try {
            const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.key}` }, body: JSON.stringify({ model: config.model, messages: messages, temperature: 0.7 }) });
            if (!response.ok) { 
                const errData = await response.json().catch(() => ({})); 
                throw new Error(`API 报错: ${response.status} ${errData.error?.message || ''}`); 
            }
            const data = await response.json(); 
            
            if (data.usage) {
                const tokenText = document.getElementById('api-token-text');
                if (tokenText) tokenText.innerText = `提示词: ${data.usage.prompt_tokens} | 回复: ${data.usage.completion_tokens} | 总计: ${data.usage.total_tokens}`;
            }

            if (fab) fab.classList.remove('loading');
            if (statusText) { statusText.innerText = '请求成功'; statusText.style.color = '#4ade80'; }

            return data.choices[0].message.content;
        } catch (error) { 
            console.error(error); 
            if (fab) { fab.classList.remove('loading'); fab.classList.add('error'); }
            if (statusText) { statusText.innerText = '请求失败'; statusText.style.color = 'var(--danger-color)'; }
            throw new Error(error.message || "网络错误或 API 配置不正确，请检查。"); 
        }
    }
};
