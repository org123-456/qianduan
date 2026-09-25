import { Config } from './phone/phone_config.js';
import { PhoneAPI } from './phone/phone_api.js';
import { PhoneUI } from './phone/phone_ui.js';
import { PhoneEngine } from './phone/phone_engine.js'; 
import { WechatApp } from './apps/wechat.js';
import { MemoryEngine } from './phone/engine/memory_engine.js';

let msgCounter = 0;

const legacySendUserMsgOnly = PhoneEngine.sendUserMsgOnly;
PhoneEngine.sendUserMsgOnly = (...args) => {
    const res = legacySendUserMsgOnly?.(...args);
    msgCounter++;
    if (msgCounter % 8 === 0) {
        setTimeout(() => {
            if (window.MemoryEngine && window.MemoryEngine.autoManageMemory) {
                window.MemoryEngine.autoManageMemory();
            }
        }, 8000); 
    }
    return res;
};

// 🌟 终极拦截器：只要看到【后台记忆入库】，直接截胡并抹除痕迹！
const originalChatWithAI = PhoneAPI.chatWithAI;
PhoneAPI.chatWithAI = async (messages, options) => {
    const reply = await originalChatWithAI.call(PhoneAPI, messages, options);
    
    if (reply && reply.includes('【后台记忆入库】')) {
        if (window.MemoryEngine && window.MemoryEngine.processSilentMemory) {
            window.MemoryEngine.processSilentMemory(reply);
        }
        // 抹除这段话，只保留正常聊天的部分
        let visibleReply = reply.split('【后台记忆入库】')[0].trim();
        if (!visibleReply) visibleReply = "（默默记在心里了...）"; 
        return visibleReply; 
    }
    return reply;
};

window.Config = Config;
window.PhoneAPI = PhoneAPI;
window.PhoneUI = PhoneUI;
window.PhoneEngine = PhoneEngine;
window.MemoryEngine = MemoryEngine; 
window.Apps = { wechat: WechatApp };

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ 核心引擎已挂载，路径加载成功！');

    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        const themeIcon = document.getElementById('theme-icon');
        if (themeIcon) {
            themeIcon.classList.remove('ph-moon');
            themeIcon.classList.add('ph-sun');
        }
    }

    if (window.PhoneUI && window.PhoneUI.renderAppContent) {
        window.PhoneUI.renderAppContent('wechat');
    }

    setTimeout(() => {
        if (window.PhoneAPI) {
            if (window.PhoneAPI.refreshPresetDropdowns) window.PhoneAPI.refreshPresetDropdowns();
            if (window.PhoneAPI.refreshPromptDropdowns) window.PhoneAPI.refreshPromptDropdowns();
            if (window.PhoneAPI.loadSettings) window.PhoneAPI.loadSettings();
        }
        console.log('✅ 设置已成功加载！');
    }, 300);
});

document.addEventListener('keydown', (e) => {
    const chatInput = document.getElementById('chat-input');
    if (e.key === 'Enter' && !e.shiftKey && document.activeElement === chatInput) {
        e.preventDefault(); 
        if (window.PhoneEngine) window.PhoneEngine.sendUserMsgOnly();
        if (window.PhoneUI) window.PhoneUI.closeChatMenu();
    }
});
