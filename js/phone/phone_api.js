export const PhoneAPI = {
// 🌟 你的专属 Supabase 云端数据库凭证
SUPABASE_URL: 'https://kkzztqbxjzskrsapiils.supabase.co',
SUPABASE_KEY: 'sb_publishable_h1SIixE2PCM2hrjXvt1I4w_eKYSQCE0',

showToast(msg) {
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toast-msg');
if (toast && toastMsg) {
toastMsg.innerText = msg;
toast.classList.add('show');
setTimeout(() => { toast.classList.remove('show'); }, 3000);
} else {
console.log("[Toast]:", msg);
}
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

saveIfExist('global-font', 'global_font'); 
saveIfExist('global-font-url', 'global_font_url'); 

saveIfExist('love-start-date', 'love_start_date');
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
if (charName && myName) {
const titleEl = document.getElementById('top-title');
if (titleEl) titleEl.innerText = `${myName} & ${charName}`;
}
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

setVal('global-font', localStorage.getItem('global_font') || ''); 
setVal('global-font-url', localStorage.getItem('global_font_url') || ''); 

setVal('diary-title', localStorage.getItem('diary_title') || 'His Diary');
setVal('diary-quote', localStorage.getItem('diary_quote') || '“时间会磨平一切痕迹，\n除了我为你写下的字。”');
const today = new Date(); const defaultDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
setVal('diary-start-date', localStorage.getItem('diary_start_date') || defaultDate);
setVal('love-start-date', localStorage.getItem('love_start_date') || defaultDate);
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
if (savedCharName && savedMyName) {
const titleEl = document.getElementById('top-title');
if (titleEl) titleEl.innerText = `${savedMyName} & ${savedCharName}`;
}
} catch (error) { console.error("加载设置失败:", error); }
},

applyUITheme() {
const globalBg = localStorage.getItem('bg_global'); const chatBg = localStorage.getItem('bg_chat');
const diaryCover = localStorage.getItem('bg_diary_cover'); const diaryPage = localStorage.getItem('bg_diary_page');
const fontUrl = localStorage.getItem('global_font_url');
const fontFamily = localStorage.getItem('global_font') || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

let styleEl = document.getElementById('custom-font-style');
if (fontUrl && fontUrl.trim() !== '') {
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'custom-font-style';
        document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = `@font-face { font-family: 'MyCustomFont'; src: url('${fontUrl.trim()}'); font-display: swap; }`;
    document.documentElement.style.setProperty('--global-font', `'MyCustomFont', ${fontFamily}`);
} else {
    if (styleEl) styleEl.remove();
    document.documentElement.style.setProperty('--global-font', fontFamily);
}

if (globalBg) { document.documentElement.style.setProperty('--bg-image-global', `url('${globalBg}')`); } else { document.documentElement.style.removeProperty('--bg-image-global'); }
if (chatBg) { document.documentElement.style.setProperty('--bg-image-chat', `url('${chatBg}')`); } else { document.documentElement.style.removeProperty('--bg-image-chat'); }
if (diaryCover) { document.documentElement.style.setProperty('--bg-image-diary-cover', `url('${diaryCover}')`); } else { document.documentElement.style.removeProperty('--bg-image-diary-cover'); }
if (diaryPage) { document.documentElement.style.setProperty('--bg-image-diary-page', `url('${diaryPage}')`); } else { document.documentElement.style.removeProperty('--bg-image-diary-page'); }

const icons = [ { id: 'novel', default: '<i class="ph-fill ph-book-open" style="color: var(--text-sub);"></i>' }, { id: 'worldbook', default: '<i class="ph-fill ph-globe-hemisphere-west" style="color: var(--primary-color);"></i>' }, { id: 'settings', default: '<i class="ph-fill ph-gear" style="color: var(--primary-color);"></i>' }, { id: 'shop', default: '<i class="ph-fill ph-storefront" style="color: #f4a261;"></i>' }, { id: 'task', default: '<i class="ph-fill ph-check-square-offset" style="color: #2a9d8f;"></i>' } ];
icons.forEach(item => {
const el = document.getElementById(`home-icon-${item.id}`);
if (el) {
const customUrl = localStorage.getItem(`ui_icon_${item.id}`);
if (customUrl) {
el.innerHTML = `<img src="${customUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:18px;">`;
el.style.background = 'transparent';
el.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
} else {
el.innerHTML = item.default;
el.style.background = 'var(--icon-bg)';
el.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
}
}
});
},

