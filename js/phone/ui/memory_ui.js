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

    renderChatCleanupPanel() {
        const roleId = window.Config?.currentContactId;
        const items = window.Config?.phoneData?.[roleId]?.wechat?.items || [];
        const cleanItems = items.filter(i => i && i.sender !== 'typing' && i.content);
        const hiddenOrInvalid = items.filter(i => !i || i.sender === 'typing' || !i.content).length;
        const summaryIndex = Math.max(0, Math.min(parseInt(localStorage.getItem('memory_last_summary_index') || '0', 10), cleanItems.length));
        const keepRecent = Math.min(120, cleanItems.length);
        const deletable = Math.max(0, summaryIndex - Math.min(keepRecent, summaryIndex));

        const first = cleanItems[0] || null;
        const last = cleanItems[cleanItems.length - 1] || null;
        const describeItem = (item) => {
            if (!item) return '无';
            const text = String(item.content || '').replace(/\\s+/g, ' ').trim();
            const stamp = item.time || item.timestamp || item.createdAt || item.date || '';
            return this.escapeHtml((stamp ? '[' + stamp + '] ' : '') + text.slice(0, 120));
        };

        const data = window.PhoneAPI?.EchoVault?.getData?.() || { daily: {}, permanent: {} };
        const dailyCount = Object.keys(data.daily || {}).length;
        const permanentCount = Object.keys(data.permanent || {}).length;

        const el = document.getElementById('chat-cleanup-panel');
        if (!el) return;
        el.innerHTML = `
            <div style="border:1px solid var(--border-color);border-radius:16px;padding:14px;background:var(--icon-bg);margin-bottom:15px;">
                <div style="font-weight:700;color:var(--text-main);">🔎 聊天记录诊断（只读）</div>
                <div style="font-size:12px;color:var(--text-sub);line-height:1.55;margin-top:7px;">
                    这个页面现在只负责“数账”，不会删除或修改任何聊天。
                </div>

                <div style="margin-top:11px;display:grid;grid-template-columns:1fr 1fr;gap:7px;">
                    <div style="padding:9px;border-radius:10px;background:var(--window-bg);">
                        <div style="font-size:11px;color:var(--text-sub);">底层 items 总数</div>
                        <div style="font-size:19px;font-weight:800;color:var(--primary-color);">${items.length}</div>
                    </div>
                    <div style="padding:9px;border-radius:10px;background:var(--window-bg);">
                        <div style="font-size:11px;color:var(--text-sub);">正常聊天条数</div>
                        <div style="font-size:19px;font-weight:800;color:var(--primary-color);">${cleanItems.length}</div>
                    </div>
                    <div style="padding:9px;border-radius:10px;background:var(--window-bg);">
                        <div style="font-size:11px;color:var(--text-sub);">非正常/占位条数</div>
                        <div style="font-size:19px;font-weight:800;color:var(--text-sub);">${hiddenOrInvalid}</div>
                    </div>
                    <div style="padding:9px;border-radius:10px;background:var(--window-bg);">
                        <div style="font-size:11px;color:var(--text-sub);">记忆库条目</div>
                        <div style="font-size:19px;font-weight:800;color:var(--primary-color);">${dailyCount + permanentCount}</div>
                    </div>
                </div>

                <div style="margin-top:10px;padding:10px;border-radius:10px;background:var(--window-bg);font-size:11px;line-height:1.6;color:var(--text-sub);">
                    <div><b style="color:var(--text-main);">记忆总结指针：</b>${summaryIndex}</div>
                    <div><b style="color:var(--text-main);">当前清理算法认为可清理：</b>${deletable}</div>
                    <div><b style="color:var(--text-main);">当前保留区：</b>最近 ${keepRecent} 条</div>
                    <div style="margin-top:5px;"><b style="color:var(--text-main);">最早一条：</b>${describeItem(first)}</div>
                    <div><b style="color:var(--text-main);">最新一条：</b>${describeItem(last)}</div>
                </div>

                <div style="margin-top:10px;font-size:11px;color:var(--text-sub);line-height:1.5;">
                    如果“底层总数”远大于你在聊天页面实际能翻到的数量，就说明统计对象里可能包含聊天界面没有展示的历史/特殊条目。现在先不要删，先用这个数字确认数据结构。
                </div>
                <button class="btn-refresh" onclick="window.PhoneUI.renderChatCleanupPanel()" style="width:100%;margin-top:10px;">
                    🔄 重新统计
                </button>
            </div>`;
    },

    cleanArchivedChats() {
        const roleId = window.Config?.currentContactId;
        const items = window.Config?.phoneData?.[roleId]?.wechat?.items || [];
        const cleanItems = items.filter(i => i && i.sender !== 'typing' && i.content);
        const summaryIndex = Math.max(0, Math.min(parseInt(localStorage.getItem('memory_last_summary_index') || '0', 10), cleanItems.length));
        const keepCount = Math.min(120, cleanItems.length);
        const safeCutoff = Math.max(0, Math.min(summaryIndex, cleanItems.length - keepCount));
        if (safeCutoff <= 0) {
            window.PhoneAPI?.showToast?.('目前没有可以安全清理的旧聊天。');
            return;
        }
        const memories = Object.values(window.PhoneAPI?.EchoVault?.getData?.().daily || {}).length;
        const ok = confirm(`这些较早的聊天已经被记忆整理流程标记为已总结。\\n\\n将删除 ${safeCutoff} 条旧聊天，并保留最近 ${keepCount} 条。\\n记忆库中的 ${memories} 条记忆不会删除。\\n\\n确定继续吗？`);
        if (!ok) return;

        let seen = 0;
        const target = items.filter(i => i && i.sender !== 'typing' && i.content).slice(0, safeCutoff);
        const targetSet = new Set(target);
        window.Config.phoneData[roleId].wechat.items = items.filter(i => !targetSet.has(i));
        window.PhoneEngine?._safeSaveData?.();
        window.PhoneUI.renderAppContent?.('wechat');
        this.renderChatCleanupPanel();
        window.PhoneAPI?.showToast?.(`🧹 已清理 ${safeCutoff} 条旧聊天，记忆库保留不变。`);
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
        this.renderChatCleanupPanel();
    },

    // 🌟 核心修复：绝对可靠的日期降序排序（避免 new Date 解析 NaN 导致最新记忆沉底）
    updateVaultList() {
        const listContainer = document.getElementById('vault-list-container');
        if (!listContainer || !window.PhoneAPI || !window.PhoneAPI.EchoVault) return;

        const data = window.PhoneAPI.EchoVault.getData();
        const tab = window.Config?.memoryVaultTab || 'daily';
        const query = this.vaultSearchQuery || '';
        
        let html = '';
        if (tab === 'daily') {
            // 🌟 修复关键：直接使用 localeCompare 倒序排序时间戳 key，100% 保证最新日期在最顶端
            let dates = Object.keys(data.daily).sort((a, b) => b.localeCompare(a));
            
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
            let keys = Object.keys(data.permanent).sort((a, b) => {
                const timeA = data.permanent[a].created || '';
                const timeB = data.permanent[b].created || '';
                return timeB.localeCompare(timeA);
            });
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
            window.PhoneEngine.sendChatMessage();
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
