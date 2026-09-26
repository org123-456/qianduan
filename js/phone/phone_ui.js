import { ChatUI } from './ui/chat_ui.js';
import { MemoryUI } from './ui/memory_ui.js';
import { DiaryUI } from './ui/diary_ui.js';
import { MomentsUI } from './ui/moments_ui.js';
import { ScheduleUI } from './ui/schedule_ui.js';

const CallUI = {
    isCalling: false,
    recognition: null,
    isAiSpeaking: false,

    initCallSystem() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false; 
            this.recognition.lang = 'zh-CN';
            this.recognition.interimResults = false;

            this.recognition.onstart = () => {
                this.updateCallStatus('正在听你说...(若无反应请直接打字)');
                const wave = document.getElementById('call-avatar-wave');
                if (wave) wave.style.opacity = '0.8';
            };

            this.recognition.onresult = (event) => {
                const text = event.results[0][0].transcript;
                if (text.trim()) this.handleUserVoiceInput(text);
            };

            this.recognition.onerror = (event) => {
                if (event.error === 'not-allowed') this.updateCallStatus('麦克风被拒，请直接打字');
                else if (event.error !== 'no-speech') this.updateCallStatus('语音引擎无响应，请直接打字');
                const wave = document.getElementById('call-avatar-wave');
                if (wave) wave.style.opacity = '0';
            };

            this.recognition.onend = () => {
                const wave = document.getElementById('call-avatar-wave');
                if (wave) wave.style.opacity = '0';
                if (this.isCalling && !this.isAiSpeaking) {
                    setTimeout(() => {
                        if (this.isCalling && !this.isAiSpeaking) {
                            try { this.recognition.start(); } catch(e){}
                        }
                    }, 1000);
                }
            };
        }
    },

    openCallScreen() {
        if (window.PhoneUI) window.PhoneUI.closeChatMenu();
        let screen = document.getElementById('call-screen');
        if (!screen) {
            screen = document.createElement('div');
            screen.id = 'call-screen';
            screen.style.cssText = 'position: fixed; inset: 0; background: #000; z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 60px 20px 30px 20px; opacity: 0; visibility: hidden; transition: 0.3s; overflow: hidden; pointer-events: none;';
            screen.innerHTML = `
                <div id="call-bg-blur" style="position: absolute; inset: -20px; background-size: cover; background-position: center; filter: blur(30px) brightness(0.4); z-index: -1;"></div>
                <div style="display: flex; flex-direction: column; align-items: center; gap: 15px; margin-top: 20px;">
                    <div style="position: relative;">
                        <div id="call-avatar-wave" style="position: absolute; inset: -15px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.5); opacity: 0; transform: scale(0.8); transition: 0.3s;"></div>
                        <img id="call-ta-avatar" src="" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 2px solid #fff; position: relative; z-index: 2; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                    </div>
                    <div id="call-ta-name" style="font-size: 24px; font-weight: bold; color: #fff; letter-spacing: 1px;">TA</div>
                    <div id="call-status" style="font-size: 14px; color: rgba(255,255,255,0.6);">正在连接...</div>
                </div>
                <div id="call-subtitles" style="flex: 1; width: 100%; margin-top: 30px; margin-bottom: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; padding: 0 5px; scroll-behavior: smooth;"></div>
                <div style="display: flex; width: 100%; gap: 10px; align-items: center; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 24px; backdrop-filter: blur(10px);">
                    <input type="text" id="call-text-input" placeholder="语音没反应？在此打字..." style="flex: 1; padding: 10px 15px; border-radius: 18px; border: none; background: rgba(255,255,255,0.15); color: #fff; outline: none; font-size: 14px;" onkeydown="if(event.key==='Enter') window.PhoneUI.sendCallText()">
                    <div onclick="window.PhoneUI.sendCallText()" style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary-color); color: #fff; display: flex; justify-content: center; align-items: center; font-size: 18px; cursor: pointer; flex-shrink: 0; box-shadow: 0 4px 10px rgba(0,0,0,0.2);"><i class="ph-fill ph-paper-plane-right"></i></div>
                    <div onclick="window.PhoneUI.endCall()" style="width: 40px; height: 40px; border-radius: 50%; background: #ff4b4b; color: #fff; display: flex; justify-content: center; align-items: center; font-size: 22px; cursor: pointer; flex-shrink: 0; box-shadow: 0 4px 10px rgba(255,75,75,0.3);"><i class="ph-fill ph-phone-disconnect"></i></div>
                </div>
            `;
            document.body.appendChild(screen);
        }

        if (!this.recognition) this.initCallSystem();
        
        const taName = localStorage.getItem('char_name') || 'TA';
        const taAvatar = localStorage.getItem('ta_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=TA&backgroundColor=e8f0fa';
        
        document.getElementById('call-ta-name').innerText = taName;
        document.getElementById('call-ta-avatar').src = taAvatar;
        document.getElementById('call-bg-blur').style.backgroundImage = `url(${taAvatar})`;
        document.getElementById('call-subtitles').innerHTML = '';
        document.getElementById('call-text-input').value = '';
        
        screen.style.opacity = '1';
        screen.style.visibility = 'visible';
        screen.style.pointerEvents = 'auto';

        this.isCalling = true;
        this.isAiSpeaking = false;
        this.updateCallStatus('正在连接...');
        
        setTimeout(() => {
            if (!this.isCalling) return;
            this.updateCallStatus('已接通');
            if (this.recognition) {
                try { this.recognition.start(); } catch(e){}
            } else {
                this.updateCallStatus('浏览器不支持语音，请直接打字');
            }
        }, 1500);
    },

    endCall() {
        this.isCalling = false;
        this.isAiSpeaking = false;
        const screen = document.getElementById('call-screen');
        if (screen) {
            screen.style.opacity = '0';
            screen.style.visibility = 'hidden';
            screen.style.pointerEvents = 'none';
        }
        if (this.recognition) { try { this.recognition.stop(); } catch(e){} }
        window.speechSynthesis.cancel(); 
        if (window.PhoneAPI) window.PhoneAPI.showToast("通话已结束");
    },

    updateCallStatus(text) {
        const statusEl = document.getElementById('call-status');
        if (statusEl) statusEl.innerText = text;
    },

    appendSubtitle(role, text) {
        const container = document.getElementById('call-subtitles');
        if (!container) return;
        const div = document.createElement('div');
        div.style.cssText = `padding: 10px 15px; border-radius: 12px; font-size: 15px; line-height: 1.5; max-width: 85%; word-break: break-word; animation: fadeIn 0.3s ease; ${role === '我' ? 'background: rgba(255,255,255,0.15); color: #fff; align-self: flex-end; border-bottom-right-radius: 4px;' : 'background: rgba(255,255,255,0.9); color: #000; align-self: flex-start; border-bottom-left-radius: 4px;'}`;
        div.innerText = text;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    },

    sendCallText() {
        const input = document.getElementById('call-text-input');
        if (!input || !input.value.trim()) return;
        const text = input.value.trim();
        input.value = '';
        this.handleUserVoiceInput(text);
    },

    async handleUserVoiceInput(text) {
        if (!this.isCalling) return;
        this.isAiSpeaking = true;
        this.appendSubtitle('我', text);
        this.updateCallStatus('TA 正在听...');
        
        const roleId = window.Config?.currentContactId || 'role_001';
        if (!window.Config.phoneData[roleId]) window.Config.phoneData[roleId] = {};
        if (!window.Config.phoneData[roleId].wechat) window.Config.phoneData[roleId].wechat = { items: [] };

        const chatItems = window.Config.phoneData[roleId].wechat.items;
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        
        chatItems.push({ sender: 'me', content: `📞 [语音通话]: ${text}`, time: timeStr, date: dateStr });
        if (window.PhoneUI) window.PhoneUI.renderAppContent('wechat');
        window.localStorage.setItem('phone_data', JSON.stringify(window.Config.phoneData));

        try {
            const systemPrompt = localStorage.getItem('system_prompt') || '';
            const charPersona = localStorage.getItem('char_persona') || '';
            let stablePrompt = `【系统状态】：你现在正在和用户打“语音电话”。\n【要求】：请保持你的人设，用自然、口语化的简短语言回复，就像真人在通电话一样，绝对不要发表情包和动作描写。\n\n`;
            if (systemPrompt) stablePrompt += `【系统核心指令】：\n${systemPrompt}\n\n`;
            if (charPersona) stablePrompt += `【角色设定】：\n${charPersona}\n\n`;

            let messages = [{ role: 'system', content: stablePrompt }];
            chatItems.slice(-20).forEach((item) => {
                if (item.sender !== 'typing') {
                    messages.push({ role: item.sender === 'me' ? 'user' : 'assistant', content: item.content || "" });
                }
            });

            const rawReply = await window.PhoneAPI.chatWithAI(messages);
            let finalReply = rawReply.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<inner>[\s\S]*?<\/inner>/gi, '').replace(/📞 \[语音通话\]: /g, '').trim();
            if (!finalReply) finalReply = "喂？";

            chatItems.push({ sender: 'other', content: `📞 [语音通话]: ${finalReply}`, time: timeStr, date: dateStr });
            if (window.PhoneUI) window.PhoneUI.renderAppContent('wechat');
            window.localStorage.setItem('phone_data', JSON.stringify(window.Config.phoneData));

            if (!this.isCalling) return;
            this.appendSubtitle('TA', finalReply);
            this.updateCallStatus('TA 正在说话...');

            const utterance = new SpeechSynthesisUtterance(finalReply);
            utterance.lang = 'zh-CN';
            utterance.onend = () => {
                if (!this.isCalling) return;
                this.isAiSpeaking = false;
                this.updateCallStatus('已接通');
                if (this.recognition) { try { this.recognition.start(); } catch(e){} }
            };
            utterance.onerror = () => {
                this.isAiSpeaking = false;
                this.updateCallStatus('已接通');
                if (this.recognition) { try { this.recognition.start(); } catch(e){} }
            };
            window.speechSynthesis.speak(utterance);

        } catch (error) {
            this.updateCallStatus('网络信号不佳...');
            this.isAiSpeaking = false;
            if (this.recognition) { setTimeout(() => { try { this.recognition.start(); } catch(e){} }, 1000); }
        }
    }
};