// 🌟 核心新增 1：网易云 API 搜歌 (多节点防挂版)
async searchMusic(keyword) {
    this.showToast("🎵 正在云端检索歌曲...");
    try {
        // 准备多个公共 API 节点防挂
        const apis = [
            `https://netease-cloud-music-api-teal-roan.vercel.app/search?keywords=${encodeURIComponent(keyword)}&limit=1`,
            `https://music.cyfan.top/search?keywords=${encodeURIComponent(keyword)}&limit=1`,
            `https://api.injahow.cn/meting/?type=search&search=${encodeURIComponent(keyword)}`
        ];

        let data = null;
        for (let api of apis) {
            try {
                const res = await fetch(api);
                data = await res.json();
                // 适配不同 API 的返回格式
                if (data.result && data.result.songs && data.result.songs.length > 0) break;
                if (Array.isArray(data) && data.length > 0) {
                    data = { result: { songs: [{ id: data[0].id, name: data[0].name, ar: [{name: data[0].author}], al: {picUrl: data[0].pic} }] } };
                    break;
                }
            } catch(e) { console.log("节点失效，切换备用节点..."); }
        }

        if (data && data.result && data.result.songs && data.result.songs.length > 0) {
            const song = data.result.songs[0];
            return {
                id: song.id,
                name: song.name,
                artist: song.ar ? song.ar.map(a => a.name).join(' / ') : '未知歌手',
                cover: (song.al && song.al.picUrl) ? song.al.picUrl + '?param=300y300' : 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop',
                url: `https://music.163.com/song/media/outer/url?id=${song.id}.mp3` // 网易云官方外链
            };
        }
        throw new Error("未找到歌曲");
    } catch (e) {
        console.error(e);
        this.showToast("❌ 搜歌失败，可能是 VIP 版权限制或网络问题");
        return null;
    }
},

// 🌟 核心新增 2：Supabase 共听状态同步
async syncMusicState(songData) {
    try {
        const headers = { 'apikey': this.SUPABASE_KEY, 'Authorization': `Bearer ${this.SUPABASE_KEY}`, 'Content-Type': 'application/json' };
        const checkRes = await fetch(`${this.SUPABASE_URL}/rest/v1/phone_sync?id=eq.2&select=id`, { headers });
        const checkData = await checkRes.json();
        const payload = { content: JSON.stringify(songData) };
        
        if (checkData && checkData.length > 0) {
            await fetch(`${this.SUPABASE_URL}/rest/v1/phone_sync?id=eq.2`, { method: 'PATCH', headers, body: JSON.stringify(payload) });
        } else {
            await fetch(`${this.SUPABASE_URL}/rest/v1/phone_sync`, { method: 'POST', headers: { ...headers, 'Prefer': 'return=representation' }, body: JSON.stringify({ id: 2, ...payload }) });
        }
    } catch(e) { console.error("同步音乐状态失败", e); }
},

async pullMusicState() {
    try {
        const headers = { 'apikey': this.SUPABASE_KEY, 'Authorization': `Bearer ${this.SUPABASE_KEY}` };
        const res = await fetch(`${this.SUPABASE_URL}/rest/v1/phone_sync?id=eq.2&select=content`, { headers });
        const rows = await res.json();
        if (rows && rows.length > 0 && rows[0].content) {
            return JSON.parse(rows[0].content);
        }
    } catch(e) { console.error("拉取音乐状态失败", e); }
    return null;
},

