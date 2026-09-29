/**
 * 🎬 专属放映室引擎 (CinemaEngine) - 画面无遮挡完美版
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
            if (window.PhoneAPI) window.PhoneAPI.showToast("⚠️ 未能提取到有效的视频编号");
            return false;
        }

        this.currentVid = vid;
        this.currentVideoType = 'bilibili';
        this.currentVideoTitle = title.trim() || '精彩视频';

        this.renderPlayer();
        this.updateCompanionBubble(`“带子装好了。坐吧，让我看看你今天挑的片子。”`);
        this.startProactiveCompanion();
        return true;
    },

    // 核心渲染器 (按钮移出屏幕外，零遮挡)
    renderPlayer() {
        const screenContainer = document.getElementById('cinema-screen-box');
        if (!screenContainer || !this.currentVid) return;

        const lines = [
            `https://www.bilibili.com/blackboard/html5mobileplayer.html?bvid=${this.currentVid}&as_wide=1&high_quality=1&danmaku=0`,
            `https://player.bilibili.com/player.html?bvid=${this.currentVid}&page=1&high_quality=1&as_wide=1&danmaku=0`
        ];

        const finalUrl = lines[this.currentLineIndex % lines.length];

        // 🌟 视频屏幕彻底纯净，只有视频和飘过的透明弹幕
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
            
            <!-- 全屏弹幕舞台 (点击穿透，不挡任何操作) -->
            <div id="cinema-danmaku-stage" style="position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 60;"></div>
        `;

        // 🌟 将控制工具条独立挂在视频框正下方，干干净净
        let toolBar = document.getElementById('cinema-ext-toolbar');
        if (!toolBar) {
            toolBar = document.createElement('div');
            toolBar.id = 'cinema-ext-toolbar';
            toolBar.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding: 0 4px;';
            screenContainer.parentNode.insertBefore(toolBar, screenContainer.nextSibling);
        }

        const lineNames = ["手机纯净流", "宽屏高清流"];
        toolBar.innerHTML = `
            <div style="font-size: 11px; color: var(--text-sub); display: flex; align-items: center; gap: 4px;">
                <i class="ph-fill ph-film-strip" style="color: var(--primary-color);"></i>
                <span style="font-weight: bold; color: var(--text-main);">${this.currentVideoTitle}</span>
            </div>
            <div style="display: flex; gap: 8px;">
                <button onclick="window.CinemaEngine.toggleLine()" style="background: var(--icon-bg); border: 1px solid var(--border-color); color: var(--text-sub); font-size: 11px; padding: 4px 10px; border-radius: 14px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                    <i class="ph ph-arrows-clockwise"></i> ${lineNames[this.currentLineIndex % 2]}
                </button>
                <button onclick="window.CinemaEngine.openDanmakuPrompt()" style="background: var(--primary-color); border: none; color: #fff; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 14px; cursor: pointer; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                    <i class="ph-fill ph-chat-teardrop-dots"></i> 发弹幕
                </button>
            </div>
        `;
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
            font-size: ${isTa ? '14px' : '13px'};
            font-weight: bold;
            color: ${isTa ? '#fff' : 'rgba(255,255,255,0.9)'};
            background: ${isTa ? 'linear-gradient(135deg, rgba(167, 139, 250, 0.88), rgba(99, 102, 241, 0.88))' : 'rgba(0,0,0,0.55)'};
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
        setTimeout(() => { danmaku.remove(); }, 8500);
    },

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

    async handleCommentFlow(userSay) {
        this.shootDanmaku(userSay, 'me');
        this.updateCompanionBubble(`我: “${userSay}” ...`);

        try {
            const persona = localStorage.getItem('char_persona') || '';
            const taName = localStorage.getItem('char_name') || 'TA';
            const myName = localStorage.getItem('my_name') || '我';

            const sysPrompt = `【系统指令】：你扮演${taName}。你此刻正和${myName}并肩坐在一起看视频《${this.currentVideoTitle}》。
${persona}

【情境任务】：对方看视频时随口发了条弹幕跟你吐槽：“${userSay}”。
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

if (typeof window !== 'undefined') {
    window.CinemaEngine = CinemaEngine;
}
