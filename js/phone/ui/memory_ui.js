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
                
                // 🌟 修复：点击日志调用 focusStar
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
        if (window.MemoryEngine && window.MemoryEngine.skyInstance) window.MemoryEngine.skyInstance.setShape(shape);
        this.closeSkyConsole();
    },
    resetSkyView() {
        if (window.MemoryEngine && window.MemoryEngine.skyInstance) window.MemoryEngine.skyInstance.resetView();
        this.closeSkyConsole();
    },
    focusGalaxy(type) {
        if (window.MemoryEngine && typeof window.MemoryEngine.focusGalaxy === 'function') window.MemoryEngine.focusGalaxy(type);
        this.closeSkyConsole();
    },
    handleStarSearch(query) {
        const resultsBox = document.getElementById('sky-search-results');
        if (!resultsBox) return;
        if (!query.trim()) { resultsBox.innerHTML = ''; return; }
        
        const q = query.toLowerCase();
        const nodes = window.MemoryEngine?.skyConfig?.data?.nodes || [];
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
    
    // 🌟 修复：点击日志或搜索结果，关闭弹窗并跳转
    focusStar(id) {
        this.closeSkyConsole();
        this.closeMemoryLog();
        if (window.MemoryEngine && window.MemoryEngine.skyInstance) {
            window.MemoryEngine.skyInstance.focus(id);
        }
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

    renderMemoryVault() {
        const container = document.getElementById('vault-content-area');
        if (!container) return;

        if (!document.getElementById('vault-list-container')) {
            container.innerHTML = `
                <div style="margin-bottom: 15px;">
                    <input type="text" id="vault-search-input" placeholder="🔍 搜索日期、标签、正文..." style="width: 100%; padding: 10px 15px; border-radius: 20px; border: 1px solid var(--border-color); background: var(--icon-bg); color: var(--text-main); font-size: 13px; outline: none;">
                </div>
                <div id="vault-list-container"></div>
            `;
            
            document.getElementById('vault-search-input').addEventListener('input', (e) => {
                this.vaultSearchQuery = e.target.value.toLowerCase();
                this.updateVaultList(); 
            });
        }
        
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

    // 🌟 修复：一键直接发送精美卡片！
    shareMemoryItem(key, type) {
        if (!window.PhoneAPI || !window.PhoneAPI.EchoVault) return;
        const data = window.PhoneAPI.EchoVault.getData();
        const item = data[type][key];
        if (!item) return;
        
        let content = item.content.replace(/---/g, ' ').trim();
        if (content.length > 40) content = content.substring(0, 40) + '...';

        const text = `> ✨ **记忆回溯**\n> 📅 ${type === 'daily' ? key.split(' ')[0] : '永久锚点'} | 🏷️ ${item.tags || '无'}\n> \n> _"${content}"_`;
        
        const input = document.getElementById('chat-input');
        if(input && window.PhoneEngine && window.PhoneEngine.sendChatMessage) {
            input.value = text;
            window.PhoneEngine.sendChatMessage(); // 直接发出去！
            window.PhoneUI.closeApp();
            if(typeof switchTab === 'function') switchTab(2); 
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
                this.updateVaultList(); 
                if(window.MemoryEngine && window.MemoryEngine.initSky) window.MemoryEngine.initSky();
            }
        }
    },

    deleteMemoryItem(key, type) {
        if (!confirm("确定要删除这条记忆吗？")) return;
        if (window.PhoneAPI && window.PhoneAPI.EchoVault) {
            window.PhoneAPI.EchoVault.deleteItem(type, key);
            window.PhoneAPI.showToast("🗑️ 记忆已删除");
            this.updateVaultList(); 
            if(window.MemoryEngine && window.MemoryEngine.initSky) window.MemoryEngine.initSky();
        }
    },

    escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }
};
