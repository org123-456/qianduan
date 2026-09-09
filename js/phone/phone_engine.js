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
            // ================= 核心：读取你自定义的人设 =================
            const charName = localStorage.getItem('char_name') || '你的伴侣';
            const charPersona = localStorage.getItem('char_persona') || '温柔体贴，喜欢用微信聊天。';
            
            let messages = [
                { 
                    role: "system", 
                    content: `你正在扮演 ${charName}，正在和你的伴侣(用户)用微信聊天。
你的核心人设与性格是：${charPersona}。
请严格遵循人设，用简短、自然、口语化的微信口吻回复，不要带任何特殊格式标记，不要像AI客服。` 
                }
            ];

            // 附带历史聊天记录，让 AI 有记忆
            chatItems.forEach(item => {
                messages.push({
                    role: item.sender === 'me' ? 'user' : 'assistant',
                    content: item.content
                });
            });

            // 发送给大模型
            const aiReply = await PhoneAPI.chatWithAI(messages);

            const replyTime = new Date();
            const replyTimeStr = `${replyTime.getHours().toString().padStart(2, '0')}:${replyTime.getMinutes().toString().padStart(2, '0')}`;
            
            chatItems.push({ sender: 'other', content: aiReply, time: replyTimeStr });
            PhoneUI.renderAppContent('wechat'); 

        } catch (error) {
            alert(error.message);
            chatItems.pop(); 
            PhoneUI.renderAppContent('wechat');
        } finally {
            PhoneUI.showLoading(false);
        }
    }
};
