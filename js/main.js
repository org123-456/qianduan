import { PhoneUI } from './phone/phone_ui.js';
import { PhoneEngine } from './phone/phone_engine.js';

window.PhoneUI = PhoneUI;
window.PhoneEngine = PhoneEngine;

document.addEventListener('DOMContentLoaded', () => {
    PhoneUI.init();
});

