import { Config } from '../phone_config.js';
import { PhoneAPI } from '../phone_api.js';
import { PhoneUI } from '../phone_ui.js';

export const ChatEngine = {
    currentMsgIndex: -1,

    // 🌟 核心安全持久化：保全所有记录，一条都不删！
    async _safeSaveData() {
        if (!Config?.phoneData) return;
        try {
            localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
        } catch (e) {
            // 空间超出 5MB 时，自动无损转存到无上限的 IndexedDB 数据库！一条不丢！
            if (window.PhoneAPI?.LocalDB) {
                try {
                    await window.PhoneAPI.LocalDB.set('full_phone_data', JSON.stringify(Config.phoneData));
                    localStorage.setItem('use_idb_chat_data', 'true');
                } catch(idbErr) {}
            }
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
                const initLen = target.items.length;
                target.items = target.items.filter(i => i.sender !== 'typing');
                if (target.items.length !== initLen) changed = true;
            }
        }

        if (changed) {
            this._safeSaveData();
            if (PhoneUI) PhoneUI.renderAppContent?.('wechat');
            PhoneAPI?.showToast?.('✅ 已清除卡死的输入状态！');
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

    sendImageMsg() {
        this.closeMsgMenu();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            PhoneAPI.showToast('🖼️ 图片处理与压缩中...');
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width; 
                    let height = img.height; 
                    const MAX_SIZE = 500;
                    if (width > height && width > MAX_SIZE) { 
                        height = Math.round(height * (MAX_SIZE / width)); 
                        width = MAX_SIZE; 
                    } else if (height > MAX_SIZE) { 
                        width = Math.round(width * (MAX_SIZE / height)); 
                        height = MAX_SIZE; 
                    }
                    canvas.width = width; 
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    let base64Url = canvas.toDataURL('image/webp', 0.6);
                    if (!base64Url.startsWith('data:image/webp')) {
                        base64Url = canvas.toDataURL('image/jpeg', 0.6);
                    }

                    const roleId = Config?.currentContactId;
                    if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
                    if (!Config.phoneData[roleId].wechat) Config.phoneData[roleId].wechat = { items: [] };
                    const now = new Date();
                    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                    
                    Config.phoneData[roleId].wechat.items.push({ sender: 'me', content: `![图片](${base64Url})`, time: timeStr, date: dateStr });
                    this._safeSaveData();
                    PhoneUI.renderAppContent('wechat');
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        };
        input.click();
    },

    sendFileMsg() {
        this.closeMsgMenu();
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (file.type.startsWith('image/')) { PhoneAPI.showToast('图片请使用【发图片】功能哦！'); return; }
            PhoneAPI.showToast(`📁 正在发送文件: ${file.name}...`);
            const roleId = Config?.currentContactId;
            if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
            if (!Config.phoneData[roleId].wechat) Config.phoneData[roleId].wechat = { items: [] };
            const chatItems = Config.phoneData[roleId].wechat.items;
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const isText = file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.json') || file.name.endsWith('.csv');
            if (isText && file.size < 100 * 1024) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const content = event.target.result;
                    chatItems.push({ sender: 'me', content: `📁 [发送了文件: ${file.name}]\n\n文件内容如下：\n\n\`\`\`\n${content}\n\`\`\``, time: timeStr, date: dateStr });
                    this._safeSaveData();
                    PhoneUI.renderAppContent('wechat');
                };
                reader.readAsText(file);
            } else {
                const sizeMB = (file.size / 1024 / 1024).toFixed(2);
                chatItems.push({ sender: 'me', content: `📁 [发送了文件: ${file.name}] (大小: ${sizeMB}MB)\n\n【系统提示】：用户向你发送了一份文件。由于跨次元限制，内容暂时不能直接展开。`, time: timeStr, date: dateStr });
                this._safeSaveData();
                PhoneUI.renderAppContent('wechat');
            }
        };
        input.click();
    },

    sendSticker(name, url) {
        const panel = document.getElementById('sticker-panel');
        if (panel) panel.classList.remove('show');
        const roleId = Config?.currentContactId;
        if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
        if (!Config.phoneData[roleId].wechat) Config.phoneData[roleId].wechat = { items: [] };
        const content = `[发送了表情包：${name}]\n![${name}](${url})`;
        
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        
        Config.phoneData[roleId].wechat.items.push({ sender: 'me', content, time: timeStr, date: dateStr });
        this._safeSaveData();
        PhoneUI.renderAppContent?.('wechat');
    },

    async favoriteMsg() {
        this.closeMsgMenu();
        if (this.currentMsgIndex < 0) return;
        const roleId = Config?.currentContactId;
        const msg = Config?.phoneData?.[roleId]?.wechat?.items?.[this.getRealIndex(this.currentMsgIndex)];
        if (!msg) return;
        const selectedText = await PhoneUI.showCustomPrompt('⭐ 请精简你要收藏的句子：', msg.content);
        if (selectedText && selectedText.trim() !== '') {
            PhoneAPI.saveFavorite(selectedText.trim(), '线上微信', msg.sender);
        }
    },

    async editMsg() {
        this.closeMsgMenu();
        if (this.currentMsgIndex < 0) return;
        const roleId = Config?.currentContactId;
        const item = Config?.phoneData?.[roleId]?.wechat?.items?.[this.getRealIndex(this.currentMsgIndex)];
        if (!item) return;
        const newText = await PhoneUI.showCustomPrompt('✏️ 编辑消息：', item.content);
        if (newText !== null && newText.trim() !== '') {
            item.content = newText.trim();
            PhoneUI.renderAppContent?.('wechat');
            this._safeSaveData();
            PhoneAPI.showToast('✅ 修改成功');
        }
    },

    deleteMsg() {
        this.closeMsgMenu();
        if (this.currentMsgIndex < 0) return;
        const roleId = Config?.currentContactId;
        const realIndex = this.getRealIndex(this.currentMsgIndex);
        if (Config?.phoneData?.[roleId]?.wechat?.items) {
            Config.phoneData[roleId].wechat.items.splice(realIndex, 1);
            PhoneUI.renderAppContent?.('wechat');
            this._safeSaveData();
            PhoneAPI.showToast('🗑️ 消息已删除');
        }
    },

    regenMsg() {
        this.closeMsgMenu();
        if (this.currentMsgIndex < 0) return;
        const roleId = Config?.currentContactId;
        const realIndex = this.getRealIndex(this.currentMsgIndex);
        if (Config?.phoneData?.[roleId]?.wechat?.items) {
            Config.phoneData[roleId].wechat.items.splice(realIndex);
            this._safeSaveData();
            PhoneUI.renderAppContent?.('wechat'); 
            this.sendChatMessage(true);
        }
    },

    // 🌟 用户按回车时调用的函数：纯上屏消息，绝不调用模型！
    sendUserMsgOnly() {
        const inputEl = document.getElementById('chat-input');
        if (!inputEl) return;
        const text = inputEl.value.trim();
        if (!text) return;

        const roleId = Config?.currentContactId;
        if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
        if (!Config.phoneData[roleId].wechat) Config.phoneData[roleId].wechat = { items: [] };
        const chatItems = Config.phoneData[roleId].wechat.items;
        
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        
        chatItems.push({ sender: 'me', content: text, time: timeStr, date: dateStr });
        inputEl.value = '';
        PhoneUI.renderAppContent?.('wechat');
        this._safeSaveData();
    },

    // 🌟 点击右侧粉色发送按钮时调用：把输入框剩余的话和上面连发的所有话打包，召唤 AI 回复！
    async sendChatMessage(isRegen = false) {
        const roleId = Config?.currentContactId;
        if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
        if (!Config.phoneData[roleId].wechat) Config.phoneData[roleId].wechat = { items: [] };
        const chatItems = Config.phoneData[roleId].wechat.items;
        
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
                }
            }
        }

        // 如果用户根本没说过任何话，直接返回
        if (!isRegen && chatItems.length === 0) return;

        // 清理旧 typing
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

            stablePrompt += "【最高禁令】：直接输出角色的台词！\n【微信连发机制】：不限制气泡数量，根据换行符切分气泡。\n【读心术机制】：在正式回复之前，必须使用 <inner> 和 </inner> 标签包裹一段内心独白。\n";

            let messages = [{ role: 'system', content: stablePrompt }];
            const MAX_CONTEXT = parseInt(localStorage.getItem('context_chat_limit') || '50', 10);
            const recentItems = chatItems.slice(-MAX_CONTEXT);
            
            recentItems.forEach((item) => {
                if (item && item.sender !== 'typing') {
                    let text = item.content;
                    const imgMatch = text ? text.match(/^!\[.*?\]\((.*?)\)$/) : null;
                    if (item.sender === 'me' && imgMatch) {
                        messages.push({ role: 'user', content: [ { type: "image_url", image_url: { url: imgMatch[1] } } ] });
                    } else {
                        messages.push({ role: item.sender === 'me' ? 'user' : 'assistant', content: text || "" });
                    }
                }
            });

            const rawReply = await PhoneAPI.chatWithAI(messages);
            
            const innerMatch = rawReply.match(/<inner>([\s\S]*?)<\/inner>/i);
            const innerThought = innerMatch ? innerMatch[1].trim() : '（TA的心思藏得很深...）';
            let finalReply = rawReply.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<inner>[\s\S]*?<\/inner>/gi, '').trim();
            if (!finalReply) finalReply = rawReply.trim();
            
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
            PhoneAPI?.showToast?.(error.message || '请求遇到异常');
            for (let i = chatItems.length - 1; i >= 0; i--) {
                if (chatItems[i].sender === 'typing') chatItems.splice(i, 1);
            }
            PhoneUI.renderAppContent('wechat');
            this._safeSaveData();
        }
    }
};

// 挂载全局别名，保证无论怎么调都能找到
if (typeof window !== 'undefined') { 
    window.ChatEngine = ChatEngine; 
    window.PhoneEngine = ChatEngine;
}
