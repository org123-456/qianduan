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
if (savedCharName && savedMyName) {
const titleEl = document.getElementById('top-title');
if (titleEl) titleEl.innerText = `${savedMyName} & ${savedCharName}`;
}
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

// 🌟 核心修改 1：支持存入带关键词的对象
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

// 🌟 核心修改 2：手动修改记忆时，自动呼叫 AI 提取关键词
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
```

---

### 2️⃣ 替换 `phone_engine.js`（提取记忆时自动生成关键词）

全选你的 `phone_engine.js`，直接覆盖：

```javascript
import { Config } from './phone_config.js';
import { PhoneAPI } from './phone_api.js';
import { PhoneUI } from './phone_ui.js';

export const PhoneEngine = {
currentMsgIndex: -1,

getRealIndex(targetApp, index) {
const roleId = Config?.currentContactId;
const items = Config?.phoneData?.[roleId]?.[targetApp]?.items || [];
if (items.length > 50 && index < 50) {
return items.length - 50 + index;
}
return index;
},

cleanStuckTyping() {
let changed = false;
if (!Config?.phoneData) return;
for (let roleId in Config.phoneData) {
['wechat', 'novel'].forEach(app => {
if (Config.phoneData[roleId]?.[app]) {
const items = Config.phoneData[roleId][app].items;
if (items && items.length > 0 && items[items.length - 1].sender === 'typing') {
items.pop();
changed = true;
}
}
});
}
if (changed) {
localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
PhoneUI.renderAppContent('wechat');
PhoneUI.renderNovelContent();
PhoneAPI.showToast("✅ 已强制清除卡死的 AI 状态！");
} else {
PhoneAPI.showToast("当前没有卡死的状态。");
}
},

openMsgMenu(index, sender) {
this.currentMsgIndex = index;
const bg = document.getElementById('action-bg');
const sheet = document.getElementById('action-sheet');
if (bg) bg.classList.add('show');
if (sheet) sheet.classList.add('show');
const btnRegen = document.getElementById('btn-regen');
if (btnRegen) btnRegen.style.display = (sender === 'other') ? 'flex' : 'none';
},

closeMsgMenu() {
const bg = document.getElementById('action-bg');
const sheet = document.getElementById('action-sheet');
if (bg) bg.classList.remove('show');
if (sheet) sheet.classList.remove('show');
},

async refreshTasks() {
PhoneAPI.showToast(`🔄 正在联系中介所，为您获取最新委托...`);
const listEl = document.getElementById('task-list-container');
if (listEl) listEl.innerHTML = `<div style="text-align:center; padding: 40px 0; color: var(--primary-color);"><i class="ph-fill ph-spinner spin-anim" style="font-size: 32px;"></i><br>正在生成委托...</div>`;

try {
const prompt = `你是一个赛博悬赏委托发布员。请生成 3 个打工任务。
要求：
1. 前 2 个是普通跑腿/日常任务（isStory 为 false）。
2. 第 3 个必须是【需要和男主一起完成的、有剧情张力的特殊任务】（isStory 为 true）。
3. 图标(icon)必须使用 Phosphor 格式，例如 "ph-fill ph-coffee", "ph-fill ph-magnifying-glass", "ph-fill ph-cat"。
【绝对要求】：严格输出 JSON 数组，不要任何 markdown 标记！
格式范例：[{"name":"整理案卷","reward":50,"icon":"ph-fill ph-keyboard","isStory":false}]`;

const reply = await PhoneAPI.chatWithAI([{ role: 'user', content: prompt }], true);
let jsonStr = reply.replace(/```json/gi, '').replace(/```/g, '').trim();
const items = JSON.parse(jsonStr);

if (Array.isArray(items) && items.length > 0) {
localStorage.setItem('task_current_items', JSON.stringify(items));
PhoneUI.renderAppContent('task');
PhoneAPI.showToast("🎉 委托刷新成功！");
} else {
throw new Error("解析失败");
}
} catch (e) {
console.error(e);
PhoneAPI.showToast("刷新失败，请重试！");
PhoneUI.renderAppContent('task');
}
},

doTask(index) {
const tasks = JSON.parse(localStorage.getItem('task_current_items') || '[]');
const task = tasks[index];
if (!task) return;

if (task.isStory) {
PhoneUI.closeApp();
PhoneUI.openApp('novel', '线下故事');
const roleId = Config?.currentContactId;
if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
if (!Config.phoneData[roleId].novel) Config.phoneData[roleId].novel = { items: [] };

const now = new Date();
const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

Config.phoneData[roleId].novel.items.push({
sender: 'me',
content: `【系统提示】：我接取了高薪悬赏任务 [${task.name}]，需要和你一起去完成。`,
time: timeStr,
date: dateStr
});
localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
PhoneUI.renderNovelContent();
this.sendNovelMessage(false);
} else {
PhoneAPI.showToast(`💼 正在进行打工: ${task.name}...`);
setTimeout(() => {
let coins = parseInt(localStorage.getItem('my_coins') || '500');
coins += task.reward;
localStorage.setItem('my_coins', coins);
PhoneUI.renderAppContent('task');
PhoneAPI.showToast(`🎉 打工完成！赚取了 ${task.reward} 金币！`);
}, 1500);
}
},

async addCustomShopTag() {
const newTag = await PhoneUI.showCustomPrompt("🏷️ 输入你要添加的商品分类标签：", "例如：赛博义体");
if (newTag && newTag.trim() !== "") {
let customTags = JSON.parse(localStorage.getItem('shop_custom_tags') || '[]');
if (!customTags.includes(newTag.trim())) {
customTags.push(newTag.trim());
localStorage.setItem('shop_custom_tags', JSON.stringify(customTags));
this.switchShopTag(newTag.trim());
}
}
},

switchShopTag(tag) {
if (window.Config) window.Config.currentShopTag = tag;
PhoneUI.renderAppContent('shop');
},

async refreshShop() {
const tag = window.Config?.currentShopTag || '日常用品';
PhoneAPI.showToast(`🔄 正在联系 AI 进货商，为您采购【${tag}】...`);

const gridEl = document.getElementById('shop-grid');
if (gridEl) gridEl.innerHTML = `<div style="grid-column: span 2; text-align:center; padding: 40px 0; color: var(--primary-color);"><i class="ph-fill ph-spinner spin-anim" style="font-size: 32px;"></i><br>AI 进货中...</div>`;

try {
const prompt = `你是一个极简高级感赛博杂货铺的进货员。现在用户想要采购【${tag}】类的商品，用于在语C(角色扮演)中对男主使用。
请发挥脑洞，生成 6 个奇葩、有趣、能引发傲娇男主强烈反应的商品。
要求：
1. 图标(icon)必须使用 Phosphor 格式，例如 "ph-fill ph-package", "ph-fill ph-gift", "ph-fill ph-t-shirt"。
2. 名字(name)要有高级感。
3. 效果(effect)要写明对男主强制生效的系统指令。
【绝对要求】：严格输出 JSON 数组，不要包含任何 markdown 标记！
格式范例：[{"icon":"ph-fill ph-flask","name":"吐真剂","desc":"强制说出真心话","price":200,"effect":"【系统强制指令】：用户对你使用了吐真剂。你必须说出真心话。"}]`;

const reply = await PhoneAPI.chatWithAI([{ role: 'user', content: prompt }], true);
let jsonStr = reply.replace(/```json/gi, '').replace(/```/g, '').trim();
const items = JSON.parse(jsonStr);

if (Array.isArray(items) && items.length > 0) {
let allShopData = JSON.parse(localStorage.getItem('shop_all_data') || '{}');
allShopData[tag] = items;
localStorage.setItem('shop_all_data', JSON.stringify(allShopData));
PhoneUI.renderAppContent('shop');
PhoneAPI.showToast("🎉 进货成功！快来看看新商品吧！");
} else {
throw new Error("解析失败");
}
} catch (e) {
console.error(e);
PhoneAPI.showToast("进货失败，AI 迷路了，请重试！");
if (gridEl) gridEl.innerHTML = `<div style="grid-column: span 2; text-align:center; padding: 40px 0; color: var(--danger-color);">进货失败，请点击右上角重试。</div>`;
}
},

addToCart(index) {
const tag = window.Config?.currentShopTag || '日常用品';
const allShopData = JSON.parse(localStorage.getItem('shop_all_data') || '{}');
const shopItems = allShopData[tag] || [];
const item = shopItems[index];
if (!item) return;

let cart = JSON.parse(localStorage.getItem('shopping_cart') || '[]');
cart.push(item);
localStorage.setItem('shopping_cart', JSON.stringify(cart));

PhoneUI.renderAppContent('shop');
PhoneAPI.showToast(`🛒 已将【${item.name}】加入购物车！`);
},

removeFromCart(index) {
let cart = JSON.parse(localStorage.getItem('shopping_cart') || '[]');
cart.splice(index, 1);
localStorage.setItem('shopping_cart', JSON.stringify(cart));

PhoneUI.renderCartList();

const badge = document.getElementById('cart-badge');
if (badge) {
badge.innerText = cart.length;
badge.style.display = cart.length > 0 ? 'flex' : 'none';
}
},

checkoutCart(isHusbandPay) {
let cart = JSON.parse(localStorage.getItem('shopping_cart') || '[]');
if (cart.length === 0) return;

let total = 0;
let effects = [];
cart.forEach(item => {
total += parseInt(item.price);
effects.push(item.effect);
});

const roleId = Config?.currentContactId;
if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
if (!Config.phoneData[roleId].wechat) Config.phoneData[roleId].wechat = { items: [] };

const chatItems = Config.phoneData[roleId].wechat.items;
const now = new Date();
const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

if (isHusbandPay) {
let orderHtml = `<div class="chat-order-card"><div class="chat-order-header"><div>🛍️ 赛博杂货铺 购物车清单</div><div>¥${total}</div></div>`;
cart.forEach(item => {
orderHtml += `<div class="chat-order-item"><div class="chat-order-item-name"><i class="${item.icon}" style="color:var(--primary-color);"></i> ${item.name}</div><div>x1</div></div>`;
});
orderHtml += `<div class="chat-order-meta"><div>📍 配送地址：[待填写]</div><div>⏱️ 预计送达：付款后 30 分钟内</div></div></div>`;

PhoneUI.closeCartModal();
PhoneUI.closeApp();

chatItems.push({
sender: 'me',
content: `亲爱的，我看中了这些东西，帮我代付一下嘛~🥺\n${orderHtml}\n\n【系统提示】：用户向你发送了一份代付订单。请你根据商品内容进行傲娇的吐槽，并决定是否帮她付款。如果付款，请顺便告诉她配送地址填哪里。`,
time: timeStr,
date: dateStr
});

localStorage.setItem('shopping_cart', '[]');
localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
PhoneUI.renderAppContent('wechat');
this.sendChatMessage(false);

} else {
let coins = parseInt(localStorage.getItem('my_coins') || '500');
if (coins < total) {
PhoneAPI.showToast("余额不足，快去打工赚钱吧！");
return;
}

if (confirm(`确定花费 ${total} 金币购买购物车里的所有商品，并立即在微信里对他使用吗？`)) {
coins -= total;
localStorage.setItem('my_coins', coins);
localStorage.setItem('shopping_cart', '[]');

let orderHtml = `<div class="chat-order-card"><div class="chat-order-header"><div>🛍️ 赛博杂货铺 已购订单</div><div>¥${total}</div></div>`;
cart.forEach(item => {
orderHtml += `<div class="chat-order-item"><div class="chat-order-item-name"><i class="${item.icon}" style="color:var(--primary-color);"></i> ${item.name}</div><div>x1</div></div>`;
});
orderHtml += `<div class="chat-order-meta"><div>✅ 支付状态：已付款</div><div>📍 配送目标：大侦探不死途</div></div></div>`;

PhoneUI.closeCartModal();
PhoneUI.closeApp();
PhoneAPI.showToast(`🎉 购买成功！已对他使用道具！`);

chatItems.push({
sender: 'me',
content: `【系统动作】：我豪掷 ${total} 金币，购买并对你使用了以下道具！\n${orderHtml}\n\n${effects.join('\n')}`,
time: timeStr,
date: dateStr
});

localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
PhoneUI.renderAppContent('wechat');
this.sendChatMessage(false);
}
}
},

uploadFaceLock() {
const input = document.createElement('input');
input.type = 'file';
input.accept = 'image/*';

input.onchange = async (e) => {
const file = e.target.files[0];
if (!file) return;

PhoneAPI.showToast("🔒 正在提取面部特征...");

const reader = new FileReader();
reader.onload = (event) => {
const img = new Image();
img.onload = () => {
const canvas = document.createElement('canvas');
let width = img.width;
let height = img.height;
const MAX_SIZE = 512;

if (width > height && width > MAX_SIZE) {
height *= MAX_SIZE / width;
width = MAX_SIZE;
} else if (height > MAX_SIZE) {
width *= MAX_SIZE / height;
height = MAX_SIZE;
}

canvas.width = width;
canvas.height = height;
const ctx = canvas.getContext('2d');
ctx.drawImage(img, 0, 0, width, height);

const base64Url = canvas.toDataURL('image/jpeg', 0.6);
localStorage.setItem('img_ref_base64', base64Url);

const previewEl = document.getElementById('face-lock-preview');
if (previewEl) {
previewEl.innerHTML = `<img src="${base64Url}" style="width:100%;height:100%;object-fit:cover;">`;
}
PhoneAPI.showToast("✅ 锁脸图已保存！生图时将自动应用。");
};
img.src = event.target.result;
};
reader.readAsDataURL(file);
};
input.click();
},

clearFaceLock() {
localStorage.removeItem('img_ref_base64');
const previewEl = document.getElementById('face-lock-preview');
if (previewEl) {
previewEl.innerHTML = `<i class="ph ph-plus" style="font-size: 24px; color: var(--text-sub);"></i>`;
}
PhoneAPI.showToast("🗑️ 锁脸图已清除！");
},

sendImageMsg() {
this.closeMsgMenu();
const input = document.createElement('input');
input.type = 'file';
input.accept = 'image/*';

input.onchange = async (e) => {
const file = e.target.files[0];
if (!file) return;
PhoneAPI.showToast("🖼️ 图片处理中，处理完可继续发图或打字发送...");
const reader = new FileReader();
reader.onload = (event) => {
const img = new Image();
img.onload = () => {
const canvas = document.createElement('canvas');
let width = img.width;
let height = img.height;
const MAX_SIZE = 800;
if (width > height && width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
else if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
canvas.width = width; canvas.height = height;
const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height);
const base64Url = canvas.toDataURL('image/jpeg', 0.7);
const roleId = Config?.currentContactId;
if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
if (!Config.phoneData[roleId].wechat) Config.phoneData[roleId].wechat = { items: [] };
const now = new Date();
const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
Config.phoneData[roleId].wechat.items.push({ sender: 'me', content: `![图片](${base64Url})`, time: timeStr, date: dateStr });
localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
PhoneUI.renderAppContent('wechat');
};
img.src = event.target.result;
};
reader.readAsDataURL(file);
};
input.click();
},

sendFileMsg() {
this.closeMsgMenu();
const input = document.createElement('input');
input.type = 'file';
input.onchange = async (e) => {
const file = e.target.files[0];
if (!file) return;
if (file.type.startsWith('image/')) { PhoneAPI.showToast("图片请使用【发图片】功能哦！"); return; }
PhoneAPI.showToast(`📁 正在发送文件: ${file.name}...`);
const roleId = Config?.currentContactId;
if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
if (!Config.phoneData[roleId].wechat) Config.phoneData[roleId].wechat = { items: [] };
const chatItems = Config.phoneData[roleId].wechat.items;
const now = new Date();
const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
const isText = file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.json') || file.name.endsWith('.csv');
if (isText && file.size < 100 * 1024) {
const reader = new FileReader();
reader.onload = (event) => {
const content = event.target.result;
chatItems.push({ sender: 'me', content: `📁 [发送了文件: ${file.name}]\n\n文件内容如下：\n\`\`\`\n${content}\n\`\`\``, time: timeStr, date: dateStr });
localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
PhoneUI.renderAppContent('wechat');
};
reader.readAsText(file);
} else {
const sizeMB = (file.size / 1024 / 1024).toFixed(2);
chatItems.push({ sender: 'me', content: `📁 [发送了文件: ${file.name}] (大小: ${sizeMB}MB)\n\n【系统提示】：用户向你发送了一份文件。由于跨次元限制，你无法直接读取文件内容，请你根据文件名脑补文件内容，并作出符合人设的反应。`, time: timeStr, date: dateStr });
localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
PhoneUI.renderAppContent('wechat');
}
};
input.click();
},

async transferMoney() {
const amountStr = await PhoneUI.showCustomPrompt("💸 转账给TA", "请输入你要转给他的金币数量（例如：520）");
if (!amountStr) return;
const amount = parseInt(amountStr);
if (isNaN(amount) || amount <= 0) return alert("请输入正确的数字！");

let myCoins = parseInt(localStorage.getItem('my_coins') || '500');
if (myCoins < amount) return alert("你的小金库余额不足啦！");

myCoins -= amount;
localStorage.setItem('my_coins', myCoins);

let hisCoins = parseInt(localStorage.getItem('his_coins') || '0');
hisCoins += amount;
localStorage.setItem('his_coins', hisCoins);

const roleId = Config?.currentContactId;
const targetApp = (window.Config?.currentAppId === 'novel') ? 'novel' : 'wechat';
if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
if (!Config.phoneData[roleId][targetApp]) Config.phoneData[roleId][targetApp] = { items: [] };

const chatItems = Config.phoneData[roleId][targetApp].items;
const now = new Date();
const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

const content = `【系统提示】：我向你转账了 ${amount} 金币。`;
chatItems.push({ sender: 'me', content: content, time: timeStr, date: dateStr });

localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));

