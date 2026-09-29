/**
 * 🎬 专属放映室引擎 (CinemaEngine)
 * 支持：B站无广告内嵌播放、本地视频流、网络MP4、AI伴看实时互动
 */
export const CinemaEngine = {
    currentVideoType: 'none', // 'bilibili' | 'local'
    currentVideoTitle: '未命名视频',
    cinemaTimer: null,

    // 解析 B站链接或 BV号
    parseBilibiliUrl(input) {
        if (!input) return null;
        const str = input.trim();
        // 匹配 BV 号
        const bvMatch = str.match(/(BV[a-zA-Z0-9]{10})/i);
        if (bvMatch) return bvMatch[1];
        // 匹配 av 号
        const avMatch = str.match(/av(\d+)/i);
        if (avMatch) return `av${avMatch[1]}`;
        return null;
    },

    // 载入 B站视频
    loadBilibiliVideo(input, title = '') {
        const vid = this.parseBilibiliUrl(input);
        if (!vid) {
            if (window.PhoneAPI) window.PhoneAPI.showToast("⚠️ 未识别到有效B站链接或BV号");
            return false;
        }

        this.currentVideoType = 'bilibili';
        this.currentVideoTitle = title.trim() || 'B站视频';

        const screenContainer = document.getElementById('cinema-screen-box');
        if (!screenContainer) return false;

        // B站纯净官方 iframe 嵌入（支持自动切横屏、高清）
        const isBv = vid.startsWith('BV');
        const iframeUrl = `https://player.bilibili.com/player.html?${isBv ? 'bvid=' + vid : 'aid=' + vid.replace('av','')}&page=1&high_quality=1&as_wide=1&danmaku=0`;

        screenContainer.innerHTML = `
            <iframe src="${iframeUrl}" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="width: 100%; height: 100%; border-radius: 14px; border: none;"></iframe>
        `;

        this.updateCompanionBubble(`“案发现场（视频）准备好了。坐吧，让我看看今天是什么大案子。”`);
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

    // 伴看吐槽气泡更新
    updateCompanionBubble(text) {
        const bubble = document.getElementById('cinema-companion-bubble');
        const bubbleText = document.getElementById('cinema-bubble-text');
        if (!bubble || !bubbleText) return;

        bubbleText.innerText = text;
        bubble.style.opacity = '1';
        bubble.style.transform = 'translateY(0)';

        // 6秒后自然隐退
        clearTimeout(this._bubbleTimer);
        this._bubbleTimer = setTimeout(() => {
            bubble.style.opacity = '0';
            bubble.style.transform = 'translateY(15px)';
        }, 6000);
    },

    // 观众（你）发表吐槽，不死途实时接梗
    async sendCinemaComment() {
        const input = document.getElementById('cinema-comment-input');
        if (!input || !input.value.trim()) return;

        const userSay = input.value.trim();
        input.value = '';

        // 先把你的吐槽以简短气泡展示出来
        this.updateCompanionBubble(`我: “${userSay}” ...`);

        try {
            const persona = localStorage.getItem('char_persona') || '';
            const taName = localStorage.getItem('char_name') || 'TA';
            const myName = localStorage.getItem('my_name') || '我';

            const sysPrompt = `【系统指令】：你扮演${taName}。你此刻正和${myName}并肩坐在沙发/长椅上看同一个视频。
当前正在看的视频是：《${this.currentVideoTitle}》。
${persona}

【情境任务】：对方看视频时随口跟你吐槽了一句：“${userSay}”。
【要求】：
1. 极其简短口语化，像坐在身边的人漫不经心地随口回应你（15~35字以内）。
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

    // 伴看定时随缘闲聊（每隔 90~150 秒偶尔蹦出一句）
    startProactiveCompanion() {
        clearInterval(this.cinemaTimer);
        this.cinemaTimer = setInterval(async () => {
            // 只有当前页面还在看视频时才闲聊
            const box = document.getElementById('together-cinema-view');
            if (!box || box.style.display === 'none') return;

            try {
                const taName = localStorage.getItem('char_name') || 'TA';
                const persona = localStorage.getItem('char_persona') || '';
                const myName = localStorage.getItem('my_name') || '她';

                const prompt = `你扮演${taName}，正陪${myName}看视频《${this.currentVideoTitle}》。请针对当前看视频的情境，像身边真人一样随口自言自语或吐槽一句（比如吃香蕉、嫌画面晃、或者对视频内容的冷幽默吐槽）。要求：20字以内，口语，严禁括号描写！`;
                const reply = await window.PhoneAPI.chatWithAI([
                    { role: 'system', content: persona },
                    { role: 'user', content: prompt }
                ]);
                const clean = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<inner>[\s\S]*?<\/inner>/gi, '').trim();
                if (clean) this.updateCompanionBubble(clean);
            } catch(e) {}
        }, 110000); // 约2分钟一次
    }
};

if (typeof window !== 'undefined') {
    window.CinemaEngine = CinemaEngine;
}
