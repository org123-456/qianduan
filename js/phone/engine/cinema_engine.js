/**
 * 🎬 专属放映室引擎 (CinemaEngine) - 全视频兼容终极版
 */
export const CinemaEngine = {
    currentVideoType: 'none',
    currentVideoTitle: '未命名视频',
    currentVid: '',
    cinemaTimer: null,
    currentLineIndex: 0, // 0: 官方纯净极速线路, 1: 免App防跳线路, 2: 备用解析线路

    // 智能、强力提取纯净 BV 号或 av 号
    extractBiliId(input) {
        if (!input) return null;
        let str = String(input).trim();

        // 1. 暴力正则提取标准 BV 号 (BV 开头 + 10 位字母数字，忽略大小写和后缀参数)
        const bvMatch = str.match(/(BV[a-zA-Z0-9]{10})/i);
        if (bvMatch) return bvMatch[1];

        // 2. 提取 av 号
        const avMatch = str.match(/av(\d+)/i);
        if (avMatch) return `av${avMatch[1]}`;

        return null;
    },

    // 载入视频
    async loadBilibiliVideo(input, title = '') {
        if (!input || !input.trim()) return false;
        let str = input.trim();
        let vid = this.extractBiliId(str);

        // 如果用户直接贴的是 b23.tv 手机短链且里面没直接写 BV
        if (!vid && str.includes('b23.tv')) {
            const shortMatch = str.match(/https?:\/\/b23\.tv\/[a-zA-Z0-9]+/i);
            if (shortMatch) {
                if (window.PhoneAPI) window.PhoneAPI.showToast("🔍 正在还原 B站 短链接...");
                try {
                    const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(shortMatch[0])}`);
                    const html = await res.text();
                    vid = this.extractBiliId(html);
                } catch(e) {}
            }
        }

        // 如果还是没解析出来，弹窗让用户补录 BV 号
        if (!vid) {
            const manualBv = prompt("💡 未能在链接里抓到视频ID，请输入该视频的 BV号 (如 BV1...，在B站视频下方)：", "");
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

    // 核心播放器渲染
    renderPlayer() {
        const screenContainer = document.getElementById('cinema-screen-box');
        if (!screenContainer || !this.currentVid) return;

        let finalUrl = '';
        const lines = [
            // 线路 0：官方原生高清纯净嵌入流 (最稳，绝无解析失败，自带弹幕开关与画质)
            `https://player.bilibili.com/player.html?bvid=${this.currentVid}&page=1&high_quality=1&as_wide=1&danmaku=0`,
            // 线路 1：免 App 拦截线路
            `https://jx.jsonplayer.com/player/?url=https://www.bilibili.com/video/${this.currentVid}`,
            // 线路 2：全能备用线路
            `https://www.yemu.xyz/?url=https://www.bilibili.com/video/${this.currentVid}`
        ];

        finalUrl = lines[this.currentLineIndex % lines.length];

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

            <!-- 弹幕输入悬浮胶囊 -->
            <div onclick="window.CinemaEngine.openDanmakuPrompt()" style="position: absolute; bottom: 12px; right: 12px; background: rgba(0,0,0,0.65); color: #fff; font-size: 11px; padding: 6px 12px; border-radius: 18px; cursor: pointer; backdrop-filter: blur(8px); z-index: 70; border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; gap: 5px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                <i class="ph-fill ph-chat-teardrop-dots" style="color: var(--primary-color);"></i> 发弹幕
            </div>

            <!-- 切线路按钮 -->
            <div onclick="window.CinemaEngine.toggleLine()" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.6); color: #fff; font-size: 10px; padding: 4px 10px; border-radius: 10px; cursor: pointer; backdrop-filter: blur(5px); z-index: 70; border: 1px solid rgba(255,255,255,0.1);">
                <i class="ph ph-arrows-clockwise"></i> 换线路 (${(this.currentLineIndex % lines.length) + 1}/3)
            </div>
        `;
    },

    // 循环切换线路
    toggleLine() {
        this.currentLineIndex++;
        const lineNames = ["官方极速线路", "免App纯净线路", "全能备用线路"];
        const curName = lineNames[this.currentLineIndex % lineNames.length];
        if (window.PhoneAPI) window.PhoneAPI.showToast(`已切换至：${curName}`);
        this.renderPlayer();
    },

    // 发射漂浮弹幕
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

    // 快捷呼出全屏弹幕输入
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