if (targetApp === 'novel') {
PhoneUI.renderNovelContent();
this.sendNovelMessage(false);
} else {
PhoneUI.renderAppContent('wechat');
this.sendChatMessage(false);
}
},

sendSticker(name, url) {
const panel = document.getElementById('sticker-panel');
if (panel) panel.classList.remove('show');

const roleId = Config?.currentContactId;
const targetApp = (window.Config?.currentAppId === 'novel') ? 'novel' : 'wechat';
if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
if (!Config.phoneData[roleId][targetApp]) Config.phoneData[roleId][targetApp] = { items: [] };

const chatItems = Config.phoneData[roleId][targetApp].items;
const now = new Date();
const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

const content = `[发送了表情包：${name}]\n![${name}](${url})`;
chatItems.push({ sender: 'me', content: content, time: timeStr, date: dateStr });

localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));

if (targetApp === 'novel') {
PhoneUI.renderNovelContent();
this.sendNovelMessage(false);
} else {
PhoneUI.renderAppContent('wechat');
this.sendChatMessage(false);
}
},

async favoriteMsg() {
this.closeMsgMenu();
if (this.currentMsgIndex < 0) return;
const roleId = Config?.currentContactId;
const targetApp = (window.Config?.currentAppId === 'novel') ? 'novel' : 'wechat';
const realIndex = this.getRealIndex(targetApp, this.currentMsgIndex);
const msg = Config?.phoneData?.[roleId]?.[targetApp]?.items?.[realIndex];
if (!msg) return;
const selectedText = await PhoneUI.showCustomPrompt("⭐ 请精简你要收藏的句子（太长会撑爆星星）：", msg.content);
if (selectedText && selectedText.trim() !== "") {
PhoneAPI.saveFavorite(selectedText.trim(), targetApp === 'wechat' ? '线上微信' : '线下故事', msg.sender);
}
},

