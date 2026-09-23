import { Config } from './phone/phone_config.js';
import { PhoneAPI } from './phone/phone_api.js';
import { PhoneUI } from './phone/phone_ui.js';
import { PhoneEngine as LazyPhoneEngine } from './phone/phone_engine_loader.js';
import { ChatEngine } from './phone/engine/chat_engine.js';
import { ReaderEngine } from './phone/engine/reader_engine.js';
import { MemoryEngine } from './phone/engine/memory_engine.js';
import { GalleryEngine } from './phone/engine/gallery_engine.js';
import { WechatApp } from './apps/wechat.js';

// 将所有拆分的模块组装成完整的 PhoneEngine
const PhoneEngine = {
    ...LazyPhoneEngine,
    ...ChatEngine,
    ...ReaderEngine,
    ...MemoryEngine,
    ...GalleryEngine
};

// 兼容旧版的发送逻辑
const legacySendUserMsgOnly = PhoneEngine.sendUserMsgOnly;
PhoneEngine.sendUserMsgOnly = (...args) => {
    return legacySendUserMsgOnly?.(...args);
};

window.Config = Config;
window.PhoneAPI = PhoneAPI;
window.PhoneUI = PhoneUI;
window.PhoneEngine = PhoneEngine;
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

    setTimeout(() => {
        if (window.PhoneAPI) {
            window.PhoneAPI.refreshPresetDropdowns();
            window.PhoneAPI.refreshPromptDropdowns();
            window.PhoneAPI.loadSettings();
        }
        if (window.PhoneUI) window.PhoneUI.renderAppContent('wechat');
        console.log('✅ 聊天记录和设置已成功加载！');
    }, 300);
});

// 监听全局回车键
document.addEventListener('keydown', (e) => {
    const chatInput = document.getElementById('chat-input');
    const novelInput = document.getElementById('novel-input');
    
    // 微信聊天：按回车把消息发到屏幕上 (不触发AI回复，Shift+Enter换行)
    if (e.key === 'Enter' && !e.shiftKey && document.activeElement === chatInput) {
        e.preventDefault(); 
        if (window.PhoneEngine) window.PhoneEngine.sendUserMsgOnly();
        if (window.PhoneUI) window.PhoneUI.closeChatMenu();
    }
    
    // 线下故事：按回车把消息发到屏幕上
    if (e.key === 'Enter' && !e.shiftKey && document.activeElement === novelInput) {
        e.preventDefault();
        if (window.PhoneEngine) window.PhoneEngine.sendUserMsgOnly();
    }
});
