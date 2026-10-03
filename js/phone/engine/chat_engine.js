import { Config } from '../phone_config.js';
import { PhoneAPI } from '../phone_api.js';
import { PhoneUI } from '../phone_ui.js';

export const ChatEngine = {
    currentMsgIndex: -1,

    // 🌟 聊天记录以 IndexedDB 为主，不再把完整 phoneData 塞进 localStorage。
    async _safeSaveData() {
        if (!Config?.phoneData) return false;
        const payload = JSON.stringify(Config.phoneData);

        try {
            if (window.PhoneAPI?.LocalDB) {
                await window.PhoneAPI.LocalDB.set('full_phone_data', payload);
                try { localStorage.removeItem('phone_data'); } catch {}
                return true;
            }
        } catch (idbErr) {
            console.error('IndexedDB 保存聊天记录失败：', idbErr);
        }

        // IndexedDB 不可用时才回退到旧 localStorage。
        try {
            localStorage.setItem('phone_data', payload);
            return true;
        } catch (localErr) {
            console.error('聊天记录保存失败：', localErr);
            return false;
        }
    },

    getRealIndex(index) {
        const roleId = Config?.currentContactId;
        const items = Config?.phoneData?.[roleId]?.wechat?.items || [];
        const start = Number(window.ChatUI?._chatRenderStartIndex);
        if (Number.isInteger(start) && start >= 0 && start <= items.length) {
            return Math.min(items.length - 1, start + Number(index));
        }
        return Number(index);
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

    // 🌟 召唤 AI 回复（核心交互引擎）
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

            stablePrompt += "【对话规则】：直接输出角色回答。如果包含数学公式、推导过程或代码，请完整写出，切勿为了微信气泡而强行拆分公式与证明过程。\n";

            stablePrompt += `【读心术机制（心声法则）】：
在每次正式回复前，你可以使用 <inner> 和 </inner> 标签包裹一段角色此刻【第一人称（“我”）的私密内心感受】（如感到有趣、心疼、思考解法等）。之后直接输出你的正式回复内容。\n\n`;

            let messages = [{ role: 'system', content: stablePrompt }];

            // 🌟 核心改进：支持可控的大容量上下文（默认 200 条，设为 0 代表无限上下文）
            let contextLimit = parseInt(localStorage.getItem('context_chat_limit') || '200', 10);
            if (contextLimit <= 0) contextLimit = 999999;
            const recentItems = chatItems.slice(-contextLimit);
            
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
            const innerThought = innerMatch ? innerMatch[1].trim() : '';
            let finalReply = rawReply.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<inner>[\s\S]*?<\/inner>/gi, '').trim();
            if (!finalReply) finalReply = rawReply.trim();
            
            for (let i = chatItems.length - 1; i >= 0; i--) {
                if (chatItems[i].sender === 'typing') chatItems.splice(i, 1);
            }

            // 🌟 数学题/长文本优化切分：若包含代码块或公式，保持整体结构不被割碎
            let replyParts = [];
            if (finalReply.includes('```') || finalReply.includes('$$') || finalReply.length > 300) {
                // 长篇推导/代码块作为一个完整气泡呈现
                replyParts = [finalReply];
            } else {
                replyParts = finalReply.split('\n').map(s => s.trim()).filter(Boolean);
                if (replyParts.length === 0) replyParts = [finalReply];
            }

            for (let idx = 0; idx < replyParts.length; idx++) {
                chatItems.push({ 
                    sender: 'other', 
                    content: replyParts[idx], 
                    time: timeStr, 
                    date: dateStr, 
                    innerThought: idx === 0 ? (innerThought || '（TA正在认真推导分析...）') : '（连发消息）' 
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
    },

    // 🌟 提取记忆（星海归档）
    async extractMemory(appId = 'wechat') {
        const roleId = Config?.currentContactId;
        const allItems = Config?.phoneData?.[roleId]?.[appId]?.items || [];
        const cleanItems = allItems.filter(i => i.sender !== 'typing' && i.content);
        
        let lastIdx = parseInt(localStorage.getItem('memory_last_summary_index') || '0', 10);
        if (lastIdx > cleanItems.length) lastIdx = 0;

        const newItems = cleanItems.slice(lastIdx);
        if (newItems.length === 0) {
            PhoneAPI?.showToast?.('🌿 暂无需要提取的新对话记忆哦');
            return;
        }

        PhoneAPI?.showToast?.(`✨ 正在提炼最近 ${newItems.length} 条对话记忆...`);

        try {
            const conversationText = newItems.map(item => {
                const who = item.sender === 'me' ? '我' : 'TA';
                return `${who}: ${item.content}`;
            }).join('\n');

            const summaryPrompt = [
                {
                    role: 'system',
                    content: '你是一个敏锐细腻的记忆整理官。请阅读以下这段对话，提炼出 1~3 条值得被铭记的核心记忆、重要约定、感情升温细节或关键事实。每条用一两句话概括，温暖真实，条理清晰。'
                },
                {
                    role: 'user',
                    content: `【近期对话记录】：\n${conversationText}\n\n请输出记忆摘要：`
                }
            ];

            const summary = await PhoneAPI.chatWithAI(summaryPrompt);
            if (!summary) throw new Error('提炼记忆返回为空');

            // 存入 memory_vault / 星海
            if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
            if (!Config.phoneData[roleId].memory_vault) Config.phoneData[roleId].memory_vault = { items: [] };

            const now = new Date();
            const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

            Config.phoneData[roleId].memory_vault.items.unshift({
                id: 'mem_' + Date.now(),
                type: 'daily',
                date: dateStr,
                content: summary.trim(),
                source: '微信提炼'
            });

            // 更新指针
            localStorage.setItem('memory_last_summary_index', cleanItems.length.toString());
            await this._safeSaveData();

            PhoneAPI?.showToast?.('💎 记忆提炼成功，已收录进星海！');
            if (PhoneUI?.updateHomeWidget) PhoneUI.updateHomeWidget();
            if (Config.currentAppId === 'settings' && PhoneUI?.renderSettings) {
                PhoneUI.renderSettings();
                PhoneUI.switchSetTab('ai');
            }
        } catch (e) {
            console.error('提取记忆失败:', e);
            PhoneAPI?.showToast?.('⚠️ 提取记忆遇到异常: ' + (e.message || ''));
        }
    },

    // 🌟 设置页“立即提取”记忆方法别名
    async manualManageMemory() {
        return this.extractMemory('wechat');
    },

    // 🌟 记忆洗地：清理已归档的早期聊天气泡，保持系统轻盈飞速
    async washMemory(appId = 'wechat') {
        const roleId = Config?.currentContactId;
        const target = Config?.phoneData?.[roleId]?.[appId];
        if (!target || !Array.isArray(target.items)) {
            PhoneAPI?.showToast?.('当前暂无需要洗地的消息');
            return;
        }

        const keepCount = 120; // 始终保留最近 120 条
        const lastIdx = parseInt(localStorage.getItem('memory_last_summary_index') || '0', 10);
        
        if (target.items.length <= keepCount) {
            PhoneAPI?.showToast?.(`🌱 消息总共才 ${target.items.length} 条，无需洗地哦`);
            return;
        }

        const deletableCount = Math.max(0, target.items.length - keepCount);
        const confirmed = confirm(`🧹 记忆洗地安全提示：\n\n已归档到星海的早期消息共有 ${deletableCount} 条可以安全清理（将保留最近 ${keepCount} 条完整上下文）。\n\n是否确认清理？`);
        if (!confirmed) return;

        target.items.splice(0, deletableCount);
        // 重置/对齐总结指针
        localStorage.setItem('memory_last_summary_index', Math.max(0, lastIdx - deletableCount).toString());
        await this._safeSaveData();

        PhoneUI.renderAppContent?.('wechat');
        PhoneAPI?.showToast?.(`✨ 洗地完成！已释放 ${deletableCount} 条历史消息占用的内存`);
        
        if (Config.currentAppId === 'settings' && PhoneUI?.renderSettings) {
            PhoneUI.renderSettings();
            PhoneUI.switchSetTab('ai');
        }
    }
};

if (typeof window !== 'undefined') { 
    window.ChatEngine = ChatEngine; 
    // 安全合并，绝不覆盖已有模块方法
    window.PhoneEngine = Object.assign(window.PhoneEngine || {}, ChatEngine);
}
