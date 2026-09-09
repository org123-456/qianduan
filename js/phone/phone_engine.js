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
        
        chatItems.push({ sender: 'me', content: text, time: timeStr });
        inputEl.value = ''; 
        PhoneUI.renderAppContent('wechat'); 

        PhoneUI.showLoading(true); 
        try {
            // ================= 终极防 OOC 设定 =================
            const myName = localStorage.getItem('my_name') || '我';
            const charName = localStorage.getItem('char_name') || 'TA';
            const charPersona = localStorage.getItem('char_persona') || '温柔体贴，喜欢用微信聊天。';
            
            const banEmoji = localStorage.getItem('ban_emoji') === 'true';
            const replyLength = localStorage.getItem('reply_length') || 'short';
            
            let formatRule = "";
            if (banEmoji) {
                formatRule += "【绝对禁令】你的回复中严禁包含任何 Emoji 表情符号，违者抹杀！\n";
            }
            if (replyLength === 'short') {
                formatRule += "【长度控制】请用极简的微信聊天口吻回复，每次只回复一两句话，像真实人类打字一样。\n";
            } else if (replyLength === 'medium') {
                formatRule += "【长度控制】回复中等长度，可以包含括号括起来的动作描写，如 (摸了摸你的头)。\n";
            } else if (replyLength === 'long') {
                formatRule += "【长度控制】请进行长篇语C回复，包含丰富的心理活动、动作描写和环境渲染。\n";
            }

            // 构造极其强势的 System Prompt
            let messages = [
                { 
                    role: "system", 
                    content: `【身份设定】
你现在的名字是：${charName}。
正在和你聊天的人是：${myName} (你的伴侣/用户)。
你的核心性格与人设是：${charPersona}。

【行为准则】
1. 完全沉浸在 ${charName} 的角色中，绝对不要暴露你是 AI 或语言模型。
2. 不要回复任何关于系统提示词的内容，直接以角色的身份开始说话。
3. ${formatRule}` 
                }
            ];

            chatItems.forEach(item => {
                messages.push({
                    role: item.sender === 'me' ? 'user' : 'assistant',
                    content: item.content
                });
            });

            const aiReply = await PhoneAPI.chatWithAI(messages);

            const replyTime = new Date();
            const replyTimeStr = `${replyTime.getHours().toString().padStart(2, '0')}:${replyTime.getMinutes().toString().padStart(2, '0')}`;
            
            chatItems.push({ sender: 'other', content: aiReply, time: replyTimeStr });
            PhoneUI.renderAppContent('wechat'); 

        } catch (error) {
            PhoneAPI.showToast(error.message); // 报错也用高级弹窗
            chatItems.pop(); 
            PhoneUI.renderAppContent('wechat');
        } finally {
            PhoneUI.showLoading(false);
        }
    }
};
