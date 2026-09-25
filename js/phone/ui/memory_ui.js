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
                
                // 🌟 修复：点击日志自动关闭弹窗，并调用全局的 MemoryEngine 进行跳转
                return `
                <div class="log-item" onclick="document.getElementById('memory-log-bg').classList.remove('show'); document.getElementById('memory-log-modal').classList.remove('show'); if(window.MemoryEngine && window.MemoryEngine.skyInstance) window.MemoryEngine.skyInstance.focus('${log.id}');">
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
        if (window.MemoryEngine && window.MemoryEngine.skyInstance) window.MemoryEngine.skyInstance.focus(id);
    },

    // ================= 记忆库渲染逻辑 =================
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
                    <input type="text" id="vault-search-input" placeholder="🔍 搜索日期、标签、正
