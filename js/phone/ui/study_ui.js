export const StudyUI = {
    studyTimer: null,
    selectedTime: 25, 
    studyTimeLeft: 25 * 60,
    isStudying: false,
    currentStudyTab: 'focus', 
    isPoking: false, 
    reminderTimer: null, 
    sessionWordCount: 0, // 记录本次连续背了几个单词
    currentVocabBookTab: 'review', // 词汇本当前的 tab
    
    gaokaoWords: [
        {w: 'abandon', m: 'v. 放弃，抛弃'}, {w: 'abnormal', m: 'a. 反常的'},
        {w: 'abundant', m: 'a. 丰富的'}, {w: 'academy', m: 'n. 专科学院'},
        {w: 'accelerate', m: 'v. 加速'}, {w: 'accent', m: 'n. 口音'}
    ],
    currentWord: null,
    ebbinghausIntervals: [1, 2, 4, 7, 15, 30],

    initVocabData() {
        let data = localStorage.getItem('vocab_data');
        let parsed = data ? JSON.parse(data) : {};
        if (!parsed.checkinDates) parsed.checkinDates = [];
        if (!parsed.customWords) parsed.customWords = [];
        if (!parsed.records) parsed.records = {}; 
        localStorage.setItem('vocab_data', JSON.stringify(parsed));
        return parsed;
    },

    saveVocabData(data) {
        localStorage.setItem('vocab_data', JSON.stringify(data));
    },

    switchStudyTab(tab) {
        this.currentStudyTab = tab;
        this.renderStudyRoom();
    },

    changeStudyTime(minutes) {
        this.selectedTime = parseInt(minutes);
        this.studyTimeLeft = this.selectedTime * 60;
        const m = Math.floor(this.studyTimeLeft / 60).toString().padStart(2, '0');
        const s = (this.studyTimeLeft % 60).toString().padStart(2, '0');
        const display = document.getElementById('study-time-display');
        if (display) display.innerText = `${m}:${s}`;
    },

    // 🌟 全局查岗弹窗（带一键跳转）
    checkStudyReminder() {
        if (this.reminderTimer) return; 
        this.reminderTimer = setInterval(() => {
            const vData = this.initVocabData();
            const today = new Date().toLocaleDateString('zh-CN'); 
            if (!vData.checkinDates.includes(today) && window.Config?.currentAppId !== 'study') {
                if (Math.random() < 0.1) {
                    this.showGlobalNotification("喂，今天的单词还没背！高三了还敢摸鱼？");
                }
            }
        }, 60000); 
    },

    showGlobalNotification(msg) {
        const taAvatar = localStorage.getItem('ta_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=TA&backgroundColor=e8f0fa';
        const taName = localStorage.getItem('char_name') || 'TA';
        let notif = document.getElementById('study-global-notif');
        if (notif) notif.remove();

        notif = document.createElement('div');
        notif.id = 'study-global-notif';
        notif.style.cssText = `position: fixed; top: -120px; left: 5%; width: 90%; background: var(--window-bg); box-shadow: 0 10px 30px rgba(0,0,0,0.2); border-radius: 16px; padding: 15px; display: flex; align-items: center; gap: 15px; z-index: 999999; transition: top 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); border: 1px solid var(--primary-color);`;
        
        notif.innerHTML = `
            <img src="${taAvatar}" style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-color);">
            <div style="flex: 1;">
                <div style="font-size: 14px; font-weight: bold; color: var(--text-main); margin-bottom: 4px;">${this.escapeHtml(taName)}</div>
                <div style="font-size: 13px; color: var(--text-sub); line-height: 1.4;">${this.escapeHtml(msg)}</div>
            </div>
            <button style="background: var(--primary-color); color: #fff; border: none; padding: 6px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; cursor: pointer; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
                一键去背书
            </button>
        `;
        
        notif.onclick = () => { 
            notif.style.top = '-120px'; 
            setTimeout(() => notif.remove(), 500); 
            if (window.PhoneUI) window.PhoneUI.openApp('study', '伴学空间'); 
        };
        
        document.body.appendChild(notif);
        setTimeout(() => { notif.style.top = '20px'; }, 100);
        setTimeout(() => { notif.style.top = '-120px'; setTimeout(() => notif.remove(), 500); }, 6000);
    },

    renderCalendarHTML(checkinDates) {
        const now = new Date();
        const y = now.getFullYear(), m = now.getMonth();
        const daysInMonth = new Date(y, m + 1, 0).getDate();
        const firstDay = new Date(y, m, 1).getDay();
        const todayStr = now.toLocaleDateString('zh-CN');

        let html = `<div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; text-align: center; font-size: 12px; color: var(--text-sub); margin-bottom: 10px;"><div>日</div><div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div>六</div></div><div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; text-align: center;">`;
        for (let i = 0; i < firstDay; i++) html += `<div></div>`;
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = new Date(y, m, d).toLocaleDateString('zh-CN');
            const isChecked = checkinDates.includes(dateStr);
            const isToday = dateStr === todayStr;
            let bg = 'transparent', color = 'var(--text-main)', border = 'none';
            if (isChecked) { bg = 'var(--primary-color)'; color = '#fff'; } 
            else if (isToday) { border = '1px solid var(--primary-color)'; color = 'var(--primary-color)'; }
            html += `<div style="width: 28px; height: 28px; line-height: 28px; margin: 0 auto; border-radius: 50%; background: ${bg}; color: ${color}; border: ${border}; font-weight: ${isChecked || isToday ? 'bold' : 'normal'};">${d}</div>`;
        }
        html += `</div>`;
        return html;
    },

    importCustomVocab(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.split('\n');
            let newWords = [];
            lines.forEach(line => {
                const parts = line.trim().split(/[\s\-，,]+/);
                if (parts.length >= 2) {
                    const w = parts[0];
                    const m = parts.slice(1).join(' ');
                    newWords.push({ w, m });
                }
            });
            if (newWords.length > 0) {
                let vData = this.initVocabData();
                vData.customWords = vData.customWords.concat(newWords);
                this.saveVocabData(vData);
                if (window.PhoneAPI) window.PhoneAPI.showToast(`✅ 成功导入 ${newWords.length} 个单词！`);
                this.renderStudyRoom();
            } else {
                if (window.PhoneAPI) window.PhoneAPI.showToast(`❌ 解析失败，请检查 txt 格式`);
            }
        };
        reader.readAsText(file);
    },

    // 🌟 词汇本模块
    openVocabBook() {
        let modal = document.getElementById('vocab-book-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'vocab-book-modal';
            modal.className = 'action-sheet';
            modal.style.cssText = `height: 80vh; display: flex; flex-direction: column; padding: 20px 15px; z-index: 9999;`;
            document.body.appendChild(modal);
            
            let bg = document.createElement('div');
            bg.id = 'vocab-book-bg';
            bg.className = 'action-sheet-bg';
            bg.onclick = () => this.closeVocabBook();
            document.body.appendChild(bg);
        }
        
        document.getElementById('vocab-book-bg').classList.add('show');
        modal.classList.add('show');
        this.renderVocabBookContent();
    },

    closeVocabBook() {
        const bg = document.getElementById('vocab-book-bg');
        const modal = document.getElementById('vocab-book-modal');
        if (bg) bg.classList.remove('show');
        if (modal) modal.classList.remove('show');
    },

    switchVocabBookTab(tab) {
        this.currentVocabBookTab = tab;
        this.renderVocabBookContent();
    },

    renderVocabBookContent() {
        const modal = document.getElementById('vocab-book-modal');
        if (!modal) return;

        const vData = this.initVocabData();
        const allWords = this.gaokaoWords.concat(vData.customWords);
        const now = Date.now();

        let reviewList = [];
        let learningList = [];
        let masteredList = [];

        Object.keys(vData.records).forEach(w => {
            const record = vData.records[w];
            const wordObj = allWords.find(item => item.w === w) || { w: w, m: '未知' };
            if (record.step >= 5) {
                masteredList.push(wordObj);
            } else if (record.nextReview <= now) {
                reviewList.push(wordObj);
            } else {
                learningList.push(wordObj);
            }
        });

        let currentList = [];
        if (this.currentVocabBookTab === 'review') currentList = reviewList;
        else if (this.currentVocabBookTab === 'learning') currentList = learningList;
        else currentList = masteredList;

        let listHtml = currentList.map(item => `
            <div style="padding: 12px; border-bottom: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 4px;">
                <div style="font-size: 16px; font-weight: bold; color: var(--primary-color);">${this.escapeHtml(item.w)}</div>
                <div style="font-size: 13px; color: var(--text-sub);">${this.escapeHtml(item.m)}</div>
            </div>
        `).join('');

        if (currentList.length === 0) {
            listHtml = `<div style="text-align:center; color:var(--text-sub); margin-top:50px;">空空如也~</div>`;
        }

        modal.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-shrink: 0;">
                <span style="font-weight: bold; font-size: 16px; color: var(--text-main);">📖 我的词汇本</span>
                <i class="ph ph-x" style="font-size: 20px; color: var(--text-sub); cursor: pointer;" onclick="window.PhoneUI.closeVocabBook()"></i>
            </div>
            <div class="vault-tabs" style="margin-bottom: 15px; flex-shrink: 0;">
                <div class="vault-tab ${this.currentVocabBookTab === 'review' ? 'active' : ''}" onclick="window.PhoneUI.switchVocabBookTab('review')">待复习 (${reviewList.length})</div>
                <div class="vault-tab ${this.currentVocabBookTab === 'learning' ? 'active' : ''}" onclick="window.PhoneUI.switchVocabBookTab('learning')">巩固中 (${learningList.length})</div>
                <div class="vault-tab ${this.currentVocabBookTab === 'mastered' ? 'active' : ''}" onclick="window.PhoneUI.switchVocabBookTab('mastered')">已掌握 (${masteredList.length})</div>
            </div>
            <div style="flex: 1; overflow-y: auto; background: var(--icon-bg); border-radius: 12px; border: 1px solid var(--border-color);">
                ${listHtml}
            </div>
        `;
    },

    renderStudyRoom() {
        const contentEl = document.getElementById('app-window-content');
        if (!contentEl) return;

        this.checkStudyReminder();
        const taAvatar = localStorage.getItem('ta_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=TA&backgroundColor=e8f0fa';
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
                    <div style="position: relative; width: 200px; height: 200px; border-radius: 50%; background: linear-gradient(135deg, var(--bg-gradient-start), var(--bg-gradient-end)); display: flex; justify-content: center; align-items: center; box-shadow: inset 0 0 20px rgba(0,0,0,0.05), 0 10px 30px rgba(0,0,0,0.1); border: 8px solid #fff; margin: 30px 0 20px 0;">
                        <div id="study-time-display" style="font-size: 48px; font-weight: bold; font-family: monospace; color: var(--primary-color);">${m}:${s}</div>
                    </div>
                    <div style="margin-bottom: 25px; display: flex; align-items: center; gap: 10px;">
                        <label style="font-size: 13px; color: var(--text-sub); font-weight: bold;">设定时长:</label>
                        <select onchange="window.PhoneUI.changeStudyTime(this.value)" style="background: var(--icon-bg); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 12px; padding: 6px 12px; outline: none; font-size: 13px; font-weight: bold;">
                            <option value="5" ${this.selectedTime === 5 ? 'selected' : ''}>5 分钟 (摸鱼专用)</option>
                            <option value="15" ${this.selectedTime === 15 ? 'selected' : ''}>15 分钟 (小憩背词)</option>
                            <option value="25" ${this.selectedTime === 25 ? 'selected' : ''}>25 分钟 (标准番茄)</option>
                            <option value="45" ${this.selectedTime === 45 ? 'selected' : ''}>45 分钟 (一节课)</option>
                            <option value="60" ${this.selectedTime === 60 ? 'selected' : ''}>60 分钟 (深度沉浸)</option>
                        </select>
                    </div>
                    <button class="btn-refresh" onclick="window.PhoneUI.startStudyLock()" style="width: 180px; border-radius: 24px; font-size: 16px; background: var(--primary-color); color: #fff; margin-top: 0;">
                        <i class="ph-fill ph-lock-key"></i> 开启强制专注
                    </button>
                </div>
            `;
        } else {
            const vData = this.initVocabData();
            const totalWords = this.gaokaoWords.length + vData.customWords.length;
            const learnedCount = Object.keys(vData.records).length;
            const now = Date.now();
            const needReviewCount = Object.values(vData.records).filter(r => r.nextReview <= now).length;

            innerHtml = `
                <div style="padding: 10px;">
                    <div class="card" style="margin-bottom: 20px;">
                        <div style="font-size: 14px; font-weight: bold; color: var(--primary-color); margin-bottom: 15px; display: flex; justify-content: space-between;">
                            <span><i class="ph-fill ph-calendar-check"></i> 本月打卡</span>
                            <span style="color: var(--text-sub); font-size: 12px;">已打卡 ${vData.checkinDates.length} 天</span>
                        </div>
                        ${this.renderCalendarHTML(vData.checkinDates)}
                    </div>
                    <div class="card" style="display: flex; justify-content: space-around; text-align: center; margin-bottom: 20px; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: #fff;">
                        <div><div style="font-size: 24px; font-weight: bold;">${totalWords}</div><div style="font-size: 12px; opacity: 0.8;">词库总量</div></div>
                        <div><div style="font-size: 24px; font-weight: bold;">${learnedCount}</div><div style="font-size: 12px; opacity: 0.8;">已学词汇</div></div>
                        <div><div style="font-size: 24px; font-weight: bold;">${needReviewCount}</div><div style="font-size: 12px; opacity: 0.8;">今日待复习</div></div>
                    </div>
                    <div id="vocab-work-area" style="min-height: 250px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 15px;">
                        <div style="display: flex; gap: 15px; width: 100%;">
                            <button class="btn-refresh" onclick="window.PhoneUI.startLearnVocab()" style="flex: 1; background: var(--primary-color); color: #fff; border-radius: 12px;"><i class="ph-fill ph-book-open"></i> 学习新词</button>
                            <button class="btn-refresh" onclick="window.PhoneUI.startReviewVocab()" style="flex: 1; background: #f4a261; color: #fff; border-radius: 12px;"><i class="ph-fill ph-arrows-clockwise"></i> 艾宾浩斯复习</button>
                        </div>
                        <div style="display: flex; gap: 15px; width: 100%; margin-top: 10px;">
                            <button class="btn-refresh" onclick="window.PhoneUI.openVocabBook()" style="flex: 1; background: var(--icon-bg); color: var(--text-main); border: 1px solid var(--border-color); border-radius: 12px;"><i class="ph-fill ph-notebook"></i> 我的词汇本</button>
                            <label for="vocab-file-upload" style="flex: 1; display: flex; justify-content: center; align-items: center; background: var(--icon-bg); color: var(--primary-color); border: 1px dashed var(--primary-color); border-radius: 12px; font-size: 14px; font-weight: bold; cursor: pointer; margin: 0;">
                                <i class="ph-fill ph-upload-simple"></i> 导入TXT词库
                            </label>
                            <input type="file" id="vocab-file-upload" accept=".txt" style="display: none;" onchange="window.PhoneUI.importCustomVocab(event)">
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
        lockScreen.style.cssText = `position: fixed; inset: 0; z-index: 99999; display: flex; flex-direction: column; align-items: center; padding: 60px 20px 20px; color: #fff; background: url('${taAvatar}') center/cover no-repeat;`;
        const m = Math.floor(this.studyTimeLeft / 60).toString().padStart(2, '0');
        const s = (this.studyTimeLeft % 60).toString().padStart(2, '0');

        lockScreen.innerHTML = `
            <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(25px); z-index: 1;"></div>
            <div style="position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; width: 100%; height: 100%;">
                <div style="font-size: 14px; color: rgba(255,255,255,0.7); font-weight: bold; margin-bottom: 10px; letter-spacing: 2px;"><i class="ph-fill ph-lock-key"></i> 沉浸陪伴中</div>
                <div id="lock-time-display" style="font-size: 72px; font-weight: bold; font-family: monospace; color: #fff; margin-bottom: 40px;">${m}:${s}</div>
                <style>@keyframes breathe { 0% { transform: scale(1); box-shadow: 0 0 10px rgba(255,255,255,0.2); } 50% { transform: scale(1.08); box-shadow: 0 0 30px rgba(255,255,255,0.6); } 100% { transform: scale(1); box-shadow: 0 0 10px rgba(255,255,255,0.2); } }</style>
                <div style="position: relative; cursor: pointer;" onclick="window.PhoneUI.pokeAvatar()">
                    <img src="${taAvatar}" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.8); margin-bottom: 20px; animation: breathe 4s infinite ease-in-out;">
                </div>
                <div id="lock-chat-box" style="flex: 1; width: 100%; background: rgba(255,255,255,0.1); border-radius: 16px; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px;">
                    <div style="align-self: flex-start; background: rgba(255,255,255,0.2); padding: 10px 15px; border-radius: 12px; font-size: 14px; max-width: 85%;">“安心看书。别想切出去玩手机，除非你能撒娇说服我解开。”</div>
                </div>
                <div style="display: flex; width: 100%; gap: 10px;">
                    <input type="text" id="lock-input" placeholder="撒个娇试试..." style="flex: 1; padding: 12px 15px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.3); background: rgba(0,0,0,0.2); color: #fff; outline: none; font-size: 14px;">
                    <button onclick="window.PhoneUI.begToUnlock()" style="background: var(--primary-color); color: #fff; border: none; border-radius: 20px; padding: 0 20px; font-weight: bold;">求饶</button>
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

    async pokeAvatar() {
        if (!this.isStudying || this.isPoking) return;
        const chatBox = document.getElementById('lock-chat-box');
        this.isPoking = true;
        chatBox.innerHTML += `<div style="align-self: center; background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); padding: 4px 10px; border-radius: 10px; font-size: 12px; margin: 5px 0;">[你偷偷戳了戳 TA 的脸颊]</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
        const loadingId = 'loading-poke-' + Date.now();
        chatBox.innerHTML += `<div id="${loadingId}" style="align-self: flex-start; background: rgba(255,255,255,0.1); padding: 10px 15px; border-radius: 12px; font-size: 14px; max-width: 85%; color: rgba(255,255,255,0.6);">TA 瞪了你一眼...</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;

        try {
            const persona = localStorage.getItem('char_persona') || '';
            const myName = localStorage.getItem('my_name') || '我';
            const taName = localStorage.getItem('char_name') || 'TA';
            let sysPrompt = `你扮演${taName}，用户是${myName}。${persona}\n【场景】：用户正在被你“强制锁机”背书，但TA不好好学，偷偷用手戳了戳你的脸颊。\n【任务】：请用一句话（15字以内）警告TA老实点，语气要符合人设（可以傲娇、冷酷或无奈）。不要动作描写。`;
            const reply = await window.PhoneAPI.chatWithAI([{ role: 'system', content: sysPrompt }, { role: 'user', content: "(戳了戳你的脸颊)" }]);
            document.getElementById(loadingId).remove();
            chatBox.innerHTML += `<div style="align-self: flex-start; background: rgba(255,255,255,0.2); padding: 10px 15px; border-radius: 12px; font-size: 14px; max-width: 85%;">${window.PhoneUI.escapeHtml(reply.replace(/“|”|"/g, ''))}</div>`;
            chatBox.scrollTop = chatBox.scrollHeight;
        } catch (e) {
            document.getElementById(loadingId).innerText = "别闹，看书。";
        }
        setTimeout(() => { this.isPoking = false; }, 2000);
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
            let sysPrompt = `你扮演${taName}，用户是${myName}。${persona}\n【场景】：用户正在被你“强制锁机”背书，但TA正在向你撒娇求饶，想提前玩手机。\n【任务】：根据用户的语气，决定是否心软放过TA。如果不放过，严厉驳回；如果放过，傲娇或温柔地同意。\n【输出】：必须返回严格JSON：{"unlock": true/false, "reply": "你的回复"}\n`;
            const reply = await window.PhoneAPI.chatWithAI([{ role: 'system', content: sysPrompt }, { role: 'user', content: userText }]);
            const result = JSON.parse(reply.replace(/```json/g, '').replace(/```/g, '').trim());
            document.getElementById(loadingId).remove();
            chatBox.innerHTML += `<div style="align-self: flex-start; background: rgba(255,255,255,0.2); padding: 10px 15px; border-radius: 12px; font-size: 14px; max-width: 85%;">${window.PhoneUI.escapeHtml(result.reply)}</div>`;
            chatBox.scrollTop = chatBox.scrollHeight;
            if (result.unlock) {
                setTimeout(() => { this.unlockScreen(); if (window.PhoneAPI) window.PhoneAPI.showToast("TA 心软了，放过了你~"); }, 2000);
            }
        } catch (e) {
            document.getElementById(loadingId).innerText = "网络有点卡，继续背书！";
        }
    },

    unlockScreen() {
        clearInterval(this.studyTimer);
        this.isStudying = false;
        this.studyTimeLeft = this.selectedTime * 60; 
        const lockScreen = document.getElementById('study-lock-screen');
        if (lockScreen) lockScreen.remove();
        this.renderStudyRoom();
    },

    finishStudy() {
        this.unlockScreen();
        if (window.PhoneAPI) {
            window.PhoneAPI.showToast(`🎉 太棒啦！完成了 ${this.selectedTime} 分钟专注！`);
            window.PhoneAPI.saveFavorite(`完成了一次 ${this.selectedTime} 分钟的强制专注学习！`, "自习室", "me");
        }
    },

    // ================= 艾宾浩斯 & 乱序背单词模块 =================
    async startLearnVocab() {
        const vData = this.initVocabData();
        const allWords = this.gaokaoWords.concat(vData.customWords);
        const unlearned = allWords.filter(w => !vData.records[w.w]);
        
        if (unlearned.length === 0) {
            if (window.PhoneAPI) window.PhoneAPI.showToast("太强了！词库全学完了，去复习吧！");
            return;
        }
        this.currentWord = unlearned[Math.floor(Math.random() * unlearned.length)];
        this.renderVocabCard('learn');
    },

    async startReviewVocab() {
        const vData = this.initVocabData();
        const now = Date.now();
        let needReviewKeys = Object.keys(vData.records).filter(w => vData.records[w].nextReview <= now);
        
        let isSurprise = false;
        if (needReviewKeys.length === 0) {
            // 🌟 突击抽查机制：如果今天没有要复习的词，就从已掌握的词里随机抽！
            const masteredKeys = Object.keys(vData.records).filter(w => vData.records[w].step >= 1);
            if (masteredKeys.length > 0) {
                needReviewKeys = masteredKeys;
                isSurprise = true;
                if (window.PhoneAPI) window.PhoneAPI.showToast("今日任务已清空，开启随机突击抽查！");
            } else {
                if (window.PhoneAPI) window.PhoneAPI.showToast("词库空空如也，先去学习新词吧！");
                return;
            }
        }
        
        const wordStr = needReviewKeys[Math.floor(Math.random() * needReviewKeys.length)];
        const allWords = this.gaokaoWords.concat(vData.customWords);
        this.currentWord = allWords.find(w => w.w === wordStr) || {w: wordStr, m: '未知词意'};
        this.renderVocabCard('review', isSurprise);
    },

    async renderVocabCard(mode, isSurprise = false) {
        const area = document.getElementById('vocab-work-area');
        if (!area || !this.currentWord) return;

        const vData = this.initVocabData();
        const allWords = this.gaokaoWords.concat(vData.customWords);
        const prefix = this.currentWord.w.substring(0, 4); 
        let similarWordsHtml = '';
        
        if (prefix.length >= 3) {
            const similars = allWords.filter(w => w.w !== this.currentWord.w && w.w.startsWith(prefix)).slice(0, 3);
            if (similars.length > 0) {
                let listHtml = similars.map(s => `<div style="font-size: 13px; color: var(--text-main);"><b>${s.w}</b>: <span style="color: var(--text-sub);">${s.m}</span></div>`).join('');
                similarWordsHtml = `
                    <div style="background: rgba(0,0,0,0.03); border-radius: 12px; padding: 12px; margin-bottom: 20px; text-align: left; border: 1px dashed var(--border-color);">
                        <div style="font-size: 12px; color: var(--primary-color); font-weight: bold; margin-bottom: 8px;"><i class="ph-fill ph-link"></i> 形近/同根词拓展</div>
                        ${listHtml}
                    </div>
                `;
            }
        }

        let stepText = mode === 'learn' ? '新词学习' : `艾宾浩斯 第 ${vData.records[this.currentWord.w].step} 阶段`;
        if (isSurprise) stepText = '⚠️ 突击抽查';

        area.innerHTML = `
            <div class="card" style="width: 100%; text-align: center; padding: 20px;">
                <div style="font-size: 12px; color: #f4a261; font-weight: bold; margin-bottom: 15px;">[ ${stepText} ]</div>
                <div style="font-size: 36px; font-weight: bold; color: var(--primary-color); margin-bottom: 10px;">${this.currentWord.w}</div>
                <div style="font-size: 16px; color: var(--text-sub); margin-bottom: 25px;">${this.currentWord.m}</div>
                
                ${similarWordsHtml}

                <div id="vocab-ai-explain-box" style="margin-bottom: 25px;">
                    <button onclick="window.PhoneUI.askAiForMnemonic()" style="background: transparent; border: 1px dashed var(--primary-color); color: var(--primary-color); padding: 8px 20px; border-radius: 20px; font-size: 13px; cursor: pointer;">
                        <i class="ph-fill ph-brain"></i> 记不住？求助 TA 编个口诀
                    </button>
                </div>

                <div style="display: flex; gap: 15px; width: 100%;">
                    <button class="btn-refresh" onclick="window.PhoneUI.markWordResult(false, '${mode}')" style="flex: 1; background: var(--icon-bg); color: var(--text-main); border: 1px solid var(--border-color);"><i class="ph ph-x"></i> 没记住</button>
                    <button class="btn-refresh" onclick="window.PhoneUI.markWordResult(true, '${mode}')" style="flex: 1; background: #4ade80; color: #fff;"><i class="ph-fill ph-check"></i> 记住了</button>
                </div>
            </div>
        `;
    },

    async askAiForMnemonic() {
        const box = document.getElementById('vocab-ai-explain-box');
        if (!box || !this.currentWord) return;

        const taAvatar = localStorage.getItem('ta_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=TA&backgroundColor=e8f0fa';
        box.innerHTML = `<div style="display: flex; gap: 10px; align-items: flex-start; text-align: left; background: var(--icon-bg); padding: 15px; border-radius: 12px;"><img src="${taAvatar}" style="width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;"><div id="vocab-ai-explain-text" style="font-size: 14px; color: var(--text-main); line-height: 1.5;"><i class="ph ph-spinner ph-spin"></i> TA 正在绞尽脑汁帮你编记忆法...</div></div>`;

        try {
            const persona = localStorage.getItem('char_persona') || '';
            const taName = localStorage.getItem('char_name') || 'TA';
            let sysPrompt = `你扮演${taName}。${persona}\n【任务】：用户正在背高考单词【${this.currentWord.w}】（${this.currentWord.m}），但死活记不住。\n【要求】：用符合你人设的语气，给出一段简短、搞笑、容易记住的记忆法（如谐音梗、词根拆解）。字数80字以内。`;
            const reply = await window.PhoneAPI.chatWithAI([{ role: 'system', content: sysPrompt }]);
            document.getElementById('vocab-ai-explain-text').innerHTML = window.PhoneUI.escapeHtml(reply);
        } catch (e) {
            document.getElementById('vocab-ai-explain-text').innerText = "网络开小差了，你自己多读几遍吧！";
        }
    },

    markWordResult(remembered, mode) {
        let vData = this.initVocabData();
        const word = this.currentWord.w;
        const now = Date.now();

        const today = new Date().toLocaleDateString('zh-CN');
        if (!vData.checkinDates.includes(today)) {
            vData.checkinDates.push(today);
            if (window.PhoneAPI) window.PhoneAPI.showToast("🎉 每日背词打卡成功！日历已点亮！");
        }

        if (!vData.records[word]) {
            vData.records[word] = { step: 0, nextReview: now };
        }

        if (remembered) {
            vData.records[word].step += 1;
            const stepIndex = Math.min(vData.records[word].step, this.ebbinghausIntervals.length - 1);
            const daysToAdd = this.ebbinghausIntervals[stepIndex];
            vData.records[word].nextReview = now + daysToAdd * 24 * 60 * 60 * 1000;
        } else {
            vData.records[word].step = 0;
            vData.records[word].nextReview = now; 
        }

        this.saveVocabData(vData);

        // 🌟 连背鼓励机制
        this.sessionWordCount++;
        if (this.sessionWordCount % 5 === 0) {
            const msgs = [
                `背了 ${this.sessionWordCount} 个了！不愧是我看上的人，继续保持！`,
                `${this.sessionWordCount} 个单词拿下！今天的高考状元非你莫属！`,
                `已经搞定 ${this.sessionWordCount} 个啦，累了的话...也不准休息！快背！`,
                `哇哦，${this.sessionWordCount} 个了！再背几个我就奖励你一个摸头杀~`
            ];
            const msg = msgs[Math.floor(Math.random() * msgs.length)];
            if (window.PhoneAPI) window.PhoneAPI.showToast("✨ TA说：" + msg);
        }
        
        if (mode === 'learn') this.startLearnVocab();
        else this.startReviewVocab();
    },

    escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }
};
