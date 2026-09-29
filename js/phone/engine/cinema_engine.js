/**
 * 🎬 专属放映室引擎 (CinemaEngine) - 纯净去弹窗版
 */
export const CinemaEngine = {
    currentVideoType: 'none',
    currentVideoTitle: '高数网课',
    currentVid: '',
    cinemaTimer: null,
    usePureLine: true, // 默认开启纯净免App通道

    // 智能提取 BV 号
    extractBiliId(input) {
        if (!input) return null;
        const str = input.trim();

        // 1. 直接匹配 BV 号 (如 BV14y4y1m7RQ)
        const bvMatch = str.match(/(BV[a-zA-Z0-9]{10})/i);
        if (bvMatch) return bvMatch[1];

        // 2. 匹配 av 号
        const avMatch = str.match(/av(\d+)/i);
        if (avMatch) return `av${avMatch[1]}`;

        return null;
    },

    // 载入并播放
    async loadBilibiliVideo(input, title = '') {
        let vid = this.extractBiliId(input);

        // 如果用户贴的是 b23.tv 短链，自动通过轻量接口还原出真实 BV 号
        if (!vid && input.includes('b23.tv')) {
            const shortMatch = input.match(/https?:\/\/b23\.tv\/[a-zA-Z0-9]+/i);
            if (shortMatch) {
                if (window.PhoneAPI) window.PhoneAPI.showToast("🔍 正在解析短链接...");
                try {
                    // 解析 B23 短链真实地址
                    const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(shortMatch[0])}`);
                    const html = await res.text();
                    vid = this.extractBiliId(html);
                } catch(e) {}
            }
        }

        // 如果还是没解析出来，提示用户直接复制网页里的 BV 号
        if (!vid) {
            const manualBv = prompt("💡 B站短链需要展开，请输入该视频的 BV号 (如 BV14y4y1m7RQ，在视频标题下方)：", "");
            if (manualBv) vid = this.extractBiliId(manualBv);
        }

        if (!vid) {
            if (window.PhoneAPI) window.PhoneAPI.showToast("⚠️ 未能提取到有效的 BV号");
            return false;
        }

        this.currentVid = vid;
        this.currentVideoType = 'bilibili';
        this.currentVideoTitle = title.trim() || '数学网课';

        this.renderPlayer();
        this.updateCompanionBubble(`“案发现场（视频）准备好了。坐吧，今天我倒要看看是哪道题敢为难你。”`);
        this.startProactiveCompanion();
        return true;
    },

    // 核心渲染器 (双线路切换)
    renderPlayer() {
        const screenContainer = document.getElementById('cinema-screen-box');
        if (!screenContainer || !this.currentVid) return;

        let finalUrl = '';
        if (this.usePureLine) {
            // 🌟 纯净免App拦截线路（无弹窗、不限时、支持手机横屏）
            finalUrl = `https://jx.jsonplayer.com/player/?url=https://www.bilibili.com/video/${this.currentVid}`;
        } else {
            // 官方原生线路
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
            <div onclick="window.CinemaEngine.toggleLine()" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.6); color: #fff; font-size: 10px; padding: 4px 8px; border-radius: 10px; cursor: pointer; backdrop-filter: blur(5px); z-index: 50;">
                <i class="ph ph-arrows-clockwise"></i> 切线路
            </div>
        `;
    },

    // 切换线路
    toggleLine() {
        this.usePureLine = !this.usePureLine;
        if (window.PhoneAPI) window.PhoneAPI.showToast(`已切换至：${this.usePureLine ? '免App纯净线路' : '官方线路'}`);
        this.renderPlayer();
    },

    // 载入本地视频文件
    loadLocalVideo(file) {
        if (!file) return;
        this.currentVideoType = 'local';
        this.currentVideoTitle = file.name.replace(/\.[^/.]+$/, "");

        const screenContainer = document.getElementById('cinema-screen-box');
        if (!screenContainer) return;

        const videoUrl = URL.createObjectURL(file);
        screenContainer.innerHTML = `
            <video id="cinema-local-player" src="${videoUrl}" controls playsinline style="width: 100%; height: 100%; border-radius: 14px; object-fit: contain; background: #000;"></video>
        `;

        this.updateCompanionBubble(`“带了新录像？行，老狼今天陪你盯完全场。”`);
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

    async sendCinemaComment() {
        const input = document.getElementById('cinema-comment-input');
        if (!input || !input.value.trim()) return;

        const userSay = input.value.trim();
        input.value = '';

        this.updateCompanionBubble(`我: “${userSay}” ...`);

        try {
            const persona = localStorage.getItem('char_persona') || '';
            const taName = localStorage.getItem('char_name') || 'TA';
            const myName = localStorage.getItem('my_name') || '我';

            const sysPrompt = `【系统指令】：你扮演${taName}。你此刻正和${myName}并肩坐在一起看视频网课《${this.currentVideoTitle}》。
${persona}

【情境任务】：对方看视频时随口跟你吐槽了一句：“${userSay}”。
【要求】：
1. 极其简短口语化，像坐在身边的人随口回应（15~35字以内）。
2. 符合你老派侦探、散漫嘴贫、又宠溺可靠的性格。
3. 严禁任何动作、旁白或心理描写！直接输出台词。`;

            const reply = await window.PhoneAPI.chatWithAI([
                { role: 'system', content: sysPrompt },
                { role: 'user', content: userSay }
            ]);

            const cleanReply = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<inner>[\s\S]*?<\/inner>/gi, '').trim();
            if (cleanReply) {
                this.updateCompanionBubble(cleanReply);
            }
        } catch (e) {
            this.updateCompanionBubble(`“……刚才在看那道题的辅助线，你刚才说什么？”`);
        }
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

                const prompt = `你扮演${taName}，正陪${myName}看数学课《${this.currentVideoTitle}》。请针对当前情境随口自言自语或吐槽一句（比如黑板上的数字像犯罪密码、自己吃香蕉、或者老派冷幽默）。要求：20字以内，口语，严禁括号描写！`;
                const reply = await window.PhoneAPI.chatWithAI([
                    { role: 'system', content: persona },
                    { role: 'user', content: prompt }
                ]);
                const clean = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<inner>[\s\S]*?<\/inner>/gi, '').trim();
                if (clean) this.updateCompanionBubble(clean);
            } catch(e) {}
        }, 110000);
    }
};

if (typeof window !== 'undefined') {
    window.CinemaEngine = CinemaEngine;
}
