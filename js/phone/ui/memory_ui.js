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

    // 🌟 纯净记忆库界面：只有搜索框和记忆列表
    renderMemoryVault() {
        const container = document.getElementById('vault-content-area');
        if (!container) return;

        if (!document.getElementById('vault-list-container')) {
            container.innerHTML = `
                <div style="display:flex; gap:8px; margin-bottom:10px;">
                    <button type="button" onclick="window.PhoneUI.exportMemoryVault()" style="flex:1; padding:10px 8px; border:1px solid var(--border-color); border-radius:12px; background:var(--icon-bg); color:var(--text-main); font-size:12px;">
                        <i class="ph ph-download-simple"></i> 导出记忆备份
                    </button>
                    <button type="button" onclick="document.getElementById('memory-vault-import-file').click()" style="flex:1; padding:10px 8px; border:1px solid var(--border-color); border-radius:12px; background:var(--icon-bg); color:var(--text-main); font-size:12px;">
                        <i class="ph ph-upload-simple"></i> 导入记忆备份
                    </button>
                    <input type="file" id="memory-vault-import-file" accept=".json,application/json" style="display:none" onchange="window.PhoneUI.importMemoryVault(event)">
                </div>
                <div style="font-size:11px; color:var(--text-sub); margin:0 2px 12px;">仅备份记忆库内容，不包含聊天记录、图片或其他设置。导入采用合并模式，不覆盖已有条目。</div>
                <div style="margin-bottom: 15px;">
                    <input type="text" id="vault-search-input" placeholder="🔍 搜索日期、标签、正文..." style="width: 100%; padding: 10px 15px; border-radius: 20px; border: 1px solid var(--border-color); background: var(--icon-bg); color: var(--text-main); font-size: 13px; outline: none; box-sizing: border-box;">
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

    // Export only EchoVault data; do not touch chat history, settings, or IndexedDB assets.
    openSkyConsole() {
        document.getElementById('sky-console-bg')?.classList.add('show');
        document.getElementById('sky-console-modal')?.classList.add('show');
        this.handleStarSearch('');
    },

    closeSkyConsole() {
        document.getElementById('sky-console-bg')?.classList.remove('show');
        document.getElementById('sky-console-modal')?.classList.remove('show');
    },

    showMemoryStarDetail(node) {
        const title = String(node?.title || '记忆');
        const content = String(node?.content || '暂无内容');
        window.alert(title + '\n' + (node?.date || '') + '\n\n' + content);
    },

    handleStarSearch(query) {
        const box = document.getElementById('sky-search-results');
        if (!box) return;
        const data = window.PhoneAPI?.EchoVault?.getData?.() || {daily:{}, permanent:{}, archive:{}};
        const q = String(query || '').trim().toLowerCase();
        const found = [];
        ['daily', 'permanent', 'archive'].forEach(section => {
            Object.entries(data[section] || {}).forEach(([key, item]) => {
                const text = typeof item === 'string' ? item : String(item?.content || '');
                if (!q || key.toLowerCase().includes(q) || text.toLowerCase().includes(q)) {
                    found.push({section, key, text});
                }
            });
        });
        box.innerHTML = found.slice(0, 25).map(item =>
            '<button class="action-btn" style="text-align:left;white-space:normal" onclick="window.PhoneUI.openApp(\'memory_vault\', \'记忆库列表\');window.PhoneUI.closeSkyConsole();">' +
            this.escapeHtml(item.key) + '<div style="font-size:12px;margin-top:4px">' + this.escapeHtml(item.text.slice(0,100)) + '</div></button>'
        ).join('') || '<div class="ev-empty">没有找到匹配的记忆</div>';
    },

    focusGalaxy(mode) {
        if (mode === 'vault') {
            this.openApp('memory_vault', '记忆库列表');
            this.closeSkyConsole();
            return;
        }
        if (mode === 'fav') {
            window.alert('收藏星系暂未建立独立数据标记。');
        }
    },

    changeSkyShape(shape) {
        if (window.MemoryEngine) window.MemoryEngine.skyShape = shape;
        this.closeSkyConsole();
        this.resetSkyView();
    },

    resetSkyView() {
        if (window.MemoryEngine?.skyInstance) {
            window.MemoryEngine.skyInstance.destroy();
            window.MemoryEngine.skyInstance = null;
        }
        window.MemoryEngine?.initSky?.();
    },

    openMemoryLog() {
        const bg = document.getElementById('memory-log-bg');
        const modal = document.getElementById('memory-log-modal');
        const list = document.getElementById('memory-log-list');
        let logs = [];
        try { logs = JSON.parse(localStorage.getItem('memory_logs') || '[]'); } catch (e) {}
        if (list) list.innerHTML = logs.length ? logs.slice().reverse().map(log =>
            '<div class="ev-card"><div class="ev-card-header"><span>' + this.escapeHtml(log.time || '') +
            '</span><span>' + this.escapeHtml(log.action || '') + '</span></div><div class="ev-body">' +
            this.escapeHtml(log.content || '') + '</div></div>'
        ).join('') : '<div class="ev-empty">暂时没有星海变动日志</div>';
        bg?.classList.add('show');
        modal?.classList.add('show');
    },

    closeMemoryLog() {
        document.getElementById('memory-log-bg')?.classList.remove('show');
        document.getElementById('memory-log-modal')?.classList.remove('show');
    },

    exportMemoryVault() {
        try {
            const data = window.PhoneAPI?.EchoVault?.getData?.();
            if (!data || typeof data !== 'object') throw new Error('当前记忆库不可用');
            const payload = {
                format: 'qianduan-memory-vault',
                version: 1,
                exportedAt: new Date().toISOString(),
                vault: {
                    daily: data.daily || {},
                    permanent: data.permanent || {},
                    archive: data.archive || {}
                }
            };
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const stamp = new Date().toISOString().replace(/[:.]/g, '-');
            a.href = url;
            a.download = `qianduan-memory-backup-${stamp}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            window.PhoneAPI?.showToast?.('记忆库备份已导出');
        } catch (err) {
            alert('导出失败：' + (err?.message || '未知错误'));
        }
    },

    // Validate the backup and merge only non-conflicting keys; existing records are never overwritten.
    async importMemoryVault(event) {
        const input = event?.target;
        const file = input?.files?.[0];
        if (!file) return;
        try {
            if (file.size > 20 * 1024 * 1024) throw new Error('备份文件超过 20MB，已停止导入');
            const text = await file.text();
            const payload = JSON.parse(text);
            const vault = payload?.format === 'qianduan-memory-vault' ? payload.vault : payload;
            if (!vault || typeof vault !== 'object' || Array.isArray(vault)) throw new Error('文件格式不正确');
            for (const key of ['daily', 'permanent', 'archive']) {
                if (vault[key] !== undefined && (!vault[key] || typeof vault[key] !== 'object' || Array.isArray(vault[key]))) {
                    throw new Error('记忆分区格式不正确：' + key);
                }
            }
            if (!['daily', 'permanent', 'archive'].some(key => Object.keys(vault[key] || {}).length > 0)) {
                throw new Error('备份中没有可导入的记忆条目');
            }
            if (!confirm('将备份中的记忆合并到当前记忆库。已有同名条目不会被覆盖，冲突条目会跳过。是否继续？')) return;
            const api = window.PhoneAPI;
            if (!api?.EchoVault?.getData || !api?.EchoVault?.saveData) throw new Error('记忆库接口不可用');
            const current = api.EchoVault.getData();
            const merged = {
                daily: { ...(current.daily || {}) },
                permanent: { ...(current.permanent || {}) },
                archive: { ...(current.archive || {}) }
            };
            let added = 0, skipped = 0;
            for (const section of ['daily', 'permanent', 'archive']) {
                for (const [key, value] of Object.entries(vault[section] || {})) {
                    if (!key || !value || typeof value !== 'object' || Array.isArray(value)) {
                        skipped++;
                        continue;
                    }
                    if (Object.prototype.hasOwnProperty.call(merged[section], key)) {
                        skipped++;
                        continue;
                    }
                    merged[section][key] = value;
                    added++;
                }
            }
            if (added === 0) {
                alert('没有新增记忆。可能是条目都已存在，或备份内容不符合格式。跳过 ' + skipped + ' 条。');
                return;
            }
            const serialized = JSON.stringify(merged);
            // Check browser storage capacity before committing, then verify the saved payload.
            try {
                localStorage.setItem('echovault_data', serialized);
                const check = JSON.parse(localStorage.getItem('echovault_data') || 'null');
                if (!check || !check.daily || !check.permanent || !check.archive) throw new Error('写入后校验失败');
            } catch (writeErr) {
                throw new Error('写入失败，原有记忆未主动清除。请检查浏览器存储空间。' + (writeErr?.message ? ' (' + writeErr.message + ')' : ''));
            }
            window.PhoneAPI?.showToast?.('导入完成：新增 ' + added + ' 条，跳过 ' + skipped + ' 条');
            this.updateVaultList();
        } catch (err) {
            alert('导入失败：' + (err?.message || '请确认选择的是有效的记忆备份 JSON 文件'));
        } finally {
            if (input) input.value = '';
        }
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
