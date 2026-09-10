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

    async rollTopic() {
        const resultEl = document.getElementById('roulette-result');
        const btnEl = document.getElementById('roulette-btn');
        const iconEl = document.getElementById('roulette-icon');

        if(!resultEl || !btnEl) return;

        btnEl.disabled = true;
        btnEl.innerHTML = '<i class="ph ph-spinner spin-anim"></i> 正在生成...';
        iconEl.classList.add('spin-anim'); 
        resultEl.innerHTML = '<span style="color:#999; font-size: 14px;">正在分析你们的聊天记录...<br>寻找最合适的话题...</span>';

        try {
            const roleId = Config.currentContactId;
            const chatItems = Config.phoneData[roleId]?.wechat?.items || [];
            
            const recentItems = chatItems.slice(-10); 
            let historyText = recentItems.map(item => `${item.sender === 'me' ? '我' : 'TA'}: ${item.content}`).join('\n');
            if(!historyText) historyText = "(暂无聊天记录，你们才刚认识)";

            const customSystemPrompt = localStorage.getItem('char_persona') || '';

            const prompt = `你是一个高情商的语C辅助军师。以下是我们当前正在进行的角色扮演设定：
${customSystemPrompt}

请根据以上设定，以及以下我和TA的近期聊天记录，为我提供【3个不同风格】的回复建议，让我可以直接发给TA。
风格要求：
1. 顺着对方的话往下接（自然/撒娇/暧昧）。
2. 故意调侃、反击或傲娇。
3. 开启一个相关的新话题。

【绝对强制格式】：
请直接输出这3句话，用分隔符 "|||" 隔开。绝对不要输出任何序号、标签、解释或多余的废话！不要输出<think>！
示例格式：
好呀，我在家等你，快点来接我|||你买的饮料最好是我爱喝的，不然扣你工资|||旁白没把账单弄乱吧？

近期聊天记录：
${historyText}`;

            const messages = [{ role: "user", content: prompt }];
            const reply = await PhoneAPI.chatWithAI(messages);

            let finalTopic = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
            finalTopic = finalTopic.replace(/```.*?/g, '').replace(/```/g, '').trim();

            let options = finalTopic.split('|||').map(s => s.trim()).filter(s => s.length > 0);
            if (options.length === 1) {
                options = finalTopic.split('\n').map(s => s.replace(/^\d+[\.、]\s*/, '').trim()).filter(s => s.length > 0);
            }
            options = options.slice(0, 3); 

            let html = '';
            const styles = [
                { title: '🌸 顺势回复', color: '#e5989b', bg: '#fff0f1', border: '#ffccd5' },
                { title: '✨ 调侃反击', color: '#4a70a8', bg: '#e8f0fa', border: '#b0c4de' },
                { title: '🎈 开启新话题', color: '#f4a261', bg: '#fff5e6', border: '#ffe0b2' }
            ];

            options.forEach((opt, idx) => {
                const style = styles[idx] || styles[0];
                html += `
                    <div onclick="window.PhoneEngine.useTopic('${opt.replace(/'/g, "\\'")}')" style="padding: 12px; background: ${style.bg}; border: 1px solid ${style.border}; border-radius: 12px; text-align: left; cursor: pointer; transition: 0.2s;">
                        <div style="font-size: 11px; color: ${style.color}; font-weight: bold; margin-bottom: 4px;">${style.title}</div>
                        <div style="font-size: 14px; color: #333;">${opt}</div>
                    </div>
                `;
            });

            resultEl.innerHTML = html;

        } catch (error) {
            resultEl.innerHTML = `<span style="color:#ff4d4f; font-size: 14px;">生成失败：${error.message}</span>`;
        } finally {
            btnEl.disabled = false;
            btnEl.innerHTML = '<i class="ph-fill ph-arrows-clockwise"></i> 换一批';
            iconEl.classList.remove('spin-anim');
        }
    },

    useTopic(topic) {
        window.PhoneUI.closeApp(); 
        const inputEl = document.getElementById('chat-input');
        if(inputEl) {
            inputEl.value = topic; 
            inputEl.focus();
        }
    },

    sendUserMsgOnly() {
        const inputEl = document.getElementById('chat-input');
        if(!inputEl) return;
        const text = inputEl.value.trim();
        if (!text) return;

        const roleId = Config.currentContactId;
        if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
        if (!Config.phoneData[roleId].wechat) Config.phoneData[roleId].wechat = { items: [] };
        const chatItems = Config.phoneData[roleId].wechat.items;

        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        chatItems.push({ sender: 'me', content: text, time: timeStr });
        inputEl.value = '';

        PhoneUI.renderAppContent('wechat');
        localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
    },

    async sendChatMessage(isRegen = false) {
        const roleId = Config.currentContactId;
        if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
        if (!Config.phoneData[roleId].wechat) Config.phoneData[roleId].wechat = { items: [] };
        const chatItems = Config.phoneData[roleId].wechat.items;

        let hasNewUserMsg = false;

        if (!isRegen) {
            const inputEl = document.getElementById('chat-input');
            if(inputEl) {
                const text = inputEl.value.trim();
                if (text) {
                    const now = new Date();
                    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                    chatItems.push({ sender: 'me', content: text, time: timeStr });
                    inputEl.value = '';
                    hasNewUserMsg = true;
                }
            }
        }

        if (!isRegen && !hasNewUserMsg && chatItems.length === 0) return;

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

            // 🌟 核心：提取 AI 的内心戏！
            const thinkMatch = rawReply.match(/<think>([\s\S]*?)<\/think>/i);
            const innerThought = thinkMatch ? thinkMatch[1].trim() : "（TA的大脑一片空白...）";

            let finalReply = rawReply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
            if (!finalReply) finalReply = rawReply.trim();

            chatItems.pop(); 
            
            const replyTime = new Date();
            const replyTimeStr = `${replyTime.getHours().toString().padStart(2, '0')}:${replyTime.getMinutes().toString().padStart(2, '0')}`;
            
            const replyParts = finalReply.split('\n').map(s => s.trim()).filter(s => s.length > 0);
            
            replyParts.forEach(part => {
                // 将提取到的 innerThought 塞进消息对象里！
                chatItems.push({ sender: 'other', content: part, time: replyTimeStr, innerThought: innerThought });
            });

            PhoneUI.renderAppContent('wechat'); 
            localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));

        } catch (error) {
            PhoneAPI.showToast(error.message);
            chatItems.pop(); 
            if (hasNewUserMsg) chatItems.pop(); 
            PhoneUI.renderAppContent('wechat');
            localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
        }
    }
};
