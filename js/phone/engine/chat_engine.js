import { Config } from '../phone_config.js';
import { PhoneAPI } from '../phone_api.js';
import { PhoneUI } from '../phone_ui.js';

export const ChatEngine = {
    currentMsgIndex: -1,

    _safeSaveData() {
        try {
            if (Config?.phoneData) {
                localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
            }
        } catch (e) {
            PhoneAPI?.logger?.log('WARN', '消息持久化写入超限', e.message);
        }
    },

    getRealIndex(index) {
        const roleId = Config?.currentContactId;
        const items = Config?.phoneData?.[roleId]?.wechat?.items || [];
        if (items.length > 50 && index < 50) return items.length - 50 + index;
        return index;
    },

    cleanStuckTyping() {
        let changed = false;
        if (!Config?.phoneData) return;
        for (const roleId in Config.phoneData) {
            const target = Config.phoneData[roleId]?.wechat;
            if (target && Array.isArray(target.items)) {
                // 彻底清除所有 typing 项
                const initLen = target.items.length;
                target.items = target.items.filter(i => i.sender !== 'typing');
                if (target.items.length !== initLen) changed = true;
            }
        }

        if (changed) {
            this._safeSaveData();
            if (PhoneUI) PhoneUI.renderAppContent?.('wechat');
            PhoneAPI?.showToast?.('✅ 已强制解除卡死状态！');
            return;
        }
        PhoneAPI?.showToast?.('当前没有卡死的状态。');
    },

    openMsgMenu(index, sender) {
        this.currentMsgIndex = index;
        const bg = document.getElementById('action-bg');
        const sheet = document.getElementById('action-sheet');
        if (bg) bg.classList.add('show');
        if (sheet) sheet.classList.add('show');
        const btnRegen = document.getElementById('btn-regen');
        if (btnRegen) btnRegen.style.display = sender === 'other' ? 'flex' : 'none';
    },

    closeMsgMenu() {
        const bg = document.getElementById('action-bg');
        const sheet = document.getElementById('action-sheet');
        if (bg) bg.classList.remove('show');
        if (sheet) sheet.classList.remove('show');
    },

    async sendChatMessage(isRegen = false) {
        const roleId = Config?.currentContactId;
        if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
        if (!Config.phoneData[roleId].wechat) Config.phoneData[roleId].wechat = { items: [] };
        const chatItems = Config.phoneData[roleId].wechat.items;
        let hasNewUserMsg = false; 
        let latestUserText = '';
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        if (!isRegen) {
            const inputEl = document.getElementById('chat-input');
            if (inputEl) {
                const text = inputEl.value.trim();
                if (text) {
                    chatItems.push({ sender: 'me', content: text, time: timeStr, date: dateStr });
                    inputEl.value = '';
                    hasNewUserMsg = true;
                    latestUserText = text;
                } else {
                    for (let i = chatItems.length - 1; i >= 0; i--) {
                        if (chatItems[i].sender === 'me' && !chatItems[i].content.includes('![图片]')) {
                            latestUserText = chatItems[i].content;
                            hasNewUserMsg = true; 
                            break;
                        }
                    }
                }
            }
        }

        if (!isRegen && !hasNewUserMsg && chatItems.length === 0) return;

        // 🌟 先确保清理之前的残留 typing
        for (let i = chatItems.length - 1; i >= 0; i--) {
            if (chatItems[i].sender === 'typing') chatItems.splice(i, 1);
        }

        chatItems.push({ sender: 'typing' });
        PhoneUI.renderAppContent('wechat');
        this._safeSaveData();

        try {
            let systemPrompt = localStorage.getItem('system_prompt') || '';
            let charPersona = localStorage.getItem('char_persona') || '';

            if (window.PhoneAPI?.LocalDB) {
                try {
                    const dbSys = await window.PhoneAPI.LocalDB.get('direct_sys_text');
                    const dbChar = await window.PhoneAPI.LocalDB.get('direct_char_text');
                    if (dbSys && typeof dbSys === 'string') systemPrompt = dbSys;
                    if (dbChar && typeof dbChar === 'string') charPersona = dbChar;
                } catch(e) {}
            }
            
            const currentNow = new Date();
            const curYear = currentNow.getFullYear();
            const curMonth = currentNow.getMonth() + 1;
            const curDate = currentNow.getDate();
            const curHour = currentNow.getHours(); 
            const curMin = currentNow.getMinutes();
            const daysArr = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            const curWeek = daysArr[currentNow.getDay()];
            const timeStrStandard = `${String(curHour).padStart(2, '0')}:${String(curMin).padStart(2, '0')}`;

            let stablePrompt = `【⚠️当前现实唯一准确时间锚点】：此时此刻是 ${curYear}年${curMonth}月${curDate}日 ${curWeek} ${timeStrStandard}。\n\n`;
            if (systemPrompt) stablePrompt += `【系统核心指令】：\n${systemPrompt}\n\n`;
            if (charPersona) stablePrompt += `【角色设定】：\n${charPersona}\n\n`;

            stablePrompt += "【最高禁令】：直接输出台词！\n【微信连发机制】：根据换行切分气泡。\n【读心术机制】：回复前必须用 <inner> 和 </inner> 包裹内心独白。\n";

            let messages = [{ role: 'system', content: stablePrompt }];
            const MAX_CONTEXT = parseInt(localStorage.getItem('context_chat_limit') || '30', 10);
            const recentItems = chatItems.slice(-MAX_CONTEXT);
            
            recentItems.forEach((item) => {
                if (item && item.sender !== 'typing') {
                    messages.push({ role: item.sender === 'me' ? 'user' : 'assistant', content: item.content || "" });
                }
            });

            const rawReply = await PhoneAPI.chatWithAI(messages);
            
            const innerMatch = rawReply.match(/<inner>([\s\S]*?)<\/inner>/i);
            const innerThought = innerMatch ? innerMatch[1].trim() : '（TA的心思藏得很深...）';
            let finalReply = rawReply.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<inner>[\s\S]*?<\/inner>/gi, '').trim();
            if (!finalReply) finalReply = rawReply.trim();
            
            // 🌟 移除 typing
            for (let i = chatItems.length - 1; i >= 0; i--) {
                if (chatItems[i].sender === 'typing') chatItems.splice(i, 1);
            }

            const replyParts = finalReply.split('\n').map(s => s.trim()).filter(Boolean);
            for (let idx = 0; idx < replyParts.length; idx++) {
                chatItems.push({ 
                    sender: 'other', 
                    content: replyParts[idx], 
                    time: timeStr, 
                    date: dateStr, 
                    innerThought: idx === 0 ? innerThought : '（连发消息，心声已在上一条显示）' 
                });
            }
            
            PhoneUI.renderAppContent('wechat');
            this._safeSaveData();

        } catch (error) {
            PhoneAPI.logger?.log('ERROR', '对话请求失败', error.message);
            PhoneAPI.showToast(error.message || '请求遇到异常');
            
            // 🌟 铁壁熔断：只要报错，强制移除所有 typing，绝不卡顿挂起！
            for (let i = chatItems.length - 1; i >= 0; i--) {
                if (chatItems[i].sender === 'typing') chatItems.splice(i, 1);
            }
            
            PhoneUI.renderAppContent('wechat');
            this._safeSaveData();
        }
    }
};

if (typeof window !== 'undefined') { window.ChatEngine = ChatEngine; }
