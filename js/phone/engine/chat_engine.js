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

    uploadFaceLock() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            PhoneAPI.showToast('🔒 正在提取面部特征...');
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width; let height = img.height; const MAX_SIZE = 512;
                    if (width > height && width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
                    else if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
                    canvas.width = width; canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const base64Url = canvas.toDataURL('image/jpeg', 0.6);
                    localStorage.setItem('img_ref_base64', base64Url);
                    const previewEl = document.getElementById('face-lock-preview');
                    if (previewEl) previewEl.innerHTML = `<img src="${base64Url}" style="width:100%;height:100%;object-fit:cover;">`;
                    PhoneAPI.showToast('✅ 锁脸图已保存！生图时将自动应用。');
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        };
        input.click();
    },

    clearFaceLock() {
        localStorage.removeItem('img_ref_base64');
        const previewEl = document.getElementById('face-lock-preview');
        if (previewEl) previewEl.innerHTML = '<i class="ph ph-plus" style="font-size: 24px; color: var(--text-sub);"></i>';
        PhoneAPI.showToast('🗑️ 锁脸图已清除！');
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

    async extractMemory(sourceApp) {
        PhoneAPI.showToast('🧠 正在提取并拆解记忆，请稍候...');
        const roleId = Config?.currentContactId;
        const items = Config?.phoneData?.[roleId]?.[sourceApp]?.items || [];
        const recentItems = items.filter(i => i.sender !== 'typing').slice(-80);
        if (recentItems.length === 0) return alert('没有足够的聊天记录来提取记忆！');
        const historyText = recentItems.map(item => `${item.sender === 'me' ? '我' : 'TA'}: ${item.content}`).join('\n');
        try {
            const reply = await PhoneAPI.chatWithAI([{ role: 'user', content: `你是一个提取记忆的AI，请从下面聊天记录中抽取具体记忆，按“记忆正文###关键词1,关键词2|||...”的格式输出：\n\n${historyText}` }]);
            const rawText = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/```.*?/g, '').replace(/```/g, '').trim();
            const summaryList = rawText.split('|||').map(s => s.trim()).filter(Boolean);
            const editText = summaryList.join('\n\n');
            const confirmText = await PhoneUI.showCustomPrompt('✨ AI 提取了记忆与关键词，请核对修改（格式：内容###关键词）：', editText);
            if (confirmText && confirmText.trim() !== '') {
                const finalItems = confirmText.split('\n').map(s => s.trim()).filter(Boolean);
                const vaultItems = finalItems.map(item => {
                    const parts = item.split('###');
                    return { content: parts[0].trim(), keywords: parts[1] ? parts[1].trim() : '' };
                });
                PhoneAPI.saveToMemoryVault(vaultItems, sourceApp === 'wechat' ? '线上微信' : '线下故事');
            }
        } catch (e) { alert('记忆提取失败：' + e.message); }
    },

    async washMemory(sourceApp) {
        this.closeMsgMenu();
        if (!confirm('⚠️ 确定要进行【记忆洗地】吗？\nAI将把当前所有聊天记录拆解成多段长期记忆，随后【清空】当前聊天界面！')) return;
        PhoneAPI.showToast('🧹 正在进行记忆洗地，请稍候...');
        const roleId = Config?.currentContactId;
        const items = Config?.phoneData?.[roleId]?.[sourceApp]?.items || [];
        if (items.length === 0) return alert('当前没有聊天记录可以洗地！');
        const recentItems = items.filter(i => i.sender !== 'typing').slice(-80);
        const historyText = recentItems.map(item => `${item.sender === 'me' ? '我' : 'TA'}: ${item.content}`).join('\n');
        try {
            const reply = await PhoneAPI.chatWithAI([{ role: 'user', content: `请把下面聊天记录整理成记忆碎片，用“记忆正文###关键词1,关键词2|||...”格式输出：\n\n${historyText}` }]);
            const rawText = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/```.*?/g, '').replace(/```/g, '').trim();
            const summaryList = rawText.split('|||').map(s => s.trim()).filter(Boolean);
            const editText = summaryList.join('\n\n');
            const confirmText = await PhoneUI.showCustomPrompt('✨ 洗地记忆碎片如下，确认后将存入记忆库并清空界面：', editText);
            if (confirmText && confirmText.trim() !== '') {
                const finalItems = confirmText.split('\n').map(s => s.trim()).filter(Boolean);
                const vaultItems = finalItems.map(item => {
                    const parts = item.split('###');
                    return { content: parts[0].trim(), keywords: parts[1] ? parts[1].trim() : '' };
                });
                PhoneAPI.saveToMemoryVault(vaultItems, sourceApp === 'wechat' ? '线上微信' : '线下故事');
                Config.phoneData[roleId][sourceApp].items = [];
                localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
                if (sourceApp === 'novel') PhoneUI.renderNovelContent?.();
                else PhoneUI.renderAppContent?.('wechat');
                PhoneAPI.showToast('🧹 洗地完成！界面已清空，记忆已入库。');
            }
        } catch (e) { alert('洗地失败：' + e.message); }
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

    compressImage(base64Str) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width; let height = img.height; const MAX_SIZE = 1024;
                if (width > height && width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
                else if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.src = 'data:image/png;base64,' + base64Str;
        });
    },

    async generateAiImage() {
        const prompt = await PhoneUI.showCustomPrompt('🎨 请输入画面描述：', '大侦探不死途穿着黑衬衫，在赛博朋克城市的霓虹灯下抽烟，二次元动漫风格');
        if (!prompt) return;
        try {
            const b64Json = await PhoneAPI.generateImageAPI(prompt);
            PhoneAPI.showToast('✨ 画作已生成，正在冲洗入册...');
            const finalB64 = await this.compressImage(b64Json);
            const roleId = Config?.currentContactId;
            if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
            if (!Config.phoneData[roleId].gallery) Config.phoneData[roleId].gallery = { items: [] };
            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            Config.phoneData[roleId].gallery.items.push({ id: 'img_' + Date.now(), content: finalB64, date: dateStr });
            localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
            PhoneUI.renderAppContent('gallery');
            PhoneAPI.showToast('📸 新照片已保存在回忆相册！');
        } catch (e) { alert(e.message); }
    },

    deleteGalleryImage(id) {
        if (!confirm('确定要销毁这张照片吗？')) return;
        const roleId = Config?.currentContactId;
        const items = Config?.phoneData?.[roleId]?.gallery?.items || [];
        Config.phoneData[roleId].gallery.items = items.filter(i => i.id !== id);
        localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
        PhoneUI.renderAppContent('gallery');
        PhoneUI.closeImageViewer?.();
        PhoneAPI.showToast('🗑️ 照片已销毁');
    },

    _scanKeywords(userText) {
        if (!userText) return '';
        const vault = PhoneAPI.getMemoryVault() || [];
        const triggeredMemories = [];
        vault.forEach(item => {
            if (item.keywords && typeof item.keywords === 'string') {
                const kws = item.keywords.split(',').map(k => k.trim()).filter(Boolean);
                if (kws.some(kw => userText.includes(kw))) triggeredMemories.push(`[${item.id}] ${item.source}: ${item.content}`);
            }
        });
        return triggeredMemories.length > 0 ? `\n【系统提示(关键词触发)】：用户刚才的话触动了你的某段记忆：\n${triggeredMemories.slice(0, 3).join('\n')}\n` : '';
    },

    async sendChatMessage(isRegen = false) {
        const roleId = Config?.currentContactId;
        if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
        if (!Config.phoneData[roleId].wechat) Config.phoneData[roleId].wechat = { items: [] };
        const chatItems = Config.phoneData[roleId].wechat.items;
        let hasNewUserMsg = false; let latestUserText = '';
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        // 融合了 patch 补丁：恢复被 sendUserMsgOnly 清空的输入
        if (!isRegen) {
            const inputEl = document.getElementById('chat-input');
            if (inputEl) {
                const text = inputEl.value.trim();
                if (text) {
                    chatItems.push({ sender: 'me', content: text, time: timeStr, date: dateStr });
                    inputEl.value = '';
                    hasNewUserMsg = true;
                    latestUserText = text;
                } else if (chatItems.length > 0) {
                    const lastItem = chatItems[chatItems.length - 1];
                    if (lastItem.sender === 'me' && lastItem.content) {
                        chatItems.pop();
                        inputEl.value = lastItem.content;
                        hasNewUserMsg = true;
                        latestUserText = lastItem.content;
                        chatItems.push({ sender: 'me', content: latestUserText, time: timeStr, date: dateStr });
                        inputEl.value = '';
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
            
            let stablePrompt = `【系统时间感知】当前现实时间：${new Date().toLocaleString()}\n`;
            if (systemPrompt) stablePrompt += `【系统核心指令】：\n${systemPrompt}\n\n`;
            if (charPersona) stablePrompt += `【角色设定】：\n${charPersona}\n\n`;

            // 完美补回丢失的约束，防止爆思维链
            let formatRule = "【最高禁令】：绝对禁止输出任何分析过程、思考步骤、任务拆解！不要出现“好，这条消息的上下文是”等字眼！直接输出角色的台词！\n";
            formatRule += "【微信连发机制】：不限制气泡数量，请务必把你想说的话完整说完！系统会根据换行符切分微信气泡。绝对不要把所有话挤在同一行！\n";
            formatRule += "【读心术机制】：在正式回复之前，你必须使用 <inner> 和 </inner> 标签包裹一段角色此刻真实的内心独白。\n";
            stablePrompt += formatRule;

            const wbData = PhoneAPI.getWorldbookData();
            const activeOnlineWb = wbData.filter(w => w.online).map(w => w.content).join('\n');
            if (activeOnlineWb) stablePrompt += `\n【当前生效的世界书/规则插件】：\n${activeOnlineWb}\n`;
            
            let dynamicPrompt = '';
            if (latestUserText) dynamicPrompt += this._scanKeywords(latestUserText);
            const allVault = PhoneAPI.getMemoryVault();
            let accessibleVault = allVault;
            if (!shareMemory) accessibleVault = allVault.filter(v => v.isCore || v.source === '线上微信');
            if (accessibleVault.length > 0) {
                const recentVault = accessibleVault.slice(-5).map(v => `[${v.id}] ${v.source}: ${v.content}`).join('\n');
                dynamicPrompt += `\n【长期记忆档案】：\n${recentVault}\n`;
            }
            
            let messages = [{ role: 'system', content: stablePrompt + (dynamicPrompt || '') }, { role: 'user', content: latestUserText || '请继续。' }];
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
            if (hasNewUserMsg) chatItems.pop();
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
                }
            }
        }
        chatItems.push({ sender: 'typing', content: '...', time: new Date().toLocaleTimeString() });
        PhoneUI.renderNovelContent();
        try {
            const systemPrompt = localStorage.getItem('system_prompt') || '';
            const charPersona = localStorage.getItem('char_persona') || '';
            
            let stablePrompt = `${systemPrompt}\n${charPersona}\n`;
            stablePrompt += "【读心术机制】：在正式回复之前，你必须使用 <inner> 和 </inner> 标签包裹一段角色此刻真实的内心独白。\n";
            stablePrompt += "【最高禁令】：绝对禁止输出任何分析过程、思考步骤！直接输出剧情！\n";

            const rawReply = await PhoneAPI.chatWithAI([{ role: 'system', content: stablePrompt }, { role: 'user', content: latestUserText || '请继续写下去。' }]);
            
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
    },

    async generateDiary(dateStr) {
        const contentAreaEl = document.getElementById('diary-content-area');
        if (!contentAreaEl) return;
        contentAreaEl.innerHTML = '<div class="notebook-empty"><i class="ph-fill ph-spinner spin-anim" style="font-size: 48px; color: rgba(0,0,0,0.5); margin-bottom: 15px;"></i><p>正在生成日记...</p></div>';
        try {
            const roleId = Config?.currentContactId;
            const wechatItems = (Config?.phoneData?.[roleId]?.wechat?.items || []).filter(i => i.date === dateStr).map(i => ({ ...i, source: '线上微信' }));
            const novelItems = (Config?.phoneData?.[roleId]?.novel?.items || []).filter(i => i.date === dateStr).map(i => ({ ...i, source: '线下故事' }));
            const recentItems = [...wechatItems, ...novelItems].sort((a, b) => (a.time || '').localeCompare(b.time || '')).slice(-80);
            const historyText = recentItems.map(item => `[${item.source}] ${item.time || ''} ${item.sender === 'me' ? '我' : 'TA'}: ${item.content}`).join('\n');
            const prompt = `根据以下聊天记录，写一篇符合角色设定与当天事件的个人日记。绝对禁止输出分析过程，直接输出日记正文：\n\n${historyText}`;
            const reply = await PhoneAPI.chatWithAI([{ role: 'user', content: prompt }]);
            const finalDiary = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
            PhoneAPI.saveDiary(dateStr, finalDiary);
            PhoneUI.renderDiaryPage();
            PhoneAPI.showToast('✨ 日记生成成功，已同步至 EchoVault！');
        } catch (error) {
            contentAreaEl.innerHTML = '<div class="notebook-empty"><i class="ph-fill ph-warning-circle" style="font-size: 48px; color: var(--danger-color); margin-bottom: 15px;"></i><p style="color: var(--danger-color);">日记生成失败！</p></div>';
        }
    }
};

export default ChatEngine;
