export const PhoneUI = {
currentMomentsTab: 'feed', // 🌟 新增：记录当前情侣空间停留在哪个 Tab

renderAppContent(appId) {
const roleId = window.Config?.currentContactId;
if (!roleId) return;

let data = window.Config?.phoneData?.[roleId]?.[appId];
if (!data && appId !== 'gallery' && appId !== 'memory_vault' && appId !== 'moments' && appId !== 'favorites') return;

if (appId !== 'gallery' && appId !== 'memory_vault' && appId !== 'moments' && appId !== 'favorites' && data && data.items && data.items.length > 50) {
data = { ...data, items: data.items.slice(-50) };
}

const listEl = document.getElementById('app-content-list');

if (listEl && window.Apps && window.Apps[appId]) {
let renderData = JSON.parse(JSON.stringify(data));
if (Array.isArray(renderData.items)) {
renderData.items.forEach(item => {
if (item && typeof item.content === 'string' && item.content.includes('[发送了表情包：')) {
const urlMatch = item.content.match(/(https?:\/\/[^\s\)]+)/);
if (urlMatch) {
const safeUrl = this.escapeHtml(urlMatch[1]);
item.content = `<img src="${safeUrl}" class="chat-sticker">`;
}
}
});
}
listEl.innerHTML = window.Apps[appId].renderList(renderData);

setTimeout(() => { 
    if (listEl) listEl.scrollTop = listEl.scrollHeight; 
}, 100);

if (appId === 'wechat') this.updateHomeWidget();
} else if (appId === 'gallery') {
this.renderGallery();
} else if (appId === 'settings') {
this.renderSettings();
} else if (appId === 'worldbook') {
this.renderWorldbook();
} else if (appId === 'moments') {
this.renderMoments();
} else if (appId === 'favorites') {
if (this.currentMomentsTab === 'favorites') {
    this.renderMoments();
}
}
},

async updateHomeWidget() {
    try {
        const daysEl = document.getElementById('home-love-days');
        if (daysEl) {
            const startDateStr = localStorage.getItem('love_start_date') || localStorage.getItem('diary_start_date');
            if (startDateStr) {
                const start = new Date(startDateStr); const now = new Date();
                daysEl.innerText = Math.floor(Math.abs(now - start) / (1000 * 60 * 60 * 24));
            } else { daysEl.innerText = '0'; }
        }

        const noteContentEl = document.getElementById('note-content');
        if (noteContentEl) noteContentEl.innerText = localStorage.getItem('home_note_content') || '“今天也要开心哦！”';

        const calGrid = document.getElementById('home-cal-grid');
        if (calGrid) {
            const now = new Date();
            const y = now.getFullYear(), m = now.getMonth(), today = now.getDate();
            const first = new Date(y, m, 1).getDay();
            const days = new Date(y, m + 1, 0).getDate();
            let html = '';
            for (let i = 0; i < first; i++) html += '<span></span>';
            for (let d = 1; d <= days; d++) {
                html += d === today ? `<span class="today">${d}</span>` : `<span>${d}</span>`;
            }
            calGrid.innerHTML = html;
        }

        this.renderCountdown();

        const polaroidText = document.getElementById('polaroid-text');
        if (polaroidText && window.PhoneAPI && window.PhoneAPI.EchoVault) {
            try {
                const evData = window.PhoneAPI.EchoVault.getData();
                const dates = Object.keys(evData.daily).sort((a, b) => new Date(b) - new Date(a));
                let foundText = false;
                for (let date of dates) {
                    if (evData.daily[date] && evData.daily[date].content) {
                        let text = evData.daily[date].content.replace(/---/g, '').trim();
                        if (text) {
                            if (text.length > 35) text = text.substring(0, 35) + '...';
                            polaroidText.innerText = `“${text}”`;
                            foundText = true;
                            break;
                        }
                    }
                }
                if (!foundText) polaroidText.innerText = "“我们的故事才刚刚开始...”";
            } catch(e) {
                polaroidText.innerText = "“我们的故事才刚刚开始...”";
            }
        }

        if (window.PhoneAPI && window.PhoneAPI.LocalDB) {
            const elements = document.querySelectorAll('[data-img]');
            for (const el of elements) {
                const key = el.dataset.img;
                try {
                    const blob = await window.PhoneAPI.LocalDB.get(key);
                    if (blob) {
                        const url = window.PhoneAPI.LocalDB.urlOf(key, blob);
                        if (el.tagName.toLowerCase() === 'img') el.src = url;
                        else {
                            const imgChild = el.querySelector('img');
                            if (imgChild) imgChild.src = url;
                        }
                    }
                } catch(e) {}
            }
        }
    } catch(e) {
        console.error("更新首页 Widget 失败:", e);
    }
},

bindLongPresses() {
    const elements = document.querySelectorAll('.long-pressable');
    const fileInput = document.getElementById('global-file-input');
    let holdTimer = null, pendingKey = null, pendingEl = null;

    elements.forEach(el => {
        const key = el.dataset.img;
        const start = () => {
            el.classList.add('holding');
            clearTimeout(holdTimer);
            holdTimer = setTimeout(() => {
                el.classList.remove('holding');
                pendingKey = key; pendingEl = el;
                if (fileInput) fileInput.click();
            }, 500);
        };
        const cancel = () => { clearTimeout(holdTimer); el.classList.remove('holding'); };

        el.addEventListener('touchstart', start, { passive: true });
        el.addEventListener('touchend', cancel);
        el.addEventListener('touchmove', cancel, { passive: true });
        el.addEventListener('mousedown', start);
        el.addEventListener('mouseup', cancel);
        el.addEventListener('mouseleave', cancel);
        el.addEventListener('contextmenu', e => e.preventDefault());
    });

    if (fileInput) {
        fileInput.addEventListener('change', async e => {
            const f = e.target.files && e.target.files[0];
            e.target.value = '';
            if (!f || !pendingKey) return;
            if (window.PhoneAPI) window.PhoneAPI.showToast('处理中...');
            try {
                const blob = await window.PhoneAPI.LocalDB.shrink(f, 800);
                await window.PhoneAPI.LocalDB.set(pendingKey, blob);
                const url = window.PhoneAPI.LocalDB.urlOf(pendingKey, blob);
                
                if (pendingEl.tagName.toLowerCase() === 'img') {
                    pendingEl.src = url;
                } else {
                    if (pendingKey.startsWith('bg_')) {
                        let cssVar = '--bg-image-' + pendingKey.replace('bg_', '').replace(/_/g, '-');
                        if (pendingKey === 'bg_global') cssVar = '--bg-image-global';
                        document.documentElement.style.setProperty(cssVar, `url('${url}')`);
                    } else {
                        const imgChild = pendingEl.querySelector('img');
                        if (imgChild) imgChild.src = url;
                    }
                }
                if (window.PhoneAPI) window.PhoneAPI.showToast('✨ 换图成功！已永久保存在本地。');
            } catch (err) { if (window.PhoneAPI) window.PhoneAPI.showToast('换图失败'); }
            pendingKey = null; pendingEl = null;
        });
    }
},

renderCountdown() {
    const cfgRaw = localStorage.getItem('cc_countdown');
    const cfg = cfgRaw ? JSON.parse(cfgRaw) : { title: '见到你', date: '2025-05-09', pre: '还有', suf: '天' };
    
    const titleEl = document.getElementById('cd-title-display');
    const dateEl = document.getElementById('cd-date-display');
    const preEl = document.getElementById('cd-pre-display');
    const numEl = document.getElementById('cd-num-display');
    const sufEl = document.getElementById('cd-suf-display');
    
    if (!numEl) return;
    
    const t = new Date(cfg.date + 'T00:00:00');
    const a = new Date(); a.setHours(0, 0, 0, 0);
    const diff = Math.round((t - a) / 86400000);
    
    if (titleEl) titleEl.innerText = cfg.title || (diff < 0 ? '已经过去' : '见到你');
    if (dateEl) dateEl.innerText = cfg.date.replace(/-/g, '.');
    if (preEl) preEl.innerText = cfg.pre || (diff < 0 ? '已经' : '还有');
    if (sufEl) sufEl.innerText = cfg.suf || '天';
    numEl.innerText = Math.abs(diff);
},

openCdSheet() {
    const cfgRaw = localStorage.getItem('cc_countdown');
    const cfg = cfgRaw ? JSON.parse(cfgRaw) : { title: '见到你', date: '2025-05-09', pre: '还有', suf: '天' };
    document.getElementById('cd-in-title').value = cfg.title;
    document.getElementById('cd-in-date').value = cfg.date;
    document.getElementById('cd-in-pre').value = cfg.pre;
    document.getElementById('cd-in-suf').value = cfg.suf;
    
    document.getElementById('cd-modal-bg').classList.add('show');
    document.getElementById('cd-modal').classList.add('show');
},

closeCdSheet() {
    document.getElementById('cd-modal-bg').classList.remove('show');
    document.getElementById('cd-modal').classList.remove('show');
},