getUIPresets() { return JSON.parse(localStorage.getItem('ui_presets') || '[]'); },
saveUIPreset() {
const name = prompt('给这套主题装修起个名字吧 (如: 赛博朋克风):'); if (!name) return;
const getVal = (id) => document.getElementById(id)?.value.trim() || '';
const preset = { id: 'ui_' + Date.now(), name: name, bg_global: getVal('bg-global'), bg_chat: getVal('bg-chat'), bg_diary_cover: getVal('bg-diary-cover'), bg_diary_page: getVal('bg-diary-page'), icon_novel: getVal('ui-icon-novel'), icon_worldbook: getVal('ui-icon-worldbook'), icon_settings: getVal('ui-icon-settings'), icon_shop: getVal('ui-icon-shop'), icon_task: getVal('ui-icon-task') };
let presets = this.getUIPresets(); presets = presets.filter(p => p.name !== name); presets.push(preset);
localStorage.setItem('ui_presets', JSON.stringify(presets)); this.refreshUIDropdowns();
const selectEl = document.getElementById('ui-preset-select');
if (selectEl) selectEl.value = preset.id;
this.showToast('💾 UI 主题预设保存成功！');
},
loadUIPreset() {
const selectEl = document.getElementById('ui-preset-select');
if (!selectEl) return;
const id = selectEl.value; if (!id) return;
const preset = this.getUIPresets().find(p => p.id === id);
if (preset) {
const setVal = (domId, val) => { const el = document.getElementById(domId); if(el) el.value = val || ''; };
setVal('bg-global', preset.bg_global); setVal('bg-chat', preset.bg_chat); setVal('bg-diary-cover', preset.bg_diary_cover); setVal('bg-diary-page', preset.bg_diary_page);
setVal('ui-icon-novel', preset.icon_novel); setVal('ui-icon-worldbook', preset.icon_worldbook); setVal('ui-icon-settings', preset.icon_settings); setVal('ui-icon-shop', preset.icon_shop); setVal('ui-icon-task', preset.icon_task);
this.autoSave(); this.showToast('✨ 主题切换成功！');
}
},
deleteUIPreset() {
const selectEl = document.getElementById('ui-preset-select');
if (!selectEl) return;
const id = selectEl.value; if (!id) return alert('请先选择主题！');
if (!confirm('确定删除吗？')) return;
let presets = this.getUIPresets(); presets = presets.filter(p => p.id !== id);
localStorage.setItem('ui_presets', JSON.stringify(presets));
this.refreshUIDropdowns(); this.showToast('🗑️ 主题已删除');
},
refreshUIDropdowns() { const selectEl = document.getElementById('ui-preset-select'); if (!selectEl) return; let optionsHtml = '<option value="">-- 切换 UI 主题预设 --</option>'; this.getUIPresets().forEach(p => { optionsHtml += `<option value="${p.id}">${p.name}</option>`; }); selectEl.innerHTML = optionsHtml; },

