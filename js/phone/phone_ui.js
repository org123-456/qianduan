import { ChatUI } from './ui/chat_ui.js';
import { MemoryUI } from './ui/memory_ui.js';
import { DiaryUI } from './ui/diary_ui.js';
import { MomentsUI } from './ui/moments_ui.js';
import { ScheduleUI } from './ui/schedule_ui.js';
import { StudyUI } from './ui/study_ui.js'; // 🌟 引入伴学空间

const CallUI = {
    // ...(为了节省篇幅，这里是原本的通话代码，完全没变)
    isCalling: false, recognition: null, isAiSpeaking: false,
    initCallSystem() { /* ... */ },
    openCallScreen() { /* ... */ },
    endCall() { /* ... */ },
    updateCallStatus(text) { const el = document.getElementById('call-status'); if(el) el.innerText = text; },
    appendSubtitle(role, text) { /* ... */ },
    sendCallText() { /* ... */ },
    async handleUserVoiceInput(text) { /* ... */ }
};

export const PhoneUI = {
    ...ChatUI,
    ...MemoryUI,
    ...DiaryUI,
    ...MomentsUI,
    ...ScheduleUI,
    ...CallUI,
    ...StudyUI, // 🌟 注册伴学空间
    
    escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    },

    changeAppColor(color) {
        document.documentElement.setAttribute('data-color', color);
        localStorage.setItem('app_color', color);
        document.querySelectorAll('.color-circle').forEach(el => el.classList.remove('active'));
        const activeCircle = document.getElementById('color-btn-' + color);
        if (activeCircle) activeCircle.classList.add('active');
    },

    updateHomeDots() {
        const slider = document.getElementById('home-slider');
        const dots = document.querySelectorAll('#home-dots .dot');
        if (!slider || !dots.length) return;
        const pageIndex = Math.round(slider.scrollLeft / slider.clientWidth);
        dots.forEach((dot, index) => {
            if (index === pageIndex) dot.classList.add('active');
            else dot.classList.remove('active');
        });
    },

    async editPolaroidText() {
        const current = localStorage.getItem('polaroid_custom_text') || '';
        const text = await this.showCustomPrompt('给这张照片写句寄语吧：', current);
        if (text !== null) {
            localStorage.setItem('polaroid_custom_text', text.trim());
            this.updateHomeWidget();
        }
    },

    async updateHomeWidget() {
        // ... (保持原样)
    },

    bindLongPresses() {
        // ... (保持原样)
    },

    triggerAvatarUpload(key) {
        // ... (保持原样)
    },

    renderCountdown() {
        // ... (保持原样)
    },

    openCdSheet() {
        // ... (保持原样)
    },

    closeCdSheet() {
        // ... (保持原样)
    },

    saveCdSheet() {
        // ... (保持原样)
    },

    openNoteModal() {
        // ... (保持原样)
    },

    closeNoteModal() {
        // ... (保持原样)
    },

    async sendNote() {
        // ... (保持原样)
    },

    toggleTheme() {
        // ... (保持原样)
    },

    togglePlaylist() {
        // ... (保持原样)
    },

    openArchiveModal() {
        // ... (保持原样)
    },

    closeArchiveModal() {
        // ... (保持原样)
    },

    renderArchiveList() {
        // ... (保持原样)
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

    // 🌟 核心：路由分发，加入 'study'
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
        } else if (appId === 'schedule') {
            contentEl.innerHTML = `
                <div class="vault-tabs" id="schedule-tabs" style="margin-bottom: 15px; overflow-x: auto; display: flex; white-space: nowrap; padding-bottom: 5px;"></div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                    <button class="btn-refresh" onclick="window.PhoneUI.importScheduleAI()" style="flex: 1; margin: 0; margin-right: 10px; background: linear-gradient(135deg, #a78bfa, #8b5cf6);"><i class="ph-fill ph-sparkle"></i> AI 智能排课</button>
                    <button class="btn-refresh" onclick="window.PhoneUI.openScheduleModal(-1)" style="flex: 1; margin: 0; background: var(--icon-bg); color: var(--text-main); border: 1px solid var(--border-color);"><i class="ph ph-plus"></i> 手动添加</button>
                </div>
                <div id="schedule-list-area" style="padding-bottom: 80px; display: flex; flex-direction: column; gap: 10px;"></div>
            `;
            this.currentScheduleDay = new Date().getDay() === 0 ? 7 : new Date().getDay();
            this.renderSchedule();
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
        } else if (appId === 'study') { // 🌟 渲染伴学空间
            this.renderStudyRoom();
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

    // ... (后续阅读器和设置的代码保持原样)
    openReader() { /*...*/ },
    closeReader() { /*...*/ },
    handleReaderBack() { /*...*/ },
    showBookshelf() { /*...*/ },
    showReadingView(titleText) { /*...*/ },
    initReaderSwipe() { /*...*/ },
    bindReaderSelection() { /*...*/ },
    renderSettings() { /*...*/ },
    fillPresetData() { /*...*/ }
};

if (typeof window !== 'undefined') { window.PhoneUI = PhoneUI; }
