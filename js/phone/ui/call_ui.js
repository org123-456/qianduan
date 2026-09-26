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
                this.updateCallStatus('正在听你说...');
                const wave = document.getElementById('call-avatar-wave');
                if (wave) wave.classList.add('active');
            };

            this.recognition.onresult = (event) => {
                const text = event.results[0][0].transcript;
                if (text.trim()) {
                    this.handleUserVoiceInput(text);
                }
            };

            this.recognition.onerror = (event) => {
                console.error("语音识别错误:", event.error);
                if (event.error === 'not-allowed') {
                    this.updateCallStatus('麦克风权限被拒绝');
                } else if (event.error !== 'no-speech') {
                    this.updateCallStatus('没听清...');
                }
                const wave = document.getElementById('call-avatar-wave');
                if (wave) wave.classList.remove('active');
            };

            this.recognition.onend = () => {
                const wave = document.getElementById('call-avatar-wave');
                if (wave) wave.classList.remove('active');
                
                if (this.isCalling && !this.isAiSpeaking) {
                    setTimeout(() => {
                        if (this.isCalling && !this.isAiSpeaking) {
                            try { this.recognition.start(); } catch(e){}
                        }
                    }, 300);
                }
            };
        } else {
            console.warn("当前浏览器不支持原生语音识别");
        }
    },

    openCallScreen() {
        if (window.PhoneUI) window.PhoneUI.closeChatMenu();
        if (!this.recognition) this.initCallSystem();
        
        const screen = document.getElementById('call-screen');
        const taName = localStorage.getItem('char_name') || 'TA';
        const taAvatar = localStorage.getItem('ta_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=TA&backgroundColor=e8f0fa';
        
        document.getElementById('call-ta-name').innerText = taName;
        document.getElementById('call-ta-avatar').src = taAvatar;
        document.getElementById('call-bg-blur').style.backgroundImage = `url(${taAvatar})`;
        document.getElementById('call-subtitles').innerHTML = '';
        
        screen.classList.add('show');
        this.isCalling = true;
        this.isAiSpeaking = false;
        
        this.updateCallStatus('正在连接...');
        
        setTimeout(() => {
            if (!this.isCalling) return;
            this.updateCallStatus('已接通');
            
            if (this.recognition) {
                try { this.recognition.start(); } catch(e){}
            } else {
                this.updateCallStatus('浏览器不支持语音，无法收音');
            }
        }, 1500);
    },

    endCall() {
        this.isCalling = false;
        this.isAiSpeaking = false;
        const screen = document.getElementById('call-screen');
        if (screen) screen.classList.remove('show');
        
        if (this.recognition) {
            try { this.recognition.stop(); } catch(e){}
        }
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
        div.className = `call-subtitle-item ${role === '我' ? 'me' : 'ta'}`;
        div.innerText = text;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    },

    async handleUserVoiceInput(text) {
        if (!this.isCalling) return;
        
        this.isAiSpeaking = true;
        this.appendSubtitle('我', text);
        this.updateCallStatus('TA 正在听...');
        
        const roleId = window.Config?.currentContactId;
        const chatItems = window.Config.phoneData[roleId].wechat.items;
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        
        chatItems.push({ sender: 'me', content: `📞 [语音通话]: ${text}`, time: timeStr, date: dateStr });
        if (window.PhoneUI) window.PhoneUI.renderAppContent('wechat');

        try {
            const systemPrompt = localStorage.getItem('system_prompt') || '';
            const charPersona = localStorage.getItem('char_persona') || '';
            
            let stablePrompt = `【系统状态】：你现在正在和用户打“语音电话”。\n【要求】：请保持你的人设，用自然、口语化的简短语言回复，就像真人在通电话一样，不要发表情包和动作描写。\n\n`;
            if (systemPrompt) stablePrompt += `【系统核心指令】：\n${systemPrompt}\n\n`;
            if (charPersona) stablePrompt += `【角色设定】：\n${charPersona}\n\n`;

            let messages = [{ role: 'system', content: stablePrompt }];
            
            const recentItems = chatItems.slice(-20);
            recentItems.forEach((item) => {
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
                if (this.recognition) {
                    try { this.recognition.start(); } catch(e){}
                }
            };

            utterance.onerror = () => {
                this.isAiSpeaking = false;
                if (this.recognition) {
                    try { this.recognition.start(); } catch(e){}
                }
            };

            window.speechSynthesis.speak(utterance);

        } catch (error) {
            console.error(error);
            this.updateCallStatus('网络信号不佳...');
            this.isAiSpeaking = false;
            if (this.recognition) {
                setTimeout(() => { try { this.recognition.start(); } catch(e){} }, 1000);
            }
        }
    }
};
