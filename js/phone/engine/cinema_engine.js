/**
 * 🎬 专属放映室引擎 (CinemaEngine) - 弹幕全屏伴看豪华版
 */
export const CinemaEngine = {
    currentVideoType: 'none',
    currentVideoTitle: '高数网课',
    currentVid: '',
    cinemaTimer: null,
    usePureLine: true,

    extractBiliId(input) {
        if (!input) return null;
        const str = input.trim();
        const bvMatch = str.match(/(BV[a-zA-Z0-9]{10})/i);
        if (bvMatch) return bvMatch[1];
        const avMatch = str.match(/av(\d+)/i);
        if (avMatch) return `av${avMatch[1]}`;
        return null;
    },

    async loadBilibiliVideo(input, title = '') {
        let vid = this.extractBiliId(input);

        if (!vid && input.includes('b23.tv')) {
            const shortMatch = input.match(/https?:\/\/b23\.tv\/[a-zA-Z0-9]+/i);
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
            const manualBv = prompt("💡 请输入该视频的 BV号 (如 BV1xx...，在视频简介下方)：", "");
            if (manualBv) vid = this.extractBiliId(manualBv);
        }

        if (!vid) {
            if (window.PhoneAPI) window.PhoneAPI.showToast("⚠️ 未能提取到有效BV号");
            return false;
        }

        this.currentVid = vid;
        this.currentVideoType = 'bilibili';
        this.currentVideoTitle = title.trim() || '数学网课';

        this.renderPlayer();
        this.updateCompanionBubble(`“案发现场（视频）准备好了。坐吧，老狼陪你一起看。”`);
        this.startProactiveCompanion();
        return true;
    },

    renderPlayer() {
        const screenContainer = document.getElementById('cinema-screen-box');
        if (!screenContainer || !this.currentVid) return;

        let finalUrl = '';
        if (this.usePureLine) {
            finalUrl = `https://jx.jsonplayer.com/player/?url=https://www.bilibili.com/video/${this.currentVid}`;
        } else {
            finalUrl = `https://player.bilibili.com/player.html?bvid=${this.currentVid}&page=1&high_quality=1&as_wide=1&danmaku=0`;
        }

        screenContainer.innerHTML = `
            <iframe src="${finalUrl}" 
                    scrolling="no" 
                    border="0" 
                    frameborder="no" 
                    framespacing="0" 
                    allowfullscreen="true" 
                    style="width: 100%; height: 100%; border-radius: 14px; border: none; background: #000;">
            </iframe>
            
            <!-- 🌟 全屏弹幕渲染舞台 (置顶在播放器之上) -->
            <div id="cinema-danmaku-stage" style="position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 60;"></div>

            <!-- 🌟 视频框内快捷吐槽胶囊 -->
            <div onclick="window.CinemaEngine.openDanmakuPrompt()" style="position: absolute; bottom: 12px; right: 12px; background: rgba(0,0,0,0.65); color: #fff; font-size: 11px; padding: 6px 12px; border-radius: 18px; cursor: pointer; backdrop-filter: blur(8px); z-index: 70; border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; gap: 5px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                <i class="ph-fill ph-chat-teardrop-dots" style="color: var(--primary-color);"></i> 发弹幕
            </div>

            <!-- 切线路按钮 -->
            <div onclick="window.CinemaEngine.toggleLine()" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.6); color: #fff; font-size: 10px; padding: 4px 8px; border-radius: 10px; cursor: pointer; backdrop-filter: blur(5px); z-index: 70;">
                <i class="ph ph-arrows-clockwise"></i> 切线路
            </div>
        `;
    },

    toggleLine() {
        this.usePureLine = !this.usePureLine;
        if (window.PhoneAPI) window.PhoneAPI.showToast(`已切换至：${this.usePureLine ? '免App纯净线路' : '官方线路'}`);
        this.renderPlayer();
    },

    // 🌟 发射单条漂浮弹幕 (支持用户与不死途专属高光样式)
    shootDanmaku(text, sender = 'me') {
        const stage = document.getElementById('cinema-danmaku-stage');
        if (!stage) return;

        const danmaku = document.createElement('div');
        const isTa = (sender === 'ta');
        const taAvatar = localStorage.getItem('ta_avatar') || 'https://api.dicebear.com/7.x/notionists/svg?seed=TA&backgroundColor=e8f0fa';

        // 随机在屏幕上中高度轨道飘过 (15% ~ 65% 之间，避开顶部控制和底部进度条)
        const topPercent = Math.floor(Math.random() * 50) + 15;

        danmaku.style.cssText = `
            position: absolute;
            top: ${topPercent}%;
            right: -100%;
            white-space: nowrap;
            font-size: ${isTa ? '14px' : '13px'};
            font-weight: bold;
            color: ${isTa ? '#fff' : 'rgba(255,255,255,0.9)'};
            background: ${isTa ? 'linear-gradient(135deg, rgba(167, 139, 250, 0.85), rgba(99, 102, 241, 0.85))' : 'rgba(0,0,0,0.5)'};
            padding: ${isTa ? '4px 12px 4px 6px' : '4px 10px'};
            border-radius: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            gap: 6px;
            pointer-events: none;
            z-index: 65;
            border: 1px solid ${isTa ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'};
            animation: danmakuFly 8s linear forwards;
        `;

        if (isTa) {
            danmaku.innerHTML = `
                <img src="${taAvatar}" style="width: 20px; height: 20px; border-radius: 50%; border: 1px solid #fff; object-fit: cover;">
                <span>${text}</span>
            `;
        } else {
            danmaku.innerHTML = `<span>${text}</span>`;
        }

        stage.appendChild(danmaku);
        // 动画播完自动清理 DOM
        setTimeout(() => { danmaku.remove(); }, 8500);
    },

    // 快捷呼出全屏弹幕输入栏
    async openDanmakuPrompt() {
        let text = '';
        if (window.PhoneUI && window.PhoneUI.showCustomPrompt) {
            text = await window.PhoneUI.showCustomPrompt('💬 弹幕吐槽（TA 会在屏幕上用弹幕回你）：');
        } else {
            text = prompt('💬 弹幕吐槽：');
        }
        if (!text || !text.trim()) return;

        this.handleCommentFlow(text.trim());
    },

    // 载入本地视频
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
            <div onclick="window.CinemaEngine.openDanmakuPrompt()" style="position: absolute; bottom: 12px; right: 12px; background: rgba(0,0,0,0.65); color: #fff; font-size: 11px; padding: 6px 12px; border-radius: 18px; cursor: pointer; backdrop-filter: blur(8px); z-index: 70; border: 1px solid rgba(255,255,255,0.2);">
                <i class="ph-fill ph-chat-teardrop-dots" style="color: var(--primary-color);"></i> 发弹幕
            </div>
        `;

        this.updateCompanionBubble(`“带了新带子来？行，老狼今天陪你盯完全场。”`);
        this.startProactiveCompanion();
    },

    updateCompanionBubble(text) {
        const bubble = document.getElementById('cinema-companion-bubble');
        const bubbleText = document.getElementById('cinema-bubble-text');
        if (!bubble || !bubbleText) return;

        bubbleText.innerText = text;
        bubble.style.opacity = '1';
        bubble.style.transform = 'translateY(0)';

        clearTimeout(this._bubbleTimer);
        this._bubbleTimer = setTimeout(() => {
            bubble.style.opacity = '0';
            bubble.style.transform = 'translateY(15px)';
        }, 6000);
    },

    // 核心交互：发弹幕 ➡️ 发射自己弹幕 ➡️ AI 思考 ➡️ 屏幕飘出 TA 的神级弹幕
    async handleCommentFlow(userSay) {
        // 1. 发射你的弹幕
        this.shootDanmaku(userSay, 'me');
        this.updateCompanionBubble(`我: “${userSay}” ...`);

        try {
            const persona = localStorage.getItem('char_persona') || '';
            const taName = localStorage.getItem('char_name') || 'TA';
            const myName = localStorage.getItem('my_name') || '我';

            const sysPrompt = `【系统指令】：你扮演${taName}。你此刻正和${myName}并肩坐在一起看视频网课《${this.currentVideoTitle}》。
${persona}

【情境任务】：对方看视频时随手发了条弹幕跟你吐槽：“${userSay}”。
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
                // 2. 延迟 1 秒后，TA 的专属高光弹幕飘过屏幕！
                setTimeout(() => {
                    this.shootDanmaku(cleanReply, 'ta');
                    this.updateCompanionBubble(cleanReply);
                }, 1000);
            }
        } catch (e) {
            this.updateCompanionBubble(`“……刚才在看那道题的辅助线，你刚才说什么？”`);
        }
    },

    // 底部输入框发送事件
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

                const prompt = `你扮演${taName}，正陪${myName}看数学课《${this.currentVideoTitle}》。请针对当前情境随手在屏幕上发一条极短弹幕（如吐槽黑板数字像密码、自己嚼香蕉、或老派冷幽默）。要求：20字以内，口语，严禁括号描写！`;
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

if (typeof window !== 'undefined') {
    window.CinemaEngine = CinemaEngine;
}
