export const MemoryUI = {
    switchVaultTab(tabName) {
        if (window.Config) window.Config.memoryVaultTab = tabName;
        document.querySelectorAll('.vault-tab').forEach(el => el.classList.remove('active'));
        const activeTab = document.getElementById('tab-' + tabName);
        if (activeTab) activeTab.classList.add('active');
        this.renderMemoryVault();
    },

    renderMemoryVault() {
        const contentArea = document.getElementById('vault-content-area');
        if (!contentArea || !window.PhoneAPI || !window.PhoneAPI.EchoVault) return;
        const currentTab = window.Config?.memoryVaultTab || 'daily';
        const evData = window.PhoneAPI.EchoVault.getData();

        let html = '';
        if (currentTab === 'daily') {
            const dailyKeys = Object.keys(evData.daily).sort((a, b) => new Date(b) - new Date(a));
            if (dailyKeys.length === 0) html = '<div class="ev-empty">今天还没有故事发生...</div>';
            else {
                dailyKeys.forEach(date => {
                    const item = evData.daily[date];
                    html += `<div class="ev-card"><div class="ev-card-header"><span class="ev-date">📅 ${date}</span><span class="ev-importance">重要度: ${item.importance} | 查阅: ${item.hits}</span></div><div class="ev-body">${this.escapeHtml(item.content)}</div><div class="ev-actions"><i class="ph-fill ph-star" title="设为锚点" onclick="if(window.PhoneAPI) window.PhoneAPI.toggleCoreMemory('${date}')"></i><i class="ph-fill ph-pencil-simple" title="手动编辑/去重" onclick="window.PhoneUI.openEvEdit('${date}', false)"></i><i class="ph-fill ph-trash" title="删除" onclick="if(window.PhoneAPI) window.PhoneAPI.deleteFromMemoryVault('${date}')"></i></div></div>`;
                });
            }
        } else if (currentTab === 'permanent') {
            const permKeys = Object.keys(evData.permanent);
            if (permKeys.length === 0) html = '<div class="ev-empty">还没有钉选的核心记忆...</div>';
            else {
                permKeys.forEach(key => {
                    const item = evData.permanent[key];
                    html += `<div class="ev-card ev-permanent-card"><div class="ev-card-header"><span class="ev-title">📌 ${key}</span><span class="ev-importance">永不衰减</span></div><div class="ev-body">${this.escapeHtml(item.content)}</div><div class="ev-actions"><i class="ph ph-star" title="取消锚点" onclick="if(window.PhoneAPI) window.PhoneAPI.toggleCoreMemory('${key}')"></i><i class="ph-fill ph-pencil-simple" title="手动编辑/去重" onclick="window.PhoneUI.openEvEdit('${key}', true)"></i><i class="ph-fill ph-trash" title="删除" onclick="if(window.PhoneAPI) window.PhoneAPI.deleteFromMemoryVault('${key}')"></i></div></div>`;
                });
            }
        }
        contentArea.innerHTML = html;
    },

    openEvEdit(key, isPermanent) {
        this.currentEvEditKey = key;
        this.currentEvEditIsPerm = isPermanent;
        const evData = window.PhoneAPI.EchoVault.getData();
        const item = isPermanent ? evData.permanent[key] : evData.daily[key];
        if (!item) return;
        
        document.getElementById('ev-edit-date').innerText = isPermanent ? `📌 锚点记忆: ${key}` : `📅 日常记忆: ${key}`;
        document.getElementById('ev-edit-content').value = item.content || '';
        
        document.getElementById('ev-edit-bg').classList.add('show');
        document.getElementById('ev-edit-modal').classList.add('show');
    },

    closeEvEdit() {
        document.getElementById('ev-edit-bg').classList.remove('show');
        document.getElementById('ev-edit-modal').classList.remove('show');
    },

    saveEvEdit() {
        const key = this.currentEvEditKey;
        const isPerm = this.currentEvEditIsPerm;
        const newContent = document.getElementById('ev-edit-content').value.trim();
        
        if(!newContent) {
            if(window.PhoneAPI) window.PhoneAPI.showToast("内容不能为空，若要删除请点击垃圾桶图标");
            return;
        }
        
        if(window.PhoneAPI && window.PhoneAPI.EchoVault) {
            const evData = window.PhoneAPI.EchoVault.getData();
            if(isPerm && evData.permanent[key]) {
                evData.permanent[key].content = newContent;
            } else if(!isPerm && evData.daily[key]) {
                evData.daily[key].content = newContent;
            }
            window.PhoneAPI.EchoVault.saveData(evData);
            if(window.PhoneAPI) window.PhoneAPI.showToast("✅ 记忆已成功修改去重！");
            this.renderMemoryVault();
            this.closeEvEdit();
        }
    },

    remindEchoVault() {
        const memory = window.PhoneAPI && window.PhoneAPI.EchoVault ? window.PhoneAPI.EchoVault.remind() : null;
        if(memory) {
            alert(`🌊 【命运的漂流瓶】\n捞起了一段快被遗忘的旧时光 (${memory.date}):\n\n${memory.meta.content}`);
            this.renderMemoryVault(); 
        } else {
            alert("记忆库空空如也，海面上什么也没有。");
        }
    },

    renderGallery() {
        const contentEl = document.getElementById('app-window-content');
        if (!contentEl) return;
        const roleId = window.Config?.currentContactId;
        const items = window.Config?.phoneData?.[roleId]?.gallery?.items || [];

        let html = `
        <div id="image-viewer" class="image-viewer">
        <div class="viewer-close" onclick="window.PhoneUI.closeImageViewer()"><i class="ph ph-x"></i></div>
        <div class="viewer-download" onclick="window.PhoneUI.downloadCurrentImage()"><i class="ph ph-download-simple"></i> 保存到手机</div>
        <img id="viewer-img" src="">
        </div>
        `;

        if (items.length === 0) {
            html += `<div style="text-align:center;padding:50px 0;color:var(--text-sub);"><i class="ph-fill ph-images" style="font-size:48px;color:var(--border-color);margin-bottom:10px;"></i><br>相册空空如也，快去生成第一张合照吧！</div>`;
        } else {
            html += `<div class="gallery-grid">`;
            [...items].reverse().forEach(img => {
                const safeSrc = this.escapeHtml(img.content || '');
                const safeId = this.escapeHtml(img.id || '');
                html += `<div class="gallery-item" onclick="window.PhoneUI.openImageViewer('${safeSrc}')"><img src="${safeSrc}"><div class="gallery-del-btn" onclick="event.stopPropagation();if(window.PhoneEngine) window.PhoneEngine.deleteGalleryImage('${safeId}')"><i class="ph ph-trash"></i></div></div>`;
            });
            html += '</div>';
        }
        contentEl.innerHTML = html;
    },

    openImageViewer(src) {
        const viewer = document.getElementById('image-viewer');
        const img = document.getElementById('viewer-img');
        if (viewer && img) { img.src = src; viewer.classList.add('show'); }
    },

    closeImageViewer() {
        const viewer = document.getElementById('image-viewer');
        if (viewer) viewer.classList.remove('show');
    },

    downloadCurrentImage() {
        const img = document.getElementById('viewer-img');
        if (!img || !img.src) return;
        const a = document.createElement('a'); a.href = img.src; a.download = 'Photo_' + Date.now() + '.jpg';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        if (window.PhoneAPI) window.PhoneAPI.showToast('✅ 图片已保存到手机！');
    }
};
