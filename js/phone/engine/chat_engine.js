import { Config } from '../phone_config.js';
import { PhoneAPI } from '../phone_api.js';
import { PhoneUI } from '../phone_ui.js';

export const ChatEngine = {
    currentMsgIndex: -1,

    // 安全持久化辅助函数，防止 QuotaExceeded 异常导致整段 JS 猝死
    _safeSaveData() {
        try {
            if (Config?.phoneData) {
                localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
            }
        } catch (e) {
            console.warn('⚠️ 存储空间接近配额或超出，跳过本次持久化写入：', e);
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
            if (target && Array.isArray(target.items) && target.items.length > 0 && target.items[target.items.length - 1].sender === 'typing') {
                target.items.pop();
                changed = true;
            }
        }

        if (changed) {
            this._safeSaveData();
            if (PhoneUI) PhoneUI.renderAppContent?.('wechat');
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
            PhoneAPI.showToast('🖼️ 图片处理与压缩中...');
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width; 
                    let height = img.height; 
                    
                    // 🌟 核心优化：最大边缩到 500px，既清晰又防爆存储（体积下降90%）
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
                    
                    // 优先 WebP，不支持则自动使用 JPEG
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
        const selectedText = await PhoneUI.showCustomPrompt('⭐ 请精简你要收藏的句子（太长会撑爆星星）：', msg.content);
        if (selectedText && selectedText.trim() !== '') {
            PhoneAPI.saveFavorite(selectedText.trim(), '线上微信', msg.sender);
        }
    },

    async aiSummarizeMsg() {
        this.closeMsgMenu();
        if (this.currentMsgIndex < 0) return;
        const roleId = Config?.currentContactId;
        const msg = Config?.phoneData?.[roleId]?.wechat?.items?.[this.getRealIndex(this.currentMsgIndex)];
        if (!msg) return;
        try {
            const reply = await PhoneAPI.chatWithAI([{ role: 'user', content: `请将下面这段角色扮演的回复提炼成一句简短唯美的语录，不超过20字：\n\n${msg.content}` }]);
            const finalQuote = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim().replace(/```.*?/g, '').replace(/```/g, '').trim();
            const confirmText = await PhoneUI.showCustomPrompt('✨ AI 提炼结果如下，确认无误后点击确定保存：', finalQuote);
            if (confirmText && confirmText.trim() !== '') {
                PhoneAPI.saveFavorite(confirmText.trim(), '线上微信', msg.sender);
            }
        } catch (e) { alert('提炼失败：' + e.message); }
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
        this._safeSaveData(); // 安全写入，即便超限也不阻断后续请求

        try {
            const shareMemory = localStorage.getItem('share_memory') === 'true';
            const systemPrompt = localStorage.getItem('system_prompt') || '';
            const charPersona = localStorage.getItem('char_persona') || '';
            
            const currentNow = new Date();
            const curYear = currentNow.getFullYear();
            const curMonth = currentNow.getMonth() + 1;
            const curDate = currentNow.getDate();
            const curHour = currentNow.getHours(); 
            const curMin = currentNow.getMinutes();
            const daysArr = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
            const curWeek = daysArr[currentNow.getDay()];
            const timeStrStandard = `${String(curHour).padStart(2, '0')}:${String(curMin).padStart(2, '0')}`;

            let timePhase = "深夜";
            if (curHour >= 5 && curHour < 9) timePhase = "清晨"; 
            else if (curHour >= 9 && curHour < 12) timePhase = "上午"; 
            else if (curHour >= 12 && curHour < 14) timePhase = "中午"; 
            else if (curHour >= 14 && curHour < 18) timePhase = "下午"; 
            else if (curHour >= 18 && curHour < 23) timePhase = "晚上";
            
            let stablePrompt = `【⚠️当前现实唯一准确时间锚点】：
此时此刻是 ${curYear}年${curMonth}月${curDate}日 ${curWeek}，${timePhase} ${timeStrStandard}。\n\n`;
            
            if (systemPrompt) stablePrompt += `【系统核心指令】：\n${systemPrompt}\n\n`;
            if (charPersona) stablePrompt += `【角色设定】：\n${charPersona}\n\n`;

            let formatRule = "【最高禁令】：绝对禁止输出任何分析过程、思考步骤！直接输出角色的台词！\n";
            formatRule += "【微信连发机制】：不限制气泡数量，请务必把你想说的话完整说完！根据换行符切分微信气泡。\n";
            formatRule += "【读心术机制】：在正式回复之前，你必须使用 <inner> 和 </inner> 标签包裹一段角色此刻真实的内心独白。\n";
            
            // 🌟 强行教会 AI 画图协议指令
            formatRule += "【发图/画画规则】：当用户要求你画画、或者你想发送照片/图片时，你必须单独输出一行指令：`[DRAW: 详细的英文画面描述]`。严禁只用嘴说，必须带上 [DRAW: ...] 标记！\n";
            stablePrompt += formatRule;
            
            let dynamicPrompt = '';
            if (latestUserText && window.PhoneEngine && window.PhoneEngine._scanKeywords) {
                dynamicPrompt += window.PhoneEngine._scanKeywords(latestUserText);
            }
            
            // 课表
            const scheduleRaw = localStorage.getItem('class_schedule');
            if (scheduleRaw) {
                try {
                    const schedule = JSON.parse(scheduleRaw);
                    const currentDay = currentNow.getDay() === 0 ? 7 : currentNow.getDay();
                    const daysName = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
                    let scheduleText = `\n[TA的整周完整课表安排]:\n`;
                    for (let d = 1; d <= 7; d++) {
                        const isToday = (d === currentDay);
                        const dayClasses = schedule[d] || [];
                        dayClasses.sort((a, b) => a.start.localeCompare(b.start));
                        scheduleText += `📅 ${daysName[d - 1]}${isToday ? '（今天）' : ''}：\n`;
                        if (dayClasses.length === 0) scheduleText += `  （无课程安排）\n`;
                        else dayClasses.forEach(c => scheduleText += `  - ${c.start}~${c.end} : ${c.name}\n`);
                    }
                    dynamicPrompt += scheduleText + `\n`;
                } catch(e) {}
            }

            // 🌟 核心防报错保护：长期记忆
            const vaultLimit = parseInt(localStorage.getItem('context_vault_limit') || '15', 10);
            const allVault = (PhoneAPI && PhoneAPI.getMemoryVault) ? (PhoneAPI.getMemoryVault() || []) : [];
            let accessibleVault = Array.isArray(allVault) ? allVault : [];
            if (!shareMemory && Array.isArray(accessibleVault)) {
                accessibleVault = accessibleVault.filter(v => v && (v.isCore || v.source === '线上微信'));
            }
            if (accessibleVault.length > 0) {
                const recentVault = accessibleVault.slice(-vaultLimit).map(v => `[${v.id}] ${v.source}: ${v.content}`).join('\n');
                dynamicPrompt += `\n【长期记忆档案】：\n${recentVault}\n`;
            }

            let messages = [{ role: 'system', content: stablePrompt + (dynamicPrompt || '') }];
            const MAX_CONTEXT = parseInt(localStorage.getItem('context_chat_limit') || '60', 10);
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

            if (!isRegen && !hasNewUserMsg) {
                messages.push({ role: "user", content: "【系统指令】：我没有说话。请你顺着刚才的话题继续连发微信补充，或者开启一个新话题。" });
            }
            
            const rawReply = await PhoneAPI.chatWithAI(messages);
            
            const innerMatch = rawReply.match(/<inner>([\s\S]*?)<\/inner>/i);
            const innerThought = innerMatch ? innerMatch[1].trim() : '（TA的心思藏得很深，什么也没看出来...）';
            let finalReply = rawReply.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<inner>[\s\S]*?<\/inner>/gi, '').trim();
            if (!finalReply) finalReply = rawReply.trim();
            
            chatItems.pop(); // 移除 typing

            const replyParts = finalReply.split('\n').map(s => s.trim()).filter(Boolean);
            let hasDrawnImage = false;

            for (let idx = 0; idx < replyParts.length; idx++) {
                let part = replyParts[idx];
                const thought = idx === 0 ? innerThought : '（连发消息，心声已在上一条显示）';

                // 🌟 1. 显式画图指令嗅探
                const drawMatch = part.match(/\[DRAW:\s*(.*?)\]/i) || part.match(/https?:\/\/image\.pollinations\.ai\/prompt\/([^?\s)]+)/i);

                if (drawMatch) {
                    let promptDesc = drawMatch[1];
                    try { promptDesc = decodeURIComponent(promptDesc); } catch(e){}
                    hasDrawnImage = true;

                    let realImgUrl = null;
                    if (window.PhoneEngine && window.PhoneEngine.generateImage) {
                        realImgUrl = await window.PhoneEngine.generateImage(promptDesc);
                    }
                    if (!realImgUrl) realImgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptDesc)}?width=512&height=512&nologo=true`;

                    part = part.replace(/\[DRAW:\s*.*?\]/gi, `![图片](${realImgUrl})`)
                               .replace(/!\[.*?\]\(https?:\/\/image\.pollinations\.ai\/[^\s)]+\)/gi, `![图片](${realImgUrl})`);
                }

                chatItems.push({ sender: 'other', content: part, time: timeStr, date: dateStr, innerThought: thought });
            }

            // 🌟 2.【兜底生图】
            const userWantsDrawing = /画|照片|自拍|图/i.test(latestUserText);
            const aiAgreed = /行|好|来一|画|看|给你/i.test(finalReply);

            if (!hasDrawnImage && userWantsDrawing && aiAgreed) {
                if (window.PhoneAPI) window.PhoneAPI.showToast("🎨 检测到画图意图，正在调起自建绘画引擎...");
                
                let fallbackPrompt = "a single yellow banana on clean surface, warm lighting, high quality";
                if (/香蕉/.test(latestUserText)) fallbackPrompt = "a fresh ripe single banana, studio lighting, highly detailed photo";
                else if (/自拍|照片/.test(latestUserText)) fallbackPrompt = "a candid casual selfie of an attractive young man, cozy room light";
                else fallbackPrompt = `${latestUserText}, artistic illustration, high resolution`;

                let generatedUrl = null;
                if (window.PhoneEngine && window.PhoneEngine.generateImage) {
                    generatedUrl = await window.PhoneEngine.generateImage(fallbackPrompt);
                }

                if (generatedUrl) {
                    chatItems.push({
                        sender: 'other',
                        content: `![图片](${generatedUrl})`,
                        time: timeStr,
                        date: dateStr,
                        innerThought: '（笨蛋，给你画好了，看看满不满意）'
                    });
                }
            }
            
            PhoneUI.renderAppContent('wechat');
            this._safeSaveData();

            if (window.MemoryEngine && window.MemoryEngine.autoManageMemory) {
                setTimeout(() => { window.MemoryEngine.autoManageMemory(false); }, 1000);
            }

        } catch (error) {
            console.error('发送或调用模型异常:', error);
            PhoneAPI.showToast(error.message || '请求遇到异常，请检查网络');
            if (chatItems.length > 0 && chatItems[chatItems.length - 1].sender === 'typing') {
                chatItems.pop();
            }
            PhoneUI.renderAppContent('wechat');
            this._safeSaveData();
        }
    }
};
