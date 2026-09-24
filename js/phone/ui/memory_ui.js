export const MemoryUI = {
    initStarrySea() {
        const bg = document.getElementById('starry-sea-bg');
        if (!bg) return;
        if (bg.children.length === 0) {
            for (let i = 0; i < 50; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                const size = Math.random() * 3 + 1;
                star.style.width = size + 'px';
                star.style.height = size + 'px';
                star.style.left = Math.random() * 100 + '%';
                star.style.top = Math.random() * 100 + '%';
                star.style.animationDuration = (Math.random() * 3 + 2) + 's';
                star.style.animationDelay = (Math.random() * 2) + 's';
                bg.appendChild(star);
            }
        }
        this.renderMemoryFragments();
    },

    enterStarrySea() {
        const cover = document.getElementById('memory-cover-view');
        const inside = document.getElementById('memory-inside-view');
        const bubbles = document.getElementById('floating-bubbles');
        if (cover && inside && bubbles) {
            cover.classList.add('dive-in');
            inside.classList.add('active');
            setTimeout(() => { bubbles.classList.add('show'); }, 300);
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

    renderMemoryFragments() {
        const container = document.getElementById('memory-fragments-container');
        if (!container || !window.PhoneAPI || !window.PhoneAPI.EchoVault) return;
        container.innerHTML = '';
        const evData = window.PhoneAPI.EchoVault.getData();
        const dates = Object.keys(evData.daily);
        if (dates.length === 0) return;

        const maxFrags = Math.min(dates.length, 15);
        const shuffled = dates.sort(() => 0.5 - Math.random()).slice(0, maxFrags);

        shuffled.forEach(date => {
            const frag = document.createElement('div');
            frag.className = 'memory-fragment';
            frag.style.left = (Math.random() * 80 + 10) + '%';
            frag.style.top = (Math.random() * 80 + 10) + '%';
            frag.style.animationDelay = (Math.random() * 2) + 's';
            
            frag.onclick = () => {
                const item = evData.daily[date];
                const textEl = document.getElementById('blindbox-text');
                const metaEl = document.getElementById('blindbox-meta');
                if (textEl && metaEl) {
                    let content = item.content.replace(/---/g, '').trim();
                    if (content.length > 100) content = content.substring(0, 100) + '...';
                    textEl.innerText = `“${content}”`;
                    metaEl.innerText = `${date} · ${item.tags || '日常'}`;
                }
                const bg = document.getElementById('blindbox-bg');
                const modal = document.getElementById('blindbox-modal');
                if (bg) bg.classList.add('show');
                if (modal) modal.classList.add('show');
                window.PhoneAPI.EchoVault.incrementHits('daily', date);
            };
            container.appendChild(frag);
        });
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
            let content = item.meta.content.replace(/---/g, '').trim();
            if (content.length > 150) content = content.substring(0, 150) + '...';
            textEl.innerText = `“${content}”`;
            metaEl.innerText = `${item.date} · ${item.meta.tags || '日常'} (回忆度: ${item.score})`;
        }
        const bg = document.getElementById('blindbox-bg');
        const modal = document.getElementById('blindbox-modal');
        if (bg) bg.classList.add('show');
        if (modal) modal.classList.add('show');
    },

    // ================= 找回丢失的记忆库渲染逻辑 =================
    switchVaultTab(tab) {
        if (window.Config) window.Config.memoryVaultTab = tab;
        document.getElementById('tab-daily').classList.remove('active');
        document.getElementById('tab-permanent').classList.remove('active');
        document.getElementById('tab-' + tab).classList.add('active');
        this.renderMemoryVault();
    },

    renderMemoryVault() {
        const container = document.getElementById('vault-content-area');
        if (!container || !window.PhoneAPI || !window.PhoneAPI.EchoVault) return;
        const data = window.PhoneAPI.EchoVault.getData();
        const tab = window.Config?.memoryVaultTab || 'daily';
        
        let html = '';
        if (tab === 'daily') {
            const dates = Object.keys(data.daily).sort((a, b) => new Date(b) - new Date(a));
            if (dates.length === 0) {
                html = '<div class="ev-empty"><i class="ph-fill ph-empty" style="font-size:48px;color:var(--border-color);"></i><br>暂无日常记忆</div>';
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
                        <div class="ev-actions">
                            <i class="ph-fill ph-pencil-simple" onclick="window.PhoneUI.openEvEdit('${date}', 'daily')"></i>
                            <i class="ph-fill ph-trash" onclick="window.PhoneUI.deleteMemoryItem('${date}', 'daily')"></i>
                        </div>
                    </div>`;
                });
            }
        } else {
            const keys = Object.keys(data.permanent).sort((a, b) => new Date(data.permanent[b].created) - new Date(data.permanent[a].created));
            if (keys.length === 0) {
                html = '<div class="ev-empty"><i class="ph-fill ph-empty" style="font-size:48px;color:var(--border-color);"></i><br>暂无锚点记忆</div>';
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
                        <div class="ev-actions">
                            <i class="ph-fill ph-pencil-simple" onclick="window.PhoneUI.openEvEdit('${key}', 'permanent')"></i>
                            <i class="ph-fill ph-trash" onclick="window.PhoneUI.deleteMemoryItem('${key}', 'permanent')"></i>
                        </div>
                    </div>`;
                });
            }
        }
        container.innerHTML = html;
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
                this.renderMemoryVault();
            }
        }
    },

    deleteMemoryItem(key, type) {
        if (!confirm("确定要删除这条记忆吗？")) return;
        if (window.PhoneAPI && window.PhoneAPI.EchoVault) {
            window.PhoneAPI.EchoVault.deleteItem(type, key);
            window.PhoneAPI.showToast("🗑️ 记忆已删除");
            this.renderMemoryVault();
        }
    }
};
