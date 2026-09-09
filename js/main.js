import { PhoneUI } from './phone/phone_ui.js';
import { PhoneEngine } from './phone/phone_engine.js';
import { Config } from './phone/phone_config.js';

// 把核心方法挂载到全局，防止 HTML 里的点击和滑动事件找不到它们
window.PhoneUI = PhoneUI;
window.PhoneEngine = PhoneEngine;
window.Config = Config; 

document.addEventListener('DOMContentLoaded', () => {
    PhoneUI.init();
});
