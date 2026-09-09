import { Config } from './phone_config.js';
import { PHONE_APPS } from '../apps/app_registry.js';

export const PhoneUI = {
    init() {
        const roleList = document.getElementById('role-list');
        roleList.innerHTML = Object.keys(Config.externalData).map(id => `
            <div class="role-card" onclick="window.PhoneUI.selectRole('${id}')">
                <h3 style="margin-bottom:5px;">${Config.externalData[id].name}</h3>
                <p style="font-size:12px; color:#666; line-height:1.4;">${Config.externalData[id].persona}</p>
            </div>
        `).join('');
    },

    selectRole(contactId) {
        Config.currentContactId = contactId;
        document.getElementById('current-role-name').innerText = Config.externalData[contactId].name + " 的手机";
        this.renderDesktop();
        this.switchPage('page-home');
    },

    renderDesktop() {
        const desktop = document.getElementById('desktop');
        desktop.innerHTML = Object.keys(PHONE_APPS).map(id => {
            const app = PHONE_APPS[id];
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
        document.getElementById('current-app-name').innerText = app.name;
        this.renderAppContent(appId);
        this.switchPage('page-app');
    },

    renderAppContent(appId) {
        const app = PHONE_APPS[appId];
        const roleData = Config.phoneData[Config.currentContactId] || {};
        const appData = roleData[appId] || null;
        
        const container = document.getElementById('app-content-list');
        container.innerHTML = app.renderList(appData);
    },

    switchPage(pageId) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
    },

    goBack(pageId) {
        this.switchPage(pageId);
        Config.currentAppId = null;
    },

    showLoading(show) {
        document.getElementById('loading').style.display = show ? 'flex' : 'none';
    }
};

