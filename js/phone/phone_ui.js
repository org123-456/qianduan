export const PhoneUI = {
    renderAppContent(appId) {
        // 这是给 Chat 用的，保持原样
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

    // 🌟 核心升级：渲染真正的手机桌面！
    renderDesktop() {
        // 桌面应用配置 (7个App)
        const desktopApps = [
            { id: 'wallet', name: '钱包', icon: '<i class="ph-fill ph-wallet" style="color: #4a70a8;"></i>' },
            { id: 'diary', name: '日记本', icon: '<i class="ph-fill ph-book-open-text" style="color: #e5989b;"></i>' },
            { id: 'shop', name: '商店', icon: '<i class="ph-fill ph-storefront" style="color: #f4a261;"></i>' },
            { id: 'task', name: '打工赚钱', icon: '<i class="ph-fill ph-check-square-offset" style="color: #2a9d8f;"></i>' },
            { id: 'worldbook', name: '世界书', icon: '<i class="ph-fill ph-globe-hemisphere-west" style="color: #6b8bbd;"></i>' },
            { id: 'skill', name: '技能架', icon: '<i class="ph-fill ph-magic-wand" style="color: #9d4edd;"></i>' },
            { id: 'roulette', name: '话题转盘', icon: '<i class="ph-fill ph-aperture" style="color: #ffb703;"></i>' }
        ];

        const desktopEl = document.getElementById('desktop');
        if (!desktopEl) return;

        let html = '';
        desktopApps.forEach(app => {
            html += `
                <div class="app-icon" onclick="window.PhoneUI.openApp('${app.id}', '${app.name}')">
                    <div class="icon">${app.icon}</div>
                    <div class="name">${app.name}</div>
                </div>
            `;
        });
        desktopEl.innerHTML = html;
    },

    // 🌟 核心升级：打开 App 独立窗口
    openApp(appId, appName) {
        document.getElementById('app-window-title').innerText = appName;
        document.getElementById('app-window').classList.add('open');
        const contentEl = document.getElementById('app-window-content');
        
        // 为不同 App 注入不同的 UI 排版骨架
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

    // 关闭 App 窗口
    closeApp() {
        document.getElementById('app-window').classList.remove('open');
    }
};