saveCdSheet() {
    const date = document.getElementById('cd-in-date').value;
    if (!date) { if (window.PhoneAPI) window.PhoneAPI.showToast('请先挑个日子！'); return; }
    const cfg = {
        title: document.getElementById('cd-in-title').value.trim(),
        date: date,
        pre: document.getElementById('cd-in-pre').value.trim(),
        suf: document.getElementById('cd-in-suf').value.trim()
    };
    localStorage.setItem('cc_countdown', JSON.stringify(cfg));
    this.renderCountdown();
    this.closeCdSheet();
    if (window.PhoneAPI) window.PhoneAPI.showToast('✅ 倒数日已更新！');
},

openNoteModal() {
const bg = document.getElementById('note-modal-bg');
const modal = document.getElementById('note-modal');
const input = document.getElementById('note-input');
if (bg) bg.classList.add('show');
if (modal) modal.classList.add('show');
if (input) { input.value = ''; setTimeout(() => input.focus(), 100); }
},

closeNoteModal() {
const bg = document.getElementById('note-modal-bg');
const modal = document.getElementById('note-modal');
if (bg) bg.classList.remove('show');
if (modal) modal.classList.remove('show');
},

async sendNote() {
const input = document.getElementById('note-input');
if (!input) return;
const text = input.value.trim();
if (!text) { if (window.PhoneAPI) window.PhoneAPI.showToast('纸条不能是空的哦！'); return; }
this.closeNoteModal();
localStorage.setItem('home_note_content', `“${text}”`);
this.updateHomeWidget();
if (window.PhoneAPI) window.PhoneAPI.showToast('纸条已递出，等待 TA 的回复...');

try {
const persona = localStorage.getItem('char_persona') || '';
const myName = localStorage.getItem('my_name') || '我';
const taName = localStorage.getItem('char_name') || 'TA';
let sysPrompt = `你扮演${taName}，用户是${myName}。${persona}\n请根据用户传给你的纸条内容，回复一张纸条。要求：\n1. 必须非常简短，一两句话，20字以内。\n2. 语气符合你的人设，像是在小纸条上随手写的。\n3. 不要任何动作描写，只输出纸条上的话。`;
const messages = [ { role: 'system', content: sysPrompt }, { role: 'user', content: `[传纸条] ${text}` } ];
const reply = await window.PhoneAPI.chatWithAI(messages);
if (reply) {
localStorage.setItem('home_note_content', `“${reply}”`);
this.updateHomeWidget();
if (window.PhoneAPI) window.PhoneAPI.showToast('收到 TA 的纸条回信啦！');
}
} catch (error) { if (window.PhoneAPI) window.PhoneAPI.showToast('TA 好像没看到纸条...'); }
},

