export const PhoneUI = {
    renderAppContent(appId) {
        const roleId = window.Config?.currentContactId;
        if(!roleId) return;
        
        const data = window.Config.phoneData[roleId]?.[appId];
        const listEl = document.getElementById('app-content-list');
        
        if (listEl && window.Apps && window.Apps[appId]) {
            listEl.innerHTML = window.Apps[appId].renderList(data);
            setTimeout(() => {
                listEl.scrollTop = listEl.scrollHeight;
            }, 100);
        }
    },

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const icon = document.getElementById('theme-icon');
        if (icon) {
            if (newTheme === 'dark') {
                icon.classList.remove('ph-moon');
                icon.classList.add('ph-sun');
            } else {
                icon.classList.remove('ph-sun');
                icon.classList.add('ph-moon');
            }
        }
    },

    toggleChatMenu() {
        const menu = document.getElementById('chat-plus-menu');
        const btn = document.getElementById('btn-plus');
        if (!menu || !btn) return; 

        if (menu.classList.contains('show')) {
            this.closeChatMenu();
        } else {
            menu.classList.add('show');
            btn.style.transform = 'rotate(45deg)'; 
        }
    },

    closeChatMenu() {
        const menu = document.getElementById('chat-plus-menu');
        const btn = document.getElementById('btn-plus');
        if (menu) menu.classList.remove('show');
        if (btn) btn.style.transform = 'rotate(0deg)';
    },

    toggleStoryMenu() {
        const menu = document.getElementById('story-plus-menu');
        const btn = document.getElementById('btn-story-plus');
        if (!menu || !btn) return; 

        if (menu.classList.contains('show')) {
            this.closeStoryMenu();
        } else {
            menu.classList.add('show');
            btn.style.transform = 'rotate(45deg)'; 
        }
    },

    closeStoryMenu() {
        const menu = document.getElementById('story-plus-menu');
        const btn = document.getElementById('btn-story-plus');
        if (menu) menu.classList.remove('show');
        if (btn) btn.style.transform = 'rotate(0deg)';
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
        
        if (appId === 'novel') {
            contentEl.style.padding = '0';
            contentEl.innerHTML = `
                <div id="novel-content-list" class="story-bg" onclick="window.PhoneUI.closeStoryMenu()"></div>
            `;
            
            footerEl.innerHTML = `
                <div id="story-plus-menu" class="story-menu">
                    <div class="story-menu-item" onclick="window.PhoneUI.openArchiveModal(); window.PhoneUI.closeStoryMenu();">
                        <div class="icon"><i class="ph-fill ph-floppy-disk"></i></div>
                        <div class="text">存档室</div>
                    </div>
                    <div class="story-menu-item" onclick="alert('掷骰子功能开发中！'); window.PhoneUI.closeStoryMenu();">
                        <div class="icon"><i class="ph-fill ph-dice-five"></i></div>
                        <div class="text">掷骰子</div>
                    </div>
                </div>
                <div class="story-input-bar">
                    <div class="icon-btn" id="btn-story-plus" onclick="window.PhoneUI.toggleStoryMenu()"><i class="ph ph-plus-circle"></i></div>
                    <textarea id="novel-input" class="story-textarea" placeholder="书写你们的故事..." onclick="window.PhoneUI.closeStoryMenu()"></textarea>
                    <button class="story-send-btn" onclick="window.PhoneEngine.sendNovelMessage(); window.PhoneUI.closeStoryMenu();"><i class="ph-fill ph-paper-plane-right"></i></button>
                </div>
            `;
            this.renderNovelContent();

        } else if (appId === 'settings') {
            // 🌟 核心升级：独立的系统设置 App
            contentEl.innerHTML = `
                <div class="card">
                    <h3 style="color: var(--primary-color); margin-bottom: 15px;"><i class="ph-fill ph-user-list"></i> 基础设定</h3>
                    <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                        <div style="flex: 1;">
                            <label style="font-size: 12px; color: var(--text-sub);">我的名字</label>
                            <input type="text" id="my-name" placeholder="例如: 小棋" oninput="window.PhoneAPI.autoSave()" style="width: 100%; padding: 8px; border-radius: 8px; margin-top: 4px;">
                        </div>
                        <div style="flex: 1;">
                            <label style="font-size: 12px; color: var(--text-sub);">TA的名字</label>
                            <input type="text" id="char-name" placeholder="例如: 小克" oninput="window.PhoneAPI.autoSave()" style="width: 100%; padding: 8px; border-radius: 8px; margin-top: 4px;">
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px; margin-bottom: 5px;">
                        <div style="flex: 1;">
                            <label style="font-size: 12px; color: var(--text-sub);">我的头像(网址)</label>
                            <input type="text" id="my-avatar" placeholder="http..." oninput="window.PhoneAPI.autoSave()" style="width: 100%; padding: 8px; border-radius: 8px; margin-top: 4px;">
                        </div>
                        <div style="flex: 1;">
                            <label style="font-size: 12px; color: var(--text-sub);">TA的头像(网址)</label>
                            <input type="text" id="ta-avatar" placeholder="http..." oninput="window.PhoneAPI.autoSave()" style="width: 100%; padding: 8px; border-radius: 8px; margin-top: 4px;">
                        </div>
                    </div>
                </div>

                <div class="card">
                    <h3 style="color: var(--primary-color); margin-bottom: 10px;"><i class="ph-fill ph-scroll"></i> 提示词与人设 (预设库)</h3>
                    <div class="preset-bar">
                        <select id="prompt-preset-select" onchange="window.PhoneAPI.loadPromptPreset()"></select>
                        <button class="preset-btn" onclick="window.PhoneAPI.savePromptPreset()">存为预设</button>
                        <button class="preset-btn del" onclick="window.PhoneAPI.deletePromptPreset()">删除</button>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="font-size: 12px; color: var(--text-main); font-weight: bold;">1. 系统指令 (防八股/核心规则)</label>
                        <textarea id="system-prompt" rows="4" placeholder="例如：你是一个高情商的语C助手，必须输出<think>..." oninput="window.PhoneAPI.autoSave()" style="width: 100%; padding: 10px; border-radius: 8px; resize: vertical; font-size: 12px; line-height: 1.5; margin-top: 4px; font-family: monospace;"></textarea>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="font-size: 12px; color: var(--text-main); font-weight: bold;">2. 角色人设 (性格/背景/口吻)</label>
                        <textarea id="char-persona" rows="6" placeholder="例如：你叫不死途，是一个傲娇的老狼侦探..." oninput="window.PhoneAPI.autoSave()" style="width: 100%; padding: 10px; border-radius: 8px; resize: vertical; font-size: 12px; line-height: 1.5; margin-top: 4px; font-family: monospace;"></textarea>
                    </div>
                    <div style="margin-bottom: 5px;">
                        <label style="font-size: 12px; color: var(--text-main); font-weight: bold;">3. 线下文风 (小说模式专属要求)</label>
                        <textarea id="novel-style" rows="4" placeholder="例如：多用长句，注重环境光影渲染和微表情刻画..." oninput="window.PhoneAPI.autoSave()" style="width: 100%; padding: 10px; border-radius: 8px; resize: vertical; font-size: 12px; line-height: 1.5; margin-top: 4px; font-family: monospace;"></textarea>
                    </div>
                </div>

                <div class="card">
                    <h3 style="color: var(--primary-color); margin-bottom: 15px;"><i class="ph-fill ph-toggle-left"></i> 功能开关</h3>
                    <div style="margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; background: var(--icon-bg); padding: 10px; border-radius: 8px;">
                        <label style="font-size: 13px; color: var(--text-main); font-weight: bold;"><i class="ph ph-prohibit"></i> 绝对禁止 AI 使用 Emoji</label>
                        <input type="checkbox" id="ban-emoji" onchange="window.PhoneAPI.autoSave()" style="width: 18px; height: 18px;">
                    </div>
                    <div style="margin-bottom: 5px; display: flex; align-items: center; justify-content: space-between; background: var(--icon-bg); padding: 10px; border-radius: 8px;">
                        <label style="font-size: 13px; color: var(--text-main); font-weight: bold;"><i class="ph ph-arrows-merge"></i> 开启线上/线下记忆互通</label>
                        <input type="checkbox" id="share-memory" onchange="window.PhoneAPI.autoSave()" style="width: 18px; height: 18px;">
                    </div>
                </div>

                <div class="card">
                    <h3 style="color: var(--primary-color); margin-bottom: 10px;"><i class="ph-fill ph-database"></i> API 预设库</h3>
                    <div style="font-size: 11px; color: var(--text-sub); margin-bottom: 15px;">把你的各个中转站和模型配置存进库里，方便随时给引擎分配。</div>
                    
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
                    <h3 style="color: var(--danger-color); margin-bottom: 15px;"><i class="ph-fill ph-trash"></i> 危险操作</h3>
                    <button class="btn-refresh" onclick="window.PhoneAPI.clearChat()" style="background: var(--danger-color); margin-top: 0;"><i class="ph ph-warning-circle"></i> 清空所有聊天与小说记录</button>
                </div>
            `;
            
            // 🌟 核心：在渲染完 HTML 后，立刻把数据填进去！
            setTimeout(() => {
                window.PhoneAPI.loadSettings();
                window.PhoneAPI.refreshPresetDropdowns();
                window.PhoneAPI.refreshPromptDropdowns();
            }, 50);

        } else if (appId === 'worldbook') {
            const minWords = localStorage.getItem('novel_min_words') || '150';
            const wbData = window.PhoneAPI.getWorldbookData();
            
            let wbHtml = '';
            wbData.forEach(wb => {
                const deleteBtn = wb.isCustom ? `<div class="wb-delete-btn" onclick="window.PhoneAPI.deleteWorldbook('${wb.id}')"><i class="ph ph-trash"></i></div>` : '';
                
                wbHtml += `
                    <div class="wb-card">
                        <div class="wb-header">
                            <span class="wb-title">${wb.title}</span>
                            ${deleteBtn}
                        </div>
                        <div class="wb-content">${wb.content}</div>
                        <div class="wb-toggles">
                            <div class="wb-toggle-item">
                                <label class="switch">
                                    <input type="checkbox" ${wb.online ? 'checked' : ''} onchange="window.PhoneAPI.toggleWorldbook('${wb.id}', 'online', this.checked)">
                                    <span class="slider"></span>
                                </label>
                                线上
                            </div>
                            <div class="wb-toggle-item">
                                <label class="switch">
                                    <input type="checkbox" ${wb.offline ? 'checked' : ''} onchange="window.PhoneAPI.toggleWorldbook('${wb.id}', 'offline', this.checked)">
                                    <span class="slider"></span>
                                </label>
                                线下
                            </div>
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
            
        } else if (appId === 'wallet') {
            contentEl.innerHTML = `
                <div class="card" style="background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: white; text-align: center; padding: 30px 20px;">
                    <div style="font-size: 14px; opacity: 0.8;">当前余额 (信用点)</div>
                    <div style="font-size: 36px; font-weight: bold; margin-top: 10px;">8,500.00</div>
                </div>
                <h3 style="margin: 20px 0 10px 5px; color: var(--text-main); font-size: 15px;">近期账单</h3>
                <div class="card" style="padding: 0;">
                    <div style="padding: 15px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between;">
                        <div style="color: var(--text-main);"><b>便利店买香蕉</b><br><span style="font-size:12px; color:var(--text-sub);">今天 08:30</span></div>
                        <div style="color: var(--danger-color); font-weight: bold;">-25.00</div>
                    </div>
                </div>
            `;
        } else if (appId === 'roulette') {
            contentEl.innerHTML = `
                <div style="text-align: center; margin-top: 10px;">
                    <div style="width: 120px; height: 120px; border-radius: 50%; border: 6px solid #ffb703; margin: 0 auto; display: flex; align-items: center; justify-content: center; background: var(--icon-bg); box-shadow: 0 10px 30px rgba(255,183,3,0.2);">
                        <i id="roulette-icon" class="ph-fill ph-aperture" style="font-size: 60px; color: #ffb703;"></i>
                    </div>
                    <h2 style="margin-top: 15px; color: var(--text-main); font-size: 18px;">AI 恋爱军师</h2>
                    <p style="color: var(--text-sub); margin-top: 5px; font-size: 12px;">根据上下文，为你提供 3 种不同风格的回复</p>
                    <div id="roulette-result" style="margin-top: 20px; min-height: 80px; display: flex; flex-direction: column; gap: 10px;"></div>
                    <button id="roulette-btn" class="btn-refresh" onclick="window.PhoneEngine.rollTopic()" style="background: #ffb703; margin-top: 20px; width: 100%;"><i class="ph-fill ph-play"></i> 开始抽取</button>
                </div>
            `;
        } else {
            contentEl.innerHTML = `
                <div style="text-align:center; margin-top:100px; color:var(--text-sub);">
                    <i class="ph-fill ph-hammer" style="font-size:64px; color: var(--primary-color); margin-bottom:15px;"></i>
                    <h3>界面排版中...</h3>
                    <p style="font-size: 12px; margin-top: 10px;">功能骨架已搭建，即将注入灵魂</p>
                </div>
            `;
        }
    },

    closeApp() {
        const winEl = document.getElementById('app-window');
        if(winEl) winEl.classList.remove('open');
        window.Config.currentAppId = 'wechat';
    },

    renderNovelContent() {
        const roleId = window.Config.currentContactId;
        const items = window.Config.phoneData[roleId]?.novel?.items || [];
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

            const avatarHtml = isMe ? `<img src="${avatar}" class="story-avatar">` 
                                    : `<img src="${avatar}" class="story-avatar" onclick="window.PhoneUI.showThought(${index}, 'novel')">`;

            html += `
                <div class="story-card">
                    <div class="story-header">
                        ${avatarHtml}
                        <div class="story-name">${name}</div>
                        <div class="story-time">${item.time || '12:00 PM'}</div>
                    </div>
                    <div class="story-content markdown-body" onclick="window.PhoneEngine.openMsgMenu(${index}, '${item.sender}')">${content}</div>
                </div>
            `;
        });
        listEl.innerHTML = html;
        
        setTimeout(() => { 
            const scrollContainer = document.getElementById('app-window-content');
            if(scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight; 
        }, 100);
    },

    showThought(index) {
        const roleId = window.Config?.currentContactId;
        const targetApp = window.Config.currentAppId === 'novel' ? 'novel' : 'wechat';
        const item = window.Config.phoneData[roleId]?.[targetApp]?.items[index];
        if(!item) return;
        
        const thought = item.innerThought || "（那时候TA的心思藏得很深，什么也没看出来...）";
        
        document.getElementById('thought-content').innerText = thought;
        document.getElementById('thought-bg').classList.add('show');
        document.getElementById('thought-modal').classList.add('show');
    },

    closeThought() {
        document.getElementById('thought-bg').classList.remove('show');
        document.getElementById('thought-modal').classList.remove('show');
    },

    openWbModal() {
        document.getElementById('wb-modal-bg').classList.add('show');
        document.getElementById('wb-modal').classList.add('show');
    },

    closeWbModal() {
        document.getElementById('wb-modal-bg').classList.remove('show');
        document.getElementById('wb-modal').classList.remove('show');
    },

    renderArchiveList() {
        const archives = window.PhoneAPI.getArchives();
        const listEl = document.getElementById('archive-list');
        if (!listEl) return;
        
        if (archives.length === 0) {
            listEl.innerHTML = '<div style="text-align:center; color:var(--text-sub); padding: 20px 0;">暂无存档</div>';
            return;
        }
        
        let html = '';
        [...archives].reverse().forEach(arc => {
            html += `
                <div class="archive-item">
                    <div class="archive-info">
                        <div class="archive-name">${arc.name}</div>
                        <div class="archive-meta">${arc.date} · 共 ${arc.count} 条记录</div>
                    </div>
                    <div class="archive-actions">
                        <button class="archive-btn load" onclick="window.PhoneAPI.loadArchive('${arc.id}')">读取</button>
                        <button class="archive-btn del" onclick="window.PhoneAPI.deleteArchive('${arc.id}')"><i class="ph ph-trash"></i></button>
                    </div>
                </div>
            `;
        });
        listEl.innerHTML = html;
    },

    openArchiveModal() {
        this.renderArchiveList();
        document.getElementById('archive-modal-bg').classList.add('show');
        document.getElementById('archive-modal').classList.add('show');
    },

    closeArchiveModal() {
        document.getElementById('archive-modal-bg').classList.remove('show');
        document.getElementById('archive-modal').classList.remove('show');
    }
};
