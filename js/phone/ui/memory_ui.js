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
        if (window.PhoneEngine && typeof window.PhoneEngine.initSky === 'function') {
            window.PhoneEngine.initSky();
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

    remindEchoVault() {
        if (!window.PhoneAPI || !window.PhoneAPI.EchoVault) return;
        const item = window.PhoneAPI.EchoVault.remind();
        if (!item) { window.PhoneAPI.showToast("记忆库还是空的，快去创造回忆吧！"); return; }
        
        const textEl = document.getElementById('blindbox-text');
        const metaEl = document.getElementById('blindbox-meta');
        if (textEl && metaEl) {
            let content = item.meta.content.replace(/---/g, '\n').trim();
            textEl.innerText = `“${content}”`;
            metaEl.innerText = `${item.date} · ${item.meta.tags || '日常'} (回忆度: ${item.score})`;
        }
        const bg = document.getElementById('blindbox-bg');
        const modal = document.getElementById('blindbox-modal');
        if (bg) bg.classList.add('show');
        if (modal) modal.classList.add('show');
    },

    // ================= 🌟 星海变动日志 =================
    openMemoryLog() {
        const bg = document.getElementById('memory-log-bg');
        const modal = document.getElementById('memory-log-modal');
        const listEl = document.getElementById('memory-log-list');
        
        if (!bg || !modal || !listEl) return;
        
        let logs = [];
        try { logs = JSON.parse(localStorage.getItem('memory_logs') || '[]'); } catch(e) {}

        if (logs.length === 0) {
            listEl.innerHTML = '<div style="text-align:center; color:var(--text-sub); margin-top:50px; font-size:13px;">暂无星海变动记录...</div>';
        } else {
            listEl.innerHTML = logs.reverse().map(log => {
                let tagClass = 'add'; let tagText = '新增';
                if (log.action === 'UPDATE') { tagClass = 'update'; tagText = '修改'; }
                if (log.action === 'DEL') { tagClass = 'del'; tagText = '删除'; }
                return `
                <div class="log-item" onclick="window.PhoneUI.focusStar('${log.id}')">
                    <div class="log-time">[${log.time}]</div>
                    <div class="log-content"><span class="log-tag ${tagClass}">${tagText}</span>${this.escapeHtml(log.content)}</div>
                </div>`;
            }).join('');
        }
        bg.classList.add('show');
        modal.classList.add('show');
    },

    closeMemoryLog() {
        const bg = document.getElementById('memory-log-bg');
        const modal = document.getElementById('memory-log-modal');
        if (bg) bg.classList.remove('show');
        if (modal) modal.classList.remove('show');
    },

    // ================= 🌟 星穹控制台逻辑 =================
    openSkyConsole() {
        document.getElementById('sky-console-bg').classList.add('show');
        document.getElementById('sky-console-modal').classList.add('show');
        this.handleStarSearch('');
    },
    closeSkyConsole() {
        document.getElementById('sky-console-bg').classList.remove('show');
        document.getElementById('sky-console-modal').classList.remove('show');
    },
    changeSkyShape(shape) {
        if (window.PhoneEngine && window.PhoneEngine.skyInstance) window.PhoneEngine.skyInstance.setShape(shape);
        this.closeSkyConsole();
    },
    resetSkyView() {
        if (window.PhoneEngine && window.PhoneEngine.skyInstance) window.PhoneEngine.skyInstance.resetView();
        this.closeSkyConsole();
    },
    focusGalaxy(type) {
        if (window.PhoneEngine && typeof window.PhoneEngine.focusGalaxy === 'function') window.PhoneEngine.focusGalaxy(type);
        this.closeSkyConsole();
    },
    handleStarSearch(query) {
        const resultsBox = document.getElementById('sky-search-results');
        if (!resultsBox) return;
        if (!query.trim()) { resultsBox.innerHTML = ''; return; }
        
        const q = query.toLowerCase();
        const nodes = window.PhoneEngine?.skyConfig?.data?.nodes || [];
        const matches = nodes.filter(n => (n.title||'').toLowerCase().includes(q) || (n.content||'').toLowerCase().includes(q) || (n.date||'').toLowerCase().includes(q)).slice(0, 5); 
        
        if (matches.length === 0) {
            resultsBox.innerHTML = '<div style="font-size:12px; color:var(--text-sub);">没有找到相关记忆...</div>';
            return;
        }
        
        resultsBox.innerHTML = matches.map(n => `
            <div onclick="window.PhoneUI.focusStar('${n.id}')" style="background: var(--icon-bg); padding: 10px; border-radius: 8px; cursor: pointer; text-align: left; font-size: 12px; color: var(--text-main); margin-bottom: 4px; border: 1px solid var(--border-color);">
                <div style="font-weight: bold; color: var(--primary-color); margin-bottom: 4px;">${n.date} · ${n.title}</div>
                <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: 0.8;">${n.content}</div>
            </div>
        `).join('');
    },
    focusStar(id) {
        this.closeSkyConsole();
        this.closeMemoryLog();
        if (window.PhoneEngine && window.PhoneEngine.skyInstance) window.PhoneEngine.skyInstance.focus(id);
    },

    // ================= 记忆库渲染逻辑 =================
    switchVaultTab(tab) {
        if (window.Config) window.Config.memoryVaultTab = tab;
        document.getElementById('tab-daily').classList.remove('active');
        document.getElementById('tab-permanent').classList.remove('active');
        document.getElementById('tab-' + tab).classList.add('active');
        this.updateVaultList(); // 切换Tab时只刷新列表
    },

    renderMemoryVault() {
        const container = document.getElementById('vault-content-area');
        if (!container) return;

        // 🌟 核心修复：只在第一次渲染时生成搜索框，防止打字时被覆盖导致掉键盘！
        if (!document.getElementById('vault-list-container')) {
            container.innerHTML = `
                <div style="margin-bottom: 15px;">
                    <input type="text" id="vault-search-input" placeholder="🔍 搜索日期、标签、正文..." style="width: 100%; padding: 10px 15px; border-radius: 20px; border: 1px solid var(--border-color); background: var(--icon-bg); color: var(--text-main); font-size: 13px; outline: none;">
                </div>
                <div id="vault-list-container"></div>
            `;
            
            // 绑定输入事件
            document.getElementById('vault-search-input').addEventListener('input', (e) => {
                this.vaultSearchQuery = e.target.value.toLowerCase();
                this.updateVaultList(); // 打字时只更新下面的列表
            });
        }
        
        this.updateVaultList();
    },

    // 🌟 抽离出来的列表渲染函数
    updateVaultList() {
        const listContainer = document.getElementById('vault-list-container');
        if (!listContainer || !window.PhoneAPI || !window.PhoneAPI.EchoVault) return;

        const data = window.PhoneAPI.EchoVault.getData();
        const tab = window.Config?.memoryVaultTab || 'daily';
        const query = this.vaultSearchQuery || '';
        
        let html = '';
        if (tab === 'daily') {
            let dates = Object.keys(data.daily).sort((a, b) => new Date(b) - new Date(a));
            if (query) dates = dates.filter(d => d.includes(query) || (data.daily[d].tags||'').toLowerCase().includes(query) || data.daily[d].content.toLowerCase().includes(query));
            if (dates.length === 0) {
                html = '<div class="ev-empty"><i class="ph-fill ph-empty" style="font-size:48px;color:var(--border-color);"></i><br>暂无记忆</div>';
            } else {
                dates.forEach(date => {
                    const item = data.daily[date];
                    let content = item.content.replace(/---/g, '\n').trim();
                    html += `
                    <div class="ev-card">
                        <div class="ev-card-header">
                            <span><i class="ph-fill ph-calendar-blank"></i> ${date}</span>
                            <span><i class="ph-fill ph-tag"></i> ${this.escapeHtml(item.tags)}</span>
                        </div>
                        <div class="ev-body">${this.escapeHtml(content)}</div>
                        <div class="ev-card-footer">
                            <i class="ph-fill ph-share-network" onclick="window.PhoneUI.shareMemoryItem('${date}', 'daily')" title="发送到聊天"></i>
                            <i class="ph-fill ph-pencil-simple" onclick="window.PhoneUI.openEvEdit('${date}', 'daily')"></i>
                            <i class="ph-fill ph-trash" onclick="window.PhoneUI.deleteMemoryItem('${date}', 'daily')"></i>
                        </div>
                    </div>`;
                });
            }
        } else {
            let keys = Object.keys(data.permanent).sort((a, b) => new Date(data.permanent[b].created) - new Date(data.permanent[a].created));
            if (query) keys = keys.filter(k => k.toLowerCase().includes(query) || (data.permanent[k].tags||'').toLowerCase().includes(query) || data.permanent[k].content.toLowerCase().includes(query));
            if (keys.length === 0) {
                html = '<div class="ev-empty"><i class="ph-fill ph-empty" style="font-size:48px;color:var(--border-color);"></i><br>暂无记忆</div>';
            } else {
                keys.forEach(key => {
                    const item = data.permanent[key];
                    html += `
                    <div class="ev-card ev-permanent-card">
                        <div class="ev-card-header">
                            <span><i class="ph-fill ph-anchor"></i> ${this.escapeHtml(key)}</span>
                            <span><i class="ph-fill ph-tag"></i> ${this.escapeHtml(item.tags)}</span>
                        </div>
                        <div class="ev-body">${this.escapeHtml(item.content)}</div>
                        <div class="ev-card-footer">
                            <i class="ph-fill ph-share-network" onclick="window.PhoneUI.shareMemoryItem('${key}', 'permanent')" title="发送到聊天"></i>
                            <i class="ph-fill ph-pencil-simple" onclick="window.PhoneUI.openEvEdit('${key}', 'permanent')"></i>
                            <i class="ph-fill ph-trash" onclick="window.PhoneUI.deleteMemoryItem('${key}', 'permanent')"></i>
                        </div>
                    </div>`;
                });
            }
        }
        listContainer.innerHTML = html;
    },

    // 🌟 分享变成精美的 Markdown 引用卡片
    shareMemoryItem(key, type) {
        if (!window.PhoneAPI || !window.PhoneAPI.EchoVault) return;
        const data = window.PhoneAPI.EchoVault.getData();
        const item = data[type][key];
        if (!item) return;
        
        const content = item.content.replace(/---/g, '\n').trim();
        // 使用 Markdown 引用格式，配合 CSS 变成精美卡片
        const text = `> **【记忆回溯】**\n> 时间：${type === 'daily' ? key : '永久锚点'}\n> 标签：${item.tags || '无'}\n> \n> *${content}*`;
        
        const input = document.getElementById('chat-input');
        if(input) {
            input.value = text;
            window.PhoneUI.closeApp();
            if(typeof switchTab === 'function') switchTab(2);
            window.PhoneAPI.showToast('已生成回溯卡片，发送给TA吧！');
        }
    },

    openEvEdit(key, type) {
        if (!window.PhoneAPI || !window.PhoneAPI.EchoVault) return;
        const data = window.PhoneAPI.EchoVault.getData();
        const item = data[type][key];
        if (!item) return;
        
        document.getElementById('ev-edit-date').innerText = key;
        document.getElementById('ev-edit-date').dataset.key = key;
        document.getElementById('ev-edit-date').dataset.type = type;
        document.getElementById('ev-edit-content').value = item.content;
        
        document.getElementById('ev-edit-bg').classList.add('show');
        document.getElementById('ev-edit-modal').classList.add('show');
    },

    closeEvEdit() {
        document.getElementById('ev-edit-bg').classList.remove('show');
        document.getElementById('ev-edit-modal').classList.remove('show');
    },

    saveEvEdit() {
        const key = document.getElementById('ev-edit-date').dataset.key;
        const type = document.getElementById('ev-edit-date').dataset.type;
        const content = document.getElementById('ev-edit-content').value.trim();
        if (!content) { window.PhoneAPI.showToast("内容不能为空哦"); return; }
        
        if (window.PhoneAPI && window.PhoneAPI.EchoVault) {
            const data = window.PhoneAPI.EchoVault.getData();
            if (data[type] && data[type][key]) {
                data[type][key].content = content;
                window.PhoneAPI.EchoVault.saveData(data);
                window.PhoneAPI.showToast("✅ 修改已保存");
                this.closeEvEdit();
                this.updateVaultList(); // 🌟 保存后只刷新列表
            }
        }
    },

    deleteMemoryItem(key, type) {
        if (!confirm("确定要删除这条记忆吗？")) return;
        if (window.PhoneAPI && window.PhoneAPI.EchoVault) {
            window.PhoneAPI.EchoVault.deleteItem(type, key);
            window.PhoneAPI.showToast("🗑️ 记忆已删除");
            this.updateVaultList(); // 🌟 删除后只刷新列表
        }
    },

    escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }
};
