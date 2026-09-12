export const PhoneUI = {
    renderAppContent(appId) {
        const roleId = window.Config?.currentContactId;
        if(!roleId) return;
        
        let data = window.Config.phoneData[roleId]?.[appId];
        if (data && data.items && data.items.length > 50) {
            data = { ...data, items: data.items.slice(-50) };
        }

        const listEl = document.getElementById('app-content-list');
        if (listEl && window.Apps && window.Apps[appId]) {
            listEl.innerHTML = window.Apps[appId].renderList(data);
            setTimeout(() => { listEl.scrollTop = listEl.scrollHeight; }, 100);
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
    toggleStoryMenu() {
        const menu = document.getElementById('story-plus-menu'); const btn = document.getElementById('btn-story-plus');
        if (!menu || !btn) return; 
        if (menu.classList.contains('show')) { this.closeStoryMenu(); } else { menu.classList.add('show'); btn.style.transform = 'rotate(45deg)'; }
    },
    closeStoryMenu() {
        const menu = document.getElementById('story-plus-menu'); const btn = document.getElementById('btn-story-plus');
        if (menu) menu.classList.remove('show'); if (btn) btn.style.transform = 'rotate(0deg)';
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
        contentEl.style.padding = '20px'; contentEl.style.background = 'transparent'; footerEl.innerHTML = ''; 
        
        if (appId === 'novel') {
            contentEl.style.padding = '0';
            contentEl.innerHTML = `<div id="novel-content-list" class="story-bg" onclick="window.PhoneUI.closeStoryMenu()"></div>`;
            footerEl.innerHTML = `
                <div id="story-plus-menu" class="story-menu">
                    <div class="story-menu-item" onclick="window.PhoneUI.openArchiveModal(); window.PhoneUI.closeStoryMenu();"><div class="icon"><i class="ph-fill ph-floppy-disk"></i></div><div class="text">存档室</div></div>
                    <div class="story-menu-item" onclick="alert('掷骰子功能开发中！'); window.PhoneUI.closeStoryMenu();"><div class="icon"><i class="ph-fill ph-dice-five"></i></div><div class="text">掷骰子</div></div>
                </div>
                <div class="story-input-bar">
                    <div class="icon-btn" id="btn-story-plus" onclick="window.PhoneUI.toggleStoryMenu()"><i class="ph ph-plus-circle"></i></div>
                    <textarea id="novel-input" class="story-textarea" placeholder="书写你们的故事..." onclick="window.PhoneUI.closeStoryMenu()"></textarea>
                    <button class="story-send-btn" onclick="window.PhoneEngine.sendNovelMessage(); window.PhoneUI.closeStoryMenu();"><i class="ph-fill ph-paper-plane-right"></i></button>
                </div>
            `;
            this.renderNovelContent();

        } else if (appId === 'diary') {
            // 🌟 核心升级：渲染 3D 日记本封面和内部结构
            contentEl.style.padding = '0';
            contentEl.innerHTML = `
                <div id="diary-cover-view" class="diary-cover-view" onclick="window.PhoneUI.unlockDiary()">
                    <div class="diary-book-cover" id="diary-book-cover">
                        <div class="diary-title">His Diary</div>
                        <div class="diary-hint">点击翻开日记</div>
                    </div>
                </div>
                <div id="diary-inside-view" class="diary-inside-view">
                    <div class="date-scroll-container" id="diary-date-list"></div>
                    <div class="diary-paper" id="diary-content-area"></div>
                </div>
            `;
            this.renderDiaryPage();

        } else if (appId === 'memory_vault') {
            const combinedItems = window.PhoneAPI.getCombinedMemory();
            const myName = localStorage.getItem('my_name') || '我';
            const charName = localStorage.getItem('char_name') || 'TA';
            
            let html = '<div class="timeline-container">';
            if (combinedItems.length === 0) {
                html += '<div style="text-align:center; color:var(--text-sub); padding: 50px 0;">空空如也，快去创造回忆吧！</div>';
            } else {
                const renderItems = combinedItems.slice(-50);
                renderItems.forEach(item => {
                    if (item.sender === 'typing') return;
                    const isWechat = item.source === 'wechat';
                    const iconClass = isWechat ? 'wechat' : 'novel';
                    const iconHtml = isWechat ? '<i class="ph-fill ph-chat-circle-dots"></i>' : '<i class="ph-fill ph-book-open"></i>';
                    const sourceName = isWechat ? '线上微信' : '线下故事';
                    const senderName = item.sender === 'me' ? myName : charName;
                    let content = item.content;
                    if (window.marked) content = window.marked.parse(content);

                    html += `
                        <div class="timeline-item">
                            <div class="timeline-icon ${iconClass}">${iconHtml}</div>
                            <div class="timeline-content">
                                <div class="timeline-header"><span style="font-weight:bold; color:var(--primary-color);">${senderName}</span><span>${item.time || ''} · ${sourceName}</span></div>
                                <div class="timeline-text markdown-body">${content}</div>
                            </div>
                        </div>
                    `;
                });
            }
            html += '</div>';
            contentEl.innerHTML = html;
            setTimeout(() => { contentEl.scrollTop = contentEl.scrollHeight; }, 100);

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

        } else if (appId === 'settings') {
            contentEl.innerHTML = `
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
                    <!-- 🌟 新增：日记封面输入框 -->
                    <div style="margin-bottom: 15px;">
                        <label style="font-size: 11px; color: var(--text-sub);">日记本封面(网址) - 推荐使用你上传到GitHub的图片</label>
                        <input type="text" id="bg-diary-cover" placeholder="例如: ./cover.jpg" oninput="window.PhoneAPI.autoSave()" style="width: 100%; padding: 8px; border-radius: 8px; margin-top: 4px;">
                    </div>

                    <div class="engine-title"><i class="ph-fill ph-squares-four"></i> 主页 App 图标替换 (留空为默认)</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 5px;">
                        <div><label style="font-size: 11px; color: var(--text-sub);">线下故事</label><input type="text" id="ui-icon-novel" oninput="window.PhoneAPI.autoSave()" style="width: 100%; padding: 8px; border-radius: 8px; margin-top: 4px;"></div>
                        <div><label style="font-size: 11px; color: var(--text-sub);">世界书</label><input type="text" id="ui-icon-worldbook" oninput="window.PhoneAPI.autoSave()" style="width: 100%; padding: 8px; border-radius: 8px; margin-top: 4px;"></div>
                        <div><label style="font-size: 11px; color: var(--text-sub);">系统设置</label><input type="text" id="ui-icon-settings" oninput="window.PhoneAPI.autoSave()" style="width: 100%; padding: 8px; border-radius: 8px; margin-top: 4px;"></div>
                        <div><label style="font-size: 11px; color: var(--text-sub);">相册</label><input type="text" id="ui-icon-gallery" oninput="window.PhoneAPI.autoSave()" style="width: 100%; padding: 8px; border-radius: 8px; margin-top: 4px;"></div>
                        <div><label style="font-size: 11px; color: var(--text-sub);">商店</label><input type="text" id="ui-icon-shop" oninput="window.PhoneAPI.autoSave()" style="width: 100%; padding: 8px; border-radius: 8px; margin-top: 4px;"></div>
                        <div><label style="font-size: 11px; color: var(--text-sub);">打工赚钱</label><input type="text" id="ui-icon-task" oninput="window.PhoneAPI.autoSave()" style="width: 100%; padding: 8px; border-radius: 8px; margin-top: 4px;"></div>
                    </div>
                </div>

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
                    <div style="margin-bottom: 5px; display: flex; align-items: center; justify-content: space-between; background: var(--icon-bg); padding: 10px; border-radius: 8px;">
                        <label style="font-size: 13px; color: var(--text-main); font-weight: bold;"><i class="ph ph-arrows-merge"></i> 开启线上/线下记忆互通</label><input type="checkbox" id="share-memory" onchange="window.PhoneAPI.autoSave()" style="width: 18px; height: 18px;">
                    </div>
                </div>

                <div class="card">
                    <h3 style="color: var(--primary-color); margin-bottom: 10px;"><i class="ph-fill ph-database"></i> API 预设库</h3>
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
                    <div class="engine-title"><i class="ph-fill ph-lightning"></i> 副引擎 (转盘/工具专用)</div>
                    <select id="sub-engine-select" onchange="window.PhoneAPI.assignEngine('sub', this.value)" style="width: 100%; padding: 8px; border-radius: 8px;">
                        <option value="">-- 同主引擎 (自动降级) --</option>
                    </select>
                </div>

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
            `;
            
            setTimeout(() => {
                window.PhoneAPI.loadSettings();
                window.PhoneAPI.refreshPresetDropdowns();
                window.PhoneAPI.refreshPromptDropdowns();
                window.PhoneAPI.refreshUIDropdowns();
            }, 50);

        } else if (appId === 'worldbook') {
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
        } else {
            contentEl.innerHTML = `<div style="text-align:center; margin-top:100px; color:var(--text-sub);"><i class="ph-fill ph-hammer" style="font-size:64px; color: var(--primary-color); margin-bottom:15px;"></i><h3>界面排版中...</h3><p style="font-size: 12px; margin-top: 10px;">功能骨架已搭建，即将注入灵魂</p></div>`;
        }
    },

    closeApp() {
        const winEl = document.getElementById('app-window');
        if(winEl) winEl.classList.remove('open');
        window.Config.currentAppId = 'wechat';
    },

    // 🌟 核心：触发 3D 翻开日记本动画！
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
        const item = window.Config.phoneData[roleId]?.[targetApp]?.items[index];
        if(!item) return;
        document.getElementById('thought-content').innerText = item.innerThought || "（那时候TA的心思藏得很深，什么也没看出来...）";
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
        const dateListEl = document.getElementById('diary-date-list');
        const contentAreaEl = document.getElementById('diary-content-area');
        if (!dateListEl || !contentAreaEl) return;

        let dateHtml = '';
        const today = new Date();
        const dates = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today); d.setDate(today.getDate() - i); dates.push(d);
        }

        const selectedDateStr = window.Config.currentDiaryDate || dates[dates.length - 1].toISOString().split('T')[0];

        dates.forEach(d => {
            const dStr = d.toISOString().split('T')[0];
            const isActive = dStr === selectedDateStr ? 'active' : '';
            dateHtml += `<div class="date-bubble ${isActive}" onclick="window.PhoneUI.selectDiaryDate('${dStr}')"><div class="month">${d.getMonth() + 1}月</div><div class="day">${d.getDate()}</div></div>`;
        });
        dateListEl.innerHTML = dateHtml;

        const diaries = window.PhoneAPI.getDiaries();
        const content = diaries[selectedDateStr];

        if (content) {
            let parsedContent = window.marked ? window.marked.parse(content) : content;
            contentAreaEl.innerHTML = `<div class="diary-content markdown-body">${parsedContent}</div>`;
        } else {
            const isToday = selectedDateStr === today.toISOString().split('T')[0];
            if (isToday) {
                contentAreaEl.innerHTML = `
                    <div class="diary-empty">
                        <i class="ph-fill ph-lock-key" style="font-size: 48px; color: var(--border-color); margin-bottom: 15px;"></i>
                        <p style="margin-bottom: 20px;">他今天还没写日记...</p>
                        <button class="btn-refresh" onclick="window.PhoneEngine.generateDiary('${selectedDateStr}')" style="width: auto; padding: 10px 20px; background: var(--primary-color);"><i class="ph-fill ph-magic-wand"></i> 偷偷生成今日日记</button>
                    </div>
                `;
            } else {
                contentAreaEl.innerHTML = `<div class="diary-empty"><i class="ph-fill ph-wind" style="font-size: 48px; color: var(--border-color); margin-bottom: 15px;"></i><p>这一天，他什么也没留下。</p></div>`;
            }
        }
    },

    selectDiaryDate(dateStr) { window.Config.currentDiaryDate = dateStr; this.renderDiaryPage(); },

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
