import { Config } from './phone_config.js';
import { PhoneAPI } from './phone_api.js';
import { PhoneUI } from './phone_ui.js';

export const PhoneEngine = {
    async sendChatMessage() {
        const inputEl = document.getElementById('chat-input');
        const text = inputEl.value.trim();
        if (!text) return;

        const roleId = Config.currentContactId;
        
        if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
        if (!Config.phoneData[roleId].wechat) Config.phoneData[roleId].wechat = { items: [] };
        const chatItems = Config.phoneData[roleId].wechat.items;

        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        // 1. 存入我的消息
        chatItems.push({ sender: 'me', content: text, time: timeStr });
        inputEl.value = ''; 
        
        // 2. 存入假 loading 消息
        chatItems.push({ sender: 'typing' });
        PhoneUI.renderAppContent('wechat'); 
        
        // 【核心新增】：立刻把我的消息存档到本地！
        localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));

        try {
            const myName = localStorage.getItem('my_name') || '我';
            const charName = localStorage.getItem('char_name') || 'TA';
            const charPersona = localStorage.getItem('char_persona') || '温柔体贴';
            
            const banEmoji = localStorage.getItem('ban_emoji') === 'true';
            const replyLength = localStorage.getItem('reply_length') || 'short';
            
            let formatRule = "";
            if (banEmoji) {
                formatRule += "- 【最高禁令】：绝对不允许使用任何 Emoji、颜文字、波浪号，违者抹杀！\n";
            }
            if (replyLength === 'short') {
                formatRule += "- 【长度要求】：极简微信口吻，每次只回 1 到 2 句话，像真实人类打字。\n";
            } else if (replyLength === 'medium') {
                formatRule += "- 【长度要求】：中等长度，可以包含括号括起来的动作描写，如 (摸了摸你的头)。\n";
            } else if (replyLength === 'long') {
                formatRule += "- 【长度要求】：长篇语C风格，包含丰富的心理活动、动作描写和环境渲染。\n";
            }

            let messages = [
                { 
                    role: "system", 
                    content: `你现在不是 AI，也不是语言模型，你是一个活生生的人。
你的名字是：【${charName}】。
正在和你聊天的人是：【${myName}】（你的伴侣）。

【你的核心人设】：
${charPersona}

【绝对规则】（违反任何一条都将被判定为失败）：
1. 完全沉浸在角色中，以第一人称（我）说话。绝对不要提及“作为AI”、“语言模型”等字眼。
2. 不要像客服一样热情、客套、恭敬。你们是亲密的情侣关系，语气要自然、随性、甚至可以带点小脾气。
3. 绝对不要重复我说的话，直接给出你的反应或回答。
${formatRule}` 
                }
            ];

            chatItems.forEach(item => {
                if (item.sender !== 'typing') { 
                    messages.push({
                        role: item.sender === 'me' ? 'user' : 'assistant',
                        content: item.content
                    });
                }
            });

            const aiReply = await PhoneAPI.chatWithAI(messages);

            // 删除假 loading 消息
            chatItems.pop(); 
            
            const replyTime = new Date();
            const replyTimeStr = `${replyTime.getHours().toString().padStart(2, '0')}:${replyTime.getMinutes().toString().padStart(2, '0')}`;
            
            // 3. 存入 AI 的回复
            chatItems.push({ sender: 'other', content: aiReply, time: replyTimeStr });
            PhoneUI.renderAppContent('wechat'); 

            // 【核心新增】：立刻把 AI 的回复存档到本地！
            localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));

        } catch (error) {
            PhoneAPI.showToast(error.message);
            chatItems.pop(); // 删掉 typing
            chatItems.pop(); // 撤回我说的话
            PhoneUI.renderAppContent('wechat');
            
            // 报错撤回后，也要更新一下存档
            localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
        }
    }
};