async aiSummarizeMsg() {
this.closeMsgMenu();
if (this.currentMsgIndex < 0) return;
const roleId = Config?.currentContactId;
const targetApp = (window.Config?.currentAppId === 'novel') ? 'novel' : 'wechat';
const realIndex = this.getRealIndex(targetApp, this.currentMsgIndex);
const msg = Config?.phoneData?.[roleId]?.[targetApp]?.items?.[realIndex];
if (!msg) return;
PhoneAPI.showToast("✨ AI 正在提炼金句，请稍候...");
try {
const aiPrompt = `请将下面这段角色扮演的回复，提炼成一句【简短、唯美、或傲娇的语录/内心独白】（要求在20字以内）。\n【绝对要求】：去除所有动作描写、环境描写和敏感内容，只保留最核心的情感或金句。直接输出这唯一的一句话，不要任何多余解释！\n\n原文：\n${msg.content}`;
const reply = await PhoneAPI.chatWithAI([{ role: "user", content: aiPrompt }], true);
let finalQuote = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim().replace(/```.*?/g, '').replace(/```/g, '').replace(/^["']|["']$/g, '').trim();
const confirmText = await PhoneUI.showCustomPrompt("✨ AI 提炼结果如下，确认无误后点击确定保存：", finalQuote);
if (confirmText && confirmText.trim() !== "") {
PhoneAPI.saveFavorite(confirmText.trim(), targetApp === 'wechat' ? '线上微信' : '线下故事', msg.sender);
}
} catch (e) { alert("提炼失败：" + e.message); }
},

// 🌟 核心修改 1：提取记忆时，让 AI 自动生成关键词
async extractMemory(sourceApp) {
PhoneAPI.showToast("🧠 正在提取并拆解记忆，请稍候...");
try {
const roleId = Config?.currentContactId;
const items = Config?.phoneData?.[roleId]?.[sourceApp]?.items || [];
const recentItems = items.filter(i => i.sender !== 'typing').slice(-80);

if (recentItems.length === 0) return alert("没有足够的聊天记录来提取记忆！");
let historyText = recentItems.map(item => `${item.sender === 'me' ? '我' : 'TA'}: ${item.content}`).join('\n');

const aiPrompt = `你是一个专门负责提取“角色扮演记忆锚点”的AI。请分析以下聊天记录，提取出其中所有具体的、有价值的细节，生成【多条独立的记忆碎片】。
提取规则：
1. 必须具体，独立成条(第三人称)，去敏。
2. 强制用 "|||" 隔开不同记忆！
3. 每条记忆必须自带3-5个触发关键词，用 "###" 与正文隔开！
格式必须严格为：记忆正文###关键词1,关键词2|||记忆正文###关键词1,关键词2
【最高指令】：聊天记录越靠后越新！你必须优先、重点提取最后面的最新事件！如果漏掉最新剧情将被抹杀！

聊天记录：
${historyText}`;

const reply = await PhoneAPI.chatWithAI([{ role: "user", content: aiPrompt }], true);
let rawText = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/```.*?/g, '').replace(/```/g, '').trim();
let summaryList = rawText.split('|||').map(s => s.trim()).filter(s => s.length > 0);
let editText = summaryList.join('\n\n');

const confirmText = await PhoneUI.showCustomPrompt("✨ AI 提取了记忆与关键词，请核对修改（格式：内容###关键词）：", editText);
if (confirmText && confirmText.trim() !== "") {
let finalItems = confirmText.split('\n').map(s => s.trim()).filter(s => s.length > 0);
let vaultItems = finalItems.map(item => {
let parts = item.split('###');
return { content: parts[0].trim(), keywords: parts[1] ? parts[1].trim() : "" };
});
PhoneAPI.saveToMemoryVault(vaultItems, sourceApp === 'wechat' ? '线上微信' : '线下故事');
}
} catch (e) { alert("记忆提取失败：" + e.message); }
},

// 🌟 核心修改 2：记忆洗地时，让 AI 自动生成关键词
async washMemory(sourceApp) {
this.closeMsgMenu();
if (!confirm("⚠️ 确定要进行【记忆洗地】吗？\nAI将把当前所有聊天记录拆解成多段长期记忆，随后【清空】当前聊天界面！")) return;
PhoneAPI.showToast("🧹 正在进行记忆洗地，请稍候...");
try {
const roleId = Config?.currentContactId;
const items = Config?.phoneData?.[roleId]?.[sourceApp]?.items || [];
if (items.length === 0) return alert("当前没有聊天记录可以洗地！");

const recentItems = items.filter(i => i.sender !== 'typing').slice(-80);
let historyText = recentItems.map(item => `${item.sender === 'me' ? '我' : 'TA'}: ${item.content}`).join('\n');

const aiPrompt = `分析聊天记录，提取具体的记忆碎片。
提取规则：
1. 必须具体，独立成条(第三人称)，去敏。
2. 强制用 "|||" 隔开不同记忆！
3. 每条记忆必须自带3-5个触发关键词，用 "###" 与正文隔开！
格式必须严格为：记忆正文###关键词1,关键词2|||记忆正文###关键词1,关键词2
【最高指令】：聊天记录越靠后越新！你必须优先、重点提取最后面的最新事件！如果漏掉最新剧情将被抹杀！

记录：
${historyText}`;

const reply = await PhoneAPI.chatWithAI([{ role: "user", content: aiPrompt }], true);
let rawText = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/```.*?/g, '').replace(/```/g, '').trim();
let summaryList = rawText.split('|||').map(s => s.trim()).filter(s => s.length > 0);
let editText = summaryList.join('\n\n');

const confirmText = await PhoneUI.showCustomPrompt("✨ 洗地记忆碎片如下，确认后将存入记忆库并清空界面：", editText);
if (confirmText && confirmText.trim() !== "") {
let finalItems = confirmText.split('\n').map(s => s.trim()).filter(s => s.length > 0);
let vaultItems = finalItems.map(item => {
let parts = item.split('###');
return { content: parts[0].trim(), keywords: parts[1] ? parts[1].trim() : "" };
});
PhoneAPI.saveToMemoryVault(vaultItems, sourceApp === 'wechat' ? '线上微信' : '线下故事');
Config.phoneData[roleId][sourceApp].items = [];
localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
if (sourceApp === 'novel') PhoneUI.renderNovelContent();
else PhoneUI.renderAppContent('wechat');
PhoneAPI.showToast("🧹 洗地完成！界面已清空，记忆已入库。");
}
} catch (e) { alert("洗地失败：" + e.message); }
},