renderNovelContent() {
const listEl = document.getElementById('novel-content-list');
if (!listEl) return;
const roleId = window.Config?.currentContactId;
if (!roleId) return;
const items = window.Config?.phoneData?.[roleId]?.novel?.items || [];

const myAvatar = localStorage.getItem('my_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=Me&backgroundColor=e8f0fa';
const taAvatar = localStorage.getItem('ta_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=TA&backgroundColor=e8f0fa';
const myName = localStorage.getItem('my_name') || '我';
const taName = localStorage.getItem('char_name') || 'TA';

let html = '';
items.forEach((item, idx) => {
if (item.sender === 'typing') {
html += `<div class="story-item other typing" style="opacity:0.6;"><img class="story-avatar" src="${taAvatar}"><div class="story-content-wrapper"><div class="story-name-row"><span class="story-name">${taName}</span></div><div class="story-bubble">...</div></div></div>`;
return;
}
const isMe = item.sender === 'me';
const avatar = isMe ? myAvatar : taAvatar;
const name = isMe ? myName : taName;
let parsed = window.marked ? window.marked.parse(item.content || '') : (item.content || '');
let thoughtHtml = '';
if (!isMe && item.innerThought) {
thoughtHtml = `<div class="story-thought-icon" onclick="window.PhoneUI.showThought(${idx}, 'novel'); event.stopPropagation();"><i class="ph-fill ph-cloud"></i></div>`;
}
html += `<div class="story-item ${isMe ? 'me' : 'other'}"><img class="story-avatar" src="${avatar}"><div class="story-content-wrapper"><div class="story-name-row"><span class="story-name">${name}</span>${thoughtHtml}</div><div class="story-bubble markdown-body" onclick="if(window.PhoneEngine) window.PhoneEngine.openMsgMenu(${idx}, '${item.sender}')">${parsed}</div></div></div>`;
});
listEl.innerHTML = html;

setTimeout(() => { 
    const listEl = document.getElementById('novel-content-list');
    if (listEl) listEl.scrollTop = listEl.scrollHeight;
}, 100);
},

escapeHtml(str) {
if (str === null || str === undefined) return '';
return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
},

toggleTheme() {
const currentTheme = document.documentElement.getAttribute('data-theme');
const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
document.documentElement.setAttribute('data-theme', newTheme);
localStorage.setItem('theme', newTheme);
const icon = document.getElementById('theme-icon');
if (icon) {
if (newTheme === 'dark') { icon.classList.remove('ph-moon'); icon.classList.add('ph-sun'); } 
else { icon.classList.remove('ph-sun'); icon.classList.add('ph-moon'); }
}
},

toggleChatMenu() {
const menu = document.getElementById('chat-plus-menu');
const btn = document.getElementById('btn-plus');
if (!menu || !btn) return;
if (menu.classList.contains('show')) { this.closeChatMenu(); } else { menu.classList.add('show'); btn.style.transform = 'rotate(45deg)'; }
},
closeChatMenu() {
const menu = document.getElementById('chat-plus-menu');
const btn = document.getElementById('btn-plus');
if (menu) menu.classList.remove('show');
if (btn) btn.style.transform = 'rotate(0deg)';
},

openWbToggleModal(mode) {
const listEl = document.getElementById('wb-toggle-list');
const titleEl = document.getElementById('wb-toggle-title');
if (!listEl || !titleEl) return;
titleEl.innerHTML = `<i class="ph-fill ph-puzzle-piece"></i> 规则插件挂载 (${mode === 'online' ? '线上微信' : '线下故事'})`;
const wbData = window.PhoneAPI ? window.PhoneAPI.getWorldbookData() : [];
let html = '';
wbData.forEach(wb => {
const isChecked = mode === 'online' ? wb.online : wb.offline;
html += `<div style="display:flex;justify-content:space-between;align-items:center;background:var(--icon-bg);padding:12px;border-radius:12px;border:1px solid var(--border-color);"><div style="font-size:13px;font-weight:bold;color:var(--text-main);">${this.escapeHtml(wb.title)}</div><label class="switch"><input type="checkbox" ${isChecked ? 'checked' : ''} onchange="if(window.PhoneAPI) window.PhoneAPI.toggleWorldbook('${this.escapeHtml(wb.id)}','${mode}',this.checked)"><span class="slider"></span></label></div>`;
});
if (wbData.length === 0) { html = `<div style="text-align:center;color:var(--text-sub);padding:20px 0;">暂无规则，请去 Home 页【世界书】添加！</div>`; }
listEl.innerHTML = html;
const bg = document.getElementById('wb-toggle-modal-bg');
const modal = document.getElementById('wb-toggle-modal');
if (bg) bg.classList.add('show');
if (modal) modal.classList.add('show');
},
closeWbToggleModal() {
const bg = document.getElementById('wb-toggle-modal-bg');
const modal = document.getElementById('wb-toggle-modal');
if (bg) bg.classList.remove('show');
if (modal) modal.classList.remove('show');
},

toggleStickerPanel() {
const panel = document.getElementById('sticker-panel');
if (!panel) return;
if (panel.classList.contains('show')) { this.closeStickerPanel(); } else { this.closeChatMenu(); this.renderStickers(); panel.classList.add('show'); }
},
closeStickerPanel() {
const panel = document.getElementById('sticker-panel');
if (panel) panel.classList.remove('show');
},

async importStickers() {
const text = await this.showCustomPrompt("📦 批量导入表情包", "请直接粘贴你的文档内容，格式如：\n让我摸摸:\nhttps://...gif\n害羞了:\nhttps://...gif\n（清空所有表情包请输入：CLEAR）");
if (!text) return;
if (text.trim() === 'CLEAR') {
if (confirm("确定要清空所有表情包吗？")) { localStorage.removeItem('custom_stickers'); this.renderStickers(); if (window.PhoneAPI) window.PhoneAPI.showToast("🗑️ 表情包已清空"); }
return;
}
const lines = text.split('\n'); let newStickers = []; let currentName = "未命名表情"; const urlRegex = /(https?:\/\/[^\s]+)/;
lines.forEach(line => {
const str = line.trim(); if (!str) return;
const urlMatch = str.match(urlRegex);
if (urlMatch) {
const url = urlMatch[1]; let name = str.replace(url, '').replace(/[:：]/g, '').trim();
if (!name && currentName !== "未命名表情") { name = currentName; currentName = "未命名表情"; } else if (!name) { name = "表情" + Math.floor(Math.random() * 1000); }
newStickers.push({ name, url });
} else { currentName = str.replace(/[:：]/g, '').trim(); }
});
if (newStickers.length > 0) {
let existing = JSON.parse(localStorage.getItem('custom_stickers') || '[]'); existing = [...existing, ...newStickers];
localStorage.setItem('custom_stickers', JSON.stringify(existing)); this.renderStickers(); if (window.PhoneAPI) window.PhoneAPI.showToast(`✅ 成功解析并导入 ${newStickers.length} 个表情包！`);
} else { if (window.PhoneAPI) window.PhoneAPI.showToast(`❌ 未识别到任何有效链接`); }
},

renderStickers() {
const panel = document.getElementById('sticker-panel');
if (!panel) return;
const stickers = JSON.parse(localStorage.getItem('custom_stickers') || '[]');
let html = `<div class="sticker-add-btn" onclick="window.PhoneUI.importStickers()"><i class="ph ph-plus" style="font-size:24px;"></i><span style="font-size:10px;margin-top:4px;">导入</span></div>`;
stickers.forEach(st => {
const safeName = this.escapeHtml(st.name); const safeUrl = this.escapeHtml(st.url);
html += `<div class="sticker-item" onclick="if(window.PhoneEngine) window.PhoneEngine.sendSticker('${safeName}','${safeUrl}')" title="${safeName}"><img src="${safeUrl}" alt="${safeName}"></div>`;
});
panel.innerHTML = html;
},

toggleStoryMenu() {
const menu = document.getElementById('story-plus-menu');
const btn = document.getElementById('btn-story-plus');
if (!menu || !btn) return;
if (menu.classList.contains('show')) { this.closeStoryMenu(); } else { menu.classList.add('show'); btn.style.transform = 'rotate(45deg)'; }
},
closeStoryMenu() {
const menu = document.getElementById('story-plus-menu');
const btn = document.getElementById('btn-story-plus');
if (menu) menu.classList.remove('show');
if (btn) btn.style.transform = 'rotate(0deg)';
},

openArchiveModal() {
this.renderArchiveList();
const bg = document.getElementById('archive-modal-bg');
const modal = document.getElementById('archive-modal');
if (bg) bg.classList.add('show');
if (modal) modal.classList.add('show');
},
closeArchiveModal() {
const bg = document.getElementById('archive-modal-bg');
const modal = document.getElementById('archive-modal');
if (bg) bg.classList.remove('show');
if (modal) modal.classList.remove('show');
},

renderArchiveList() {
const listEl = document.getElementById('archive-list');
if (!listEl) return;
const archives = window.PhoneAPI ? window.PhoneAPI.getArchives() : [];
if (archives.length === 0) { listEl.innerHTML = '<div style="text-align:center;color:var(--text-sub);padding:20px 0;">暂无存档</div>'; return; }
let html = '';
[...archives].reverse().forEach(arc => {
html += `<div class="archive-item"><div class="archive-info"><div class="archive-name">${this.escapeHtml(arc.name)}</div><div class="archive-meta">${this.escapeHtml(arc.date)} · ${arc.count} 条记录</div></div><div class="archive-actions"><button class="archive-btn load" onclick="if(window.PhoneAPI) window.PhoneAPI.loadArchive('${this.escapeHtml(arc.id)}')">读取</button><button class="archive-btn del" onclick="if(window.PhoneAPI) window.PhoneAPI.deleteArchive('${this.escapeHtml(arc.id)}')">删除</button></div></div>`;
});
listEl.innerHTML = html;
},

showCustomPrompt(title, defaultValue = '') {
return new Promise(resolve => {
const bg = document.getElementById('custom-prompt-bg');
const modal = document.getElementById('custom-prompt-modal');
const titleEl = document.getElementById('custom-prompt-title');
const inputEl = document.getElementById('custom-prompt-input');
const btnConfirm = document.getElementById('custom-prompt-confirm');
const btnCancel = document.getElementById('custom-prompt-cancel');
if (!bg || !modal || !titleEl || !inputEl || !btnConfirm || !btnCancel) { resolve(null); return; }
titleEl.innerText = title; inputEl.value = defaultValue;
bg.classList.add('show'); modal.classList.add('show');
const cleanup = () => { bg.classList.remove('show'); modal.classList.remove('show'); btnConfirm.onclick = null; btnCancel.onclick = null; };
btnConfirm.onclick = () => { const value = inputEl.value; cleanup(); resolve(value); };
btnCancel.onclick = () => { cleanup(); resolve(null); };
});
},

openApiModal() {
const bg = document.getElementById('api-modal-bg');
const modal = document.getElementById('api-modal');
if (bg) bg.classList.add('show');
if (modal) modal.classList.add('show');
},
closeApiModal() {
const bg = document.getElementById('api-modal-bg');
const modal = document.getElementById('api-modal');
if (bg) bg.classList.remove('show');
if (modal) modal.classList.remove('show');
},

switchSetTab(tabId) {
['basic', 'ai', 'draw', 'sys'].forEach(id => {
const tab = document.getElementById('stab-' + id);
const sec = document.getElementById('set-sec-' + id);
if (tab) tab.classList.remove('active');
if (sec) sec.classList.remove('active');
});
const activeTab = document.getElementById('stab-' + tabId);
const activeSec = document.getElementById('set-sec-' + tabId);
if (activeTab) activeTab.classList.add('active');
if (activeSec) activeSec.classList.add('active');
},

openApp(appId, appName) {
if (window.Config) window.Config.currentAppId = appId;
const titleEl = document.getElementById('app-window-title');
const winEl = document.getElementById('app-window');
const contentEl = document.getElementById('app-window-content');

if (!titleEl || !winEl || !contentEl) return;

titleEl.innerText = appName;
winEl.classList.add('open');

contentEl.style.padding = '20px';
contentEl.style.background = 'transparent';
contentEl.style.display = 'block';
contentEl.style.flexDirection = 'row';
contentEl.style.height = 'auto';
contentEl.style.overflow = 'auto'; 

if (appId === 'diary') { winEl.classList.add('fullscreen-mode'); } else { winEl.classList.remove('fullscreen-mode'); }

if (appId === 'novel') {
contentEl.style.padding = '0';
contentEl.style.display = 'flex';
contentEl.style.flexDirection = 'column';
contentEl.style.overflow = 'hidden'; 
contentEl.innerHTML = `
<div id="novel-content-list" class="story-bg" onclick="window.PhoneUI.closeStoryMenu();" style="flex: 1; overflow-y: auto; min-height: 0; padding: 20px 15px;"></div>
<div style="position: relative; flex-shrink: 0; background: var(--window-bg); padding: 10px 15px 20px 15px; z-index: 20; border-top: 1px solid var(--border-color);">
    <div id="story-plus-menu" class="story-menu" style="bottom: 100%; margin-bottom: 0;">
        <div class="story-menu-item" onclick="window.PhoneUI.openWbToggleModal('offline');window.PhoneUI.closeStoryMenu();"><div class="icon"><i class="ph-fill ph-puzzle-piece" style="color:#2a9d8f;"></i></div><div class="text">规则挂载</div></div>
        <div class="story-menu-item" onclick="if(window.PhoneEngine) window.PhoneEngine.extractMemory('novel');window.PhoneUI.closeStoryMenu();"><div class="icon"><i class="ph-fill ph-brain"></i></div><div class="text">提取记忆</div></div>
        <div class="story-menu-item" onclick="if(window.PhoneEngine) window.PhoneEngine.washMemory('novel');window.PhoneUI.closeStoryMenu();"><div class="icon"><i class="ph-fill ph-broom" style="color:#f4a261;"></i></div><div class="text">记忆洗地</div></div>
        <div class="story-menu-item" onclick="window.PhoneUI.openArchiveModal();window.PhoneUI.closeStoryMenu();"><div class="icon"><i class="ph-fill ph-floppy-disk"></i></div><div class="text">存档室</div></div>
    </div>
    <div class="story-input-bar" style="margin: 0; padding: 0; box-shadow: none; border: none; background: transparent; display: flex; align-items: flex-end; gap: 10px;">
        <div class="icon-btn" id="btn-story-plus" onclick="window.PhoneUI.toggleStoryMenu();"><i class="ph ph-plus-circle"></i></div>
        <textarea id="novel-input" class="story-textarea" placeholder="书写你们的故事..." onclick="window.PhoneUI.closeStoryMenu();" style="background: var(--input-bg); padding: 10px 15px; border-radius: 20px; border: 1px solid var(--border-color);"></textarea>
        <button class="story-send-btn" onclick="if(window.PhoneEngine) window.PhoneEngine.sendNovelMessage();window.PhoneUI.closeStoryMenu();"><i class="ph-fill ph-paper-plane-right"></i></button>
    </div>
</div>`;
this.renderNovelContent();
} else if (appId === 'diary') {
const diaryTitle = localStorage.getItem('diary_title') || 'His Diary';
contentEl.innerHTML = `<div id="diary-cover-view" class="diary-cover-view"><div class="diary-book-cover long-pressable" data-img="bg_diary_cover" id="diary-book-cover" onclick="window.PhoneUI.unlockDiary()"><div class="diary-title">${this.escapeHtml(diaryTitle)}</div><div class="diary-hint">点击翻开日记</div></div><div class="diary-back-btn" onclick="window.PhoneUI.closeApp()"><i class="ph ph-caret-left"></i></div></div><div id="diary-inside-view" class="diary-inside-view" ontouchstart="window.PhoneUI.handleSwipeStart(event)" ontouchend="window.PhoneUI.handleSwipeEnd(event)"><div class="diary-back-btn" onclick="window.PhoneUI.closeApp()" style="top:20px;left:15px;background:rgba(0,0,0,0.1);color:#333;z-index:50;"><i class="ph ph-caret-left"></i></div><div id="diary-content-area" style="display:flex;flex-direction:column;height:100%;"></div></div>`;
this.renderDiaryPage();
this.bindLongPresses();
} else if (appId === 'memory_vault') {
if (window.Config) window.Config.memoryVaultTab = 'daily';
contentEl.innerHTML = `
<div class="vault-tabs"><div class="vault-tab active" id="tab-daily" onclick="window.PhoneUI.switchVaultTab('daily')">日常 (Daily)</div><div class="vault-tab" id="tab-permanent" onclick="window.PhoneUI.switchVaultTab('permanent')">锚点 (Permanent)</div></div>
<button class="btn-refresh" onclick="window.PhoneUI.remindEchoVault()" style="margin-top: 0; margin-bottom: 15px; background: linear-gradient(135deg, #a78bfa, #8b5cf6); border-radius: 16px; box-shadow: 0 4px 15px rgba(167, 139, 250, 0.4);"><i class="ph-fill ph-bottle"></i> 捞一个漂流瓶</button>
<div id="vault-content-area" style="padding-bottom: 80px;"></div>`;
this.renderMemoryVault();
} else if (appId === 'favorites') {
this.renderFavorites();
} else if (appId === 'settings') {
this.renderSettings();
} else if (appId === 'worldbook') {
this.renderWorldbook();
}
},

switchMomentsTab(tab) {
    this.currentMomentsTab = tab;
    this.renderMoments();
},

renderMoments() {
    const contentEl = document.getElementById('moments-content-area');
    if (!contentEl) return;
    
    const myAvatar = localStorage.getItem('my_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=Me&backgroundColor=e8f0fa';
    const taAvatar = localStorage.getItem('ta_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=TA&backgroundColor=e8f0fa';
    const myName = localStorage.getItem('my_name') || '我';
    const taName = localStorage.getItem('char_name') || 'TA';
    
    const coverImg = localStorage.getItem('bg_moments_cover') || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=1000&auto=format&fit=crop';
    document.documentElement.style.setProperty('--bg-image-moments-cover', `url('${coverImg}')`);
    
    const currentTab = this.currentMomentsTab || 'feed';
    let bottomHtml = '';
    
    if (currentTab === 'feed') {
        bottomHtml = `
            <div class="moment-card">
                <img class="moment-avatar" src="${myAvatar}">
                <div class="moment-body">
                    <div class="moment-name">${myName}</div>
                    <div class="moment-text">今天数学课听得我头都要炸了！！！好想吃宵夜啊啊啊</div>
                    <div class="moment-footer">
                        <span>2分钟前</span>
                        <div class="moment-actions">
                            <i class="ph ph-heart"></i>
                            <i class="ph ph-chat-circle"></i>
                        </div>
                    </div>
                    <div class="moment-comments-area">
                        <div class="comment-item"><i class="ph-fill ph-heart" style="color: var(--danger-color); font-size: 12px;"></i> ${taName}</div>
                        <div class="comment-item"><span class="c-name">${taName}:</span> 笨。哪题不会，拍过来我教你。吃宵夜的话，我顺路给你带。</div>
                    </div>
                </div>
            </div>
            
            <div class="moment-card">
                <img class="moment-avatar" src="${taAvatar}">
                <div class="moment-body">
                    <div class="moment-name">${taName}</div>
                    <div class="moment-text">某人今天肚子疼，还非要喝冰奶茶，记仇。</div>
                    <div class="moment-footer">
                        <span>1小时前</span>
                        <div class="moment-actions">
                            <i class="ph-fill ph-heart" style="color: var(--danger-color);"></i>
                            <i class="ph ph-chat-circle"></i>
                        </div>
                    </div>
                    <div class="moment-comments-area">
                        <div class="comment-item"><i class="ph-fill ph-heart" style="color: var(--danger-color); font-size: 12px;"></i> ${myName}</div>
                        <div class="comment-item"><span class="c-name">${myName}:</span> 我错了嘛！下次不敢了QAQ</div>
                        <div class="comment-item"><span class="c-name">${taName}:</span> 呵，你的下次不敢我听过八百遍了。</div>
                    </div>
                </div>
            </div>
        `;
    } else if (currentTab === 'favorites') {
        const favs = window.PhoneAPI ? window.PhoneAPI.getFavorites() : [];
        bottomHtml = '<div style="padding:10px 5px;">';
        if (favs.length === 0) { 
            bottomHtml += `<div style="text-align:center;color:var(--text-sub);padding:50px 0;"><i class="ph-fill ph-star" style="font-size:48px;color:var(--border-color);margin-bottom:15px;"></i><br>空空如也<br>快去聊天记录长按消息收藏吧！</div>`; 
        } else {
            [...favs].reverse().forEach(fav => {
                let content = window.marked ? window.marked.parse(fav.content || '') : (fav.content || '');
                bottomHtml += `<div class="card" style="position:relative;padding-right:40px;"><div style="font-size:12px;color:var(--primary-color);margin-bottom:5px;font-weight:bold;">${this.escapeHtml(fav.time)} · ${this.escapeHtml(fav.source)}</div><div class="markdown-body" style="font-size:14px;">${content}</div><div onclick="if(window.PhoneAPI) window.PhoneAPI.deleteFavorite('${this.escapeHtml(fav.id)}'); event.stopPropagation();" style="position:absolute;right:15px;top:50%;transform:translateY(-50%);color:var(--danger-color);font-size:20px;cursor:pointer;padding:5px;"><i class="ph ph-trash"></i></div></div>`;
            });
        }
        bottomHtml += '</div>';
    }

    contentEl.innerHTML = `
        <div class="moments-cover long-pressable" data-img="bg_moments_cover">
            <div class="moments-cover-info">
                <div class="moments-avatar-wrap">
                    <img src="${myAvatar}">
                    <span class="moments-name">${myName}</span>
                </div>
                <div class="moments-avatar-wrap">
                    <span class="moments-name">${taName}</span>
                    <img src="${taAvatar}">
                </div>
            </div>
        </div>
        
        <div style="height: 40px;"></div>

        <div class="status-panel">
            <div class="status-half">
                <div class="status-title"><i class="ph-fill ph-user"></i> ${myName}的状态</div>
                <div class="status-item">
                    <span>心情打卡</span>
                    <select style="padding: 2px 5px; border-radius: 4px; font-size: 11px; background: var(--icon-bg); color: var(--text-main); border: 1px solid var(--border-color);">
                        <option>☀️ 开心</option>
                        <option>🌧️ 委屈</option>
                        <option>💢 生气</option>
                        <option>🥱 好困</option>
                    </select>
                </div>
                <div class="status-item">
                    <span>🩸 特殊时期</span>
                    <label class="switch" style="transform: scale(0.7); margin-right: -10px;">
                        <input type="checkbox">
                        <span class="slider" style="background-color: #ccc;"></span>
                    </label>
                </div>
            </div>
            <div class="status-divider"></div>
            <div class="status-half">
                <div class="status-title"><i class="ph-fill ph-activity"></i> ${taName}的潮汐</div>
                <div class="status-item">
                    <span>当前阶段</span>
                    <span style="color: #f4a261; font-weight: bold;">[ 蓄积期 ]</span>
                </div>
                <div class="status-item" title="热度">
                    <span>🔥</span>
                    <div class="tide-bar-bg"><div class="tide-bar-fill" style="width: 60%; background: #e76f51;"></div></div>
                </div>
                <div class="status-item" title="控制力">
                    <span>🛡️</span>
                    <div class="tide-bar-bg"><div class="tide-bar-fill" style="width: 40%; background: #2a9d8f;"></div></div>
                </div>
            </div>
        </div>
        
        <div class="moments-menu-bar">
            <div class="moments-menu-item ${currentTab === 'feed' ? 'active' : ''}" onclick="window.PhoneUI.switchMomentsTab('feed')"><i class="${currentTab === 'feed' ? 'ph-fill' : 'ph'} ph-camera"></i> 朋友圈动态</div>
            <div class="moments-menu-item ${currentTab === 'favorites' ? 'active' : ''}" onclick="window.PhoneUI.switchMomentsTab('favorites')"><i class="${currentTab === 'favorites' ? 'ph-fill' : 'ph'} ph-star"></i> 星海收藏夹</div>
            <div class="moments-menu-item" onclick="window.PhoneUI.openReader()"><i class="ph-fill ph-book-open-text"></i> 共读时光</div>
            <div class="moments-menu-item" onclick="window.PhoneAPI.showToast('恋爱家规模块开发中...')"><i class="ph-fill ph-scroll"></i> 恋爱家规</div>
        </div>

        <div style="padding-bottom: 80px;">
            ${bottomHtml}
        </div>
    `;
    
    this.bindLongPresses();
},

openReader() {
    const readerEl = document.getElementById('app-reader');
    if (readerEl) {
        readerEl.classList.add('open');
        this.initReaderSwipe();
        this.bindReaderSelection();
        if (window.PhoneEngine && window.PhoneEngine.loadCachedBook) {
            window.PhoneEngine.loadCachedBook();
        }
    }
},

initReaderSwipe() {
    const area = document.getElementById('reader-content-area');
    if (!area || this._readerSwipeBound) return;
    
    let startX = 0;
    let startY = 0;
    
    area.addEventListener('touchstart', (e) => {
        if (e.changedTouches[0]) {
            startX = e.changedTouches[0].screenX;
            startY = e.changedTouches[0].screenY;
        }
    }, { passive: true });
    
    area.addEventListener('touchend', (e) => {
        if (!e.changedTouches[0]) return;
        const endX = e.changedTouches[0].screenX;
        const endY = e.changedTouches[0].screenY;
        const diffX = endX - startX;
        const diffY = endY - startY;
        
        if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) {
                if (window.PhoneEngine && window.PhoneEngine.prevPage) window.PhoneEngine.prevPage();
            } else {
                if (window.PhoneEngine && window.PhoneEngine.nextPage) window.PhoneEngine.nextPage();
            }
        }
    });
    this._readerSwipeBound = true;
},

bindReaderSelection() {
    const area = document.getElementById('reader-page-container');
    const menu = document.getElementById('highlight-menu');
    if (!area || !menu || this._selectionBound) return;

    document.addEventListener('selectionchange', () => {
        const selection = window.getSelection();
        const readerEl = document.getElementById('app-reader');
        if (!readerEl || !readerEl.classList.contains('open')) return;

        if (selection.toString().trim().length > 0 && area.contains(selection.anchorNode)) {
            // 🌟 核心修复：放弃跟随文字（会被系统自带菜单遮挡）
            // 改为在屏幕底部中央固定悬浮，样式更精美
            menu.style.display = 'block';
            menu.style.position = 'fixed';
            menu.style.top = 'auto';
            menu.style.bottom = '80px'; // 固定在翻页栏上方
            menu.style.left = '50%';
            menu.style.transform = 'translateX(-50%)';
            menu.style.background = 'linear-gradient(135deg, #8bc6ff, #4f81bd)';
            menu.style.borderRadius = '25px';
            menu.style.border = '2px solid #fff';
            menu.style.boxShadow = '0 8px 20px rgba(80,140,210,0.4)';
            menu.style.zIndex = '2000';
        } else {
            menu.style.display = 'none';
        }
    });
    this._selectionBound = true;
},

openPostModal() {
    document.getElementById('post-moment-bg').classList.add('show');
    document.getElementById('post-moment-modal').classList.add('show');
},
closePostModal() {
    document.getElementById('post-moment-bg').classList.remove('show');
    document.getElementById('post-moment-modal').classList.remove('show');
},

renderSettings() {
const contentEl = document.getElementById('app-window-content');
if (!contentEl) return;
const today = new Date();
const defaultDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

contentEl.innerHTML = `
<div class="settings-tabs">
<div class="settings-tab active" id="stab-basic" onclick="window.PhoneUI.switchSetTab('basic')">基础/UI</div>
<div class="settings-tab" id="stab-ai" onclick="window.PhoneUI.switchSetTab('ai')">大模型</div>
<div class="settings-tab" id="stab-draw" onclick="window.PhoneUI.switchSetTab('draw')">绘画引擎</div>
<div class="settings-tab" id="stab-sys" onclick="window.PhoneUI.switchSetTab('sys')">系统维护</div>
</div>

<div id="set-sec-basic" class="set-section active">
<div class="card">
<h3 style="color:var(--primary-color);margin-bottom:15px;"><i class="ph-fill ph-user-list"></i> 基础设定</h3>
<div style="display:flex;gap:10px;margin-bottom:10px;">
<div style="flex:1;"><label style="font-size:12px;color:var(--text-sub);">我的名字</label><input type="text" id="my-name" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;margin-top:4px;"></div>
<div style="flex:1;"><label style="font-size:12px;color:var(--text-sub);">TA的名字</label><input type="text" id="char-name" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;margin-top:4px;"></div>
</div>
</div>

<div class="card">
<h3 style="color:var(--primary-color);margin-bottom:10px;"><i class="ph-fill ph-palette"></i> UI 主题装修</h3>
<div class="engine-title"><i class="ph-fill ph-image"></i> 壁纸设置 (支持长按换图，也可填URL)</div>
<div style="display:flex;gap:10px;margin-bottom:10px;">
<div style="flex:1;"><label style="font-size:11px;color:var(--text-sub);">全局壁纸(网址)</label><input type="text" id="bg-global" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;margin-top:4px;"></div>
<div style="flex:1;"><label style="font-size:11px;color:var(--text-sub);">聊天壁纸(网址)</label><input type="text" id="bg-chat" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;margin-top:4px;"></div>
</div>
<div style="display:flex;gap:10px;margin-bottom:10px;">
<div style="flex:1;"><label style="font-size:11px;color:var(--text-sub);">日记封面(网址)</label><input type="text" id="bg-diary-cover" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;margin-top:4px;"></div>
<div style="flex:1;"><label style="font-size:11px;color:var(--text-sub);">日记内页(网址)</label><input type="text" id="bg-diary-page" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;margin-top:4px;"></div>
</div>
<div class="engine-title"><i class="ph-fill ph-heart" style="color:var(--danger-color);"></i> 恋爱纪念日</div>
<div style="margin-bottom:15px;"><label style="font-size:11px;color:var(--text-sub);">相爱起始日 (用于首页天数计算)</label><input type="date" id="love-start-date" value="${localStorage.getItem('love_start_date') || defaultDate}" onchange="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;margin-top:4px;"></div>
<div class="engine-title"><i class="ph-fill ph-text-aa"></i> 日记本专属设置</div>
<div style="margin-bottom:10px;"><label style="font-size:11px;color:var(--danger-color);font-weight:bold;">日记起始日期</label><input type="date" id="diary-start-date" value="${defaultDate}" onchange="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;margin-top:4px;"></div>
<div style="margin-bottom:10px;"><label style="font-size:11px;color:var(--text-sub);">封面标题</label><input type="text" id="diary-title" placeholder="His Diary" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;margin-top:4px;"></div>
</div>
</div>

<div id="set-sec-ai" class="set-section">
<div class="card">
<h3 style="color:var(--primary-color);margin-bottom:10px;"><i class="ph-fill ph-scroll"></i> 提示词与人设 (预设库)</h3>
<div class="preset-bar"><select id="prompt-preset-select" onchange="if(window.PhoneAPI) window.PhoneAPI.loadPromptPreset()"></select><button class="preset-btn" onclick="if(window.PhoneAPI) window.PhoneAPI.savePromptPreset()">存为预设</button><button class="preset-btn del" onclick="if(window.PhoneAPI) window.PhoneAPI.deletePromptPreset()">删除</button></div>
<div style="margin-bottom:15px;"><label style="font-size:12px;color:var(--text-main);font-weight:bold;">1. 系统指令 (防八股/核心规则)</label><textarea id="system-prompt" rows="4" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:10px;border-radius:8px;resize:vertical;font-size:12px;margin-top:4px;"></textarea></div>
<div style="margin-bottom:15px;"><label style="font-size:12px;color:var(--text-main);font-weight:bold;">2. 角色人设 (性格/背景/口吻)</label><textarea id="char-persona" rows="6" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:10px;border-radius:8px;resize:vertical;font-size:12px;margin-top:4px;"></textarea></div>
<div style="margin-bottom:5px;"><label style="font-size:12px;color:var(--text-main);font-weight:bold;">3. 线下文风 (小说模式专属要求)</label><textarea id="novel-style" rows="4" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:10px;border-radius:8px;resize:vertical;font-size:12px;margin-top:4px;"></textarea></div>
</div>
<div class="card">
<h3 style="color:var(--primary-color);margin-bottom:15px;"><i class="ph-fill ph-toggle-left"></i> 功能开关</h3>
<div style="margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;background:var(--icon-bg);padding:10px;border-radius:8px;"><label style="font-size:13px;color:var(--text-main);font-weight:bold;"><i class="ph ph-prohibit"></i> 绝对禁止 AI 使用 Emoji</label><input type="checkbox" id="ban-emoji" onchange="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:18px;height:18px;"></div>
<div style="margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;background:var(--icon-bg);padding:10px;border-radius:8px;"><label style="font-size:13px;color:var(--text-main);font-weight:bold;"><i class="ph ph-arrows-merge"></i> 开启线上/线下记忆互通</label><input type="checkbox" id="share-memory" onchange="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:18px;height:18px;"></div>
</div>
<div class="card">
<h3 style="color:var(--primary-color);margin-bottom:10px;"><i class="ph-fill ph-database"></i> 语言引擎预设库 (文本模型)</h3>
<div style="display:flex;gap:8px;align-items:center;margin-bottom:15px;padding-bottom:15px;border-bottom:1px dashed var(--border-color);"><select id="preset-delete-select" onchange="window.PhoneUI.fillPresetData()" style="flex:1;padding:8px;border-radius:8px;border:1px solid var(--primary-color);"><option value="">-- 选择预设以编辑或删除 --</option></select><button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.deletePreset()" style="width:auto;margin:0;background:transparent;color:var(--danger-color);border:1px solid var(--danger-color);padding:8px 12px;"><i class="ph ph-trash"></i></button></div>
<div style="margin-bottom:10px;"><input type="text" id="preset-name" placeholder="起个名字 (如: 硅基-DeepSeek)" style="width:100%;padding:8px;border-radius:8px;"></div>
<div style="margin-bottom:10px;"><input type="text" id="preset-url" placeholder="接口地址 (Base URL)" style="width:100%;padding:8px;border-radius:8px;"></div>
<div style="margin-bottom:10px;"><input type="password" id="preset-key" placeholder="API Key (密钥)" style="width:100%;padding:8px;border-radius:8px;"></div>
<div style="margin-bottom:15px;"><input type="text" id="preset-model" placeholder="模型名称 (Model)" style="width:100%;padding:8px;border-radius:8px;"></div>
<button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.savePreset()" style="margin-top:0;margin-bottom:5px;"><i class="ph ph-floppy-disk"></i> 保存 / 更新当前预设</button>
</div>
</div>

<div id="set-sec-draw" class="set-section">
<div class="card">
<h3 style="color:var(--primary-color);margin-bottom:10px;"><i class="ph-fill ph-image"></i> 绘画引擎配置 (DALL-E 格式)</h3>
<div style="margin-bottom:10px;"><input type="text" id="img-api-url" placeholder="接口地址" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;"></div>
<div style="margin-bottom:10px;"><input type="password" id="img-api-key" placeholder="API Key (密钥)" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;"></div>
<div style="margin-bottom:10px;"><input type="text" id="img-api-model" placeholder="模型名称 (例如: dall-e-3)" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;"></div>
</div>
</div>

<div id="set-sec-sys" class="set-section">
<div class="card" style="border: 1px solid var(--primary-color);">
<h3 style="color:var(--primary-color);margin-bottom:10px;"><i class="ph-fill ph-cloud-check"></i> Cloudflare 云端同步</h3>
<div style="display:flex;gap:10px;"><button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.syncToCloud()" style="flex:1;margin-top:0;background:linear-gradient(135deg, var(--primary-color), var(--secondary-color));"><i class="ph-fill ph-cloud-arrow-up"></i> 备份到云端</button><button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.restoreFromCloud()" style="flex:1;margin-top:0;background:var(--icon-bg);color:var(--text-main);border:1px solid var(--border-color);"><i class="ph-fill ph-cloud-arrow-down"></i> 从云端拉取</button></div>
</div>
<div class="card">
<h3 style="color:var(--primary-color);margin-bottom:15px;"><i class="ph-fill ph-floppy-disk-back"></i> 本地文件备份 (JSON)</h3>
<div style="display:flex;gap:10px;"><button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.exportData()" style="flex:1;margin-top:0;background:var(--secondary-color);"><i class="ph ph-export"></i> 导出文件</button><button class="btn-refresh" onclick="document.getElementById('import-file').click()" style="flex:1;margin-top:0;background:#2a9d8f;"><i class="ph ph-import"></i> 导入文件</button><input type="file" id="import-file" style="display:none" accept=".json" onchange="if(window.PhoneAPI) window.PhoneAPI.importData(event)"></div>
</div>
<div class="card">
<h3 style="color:var(--danger-color);margin-bottom:15px;"><i class="ph-fill ph-warning-circle"></i> 系统维护</h3>
<button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.forceUpdate()" style="background:#f4a261;margin-top:0;margin-bottom:10px;"><i class="ph ph-arrows-clockwise"></i> 强制更新系统 (获取最新代码)</button>
<button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.clearChat()" style="background:var(--danger-color);margin-top:0;"><i class="ph ph-trash"></i> 清空所有聊天与小说记录</button>
</div>
</div>
`;

setTimeout(() => {
if (window.PhoneAPI) {
    window.PhoneAPI.loadSettings();
    window.PhoneAPI.refreshPresetDropdowns();
    window.PhoneAPI.refreshPromptDropdowns();
    window.PhoneAPI.refreshUIDropdowns();
    window.PhoneAPI.refreshImgDropdowns();
}
}, 50);
},

renderWorldbook() {
const contentEl = document.getElementById('app-window-content');
if (!contentEl) return;
const wbData = window.PhoneAPI ? window.PhoneAPI.getWorldbookData() : [];
let wbHtml = '';
wbData.forEach(wb => {
const deleteBtn = wb.isCustom ? `<div class="wb-delete-btn" onclick="if(window.PhoneAPI) window.PhoneAPI.deleteWorldbook('${this.escapeHtml(wb.id)}')"><i class="ph ph-trash"></i></div>` : '';
wbHtml += `<div class="wb-card"><div class="wb-header"><span class="wb-title">${this.escapeHtml(wb.title)}</span>${deleteBtn}</div><div class="wb-content">${wb.content || ''}</div></div>`;
});
contentEl.innerHTML = `
<div class="card" style="margin-bottom:20px;">
<h3 style="font-size:14px;color:var(--primary-color);margin-bottom:10px;"><i class="ph-fill ph-text-aa"></i> 线下小说字数底线</h3>
<div style="display:flex;align-items:center;gap:10px;">
<input type="number" id="novel-min-words" value="${localStorage.getItem('novel_min_words') || '150'}" oninput="if(window.PhoneAPI) window.PhoneAPI.saveNovelWords()" style="width:80px;padding:8px;border:1px solid var(--border-color);border-radius:8px;text-align:center;background:var(--icon-bg);color:var(--text-main);">
<span style="font-size:12px;color:var(--text-sub);">字 (打字自动保存)</span>
</div>
</div>
<h3 style="font-size:14px;color:var(--primary-color);margin-bottom:10px;margin-left:5px;"><i class="ph-fill ph-puzzle-piece"></i> 规则插件库</h3>
${wbHtml}
<button class="btn-refresh" onclick="window.PhoneUI.openWbModal()" style="margin-top:10px;margin-bottom:30px;background:transparent;color:var(--primary-color);border:1px dashed var(--primary-color);"><i class="ph ph-plus"></i> 添加自定义规则</button>
`;
},

renderGallery() {
const contentEl = document.getElementById('app-window-content');
if (!contentEl) return;
const roleId = window.Config?.currentContactId;
const items = window.Config?.phoneData?.[roleId]?.gallery?.items || [];

let html = `
<div id="image-viewer" class="image-viewer">
<div class="viewer-close" onclick="window.PhoneUI.closeImageViewer()"><i class="ph ph-x"></i></div>
<div class="viewer-download" onclick="window.PhoneUI.downloadCurrentImage()"><i class="ph ph-download-simple"></i> 保存到手机</div>
<img id="viewer-img" src="">
</div>
`;

if (items.length === 0) {
html += `<div style="text-align:center;padding:50px 0;color:var(--text-sub);"><i class="ph-fill ph-images" style="font-size:48px;color:var(--border-color);margin-bottom:10px;"></i><br>相册空空如也，快去生成第一张合照吧！</div>`;
} else {
html += `<div class="gallery-grid">`;
[...items].reverse().forEach(img => {
const safeSrc = this.escapeHtml(img.content || '');
const safeId = this.escapeHtml(img.id || '');
html += `<div class="gallery-item" onclick="window.PhoneUI.openImageViewer('${safeSrc}')"><img src="${safeSrc}"><div class="gallery-del-btn" onclick="event.stopPropagation();if(window.PhoneEngine) window.PhoneEngine.deleteGalleryImage('${safeId}')"><i class="ph ph-trash"></i></div></div>`;
});
html += '</div>';
}
contentEl.innerHTML = html;
},

openImageViewer(src) {
const viewer = document.getElementById('image-viewer');
const img = document.getElementById('viewer-img');
if (viewer && img) { img.src = src; viewer.classList.add('show'); }
},
closeImageViewer() {
const viewer = document.getElementById('image-viewer');
if (viewer) viewer.classList.remove('show');
},
downloadCurrentImage() {
const img = document.getElementById('viewer-img');
if (!img || !img.src) return;
const a = document.createElement('a'); a.href = img.src; a.download = 'Photo_' + Date.now() + '.jpg';
document.body.appendChild(a); a.click(); document.body.removeChild(a);
if (window.PhoneAPI) window.PhoneAPI.showToast('✅ 图片已保存到手机！');
},

closeApp() {
const winEl = document.getElementById('app-window');
const contentEl = document.getElementById('app-window-content');
if (winEl) { winEl.classList.remove('open'); winEl.classList.remove('fullscreen-mode'); }
if (contentEl) {
    contentEl.style.padding = '20px';
    contentEl.style.display = 'block';
    contentEl.style.flexDirection = 'row';
    contentEl.style.overflow = 'auto';
    contentEl.style.height = 'auto';
}
if (window.Config) window.Config.currentAppId = 'wechat';
},

switchVaultTab(tabName) {
if (window.Config) window.Config.memoryVaultTab = tabName;
document.querySelectorAll('.vault-tab').forEach(el => el.classList.remove('active'));
const activeTab = document.getElementById('tab-' + tabName);
if (activeTab) activeTab.classList.add('active');
this.renderMemoryVault();
},

renderMemoryVault() {
const contentArea = document.getElementById('vault-content-area');
if (!contentArea || !window.PhoneAPI || !window.PhoneAPI.EchoVault) return;
const currentTab = window.Config?.memoryVaultTab || 'daily';
const evData = window.PhoneAPI.EchoVault.getData();

let html = '';
if (currentTab === 'daily') {
    const dailyKeys = Object.keys(evData.daily).sort((a, b) => new Date(b) - new Date(a));
    if (dailyKeys.length === 0) html = '<div class="ev-empty">今天还没有故事发生...</div>';
    else {
        dailyKeys.forEach(date => {
            const item = evData.daily[date];
            html += `<div class="ev-card"><div class="ev-card-header"><span class="ev-date">📅 ${date}</span><span class="ev-importance">重要度: ${item.importance} | 查阅: ${item.hits}</span></div><div class="ev-body">${this.escapeHtml(item.content)}</div><div class="ev-actions"><i class="ph-fill ph-star" title="设为锚点" onclick="if(window.PhoneAPI) window.PhoneAPI.toggleCoreMemory('${date}')"></i><i class="ph-fill ph-pencil-simple" title="手动编辑/去重" onclick="window.PhoneUI.openEvEdit('${date}', false)"></i><i class="ph-fill ph-trash" title="删除" onclick="if(window.PhoneAPI) window.PhoneAPI.deleteFromMemoryVault('${date}')"></i></div></div>`;
        });
    }
} else if (currentTab === 'permanent') {
    const permKeys = Object.keys(evData.permanent);
    if (permKeys.length === 0) html = '<div class="ev-empty">还没有钉选的核心记忆...</div>';
    else {
        permKeys.forEach(key => {
            const item = evData.permanent[key];
            html += `<div class="ev-card ev-permanent-card"><div class="ev-card-header"><span class="ev-title">📌 ${key}</span><span class="ev-importance">永不衰减</span></div><div class="ev-body">${this.escapeHtml(item.content)}</div><div class="ev-actions"><i class="ph ph-star" title="取消锚点" onclick="if(window.PhoneAPI) window.PhoneAPI.toggleCoreMemory('${key}')"></i><i class="ph-fill ph-pencil-simple" title="手动编辑/去重" onclick="window.PhoneUI.openEvEdit('${key}', true)"></i><i class="ph-fill ph-trash" title="删除" onclick="if(window.PhoneAPI) window.PhoneAPI.deleteFromMemoryVault('${key}')"></i></div></div>`;
        });
    }
}
contentArea.innerHTML = html;
},

openEvEdit(key, isPermanent) {
    this.currentEvEditKey = key;
    this.currentEvEditIsPerm = isPermanent;
    const evData = window.PhoneAPI.EchoVault.getData();
    const item = isPermanent ? evData.permanent[key] : evData.daily[key];
    if (!item) return;
    
    document.getElementById('ev-edit-date').innerText = isPermanent ? `📌 锚点记忆: ${key}` : `📅 日常记忆: ${key}`;
    document.getElementById('ev-edit-content').value = item.content || '';
    
    document.getElementById('ev-edit-bg').classList.add('show');
    document.getElementById('ev-edit-modal').classList.add('show');
},
closeEvEdit() {
    document.getElementById('ev-edit-bg').classList.remove('show');
    document.getElementById('ev-edit-modal').classList.remove('show');
},
saveEvEdit() {
    const key = this.currentEvEditKey;
    const isPerm = this.currentEvEditIsPerm;
    const newContent = document.getElementById('ev-edit-content').value.trim();
    
    if(!newContent) {
        if(window.PhoneAPI) window.PhoneAPI.showToast("内容不能为空，若要删除请点击垃圾桶图标");
        return;
    }
    
    if(window.PhoneAPI && window.PhoneAPI.EchoVault) {
        const evData = window.PhoneAPI.EchoVault.getData();
        if(isPerm && evData.permanent[key]) {
            evData.permanent[key].content = newContent;
        } else if(!isPerm && evData.daily[key]) {
            evData.daily[key].content = newContent;
        }
        window.PhoneAPI.EchoVault.saveData(evData);
        if(window.PhoneAPI) window.PhoneAPI.showToast("✅ 记忆已成功修改去重！");
        this.renderMemoryVault();
        this.closeEvEdit();
    }
},

remindEchoVault() {
    const memory = window.PhoneAPI && window.PhoneAPI.EchoVault ? window.PhoneAPI.EchoVault.remind() : null;
    if(memory) {
        alert(`🌊 【命运的漂流瓶】\n捞起了一段快被遗忘的旧时光 (${memory.date}):\n\n${memory.meta.content}`);
        this.renderMemoryVault(); 
    } else {
        alert("记忆库空空如也，海面上什么也没有。");
    }
},

unlockDiary() {
const cover = document.getElementById('diary-book-cover');
const coverView = document.getElementById('diary-cover-view');
const insideView = document.getElementById('diary-inside-view');
if (cover && coverView && insideView) { cover.classList.add('opened'); coverView.classList.add('opened'); insideView.classList.add('opened'); }
if (window.Config) { window.Config.diaryPageIndex = -1; }
this.renderDiaryPage();
},

touchStartX: 0, touchStartY: 0,
handleSwipeStart(e) { if (e?.changedTouches?.[0]) { this.touchStartX = e.changedTouches[0].screenX; this.touchStartY = e.changedTouches[0].screenY; } },
handleSwipeEnd(e) {
if (!e?.changedTouches?.[0]) return;
const touchEndX = e.changedTouches[0].screenX; const touchEndY = e.changedTouches[0].screenY;
const diffX = touchEndX - this.touchStartX; const diffY = touchEndY - this.touchStartY;
if (Math.abs(diffY) > Math.abs(diffX)) return;
if (Math.abs(diffX) > 50) { e.stopPropagation(); if (diffX > 50) this.turnDiaryPage(-1); else if (diffX < -50) this.turnDiaryPage(1); }
},

turnDiaryPage(direction) {
let newIndex = (window.Config?.diaryPageIndex ?? -1) + direction;
if (newIndex < -1) newIndex = -1;
if (window.Config) window.Config.diaryPageIndex = newIndex;
this.renderDiaryPage();
},

renderDiaryPage() {
const contentAreaEl = document.getElementById('diary-content-area');
if (!contentAreaEl) return;
const currentIndex = window.Config?.diaryPageIndex ?? -1;

if (currentIndex === -1) {
const quote = localStorage.getItem('diary_quote') || '“时间会磨平一切痕迹，\\n除了我为你写下的字。”';
const formattedQuote = quote.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
contentAreaEl.innerHTML = `<div class="notebook-scroll-area" style="display:flex;justify-content:center;align-items:center;height:100%;min-height:300px;"><div class="notebook-empty" style="text-align:center;"><i class="ph-fill ph-feather" style="font-size:48px;color:rgba(0,0,0,0.3);margin-bottom:30px;display:inline-block;"></i><div style="font-family:'Long Cang','Kaiti',cursive;font-size:32px;color:rgba(0,0,0,0.6);text-shadow:1px 1px 2px rgba(255,255,255,0.5);line-height:1.8;padding:0 20px;white-space:pre-wrap;">${formattedQuote}</div></div></div><div class="page-turner"><div class="page-btn" style="opacity:0.3;pointer-events:none;"><i class="ph ph-caret-left"></i></div><div class="page-btn" onclick="window.PhoneUI.turnDiaryPage(1)"><i class="ph ph-caret-right"></i></div></div>`;
return;
}

const startDateStr = localStorage.getItem('diary_start_date') || '2026-09-15';
let startDate;
if (startDateStr) { const parts = startDateStr.split('-'); startDate = new Date(parts[0], parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)); } else { startDate = new Date(); }
const targetDate = new Date(startDate); targetDate.setDate(startDate.getDate() + currentIndex);

const y = targetDate.getFullYear(); const m = String(targetDate.getMonth() + 1).padStart(2, '0'); const d = String(targetDate.getDate()).padStart(2, '0');
const dateStr = `${y}-${m}-${d}`; const weekDays = ['日', '一', '二', '三', '四', '五', '六']; const weekStr = '星期' + weekDays[targetDate.getDay()];
const displayDate = `${y}年${m}月${d}日`;
const diaries = window.PhoneAPI ? window.PhoneAPI.getDiaries() : {};
let content = diaries[dateStr];

let html = `<div class="notebook-scroll-area" style="overflow-y:auto; height:100%; padding:80px 15px 60px 15px; display:flex; flex-direction:column;"><div class="notebook-header" style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(80,130,180,.35);padding-bottom:10px;margin-bottom:15px;flex-shrink:0;"><div class="notebook-date-wrap"><span class="notebook-date" style="font-weight:bold;font-size:18px;">${displayDate}</span><span class="notebook-week" style="margin-left:8px;font-size:13px;color:var(--text-sub);">${weekStr}</span></div><div style="display:flex;align-items:center;gap:12px;">${content ? `<i class="ph ph-arrows-clockwise" onclick="if(confirm('确定要让大侦探重写这页日记吗？')){ if(window.PhoneEngine) window.PhoneEngine.generateDiary('${dateStr}'); }" style="font-size:20px;color:var(--text-sub);cursor:pointer;transition:0.2s;"></i>` : ''}<div class="notebook-mood">☁️</div></div></div>`;

if (content) {
content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<思维链>[\s\S]*?<\/思维链>/gi, '').trim();
html += `<div class="notebook-content" style="flex:1; font-family:'Long Cang','Kaiti',cursive;font-size:22px;line-height:2.15rem;color:#2c2c2c;white-space:pre-wrap;word-break:break-word; margin:0; padding-bottom: 40px;">${this.escapeHtml(content)}</div></div>`;
} else {
html += `<div class="notebook-empty" style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center;"><p style="margin-bottom:20px;color:var(--text-sub);font-size:14px;">这一页还是空白的...</p><button class="btn-refresh" onclick="if(window.PhoneEngine) window.PhoneEngine.generateDiary('${dateStr}')" style="width:auto;padding:10px 20px;background:rgba(0,0,0,0.6);border-radius:8px;font-family:sans-serif;font-size:14px;color:#fff;border:none;cursor:pointer;"><i class="ph-fill ph-magic-wand"></i> 偷偷写日记</button></div></div>`;
}

html += `<div class="page-turner" style="position:absolute;bottom:15px;left:0;right:0;display:flex;justify-content:space-between;padding:0 25px;pointer-events:none;"><div class="page-btn" onclick="window.PhoneUI.turnDiaryPage(-1)" style="pointer-events:auto;cursor:pointer;background:rgba(255,255,255,0.8);border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.1);"><i class="ph ph-caret-left"></i></div><div class="page-btn" onclick="window.PhoneUI.turnDiaryPage(1)" style="pointer-events:auto;cursor:pointer;background:rgba(255,255,255,0.8);border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.1);"><i class="ph ph-caret-right"></i></div></div>`;
contentAreaEl.innerHTML = html;
},

