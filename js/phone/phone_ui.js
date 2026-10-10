import { ChatUI } from './ui/chat_ui.js';
import { MemoryUI } from './ui/memory_ui.js?v=2026.10.10-txtmode9';
import { DiaryUI } from './ui/diary_ui.js?v=2026.10.01-diary4';
import { MomentsUI } from './ui/moments_ui.js?v=2026.10.01-diary4';
import { ScheduleUI } from './ui/schedule_ui.js';
import { StudyUI } from './ui/study_ui.js';
import { CallUI } from './ui/call_ui.js';
import { GameUI } from '../games/game_ui.js';

export const PhoneUI = {
    ...ChatUI,
    ...MemoryUI,
    ...DiaryUI,
    ...MomentsUI,
    ...ScheduleUI,
    ...StudyUI,
    ...CallUI,

    escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    },

    enterStarrySea() {
        // Keep the class names aligned with css/style.css; old hide/show
        // classes left the inside view invisible and non-interactive.
        const cover = document.getElementById('memory-cover-view');
        const inside = document.getElementById('memory-inside-view');
        const bubbles = document.getElementById('floating-bubbles');
        if (cover) cover.classList.add('dive-in');
        if (inside) inside.classList.add('active');
        if (bubbles) setTimeout(() => bubbles.classList.add('show'), 300);
        if (window.MemoryEngine && typeof window.MemoryEngine.initSky === 'function') {
            window.MemoryEngine.initSky();
        }

        // 🌟 强力打通：把星海控制台的所有全局触发器全部挂载到 window，确保点击绝对生效
        window.changeSkyShape = (shape) => window.PhoneUI.changeSkyShape(shape);
        window.resetSkyView = () => window.PhoneUI.resetSkyView();
        window.exportMemoryVault = () => window.PhoneUI.exportMemoryVault();
    },

    showDiaryShelf() {
        const coverView = document.getElementById('diary-cover-view');
        const insideView = document.getElementById('diary-inside-view');
        if (insideView) insideView.classList.remove('opened');
        if (coverView) coverView.classList.remove('opened');
        if (window.Config) window.Config.diaryPageIndex = -1;
    },

    async openReaderApp() {
        const reader = document.getElementById('app-reader');
        if (!reader) return;
        const shelf = document.getElementById('reader-bookshelf-view');
        const reading = document.getElementById('reader-reading-view');
        const footer = document.getElementById('reader-footer');
        const settings = document.getElementById('btn-reader-settings');
        const addBook = document.getElementById('btn-add-book');
        const title = document.getElementById('reader-header-title');

        reader.classList.add('open');
        reader.classList.remove('fullscreen-mode');
        if (shelf) shelf.style.display = 'block';
        if (reading) reading.style.display = 'none';
        if (footer) footer.style.display = 'none';
        if (settings) settings.style.display = 'none';
        if (addBook) addBook.style.display = '';
        if (title) title.innerText = '共读书架';

        try {
            await window.PhoneEngine?.renderBookshelf?.();
        } catch (e) {
            console.error('书架恢复失败：', e);
            window.PhoneAPI?.showToast?.('⚠️ 书架读取失败');
        }
    },

    showReadingView(title = '阅读') {
        const reader = document.getElementById('app-reader');
        const shelf = document.getElementById('reader-bookshelf-view');
        const reading = document.getElementById('reader-reading-view');
        const footer = document.getElementById('reader-footer');
        const settings = document.getElementById('btn-reader-settings');
        const addBook = document.getElementById('btn-add-book');
        const titleEl = document.getElementById('reader-header-title');

        if (!reader || !shelf || !reading) return;
        reader.classList.add('open');
        reader.classList.remove('fullscreen-mode');
        shelf.style.display = 'none';
        reading.style.display = 'block';
        if (footer) footer.style.display = 'flex';
        if (settings) settings.style.display = '';
        if (addBook) addBook.style.display = 'none';
        if (titleEl) titleEl.innerText = title;
    },

    async handleReaderBack() {
        const reader = document.getElementById('app-reader');
        const shelf = document.getElementById('reader-bookshelf-view');
        const reading = document.getElementById('reader-reading-view');
        const footer = document.getElementById('reader-footer');
        const settings = document.getElementById('btn-reader-settings');
        const addBook = document.getElementById('btn-add-book');
        const title = document.getElementById('reader-header-title');

        if (!reader) return;

        if (reading && reading.style.display !== 'none') {
            if (window.PhoneEngine) {
                window.PhoneEngine.closeReaderSettings?.();
                window.PhoneEngine._activeThreadCommentId = null;
            }
            reader.classList.remove('fullscreen-mode');
            if (shelf) shelf.style.display = 'block';
            reading.style.display = 'none';
            if (footer) footer.style.display = 'none';
            if (settings) settings.style.display = 'none';
            if (addBook) addBook.style.display = '';
            if (title) title.innerText = '共读书架';
            try { await window.PhoneEngine?.renderBookshelf?.(); } catch (e) {}
            return;
        }

        reader.classList.remove('open', 'fullscreen-mode');
        if (window.Config) window.Config.readerConfig = null;
    },

    changeAppColor(color) {
        document.documentElement.setAttribute('data-color', color);
        document.documentElement.setAttribute('data-theme-color', color);
        const mappedTheme = color === 'gold' ? 'yellow' : color;
        document.documentElement.setAttribute('data-icon-theme', mappedTheme);
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

    async editPolaroidText() {
        const current = localStorage.getItem('polaroid_custom_text') || '';
        const text = await this.showCustomPrompt('给这张照片写句寄语吧：', current);
        if (text !== null) {
            localStorage.setItem('polaroid_custom_text', text.trim());
            this.updateHomeWidget();
        }
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
                    html += d === today ? `<span class="today">${d}</span>` : `<span class="other-day">${d}</span>`;
                }
                calGrid.innerHTML = html;
            }

            this.renderCountdown();

            let polaroidText = document.getElementById('polaroid-text');
            if (polaroidText) {
                const newText = polaroidText.cloneNode(true);
                polaroidText.parentNode.replaceChild(newText, polaroidText);
                polaroidText = newText;
                polaroidText.style.pointerEvents = 'auto';
                polaroidText.style.position = 'relative';
                polaroidText.style.zIndex = '100';

                const triggerEdit = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.PhoneUI.editPolaroidText();
                };
                polaroidText.addEventListener('click', triggerEdit);
                polaroidText.addEventListener('touchend', triggerEdit);

                const customText = localStorage.getItem('polaroid_custom_text');
                if (customText) {
                    polaroidText.innerText = `“${customText}”`;
                } else {
                    polaroidText.innerText = "“我们的故事才刚刚开始...”";
                }
            }

            if (window.PhoneAPI && window.PhoneAPI.LocalDB) {
                const elements = document.querySelectorAll('[data-img]');
                for (const el of elements) {
                    const key = el.dataset.img;
                    if (key === 'my_avatar' || key === 'ta_avatar') {
                        const b64 = localStorage.getItem(key);
                        if (b64) {
                            if (el.tagName.toLowerCase() === 'img') el.src = b64;
                            continue;
                        }
                    }
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
            console.error("更新首页失败:", e);
        }
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
                document.getElementById('cinema-current-title-label').innerText = `当前: ${title}`;
                inputEl.value = '';
            }
        }
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
        contentEl.style.overflow = 'auto';

        if (appId === 'games') {
            GameUI.open();
            return;
        }

        if (appId === 'reader' || appId === 'reading' || appId === 'bookshelf') {
            this.openReaderApp();
            return;
        }

        if (appId === 'diary') {
            this.openDiaryFullscreen(this.currentDiaryBook || 'ta');
            return;
        } else {
            winEl.classList.remove('fullscreen-mode'); 
        }

        if (appId === 'memory_vault') {
            if (window.Config) window.Config.memoryVaultTab = 'daily';
            contentEl.innerHTML = `
                <div class="vault-tabs">
                    <div class="vault-tab active" id="tab-daily" onclick="window.PhoneUI.switchVaultTab('daily')">日常 (Daily)</div>
                    <div class="vault-tab" id="tab-permanent" onclick="window.PhoneUI.switchVaultTab('permanent')">锚点 (Permanent)</div>
                </div>
                <div id="vault-content-area" style="padding-bottom: 80px;"></div>
            `;
            this.renderMemoryVault();
        } else if (appId === 'favorites') {
            this.renderFavorites();
        } else if (appId === 'settings') {
            this.renderSettings();
        } else if (appId === 'schedule') {
            contentEl.innerHTML = `
                <div class="vault-tabs" id="schedule-tabs" style="margin-bottom: 15px; overflow-x: auto; display: flex; white-space: nowrap;"></div>
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <button class="btn-refresh" onclick="window.PhoneUI.importScheduleAI()" style="flex: 1; margin: 0; background: linear-gradient(135deg, #a78bfa, #8b5cf6);"><i class="ph-fill ph-sparkle"></i> AI 智能排课</button>
                    <button class="btn-refresh" onclick="window.PhoneUI.openScheduleModal(-1)" style="flex: 1; margin: 0; background: var(--icon-bg); color: var(--text-main); border: 1px solid var(--border-color);"><i class="ph ph-plus"></i> 添加课程</button>
                </div>
                <div id="schedule-list-area" style="padding-bottom: 80px; display: flex; flex-direction: column; gap: 10px;"></div>
            `;
            this.currentScheduleDay = new Date().getDay() === 0 ? 7 : new Date().getDay();
            this.renderSchedule();
        } else if (appId === 'study') {
            this.renderStudyRoom();
        }
    },

    closeApp() {
        if (window.Config?.currentAppId === 'games') {
            GameUI.close();
            return;
        }
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
        const elements = document.querySelectorAll('.long-pressable');
        const fileInput = document.getElementById('global-file-input');
        let holdTimer = null, pendingKey = null;

        elements.forEach(el => {
            const key = el.dataset.img;
            if (el.dataset.bound) return;
            el.dataset.bound = "true";

            const start = () => {
                el.classList.add('holding');
                clearTimeout(holdTimer);
                holdTimer = setTimeout(() => {
                    el.classList.remove('holding');
                    pendingKey = key;
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

        if (fileInput && !fileInput.dataset.bound) {
            fileInput.dataset.bound = "true";
            fileInput.addEventListener('change', async e => {
                const f = e.target.files && e.target.files[0];
                e.target.value = '';
                if (!f || !pendingKey) return;
                try {
                    const blob = await window.PhoneAPI.LocalDB.shrink(f, 800);
                    await window.PhoneAPI.LocalDB.set(pendingKey, blob);
                    const url = window.PhoneAPI.LocalDB.urlOf(pendingKey, blob);
                    document.querySelectorAll(`[data-img="${pendingKey}"]`).forEach(targetEl => {
                        if (targetEl.tagName.toLowerCase() === 'img') targetEl.src = url;
                        else {
                            const imgChild = targetEl.querySelector('img');
                            if (imgChild) imgChild.src = url;
                        }
                    });
                    if (window.PhoneAPI) window.PhoneAPI.showToast('✨ 换图成功！已保存在本地。');
                } catch (err) {}
                pendingKey = null;
            });
        }
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
            fileInput.value = '';
            if (!f) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                localStorage.setItem(key, event.target.result);
                document.querySelectorAll(`[data-img="${key}"]`).forEach(el => {
                    if (el.tagName.toLowerCase() === 'img') el.src = event.target.result;
                });
                if (window.PhoneAPI) window.PhoneAPI.showToast("头像更换成功！");
            };
            reader.readAsDataURL(f);
        };
        fileInput.click();
    },

    triggerWallpaperUpload(key) {
        let fileInput = document.getElementById('settings-wallpaper-input');
        if (!fileInput) {
            fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.id = 'settings-wallpaper-input';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);
        }
        fileInput.onchange = (e) => {
            const f = e.target.files && e.target.files[0];
            fileInput.value = '';
            if (!f) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const el = document.getElementById(key.replace(/_/g, '-'));
                if (el) el.value = event.target.result;
                localStorage.setItem(key, event.target.result);
                if (window.PhoneAPI && window.PhoneAPI.applyUITheme) {
                    window.PhoneAPI.applyUITheme();
                }
                if (window.PhoneAPI) window.PhoneAPI.showToast("壁纸设置成功！");
            };
            reader.readAsDataURL(f);
        };
        fileInput.click();
    },

    switchSetTab(tabId) {
        const tabs = ['basic', 'ai', 'draw', 'sys'];
        tabs.forEach(id => {
            const tab = document.getElementById('stab-' + id);
            const sec = document.getElementById('set-sec-' + id);
            if (tab) {
                if (id === tabId) tab.classList.add('active');
                else tab.classList.remove('active');
            }
            if (sec) {
                if (id === tabId) {
                    sec.classList.add('active');
                    sec.style.setProperty('display', 'flex', 'important');
                } else {
                    sec.classList.remove('active');
                    sec.style.setProperty('display', 'none', 'important');
                }
            }
        });
    },

    saveDrawSettings() {
        const urlEl = document.getElementById('img-api-url');
        const keyEl = document.getElementById('img-api-key');
        const modelEl = document.getElementById('img-api-model');
        if (urlEl) localStorage.setItem('img_api_url', urlEl.value.trim());
        if (keyEl) localStorage.setItem('img_api_key', keyEl.value.trim());
        if (modelEl) localStorage.setItem('img_api_model', modelEl.value.trim());
        if (window.PhoneAPI) window.PhoneAPI.showToast("💾 绘画配置已成功保存！");
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
            
            localStorage.setItem('main_engine_id', preset.id);
            localStorage.setItem('api_url', preset.url);
            localStorage.setItem('api_key', preset.key);
            localStorage.setItem('api_model', preset.model);

            if (window.PhoneAPI) window.PhoneAPI.showToast(`已载入预设：${preset.name}`);
        }
    },

    executeSavePresetDirectly() {
        const name = (document.getElementById('preset-name')?.value || '').trim();
        const url = (document.getElementById('preset-url')?.value || '').trim();
        const key = (document.getElementById('preset-key')?.value || '').trim();
        const model = (document.getElementById('preset-model')?.value || '').trim();
        const selectEl = document.getElementById('preset-delete-select');

        if (!name || !url || !key || !model) {
            alert("⚠️ 提示：预设名称、接口地址、KEY和模型名字都不能为空！");
            return;
        }

        let presets = JSON.parse(localStorage.getItem('ai_api_presets') || '[]');
        let currentId = selectEl ? selectEl.value : '';

        let target = presets.find(p => (currentId && p.id === currentId) || p.name === name);
        if (target) {
            target.name = name;
            target.url = url;
            target.key = key;
            target.model = model;
        } else {
            currentId = 'preset_' + Date.now();
            target = { id: currentId, name, url, key, model };
            presets.push(target);
        }

        localStorage.setItem('ai_api_presets', JSON.stringify(presets));
        
        localStorage.setItem('main_engine_id', target.id);
        localStorage.setItem('api_url', target.url);
        localStorage.setItem('api_key', target.key);
        localStorage.setItem('api_model', target.model);

        if (window.PhoneAPI && window.PhoneAPI.refreshPresetDropdowns) {
            window.PhoneAPI.refreshPresetDropdowns();
        }

        alert(`✅ 保存成功！当前主引擎已切换为：\n${name} (${model})`);
    },

    openApiModal() {
        const bg = document.getElementById('api-modal-bg');
        const modal = document.getElementById('api-modal');
        if (!bg || !modal) return;
        if (window.PhoneAPI && window.PhoneAPI.refreshPresetDropdowns) {
            window.PhoneAPI.refreshPresetDropdowns();
        }
        bg.classList.add('show');
        modal.classList.add('show');
        this.renderApiModalContent();
    },

    closeApiModal() {
        const bg = document.getElementById('api-modal-bg');
        const modal = document.getElementById('api-modal');
        if (bg) bg.classList.remove('show');
        if (modal) modal.classList.remove('show');
    },

    async renderApiModalContent() {
        const modal = document.getElementById('api-modal');
        if (!modal) return;

        let tokenBoard = document.getElementById('api-token-board');
        if (!tokenBoard) {
            tokenBoard = document.createElement('div');
            tokenBoard.id = 'api-token-board';
            tokenBoard.style.cssText = 'margin-top: 15px; border-top: 1px dashed var(--border-color); padding-top: 12px;';
            modal.appendChild(tokenBoard);
        }

        const stats = window.PhoneAPI ? window.PhoneAPI.getTokenStats() : { totalCount: 0, totalCost: '0.0000', lastUsage: null, lastCost: '0.0000', pricePerM: 2.0 };
        let lastInfo = stats.lastUsage ? `入: ${stats.lastUsage.prompt} | 出: ${stats.lastUsage.completion} | 总: <b>${stats.lastUsage.total}</b> (约 ￥${stats.lastCost})` : '暂无调用记录';

        tokenBoard.innerHTML = `
            <div style="font-size: 13px; font-weight: bold; color: var(--primary-color); display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <span><i class="ph-fill ph-wallet"></i> 实时账户与用量</span>
                <span style="font-size: 10px; color: var(--text-sub); cursor: pointer;" onclick="window.PhoneUI.editTokenPrice()">单价: ￥${stats.pricePerM}/1M ✎</span>
            </div>
            
            <div style="background: linear-gradient(135deg, rgba(167, 139, 250, 0.12), rgba(111, 168, 220, 0.12)); border: 1px solid var(--border-color); padding: 12px; border-radius: 12px; margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="flex: 1;">
                        <div style="font-size: 11px; color: var(--text-sub);">中转站令牌状态</div>
                        <div id="remote-api-balance" style="font-size: 17px; font-weight: bold; color: var(--primary-color); font-family: monospace; margin-top: 3px;">
                            <span style="font-size: 12px; font-weight: normal; opacity: 0.7;"><i class="ph ph-spinner spin-anim"></i> 查询中...</span>
                        </div>
                    </div>
                    <button onclick="window.PhoneUI.renderApiModalContent()" style="background: var(--icon-bg); border: 1px solid var(--border-color); color: var(--text-main); font-size: 11px; padding: 4px 10px; border-radius: 8px; cursor: pointer;">
                        <i class="ph ph-arrows-clockwise"></i> 刷新
                    </button>
                </div>
            </div>

            <div style="background: var(--icon-bg); padding: 10px; border-radius: 10px; font-size: 11px; display: flex; flex-direction: column; gap: 5px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: var(--text-sub);">本次累计消耗：</span>
                    <span style="font-weight: bold; color: var(--text-main); font-family: monospace;">${stats.totalCount.toLocaleString()} Tokens (约 ￥${stats.totalCost})</span>
                </div>
                <div style="border-top: 1px dashed var(--border-color); margin: 2px 0;"></div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: var(--text-sub);">最近一次对话：</span>
                    <span style="color: var(--text-main); font-size: 10px;">${lastInfo}</span>
                </div>
            </div>
            
            <div style="display: flex; justify-content: flex-end; margin-top: 8px;">
                <button onclick="if(window.PhoneAPI){window.PhoneAPI.resetTokenStats(); window.PhoneUI.renderApiModalContent();}" style="background: transparent; border: 1px solid var(--border-color); color: var(--text-sub); font-size: 10px; padding: 3px 8px; border-radius: 6px; cursor: pointer;">清零本地统计</button>
            </div>
        `;

        if (window.PhoneAPI && window.PhoneAPI.queryRemoteBalance) {
            const res = await window.PhoneAPI.queryRemoteBalance();
            const balanceEl = document.getElementById('remote-api-balance');
            if (balanceEl) {
                if (res) {
                    balanceEl.innerHTML = res.isUnlimited ? `无限额度 <span style="font-size: 11px; color: var(--text-sub); font-weight: normal;">(已用 ￥${res.used})</span>` : `剩余 ￥${res.remaining} <span style="font-size: 11px; color: var(--text-sub); font-weight: normal;">(总 ￥${res.total})</span>`;
                } else {
                    balanceEl.innerHTML = `<span style="font-size: 11px; color: var(--text-sub); font-weight: normal;">未开放远程余额接口</span>`;
                }
            }
        }
    },

    async editTokenPrice() {
        const cur = localStorage.getItem('token_price_per_m') || '2.0';
        const price = await this.showCustomPrompt('每 100 万 Token 的综合估算价格(元)：', cur);
        if (price !== null && !isNaN(parseFloat(price))) {
            localStorage.setItem('token_price_per_m', parseFloat(price).toString());
            this.renderApiModalContent();
        }
    },

    async savePromptAndPersona() {
        const sysVal = document.getElementById('system-prompt')?.value || '';
        const charVal = document.getElementById('char-persona')?.value || '';
        
        if (window.PhoneAPI && window.PhoneAPI.LocalDB) {
            try {
                await window.PhoneAPI.LocalDB.set('direct_sys_text', sysVal);
                await window.PhoneAPI.LocalDB.set('direct_char_text', charVal);
            } catch(e) {}
        }

        try {
            localStorage.setItem('system_prompt', sysVal);
            localStorage.setItem('char_persona', charVal);
        } catch(e) {}

        const btn = document.getElementById('btn-save-prompts');
        if (btn) {
            btn.innerHTML = `<i class="ph-bold ph-check"></i> 保存成功！`;
            btn.style.background = '#2a9d8f';
            setTimeout(() => {
                btn.innerHTML = `<i class="ph-bold ph-floppy-disk"></i> 💾 保存提示词与角色人设`;
                btn.style.background = 'var(--primary-color)';
            }, 1200);
        }

        if (window.PhoneAPI && window.PhoneAPI.showToast) {
            window.PhoneAPI.showToast('✅ 提示词与人设已稳固保存！');
        }
    },

    async renderStorageInfo() {
        const el = document.getElementById('storage-info-panel');
        if (!el) return;

        const fmt = (bytes) => {
            const n = Number(bytes) || 0;
            if (n < 1024) return n + ' B';
            if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
            if (n < 1024 * 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + ' MB';
            return (n / 1024 / 1024 / 1024).toFixed(2) + ' GB';
        };

        el.innerHTML = '<div style="color:var(--text-sub);font-size:12px;">正在读取当前存储状态…</div>';

        try {
            const info = await window.PhoneAPI?.getStorageEstimate?.();
            const used = Number(info?.usage) || 0;
            const quota = Number(info?.quota) || 0;
            const pct = quota > 0 ? Math.min(100, used / quota * 100) : 0;
            const persistent = info?.persistent ? '🟢 已启用' : '🟡 普通存储';

            let localBytes = 0;
            try {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i) || '';
                    const value = localStorage.getItem(key) || '';
                    localBytes += (key.length + value.length) * 2;
                }
            } catch (e) {}

            const roleId = window.Config?.currentContactId;
            const chatItems = window.Config?.phoneData?.[roleId]?.wechat?.items || [];
            const chatCount = chatItems.filter(item => item && item.sender !== 'typing' && item.content).length;
            const summaryIndex = Math.max(0, Math.min(
                parseInt(localStorage.getItem('memory_last_summary_index') || '0', 10),
                chatCount
            ));
            const keepRecent = Math.min(120, chatCount);
            const deletable = Math.max(0, summaryIndex - Math.min(summaryIndex, keepRecent));

            const bar = quota > 0
                ? '<div style="height:8px;border-radius:99px;background:var(--border-color);overflow:hidden;margin:9px 0 4px;"><div style="height:100%;width:' + pct.toFixed(1) + '%;background:var(--primary-color);border-radius:99px;"></div></div>'
                : '';

            el.innerHTML =
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">' +
                    '<span style="font-weight:700;color:var(--text-main);">💾 当前浏览器存储</span>' +
                    '<button onclick="window.PhoneUI.renderStorageInfo()" style="border:1px solid var(--border-color);background:transparent;color:var(--text-sub);border-radius:8px;padding:4px 9px;font-size:11px;">刷新</button>' +
                '</div>' +
                '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                    '<div style="padding:10px;border-radius:10px;background:var(--window-bg);"><div style="font-size:11px;color:var(--text-sub);">网站已使用</div><div style="font-size:18px;font-weight:800;color:var(--primary-color);">' + fmt(used) + '</div></div>' +
                    '<div style="padding:10px;border-radius:10px;background:var(--window-bg);"><div style="font-size:11px;color:var(--text-sub);">浏览器配额</div><div style="font-size:18px;font-weight:800;color:var(--primary-color);">' + (quota ? fmt(quota) : '暂不可用') + '</div></div>' +
                '</div>' +
                bar +
                '<div style="font-size:11px;color:var(--text-sub);line-height:1.65;margin-top:7px;">' +
                    '<div>使用率：' + (quota ? pct.toFixed(1) + '%' : '暂不可用') + '</div>' +
                    '<div>LocalStorage：' + fmt(localBytes) + '</div>' +
                    '<div>持久化存储：' + persistent + '</div>' +
                '</div>' +
                '<div style="margin-top:10px;padding:10px;border-radius:10px;background:var(--window-bg);font-size:11px;line-height:1.7;">' +
                    '<div style="font-weight:700;color:var(--text-main);margin-bottom:3px;">💬 当前聊天存储</div>' +
                    '<div style="color:var(--text-sub);">当前角色：' + this.escapeHtml(roleId || '未选择') + '</div>' +
                    '<div style="color:var(--text-sub);">现在还剩：<b style="color:var(--primary-color);">' + chatCount + '</b> 条正常聊天</div>' +
                    '<div style="color:var(--text-sub);">已总结指针：' + summaryIndex + ' 条</div>' +
                    '<div style="color:var(--text-sub);">按 120 条保留规则，目前可清理：<b style="color:var(--primary-color);">' + deletable + '</b> 条</div>' +
                '</div>' +
                '<div style="font-size:10px;color:var(--text-sub);margin-top:7px;line-height:1.45;">“网站已使用”是浏览器对本网站 IndexedDB、LocalStorage、缓存等整体存储的估算，不等于聊天记录大小。</div>';
        } catch (e) {
            console.warn('读取浏览器存储信息失败:', e);
            el.innerHTML = '<div style="font-size:12px;color:var(--danger-color);">暂时无法读取浏览器存储配额，但聊天数据本身不受影响。</div>';
        }
    },

    renderSettings() {
        const contentEl = document.getElementById('app-window-content');
        if (!contentEl) return;
        const today = new Date();
        const defaultDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        const currentColor = localStorage.getItem('app_color') || 'blue';
        const myAvatar = localStorage.getItem('my_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=Me&backgroundColor=e8f0fa';
        const taAvatar = localStorage.getItem('ta_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=TA&backgroundColor=e8f0fa';

        // 🌟 智能获取活跃角色 ID，防止因写死 role_001 导致找不到聊天记录
        const activeRoleId = window.Config?.currentContactId 
            || (window.Config?.phoneData ? Object.keys(window.Config.phoneData)[0] : null) 
            || 'default';
        const allItems = window.Config?.phoneData?.[activeRoleId]?.wechat?.items || [];
        const cleanItems = allItems.filter(i => i.sender !== 'typing' && i.content);
        
        let lastIdx = parseInt(localStorage.getItem('memory_last_summary_index') || '0', 10);
        // 若指针越界，自动回正
        if (lastIdx > cleanItems.length || lastIdx < 0) {
            lastIdx = 0;
            localStorage.setItem('memory_last_summary_index', '0');
        }
        const unsummarizedCount = Math.max(0, cleanItems.length - lastIdx);

        // 🌟 读取上下文设置与自动总结参数
        const curChatLimit = localStorage.getItem('context_chat_limit') || '200';
        const curVaultLimit = localStorage.getItem('context_vault_limit') || '15';
        const autoMemoryEnabled = localStorage.getItem('memory_auto_mode') !== 'false';
        const autoMemoryThreshold = localStorage.getItem('memory_auto_threshold') || '15';

        contentEl.innerHTML = `
        <div class="settings-tabs" style="display: flex; gap: 6px; margin-bottom: 20px;">
            <div class="settings-tab active" id="stab-basic" onclick="window.PhoneUI.switchSetTab('basic')">基础/UI</div>
            <div class="settings-tab" id="stab-ai" onclick="window.PhoneUI.switchSetTab('ai')">大模型</div>
            <div class="settings-tab" id="stab-draw" onclick="window.PhoneUI.switchSetTab('draw')">绘画引擎</div>
            <div class="settings-tab" id="stab-sys" onclick="window.PhoneUI.switchSetTab('sys')">系统维护</div>
        </div>

        <!-- 1. 基础设置 -->
        <div id="set-sec-basic" class="set-section active" style="flex-direction: column; gap: 15px; padding-bottom: 100px;">
            <div class="card" style="padding: 16px;">
                <h3 style="color:var(--primary-color);margin-bottom:15px; font-size: 15px;"><i class="ph-fill ph-user-circle"></i> 基础设定 (头像与名字)</h3>
                <div style="display:flex; justify-content:space-around; align-items:center; margin-bottom:20px; background: var(--icon-bg); padding: 15px; border-radius: 16px; border: 1px dashed var(--border-color);">
                    <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
                        <img id="set-my-avatar" src="${myAvatar}" onclick="window.PhoneUI.triggerAvatarUpload('my_avatar')" style="width:60px; height:60px; border-radius:50%; object-fit:cover; border:2px solid var(--border-color); cursor:pointer;">
                        <span style="font-size:11px; color:var(--text-sub); font-weight:bold;">点击换图</span>
                    </div>
                    <i class="ph-fill ph-arrows-left-right" style="color:var(--border-color); font-size:24px;"></i>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
                        <img id="set-ta-avatar" src="${taAvatar}" onclick="window.PhoneUI.triggerAvatarUpload('ta_avatar')" style="width:60px; height:60px; border-radius:50%; object-fit:cover; border:2px solid var(--border-color); cursor:pointer;">
                        <span style="font-size:11px; color:var(--text-sub); font-weight:bold;">点击换图</span>
                    </div>
                </div>
                <div style="display:flex;gap:10px;margin-bottom:10px;">
                    <div style="flex:1;"><label style="font-size:12px;color:var(--text-main); font-weight: bold;">我的名字</label><input type="text" id="my-name" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:10px;border-radius:8px;margin-top:4px; border: 1px solid var(--border-color); background: var(--window-bg); color: var(--text-main);"></div>
                    <div style="flex:1;"><label style="font-size:12px;color:var(--text-main); font-weight: bold;">TA的名字</label><input type="text" id="char-name" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:10px;border-radius:8px;margin-top:4px; border: 1px solid var(--border-color); background: var(--window-bg); color: var(--text-main);"></div>
                </div>
            </div>

            <div class="card" style="padding: 16px;">
                <h3 style="color:var(--primary-color);margin-bottom:10px; font-size: 15px;"><i class="ph-fill ph-palette"></i> UI 主题装修</h3>
                <div class="engine-title" style="margin-top: 10px; margin-bottom: 8px; font-size: 12px; font-weight: bold; color: var(--text-main);"><i class="ph-fill ph-paint-brush"></i> 全局主题色</div>
                <div class="color-picker-container" style="display: flex; gap: 12px; margin-bottom: 15px;">
                    <div id="color-btn-blue" class="color-circle c-blue ${currentColor === 'blue' ? 'active' : ''}" onclick="window.PhoneUI.changeAppColor('blue')"></div>
                    <div id="color-btn-purple" class="color-circle c-purple ${currentColor === 'purple' ? 'active' : ''}" onclick="window.PhoneUI.changeAppColor('purple')"></div>
                    <div id="color-btn-pink" class="color-circle c-pink ${currentColor === 'pink' ? 'active' : ''}" onclick="window.PhoneUI.changeAppColor('pink')"></div>
                    <div id="color-btn-gold" class="color-circle c-gold ${currentColor === 'gold' ? 'active' : ''}" onclick="window.PhoneUI.changeAppColor('gold')"></div>
                </div>
                <div class="engine-title" style="margin-bottom: 6px; font-size: 12px; font-weight: bold; color: var(--text-main);"><i class="ph-fill ph-heart" style="color:var(--danger-color);"></i> 恋爱纪念日</div>
                <div style="margin-bottom:15px;"><input type="date" id="love-start-date" value="${localStorage.getItem('love_start_date') || defaultDate}" onchange="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:10px;border-radius:8px;border: 1px solid var(--border-color); background: var(--window-bg); color: var(--text-main);"></div>
            </div>

            <div class="card" style="padding: 16px;">
                <h3 style="color:var(--primary-color);margin-bottom:12px; font-size: 15px;"><i class="ph-fill ph-image-square"></i> 自定义背景壁纸</h3>
                <div style="display:flex; flex-direction:column; gap:12px;">
                    <div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <label style="font-size:12px; font-weight:bold; color:var(--text-main);">全局背景壁纸</label>
                            <button onclick="window.PhoneUI.triggerWallpaperUpload('bg_global')" style="font-size:11px; background:var(--primary-color); color:#fff; border:none; padding:4px 10px; border-radius:6px; cursor:pointer;">本地上传</button>
                        </div>
                        <input type="text" id="bg-global" placeholder="外链图片 URL 或点击上传" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px 10px;border-radius:8px;border:1px solid var(--border-color);background:var(--window-bg);color:var(--text-main);font-size:12px;">
                    </div>
                    <div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <label style="font-size:12px; font-weight:bold; color:var(--text-main);">聊天窗口壁纸</label>
                            <button onclick="window.PhoneUI.triggerWallpaperUpload('bg_chat')" style="font-size:11px; background:var(--primary-color); color:#fff; border:none; padding:4px 10px; border-radius:6px; cursor:pointer;">本地上传</button>
                        </div>
                        <input type="text" id="bg-chat" placeholder="外链图片 URL 或点击上传" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px 10px;border-radius:8px;border:1px solid var(--border-color);background:var(--window-bg);color:var(--text-main);font-size:12px;">
                    </div>
                    <div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <label style="font-size:12px; font-weight:bold; color:var(--text-main);">日记封面壁纸</label>
                            <button onclick="window.PhoneUI.triggerWallpaperUpload('bg_diary_cover')" style="font-size:11px; background:var(--primary-color); color:#fff; border:none; padding:4px 10px; border-radius:6px; cursor:pointer;">本地上传</button>
                        </div>
                        <input type="text" id="bg-diary-cover" placeholder="外链图片 URL 或点击上传" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px 10px;border-radius:8px;border:1px solid var(--border-color);background:var(--window-bg);color:var(--text-main);font-size:12px;">
                    </div>
                    <div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <label style="font-size:12px; font-weight:bold; color:var(--text-main);">日记内页壁纸</label>
                            <button onclick="window.PhoneUI.triggerWallpaperUpload('bg_diary_page')" style="font-size:11px; background:var(--primary-color); color:#fff; border:none; padding:4px 10px; border-radius:6px; cursor:pointer;">本地上传</button>
                        </div>
                        <input type="text" id="bg-diary-page" placeholder="外链图片 URL 或点击上传" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px 10px;border-radius:8px;border:1px solid var(--border-color);background:var(--window-bg);color:var(--text-main);font-size:12px;">
                    </div>
                </div>
            </div>
        </div>

        <!-- 2. 大模型与记忆设置 -->
        <div id="set-sec-ai" class="set-section" style="flex-direction: column; gap: 18px; padding-bottom: 100px;">
            <div class="card" style="padding: 16px; border: 1px solid var(--border-color);">
                <h3 style="color:var(--primary-color);margin-bottom:12px; font-size: 15px;"><i class="ph-fill ph-scroll"></i> 提示词与人设</h3>
                <div style="margin-bottom:15px;">
                    <label style="font-size:13px;color:var(--text-main);font-weight:bold; display: block; margin-bottom: 6px;">1. 系统核心指令 (规则/防八股)</label>
                    <textarea id="system-prompt" rows="3" style="width:100%;padding:10px;border-radius:10px;resize:vertical;font-size:13px; border: 1px solid var(--border-color); background: var(--window-bg); color: var(--text-main); line-height: 1.5;"></textarea>
                </div>
                <div style="margin-bottom:15px;">
                    <label style="font-size:13px;color:var(--text-main);font-weight:bold; display: block; margin-bottom: 6px;">2. 角色完整人设 (性格/口吻/设定)</label>
                    <textarea id="char-persona" rows="8" style="width:100%;padding:10px;border-radius:10px;resize:vertical;font-size:13px; border: 1px solid var(--border-color); background: var(--window-bg); color: var(--text-main); line-height: 1.5;"></textarea>
                </div>

                <button type="button" 
                        id="btn-save-prompts"
                        onclick="window.PhoneUI.savePromptAndPersona()"
                        style="width: 100%; padding: 12px; border-radius: 10px; font-weight: bold; background: var(--primary-color); color: #fff; border: none; cursor: pointer; font-size: 13px; display: flex; justify-content: center; align-items: center; gap: 6px; box-shadow: 0 3px 10px rgba(0,0,0,0.12); transition: 0.2s;">
                    <i class="ph-bold ph-floppy-disk"></i> 💾 保存提示词与角色人设
                </button>
            </div>

            <!-- 🌟 核心：记忆管理、上下文条数与自动总结门槛 -->
            <div class="card" style="padding: 16px; border: 1px solid var(--border-color);">
                <h3 style="color:var(--primary-color);margin-bottom:12px; font-size: 15px;"><i class="ph-fill ph-brain"></i> 记忆管理与上下文调控</h3>
                
                <div style="background: var(--icon-bg); padding: 14px; border-radius: 12px; margin-bottom: 16px; border: 1px dashed var(--border-color);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div>
                            <div style="font-size: 12px; font-weight: bold; color: var(--text-main);">待提炼的聊天记忆</div>
                            <div style="font-size: 22px; font-weight: 800; color: var(--primary-color); margin-top: 2px;">
                                ${unsummarizedCount} <span style="font-size: 12px; font-weight: normal; color: var(--text-sub);">条新记录</span>
                            </div>
                        </div>
                        <div style="text-align: right; font-size: 11px; color: var(--text-sub); line-height: 1.5;">
                            <div>总聊天：<b>${cleanItems.length}</b> 条</div>
                            <div>已归档进度：第 <b>${lastIdx}</b> 条</div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px; margin-top: 10px;">
                        <button onclick="if(window.PhoneEngine){window.PhoneEngine.manualManageMemory(); PhoneUI.renderSettings(); PhoneUI.switchSetTab('ai');}" style="flex: 2; padding: 10px; font-size: 12px; font-weight: bold; border-radius: 10px; background: var(--primary-color); color: #fff; border: none; cursor: pointer;">
                            <i class="ph-fill ph-sparkle"></i> ${unsummarizedCount > 0 ? '提炼新记忆' : '重新提炼近期记忆'}
                        </button>
                        <button onclick="localStorage.setItem('memory_last_summary_index', '0'); PhoneUI.renderSettings(); PhoneUI.switchSetTab('ai'); PhoneAPI.showToast('🔄 进度已重置，现在可提炼全部记录！');" style="flex: 1; padding: 10px 8px; font-size: 11px; border-radius: 10px; background: transparent; color: var(--text-sub); border: 1px solid var(--border-color); cursor: pointer;">
                            重置进度
                        </button>
                    </div>
                </div>

                <!-- 自动归档控制 -->
                <div style="background: var(--icon-bg); padding: 12px; border-radius: 12px; margin-bottom: 16px; border: 1px solid var(--border-color);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-weight: bold; font-size: 13px; color: var(--text-main);">✨ 满额自动归档进星海</span>
                        <input type="checkbox" id="toggle-auto-memory" ${autoMemoryEnabled ? 'checked' : ''} onchange="localStorage.setItem('memory_auto_mode', this.checked ? 'true' : 'false'); window.PhoneAPI?.showToast?.(this.checked ? '🟢 已开启自动记忆总结' : '⚪ 已关闭自动记忆总结');" style="width: 18px; height: 18px; accent-color: var(--primary-color); cursor: pointer;">
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-sub); margin-bottom: 6px;">
                        <span>自动触发门槛（新聊满多少条触发）：</span>
                        <b id="label-auto-threshold" style="color: var(--primary-color);">${autoMemoryThreshold} 条</b>
                    </div>
                    <input type="range" min="6" max="60" step="2" value="${autoMemoryThreshold}" oninput="document.getElementById('label-auto-threshold').innerText = this.value + ' 条'; localStorage.setItem('memory_auto_threshold', this.value);" style="width: 100%; accent-color: var(--primary-color);">
                </div>

                <!-- 上下文携带条数 -->
                <div style="margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
                        <span style="font-weight: bold; color: var(--text-main);">聊天上下文携带条数</span>
                        <span id="label-chat-limit" style="color: var(--primary-color); font-weight: bold;">${curChatLimit === '0' ? '全量（无限记忆）' : curChatLimit + ' 条'}</span>
                    </div>
                    <input type="range" min="20" max="500" step="10" value="${curChatLimit === '0' ? 500 : curChatLimit}" oninput="const val = this.value >= 500 ? '0' : this.value; document.getElementById('label-chat-limit').innerText = val === '0' ? '全量（无限记忆）' : val + ' 条'; localStorage.setItem('context_chat_limit', val);" style="width: 100%; accent-color: var(--primary-color);">
                </div>

                <div>
                    <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
                        <span style="font-weight: bold; color: var(--text-main);">长期记忆库加载数量</span>
                        <span id="label-vault-limit" style="color: var(--primary-color); font-weight: bold;">${curVaultLimit} 条</span>
                    </div>
                    <input type="range" min="5" max="60" step="1" value="${curVaultLimit}" oninput="document.getElementById('label-vault-limit').innerText = this.value + ' 条'; localStorage.setItem('context_vault_limit', this.value);" style="width: 100%; accent-color: var(--primary-color);">
                </div>
            </div>

            <!-- 预设配置卡片 -->
            <div class="card" style="padding: 16px; border: 1px solid var(--border-color);">
                <h3 style="color:var(--primary-color);margin-bottom:12px; font-size: 15px;"><i class="ph-fill ph-database"></i> 语言引擎预设配置</h3>
                
                <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 15px;">
                    <select id="preset-delete-select" onchange="window.PhoneUI.fillPresetData()" style="flex: 1; padding: 10px 12px; border-radius: 10px; border: 1.5px solid var(--primary-color); background: var(--icon-bg); color: var(--text-main); font-size: 13px;">
                        <option value="">-- 点击选择预设切换 --</option>
                    </select>
                    <button onclick="if(window.PhoneAPI) window.PhoneAPI.deletePreset()" style="background: transparent; color: var(--danger-color); border: 1px solid var(--danger-color); padding: 10px 14px; border-radius: 10px; cursor: pointer;">
                        <i class="ph ph-trash"></i>
                    </button>
                </div>

                <div style="margin-bottom:10px;">
                    <label style="font-size:12px;color:var(--text-main); font-weight: bold; display: block; margin-bottom: 4px;">预设名称 (别名)</label>
                    <input type="text" id="preset-name" placeholder="起个名字 (如: 空悲切-Sonnet)" style="width:100%;padding:10px;border-radius:8px; border: 1px solid var(--border-color); background: var(--window-bg); color: var(--text-main);">
                </div>
                <div style="margin-bottom:10px;">
                    <label style="font-size:12px;color:var(--text-main); font-weight: bold; display: block; margin-bottom: 4px;">接口地址 (Base URL)</label>
                    <input type="text" id="preset-url" placeholder="如: https://api.blanka.cc" style="width:100%;padding:10px;border-radius:8px; border: 1px solid var(--border-color); background: var(--window-bg); color: var(--text-main);">
                </div>
                <div style="margin-bottom:10px;">
                    <label style="font-size:12px;color:var(--text-main); font-weight: bold; display: block; margin-bottom: 4px;">API Key (密钥)</label>
                    <input type="password" id="preset-key" placeholder="sk-..." style="width:100%;padding:10px;border-radius:8px; border: 1px solid var(--border-color); background: var(--window-bg); color: var(--text-main);">
                </div>
                <div style="margin-bottom:18px;">
                    <label style="font-size:12px;color:var(--text-main); font-weight: bold; display: block; margin-bottom: 4px;">模型名称 (Model)</label>
                    <input type="text" id="preset-model" placeholder="如: claude-3-5-sonnet-20241022" style="width:100%;padding:10px;border-radius:8px; border: 1px solid var(--border-color); background: var(--window-bg); color: var(--text-main);">
                </div>
                
                <button type="button" 
                        id="btn-direct-save-preset"
                        style="width: 100%; padding: 14px; border-radius: 12px; font-weight: bold; background: var(--primary-color); color: #fff; border: none; cursor: pointer; font-size: 14px; display: flex; justify-content: center; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                    <i class="ph ph-floppy-disk"></i> 保存 / 更新并立即使用当前预设
                </button>
            </div>
        </div>

        <!-- 3. 绘画引擎 -->
        <div id="set-sec-draw" class="set-section" style="flex-direction: column; gap: 15px; padding-bottom: 100px;">
            <div class="card" style="padding: 16px;">
                <h3 style="color:var(--primary-color);margin-bottom:10px; font-size: 15px;"><i class="ph-fill ph-image"></i> 绘画引擎配置 (DALL-E 格式)</h3>
                <div style="margin-bottom:10px;"><input type="text" id="img-api-url" placeholder="接口地址 (例如: https://dangao.iisbo.com/v1)" style="width:100%;padding:10px;border-radius:8px; border: 1px solid var(--border-color); background: var(--window-bg); color: var(--text-main);"></div>
                <div style="margin-bottom:10px;"><input type="password" id="img-api-key" placeholder="API Key (密钥)" style="width:100%;padding:10px;border-radius:8px; border: 1px solid var(--border-color); background: var(--window-bg); color: var(--text-main);"></div>
                <div style="margin-bottom:15px;"><input type="text" id="img-api-model" placeholder="模型名称 (例如: GPT-Image-2 或 dall-e-3)" style="width:100%;padding:10px;border-radius:8px; border: 1px solid var(--border-color); background: var(--window-bg); color: var(--text-main);"></div>
                <div style="display:flex; gap:10px;">
                    <button class="btn-refresh" onclick="window.PhoneUI.saveDrawSettings()" style="flex:1; margin-top:0; background:var(--primary-color);"><i class="ph-fill ph-floppy-disk"></i> 💾 保存配置</button>
                    <button class="btn-refresh" onclick="if(window.PhoneEngine && window.PhoneEngine.testDrawImage) window.PhoneEngine.testDrawImage()" style="flex:1; margin-top:0; background:var(--icon-bg); color:var(--text-main); border:1px solid var(--border-color);"><i class="ph-fill ph-sparkle"></i> 🧪 测试连接</button>
                </div>
            </div>
        </div>

        <!-- 4. 系统维护 -->
        <div id="set-sec-sys" class="set-section" style="flex-direction: column; gap: 15px; padding-bottom: 100px;">
            <div class="card" style="border: 1px solid var(--primary-color); padding: 16px;">
                <h3 style="color:var(--primary-color);margin-bottom:10px; font-size: 15px;"><i class="ph-fill ph-cloud-check"></i> Cloudflare 云端同步</h3>
                <div style="display:flex;gap:10px;"><button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.syncToCloud()" style="flex:1;margin-top:0;background:linear-gradient(135deg, var(--primary-color), var(--secondary-color));"><i class="ph-fill ph-cloud-arrow-up"></i> 备份到云端</button><button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.restoreFromCloud()" style="flex:1;margin-top:0;background:var(--icon-bg);color:var(--text-main);border:1px solid var(--border-color);"><i class="ph-fill ph-cloud-arrow-down"></i> 从云端拉取</button></div>
            </div>
            
            <div class="card" style="padding: 16px;">
                <h3 style="color:var(--primary-color);margin-bottom:15px; font-size: 15px;"><i class="ph-fill ph-floppy-disk-back"></i> 本地文件备份 (JSON)</h3>
                <div style="display:flex;gap:10px;">
                    <button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.exportData()" style="flex:1;margin-top:0;background:var(--secondary-color);"><i class="ph ph-export"></i> 导出文件</button>
                    <button class="btn-refresh" onclick="document.getElementById('import-file').click()" style="flex:1;margin-top:0;background:#2a9d8f;"><i class="ph ph-import"></i> 导入文件</button>
                    <input type="file" id="import-file" style="display:none" accept=".json" onchange="if(window.PhoneAPI) window.PhoneAPI.importData(event)">
                </div>
            </div>

            <div class="card" style="padding: 16px; border: 1px solid var(--primary-color);">
                <h3 style="color:var(--primary-color);margin-bottom:10px; font-size: 15px;"><i class="ph-fill ph-database"></i> 浏览器存储</h3>
                <div id="storage-info-panel">
                    <div style="color:var(--text-sub);font-size:12px;">正在检测浏览器存储空间…</div>
                </div>
            </div>

            <div class="card" style="padding: 16px;">
                <h3 style="color:var(--danger-color);margin-bottom:15px; font-size: 15px;"><i class="ph-fill ph-warning-circle"></i> 系统维护</h3>
                <button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.forceUpdate()" style="background:#f4a261;margin-top:0;margin-bottom:10px;"><i class="ph ph-arrows-clockwise"></i> 强制更新系统</button>
                <button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.clearChat()" style="background:var(--danger-color);margin-top:0;"><i class="ph ph-trash"></i> 清空记录</button>
            </div>
        </div>
        `;

        setTimeout(async () => {
            this.switchSetTab('basic');
            this.renderStorageInfo();

            if (window.PhoneAPI && window.PhoneAPI.loadSettings) {
                window.PhoneAPI.loadSettings();
            }

            let finalSys = localStorage.getItem('system_prompt') || '';
            let finalChar = localStorage.getItem('char_persona') || '';

            if (window.PhoneAPI?.LocalDB) {
                try {
                    const dbSys = await window.PhoneAPI.LocalDB.get('direct_sys_text');
                    const dbChar = await window.PhoneAPI.LocalDB.get('direct_char_text');
                    if (dbSys && typeof dbSys === 'string') finalSys = dbSys;
                    if (dbChar && typeof dbChar === 'string') finalChar = dbChar;
                } catch(e) {}
            }

            const sysPromptEl = document.getElementById('system-prompt');
            const charPersonaEl = document.getElementById('char-persona');
            if (sysPromptEl) sysPromptEl.value = finalSys;
            if (charPersonaEl) charPersonaEl.value = finalChar;

            const saveBtn = document.getElementById('btn-direct-save-preset');
            if (saveBtn) {
                saveBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.executeSavePresetDirectly();
                });
            }

            if (this.bindLongPresses) this.bindLongPresses();
            if (window.PhoneAPI && window.PhoneAPI.refreshPresetDropdowns) {
                window.PhoneAPI.refreshPresetDropdowns();
            }
        }, 50);
    }
};

if (typeof window !== 'undefined') { window.PhoneUI = PhoneUI; }
