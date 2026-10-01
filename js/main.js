import { Config } from './phone/phone_config.js';
import { PhoneAPI } from './phone/phone_api.js';
import { PhoneUI } from './phone/phone_ui.js?v=2026.10.02-storage3';
import { PhoneEngine } from './phone/phone_engine.js?v=2'; 
import { WechatApp } from './apps/wechat.js';
import { GameUI } from './games/index.js';
import { GameEngine } from './games/game_engine.js';
let MemoryEngine = null;

// 版本更新交给 Service Worker 的网络优先策略，不再依赖手工 build 号。
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
window.GameUI = GameUI;
window.GameEngine = GameEngine;

document.addEventListener('DOMContentLoaded', async () => {
    // 先恢复聊天记录，再渲染微信，避免页面启动时把空数据画出来。
    try {
        await Config.hydratePhoneData();
        console.log('✅ 聊天记录已从本地持久存储恢复');
    } catch (e) {
        console.error('聊天记录恢复失败:', e);
    }
    console.log('✅ 核心引擎已挂载，路径加载成功！');

    // 记忆星海依赖 Three.js 等外部模块。不要让它阻塞整个 App 启动；
    // 先让 UI 完整启动，再后台加载记忆引擎。
    import('./phone/engine/memory_engine.js')
        .then(mod => {
            MemoryEngine = mod.MemoryEngine;
            window.MemoryEngine = MemoryEngine;
            console.log('✅ 记忆引擎后台加载完成');
        })
        .catch(err => {
            console.warn('⚠️ 记忆引擎暂时无法加载，主界面不受影响：', err);
        });

    // 尽量申请持久化存储：聊天、图片、书籍等走 IndexedDB 时，降低浏览器因存储压力自动清理的风险。
    try {
        const persistent = await window.PhoneAPI?.requestPersistentStorage?.();
        const estimate = await window.PhoneAPI?.getStorageEstimate?.();
        if (estimate) console.log('💾 浏览器存储：', estimate.usageMB + 'MB / ' + estimate.quotaGB + 'GB', persistent ? '(持久化)' : '(普通)');
    } catch (e) {
        console.warn('⚠️ 存储初始化跳过:', e);
    }

    // 启动时先恢复设置/主题，再渲染页面，避免“刚打开还是默认蓝色，点一次设置才变粉”。
    if (window.PhoneAPI?.loadSettings) {
        try { window.PhoneAPI.loadSettings(); } catch (e) { console.warn('启动设置恢复失败:', e); }
    }

    // 🌙 日记每天凌晨 03:00 结算前一天；若 App 之后才打开，则启动时补结算。
    if (window.PhoneUI?.scheduleDiaryGeneration) {
        window.PhoneUI.scheduleDiaryGeneration();
    }

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