export const PhoneUI = {
    ...ChatUI,
    ...MemoryUI,
    ...DiaryUI,
    ...MomentsUI,
    ...ScheduleUI,
    ...CallUI,
    
    escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    },

    changeAppColor(color) {
        document.documentElement.setAttribute('data-color', color);
        localStorage.setItem('app_color', color);
        document.querySelectorAll('.color-circle').forEach(el => el.classList.remove('active'));
        const activeCircle = document.getElementById('color-btn-' + color);
        if (activeCircle) activeCircle.classList.add('active');
    },

    updateHomeDots() {
        const slider = document.getElementById('home-slider');
        const dots = document.querySelectorAll('#home-dots .dot');
        if (!slider || !dots.length) return;
        const pageIndex = Math.round(slider.scrollLeft / slider.clientWidth);
        dots.forEach((dot, index) => {
            if (index === pageIndex) dot.classList.add('active');
            else dot.classList.remove('active');
        });
    },

    async editPolaroidText() {
        const current = localStorage.getItem('polaroid_custom_text') || '';
        const text = await this.showCustomPrompt('给这张照片写句寄语吧：', current);
        if (text !== null) {
            localStorage.setItem('polaroid_custom_text', text.trim());
            this.updateHomeWidget();
        }
    },

    async updateHomeWidget() {
        try {
            const daysEl = document.getElementById('home-love-days');
            if (daysEl) {
                const startDateStr = localStorage.getItem('love_start_date') || localStorage.getItem('diary_start_date');
                if (startDateStr) {
                    const start = new Date(startDateStr); const now = new Date();
                    daysEl.innerText = Math.floor(Math.abs(now - start) / (1000 * 60 * 60 * 24));
                } else { daysEl.innerText = '0'; }
            }

            const noteContentEl = document.getElementById('note-content');
            if (noteContentEl) noteContentEl.innerText = localStorage.getItem('home_note_content') || '“今天也要开心哦！”';

            const calGrid = document.getElementById('home-cal-grid');
            if (calGrid) {
                const now = new Date();
                const y = now.getFullYear(), m = now.getMonth(), today = now.getDate();
                const first = new Date(y, m, 1).getDay();
                const days = new Date(y, m + 1, 0).getDate();
                let html = '';
                for (let i = 0; i < first; i++) html += '<span></span>';
                for (let d = 1; d <= days; d++) {
                    html += d === today ? `<span class="today">${d}</span>` : `<span>${d}</span>`;
                }
                calGrid.innerHTML = html;
            }

            this.renderCountdown();

            let polaroidText = document.getElementById('polaroid-text');
            if (polaroidText) {
                // 🌟 核心修复：克隆节点以清除旧的长按绑定，强制监听 touchend 和 click
                const newText = polaroidText.cloneNode(true);
                polaroidText.parentNode.replaceChild(newText, polaroidText);
                polaroidText = newText;

                polaroidText.style.pointerEvents = 'auto';
                polaroidText.style.position = 'relative';
                polaroidText.style.zIndex = '100';
                
                const triggerEdit = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.PhoneUI.editPolaroidText();
                };

                polaroidText.addEventListener('click', triggerEdit);
                polaroidText.addEventListener('touchend', triggerEdit);

                const customText = localStorage.getItem('polaroid_custom_text');
                if (customText) {
                    polaroidText.innerText = `“${customText}”`;
                } else if (window.PhoneAPI && window.PhoneAPI.EchoVault) {
                    try {
                        const evData = window.PhoneAPI.EchoVault.getData();
                        const dates = Object.keys(evData.daily).sort((a, b) => new Date(b) - new Date(a));
                        let foundText = false;
                        for (let date of dates) {
                            if (evData.daily[date] && evData.daily[date].content) {
                                let text = evData.daily[date].content.replace(/---/g, '').trim();
                                if (text) {
                                    if (text.length > 35) text = text.substring(0, 35) + '...';
                                    polaroidText.innerText = `“${text}”`;
                                    foundText = true;
                                    break;
                                }
                            }
                        }
                        if (!foundText) polaroidText.innerText = "“我们的故事才刚刚开始...”";
                    } catch(e) {
                        polaroidText.innerText = "“我们的故事才刚刚开始...”";
                    }
                }
            }

            if (window.PhoneAPI && window.PhoneAPI.LocalDB) {
                const elements = document.querySelectorAll('[data-img]');
                for (const el of elements) {
                    const key = el.dataset.img;
                    if (key === 'my_avatar' || key === 'ta_avatar') {
                        const b64 = localStorage.getItem(key);
                        if (b64) {
                            if (el.tagName.toLowerCase() === 'img') el.src = b64;
                            continue;
                        }
                    }
                    try {
                        const blob = await window.PhoneAPI.LocalDB.get(key);
                        if (blob) {
                            const url = window.PhoneAPI.LocalDB.urlOf(key, blob);
                            if (el.tagName.toLowerCase() === 'img') el.src = url;
                            else {
                                const imgChild = el.querySelector('img');
                                if (imgChild) imgChild.src = url;
                            }
                        }
                    } catch(e) {}
                }
            }
        } catch(e) {
            console.error("更新首页 Widget 失败:", e);
        }
    },

    bindLongPresses() {
        const elements = document.querySelectorAll('.long-pressable');
        const fileInput = document.getElementById('global-file-input');
        let holdTimer = null, pendingKey = null, pendingEl = null;

        elements.forEach(el => {
            const key = el.dataset.img;
            if (el.dataset.bound) return;
            el.dataset.bound = "true";

            const start = () => {
                el.classList.add('holding');
                clearTimeout(holdTimer);
                holdTimer = setTimeout(() => {
                    el.classList.remove('holding');
                    pendingKey = key; pendingEl = el;
                    if (fileInput) fileInput.click();
                }, 500);
            };
            const cancel = () => { clearTimeout(holdTimer); el.classList.remove('holding'); };

            el.addEventListener('touchstart', start, { passive: true });
            el.addEventListener('touchend', cancel);
            el.addEventListener('touchmove', cancel, { passive: true });
            el.addEventListener('mousedown', start);
            el.addEventListener('mouseup', cancel);
            el.addEventListener('mouseleave', cancel);
            el.addEventListener('contextmenu', e => e.preventDefault());
        });

        if (fileInput && !fileInput.dataset.bound) {
            fileInput.dataset.bound = "true";
            fileInput.addEventListener('change', async e => {
                const f = e.target.files && e.target.files[0];
                e.target.value = '';
                if (!f || !pendingKey) return;
                if (window.PhoneAPI) window.PhoneAPI.showToast('处理中...');
                try {
                    const blob = await window.PhoneAPI.LocalDB.shrink(f, 800);
                    await window.PhoneAPI.LocalDB.set(pendingKey, blob);
                    const url = window.PhoneAPI.LocalDB.urlOf(pendingKey, blob);
                    
                    const allTargetEls = document.querySelectorAll(`[data-img="${pendingKey}"]`);
                    allTargetEls.forEach(targetEl => {
                        if (targetEl.tagName.toLowerCase() === 'img') {
                            targetEl.src = url;
                        } else {
                            if (pendingKey.startsWith('bg_')) {
                                let cssVar = '--bg-image-' + pendingKey.replace('bg_', '').replace(/_/g, '-');
                                if (pendingKey === 'bg_global') cssVar = '--bg-image-global';
                                document.documentElement.style.setProperty(cssVar, `url('${url}')`);
                            } else {
                                const imgChild = targetEl.querySelector('img');
                                if (imgChild) imgChild.src = url;
                            }
                        }
                    });
                    if (window.PhoneAPI) window.PhoneAPI.showToast('✨ 换图成功！已永久保存在本地。');
                } catch (err) { if (window.PhoneAPI) window.PhoneAPI.showToast('换图失败'); }
                pendingKey = null; pendingEl = null;
            });
        }
    },

    triggerAvatarUpload(key) {
        let fileInput = document.getElementById('settings-avatar-input');
        if (!fileInput) {
            fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.id = 'settings-avatar-input';
            fileInput.accept = 'image/*';
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);
        }
        
        fileInput.onchange = (e) => {
            const f = e.target.files && e.target.files[0];
            fileInput.value = '';
            if (!f) return;
            if (window.PhoneAPI) window.PhoneAPI.showToast('图片处理中...');
            
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64Str = event.target.result;
                localStorage.setItem(key, base64Str);
                const allTargetEls = document.querySelectorAll(`[data-img="${key}"]`);
                allTargetEls.forEach(el => {
                    if (el.tagName.toLowerCase() === 'img') el.src = base64Str;
                });
                const previewId = key === 'my_avatar' ? 'set-my-avatar' : 'set-ta-avatar';
                const preview = document.getElementById(previewId);
                if(preview) preview.src = base64Str;
                if (window.PhoneAPI) window.PhoneAPI.showToast('✨ 头像更换成功！');
            };
            reader.readAsDataURL(f);
        };
        fileInput.click();
    },

    renderCountdown() {
        const cfgRaw = localStorage.getItem('cc_countdown');
        const cfg = cfgRaw ? JSON.parse(cfgRaw) : { title: '见到你', date: '2025-05-09', pre: '还有', suf: '天' };
        
        const titleEl = document.getElementById('cd-title-display');
        const dateEl = document.getElementById('cd-date-display');
        const preEl = document.getElementById('cd-pre-display');
        const numEl = document.getElementById('cd-num-display');
        const sufEl = document.getElementById('cd-suf-display');
        
        if (!numEl) return;
        
        const t = new Date(cfg.date + 'T00:00:00');
        const a = new Date(); a.setHours(0, 0, 0, 0);
        const diff = Math.round((t - a) / 86400000);
        
        if (titleEl) titleEl.innerText = cfg.title || (diff < 0 ? '已经过去' : '见到你');
        if (dateEl) dateEl.innerText = cfg.date.replace(/-/g, '.');
        if (preEl) preEl.innerText = cfg.pre || (diff < 0 ? '已经' : '还有');
        if (sufEl) sufEl.innerText = cfg.suf || '天';
        numEl.innerText = Math.abs(diff);
    },

    openCdSheet() {
        const cfgRaw = localStorage.getItem('cc_countdown');
        const cfg = cfgRaw ? JSON.parse(cfgRaw) : { title: '见到你', date: '2025-05-09', pre: '还有', suf: '天' };
        document.getElementById('cd-in-title').value = cfg.title;
        document.getElementById('cd-in-date').value = cfg.date;
        document.getElementById('cd-in-pre').value = cfg.pre;
        document.getElementById('cd-in-suf').value = cfg.suf;
        
        document.getElementById('cd-modal-bg').classList.add('show');
        document.getElementById('cd-modal').classList.add('show');
    },

    closeCdSheet() {
        document.getElementById('cd-modal-bg').classList.remove('show');
        document.getElementById('cd-modal').classList.remove('show');
    },

    saveCdSheet() {
        const date = document.getElementById('cd-in-date').value;
        if (!date) { if (window.PhoneAPI) window.PhoneAPI.showToast('请先挑个日子！'); return; }
        const cfg = {
            title: document.getElementById('cd-in-title').value.trim(),
            date: date,
            pre: document.getElementById('cd-in-pre').value.trim(),
            suf: document.getElementById('cd-in-suf').value.trim()
        };
        localStorage.setItem('cc_countdown', JSON.stringify(cfg));
        this.renderCountdown();
        this.closeCdSheet();
        if (window.PhoneAPI) window.PhoneAPI.showToast('✅ 倒数日已更新！');
    },

    openNoteModal() {
        const bg = document.getElementById('note-modal-bg');
        const modal = document.getElementById('note-modal');
        const input = document.getElementById('note-input');
        if (bg) bg.classList.add('show');
        if (modal) modal.classList.add('show');
        if (input) { input.value = ''; setTimeout(() => input.focus(), 100); }
    },

    closeNoteModal() {
        const bg = document.getElementById('note-modal-bg');
        const modal = document.getElementById('note-modal');
        if (bg) bg.classList.remove('show');
        if (modal) modal.classList.remove('show');
    },

    async sendNote() {
        const input = document.getElementById('note-input');
        if (!input) return;
        const text = input.value.trim();
        if (!text) { if (window.PhoneAPI) window.PhoneAPI.showToast('纸条不能是空的哦！'); return; }
        this.closeNoteModal();
        localStorage.setItem('home_note_content', `“${text}”`);
        this.updateHomeWidget();
        if (window.PhoneAPI) window.PhoneAPI.showToast('纸条已递出，等待 TA 的回复...');

        try {
            const persona = localStorage.getItem('char_persona') || '';
            const myName = localStorage.getItem('my_name') || '我';
            const taName = localStorage.getItem('char_name') || 'TA';
            let sysPrompt = `你扮演${taName}，用户是${myName}。${persona}\n请根据用户传给你的纸条内容，回复一张纸条。要求：\n1. 必须非常简短，一两句话，20字以内。\n2. 语气符合你的人设，像是在小纸条上随手写的。\n3. 不要任何动作描写，只输出纸条上的话。`;
            const messages = [ { role: 'system', content: sysPrompt }, { role: 'user', content: `[传纸条] ${text}` } ];
            const reply = await window.PhoneAPI.chatWithAI(messages);
            if (reply) {
                localStorage.setItem('home_note_content', `“${reply}”`);
                this.updateHomeWidget();
                if (window.PhoneAPI) window.PhoneAPI.showToast('收到 TA 的纸条回信啦！');
            }
        } catch (error) { if (window.PhoneAPI) window.PhoneAPI.showToast('TA 好像没看到纸条...'); }
    },

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        const icon = document.getElementById('theme-icon');
        if (icon) {
            if (newTheme === 'dark') { icon.classList.remove('ph-moon'); icon.classList.add('ph-sun'); } 
            else { icon.classList.remove('ph-sun'); icon.classList.add('ph-moon'); }
        }
    },

    togglePlaylist() {
        const bg = document.getElementById('playlist-modal-bg');
        const modal = document.getElementById('playlist-modal');
        if (bg && modal) {
            if (bg.classList.contains('show')) {
                bg.classList.remove('show');
                modal.classList.remove('show');
            } else {
                bg.classList.add('show');
                modal.classList.add('show');
            }
        }
    },

    openArchiveModal() {
        this.renderArchiveList();
        const bg = document.getElementById('archive-modal-bg');
        const modal = document.getElementById('archive-modal');
        if (bg) bg.classList.add('show');
        if (modal) modal.classList.add('show');
    },

    closeArchiveModal() {
        const bg = document.getElementById('archive-modal-bg');
        const modal = document.getElementById('archive-modal');
        if (bg) bg.classList.remove('show');
        if (modal) modal.classList.remove('show');
    },

    renderArchiveList() {
        const listEl = document.getElementById('archive-list');
        if (!listEl) return;
        const archives = window.PhoneAPI ? window.PhoneAPI.getArchives() : [];
        if (archives.length === 0) { listEl.innerHTML = '<div style="text-align:center;color:var(--text-sub);padding:20px 0;">暂无存档</div>'; return; }
        let html = '';
        [...archives].reverse().forEach(arc => {
            html += `<div class="archive-item"><div class="archive-info"><div class="archive-name">${this.escapeHtml(arc.name)}</div><div class="archive-meta">${this.escapeHtml(arc.date)} · ${arc.count} 条记录</div></div><div class="archive-actions"><button class="archive-btn load" onclick="if(window.PhoneAPI) window.PhoneAPI.loadArchive('${this.escapeHtml(arc.id)}')">读取</button><button class="archive-btn del" onclick="if(window.PhoneAPI) window.PhoneAPI.deleteArchive('${this.escapeHtml(arc.id)}')">删除</button></div></div>`;
        });
        listEl.innerHTML = html;
    },

    showCustomPrompt(title, defaultValue = '') {
        return new Promise(resolve => {
            const bg = document.getElementById('custom-prompt-bg');
            const modal = document.getElementById('custom-prompt-modal');
            const titleEl = document.getElementById('custom-prompt-title');
            const inputEl = document.getElementById('custom-prompt-input');
            const btnConfirm = document.getElementById('custom-prompt-confirm');
            const btnCancel = document.getElementById('custom-prompt-cancel');
            if (!bg || !modal || !titleEl || !inputEl || !btnConfirm || !btnCancel) { resolve(null); return; }
            titleEl.innerText = title; inputEl.value = defaultValue;
            bg.classList.add('show'); modal.classList.add('show');
            const cleanup = () => { bg.classList.remove('show'); modal.classList.remove('show'); btnConfirm.onclick = null; btnCancel.onclick = null; };
            btnConfirm.onclick = () => { const value = inputEl.value; cleanup(); resolve(value); };
            btnCancel.onclick = () => { cleanup(); resolve(null); };
        });
    },

    openApiModal() {
        const bg = document.getElementById('api-modal-bg');
        const modal = document.getElementById('api-modal');
        if (bg) bg.classList.add('show');
        if (modal) modal.classList.add('show');
    },

    closeApiModal() {
        const bg = document.getElementById('api-modal-bg');
        const modal = document.getElementById('api-modal');
        if (bg) bg.classList.remove('show');
        if (modal) modal.classList.remove('show');
    },

    switchSetTab(tabId) {
        ['basic', 'ai', 'draw', 'sys'].forEach(id => {
            const tab = document.getElementById('stab-' + id);
            const sec = document.getElementById('set-sec-' + id);
            if (tab) tab.classList.remove('active');
            if (sec) sec.classList.remove('active');
        });
        const activeTab = document.getElementById('stab-' + tabId);
        const activeSec = document.getElementById('set-sec-' + tabId);
        if (activeTab) activeTab.classList.add('active');
        if (activeSec) activeSec.classList.add('active');
    },

    openApp(appId, appName) {
        if (window.Config) window.Config.currentAppId = appId;
        const titleEl = document.getElementById('app-window-title');
        const winEl = document.getElementById('app-window');
        const contentEl = document.getElementById('app-window-content');

        if (!titleEl || !winEl || !contentEl) return;

        titleEl.innerText = appName;
        winEl.classList.add('open');

        contentEl.style.padding = '20px';
        contentEl.style.background = 'transparent';
        contentEl.style.display = 'block';
        contentEl.style.flexDirection = 'row';
        contentEl.style.height = 'auto';
        contentEl.style.overflow = 'auto'; 

        if (appId === 'diary') { winEl.classList.add('fullscreen-mode'); } else { winEl.classList.remove('fullscreen-mode'); }

        if (appId === 'diary') {
            const diaryTitle = localStorage.getItem('diary_title') || 'His Diary';
            contentEl.innerHTML = `<div id="diary-cover-view" class="diary-cover-view"><div class="diary-book-cover long-pressable" data-img="bg_diary_cover" id="diary-book-cover" onclick="window.PhoneUI.unlockDiary()"><div class="diary-title">${this.escapeHtml(diaryTitle)}</div><div class="diary-hint">点击翻开日记</div></div><div class="diary-back-btn" onclick="window.PhoneUI.closeApp()"><i class="ph ph-caret-left"></i></div></div><div id="diary-inside-view" class="diary-inside-view" ontouchstart="window.PhoneUI.handleSwipeStart(event)" ontouchend="window.PhoneUI.handleSwipeEnd(event)"><div class="diary-back-btn" onclick="window.PhoneUI.closeApp()" style="top:20px;left:15px;background:rgba(0,0,0,0.1);color:#333;z-index:50;"><i class="ph ph-caret-left"></i></div><div id="diary-content-area" style="display:flex;flex-direction:column;height:100%;"></div></div>`;
            this.renderDiaryPage();
            this.bindLongPresses();
        } else if (appId === 'schedule') {
            contentEl.innerHTML = `
                <div class="vault-tabs" id="schedule-tabs" style="margin-bottom: 15px; overflow-x: auto; display: flex; white-space: nowrap; padding-bottom: 5px;"></div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                    <button class="btn-refresh" onclick="window.PhoneUI.importScheduleAI()" style="flex: 1; margin: 0; margin-right: 10px; background: linear-gradient(135deg, #a78bfa, #8b5cf6);"><i class="ph-fill ph-sparkle"></i> AI 智能排课</button>
                    <button class="btn-refresh" onclick="window.PhoneUI.openScheduleModal(-1)" style="flex: 1; margin: 0; background: var(--icon-bg); color: var(--text-main); border: 1px solid var(--border-color);"><i class="ph ph-plus"></i> 手动添加</button>
                </div>
                <div id="schedule-list-area" style="padding-bottom: 80px; display: flex; flex-direction: column; gap: 10px;"></div>
            `;
            this.currentScheduleDay = new Date().getDay() === 0 ? 7 : new Date().getDay();
            this.renderSchedule();
        } else if (appId === 'memory_vault') {
            if (window.Config) window.Config.memoryVaultTab = 'daily';
            contentEl.innerHTML = `
            <div class="vault-tabs"><div class="vault-tab active" id="tab-daily" onclick="window.PhoneUI.switchVaultTab('daily')">日常 (Daily)</div><div class="vault-tab" id="tab-permanent" onclick="window.PhoneUI.switchVaultTab('permanent')">锚点 (Permanent)</div></div>
            <button class="btn-refresh" onclick="window.PhoneUI.remindEchoVault()" style="margin-top: 0; margin-bottom: 15px; background: linear-gradient(135deg, #a78bfa, #8b5cf6); border-radius: 16px; box-shadow: 0 4px 15px rgba(167, 139, 250, 0.4);"><i class="ph-fill ph-bottle"></i> 捞一个漂流瓶</button>
            <div id="vault-content-area" style="padding-bottom: 80px;"></div>`;
            this.renderMemoryVault();
        } else if (appId === 'favorites') {
            this.renderFavorites();
        } else if (appId === 'settings') {
            this.renderSettings();
        }
    },

    closeApp() {
        const winEl = document.getElementById('app-window');
        const contentEl = document.getElementById('app-window-content');
        if (winEl) { winEl.classList.remove('open'); winEl.classList.remove('fullscreen-mode'); }
        if (contentEl) {
            contentEl.style.padding = '20px';
            contentEl.style.display = 'block';
            contentEl.style.flexDirection = 'row';
            contentEl.style.overflow = 'auto';
            contentEl.style.height = 'auto';
        }
        if (window.Config) window.Config.currentAppId = 'wechat';
    },

    // 🌟 补回阅读器逻辑
    openReader() {
        const readerEl = document.getElementById('app-reader');
        if (readerEl) {
            readerEl.classList.add('open');
            if (this.initReaderSwipe) this.initReaderSwipe();
            if (this.bindReaderSelection) this.bindReaderSelection();
            this.showBookshelf();
            if (window.PhoneEngine && window.PhoneEngine.renderBookshelf) {
                window.PhoneEngine.renderBookshelf();
            }
        }
    },

    closeReader() {
        const readerEl = document.getElementById('app-reader');
        if (readerEl) {
            readerEl.classList.remove('open');
            if (window.PhoneEngine && window.PhoneEngine._proactiveTimer) {
                clearTimeout(window.PhoneEngine._proactiveTimer);
            }
        }
    },

    handleReaderBack() {
        const readingView = document.getElementById('reader-reading-view');
        if (readingView && readingView.style.display === 'block') {
            const readerEl = document.getElementById('app-reader');
            if (readerEl) readerEl.classList.remove('open');
            if (window.PhoneEngine && window.PhoneEngine._proactiveTimer) {
                clearTimeout(window.PhoneEngine._proactiveTimer);
            }
            if (window.PhoneUI.switchMomentsTab) {
                window.PhoneUI.switchMomentsTab('reader');
            }
        } else {
            const readerEl = document.getElementById('app-reader');
            if (readerEl) readerEl.classList.remove('open');
        }
    },

    showBookshelf() {
        const shelf = document.getElementById('reader-bookshelf-view');
        const reading = document.getElementById('reader-reading-view');
        const footer = document.getElementById('reader-footer');
        const title = document.getElementById('reader-header-title');
        const btnAdd = document.getElementById('btn-add-book');
        const btnSet = document.getElementById('btn-reader-settings');
        
        if(shelf) shelf.style.display = 'block';
        if(reading) reading.style.display = 'none';
        if(footer) footer.style.display = 'none';
        if(title) title.innerText = "共读书架";
        if(btnAdd) btnAdd.style.display = 'block';
        if(btnSet) btnSet.style.display = 'none';
        
        if (window.PhoneEngine && window.PhoneEngine._proactiveTimer) {
            clearTimeout(window.PhoneEngine._proactiveTimer);
        }
    },

    showReadingView(titleText) {
        const readerEl = document.getElementById('app-reader');
        if (readerEl) readerEl.classList.add('open');

        const shelf = document.getElementById('reader-bookshelf-view');
        const reading = document.getElementById('reader-reading-view');
        const footer = document.getElementById('reader-footer');
        const title = document.getElementById('reader-header-title');
        const btnAdd = document.getElementById('btn-add-book');
        const btnSet = document.getElementById('btn-reader-settings');
        
        if(shelf) shelf.style.display = 'none';
        if(reading) reading.style.display = 'block';
        if(footer) footer.style.display = 'flex';
        if(title) title.innerText = titleText || "阅读中";
        if(btnAdd) btnAdd.style.display = 'none';
        if(btnSet) btnSet.style.display = 'block';
    },

    initReaderSwipe() {
        const area = document.getElementById('reader-reading-view');
        if (!area || this._readerSwipeBound) return;
        let startX = 0; let startY = 0;
        area.addEventListener('touchstart', (e) => {
            if (e.changedTouches[0]) {
                startX = e.changedTouches[0].screenX;
                startY = e.changedTouches[0].screenY;
            }
        }, { passive: true });
        area.addEventListener('touchend', (e) => {
            if (!e.changedTouches[0]) return;
            const diffX = e.changedTouches[0].screenX - startX;
            const diffY = e.changedTouches[0].screenY - startY;
            if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 0) { if (window.PhoneEngine && window.PhoneEngine.prevPage) window.PhoneEngine.prevPage(); } 
                else { if (window.PhoneEngine && window.PhoneEngine.nextPage) window.PhoneEngine.nextPage(); }
            }
        });
        this._readerSwipeBound = true;
    },

    bindReaderSelection() {
        const area = document.getElementById('reader-page-container');
        const menu = document.getElementById('highlight-menu');
        if (!area || !menu || this._selectionBound) return;
        document.addEventListener('selectionchange', () => {
            const selection = window.getSelection();
            const readerEl = document.getElementById('app-reader');
            if (!readerEl || !readerEl.classList.contains('open')) return;
            if (selection.toString().trim().length > 0 && area.contains(selection.anchorNode)) {
                menu.style.display = 'flex';
            } else {
                menu.style.display = 'none';
            }
        });
        this._selectionBound = true;
    },

    renderSettings() {
        const contentEl = document.getElementById('app-window-content');
        if (!contentEl) return;
        const today = new Date();
        const defaultDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        const currentColor = localStorage.getItem('app_color') || 'blue';
        const myAvatar = localStorage.getItem('my_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=Me&backgroundColor=e8f0fa';
        const taAvatar = localStorage.getItem('ta_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=TA&backgroundColor=e8f0fa';

        contentEl.innerHTML = `
        <div class="settings-tabs">
        <div class="settings-tab active" id="stab-basic" onclick="window.PhoneUI.switchSetTab('basic')">基础/UI</div>
        <div class="settings-tab" id="stab-ai" onclick="window.PhoneUI.switchSetTab('ai')">大模型</div>
        <div class="settings-tab" id="stab-draw" onclick="window.PhoneUI.switchSetTab('draw')">绘画引擎</div>
        <div class="settings-tab" id="stab-sys" onclick="window.PhoneUI.switchSetTab('sys')">系统维护</div>
        </div>

        <div id="set-sec-basic" class="set-section active">
        <div class="card">
        <h3 style="color:var(--primary-color);margin-bottom:15px;"><i class="ph-fill ph-user-circle"></i> 基础设定 (头像与名字)</h3>
        
        <div style="display:flex; justify-content:space-around; align-items:center; margin-bottom:20px; background: var(--icon-bg); padding: 15px; border-radius: 16px; border: 1px dashed var(--border-color);">
            <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
                <img id="set-my-avatar" src="${myAvatar}" onclick="window.PhoneUI.triggerAvatarUpload('my_avatar')" style="width:60px; height:60px; border-radius:50%; object-fit:cover; border:2px solid var(--border-color); cursor:pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                <span style="font-size:11px; color:var(--text-sub); font-weight:bold;">点击换图</span>
            </div>
            <i class="ph-fill ph-arrows-left-right" style="color:var(--border-color); font-size:24px;"></i>
            <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
                <img id="set-ta-avatar" src="${taAvatar}" onclick="window.PhoneUI.triggerAvatarUpload('ta_avatar')" style="width:60px; height:60px; border-radius:50%; object-fit:cover; border:2px solid var(--border-color); cursor:pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                <span style="font-size:11px; color:var(--text-sub); font-weight:bold;">点击换图</span>
            </div>
        </div>

        <div style="display:flex;gap:10px;margin-bottom:10px;">
            <div style="flex:1;"><label style="font-size:12px;color:var(--text-sub);">我的名字</label><input type="text" id="my-name" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;margin-top:4px;"></div>
            <div style="flex:1;"><label style="font-size:12px;color:var(--text-sub);">TA的名字</label><input type="text" id="char-name" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;margin-top:4px;"></div>
        </div>
        <div style="display:flex;gap:10px;margin-bottom:10px;">
            <div style="flex:1;"><label style="font-size:11px;color:var(--text-sub);">我的头像(网址)</label><input type="text" id="my-avatar-url" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;margin-top:4px;"></div>
            <div style="flex:1;"><label style="font-size:11px;color:var(--text-sub);">TA的头像(网址)</label><input type="text" id="ta-avatar-url" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;margin-top:4px;"></div>
        </div>
        </div>

        <div class="card">
        <h3 style="color:var(--primary-color);margin-bottom:10px;"><i class="ph-fill ph-palette"></i> UI 主题装修</h3>
        
        <div class="engine-title"><i class="ph-fill ph-paint-brush"></i> 全局主题色</div>
        <div class="color-picker-container">
            <div id="color-btn-blue" class="color-circle c-blue ${currentColor === 'blue' ? 'active' : ''}" onclick="window.PhoneUI.changeAppColor('blue')" title="星河水"></div>
            <div id="color-btn-purple" class="color-circle c-purple ${currentColor === 'purple' ? 'active' : ''}" onclick="window.PhoneUI.changeAppColor('purple')" title="冰晶紫"></div>
            <div id="color-btn-pink" class="color-circle c-pink ${currentColor === 'pink' ? 'active' : ''}" onclick="window.PhoneUI.changeAppColor('pink')" title="薄雾粉"></div>
            <div id="color-btn-gold" class="color-circle c-gold ${currentColor === 'gold' ? 'active' : ''}" onclick="window.PhoneUI.changeAppColor('gold')" title="天光金"></div>
        </div>

        <div class="engine-title"><i class="ph-fill ph-image"></i> 壁纸设置 (支持长按换图，也可填URL)</div>
        <div style="display:flex;gap:10px;margin-bottom:10px;">
        <div style="flex:1;"><label style="font-size:11px;color:var(--text-sub);">全局壁纸(网址)</label><input type="text" id="bg-global" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;margin-top:4px;"></div>
        <div style="flex:1;"><label style="font-size:11px;color:var(--text-sub);">聊天壁纸(网址)</label><input type="text" id="bg-chat" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;margin-top:4px;"></div>
        </div>
        <div style="display:flex;gap:10px;margin-bottom:10px;">
        <div style="flex:1;"><label style="font-size:11px;color:var(--text-sub);">日记封面(网址)</label><input type="text" id="bg-diary-cover" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;margin-top:4px;"></div>
        <div style="flex:1;"><label style="font-size:11px;color:var(--text-sub);">日记内页(网址)</label><input type="text" id="bg-diary-page" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;margin-top:4px;"></div>
        </div>
        <div class="engine-title"><i class="ph-fill ph-heart" style="color:var(--danger-color);"></i> 恋爱纪念日</div>
        <div style="margin-bottom:15px;"><label style="font-size:11px;color:var(--text-sub);">相爱起始日 (用于首页天数计算)</label><input type="date" id="love-start-date" value="${localStorage.getItem('love_start_date') || defaultDate}" onchange="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;margin-top:4px;"></div>
        <div class="engine-title"><i class="ph-fill ph-text-aa"></i> 日记本专属设置</div>
        <div style="margin-bottom:10px;"><label style="font-size:11px;color:var(--danger-color);font-weight:bold;">日记起始日期</label><input type="date" id="diary-start-date" value="${defaultDate}" onchange="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;margin-top:4px;"></div>
        <div style="margin-bottom:10px;"><label style="font-size:11px;color:var(--text-sub);">封面标题</label><input type="text" id="diary-title" placeholder="His Diary" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;margin-top:4px;"></div>
        </div>
        </div>

        <div id="set-sec-ai" class="set-section">
        <div class="card">
        <h3 style="color:var(--primary-color);margin-bottom:10px;"><i class="ph-fill ph-scroll"></i> 提示词与人设 (预设库)</h3>
        <div class="preset-bar"><select id="prompt-preset-select" onchange="if(window.PhoneAPI) window.PhoneAPI.loadPromptPreset()"></select><button class="preset-btn" onclick="if(window.PhoneAPI) window.PhoneAPI.savePromptPreset()">存为预设</button><button class="preset-btn del" onclick="if(window.PhoneAPI) window.PhoneAPI.deletePromptPreset()">删除</button></div>
        <div style="margin-bottom:15px;"><label style="font-size:12px;color:var(--text-main);font-weight:bold;">1. 系统指令 (防八股/核心规则)</label><textarea id="system-prompt" rows="4" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:10px;border-radius:8px;resize:vertical;font-size:12px;margin-top:4px;"></textarea></div>
        <div style="margin-bottom:15px;"><label style="font-size:12px;color:var(--text-main);font-weight:bold;">2. 角色人设 (性格/背景/口吻)</label><textarea id="char-persona" rows="6" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:10px;border-radius:8px;resize:vertical;font-size:12px;margin-top:4px;"></textarea></div>
        </div>
        <div class="card">
        <h3 style="color:var(--primary-color);margin-bottom:15px;"><i class="ph-fill ph-toggle-left"></i> 功能开关</h3>
        <div style="margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;background:var(--icon-bg);padding:10px;border-radius:8px;"><label style="font-size:13px;color:var(--text-main);font-weight:bold;"><i class="ph ph-prohibit"></i> 绝对禁止 AI 使用 Emoji</label><input type="checkbox" id="ban-emoji" onchange="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:18px;height:18px;"></div>
        <div style="margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;background:var(--icon-bg);padding:10px;border-radius:8px;"><label style="font-size:13px;color:var(--text-main);font-weight:bold;"><i class="ph ph-arrows-merge"></i> 开启线上/线下记忆互通</label><input type="checkbox" id="share-memory" onchange="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:18px;height:18px;"></div>
        </div>
        <div class="card">
        <h3 style="color:var(--primary-color);margin-bottom:10px;"><i class="ph-fill ph-database"></i> 语言引擎预设库 (文本模型)</h3>
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:15px;padding-bottom:15px;border-bottom:1px dashed var(--border-color);"><select id="preset-delete-select" onchange="window.PhoneUI.fillPresetData()" style="flex:1;padding:8px;border-radius:8px;border:1px solid var(--primary-color);"><option value="">-- 选择预设以编辑或删除 --</option></select><button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.deletePreset()" style="width:auto;margin:0;background:transparent;color:var(--danger-color);border:1px solid var(--danger-color);padding:8px 12px;"><i class="ph ph-trash"></i></button></div>
        <div style="margin-bottom:10px;"><input type="text" id="preset-name" placeholder="起个名字 (如: 硅基-DeepSeek)" style="width:100%;padding:8px;border-radius:8px;"></div>
        <div style="margin-bottom:10px;"><input type="text" id="preset-url" placeholder="接口地址 (Base URL)" style="width:100%;padding:8px;border-radius:8px;"></div>
        <div style="margin-bottom:10px;"><input type="password" id="preset-key" placeholder="API Key (密钥)" style="width:100%;padding:8px;border-radius:8px;"></div>
        <div style="margin-bottom:15px;"><input type="text" id="preset-model" placeholder="模型名称 (Model)" style="width:100%;padding:8px;border-radius:8px;"></div>
        <button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.savePreset()" style="margin-top:0;margin-bottom:5px;"><i class="ph ph-floppy-disk"></i> 保存 / 更新当前预设</button>
        </div>
        </div>

        <div id="set-sec-draw" class="set-section">
        <div class="card">
        <h3 style="color:var(--primary-color);margin-bottom:10px;"><i class="ph-fill ph-image"></i> 绘画引擎配置 (DALL-E 格式)</h3>
        <div style="margin-bottom:10px;"><input type="text" id="img-api-url" placeholder="接口地址" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;"></div>
        <div style="margin-bottom:10px;"><input type="password" id="img-api-key" placeholder="API Key (密钥)" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;"></div>
        <div style="margin-bottom:10px;"><input type="text" id="img-api-model" placeholder="模型名称 (例如: dall-e-3)" oninput="if(window.PhoneAPI) window.PhoneAPI.autoSave()" style="width:100%;padding:8px;border-radius:8px;"></div>
        </div>
        </div>

        <div id="set-sec-sys" class="set-section">
        <div class="card" style="border: 1px solid var(--primary-color);">
        <h3 style="color:var(--primary-color);margin-bottom:10px;"><i class="ph-fill ph-cloud-check"></i> Cloudflare 云端同步</h3>
        <div style="display:flex;gap:10px;"><button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.syncToCloud()" style="flex:1;margin-top:0;background:linear-gradient(135deg, var(--primary-color), var(--secondary-color));"><i class="ph-fill ph-cloud-arrow-up"></i> 备份到云端</button><button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.restoreFromCloud()" style="flex:1;margin-top:0;background:var(--icon-bg);color:var(--text-main);border:1px solid var(--border-color);"><i class="ph-fill ph-cloud-arrow-down"></i> 从云端拉取</button></div>
        </div>
        <div class="card">
        <h3 style="color:var(--primary-color);margin-bottom:15px;"><i class="ph-fill ph-floppy-disk-back"></i> 本地文件备份 (JSON)</h3>
        <div style="display:flex;gap:10px;"><button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.exportData()" style="flex:1;margin-top:0;background:var(--secondary-color);"><i class="ph ph-export"></i> 导出文件</button><button class="btn-refresh" onclick="document.getElementById('import-file').click()" style="flex:1;margin-top:0;background:#2a9d8f;"><i class="ph ph-import"></i> 导入文件</button><input type="file" id="import-file" style="display:none" accept=".json" onchange="if(window.PhoneAPI) window.PhoneAPI.importData(event)"></div>
        </div>
        <div class="card">
        <h3 style="color:var(--danger-color);margin-bottom:15px;"><i class="ph-fill ph-warning-circle"></i> 系统维护</h3>
        <button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.forceUpdate()" style="background:#f4a261;margin-top:0;margin-bottom:10px;"><i class="ph ph-arrows-clockwise"></i> 强制更新系统 (获取最新代码)</button>
        <button class="btn-refresh" onclick="if(window.PhoneAPI) window.PhoneAPI.clearChat()" style="background:var(--danger-color);margin-top:0;"><i class="ph ph-trash"></i> 清空所有聊天与小说记录</button>
        </div>
        </div>
        `;

        setTimeout(() => {
            this.bindLongPresses();
            if (window.PhoneAPI) {
                if (window.PhoneAPI.loadSettings) window.PhoneAPI.loadSettings();
                if (window.PhoneAPI.refreshPresetDropdowns) window.PhoneAPI.refreshPresetDropdowns();
                if (window.PhoneAPI.refreshPromptDropdowns) window.PhoneAPI.refreshPromptDropdowns();
                if (window.PhoneAPI.refreshUIDropdowns) window.PhoneAPI.refreshUIDropdowns();
                if (window.PhoneAPI.refreshImgDropdowns) window.PhoneAPI.refreshImgDropdowns();
            }
        }, 50);
    },

    fillPresetData() {
        const select = document.getElementById('preset-delete-select');
        if (!select || !select.value) return;
        const presetId = select.value;
        const presets = JSON.parse(localStorage.getItem('ai_api_presets') || '[]');
        const preset = presets.find(p => p.id === presetId);
        if (preset) {
            document.getElementById('preset-name').value = preset.name || '';
            document.getElementById('preset-url').value = preset.url || '';
            document.getElementById('preset-key').value = preset.key || '';
            document.getElementById('preset-model').value = preset.model || '';
            if (window.PhoneAPI) window.PhoneAPI.showToast('✏️ 已加载预设，修改后点击保存即可覆盖');
        }
    }
};

if (typeof window !== 'undefined') { window.PhoneUI = PhoneUI; }
