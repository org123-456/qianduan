export const StudyUI = {
    studyTimer: null,
    studyTimeLeft: 25 * 60,
    isStudying: false,
    currentStudyTab: 'focus', // 'focus' 或 'vocab'
    
    // 高频高考词汇库 (初始种子)
    gaokaoWords: [
        {w: 'abandon', m: 'v. 放弃，抛弃'}, {w: 'abundant', m: 'adj. 丰富的，充裕的'},
        {w: 'accommodate', m: 'v. 容纳，提供住宿'}, {w: 'ambitious', m: 'adj. 有野心的'},
        {w: 'brilliant', m: 'adj. 灿烂的，杰出的'}, {w: 'crucial', m: 'adj. 至关重要的'},
        {w: 'dilemma', m: 'n. 困境，进退两难'}, {w: 'enthusiastic', m: 'adj. 热情的'},
        {w: 'fascinating', m: 'adj. 迷人的'}, {w: 'genuine', m: 'adj. 真实的，真诚的'},
        {w: 'hesitate', m: 'v. 犹豫'}, {w: 'inevitable', m: 'adj. 不可避免的'},
        {w: 'justify', m: 'v. 证明...是正当的'}, {w: 'literary', m: 'adj. 文学的'},
        {w: 'magnificent', m: 'adj. 壮丽的'}, {w: 'negotiate', m: 'v. 谈判，协商'},
        {w: 'obscure', m: 'adj. 模糊的，晦涩的'}, {w: 'phenomenon', m: 'n. 现象'},
        {w: 'reluctant', m: 'adj. 不情愿的'}, {w: 'spontaneous', m: 'adj. 自发的'}
    ],
    currentWord: null,

    switchStudyTab(tab) {
        this.currentStudyTab = tab;
        this.renderStudyRoom();
    },

    initVocabData() {
        if (!localStorage.getItem('vocab_data')) {
            localStorage.setItem('vocab_data', JSON.stringify({
                streak: 0,
                lastDate: '',
                learned: [],
                reviewing: []
            }));
        }
        return JSON.parse(localStorage.getItem('vocab_data'));
    },

    saveVocabData(data) {
        localStorage.setItem('vocab_data', JSON.stringify(data));
    },

    renderStudyRoom() {
        const contentEl = document.getElementById('app-window-content');
        if (!contentEl) return;

        const taAvatar = localStorage.getItem('ta_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=TA&backgroundColor=e8f0fa';
        const taName = localStorage.getItem('char_name') || 'TA';
        const tab = this.currentStudyTab;

        let innerHtml = '';

        if (tab === 'focus') {
            const m = Math.floor(this.studyTimeLeft / 60).toString().padStart(2, '0');
            const s = (this.studyTimeLeft % 60).toString().padStart(2, '0');
            innerHtml = `
                <div style="display: flex; flex-direction: column; align-items: center; margin-top: 20px;">
                    <img src="${taAvatar}" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid var(--primary-color); box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin-bottom: 15px;">
                    <div id="study-ai-bubble" style="background: var(--icon-bg); padding: 15px 20px; border-radius: 20px; border: 1px solid var(--border-color); font-size: 14px; color: var(--text-main); max-width: 90%; text-align: center; position: relative; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                        “高三了，还不快去背书？我会一直在这里盯着你的。”
                        <div style="position: absolute; top: -10px; left: 50%; transform: translateX(-50%); border-width: 0 10px 10px 10px; border-style: solid; border-color: transparent transparent var(--border-color) transparent;"></div>
                    </div>
                    
                    <div style="position: relative; width: 200px; height: 200px; border-radius: 50%; background: linear-gradient(135deg, var(--bg-gradient-start), var(--bg-gradient-end)); display: flex; justify-content: center; align-items: center; box-shadow: inset 0 0 20px rgba(0,0,0,0.05), 0 10px 30px rgba(0,0,0,0.1); border: 8px solid #fff; margin: 40px 0;">
                        <div id="study-time-display" style="font-size: 48px; font-weight: bold; font-family: monospace; color: var(--primary-color);">${m}:${s}</div>
                    </div>

                    <button class="btn-refresh" onclick="window.PhoneUI.startStudyLock()" style="width: 180px; border-radius: 24px; font-size: 16px; background: var(--primary-color); color: #fff;">
                        <i class="ph-fill ph-lock-key"></i> 开启强制专注
                    </button>
                </div>
            `;
        } else {
            const vData = this.initVocabData();
            innerHtml = `
                <div style="padding: 10px;">
                    <div class="card" style="display: flex; justify-content: space-around; text-align: center; margin-bottom: 20px; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: #fff;">
                        <div>
                            <div style="font-size: 24px; font-weight: bold;">${vData.streak}</div>
                            <div style="font-size: 12px; opacity: 0.8;">连续打卡(天)</div>
                        </div>
                        <div>
                            <div style="font-size: 24px; font-weight: bold;">${vData.learned.length}</div>
                            <div style="font-size: 12px; opacity: 0.8;">已掌握词汇</div>
                        </div>
                        <div>
                            <div style="font-size: 24px; font-weight: bold;">${vData.reviewing.length}</div>
                            <div style="font-size: 12px; opacity: 0.8;">待复习</div>
                        </div>
                    </div>

                    <div id="vocab-work-area" style="min-height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 15px;">
                        <img src="${taAvatar}" style="width: 60px; height: 60px; border-radius: 50%; border: 2px solid var(--primary-color);">
                        <div style="font-size: 14px; color: var(--text-sub); text-align: center;">“今天也要好好背单词哦，高考加油！”</div>
                        <div style="display: flex; gap: 15px; margin-top: 20px; width: 100%;">
                            <button class="btn-refresh" onclick="window.PhoneUI.startLearnVocab()" style="flex: 1; background: var(--primary-color); color: #fff; border-radius: 12px;"><i class="ph-fill ph-book-open"></i> 学习新词</button>
                            <button class="btn-refresh" onclick="window.PhoneUI.startReviewVocab()" style="flex: 1; background: #f4a261; color: #fff; border-radius: 12px;"><i class="ph-fill ph-arrows-clockwise"></i> 复习巩固</button>
                        </div>
                    </div>
                </div>
            `;
        }

        contentEl.innerHTML = `
            <div class="vault-tabs" style="margin-bottom: 10px;">
                <div class="vault-tab ${tab === 'focus' ? 'active' : ''}" onclick="window.PhoneUI.switchStudyTab('focus')">番茄自习</div>
                <div class="vault-tab ${tab === 'vocab' ? 'active' : ''}" onclick="window.PhoneUI.switchStudyTab('vocab')">单词特训</div>
            </div>
            ${innerHtml}
        `;
    },

    // ================= 强制锁机模块 =================
    startStudyLock() {
        if (this.isStudying) return;
        this.isStudying = true;
        
        let lockScreen = document.getElementById('study-lock-screen');
        if (!lockScreen) {
            lockScreen = document.createElement('div');
            lockScreen.id = 'study-lock-screen';
            document.body.appendChild(lockScreen);
        }

        const taAvatar = localStorage.getItem('ta_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=TA&backgroundColor=e8f0fa';
        
        // 🌟 唯美动画背景
        lockScreen.style.cssText = `
            position: fixed; inset: 0; z-index: 99999; display: flex; flex-direction: column; align-items: center; padding: 60px 20px 20px; color: #fff;
            background: url('${taAvatar}') center/cover no-repeat;
        `;
        
        lockScreen.innerHTML = `
            <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(25px); z-index: 1;"></div>
            
            <div style="position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; width: 100%; height: 100%;">
                <div style="font-size: 14px; color: rgba(255,255,255,0.7); font-weight: bold; margin-bottom: 10px; letter-spacing: 2px;"><i class="ph-fill ph-lock-key"></i> 沉浸陪伴中</div>
                <div id="lock-time-display" style="font-size: 72px; font-weight: bold; font-family: monospace; color: #fff; margin-bottom: 40px; text-shadow: 0 0 20px rgba(255,255,255,0.5);">25:00</div>
                
                <style>
                    @keyframes breathe { 0% { transform: scale(1); box-shadow: 0 0 10px rgba(255,255,255,0.2); } 50% { transform: scale(1.08); box-shadow: 0 0 30px rgba(255,255,255,0.6); } 100% { transform: scale(1); box-shadow: 0 0 10px rgba(255,255,255,0.2); } }
                </style>
                <img src="${taAvatar}" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.8); margin-bottom: 20px; animation: breathe 4s infinite ease-in-out;">
                
                <div id="lock-chat-box" style="flex: 1; width: 100%; background: rgba(255,255,255,0.1); border-radius: 16px; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.2);">
                    <div style="align-self: flex-start; background: rgba(255,255,255,0.2); padding: 10px 15px; border-radius: 12px; font-size: 14px; max-width: 85%;">
                        “安心看书。别想切出去玩手机，除非你能撒娇说服我解开。”
                    </div>
                </div>

                <div style="display: flex; width: 100%; gap: 10px;">
                    <input type="text" id="lock-input" placeholder="撒个娇试试..." style="flex: 1; padding: 12px 15px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.3); background: rgba(0,0,0,0.2); color: #fff; outline: none; font-size: 14px;">
                    <button onclick="window.PhoneUI.begToUnlock()" style="background: var(--primary-color); color: #fff; border: none; border-radius: 20px; padding: 0 20px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">求饶</button>
                </div>
            </div>
        `;

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

    async begToUnlock() {
        const input = document.getElementById('lock-input');
        const chatBox = document.getElementById('lock-chat-box');
        if (!input || !input.value.trim() || !chatBox) return;

        const userText = input.value.trim();
        input.value = '';

        chatBox.innerHTML += `<div style="align-self: flex-end; background: var(--primary-color); color: #fff; padding: 10px 15px; border-radius: 12px; font-size: 14px; max-width: 85%;">${window.PhoneUI.escapeHtml(userText)}</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;

        const loadingId = 'loading-' + Date.now();
        chatBox.innerHTML += `<div id="${loadingId}" style="align-self: flex-start; background: rgba(255,255,255,0.1); padding: 10px 15px; border-radius: 12px; font-size: 14px; max-width: 85%; color: rgba(255,255,255,0.6);">TA 正在审视你...</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;

        try {
            const persona = localStorage.getItem('char_persona') || '';
            const myName = localStorage.getItem('my_name') || '我';
            const taName = localStorage.getItem('char_name') || 'TA';
            
            let sysPrompt = `你扮演${taName}，用户是${myName}。${persona}\n`;
            sysPrompt += `【场景】：用户正在被你“强制锁机”背书，但TA正在向你撒娇求饶，想提前玩手机。\n`;
            sysPrompt += `【任务】：根据用户的语气，决定是否心软放过TA。如果不放过，严厉驳回；如果放过，傲娇或温柔地同意。\n`;
            sysPrompt += `【输出】：必须返回严格JSON：{"unlock": true/false, "reply": "你的回复"}\n`;

            const reply = await window.PhoneAPI.chatWithAI([
                { role: 'system', content: sysPrompt },
                { role: 'user', content: userText }
            ]);
            
            const result = JSON.parse(reply.replace(/```json/g, '').replace(/```/g, '').trim());

            document.getElementById(loadingId).remove();
            chatBox.innerHTML += `<div style="align-self: flex-start; background: rgba(255,255,255,0.2); padding: 10px 15px; border-radius: 12px; font-size: 14px; max-width: 85%;">${window.PhoneUI.escapeHtml(result.reply)}</div>`;
            chatBox.scrollTop = chatBox.scrollHeight;

            if (result.unlock) {
                setTimeout(() => {
                    this.unlockScreen();
                    if (window.PhoneAPI) window.PhoneAPI.showToast("TA 心软了，放过了你~");
                }, 2000);
            }

        } catch (e) {
            document.getElementById(loadingId).innerText = "网络有点卡，继续背书！";
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

    // ================= 背单词模块 =================
    async startLearnVocab() {
        const vData = this.initVocabData();
        const unlearned = this.gaokaoWords.filter(w => !vData.learned.includes(w.w));
        
        if (unlearned.length === 0) {
            if (window.PhoneAPI) window.PhoneAPI.showToast("太强了！内置词汇全背完了！");
            return;
        }

        this.currentWord = unlearned[Math.floor(Math.random() * unlearned.length)];
        this.renderVocabCard('learn');
    },

    async startReviewVocab() {
        const vData = this.initVocabData();
        if (vData.reviewing.length === 0) {
            if (window.PhoneAPI) window.PhoneAPI.showToast("当前没有需要复习的单词哦~");
            return;
        }
        
        const wordStr = vData.reviewing[Math.floor(Math.random() * vData.reviewing.length)];
        this.currentWord = this.gaokaoWords.find(w => w.w === wordStr) || {w: wordStr, m: '未知词意'};
        this.renderVocabCard('review');
    },

    async renderVocabCard(mode) {
        const area = document.getElementById('vocab-work-area');
        if (!area || !this.currentWord) return;

        const taAvatar = localStorage.getItem('ta_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=TA&backgroundColor=e8f0fa';

        area.innerHTML = `
            <div class="card" style="width: 100%; text-align: center; padding: 30px 20px;">
                <div style="font-size: 36px; font-weight: bold; color: var(--primary-color); margin-bottom: 10px;">${this.currentWord.w}</div>
                <div style="font-size: 16px; color: var(--text-sub); margin-bottom: 25px;">${this.currentWord.m}</div>
                
                <div style="display: flex; gap: 10px; align-items: flex-start; text-align: left; background: var(--icon-bg); padding: 15px; border-radius: 12px; margin-bottom: 25px;">
                    <img src="${taAvatar}" style="width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;">
                    <div id="vocab-ai-explain" style="font-size: 14px; color: var(--text-main); line-height: 1.5;">
                        <i class="ph ph-spinner ph-spin"></i> TA 正在绞尽脑汁帮你编记忆法...
                    </div>
                </div>

                <div style="display: flex; gap: 15px; width: 100%;">
                    <button class="btn-refresh" onclick="window.PhoneUI.markWordResult(false, '${mode}')" style="flex: 1; background: var(--icon-bg); color: var(--text-main); border: 1px solid var(--border-color);"><i class="ph ph-x"></i> 没记住</button>
                    <button class="btn-refresh" onclick="window.PhoneUI.markWordResult(true, '${mode}')" style="flex: 1; background: #4ade80; color: #fff;"><i class="ph-fill ph-check"></i> 记住了</button>
                </div>
            </div>
        `;

        // 请求 AI 讲解
        try {
            const persona = localStorage.getItem('char_persona') || '';
            const taName = localStorage.getItem('char_name') || 'TA';
            let sysPrompt = `你扮演${taName}。${persona}\n【任务】：用户正在背高考英语单词【${this.currentWord.w}】（${this.currentWord.m}）。\n【要求】：请用符合你人设的语气，给出一段简短、有趣、容易记住的记忆法（比如谐音梗、词根拆解、或者搞笑例句）。字数80字以内。`;
            
            const reply = await window.PhoneAPI.chatWithAI([{ role: 'system', content: sysPrompt }]);
            document.getElementById('vocab-ai-explain').innerHTML = window.PhoneUI.escapeHtml(reply);
        } catch (e) {
            document.getElementById('vocab-ai-explain').innerText = "网络开小差了，你自己多读几遍吧！";
        }
    },

    markWordResult(remembered, mode) {
        let vData = this.initVocabData();
        const word = this.currentWord.w;

        // 打卡逻辑
        const today = new Date().toDateString();
        if (vData.lastDate !== today) {
            vData.streak += 1;
            vData.lastDate = today;
            if (window.PhoneAPI) window.PhoneAPI.showToast("🎉 每日背词打卡成功！");
        }

        if (mode === 'learn') {
            if (remembered) {
                if (!vData.learned.includes(word)) vData.learned.push(word);
                if (!vData.reviewing.includes(word)) vData.reviewing.push(word); // 加入复习池
            }
        } else if (mode === 'review') {
            if (remembered) {
                vData.reviewing = vData.reviewing.filter(w => w !== word); // 移出复习池
            }
        }

        this.saveVocabData(vData);
        
        // 自动下一个
        if (mode === 'learn') this.startLearnVocab();
        else this.startReviewVocab();
    }
};
