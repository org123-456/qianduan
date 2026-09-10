export const PhoneUI = {
    renderAppContent(appId) {
        const roleId = window.Config.currentContactId;
        const data = window.Config.phoneData[roleId]?.[appId];
        const listEl = document.getElementById('app-content-list');
        if (listEl && window.Apps && window.Apps[appId]) {
            listEl.innerHTML = window.Apps[appId].renderList(data);
            setTimeout(() => {
                listEl.scrollTop = listEl.scrollHeight;
            }, 100);
        }
    },

    // 🌟 新增：切换聊天底部的 + 号菜单
    toggleChatMenu() {
        const menu = document.getElementById('chat-plus-menu');
        const btn = document.getElementById('btn-plus');
        if (menu.classList.contains('show')) {
            this.closeChatMenu();
        } else {
            menu.classList.add('show');
            btn.style.transform = 'rotate(45deg)'; // 让加号旋转变成 x
        }
    },

    // 关闭聊天菜单
    closeChatMenu() {
        const menu = document.getElementById('chat-plus-menu');
        const btn = document.getElementById('btn-plus');
        if (menu) menu.classList.remove('show');
        if (btn) btn.style.transform = 'rotate(0deg)';
    },

    openApp(appId, appName) {
        document.getElementById('app-window-title').innerText = appName;
        document.getElementById('app-window').classList.add('open');
        const contentEl = document.getElementById('app-window-content');
        
        if (appId === 'wallet') {
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
                    <div style="padding: 15px; display: flex; justify-content: space-between;">
                        <div><b>完成委托尾款</b><br><span style="font-size:12px; color:#999;">昨天 18:00</span></div>
                        <div style="color: #2a9d8f; font-weight: bold;">+5,000.00</div>
                    </div>
                </div>
            `;
        } else if (appId === 'roulette') {
            contentEl.innerHTML = `
                <div style="text-align: center; margin-top: 40px;">
                    <div style="width: 200px; height: 200px; border-radius: 50%; border: 10px solid #ffb703; margin: 0 auto; display: flex; align-items: center; justify-content: center; background: #fff; box-shadow: 0 10px 30px rgba(255,183,3,0.2);">
                        <i class="ph-fill ph-aperture" style="font-size: 80px; color: #ffb703;"></i>
                    </div>
                    <h2 style="margin-top: 30px; color: #333;">不知道聊什么？</h2>
                    <p style="color: #999; margin-top: 10px;">点击下方按钮，随机抽取一个话题发给 TA</p>
                    <button class="btn-refresh" style="background: #ffb703; margin-top: 30px; width: 80%;"><i class="ph-fill ph-play"></i> 开始抽取</button>
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
        document.getElementById('app-window').classList.remove('open');
    }
};