initStarrySea() {
const bgEl = document.getElementById('starry-sea-bg');
const bubblesEl = document.getElementById('floating-bubbles');
const fragmentsContainer = document.getElementById('memory-fragments-container');
if (!bgEl || !bubblesEl || !fragmentsContainer) return;
setTimeout(() => { bgEl.classList.add('show'); bubblesEl.classList.add('show'); }, 100);

let starsHtml = '';
for (let i = 0; i < 50; i++) {
const size = Math.random() * 3 + 1; const top = Math.random() * 100; const left = Math.random() * 100; const delay = Math.random() * 5; const duration = Math.random() * 3 + 2;
starsHtml += `<div class="star" style="width:${size}px;height:${size}px;top:${top}%;left:${left}%;animation-delay:${delay}s;animation-duration:${duration}s;"></div>`;
}
bgEl.innerHTML = starsHtml;

const validMemories = window.PhoneAPI ? window.PhoneAPI.getFavorites() : [];
fragmentsContainer.innerHTML = '';
if (validMemories.length === 0) {
const frag = document.createElement('div'); frag.className = 'memory-fragment'; frag.style.cssText = 'top:50%; left:50%; animation-delay:0s;';
frag.onclick = () => this.openBlindBox("星海空空如也...快去聊天记录里长按消息，点击【手动摘录】或【AI提炼】来收集星星吧！", "系统提示", "星海", "me");
fragmentsContainer.appendChild(frag);
} else {
const shuffled = [...validMemories].sort(() => 0.5 - Math.random());
const selected = shuffled.slice(0, 12);
selected.forEach(mem => {
const top = 15 + Math.random() * 65; const left = 10 + Math.random() * 80; const delay = Math.random() * 2; const safeContent = String(mem.content || '');
const frag = document.createElement('div'); frag.className = 'memory-fragment'; frag.style.cssText = `top:${top}%; left:${left}%; animation-delay:${delay}s;`;
frag.onclick = () => this.openBlindBox(safeContent, mem.time, mem.source, mem.sender);
fragmentsContainer.appendChild(frag);
});
}
},

