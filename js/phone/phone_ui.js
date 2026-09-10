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

    openApp(appId, appName) {
        const titleEl = document.getElementById('app-window-title');
        const winEl = document.getElementById('app-window');
        const contentEl = document.getElementById('app-window-content');
        const footerEl = document.getElementById('app-window-footer');
        
        if(!titleEl || !winEl || !contentEl || !footerEl) return;

        titleEl.innerText = appName;
        winEl.classList.add('open');
        
        // 重置样式
        contentEl.style.padding = '20px';
        contentEl.style.background = '#f4f5f7';
        footerEl.innerHTML = ''; 
        
        if (appId === 'novel') {
            // 🌟 核心：注入小说模式的 UI
            contentEl.style.padding = '0';
            contentEl.style.background = '#e8ecef';
            contentEl.innerHTML = `<div id="novel-content-list" class="novel-bg"></div>`;
            
            // 注入底部的剧本输入框
            footerEl.innerHTML = `
                <div class="novel-input-bar">
                    <div class="icon-btn"><i class="ph ph-plus"></i></div>
                    <textarea id="novel-input" class="novel-textarea" placeholder="DRAFT YOUR RESPONSE...&#10;[ENTER 换行]"></textarea>
                    <button class="novel-send-btn" onclick="window.PhoneEngine.sendNovelMessage()">SEND</button>
                </div>
            `;
            this.renderNovelContent();

        } else if (appId === 'wallet') {
            contentEl.innerHTML = `
                <div class="card" style="background: linear-gradient(135deg, #6b8bbd, #4a70a8); color: white; text-align: center; padding: 30px 20px;">
                    <div style="font-size: 14px; opacity: 0.8;">当前余额 (信用点)</div>
                    <div style="font-size: 36px; font-weight: bold; margin-top: 10px;">8,500.00</div>
                </div>
                <h3 style="margin: 20px 0 10px 5px; color: #555; font-size: 15px;">近期账单</h3>
                <div class="card" style="padding: 0;">
                    <div style="padding: 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
                        <div><b>便利店买香蕉</b><br><span style="font-size:12px; color:#999;">今天 08:30</span></div>
                        <div style="color: #ff4d4f; font-weight: bold;">-25.00</div>
                    </div>
                </div>
            `;
        } else if (appId === 'roulette') {
            contentEl.innerHTML = `
                <div style="text-align: center; margin-top: 10px;">
                    <div style="width: 120px; height: 120px; border-radius: 50%; border: 6px solid #ffb703; margin: 0 auto; display: flex; align-items: center; justify-content: center; background: #fff; box-shadow: 0 10px 30px rgba(255,183,3,0.2);">
                        <i id="roulette-icon" class="ph-fill ph-aperture" style="font-size: 60px; color: #ffb703;"></i>
                    </div>
                    <h2 style="margin-top: 15px; color: #333; font-size: 18px;">AI 恋爱军师</h2>
                    <p style="color: #999; margin-top: 5px; font-size: 12px;">根据上下文，为你提供 3 种不同风格的回复</p>
                    <div id="roulette-result" style="margin-top: 20px; min-height: 80px; display: flex; flex-direction: column; gap: 10px;"></div>
                    <button id="roulette-btn" class="btn-refresh" onclick="window.PhoneEngine.rollTopic()" style="background: #ffb703; margin-top: 20px; width: 100%;"><i class="ph-fill ph-play"></i> 开始抽取</button>
                </div>
            `;
        } else {
            contentEl.innerHTML = `
                <div style="text-align:center; margin-top:100px; color:#999;">
                    <i class="ph-fill ph-hammer" style="font-size:64px; color: #dbe9f6; margin-bottom:15px;"></i>
                    <h3>界面排版中...</h3>
                    <p style="font-size: 12px; margin-top: 10px;">功能骨架已搭建，即将注入灵魂</p>
                </div>
            `;
        }
    },

    closeApp() {
        const winEl = document.getElementById('app-window');
        if(winEl) winEl.classList.remove('open');
    },

    // 🌟 新增：渲染小说卡片
    renderNovelContent() {
        const roleId = window.Config.currentContactId;
        if (!window.Config.phoneData[roleId].novel) window.Config.phoneData[roleId].novel = { items: [] };
        const items = window.Config.phoneData[roleId].novel.items;
        const listEl = document.getElementById('novel-content-list');
        if (!listEl) return;

        const myName = localStorage.getItem('my_name') || '我';
        const charName = localStorage.getItem('char_name') || 'TA';
        const avatarMe = localStorage.getItem('my_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=Me&backgroundColor=e8f0fa';
        const avatarOther = localStorage.getItem('ta_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=You&backgroundColor=dbe9f6';

        let html = '';
        items.forEach((item, index) => {
            const isMe = item.sender === 'me';
            const avatar = isMe ? avatarMe : avatarOther;
            const name = isMe ? myName : charName;
            
            let content = item.content;
            if (window.marked) content = window.marked.parse(content);

            // 如果是 AI 发的，点击头像可以看心声
            const avatarHtml = isMe ? `<img src="${avatar}" class="novel-avatar">` 
                                    : `<img src="${avatar}" class="novel-avatar" onclick="window.PhoneUI.showThought(${index}, 'novel')">`;

            html += `
                <div class="novel-card">
                    <div class="novel-left">
                        ${avatarHtml}
                        <div class="novel-meta-line"></div>
                        <div class="novel-meta-text">[FLR] ${index + 1}</div>
                    </div>
                    <div class="novel-right">
                        <div class="novel-header">
                            <span class="novel-name">${name}</span>
                            <span class="novel-time">${item.time || '12:00 PM'}</span>
                        </div>
                        <div class="novel-content markdown-body">${content}</div>
                    </div>
                </div>
            `;
        });
        listEl.innerHTML = html;
        setTimeout(() => { listEl.scrollTop = listEl.scrollHeight; }, 100);
    },

    showThought(index, appType = 'wechat') {
        const roleId = window.Config?.currentContactId;
        const item = window.Config.phoneData[roleId]?.[appType]?.items[index];
        if(!item) return;
        
        const thought = item.innerThought || "（那时候TA的心思藏得很深，什么也没看出来...）";
        
        document.getElementById('thought-content').innerText = thought;
        document.getElementById('thought-bg').classList.add('show');
        document.getElementById('thought-modal').classList.add('show');
    },

    closeThought() {
        document.getElementById('thought-bg').classList.remove('show');
        document.getElementById('thought-modal').classList.remove('show');
    }
};
