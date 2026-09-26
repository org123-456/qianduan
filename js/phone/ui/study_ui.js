export const StudyUI = {
    studyTimer: null,
    studyTimeLeft: 25 * 60, // 默认 25 分钟
    isStudying: false,

    renderStudyRoom() {
        const contentEl = document.getElementById('app-window-content');
        if (!contentEl) return;

        const taAvatar = localStorage.getItem('ta_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=TA&backgroundColor=e8f0fa';
        
        const m = Math.floor(this.studyTimeLeft / 60).toString().padStart(2, '0');
        const s = (this.studyTimeLeft % 60).toString().padStart(2, '0');

        contentEl.innerHTML = `
            <div style="display: flex; flex-direction: column; height: 100%; align-items: center; padding: 20px 10px;">
                <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 40px; width: 100%;">
                    <img src="${taAvatar}" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid var(--primary-color); box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin-bottom: 15px;">
                    <div id="study-ai-bubble" style="background: var(--icon-bg); padding: 15px 20px; border-radius: 20px; border: 1px solid var(--border-color); font-size: 14px; color: var(--text-main); max-width: 90%; text-align: center; position: relative; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                        “准备好开始学习了吗？一旦开始，没有我的允许，你别想退出。”
                        <div style="position: absolute; top: -10px; left: 50%; transform: translateX(-50%); border-width: 0 10px 10px 10px; border-style: solid; border-color: transparent transparent var(--border-color) transparent;"></div>
                        <div style="position: absolute; top: -8px; left: 50%; transform: translateX(-50%); border-width: 0 9px 9px 9px; border-style: solid; border-color: transparent transparent var(--icon-bg) transparent;"></div>
                    </div>
                </div>

                <div style="position: relative; width: 220px; height: 220px; border-radius: 50%; background: linear-gradient(135deg, var(--bg-gradient-start), var(--bg-gradient-end)); display: flex; justify-content: center; align-items: center; box-shadow: inset 0 0 20px rgba(0,0,0,0.05), 0 10px 30px rgba(0,0,0,0.1); border: 8px solid #fff; margin-bottom: 40px;">
                    <div id="study-time-display" style="font-size: 48px; font-weight: bold; font-family: monospace; color: var(--primary-color);">${m}:${s}</div>
                </div>

                <div style="display: flex; gap: 15px; width: 100%; justify-content: center; margin-bottom: 20px;">
                    <button id="btn-study-start" class="btn-refresh" onclick="window.PhoneUI.startStudyLock()" style="margin: 0; width: 160px; border-radius: 24px; font-size: 16px; background: var(--primary-color); color: #fff;">
                        <i class="ph-fill ph-lock-key"></i> 开启强制专注
                    </button>
                </div>
            </div>
        `;
    },

    // 🌟 核心：开启强制锁机模式
    startStudyLock() {
        if (this.isStudying) return;
        this.isStudying = true;
        
        // 创建全屏遮罩
        let lockScreen = document.getElementById('study-lock-screen');
        if (!lockScreen) {
            lockScreen = document.createElement('div');
            lockScreen.id = 'study-lock-screen';
            lockScreen.style.cssText = 'position: fixed; inset: 0; background: #111; z-index: 99999; display: flex; flex-direction: column; align-items: center; padding: 50px 20px 20px; color: #fff;';
            document.body.appendChild(lockScreen);
        }

        const taAvatar = localStorage.getItem('ta_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=TA&backgroundColor=e8f0fa';
        
        lockScreen.innerHTML = `
            <div style="font-size: 16px; color: #ff4b4b; font-weight: bold; margin-bottom: 20px; letter-spacing: 2px;"><i class="ph-fill ph-warning"></i> 强制专注模式中</div>
            <div id="lock-time-display" style="font-size: 72px; font-weight: bold; font-family: monospace; color: #fff; margin-bottom: 30px; text-shadow: 0 0 20px rgba(255,255,255,0.5);">25:00</div>
            
            <img src="${taAvatar}" style="width: 60px; height: 60px; border-radius: 50%; border: 2px solid #fff; margin-bottom: 15px;">
            
            <div id="lock-chat-box" style="flex: 1; width: 100%; background: rgba(255,255,255,0.05); border-radius: 16px; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px;">
                <div style="align-self: flex-start; background: rgba(255,255,255,0.1); padding: 10px 15px; border-radius: 12px; font-size: 14px; max-width: 85%;">
                    “别想切出去玩手机。除非你能说服我，否则别想解开。”
                </div>
            </div>

            <div style="display: flex; width: 100%; gap: 10px;">
                <input type="text" id="lock-input" placeholder="撒个娇试试..." style="flex: 1; padding: 12px 15px; border-radius: 20px; border: none; background: rgba(255,255,255,0.1); color: #fff; outline: none; font-size: 14px;">
                <button onclick="window.PhoneUI.begToUnlock()" style="background: #ff4b4b; color: #fff; border: none; border-radius: 20px; padding: 0 20px; font-weight: bold; cursor: pointer;">求饶</button>
            </div>
        `;

        // 启动倒计时
        this.studyTimer = setInterval(() => {
            if (this.studyTimeLeft > 0) {
                this.studyTimeLeft--;
                const m = Math.floor(this.studyTimeLeft / 60).toString().padStart(2, '0');
                const s = (this.studyTimeLeft % 60).toString().padStart(2, '0');
                const display = document.getElementById('lock-time-display');
                if (display) display.innerText = `${m}:${s}`;
            } else {
                this.finishStudy();
            }
        }, 1000);
    },

    // 🌟 核心：向 AI 撒娇求解锁
    async begToUnlock() {
        const input = document.getElementById('lock-input');
        const chatBox = document.getElementById('lock-chat-box');
        if (!input || !input.value.trim() || !chatBox) return;

        const userText = input.value.trim();
        input.value = '';

        // 用户发言上屏
        chatBox.innerHTML += `<div style="align-self: flex-end; background: var(--primary-color); color: #fff; padding: 10px 15px; border-radius: 12px; font-size: 14px; max-width: 85%;">${this.escapeHtml(userText)}</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;

        // AI 思考中
        const loadingId = 'loading-' + Date.now();
        chatBox.innerHTML += `<div id="${loadingId}" style="align-self: flex-start; background: rgba(255,255,255,0.1); padding: 10px 15px; border-radius: 12px; font-size: 14px; max-width: 85%; color: rgba(255,255,255,0.5);">TA 正在盯着你...</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;

        try {
            const persona = localStorage.getItem('char_persona') || '';
            const myName = localStorage.getItem('my_name') || '我';
            const taName = localStorage.getItem('char_name') || 'TA';
            
            let sysPrompt = `你扮演${taName}，用户是${myName}。${persona}\n`;
            sysPrompt += `【当前场景】：用户正在被你“强制锁机”学习，但TA受不了了，正在向你撒娇求饶，想提前结束专注。\n`;
            sysPrompt += `【你的任务】：根据用户的语气，决定是否心软放过TA。如果不放过，就严厉驳回；如果放过，就傲娇或温柔地同意。\n`;
            sysPrompt += `【输出要求】：必须返回严格的JSON格式：{"unlock": true/false, "reply": "你的回复"}\n`;
            sysPrompt += `注意：reply 必须是一句符合人设的简短的话，不要动作描写。`;

            const reply = await window.PhoneAPI.chatWithAI([
                { role: 'system', content: sysPrompt },
                { role: 'user', content: userText }
            ]);
            
            let cleanJson = reply.replace(/```json/g, '').replace(/```/g, '').trim();
            const result = JSON.parse(cleanJson);

            document.getElementById(loadingId).remove();
            chatBox.innerHTML += `<div style="align-self: flex-start; background: rgba(255,255,255,0.1); padding: 10px 15px; border-radius: 12px; font-size: 14px; max-width: 85%;">${this.escapeHtml(result.reply)}</div>`;
            chatBox.scrollTop = chatBox.scrollHeight;

            if (result.unlock) {
                // AI 心软了，解锁！
                setTimeout(() => {
                    this.unlockScreen();
                    if (window.PhoneAPI) window.PhoneAPI.showToast("TA 心软了，放过了你~");
                }, 2000);
            }

        } catch (e) {
            document.getElementById(loadingId).innerText = "网络有点卡，继续学！";
        }
    },

    unlockScreen() {
        clearInterval(this.studyTimer);
        this.isStudying = false;
        this.studyTimeLeft = 25 * 60;
        
        const lockScreen = document.getElementById('study-lock-screen');
        if (lockScreen) lockScreen.remove();
        
        this.renderStudyRoom();
    },

    finishStudy() {
        this.unlockScreen();
        if (window.PhoneAPI) {
            window.PhoneAPI.showToast("🎉 太棒啦！完成了 25 分钟专注！");
            window.PhoneAPI.saveFavorite("完成了一次 25 分钟的强制专注学习！", "自习室", "me");
        }
    },

    escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }
};