openBlindBox(content, time, source, sender) {
const modal = document.getElementById('blindbox-modal');
const bg = document.getElementById('blindbox-bg');
const textEl = document.getElementById('blindbox-text');
const metaEl = document.getElementById('blindbox-meta');
if (!modal || !bg || !textEl || !metaEl) return;
const myName = localStorage.getItem('my_name') || '我'; const charName = localStorage.getItem('char_name') || 'TA';
const senderName = sender === 'me' ? myName : charName;
let parsed = window.marked ? window.marked.parse(content || '') : (content || '');
textEl.innerHTML = `“${parsed}”`; metaEl.innerHTML = `${this.escapeHtml(time || '某时')} · ${this.escapeHtml(source || '')} · ${this.escapeHtml(senderName)}`;
bg.classList.add('show'); modal.classList.add('show');
},
closeBlindBox() {
const bg = document.getElementById('blindbox-bg');
const modal = document.getElementById('blindbox-modal');
if (bg) bg.classList.remove('show');
if (modal) modal.classList.remove('show');
},

showThought(index, forceApp) {
const roleId = window.Config?.currentContactId;
if (!roleId) return;
const targetApp = forceApp || (window.Config?.currentAppId === 'novel' ? 'novel' : 'wechat');
const appData = window.Config?.phoneData?.[roleId]?.[targetApp];
if (!appData || !Array.isArray(appData.items)) return;
const realIndex = Number(index);
if (!Number.isInteger(realIndex) || realIndex < 0 || realIndex >= appData.items.length) return;
let item = appData.items[realIndex];
if (!item) return;

let thought = item.innerThought;
if (thought && typeof thought === 'string' && thought.includes('连发消息')) {
for (let i = realIndex - 1; i >= 0; i--) {
const prevItem = appData.items[i]; if (!prevItem) continue;
if (prevItem.sender === 'other' && prevItem.time === item.time && prevItem.innerThought && typeof prevItem.innerThought === 'string' && !prevItem.innerThought.includes('连发消息')) { thought = prevItem.innerThought; break; }
}
}
if (!thought || !String(thought).trim()) {
for (let i = realIndex; i >= 0; i--) {
const prevItem = appData.items[i]; if (!prevItem) continue;
if (prevItem.sender === 'other' && prevItem.innerThought && typeof prevItem.innerThought === 'string' && prevItem.innerThought.trim()) { thought = prevItem.innerThought; break; }
}
}

const contentEl = document.getElementById('thought-content');
const bgEl = document.getElementById('thought-bg');
const modalEl = document.getElementById('thought-modal');
if (!contentEl || !bgEl || !modalEl) return;
contentEl.innerText = thought && String(thought).trim() ? String(thought) : '（TA的心思藏得很深，什么也没看出来...）';
bgEl.classList.add('show'); modalEl.classList.add('show');
},
closeThought() {
const bgEl = document.getElementById('thought-bg');
const modalEl = document.getElementById('thought-modal');
if (bgEl) bgEl.classList.remove('show');
if (modalEl) modal.classList.remove('show');
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
if (window.PhoneAPI) window.PhoneAPI.showToast('✏️ 已加载预设，修改后点击保存即可覆盖');
}
}
};

if (typeof window !== 'undefined') { window.PhoneUI = PhoneUI; }
