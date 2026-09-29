import { ChatUI } from './ui/chat_ui.js';
import { MemoryUI } from './ui/memory_ui.js';
import { DiaryUI } from './ui/diary_ui.js';
import { MomentsUI } from './ui/moments_ui.js';
import { ScheduleUI } from './ui/schedule_ui.js';
import { StudyUI } from './ui/study_ui.js';
import { CallUI } from './ui/call_ui.js';

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
                    html += d === today ? `<span class="today">${d}</span>` : `<span>${d}</span>`;
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
        const title = prompt("给视频起个名字（方便TA理解，如：高数讲解）", "高数课");
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
        const elements = document.querySelectorAll('.long-pressable');
        const fileInput = document.getElementById('global-file-input');
        let holdTimer = null, pendingKey = null, pendingEl = null;

        elements.forEach(el => {
            const key = el.dataset.img;
            if (el.dataset.bound) return;
            el.dataset.bound = "true";

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

        if (fileInput && !fileInput.dataset.bound) {
            fileInput.dataset.bound = "true";
            fileInput.addEventListener('change', async e => {
                const f = e.target.files && e.target.files[0];
                e.target.value = '';
                if (!f || !pendingKey) return;
                if (window.PhoneAPI) window.PhoneAPI.showToast('处理中...');
                try {
                    const blob = await window.PhoneAPI.LocalDB.shrink(f, 800);
                    await window.PhoneAPI.LocalDB.set(pendingKey, blob);
                    const url = window.PhoneAPI.LocalDB.urlOf(pendingKey, blob);
                    
                    const allTargetEls = document.querySelectorAll(`[data-img="${pendingKey}"]`);
                    allTargetEls.forEach(targetEl => {
                        if (targetEl.tagName.toLowerCase() === 'img') {
                            targetEl.src = url;
                        } else {
                            if (pendingKey.startsWith('bg_')) {
                                let cssVar = '--bg-image-' + pendingKey.replace('bg_', '').replace(/_/g, '-');
                                if (pendingKey === 'bg_global') cssVar = '--bg-image-global';
                                document.documentElement.style.setProperty(cssVar, `url('${url}')`);
                            } else {
                                const imgChild = targetEl.querySelector('img');
                                if (imgChild) imgChild.src = url;
                            }
                        }
                    });
                    if (window.PhoneAPI) window.PhoneAPI.showToast('✨ 换图成功！已保存在本地。');
                } catch (err) { if (window.PhoneAPI) window.PhoneAPI.showToast('换图失败'); }
                pendingKey = null; pendingEl = null;
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
                const allTargetEls = document.querySelectorAll(`[data-img="${key}"]`);
                allTargetEls.forEach(el => {
                    if (el.tagName.toLowerCase() === 'img') el.src = event.target.result;
                });
                if (window.PhoneAPI) window.PhoneAPI.showToast("头像更换成功！");
            };
            reader.readAsDataURL(f);
        };
        fileInput.click();
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
            if (window.PhoneAPI) window.PhoneAPI.showToast('✏️ 已加载预设，修改后点击保存即可覆盖');
        }
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

    renderSettings() {
        const contentEl = document.getElementById('app-window-content');
        if (!contentEl) return;
        const today = new Date();
        const defaultDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        const currentColor = localStorage.getItem('app_color') || 'blue';
        const myAvatar = localStorage.getItem('my_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=Me&backgroundColor=e8f0fa';
        const taAvatar = localStorage.getItem('ta_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=TA&backgroundColor=e8f0fa';

        const roleId = window.Config?.currentContactId || 'role_001';
        const allItems = window.Config?.phoneData?.[roleId]?.wechat?.items || [];
        const cleanItems = allItems.filter(i => i.sender !== 'typing' && i.content);
        const lastIdx = parseInt(localStorage.getItem('memory_last_summary_index') || '0', 10);
        const unsummarizedCount = Math.max(0, cleanItems.length - lastIdx);

        const curChatLimit = localStorage.getItem('context_chat_limit') || '60';
        const curVaultLimit = localStorage.getItem('context_vault_limit') || '15';
        const curThreshold = localStorage.getItem('memory_auto_threshold') || '8';

        contentEl.innerHTML = `
        <div class="settings-tabs">
            <div class="settings-tab active" id="stab-basic" onclick="window.PhoneUI.switchSetTab('basic')">基础/UI</div>
            <div class="settings-tab" id="stab-ai" onclick="window.PhoneUI.switchSetTab('ai')">大模型</div>
            <div class="settings-tab" id="stab-draw" onclick="window.PhoneUI.switchSetTab('draw')">绘画引擎</div>
            <div class="settings-tab" id="stab-sys" onclick="window.PhoneUI.switchSetTab('sys')">系统维护</div>
        </div>

        <div id="set-sec-basic" class="set-section active">
            <div class="card">
                <h3 style="color:var(--primary-color);margin-bottom:15px;"><i class="ph-fill ph-user-circle"></i> 基础设定 (头像与名字)</h3>
                <div style="display:flex; justify-content:space-around; align-items:center; margin-bottom:20px; background: var(--icon-bg); padding: 15px; border-radius: 16px; border: 1px dashed var(--border-color);">
                    <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
                        <img id="set-my-avatar" src="${myAvatar}" onclick="window.PhoneUI.triggerAvatarUpload('my_avatar')" style="width:60px; height:60px; border-radius:50%; object-fit:cover; border:2px solid var(--border-color); cursor:pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                        <span style="font-size:11px; color:var(--text-sub); font-weight:bold;">点击换图</span>
                    </div>
                    <i class="ph-fill ph-arrows-left-right" style="color:var(--border-color); font-size:24px;"></i>
                    <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
                        <img id="set-ta-avatar" src="${taAvatar}" onclick="window.PhoneUI.triggerAvatarUpload('ta_avatar')" style="width:60px; height:60px; border-radius:50%; object-fit:cover; border:2px solid var(--border-color); cursor:pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                        <span style="font-size:11px; color:var(--text-sub); font-weight:bold;">点击换图</span>
                    </div>
                </div>
                <div style="display:flex;gap:10px;margin-bottom:10px;">
                    <div style="flex:1;"><label style="font-size:12px;color:var(--text-sub);">我的名字</label><input type="text" id="my-name" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;margin-top:4px;"></div>
                    <div style="flex:1;"><label style="font-size:12px;color:var(--text-sub);">TA的名字</label><input type="text" id="char-name" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;margin-top:4px;"></div>
                </div>
            </div>

            <div class="card">
                <h3 style="color:var(--primary-color);margin-bottom:10px;"><i class="ph-fill ph-palette"></i> UI 主题装修</h3>
                <div class="engine-title"><i class="ph-fill ph-paint-brush"></i> 全局主题色</div>
                <div class="color-picker-container">
                    <div id="color-btn-blue" class="color-circle c-blue ${currentColor === 'blue' ? 'active' : ''}" onclick="window.PhoneUI.changeAppColor('blue')" title="星河水"></div>
                    <div id="color-btn-purple" class="color-circle c-purple ${currentColor === 'purple' ? 'active' : ''}" onclick="window.PhoneUI.changeAppColor('purple')" title="冰晶紫"></div>
                    <div id="color-btn-pink" class="color-circle c-pink ${currentColor === 'pink' ? 'active' : ''}" onclick="window.PhoneUI.changeAppColor('pink')" title="薄雾粉"></div>
                    <div id="color-btn-gold" class="color-circle c-gold ${currentColor === 'gold' ? 'active' : ''}" onclick="window.PhoneUI.changeAppColor('gold')" title="天光金"></div>
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
                <div style="margin-bottom:15px;"><label style="font-size:12px;color:var(--text-main);font-weight:bold;">1. 系统指令 (防八股/核心规则)</label><textarea id="system-prompt" rows="4" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:10px;border-radius:8px;resize:vertical;font-size:12px;margin-top:4px;"></textarea></div>
                <div style="margin-bottom:15px;"><label style="font-size:12px;color:var(--text-main);font-weight:bold;">2. 角色人设 (性格/背景/口吻)</label><textarea id="char-persona" rows="6" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:10px;border-radius:8px;resize:vertical;font-size:12px;margin-top:4px;"></textarea></div>
            </div>

            <div class="card">
                <h3 style="color:var(--primary-color);margin-bottom:15px;"><i class="ph-fill ph-sliders-horizontal"></i> 记忆与上下文调节</h3>
                <div style="background:var(--icon-bg); padding:12px; border-radius:12px; margin-bottom:15px; border:1px dashed var(--border-color); display:flex; justify-content:space-between; align-items:center;">
                    <div style="flex:1;">
                        <div style="font-size:12px; font-weight:bold;">未总结消息：<span style="color:var(--primary-color); font-size:16px;">${unsummarizedCount}</span> 条</div>
                    </div>
                    <button onclick="localStorage.setItem('memory_last_summary_index', cleanItems.length.toString()); PhoneUI.renderSettings(); PhoneUI.switchSetTab('ai'); PhoneAPI.showToast('✅ 历史旧账已全部清零！');" style="padding:6px 8px; font-size:11px; border-radius:8px; background:transparent; color:var(--text-sub); border:1px solid var(--border-color); cursor:pointer;">清零旧账</button>
                </div>
                <div style="margin-bottom:15px;">
                    <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:5px;"><span style="font-weight:bold;">聊天上下文携带条数</span><span id="label-chat-limit" style="color:var(--primary-color); font-weight:bold;">${curChatLimit} 条</span></div>
                    <input type="range" min="10" max="200" step="5" value="${curChatLimit}" oninput="document.getElementById('label-chat-limit').innerText = this.value + ' 条'; localStorage.setItem('context_chat_limit', this.value);" style="width:100%;">
                </div>
                <div style="margin-bottom:15px;">
                    <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:5px;"><span style="font-weight:bold;">长期记忆库加载数量</span><span id="label-vault-limit" style="color:var(--primary-color); font-weight:bold;">${curVaultLimit} 条</span></div>
                    <input type="range" min="5" max="60" step="1" value="${curVaultLimit}" oninput="document.getElementById('label-vault-limit').innerText = this.value + ' 条'; localStorage.setItem('context_vault_limit', this.value);" style="width:100%;">
                </div>
            </div>

            <div class="card">
                <h3 style="color:var(--primary-color);margin-bottom:10px;"><i class="ph-fill ph-database"></i> 语言引擎预设 (文本模型)</h3>
                <div style="display:flex;gap:8px;align-items:center;margin-bottom:15px;"><select id="preset-delete-select" onchange="window.PhoneUI.fillPresetData()" style="flex:1;padding:8px;border-radius:8px;border:1px solid var(--primary-color);"><option value="">-- 选择预设以编辑或删除 --</option></select><button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.deletePreset()" style="width:auto;margin:0;background:transparent;color:var(--danger-color);border:1px solid var(--danger-color);padding:8px 12px;"><i class="ph ph-trash"></i></button></div>
                <div style="margin-bottom:10px;"><input type="text" id="preset-name" placeholder="起个名字 (如: 硅基-DeepSeek)" style="width:100%;padding:8px;border-radius:8px;"></div>
                <div style="margin-bottom:10px;"><input type="text" id="preset-url" placeholder="接口地址 (Base URL)" style="width:100%;padding:8px;border-radius:8px;"></div>
                <div style="margin-bottom:10px;"><input type="password" id="preset-key" placeholder="API Key (密钥)" style="width:100%;padding:8px;border-radius:8px;"></div>
                <div style="margin-bottom:15px;"><input type="text" id="preset-model" placeholder="模型名称 (Model)" style="width:100%;padding:8px;border-radius:8px;"></div>
                <button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.savePreset()" style="margin-top:0;"><i class="ph ph-floppy-disk"></i> 保存 / 更新当前预设</button>
            </div>
        </div>

        <div id="set-sec-draw" class="set-section">
            <div class="card">
                <h3 style="color:var(--primary-color);margin-bottom:10px;"><i class="ph-fill ph-image"></i> 绘画引擎配置 (DALL-E 格式)</h3>
                <div style="margin-bottom:10px;"><input type="text" id="img-api-url" placeholder="接口地址 (例如: https://dangao.iisbo.com/v1)" style="width:100%;padding:8px;border-radius:8px;"></div>
                <div style="margin-bottom:10px;"><input type="password" id="img-api-key" placeholder="API Key (密钥)" style="width:100%;padding:8px;border-radius:8px;"></div>
                <div style="margin-bottom:15px;"><input type="text" id="img-api-model" placeholder="模型名称 (例如: GPT-Image-2 或 dall-e-3)" style="width:100%;padding:8px;border-radius:8px;"></div>
                <div style="display:flex; gap:10px;">
                    <button class="btn-refresh" onclick="window.PhoneUI.saveDrawSettings()" style="flex:1; margin-top:0; background:var(--primary-color);"><i class="ph-fill ph-floppy-disk"></i> 💾 保存配置</button>
                    <button class="btn-refresh" onclick="if(window.PhoneEngine && window.PhoneEngine.testDrawImage) window.PhoneEngine.testDrawImage()" style="flex:1; margin-top:0; background:var(--icon-bg); color:var(--text-main); border:1px solid var(--border-color);"><i class="ph-fill ph-sparkle"></i> 🧪 测试连接</button>
                </div>
            </div>
        </div>

        <div id="set-sec-sys" class="set-section">
            <div class="card" style="border: 1px solid var(--primary-color);">
                <h3 style="color:var(--primary-color);margin-bottom:10px;"><i class="ph-fill ph-cloud-check"></i> Cloudflare 云端同步</h3>
                <div style="display:flex;gap:10px;"><button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.syncToCloud()" style="flex:1;margin-top:0;background:linear-gradient(135deg, var(--primary-color), var(--secondary-color));"><i class="ph-fill ph-cloud-arrow-up"></i> 备份到云端</button><button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.restoreFromCloud()" style="flex:1;margin-top:0;background:var(--icon-bg);color:var(--text-main);border:1px solid var(--border-color);"><i class="ph-fill ph-cloud-arrow-down"></i> 从云端拉取</button></div>
            </div>
            
            <div class="card">
                <h3 style="color:var(--primary-color);margin-bottom:15px;"><i class="ph-fill ph-floppy-disk-back"></i> 本地文件备份 (JSON)</h3>
                <div style="display:flex;gap:10px;">
                    <button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.exportData()" style="flex:1;margin-top:0;background:var(--secondary-color);"><i class="ph ph-export"></i> 导出文件</button>
                    <button class="btn-refresh" onclick="document.getElementById('import-file').click()" style="flex:1;margin-top:0;background:#2a9d8f;"><i class="ph ph-import"></i> 导入文件</button>
                    <input type="file" id="import-file" style="display:none" accept=".json" onchange="if(window.PhoneAPI) window.PhoneAPI.importData(event)">
                </div>
            </div>

            <div class="card">
                <h3 style="color:var(--danger-color);margin-bottom:15px;"><i class="ph-fill ph-warning-circle"></i> 系统维护</h3>
                <button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.forceUpdate()" style="background:#f4a261;margin-top:0;margin-bottom:10px;"><i class="ph ph-arrows-clockwise"></i> 强制更新系统</button>
                <button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.clearChat()" style="background:var(--danger-color);margin-top:0;"><i class="ph ph-trash"></i> 清空记录</button>
            </div>
        </div>
        `;

        setTimeout(() => {
            if (this.bindLongPresses) this.bindLongPresses();
            if (window.PhoneAPI) {
                if (window.PhoneAPI.loadSettings) window.PhoneAPI.loadSettings();
                if (window.PhoneAPI.refreshPresetDropdowns) window.PhoneAPI.refreshPresetDropdowns();
            }
        }, 50);
    }
};

if (typeof window !== 'undefined') { window.PhoneUI = PhoneUI; }