getPromptPresets() { return JSON.parse(localStorage.getItem('prompt_presets') || '[]'); },
savePromptPreset() {
const name = prompt('起个名字吧 (如: 不死途-日常):'); if (!name) return;
const getVal = (id) => document.getElementById(id)?.value.trim() || '';
const preset = { id: 'pr_' + Date.now(), name: name, system: getVal('system-prompt'), persona: getVal('char-persona'), novel: getVal('novel-style') };
let presets = this.getPromptPresets(); presets = presets.filter(p => p.name !== name); presets.push(preset);
localStorage.setItem('prompt_presets', JSON.stringify(presets)); this.refreshPromptDropdowns();
const selectEl = document.getElementById('prompt-preset-select');
if (selectEl) selectEl.value = preset.id;
this.showToast('💾 预设保存成功！');
},
loadPromptPreset() {
const selectEl = document.getElementById('prompt-preset-select');
if (!selectEl) return;
const id = selectEl.value; if (!id) return;
const preset = this.getPromptPresets().find(p => p.id === id);
if (preset) {
const setVal = (domId, val) => { const el = document.getElementById(domId); if(el) el.value = val; };
setVal('system-prompt', preset.system); setVal('char-persona', preset.persona); setVal('novel-style', preset.novel);
this.autoSave(); this.showToast('✨ 切换成功！');
}
},
deletePromptPreset() {
const selectEl = document.getElementById('prompt-preset-select');
if (!selectEl) return;
const id = selectEl.value; if (!id) return alert('请先选择预设！');
if (!confirm('确定删除吗？')) return;
let presets = this.getPromptPresets(); presets = presets.filter(p => p.id !== id);
localStorage.setItem('prompt_presets', JSON.stringify(presets));
this.refreshPromptDropdowns(); this.showToast('🗑️ 预设已删除');
},
refreshPromptDropdowns() { const selectEl = document.getElementById('prompt-preset-select'); if (!selectEl) return; let optionsHtml = '<option value="">-- 切换人设预设 --</option>'; this.getPromptPresets().forEach(p => { optionsHtml += `<option value="${p.id}">${p.name}</option>`; }); selectEl.innerHTML = optionsHtml; },

getImgPresets() { return JSON.parse(localStorage.getItem('img_prompt_presets') || '[]'); },
saveImgPreset() {
const name = prompt('给这套画风起个名字吧 (如: NAI-二次元):'); if (!name) return;
const getVal = (id) => document.getElementById(id)?.value.trim() || '';
const preset = { id: 'ipr_' + Date.now(), name: name, base: getVal('img-base-prompt'), neg: getVal('img-negative-prompt') };
let presets = this.getImgPresets(); presets = presets.filter(p => p.name !== name); presets.push(preset);
localStorage.setItem('img_prompt_presets', JSON.stringify(presets)); this.refreshImgDropdowns();
const selectEl = document.getElementById('img-preset-select');
if (selectEl) selectEl.value = preset.id;
this.showToast('💾 画风预设保存成功！');
},
loadImgPreset() {
const selectEl = document.getElementById('img-preset-select');
if (!selectEl) return;
const id = selectEl.value; if (!id) return;
const preset = this.getImgPresets().find(p => p.id === id);
if (preset) {
const setVal = (domId, val) => { const el = document.getElementById(domId); if(el) el.value = val; };
setVal('img-base-prompt', preset.base); setVal('img-negative-prompt', preset.neg);
this.autoSave(); this.showToast('✨ 画风切换成功！');
}
},
deleteImgPreset() {
const selectEl = document.getElementById('img-preset-select');
if (!selectEl) return;
const id = selectEl.value; if (!id) return alert('请先选择预设！');
if (!confirm('确定删除吗？')) return;
let presets = this.getImgPresets(); presets = presets.filter(p => p.id !== id);
localStorage.setItem('img_prompt_presets', JSON.stringify(presets));
this.refreshImgDropdowns(); this.showToast('🗑️ 预设已删除');
},
refreshImgDropdowns() { const selectEl = document.getElementById('img-preset-select'); if (!selectEl) return; let optionsHtml = '<option value="">-- 切换画风预设 --</option>'; this.getImgPresets().forEach(p => { optionsHtml += `<option value="${p.id}">${p.name}</option>`; }); selectEl.innerHTML = optionsHtml; },

