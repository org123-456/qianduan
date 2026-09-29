/**
 * 🎬 专属放映室引擎 (CinemaEngine) - 原生全屏伴看版 (无诡异旋转)
 */
export const CinemaEngine = {
    currentVideoType: 'none',
    currentVideoTitle: '未命名视频',
    currentVid: '',
    cinemaTimer: null,
    currentLineIndex: 0,

    extractBiliId(input) {
        if (!input) return null;
        let str = String(input).trim();
        const bvMatch = str.match(/(BV[a-zA-Z0-9]{10})/i);
        if (bvMatch) return bvMatch[1];
        const avMatch = str.match(/av(\d+)/i);
        if (avMatch) return `av${avMatch[1]}`;
        return null;
    },

    async loadBilibiliVideo(input, title = '') {
        if (!input || !input.trim()) return false;
        let str = input.trim();
        let vid = this.extractBiliId(str);

        if (!vid && str.includes('b23.tv')) {
            const shortMatch = str.match(/https?:\/\/b23\.tv\/[a-zA-Z0-9]+/i);
            if (shortMatch) {
                if (window.PhoneAPI) window.PhoneAPI.showToast("🔍 正在解析短链接...");
                try {
                    const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(shortMatch[0])}`);
                    const html = await res.text();
                    vid = this.extractBiliId(html);
                } catch(e) {}
            }
        }

        if (!vid) {
            const manualBv = prompt("💡 请输入该视频的 BV号 (如 BV1xx...，在B站视频下方)：", "");
            if (manualBv) vid = this.extractBiliId(manualBv);
        }

        if (!vid) {
            if (window.PhoneAPI) window.PhoneAPI.showToast("⚠️ 未能提取到有效BV号");
            return false;
        }

        this.currentVid = vid;
        this.currentVideoType = 'bilibili';
        this.currentVideoTitle = title.trim() || '精彩视频';

        this.renderPlayer();
        this.updateCompanionBubble(`“带子装好了。坐吧，老狼陪你一起盯完全场。”`);
        this.startProactiveCompanion();
        return true;
    },

    renderPlayer() {
        const screenContainer = document.getElementById('cinema-screen-box');
        if (!screenContainer || !this.currentVid) return;

        const lines = [
            `https://www.bilibili.com/blackboard/html5mobileplayer.html?bvid=${this.currentVid}&as_wide=1&high_quality=1&danmaku=0`,
            `https://player.bilibili.com/player.html?bvid=${this.currentVid}&page=1&high_quality=1&as_wide=1&danmaku=0`
        ];

        const finalUrl = lines[this.currentLineIndex % lines.length];

        screenContainer.innerHTML = `
            <iframe id="cinema-iframe-player" 
                    src="${finalUrl}" 
                    scrolling="no" 
                    border="0" 
                    frameborder="no" 
                    framespacing="0" 
                    allowfullscreen="true" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    style="width: 100%; height: 100%; border-radius: 14px; border: none; background: #000;">
            </iframe>
            
            <!-- 全屏弹幕舞台 -->
            <div id="cinema-danmaku-stage" style="position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 60;"></div>
            
            <!-- 全屏状态下的专属心声气泡 (左下角，端端正正) -->
            <div id="cinema-fullscreen-bubble" style="display: none; position: absolute; bottom: 25px; left: 25px; background: rgba(0,0,0,0.78); border: 1px solid rgba(255,255,255,0.25); border-radius: 25px; padding: 6px 14px; align-items: center; gap: 8px; backdrop-filter: blur(10px); z-index: 70; max-width: 65%;">
                <img id="fs-bubble-avatar" src="" style="width: 26px; height: 26px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--primary-color);">
                <span id="fs-bubble-text" style="font-size: 13px; color: #fff; line-height: 1.3;">...</span>
            </div>

            <!-- 全屏状态下的发弹幕胶囊 (右下角) -->
            <div id="cinema-fullscreen-btn" onclick="window.CinemaEngine.toggleBiliDanmakuBar()" style="display: none; position: absolute; bottom: 25px; right: 25px; background: rgba(0,0,0,0.78); border: 1px solid rgba(255,255,255,0.3); color: #fff; font-size: 12px; font-weight: bold; padding: 7px 16px; border-radius: 20px; cursor: pointer; z-index: 70; backdrop-filter: blur(10px);">
                <i class="ph-fill ph-chat-teardrop-dots" style="color: var(--primary-color);"></i> 发弹幕
            </div>

            <!-- 全屏状态下的退出全屏按钮 (左上角) -->
            <div id="cinema-exit-fs-btn" onclick="window.CinemaEngine.toggleFullscreen(false)" style="display: none; position: absolute; top: 20px; left: 20px; background: rgba(0,0,0,0.6); color: #fff; font-size: 12px; padding: 6px 14px; border-radius: 16px; cursor: pointer; z-index: 70; border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(8px);">
                <i class="ph ph-arrows-in"></i> 退出全屏
            </div>

            <!-- 底部极简半透明弹幕栏 -->
            <div id="cinema-bili-danmaku-bar" style="position: absolute; bottom: 0; left: 0; right: 0; padding: 12px 20px; background: rgba(0,0,0,0.9); backdrop-filter: blur(14px); display: none; align-items: center; gap: 10px; z-index: 80; border-top: 1px solid rgba(255,255,255,0.15);">
                <input type="text" id="cinema-bili-bar-input" placeholder="发条弹幕和不死途吐槽..." style="flex: 1; padding: 10px 16px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.25); background: rgba(255,255,255,0.12); color: #fff; font-size: 14px; outline: none;" onkeydown="if(event.key==='Enter') window.CinemaEngine.submitBiliBarDanmaku()">
                <button onclick="window.CinemaEngine.submitBiliBarDanmaku()" style="background: var(--primary-color); color: #fff; border: none; padding: 8px 18px; border-radius: 18px; font-size: 13px; font-weight: bold; cursor: pointer;">发送</button>
                <div onclick="window.CinemaEngine.toggleBiliDanmakuBar(false)" style="color: rgba(255,255,255,0.7); padding: 4px 8px; cursor: pointer; font-size: 20px;"><i class="ph ph-x"></i></div>
            </div>
        `;

        // 外部工具条
        let toolBar = document.getElementById('cinema-ext-toolbar');
        if (!toolBar) {
            toolBar = document.createElement('div');
            toolBar.id = 'cinema-ext-toolbar';
            toolBar.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding: 0 4px;';
            screenContainer.parentNode.insertBefore(toolBar, screenContainer.nextSibling);
        }

        const lineNames = ["手机纯净流", "宽屏高清流"];
        toolBar.innerHTML = `
            <div style="font-size: 11px; color: var(--text-sub); display: flex; align-items: center; gap: 4px; max-width: 45%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                <i class="ph-fill ph-film-strip" style="color: var(--primary-color);"></i>
                <span style="font-weight: bold; color: var(--text-main);">${this.currentVideoTitle}</span>
            </div>
            <div style="display: flex; gap: 6px;">
                <button onclick="window.CinemaEngine.toggleLine()" style="background: var(--icon-bg); border: 1px solid var(--border-color); color: var(--text-sub); font-size: 11px; padding: 4px 8px; border-radius: 12px; cursor: pointer;">
                    ${lineNames[this.currentLineIndex % 2]}
                </button>
                <button onclick="window.CinemaEngine.toggleBiliDanmakuBar()" style="background: var(--icon-bg); border: 1px solid var(--border-color); color: var(--text-main); font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 12px; cursor: pointer;">
                    <i class="ph-fill ph-chat-teardrop-dots" style="color: var(--primary-color);"></i> 弹幕
                </button>
                <button onclick="window.CinemaEngine.toggleFullscreen()" style="background: linear-gradient(135deg, var(--primary-color), #a78bfa); border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 12px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                    <i class="ph-bold ph-corners-out"></i> 全屏伴看
                </button>
            </div>
        `;
    },

    // 🌟 原生全屏切换（你把手机横过来，它就是端端正正的真横屏！）
    toggleFullscreen(forceState) {
        const box = document.getElementById('cinema-screen-box');
        const fsBubble = document.getElementById('cinema-fullscreen-bubble');
        const fsBtn = document.getElementById('cinema-fullscreen-btn');
        const exitBtn = document.getElementById('cinema-exit-fs-btn');
        if (!box) return;

        const isCurrentlyFs = (document.fullscreenElement || box.classList.contains('fullscreen-mode'));
        const shouldFs = (typeof forceState === 'boolean') ? forceState : !isCurrentlyFs;

        if (shouldFs) {
            box.classList.add('fullscreen-mode');
            if (box.requestFullscreen) box.requestFullscreen().catch(() => {});
            else if (box.webkitRequestFullscreen) box.webkitRequestFullscreen().catch(() => {});

            if (fsBubble) fsBubble.style.display = 'flex';
            if (fsBtn) fsBtn.style.display = 'block';
            if (exitBtn) exitBtn.style.display = 'block';

            const taAvatar = localStorage.getItem('ta_avatar') || '';
            const avatarEl = document.getElementById('fs-bubble-avatar');
            if (avatarEl && taAvatar) avatarEl.src = taAvatar;

            // 尝试锁定横屏（部分支持设备有效）
            try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); } catch(e) {}
        } else {
            box.classList.remove('fullscreen-mode');
            if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
            if (fsBubble) fsBubble.style.display = 'none';
            if (fsBtn) fsBtn.style.display = 'none';
            if (exitBtn) exitBtn.style.display = 'none';
            this.toggleBiliDanmakuBar(false);

            try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch(e) {}
        }
    },

    toggleBiliDanmakuBar(forceState) {
        const bar = document.getElementById('cinema-bili-danmaku-bar');
        const input = document.getElementById('cinema-bili-bar-input');
        if (!bar) return;

        let shouldShow = (typeof forceState === 'boolean') ? forceState : (bar.style.display === 'none' || !bar.style.display);
        
        if (shouldShow) {
            bar.style.display = 'flex';
            if (input) {
                input.value = '';
                setTimeout(() => input.focus(), 100);
            }
        } else {
            bar.style.display = 'none';
        }
    },

    submitBiliBarDanmaku() {
        const input = document.getElementById('cinema-bili-bar-input');
        if (!input || !input.value.trim()) return;
        const text = input.value.trim();
        this.toggleBiliDanmakuBar(false);
        this.handleCommentFlow(text);
    },

    toggleLine() {
        this.currentLineIndex++;
        const lineNames = ["手机纯净流", "宽屏高清流"];
        const curName = lineNames[this.currentLineIndex % 2];
        if (window.PhoneAPI) window.PhoneAPI.showToast(`已切换至：${curName}`);
        this.renderPlayer();
    },

    shootDanmaku(text, sender = 'me') {
        const stage = document.getElementById('cinema-danmaku-stage');
        if (!stage) return;

        const danmaku = document.createElement('div');
        const isTa = (sender === 'ta');
        const taAvatar = localStorage.getItem('ta_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=TA&backgroundColor=e8f0fa';
        const topPercent = Math.floor(Math.random() * 45) + 15;

        danmaku.style.cssText = `
            position: absolute;
            top: ${topPercent}%;
            right: -100%;
            white-space: nowrap;
            font-size: ${isTa ? '16px' : '15px'};
            font-weight: bold;
            color: #fff;
            background: ${isTa ? 'linear-gradient(135deg, rgba(167, 139, 250, 0.92), rgba(99, 102, 241, 0.92))' : 'rgba(0,0,0,0.6)'};
            padding: ${isTa ? '5px 14px 5px 8px' : '4px 12px'};
            border-radius: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            gap: 6px;
            pointer-events: none;
            z-index: 65;
            border: 1px solid ${isTa ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)'};
            animation: danmakuFly 8s linear forwards;
        `;

        if (isTa) {
            danmaku.innerHTML = `
                <img src="${taAvatar}" style="width: 22px; height: 22px; border-radius: 50%; border: 1.5px solid #fff; object-fit: cover;">
                <span>${text}</span>
            `;
        } else {
            danmaku.innerHTML = `<span>${text}</span>`;
        }

        stage.appendChild(danmaku);
        setTimeout(() => { danmaku.remove(); }, 8500);
    },

    loadLocalVideo(file) {
        if (!file) return;
        this.currentVideoType = 'local';
        this.currentVideoTitle = file.name.replace(/\.[^/.]+$/, "");

        const screenContainer = document.getElementById('cinema-screen-box');
        if (!screenContainer) return;

        const videoUrl = URL.createObjectURL(file);
        screenContainer.innerHTML = `
            <video id="cinema-local-player" src="${videoUrl}" controls playsinline style="width: 100%; height: 100%; border-radius: 14px; object-fit: contain; background: #000;"></video>
            <div id="cinema-danmaku-stage" style="position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 60;"></div>
            <div id="cinema-fullscreen-bubble" style="display: none; position: absolute; bottom: 25px; left: 25px; background: rgba(0,0,0,0.78); border: 1px solid rgba(255,255,255,0.25); border-radius: 25px; padding: 6px 14px; align-items: center; gap: 8px; backdrop-filter: blur(10px); z-index: 70;">
                <img id="fs-bubble-avatar" src="" style="width: 26px; height: 26px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--primary-color);">
                <span id="fs-bubble-text" style="font-size: 13px; color: #fff;">...</span>
            </div>
            <div id="cinema-fullscreen-btn" onclick="window.CinemaEngine.toggleBiliDanmakuBar()" style="display: none; position: absolute; bottom: 25px; right: 25px; background: rgba(0,0,0,0.78); border: 1px solid rgba(255,255,255,0.3); color: #fff; font-size: 12px; font-weight: bold; padding: 7px 16px; border-radius: 20px; cursor: pointer; z-index: 70;">
                <i class="ph-fill ph-chat-teardrop-dots"></i> 发弹幕
            </div>
            <div id="cinema-exit-fs-btn" onclick="window.CinemaEngine.toggleFullscreen(false)" style="display: none; position: absolute; top: 20px; left: 20px; background: rgba(0,0,0,0.6); color: #fff; font-size: 12px; padding: 6px 14px; border-radius: 16px; cursor: pointer; z-index: 70; border: 1px solid rgba(255,255,255,0.2);">
                <i class="ph ph-arrows-in"></i> 退出全屏
            </div>
            <div id="cinema-bili-danmaku-bar" style="position: absolute; bottom: 0; left: 0; right: 0; padding: 12px 20px; background: rgba(0,0,0,0.9); backdrop-filter: blur(14px); display: none; align-items: center; gap: 10px; z-index: 80; border-top: 1px solid rgba(255,255,255,0.15);">
                <input type="text" id="cinema-bili-bar-input" placeholder="发条弹幕和不死途吐槽..." style="flex: 1; padding: 10px 16px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.25); background: rgba(255,255,255,0.12); color: #fff; font-size: 14px; outline: none;" onkeydown="if(event.key==='Enter') window.CinemaEngine.submitBiliBarDanmaku()">
                <button onclick="window.CinemaEngine.submitBiliBarDanmaku()" style="background: var(--primary-color); color: #fff; border: none; padding: 8px 18px; border-radius: 18px; font-size: 13px; font-weight: bold; cursor: pointer;">发送</button>
                <div onclick="window.CinemaEngine.toggleBiliDanmakuBar(false)" style="color: rgba(255,255,255,0.7); padding: 4px 8px; cursor: pointer; font-size: 20px;"><i class="ph ph-x"></i></div>
            </div>
        `;

        this.updateCompanionBubble(`“带了新带子来？行，老狼今天陪你盯完全场。”`);
        this.startProactiveCompanion();
    },

    updateCompanionBubble(text) {
        const bubble = document.getElementById('cinema-companion-bubble');
        const bubbleText = document.getElementById('cinema-bubble-text');
        if (bubble && bubbleText) {
            bubbleText.innerText = text;
            bubble.style.opacity = '1';
            bubble.style.transform = 'translateY(0)';
            clearTimeout(this._bubbleTimer);
            this._bubbleTimer = setTimeout(() => {
                bubble.style.opacity = '0';
                bubble.style.transform = 'translateY(15px)';
            }, 6000);
        }

        const fsBubble = document.getElementById('cinema-fullscreen-bubble');
        const fsText = document.getElementById('fs-bubble-text');
        if (fsBubble && fsText) {
            fsText.innerText = text;
            fsBubble.style.opacity = '1';
            clearTimeout(this._fsTimer);
            this._fsTimer = setTimeout(() => {
                fsBubble.style.opacity = '0';
            }, 6000);
        }
    },

    async handleCommentFlow(userSay) {
        this.shootDanmaku(userSay, 'me');
        this.updateCompanionBubble(`我: “${userSay}” ...`);

        try {
            const persona = localStorage.getItem('char_persona') || '';
            const taName = localStorage.getItem('char_name') || 'TA';
            const myName = localStorage.getItem('my_name') || '我';

            const sysPrompt = `【系统指令】：你扮演${taName}。你此刻正和${myName}并肩坐在一起看视频《${this.currentVideoTitle}》。
${persona}

【情境任务】：对方看视频时随手发了条弹幕吐槽：“${userSay}”。
【要求】：
1. 极其简短的弹幕风格，神回复/冷幽默/宠溺吐槽（15~30字以内）。
2. 符合你老派侦探、散漫嘴贫、又极度护短可靠的性格。
3. 严禁任何动作、旁白或心理描写！直接输出台词。`;

            const reply = await window.PhoneAPI.chatWithAI([
                { role: 'system', content: sysPrompt },
                { role: 'user', content: userSay }
            ]);

            const cleanReply = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<inner>[\s\S]*?<\/inner>/gi, '').trim();
            if (cleanReply) {
                setTimeout(() => {
                    this.shootDanmaku(cleanReply, 'ta');
                    this.updateCompanionBubble(cleanReply);
                }, 1000);
            }
        } catch (e) {
            this.updateCompanionBubble(`“……刚才在看画面，你刚才说什么？”`);
        }
    },

    sendCinemaComment() {
        const input = document.getElementById('cinema-comment-input');
        if (!input || !input.value.trim()) return;
        const text = input.value.trim();
        input.value = '';
        this.handleCommentFlow(text);
    },

    startProactiveCompanion() {
        clearInterval(this.cinemaTimer);
        this.cinemaTimer = setInterval(async () => {
            const box = document.getElementById('together-cinema-view');
            if (!box || box.style.display === 'none') return;

            try {
                const taName = localStorage.getItem('char_name') || 'TA';
                const persona = localStorage.getItem('char_persona') || '';
                const myName = localStorage.getItem('my_name') || '她';

                const prompt = `你扮演${taName}，正陪${myName}看视频《${this.currentVideoTitle}》。请针对当前情境随手在屏幕上发一条极短弹幕（20字以内，口语，严禁括号描写！）。`;
                const reply = await window.PhoneAPI.chatWithAI([
                    { role: 'system', content: persona },
                    { role: 'user', content: prompt }
                ]);
                const clean = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<inner>[\s\S]*?<\/inner>/gi, '').trim();
                if (clean) {
                    this.shootDanmaku(clean, 'ta');
                    this.updateCompanionBubble(clean);
                }
            } catch(e) {}
        }, 110000);
    }
};

// 监听退出全屏
if (typeof document !== 'undefined') {
    document.addEventListener('fullscreenchange', () => {
        const fsBubble = document.getElementById('cinema-fullscreen-bubble');
        const fsBtn = document.getElementById('cinema-fullscreen-btn');
        const exitBtn = document.getElementById('cinema-exit-fs-btn');
        const box = document.getElementById('cinema-screen-box');
        if (!document.fullscreenElement) {
            if (box) box.classList.remove('fullscreen-mode');
            if (fsBubble) fsBubble.style.display = 'none';
            if (fsBtn) fsBtn.style.display = 'none';
            if (exitBtn) exitBtn.style.display = 'none';
        }
    });
}

if (typeof window !== 'undefined') {
    window.CinemaEngine = CinemaEngine;
}