async editMsg() {
this.closeMsgMenu();
if (this.currentMsgIndex < 0) return;
const roleId = Config?.currentContactId;
const targetApp = (window.Config?.currentAppId === 'novel') ? 'novel' : 'wechat';
const realIndex = this.getRealIndex(targetApp, this.currentMsgIndex);
const item = Config?.phoneData?.[roleId]?.[targetApp]?.items?.[realIndex];
if (!item) return;
const oldText = item.content;
const newText = await PhoneUI.showCustomPrompt("✏️ 编辑消息：", oldText);
if (newText !== null && newText.trim() !== "") {
item.content = newText.trim();
if (targetApp === 'novel') PhoneUI.renderNovelContent();
else PhoneUI.renderAppContent('wechat');
localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
PhoneAPI.showToast("✅ 修改成功");
}
},

deleteMsg() {
this.closeMsgMenu();
if (this.currentMsgIndex < 0) return;
const roleId = Config?.currentContactId;
const targetApp = (window.Config?.currentAppId === 'novel') ? 'novel' : 'wechat';
const realIndex = this.getRealIndex(targetApp, this.currentMsgIndex);
if (Config?.phoneData?.[roleId]?.[targetApp]?.items) {
Config.phoneData[roleId][targetApp].items.splice(realIndex, 1);
if (targetApp === 'novel') PhoneUI.renderNovelContent();
else PhoneUI.renderAppContent('wechat');
localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
PhoneAPI.showToast("🗑️ 消息已删除");
}
},

regenMsg() {
this.closeMsgMenu();
if (this.currentMsgIndex < 0) return;
const roleId = Config?.currentContactId;
const targetApp = (window.Config?.currentAppId === 'novel') ? 'novel' : 'wechat';
const realIndex = this.getRealIndex(targetApp, this.currentMsgIndex);
if (Config?.phoneData?.[roleId]?.[targetApp]?.items) {
Config.phoneData[roleId][targetApp].items.splice(realIndex);
localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
if (targetApp === 'novel') {
PhoneUI.renderNovelContent();
this.sendNovelMessage(true);
} else {
PhoneUI.renderAppContent('wechat');
this.sendChatMessage(true);
}
}
},

sendUserMsgOnly() {
const targetApp = (window.Config?.currentAppId === 'novel') ? 'novel' : 'wechat';
const inputEl = targetApp === 'novel' ? document.getElementById('novel-input') : document.getElementById('chat-input');
if (!inputEl) return;
const text = inputEl.value.trim();
if (!text) return;
const roleId = Config?.currentContactId;
if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
if (!Config.phoneData[roleId][targetApp]) Config.phoneData[roleId][targetApp] = { items: [] };
const chatItems = Config.phoneData[roleId][targetApp].items;
const now = new Date();
const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
chatItems.push({ sender: 'me', content: text, time: timeStr, date: dateStr });
inputEl.value = '';
if (targetApp === 'novel') PhoneUI.renderNovelContent();
else PhoneUI.renderAppContent('wechat');
localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
},