getPresets() { return JSON.parse(localStorage.getItem('ai_api_presets') || '[]'); },
savePreset() {
const nameEl = document.getElementById('preset-name');
const urlEl = document.getElementById('preset-url');
const keyEl = document.getElementById('preset-key');
const modelEl = document.getElementById('preset-model');
if (!nameEl || !urlEl || !keyEl || !modelEl) return;

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

deletePreset() {
const selectEl = document.getElementById('preset-delete-select');
if (!selectEl) return;
const id = selectEl.value; if (!id) return alert('请先选择预设！');
if (!confirm('确定删除吗？')) return;
let presets = this.getPresets(); presets = presets.filter(p => p.id !== id);
localStorage.setItem('ai_api_presets', JSON.stringify(presets));
if (localStorage.getItem('main_engine_id') === id) localStorage.removeItem('main_engine_id');
if (localStorage.getItem('sub_engine_id') === id) localStorage.removeItem('sub_engine_id');
this.refreshPresetDropdowns(); this.showToast('🗑️ 预设已删除');
},

refreshPresetDropdowns() {
const presets = this.getPresets();
const delSelect = document.getElementById('preset-delete-select');
const mainSelect = document.getElementById('main-engine-select');
const subSelect = document.getElementById('sub-engine-select');
if (!delSelect || !mainSelect || !subSelect) return;

let optionsHtml = '<option value="">-- 请选择 --</option>';
presets.forEach(p => { optionsHtml += `<option value="${p.id}">${p.name} (${p.model})</option>`; });
delSelect.innerHTML = optionsHtml;
mainSelect.innerHTML = optionsHtml;
subSelect.innerHTML = '<option value="">-- 同主引擎 (自动降级) --</option>' + optionsHtml;
mainSelect.value = localStorage.getItem('main_engine_id') || '';
subSelect.value = localStorage.getItem('sub_engine_id') || '';

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
} else if (type === 'sub') {
localStorage.setItem('sub_engine_id', presetId);
this.showToast('✅ 副引擎分配成功！');
}
},

getEngineConfig(isSub) {
let presetId = isSub ? localStorage.getItem('sub_engine_id') : localStorage.getItem('main_engine_id');
if (isSub && !presetId) presetId = localStorage.getItem('main_engine_id');
if (!presetId) return null;
return this.getPresets().find(p => p.id === presetId);
},

clearChat() {
if(confirm("危险操作：确定要清空所有记录吗？清空后无法恢复！")) {
const roleId = window.Config?.currentContactId;
if(roleId && window.Config?.phoneData?.[roleId]) {
window.Config.phoneData[roleId].wechat = { items: [] };
window.Config.phoneData[roleId].novel = { items: [] };
localStorage.setItem('phone_data', JSON.stringify(window.Config.phoneData));
}
window.PhoneUI?.renderAppContent?.('wechat');
this.showToast("🗑️ 所有记录已清空！");
}
},

getWorldbookData() {
let wb = localStorage.getItem('worldbook_entries');
if (!wb) {
const defaultWb = [
{ id: 'wb1', title: '防八股/去AI味', content: '绝对禁止使用华丽空洞的辞藻堆砌。禁止使用"眼底闪过一丝"、"嘴角勾起一抹"、"空气中弥漫着"等AI惯用套路句式。描写必须具体、写实、接地气。', online: true, offline: true, isCustom: false },
{ id: 'wb2', title: '防抢话机制', content: '绝对禁止替用户做出决定、动作或说话，只描写你自己的反应。', online: true, offline: true, isCustom: false }
];
localStorage.setItem('worldbook_entries', JSON.stringify(defaultWb));
return defaultWb;
}
return JSON.parse(wb);
},

toggleWorldbook(id, type, isChecked) {
let wb = this.getWorldbookData();
let item = wb.find(w => w.id === id);
if (item) {
item[type] = isChecked;
localStorage.setItem('worldbook_entries', JSON.stringify(wb));
}
},

addWorldbook() {
const titleEl = document.getElementById('wb-new-title');
const contentEl = document.getElementById('wb-new-content');
if (!titleEl || !contentEl) return;
const title = titleEl.value.trim();
const content = contentEl.value.trim();
if(!title || !content) return alert('标题和内容不能为空哦！');
let wb = this.getWorldbookData();
wb.push({ id: 'wb_' + Date.now(), title: title, content: content, online: true, offline: true, isCustom: true });
localStorage.setItem('worldbook_entries', JSON.stringify(wb));
titleEl.value = '';
contentEl.value = '';
window.PhoneUI?.closeWbModal?.();
window.PhoneUI?.openApp?.('worldbook', '世界书');
this.showToast("✅ 规则添加成功！");
},

