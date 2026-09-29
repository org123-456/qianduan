/**
 * 📞 专属语音通话 UI 模块
 */
export const CallUI = {
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
                this.updateCallStatus('正在听你说...(若无反应可直接打字)');
                const wave = document.getElementById('call-avatar-wave');
                if (wave) wave.style.opacity = '0.8';
            };

            this.recognition.onresult = (event) => {
                const text = event.results[0][0].transcript;
                if (text.trim()) this.handleUserVoiceInput(text);
            };

            this.recognition.onerror = (event) => {
                if (event.error === 'not-allowed') this.updateCallStatus('麦克风被拒，请直接在底部打字');
                else if (event.error !== 'no-speech') this.updateCallStatus('语音引擎未响应，请直接打字');
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
                this.updateCallStatus('浏览器不支持语音识别，请直接打字');
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
            
            if (window.PhoneUI && window.PhoneUI.getFullScheduleContext) {
                stablePrompt += `${window.PhoneUI.getFullScheduleContext()}\n\n`;
            }

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
            utterance.rate = 1.05;
            utterance.pitch = 1.0;

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
