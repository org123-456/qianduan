export const PhoneAPI = {
    // 🌟 你的 Cloudflare 后端专属地址
    CLOUD_BACKEND_URL: 'https://houduan.1613764019.workers.dev',

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
        saveIfExist('ui-icon-settings', 'ui_icon_settings'); saveIfExist('ui-icon-shop', 'ui_icon_shop'); saveIfExist('ui-icon-task', 'ui_icon_task');

        this.applyUITheme();

        saveIfExist('system-prompt', 'system_prompt'); saveIfExist('char-persona', 'char_persona'); saveIfExist('novel-style', 'novel_style');
        saveIfExist('ban-emoji', 'ban_emoji', true); saveIfExist('share-memory', 'share_memory', true);

        saveIfExist('img-api-url', 'img_api_url');
        saveIfExist('img-api-key', 'img_api_key');
        saveIfExist('img-api-model', 'img_api_model');
        saveIfExist('img-base-prompt', 'img_base_prompt');
        saveIfExist('img-negative-prompt', 'img_negative_prompt');
        saveIfExist('auto-photo', 'auto_photo', true);

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
            const today = new Date(); const defaultDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
            setVal('diary-start-date', localStorage.getItem('diary_start_date') || defaultDate);
            setVal('ui-icon-novel', localStorage.getItem('ui_icon_novel') || ''); setVal('ui-icon-worldbook', localStorage.getItem('ui_icon_worldbook') || '');
            setVal('ui-icon-settings', localStorage.getItem('ui_icon_settings') || ''); setVal('ui-icon-shop', localStorage.getItem('ui_icon_shop') || ''); setVal('ui-icon-task', localStorage.getItem('ui_icon_task') || '');

            this.applyUITheme();

            setVal('system-prompt', localStorage.getItem('system_prompt') || ''); setVal('char-persona', localStorage.getItem('char_persona') || ''); setVal('novel-style', localStorage.getItem('novel_style') || '');
            const banEmojiEl = document.getElementById('ban-emoji'); if(banEmojiEl) banEmojiEl.checked = localStorage.getItem('ban_emoji') === 'true';
            const shareMemoryEl = document.getElementById('share-memory'); if(shareMemoryEl) shareMemoryEl.checked = localStorage.getItem('share_memory') === 'true';

            setVal('img-api-url', localStorage.getItem('img_api_url') || 'https://api.openai.com/v1/images/generations');
            setVal('img-api-key', localStorage.getItem('img_api_key') || '');
            setVal('img-api-model', localStorage.getItem('img_api_model') || 'dall-e-3');

            setVal('img-base-prompt', localStorage.getItem('img_base_prompt') || '');
            setVal('img-negative-prompt', localStorage.getItem('img_negative_prompt') || '');
            const autoPhotoEl = document.getElementById('auto-photo'); if(autoPhotoEl) autoPhotoEl.checked = localStorage.getItem('auto_photo') === 'true';

            const refBase64 = localStorage.getItem('img_ref_base64');
            const previewEl = document.getElementById('face-lock-preview');
            if (previewEl) {
                if (refBase64) {
                    previewEl.innerHTML = `<img src="${refBase64}" style="width:100%;height:100%;object-fit:cover;">`;
                } else {
                    previewEl.innerHTML = `<i class="ph ph-plus" style="font-size: 24px; color: var(--text-sub);"></i>`;
                }
            }

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

        const icons = [ { id: 'novel', default: '<i class="ph-fill ph-book-open" style="color: var(--text-sub);"></i>' }, { id: 'worldbook', default: '<i class="ph-fill ph-globe-hemisphere-west" style="color: var(--primary-color);"></i>' }, { id: 'settings', default: '<i class="ph-fill ph-gear" style="color: var(--primary-color);"></i>' }, { id: 'shop', default: '<i class="ph-fill ph-storefront" style="color: #f4a261;"></i>' }, { id: 'task', default: '<i class="ph-fill ph-check-square-offset" style="color: #2a9d8f;"></i>' } ];
        icons.forEach(item => { const el = document.getElementById(`home-icon-${item.id}`); if (el) { const customUrl = localStorage.getItem(`ui_icon_${item.id}`); if (customUrl) { el.innerHTML = `<img src="${customUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:18px;">`; el.style.background = 'transparent'; el.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'; } else { el.innerHTML = item.default; el.style.background = 'var(--icon-bg)'; el.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)'; } } });
    },

    getUIPresets() { return JSON.parse(localStorage.getItem('ui_presets') || '[]'); },
    saveUIPreset() {
        const name = prompt('给这套主题装修起个名字吧 (如: 赛博朋克风):'); if (!name) return;
        const getVal = (id) => document.getElementById(id)?.value.trim() || '';
        const preset = { id: 'ui_' + Date.now(), name: name, bg_global: getVal('bg-global'), bg_chat: getVal('bg-chat'), bg_diary_cover: getVal('bg-diary-cover'), bg_diary_page: getVal('bg-diary-page'), icon_novel: getVal('ui-icon-novel'), icon_worldbook: getVal('ui-icon-worldbook'), icon_settings: getVal('ui-icon-settings'), icon_shop: getVal('ui-icon-shop'), icon_task: getVal('ui-icon-task') };
        let presets = this.getUIPresets(); presets = presets.filter(p => p.name !== name); presets.push(preset);
        localStorage.setItem('ui_presets', JSON.stringify(presets)); this.refreshUIDropdowns(); document.getElementById('ui-preset-select').value = preset.id; this.showToast('💾 UI 主题预设保存成功！');
    },
    loadUIPreset() {
        const id = document.getElementById('ui-preset-select').value; if (!id) return;
        const preset = this.getUIPresets().find(p => p.id === id);
        if (preset) {
            const setVal = (domId, val) => { const el = document.getElementById(domId); if(el) el.value = val || ''; };
            setVal('bg-global', preset.bg_global); setVal('bg-chat', preset.bg_chat); setVal('bg-diary-cover', preset.bg_diary_cover); setVal('bg-diary-page', preset.bg_diary_page);
            setVal('ui-icon-novel', preset.icon_novel); setVal('ui-icon-worldbook', preset.icon_worldbook); setVal('ui-icon-settings', preset.icon_settings); setVal('ui-icon-shop', preset.icon_shop); setVal('ui-icon-task', preset.icon_task);
            this.autoSave(); this.showToast('✨ 主题切换成功！');
        }
    },
    deleteUIPreset() { const id = document.getElementById('ui-preset-select').value; if (!id) return alert('请先选择主题！'); if (!confirm('确定删除吗？')) return; let presets = this.getUIPresets(); presets = presets.filter(p => p.id !== id); localStorage.setItem('ui_presets', JSON.stringify(presets)); this.refreshUIDropdowns(); this.showToast('🗑️ 主题已删除'); },
    refreshUIDropdowns() { const selectEl = document.getElementById('ui-preset-select'); if (!selectEl) return; let optionsHtml = '<option value="">-- 切换 UI 主题预设 --</option>'; this.getUIPresets().forEach(p => { optionsHtml += `<option value="${p.id}">${p.name}</option>`; }); selectEl.innerHTML = optionsHtml; },

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
    deletePromptPreset() { const id = document.getElementById('prompt-preset-select').value; if (!id) return alert('请先选择预设！'); if (!confirm('确定删除吗？')) return; let presets = this.getPromptPresets(); presets = presets.filter(p => p.id !== id); localStorage.setItem('prompt_presets', JSON.stringify(presets)); this.refreshPromptDropdowns(); this.showToast('🗑️ 预设已删除'); },
    refreshPromptDropdowns() { const selectEl = document.getElementById('prompt-preset-select'); if (!selectEl) return; let optionsHtml = '<option value="">-- 切换人设预设 --</option>'; this.getPromptPresets().forEach(p => { optionsHtml += `<option value="${p.id}">${p.name}</option>`; }); selectEl.innerHTML = optionsHtml; },

    getImgPresets() { return JSON.parse(localStorage.getItem('img_prompt_presets') || '[]'); },
    saveImgPreset() {
        const name = prompt('给这套画风起个名字吧 (如: NAI-二次元):'); if (!name) return;
        const getVal = (id) => document.getElementById(id)?.value.trim() || '';
        const preset = { id: 'ipr_' + Date.now(), name: name, base: getVal('img-base-prompt'), neg: getVal('img-negative-prompt') };
        let presets = this.getImgPresets(); presets = presets.filter(p => p.name !== name); presets.push(preset);
        localStorage.setItem('img_prompt_presets', JSON.stringify(presets)); this.refreshImgDropdowns(); document.getElementById('img-preset-select').value = preset.id; this.showToast('💾 画风预设保存成功！');
    },
    loadImgPreset() {
        const id = document.getElementById('img-preset-select').value; if (!id) return;
        const preset = this.getImgPresets().find(p => p.id === id);
        if (preset) {
            const setVal = (domId, val) => { const el = document.getElementById(domId); if(el) el.value = val; };
            setVal('img-base-prompt', preset.base); setVal('img-negative-prompt', preset.neg);
            this.autoSave(); this.showToast('✨ 画风切换成功！');
        }
    },
    deleteImgPreset() { const id = document.getElementById('img-preset-select').value; if (!id) return alert('请先选择预设！'); if (!confirm('确定删除吗？')) return; let presets = this.getImgPresets(); presets = presets.filter(p => p.id !== id); localStorage.setItem('img_prompt_presets', JSON.stringify(presets)); this.refreshImgDropdowns(); this.showToast('🗑️ 预设已删除'); },
    refreshImgDropdowns() { const selectEl = document.getElementById('img-preset-select'); if (!selectEl) return; let optionsHtml = '<option value="">-- 切换画风预设 --</option>'; this.getImgPresets().forEach(p => { optionsHtml += `<option value="${p.id}">${p.name}</option>`; }); selectEl.innerHTML = optionsHtml; },

    getPresets() { return JSON.parse(localStorage.getItem('ai_api_presets') || '[]'); },
    savePreset() {
        const nameEl = document.getElementById('preset-name');
        const urlEl = document.getElementById('preset-url');
        const keyEl = document.getElementById('preset-key');
        const modelEl = document.getElementById('preset-model');

        const name = nameEl.value.trim();
        if (!name) return alert("请给预设起个名字！");

        const url = urlEl.value.trim();
        const key = keyEl.value.trim();
        const model = modelEl.value.trim();

        if (!url || !key || !model) {
            return alert("请填写完整接口地址、API Key 和模型名称！");
        }

        let presets = this.getPresets();
        const existingIndex = presets.findIndex(p => p.name === name);

        if (existingIndex >= 0) {
            presets[existingIndex].url = url;
            presets[existingIndex].key = key;
            presets[existingIndex].model = model;
            this.showToast('✅ 预设 [' + name + '] 已更新覆盖！');
        } else {
            const preset = { id: 'p_' + Date.now(), name: name, url: url, key: key, model: model };
            presets.push(preset);
            this.showToast('💾 新预设 [' + name + '] 已存入库中！');
        }

        localStorage.setItem('ai_api_presets', JSON.stringify(presets));
        this.refreshPresetDropdowns();
    },

    deletePreset() { const id = document.getElementById('preset-delete-select').value; if (!id) return alert('请先选择预设！'); if (!confirm('确定删除吗？')) return; let presets = this.getPresets(); presets = presets.filter(p => p.id !== id); localStorage.setItem('ai_api_presets', JSON.stringify(presets)); if (localStorage.getItem('main_engine_id') === id) localStorage.removeItem('main_engine_id'); if (localStorage.getItem('sub_engine_id') === id) localStorage.removeItem('sub_engine_id'); this.refreshPresetDropdowns(); this.showToast('🗑️ 预设已删除'); },

    refreshPresetDropdowns() {
        const presets = this.getPresets(); const delSelect = document.getElementById('preset-delete-select'); const mainSelect = document.getElementById('main-engine-select'); const subSelect = document.getElementById('sub-engine-select');
        if (!delSelect || !mainSelect || !subSelect) return;
        let optionsHtml = '<option value="">-- 请选择 --</option>'; presets.forEach(p => { optionsHtml += `<option value="${p.id}">${p.name} (${p.model})</option>`; });
        delSelect.innerHTML = optionsHtml; mainSelect.innerHTML = optionsHtml; subSelect.innerHTML = '<option value="">-- 同主引擎 (自动降级) --</option>' + optionsHtml;
        mainSelect.value = localStorage.getItem('main_engine_id') || ''; subSelect.value = localStorage.getItem('sub_engine_id') || '';
        const quickSelect = document.getElementById('quick-main-engine'); if (quickSelect) { quickSelect.innerHTML = optionsHtml; quickSelect.value = localStorage.getItem('main_engine_id') || ''; }
    },

    assignEngine(type, presetId) { if (type === 'main') { localStorage.setItem('main_engine_id', presetId); this.showToast('✅ 主引擎切换成功！'); this.refreshPresetDropdowns(); } else if (type === 'sub') { localStorage.setItem('sub_engine_id', presetId); this.showToast('✅ 副引擎分配成功！'); } },
    getEngineConfig(isSub) { let presetId = isSub ? localStorage.getItem('sub_engine_id') : localStorage.getItem('main_engine_id'); if (isSub && !presetId) presetId = localStorage.getItem('main_engine_id'); if (!presetId) return null; return this.getPresets().find(p => p.id === presetId); },

    clearChat() { if(confirm("危险操作：确定要清空所有记录吗？清空后无法恢复！")) { const roleId = window.Config.currentContactId; if(window.Config.phoneData[roleId]) { window.Config.phoneData[roleId].wechat = { items: [] }; window.Config.phoneData[roleId].novel = { items: [] }; } localStorage.setItem('phone_data', JSON.stringify(window.Config.phoneData)); window.PhoneUI.renderAppContent('wechat'); this.showToast("🗑️ 所有记录已清空！"); } },

    getWorldbookData() { let wb = localStorage.getItem('worldbook_entries'); if (!wb) { const defaultWb = [ { id: 'wb1', title: '防八股/去AI味', content: '绝对禁止使用华丽空洞的辞藻堆砌。禁止使用"眼底闪过一丝"、"嘴角勾起一抹"、"空气中弥漫着"等AI惯用套路句式。描写必须具体、写实、接地气。', online: true, offline: true, isCustom: false }, { id: 'wb2', title: '防抢话机制', content: '绝对禁止替用户做出决定、动作或说话，只描写你自己的反应。', online: true, offline: true, isCustom: false } ]; localStorage.setItem('worldbook_entries', JSON.stringify(defaultWb)); return defaultWb; } return JSON.parse(wb); },
    toggleWorldbook(id, type, isChecked) { let wb = this.getWorldbookData(); let item = wb.find(w => w.id === id); if (item) { item[type] = isChecked; localStorage.setItem('worldbook_entries', JSON.stringify(wb)); } },
    addWorldbook() { const title = document.getElementById('wb-new-title').value.trim(); const content = document.getElementById('wb-new-content').value.trim(); if(!title || !content) return alert('标题和内容不能为空哦！'); let wb = this.getWorldbookData(); wb.push({ id: 'wb_' + Date.now(), title: title, content: content, online: true, offline: true, isCustom: true }); localStorage.setItem('worldbook_entries', JSON.stringify(wb)); document.getElementById('wb-new-title').value = ''; document.getElementById('wb-new-content').value = ''; window.PhoneUI.closeWbModal(); window.PhoneUI.openApp('worldbook', '世界书'); this.showToast("✅ 规则添加成功！"); },
    deleteWorldbook(id) { if(!confirm('确定要删除这条自定义规则吗？')) return; let wb = this.getWorldbookData(); wb = wb.filter(w => w.id !== id); localStorage.setItem('worldbook_entries', JSON.stringify(wb)); window.PhoneUI.openApp('worldbook', '世界书'); this.showToast("🗑️ 规则已删除"); },
    saveNovelWords() { localStorage.setItem('novel_min_words', document.getElementById('novel-min-words')?.value || '150'); },
    getArchives() { return JSON.parse(localStorage.getItem('story_archives') || '[]'); },
    saveArchive() { const nameInput = document.getElementById('archive-name'); const name = nameInput.value.trim(); if (!name) return alert('请先输入存档名称！'); const roleId = window.Config.currentContactId; const items = window.Config.phoneData[roleId]?.novel?.items || []; if (items.length === 0) return alert('当前没有线下剧情可以存档哦！'); const vault = this.getMemoryVault(); const offlineVault = vault.filter(v => v.source === '线下故事' && !v.isCore); const archives = this.getArchives(); archives.push({ id: 'arc_' + Date.now(), name: name, date: new Date().toLocaleString(), count: items.length, data: JSON.parse(JSON.stringify(items)), vault: offlineVault }); localStorage.setItem('story_archives', JSON.stringify(archives)); nameInput.value = ''; window.PhoneUI.renderArchiveList(); this.showToast('💾 线下剧情存档成功！'); },
    loadArchive(id) { if (!confirm('读取存档将覆盖当前的线下剧情，确定要读取吗？')) return; const archives = this.getArchives(); const arc = archives.find(a => a.id === id); if (arc) { const roleId = window.Config.currentContactId; if (!window.Config.phoneData[roleId]) window.Config.phoneData[roleId] = {}; if (!window.Config.phoneData[roleId].novel) window.Config.phoneData[roleId].novel = {}; window.Config.phoneData[roleId].novel.items = JSON.parse(JSON.stringify(arc.data)); localStorage.setItem('phone_data', JSON.stringify(window.Config.phoneData)); if (arc.vault) { let vault = this.getMemoryVault(); vault = vault.filter(v => !(v.source === '线下故事' && !v.isCore)); vault = vault.concat(arc.vault); localStorage.setItem('memory_vault_entries', JSON.stringify(vault)); } window.PhoneUI.closeArchiveModal(); if (window.Config.currentAppId === 'novel') window.PhoneUI.renderNovelContent(); this.showToast('✨ 线下剧情读取成功！'); } },
    deleteArchive(id) { if (!confirm('确定删除吗？')) return; let archives = this.getArchives(); archives = archives.filter(a => a.id !== id); localStorage.setItem('story_archives', JSON.stringify(archives)); window.PhoneUI.renderArchiveList(); this.showToast('🗑️ 存档已删除'); },
    startNewTimeline() { if (!confirm('开启新剧情将清空当前的记录！确定吗？')) return; const roleId = window.Config.currentContactId; if (window.Config.phoneData[roleId]?.novel) { window.Config.phoneData[roleId].novel.items = []; localStorage.setItem('phone_data', JSON.stringify(window.Config.phoneData)); } let vault = this.getMemoryVault(); vault = vault.filter(v => !(v.source === '线下故事' && !v.isCore)); localStorage.setItem('memory_vault_entries', JSON.stringify(vault)); window.PhoneUI.closeArchiveModal(); if (window.Config.currentAppId === 'novel') window.PhoneUI.renderNovelContent(); this.showToast('🚀 已开启全新时间线！'); },

    // ================= 云端备份与同步系统 (Cloudflare KV) =================
    async syncToCloud() {
        this.showToast("☁️ 正在打包数据并上传云端...");
        try {
            const data = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                data[key] = localStorage.getItem(key);
            }
            const res = await fetch(`${this.CLOUD_BACKEND_URL}/save_data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error(`云端响应错误: ${res.status}`);
            this.showToast("🎉 云端备份成功！所有数据已安全存入数据库！");
        } catch (err) {
            console.error(err);
            alert("云端备份失败: " + err.message);
        }
    },

    async restoreFromCloud() {
        if (!confirm("⚠️ 确定要从云端恢复存档吗？这会覆盖本地当前的数据！")) return;
        this.showToast("📥 正在从云端读取最新存档...");
        try {
            const res = await fetch(`${this.CLOUD_BACKEND_URL}/save_data`);
            if (!res.ok) throw new Error(`云端响应错误: ${res.status}`);
            const dataStr = await res.text();
            if (!dataStr || dataStr === "null") {
                return alert("云端目前没有备份数据哦，请先在旧设备上点击【备份到云端】！");
            }
            const data = JSON.parse(dataStr);
            for (const key in data) {
                localStorage.setItem(key, data[key]);
            }
            this.showToast("✨ 云端恢复成功！正在重新载入...");
            setTimeout(() => {
                window.location.reload();
            }, 1200);
        } catch (err) {
            console.error(err);
            alert("云端恢复失败: " + err.message);
        }
    },

    async exportData() { const data = {}; for (let i = 0; i < localStorage.length; i++) { const key = localStorage.key(i); data[key] = localStorage.getItem(key); } const jsonStr = JSON.stringify(data, null, 2); const dateStr = new Date().toISOString().replace(/[:\-\sT]/g, '').slice(0, 14); const fileName = `ClaireClaude_Backup_${dateStr}.json`; try { const file = new File([jsonStr], fileName, { type: 'application/json' }); if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file] }); this.showToast("📦 备份已发送！"); return; } } catch (err) {} const blob = new Blob([jsonStr], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.style.display = 'none'; a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200); },
    importData(event) { const file = event.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (e) => { try { const data = JSON.parse(e.target.result); if (!confirm("⚠️ 警告：导入存档将覆盖当前手机里的所有记录！确定吗？")) { event.target.value = ''; return; } for (const key in data) { localStorage.setItem(key, data[key]); } this.showToast("✨ 导入成功！正在重启..."); setTimeout(() => { window.location.reload(); }, 1500); } catch (err) { alert("导入失败！"); } event.target.value = ''; }; reader.readAsText(file); },

    getDiaries() { return JSON.parse(localStorage.getItem('char_diaries') || '{}'); },
    saveDiary(dateStr, content) { const diaries = this.getDiaries(); diaries[dateStr] = content; localStorage.setItem('char_diaries', JSON.stringify(diaries)); },
    getFavorites() { return JSON.parse(localStorage.getItem('starry_favorites') || '[]'); },
    saveFavorite(text, source, sender) { const favs = this.getFavorites(); favs.push({ id: 'fav_' + Date.now(), content: text, source: source, sender: sender, time: new Date().toISOString().split('T')[0] }); localStorage.setItem('starry_favorites', JSON.stringify(favs)); this.showToast('⭐ 已存入星海收藏夹！'); },
    deleteFavorite(id) { if (!confirm('确定删除吗？')) return; let favs = this.getFavorites(); favs = favs.filter(f => f.id !== id); localStorage.setItem('starry_favorites', JSON.stringify(favs)); window.PhoneUI.renderAppContent('favorites'); this.showToast('🗑️ 已删除'); },

    getMemoryVault() { return JSON.parse(localStorage.getItem('memory_vault_entries') || '[]'); },
    saveToMemoryVault(summaries, source, isCore = false) { const vault = this.getMemoryVault(); const now = new Date(); const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`; const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`; let summaryArray = Array.isArray(summaries) ? summaries : [summaries]; summaryArray.forEach((summary, index) => { vault.push({ id: 'mem_' + Date.now() + '_' + index, content: summary, source: source, date: dateStr, time: timeStr, isCore: isCore }); }); localStorage.setItem('memory_vault_entries', JSON.stringify(vault)); this.showToast(`🧠 成功存入 ${summaryArray.length} 条记忆档案！`); },
    deleteFromMemoryVault(id) { if(!confirm('确定删除吗？')) return; let vault = this.getMemoryVault(); vault = vault.filter(m => m.id !== id); localStorage.setItem('memory_vault_entries', JSON.stringify(vault)); window.PhoneUI.renderMemoryVault(); this.showToast('🗑️ 记忆已消除'); },
    async editMemoryVault(id) { let vault = this.getMemoryVault(); let item = vault.find(m => m.id === id); if (item) { const newText = await window.PhoneUI.showCustomPrompt("✏️ 修改记忆档案：", item.content); if (newText !== null && newText.trim() !== "") { item.content = newText.trim(); localStorage.setItem('memory_vault_entries', JSON.stringify(vault)); window.PhoneUI.renderMemoryVault(); this.showToast('✅ 记忆已修改'); } } },
    toggleCoreMemory(id) { let vault = this.getMemoryVault(); let item = vault.find(m => m.id === id); if (item) { item.isCore = !item.isCore; localStorage.setItem('memory_vault_entries', JSON.stringify(vault)); window.PhoneUI.renderMemoryVault(); if (item.isCore) { this.showToast('📌 已设为核心记忆！'); } else { this.showToast('取消核心记忆'); } } },

    async forceUpdate() { if (confirm("确定要强制刷新并获取最新代码吗？")) { if ('serviceWorker' in navigator) { const registrations = await navigator.serviceWorker.getRegistrations(); for (let reg of registrations) { await reg.unregister(); } } if ('caches' in window) { const keys = await caches.keys(); for (let key of keys) { await caches.delete(key); } } window.location.href = window.location.pathname + '?t=' + new Date().getTime(); } },

    async chatWithAI(messages, useSubEngine = false) {
        const config = this.getEngineConfig(useSubEngine);
        if (!config) throw new Error("请先去【系统设置】里分配引擎配置！");

        const fab = document.getElementById('api-fab'); const statusText = document.getElementById('api-status-text');
        if (fab) { fab.classList.add('loading'); fab.classList.remove('error'); }
        if (statusText) { statusText.innerText = '正在思考中...'; statusText.style.color = 'var(--primary-color)'; }

        const endpoint = config.url.endsWith('/chat/completions') ? config.url : config.url.replace(/\/$/, '') + '/chat/completions';
        try {
            const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.key}` }, body: JSON.stringify({ model: config.model, messages: messages, temperature: 0.7 }) });
            if (!response.ok) { const errData = await response.json().catch(() => ({})); throw new Error(`API 报错: ${response.status} ${errData.error?.message || ''}`); }
            const data = await response.json();

            if (data.usage) {
                const tokenText = document.getElementById('api-token-text');
                if (tokenText) {
                    let uStr = `提示词: ${data.usage.prompt_tokens || 0} | 回复: ${data.usage.completion_tokens || 0}`;
                    if (data.usage.cache_creation_input_tokens || data.usage.cache_read_input_tokens) {
                        uStr += `\n📦 缓存创建: ${data.usage.cache_creation_input_tokens || 0}`;
                        uStr += `\n⚡ 缓存命中: ${data.usage.cache_read_input_tokens || 0}`;
                    }
                    uStr += `\n📊 总计消耗: ${data.usage.total_tokens || 0}`;
                    tokenText.innerText = uStr;
                }
            }

            if (fab) fab.classList.remove('loading'); if (statusText) { statusText.innerText = '请求成功'; statusText.style.color = '#4ade80'; }
            return data.choices[0].message.content;
        } catch (error) {
            console.error(error); if (fab) { fab.classList.remove('loading'); fab.classList.add('error'); } if (statusText) { statusText.innerText = '请求失败'; statusText.style.color = 'var(--danger-color)'; } throw new Error(error.message || "网络错误或 API 配置不正确，请检查。");
        }
    },

    async generateImageAPI(prompt) {
        let url = localStorage.getItem('img_api_url');
        const key = localStorage.getItem('img_api_key');
        const model = localStorage.getItem('img_api_model');
        const negPrompt = localStorage.getItem('img_negative_prompt') || '';
        const refBase64 = localStorage.getItem('img_ref_base64') || '';
        const persona = localStorage.getItem('char_persona') || '';

        if (!url || !key) throw new Error("请先在【系统设置】中配置绘画引擎 API！");

        if (!url.endsWith('/images/generations')) {
            url = url.replace(/\/$/, '') + '/images/generations';
        }

        const fab = document.getElementById('api-fab');
        const statusText = document.getElementById('api-status-text');
        if (fab) { fab.classList.add('loading'); fab.classList.remove('error'); }
        if (statusText) { statusText.innerText = '正在绘制中...'; statusText.style.color = 'var(--primary-color)'; }

        try {
            let finalPrompt = prompt;
            if (persona) finalPrompt += `\n\n【角色外貌特征参考】：${persona}`;
            if (negPrompt) finalPrompt += `\n\n【绝对禁止出现的元素(Negative Prompt)】：${negPrompt}`;

            if (refBase64) {
                finalPrompt = `${refBase64} ${finalPrompt}`;
            }

            const payload = { model: model, prompt: finalPrompt, n: 1, size: "1024x1024", response_format: "b64_json" };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(`[${response.status}] ${errData.error?.message || '未知服务器错误'}`);
            }
            const data = await response.json();

            if (fab) fab.classList.remove('loading');
            if (statusText) { statusText.innerText = '绘制成功'; statusText.style.color = '#4ade80'; }

            if (data.data && data.data[0]) {
                if (data.data[0].b64_json) {
                    return data.data[0].b64_json;
                } else if (data.data[0].url) {
                    console.log("API返回了URL，尝试前端下载...");
                    try {
                        PhoneAPI.showToast("API返回了URL，正在尝试后台下载并转换...");
                        const imgRes = await fetch(data.data[0].url);
                        const blob = await imgRes.blob();
                        return new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                const base64data = reader.result.split(',')[1];
                                resolve(base64data);
                            };
                            reader.onerror = reject;
                            reader.readAsDataURL(blob);
                        });
                    } catch (fetchErr) {
                        throw new Error("中转站强行返回了URL，且由于浏览器跨域安全限制(CORS)，无法自动下载图片。请更换一个标准支持 b64_json 的中转站！");
                    }
                }
            }
            throw new Error("API未返回有效的图片数据。");
        } catch (error) {
            console.error(error);
            if (fab) { fab.classList.remove('loading'); fab.classList.add('error'); }
            if (statusText) {
                statusText.innerText = '绘制失败: ' + error.message;
                statusText.style.color = 'var(--danger-color)';
                statusText.style.fontSize = '11px';
                statusText.style.lineHeight = '1.4';
            }
            throw error;
        }
    }
};
```

---

### 第二步：替换 `phone_ui.js`（完整版，界面增加云端备份/恢复按钮）
直接把你现有的 `phone_ui.js` **全部删除**，把下面这段完整代码粘贴进去：

```javascript
export const PhoneUI = {
    renderAppContent(appId) {
        const roleId = window.Config?.currentContactId;
        if (!roleId) return;

        let data = window.Config.phoneData?.[roleId]?.[appId];

        if (!data) {
            console.warn('[PhoneUI.renderAppContent] 找不到应用数据:', appId);
            return;
        }

        if (
            appId !== 'gallery' &&
            data.items &&
            Array.isArray(data.items) &&
            data.items.length > 50
        ) {
            data = {
                ...data,
                items: data.items.slice(-50)
            };
        }

        const listEl = document.getElementById('app-content-list');

        if (listEl && window.Apps && window.Apps[appId]) {

            let renderData = JSON.parse(JSON.stringify(data));

            if (Array.isArray(renderData.items)) {
                renderData.items.forEach(item => {
                    if (
                        item &&
                        typeof item.content === 'string' &&
                        item.content.includes('[发送了表情包：')
                    ) {
                        const urlMatch = item.content.match(/(https?:\/\/[^\s\)]+)/);

                        if (urlMatch) {
                            const safeUrl = this.escapeHtml(urlMatch[1]);

                            item.content = `
                                <img
                                    src="${safeUrl}"
                                    class="chat-sticker"
                                >
                            `;
                        }
                    }
                });
            }

            listEl.innerHTML = window.Apps[appId].renderList(renderData);

            setTimeout(() => {
                listEl.scrollTop = listEl.scrollHeight;
            }, 100);

        } else if (appId === 'gallery') {
            this.renderGallery();

        } else if (appId === 'shop') {
            this.renderShop();

        } else if (appId === 'settings') {
            this.renderSettings();

        } else if (appId === 'worldbook') {
            this.renderWorldbook();
        }
    },

    escapeHtml(str) {
        if (str === null || str === undefined) return '';

        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    toggleTheme() {
        const currentTheme =
            document.documentElement.getAttribute('data-theme');

        const newTheme =
            currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute(
            'data-theme',
            newTheme
        );

        localStorage.setItem('theme', newTheme);

        const icon = document.getElementById('theme-icon');

        if (icon) {
            if (newTheme === 'dark') {
                icon.classList.remove('ph-moon');
                icon.classList.add('ph-sun');
            } else {
                icon.classList.remove('ph-sun');
                icon.classList.add('ph-moon');
            }
        }
    },

    toggleChatMenu() {
        const menu = document.getElementById('chat-plus-menu');
        const btn = document.getElementById('btn-plus');

        if (!menu || !btn) return;

        if (menu.classList.contains('show')) {
            this.closeChatMenu();
        } else {
            menu.classList.add('show');
            btn.style.transform = 'rotate(45deg)';
        }
    },

    closeChatMenu() {
        const menu = document.getElementById('chat-plus-menu');
        const btn = document.getElementById('btn-plus');

        if (menu) menu.classList.remove('show');

        if (btn) {
            btn.style.transform = 'rotate(0deg)';
        }
    },

    openWalletModal() {
        const input = document.getElementById('wallet-input');

        if (input) {
            input.value =
                localStorage.getItem('my_coins') || '500';
        }

        const bg = document.getElementById('wallet-modal-bg');
        const modal = document.getElementById('wallet-modal');

        if (bg) bg.classList.add('show');
        if (modal) modal.classList.add('show');
    },

    closeWalletModal() {
        const bg = document.getElementById('wallet-modal-bg');
        const modal = document.getElementById('wallet-modal');

        if (bg) bg.classList.remove('show');
        if (modal) modal.classList.remove('show');
    },

    saveWalletBalance() {
        const input = document.getElementById('wallet-input');

        if (!input || input.value === '') {
            this.closeWalletModal();
            return;
        }

        const value = parseInt(input.value, 10);

        if (!Number.isFinite(value) || value < 0) {
            window.PhoneAPI?.showToast('❌ 请输入有效的余额');
            return;
        }

        localStorage.setItem('my_coins', value);

        const coinEl =
            document.getElementById('mine-coin-display');

        if (coinEl) {
            coinEl.innerText = value;
        }

        window.PhoneAPI?.showToast('💰 余额修改成功！');

        this.closeWalletModal();
    },

    openWbToggleModal(mode) {
        const listEl =
            document.getElementById('wb-toggle-list');

        const titleEl =
            document.getElementById('wb-toggle-title');

        if (!listEl || !titleEl) return;

        titleEl.innerHTML = `
            <i class="ph-fill ph-puzzle-piece"></i>
            规则插件挂载
            (${mode === 'online' ? '线上微信' : '线下故事'})
        `;

        const wbData =
            window.PhoneAPI?.getWorldbookData?.() || [];

        let html = '';

        wbData.forEach(wb => {
            const isChecked =
                mode === 'online'
                    ? wb.online
                    : wb.offline;

            html += `
                <div style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    background:var(--icon-bg);
                    padding:12px;
                    border-radius:12px;
                    border:1px solid var(--border-color);
                ">
                    <div style="
                        font-size:13px;
                        font-weight:bold;
                        color:var(--text-main);
                    ">
                        ${this.escapeHtml(wb.title)}
                    </div>

                    <label class="switch">
                        <input
                            type="checkbox"
                            ${isChecked ? 'checked' : ''}
                            onchange="
                                window.PhoneAPI.toggleWorldbook(
                                    '${this.escapeHtml(wb.id)}',
                                    '${mode}',
                                    this.checked
                                )
                            "
                        >
                        <span class="slider"></span>
                    </label>
                </div>
            `;
        });

        if (wbData.length === 0) {
            html = `
                <div style="
                    text-align:center;
                    color:var(--text-sub);
                    padding:20px 0;
                ">
                    暂无规则，请去 Home 页【世界书】添加！
                </div>
            `;
        }

        listEl.innerHTML = html;

        const bg =
            document.getElementById('wb-toggle-modal-bg');

        const modal =
            document.getElementById('wb-toggle-modal');

        if (bg) bg.classList.add('show');
        if (modal) modal.classList.add('show');
    },

    closeWbToggleModal() {
        const bg =
            document.getElementById('wb-toggle-modal-bg');

        const modal =
            document.getElementById('wb-toggle-modal');

        if (bg) bg.classList.remove('show');
        if (modal) modal.classList.remove('show');
    },

    toggleStickerPanel() {
        const panel =
            document.getElementById('sticker-panel');

        if (!panel) return;

        if (panel.classList.contains('show')) {
            this.closeStickerPanel();
        } else {
            this.closeChatMenu();
            this.renderStickers();
            panel.classList.add('show');
        }
    },

    closeStickerPanel() {
        const panel =
            document.getElementById('sticker-panel');

        if (panel) {
            panel.classList.remove('show');
        }
    },

    async importStickers() {
        const text = await this.showCustomPrompt(
            "📦 批量导入表情包",
            "请直接粘贴你的文档内容，格式如：\n让我摸摸:\nhttps://...gif\n害羞了:\nhttps://...gif\n（清空所有表情包请输入：CLEAR）"
        );

        if (!text) return;

        if (text.trim() === 'CLEAR') {
            if (confirm("确定要清空所有表情包吗？")) {
                localStorage.removeItem('custom_stickers');
                this.renderStickers();

                window.PhoneAPI?.showToast(
                    "🗑️ 表情包已清空"
                );
            }

            return;
        }

        const lines = text.split('\n');

        let newStickers = [];

        let currentName = "未命名表情";

        const urlRegex = /(https?:\/\/[^\s]+)/;

        lines.forEach(line => {
            const str = line.trim();

            if (!str) return;

            const urlMatch = str.match(urlRegex);

            if (urlMatch) {
                const url = urlMatch[1];

                let name = str
                    .replace(url, '')
                    .replace(/[:：]/g, '')
                    .trim();

                if (
                    !name &&
                    currentName !== "未命名表情"
                ) {
                    name = currentName;
                    currentName = "未命名表情";

                } else if (!name) {
                    name =
                        "表情" +
                        Math.floor(Math.random() * 1000);
                }

                newStickers.push({
                    name,
                    url
                });

            } else {
                currentName =
                    str.replace(/[:：]/g, '').trim();
            }
        });

        if (newStickers.length > 0) {
            let existing =
                JSON.parse(
                    localStorage.getItem('custom_stickers') ||
                    '[]'
                );

            existing = [
                ...existing,
                ...newStickers
            ];

            localStorage.setItem(
                'custom_stickers',
                JSON.stringify(existing)
            );

            this.renderStickers();

            window.PhoneAPI?.showToast(
                `✅ 成功解析并导入 ${newStickers.length} 个表情包！`
            );

        } else {
            window.PhoneAPI?.showToast(
                `❌ 未识别到任何有效链接`
            );
        }
    },

    renderStickers() {
        const panel =
            document.getElementById('sticker-panel');

        if (!panel) return;

        const stickers =
            JSON.parse(
                localStorage.getItem('custom_stickers') ||
                '[]'
            );

        let html = `
            <div
                class="sticker-add-btn"
                onclick="window.PhoneUI.importStickers()"
            >
                <i
                    class="ph ph-plus"
                    style="font-size:24px;"
                ></i>
                <span
                    style="
                        font-size:10px;
                        margin-top:4px;
                    "
                >
                    导入
                </span>
            </div>
        `;

        stickers.forEach(st => {
            const safeName =
                this.escapeHtml(st.name);

            const safeUrl =
                this.escapeHtml(st.url);

            html += `
                <div
                    class="sticker-item"
                    onclick="
                        window.PhoneEngine.sendSticker(
                            '${safeName}',
                            '${safeUrl}'
                        )
                    "
                    title="${safeName}"
                >
                    <img
                        src="${safeUrl}"
                        alt="${safeName}"
                    >
                </div>
            `;
        });

        panel.innerHTML = html;
    },

    toggleStoryMenu() {
        const menu =
            document.getElementById('story-plus-menu');

        const btn =
            document.getElementById('btn-story-plus');

        if (!menu || !btn) return;

        if (menu.classList.contains('show')) {
            this.closeStoryMenu();
        } else {
            menu.classList.add('show');
            btn.style.transform = 'rotate(45deg)';
        }
    },

    closeStoryMenu() {
        const menu =
            document.getElementById('story-plus-menu');

        const btn =
            document.getElementById('btn-story-plus');

        if (menu) {
            menu.classList.remove('show');
        }

        if (btn) {
            btn.style.transform = 'rotate(0deg)';
        }
    },

    showCustomPrompt(title, defaultValue = '') {
        return new Promise(resolve => {
            const bg =
                document.getElementById('custom-prompt-bg');

            const modal =
                document.getElementById('custom-prompt-modal');

            const titleEl =
                document.getElementById('custom-prompt-title');

            const inputEl =
                document.getElementById('custom-prompt-input');

            const btnConfirm =
                document.getElementById('custom-prompt-confirm');

            const btnCancel =
                document.getElementById('custom-prompt-cancel');

            if (
                !bg ||
                !modal ||
                !titleEl ||
                !inputEl ||
                !btnConfirm ||
                !btnCancel
            ) {
                resolve(null);
                return;
            }

            titleEl.innerText = title;
            inputEl.value = defaultValue;

            bg.classList.add('show');
            modal.classList.add('show');

            const cleanup = () => {
                bg.classList.remove('show');
                modal.classList.remove('show');

                btnConfirm.onclick = null;
                btnCancel.onclick = null;
            };

            btnConfirm.onclick = () => {
                const value = inputEl.value;

                cleanup();
                resolve(value);
            };

            btnCancel.onclick = () => {
                cleanup();
                resolve(null);
            };
        });
    },

    openApiModal() {
        const bg =
            document.getElementById('api-modal-bg');

        const modal =
            document.getElementById('api-modal');

        if (bg) bg.classList.add('show');
        if (modal) modal.classList.add('show');
    },

    closeApiModal() {
        const bg =
            document.getElementById('api-modal-bg');

        const modal =
            document.getElementById('api-modal');

        if (bg) bg.classList.remove('show');
        if (modal) modal.classList.remove('show');
    },

    switchSetTab(tabId) {
        ['basic', 'ai', 'draw', 'sys'].forEach(id => {
            const tab =
                document.getElementById('stab-' + id);

            const sec =
                document.getElementById('set-sec-' + id);

            if (tab) tab.classList.remove('active');
            if (sec) sec.classList.remove('active');
        });

        const activeTab =
            document.getElementById('stab-' + tabId);

        const activeSec =
            document.getElementById('set-sec-' + tabId);

        if (activeTab) {
            activeTab.classList.add('active');
        }

        if (activeSec) {
            activeSec.classList.add('active');
        }
    },

    openApp(appId, appName) {
        window.Config.currentAppId = appId;

        const titleEl =
            document.getElementById('app-window-title');

        const winEl =
            document.getElementById('app-window');

        const contentEl =
            document.getElementById('app-window-content');

        const footerEl =
            document.getElementById('app-window-footer');

        if (
            !titleEl ||
            !winEl ||
            !contentEl ||
            !footerEl
        ) {
            return;
        }

        titleEl.innerText = appName;

        winEl.classList.add('open');

        contentEl.style.padding = '20px';
        contentEl.style.background = 'transparent';

        footerEl.innerHTML = '';

        if (appId === 'diary') {
            winEl.classList.add('fullscreen-mode');
        } else {
            winEl.classList.remove('fullscreen-mode');
        }

        if (appId === 'novel') {
            contentEl.style.padding = '0';

            contentEl.innerHTML = `
                <div
                    id="novel-content-list"
                    class="story-bg"
                    onclick="
                        window.PhoneUI.closeStoryMenu();
                        window.PhoneUI.closeStickerPanel();
                    "
                ></div>

                <div
                    id="sticker-panel"
                    class="chat-plus-menu"
                    style="
                        display:flex;
                        flex-wrap:wrap;
                        justify-content:flex-start;
                        align-content:flex-start;
                        padding:15px;
                        gap:12px;
                        overflow-y:auto;
                        max-height:280px;
                        z-index:11;
                        bottom:100%;
                        margin-bottom:10px;
                        left:15px;
                        right:15px;
                        transform-origin:bottom left;
                    "
                ></div>
            `;

            footerEl.innerHTML = `
                <div
                    id="story-plus-menu"
                    class="story-menu"
                >
                    <div
                        class="story-menu-item"
                        onclick="
                            window.PhoneUI.openWbToggleModal('offline');
                            window.PhoneUI.closeStoryMenu();
                        "
                    >
                        <div class="icon">
                            <i
                                class="ph-fill ph-puzzle-piece"
                                style="color:#2a9d8f;"
                            ></i>
                        </div>
                        <div class="text">规则挂载</div>
                    </div>

                    <div
                        class="story-menu-item"
                        onclick="
                            window.PhoneEngine.extractMemory('novel');
                            window.PhoneUI.closeStoryMenu();
                        "
                    >
                        <div class="icon">
                            <i class="ph-fill ph-brain"></i>
                        </div>
                        <div class="text">提取记忆</div>
                    </div>

                    <div
                        class="story-menu-item"
                        onclick="
                            window.PhoneEngine.washMemory('novel');
                            window.PhoneUI.closeStoryMenu();
                        "
                    >
                        <div class="icon">
                            <i
                                class="ph-fill ph-broom"
                                style="color:#f4a261;"
                            ></i>
                        </div>
                        <div class="text">记忆洗地</div>
                    </div>

                    <div
                        class="story-menu-item"
                        onclick="
                            window.PhoneUI.openArchiveModal();
                            window.PhoneUI.closeStoryMenu();
                        "
                    >
                        <div class="icon">
                            <i class="ph-fill ph-floppy-disk"></i>
                        </div>
                        <div class="text">存档室</div>
                    </div>
                </div>

                <div class="story-input-bar">
                    <div
                        class="icon-btn"
                        id="btn-story-plus"
                        onclick="
                            window.PhoneUI.toggleStoryMenu();
                            window.PhoneUI.closeStickerPanel();
                        "
                    >
                        <i class="ph ph-plus-circle"></i>
                    </div>

                    <textarea
                        id="novel-input"
                        class="story-textarea"
                        placeholder="书写你们的故事..."
                        onclick="
                            window.PhoneUI.closeStoryMenu();
                            window.PhoneUI.closeStickerPanel();
                        "
                    ></textarea>

                    <div
                        class="icon-btn"
                        style="
                            font-size:26px;
                            padding-bottom:4px;
                            margin-right:5px;
                        "
                        onclick="
                            window.PhoneUI.toggleStickerPanel();
                            window.PhoneUI.closeStoryMenu();
                        "
                    >
                        <i class="ph ph-smiley"></i>
                    </div>

                    <button
                        class="story-send-btn"
                        onclick="
                            window.PhoneEngine.sendNovelMessage();
                            window.PhoneUI.closeStoryMenu();
                            window.PhoneUI.closeStickerPanel();
                        "
                    >
                        <i class="ph-fill ph-paper-plane-right"></i>
                    </button>
                </div>
            `;

            this.renderNovelContent();

        } else if (appId === 'diary') {

            const diaryTitle =
                localStorage.getItem('diary_title') ||
                'His Diary';

            contentEl.innerHTML = `
                <div
                    id="diary-cover-view"
                    class="diary-cover-view"
                >
                    <div
                        class="diary-book-cover"
                        id="diary-book-cover"
                        onclick="window.PhoneUI.unlockDiary()"
                    >
                        <div class="diary-title">
                            ${this.escapeHtml(diaryTitle)}
                        </div>

                        <div class="diary-hint">
                            点击翻开日记
                        </div>
                    </div>

                    <div
                        class="diary-back-btn"
                        onclick="window.PhoneUI.closeApp()"
                    >
                        <i class="ph ph-caret-left"></i>
                    </div>
                </div>

                <div
                    id="diary-inside-view"
                    class="diary-inside-view"
                    ontouchstart="window.PhoneUI.handleSwipeStart(event)"
                    ontouchend="window.PhoneUI.handleSwipeEnd(event)"
                >
                    <div
                        class="diary-back-btn"
                        onclick="window.PhoneUI.closeApp()"
                        style="
                            top:20px;
                            left:15px;
                            background:rgba(0,0,0,0.1);
                            color:#333;
                            z-index:50;
                        "
                    >
                        <i class="ph ph-caret-left"></i>
                    </div>

                    <div
                        id="diary-content-area"
                        style="
                            display:flex;
                            flex-direction:column;
                            height:100%;
                        "
                    ></div>
                </div>
            `;

            window.Config.diaryPageIndex = -1;

            this.renderDiaryPage();

        } else if (appId === 'memory_vault') {

            window.Config.memoryVaultTab = 'wechat';

            contentEl.innerHTML = `
                <div class="vault-tabs">
                    <div
                        class="vault-tab active"
                        id="tab-wechat"
                        onclick="
                            window.PhoneUI.switchVaultTab('wechat')
                        "
                    >
                        线上微信
                    </div>

                    <div
                        class="vault-tab"
                        id="tab-novel"
                        onclick="
                            window.PhoneUI.switchVaultTab('novel')
                        "
                    >
                        线下故事
                    </div>

                    <div
                        class="vault-tab"
                        id="tab-core"
                        onclick="
                            window.PhoneUI.switchVaultTab('core')
                        "
                    >
                        ⭐ 核心记忆
                    </div>
                </div>

                <div id="vault-content-area"></div>
            `;

            this.renderMemoryVault();

        } else if (appId === 'favorites') {

            const favs =
                window.PhoneAPI?.getFavorites?.() || [];

            let html =
                '<div style="padding:10px 5px;">';

            if (favs.length === 0) {

                html += `
                    <div
                        style="
                            text-align:center;
                            color:var(--text-sub);
                            padding:50px 0;
                        "
                    >
                        <i
                            class="ph-fill ph-star"
                            style="
                                font-size:48px;
                                color:var(--border-color);
                                margin-bottom:15px;
                            "
                        ></i>

                        <br>
                        空空如也
                        <br>
                        快去聊天记录长按消息收藏吧！
                    </div>
                `;

            } else {

                [...favs].reverse().forEach(fav => {

                    let content =
                        window.marked
                            ? window.marked.parse(
                                fav.content || ''
                            )
                            : (fav.content || '');

                    html += `
                        <div
                            class="card"
                            style="
                                position:relative;
                                padding-right:40px;
                            "
                        >
                            <div
                                style="
                                    font-size:12px;
                                    color:var(--primary-color);
                                    margin-bottom:5px;
                                    font-weight:bold;
                                "
                            >
                                ${this.escapeHtml(fav.time)}
                                ·
                                ${this.escapeHtml(fav.source)}
                            </div>

                            <div
                                class="markdown-body"
                                style="font-size:14px;"
                            >
                                ${content}
                            </div>

                            <div
                                onclick="
                                    window.PhoneAPI.deleteFavorite(
                                        '${this.escapeHtml(fav.id)}'
                                    )
                                "
                                style="
                                    position:absolute;
                                    right:15px;
                                    top:50%;
                                    transform:translateY(-50%);
                                    color:var(--danger-color);
                                    font-size:20px;
                                    cursor:pointer;
                                    padding:5px;
                                "
                            >
                                <i class="ph ph-trash"></i>
                            </div>
                        </div>
                    `;
                });
            }

            html += '</div>';

            contentEl.innerHTML = html;

        } else if (appId === 'shop') {

            this.renderShop();

        } else if (appId === 'settings') {

            this.renderSettings();

        } else if (appId === 'worldbook') {

            this.renderWorldbook();
        }
    },

    renderSettings() {
        const contentEl =
            document.getElementById('app-window-content');

        if (!contentEl) return;

        const today = new Date();

        const defaultDate =
            `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        contentEl.innerHTML = `
            <div class="settings-tabs">
                <div
                    class="settings-tab active"
                    id="stab-basic"
                    onclick="
                        window.PhoneUI.switchSetTab('basic')
                    "
                >
                    基础/UI
                </div>

                <div
                    class="settings-tab"
                    id="stab-ai"
                    onclick="
                        window.PhoneUI.switchSetTab('ai')
                    "
                >
                    大模型
                </div>

                <div
                    class="settings-tab"
                    id="stab-draw"
                    onclick="
                        window.PhoneUI.switchSetTab('draw')
                    "
                >
                    绘画引擎
                </div>

                <div
                    class="settings-tab"
                    id="stab-sys"
                    onclick="
                        window.PhoneUI.switchSetTab('sys')
                    "
                >
                    系统维护
                </div>
            </div>

            <div
                id="set-sec-basic"
                class="set-section active"
            >
                <div class="card">
                    <h3
                        style="
                            color:var(--primary-color);
                            margin-bottom:15px;
                        "
                    >
                        <i class="ph-fill ph-user-list"></i>
                        基础设定
                    </h3>

                    <div
                        style="
                            display:flex;
                            gap:10px;
                            margin-bottom:10px;
                        "
                    >
                        <div style="flex:1;">
                            <label
                                style="
                                    font-size:12px;
                                    color:var(--text-sub);
                                "
                            >
                                我的名字
                            </label>

                            <input
                                type="text"
                                id="my-name"
                                oninput="window.PhoneAPI.autoSave()"
                                style="
                                    width:100%;
                                    padding:8px;
                                    border-radius:8px;
                                    margin-top:4px;
                                "
                            >
                        </div>

                        <div style="flex:1;">
                            <label
                                style="
                                    font-size:12px;
                                    color:var(--text-sub);
                                "
                            >
                                TA的名字
                            </label>

                            <input
                                type="text"
                                id="char-name"
                                oninput="window.PhoneAPI.autoSave()"
                                style="
                                    width:100%;
                                    padding:8px;
                                    border-radius:8px;
                                    margin-top:4px;
                                "
                            >
                        </div>
                    </div>

                    <div
                        style="
                            display:flex;
                            gap:10px;
                            margin-bottom:5px;
                        "
                    >
                        <div style="flex:1;">
                            <label
                                style="
                                    font-size:12px;
                                    color:var(--text-sub);
                                "
                            >
                                我的头像(网址)
                            </label>

                            <input
                                type="text"
                                id="my-avatar"
                                oninput="window.PhoneAPI.autoSave()"
                                style="
                                    width:100%;
                                    padding:8px;
                                    border-radius:8px;
                                    margin-top:4px;
                                "
                            >
                        </div>

                        <div style="flex:1;">
                            <label
                                style="
                                    font-size:12px;
                                    color:var(--text-sub);
                                "
                            >
                                TA的头像(网址)
                            </label>

                            <input
                                type="text"
                                id="ta-avatar"
                                oninput="window.PhoneAPI.autoSave()"
                                style="
                                    width:100%;
                                    padding:8px;
                                    border-radius:8px;
                                    margin-top:4px;
                                "
                            >
                        </div>
                    </div>
                </div>

                <div class="card">
                    <h3
                        style="
                            color:var(--primary-color);
                            margin-bottom:10px;
                        "
                    >
                        <i class="ph-fill ph-palette"></i>
                        UI 主题装修 (预设库)
                    </h3>

                    <div class="preset-bar">
                        <select
                            id="ui-preset-select"
                            onchange="window.PhoneAPI.loadUIPreset()"
                        ></select>

                        <button
                            class="preset-btn"
                            onclick="window.PhoneAPI.saveUIPreset()"
                        >
                            存为预设
                        </button>

                        <button
                            class="preset-btn del"
                            onclick="window.PhoneAPI.deleteUIPreset()"
                        >
                            删除
                        </button>
                    </div>

                    <div class="engine-title">
                        <i class="ph-fill ph-image"></i>
                        壁纸与封面
                    </div>

                    <div
                        style="
                            display:flex;
                            gap:10px;
                            margin-bottom:10px;
                        "
                    >
                        <div style="flex:1;">
                            <label
                                style="
                                    font-size:11px;
                                    color:var(--text-sub);
                                "
                            >
                                全局壁纸(网址)
                            </label>

                            <input
                                type="text"
                                id="bg-global"
                                oninput="window.PhoneAPI.autoSave()"
                                style="
                                    width:100%;
                                    padding:8px;
                                    border-radius:8px;
                                    margin-top:4px;
                                "
                            >
                        </div>

                        <div style="flex:1;">
                            <label
                                style="
                                    font-size:11px;
                                    color:var(--text-sub);
                                "
                            >
                                聊天壁纸(网址)
                            </label>

                            <input
                                type="text"
                                id="bg-chat"
                                oninput="window.PhoneAPI.autoSave()"
                                style="
                                    width:100%;
                                    padding:8px;
                                    border-radius:8px;
                                    margin-top:4px;
                                "
                            >
                        </div>
                    </div>

                    <div style="margin-bottom:10px;">
                        <label
                            style="
                                font-size:11px;
                                color:var(--text-sub);
                            "
                        >
                            日记本封面(网址)
                        </label>

                        <input
                            type="text"
                            id="bg-diary-cover"
                            placeholder="例如: ./cover.jpg"
                            oninput="window.PhoneAPI.autoSave()"
                            style="
                                width:100%;
                                padding:8px;
                                border-radius:8px;
                                margin-top:4px;
                            "
                        >
                    </div>

                    <div style="margin-bottom:15px;">
                        <label
                            style="
                                font-size:11px;
                                color:var(--text-sub);
                            "
                        >
                            日记内页底图(网址)
                        </label>

                        <input
                            type="text"
                            id="bg-diary-page"
                            placeholder="推荐使用牛皮纸或水彩底图"
                            oninput="window.PhoneAPI.autoSave()"
                            style="
                                width:100%;
                                padding:8px;
                                border-radius:8px;
                                margin-top:4px;
                            "
                        >
                    </div>

                    <div class="engine-title">
                        <i class="ph-fill ph-text-aa"></i>
                        日记本专属设置
                    </div>

                    <div style="margin-bottom:10px;">
                        <label
                            style="
                                font-size:11px;
                                color:var(--danger-color);
                                font-weight:bold;
                            "
                        >
                            日记起始日期 (决定第一页是哪天！)
                        </label>

                        <input
                            type="date"
                            id="diary-start-date"
                            value="${defaultDate}"
                            onchange="window.PhoneAPI.autoSave()"
                            style="
                                width:100%;
                                padding:8px;
                                border-radius:8px;
                                margin-top:4px;
                            "
                        >
                    </div>

                    <div style="margin-bottom:10px;">
                        <label
                            style="
                                font-size:11px;
                                color:var(--text-sub);
                            "
                        >
                            封面标题 (英文比较好看)
                        </label>

                        <input
                            type="text"
                            id="diary-title"
                            placeholder="His Diary"
                            oninput="window.PhoneAPI.autoSave()"
                            style="
                                width:100%;
                                padding:8px;
                                border-radius:8px;
                                margin-top:4px;
                            "
                        >
                    </div>

                    <div style="margin-bottom:15px;">
                        <label
                            style="
                                font-size:11px;
                                color:var(--text-sub);
                            "
                        >
                            扉页寄语 (支持换行)
                        </label>

                        <textarea
                            id="diary-quote"
                            rows="3"
                            placeholder="时间会磨平一切痕迹，\n除了我为你写下的字。"
                            oninput="window.PhoneAPI.autoSave()"
                            style="
                                width:100%;
                                padding:8px;
                                border-radius:8px;
                                margin-top:4px;
                                resize:vertical;
                            "
                        ></textarea>
                    </div>
                </div>
            </div>

            <div id="set-sec-ai" class="set-section">

                <div class="card">
                    <h3
                        style="
                            color:var(--primary-color);
                            margin-bottom:10px;
                        "
                    >
                        <i class="ph-fill ph-scroll"></i>
                        提示词与人设 (预设库)
                    </h3>

                    <div class="preset-bar">
                        <select
                            id="prompt-preset-select"
                            onchange="window.PhoneAPI.loadPromptPreset()"
                        ></select>

                        <button
                            class="preset-btn"
                            onclick="window.PhoneAPI.savePromptPreset()"
                        >
                            存为预设
                        </button>

                        <button
                            class="preset-btn del"
                            onclick="window.PhoneAPI.deletePromptPreset()"
                        >
                            删除
                        </button>
                    </div>

                    <div style="margin-bottom:15px;">
                        <label
                            style="
                                font-size:12px;
                                color:var(--text-main);
                                font-weight:bold;
                            "
                        >
                            1. 系统指令 (防八股/核心规则)
                        </label>

                        <textarea
                            id="system-prompt"
                            rows="4"
                            oninput="window.PhoneAPI.autoSave()"
                            style="
                                width:100%;
                                padding:10px;
                                border-radius:8px;
                                resize:vertical;
                                font-size:12px;
                                margin-top:4px;
                            "
                        ></textarea>
                    </div>

                    <div style="margin-bottom:15px;">
                        <label
                            style="
                                font-size:12px;
                                color:var(--text-main);
                                font-weight:bold;
                            "
                        >
                            2. 角色人设 (性格/背景/口吻)
                        </label>

                        <textarea
                            id="char-persona"
                            rows="6"
                            oninput="window.PhoneAPI.autoSave()"
                            style="
                                width:100%;
                                padding:10px;
                                border-radius:8px;
                                resize:vertical;
                                font-size:12px;
                                margin-top:4px;
                            "
                        ></textarea>
                    </div>

                    <div style="margin-bottom:5px;">
                        <label
                            style="
                                font-size:12px;
                                color:var(--text-main);
                                font-weight:bold;
                            "
                        >
                            3. 线下文风 (小说模式专属要求)
                        </label>

                        <textarea
                            id="novel-style"
                            rows="4"
                            oninput="window.PhoneAPI.autoSave()"
                            style="
                                width:100%;
                                padding:10px;
                                border-radius:8px;
                                resize:vertical;
                                font-size:12px;
                                margin-top:4px;
                            "
                        ></textarea>
                    </div>
                </div>

                <div class="card">
                    <h3
                        style="
                            color:var(--primary-color);
                            margin-bottom:15px;
                        "
                    >
                        <i class="ph-fill ph-toggle-left"></i>
                        功能开关
                    </h3>

                    <div
                        style="
                            margin-bottom:10px;
                            display:flex;
                            align-items:center;
                            justify-content:space-between;
                            background:var(--icon-bg);
                            padding:10px;
                            border-radius:8px;
                        "
                    >
                        <label
                            style="
                                font-size:13px;
                                color:var(--text-main);
                                font-weight:bold;
                            "
                        >
                            <i class="ph ph-prohibit"></i>
                            绝对禁止 AI 使用 Emoji
                        </label>

                        <input
                            type="checkbox"
                            id="ban-emoji"
                            onchange="window.PhoneAPI.autoSave()"
                            style="
                                width:18px;
                                height:18px;
                            "
                        >
                    </div>

                    <div
                        style="
                            margin-bottom:10px;
                            display:flex;
                            align-items:center;
                            justify-content:space-between;
                            background:var(--icon-bg);
                            padding:10px;
                            border-radius:8px;
                        "
                    >
                        <label
                            style="
                                font-size:13px;
                                color:var(--text-main);
                                font-weight:bold;
                            "
                        >
                            <i class="ph ph-arrows-merge"></i>
                            开启线上/线下记忆互通
                        </label>

                        <input
                            type="checkbox"
                            id="share-memory"
                            onchange="window.PhoneAPI.autoSave()"
                            style="
                                width:18px;
                                height:18px;
                            "
                        >
                    </div>

                    <div
                        style="
                            margin-bottom:5px;
                            display:flex;
                            align-items:center;
                            justify-content:space-between;
                            background:var(--icon-bg);
                            padding:10px;
                            border-radius:8px;
                        "
                    >
                        <label
                            style="
                                font-size:13px;
                                color:var(--text-main);
                                font-weight:bold;
                            "
                        >
                            <i class="ph ph-camera"></i>
                            允许 AI 在聊天中自动发自拍
                        </label>

                        <input
                            type="checkbox"
                            id="auto-photo"
                            onchange="window.PhoneAPI.autoSave()"
                            style="
                                width:18px;
                                height:18px;
                            "
                        >
                    </div>
                </div>

                <div class="card">
                    <h3 style="color:var(--primary-color); margin-bottom:10px;">
                        <i class="ph-fill ph-database"></i>
                        语言引擎预设库 (文本模型)
                    </h3>

                    <div style="display:flex; gap:8px; align-items:center; margin-bottom:15px; padding-bottom:15px; border-bottom:1px dashed var(--border-color);">
                        <select
                            id="preset-delete-select"
                            onchange="window.PhoneUI.fillPresetData()"
                            style="flex:1; padding:8px; border-radius:8px; border: 1px solid var(--primary-color);"
                        >
                            <option value="">-- 选择预设以编辑或删除 --</option>
                        </select>

                        <button
                            class="btn-refresh"
                            onclick="window.PhoneAPI.deletePreset()"
                            style="width:auto; margin:0; background:transparent; color:var(--danger-color); border:1px solid var(--danger-color); padding:8px 12px;"
                        >
                            <i class="ph ph-trash"></i>
                        </button>
                    </div>

                    <div style="margin-bottom:10px;">
                        <input type="text" id="preset-name" placeholder="起个名字 (如: 硅基-DeepSeek)" style="width:100%; padding:8px; border-radius:8px;">
                    </div>

                    <div style="margin-bottom:10px;">
                        <input type="text" id="preset-url" placeholder="接口地址 (Base URL)" style="width:100%; padding:8px; border-radius:8px;">
                    </div>

                    <div style="margin-bottom:10px;">
                        <input type="password" id="preset-key" placeholder="API Key (密钥)" style="width:100%; padding:8px; border-radius:8px;">
                    </div>

                    <div style="margin-bottom:15px;">
                        <input type="text" id="preset-model" placeholder="模型名称 (Model)" style="width:100%; padding:8px; border-radius:8px;">
                    </div>

                    <button
                        class="btn-refresh"
                        onclick="window.PhoneAPI.savePreset()"
                        style="margin-top:0; margin-bottom:5px;"
                    >
                        <i class="ph ph-floppy-disk"></i>
                        保存 / 更新当前预设
                    </button>
                </div>

                <div class="card">
                    <h3
                        style="
                            color:var(--primary-color);
                            margin-bottom:15px;
                        "
                    >
                        <i class="ph-fill ph-cpu"></i>
                        主副引擎分配
                    </h3>

                    <div class="engine-title">
                        <i class="ph-fill ph-chat-circle-dots"></i>
                        主引擎 (聊天/小说专用)
                    </div>

                    <select
                        id="main-engine-select"
                        onchange="
                            window.PhoneAPI.assignEngine(
                                'main',
                                this.value
                            )
                        "
                        style="
                            width:100%;
                            padding:8px;
                            border-radius:8px;
                            margin-bottom:15px;
                        "
                    ></select>

                    <div class="engine-title">
                        <i class="ph-fill ph-lightning"></i>
                        副引擎 (转盘/商店专用)
                    </div>

                    <select
                        id="sub-engine-select"
                        onchange="
                            window.PhoneAPI.assignEngine(
                                'sub',
                                this.value
                            )
                        "
                        style="
                            width:100%;
                            padding:8px;
                            border-radius:8px;
                        "
                    >
                        <option value="">
                            -- 同主引擎 (自动降级) --
                        </option>
                    </select>
                </div>
            </div>

            <div id="set-sec-draw" class="set-section">
                <div class="card">
                    <h3
                        style="
                            color:var(--primary-color);
                            margin-bottom:10px;
                        "
                    >
                        <i class="ph-fill ph-image"></i>
                        绘画引擎配置 (DALL-E 格式)
                    </h3>

                    <div
                        style="
                            font-size:11px;
                            color:var(--text-sub);
                            margin-bottom:10px;
                        "
                    >
                        用于生成相册照片，必须支持返回 b64_json 格式。
                    </div>

                    <div style="margin-bottom:10px;">
                        <input
                            type="text"
                            id="img-api-url"
                            placeholder="接口地址 (例如: https://api.openai.com/v1/images/generations)"
                            oninput="window.PhoneAPI.autoSave()"
                            style="
                                width:100%;
                                padding:8px;
                                border-radius:8px;
                            "
                        >
                    </div>

                    <div style="margin-bottom:10px;">
                        <input
                            type="password"
                            id="img-api-key"
                            placeholder="API Key (密钥)"
                            oninput="window.PhoneAPI.autoSave()"
                            style="
                                width:100%;
                                padding:8px;
                                border-radius:8px;
                            "
                        >
                    </div>

                    <div style="margin-bottom:10px;">
                        <input
                            type="text"
                            id="img-api-model"
                            placeholder="模型名称 (例如: dall-e-3)"
                            oninput="window.PhoneAPI.autoSave()"
                            style="
                                width:100%;
                                padding:8px;
                                border-radius:8px;
                            "
                        >
                    </div>

                    <div
                        class="engine-title"
                        style="margin-top:15px;"
                    >
                        <i class="ph-fill ph-mask-happy"></i>
                        画风与垫图 (锁脸) 预设库
                    </div>

                    <div class="preset-bar">
                        <select
                            id="img-preset-select"
                            onchange="window.PhoneAPI.loadImgPreset()"
                        ></select>

                        <button
                            class="preset-btn"
                            onclick="window.PhoneAPI.saveImgPreset()"
                        >
                            存为预设
                        </button>

                        <button
                            class="preset-btn del"
                            onclick="window.PhoneAPI.deleteImgPreset()"
                        >
                            删除
                        </button>
                    </div>

                    <div
                        style="
                            font-size:11px;
                            color:var(--text-sub);
                            margin-bottom:10px;
                        "
                    >
                        如果使用 Midjourney/NAI，可以上传一张照片作为垫图锁脸。
                        <br>
                        <span style="color:var(--danger-color)">
                            注意：使用 DALL-E 3 请勿上传垫图和反向词！
                        </span>
                    </div>

                    <div
                        style="
                            display:flex;
                            gap:10px;
                            margin-bottom:15px;
                            align-items:center;
                        "
                    >
                        <div
                            id="face-lock-preview"
                            style="
                                width:60px;
                                height:60px;
                                border-radius:12px;
                                background:var(--icon-bg);
                                border:1px dashed var(--border-color);
                                display:flex;
                                justify-content:center;
                                align-items:center;
                                overflow:hidden;
                            "
                        >
                            <i
                                class="ph ph-plus"
                                style="
                                    font-size:24px;
                                    color:var(--text-sub);
                                "
                            ></i>
                        </div>

                        <div
                            style="
                                flex:1;
                                display:flex;
                                flex-direction:column;
                                gap:5px;
                            "
                        >
                            <button
                                class="btn-refresh"
                                onclick="window.PhoneEngine.uploadFaceLock()"
                                style="
                                    margin:0;
                                    padding:8px;
                                    font-size:12px;
                                    border-radius:8px;
                                "
                            >
                                上传锁脸图
                            </button>

                            <button
                                class="btn-refresh"
                                onclick="window.PhoneEngine.clearFaceLock()"
                                style="
                                    margin:0;
                                    padding:8px;
                                    font-size:12px;
                                    border-radius:8px;
                                    background:transparent;
                                    color:var(--danger-color);
                                    border:1px solid var(--danger-color);
                                "
                            >
                                清除
                            </button>
                        </div>
                    </div>

                    <div style="margin-bottom:10px;">
                        <textarea
                            id="img-base-prompt"
                            rows="4"
                            placeholder="正向提示词 (例如: 1boy, handsome, black hair)"
                            oninput="window.PhoneAPI.autoSave()"
                            style="
                                width:100%;
                                padding:8px;
                                border-radius:8px;
                                resize:vertical;
                            "
                        ></textarea>
                    </div>

                    <div style="margin-bottom:5px;">
                        <textarea
                            id="img-negative-prompt"
                            rows="3"
                            placeholder="反向提示词 (例如: lowres, bad anatomy, bad hands, error, missing fingers)"
                            oninput="window.PhoneAPI.autoSave()"
                            style="
                                width:100%;
                                padding:8px;
                                border-radius:8px;
                                resize:vertical;
                            "
                        ></textarea>
                    </div>
                </div>
            </div>

            <div id="set-sec-sys" class="set-section">

                <!-- 🌟 重点新增：云端同步系统 (Cloudflare KV) -->
                <div class="card" style="border: 1px solid var(--primary-color);">
                    <h3
                        style="
                            color:var(--primary-color);
                            margin-bottom:10px;
                        "
                    >
                        <i class="ph-fill ph-cloud-check"></i>
                        Cloudflare 云端同步
                    </h3>
                    <div style="font-size:12px; color:var(--text-sub); margin-bottom:12px;">
                        跨设备无缝同步！一键将不死途的全部记忆上传到云端数据库。
                    </div>

                    <div style="display:flex; gap:10px;">
                        <button
                            class="btn-refresh"
                            onclick="window.PhoneAPI.syncToCloud()"
                            style="
                                flex:1;
                                margin-top:0;
                                background:linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                            "
                        >
                            <i class="ph-fill ph-cloud-arrow-up"></i>
                            备份到云端
                        </button>

                        <button
                            class="btn-refresh"
                            onclick="window.PhoneAPI.restoreFromCloud()"
                            style="
                                flex:1;
                                margin-top:0;
                                background:var(--icon-bg);
                                color:var(--text-main);
                                border:1px solid var(--border-color);
                            "
                        >
                            <i class="ph-fill ph-cloud-arrow-down"></i>
                            从云端拉取
                        </button>
                    </div>
                </div>

                <div class="card">
                    <h3
                        style="
                            color:var(--primary-color);
                            margin-bottom:15px;
                        "
                    >
                        <i class="ph-fill ph-floppy-disk-back"></i>
                        本地文件备份 (JSON)
                    </h3>

                    <div style="display:flex; gap:10px;">

                        <button
                            class="btn-refresh"
                            onclick="window.PhoneAPI.exportData()"
                            style="
                                flex:1;
                                margin-top:0;
                                background:var(--secondary-color);
                            "
                        >
                            <i class="ph ph-export"></i>
                            导出文件
                        </button>

                        <button
                            class="btn-refresh"
                            onclick="
                                document.getElementById('import-file').click()
                            "
                            style="
                                flex:1;
                                margin-top:0;
                                background:#2a9d8f;
                            "
                        >
                            <i class="ph ph-import"></i>
                            导入文件
                        </button>

                        <input
                            type="file"
                            id="import-file"
                            style="display:none"
                            accept=".json"
                            onchange="window.PhoneAPI.importData(event)"
                        >
                    </div>
                </div>

                <div class="card">
                    <h3
                        style="
                            color:var(--danger-color);
                            margin-bottom:15px;
                        "
                    >
                        <i class="ph-fill ph-warning-circle"></i>
                        系统维护
                    </h3>

                    <button
                        class="btn-refresh"
                        onclick="window.PhoneAPI.forceUpdate()"
                        style="
                            background:#f4a261;
                            margin-top:0;
                            margin-bottom:10px;
                        "
                    >
                        <i class="ph ph-arrows-clockwise"></i>
                        强制更新系统 (获取最新代码)
                    </button>

                    <button
                        class="btn-refresh"
                        onclick="window.PhoneAPI.clearChat()"
                        style="
                            background:var(--danger-color);
                            margin-top:0;
                        "
                    >
                        <i class="ph ph-trash"></i>
                        清空所有聊天与小说记录
                    </button>
                </div>
            </div>
        `;

        setTimeout(() => {
            window.PhoneAPI?.loadSettings?.();
            window.PhoneAPI?.refreshPresetDropdowns?.();
            window.PhoneAPI?.refreshPromptDropdowns?.();
            window.PhoneAPI?.refreshUIDropdowns?.();
            window.PhoneAPI?.refreshImgDropdowns?.();
        }, 50);
    },

    renderWorldbook() {
        const contentEl =
            document.getElementById('app-window-content');

        if (!contentEl) return;

        const wbData =
            window.PhoneAPI?.getWorldbookData?.() || [];

        let wbHtml = '';

        wbData.forEach(wb => {
            const deleteBtn = wb.isCustom
                ? `
                    <div
                        class="wb-delete-btn"
                        onclick="
                            window.PhoneAPI.deleteWorldbook(
                                '${this.escapeHtml(wb.id)}'
                            )
                        "
                    >
                        <i class="ph ph-trash"></i>
                    </div>
                `
                : '';

            wbHtml += `
                <div class="wb-card">
                    <div class="wb-header">
                        <span class="wb-title">
                            ${this.escapeHtml(wb.title)}
                        </span>
                        ${deleteBtn}
                    </div>

                    <div class="wb-content">
                        ${wb.content || ''}
                    </div>
                </div>
            `;
        });

        contentEl.innerHTML = `
            <div
                class="card"
                style="margin-bottom:20px;"
            >
                <h3
                    style="
                        font-size:14px;
                        color:var(--primary-color);
                        margin-bottom:10px;
                    "
                >
                    <i class="ph-fill ph-text-aa"></i>
                    线下小说字数底线
                </h3>

                <div
                    style="
                        display:flex;
                        align-items:center;
                        gap:10px;
                    "
                >
                    <input
                        type="number"
                        id="novel-min-words"
                        value="${localStorage.getItem('novel_min_words') || '150'}"
                        oninput="window.PhoneAPI.saveNovelWords()"
                        style="
                            width:80px;
                            padding:8px;
                            border:1px solid var(--border-color);
                            border-radius:8px;
                            text-align:center;
                            background:var(--icon-bg);
                            color:var(--text-main);
                        "
                    >

                    <span
                        style="
                            font-size:12px;
                            color:var(--text-sub);
                        "
                    >
                        字 (打字自动保存)
                    </span>
                </div>
            </div>

            <h3
                style="
                    font-size:14px;
                    color:var(--primary-color);
                    margin-bottom:10px;
                    margin-left:5px;
                "
            >
                <i class="ph-fill ph-puzzle-piece"></i>
                规则插件库
            </h3>

            ${wbHtml}

            <button
                class="btn-refresh"
                onclick="window.PhoneUI.openWbModal()"
                style="
                    margin-top:10px;
                    margin-bottom:30px;
                    background:transparent;
                    color:var(--primary-color);
                    border:1px dashed var(--primary-color);
                "
            >
                <i class="ph ph-plus"></i>
                添加自定义规则
            </button>
        `;
    },

    renderShop() {
        const contentEl =
            document.getElementById('app-window-content');

        if (!contentEl) return;

        let coins =
            localStorage.getItem('my_coins') || '500';

        const currentTag =
            window.Config.currentShopTag ||
            '日常用品';

        let customTags =
            JSON.parse(
                localStorage.getItem('shop_custom_tags') ||
                '[]'
            );

        const defaultTags = [
            '日常用品',
            '奇葩服装',
            '赛博外卖',
            '真心话道具'
        ];

        const allTags = [
            ...defaultTags,
            ...customTags
        ];

        let tagsHtml = '';

        allTags.forEach(tag => {
            const activeClass =
                tag === currentTag
                    ? 'active'
                    : '';

            tagsHtml += `
                <div
                    class="shop-tag ${activeClass}"
                    onclick="
                        window.PhoneEngine.switchShopTag(
                            '${this.escapeHtml(tag)}'
                        )
                    "
                >
                    ${this.escapeHtml(tag)}
                </div>
            `;
        });

        const tagData =
            JSON.parse(
                localStorage.getItem('shop_all_data') ||
                '{}'
            );

        const shopItems =
            tagData[currentTag] || [];

        let gridHtml = '';

        if (shopItems.length === 0) {

            gridHtml = `
                <div
                    style="
                        text-align:center;
                        padding:40px 0;
                        color:var(--text-sub);
                    "
                >
                    货架空空如也，点击右上角进货吧！
                </div>
            `;

        } else {

            shopItems.forEach((item, idx) => {

                gridHtml += `
                    <div
                        class="shop-item"
                        onclick="
                            window.PhoneUI.openShopDetail(${idx})
                        "
                    >
                        <div class="shop-item-icon">
                            <i
                                class="${item.icon || 'ph-fill ph-package'}"
                            ></i>
                        </div>

                        <div class="shop-item-info">

                            <div class="shop-item-name">
                                ${this.escapeHtml(item.name)}
                            </div>

                            <div class="shop-item-desc">
                                ${this.escapeHtml(item.desc)}
                            </div>

                            <div class="shop-item-bottom">

                                <div class="shop-item-price">
                                    <i class="ph-fill ph-coin"></i>
                                    ${item.price}
                                </div>

                                <button
                                    class="shop-item-add"
                                    onclick="
                                        event.stopPropagation();
                                        window.PhoneEngine.addToCart(${idx})
                                    "
                                >
                                    <i class="ph ph-plus"></i>
                                </button>

                            </div>
                        </div>
                    </div>
                `;
            });
        }

        const cart =
            JSON.parse(
                localStorage.getItem('shopping_cart') ||
                '[]'
            );

        const badgeHtml =
            cart.length > 0
                ? `
                    <div
                        class="cart-badge"
                        id="cart-badge"
                    >
                        ${cart.length}
                    </div>
                `
                : `
                    <div
                        class="cart-badge"
                        id="cart-badge"
                        style="display:none;"
                    >
                        0
                    </div>
                `;

        contentEl.innerHTML = `
            <div class="shop-header">

                <div class="shop-title">
                    深夜杂货铺
                </div>

                <div class="shop-actions">

                    <div
                        style="
                            background:rgba(244,162,97,0.15);
                            color:#e76f51;
                            padding:6px 12px;
                            border-radius:20px;
                            font-weight:bold;
                            display:flex;
                            align-items:center;
                            gap:4px;
                            font-size:14px;
                        "
                    >
                        <i class="ph-fill ph-coin"></i>

                        <span id="coin-display">
                            ${coins}
                        </span>
                    </div>

                    <div
                        class="shop-cart-btn"
                        onclick="
                            window.PhoneUI.openCartModal()
                        "
                    >
                        <i class="ph ph-shopping-cart"></i>
                        ${badgeHtml}
                    </div>

                    <div
                        class="shop-cart-btn"
                        onclick="
                            window.PhoneEngine.refreshShop()
                        "
                        style="color:var(--primary-color);"
                    >
                        <i class="ph ph-arrows-clockwise"></i>
                    </div>

                </div>
            </div>

            <div class="shop-tags-container">

                <div class="shop-tags">
                    ${tagsHtml}
                </div>

                <div
                    class="shop-tag-add"
                    onclick="
                        window.PhoneEngine.addCustomShopTag()
                    "
                >
                    <i class="ph ph-plus"></i>
                </div>
            </div>

            <div
                class="shop-grid"
                id="shop-grid"
            >
                ${gridHtml}
            </div>

            <div
                id="cart-modal-bg"
                class="action-sheet-bg"
                onclick="
                    window.PhoneUI.closeCartModal()
                "
            ></div>

            <div
                id="cart-modal"
                class="cart-modal"
            >
                <div class="cart-header">
                    <span>购物车</span>

                    <i
                        class="ph ph-x"
                        style="
                            cursor:pointer;
                            color:var(--text-sub);
                        "
                        onclick="
                            window.PhoneUI.closeCartModal()
                        "
                    ></i>
                </div>

                <div
                    class="cart-list"
                    id="cart-list"
                ></div>

                <div class="cart-footer">

                    <div class="cart-total">
                        <span>合计：</span>

                        <span style="color:#e76f51;">
                            <i class="ph-fill ph-coin"></i>

                            <span id="cart-total-price">
                                0
                            </span>
                        </span>
                    </div>

                    <div class="cart-btn-group">

                        <button
                            class="cart-btn share"
                            onclick="
                                window.PhoneEngine.checkoutCart(true)
                            "
                        >
                            <i class="ph-fill ph-share-network"></i>
                            发给老公代付
                        </button>

                        <button
                            class="cart-btn pay"
                            onclick="
                                window.PhoneEngine.checkoutCart(false)
                            "
                        >
                            <i class="ph-fill ph-wallet"></i>
                            余额买单
                        </button>

                    </div>
                </div>
            </div>

            <div
                id="shop-detail-bg"
                class="action-sheet-bg"
                onclick="
                    window.PhoneUI.closeShopDetail()
                "
            ></div>

            <div
                id="shop-detail-modal"
                class="thought-modal"
                style="
                    padding:0;
                    overflow:hidden;
                    max-height:90vh;
                "
            >
                <div
                    style="
                        background:var(--bg-gradient-start);
                        padding:40px 20px;
                        text-align:center;
                        position:relative;
                    "
                >
                    <div
                        style="
                            font-size:64px;
                            color:var(--primary-color);
                        "
                        id="detail-icon"
                    >
                        <i class="ph-fill ph-package"></i>
                    </div>

                    <i
                        class="ph-fill ph-x-circle"
                        style="
                            position:absolute;
                            top:15px;
                            right:15px;
                            font-size:28px;
                            color:rgba(0,0,0,0.2);
                            cursor:pointer;
                        "
                        onclick="
                            window.PhoneUI.closeShopDetail()
                        "
                    ></i>
                </div>

                <div style="padding:25px 20px;">

                    <h2
                        style="
                            color:var(--text-main);
                            margin-bottom:10px;
                        "
                        id="detail-name"
                    >
                        商品名称
                    </h2>

                    <div
                        style="
                            color:#e76f51;
                            font-size:24px;
                            font-weight:bold;
                            margin-bottom:15px;
                        "
                    >
                        <i class="ph-fill ph-coin"></i>

                        <span id="detail-price">
                            0
                        </span>
                    </div>

                    <p
                        style="
                            color:var(--text-sub);
                            font-size:14px;
                            line-height:1.6;
                            margin-bottom:25px;
                            text-align:left;
                        "
                        id="detail-desc"
                    >
                        商品描述详情
                    </p>

                    <button
                        class="btn-refresh"
                        id="detail-add-btn"
                        style="
                            margin-top:0;
                            border-radius:16px;
                            padding:15px;
                        "
                    >
                        <i class="ph ph-shopping-cart"></i>
                        加入购物车
                    </button>
                </div>
            </div>
        `;
    },

    openShopDetail(index) {
        const tag =
            window.Config.currentShopTag ||
            '日常用品';

        const allShopData =
            JSON.parse(
                localStorage.getItem('shop_all_data') ||
                '{}'
            );

        const shopItems =
            allShopData[tag] || [];

        const item =
            shopItems[index];

        if (!item) return;

        const iconEl =
            document.getElementById('detail-icon');

        const nameEl =
            document.getElementById('detail-name');

        const priceEl =
            document.getElementById('detail-price');

        const descEl =
            document.getElementById('detail-desc');

        const addBtn =
            document.getElementById('detail-add-btn');

        if (
            !iconEl ||
            !nameEl ||
            !priceEl ||
            !descEl ||
            !addBtn
        ) {
            return;
        }

        iconEl.innerHTML = `
            <i
                class="${item.icon || 'ph-fill ph-package'}"
            ></i>
        `;

        nameEl.innerText =
            item.name || '商品名称';

        priceEl.innerText =
            item.price ?? 0;

        descEl.innerText =
            item.desc || '';

        addBtn.onclick = () => {
            window.PhoneEngine.addToCart(index);
            this.closeShopDetail();
        };

        const bg =
            document.getElementById('shop-detail-bg');

        const modal =
            document.getElementById('shop-detail-modal');

        if (bg) bg.classList.add('show');
        if (modal) modal.classList.add('show');
    },

    closeShopDetail() {
        const bg =
            document.getElementById('shop-detail-bg');

        const modal =
            document.getElementById('shop-detail-modal');

        if (bg) bg.classList.remove('show');
        if (modal) modal.classList.remove('show');
    },

    openCartModal() {
        this.renderCartList();

        const bg =
            document.getElementById('cart-modal-bg');

        const modal =
            document.getElementById('cart-modal');

        if (bg) bg.classList.add('show');
        if (modal) modal.classList.add('show');
    },

    closeCartModal() {
        const bg =
            document.getElementById('cart-modal-bg');

        const modal =
            document.getElementById('cart-modal');

        if (bg) bg.classList.remove('show');
        if (modal) modal.classList.remove('show');
    },

    renderCartList() {
        const cart =
            JSON.parse(
                localStorage.getItem('shopping_cart') ||
                '[]'
            );

        const listEl =
            document.getElementById('cart-list');

        const totalEl =
            document.getElementById('cart-total-price');

        if (!listEl || !totalEl) return;

        if (cart.length === 0) {
            listEl.innerHTML = `
                <div
                    style="
                        text-align:center;
                        color:var(--text-sub);
                        padding:20px 0;
                    "
                >
                    购物车是空的哦~
                </div>
            `;

            totalEl.innerText = '0';

            return;
        }

        let html = '';
        let total = 0;

        cart.forEach((item, idx) => {

            const price =
                parseInt(item.price, 10) || 0;

            total += price;

            html += `
                <div class="cart-item">

                    <div class="cart-item-icon">
                        <i
                            class="${item.icon || 'ph-fill ph-package'}"
                        ></i>
                    </div>

                    <div class="cart-item-info">

                        <div class="cart-item-name">
                            ${this.escapeHtml(item.name)}
                        </div>

                        <div class="cart-item-price">
                            <i class="ph-fill ph-coin"></i>
                            ${price}
                        </div>

                    </div>

                    <div
                        class="cart-item-del"
                        onclick="
                            window.PhoneEngine.removeFromCart(${idx})
                        "
                    >
                        <i class="ph ph-minus-circle"></i>
                    </div>

                </div>
            `;
        });

        listEl.innerHTML = html;

        totalEl.innerText = total;
    },

    renderGallery() {
        const contentEl =
            document.getElementById('app-window-content');

        if (!contentEl) return;

        const roleId =
            window.Config.currentContactId;

        const items =
            window.Config.phoneData?.[roleId]?.gallery?.items ||
            [];

        let html = `
            <button
                class="btn-refresh"
                onclick="
                    window.PhoneEngine.generateAiImage()
                "
                style="
                    margin-top:0;
                    margin-bottom:15px;
                    border-radius:16px;
                    background:linear-gradient(
                        135deg,
                        #a78bfa,
                        #8b5cf6
                    );
                    box-shadow:
                        0 5px 15px
                        rgba(139,92,246,0.3);
                "
            >
                <i class="ph-fill ph-magic-wand"></i>
                生成新照片
            </button>

            <div
                id="image-viewer"
                class="image-viewer"
            >
                <div
                    class="viewer-close"
                    onclick="
                        window.PhoneUI.closeImageViewer()
                    "
                >
                    <i class="ph ph-x"></i>
                </div>

                <div
                    class="viewer-download"
                    onclick="
                        window.PhoneUI.downloadCurrentImage()
                    "
                >
                    <i class="ph ph-download-simple"></i>
                    保存到手机
                </div>

                <img
                    id="viewer-img"
                    src=""
                >
            </div>
        `;

        if (items.length === 0) {

            html += `
                <div
                    style="
                        text-align:center;
                        padding:50px 0;
                        color:var(--text-sub);
                    "
                >
                    <i
                        class="ph-fill ph-images"
                        style="
                            font-size:48px;
                            color:var(--border-color);
                            margin-bottom:10px;
                        "
                    ></i>

                    <br>
                    相册空空如也，快去生成第一张合照吧！
                </div>
            `;

        } else {

            html += `
                <div class="gallery-grid">
            `;

            [...items].reverse().forEach(img => {

                const safeSrc =
                    this.escapeHtml(img.content || '');

                const safeId =
                    this.escapeHtml(img.id || '');

                html += `
                    <div
                        class="gallery-item"
                        onclick="
                            window.PhoneUI.openImageViewer(
                                '${safeSrc}'
                            )
                        "
                    >
                        <img
                            src="${safeSrc}"
                        >

                        <div
                            class="gallery-del-btn"
                            onclick="
                                event.stopPropagation();
                                window.PhoneEngine.deleteGalleryImage(
                                    '${safeId}'
                                )
                            "
                        >
                            <i class="ph ph-trash"></i>
                        </div>
                    </div>
                `;
            });

            html += '</div>';
        }

        contentEl.innerHTML = html;
    },

    openImageViewer(src) {
        const viewer =
            document.getElementById('image-viewer');

        const img =
            document.getElementById('viewer-img');

        if (viewer && img) {
            img.src = src;
            viewer.classList.add('show');
        }
    },

    closeImageViewer() {
        const viewer =
            document.getElementById('image-viewer');

        if (viewer) {
            viewer.classList.remove('show');
        }
    },

    downloadCurrentImage() {
        const img =
            document.getElementById('viewer-img');

        if (!img || !img.src) return;

        const a =
            document.createElement('a');

        a.href = img.src;

        a.download =
            'Claire_Claude_Photo_' +
            Date.now() +
            '.jpg';

        document.body.appendChild(a);

        a.click();

        document.body.removeChild(a);

        window.PhoneAPI?.showToast(
            '✅ 图片已保存到手机！'
        );
    },

    closeApp() {
        const winEl =
            document.getElementById('app-window');

        if (winEl) {
            winEl.classList.remove('open');
            winEl.classList.remove('fullscreen-mode');
        }

        window.Config.currentAppId = 'wechat';
    },

    switchVaultTab(tabName) {
        window.Config.memoryVaultTab = tabName;

        document
            .querySelectorAll('.vault-tab')
            .forEach(el => {
                el.classList.remove('active');
            });

        const activeTab =
            document.getElementById(
                'tab-' + tabName
            );

        if (activeTab) {
            activeTab.classList.add('active');
        }

        this.renderMemoryVault();
    },

    renderMemoryVault() {
        const contentArea =
            document.getElementById(
                'vault-content-area'
            );

        if (!contentArea) return;

        const currentTab =
            window.Config.memoryVaultTab ||
            'wechat';

        const allVault =
            window.PhoneAPI?.getMemoryVault?.() ||
            [];

        let renderItems = [];

        if (currentTab === 'core') {

            renderItems =
                allVault.filter(
                    v => v.isCore
                );

        } else if (currentTab === 'wechat') {

            renderItems =
                allVault.filter(
                    v =>
                        !v.isCore &&
                        v.source === '线上微信'
                );

        } else if (currentTab === 'novel') {

            renderItems =
                allVault.filter(
                    v =>
                        !v.isCore &&
                        v.source === '线下故事'
                );
        }

        if (renderItems.length === 0) {
            contentArea.innerHTML = `
                <div
                    style="
                        text-align:center;
                        color:var(--text-sub);
                        padding:50px 0;
                    "
                >
                    空空如也，快去创造回忆吧！
                </div>
            `;

            return;
        }

        let html =
            '<div class="vine-container">';

        [...renderItems].reverse().forEach(item => {

            const isCore =
                item.isCore;

            const nodeClass =
                isCore
                    ? 'vine-node core'
                    : 'vine-node';

            const iconHtml =
                isCore
                    ? '<i class="ph-fill ph-star"></i>'
                    : '<i class="ph-fill ph-flower-tulip"></i>';

            let content =
                item.content || '';

            if (window.marked) {
                content =
                    window.marked.parse(content);
            }

            const leafTop =
                Math.random() * 80 + 10;

            const leafLeft =
                -25 + Math.random() * 10;

            const leafRot =
                Math.random() * 360;

            const leafHtml = `
                <i
                    class="ph-fill ph-leaf vine-leaf"
                    style="
                        top:${leafTop}%;
                        left:${leafLeft}px;
                        transform:rotate(${leafRot}deg);
                    "
                ></i>
            `;

            html += `
                <div class="vine-item">

                    <div class="${nodeClass}">
                        ${iconHtml}
                    </div>

                    ${leafHtml}

                    <div class="vine-content">

                        <div class="vine-header">
                            <span
                                style="
                                    font-weight:bold;
                                    color:var(--primary-color);
                                "
                            >
                                ${this.escapeHtml(item.date)}
                            </span>

                            <span>
                                ${this.escapeHtml(item.time)}
                            </span>
                        </div>

                        <div class="vine-text">
                            ${content}
                        </div>

                        <div class="vine-actions">

                            <div
                                class="vine-btn core-btn"
                                onclick="
                                    window.PhoneAPI.toggleCoreMemory(
                                        '${this.escapeHtml(item.id)}'
                                    )
                                "
                            >
                                ${
                                    isCore
                                        ? '<i class="ph-fill ph-star"></i>'
                                        : '<i class="ph ph-star"></i>'
                                }
                            </div>

                            <div
                                class="vine-btn edit"
                                onclick="
                                    window.PhoneAPI.editMemoryVault(
                                        '${this.escapeHtml(item.id)}'
                                    )
                                "
                            >
                                <i class="ph ph-pencil-simple"></i>
                            </div>

                            <div
                                class="vine-btn del"
                                onclick="
                                    window.PhoneAPI.deleteFromMemoryVault(
                                        '${this.escapeHtml(item.id)}'
                                    )
                                "
                            >
                                <i class="ph ph-trash"></i>
                            </div>

                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';

        contentArea.innerHTML = html;
    },

    unlockDiary() {
        const cover =
            document.getElementById(
                'diary-book-cover'
            );

        const coverView =
            document.getElementById(
                'diary-cover-view'
            );

        const insideView =
            document.getElementById(
                'diary-inside-view'
            );

        if (
            cover &&
            coverView &&
            insideView
        ) {
            cover.classList.add('opened');
            coverView.classList.add('opened');
            insideView.classList.add('opened');
        }
    },

    touchStartX: 0,

    handleSwipeStart(e) {
        if (
            e &&
            e.changedTouches &&
            e.changedTouches[0]
        ) {
            this.touchStartX =
                e.changedTouches[0].screenX;
        }
    },

    handleSwipeEnd(e) {
        if (
            !e ||
            !e.changedTouches ||
            !e.changedTouches[0]
        ) {
            return;
        }

        const touchEndX =
            e.changedTouches[0].screenX;

        const diff =
            touchEndX - this.touchStartX;

        if (diff > 50) {
            this.turnDiaryPage(-1);

        } else if (diff < -50) {
            this.turnDiaryPage(1);
        }
    },

    renderDiaryPage() {
        const contentAreaEl =
            document.getElementById(
                'diary-content-area'
            );

        if (!contentAreaEl) return;

        const currentIndex =
            window.Config.diaryPageIndex;

        if (currentIndex === -1) {

            const quote =
                localStorage.getItem('diary_quote') ||
                '“时间会磨平一切痕迹，\n除了我为你写下的字。”';

            const formattedQuote =
                quote
                    .replace(/\\n/g, '<br>')
                    .replace(/\n/g, '<br>');

            contentAreaEl.innerHTML = `
                <div
                    class="notebook-scroll-area"
                    style="
                        display:flex;
                        justify-content:center;
                        align-items:center;
                        height:100%;
                    "
                >
                    <div class="notebook-empty">

                        <i
                            class="ph-fill ph-feather"
                            style="
                                font-size:48px;
                                color:rgba(0,0,0,0.3);
                                margin-bottom:30px;
                            "
                        ></i>

                        <div
                            style="
                                font-family:
                                    'Long Cang',
                                    'Kaiti',
                                    'STKaiti',
                                    cursive;
                                font-size:32px;
                                color:rgba(0,0,0,0.6);
                                text-shadow:
                                    1px 1px 2px
                                    rgba(255,255,255,0.5);
                                line-height:1.8;
                            "
                        >
                            ${formattedQuote}
                        </div>

                    </div>
                </div>
            `;

            return;
        }

        const startDateStr =
            localStorage.getItem(
                'diary_start_date'
            );

        let startDate;

        if (startDateStr) {

            const parts =
                startDateStr.split('-');

            startDate =
                new Date(
                    parts[0],
                    parts[1] - 1,
                    parts[2]
                );

        } else {
            startDate = new Date();
        }

        const targetDate =
            new Date(startDate);

        targetDate.setDate(
            startDate.getDate() +
            currentIndex
        );

        const y =
            targetDate.getFullYear();

        const m =
            String(
                targetDate.getMonth() + 1
            ).padStart(2, '0');

        const d =
            String(
                targetDate.getDate()
            ).padStart(2, '0');

        const dateStr =
            `${y}-${m}-${d}`;

        const weekDays = [
            '日',
            '一',
            '二',
            '三',
            '四',
            '五',
            '六'
        ];

        const weekStr =
            '星期' +
            weekDays[targetDate.getDay()];

        const displayDate =
            `${y}年${m}月${d}日`;

        const diaries =
            window.PhoneAPI?.getDiaries?.() ||
            {};

        const content =
            diaries[dateStr];

        let html = `
            <div class="notebook-scroll-area">

                <div class="notebook-header">

                    <div class="notebook-date-wrap">

                        <span class="notebook-date">
                            ${displayDate}
                        </span>

                        <span class="notebook-week">
                            ${weekStr}
                        </span>

                    </div>

                    <div
                        style="
                            display:flex;
                            align-items:center;
                            gap:12px;
                        "
                    >

                        ${
                            content
                                ? `
                                    <i
                                        class="ph ph-arrows-clockwise"
                                        onclick="
                                            if(confirm(
                                                '确定要撕掉这页日记重新写吗？'
                                            ))
                                            window.PhoneEngine.generateDiary(
                                                '${dateStr}'
                                            )
                                        "
                                        style="
                                            font-size:20px;
                                            color:var(--text-sub);
                                            cursor:pointer;
                                            transition:0.2s;
                                        "
                                    ></i>
                                `
                                : ''
                        }

                        <div class="notebook-mood">
                            ☁️
                        </div>

                    </div>
                </div>
        `;

        if (content) {

            const parsedContent =
                window.marked
                    ? window.marked.parse(content)
                    : content;

            html += `
                <div class="notebook-content">
                    ${parsedContent}
                </div>
                </div>
            `;

        } else {

            html += `
                <div
                    class="notebook-empty"
                    style="height:60vh;"
                >
                    <p style="margin-bottom:20px;">
                        这一页还是空白的...
                    </p>

                    <button
                        class="btn-refresh"
                        onclick="
                            window.PhoneEngine.generateDiary(
                                '${dateStr}'
                            )
                        "
                        style="
                            width:auto;
                            padding:10px 20px;
                            background:rgba(0,0,0,0.6);
                            border-radius:8px;
                            font-family:sans-serif;
                            font-size:14px;
                        "
                    >
                        <i class="ph-fill ph-magic-wand"></i>
                        偷偷写日记
                    </button>
                </div>
            </div>
            `;
        }

        html += `
            <div class="page-turner">

                <div
                    class="page-btn"
                    onclick="
                        window.PhoneUI.turnDiaryPage(-1)
                    "
                >
                    <i class="ph ph-caret-left"></i>
                </div>

                <div
                    class="page-btn"
                    onclick="
                        window.PhoneUI.turnDiaryPage(1)
                    "
                >
                    <i class="ph ph-caret-right"></i>
                </div>

            </div>
        `;

        contentAreaEl.innerHTML = html;
    },

    turnDiaryPage(direction) {
        let newIndex =
            window.Config.diaryPageIndex +
            direction;

        if (newIndex < -1) {
            newIndex = -1;
        }

        window.Config.diaryPageIndex =
            newIndex;

        this.renderDiaryPage();
    },

    initStarrySea() {
        const bgEl =
            document.getElementById(
                'starry-sea-bg'
            );

        const bubblesEl =
            document.getElementById(
                'floating-bubbles'
            );

        const fragmentsContainer =
            document.getElementById(
                'memory-fragments-container'
            );

        if (
            !bgEl ||
            !bubblesEl ||
            !fragmentsContainer
        ) {
            return;
        }

        setTimeout(() => {
            bgEl.classList.add('show');
            bubblesEl.classList.add('show');
        }, 100);

        let starsHtml = '';

        for (let i = 0; i < 50; i++) {

            const size =
                Math.random() * 3 + 1;

            const top =
                Math.random() * 100;

            const left =
                Math.random() * 100;

            const delay =
                Math.random() * 5;

            const duration =
                Math.random() * 3 + 2;

            starsHtml += `
                <div
                    class="star"
                    style="
                        width:${size}px;
                        height:${size}px;
                        top:${top}%;
                        left:${left}%;
                        animation-delay:${delay}s;
                        animation-duration:${duration}s;
                    "
                ></div>
            `;
        }

        bgEl.innerHTML = starsHtml;

        const validMemories =
            window.PhoneAPI?.getFavorites?.() ||
            [];

        fragmentsContainer.innerHTML = '';

        if (validMemories.length === 0) {

            const frag =
                document.createElement('div');

            frag.className =
                'memory-fragment';

            frag.style.cssText =
                'top:50%; left:50%; animation-delay:0s;';

            frag.onclick = () =>
                this.openBlindBox(
                    "星海空空如也...快去聊天记录里长按消息，点击【手动摘录】或【AI提炼】来收集星星吧！",
                    "系统提示",
                    "星海",
                    "me"
                );

            fragmentsContainer.appendChild(frag);

        } else {

            const shuffled =
                [...validMemories].sort(
                    () => 0.5 - Math.random()
                );

            const selected =
                shuffled.slice(0, 12);

            selected.forEach(mem => {

                const top =
                    15 + Math.random() * 65;

                const left =
                    10 + Math.random() * 80;

                const delay =
                    Math.random() * 2;

                const safeContent =
                    String(mem.content || '');

                const frag =
                    document.createElement('div');

                frag.className =
                    'memory-fragment';

                frag.style.cssText =
                    `
                        top:${top}%;
                        left:${left}%;
                        animation-delay:${delay}s;
                    `;

                frag.onclick = () =>
                    this.openBlindBox(
                        safeContent,
                        mem.time,
                        mem.source,
                        mem.sender
                    );

                fragmentsContainer.appendChild(
                    frag
                );
            });
        }
    },

    openBlindBox(
        content,
        time,
        source,
        sender
    ) {
        const modal =
            document.getElementById(
                'blindbox-modal'
            );

        const bg =
            document.getElementById(
                'blindbox-bg'
            );

        const textEl =
            document.getElementById(
                'blindbox-text'
            );

        const metaEl =
            document.getElementById(
                'blindbox-meta'
            );

        if (
            !modal ||
            !bg ||
            !textEl ||
            !metaEl
        ) {
            return;
        }

        const myName =
            localStorage.getItem('my_name') ||
            '我';

        const charName =
            localStorage.getItem('char_name') ||
            'TA';

        const senderName =
            sender === 'me'
                ? myName
                : charName;

        let parsed =
            window.marked
                ? window.marked.parse(
                    content || ''
                )
                : (content || '');

        textEl.innerHTML =
            `“${parsed}”`;

        metaEl.innerHTML =
            `${this.escapeHtml(time || '某时')} · ${this.escapeHtml(source || '')} · ${this.escapeHtml(senderName)}`;

        bg.classList.add('show');
        modal.classList.add('show');
    },

    closeBlindBox() {
        const bg =
            document.getElementById(
                'blindbox-bg'
            );

        const modal =
            document.getElementById(
                'blindbox-modal'
            );

        if (bg) {
            bg.classList.remove('show');
        }

        if (modal) {
            modal.classList.remove('show');
        }
    },

    /*
     * ============================================================
     * 心声系统
     * ============================================================
     */
    showThought(index, forceApp) {

        const roleId =
            window.Config?.currentContactId;

        if (!roleId) {
            console.warn(
                '[PhoneUI.showThought] 当前没有联系人'
            );
            return;
        }

        const targetApp =
            forceApp ||
            (
                window.Config.currentAppId === 'novel'
                    ? 'novel'
                    : 'wechat'
            );

        const appData =
            window.Config.phoneData?.[roleId]?.[targetApp];

        if (
            !appData ||
            !Array.isArray(appData.items)
        ) {
            console.warn(
                '[PhoneUI.showThought] 找不到应用数据:',
                {
                    roleId,
                    targetApp
                }
            );

            return;
        }

        const realIndex =
            Number(index);

        if (
            !Number.isInteger(realIndex) ||
            realIndex < 0 ||
            realIndex >= appData.items.length
        ) {
            console.warn(
                '[PhoneUI.showThought] 无效消息索引:',
                {
                    index,
                    realIndex,
                    total:
                        appData.items.length
                }
            );

            return;
        }

        let item =
            appData.items[realIndex];

        if (!item) return;

        let thought =
            item.innerThought;

        if (
            thought &&
            typeof thought === 'string' &&
            thought.includes('连发消息')
        ) {

            for (
                let i = realIndex - 1;
                i >= 0;
                i--
            ) {

                const prevItem =
                    appData.items[i];

                if (!prevItem) continue;

                if (
                    prevItem.sender === 'other' &&
                    prevItem.time === item.time &&
                    prevItem.innerThought &&
                    typeof prevItem.innerThought === 'string' &&
                    !prevItem.innerThought.includes('连发消息')
                ) {
                    thought =
                        prevItem.innerThought;

                    break;
                }
            }
        }

        if (
            !thought ||
            !String(thought).trim()
        ) {

            for (
                let i = realIndex;
                i >= 0;
                i--
            ) {

                const prevItem =
                    appData.items[i];

                if (!prevItem) continue;

                if (
                    prevItem.sender === 'other' &&
                    prevItem.innerThought &&
                    typeof prevItem.innerThought === 'string' &&
                    prevItem.innerThought.trim()
                ) {
                    thought =
                        prevItem.innerThought;

                    break;
                }
            }
        }

        const contentEl =
            document.getElementById(
                'thought-content'
            );

        const bgEl =
            document.getElementById(
                'thought-bg'
            );

        const modalEl =
            document.getElementById(
                'thought-modal'
            );

        if (
            !contentEl ||
            !bgEl ||
            !modalEl
        ) {
            console.warn(
                '[PhoneUI.showThought] 找不到心声弹窗 DOM'
            );

            return;
        }

        contentEl.innerText =
            thought &&
            String(thought).trim()
                ? String(thought)
                : '（TA的心思藏得很深，什么也没看出来...）';

        bgEl.classList.add('show');
        modalEl.classList.add('show');
    },

    closeThought() {
        const bgEl = document.getElementById('thought-bg');
        const modalEl = document.getElementById('thought-modal');
        if (bgEl) bgEl.classList.remove('show');
        if (modalEl) modalEl.classList.remove('show');
    },

    fillPresetData() {
        const select = document.getElementById('preset-delete-select');
        if (!select || !select.value) return;

        const presetId = select.value;
        const presets = JSON.parse(localStorage.getItem('ai_api_presets') || '[]');
        const preset = presets.find(p => p.id === presetId);

        if (preset) {
            document.getElementById('preset-name').value = preset.name || '';
            document.getElementById('preset-url').value = preset.url || '';
            document.getElementById('preset-key').value = preset.key || '';
            document.getElementById('preset-model').value = preset.model || '';
            window.PhoneAPI?.showToast('✏️ 已加载预设，修改后点击保存即可覆盖');
        }
    }
};