deleteWorldbook(id) {
if(!confirm('确定要删除这条自定义规则吗？')) return;
let wb = this.getWorldbookData();
wb = wb.filter(w => w.id !== id);
localStorage.setItem('worldbook_entries', JSON.stringify(wb));
window.PhoneUI?.openApp?.('worldbook', '世界书');
this.showToast("🗑️ 规则已删除");
},

saveNovelWords() {
const el = document.getElementById('novel-min-words');
if (el) localStorage.setItem('novel_min_words', el.value || '150');
},

getArchives() { return JSON.parse(localStorage.getItem('story_archives') || '[]'); },

saveArchive() {
const nameInput = document.getElementById('archive-name');
if (!nameInput) return;
const name = nameInput.value.trim();
if (!name) return alert('请先输入存档名称！');
const roleId = window.Config?.currentContactId;
const items = window.Config?.phoneData?.[roleId]?.novel?.items || [];
if (items.length === 0) return alert('当前没有线下剧情可以存档哦！');
const vault = this.getMemoryVault();
const offlineVault = vault.filter(v => v.source === '线下故事' && !v.isCore);
const archives = this.getArchives();
archives.push({ id: 'arc_' + Date.now(), name: name, date: new Date().toLocaleString(), count: items.length, data: JSON.parse(JSON.stringify(items)), vault: offlineVault });
localStorage.setItem('story_archives', JSON.stringify(archives));
nameInput.value = '';
window.PhoneUI?.renderArchiveList?.();
this.showToast('💾 线下剧情存档成功！');
},

loadArchive(id) {
if (!confirm('读取存档将覆盖当前的线下剧情，确定要读取吗？')) return;
const archives = this.getArchives();
const arc = archives.find(a => a.id === id);
if (arc) {
const roleId = window.Config?.currentContactId;
if (roleId && window.Config?.phoneData) {
if (!window.Config.phoneData[roleId]) window.Config.phoneData[roleId] = {};
window.Config.phoneData[roleId].novel = { items: JSON.parse(JSON.stringify(arc.data || [])) };
localStorage.setItem('phone_data', JSON.stringify(window.Config.phoneData));
}
if (arc.vault) {
let vault = this.getMemoryVault();
vault = vault.filter(v => !(v.source === '线下故事' && !v.isCore));
vault = vault.concat(arc.vault);
localStorage.setItem('memory_vault_entries', JSON.stringify(vault));
}
window.PhoneUI?.closeArchiveModal?.();
if (window.Config?.currentAppId === 'novel') window.PhoneUI?.renderNovelContent?.();
this.showToast('✨ 线下剧情读取成功！');
}
},

deleteArchive(id) {
if (!confirm('确定删除吗？')) return;
let archives = this.getArchives();
archives = archives.filter(a => a.id !== id);
localStorage.setItem('story_archives', JSON.stringify(archives));
window.PhoneUI?.renderArchiveList?.();
this.showToast('🗑️ 存档已删除');
},

startNewTimeline() {
if (!confirm('开启新剧情将清空当前的记录！确定吗？')) return;
const roleId = window.Config?.currentContactId;
if (roleId && window.Config?.phoneData?.[roleId]?.novel) {
window.Config.phoneData[roleId].novel.items = [];
localStorage.setItem('phone_data', JSON.stringify(window.Config.phoneData));
}
let vault = this.getMemoryVault();
vault = vault.filter(v => !(v.source === '线下故事' && !v.isCore));
localStorage.setItem('memory_vault_entries', JSON.stringify(vault));
window.PhoneUI?.closeArchiveModal?.();
if (window.Config?.currentAppId === 'novel') window.PhoneUI?.renderNovelContent?.();
this.showToast('🚀 已开启全新时间线！');
},

