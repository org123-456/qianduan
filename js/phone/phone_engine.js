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

    // 🌟 核心救场：全部换成自定义弹窗，不再触发手机系统的 Bug！
    async favoriteMsg() {
        this.closeMsgMenu();
        if (this.currentMsgIndex < 0) return;
        const roleId = Config.currentContactId;
        const targetApp = Config.currentAppId === 'novel' ? 'novel' : 'wechat';
        const msg = Config.phoneData[roleId][targetApp].items[this.currentMsgIndex];
        
        const selectedText = await PhoneUI.showCustomPrompt("⭐ 请精简你要收藏的句子（太长会撑爆星星）：", msg.content);
        if (selectedText && selectedText.trim() !== "") {
            PhoneAPI.saveFavorite(selectedText.trim(), targetApp === 'wechat' ? '线上微信' : '线下故事', msg.sender);
        }
    },

    async aiSummarizeMsg() {
        this.closeMsgMenu();
        if (this.currentMsgIndex < 0) return;
        const roleId = Config.currentContactId;
        const targetApp = Config.currentAppId === 'novel' ? 'novel' : 'wechat';
        const msg = Config.phoneData[roleId][targetApp].items[this.currentMsgIndex];
        
        PhoneAPI.showToast("✨ AI 正在提炼金句，请稍候...");
        try {
            const aiPrompt = `请将下面这段角色扮演的回复，提炼成一句【简短、唯美、或傲娇的语录/内心独白】（要求在20字以内）。\n【绝对要求】：去除所有动作描写、环境描写和敏感(NSFW)内容，只保留最核心的情感或金句。直接输出这唯一的一句话，不要任何多余解释！\n\n原文：\n${msg.content}`;
            
            const messages = [{ role: "user", content: aiPrompt }];
            const reply = await PhoneAPI.chatWithAI(messages, true); 
            
            let finalQuote = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
            finalQuote = finalQuote.replace(/```.*?/g, '').replace(/```/g, '').replace(/^["']|["']$/g, '').trim();
            
            const confirmText = await PhoneUI.showCustomPrompt("✨ AI 提炼结果如下，确认无误后点击确定保存：", finalQuote);
            if (confirmText && confirmText.trim() !== "") {
                PhoneAPI.saveFavorite(confirmText.trim(), targetApp === 'wechat' ? '线上微信' : '线下故事', msg.sender);
            }
        } catch (e) {
            alert("提炼失败：" + e.message);
        }
    },

    async extractMemory(sourceApp) {
        PhoneAPI.showToast("🧠 正在提取并压缩记忆，请稍候...");
        try {
            const roleId = Config.currentContactId;
            const items = Config.phoneData[roleId]?.[sourceApp]?.items || [];
            
            const recentItems = items.slice(-30).filter(i => i.sender !== 'typing');
            if (recentItems.length === 0) {
                alert("没有足够的聊天记录来提取记忆！");
                return;
            }
            
            let historyText = recentItems.map(item => `${item.sender === 'me' ? '我' : 'TA'}: ${item.content}`).join('\n');
            
            const aiPrompt = `你是一个记忆整理助手。请将以下角色扮演的聊天记录，总结提炼成一段【简短、客观的第三人称记忆档案】（100字左右）。\n要求：\n1. 概括发生了什么事，双方的情感变化或核心互动。\n2. 绝对不要照抄原话，要进行高度浓缩和去水，去除所有敏感(NSFW)细节。\n3. 直接输出总结内容，不要多余的废话。\n\n聊天记录：\n${historyText}`;
            
            const messages = [{ role: "user", content: aiPrompt }];
            const reply = await PhoneAPI.chatWithAI(messages, true); 
            
            let summary = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
            summary = summary.replace(/```.*?/g, '').replace(/```/g, '').trim();
            
            const confirmText = await PhoneUI.showCustomPrompt("✨ AI 提取的记忆档案如下，你可以手动删减去敏，确认无误后点击确定保存：", summary);
            if (confirmText && confirmText.trim() !== "") {
                PhoneAPI.saveToMemoryVault(confirmText.trim(), sourceApp === 'wechat' ? '线上微信' : '线下故事');
            }
        } catch (e) {
            alert("记忆提取失败：" + e.message);
        }
    },

    async washMemory(sourceApp) {
        this.closeMsgMenu();
        if (!confirm("⚠️ 确定要进行【记忆洗地】吗？\nAI将把当前所有聊天记录浓缩成一段长期记忆，随后【清空】当前聊天界面！\n(洗地后不可恢复，请确认)")) return;

        PhoneAPI.showToast("🧹 正在进行记忆洗地，请稍候...");
        try {
            const roleId = Config.currentContactId;
            const items = Config.phoneData[roleId]?.[sourceApp]?.items || [];
            
            if (items.length === 0) {
                alert("当前没有聊天记录可以洗地！");
                return;
            }
            
            const recentItems = items.slice(-50).filter(i => i.sender !== 'typing');
            let historyText = recentItems.map(item => `${item.sender === 'me' ? '我' : 'TA'}: ${item.content}`).join('\n');
            
            const aiPrompt = `你是一个记忆整理助手。请将以下角色扮演的聊天记录，总结提炼成一段【简短、客观的第三人称记忆档案】（150字左右）。\n要求：\n1. 概括发生了什么事，双方的情感变化或核心互动。\n2. 绝对不要照抄原话，要进行高度浓缩和去水，去除所有敏感(NSFW)细节。\n3. 直接输出总结内容，不要多余的废话。\n\n聊天记录：\n${historyText}`;
            
            const messages = [{ role: "user", content: aiPrompt }];
            const reply = await PhoneAPI.chatWithAI(messages, true); 
            
            let summary = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
            summary = summary.replace(/```.*?/g, '').replace(/```/g, '').trim();
            
            const confirmText = await PhoneUI.showCustomPrompt("✨ 洗地总结如下，你可以手动修改去敏，确认后将存入记忆库并清空界面：", summary);
            if (confirmText && confirmText.trim() !== "") {
                PhoneAPI.saveToMemoryVault(confirmText.trim(), sourceApp === 'wechat' ? '线上微信' : '线下故事');
                
                Config.phoneData[roleId][sourceApp].items = [];
                localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
                
                if (sourceApp === 'novel') PhoneUI.renderNovelContent();
                else PhoneUI.renderAppContent('wechat');
                
                PhoneAPI.showToast("🧹 洗地完成！界面已清空，记忆已入库。");
            }
        } catch (e) {
            alert("洗地失败：" + e.message);
        }
    },

    async editMsg() {
        this.closeMsgMenu();
        if (this.currentMsgIndex < 0) return;
        const roleId = Config.currentContactId;
        const targetApp = Config.currentAppId === 'novel' ? 'novel' : 'wechat';
        
        const oldText = Config.phoneData[roleId][targetApp].items[this.currentMsgIndex].content;
        const newText = await PhoneUI.showCustomPrompt("✏️ 编辑消息：", oldText);
        if (newText !== null && newText.trim() !== "") {
            Config.phoneData[roleId][targetApp].items[this.currentMsgIndex].content = newText.trim();
            
            if (targetApp === 'novel') PhoneUI.renderNovelContent();
            else PhoneUI.renderAppContent('wechat');
            
            localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
            PhoneAPI.showToast("✅ 修改成功");
        }
    },

    deleteMsg() {
        this.closeMsgMenu();
        if (this.currentMsgIndex < 0) return;
        const roleId = Config.currentContactId;
        const targetApp = Config.currentAppId === 'novel' ? 'novel' : 'wechat';
        
        Config.phoneData[roleId][targetApp].items.splice(this.currentMsgIndex, 1);
        
        if (targetApp === 'novel') PhoneUI.renderNovelContent();
        else PhoneUI.renderAppContent('wechat');
        
        localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
        PhoneAPI.showToast("🗑️ 消息已删除");
    },

    regenMsg() {
        this.closeMsgMenu();
        if (this.currentMsgIndex < 0) return;
        const roleId = Config.currentContactId;
        const targetApp = Config.currentAppId === 'novel' ? 'novel' : 'wechat';
        
        Config.phoneData[roleId][targetApp].items.splice(this.currentMsgIndex);
        localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
        
        if (targetApp === 'novel') {
            PhoneUI.renderNovelContent();
            this.sendNovelMessage(true);
        } else {
            PhoneUI.renderAppContent('wechat');
            this.sendChatMessage(true);
        }
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
            const targetApp = Config.currentAppId === 'novel' ? 'novel' : 'wechat';
            const chatItems = Config.phoneData[roleId]?.[targetApp]?.items || [];
            
            const recentItems = chatItems.slice(-10); 
            let historyText = recentItems.map(item => `${item.sender === 'me' ? '我' : 'TA'}: ${item.content}`).join('\n');
            if(!historyText) historyText = "(暂无聊天记录，你们才刚认识)";

            const systemPrompt = localStorage.getItem('system_prompt') || '';
            const charPersona = localStorage.getItem('char_persona') || '';
            
            let contextSetup = "";
            if (systemPrompt) contextSetup += `【系统核心指令】：\n${systemPrompt}\n\n`;
            if (charPersona) contextSetup += `【角色设定】：\n${charPersona}\n\n`;

            const aiPrompt = `你是一个高情商的语C辅助军师。以下是我们当前正在进行的角色扮演底层设定：
${contextSetup}

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

            const messages = [{ role: "user", content: aiPrompt }];
            const reply = await PhoneAPI.chatWithAI(messages, true); 

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
        const inputEl = document.getElementById('chat-input') || document.getElementById('novel-input');
        if(inputEl) {
            inputEl.value = topic; 
            inputEl.focus();
        }
    },

    sendUserMsgOnly() {
        const targetApp = Config.currentAppId === 'novel' ? 'novel' : 'wechat';
        const inputEl = targetApp === 'novel' ? document.getElementById('novel-input') : document.getElementById('chat-input');
        
        if(!inputEl) return;
        const text = inputEl.value.trim();
        if (!text) return;

        const roleId = Config.currentContactId;
        if (!Config.phoneData[roleId][targetApp]) Config.phoneData[roleId][targetApp] = { items: [] };
        const chatItems = Config.phoneData[roleId][targetApp].items;

        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
        
        chatItems.push({ sender: 'me', content: text, time: timeStr, date: dateStr });
        inputEl.value = '';

        if (targetApp === 'novel') PhoneUI.renderNovelContent();
        else PhoneUI.renderAppContent('wechat');
        
        localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
    },

    async sendChatMessage(isRegen = false) {
        const roleId = Config.currentContactId;
        if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
        if (!Config.phoneData[roleId].wechat) Config.phoneData[roleId].wechat = { items: [] };
        const chatItems = Config.phoneData[roleId].wechat.items;

        let hasNewUserMsg = false;
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

        if (!isRegen) {
            const inputEl = document.getElementById('chat-input');
            if(inputEl) {
                const text = inputEl.value.trim();
                if (text) {
                    chatItems.push({ sender: 'me', content: text, time: timeStr, date: dateStr });
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
            const banEmoji = localStorage.getItem('ban_emoji') === 'true';
            
            const systemPrompt = localStorage.getItem('system_prompt') || '';
            const charPersona = localStorage.getItem('char_persona') || '';
            
            let fullPrompt = "";
            if (systemPrompt) fullPrompt += `【系统核心指令】：\n${systemPrompt}\n\n`;
            if (charPersona) fullPrompt += `【角色设定】：\n${charPersona}\n\n`;

            let formatRule = "";
            if (banEmoji) formatRule += "【最高禁令】：绝对不允许使用任何 Emoji、颜文字、波浪号(~)，违者抹杀！\n";
            formatRule += "【微信连发强制要求】：你每次回复**必须**输出 4 到 5 句话，并且**每一句话都必须用换行符（回车）隔开**！系统会根据换行符将你的回复切分成多个连续的微信气泡。绝对不要只回一句话，也绝对不要把所有话挤在同一行！\n";
            formatRule += "【读心术机制】：在正式回复之前，你必须使用 <inner> 和 </inner> 标签包裹一段角色此刻真实的内心独白。**【警告】：标签之外必须有正式的回复内容，绝对不能只输出标签导致正文空白！**\n";

            const wbData = PhoneAPI.getWorldbookData();
            const activeOnlineWb = wbData.filter(w => w.online).map(w => w.content).join('\n');
            if (activeOnlineWb) {
                formatRule += `\n【当前生效的世界书/规则插件】：\n${activeOnlineWb}\n`;
            }

            const vault = PhoneAPI.getMemoryVault();
            if (vault.length > 0) {
                const recentVault = vault.slice(-5).map(v => `[${v.date}] ${v.source}: ${v.content}`).join('\n');
                formatRule += `\n【长期记忆档案】：以下是你脑海中深刻的长期记忆，请在对话中自然地保持连贯：\n${recentVault}\n`;
                
                if (hasNewUserMsg) {
                    const userText = chatItems[chatItems.length - 2].content; 
                    const recallTriggers = ['你还记得', '昨天', '上次', '之前', '那个事', '还记得', '那次'];
                    const needsRecall = recallTriggers.some(t => userText.includes(t));
                    
                    if (needsRecall && vault.length > 5) {
                        const extendedVault = vault.slice(-20).map(v => `[${v.date}] ${v.source}: ${v.content}`).join('\n');
                        formatRule += `\n【系统提示(记忆检索触发)】：用户似乎在试图唤醒你的某段记忆。以下是你的扩展记忆库，请检索是否有相关内容，并以你的口吻作出回应：\n${extendedVault}\n`;
                    }
                }
            }

            const shareMemory = localStorage.getItem('share_memory') === 'true';
            if (shareMemory) {
                const novelItems = Config.phoneData[roleId]?.novel?.items || [];
                if (novelItems.length > 0) {
                    const recentNovel = novelItems.slice(-8).map(item => `${item.sender === 'me' ? '我' : 'TA'}: ${item.content}`).join('\n');
                    formatRule += `\n【跨频道记忆联动】：以下是你们最近在[线下故事]中发生的剧情，请在当前的微信回复中自然体现出你记得这些事：\n${recentNovel}\n`;
                }
            }

            fullPrompt += `当前正在和你聊天的人是：【${myName}】。\n${formatRule}`;

            let messages = [{ role: "system", content: fullPrompt }];

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

            if (!isRegen && !hasNewUserMsg) {
                messages.push({
                    role: "user",
                    content: "【系统指令】：我没有说话。请你顺着刚才的话题继续连发微信补充，或者开启一个新话题。"
                });
            }

            const rawReply = await PhoneAPI.chatWithAI(messages, false);

            const innerMatch = rawReply.match(/<inner>([\s\S]*?)<\/inner>/i);
            const innerThought = innerMatch ? innerMatch[1].trim() : "（TA的心思藏得很深，什么也没看出来...）";

            let finalReply = rawReply.replace(/<think>[\s\S]*?<\/think>/gi, '')
                                     .replace(/<inner>[\s\S]*?<\/inner>/gi, '')
                                     .trim();
            if (!finalReply) finalReply = rawReply.trim();

            chatItems.pop(); 
            
            const replyParts = finalReply.split('\n').map(s => s.trim()).filter(s => s.length > 0);
            
            replyParts.forEach(part => {
                chatItems.push({ sender: 'other', content: part, time: timeStr, date: dateStr, innerThought: innerThought });
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
    },

    async sendNovelMessage(isRegen = false) {
        const roleId = Config.currentContactId;
        if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
        if (!Config.phoneData[roleId].novel) Config.phoneData[roleId].novel = { items: [] };
        
        const chatItems = Config.phoneData[roleId].novel.items;

        let hasNewUserMsg = false;
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

        if (!isRegen) {
            const inputEl = document.getElementById('novel-input');
            if(inputEl) {
                const text = inputEl.value.trim();
                if (text) {
                    chatItems.push({ sender: 'me', content: text, time: timeStr, date: dateStr });
                    inputEl.value = '';
                    hasNewUserMsg = true;
                }
            }
        }

        if (!isRegen && !hasNewUserMsg && chatItems.length === 0) return;

        chatItems.push({ sender: 'typing', content: '...', time: timeStr });
        PhoneUI.renderNovelContent();
        localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));

        try {
            const myName = localStorage.getItem('my_name') || '我';
            const banEmoji = localStorage.getItem('ban_emoji') === 'true';
            
            const systemPrompt = localStorage.getItem('system_prompt') || '';
            const charPersona = localStorage.getItem('char_persona') || '';
            const novelStyle = localStorage.getItem('novel_style') || '';
            
            let fullPrompt = "";
            if (systemPrompt) fullPrompt += `【系统核心指令】：\n${systemPrompt}\n\n`;
            if (charPersona) fullPrompt += `【角色设定】：\n${charPersona}\n\n`;
            if (novelStyle) fullPrompt += `【文风要求】：\n${novelStyle}\n\n`;

            const minWords = localStorage.getItem('novel_min_words') || '150';

            let formatRule = "【线下沉浸模式】：当前是面对面的真实场景。请用写小说/语C的笔法进行演绎。\n";
            formatRule += `【字数与细节强制要求】：每次回复**必须不少于 ${minWords} 字**（不包含思维链的字数）！请尽情展开环境渲染、细腻的动作刻画和深度的心理描写，让场景充满画面感。绝对禁止像微信聊天那样只发短对话，必须像长篇小说的一段一样丰满！\n`;
            formatRule += "【读心术机制】：在正式回复之前，你必须使用 <inner> 和 </inner> 标签包裹一段角色此刻真实的内心独白。**【警告】：标签之外必须有正式的剧情描写，绝对不能只输出标签导致正文空白！**\n";

            if (banEmoji) formatRule += "【最高禁令】：绝对不允许使用任何 Emoji、颜文字、波浪号(~)，违者抹杀！\n";

            const wbData = PhoneAPI.getWorldbookData();
            const activeOfflineWb = wbData.filter(w => w.offline).map(w => w.content).join('\n');
            if (activeOfflineWb) {
                formatRule += `\n【当前生效的世界书/规则插件】：\n${activeOfflineWb}\n`;
            }

            const vault = PhoneAPI.getMemoryVault();
            if (vault.length > 0) {
                const recentVault = vault.slice(-5).map(v => `[${v.date}] ${v.source}: ${v.content}`).join('\n');
                formatRule += `\n【长期记忆档案】：以下是你脑海中深刻的长期记忆，请在对话中自然地保持连贯：\n${recentVault}\n`;
                
                if (hasNewUserMsg) {
                    const userText = chatItems[chatItems.length - 2].content; 
                    const recallTriggers = ['你还记得', '昨天', '上次', '之前', '那个事', '还记得', '那次'];
                    const needsRecall = recallTriggers.some(t => userText.includes(t));
                    
                    if (needsRecall && vault.length > 5) {
                        const extendedVault = vault.slice(-20).map(v => `[${v.date}] ${v.source}: ${v.content}`).join('\n');
                        formatRule += `\n【系统提示(记忆检索触发)】：用户似乎在试图唤醒你的某段记忆。以下是你的扩展记忆库，请检索是否有相关内容，并以你的口吻作出回应：\n${extendedVault}\n`;
                    }
                }
            }

            const shareMemory = localStorage.getItem('share_memory') === 'true';
            if (shareMemory) {
                const wechatItems = Config.phoneData[roleId]?.wechat?.items || [];
                if (wechatItems.length > 0) {
                    const recentWechat = wechatItems.slice(-8).map(item => `${item.sender === 'me' ? '我' : 'TA'}: ${item.content}`).join('\n');
                    formatRule += `\n【跨频道记忆联动】：以下是你们最近在[线上微信]中的聊天记录，请在当前的线下剧情中自然体现出你记得这些对话：\n${recentWechat}\n`;
                }
            }

            fullPrompt += `当前正在和你面对面互动的人是：【${myName}】。\n${formatRule}`;

            let messages = [{ role: "system", content: fullPrompt }];

            const MAX_CONTEXT = 20;
            const recentItems = chatItems.slice(-MAX_CONTEXT);
            
            recentItems.forEach(item => {
                if (item.sender !== 'typing') { 
                    messages.push({ role: item.sender === 'me' ? 'user' : 'assistant', content: item.content });
                }
            });

            if (!isRegen && !hasNewUserMsg) {
                messages.push({
                    role: "user",
                    content: "【系统强制指令】：我（用户）当前没有任何动作或对话，可能正在安静等待，也可能已经离开了当前场景。请你完全以你的视角，顺着刚才的剧情继续往下描写（比如你接下来的行动、独自一人的状态、或是场景的过渡）。必须严格保持字数底线和小说画面感，不要向我提问，不要等待我回复！"
                });
            }

            const rawReply = await PhoneAPI.chatWithAI(messages, false);
            
            const innerMatch = rawReply.match(/<inner>([\s\S]*?)<\/inner>/i);
            const innerThought = innerMatch ? innerMatch[1].trim() : "（TA的心思藏得很深，什么也没看出来...）";
            
            let finalReply = rawReply.replace(/<think>[\s\S]*?<\/think>/gi, '')
                                     .replace(/<inner>[\s\S]*?<\/inner>/gi, '')
                                     .trim();
            if (!finalReply) finalReply = rawReply.trim();

            chatItems.pop(); 
            
            chatItems.push({ sender: 'other', content: finalReply, time: timeStr, date: dateStr, innerThought: innerThought });

            PhoneUI.renderNovelContent();
            localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));

        } catch (error) {
            PhoneAPI.showToast(error.message);
            chatItems.pop(); 
            if (hasNewUserMsg) chatItems.pop(); 
            PhoneUI.renderNovelContent();
            localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
        }
    }
};
