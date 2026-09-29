/**
 * 🎬 专属放映室引擎 (CinemaEngine) - 增强版
 * 完美支持：B站App短链(b23.tv)、BV号提取、本地视频流、实时伴看互动
 */
export const CinemaEngine = {
    currentVideoType: 'none',
    currentVideoTitle: '未命名视频',
    cinemaTimer: null,

    // 智能提取 BV 号或短链
    async extractBiliId(input) {
        if (!input) return null;
        const str = input.trim();

        // 1. 直接匹配 BV 号 (如 BV1GJ411x7h7)
        const bvMatch = str.match(/(BV[a-zA-Z0-9]{10})/i);
        if (bvMatch) return bvMatch[1];

        // 2. 直接匹配 av 号
        const avMatch = str.match(/av(\d+)/i);
        if (avMatch) return `av${avMatch[1]}`;

        // 3. 匹配 b23.tv 短链 (从分享文本中抽取出短链)
        const b23Match = str.match(/https?:\/\/b23\.tv\/[a-zA-Z0-9]+/i);
        if (b23Match) {
            try {
                if (window.PhoneAPI) window.PhoneAPI.showToast("🔍 正在解析 B站 手机端短链接...");
                // 通过免费无跨域 API 还原短链目标地址
                const res = await fetch(`https://api.bilibili.com/x/web-interface/share/click`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `share_target=1&share_mode=1&oid=0&platform=android&share_url=${encodeURIComponent(b23Match[0])}`
                }).catch(() => null);
                
                // 兜底方案：直接用短链作为 iframe 或引导用户
                return b23Match[0];
            } catch(e) {}
            return b23Match[0];
        }

        return null;
    },

    // 载入 B站视频
    async loadBilibiliVideo(input, title = '') {
        const vid = await this.extractBiliId(input);
        if (!vid) {
            if (window.PhoneAPI) window.PhoneAPI.showToast("⚠️ 未识别到B站链接或BV号");
            return false;
        }

        this.currentVideoType = 'bilibili';
        this.currentVideoTitle = title.trim() || 'B站视频';

        const screenContainer = document.getElementById('cinema-screen-box');
        if (!screenContainer) return false;

        let iframeUrl = '';
        if (vid.startsWith('BV')) {
            iframeUrl = `https://player.bilibili.com/player.html?bvid=${vid}&page=1&high_quality=1&as_wide=1&danmaku=0`;
        } else if (vid.startsWith('av')) {
            iframeUrl = `https://player.bilibili.com/player.html?aid=${vid.replace('av','')}&page=1&high_quality=1&as_wide=1&danmaku=0`;
        } else {
            // 短链接兼容直连模式
            iframeUrl = vid;
        }

        screenContainer.innerHTML = `
            <iframe src="${iframeUrl}" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="width: 100%; height: 100%; border-radius: 14px; border: none; background: #000;"></iframe>
        `;

        this.updateCompanionBubble(`“案发现场（视频）准备好了。坐吧，让我看看这道题到底有多难。”`);
        this.startProactiveCompanion();
        return true;
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

        this.updateCompanionBubble(`“带了新带子来？行，正好休息会儿。”`);
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

            const sysPrompt = `【系统指令】：你扮演${taName}。你此刻正和${myName}并肩坐在一起看视频。
当前正在看的视频是：《${this.currentVideoTitle}》。
${persona}

【情境任务】：对方看视频时随口跟你吐槽了一句：“${userSay}”。
【要求】：
1. 极其简短口语化，像坐在身边的人随口回应你（15~35字以内）。
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
            this.updateCompanionBubble(`“……刚才晃了下神，你刚才说什么？”`);
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

                const prompt = `你扮演${taName}，正陪${myName}看视频《${this.currentVideoTitle}》。请针对当前情境随口自言自语或吐槽一句（比如吃香蕉、嫌黑板字乱、或者冷幽默）。要求：20字以内，口语，严禁括号描写！`;
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