// ================= 云端备份与同步系统 =================
async syncToCloud() {
this.showToast("☁️ 正在上传存档至 Supabase 数据库...");
try {
const data = {};
for (let i = 0; i < localStorage.length; i++) {
const key = localStorage.key(i);
data[key] = localStorage.getItem(key);
}

const headers = {
'apikey': this.SUPABASE_KEY,
'Authorization': `Bearer ${this.SUPABASE_KEY}`,
'Content-Type': 'application/json'
};

const checkRes = await fetch(`${this.SUPABASE_URL}/rest/v1/phone_sync?id=eq.1&select=id`, { headers });
const checkData = await checkRes.json();

let saveRes;
if (checkData && checkData.length > 0) {
saveRes = await fetch(`${this.SUPABASE_URL}/rest/v1/phone_sync?id=eq.1`, {
method: 'PATCH',
headers: headers,
body: JSON.stringify({ content: JSON.stringify(data) })
});
} else {
saveRes = await fetch(`${this.SUPABASE_URL}/rest/v1/phone_sync`, {
method: 'POST',
headers: { ...headers, 'Prefer': 'return=representation' },
body: JSON.stringify({ id: 1, content: JSON.stringify(data) })
});
}

if (!saveRes.ok) {
const errBody = await saveRes.text();
throw new Error(`[${saveRes.status}] ${errBody}`);
}

this.showToast("🎉 成功同步至 Supabase！云端已安全归档！");
} catch (err) {
console.error(err);
alert("Supabase 同步失败: " + err.message);
}
},

async restoreFromCloud() {
if (!confirm("⚠️ 确定要从 Supabase 恢复存档吗？这会覆盖本地当前的数据！")) return;
this.showToast("📥 正在从 Supabase 拉取最新存档...");
try {
const headers = {
'apikey': this.SUPABASE_KEY,
'Authorization': `Bearer ${this.SUPABASE_KEY}`
};

const res = await fetch(`${this.SUPABASE_URL}/rest/v1/phone_sync?id=eq.1&select=content`, { headers });
if (!res.ok) {
const errBody = await res.text();
throw new Error(`[${res.status}] ${errBody}`);
}

const rows = await res.json();
if (!rows || rows.length === 0 || !rows[0].content) {
return alert("Supabase 云端还没有备份数据哦，请先在旧设备上点击【备份到云端】！");
}

let data = rows[0].content;
if (typeof data === 'string') {
try {
data = JSON.parse(data);
} catch (e) {
console.error("解析数据失败", e);
}
}

if (typeof data === 'object' && data !== null) {
for (const key in data) {
let val = data[key];
if (typeof val === 'object' && val !== null) {
localStorage.setItem(key, JSON.stringify(val));
} else {
localStorage.setItem(key, String(val));
}
}
}

this.showToast("✨ 云端恢复成功！正在重新载入...");
setTimeout(() => {
window.location.reload();
}, 1200);
} catch (err) {
console.error(err);
alert("Supabase 恢复失败: " + err.message);
}
},

async exportData() {
const data = {};
for (let i = 0; i < localStorage.length; i++) {
const key = localStorage.key(i);
data[key] = localStorage.getItem(key);
}
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
const a = document.createElement('a');
a.style.display = 'none';
a.href = url;
a.download = fileName;
document.body.appendChild(a);
a.click();
setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
},

importData(event) {
const file = event.target.files[0];
if (!file) return;
const reader = new FileReader();
reader.onload = (e) => {
try {
const data = JSON.parse(e.target.result);
if (!confirm("⚠️ 警告：导入存档将覆盖当前手机里的所有记录！确定吗？")) {
event.target.value = '';
return;
}
for (const key in data) {
let val = data[key];
if (typeof val === 'object' && val !== null) {
localStorage.setItem(key, JSON.stringify(val));
} else {
localStorage.setItem(key, String(val));
}
}
this.showToast("✨ 导入成功！正在重启...");
setTimeout(() => { window.location.reload(); }, 1500);
} catch (err) {
alert("导入失败！");
}
event.target.value = '';
};
reader.readAsText(file);
},

