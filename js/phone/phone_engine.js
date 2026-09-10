import { Config } from './phone_config.js';
import { PhoneAPI } from './phone_api.js';
import { PhoneUI } from './phone_ui.js';

export const PhoneEngine = {
    currentMsgIndex: -1,

    openMsgMenu(index, sender) {
        this.currentMsgIndex = index;
        document.getElementById('action-bg').classList.add('show');
        document.getElementById('action-sheet').classList.add('show');
        const btnRegen = document.getElementById('btn-regen');
        if (btnRegen) btnRegen.style.display = (sender === 'other') ? 'flex' : 'none';
    },

    closeMsgMenu() {
        document.getElementById('action-bg').classList.remove('show');
        document.getElementById('action-sheet').classList.remove('show');
    },

    deleteMsg() {
        this.closeMsgMenu();
        if (this.currentMsgIndex < 0) return;
        const roleId = Config.currentContactId;
        Config.phoneData[roleId].wechat.items.splice(this.currentMsgIndex, 1);
        PhoneUI.renderAppContent('wechat');
        localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
        PhoneAPI.showToast("🗑️ 消息已删除");
    },

    editMsg() {
        this.closeMsgMenu();
        if (this.currentMsgIndex < 0) return;
        const roleId = Config.currentContactId;
        const oldText = Config.phoneData[roleId].wechat.items[this.currentMsgIndex].content;
        const newText = prompt("✏️ 编辑消息：", oldText);
        if (newText !== null && newText.trim() !== "") {
            Config.phoneData[roleId].wechat.items[this.currentMsgIndex].content = newText.trim();
            PhoneUI.renderAppContent('wechat');
            localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
            PhoneAPI.showToast("✅ 修改成功");
        }
    },

    regenMsg() {
        this.closeMsgMenu();
        if (this.currentMsgIndex < 0) return;
        const roleId = Config.currentContactId;
        Config.phoneData[roleId].wechat.items.splice(this.currentMsgIndex);
        PhoneUI.renderAppContent('wechat');
        localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
        this.sendChatMessage(true);
    },

    // 🌟 新增：AI 军师转盘逻辑
    async rollTopic() {
        const resultEl = document.getElementById('roulette-result');
        const btnEl = document.getElementById('roulette-btn');
        const iconEl = document.getElementById('roulette-icon');

        if(!resultEl || !btnEl) return;

        // 开启 UI 动画
        btnEl.disabled = true;
        btnEl.innerHTML = '<i class="ph ph-spinner spin-anim"></i> 正在生成...';
        iconEl.classList.add('spin-anim'); 
        resultEl.innerHTML = '<span style="color:#999; font-size: 14px;">正在分析你们的聊天记录...<br>寻找最合适的话题...</span>';

        try {
            const roleId = Config.currentContactId;
            const chatItems = Config.phoneData[roleId]?.wechat?.items || [];
            
            // 提取最近 10 条聊天记录
            const recentItems = chatItems.slice(-10); 
            let historyText = recentItems.map(item => `${item.sender === 'me' ? '我' : 'TA'}: ${item.content}`).join('\n');
            if(!historyText) historyText = "(暂无聊天记录，你们才刚认识)";

            const prompt = `你是一个高情商的恋爱/语C辅助军师。请根据以下我和TA的近期聊天记录，为我提供【一句】我现在可以发给TA的话，用来开启新话题、调情、或者延续对话。
要求：
1. 必须符合当前的聊天语境，不要突兀。
2. 语言简练、自然，像真人发微信，不要太长。
3. 绝对只输出这句话本身，不要任何解释，不要引号！

近期聊天记录：
${historyText}`;

            const messages = [{ role: "user", content: prompt }];
            const reply = await PhoneAPI.chatWithAI(messages);

            // 剥离 <think>，清理引号
            const finalTopic = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim().replace(/^["']|["']$/g, '');

            // 显示结果和发送按钮
            resultEl.innerHTML = `
                <div style="font-size: 15px; color: #333; font-weight: bold; margin-bottom: 15px; padding: 15px; background: #fff5e6; border: 1px solid #ffe0b2; border-radius: 12px; text-align: left;">${finalTopic}</div>
                <button class="btn-refresh" onclick="window.PhoneEngine.useTopic('${finalTopic.replace(/'/g, "\\'")}')" style="background: #4a70a8; margin-top: 0;"><i class="ph-fill ph-paper-plane-right"></i> 发送到聊天框</button>
            `;

        } catch (error) {
            resultEl.innerHTML = `<span style="color:#ff4d4f; font-size: 14px;">生成失败：${error.message}</span>`;
        } finally {
            // 恢复 UI
            btnEl.disabled = false;
            btnEl.innerHTML = '<i class="ph-fill ph-arrows-clockwise"></i> 换一个话题';
            iconEl.classList.remove('spin-anim');
        }
    },

    // 🌟 新增：将转盘话题填入输入框
    useTopic(topic) {
        window.PhoneUI.closeApp(); // 关闭转盘窗口
        const inputEl = document.getElementById('chat-input');
        if(inputEl) {
            inputEl.value = topic; // 填入输入框，用户可以修改后再发
            inputEl.focus();
        }
    },

    async sendChatMessage(isRegen = false) {
        const roleId = Config.currentContactId;
        if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
        if (!Config.phoneData[roleId].wechat) Config.phoneData[roleId].wechat = { items: [] };
        const chatItems = Config.phoneData[roleId].wechat.items;

        if (!isRegen) {
            const inputEl = document.getElementById('chat-input');
            const text = inputEl.value.trim();
            if (!text) return;

            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            chatItems.push({ sender: 'me', content: text, time: timeStr });
            inputEl.value = ''; 
        }
        
        chatItems.push({ sender: 'typing' });
        PhoneUI.renderAppContent('wechat'); 
        localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));

        try {
            const myName = localStorage.getItem('my_name') || '我';
            const customSystemPrompt = localStorage.getItem('char_persona') || '你是一个友好的AI助手。';
            const banEmoji = localStorage.getItem('ban_emoji') === 'true';
            
            let formatRule = "";
            if (banEmoji) formatRule += "【最高禁令】：绝对不允许使用任何 Emoji、颜文字、波浪号(~)，违者抹杀！\n";

            formatRule += "【微信连发强制要求】：你每次回复**必须**输出 4 到 5 句话，并且**每一句话都必须用换行符（回车）隔开**！系统会根据换行符将你的回复切分成多个连续的微信气泡。绝对不要只回一句话，也绝对不要把所有话挤在同一行！\n";

            let messages = [
                { 
                    role: "system", 
                    content: `${customSystemPrompt}\n\n当前正在和你聊天的人是：【${myName}】。\n${formatRule}` 
                }
            ];

            const MAX_CONTEXT = 20;
            const recentItems = chatItems.slice(-MAX_CONTEXT);

            recentItems.forEach((item, index) => {
                if (item.sender !== 'typing') { 
                    messages.push({
                        role: item.sender === 'me' ? 'user' : 'assistant',
                        content: item.content
                    });
                }
            });

            const rawReply = await PhoneAPI.chatWithAI(messages);

            let finalReply = rawReply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
            if (!finalReply) finalReply = rawReply.trim();

            chatItems.pop(); 
            
            const replyTime = new Date();
            const replyTimeStr = `${replyTime.getHours().toString().padStart(2, '0')}:${replyTime.getMinutes().toString().padStart(2, '0')}`;
            
            const replyParts = finalReply.split('\n').map(s => s.trim()).filter(s => s.length > 0);
            
            replyParts.forEach(part => {
                chatItems.push({ sender: 'other', content: part, time: replyTimeStr });
            });

            PhoneUI.renderAppContent('wechat'); 
            localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));

        } catch (error) {
            PhoneAPI.showToast(error.message);
            chatItems.pop(); 
            if (!isRegen) chatItems.pop(); 
            PhoneUI.renderAppContent('wechat');
            localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
        }
    }
};
