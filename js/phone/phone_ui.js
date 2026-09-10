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
        const items = window.Config.phoneData[roleId]?.wechat?.items || [];
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
            if (window.marked) content = window.marked.parse(content);

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
        
        // 🌟 核心修复：滚动条是在 app-window-content 上的，让它滚动到底部！
        setTimeout(() => { 
            const scrollContainer = document.getElementById('app-window-content');
            if(scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight; 
        }, 100);
    },

    showThought(index) {
        const roleId = window.Config?.currentContactId;
        const item = window.Config.phoneData[roleId]?.wechat?.items[index];
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
    }
};
