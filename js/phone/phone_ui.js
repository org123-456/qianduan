import { Config } from './phone_config.js';
import { PHONE_APPS } from '../apps/app_registry.js';

export const PhoneUI = {
    init() {
        // 默认直接选中角色 role_001 (林萧)，跳过角色选择页，直接进入主界面
        this.selectRole('role_001');
    },

    selectRole(contactId) {
        Config.currentContactId = contactId;
        this.renderDesktop();
    },

    renderDesktop() {
        const desktop = document.getElementById('desktop');
        desktop.innerHTML = Object.keys(PHONE_APPS).map(id => {
            const app = PHONE_APPS[id];
            
            // 如果 App 设置了隐身属性，就不在桌面上渲染它
            if (app.hideInDesktop) return '';
            
            return `
                <div class="app-icon" onclick="window.PhoneUI.openApp('${id}')">
                    <div class="icon">${app.icon}</div>
                    <div class="name">${app.name}</div>
                </div>
            `;
        }).join('');
    },

    openApp(appId) {
        Config.currentAppId = appId;
        const app = PHONE_APPS[appId];
        
        // 如果点击的是桌面上的 App (比如钱包)，弹出一个简单的弹窗显示内容
        const roleData = Config.phoneData[Config.currentContactId] || {};
        const appData = roleData[appId] || null;
        
        // 这里用一个简单的 alert 演示，以后可以做成更好看的内页
        if (appData && appData.items) {
            let content = app.name + " 的数据：\n\n";
            appData.items.forEach(item => {
                content += `${item.title}: ${item.desc} (${item.time})\n`;
            });
            alert(content);
        } else {
            alert(app.name + " 暂无数据，请去 Mine 页面点击重新生成。");
        }
    },

    renderAppContent(appId) {
        const app = PHONE_APPS[appId];
        const roleData = Config.phoneData[Config.currentContactId] || {};
        const appData = roleData[appId] || null;
        
        const container = document.getElementById('app-content-list');
        if(container) {
            container.innerHTML = app.renderList(appData);
            // 每次渲染完聊天记录，自动滚动到最底部
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 100);
        }
    },

    showLoading(show) {
        const loading = document.getElementById('loading');
        if(loading) loading.style.display = show ? 'flex' : 'none';
    }
};
