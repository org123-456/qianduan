export const MemoryUI = {
    vaultSearchQuery: '',

    enterStarrySea() {
        const cover = document.getElementById('memory-cover-view');
        const inside = document.getElementById('memory-inside-view');
        const bubbles = document.getElementById('floating-bubbles');
        if (cover && inside && bubbles) {
            cover.classList.add('dive-in');
            inside.classList.add('active');
            setTimeout(() => { bubbles.classList.add('show'); }, 300);
        }
        if (window.MemoryEngine && typeof window.MemoryEngine.initSky === 'function') {
            window.MemoryEngine.initSky();
        }
    },

    exitStarrySea() {
        const cover = document.getElementById('memory-cover-view');
        const inside = document.getElementById('memory-inside-view');
        const bubbles = document.getElementById('floating-bubbles');
        if (cover && inside && bubbles) {
            bubbles.classList.remove('show');
            inside.classList.remove('active');
            cover.classList.remove('dive-in');
        }
    },

    closeBlindBox() {
        const bg = document.getElementById('blindbox-bg');
        const modal = document.getElementById('blindbox-modal');
        if (bg) bg.classList.remove('show');
        if (modal) modal.classList.remove('show');
    },

    switchVaultTab(tab) {
        if (window.Config) window.Config.memoryVaultTab = tab;
        document.getElementById('tab-daily').classList.remove('active');
        document.getElementById('tab-permanent').classList.remove('active');
        document.getElementById('tab-' + tab).classList.add('active');
        this.updateVaultList(); 
    },

    handleVaultSearch(query) {
        this.vaultSearchQuery = query.toLowerCase();
        this.updateVaultList();
    },

    // 🌟 在记忆库列表顶部直接集成：上下文条数 + 自动总结阈值滑块
    renderMemoryVault() {
        const container = document.getElementById('vault-content-area');
        if (!container) return;

        const roleId = window.Config?.currentContactId || 'role_001';
        const allItems = window.Config?.phoneData?.[roleId]?.wechat?.items || [];
        const cleanItems = allItems.filter(i => i.sender !== 'typing' && i.content);
        const lastIdx = parseInt(localStorage.getItem('memory_last_summary_index') || '0', 10);
        const unsummarizedCount = Math.max(0, cleanItems.length - lastIdx);

        const curChatLimit = localStorage.getItem('context_chat_limit') || '200';
        const curAutoThreshold = localStorage.getItem('memory_auto_threshold') || '15';
        const isAuto = localStorage.getItem('memory_auto_mode') !== 'false';

        container.innerHTML = `
            <!-- 🌟 顶层调控板：上下文与自动总结直接在此调节 -->
            <div style="background: var(--icon-bg); border: 1px solid var(--border-color); border-radius: 16px; padding: 14px; margin-bottom: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <div>
                        <div style="font-size: 13px; font-weight: bold; color: var(--text-main);">未归档新对话：<b style="color: var(--primary-color); font-size: 16px;">${unsummarizedCount}</b> 条</div>
                    </div>
                    <button onclick="if(window.MemoryEngine){window.MemoryEngine.manualManageMemory(); setTimeout(()=>window.PhoneUI.renderMemoryVault(), 1500);}" style="padding: 6px 14px; border-radius: 12px; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color, #70a1ff)); color: white; border: none; font-size: 11px; font-weight: bold; cursor: pointer;">
                        ✨ 立即总结
                    </button>
                </div>

                <div style="display: flex; flex-direction: column; gap: 10px; font-size: 12px;">
                    <!-- 1. 聊天上下文携带 -->
                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                            <span style="color: var(--text-sub);">聊天携带上下文：</span>
                            <b id="val-chat-limit" style="color: var(--primary-color);">${curChatLimit === '0' ? '全量（无限记忆）' : curChatLimit + ' 条'}</b>
                        </div>
                        <input type="range" min="20" max="500" step="10" value="${curChatLimit === '0' ? 500 : curChatLimit}" oninput="const v = this.value >= 500 ? '0' : this.value; document.getElementById('val-chat-limit').innerText = v === '0' ? '全量（无限记忆）' : v + ' 条'; localStorage.setItem('context_chat_limit', v);" style="width: 100%; accent-color: var(--primary-color);">
                    </div>

                    <!-- 2. 自动总结阈值 -->
                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                            <span style="color: var(--text-sub);">聊满多少条自动总结：</span>
                            <b id="val-auto-thresh" style="color: var(--primary-color);">${curAutoThreshold} 条</b>
                        </div>
                        <input type="range" min="6" max="50" step="2" value="${curAutoThreshold}" oninput="document.getElementById('val-auto-thresh').innerText = this.value + ' 条'; localStorage.setItem('memory_auto_threshold', this.value);" style="width: 100%; accent-color: var(--primary-color);">
                    </div>
                </div>
            </div>

            <div style="margin-bottom: 15px;">
                <input type="text" id="vault-search-input" placeholder="🔍 搜索日期、标签、正文..." style="width: 100%; padding: 10px 15px; border-radius: 20px; border: 1px solid var(--border-color); background: var(--icon-bg); color: var(--text-main); font-size: 13px; outline: none; box-sizing: border-box;">
            </div>
            
            <div id="vault-list-container"></div>
        `;

        document.getElementById('vault-search-input').addEventListener('input', (e) => {
            this.vaultSearchQuery = e.target.value.toLowerCase();
            this.updateVaultList(); 
        });

        this.updateVaultList();
    },

    updateVaultList() {
        const listContainer = document.getElementById('vault-list-container');
        if (!listContainer || !window.PhoneAPI || !window.PhoneAPI.EchoVault) return;

        const data = window.PhoneAPI.EchoVault.getData();
        const tab = window.Config?.memoryVaultTab || 'daily';
        const query = this.vaultSearchQuery || '';
        
        let html = '';
        if (tab === 'daily') {
            let dates = Object.keys(data.daily).sort((a, b) => b.localeCompare(a));
            if (query) dates = dates.filter(d => d.includes(query) || (data.daily[d].tags||'').toLowerCase().includes(query) || data.daily[d].content.toLowerCase().includes(query));
            if (dates.length === 0) {
                html = '<div style="text-align:center; padding: 40px 0; color:var(--text-sub); font-size:13px;">暂无生活记忆碎片</div>';
            } else {
                dates.forEach(date => {
                    const item = data.daily[date];
                    let content = item.content.replace(/---/g, '\n').trim();
                    html += `
                    <div class="ev-card" style="background: var(--window-bg, #fff); border: 1px solid var(--border-color); border-radius: 14px; padding: 14px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
                        <div class="ev-card-header" style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-sub); margin-bottom:8px;">
                            <span>📅 ${date}</span>
                            <span style="color:var(--primary-color);">🏷️ ${this.escapeHtml(item.tags || '记忆')}</span>
                        </div>
                        <div class="ev-body" style="font-size:13px; line-height:1.65; color:var(--text-main); white-space: pre-wrap;">${this.escapeHtml(content)}</div>
                        <div class="ev-card-footer" style="display:flex; justify-content:flex-end; gap:14px; margin-top:10px; color:var(--text-sub); font-size:15px; cursor:pointer;">
                            <i class="ph-fill ph-share-network" onclick="window.PhoneUI.shareMemoryItem('${date}', 'daily')" title="发送到微信"></i>
                            <i class="ph-fill ph-trash" onclick="window.PhoneUI.deleteMemoryItem('${date}', 'daily')"></i>
                        </div>
                    </div>`;
                });
            }
        } else {
            let keys = Object.keys(data.permanent).sort((a, b) => (data.permanent[b].created || '').localeCompare(data.permanent[a].created || ''));
            if (query) keys = keys.filter(k => k.toLowerCase().includes(query) || (data.permanent[k].tags||'').toLowerCase().includes(query) || data.permanent[k].content.toLowerCase().includes(query));
            if (keys.length === 0) {
                html = '<div style="text-align:center; padding: 40px 0; color:var(--text-sub); font-size:13px;">暂无永久锚点</div>';
            } else {
                keys.forEach(key => {
                    const item = data.permanent[key];
                    html += `
                    <div class="ev-card ev-permanent-card" style="background: var(--window-bg, #fff); border: 1.5px solid var(--primary-color); border-radius: 14px; padding: 14px; margin-bottom: 12px;">
                        <div class="ev-card-header" style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-sub); margin-bottom:8px;">
                            <span style="font-weight:bold; color:var(--primary-color);">⚓ ${this.escapeHtml(key)}</span>
                            <span>🏷️ ${this.escapeHtml(item.tags || '锚点')}</span>
                        </div>
                        <div class="ev-body" style="font-size:13px; line-height:1.65; color:var(--text-main); white-space: pre-wrap;">${this.escapeHtml(item.content)}</div>
                        <div class="ev-card-footer" style="display:flex; justify-content:flex-end; gap:14px; margin-top:10px; color:var(--text-sub); font-size:15px; cursor:pointer;">
                            <i class="ph-fill ph-share-network" onclick="window.PhoneUI.shareMemoryItem('${key}', 'permanent')" title="发送到微信"></i>
                            <i class="ph-fill ph-trash" onclick="window.PhoneUI.deleteMemoryItem('${key}', 'permanent')"></i>
                        </div>
                    </div>`;
                });
            }
        }
        listContainer.innerHTML = html;
    },

    shareMemoryItem(key, type) {
        const data = window.PhoneAPI?.EchoVault?.getData?.();
        const item = data?.[type]?.[key];
        if (!item) return;
        const text = `> ✨ **记忆回溯**\n> 📅 ${key} | 🏷️ ${item.tags || '无'}\n> \n> _"${item.content.substring(0, 50)}..."_`;
        const input = document.getElementById('chat-input');
        if (input && window.PhoneEngine?.sendChatMessage) {
            input.value = text;
            window.PhoneEngine.sendChatMessage();
            window.PhoneUI.closeApp();
            if (typeof switchTab === 'function') switchTab(2);
        }
    },

    deleteMemoryItem(key, type) {
        if (!confirm("确定要删除这条记忆吗？")) return;
        if (window.PhoneAPI?.EchoVault) {
            window.PhoneAPI.EchoVault.deleteItem(type, key);
            window.PhoneAPI.showToast("🗑️ 记忆已删除");
            this.updateVaultList();
            if (window.MemoryEngine?.initSky) window.MemoryEngine.initSky();
        }
    },

    escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }
};
