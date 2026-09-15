export const PhoneUI = {
    renderAppContent(appId) {
        const roleId = window.Config?.currentContactId;
        if(!roleId) return;
        
        let data = window.Config.phoneData[roleId]?.[appId];
        
        if (appId !== 'gallery' && data && data.items && data.items.length > 50) {
            data = { ...data, items: data.items.slice(-50) };
        }

        const listEl = document.getElementById('app-content-list');
        if (listEl && window.Apps && window.Apps[appId]) {
            listEl.innerHTML = window.Apps[appId].renderList(data);
            setTimeout(() => { listEl.scrollTop = listEl.scrollHeight; }, 100);
        } else if (appId === 'gallery') {
            this.renderGallery();
        } else if (appId === 'shop') {
            this.renderShop();
        } else if (appId === 'task') {
            this.renderTask();
        } else if (appId === 'settings') {
            this.renderSettings();
        } else if (appId === 'worldbook') {
            this.renderWorldbook();
        }
    },

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        const icon = document.getElementById('theme-icon');
        if (icon) {
            if (newTheme === 'dark') { icon.classList.remove('ph-moon'); icon.classList.add('ph-sun'); } 
            else { icon.classList.remove('ph-sun'); icon.classList.add('ph-moon'); }
        }
    },

    toggleChatMenu() {
        const menu = document.getElementById('chat-plus-menu'); const btn = document.getElementById('btn-plus');
        if (!menu || !btn) return; 
        if (menu.classList.contains('show')) { this.closeChatMenu(); } else { menu.classList.add('show'); btn.style.transform = 'rotate(45deg)'; }
    },
    closeChatMenu() {
        const menu = document.getElementById('chat-plus-menu'); const btn = document.getElementById('btn-plus');
        if (menu) menu.classList.remove('show'); if (btn) btn.style.transform = 'rotate(0deg)';
    },

    // 🌟 新增：表情包面板控制
    toggleStickerPanel() {
        const panel = document.getElementById('sticker-panel');
        if (!panel) return;
        if (panel.classList.contains('show')) {
            this.closeStickerPanel();
        } else {
            this.closeChatMenu(); 
            this.renderStickers();
            panel.classList.add('show');
        }
    },
    closeStickerPanel() {
        const panel = document.getElementById('sticker-panel');
        if (panel) panel.classList.remove('show');
    },

    // 🌟 新增：批量导入表情包逻辑
    async importStickers() {
        const text = await this.showCustomPrompt("📦 批量导入表情包", "请直接粘贴你的文档内容，格式如：\n让我摸摸:\nhttps://...gif\n害羞了:\nhttps://...gif\n（清空所有表情包请输入：CLEAR）");
        if (!text) return;

        if (text.trim() === 'CLEAR') {
            if (confirm("确定要清空所有表情包吗？")) {
                localStorage.removeItem('custom_stickers');
                this.renderStickers();
                window.PhoneAPI.showToast("🗑️ 表情包已清空");
            }
            return;
        }
        
        const lines = text.split('\n');
        let newStickers = [];
        let currentName = "未命名表情";
        const urlRegex = /(https?:\/\/[^\s]+)/;
        
        lines.forEach(line => {
            const str = line.trim();
            if (!str) return;
            const urlMatch = str.match(urlRegex);
            if (urlMatch) {
                const url = urlMatch[1];
                let name = str.replace(url, '').replace(/[:：]/g, '').trim();
                if (!name && currentName !== "未命名表情") {
                    name = currentName;
                    currentName = "未命名表情";
                } else if (!name) {
                    name = "表情" + Math.floor(Math.random()*1000);
                }
                newStickers.push({ name, url });
            } else {
                currentName = str.replace(/[:：]/g, '').trim();
            }
        });

        if (newStickers.length > 0) {
            let existing = JSON.parse(localStorage.getItem('custom_stickers') || '[]');
            existing = [...existing, ...newStickers];
            localStorage.setItem('custom_stickers', JSON.stringify(existing));
            this.renderStickers();
            window.PhoneAPI.showToast(`✅ 成功解析并导入 ${newStickers.length} 个表情包！`);
        } else {
            window.PhoneAPI.showToast(`❌ 未识别到任何有效链接`);
        }
    },

    // 🌟 新增：渲染表情包面板
    renderStickers() {
        const panel = document.getElementById('sticker-panel');
        if (!panel) return;
        const stickers = JSON.parse(localStorage.getItem('custom_stickers') || '[]');
        let html = `<div class="sticker-add-btn" onclick="window.PhoneUI.importStickers()"><i class="ph ph-plus" style="font-size: 24px;"></i><span style="font-size:10px; margin-top:4px;">导入</span></div>`;
        
        stickers.forEach((st) => {
            html += `<div class="sticker-item" onclick="window.PhoneEngine.sendSticker('${st.name}', '${st.url}')" title="${st.name}">
                        <img src="${st.url}" alt="${st.name}">
                     </div>`;
        });
        panel.innerHTML = html;
    },

    toggleStoryMenu() {
        const menu = document.getElementById('story-plus-menu'); const btn = document.getElementById('btn-story-plus');
        if (!menu || !btn) return; 
        if (menu.classList.contains('show')) { this.closeStoryMenu(); } else { menu.classList.add('show'); btn.style.transform = 'rotate(45deg)'; }
    },
    closeStoryMenu() {
        const menu = document.getElementById('story-plus-menu'); const btn = document.getElementById('btn-story-plus');
        if (menu) menu.classList.remove('show'); if (btn) btn.style.transform = 'rotate(0deg)';
    },

    showCustomPrompt(title, defaultValue = '') {
        return new Promise((resolve) => {
            const bg = document.getElementById('custom-prompt-bg');
            const modal = document.getElementById('custom-prompt-modal');
            const titleEl = document.getElementById('custom-prompt-title');
            const inputEl = document.getElementById('custom-prompt-input');
            const btnConfirm = document.getElementById('custom-prompt-confirm');
            const btnCancel = document.getElementById('custom-prompt-cancel');

            titleEl.innerText = title;
            inputEl.value = defaultValue;

            bg.classList.add('show');
            modal.classList.add('show');

            const cleanup = () => {
                bg.classList.remove('show');
                modal.classList.remove('show');
                btnConfirm.onclick = null;
                btnCancel.onclick = null;
            };

            btnConfirm.onclick = () => {
                cleanup();
                resolve(inputEl.value);
            };

            btnCancel.onclick = () => {
                cleanup();
                resolve(null);
            };
        });
    },

    openApiModal() {
        document.getElementById('api-modal-bg').classList.add('show');
        document.getElementById('api-modal').classList.add('show');
    },
    closeApiModal() {
        document.getElementById('api-modal-bg').classList.remove('show');
        document.getElementById('api-modal').classList.remove('show');
    },

    switchSetTab(tabId) {
        ['basic', 'ai', 'draw', 'sys'].forEach(id => {
            const tab = document.getElementById('stab-' + id);
            const sec = document.getElementById('set-sec-' + id);
            if(tab) tab.classList.remove('active');
            if(sec) sec.classList.remove('active');
        });
        const activeTab = document.getElementById('stab-' + tabId);
        const activeSec = document.getElementById('set-sec-' + tabId);
        if(activeTab) activeTab.classList.add('active');
        if(activeSec) activeSec.classList.add('active');
    },

    openApp(appId, appName) {
        window.Config.currentAppId = appId;
        
        const titleEl = document.getElementById('app-window-title');
        const winEl = document.getElementById('app-window');
        const contentEl = document.getElementById('app-window-content');
        const footerEl = document.getElementById('app-window-footer');
        
        if(!titleEl || !winEl || !contentEl || !footerEl) return;

        titleEl.innerText = appName;
        winEl.classList.add('open');
        contentEl.style.padding = '20px'; 
        contentEl.style.background = 'transparent'; 
        footerEl.innerHTML = ''; 
        
        if (appId === 'diary') {
            winEl.classList.add('fullscreen-mode');
        } else {
            winEl.classList.remove('fullscreen-mode');
        }
        
        if (appId === 'novel') {
            contentEl.style.padding = '0';
            contentEl.innerHTML = `
                <div id="novel-content-list" class="story-bg" onclick="window.PhoneUI.closeStoryMenu(); window.PhoneUI.closeStickerPanel();"></div>
                <div id="sticker-panel" class="chat-plus-menu" style="display: flex; flex-wrap: wrap; justify-content: flex-start; align-content: flex-start; padding: 15px; gap: 12px; overflow-y: auto; max-height: 280px; z-index: 11; bottom: 100%; margin-bottom: 10px; left: 15px; right: 15px; transform-origin: bottom left;"></div>
            `;
            footerEl.innerHTML = `
                <div id="story-plus-menu" class="story-menu">
                    <div class="story-menu-item" onclick="window.PhoneEngine.extractMemory('novel'); window.PhoneUI.closeStoryMenu();"><div class="icon"><i class="ph-fill ph-brain"></i></div><div class="text">提取记忆</div></div>
                    <div class="story-menu-item" onclick="window.PhoneEngine.washMemory('novel'); window.PhoneUI.closeStoryMenu();"><div class="icon"><i class="ph-fill ph-broom" style="color: #f4a261;"></i></div><div class="text">记忆洗地</div></div>
                    <div class="story-menu-item" onclick="window.PhoneUI.openArchiveModal(); window.PhoneUI.closeStoryMenu();"><div class="icon"><i class="ph-fill ph-floppy-disk"></i></div><div class="text">存档室</div></div>
                    <div class="story-menu-item" onclick="alert('掷骰子功能开发中！'); window.PhoneUI.closeStoryMenu();"><div class="icon"><i class="ph-fill ph-dice-five"></i></div><div class="text">掷骰子</div></div>
                </div>
                <div class="story-input-bar">
                    <div class="icon-btn" id="btn-story-plus" onclick="window.PhoneUI.toggleStoryMenu(); window.PhoneUI.closeStickerPanel();"><i class="ph ph-plus-circle"></i></div>
                    <textarea id="novel-input" class="story-textarea" placeholder="书写你们的故事..." onclick="window.PhoneUI.closeStoryMenu(); window.PhoneUI.closeStickerPanel();"></textarea>
                    <div class="icon-btn" style="font-size: 26px; padding-bottom: 4px; margin-right: 5px;" onclick="window.PhoneUI.toggleStickerPanel(); window.PhoneUI.closeStoryMenu();"><i class="ph ph-smiley"></i></div>
                    <button class="story-send-btn" onclick="window.PhoneEngine.sendNovelMessage(); window.PhoneUI.closeStoryMenu(); window.PhoneUI.closeStickerPanel();"><i class="ph-fill ph-paper-plane-right"></i></button>
                </div>
            `;
            this.renderNovelContent();

        } else if (appId === 'diary') {
            const diaryTitle = localStorage.getItem('diary_title') || 'His Diary';
            contentEl.innerHTML = `
                <div id="diary-cover-view" class="diary-cover-view">
                    <div class="diary-book-cover" id="diary-book-cover" onclick="window.PhoneUI.unlockDiary()">
                        <div class="diary-title">${diaryTitle}</div>
                        <div class="diary-hint">点击翻开日记</div>
                    </div>
                    <div class="diary-back-btn" onclick="window.PhoneUI.closeApp()"><i class="ph ph-caret-left"></i></div>
                </div>
                <div id="diary-inside-view" class="diary-inside-view">
                    <div class="diary-back-btn" onclick="window.PhoneUI.closeApp()" style="top: 20px; left: 15px; background: rgba(0,0,0,0.1); color: #333;"><i class="ph ph-caret-left"></i></div>
                    <div class="notebook-page" id="diary-content-area"></div>
                    <div class="page-turner">
                        <div class="page-btn" onclick="window.PhoneUI.turnDiaryPage(-1)"><i class="ph ph-caret-left"></i></div>
                        <div class="page-btn" onclick="window.PhoneUI.turnDiaryPage(1)"><i class="ph ph-caret-right"></i></div>
                    </div>
                </div>
            `;
            window.Config.diaryPageIndex = -1; 
            this.renderDiaryPage();

        } else if (appId === 'memory_vault') {
            window.Config.memoryVaultTab = 'wechat'; 
            contentEl.innerHTML = `
                <div class="vault-tabs">
                    <div class="vault-tab active" id="tab-wechat" onclick="window.PhoneUI.switchVaultTab('wechat')">线上微信</div>
                    <div class="vault-tab" id="tab-novel" onclick="window.PhoneUI.switchVaultTab('novel')">线下故事</div>
                    <div class="vault-tab" id="tab-core" onclick="window.PhoneUI.switchVaultTab('core')">⭐ 核心记忆</div>
                </div>
                <div id="vault-content-area"></div>
            `;
            this.renderMemoryVault();

        } else if (appId === 'favorites') {
            const favs = window.PhoneAPI.getFavorites();
            let html = '<div style="padding: 10px 5px;">';
            if (favs.length === 0) {
                html += '<div style="text-align:center; color:var(--text-sub); padding: 50px 0;"><i class="ph-fill ph-star" style="font-size:48px; color:var(--border-color); margin-bottom:15px;"></i><br>空空如也<br>快去聊天记录长按消息收藏吧！</div>';
            } else {
                [...favs].reverse().forEach(fav => {
                    let content = window.marked ? window.marked.parse(fav.content) : fav.content;
                    html += `
                        <div class="card" style="position:relative; padding-right: 40px;">
                            <div style="font-size: 12px; color: var(--primary-color); margin-bottom: 5px; font-weight: bold;">${fav.time} · ${fav.source}</div>
                            <div class="markdown-body" style="font-size: 14px;">${content}</div>
                            <div onclick="window.PhoneAPI.deleteFavorite('${fav.id}')" style="position:absolute; right:15px; top:50%; transform:translateY(-50%); color:var(--danger-color); font-size:20px; cursor:pointer; padding:5px;"><i class="ph ph-trash"></i></div>
                        </div>
                    `;
                });
            }
            html += '</div>';
            contentEl.innerHTML = html;

        } else if (appId === 'shop') {
            this.renderShop();
        } else if (appId === 'task') {
            this.renderTask();
        } else if (appId === 'settings') {
            this.renderSettings();
        } else if (appId === 'worldbook') {
            this.renderWorldbook();
        }
    },

    renderSettings() {
        const contentEl = document.getElementById('app-window-content');
        if (!contentEl) return;
        
        const today = new Date();
        const defaultDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
        
        contentEl.innerHTML = `
            <div class="settings-tabs">
                <div class="settings-tab active" id="stab-basic" onclick="window.PhoneUI.switchSetTab('basic')">基础/UI</div>
                <div class="settings-tab" id="stab-ai" onclick="window.PhoneUI.switchSetTab('ai')">大模型</div>
                <div class="settings-tab" id="stab-draw" onclick="window.PhoneUI.switchSetTab('draw')">绘画引擎</div>
                <div class="settings-tab" id="stab-sys" onclick="window.PhoneUI.switchSetTab('sys')">系统维护</div>
            </div>

            <div id="set-sec-basic" class="set-section active">
                <div class="card">
                    <h3 style="color: var(--primary-color); margin-bottom: 15px;"><i class="ph-fill ph-user-list"></i> 基础设定</h3>
                    <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                        <div style="flex: 1;"><label style="font-size: 12px; color: var(--text-sub);">我的名字</label><input type="text" id="my-name" oninput="window.PhoneAPI.autoSave()" style="width: 100%; padding: 8px; border-radius: 8px; margin-top: 4px;"></div>
                        <div style="flex: 1;"><label style="font-size: 12px; color: var(--text-sub);">TA的名字</label><input type="text" id="char-name" oninput="window.PhoneAPI.autoSave()" style="width: 100%; padding: 8px; border-radius: 8px; margin-top: 4px;"></div>
                    </div>
                    <div style="display: flex; gap: 10px; margin-bottom: 5px;">
                        <div style="flex: 1;"><label style="font-size: 12px; color: var(--text-sub);">我的头像(网址)</label><input type="text" id="my-avatar" oninput="window.PhoneAPI.autoSave()" style="width: 100%; padding: 8px; border-radius: 8px; margin-top: 4px;"></div>
                        <div style="flex: 1;"><label style="font-size: 12px; color: var(--text-sub);">TA的头像(网址)</label><input type="text" id="ta-avatar" oninput="window.PhoneAPI.autoSave()" style="width: 100%; padding: 8px; border-radius: 8px; margin-top: 4px;"></div>
                    </div>
                </div>

                <div class="card">
                    <h3 style="color: var(--primary-color); margin-bottom: 10px;"><i class="ph-fill ph-palette"></i> UI 主题装修 (预设库)</h3>
                    <div class="preset-bar">
                        <select id="ui-preset-select" onchange="window.PhoneAPI.loadUIPreset()"></select>
                        <button class="preset-btn" onclick="window.PhoneAPI.saveUIPreset()">存为预设</button>
                        <button class="preset-btn del" onclick="window.PhoneAPI.deleteUIPreset()">删除</button>
                    </div>
                    <div class="engine-title"><i class="ph-fill ph-image"></i> 壁纸与封面</div>
                    <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                        <div style="flex: 1;"><label style="font-size: 11px; color: var(--text-sub);">全局壁纸(网址)</label><input type="text" id="bg-global" oninput="window.PhoneAPI.autoSave()" style="width: 100%; padding: 8px; border-radius: 8px; margin-top: 4px;"></div>
                        <div style="flex: 1;"><label style="font-size: 11px; color: var(--text-sub);">聊天壁纸(网址)</label><input type="text" id="bg-chat" oninput="window.PhoneAPI.autoSave()" style="width: 100%; padding: 8px; border-radius: 8px; margin-top: 4px;"></div>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label style="font-size: 11px; color: var(--text-sub);">日记本封面(网址)</label>
                        <input type="text" id="bg-diary-cover" placeholder="例如: ./cover.jpg" oninput="window.PhoneAPI.autoSave()" style="width: 100%; padding: 8px; border-radius: 8px; margin-top: 4px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="font-size: 11px; color: var(--text-sub);">日记内页底图(网址)</label>
                        <input type="text" id="bg-diary-page" placeholder="推荐使用牛皮纸或水彩底图" oninput="window.PhoneAPI.autoSave()" style="width: 100%; padding: 8px; border-radius: 8px; margin-top: 4px;">
                    </div>
                    
                    <div class="engine-title"><i class="ph-fill ph-text-aa"></i> 日记本专属设置</div>
                    <div style="margin-bottom: 10px;">
                        <label style="font-size: 11px; color: var(--text-sub); font-weight: bold; color: var(--danger-color);">日记起始日期 (决定第一页是哪天！)</label>
                        <input type="date" id="diary-start-date" value="${defaultDate}" onchange="window.PhoneAPI.autoSave()" style="width: 100%; padding: 8px; border-radius: 8px; margin-top: 4px;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label style="font-size: 11px; color: var(--text-sub);">封面标题 (英文比较好看)</label>
                        <input type="text" id="diary-title" placeholder="His Diary" oninput="window.PhoneAPI.autoSave()" style="width: 100%; padding: 8px; border-radius: 8px; margin-top: 4px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="font-size: 11px; color: var(--text-sub);">扉页寄语 (支持换行)</label>
                        <textarea id="diary-quote" rows="3" placeholder="时间会磨平一切痕迹，\n除了我为你写下的字。" oninput="window.PhoneAPI.autoSave()" style="width: 100%; padding: 8px; border-radius: 8px; margin-top: 4px; resize:vertical;"></textarea>
                    </div>
                </div>
            </div>

            <div id="set-sec-ai" class="set-section">
                <div class="card">
                    <h3 style="color: var(--primary-color); margin-bottom: 10px;"><i class="ph-fill ph-scroll"></i> 提示词与人设 (预设库)</h3>
                    <div class="preset-bar">
                        <select id="prompt-preset-select" onchange="window.PhoneAPI.loadPromptPreset()"></select>
                        <button class="preset-btn" onclick="window.PhoneAPI.savePromptPreset()">存为预设</button>
                        <button class="preset-btn del" onclick="window.PhoneAPI.deletePromptPreset()">删除</button>
                    </div>
                    <div style="margin-bottom: 15px;"><label style="font-size: 12px; color: var(--text-main); font-weight: bold;">1. 系统指令 (防八股/核心规则)</label><textarea id="system-prompt" rows="4" oninput="window.PhoneAPI.autoSave()" style="width: 100%; padding: 10px; border-radius: 8px; resize: vertical; font-size: 12px; margin-top: 4px;"></textarea></div>
                    <div style="margin-bottom: 15px;"><label style="font-size: 12px; color: var(--text-main); font-weight: bold;">2. 角色人设 (性格/背景/口吻)</label><textarea id="char-persona" rows="6" oninput="window.PhoneAPI.autoSave()" style="width: 100%; padding: 10px; border-radius: 8px; resize: vertical; font-size: 12px; margin-top: 4px;"></textarea></div>
                    <div style="margin-bottom: 5px;"><label style="font-size: 12px; color: var(--text-main); font-weight: bold;">3. 线下文风 (小说模式专属要求)</label><textarea id="novel-style" rows="4" oninput="window.PhoneAPI.autoSave()" style="width: 100%; padding: 10px; border-radius: 8px; resize: vertical; font-size: 12px; margin-top: 4px;"></textarea></div>
                </div>

                <div class="card">
                    <h3 style="color: var(--primary-color); margin-bottom: 15px;"><i class="ph-fill ph-toggle-left"></i> 功能开关</h3>
                    <div style="margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; background: var(--icon-bg); padding: 10px; border-radius: 8px;">
                        <label style="font-size: 13px; color: var(--text-main); font-weight: bold;"><i class="ph ph-prohibit"></i> 绝对禁止 AI 使用 Emoji</label><input type="checkbox" id="ban-emoji" onchange="window.PhoneAPI.autoSave()" style="width: 18px; height: 18px;">
                    </div>
                    <div style="margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; background: var(--icon-bg); padding: 10px; border-radius: 8px;">
                        <label style="font-size: 13px; color: var(--text-main); font-weight: bold;"><i class="ph ph-arrows-merge"></i> 开启线上/线下记忆互通</label><input type="checkbox" id="share-memory" onchange="window.PhoneAPI.autoSave()" style="width: 18px; height: 18px;">
                    </div>
                    <div style="margin-bottom: 5px; display: flex; align-items: center; justify-content: space-between; background: var(--icon-bg); padding: 10px; border-radius: 8px;">
                        <label style="font-size: 13px; color: var(--text-main); font-weight: bold;"><i class="ph ph-camera"></i> 允许 AI 在聊天中自动发自拍</label><input type="checkbox" id="auto-photo" onchange="window.PhoneAPI.autoSave()" style="width: 18px; height: 18px;">
                    </div>
                </div>

                <div class="card">
                    <h3 style="color: var(--primary-color); margin-bottom: 10px;"><i class="ph-fill ph-database"></i> 语言引擎预设库 (文本模型)</h3>
                    <div style="margin-bottom: 10px;"><input type="text" id="preset-name" placeholder="起个名字 (如: 硅基-DeepSeek)" style="width: 100%; padding: 8px; border-radius: 8px;"></div>
                    <div style="margin-bottom: 10px;"><input type="text" id="preset-url" placeholder="接口地址 (Base URL)" style="width: 100%; padding: 8px; border-radius: 8px;"></div>
                    <div style="margin-bottom: 10px;"><input type="password" id="preset-key" placeholder="API Key (密钥)" style="width: 100%; padding: 8px; border-radius: 8px;"></div>
                    <div style="margin-bottom: 15px;"><input type="text" id="preset-model" placeholder="模型名称 (Model)" style="width: 100%; padding: 8px; border-radius: 8px;"></div>
                    <button class="btn-refresh" onclick="window.PhoneAPI.savePreset()" style="margin-top: 0; margin-bottom: 15px;"><i class="ph ph-plus"></i> 添加到预设库</button>
                    <div style="display: flex; gap: 8px; align-items: center; border-top: 1px dashed var(--border-color); padding-top: 15px;">
                        <select id="preset-delete-select" style="flex: 1; padding: 8px; border-radius: 8px;"></select>
                        <button class="btn-refresh" onclick="window.PhoneAPI.deletePreset()" style="width: auto; margin-top: 0; background: transparent; color: var(--danger-color); border: 1px solid var(--danger-color); padding: 8px 12px;"><i class="ph ph-trash"></i> 删除</button>
                    </div>
                </div>

                <div class="card">
                    <h3 style="color: var(--primary-color); margin-bottom: 15px;"><i class="ph-fill ph-cpu"></i> 主副引擎分配</h3>
                    <div class="engine-title"><i class="ph-fill ph-chat-circle-dots"></i> 主引擎 (聊天/小说专用)</div>
                    <select id="main-engine-select" onchange="window.PhoneAPI.assignEngine('main', this.value)" style="width: 100%; padding: 8px; border-radius: 8px; margin-bottom: 15px;"></select>
                    <div class="engine-title"><i class="ph-fill ph-lightning"></i> 副引擎 (转盘/商店专用)</div>
                    <select id="sub-engine-select" onchange="window.PhoneAPI.assignEngine('sub', this.value)" style="width: 100%; padding: 8px; border-radius: 8px;">
                        <option value="">-- 同主引擎 (自动降级) --</option>
                    </select>
                </div>
            </div>

            <div id="set-sec-draw" class="set-section">
                <div class="card">
                    <h3 style="color: var(--primary-color); margin-bottom: 10px;"><i class="ph-fill ph-image"></i> 绘画引擎配置 (DALL-E 格式)</h3>
                    <div style="font-size: 11px; color: var(--text-sub); margin-bottom: 10px;">用于生成相册照片，必须支持返回 b64_json 格式。</div>
                    <div style="margin-bottom: 10px;"><input type="text" id="img-api-url" placeholder="接口地址 (例如: https://api.openai.com/v1/images/generations)" oninput="window.PhoneAPI.autoSave()" style="width: 100%; padding: 8px; border-radius: 8px;"></div>
                    <div style="margin-bottom: 10px;"><input type="password" id="img-api-key" placeholder="API Key (密钥)" oninput="window.PhoneAPI.autoSave()" style="width: 100%; padding: 8px; border-radius: 8px;"></div>
                    <div style="margin-bottom: 10px;"><input type="text" id="img-api-model" placeholder="模型名称 (例如: dall-e-3)" oninput="window.PhoneAPI.autoSave()" style="width: 100%; padding: 8px; border-radius: 8px;"></div>
                    
                    <div class="engine-title" style="margin-top: 15px;"><i class="ph-fill ph-mask-happy"></i> 画风与垫图 (锁脸) 预设库</div>
                    <div class="preset-bar">
                        <select id="img-preset-select" onchange="window.PhoneAPI.loadImgPreset()"></select>
                        <button class="preset-btn" onclick="window.PhoneAPI.saveImgPreset()">存为预设</button>
                        <button class="preset-btn del" onclick="window.PhoneAPI.deleteImgPreset()">删除</button>
                    </div>
                    <div style="font-size: 11px; color: var(--text-sub); margin-bottom: 10px;">如果使用 Midjourney/NAI，可以上传一张照片作为垫图锁脸。<br><span style="color:var(--danger-color)">注意：使用 DALL-E 3 请勿上传垫图和反向词！</span></div>
                    <div style="display: flex; gap: 10px; margin-bottom: 15px; align-items: center;">
                        <div id="face-lock-preview" style="width: 60px; height: 60px; border-radius: 12px; background: var(--icon-bg); border: 1px dashed var(--border-color); display: flex; justify-content: center; align-items: center; overflow: hidden;">
                            <i class="ph ph-plus" style="font-size: 24px; color: var(--text-sub);"></i>
                        </div>
                        <div style="flex: 1; display: flex; flex-direction: column; gap: 5px;">
                            <button class="btn-refresh" onclick="window.PhoneEngine.uploadFaceLock()" style="margin: 0; padding: 8px; font-size: 12px; border-radius: 8px;">上传锁脸图</button>
                            <button class="btn-refresh" onclick="window.PhoneEngine.clearFaceLock()" style="margin: 0; padding: 8px; font-size: 12px; border-radius: 8px; background: transparent; color: var(--danger-color); border: 1px solid var(--danger-color);">清除</button>
                        </div>
                    </div>
                    <div style="margin-bottom: 10px;"><textarea id="img-base-prompt" rows="4" placeholder="正向提示词 (例如: 1boy, handsome, black hair)" oninput="window.PhoneAPI.autoSave()" style="width: 100%; padding: 8px; border-radius: 8px; resize:vertical;"></textarea></div>
                    <div style="margin-bottom: 5px;"><textarea id="img-negative-prompt" rows="3" placeholder="反向提示词 (例如: lowres, bad anatomy, bad hands, error, missing fingers)" oninput="window.PhoneAPI.autoSave()" style="width: 100%; padding: 8px; border-radius: 8px; resize:vertical;"></textarea></div>
                </div>
            </div>

            <div id="set-sec-sys" class="set-section">
                <div class="card">
                    <h3 style="color: var(--primary-color); margin-bottom: 15px;"><i class="ph-fill ph-floppy-disk-back"></i> 数据备份与恢复</h3>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn-refresh" onclick="window.PhoneAPI.exportData()" style="flex: 1; margin-top: 0; background: var(--secondary-color);"><i class="ph ph-export"></i> 导出备份</button>
                        <button class="btn-refresh" onclick="document.getElementById('import-file').click()" style="flex: 1; margin-top: 0; background: #2a9d8f;"><i class="ph ph-import"></i> 导入恢复</button>
                        <input type="file" id="import-file" style="display:none" accept=".json" onchange="window.PhoneAPI.importData(event)">
                    </div>
                </div>

                <div class="card">
                    <h3 style="color: var(--danger-color); margin-bottom: 15px;"><i class="ph-fill ph-warning-circle"></i> 系统维护</h3>
                    <button class="btn-refresh" onclick="window.PhoneAPI.forceUpdate()" style="background: #f4a261; margin-top: 0; margin-bottom: 10px;"><i class="ph ph-arrows-clockwise"></i> 强制更新系统 (获取最新代码)</button>
                    <button class="btn-refresh" onclick="window.PhoneAPI.clearChat()" style="background: var(--danger-color); margin-top: 0;"><i class="ph ph-trash"></i> 清空所有聊天与小说记录</button>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            window.PhoneAPI.loadSettings();
            window.PhoneAPI.refreshPresetDropdowns();
            window.PhoneAPI.refreshPromptDropdowns();
            window.PhoneAPI.refreshUIDropdowns();
            window.PhoneAPI.refreshImgDropdowns();
        }, 50);
    },

    renderWorldbook() {
        const contentEl = document.getElementById('app-window-content');
        if (!contentEl) return;
        
        const minWords = localStorage.getItem('novel_min_words') || '150';
        const wbData = window.PhoneAPI.getWorldbookData();
        
        let wbHtml = '';
        wbData.forEach(wb => {
            const deleteBtn = wb.isCustom ? `<div class="wb-delete-btn" onclick="window.PhoneAPI.deleteWorldbook('${wb.id}')"><i class="ph ph-trash"></i></div>` : '';
            wbHtml += `
                <div class="wb-card">
                    <div class="wb-header"><span class="wb-title">${wb.title}</span>${deleteBtn}</div>
                    <div class="wb-content">${wb.content}</div>
                    <div class="wb-toggles">
                        <div class="wb-toggle-item"><label class="switch"><input type="checkbox" ${wb.online ? 'checked' : ''} onchange="window.PhoneAPI.toggleWorldbook('${wb.id}', 'online', this.checked)"><span class="slider"></span></label>线上</div>
                        <div class="wb-toggle-item"><label class="switch"><input type="checkbox" ${wb.offline ? 'checked' : ''} onchange="window.PhoneAPI.toggleWorldbook('${wb.id}', 'offline', this.checked)"><span class="slider"></span></label>线下</div>
                    </div>
                </div>
            `;
        });

        contentEl.innerHTML = `
            <div class="card" style="margin-bottom: 20px;">
                <h3 style="font-size: 14px; color: var(--primary-color); margin-bottom: 10px;"><i class="ph-fill ph-text-aa"></i> 线下小说字数底线</h3>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="number" id="novel-min-words" value="${minWords}" oninput="window.PhoneAPI.saveNovelWords()" style="width: 80px; padding: 8px; border: 1px solid var(--border-color); border-radius: 8px; text-align: center; background: var(--icon-bg); color: var(--text-main);">
                    <span style="font-size: 12px; color: var(--text-sub);">字 (打字自动保存)</span>
                </div>
            </div>
            <h3 style="font-size: 14px; color: var(--primary-color); margin-bottom: 10px; margin-left: 5px;"><i class="ph-fill ph-puzzle-piece"></i> 规则插件挂载</h3>
            ${wbHtml}
            <button class="btn-refresh" onclick="window.PhoneUI.openWbModal()" style="margin-top: 10px; margin-bottom: 30px; background: transparent; color: var(--primary-color); border: 1px dashed var(--primary-color);"><i class="ph ph-plus"></i> 添加自定义规则</button>
        `;
    },

    renderShop() {
        const contentEl = document.getElementById('app-window-content');
        if (!contentEl) return;
        
        let coins = localStorage.getItem('my_coins') || '500';
        const currentTag = window.Config.currentShopTag || '日常用品';
        
        let customTags = JSON.parse(localStorage.getItem('shop_custom_tags') || '[]');
        const defaultTags = ['日常用品', '奇葩服装', '赛博外卖', '真心话道具'];
        const allTags = [...defaultTags, ...customTags];

        let tagsHtml = '';
        allTags.forEach(tag => {
            const activeClass = tag === currentTag ? 'active' : '';
            tagsHtml += `<div class="shop-tag ${activeClass}" onclick="window.PhoneEngine.switchShopTag('${tag}')">${tag}</div>`;
        });

        const tagData = JSON.parse(localStorage.getItem('shop_all_data') || '{}');
        const shopItems = tagData[currentTag] || [];
        
        let gridHtml = '';
        if (shopItems.length === 0) {
            gridHtml = `<div style="grid-column: span 2; text-align:center; padding: 40px 0; color: var(--text-sub);">货架空空如也，点击右上角进货吧！</div>`;
        } else {
            shopItems.forEach((item, idx) => {
                gridHtml += `
                    <div class="shop-item" onclick="window.PhoneUI.openShopDetail(${idx})">
                        <div class="shop-item-icon"><i class="${item.icon || 'ph-fill ph-package'}"></i></div>
                        <div class="shop-item-name">${item.name}</div>
                        <div class="shop-item-desc">${item.desc}</div>
                        <div class="shop-item-bottom">
                            <div class="shop-item-price"><i class="ph-fill ph-coin"></i> ${item.price}</div>
                            <button class="shop-item-add" onclick="event.stopPropagation(); window.PhoneEngine.addToCart(${idx})"><i class="ph ph-plus"></i></button>
                        </div>
                    </div>
                `;
            });
        }

        const cart = JSON.parse(localStorage.getItem('shopping_cart') || '[]');
        const badgeHtml = cart.length > 0 ? `<div class="cart-badge" id="cart-badge">${cart.length}</div>` : `<div class="cart-badge" id="cart-badge" style="display:none;">0</div>`;

        contentEl.innerHTML = `
            <div class="shop-header">
                <div class="shop-title">深夜杂货铺</div>
                <div class="shop-actions">
                    <div style="background: rgba(244, 162, 97, 0.15); color: #e76f51; padding: 6px 12px; border-radius: 20px; font-weight: bold; display:flex; align-items:center; gap:4px; font-size: 14px;">
                        <i class="ph-fill ph-coin"></i> <span id="coin-display">${coins}</span>
                    </div>
                    <div class="shop-cart-btn" onclick="window.PhoneUI.openCartModal()">
                        <i class="ph ph-shopping-cart"></i>
                        ${badgeHtml}
                    </div>
                    <div class="shop-cart-btn" onclick="window.PhoneEngine.refreshShop()" style="color: var(--primary-color);">
                        <i class="ph ph-arrows-clockwise"></i>
                    </div>
                </div>
            </div>

            <div class="shop-tags-container">
                <div class="shop-tags">
                    ${tagsHtml}
                </div>
                <div class="shop-tag-add" onclick="window.PhoneEngine.addCustomShopTag()"><i class="ph ph-plus"></i></div>
            </div>

            <div class="shop-grid" id="shop-grid">
                ${gridHtml}
            </div>

            <div id="cart-modal-bg" class="action-sheet-bg" onclick="window.PhoneUI.closeCartModal()"></div>
            <div id="cart-modal" class="cart-modal">
                <div class="cart-header">
                    <span>购物车</span>
                    <i class="ph ph-x" style="cursor:pointer; color:var(--text-sub);" onclick="window.PhoneUI.closeCartModal()"></i>
                </div>
                <div class="cart-list" id="cart-list"></div>
                <div class="cart-footer">
                    <div class="cart-total"><span>合计：</span><span style="color:#e76f51;"><i class="ph-fill ph-coin"></i> <span id="cart-total-price">0</span></span></div>
                    <div class="cart-btn-group">
                        <button class="cart-btn share" onclick="window.PhoneEngine.checkoutCart(true)"><i class="ph-fill ph-share-network"></i> 发给老公代付</button>
                        <button class="cart-btn pay" onclick="window.PhoneEngine.checkoutCart(false)"><i class="ph-fill ph-wallet"></i> 余额买单</button>
                    </div>
                </div>
            </div>

            <div id="shop-detail-bg" class="action-sheet-bg" onclick="window.PhoneUI.closeShopDetail()"></div>
            <div id="shop-detail-modal" class="thought-modal" style="padding: 0; overflow: hidden; max-height: 90vh;">
                <div style="background: var(--bg-gradient-start); padding: 40px 20px; text-align: center; position: relative;">
                    <div style="font-size: 64px; color: var(--primary-color);" id="detail-icon"><i class="ph-fill ph-package"></i></div>
                    <i class="ph-fill ph-x-circle" style="position: absolute; top: 15px; right: 15px; font-size: 28px; color: rgba(0,0,0,0.2); cursor: pointer;" onclick="window.PhoneUI.closeShopDetail()"></i>
                </div>
                <div style="padding: 25px 20px;">
                    <h2 style="color: var(--text-main); margin-bottom: 10px;" id="detail-name">商品名称</h2>
                    <div style="color: #e76f51; font-size: 24px; font-weight: bold; margin-bottom: 15px;"><i class="ph-fill ph-coin"></i> <span id="detail-price">0</span></div>
                    <p style="color: var(--text-sub); font-size: 14px; line-height: 1.6; margin-bottom: 25px;" id="detail-desc">商品描述详情</p>
                    <button class="btn-refresh" id="detail-add-btn" style="margin-top: 0; border-radius: 16px; padding: 15px;"><i class="ph ph-shopping-cart"></i> 加入购物车</button>
                </div>
            </div>
        `;
    },

    openShopDetail(index) {
        const tag = window.Config.currentShopTag || '日常用品';
        const allShopData = JSON.parse(localStorage.getItem('shop_all_data') || '{}');
        const shopItems = allShopData[tag] || [];
        const item = shopItems[index];
        if (!item) return;

        document.getElementById('detail-icon').innerHTML = `<i class="${item.icon || 'ph-fill ph-package'}"></i>`;
        document.getElementById('detail-name').innerText = item.name;
        document.getElementById('detail-price').innerText = item.price;
        document.getElementById('detail-desc').innerText = item.desc;
        
        const addBtn = document.getElementById('detail-add-btn');
        addBtn.onclick = () => {
            window.PhoneEngine.addToCart(index);
            this.closeShopDetail();
        };

        document.getElementById('shop-detail-bg').classList.add('show');
        document.getElementById('shop-detail-modal').classList.add('show');
    },

    closeShopDetail() {
        document.getElementById('shop-detail-bg').classList.remove('show');
        document.getElementById('shop-detail-modal').classList.remove('show');
    },

    openCartModal() {
        this.renderCartList();
        document.getElementById('cart-modal-bg').classList.add('show');
        document.getElementById('cart-modal').classList.add('show');
    },

    closeCartModal() {
        document.getElementById('cart-modal-bg').classList.remove('show');
        document.getElementById('cart-modal').classList.remove('show');
    },

    renderCartList() {
        const cart = JSON.parse(localStorage.getItem('shopping_cart') || '[]');
        const listEl = document.getElementById('cart-list');
        const totalEl = document.getElementById('cart-total-price');
        if (!listEl || !totalEl) return;

        if (cart.length === 0) {
            listEl.innerHTML = `<div style="text-align:center; color:var(--text-sub); padding: 20px 0;">购物车是空的哦~</div>`;
            totalEl.innerText = '0';
            return;
        }

        let html = '';
        let total = 0;
        cart.forEach((item, idx) => {
            total += parseInt(item.price);
            html += `
                <div class="cart-item">
                    <div class="cart-item-icon"><i class="${item.icon || 'ph-fill ph-package'}"></i></div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price"><i class="ph-fill ph-coin"></i> ${item.price}</div>
                    </div>
                    <div class="cart-item-del" onclick="window.PhoneEngine.removeFromCart(${idx})"><i class="ph ph-minus-circle"></i></div>
                </div>
            `;
        });
        listEl.innerHTML = html;
        totalEl.innerText = total;
    },

    renderTask() {
        const contentEl = document.getElementById('app-window-content');
        if (!contentEl) return;
        
        let currentTasks = JSON.parse(localStorage.getItem('task_current_items') || '[]');
        if (currentTasks.length === 0) {
            currentTasks = [
                { name: '帮大侦探整理案卷', reward: 50, icon: 'ph-fill ph-keyboard', isStory: false },
                { name: '去楼下便利店跑腿买咖啡', reward: 30, icon: 'ph-fill ph-coffee', isStory: false },
                { name: '跟大侦探一起去现场勘查', reward: 200, icon: 'ph-fill ph-magnifying-glass', isStory: true }
            ];
            localStorage.setItem('task_current_items', JSON.stringify(currentTasks));
        }
        
        let taskHtml = '';
        currentTasks.forEach((task, idx) => {
            const btnClass = task.isStory ? 'task-btn story' : 'task-btn';
            const btnText = task.isStory ? '触发剧情' : '去打工';
            taskHtml += `
                <div class="task-item">
                    <div class="task-icon"><i class="${task.icon}"></i></div>
                    <div class="task-info">
                        <div class="task-name">${task.name}</div>
                        <div class="task-reward"><i class="ph-fill ph-coin"></i> +${task.reward} 金币</div>
                    </div>
                    <button class="${btnClass}" onclick="window.PhoneEngine.doTask(${idx})">${btnText}</button>
                </div>
            `;
        });
        
        contentEl.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px; margin-left: 5px;">
                <h3 style="font-size: 14px; color: var(--primary-color); margin: 0;"><i class="ph-fill ph-briefcase"></i> 悬赏打工板</h3>
                <div onclick="window.PhoneEngine.refreshTasks()" style="color: var(--primary-color); cursor: pointer; padding: 5px; font-size: 12px; font-weight: bold;"><i class="ph ph-arrows-clockwise"></i> 刷新委托</div>
            </div>
            <div class="task-list" id="task-list-container">
                ${taskHtml}
            </div>
        `;
    },

    renderGallery() {
        const contentEl = document.getElementById('app-window-content');
        if (!contentEl) return;
        
        const roleId = window.Config.currentContactId;
        const items = window.Config.phoneData[roleId]?.gallery?.items || [];
        
        let html = `
            <button class="btn-refresh" onclick="window.PhoneEngine.generateAiImage()" style="margin-top: 0; margin-bottom: 15px; border-radius: 16px; background: linear-gradient(135deg, #a78bfa, #8b5cf6); box-shadow: 0 5px 15px rgba(139, 92, 246, 0.3);">
                <i class="ph-fill ph-magic-wand"></i> 生成新照片
            </button>
            <div id="image-viewer" class="image-viewer">
                <div class="viewer-close" onclick="window.PhoneUI.closeImageViewer()"><i class="ph ph-x"></i></div>
                <div class="viewer-download" onclick="window.PhoneUI.downloadCurrentImage()"><i class="ph ph-download-simple"></i> 保存到手机</div>
                <img id="viewer-img" src="">
            </div>
        `;
        
        if (items.length === 0) {
            html += `<div style="text-align:center; padding: 50px 0; color: var(--text-sub);"><i class="ph-fill ph-images" style="font-size: 48px; color: var(--border-color); margin-bottom: 10px;"></i><br>相册空空如也，快去生成第一张合照吧！</div>`;
        } else {
            html += `<div class="gallery-grid">`;
            [...items].reverse().forEach(img => {
                html += `
                    <div class="gallery-item" onclick="window.PhoneUI.openImageViewer('${img.content}')">
                        <img src="${img.content}">
                        <div class="gallery-del-btn" onclick="event.stopPropagation(); window.PhoneEngine.deleteGalleryImage('${img.id}')"><i class="ph ph-trash"></i></div>
                    </div>
                `;
            });
            html += `</div>`;
        }
        contentEl.innerHTML = html;
    },

    openImageViewer(src) {
        const viewer = document.getElementById('image-viewer');
        const img = document.getElementById('viewer-img');
        if (viewer && img) {
            img.src = src;
            viewer.classList.add('show');
        }
    },
    closeImageViewer() {
        const viewer = document.getElementById('image-viewer');
        if (viewer) viewer.classList.remove('show');
    },

    downloadCurrentImage() {
        const img = document.getElementById('viewer-img');
        if (!img || !img.src) return;
        const a = document.createElement('a');
        a.href = img.src;
        a.download = 'Claire_Claude_Photo_' + Date.now() + '.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.PhoneAPI.showToast('✅ 图片已保存到手机！');
    },

    closeApp() {
        const winEl = document.getElementById('app-window');
        if(winEl) {
            winEl.classList.remove('open');
            winEl.classList.remove('fullscreen-mode'); 
        }
        window.Config.currentAppId = 'wechat';
    },

    switchVaultTab(tabName) {
        window.Config.memoryVaultTab = tabName;
        document.querySelectorAll('.vault-tab').forEach(el => el.classList.remove('active'));
        document.getElementById('tab-' + tabName).classList.add('active');
        this.renderMemoryVault();
    },

    renderMemoryVault() {
        const contentArea = document.getElementById('vault-content-area');
        if (!contentArea) return;

        const currentTab = window.Config.memoryVaultTab || 'wechat';
        const allVault = window.PhoneAPI.getMemoryVault();
        
        let renderItems = [];
        if (currentTab === 'core') {
            renderItems = allVault.filter(v => v.isCore);
        } else if (currentTab === 'wechat') {
            renderItems = allVault.filter(v => !v.isCore && v.source === '线上微信');
        } else if (currentTab === 'novel') {
            renderItems = allVault.filter(v => !v.isCore && v.source === '线下故事');
        }

        if (renderItems.length === 0) {
            contentArea.innerHTML = `<div style="text-align:center; color:var(--text-sub); padding: 50px 0;">空空如也，快去创造回忆吧！</div>`;
            return;
        }

        let html = '<div class="vine-container">';
        [...renderItems].reverse().forEach(item => {
            const isCore = item.isCore;
            const nodeClass = isCore ? 'vine-node core' : 'vine-node';
            const iconHtml = isCore ? '<i class="ph-fill ph-star"></i>' : '<i class="ph-fill ph-flower-tulip"></i>';
            
            let content = item.content;
            if (window.marked) content = window.marked.parse(content);

            const leafTop = Math.random() * 80 + 10;
            const leafLeft = -25 + Math.random() * 10;
            const leafRot = Math.random() * 360;
            const leafHtml = `<i class="ph-fill ph-leaf vine-leaf" style="top:${leafTop}%; left:${leafLeft}px; transform:rotate(${leafRot}deg);"></i>`;

            html += `
                <div class="vine-item">
                    <div class="${nodeClass}">${iconHtml}</div>
                    ${leafHtml}
                    <div class="vine-content">
                        <div class="vine-header">
                            <span style="font-weight:bold; color:var(--primary-color);">${item.date}</span>
                            <span>${item.time}</span>
                        </div>
                        <div class="vine-text">${content}</div>
                        <div class="vine-actions">
                            <div class="vine-btn core-btn" onclick="window.PhoneAPI.toggleCoreMemory('${item.id}')">
                                ${isCore ? '<i class="ph-fill ph-star"></i>' : '<i class="ph ph-star"></i>'}
                            </div>
                            <div class="vine-btn edit" onclick="window.PhoneAPI.editMemoryVault('${item.id}')">
                                <i class="ph ph-pencil-simple"></i>
                            </div>
                            <div class="vine-btn del" onclick="window.PhoneAPI.deleteFromMemoryVault('${item.id}')">
                                <i class="ph ph-trash"></i>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        contentArea.innerHTML = html;
    },

    unlockDiary() {
        const cover = document.getElementById('diary-book-cover');
        const coverView = document.getElementById('diary-cover-view');
        const insideView = document.getElementById('diary-inside-view');
        
        if (cover && coverView && insideView) {
            cover.classList.add('opened');
            coverView.classList.add('opened');
            insideView.classList.add('opened');
        }
    },

    renderNovelContent() {
        const roleId = window.Config.currentContactId;
        const allItems = window.Config.phoneData[roleId]?.novel?.items || [];
        const items = allItems.slice(-50);
        
        const listEl = document.getElementById('novel-content-list');
        if (!listEl) return;

        const myName = localStorage.getItem('my_name') || '我';
        const charName = localStorage.getItem('char_name') || 'TA';
        const avatarMe = localStorage.getItem('my_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=Me&backgroundColor=e8f0fa';
        const avatarOther = localStorage.getItem('ta_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=You&backgroundColor=dbe9f6';

        let html = '';
        items.forEach((item, index) => {
            if (item.sender === 'typing') {
                html += `<div style="text-align:center; padding: 20px; color: var(--primary-color);"><i class="ph ph-spinner spin-anim" style="font-size: 24px;"></i></div>`;
                return;
            }

            const isMe = item.sender === 'me';
            const avatar = isMe ? avatarMe : avatarOther;
            const name = isMe ? myName : charName;
            
            let content = item.content;
            if (!content || content.trim() === '') {
                content = '<span style="color:var(--danger-color); font-size:12px; font-style:italic;">[内容为空，请点击此处删除或重骰]</span>';
            } else if (window.marked) {
                content = window.marked.parse(content);
            }

            const realIndex = allItems.length - items.length + index;
            const avatarHtml = isMe ? `<img src="${avatar}" class="story-avatar">` : `<img src="${avatar}" class="story-avatar" onclick="window.PhoneUI.showThought(${realIndex}, 'novel')">`;

            html += `
                <div class="story-card">
                    <div class="story-header">${avatarHtml}<div class="story-name">${name}</div><div class="story-time">${item.time || '12:00 PM'}</div></div>
                    <div class="story-content markdown-body" onclick="window.PhoneEngine.openMsgMenu(${realIndex}, '${item.sender}')">${content}</div>
                </div>
            `;
        });
        listEl.innerHTML = html;
        setTimeout(() => { const scrollContainer = document.getElementById('app-window-content'); if(scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight; }, 100);
    },

    showThought(index) {
        const roleId = window.Config?.currentContactId;
        const targetApp = window.Config.currentAppId === 'novel' ? 'novel' : 'wechat';
        
        const realIndex = window.PhoneEngine.getRealIndex(targetApp, index);
        const item = window.Config.phoneData[roleId]?.[targetApp]?.items[realIndex];
        if(!item) return;
        
        let thought = item.innerThought;
        if (thought && thought.includes('连发消息')) {
            for (let i = realIndex - 1; i >= 0; i--) {
                const prevItem = window.Config.phoneData[roleId][targetApp].items[i];
                if (prevItem.sender === 'other' && prevItem.time === item.time && prevItem.innerThought && !prevItem.innerThought.includes('连发消息')) {
                    thought = prevItem.innerThought;
                    break;
                }
            }
        }
        
        document.getElementById('thought-content').innerText = thought || "（TA的心思藏得很深，什么也没看出来...）";
        document.getElementById('thought-bg').classList.add('show');
        document.getElementById('thought-modal').classList.add('show');
    },

    closeThought() { document.getElementById('thought-bg').classList.remove('show'); document.getElementById('thought-modal').classList.remove('show'); },
    openWbModal() { document.getElementById('wb-modal-bg').classList.add('show'); document.getElementById('wb-modal').classList.add('show'); },
    closeWbModal() { document.getElementById('wb-modal-bg').classList.remove('show'); document.getElementById('wb-modal').classList.remove('show'); },
    
    renderArchiveList() {
        const archives = window.PhoneAPI.getArchives();
        const listEl = document.getElementById('archive-list');
        if (!listEl) return;
        if (archives.length === 0) { listEl.innerHTML = '<div style="text-align:center; color:var(--text-sub); padding: 20px 0;">暂无存档</div>'; return; }
        
        let html = '';
        [...archives].reverse().forEach(arc => {
            html += `
                <div class="archive-item">
                    <div class="archive-info"><div class="archive-name">${arc.name}</div><div class="archive-meta">${arc.date} · 共 ${arc.count} 条记录</div></div>
                    <div class="archive-actions"><button class="archive-btn load" onclick="window.PhoneAPI.loadArchive('${arc.id}')">读取</button><button class="archive-btn del" onclick="window.PhoneAPI.deleteArchive('${arc.id}')"><i class="ph ph-trash"></i></button></div>
                </div>
            `;
        });
        listEl.innerHTML = html;
    },
    openArchiveModal() { this.renderArchiveList(); document.getElementById('archive-modal-bg').classList.add('show'); document.getElementById('archive-modal').classList.add('show'); },
    closeArchiveModal() { document.getElementById('archive-modal-bg').classList.remove('show'); document.getElementById('archive-modal').classList.remove('show'); },

    renderDiaryPage() {
        const contentAreaEl = document.getElementById('diary-content-area');
        if (!contentAreaEl) return;

        const currentIndex = window.Config.diaryPageIndex;

        if (currentIndex === -1) {
            const quote = localStorage.getItem('diary_quote') || '“时间会磨平一切痕迹，\n除了我为你写下的字。”';
            const formattedQuote = quote.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
            
            contentAreaEl.innerHTML = `
                <div class="notebook-empty">
                    <i class="ph-fill ph-feather" style="font-size: 48px; color: rgba(0,0,0,0.3); margin-bottom: 30px;"></i>
                    <div style="font-family: 'Long Cang', 'Kaiti', 'STKaiti', cursive; font-size: 32px; color: rgba(0,0,0,0.6); text-shadow: 1px 1px 2px rgba(255,255,255,0.5); line-height: 1.8;">
                        ${formattedQuote}
                    </div>
                </div>
            `;
            return;
        }

        const startDateStr = localStorage.getItem('diary_start_date');
        let startDate;
        if (startDateStr) {
            const parts = startDateStr.split('-');
            startDate = new Date(parts[0], parts[1]-1, parts[2]);
        } else {
            startDate = new Date();
        }

        const targetDate = new Date(startDate);
        targetDate.setDate(startDate.getDate() + currentIndex);

        const y = targetDate.getFullYear();
        const m = String(targetDate.getMonth() + 1).padStart(2, '0');
        const d = String(targetDate.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;

        const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        const weekStr = '星期' + weekDays[targetDate.getDay()];
        const displayDate = `${y}年${m}月${d}日`;

        const diaries = window.PhoneAPI.getDiaries();
        const content = diaries[dateStr];

        let html = `
            <div class="notebook-header">
                <div class="notebook-date-wrap">
                    <span class="notebook-date">${displayDate}</span>
                    <span class="notebook-week">${weekStr}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    ${content ? `<i class="ph ph-arrows-clockwise" onclick="if(confirm('确定要撕掉这页日记重新写吗？')) window.PhoneEngine.generateDiary('${dateStr}')" style="font-size: 20px; color: var(--text-sub); cursor: pointer; transition: 0.2s;" onactive="this.style.transform='scale(0.8)'"></i>` : ''}
                    <div class="notebook-mood">☁️</div>
                </div>
            </div>
        `;

        if (content) {
            let parsedContent = window.marked ? window.marked.parse(content) : content;
            html += `<div class="notebook-content">${parsedContent}</div>`;
        } else {
            html += `
                <div class="notebook-empty">
                    <p style="margin-bottom: 20px;">这一页还是空白的...</p>
                    <button class="btn-refresh" onclick="window.PhoneEngine.generateDiary('${dateStr}')" style="width: auto; padding: 10px 20px; background: rgba(0,0,0,0.6); border-radius: 8px; font-family: sans-serif; font-size: 14px;"><i class="ph-fill ph-magic-wand"></i> 偷偷写日记</button>
                </div>
            `;
        }

        contentAreaEl.innerHTML = html;
    },

    turnDiaryPage(direction) {
        let newIndex = window.Config.diaryPageIndex + direction;
        if (newIndex < -1) newIndex = -1;
        window.Config.diaryPageIndex = newIndex;
        this.renderDiaryPage();
    },

    initStarrySea() {
        const bgEl = document.getElementById('starry-sea-bg');
        const bubblesEl = document.getElementById('floating-bubbles');
        const fragmentsContainer = document.getElementById('memory-fragments-container');
        
        if (!bgEl || !bubblesEl || !fragmentsContainer) return;

        setTimeout(() => {
            bgEl.classList.add('show');
            bubblesEl.classList.add('show');
        }, 100);

        let starsHtml = '';
        for (let i = 0; i < 50; i++) {
            const size = Math.random() * 3 + 1;
            const top = Math.random() * 100;
            const left = Math.random() * 100;
            const delay = Math.random() * 5;
            const duration = Math.random() * 3 + 2;
            starsHtml += `<div class="star" style="width:${size}px; height:${size}px; top:${top}%; left:${left}%; animation-delay:${delay}s; animation-duration:${duration}s;"></div>`;
        }
        bgEl.innerHTML = starsHtml;

        const validMemories = window.PhoneAPI.getFavorites();
        fragmentsContainer.innerHTML = ''; 
        
        if (validMemories.length === 0) {
            const frag = document.createElement('div');
            frag.className = 'memory-fragment';
            frag.style.cssText = `top:50%; left:50%; animation-delay:0s;`;
            frag.onclick = () => this.openBlindBox("星海空空如也...快去聊天记录里长按消息，点击【手动摘录】或【AI提炼】来收集星星吧！", "系统提示", "星海", "me");
            fragmentsContainer.appendChild(frag);
        } else {
            const shuffled = validMemories.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 12);
            
            selected.forEach((mem, index) => {
                const top = 15 + Math.random() * 65; 
                const left = 10 + Math.random() * 80;
                const delay = Math.random() * 2;
                
                const safeContent = mem.content.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
                
                const frag = document.createElement('div');
                frag.className = 'memory-fragment';
                frag.style.cssText = `top:${top}%; left:${left}%; animation-delay:${delay}s;`;
                frag.onclick = () => this.openBlindBox(safeContent, mem.time, mem.source, mem.sender);
                
                fragmentsContainer.appendChild(frag);
            });
        }
    },

    openBlindBox(content, time, source, sender) {
        const modal = document.getElementById('blindbox-modal');
        const bg = document.getElementById('blindbox-bg');
        const textEl = document.getElementById('blindbox-text');
        const metaEl = document.getElementById('blindbox-meta');
        
        if (!modal || !bg) return;

        const myName = localStorage.getItem('my_name') || '我';
        const charName = localStorage.getItem('char_name') || 'TA';
        const senderName = sender === 'me' ? myName : charName;

        let parsed = window.marked ? window.marked.parse(content) : content;
        
        textEl.innerHTML = `“${parsed}”`;
        metaEl.innerHTML = `${time || '某时'} · ${source} · ${senderName}`;
        
        bg.classList.add('show');
        modal.classList.add('show');
    },

    closeBlindBox() {
        document.getElementById('blindbox-bg').classList.remove('show');
        document.getElementById('blindbox-modal').classList.remove('show');
    }
};