getDiaries() { return JSON.parse(localStorage.getItem('char_diaries') || '{}'); },
saveDiary(dateStr, content) { const diaries = this.getDiaries(); diaries[dateStr] = content; localStorage.setItem('char_diaries', JSON.stringify(diaries)); },
getFavorites() { return JSON.parse(localStorage.getItem('starry_favorites') || '[]'); },
saveFavorite(text, source, sender) { const favs = this.getFavorites(); favs.push({ id: 'fav_' + Date.now(), content: text, source: source, sender: sender, time: new Date().toISOString().split('T')[0] }); localStorage.setItem('starry_favorites', JSON.stringify(favs)); this.showToast('⭐ 已存入星海收藏夹！'); },
deleteFavorite(id) { if (!confirm('确定删除吗？')) return; let favs = this.getFavorites(); favs = favs.filter(f => f.id !== id); localStorage.setItem('starry_favorites', JSON.stringify(favs)); window.PhoneUI?.renderAppContent?.('favorites'); this.showToast('🗑️ 已删除'); },

getMemoryVault() { return JSON.parse(localStorage.getItem('memory_vault_entries') || '[]'); },

saveToMemoryVault(summaries, source, isCore = false) {
const vault = this.getMemoryVault();
const now = new Date();
const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
let summaryArray = Array.isArray(summaries) ? summaries : [summaries];

summaryArray.forEach((item, index) => {
let content = typeof item === 'string' ? item : item.content;
let keywords = typeof item === 'string' ? "" : (item.keywords || "");
vault.push({ id: 'mem_' + Date.now() + '_' + index, content: content, keywords: keywords, source: source, date: dateStr, time: timeStr, isCore: isCore });
});

localStorage.setItem('memory_vault_entries', JSON.stringify(vault));
this.showToast(`🧠 成功存入 ${summaryArray.length} 条记忆档案！`);
},

deleteFromMemoryVault(id) { if(!confirm('确定删除吗？')) return; let vault = this.getMemoryVault(); vault = vault.filter(m => m.id !== id); localStorage.setItem('memory_vault_entries', JSON.stringify(vault)); window.PhoneUI?.renderMemoryVault?.(); this.showToast('🗑️ 记忆已消除'); },

async editMemoryVault(id) {
let vault = this.getMemoryVault();
let item = vault.find(m => m.id === id);
if (item) {
const newText = await window.PhoneUI?.showCustomPrompt?.("✏️ 修改记忆档案：", item.content);
if (newText !== null && newText.trim() !== "") {
item.content = newText.trim();

this.showToast("🧠 正在为新记忆提取关键词...");
try {
const kwPrompt = `请为下面这段记忆提取3-5个核心触发关键词（名词为主，用逗号隔开）。直接输出关键词，不要任何废话。\n\n记忆：${item.content}`;
const kwReply = await this.chatWithAI([{ role: "user", content: kwPrompt }], true);
item.keywords = kwReply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
} catch(e) {
console.error("提取关键词失败", e);
}

localStorage.setItem('memory_vault_entries', JSON.stringify(vault));
window.PhoneUI?.renderMemoryVault?.();
this.showToast('✅ 记忆与关键词已更新');
}
}
},

toggleCoreMemory(id) { let vault = this.getMemoryVault(); let item = vault.find(m => m.id === id); if (item) { item.isCore = !item.isCore; localStorage.setItem('memory_vault_entries', JSON.stringify(vault)); window.PhoneUI?.renderMemoryVault?.(); if (item.isCore) { this.showToast('📌 已设为核心记忆！'); } else { this.showToast('取消核心记忆'); } } },

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

let reply = data.choices[0].message.content || '';
reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<思维链>[\s\S]*?<\/思维链>/gi, '').trim();
return reply;
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
throw new Error("中转站强行返回了URL，由于浏览器跨域限制(CORS)无法下载。请使用返回 b64_json 的渠道！");
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

if (typeof window !== 'undefined') {
window.PhoneAPI = PhoneAPI;
}
