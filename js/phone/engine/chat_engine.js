import { Config } from '../phone_config.js';
import { PhoneAPI } from '../phone_api.js';
import { PhoneUI } from '../phone_ui.js';

export const ChatEngine = {
    currentMsgIndex: -1,

    getRealIndex(targetApp, index) {
        const roleId = Config?.currentContactId;
        const items = Config?.phoneData?.[roleId]?.[targetApp]?.items || [];
        if (items.length > 50 && index < 50) return items.length - 50 + index;
        return index;
    },

    cleanStuckTyping() {
        let changed = false;
        if (!Config?.phoneData) return;
        for (const roleId in Config.phoneData) {
            for (const app of ['wechat', 'novel']) {
                const target = Config.phoneData[roleId]?.[app];
                if (target && Array.isArray(target.items) && target.items.length > 0 && target.items[target.items.length - 1].sender === 'typing') {
                    target.items.pop();
                    changed = true;
                }
            }
        }

        if (changed) {
            localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
            if (PhoneUI) {
                PhoneUI.renderAppContent?.('wechat');
                PhoneUI.renderNovelContent?.();
            }
            PhoneAPI?.showToast?.('✅ 已强制清除卡死的 AI 状态！');
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
            PhoneAPI.showToast('🖼️ 图片处理中，处理完可继续发图或打字发送...');
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width; let height = img.height; const MAX_SIZE = 800;
                    if (width > height && width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
                    else if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
                    canvas.width = width; canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const base64Url = canvas.toDataURL('image/jpeg', 0.7);
                    const roleId = Config?.currentContactId;
                    if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
                    if (!Config.phoneData[roleId].wechat) Config.phoneData[roleId].wechat = { items: [] };
                    const now = new Date();
                    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                    Config.phoneData[roleId].wechat.items.push({ sender: 'me', content: `![图片](${base64Url})`, time: timeStr, date: dateStr });
                    localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
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
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const isText = file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.json') || file.name.endsWith('.csv');
            if (isText && file.size < 100 * 1024) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const content = event.target.result;
                    chatItems.push({ sender: 'me', content: `📁 [发送了文件: ${file.name}]\n\n文件内容如下：\n\n\`\`\`\n${content}\n\`\`\``, time: timeStr, date: dateStr });
                    localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
                    PhoneUI.renderAppContent('wechat');
                };
                reader.readAsText(file);
            } else {
                const sizeMB = (file.size / 1024 / 1024).toFixed(2);
                chatItems.push({ sender: 'me', content: `📁 [发送了文件: ${file.name}] (大小: ${sizeMB}MB)\n\n【系统提示】：用户向你发送了一份文件。由于跨次元限制，内容暂时不能直接展开。`, time: timeStr, date: dateStr });
                localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
                PhoneUI.renderAppContent('wechat');
            }
        };
        input.click();
    },

    sendSticker(name, url) {
        const panel = document.getElementById('sticker-panel');
        if (panel) panel.classList.remove('show');
        const roleId = Config?.currentContactId;
        const targetApp = (window.Config?.currentAppId === 'novel') ? 'novel' : 'wechat';
        if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
        if (!Config.phoneData[roleId][targetApp]) Config.phoneData[roleId][targetApp] = { items: [] };
        const content = `[发送了表情包：${name}]\n![${name}](${url})`;
        Config.phoneData[roleId][targetApp].items.push({ sender: 'me', content, time: Date.now(), date: new Date().toISOString().slice(0, 10) });
        localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
        if (targetApp === 'novel') PhoneUI.renderNovelContent?.();
        else PhoneUI.renderAppContent?.('wechat');
    },

    async favoriteMsg() {
        this.closeMsgMenu();
        if (this.currentMsgIndex < 0) return;
        const roleId = Config?.currentContactId;
        const targetApp = (window.Config?.currentAppId === 'novel') ? 'novel' : 'wechat';
        const msg = Config?.phoneData?.[roleId]?.[targetApp]?.items?.[this.getRealIndex(targetApp, this.currentMsgIndex)];
        if (!msg) return;
        const selectedText = await PhoneUI.showCustomPrompt('⭐ 请精简你要收藏的句子（太长会撑爆星星）：', msg.content);
        if (selectedText && selectedText.trim() !== '') {
            PhoneAPI.saveFavorite(selectedText.trim(), targetApp === 'wechat' ? '线上微信' : '线下故事', msg.sender);
        }
    },

    async aiSummarizeMsg() {
        this.closeMsgMenu();
        if (this.currentMsgIndex < 0) return;
        const roleId = Config?.currentContactId;
        const targetApp = (window.Config?.currentAppId === 'novel') ? 'novel' : 'wechat';
        const msg = Config?.phoneData?.[roleId]?.[targetApp]?.items?.[this.getRealIndex(targetApp, this.currentMsgIndex)];
        if (!msg) return;
        try {
            const reply = await PhoneAPI.chatWithAI([{ role: 'user', content: `请将下面这段角色扮演的回复提炼成一句简短唯美的语录，不超过20字：\n\n${msg.content}` }]);
            const finalQuote = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim().replace(/```.*?/g, '').replace(/```/g, '').trim();
            const confirmText = await PhoneUI.showCustomPrompt('✨ AI 提炼结果如下，确认无误后点击确定保存：', finalQuote);
            if (confirmText && confirmText.trim() !== '') {
                PhoneAPI.saveFavorite(confirmText.trim(), targetApp === 'wechat' ? '线上微信' : '线下故事', msg.sender);
            }
        } catch (e) { alert('提炼失败：' + e.message); }
    },

    async editMsg() {
        this.closeMsgMenu();
        if (this.currentMsgIndex < 0) return;
        const roleId = Config?.currentContactId;
        const targetApp = (window.Config?.currentAppId === 'novel') ? 'novel' : 'wechat';
        const item = Config?.phoneData?.[roleId]?.[targetApp]?.items?.[this.getRealIndex(targetApp, this.currentMsgIndex)];
        if (!item) return;
        const newText = await PhoneUI.showCustomPrompt('✏️ 编辑消息：', item.content);
        if (newText !== null && newText.trim() !== '') {
            item.content = newText.trim();
            if (targetApp === 'novel') PhoneUI.renderNovelContent?.();
            else PhoneUI.renderAppContent?.('wechat');
            localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
            PhoneAPI.showToast('✅ 修改成功');
        }
    },

    deleteMsg() {
        this.closeMsgMenu();
        if (this.currentMsgIndex < 0) return;
        const roleId = Config?.currentContactId;
        const targetApp = (window.Config?.currentAppId === 'novel') ? 'novel' : 'wechat';
        const realIndex = this.getRealIndex(targetApp, this.currentMsgIndex);
        if (Config?.phoneData?.[roleId]?.[targetApp]?.items) {
            Config.phoneData[roleId][targetApp].items.splice(realIndex, 1);
            if (targetApp === 'novel') PhoneUI.renderNovelContent?.();
            else PhoneUI.renderAppContent?.('wechat');
            localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
            PhoneAPI.showToast('🗑️ 消息已删除');
        }
    },

    regenMsg() {
        this.closeMsgMenu();
        if (this.currentMsgIndex < 0) return;
        const roleId = Config?.currentContactId;
        const targetApp = (window.Config?.currentAppId === 'novel') ? 'novel' : 'wechat';
        const realIndex = this.getRealIndex(targetApp, this.currentMsgIndex);
        if (Config?.phoneData?.[roleId]?.[targetApp]?.items) {
            Config.phoneData[roleId][targetApp].items.splice(realIndex);
            localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
            if (targetApp === 'novel') { PhoneUI.renderNovelContent?.(); this.sendNovelMessage(true); }
            else { PhoneUI.renderAppContent?.('wechat'); this.sendChatMessage(true); }
        }
    },

    sendUserMsgOnly() {
        const targetApp = (window.Config?.currentAppId === 'novel') ? 'novel' : 'wechat';
        const inputEl = targetApp === 'novel' ? document.getElementById('novel-input') : document.getElementById('chat-input');
        if (!inputEl) return;
        const text = inputEl.value.trim();
        if (!text) return;
        const roleId = Config?.currentContactId;
        if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
        if (!Config.phoneData[roleId][targetApp]) Config.phoneData[roleId][targetApp] = { items: [] };
        const chatItems = Config.phoneData[roleId][targetApp].items;
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        chatItems.push({ sender: 'me', content: text, time: timeStr, date: dateStr });
        inputEl.value = '';
        if (targetApp === 'novel') PhoneUI.renderNovelContent?.();
        else PhoneUI.renderAppContent?.('wechat');
        localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
    },

    async sendChatMessage(isRegen = false) {
        const roleId = Config?.currentContactId;
        if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
        if (!Config.phoneData[roleId].wechat) Config.phoneData[roleId].wechat = { items: [] };
        const chatItems = Config.phoneData[roleId].wechat.items;
        let hasNewUserMsg = false; 
        let latestUserText = '';
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
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
                    // 如果输入框是空的，说明用户已经通过回车把消息发到界面上了
                    // 我们去历史记录里找最后一句用户说的话作为触发词
                    for (let i = chatItems.length - 1; i >= 0; i--) {
                        if (chatItems[i].sender === 'me' && !chatItems[i].content.includes('![图片]')) {
                            latestUserText = chatItems[i].content;
                            hasNewUserMsg = true; 
                            break;
                        }
                    }
                }
            }
        } else {
            for (let i = chatItems.length - 1; i >= 0; i--) {
                if (chatItems[i].sender === 'me' && !chatItems[i].content.includes('![图片]')) {
                    latestUserText = chatItems[i].content;
                    break;
                }
            }
        }

        if (!isRegen && !hasNewUserMsg && chatItems.length === 0) return;

        chatItems.push({ sender: 'typing' });
        PhoneUI.renderAppContent('wechat');
        localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));

        try {
            const myName = localStorage.getItem('my_name') || '我';
            const shareMemory = localStorage.getItem('share_memory') === 'true';
            const systemPrompt = localStorage.getItem('system_prompt') || '';
            const charPersona = localStorage.getItem('char_persona') || '';
            
            // 恢复精准的时间感知
            const currentNow = new Date();
            const curHour = currentNow.getHours(); const curMin = currentNow.getMinutes();
            const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
            const curWeek = '星期' + weekDays[currentNow.getDay()];
            let timePhase = "深夜";
            if (curHour >= 5 && curHour < 9) timePhase = "清晨"; else if (curHour >= 9 && curHour < 12) timePhase = "上午"; else if (curHour >= 12 && curHour < 14) timePhase = "中午"; else if (curHour >= 14 && curHour < 18) timePhase = "下午"; else if (curHour >= 18 && curHour < 23) timePhase = "晚上";
            
            let stablePrompt = `【系统时间感知】：当前现实时间是 ${currentNow.getFullYear()}年${currentNow.getMonth()+1}月${currentNow.getDate()}日 ${curWeek}，${timePhase} ${curHour.toString().padStart(2, '0')}:${curMin.toString().padStart(2, '0')}。请自然地感知当前时间，如果用户问你时间，请准确回答。\n\n`;
            
            if (systemPrompt) stablePrompt += `【系统核心指令】：\n${systemPrompt}\n\n`;
            if (charPersona) stablePrompt += `【角色设定】：\n${charPersona}\n\n`;

            let formatRule = "【最高禁令】：绝对禁止输出任何分析过程、思考步骤、任务拆解！不要出现“好，这条消息的上下文是”等字眼！直接输出角色的台词！\n";
            formatRule += "【微信连发机制】：不限制气泡数量，请务必把你想说的话完整说完！系统会根据换行符切分微信气泡。绝对不要把所有话挤在同一行！\n";
            formatRule += "【读心术机制】：在正式回复之前，你必须使用 <inner> 和 </inner> 标签包裹一段角色此刻真实的内心独白。\n";
            stablePrompt += formatRule;

            const wbData = PhoneAPI.getWorldbookData();
            const activeOnlineWb = wbData.filter(w => w.online).map(w => w.content).join('\n');
            if (activeOnlineWb) stablePrompt += `\n【当前生效的世界书/规则插件】：\n${activeOnlineWb}\n`;
            
            let dynamicPrompt = '';
            // 调用合并后的 PhoneEngine 上的 _scanKeywords 方法
            if (latestUserText && window.PhoneEngine && window.PhoneEngine._scanKeywords) {
                dynamicPrompt += window.PhoneEngine._scanKeywords(latestUserText);
            }
            
            const allVault = PhoneAPI.getMemoryVault();
            let accessibleVault = allVault;
            if (!shareMemory) accessibleVault = allVault.filter(v => v.isCore || v.source === '线上微信');
            if (accessibleVault.length > 0) {
                const recentVault = accessibleVault.slice(-5).map(v => `[${v.id}] ${v.source}: ${v.content}`).join('\n');
                dynamicPrompt += `\n【长期记忆档案】：\n${recentVault}\n`;
            }

            let messages = [{ role: 'system', content: stablePrompt + (dynamicPrompt || '') }];
            const MAX_CONTEXT = 60;
            const recentItems = chatItems.slice(-MAX_CONTEXT);
            
            recentItems.forEach((item) => {
                if (item.sender !== 'typing') {
                    let text = item.content;
                    const imgMatch = text ? text.match(/^!\[.*?\]\((.*?)\)$/) : null;
                    if (item.sender === 'me' && imgMatch) {
                        messages.push({ role: 'user', content: [ { type: "image_url", image_url: { url: imgMatch[1] } } ] });
                    } else {
                        messages.push({ role: item.sender === 'me' ? 'user' : 'assistant', content: text || "" });
                    }
                }
            });

            if (!isRegen && !hasNewUserMsg) {
                messages.push({ role: "user", content: "【系统指令】：我没有说话。请你顺着刚才的话题继续连发微信补充，或者开启一个新话题。" });
            }
            
            const rawReply = await PhoneAPI.chatWithAI(messages);
            
            const innerMatch = rawReply.match(/<inner>([\s\S]*?)<\/inner>/i);
            const innerThought = innerMatch ? innerMatch[1].trim() : '（TA的心思藏得很深，什么也没看出来...）';
            let finalReply = rawReply.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<inner>[\s\S]*?<\/inner>/gi, '').trim();
            if (!finalReply) finalReply = rawReply.trim();
            
            chatItems.pop();
            const replyParts = finalReply.split('\n').map(s => s.trim()).filter(Boolean);
            replyParts.forEach((part, idx) => {
                const thought = idx === 0 ? innerThought : '（连发消息，心声已在上一条显示）';
                chatItems.push({ sender: 'other', content: part, time: timeStr, date: dateStr, innerThought: thought });
            });
            
            PhoneUI.renderAppContent('wechat');
            localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
        } catch (error) {
            PhoneAPI.showToast(error.message);
            chatItems.pop();
            PhoneUI.renderAppContent('wechat');
            localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
        }
    },

    async sendNovelMessage(isRegen = false) {
        const roleId = Config?.currentContactId;
        if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
        if (!Config.phoneData[roleId].novel) Config.phoneData[roleId].novel = { items: [] };
        const chatItems = Config.phoneData[roleId].novel.items;
        let latestUserText = '';
        if (!isRegen) {
            const inputEl = document.getElementById('novel-input');
            if (inputEl) {
                const text = inputEl.value.trim();
                if (text) {
                    chatItems.push({ sender: 'me', content: text, time: new Date().toLocaleTimeString(), date: new Date().toISOString().slice(0, 10) });
                    inputEl.value = '';
                    latestUserText = text;
                } else {
                    for (let i = chatItems.length - 1; i >= 0; i--) {
                        if (chatItems[i].sender === 'me') {
                            latestUserText = chatItems[i].content;
                            break;
                        }
                    }
                }
            }
        }
        chatItems.push({ sender: 'typing', content: '...', time: new Date().toLocaleTimeString() });
        PhoneUI.renderNovelContent();
        try {
            const systemPrompt = localStorage.getItem('system_prompt') || '';
            const charPersona = localStorage.getItem('char_persona') || '';
            
            const currentNow = new Date();
            const curHour = currentNow.getHours(); const curMin = currentNow.getMinutes();
            const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
            const curWeek = '星期' + weekDays[currentNow.getDay()];
            let timePhase = "深夜";
            if (curHour >= 5 && curHour < 9) timePhase = "清晨"; else if (curHour >= 9 && curHour < 12) timePhase = "上午"; else if (curHour >= 12 && curHour < 14) timePhase = "中午"; else if (curHour >= 14 && curHour < 18) timePhase = "下午"; else if (curHour >= 18 && curHour < 23) timePhase = "晚上";
            
            let stablePrompt = `【系统时间感知】：当前现实时间是 ${currentNow.getFullYear()}年${currentNow.getMonth()+1}月${currentNow.getDate()}日 ${curWeek}，${timePhase} ${curHour.toString().padStart(2, '0')}:${curMin.toString().padStart(2, '0')}。\n\n`;
            stablePrompt += `${systemPrompt}\n${charPersona}\n`;
            stablePrompt += "【读心术机制】：在正式回复之前，你必须使用 <inner> 和 </inner> 标签包裹一段角色此刻真实的内心独白。\n";
            stablePrompt += "【最高禁令】：绝对禁止输出任何分析过程、思考步骤！直接输出剧情！\n";

            let messages = [{ role: 'system', content: stablePrompt }];
            const MAX_CONTEXT = 60;
            const recentItems = chatItems.slice(-MAX_CONTEXT);
            recentItems.forEach(item => {
                if (item.sender !== 'typing') { 
                    messages.push({ role: item.sender === 'me' ? 'user' : 'assistant', content: item.content || "" }); 
                }
            });

            if (!isRegen && !latestUserText) {
                messages.push({ role: "user", content: "【系统强制指令】：我（用户）当前没有任何动作或对话。请你顺着刚才的剧情继续往下描写。" });
            }

            const rawReply = await PhoneAPI.chatWithAI(messages);
            
            const innerMatch = rawReply.match(/<inner>([\s\S]*?)<\/inner>/i);
            const innerThought = innerMatch ? innerMatch[1].trim() : '（TA的心思藏得很深，什么也没看出来...）';
            const finalReply = rawReply.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<inner>[\s\S]*?<\/inner>/gi, '').trim();
            
            chatItems.pop();
            chatItems.push({ sender: 'other', content: finalReply, time: new Date().toLocaleTimeString(), date: new Date().toISOString().slice(0, 10), innerThought });
            PhoneUI.renderNovelContent();
            localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
        } catch (error) {
            PhoneAPI.showToast(error.message);
            chatItems.pop();
            PhoneUI.renderNovelContent();
            localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
        }
    }
};