compressImage(base64Str) {
return new Promise((resolve) => {
const img = new Image();
img.onload = () => {
const canvas = document.createElement('canvas');
let width = img.width;
let height = img.height;
const MAX_SIZE = 1024;
if (width > height && width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
else if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
canvas.width = width; canvas.height = height;
const ctx = canvas.getContext('2d');
ctx.drawImage(img, 0, 0, width, height);
resolve(canvas.toDataURL('image/jpeg', 0.8));
};
img.src = 'data:image/png;base64,' + base64Str;
});
},

async generateAiImage() {
const prompt = await window.PhoneUI.showCustomPrompt("🎨 请输入画面描述：", "大侦探不死途穿着黑衬衫，在赛博朋克城市的霓虹灯下抽烟，二次元动漫风格");
if (!prompt) return;
try {
const b64Json = await PhoneAPI.generateImageAPI(prompt);
PhoneAPI.showToast("✨ 画作已生成，正在冲洗入册...");
const finalB64 = await this.compressImage(b64Json);
const roleId = Config?.currentContactId;
if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
if (!Config.phoneData[roleId].gallery) Config.phoneData[roleId].gallery = { items: [] };
const now = new Date();
const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
Config.phoneData[roleId].gallery.items.push({ id: 'img_' + Date.now(), content: finalB64, date: dateStr });
localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
PhoneUI.renderAppContent('gallery');
PhoneAPI.showToast("📸 新照片已保存在回忆相册！");
} catch (e) { alert(e.message); }
},

deleteGalleryImage(id) {
if (!confirm("确定要销毁这张照片吗？")) return;
const roleId = Config?.currentContactId;
let items = Config?.phoneData?.[roleId]?.gallery?.items || [];
Config.phoneData[roleId].gallery.items = items.filter(i => i.id !== id);
localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
PhoneUI.renderAppContent('gallery');
PhoneUI.closeImageViewer();
PhoneAPI.showToast("🗑️ 照片已销毁");
},

_scanKeywords(userText) {
if (!userText) return "";
const vault = PhoneAPI.getMemoryVault() || [];
let triggeredMemories = [];

vault.forEach(item => {
if (item.keywords && typeof item.keywords === 'string') {
const kws = item.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
if (kws.some(kw => userText.includes(kw))) {
triggeredMemories.push(`[${item.date}] ${item.source}: ${item.content}`);
}
}
});

if (triggeredMemories.length > 0) {
return `\n【系统提示(关键词触发)】：用户刚才的话触动了你的某段记忆，你脑海中瞬间闪回了以下画面，请在回复中自然地体现出你记得这件事：\n${triggeredMemories.join('\n')}\n`;
}
return "";
},

async sendChatMessage(isRegen = false) {
const roleId = Config?.currentContactId;
if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
if (!Config.phoneData[roleId].wechat) Config.phoneData[roleId].wechat = { items: [] };
const chatItems = Config.phoneData[roleId].wechat.items;

let hasNewUserMsg = false;
let latestUserText = "";
const now = new Date();
const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

if (!isRegen) {
const inputEl = document.getElementById('chat-input');
if (inputEl) {
const text = inputEl.value.trim();
if (text) {
chatItems.push({ sender: 'me', content: text, time: timeStr, date: dateStr });
inputEl.value = '';
hasNewUserMsg = true;
latestUserText = text;
}
}
} else {
for (let i = chatItems.length - 1; i >= 0; i--) {
if (chatItems[i].sender === 'me' && !chatItems[i].content.includes('![图片]')) {
latestUserText = chatItems[i].content;
break;
}
}
}

if (!isRegen && !hasNewUserMsg && chatItems.length === 0) return;

chatItems.push({ sender: 'typing' });
PhoneUI.renderAppContent('wechat');
localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));

