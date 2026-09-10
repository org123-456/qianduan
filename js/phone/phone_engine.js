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
            
            // 🌟 核心改变：直接从网页的那个大框框里读取提示词！代码里不再有任何硬编码！
            const customSystemPrompt = localStorage.getItem('char_persona') || '你是一个友好的AI助手。';
            
            const banEmoji = localStorage.getItem('ban_emoji') === 'true';
            const replyLength = localStorage.getItem('reply_length') || 'short';
            
            let formatRule = "";
            if (banEmoji) formatRule += "【最高禁令】：绝对不允许使用任何 Emoji、颜文字、波浪号(~)，违者抹杀！\n";
            if (replyLength === 'short') formatRule += "【长度要求】：极简微信口吻，每次回 1 到 3 句话。\n";
            else if (replyLength === 'medium') formatRule += "【长度要求】：中等长度，可包含括号动作描写。\n";
            else if (replyLength === 'long') formatRule += "【长度要求】：长篇语C风格，包含心理和动作描写。\n";

            formatRule += "【排版要求】：为了模拟真实的微信连发效果，如果你的回复包含两句或以上的话，请务必使用换行符（回车）将它们分开！不要把所有话挤在同一行！\n";

            let messages = [
                { 
                    role: "system", 
                    // 把你在网页上填的神级提示词，和强制规则拼接在一起发给 AI
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

            // 依然保留剥离 <think> 的逻辑，兼容小红书协议
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
