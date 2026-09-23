import { ChatUI } from './ui/chat_ui.js';
import { MemoryUI } from './ui/memory_ui.js';
import { DiaryUI } from './ui/diary_ui.js';
import { MomentsUI } from './ui/moments_ui.js';

export const PhoneUI = {
    ...ChatUI,
    ...MemoryUI,
    ...DiaryUI,
    ...MomentsUI,
    
    currentMomentsTab: 'feed', 

    escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    },

    // 🌟 新增：切换全局主题色
    changeAppColor(color) {
        document.documentElement.setAttribute('data-color', color);
        localStorage.setItem('app_color', color);
        
        // 更新圆圈的选中状态
        document.querySelectorAll('.color-circle').forEach(el => el.classList.remove('active'));
        const activeCircle = document.getElementById('color-btn-' + color);
        if (activeCircle) activeCircle.classList.add('active');
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

    togglePlaylist() {
        const bg = document.getElementById('playlist-modal-bg');
        const modal = document.getElementById('playlist-modal');
        if (bg && modal) {
            if (bg.classList.contains('show')) {
                bg.classList.remove('show');
                modal.classList.remove('show');
            } else {
                bg.classList.add('show');
                modal.classList.add('show');
            }
        }
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

        if (appId === 'diary') {
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
        }
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

    renderSettings() {
        const contentEl = document.getElementById('app-window-content');
        if (!contentEl) return;
        const today = new Date();
        const defaultDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        // 获取当前选中的颜色
        const currentColor = localStorage.getItem('app_color') || 'blue';

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
        
        <!-- 🌟 新增：全局主题色切换 -->
        <div class="engine-title"><i class="ph-fill ph-paint-brush"></i> 全局主题色</div>
        <div class="color-picker-container">
            <div id="color-btn-blue" class="color-circle c-blue ${currentColor === 'blue' ? 'active' : ''}" onclick="window.PhoneUI.changeAppColor('blue')" title="星河水"></div>
            <div id="color-btn-purple" class="color-circle c-purple ${currentColor === 'purple' ? 'active' : ''}" onclick="window.PhoneUI.changeAppColor('purple')" title="冰晶紫"></div>
            <div id="color-btn-pink" class="color-circle c-pink ${currentColor === 'pink' ? 'active' : ''}" onclick="window.PhoneUI.changeAppColor('pink')" title="薄雾粉"></div>
            <div id="color-btn-gold" class="color-circle c-gold ${currentColor === 'gold' ? 'active' : ''}" onclick="window.PhoneUI.changeAppColor('gold')" title="天光金"></div>
        </div>

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
                if (window.PhoneAPI.loadSettings) window.PhoneAPI.loadSettings();
                if (window.PhoneAPI.refreshPresetDropdowns) window.PhoneAPI.refreshPresetDropdowns();
                if (window.PhoneAPI.refreshPromptDropdowns) window.PhoneAPI.refreshPromptDropdowns();
                if (window.PhoneAPI.refreshUIDropdowns) window.PhoneAPI.refreshUIDropdowns();
                if (window.PhoneAPI.refreshImgDropdowns) window.PhoneAPI.refreshImgDropdowns();
            }
        }, 50);
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
