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

        if (appId === 'settings') {
            this.renderSettings();
        } else if (appId === 'memory_vault') {
            contentEl.innerHTML = `<div id="vault-content-area" style="padding-bottom: 80px;"></div>`;
            this.renderMemoryVault();
        } else if (appId === 'favorites') {
            this.renderFavorites();
        }
    },

    closeApp() {
        const winEl = document.getElementById('app-window');
        if (winEl) winEl.classList.remove('open');
    },

    // 🌟 核心：右上角切 API 弹窗模块完整挂载！
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
    },

    async editTokenPrice() {
        const cur = localStorage.getItem('token_price_per_m') || '2.0';
        const price = await this.showCustomPrompt('每 100 万 Token 的综合估算价格(元)：', cur);
        if (price !== null && !isNaN(parseFloat(price))) {
            localStorage.setItem('token_price_per_m', parseFloat(price).toString());
            this.renderApiModalContent();
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
        if (tabId === 'sys') {
            this.renderDebugLogs();
        }
    },

    getStorageUsage() {
        let total = 0;
        for (let x in localStorage) {
            if (localStorage.hasOwnProperty(x)) {
                total += (localStorage[x].length + x.length) * 2;
            }
        }
        const mb = (total / 1024 / 1024).toFixed(2);
        const percent = Math.min(100, Math.round((total / (5 * 1024 * 1024)) * 100));
        return { mb, percent };
    },

    renderDebugLogs() {
        const container = document.getElementById('debug-log-container');
        if (!container) return;

        const { mb, percent } = this.getStorageUsage();
        const logs = window.PhoneAPI?.logger ? window.PhoneAPI.logger.getLogs() : [];
        let statusColor = percent > 85 ? '#e63946' : (percent > 60 ? '#f4a261' : '#2a9d8f');

        let html = `
            <div style="background: var(--icon-bg); padding: 12px; border-radius: 12px; border: 1px solid var(--border-color); margin-bottom: 12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <span style="font-size:12px; font-weight:bold; color:var(--text-main);">本地存储 (5MB配额):</span>
                    <span style="font-size:12px; font-weight:bold; color:${statusColor};">${mb} MB / 5.0 MB (${percent}%)</span>
                </div>
                <div style="width:100%; height:6px; background:rgba(0,0,0,0.08); border-radius:3px; overflow:hidden;">
                    <div style="width:${percent}%; height:100%; background:${statusColor}; transition:0.3s;"></div>
                </div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span style="font-size:12px; font-weight:bold; color:var(--text-main);"><i class="ph-bold ph-terminal"></i> 运行追踪 (${logs.length}条)</span>
                <div style="display:flex; gap:6px;">
                    <button onclick="navigator.clipboard.writeText(localStorage.getItem('sys_error_logs') || '无日志'); alert('✅ 日志已复制到剪贴板！');" style="font-size:10px; padding:3px 8px; border-radius:6px; background:var(--primary-color); color:#fff; border:none; cursor:pointer;">复制日志</button>
                    <button onclick="if(window.PhoneAPI){window.PhoneAPI.logger.clear(); window.PhoneUI.renderDebugLogs();}" style="font-size:10px; padding:3px 8px; border-radius:6px; background:transparent; color:var(--text-sub); border:1px solid var(--border-color); cursor:pointer;">清空</button>
                </div>
            </div>

            <div style="background:#1e1e24; color:#d4d4d4; font-family:monospace; font-size:11px; padding:10px; border-radius:10px; max-height:180px; overflow-y:auto; line-height:1.5;">
        `;

        if (logs.length === 0) {
            html += `<div style="color:#6c757d;">暂无任何异常，系统运行顺畅 ✨</div>`;
        } else {
            logs.forEach(l => {
                let badge = l.type === 'ERROR' ? 'color:#ff6b6b' : (l.type === 'CRASH' ? 'color:#ff4757;font-weight:bold;' : 'color:#1dd1a1');
                html += `<div style="margin-bottom:6px; border-bottom:1px dashed #333; padding-bottom:4px;">
                    <span style="color:#888;">[${l.time}]</span> <span style="${badge}">[${l.type}]</span> <b>${this.escapeHtml(l.msg)}</b>
                    ${l.detail ? `<div style="color:#aaa; font-size:10px; word-break:break-all;">${this.escapeHtml(l.detail)}</div>` : ''}
                </div>`;
            });
        }

        html += `</div>`;
        container.innerHTML = html;
    },

    async savePromptAndPersona() {
        const sysVal = document.getElementById('system-prompt')?.value || '';
        const charVal = document.getElementById('char-persona')?.value || '';
        
        let report = [];
        if (window.PhoneAPI && window.PhoneAPI.LocalDB) {
            try {
                await window.PhoneAPI.LocalDB.set('direct_sys_text', sysVal);
                await window.PhoneAPI.LocalDB.set('direct_char_text', charVal);
                report.push("大容量数据库: 成功 ✔");
            } catch(e) {
                report.push("大容量数据库: 失败 ✖ (" + e.message + ")");
            }
        }

        try {
            localStorage.setItem('system_prompt', sysVal);
            localStorage.setItem('char_persona', charVal);
            report.push("localStorage: 成功 ✔");
        } catch(e) {
            report.push("localStorage: 配额已满 ⚠ (已由大容量库接管)");
        }

        alert(`【保存状态诊断】\n\n` + report.join('\n') + `\n\n人设总字数: ${charVal.length} 字\n已安全落地！`);

        const btn = document.getElementById('btn-save-prompts');
        if (btn) {
            btn.innerHTML = `<i class="ph-bold ph-check"></i> 保存完毕！`;
            btn.style.background = '#2a9d8f';
            setTimeout(() => {
                btn.innerHTML = `<i class="ph-bold ph-floppy-disk"></i> 💾 保存提示词与角色人设`;
                btn.style.background = 'var(--primary-color)';
            }, 1200);
        }
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

    renderSettings() {
        const contentEl = document.getElementById('app-window-content');
        if (!contentEl) return;
        const today = new Date();
        const defaultDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const currentColor = localStorage.getItem('app_color') || 'blue';

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
                <h3 style="color:var(--primary-color);margin-bottom:15px; font-size: 15px;"><i class="ph-fill ph-user-circle"></i> 基础设定 (名字)</h3>
                <div style="display:flex;gap:10px;">
                    <div style="flex:1;"><label style="font-size:12px;color:var(--text-main); font-weight: bold;">我的名字</label><input type="text" id="my-name" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:10px;border-radius:8px;margin-top:4px; border: 1px solid var(--border-color); background: var(--window-bg); color: var(--text-main);"></div>
                    <div style="flex:1;"><label style="font-size:12px;color:var(--text-main); font-weight: bold;">TA的名字</label><input type="text" id="char-name" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:10px;border-radius:8px;margin-top:4px; border: 1px solid var(--border-color); background: var(--window-bg); color: var(--text-main);"></div>
                </div>
            </div>

            <div class="card" style="padding: 16px;">
                <h3 style="color:var(--primary-color);margin-bottom:10px; font-size: 15px;"><i class="ph-fill ph-palette"></i> UI 主题装修</h3>
                <div class="color-picker-container" style="display: flex; gap: 12px; margin-bottom: 15px;">
                    <div id="color-btn-blue" class="color-circle c-blue ${currentColor === 'blue' ? 'active' : ''}" onclick="window.PhoneUI.changeAppColor('blue')"></div>
                    <div id="color-btn-purple" class="color-circle c-purple ${currentColor === 'purple' ? 'active' : ''}" onclick="window.PhoneUI.changeAppColor('purple')"></div>
                    <div id="color-btn-pink" class="color-circle c-pink ${currentColor === 'pink' ? 'active' : ''}" onclick="window.PhoneUI.changeAppColor('pink')"></div>
                    <div id="color-btn-gold" class="color-circle c-gold ${currentColor === 'gold' ? 'active' : ''}" onclick="window.PhoneUI.changeAppColor('gold')"></div>
                </div>
                <div style="margin-bottom:15px;"><label style="font-size:12px;font-weight:bold;color:var(--text-main);">恋爱纪念日</label><input type="date" id="love-start-date" value="${localStorage.getItem('love_start_date') || defaultDate}" onchange="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:10px;border-radius:8px;border: 1px solid var(--border-color); background: var(--window-bg); color: var(--text-main); margin-top:4px;"></div>
            </div>
        </div>

        <!-- 2. 大模型与记忆设置 -->
        <div id="set-sec-ai" class="set-section" style="flex-direction: column; gap: 18px; padding-bottom: 100px;">
            <div class="card" style="padding: 16px; border: 1px solid var(--border-color);">
                <h3 style="color:var(--primary-color);margin-bottom:12px; font-size: 15px;"><i class="ph-fill ph-scroll"></i> 提示词与人设</h3>
                <div style="margin-bottom:15px;">
                    <label style="font-size:13px;color:var(--text-main);font-weight:bold; display: block; margin-bottom: 6px;">1. 系统核心指令 (规则/防八股)</label>
                    <textarea id="system-prompt" rows="4" style="width:100%;padding:10px;border-radius:10px;resize:vertical;font-size:13px; border: 1px solid var(--border-color); background: var(--window-bg); color: var(--text-main); line-height: 1.5;"></textarea>
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

            <div class="card" style="padding: 16px; border: 1px solid var(--border-color);">
                <h3 style="color:var(--primary-color);margin-bottom:12px; font-size: 15px;"><i class="ph-fill ph-database"></i> 语言引擎预设配置</h3>
                <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 15px;">
                    <select id="preset-delete-select" onchange="window.PhoneUI.fillPresetData()" style="flex: 1; padding: 10px 12px; border-radius: 10px; border: 1.5px solid var(--primary-color); background: var(--icon-bg); color: var(--text-main); font-size: 13px;">
                        <option value="">-- 点击选择预设切换 --</option>
                    </select>
                </div>
                <div style="margin-bottom:10px;"><input type="text" id="preset-name" placeholder="起个名字 (如: Sonnet)" style="width:100%;padding:10px;border-radius:8px; border: 1px solid var(--border-color); background: var(--window-bg); color: var(--text-main);"></div>
                <div style="margin-bottom:10px;"><input type="text" id="preset-url" placeholder="Base URL (如: https://api.xxx.com)" style="width:100%;padding:10px;border-radius:8px; border: 1px solid var(--border-color); background: var(--window-bg); color: var(--text-main);"></div>
                <div style="margin-bottom:10px;"><input type="password" id="preset-key" placeholder="API Key" style="width:100%;padding:10px;border-radius:8px; border: 1px solid var(--border-color); background: var(--window-bg); color: var(--text-main);"></div>
                <div style="margin-bottom:15px;"><input type="text" id="preset-model" placeholder="Model Name" style="width:100%;padding:10px;border-radius:8px; border: 1px solid var(--border-color); background: var(--window-bg); color: var(--text-main);"></div>
                <button type="button" id="btn-direct-save-preset" style="width: 100%; padding: 12px; border-radius: 10px; font-weight: bold; background: var(--primary-color); color: #fff; border: none; cursor: pointer;">保存预设</button>
            </div>
        </div>

        <!-- 3. 绘画引擎 -->
        <div id="set-sec-draw" class="set-section" style="flex-direction: column; gap: 15px; padding-bottom: 100px;">
            <div class="card" style="padding: 16px;">
                <h3 style="color:var(--primary-color);margin-bottom:10px; font-size: 15px;"><i class="ph-fill ph-image"></i> 绘画引擎配置</h3>
                <div style="margin-bottom:10px;"><input type="text" id="img-api-url" placeholder="接口地址" style="width:100%;padding:10px;border-radius:8px; border: 1px solid var(--border-color); background: var(--window-bg); color: var(--text-main);"></div>
                <div style="margin-bottom:10px;"><input type="password" id="img-api-key" placeholder="API Key" style="width:100%;padding:10px;border-radius:8px; border: 1px solid var(--border-color); background: var(--window-bg); color: var(--text-main);"></div>
                <div style="margin-bottom:15px;"><input type="text" id="img-api-model" placeholder="模型名称" style="width:100%;padding:10px;border-radius:8px; border: 1px solid var(--border-color); background: var(--window-bg); color: var(--text-main);"></div>
                <button class="btn-refresh" onclick="window.PhoneUI.saveDrawSettings()" style="width:100%; background:var(--primary-color);"><i class="ph-fill ph-floppy-disk"></i> 保存配置</button>
            </div>
        </div>

        <!-- 4. 系统维护与报错追踪 -->
        <div id="set-sec-sys" class="set-section" style="flex-direction: column; gap: 15px; padding-bottom: 100px;">
            <div class="card" style="padding: 16px; border: 1.5px solid var(--primary-color);">
                <h3 style="color:var(--primary-color);margin-bottom:12px; font-size: 15px;"><i class="ph-fill ph-activity"></i> 运行状态与报错追踪</h3>
                <div id="debug-log-container">
                    <div style="text-align:center; padding:15px; color:var(--text-sub);"><i class="ph ph-spinner spin-anim"></i> 正在读取系统运行状况...</div>
                </div>
            </div>

            <div class="card" style="padding: 16px;">
                <h3 style="color:var(--danger-color);margin-bottom:15px; font-size: 15px;"><i class="ph-fill ph-warning-circle"></i> 系统维护</h3>
                <button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.forceUpdate()" style="background:#f4a261;margin-top:0;margin-bottom:10px;"><i class="ph ph-arrows-clockwise"></i> 强制更新系统并清缓存</button>
                <button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.clearChat()" style="background:var(--danger-color);margin-top:0;"><i class="ph ph-trash"></i> 清空记录 (释放内存)</button>
            </div>
        </div>
        `;

        setTimeout(async () => {
            this.switchSetTab('basic');

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

            if (window.PhoneAPI && window.PhoneAPI.refreshPresetDropdowns) {
                window.PhoneAPI.refreshPresetDropdowns();
            }
        }, 50);
    }
};

if (typeof window !== 'undefined') { window.PhoneUI = PhoneUI; }