try {
const myName = localStorage.getItem('my_name') || '我';
const banEmoji = localStorage.getItem('ban_emoji') === 'true';
const shareMemory = localStorage.getItem('share_memory') === 'true';
const autoPhoto = localStorage.getItem('auto_photo') === 'true';

const systemPrompt = localStorage.getItem('system_prompt') || '';
const charPersona = localStorage.getItem('char_persona') || '';

const currentNow = new Date();
const curHour = currentNow.getHours();
const curMin = currentNow.getMinutes();
const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
const curWeek = '星期' + weekDays[currentNow.getDay()];
let timePhase = "深夜";
if (curHour >= 5 && curHour < 9) timePhase = "清晨";
else if (curHour >= 9 && curHour < 12) timePhase = "上午";
else if (curHour >= 12 && curHour < 14) timePhase = "中午";
else if (curHour >= 14 && curHour < 18) timePhase = "下午";
else if (curHour >= 18 && curHour < 23) timePhase = "晚上";

let stablePrompt = `【系统时间感知】：当前现实时间是 ${currentNow.getFullYear()}年${currentNow.getMonth()+1}月${currentNow.getDate()}日 ${curWeek}，${timePhase} ${curHour.toString().padStart(2, '0')}:${curMin.toString().padStart(2, '0')}。请自然地感知当前时间（如深夜催睡、早晨问早），但不要生硬报时。\n\n`;

if (systemPrompt) stablePrompt += `【系统核心指令】：\n${systemPrompt}\n\n`;
if (charPersona) stablePrompt += `【角色设定】：\n${charPersona}\n\n`;

let formatRule = "";
if (banEmoji) formatRule += "【最高禁令】：绝对不允许使用任何 Emoji、颜文字、波浪号(~)，违者抹杀！\n";
formatRule += "【互动最高指令】：如果用户向你发送了问卷、测试题单或提问，**绝对禁止**说‘等我写完告诉你有空再答’等拖延废话！你**必须立刻、当场逐题作答**，给出你的具体选项并配合傲娇或犀利的吐槽！\n";
formatRule += "【微信连发机制】：不限制气泡数量，请务必把你想说的话完整说完！系统会根据换行符切分微信气泡。绝对不要把所有话挤在同一行！\n";
formatRule += "【读心术机制】：在正式回复之前，你必须使用 <inner> 和 </inner> 标签包裹一段角色此刻真实的内心独白。\n【心声强制规则】：**绝对严禁再次提及‘小手机’、‘实验对象/实验品’、‘修东西’等老调重弹的内容！** 此刻的心声必须严格聚焦在【你对用户刚刚发的具体内容最私密、最真实的心理反应】！\n";

if (autoPhoto) {
formatRule += "【视觉交互机制】：如果用户在聊天中要求你“发一张自拍”、“拍个照看看”或者“让我看看你在干嘛”，你除了正常的文字回复外，**必须**在回复的最后加上一个 <photo> 标签，里面用英文详细描述你当前的动作、表情、穿着和环境（用于AI绘图）。例如：<photo>1boy, handsome, looking at viewer, holding a coffee cup, neon city background, masterpiece</photo>。注意：如果没有要求拍照，绝对不要输出这个标签！\n";
}

formatRule += "【动态交易机制】：如果剧情中发生了购买、点外卖、送礼等消费行为，你必须根据情境【自行编造商品名称和合理的金币价格】，并在回复最末尾加上 `<purchase>商品名称|价格数字</purchase>`。例如：`<purchase>双人豪华晚餐|120</purchase>`。系统会自动扣除金币并生成订单卡片。无消费行为时绝对不要输出此标签！\n";

const wbData = PhoneAPI.getWorldbookData();
const activeOnlineWb = wbData.filter(w => w.online).map(w => w.content).join('\n');
if (activeOnlineWb) {
formatRule += `\n【当前生效的世界书/规则插件】：\n${activeOnlineWb}\n`;
}
stablePrompt += formatRule;
stablePrompt += `\n当前正在和你聊天的人是：【${myName}】。\n`;

let dynamicPrompt = "";
const allVault = PhoneAPI.getMemoryVault();
let accessibleVault = allVault;
if (!shareMemory) {
accessibleVault = allVault.filter(v => v.isCore || v.source === '线上微信');
}

if (latestUserText) {
dynamicPrompt += this._scanKeywords(latestUserText);
}

if (accessibleVault.length > 0) {
const recentVault = accessibleVault.slice(-5).map(v => `[${v.date}] ${v.source}: ${v.content}`).join('\n');
dynamicPrompt += `\n【长期记忆档案】：以下是你脑海中深刻的长期记忆，请在对话中自然地保持连贯：\n${recentVault}\n`;

if (hasNewUserMsg) {
const recallTriggers = ['你还记得', '昨天', '上次', '之前', '那个事', '还记得', '那次'];
const needsRecall = recallTriggers.some(t => latestUserText.includes(t));

if (needsRecall && accessibleVault.length > 5) {
const extendedVault = accessibleVault.slice(-20).map(v => `[${v.date}] ${v.source}: ${v.content}`).join('\n');
dynamicPrompt += `\n【系统提示(记忆检索触发)】：用户似乎在试图唤醒你的某段记忆。以下是你的扩展记忆库，请检索是否有相关内容，并以你的口吻作出回应：\n${extendedVault}\n`;
}
}
}

if (shareMemory) {
const novelItems = Config?.phoneData?.[roleId]?.novel?.items || [];
if (novelItems.length > 0) {
const recentNovel = novelItems.slice(-8).map(item => `${item.sender === 'me' ? '我' : 'TA'}: ${item.content}`).join('\n');
dynamicPrompt += `\n【跨频道记忆联动】：以下是你们最近在[线下故事]中发生的剧情，请在当前的微信回复中自然体现出你记得这些事：\n${recentNovel}\n`;
}
}

let systemContent = [];
if (stablePrompt) {
systemContent.push({
type: "text",
text: stablePrompt,
cache_control: { type: "ephemeral" }
});
}
if (dynamicPrompt) {
systemContent.push({
type: "text",
text: dynamicPrompt
});
}

let messages = [{ role: "system", content: systemContent.length > 0 ? systemContent : "You are a helpful assistant." }];

const MAX_CONTEXT = 20;
const recentItems = chatItems.slice(-MAX_CONTEXT);
let hasImage = false;

recentItems.forEach((item) => {
if (item.sender !== 'typing') {
let text = item.content;
const imgMatch = text ? text.match(/^!\[.*?\]\((.*?)\)$/) : null;

if (item.sender === 'me' && imgMatch) {
hasImage = true;
messages.push({
role: 'user',
content: [
{ type: "image_url", image_url: { url: imgMatch[1] } }
]
});
} else {
messages.push({
role: item.sender === 'me' ? 'user' : 'assistant',
content: text || ""
});
}
}
});

if (!isRegen && !hasNewUserMsg) {
messages.push({
role: "user",
content: "【系统指令】：我没有说话。请你顺着刚才的话题继续连发微信补充，或者开启一个新话题。"
});
}

let rawReply = "";
try {
rawReply = await PhoneAPI.chatWithAI(messages, false);
} catch (err) {
if (err.message.includes('content must be a string') || err.message.includes('cache_control') || (hasImage && err.message.includes('INVALID_ARGUMENT'))) {
messages[0].content = stablePrompt + dynamicPrompt;
messages = messages.map(m => {
if (Array.isArray(m.content)) {
return { role: m.role, content: "[用户发送了一张图片，但系统无法解析]" };
}
return m;
});
rawReply = await PhoneAPI.chatWithAI(messages, false);
} else {
throw err;
}
}

let photoPrompt = null;
const photoMatch = rawReply.match(/<photo>([\s\S]*?)<\/photo>/i);
if (photoMatch) {
photoPrompt = photoMatch[1].trim();
rawReply = rawReply.replace(/<photo>[\s\S]*?<\/photo>/gi, '').trim();
}

let purchaseHtml = null;
const purchaseMatch = rawReply.match(/<purchase>(.*)\|(\d+)<\/purchase>/i);
if (purchaseMatch) {
const itemName = purchaseMatch[1].trim();
const itemPrice = parseInt(purchaseMatch[2].trim());
let coins = parseInt(localStorage.getItem('my_coins') || '500');

if (coins >= itemPrice) {
coins -= itemPrice;
localStorage.setItem('my_coins', coins);
purchaseHtml = `<div class="chat-order-card"><div class="chat-order-header"><div>🛍️ 赛博订单自动生成</div><div>¥${itemPrice}</div></div><div class="chat-order-item"><div class="chat-order-item-name"><i class="ph-fill ph-package" style="color:var(--primary-color);"></i> ${itemName}</div><div>x1</div></div><div class="chat-order-meta"><div>✅ 支付状态：已自动扣款</div><div>💰 小金库剩余：${coins} 金币</div></div></div>`;
} else {
purchaseHtml = `<div class="chat-order-card" style="border-color:var(--danger-color);"><div class="chat-order-header" style="color:var(--danger-color);"><div>❌ 支付失败</div><div>¥${itemPrice}</div></div><div class="chat-order-item"><div class="chat-order-item-name">${itemName}</div></div><div class="chat-order-meta"><div>⚠️ 余额不足，当前仅剩 ${coins} 金币，请去打工赚钱！</div></div></div>`;
}
rawReply = rawReply.replace(/<purchase>[\s\S]*?<\/purchase>/gi, '').trim();
}

const innerMatch = rawReply.match(/<inner>([\s\S]*?)<\/inner>/i);
const innerThought = innerMatch ? innerMatch[1].trim() : "（TA的心思藏得很深，什么也没看出来...）";

let finalReply = rawReply.replace(/<think>[\s\S]*?<\/think>/gi, '')
.replace(/<inner>[\s\S]*?<\/inner>/gi, '')
.trim();
if (!finalReply) finalReply = rawReply.trim();

chatItems.pop();

const replyParts = finalReply.split('\n').map(s => s.trim()).filter(s => s.length > 0);

replyParts.forEach((part, idx) => {
let thought = (idx === 0) ? innerThought : "（连发消息，心声已在上一条显示）";
chatItems.push({ sender: 'other', content: part, time: timeStr, date: dateStr, innerThought: thought });
});

if (purchaseHtml) {
chatItems.push({ sender: 'me', content: purchaseHtml, time: timeStr, date: dateStr });
}

PhoneUI.renderAppContent('wechat');
localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));

if (photoPrompt) {
chatItems.push({ sender: 'typing' });
PhoneUI.renderAppContent('wechat');

try {
PhoneAPI.showToast("📸 他正在拍照，请稍候...");
const b64Json = await PhoneAPI.generateImageAPI(photoPrompt);
const finalB64 = await this.compressImage(b64Json);

chatItems.pop();

chatItems.push({
sender: 'other',
content: `![图片](${finalB64})`,
time: timeStr,
date: dateStr,
innerThought: "（拍张照给她看看吧...）"
});

if (!Config.phoneData[roleId].gallery) Config.phoneData[roleId].gallery = { items: [] };
Config.phoneData[roleId].gallery.items.push({
id: 'img_' + Date.now(),
content: finalB64,
date: dateStr
});

localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
PhoneUI.renderAppContent('wechat');
PhoneAPI.showToast("📸 照片已发送并存入相册！");

} catch (e) {
chatItems.pop();
PhoneUI.renderAppContent('wechat');
PhoneAPI.showToast("拍照失败：" + e.message);
}
}

} catch (error) {
PhoneAPI.showToast(error.message);
chatItems.pop();
if (hasNewUserMsg) chatItems.pop();
PhoneUI.renderAppContent('wechat');
localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
}
},

