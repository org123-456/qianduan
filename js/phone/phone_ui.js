import { ChatUI } from './ui/chat_ui.js';
import { MemoryUI } from './ui/memory_ui.js';
import { DiaryUI } from './ui/diary_ui.js';
import { MomentsUI } from './ui/moments_ui.js';
import { ScheduleUI } from './ui/schedule_ui.js';
import { StudyUI } from './ui/study_ui.js';
import { CallUI } from './ui/call_ui.js';          // 🌟 引入你原本的专属通话
import { SettingsUI } from './ui/settings_ui.js';  // 🌟 引入刚建好的专属设置

export const PhoneUI = {
    ...ChatUI,
    ...MemoryUI,
    ...DiaryUI,
    ...MomentsUI,
    ...ScheduleUI,
    ...StudyUI,
    ...CallUI,
    ...SettingsUI,

    escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    },

    changeAppColor(color) {
        document.documentElement.setAttribute('data-color', color);
        localStorage.setItem('app_color', color);
        document.querySelectorAll('.color-circle').forEach(el => el.classList.remove('active'));
        const active = document.getElementById('color-btn-' + color);
        if (active) active.classList.add('active');
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

    async updateHomeWidget() {
        try {
            const daysEl = document.getElementById('home-love-days');
            if (daysEl) {
                const startDateStr = localStorage.getItem('love_start_date') || localStorage.getItem('diary_start_date');
                if (startDateStr) {
                    const start = new Date(startDateStr);
                    daysEl.innerText = Math.floor(Math.abs(new Date() - start) / (1000 * 60 * 60 * 24));
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
        } catch(e) {}
    },

    renderCountdown() {
        const cfgRaw = localStorage.getItem('cc_countdown');
        const cfg = cfgRaw ? JSON.parse(cfgRaw) : { title: '见到你', date: '2025-05-09', pre: '还有', suf: '天' };
        const numEl = document.getElementById('cd-num-display');
        if (!numEl) return;
        const t = new Date(cfg.date + 'T00:00:00');
        const a = new Date(); a.setHours(0, 0, 0, 0);
        const diff = Math.round((t - a) / 86400000);
        
        document.getElementById('cd-title-display').innerText = cfg.title || (diff < 0 ? '已经过去' : '见到你');
        document.getElementById('cd-date-display').innerText = cfg.date.replace(/-/g, '.');
        document.getElementById('cd-pre-display').innerText = cfg.pre || (diff < 0 ? '已经' : '还有');
        document.getElementById('cd-suf-display').innerText = cfg.suf || '天';
        numEl.innerText = Math.abs(diff);
    },

    openCdSheet() {
        const cfg = JSON.parse(localStorage.getItem('cc_countdown') || '{"title":"见到你","date":"2025-05-09","pre":"还有","suf":"天"}');
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
        if (!date) return;
        localStorage.setItem('cc_countdown', JSON.stringify({
            title: document.getElementById('cd-in-title').value.trim(),
            date: date,
            pre: document.getElementById('cd-in-pre').value.trim(),
            suf: document.getElementById('cd-in-suf').value.trim()
        }));
        this.renderCountdown();
        this.closeCdSheet();
    },

    openNoteModal() {
        document.getElementById('note-modal-bg').classList.add('show');
        document.getElementById('note-modal').classList.add('show');
        const input = document.getElementById('note-input');
        if (input) { input.value = ''; setTimeout(() => input.focus(), 100); }
    },

    closeNoteModal() {
        document.getElementById('note-modal-bg').classList.remove('show');
        document.getElementById('note-modal').classList.remove('show');
    },

    async sendNote() {
        const input = document.getElementById('note-input');
        if (!input || !input.value.trim()) return;
        const text = input.value.trim();
        this.closeNoteModal();
        localStorage.setItem('home_note_content', `“${text}”`);
        this.updateHomeWidget();
        if (window.PhoneAPI) window.PhoneAPI.showToast('纸条已递出...');

        try {
            const persona = localStorage.getItem('char_persona') || '';
            const reply = await window.PhoneAPI.chatWithAI([
                { role: 'system', content: `你扮演角色。${persona}\n请给用户写一张20字以内的极短纸条回信。直接输出内容，不要描写。` },
                { role: 'user', content: text }
            ]);
            if (reply) {
                localStorage.setItem('home_note_content', `“${reply}”`);
                this.updateHomeWidget();
            }
        } catch (e) {}
    },

    // 🌟 放映室 / 音乐模式切换
    switchTogetherMode(mode) {
        const musicView = document.getElementById('together-music-view');
        const cinemaView = document.getElementById('together-cinema-view');
        const btnMusic = document.getElementById('btn-toggle-music');
        const btnCinema = document.getElementById('btn-toggle-cinema');
        if (!musicView || !cinemaView) return;

        if (mode === 'music') {
            musicView.style.display = 'flex';
            cinemaView.style.display = 'none';
            if (btnMusic) {
                btnMusic.style.background = '#fff';
                btnMusic.style.color = 'var(--primary-color)';
            }
            if (btnCinema) {
                btnCinema.style.background = 'transparent';
                btnCinema.style.color = 'var(--text-sub)';
            }
        } else {
            musicView.style.display = 'none';
            cinemaView.style.display = 'flex';
            if (btnCinema) {
                btnCinema.style.background = '#fff';
                btnCinema.style.color = 'var(--primary-color)';
            }
            if (btnMusic) {
                btnMusic.style.background = 'transparent';
                btnMusic.style.color = 'var(--text-sub)';
            }
            const avatar = localStorage.getItem('ta_avatar') || '';
            const avatarEl = document.getElementById('cinema-companion-avatar');
            if (avatarEl && avatar) avatarEl.src = avatar;
        }
    },

    playBilibiliPrompt() {
        const inputEl = document.getElementById('cinema-bili-input');
        if (!inputEl || !inputEl.value.trim()) return;
        const val = inputEl.value.trim();
        const title = prompt("给视频起个名字（如：高数讲解）", "高数课");
        if (title !== null && window.PhoneEngine && window.PhoneEngine.loadBilibiliVideo) {
            const ok = window.PhoneEngine.loadBilibiliVideo(val, title);
            if (ok) {
                const label = document.getElementById('cinema-current-title-label');
                if (label) label.innerText = `当前: ${title}`;
                inputEl.value = '';
            }
        }
    },

    openApp(appId, appName) {
        if (window.Config) window.Config.currentAppId = appId;
        document.getElementById('app-window-title').innerText = appName;
        const winEl = document.getElementById('app-window');
        winEl.classList.add('open');
        if (appId === 'diary') winEl.classList.add('fullscreen-mode');
        else winEl.classList.remove('fullscreen-mode');

        if (appId === 'settings') this.renderSettings();
        else if (appId === 'schedule') {
            document.getElementById('app-window-content').innerHTML = `
                <div class="vault-tabs" id="schedule-tabs" style="margin-bottom: 15px; overflow-x: auto; display: flex; white-space: nowrap;"></div>
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <button class="btn-refresh" onclick="window.PhoneUI.importScheduleAI()" style="flex: 1; margin: 0; background: linear-gradient(135deg, #a78bfa, #8b5cf6);"><i class="ph-fill ph-sparkle"></i> AI 智能排课</button>
                    <button class="btn-refresh" onclick="window.PhoneUI.openScheduleModal(-1)" style="flex: 1; margin: 0; background: var(--icon-bg); color: var(--text-main); border: 1px solid var(--border-color);"><i class="ph ph-plus"></i> 添加课程</button>
                </div>
                <div id="schedule-list-area" style="padding-bottom: 80px; display: flex; flex-direction: column; gap: 10px;"></div>
            `;
            this.currentScheduleDay = new Date().getDay() === 0 ? 7 : new Date().getDay();
            this.renderSchedule();
        } else if (appId === 'study') this.renderStudyRoom();
    },

    closeApp() {
        const winEl = document.getElementById('app-window');
        if (winEl) { winEl.classList.remove('open'); winEl.classList.remove('fullscreen-mode'); }
    },

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    },

    togglePlaylist() {
        const modal = document.getElementById('playlist-modal');
        const bg = document.getElementById('playlist-modal-bg');
        if (modal && bg) {
            modal.classList.toggle('show');
            bg.classList.toggle('show');
        }
    },

    showCustomPrompt(title, defaultValue = '') {
        return new Promise(resolve => {
            const bg = document.getElementById('custom-prompt-bg');
            const modal = document.getElementById('custom-prompt-modal');
            document.getElementById('custom-prompt-title').innerText = title;
            const input = document.getElementById('custom-prompt-input');
            input.value = defaultValue;
            bg.classList.add('show'); modal.classList.add('show');
            document.getElementById('custom-prompt-confirm').onclick = () => { bg.classList.remove('show'); modal.classList.remove('show'); resolve(input.value); };
            document.getElementById('custom-prompt-cancel').onclick = () => { bg.classList.remove('show'); modal.classList.remove('show'); resolve(null); };
        });
    },

    bindLongPresses() {
        // 头像长按绑定
    },

    triggerAvatarUpload(key) {
        let fileInput = document.getElementById('settings-avatar-input');
        if (!fileInput) {
            fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.id = 'settings-avatar-input';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);
        }
        fileInput.onchange = (e) => {
            const f = e.target.files && e.target.files[0];
            if (!f) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                localStorage.setItem(key, event.target.result);
                if (window.PhoneAPI) window.PhoneAPI.showToast("头像更换成功！");
            };
            reader.readAsDataURL(f);
        };
        fileInput.click();
    }
};

if (typeof window !== 'undefined') { window.PhoneUI = PhoneUI; }