async sendNovelMessage(isRegen = false) {
const roleId = Config?.currentContactId;
if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
if (!Config.phoneData[roleId].novel) Config.phoneData[roleId].novel = { items: [] };

const chatItems = Config.phoneData[roleId].novel.items;

let hasNewUserMsg = false;
let latestUserText = "";
const now = new Date();
const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

if (!isRegen) {
const inputEl = document.getElementById('novel-input');
if (inputEl) {
const text = inputEl.value.trim();
if (text) {
chatItems.push({ sender: 'me', content: text, time: timeStr, date: dateStr });
inputEl.value = '';
hasNewUserMsg = true;
latestUserText = text;
}
}
} else {
for (let i = chatItems.length - 1; i >= 0; i--) {
if (chatItems[i].sender === 'me') {
latestUserText = chatItems[i].content;
break;
}
}
}

if (!isRegen && !hasNewUserMsg && chatItems.length === 0) return;

chatItems.push({ sender: 'typing', content: '...', time: timeStr });
PhoneUI.renderNovelContent();
localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));

try {
const myName = localStorage.getItem('my_name') || '我';
const banEmoji = localStorage.getItem('ban_emoji') === 'true';
const shareMemory = localStorage.getItem('share_memory') === 'true';

const systemPrompt = localStorage.getItem('system_prompt') || '';
const charPersona = localStorage.getItem('char_persona') || '';
const novelStyle = localStorage.getItem('novel_style') || '';

const currentNow = new Date();
const curHour = currentNow.getHours();
const curMin = currentNow.getMinutes();
const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
const curWeek = '星期' + weekDays[currentNow.getDay()];
let timePhase = "深夜";
if (curHour >= 5 && curHour < 9) timePhase = "清晨";
else if (curHour >= 9 && curHour < 12) timePhase = "上午";
else if (curHour >= 12 && curHour < 14) timePhase = "中午";
else if (curHour >= 14 && curHour < 18) timePhase = "下午";
else if (curHour >= 18 && curHour < 23) timePhase = "晚上";

let stablePrompt = `【系统时间感知】：当前剧情发生的时间是 ${currentNow.getFullYear()}年${currentNow.getMonth()+1}月${currentNow.getDate()}日 ${curWeek}，${timePhase} ${curHour.toString().padStart(2, '0')}:${curMin.toString().padStart(2, '0')}。请在环境描写或互动中自然地体现出当前的时间氛围。\n\n`;

if (systemPrompt) stablePrompt += `【系统核心指令】：\n${systemPrompt}\n\n`;
if (charPersona) stablePrompt += `【角色设定】：\n${charPersona}\n\n`;
if (novelStyle) stablePrompt += `【文风要求】：\n${novelStyle}\n\n`;

const minWords = localStorage.getItem('novel_min_words') || '150';

let formatRule = "【线下沉浸模式】：当前是面对面的真实场景。请用写小说/语C的笔法进行演绎。\n";
formatRule += `【字数与细节强制要求】：每次回复**必须不少于 ${minWords} 字**（不包含思维链的字数）！请尽情展开环境渲染、细腻的动作刻画和深度的心理描写，让场景充满画面感。绝对禁止像微信聊天那样只发短对话，必须像长篇小说的一段一样丰满！\n`;
formatRule += "【读心术机制】：在正式回复之前，你必须使用 <inner> 和 </inner> 标签包裹一段角色此刻真实的内心独白。严禁重复心声，必须产生全新心理活动！\n";
formatRule += "【动态交易机制】：如果剧情中发生了购买、点外卖、送礼等消费行为，你必须根据情境【自行编造商品名称和合理的金币价格】，并在回复最末尾加上 `<purchase>商品名称|价格数字</purchase>`。例如：`<purchase>双人豪华晚餐|120</purchase>`。系统会自动扣除金币并生成订单卡片。无消费行为时绝对不要输出此标签！\n";

if (banEmoji) formatRule += "【最高禁令】：绝对不允许使用任何 Emoji、颜文字、波浪号(~)，违者抹杀！\n";

const wbData = PhoneAPI.getWorldbookData();
const activeOfflineWb = wbData.filter(w => w.offline).map(w => w.content).join('\n');
if (activeOfflineWb) {
formatRule += `\n【当前生效的世界书/规则插件】：\n${activeOfflineWb}\n`;
}
stablePrompt += formatRule;
stablePrompt += `\n当前正在和你面对面互动的人是：【${myName}】。\n`;

let dynamicPrompt = "";
const allVault = PhoneAPI.getMemoryVault();
let accessibleVault = allVault;
if (!shareMemory) {
accessibleVault = allVault.filter(v => v.isCore || v.source === '线下故事');
}

if (latestUserText) {
dynamicPrompt += this._scanKeywords(latestUserText);
}

if (accessibleVault.length > 0) {
const recentVault = accessibleVault.slice(-5).map(v => `[${v.date}] ${v.source}: ${v.content}`).join('\n');
dynamicPrompt += `\n【长期记忆档案】：以下是你脑海中深刻的长期记忆，请在对话中自然地保持连贯：\n${recentVault}\n`;

if (hasNewUserMsg) {
const recallTriggers = ['你还记得', '昨天', '上次', '之前', '那个事', '还记得', '那次'];
const needsRecall = recallTriggers.some(t => latestUserText.includes(t));

if (needsRecall && accessibleVault.length > 5) {
const extendedVault = accessibleVault.slice(-20).map(v => `[${v.date}] ${v.source}: ${v.content}`).join('\n');
dynamicPrompt += `\n【系统提示(记忆检索触发)】：用户似乎在试图唤醒你的某段记忆。以下是你的扩展记忆库，请检索是否有相关内容，并以你的口吻作出回应：\n${extendedVault}\n`;
}
}
}

if (shareMemory) {
const wechatItems = Config?.phoneData?.[roleId]?.wechat?.items || [];
if (wechatItems.length > 0) {
const recentWechat = wechatItems.slice(-8).map(item => `${item.sender === 'me' ? '我' : 'TA'}: ${item.content}`).join('\n');
dynamicPrompt += `\n【跨频道记忆联动】：以下是你们最近在[线上微信]中的聊天记录，请在当前的线下剧情中自然体现出你记得这些对话：\n${recentWechat}\n`;
}
}

let systemContent = [];
if (stablePrompt) {
systemContent.push({
type: "text",
text: stablePrompt,
cache_control: { type: "ephemeral" }
});
}
if (dynamicPrompt) {
systemContent.push({
type: "text",
text: dynamicPrompt
});
}

let messages = [{ role: "system", content: systemContent.length > 0 ? systemContent : "You are a helpful assistant." }];

const MAX_CONTEXT = 20;
const recentItems = chatItems.slice(-MAX_CONTEXT);

recentItems.forEach(item => {
if (item.sender !== 'typing') {
messages.push({ role: item.sender === 'me' ? 'user' : 'assistant', content: item.content || "" });
}
});

if (!isRegen && !hasNewUserMsg) {
messages.push({
role: "user",
content: "【系统强制指令】：我（用户）当前没有任何动作或对话，可能正在安静等待，也可能已经离开了当前场景。请你完全以你的视角，顺着刚才的剧情继续往下描写（比如你接下来的行动、独自一人的状态、或是场景的过渡）。必须严格保持字数底线和小说画面感，不要向我提问，不要等待我回复！"
});
}

let rawReply = "";
try {
rawReply = await PhoneAPI.chatWithAI(messages, false);
} catch (err) {
if (err.message.includes('content must be a string') || err.message.includes('cache_control')) {
messages[0].content = stablePrompt + dynamicPrompt;
rawReply = await PhoneAPI.chatWithAI(messages, false);
} else {
throw err;
}
}

let purchaseHtml = null;
const purchaseMatch = rawReply.match(/<purchase>(.*)\|(\d+)<\/purchase>/i);
if (purchaseMatch) {
const itemName = purchaseMatch[1].trim();
const itemPrice = parseInt(purchaseMatch[2].trim());
let coins = parseInt(localStorage.getItem('my_coins') || '500');

if (coins >= itemPrice) {
coins -= itemPrice;
localStorage.setItem('my_coins', coins);
purchaseHtml = `<div class="chat-order-card"><div class="chat-order-header"><div>🛍️ 赛博订单自动生成</div><div>¥${itemPrice}</div></div><div class="chat-order-item"><div class="chat-order-item-name"><i class="ph-fill ph-package" style="color:var(--primary-color);"></i> ${itemName}</div><div>x1</div></div><div class="chat-order-meta"><div>✅ 支付状态：已自动扣款</div><div>💰 小金库剩余：${coins} 金币</div></div></div>`;
} else {
purchaseHtml = `<div class="chat-order-card" style="border-color:var(--danger-color);"><div class="chat-order-header" style="color:var(--danger-color);"><div>❌ 支付失败</div><div>¥${itemPrice}</div></div><div class="chat-order-item"><div class="chat-order-item-name">${itemName}</div></div><div class="chat-order-meta"><div>⚠️ 余额不足，当前仅剩 ${coins} 金币，请去打工赚钱！</div></div></div>`;
}
rawReply = rawReply.replace(/<purchase>[\s\S]*?<\/purchase>/gi, '').trim();
}

const innerMatch = rawReply.match(/<inner>([\s\S]*?)<\/inner>/i);
const innerThought = innerMatch ? innerMatch[1].trim() : "（TA的心思藏得很深，什么也没看出来...）";

let finalReply = rawReply.replace(/<think>[\s\S]*?<\/think>/gi, '')
.replace(/<inner>[\s\S]*?<\/inner>/gi, '')
.trim();
if (!finalReply) finalReply = rawReply.trim();

chatItems.pop();

chatItems.push({ sender: 'other', content: finalReply, time: timeStr, date: dateStr, innerThought: innerThought });

if (purchaseHtml) {
chatItems.push({ sender: 'me', content: purchaseHtml, time: timeStr, date: dateStr });
}

PhoneUI.renderNovelContent();
localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));

} catch (error) {
PhoneAPI.showToast(error.message);
chatItems.pop();
if (hasNewUserMsg) chatItems.pop();
PhoneUI.renderNovelContent();
localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
}
},

async generateDiary(dateStr) {
const contentAreaEl = document.getElementById('diary-content-area');
if (!contentAreaEl) return;

contentAreaEl.innerHTML = `
<div class="notebook-empty">
<i class="ph-fill ph-spinner spin-anim" style="font-size: 48px; color: rgba(0,0,0,0.5); margin-bottom: 15px;"></i>
<p>正在偷看他的内心世界...</p>
</div>
`;

try {
const roleId = Config?.currentContactId;
const wechatItems = (Config?.phoneData?.[roleId]?.wechat?.items || []).filter(i => i.date === dateStr).map(i => ({ ...i, source: '线上微信' }));
const novelItems = (Config?.phoneData?.[roleId]?.novel?.items || []).filter(i => i.date === dateStr).map(i => ({ ...i, source: '线下故事' }));

let combinedItems = [...wechatItems, ...novelItems];
combinedItems.sort((a, b) => (a.time || "").localeCompare(b.time || ""));

const recentItems = combinedItems.slice(-80);
let historyText = recentItems.map(item => `[${item.source}] ${item.time || ''} ${item.sender === 'me' ? '我' : 'TA'}: ${item.content}`).join('\n');

if (!historyText) historyText = "(今天你们没有聊天或互动，请根据你的人设，写一篇平淡但符合你性格的日常日记。)";

const systemPrompt = localStorage.getItem('system_prompt') || '';
const charPersona = localStorage.getItem('char_persona') || '';

let contextSetup = "";
if (systemPrompt) contextSetup += `【系统核心指令】：\n${systemPrompt}\n\n`;
if (charPersona) contextSetup += `【角色设定】：\n${charPersona}\n\n`;

let stablePrompt = `你现在完全进入角色。以下是你的底层设定：\n${contextSetup}`;
let dynamicPrompt = `【重要时间设定】：今天是 ${dateStr}。
请根据以下你和“我”在【今天的实际聊天与互动记录】，用【第一人称（你的视角）】写一篇今天的深夜日记。
要求：
1. 字数在 150-300 字之间。
2. 绝对符合你的人设（比如傲娇、毒舌、表面嫌弃实际在意等）。
3. 必须是一篇真实的日记，不要提及“AI”、“用户”等词汇。
4. 综合线上线下的事情来写，让日记显得连贯真实。
【最高禁令】：绝对禁止输出任何分析过程、思考步骤、任务拆解！不要出现“分析任务”、“思考”等字眼！直接以日记的正文开头！

今天的互动记录：
${historyText}`;

let messages = [{
role: "user",
content: [
{ type: "text", text: stablePrompt, cache_control: { type: "ephemeral" } },
{ type: "text", text: dynamicPrompt }
]
}];

let reply = "";
try {
reply = await PhoneAPI.chatWithAI(messages, true);
} catch (err) {
if (err.message.includes('content must be a string') || err.message.includes('cache_control')) {
messages = [{ role: "user", content: stablePrompt + "\n" + dynamicPrompt }];
reply = await PhoneAPI.chatWithAI(messages, true);
} else {
throw err;
}
}

let finalDiary = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
finalDiary = finalDiary.replace(/```.*?/g, '').replace(/```/g, '').trim();

PhoneAPI.saveDiary(dateStr, finalDiary);
PhoneUI.renderDiaryPage();
PhoneAPI.showToast('✨ 日记生成成功！');

} catch (error) {
contentAreaEl.innerHTML = `
<div class="notebook-empty">
<i class="ph-fill ph-warning-circle" style="font-size: 48px; color: var(--danger-color); margin-bottom: 15px;"></i>
<p style="color: var(--danger-color);">偷看失败：${error.message}</p>
<button class="btn-refresh" onclick="window.PhoneUI.renderDiaryPage()" style="width: auto; padding: 10px 20px; margin-top: 15px;">返回重试</button>
</div>
`;
}
}
};

if (typeof window !== 'undefined') {
window.PhoneEngine = PhoneEngine;
}
