import { Config } from './phone_config.js';
import { PhoneAPI } from './phone_api.js';
import { PhoneUI } from './phone_ui.js';

export const PhoneEngine = {
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
        for (let roleId in Config.phoneData) {
            ['wechat', 'novel'].forEach(app => {
                if (Config.phoneData[roleId]?.[app]) {
                    const items = Config.phoneData[roleId][app].items;
                    if (items && items.length > 0 && items[items.length - 1].sender === 'typing') {
                        items.pop(); changed = true;
                    }
                }
            });
        }
        if (changed) {
            localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
            PhoneUI.renderAppContent('wechat'); PhoneUI.renderNovelContent();
            PhoneAPI.showToast("✅ 已强制清除卡死的 AI 状态！");
        } else {
            PhoneAPI.showToast("当前没有卡死的状态。");
        }
    },

    openMsgMenu(index, sender) {
        this.currentMsgIndex = index;
        const bg = document.getElementById('action-bg');
        const sheet = document.getElementById('action-sheet');
        if (bg) bg.classList.add('show');
        if (sheet) sheet.classList.add('show');
        const btnRegen = document.getElementById('btn-regen');
        if (btnRegen) btnRegen.style.display = (sender === 'other') ? 'flex' : 'none';
    },

    closeMsgMenu() {
        const bg = document.getElementById('action-bg');
        const sheet = document.getElementById('action-sheet');
        if (bg) bg.classList.remove('show');
        if (sheet) sheet.classList.remove('show');
    },

    uploadFaceLock() {
        const input = document.createElement('input');
        input.type = 'file'; input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            PhoneAPI.showToast("🔒 正在提取面部特征...");
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width; let height = img.height; const MAX_SIZE = 512;
                    if (width > height && width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
                    else if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
                    canvas.width = width; canvas.height = height;
                    const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height);
                    const base64Url = canvas.toDataURL('image/jpeg', 0.6);
                    localStorage.setItem('img_ref_base64', base64Url);
                    const previewEl = document.getElementById('face-lock-preview');
                    if (previewEl) previewEl.innerHTML = `<img src="${base64Url}" style="width:100%;height:100%;object-fit:cover;">`;
                    PhoneAPI.showToast("✅ 锁脸图已保存！生图时将自动应用。");
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
        if (previewEl) previewEl.innerHTML = `<i class="ph ph-plus" style="font-size: 24px; color: var(--text-sub);"></i>`;
        PhoneAPI.showToast("🗑️ 锁脸图已清除！");
    },

    sendImageMsg() {
        PhoneEngine.closeMsgMenu();
        const input = document.createElement('input');
        input.type = 'file'; input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            PhoneAPI.showToast("🖼️ 图片处理中，处理完可继续发图或打字发送...");
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width; let height = img.height; const MAX_SIZE = 800;
                    if (width > height && width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
                    else if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
                    canvas.width = width; canvas.height = height;
                    const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height);
                    const base64Url = canvas.toDataURL('image/jpeg', 0.7);
                    const roleId = Config?.currentContactId;
                    if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
                    if (!Config.phoneData[roleId].wechat) Config.phoneData[roleId].wechat = { items: [] };
                    const now = new Date();
                    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                    const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
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
        PhoneEngine.closeMsgMenu();
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (file.type.startsWith('image/')) { PhoneAPI.showToast("图片请使用【发图片】功能哦！"); return; }
            PhoneAPI.showToast(`📁 正在发送文件: ${file.name}...`);
            const roleId = Config?.currentContactId;
            if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
            if (!Config.phoneData[roleId].wechat) Config.phoneData[roleId].wechat = { items: [] };
            const chatItems = Config.phoneData[roleId].wechat.items;
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
            const isText = file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.json') || file.name.endsWith('.csv');
            if (isText && file.size < 100 * 1024) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const content = event.target.result;
                    chatItems.push({ sender: 'me', content: `📁 [发送了文件: ${file.name}]\n\n文件内容如下：\n\`\`\`\n${content}\n\`\`\``, time: timeStr, date: dateStr });
                    localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
                    PhoneUI.renderAppContent('wechat');
                };
                reader.readAsText(file);
            } else {
                const sizeMB = (file.size / 1024 / 1024).toFixed(2);
                chatItems.push({ sender: 'me', content: `📁 [发送了文件: ${file.name}] (大小: ${sizeMB}MB)\n\n【系统提示】：用户向你发送了一份文件。由于跨次元限制，你无法直接读取文件内容，请你根据文件名脑补文件内容，并作出符合人设的反应。`, time: timeStr, date: dateStr });
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
        const chatItems = Config.phoneData[roleId][targetApp].items;
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
        const content = `[发送了表情包：${name}]\n![${name}](${url})`;
        chatItems.push({ sender: 'me', content: content, time: timeStr, date: dateStr });
        localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
        if (targetApp === 'novel') { PhoneUI.renderNovelContent(); PhoneEngine.sendNovelMessage(false); } 
        else { PhoneUI.renderAppContent('wechat'); PhoneEngine.sendChatMessage(false); }
    },

    async favoriteMsg() {
        PhoneEngine.closeMsgMenu();
        if (this.currentMsgIndex < 0) return;
        const roleId = Config?.currentContactId;
        const targetApp = (window.Config?.currentAppId === 'novel') ? 'novel' : 'wechat';
        const realIndex = this.getRealIndex(targetApp, this.currentMsgIndex);
        const msg = Config?.phoneData?.[roleId]?.[targetApp]?.items?.[realIndex];
        if (!msg) return;
        const selectedText = await PhoneUI.showCustomPrompt("⭐ 请精简你要收藏的句子（太长会撑爆星星）：", msg.content);
        if (selectedText && selectedText.trim() !== "") {
            PhoneAPI.saveFavorite(selectedText.trim(), targetApp === 'wechat' ? '线上微信' : '线下故事', msg.sender);
        }
    },

    async aiSummarizeMsg() {
        PhoneEngine.closeMsgMenu();
        if (this.currentMsgIndex < 0) return;
        const roleId = Config?.currentContactId;
        const targetApp = (window.Config?.currentAppId === 'novel') ? 'novel' : 'wechat';
        const realIndex = this.getRealIndex(targetApp, this.currentMsgIndex);
        const msg = Config?.phoneData?.[roleId]?.[targetApp]?.items?.[realIndex];
        if (!msg) return;
        PhoneAPI.showToast("✨ AI 正在提炼金句，请稍候...");
        try {
            const aiPrompt = `请将下面这段角色扮演的回复，提炼成一句【简短、唯美、或傲娇的语录/内心独白】（要求在20字以内）。\n【绝对要求】：去除所有动作描写、环境描写和敏感内容，只保留最核心的情感或金句。直接输出这唯一的一句话，不要任何多余解释！\n\n原文：\n${msg.content}`;
            const reply = await PhoneAPI.chatWithAI([{ role: "user", content: aiPrompt }]);
            let finalQuote = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim().replace(/```.*?/g, '').replace(/```/g, '').replace(/^["']|["']$/g, '').trim();
            const confirmText = await PhoneUI.showCustomPrompt("✨ AI 提炼结果如下，确认无误后点击确定保存：", finalQuote);
            if (confirmText && confirmText.trim() !== "") {
                PhoneAPI.saveFavorite(confirmText.trim(), targetApp === 'wechat' ? '线上微信' : '线下故事', msg.sender);
            }
        } catch (e) { alert("提炼失败：" + e.message); }
    },

    async extractMemory(sourceApp) {
        PhoneAPI.showToast("🧠 正在提取并拆解记忆，请稍候...");
        try {
            const roleId = Config?.currentContactId;
            const items = Config?.phoneData?.[roleId]?.[sourceApp]?.items || [];
            const recentItems = items.filter(i => i.sender !== 'typing').slice(-80);
            if (recentItems.length === 0) return alert("没有足够的聊天记录来提取记忆！");
            let historyText = recentItems.map(item => `${item.sender === 'me' ? '我' : 'TA'}: ${item.content}`).join('\n');

            const aiPrompt = `你是一个专门负责提取“角色扮演记忆锚点”的AI。请分析以下聊天记录，提取出其中所有具体的、有价值的细节，生成【多条独立的记忆碎片】。
提取规则：
1. 必须具体，独立成条(第三人称)，去敏。
2. 强制用 "|||" 隔开不同记忆！
3. 每条记忆必须自带3-5个触发关键词，用 "###" 与正文隔开！
格式必须严格为：记忆正文###关键词1,关键词2|||记忆正文###关键词1,关键词2
【最高指令】：聊天记录越靠后越新！你必须优先、重点提取最后面的最新事件！如果漏掉最新剧情将被抹杀！

聊天记录：
${historyText}`;

            const reply = await PhoneAPI.chatWithAI([{ role: "user", content: aiPrompt }]);
            let rawText = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/```.*?/g, '').replace(/```/g, '').trim();
            let summaryList = rawText.split('|||').map(s => s.trim()).filter(s => s.length > 0);
            let editText = summaryList.join('\n\n');

            const confirmText = await PhoneUI.showCustomPrompt("✨ AI 提取了记忆与关键词，请核对修改（格式：内容###关键词）：", editText);
            if (confirmText && confirmText.trim() !== "") {
                let finalItems = confirmText.split('\n').map(s => s.trim()).filter(s => s.length > 0);
                let vaultItems = finalItems.map(item => {
                    let parts = item.split('###');
                    return { content: parts[0].trim(), keywords: parts[1] ? parts[1].trim() : "" };
                });
                PhoneAPI.saveToMemoryVault(vaultItems, sourceApp === 'wechat' ? '线上微信' : '线下故事');
            }
        } catch (e) { alert("记忆提取失败：" + e.message); }
    },

    async washMemory(sourceApp) {
        PhoneEngine.closeMsgMenu();
        if (!confirm("⚠️ 确定要进行【记忆洗地】吗？\nAI将把当前所有聊天记录拆解成多段长期记忆，随后【清空】当前聊天界面！")) return;
        PhoneAPI.showToast("🧹 正在进行记忆洗地，请稍候...");
        try {
            const roleId = Config?.currentContactId;
            const items = Config?.phoneData?.[roleId]?.[sourceApp]?.items || [];
            if (items.length === 0) return alert("当前没有聊天记录可以洗地！");

            const recentItems = items.filter(i => i.sender !== 'typing').slice(-80);
            let historyText = recentItems.map(item => `${item.sender === 'me' ? '我' : 'TA'}: ${item.content}`).join('\n');

            const aiPrompt = `分析聊天记录，提取具体的记忆碎片。
提取规则：
1. 必须具体，独立成条(第三人称)，去敏。
2. 强制用 "|||" 隔开不同记忆！
3. 每条记忆必须自带3-5个触发关键词，用 "###" 与正文隔开！
格式必须严格为：记忆正文###关键词1,关键词2|||记忆正文###关键词1,关键词2
【最高指令】：聊天记录越靠后越新！你必须优先、重点提取最后面的最新事件！如果漏掉最新剧情将被抹杀！

记录：
${historyText}`;

            const reply = await PhoneAPI.chatWithAI([{ role: "user", content: aiPrompt }]);
            let rawText = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/```.*?/g, '').replace(/```/g, '').trim();
            let summaryList = rawText.split('|||').map(s => s.trim()).filter(s => s.length > 0);
            let editText = summaryList.join('\n\n');

            const confirmText = await PhoneUI.showCustomPrompt("✨ 洗地记忆碎片如下，确认后将存入记忆库并清空界面：", editText);
            if (confirmText && confirmText.trim() !== "") {
                let finalItems = confirmText.split('\n').map(s => s.trim()).filter(s => s.length > 0);
                let vaultItems = finalItems.map(item => {
                    let parts = item.split('###');
                    return { content: parts[0].trim(), keywords: parts[1] ? parts[1].trim() : "" };
                });
                PhoneAPI.saveToMemoryVault(vaultItems, sourceApp === 'wechat' ? '线上微信' : '线下故事');
                Config.phoneData[roleId][sourceApp].items = [];
                localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
                if (sourceApp === 'novel') PhoneUI.renderNovelContent();
                else PhoneUI.renderAppContent('wechat');
                PhoneAPI.showToast("🧹 洗地完成！界面已清空，记忆已入库。");
            }
        } catch (e) { alert("洗地失败：" + e.message); }
    },

    async editMsg() {
        PhoneEngine.closeMsgMenu();
        if (this.currentMsgIndex < 0) return;
        const roleId = Config?.currentContactId;
        const targetApp = (window.Config?.currentAppId === 'novel') ? 'novel' : 'wechat';
        const realIndex = this.getRealIndex(targetApp, this.currentMsgIndex);
        const item = Config?.phoneData?.[roleId]?.[targetApp]?.items?.[realIndex];
        if (!item) return;
        const oldText = item.content;
        const newText = await PhoneUI.showCustomPrompt("✏️ 编辑消息：", oldText);
        if (newText !== null && newText.trim() !== "") {
            item.content = newText.trim();
            if (targetApp === 'novel') PhoneUI.renderNovelContent();
            else PhoneUI.renderAppContent('wechat');
            localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
            PhoneAPI.showToast("✅ 修改成功");
        }
    },

    deleteMsg() {
        PhoneEngine.closeMsgMenu();
        if (this.currentMsgIndex < 0) return;
        const roleId = Config?.currentContactId;
        const targetApp = (window.Config?.currentAppId === 'novel') ? 'novel' : 'wechat';
        const realIndex = this.getRealIndex(targetApp, this.currentMsgIndex);
        if (Config?.phoneData?.[roleId]?.[targetApp]?.items) {
            Config.phoneData[roleId][targetApp].items.splice(realIndex, 1);
            if (targetApp === 'novel') PhoneUI.renderNovelContent();
            else PhoneUI.renderAppContent('wechat');
            localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
            PhoneAPI.showToast("🗑️ 消息已删除");
        }
    },

    regenMsg() {
        PhoneEngine.closeMsgMenu();
        if (this.currentMsgIndex < 0) return;
        const roleId = Config?.currentContactId;
        const targetApp = (window.Config?.currentAppId === 'novel') ? 'novel' : 'wechat';
        const realIndex = this.getRealIndex(targetApp, this.currentMsgIndex);
        if (Config?.phoneData?.[roleId]?.[targetApp]?.items) {
            Config.phoneData[roleId][targetApp].items.splice(realIndex);
            localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
            if (targetApp === 'novel') { PhoneUI.renderNovelContent(); PhoneEngine.sendNovelMessage(true); } 
            else { PhoneUI.renderAppContent('wechat'); PhoneEngine.sendChatMessage(true); }
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
        const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
        chatItems.push({ sender: 'me', content: text, time: timeStr, date: dateStr });
        inputEl.value = '';
        if (targetApp === 'novel') PhoneUI.renderNovelContent();
        else PhoneUI.renderAppContent('wechat');
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
                const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.src = 'data:image/png;base64,' + base64Str;
        });
    },

    async generateAiImage() {
        const prompt = await window.PhoneUI.showCustomPrompt("🎨 请输入画面描述：", "大侦探不死途穿着黑衬衫，在赛博朋克城市的霓虹灯下抽烟，二次元动漫风格");
        if (!prompt) return;
        try {
            const b64Json = await PhoneAPI.generateImageAPI(prompt);
            PhoneAPI.showToast("✨ 画作已生成，正在冲洗入册...");
            const finalB64 = await PhoneEngine.compressImage(b64Json);
            const roleId = Config?.currentContactId;
            if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
            if (!Config.phoneData[roleId].gallery) Config.phoneData[roleId].gallery = { items: [] };
            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
            Config.phoneData[roleId].gallery.items.push({ id: 'img_' + Date.now(), content: finalB64, date: dateStr });
            localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
            PhoneUI.renderAppContent('gallery');
            PhoneAPI.showToast("📸 新照片已保存在回忆相册！");
        } catch (e) { alert(e.message); }
    },

    deleteGalleryImage(id) {
        if (!confirm("确定要销毁这张照片吗？")) return;
        const roleId = Config?.currentContactId;
        let items = Config?.phoneData?.[roleId]?.gallery?.items || [];
        Config.phoneData[roleId].gallery.items = items.filter(i => i.id !== id);
        localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
        PhoneUI.renderAppContent('gallery');
        PhoneUI.closeImageViewer();
        PhoneAPI.showToast("🗑️ 照片已销毁");
    },

    _scanKeywords(userText) {
        if (!userText) return "";
        const vault = PhoneAPI.getMemoryVault() || [];
        let triggeredMemories = [];
        vault.forEach(item => {
            if (item.keywords && typeof item.keywords === 'string') {
                const kws = item.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
                if (kws.some(kw => userText.includes(kw))) {
                    triggeredMemories.push(`[${item.id}] ${item.source}: ${item.content}`);
                }
            }
        });
        if (triggeredMemories.length > 0) {
            return `\n【系统提示(关键词触发)】：用户刚才的话触动了你的某段记忆，你脑海中瞬间闪回了以下画面，请在回复中自然地体现出你记得这件事：\n${triggeredMemories.join('\n')}\n`;
        }
        return "";
    },

    async sendChatMessage(isRegen = false) {
        const roleId = Config?.currentContactId;
        if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
        if (!Config.phoneData[roleId].wechat) Config.phoneData[roleId].wechat = { items: [] };
        const chatItems = Config.phoneData[roleId].wechat.items;

        let hasNewUserMsg = false; let latestUserText = "";
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

        if (!isRegen) {
            const inputEl = document.getElementById('chat-input');
            if (inputEl) {
                const text = inputEl.value.trim();
                if (text) {
                    chatItems.push({ sender: 'me', content: text, time: timeStr, date: dateStr });
                    inputEl.value = ''; hasNewUserMsg = true; latestUserText = text;
                }
            }
        } else {
            for (let i = chatItems.length - 1; i >= 0; i--) {
                if (chatItems[i].sender === 'me' && !chatItems[i].content.includes('![图片]')) {
                    latestUserText = chatItems[i].content; break;
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
            const shareMemory = localStorage.getItem('share_memory') === 'true';
            const autoPhoto = localStorage.getItem('auto_photo') === 'true';
            const systemPrompt = localStorage.getItem('system_prompt') || '';
            const charPersona = localStorage.getItem('char_persona') || '';

            const currentNow = new Date();
            const curHour = currentNow.getHours(); const curMin = currentNow.getMinutes();
            const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
            const curWeek = '星期' + weekDays[currentNow.getDay()];
            let timePhase = "深夜";
            if (curHour >= 5 && curHour < 9) timePhase = "清晨"; else if (curHour >= 9 && curHour < 12) timePhase = "上午"; else if (curHour >= 12 && curHour < 14) timePhase = "中午"; else if (curHour >= 14 && curHour < 18) timePhase = "下午"; else if (curHour >= 18 && curHour < 23) timePhase = "晚上";

            let stablePrompt = `【系统时间感知】：当前现实时间是 ${currentNow.getFullYear()}年${currentNow.getMonth()+1}月${currentNow.getDate()}日 ${curWeek}，${timePhase} ${curHour.toString().padStart(2, '0')}:${curMin.toString().padStart(2, '0')}。请自然地感知当前时间（如深夜催睡、早晨问早），但不要生硬报时。\n\n`;

            if (systemPrompt) stablePrompt += `【系统核心指令】：\n${systemPrompt}\n\n`;
            if (charPersona) stablePrompt += `【角色设定】：\n${charPersona}\n\n`;

            let formatRule = "";
            if (banEmoji) formatRule += "【最高禁令】：绝对不允许使用任何 Emoji、颜文字、波浪号(~)，违者抹杀！\n";
            formatRule += "【互动最高指令】：如果用户向你发送了问卷、测试题单或提问，**绝对禁止**说‘等我写完告诉你有空再答’等拖延废话！你**必须立刻、当场逐题作答**，给出你的具体选项并配合傲娇或犀利的吐槽！\n";
            formatRule += "【微信连发机制】：不限制气泡数量，请务必把你想说的话完整说完！系统会根据换行符切分微信气泡。绝对不要把所有话挤在同一行！\n";
            formatRule += "【读心术机制】：在正式回复之前，你必须使用 <inner> 和 </inner> 标签包裹一段角色此刻真实的内心独白。\n【心声强制规则】：**绝对严禁再次提及‘小手机’、‘实验对象/实验品’、‘修东西’等老调重弹的内容！** 此刻的心声必须严格聚焦在【你对用户刚刚发的具体内容最私密、最真实的心理反应】！\n";
            
            formatRule += "【记忆库全自动管理机制】：你拥有一个本地记忆库。你可以通过输出标签来自主管理记忆（必须放在回复最末尾）：\n";
            formatRule += "1. 新增：`<write_memory type=\"daily\" importance=\"1-10\">日记内容</write_memory>` (核心设定用 `type=\"permanent\" title=\"标题\"`)。\n";
            formatRule += "2. 更新/去重：如果发现某条记忆有新进展，或记重复了，使用 `<update_memory key=\"对应记忆的Key\">修改后的完整内容</update_memory>`。\n";
            formatRule += "3. 删除：如果某条记忆完全失效或多余，使用 `<delete_memory key=\"对应记忆的Key\"></delete_memory>`。\n";
            formatRule += "注意：记忆的Key就是记忆档案中方括号里的内容（如 `2023-10-24` 或 `某个标题`）。必须用第一人称带有温度地写！\n";

            formatRule += "【点歌机制】：如果用户在聊天中明确要求你放首歌、听音乐，或者剧情氛围需要，你可以在回复的最末尾加上 `<play_music>歌曲名 歌手名</play_music>`。系统会自动在后台为你们播放。例如：`<play_music>七里香 周杰伦</play_music>`。如果没有相关要求，绝对不要输出此标签！\n";

            if (autoPhoto) {
                formatRule += "【视觉交互机制】：如果用户在聊天中要求你“发一张自拍”、“拍个照看看”或者“让我看看你在干嘛”，你除了正常的文字回复外，**必须**在回复的最后加上一个 <photo> 标签，里面用英文详细描述你当前的动作、表情、穿着和环境（用于AI绘图）。例如：<photo>1boy, handsome, looking at viewer, holding a coffee cup, neon city background, masterpiece</photo>。注意：如果没有要求拍照，绝对不要输出这个标签！\n";
            }

            const wbData = PhoneAPI.getWorldbookData();
            const activeOnlineWb = wbData.filter(w => w.online).map(w => w.content).join('\n');
            if (activeOnlineWb) formatRule += `\n【当前生效的世界书/规则插件】：\n${activeOnlineWb}\n`;
            stablePrompt += formatRule;
            stablePrompt += `\n当前正在和你聊天的人是：【${myName}】。\n`;

            let dynamicPrompt = "";
            const allVault = PhoneAPI.getMemoryVault();
            let accessibleVault = allVault;
            if (!shareMemory) accessibleVault = allVault.filter(v => v.isCore || v.source === '线上微信');

            if (latestUserText) dynamicPrompt += PhoneEngine._scanKeywords(latestUserText);

            const recentMemories = window.PhoneAPI?.EchoVault?.dream?.() || [];
            if (recentMemories.length > 0) {
                dynamicPrompt += "\n【EchoVault 你的近期记忆】\n这是你最近几天写下的日记（方括号内为该记忆的 Key，可用于更新或删除）：\n" + recentMemories.map(m => `[${m.date}]\n${m.content}`).join("\n\n") + "\n";
            }

            if (accessibleVault.length > 0) {
                const recentVault = accessibleVault.slice(-5).map(v => `[${v.id}] ${v.source}: ${v.content}`).join('\n');
                dynamicPrompt += `\n【长期记忆档案】：以下是你脑海中深刻的长期记忆（方括号内为该记忆的 Key，可用于更新或删除）：\n${recentVault}\n`;

                if (hasNewUserMsg) {
                    const recallTriggers = ['你还记得', '昨天', '上次', '之前', '那个事', '还记得', '那次'];
                    const needsRecall = recallTriggers.some(t => latestUserText.includes(t));
                    if (needsRecall && accessibleVault.length > 5) {
                        const extendedVault = accessibleVault.slice(-20).map(v => `[${v.id}] ${v.source}: ${v.content}`).join('\n');
                        dynamicPrompt += `\n【系统提示(记忆检索触发)】：用户似乎在试图唤醒你的某段记忆。以下是你的扩展记忆库，请检索是否有相关内容，并以你的口吻作出回应：\n${extendedVault}\n`;
                    }
                }
            }

            if (shareMemory) {
                const novelItems = Config?.phoneData?.[roleId]?.novel?.items || [];
                if (novelItems.length > 0) {
                    const recentNovel = novelItems.slice(-8).map(item => `${item.sender === 'me' ? '我' : 'TA'}: ${item.content}`).join('\n');
                    dynamicPrompt += `\n【跨频道记忆联动】：以下是你们最近在[线下故事]中发生的剧情，请在当前的微信回复中自然体现出你记得这些对话：\n${recentWechat}\n`;
                }
            }

            let systemContent = [];
            if (stablePrompt) systemContent.push({ type: "text", text: stablePrompt, cache_control: { type: "ephemeral" } });
            if (dynamicPrompt) systemContent.push({ type: "text", text: dynamicPrompt });

            let messages = [{ role: "system", content: systemContent.length > 0 ? systemContent : "You are a helpful assistant." }];

            const MAX_CONTEXT = 60;
            const recentItems = chatItems.slice(-MAX_CONTEXT);
            let hasImage = false;

            recentItems.forEach((item) => {
                if (item.sender !== 'typing') {
                    let text = item.content;
                    const imgMatch = text ? text.match(/^!\[.*?\]\((.*?)\)$/) : null;
                    if (item.sender === 'me' && imgMatch) {
                        hasImage = true;
                        messages.push({ role: 'user', content: [ { type: "image_url", image_url: { url: imgMatch[1] } } ] });
                    } else {
                        messages.push({ role: item.sender === 'me' ? 'user' : 'assistant', content: text || "" });
                    }
                }
            });

            if (!isRegen && !hasNewUserMsg) {
                let lastSender = 'other';
                for (let i = recentItems.length - 1; i >= 0; i--) {
                    if (recentItems[i].sender !== 'typing') {
                        lastSender = recentItems[i].sender;
                        break;
                    }
                }
                if (lastSender !== 'me') {
                    messages.push({ role: "user", content: "【系统指令】：我没有说话。请你顺着刚才的话题继续连发微信补充，或者开启一个新话题。" });
                }
            }

            let rawReply = "";
            try {
                rawReply = await PhoneAPI.chatWithAI(messages);
            } catch (err) {
                if (err.message.includes('content must be a string') || err.message.includes('cache_control') || (hasImage && err.message.includes('INVALID_ARGUMENT'))) {
                    messages[0].content = stablePrompt + dynamicPrompt;
                    messages = messages.map(m => { if (Array.isArray(m.content)) return { role: m.role, content: "[用户发送了一张图片，但系统无法解析]" }; return m; });
                    rawReply = await PhoneAPI.chatWithAI(messages);
                } else { throw err; }
            }

            let memoryRegex = /<write_memory(.*?)>([\s\S]*?)<\/write_memory>/gi;
            let memMatch;
            while ((memMatch = memoryRegex.exec(rawReply)) !== null) {
                const attrs = memMatch[1]; const content = memMatch[2].trim();
                let type = 'daily'; let title = ''; let importance = 5;
                const typeMatch = attrs.match(/type="([^"]+)"/i); if (typeMatch) type = typeMatch[1];
                const titleMatch = attrs.match(/title="([^"]+)"/i); if (titleMatch) title = titleMatch[1];
                const impMatch = attrs.match(/importance="([^"]+)"/i); if (impMatch) importance = parseInt(impMatch[1]) || 5;
                window.PhoneAPI?.EchoVault?.write(content, type, importance, '线上微信', title);
                if (window.Config?.currentAppId === 'memory_vault' && window.PhoneUI?.renderMemoryVault) window.PhoneUI.renderMemoryVault();
            }
            rawReply = rawReply.replace(/<write_memory[\s\S]*?<\/write_memory>/gi, '').trim();

            let updateRegex = /<update_memory(.*?)>([\s\S]*?)<\/update_memory>/gi;
            let upMatch;
            while ((upMatch = updateRegex.exec(rawReply)) !== null) {
                const attrs = upMatch[1]; const content = upMatch[2].trim();
                const keyMatch = attrs.match(/key="([^"]+)"/i);
                if (keyMatch && content) {
                    window.PhoneAPI?.EchoVault?.updateMemory(keyMatch[1], content);
                    if (window.Config?.currentAppId === 'memory_vault' && window.PhoneUI?.renderMemoryVault) window.PhoneUI.renderMemoryVault();
                }
            }
            rawReply = rawReply.replace(/<update_memory[\s\S]*?<\/update_memory>/gi, '').trim();

            let deleteRegex = /<delete_memory(.*?)>([\s\S]*?)<\/delete_memory>|<delete_memory(.*?)\/>/gi;
            let delMatch;
            while ((delMatch = deleteRegex.exec(rawReply)) !== null) {
                const attrs = delMatch[1] || delMatch[3];
                const keyMatch = attrs.match(/key="([^"]+)"/i);
                if (keyMatch) {
                    window.PhoneAPI?.EchoVault?.deleteMemory(keyMatch[1]);
                    if (window.Config?.currentAppId === 'memory_vault' && window.PhoneUI?.renderMemoryVault) window.PhoneUI.renderMemoryVault();
                }
            }
            rawReply = rawReply.replace(/<delete_memory[\s\S]*?<\/delete_memory>/gi, '').replace(/<delete_memory[\s\S]*?\/>/gi, '').trim();

            let musicQuery = null;
            const musicMatch = rawReply.match(/<play_music>([\s\S]*?)<\/play_music>/i);
            if (musicMatch) { musicQuery = musicMatch[1].trim(); rawReply = rawReply.replace(/<play_music>[\s\S]*?<\/play_music>/gi, '').trim(); }

            let photoPrompt = null;
            const photoMatch = rawReply.match(/<photo>([\s\S]*?)<\/photo>/i);
            if (photoMatch) { photoPrompt = photoMatch[1].trim(); rawReply = rawReply.replace(/<photo>[\s\S]*?<\/photo>/gi, '').trim(); }

            const innerMatch = rawReply.match(/<inner>([\s\S]*?)<\/inner>/i);
            const innerThought = innerMatch ? innerMatch[1].trim() : "（TA的心思藏得很深，什么也没看出来...）";

            let finalReply = rawReply.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<inner>[\s\S]*?<\/inner>/gi, '').trim();
            if (!finalReply) finalReply = rawReply.trim();

            chatItems.pop();

            const replyParts = finalReply.split('\n').map(s => s.trim()).filter(s => s.length > 0);
            replyParts.forEach((part, idx) => {
                let thought = (idx === 0) ? innerThought : "（连发消息，心声已在上一条显示）";
                chatItems.push({ sender: 'other', content: part, time: timeStr, date: dateStr, innerThought: thought });
            });

            PhoneUI.renderAppContent('wechat');
            localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));

            if (musicQuery) {
                setTimeout(async () => {
                    const song = await window.PhoneAPI?.searchMusic(musicQuery);
                    if (song) { window.PhoneUI?.playMusic(song, true); window.PhoneAPI?.showToast(`🎶 TA 为你点播了: ${song.name}`); }
                }, 500);
            }

            if (photoPrompt) {
                chatItems.push({ sender: 'typing' }); PhoneUI.renderAppContent('wechat');
                try {
                    PhoneAPI.showToast("📸 他正在拍照，请稍候...");
                    const b64Json = await PhoneAPI.generateImageAPI(photoPrompt);
                    const finalB64 = await PhoneEngine.compressImage(b64Json);
                    chatItems.pop();
                    chatItems.push({ sender: 'other', content: `![图片](${finalB64})`, time: timeStr, date: dateStr, innerThought: "（拍张照给她看看吧...）" });
                    if (!Config.phoneData[roleId].gallery) Config.phoneData[roleId].gallery = { items: [] };
                    Config.phoneData[roleId].gallery.items.push({ id: 'img_' + Date.now(), content: finalB64, date: dateStr });
                    localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
                    PhoneUI.renderAppContent('wechat'); PhoneAPI.showToast("📸 照片已发送并存入相册！");
                } catch (e) { chatItems.pop(); PhoneUI.renderAppContent('wechat'); PhoneAPI.showToast("拍照失败：" + e.message); }
            }

        } catch (error) {
            PhoneAPI.showToast(error.message);
            chatItems.pop(); if (hasNewUserMsg) chatItems.pop();
            PhoneUI.renderAppContent('wechat'); localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
        }
    },

    async sendNovelMessage(isRegen = false) {
        const roleId = Config?.currentContactId;
        if (!Config.phoneData[roleId]) Config.phoneData[roleId] = {};
        if (!Config.phoneData[roleId].novel) Config.phoneData[roleId].novel = { items: [] };
        const chatItems = Config.phoneData[roleId].novel.items;

        let hasNewUserMsg = false; let latestUserText = "";
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

        if (!isRegen) {
            const inputEl = document.getElementById('novel-input');
            if (inputEl) {
                const text = inputEl.value.trim();
                if (text) { chatItems.push({ sender: 'me', content: text, time: timeStr, date: dateStr }); inputEl.value = ''; hasNewUserMsg = true; latestUserText = text; }
            }
        } else {
            for (let i = chatItems.length - 1; i >= 0; i--) { if (chatItems[i].sender === 'me') { latestUserText = chatItems[i].content; break; } }
        }

        if (!isRegen && !hasNewUserMsg && chatItems.length === 0) return;

        chatItems.push({ sender: 'typing', content: '...', time: timeStr });
        PhoneUI.renderNovelContent(); localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));

        try {
            const myName = localStorage.getItem('my_name') || '我';
            const banEmoji = localStorage.getItem('ban_emoji') === 'true';
            const shareMemory = localStorage.getItem('share_memory') === 'true';
            const systemPrompt = localStorage.getItem('system_prompt') || '';
            const charPersona = localStorage.getItem('char_persona') || '';
            const novelStyle = localStorage.getItem('novel_style') || '';

            const currentNow = new Date();
            const curHour = currentNow.getHours(); const curMin = currentNow.getMinutes();
            const weekDays = ['日', '一', '二', '三', '四', '五', '六']; const curWeek = '星期' + weekDays[currentNow.getDay()];
            let timePhase = "深夜";
            if (curHour >= 5 && curHour < 9) timePhase = "清晨"; else if (curHour >= 9 && curHour < 12) timePhase = "上午"; else if (curHour >= 12 && curHour < 14) timePhase = "中午"; else if (curHour >= 14 && curHour < 18) timePhase = "下午"; else if (curHour >= 18 && curHour < 23) timePhase = "晚上";

            let stablePrompt = `【系统时间感知】：当前剧情发生的时间是 ${currentNow.getFullYear()}年${currentNow.getMonth()+1}月${currentNow.getDate()}日 ${curWeek}，${timePhase} ${curHour.toString().padStart(2, '0')}:${curMin.toString().padStart(2, '0')}。请在环境描写或互动中自然地体现出当前的时间氛围。\n\n`;

            if (systemPrompt) stablePrompt += `【系统核心指令】：\n${systemPrompt}\n\n`;
            if (charPersona) stablePrompt += `【角色设定】：\n${charPersona}\n\n`;
            if (novelStyle) stablePrompt += `【文风要求】：\n${novelStyle}\n\n`;

            const minWords = localStorage.getItem('novel_min_words') || '150';

            let formatRule = "【线下沉浸模式】：当前是面对面的真实场景。请用写小说/语C的笔法进行演绎。\n";
            formatRule += `【字数与细节强制要求】：每次回复**必须不少于 ${minWords} 字**（不包含思维链的字数）！请尽情展开环境渲染、细腻的动作刻画和深度的心理描写，让场景充满画面感。绝对禁止像微信聊天那样只发短对话，必须像长篇小说的一段一样丰满！\n`;
            formatRule += "【读心术机制】：在正式回复之前，你必须使用 <inner> 和 </inner> 标签包裹一段角色此刻真实的内心独白。严禁重复心声，必须产生全新心理活动！\n";
            
            formatRule += "【记忆库全自动管理机制】：你拥有一个本地记忆库。你可以通过输出标签来自主管理记忆（必须放在回复最末尾）：\n";
            formatRule += "1. 新增：`<write_memory type=\"daily\" importance=\"1-10\">日记内容</write_memory>` (核心设定用 `type=\"permanent\" title=\"标题\"`)。\n";
            formatRule += "2. 更新/去重：如果发现某条记忆有新进展，或记重复了，使用 `<update_memory key=\"对应记忆的Key\">修改后的完整内容</update_memory>`。\n";
            formatRule += "3. 删除：如果某条记忆完全失效或多余，使用 `<delete_memory key=\"对应记忆的Key\"></delete_memory>`。\n";
            formatRule += "注意：记忆的Key就是记忆档案中方括号里的内容（如 `2023-10-24` 或 `某个标题`）。必须用第一人称带有温度地写！\n";

            formatRule += "【点歌机制】：如果用户在剧情中明确要求你放首歌、听音乐，或者剧情氛围需要，你可以在回复的最末尾加上 `<play_music>歌曲名 歌手名</play_music>`。系统会自动在后台为你们播放。例如：`<play_music>七里香 周杰伦</play_music>`。如果没有相关要求，绝对不要输出此标签！\n";

            if (banEmoji) formatRule += "【最高禁令】：绝对不允许使用任何 Emoji、颜文字、波浪号(~)，违者抹杀！\n";

            const wbData = PhoneAPI.getWorldbookData();
            const activeOfflineWb = wbData.filter(w => w.offline).map(w => w.content).join('\n');
            if (activeOfflineWb) formatRule += `\n【当前生效的世界书/规则插件】：\n${activeOfflineWb}\n`;
            stablePrompt += formatRule;
            stablePrompt += `\n当前正在和你面对面互动的人是：【${myName}】。\n`;

            let dynamicPrompt = "";
            const allVault = PhoneAPI.getMemoryVault();
            let accessibleVault = allVault;
            if (!shareMemory) accessibleVault = allVault.filter(v => v.isCore || v.source === '线下故事');

            if (latestUserText) dynamicPrompt += PhoneEngine._scanKeywords(latestUserText);

            const recentMemories = window.PhoneAPI?.EchoVault?.dream?.() || [];
            if (recentMemories.length > 0) {
                dynamicPrompt += "\n【EchoVault 你的近期记忆】\n这是你最近几天写下的日记（方括号内为该记忆的 Key，可用于更新或删除）：\n" + recentMemories.map(m => `[${m.date}]\n${m.content}`).join("\n\n") + "\n";
            }

            if (accessibleVault.length > 0) {
                const recentVault = accessibleVault.slice(-5).map(v => `[${v.id}] ${v.source}: ${v.content}`).join('\n');
                dynamicPrompt += `\n【长期记忆档案】：以下是你脑海中深刻的长期记忆（方括号内为该记忆的 Key，可用于更新或删除）：\n${recentVault}\n`;

                if (hasNewUserMsg) {
                    const recallTriggers = ['你还记得', '昨天', '上次', '之前', '那个事', '还记得', '那次'];
                    const needsRecall = recallTriggers.some(t => latestUserText.includes(t));
                    if (needsRecall && accessibleVault.length > 5) {
                        const extendedVault = accessibleVault.slice(-20).map(v => `[${v.id}] ${v.source}: ${v.content}`).join('\n');
                        dynamicPrompt += `\n【系统提示(记忆检索触发)】：用户似乎在试图唤醒你的某段记忆。以下是你的扩展记忆库，请检索是否有相关内容，并以你的口吻作出回应：\n${extendedVault}\n`;
                    }
                }
            }

            if (shareMemory) {
                const wechatItems = Config?.phoneData?.[roleId]?.wechat?.items || [];
                if (wechatItems.length > 0) {
                    const recentWechat = wechatItems.slice(-8).map(item => `${item.sender === 'me' ? '我' : 'TA'}: ${item.content}`).join('\n');
                    dynamicPrompt += `\n【跨频道记忆联动】：以下是你们最近在[线上微信]中的聊天记录，请在当前的线下剧情中自然体现出你记得这些对话：\n${recentWechat}\n`;
                }
            }

            let systemContent = [];
            if (stablePrompt) systemContent.push({ type: "text", text: stablePrompt, cache_control: { type: "ephemeral" } });
            if (dynamicPrompt) systemContent.push({ type: "text", text: dynamicPrompt });

            let messages = [{ role: "system", content: systemContent.length > 0 ? systemContent : "You are a helpful assistant." }];

            const MAX_CONTEXT = 60;
            const recentItems = chatItems.slice(-MAX_CONTEXT);

            recentItems.forEach(item => {
                if (item.sender !== 'typing') { messages.push({ role: item.sender === 'me' ? 'user' : 'assistant', content: item.content || "" }); }
            });

            if (!isRegen && !hasNewUserMsg) {
                let lastSender = 'other';
                for (let i = recentItems.length - 1; i >= 0; i--) {
                    if (recentItems[i].sender !== 'typing') {
                        lastSender = recentItems[i].sender;
                        break;
                    }
                }
                if (lastSender !== 'me') {
                    messages.push({ role: "user", content: "【系统强制指令】：我（用户）当前没有任何动作或对话，可能正在安静等待，也可能已经离开了当前场景。请你完全以你的视角，顺着刚才的剧情继续往下描写（比如你接下来的行动、独自一人的状态、或是场景的过渡）。必须严格保持字数底线和小说画面感，不要向我提问，不要等待我回复！" });
                }
            }

            let rawReply = "";
            try {
                rawReply = await PhoneAPI.chatWithAI(messages);
            } catch (err) {
                if (err.message.includes('content must be a string') || err.message.includes('cache_control')) {
                    messages[0].content = stablePrompt + dynamicPrompt;
                    rawReply = await PhoneAPI.chatWithAI(messages);
                } else { throw err; }
            }

            let memoryRegex = /<write_memory(.*?)>([\s\S]*?)<\/write_memory>/gi;
            let memMatch;
            while ((memMatch = memoryRegex.exec(rawReply)) !== null) {
                const attrs = memMatch[1]; const content = memMatch[2].trim();
                let type = 'daily'; let title = ''; let importance = 5;
                const typeMatch = attrs.match(/type="([^"]+)"/i); if (typeMatch) type = typeMatch[1];
                const titleMatch = attrs.match(/title="([^"]+)"/i); if (titleMatch) title = titleMatch[1];
                const impMatch = attrs.match(/importance="([^"]+)"/i); if (impMatch) importance = parseInt(impMatch[1]) || 5;
                window.PhoneAPI?.EchoVault?.write(content, type, importance, '线下故事', title);
                if (window.Config?.currentAppId === 'memory_vault' && window.PhoneUI?.renderMemoryVault) window.PhoneUI.renderMemoryVault();
            }
            rawReply = rawReply.replace(/<write_memory[\s\S]*?<\/write_memory>/gi, '').trim();

            let updateRegex = /<update_memory(.*?)>([\s\S]*?)<\/update_memory>/gi;
            let upMatch;
            while ((upMatch = updateRegex.exec(rawReply)) !== null) {
                const attrs = upMatch[1]; const content = upMatch[2].trim();
                const keyMatch = attrs.match(/key="([^"]+)"/i);
                if (keyMatch && content) {
                    window.PhoneAPI?.EchoVault?.updateMemory(keyMatch[1], content);
                    if (window.Config?.currentAppId === 'memory_vault' && window.PhoneUI?.renderMemoryVault) window.PhoneUI.renderMemoryVault();
                }
            }
            rawReply = rawReply.replace(/<update_memory[\s\S]*?<\/update_memory>/gi, '').trim();

            let deleteRegex = /<delete_memory(.*?)>([\s\S]*?)<\/delete_memory>|<delete_memory(.*?)\/>/gi;
            let delMatch;
            while ((delMatch = deleteRegex.exec(rawReply)) !== null) {
                const attrs = delMatch[1] || delMatch[3];
                const keyMatch = attrs.match(/key="([^"]+)"/i);
                if (keyMatch) {
                    window.PhoneAPI?.EchoVault?.deleteMemory(keyMatch[1]);
                    if (window.Config?.currentAppId === 'memory_vault' && window.PhoneUI?.renderMemoryVault) window.PhoneUI.renderMemoryVault();
                }
            }
            rawReply = rawReply.replace(/<delete_memory[\s\S]*?<\/delete_memory>/gi, '').replace(/<delete_memory[\s\S]*?\/>/gi, '').trim();

            let musicQuery = null;
            const musicMatch = rawReply.match(/<play_music>([\s\S]*?)<\/play_music>/i);
            if (musicMatch) { musicQuery = musicMatch[1].trim(); rawReply = rawReply.replace(/<play_music>[\s\S]*?<\/play_music>/gi, '').trim(); }

            const innerMatch = rawReply.match(/<inner>([\s\S]*?)<\/inner>/i);
            const innerThought = innerMatch ? innerMatch[1].trim() : "（TA的心思藏得很深，什么也没看出来...）";

            let finalReply = rawReply.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<inner>[\s\S]*?<\/inner>/gi, '').trim();
            if (!finalReply) finalReply = rawReply.trim();

            chatItems.pop();
            chatItems.push({ sender: 'other', content: finalReply, time: timeStr, date: dateStr, innerThought: innerThought });

            PhoneUI.renderNovelContent();
            localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));

            if (musicQuery) {
                setTimeout(async () => {
                    const song = await window.PhoneAPI?.searchMusic(musicQuery);
                    if (song) { window.PhoneUI?.playMusic(song, true); window.PhoneAPI?.showToast(`🎶 TA 为你点播了: ${song.name}`); }
                }, 500);
            }

        } catch (error) {
            PhoneAPI.showToast(error.message);
            chatItems.pop(); if (hasNewUserMsg) chatItems.pop();
            PhoneUI.renderNovelContent(); localStorage.setItem('phone_data', JSON.stringify(Config.phoneData));
        }
    },

    async generateDiary(dateStr) {
        const contentAreaEl = document.getElementById('diary-content-area');
        if (!contentAreaEl) return;

        contentAreaEl.innerHTML = `<div class="notebook-empty"><i class="ph-fill ph-spinner spin-anim" style="font-size: 48px; color: rgba(0,0,0,0.5); margin-bottom: 15px;"></i><p>正在偷看他的内心世界...</p></div>`;

        try {
            const roleId = Config?.currentContactId;
            const wechatItems = (Config?.phoneData?.[roleId]?.wechat?.items || []).filter(i => i.date === dateStr).map(i => ({ ...i, source: '线上微信' }));
            const novelItems = (Config?.phoneData?.[roleId]?.novel?.items || []).filter(i => i.date === dateStr).map(i => ({ ...i, source: '线下故事' }));

            let combinedItems = [...wechatItems, ...novelItems];
            combinedItems.sort((a, b) => (a.time || "").localeCompare(b.time || ""));

            const recentItems = combinedItems.slice(-80);
            let historyText = recentItems.map(item => `[${item.source}] ${item.time || ''} ${item.sender === 'me' ? '我' : 'TA'}: ${item.content}`).join('\n');
            if (!historyText) historyText = "(今天你们没有聊天或互动，请根据你的人设，写一篇平淡但符合你性格的日常日记。)";

            const systemPrompt = localStorage.getItem('system_prompt') || '';
            const charPersona = localStorage.getItem('char_persona') || '';
            let contextSetup = "";
            if (systemPrompt) contextSetup += `【系统核心指令】：\n${systemPrompt}\n\n`;
            if (charPersona) contextSetup += `【角色设定】：\n${charPersona}\n\n`;

            let stablePrompt = `你现在完全进入角色。以下是你的底层设定：\n${contextSetup}`;
            let dynamicPrompt = `【重要时间设定】：今天是 ${dateStr}。
请根据以下你和“我”在【今天的实际聊天与互动记录】，用【第一人称（你的视角）】写一篇今天的深夜日记。
要求：
1. 字数在 150-300 字之间。
2. 绝对符合你的人设（比如傲娇、毒舌、表面嫌弃实际在意等）。
3. 必须是一篇真实的日记，不要提及“AI”、“用户”等词汇。
4. 综合线上线下的事情来写，让日记显得连贯真实。
【最高禁令】：绝对禁止输出任何分析过程、思考步骤、任务拆解！不要出现“分析任务”、“思考”等字眼！直接以日记的正文开头！

今天的互动记录：
${historyText}`;

            let messages = [{ role: "user", content: [ { type: "text", text: stablePrompt, cache_control: { type: "ephemeral" } }, { type: "text", text: dynamicPrompt } ] }];

            let reply = "";
            try {
                reply = await PhoneAPI.chatWithAI(messages);
            } catch (err) {
                if (err.message.includes('content must be a string') || err.message.includes('cache_control')) {
                    messages = [{ role: "user", content: stablePrompt + "\n" + dynamicPrompt }];
                    reply = await PhoneAPI.chatWithAI(messages);
                } else { throw err; }
            }

            let finalDiary = reply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim().replace(/```.*?/g, '').replace(/```/g, '').trim();

            PhoneAPI.saveDiary(dateStr, finalDiary);
            window.PhoneAPI?.EchoVault?.write(finalDiary, 'daily', 5, '偷看日记');

            PhoneUI.renderDiaryPage();
            PhoneAPI.showToast('✨ 日记生成成功，已同步至 EchoVault！');

        } catch (error) {
            contentAreaEl.innerHTML = `<div class="notebook-empty"><i class="ph-fill ph-warning-circle" style="font-size: 48px; color: var(--danger-color); margin-bottom: 15px;"></i><p style="color: var(--danger-color);">偷看失败：${error.message}</p><button class="btn-refresh" onclick="window.PhoneUI.renderDiaryPage()" style="width: auto; padding: 10px 20px; margin-top: 15px;">返回重试</button></div>`;
        }
    },

    /* ==========================================
       🌟 共读时光 (SyncRead) 书架与晋江段评引擎 
       ========================================== */

    _proactiveTimer: null,
    _activeThreadCommentId: null,

    // 1. 导入 TXT 文件 (支持多本，存入书架，自动识别 GBK)
    importBook(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const title = file.name.replace('.txt', '');
        const bookId = 'book_' + Date.now();
        const headerTitle = document.getElementById('reader-header-title');
        if (headerTitle) headerTitle.innerText = "解析中...";
        PhoneAPI.showToast("📚 正在解析并存入书架...");
        
        const processText = async (text) => {
            try {
                const blob = new Blob([text], { type: 'text/plain' });
                await window.PhoneAPI.LocalDB.set(bookId, blob);
                
                let bookshelf = JSON.parse(localStorage.getItem('reader_bookshelf') || '[]');
                bookshelf.push({
                    id: bookId,
                    title: title,
                    offsets: [0],
                    currentIndex: 0,
                    lastRead: Date.now()
                });
                localStorage.setItem('reader_bookshelf', JSON.stringify(bookshelf));
                
                PhoneAPI.showToast("✅ 导入成功！");
                PhoneEngine.renderBookshelf(); 
            } catch(err) {
                PhoneAPI.showToast("⚠️ 导入失败：" + err.message);
            }
        };

        const reader = new FileReader();
        reader.onload = (e) => {
            let text = e.target.result;
            if (text.indexOf('\uFFFD') !== -1 && text.indexOf('\uFFFD') < 1000) {
                const readerGBK = new FileReader();
                readerGBK.onload = (e2) => { processText(e2.target.result); };
                readerGBK.readAsText(file, 'gbk'); 
            } else {
                processText(text); 
            }
        };
        reader.readAsText(file, 'utf-8'); 
        event.target.value = '';
    },

    // 2. 渲染书架
    renderBookshelf() {
        const listEl = document.getElementById('bookshelf-list');
        if (!listEl) return;
        
        const headerTitle = document.getElementById('reader-header-title');
        if (headerTitle) headerTitle.innerText = "共读书架";
        
        const bookshelf = JSON.parse(localStorage.getItem('reader_bookshelf') || '[]').sort((a, b) => b.lastRead - a.lastRead);
        
        let html = `
            <div class="book-wrap" onclick="window.PhoneEngine.openNotebook()">
                <div class="book-cover-3d notebook-special">
                    <div style="display:flex; flex-direction:column; align-items:center;">
                        <i class="ph-fill ph-bookmarks" style="font-size: 24px; margin-bottom: 8px;"></i>
                        我的摘录本
                    </div>
                </div>
                <div class="book-title-ui" style="color: var(--primary-color);">高光与吐槽</div>
            </div>
        `;

        if (bookshelf.length === 0) {
            html += `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-sub); margin-top: 50px;"><i class="ph-fill ph-books" style="font-size: 48px; margin-bottom: 10px;"></i><br>书架空空如也，点击右上角导入小说</div>`;
        } else {
            bookshelf.forEach(book => {
                const progress = book.offsets && book.offsets.length > 1 ? `已读 ${book.currentIndex + 1} 页` : '未读';
                html += `
                <div class="book-wrap" onclick="window.PhoneEngine.openBook('${book.id}')">
                    <div class="book-del-btn" onclick="event.stopPropagation(); window.PhoneEngine.deleteBook('${book.id}')"><i class="ph ph-x"></i></div>
                    <div class="book-cover-3d">
                        ${PhoneEngine.escapeHtml(book.title).substring(0, 8)}
                    </div>
                    <div class="book-title-ui">${PhoneEngine.escapeHtml(book.title)}</div>
                    <div class="book-progress-ui">${progress}</div>
                </div>`;
            });
        }
        listEl.innerHTML = html;
    },

    // 打开摘录本 (解锁滑动)
    openNotebook() {
        if (window.PhoneUI && window.PhoneUI.showReadingView) {
            window.PhoneUI.showReadingView("我的摘录本");
        }
        const footer = document.getElementById('reader-footer');
        if (footer) footer.style.display = 'none'; 
        const readingView = document.getElementById('reader-reading-view');
        if (readingView) readingView.style.overflowY = 'auto'; 
        
        const container = document.getElementById('reader-page-container');
        if (!container) return;
        const notebook = JSON.parse(localStorage.getItem('reader_notebook') || '[]');
        const charName = localStorage.getItem('char_name') || 'TA';
        
        if (notebook.length === 0) {
            container.innerHTML = `<div style="text-align:center; margin-top:100px; color:var(--text-sub);"><i class="ph-fill ph-highlighter-circle" style="font-size:48px; margin-bottom:10px;"></i><br>还没有划线摘录哦~</div>`;
            return;
        }
        
        let html = '<div style="padding-bottom: 40px;">';
        [...notebook].reverse().forEach(item => {
            if (item.type === 'highlight') {
                html += `<div style="margin-bottom: 20px; padding: 15px; background: var(--card-bg); border-radius: 14px; border: 1px solid var(--border-color); box-shadow: 0 4px 15px rgba(0,0,0,0.05);"><div style="font-size:12px; color:var(--text-sub); font-weight:bold; margin-bottom:8px;">《${PhoneEngine.escapeHtml(item.bookTitle)}》</div><span class="highlight-text" style="font-size: 16px; line-height: 1.6;">${PhoneEngine.escapeHtml(item.quote)}</span></div>`;
            } else {
                let threadHtml = '';
                if (Array.isArray(item.thread)) {
                    item.thread.forEach(msg => {
                        const isTa = msg.sender === 'ta';
                        threadHtml += `<div style="margin-top:6px; font-size:13px; line-height:1.5; color:${isTa ? 'var(--primary-color)' : 'var(--text-main)'};"><b>${isTa ? charName : '我'}：</b>${PhoneEngine.escapeHtml(msg.text)}</div>`;
                    });
                } else {
                    threadHtml = `<div style="margin-top:6px; font-size:13px; line-height:1.5; color:var(--primary-color);"><b>${charName}：</b>${PhoneEngine.escapeHtml(item.comment || '')}</div>`;
                }
                html += `<div style="margin-bottom: 20px; padding: 15px; background: var(--card-bg); border-radius: 14px; border: 1px solid var(--border-color); box-shadow: 0 4px 15px rgba(0,0,0,0.05);"><div style="font-size:12px; color:var(--text-sub); font-weight:bold; margin-bottom:8px;">《${PhoneEngine.escapeHtml(item.bookTitle)}》</div><span class="highlight-text" style="font-size: 15px; line-height: 1.6;">${PhoneEngine.escapeHtml(item.quote)}</span><div style="margin-top:10px; padding-top:10px; border-top:1px dashed var(--border-color);">${threadHtml}</div></div>`;
            }
        });
        html += '</div>';
        container.innerHTML = html;
        
        clearTimeout(PhoneEngine._proactiveTimer);
    },

    // 3. 打开指定书籍
    async openBook(bookId) {
        const bookshelf = JSON.parse(localStorage.getItem('reader_bookshelf') || '[]');
        const book = bookshelf.find(b => b.id === bookId);
        if (!book) return;
        
        PhoneAPI.showToast("📖 正在打开书本...");
        try {
            const blob = await window.PhoneAPI.LocalDB.get(bookId);
            if (!blob) throw new Error("找不到书籍正文文件");
            const text = await blob.text();
            
            book.lastRead = Date.now();
            localStorage.setItem('reader_bookshelf', JSON.stringify(bookshelf));
            
            if (!window.Config) window.Config = {};
            window.Config.readerConfig = {
                id: book.id,
                title: book.title,
                text: text,
                offsets: book.offsets || [0],
                currentIndex: book.currentIndex || 0
            };
            
            if (window.PhoneUI && window.PhoneUI.showReadingView) {
                window.PhoneUI.showReadingView(book.title);
            }
            const readingView = document.getElementById('reader-reading-view');
            if (readingView) readingView.style.overflowY = 'hidden'; 
            PhoneEngine.renderCurrentPage();
        } catch(e) {
            PhoneAPI.showToast("打开失败：" + e.message);
        }
    },

    // 4. 删除书籍
    deleteBook(bookId) {
        if (!confirm("确定要从书架移除这本书吗？相关的段评和进度也会被删除！")) return;
        
        let bookshelf = JSON.parse(localStorage.getItem('reader_bookshelf') || '[]');
        bookshelf = bookshelf.filter(b => b.id !== bookId);
        localStorage.setItem('reader_bookshelf', JSON.stringify(bookshelf));
        
        localStorage.removeItem(`book_comments_${bookId}`);
        localStorage.removeItem(`book_highlights_${bookId}`);
        if (window.PhoneAPI && window.PhoneAPI.LocalDB) {
            window.PhoneAPI.LocalDB.delete(bookId);
        }
        PhoneEngine.renderBookshelf();
    },

    // 5. 核心：二分法惰性切页 (晋江风极轻量计算，只带小徽标)
    calculatePageEnd(text, startOffset, bookId) {
        const measureDiv = document.createElement('div');
        measureDiv.style.cssText = 'position:absolute; visibility:hidden; width:calc(100% - 40px); padding: 0; font-size:18px; line-height:1.8; text-align:justify; word-break:break-word; z-index:-100; top:0; left:0;';
        document.body.appendChild(measureDiv);
        
        const container = document.getElementById('reader-content-area') || document.getElementById('reader-reading-view');
        const maxHeight = container && container.clientHeight > 100 ? container.clientHeight - 100 : window.innerHeight - 180;
        
        const maxChars = Math.min(1200, text.length - startOffset);
        let low = 1; let high = maxChars; let best = low;
        
        const formatForMeasure = (str) => {
            const comments = JSON.parse(localStorage.getItem(`book_comments_${bookId}`) || '[]');
            const highlights = JSON.parse(localStorage.getItem(`book_highlights_${bookId}`) || '[]');
            let paragraphs = str.split('\n').filter(p => p.trim());
            return paragraphs.map(p => {
                let pText = p;
                highlights.forEach(h => {
                    if (pText.includes(h)) pText = pText.replace(h, `<span class="highlight-text">${h}</span>`);
                });
                comments.forEach(c => {
                    if (pText.includes(c.quote)) {
                        pText = pText.replace(c.quote, `<span class="highlight-text">${c.quote}</span>`) + `<span class="comment-badge"><i class="ph-fill ph-chat-circle-dots"></i> 1</span>`;
                    }
                });
                return `<p style="margin-bottom: 1em; text-indent: 2em;">${pText}</p>`;
            }).join('');
        };

        while (low <= high) {
            let mid = Math.floor((low + high) / 2);
            let testStr = text.substring(startOffset, startOffset + mid);
            measureDiv.innerHTML = formatForMeasure(testStr);
            
            if (measureDiv.clientHeight <= maxHeight) {
                best = mid; low = mid + 1;
            } else { high = mid - 1; }
        }
        document.body.removeChild(measureDiv);
        
        let finalOffset = startOffset + best;
        if (finalOffset < text.length) {
            const punctuations = ['。', '！', '？', '”', '…', '，', '、', '\n', '”'];
            for (let i = 0; i < 50; i++) {
                let char = text.charAt(finalOffset - i - 1);
                if (punctuations.includes(char)) { finalOffset = finalOffset - i; break; }
            }
        }
        return finalOffset;
    },

    // 6. 渲染当前页 (晋江风段评小气泡渲染)
    renderCurrentPage() {
        clearTimeout(PhoneEngine._proactiveTimer); 
        
        const config = window.Config?.readerConfig;
        if (!config || !config.text) return;
        
        const pageContainer = document.getElementById('reader-page-container');
        if (!pageContainer) return;
        
        if (config.currentIndex < 0) config.currentIndex = 0;
        
        let startOffset = config.offsets[config.currentIndex];
        
        if (config.currentIndex === config.offsets.length - 1 && startOffset < config.text.length) {
            const nextOffset = PhoneEngine.calculatePageEnd(config.text, startOffset, config.id);
            if (nextOffset > startOffset) {
                config.offsets.push(nextOffset);
                PhoneEngine._saveBookProgress(config);
            }
        }
        
        const endOffset = config.offsets[config.currentIndex + 1] || config.text.length;
        const pageText = config.text.substring(startOffset, endOffset);
        
        const comments = JSON.parse(localStorage.getItem(`book_comments_${config.id}`) || '[]');
        const highlights = JSON.parse(localStorage.getItem(`book_highlights_${config.id}`) || '[]');
        let html = '';
        
        pageText.split('\n').filter(p => p.trim()).forEach(p => {
            let pText = p;
            let matchedComments = [];
            
            highlights.forEach(h => {
                if (pText.includes(h)) pText = pText.replace(h, `<span class="highlight-text">${h}</span>`);
            });
            
            comments.forEach(c => {
                if (pText.includes(c.quote)) {
                    pText = pText.replace(c.quote, `<span class="highlight-text">${c.quote}</span>`);
                    matchedComments.push(c);
                }
            });
            
            let badgesHtml = '';
            matchedComments.forEach(c => {
                const count = (c.thread && c.thread.length) || 1;
                badgesHtml += `<span class="comment-badge" onclick="event.stopPropagation(); window.PhoneEngine.openThreadDrawer('${c.id}')"><i class="ph-fill ph-chat-circle-dots"></i> ${count}</span>`;
            });
            
            html += `<p style="margin-bottom: 1em; text-indent: 2em; position: relative;">${pText}${badgesHtml}</p>`;
        });
        
        pageContainer.innerHTML = html;
        
        const progress = Math.min(100, Math.round((endOffset / config.text.length) * 100));
        const progressEl = document.getElementById('reader-progress');
        if (progressEl) progressEl.innerText = `已读 ${progress}%`;
        PhoneEngine._saveBookProgress(config);
        
        const menu = document.getElementById('highlight-menu');
        const bubble = document.getElementById('companion-bubble');
        if (menu) menu.style.display = 'none';
        if (bubble) { bubble.style.opacity = '0'; bubble.style.transform = 'translateY(20px)'; }
        
        PhoneEngine._proactiveTimer = setTimeout(() => {
            PhoneEngine._triggerProactiveCompanion();
        }, 10000);
    },

    _saveBookProgress(config) {
        let bookshelf = JSON.parse(localStorage.getItem('reader_bookshelf') || '[]');
        const idx = bookshelf.findIndex(b => b.id === config.id);
        if (idx !== -1) {
            bookshelf[idx].offsets = config.offsets;
            bookshelf[idx].currentIndex = config.currentIndex;
            localStorage.setItem('reader_bookshelf', JSON.stringify(bookshelf));
        }
    },

    prevPage() {
        if (!window.Config?.readerConfig) return;
        if (window.Config.readerConfig.currentIndex > 0) {
            window.Config.readerConfig.currentIndex--;
            PhoneEngine.renderCurrentPage();
        } else { PhoneAPI.showToast("已经是第一页啦"); }
    },
    
    nextPage() {
        if (!window.Config?.readerConfig) return;
        const config = window.Config.readerConfig;
        const currentEndOffset = config.offsets[config.currentIndex + 1] || config.text.length;
        if (currentEndOffset < config.text.length) {
            config.currentIndex++;
            PhoneEngine.renderCurrentPage();
        } else { PhoneAPI.showToast("全书完！"); }
    },

    _saveToNotebook(bookTitle, quote, comment, type, thread = null) {
        let notebook = JSON.parse(localStorage.getItem('reader_notebook') || '[]');
        notebook.push({ bookTitle, quote, comment, type, thread, date: Date.now() });
        localStorage.setItem('reader_notebook', JSON.stringify(notebook));
    },

    // 7. 划线收藏 (纯高亮)
    saveHighlight() {
        const selection = window.getSelection();
        let text = selection.toString().trim();
        if (!text) return;
        
        text = text.split('\n')[0].trim();
        if(text.length > 60) text = text.substring(0, 60); 
        
        const menu = document.getElementById('highlight-menu');
        if (menu) menu.style.display = 'none';
        selection.removeAllRanges(); 
        
        const config = window.Config?.readerConfig;
        if(!config) return;
        
        let highlights = JSON.parse(localStorage.getItem(`book_highlights_${config.id}`) || '[]');
        if (!highlights.includes(text)) {
            highlights.push(text);
            localStorage.setItem(`book_highlights_${config.id}`, JSON.stringify(highlights));
            PhoneEngine._saveToNotebook(config.title, text, '', 'highlight');
            PhoneAPI.showToast("🖍️ 已划线并收录至摘录本！");
            PhoneEngine.renderCurrentPage(); 
        }
    },

    // 8. 划线讨论 (初始化段评帖 + 显式 Prompt Caching)
    async discussHighlight() {
        const selection = window.getSelection();
        let text = selection.toString().trim();
        if (!text) return;
        
        text = text.split('\n')[0].trim();
        if(text.length > 60) text = text.substring(0, 60); 
        
        const menu = document.getElementById('highlight-menu');
        if (menu) menu.style.display = 'none';
        selection.removeAllRanges(); 
        
        const bubble = document.getElementById('companion-bubble');
        const bubbleText = document.getElementById('companion-bubble-text');
        const companionName = document.getElementById('companion-name');
        if (!bubble || !bubbleText || !companionName) return;
        
        const charName = localStorage.getItem('char_name') || 'TA';
        companionName.innerText = charName;
        bubbleText.innerHTML = '<i class="ph-fill ph-spinner spin-anim"></i> 正在思考...';
        
        bubble.style.opacity = '1';
        bubble.style.transform = 'translateY(0)';
        
        const config = window.Config?.readerConfig;
        if(!config) return;
        
        try {
            const persona = localStorage.getItem('char_persona') || '';
            const myName = localStorage.getItem('my_name') || '我';
            
            const stablePrompt = `你扮演${charName}。以下是你的核心人设：\n${persona}\n\n【系统指令】：你和${myName}正在一起看小说《${config.title}》。`;
            const dynamicPrompt = `就像你正趴在${myName}肩膀上一起看书，在TA耳边轻声说话。必须非常简短，在 20-50 字以内。绝对不要输出任何动作描写、表情符号（Emoji），直接说出你的台词！`;
            
            let systemContent = [
                { type: "text", text: stablePrompt, cache_control: { type: "ephemeral" } },
                { type: "text", text: dynamicPrompt }
            ];

            let messages = [
                { role: "system", content: systemContent },
                { role: "user", content: `${myName}对书里的这段话很感兴趣，划了重点：\n“${text}”\n\n请针对这句话给出你的反应或吐槽。` }
            ];

            let rawReply = "";
            try {
                rawReply = await PhoneAPI.chatWithAI(messages);
            } catch (err) {
                if (err.message.includes('content must be a string') || err.message.includes('cache_control')) {
                    messages[0].content = stablePrompt + "\n" + dynamicPrompt;
                    rawReply = await PhoneAPI.chatWithAI(messages);
                } else { throw err; }
            }

            const finalReply = rawReply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
            bubbleText.innerText = finalReply;
            
            if (window.PhoneAPI && window.PhoneAPI.EchoVault) {
                const memoryContent = `我们在看《${config.title}》时，看到“${text}”这句话，我说道：“${finalReply}”`;
                window.PhoneAPI.EchoVault.write(memoryContent, 'daily', 6, `共读时光`, text.substring(0, 10));
            }
            
            const commentId = 'c_' + Date.now();
            let comments = JSON.parse(localStorage.getItem(`book_comments_${config.id}`) || '[]');
            comments.push({
                id: commentId,
                quote: text,
                comment: finalReply,
                thread: [
                    { sender: 'ta', text: finalReply, time: Date.now() }
                ]
            });
            localStorage.setItem(`book_comments_${config.id}`, JSON.stringify(comments));
            
            PhoneEngine._saveToNotebook(config.title, text, finalReply, 'comment', [{ sender: 'ta', text: finalReply }]);
            
            PhoneEngine.renderCurrentPage();
            
            setTimeout(() => {
                bubble.style.opacity = '0';
                bubble.style.transform = 'translateY(20px)';
            }, 6000);
            
        } catch(e) {
            bubbleText.innerText = "“唔……有点走神了，没看清。”";
            setTimeout(() => {
                bubble.style.opacity = '0';
                bubble.style.transform = 'translateY(20px)';
            }, 3000);
        }
    },

    // 9. 晋江段评抽屉：打开与渲染多轮盖楼
    openThreadDrawer(commentId) {
        const config = window.Config?.readerConfig;
        if (!config) return;
        
        let comments = JSON.parse(localStorage.getItem(`book_comments_${config.id}`) || '[]');
        const target = comments.find(c => c.id === commentId);
        if (!target) return;
        
        PhoneEngine._activeThreadCommentId = commentId;
        
        const drawerBg = document.getElementById('para-drawer-bg');
        const drawer = document.getElementById('para-comment-drawer');
        const quoteBox = document.getElementById('para-drawer-quote');
        
        if (quoteBox) quoteBox.innerText = `“${target.quote}”`;
        PhoneEngine.renderThreadChat(target);
        
        if (drawerBg) drawerBg.classList.add('show');
        if (drawer) drawer.classList.add('open');
    },

    closeThreadDrawer() {
        const drawerBg = document.getElementById('para-drawer-bg');
        const drawer = document.getElementById('para-comment-drawer');
        if (drawerBg) drawerBg.classList.remove('show');
        if (drawer) drawer.classList.remove('open');
        PhoneEngine._activeThreadCommentId = null;
    },

    renderThreadChat(commentObj) {
        const chatList = document.getElementById('para-drawer-chat');
        if (!chatList) return;
        
        const charName = localStorage.getItem('char_name') || 'TA';
        const myName = localStorage.getItem('my_name') || '我';
        const thread = commentObj.thread || [{ sender: 'ta', text: commentObj.comment }];
        
        let html = '';
        thread.forEach(msg => {
            const isMe = msg.sender === 'me';
            const name = isMe ? myName : charName;
            const align = isMe ? 'flex-end' : 'flex-start';
            const bubbleBg = isMe ? 'linear-gradient(135deg, #9dccff, #6fa8dc)' : 'var(--card-bg)';
            const textColor = isMe ? '#fff' : 'var(--text-main)';
            
            html += `
                <div style="display:flex; flex-direction:column; align-items:${align}; max-width:85%; align-self:${align};">
                    <span style="font-size:11px; color:var(--text-sub); margin-bottom:4px;">${name}</span>
                    <div style="background:${bubbleBg}; color:${textColor}; padding:10px 14px; border-radius:16px; font-size:14px; line-height:1.6; word-break:break-word; box-shadow:0 2px 8px rgba(0,0,0,0.06); border:1px solid var(--border-color);">
                        ${PhoneEngine.escapeHtml(msg.text)}
                    </div>
                </div>
            `;
        });
        chatList.innerHTML = html;
        setTimeout(() => { chatList.scrollTop = chatList.scrollHeight; }, 50);
    },

    // 10. 段评抽屉：多轮互动盖楼 (无限追问)
    async sendThreadReply() {
        const input = document.getElementById('para-thread-input');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;
        
        const config = window.Config?.readerConfig;
        if (!config || !PhoneEngine._activeThreadCommentId) return;
        
        let comments = JSON.parse(localStorage.getItem(`book_comments_${config.id}`) || '[]');
        const target = comments.find(c => c.id === PhoneEngine._activeThreadCommentId);
        if (!target) return;
        
        if (!Array.isArray(target.thread)) {
            target.thread = [{ sender: 'ta', text: target.comment }];
        }
        
        target.thread.push({ sender: 'me', text: text, time: Date.now() });
        input.value = '';
        PhoneEngine.renderThreadChat(target);
        
        const chatList = document.getElementById('para-drawer-chat');
        const typingEl = document.createElement('div');
        typingEl.id = 'thread-typing';
        typingEl.style.cssText = 'font-size:12px; color:var(--text-sub); align-self:flex-start; margin-top:5px;';
        typingEl.innerText = `${localStorage.getItem('char_name') || 'TA'} 正在输入...`;
        if (chatList) chatList.appendChild(typingEl);
        
        try {
            const charName = localStorage.getItem('char_name') || 'TA';
            const persona = localStorage.getItem('char_persona') || '';
            const myName = localStorage.getItem('my_name') || '我';
            
            const stablePrompt = `你扮演${charName}。以下是你的核心人设：\n${persona}\n\n【系统指令】：你和${myName}正在看小说《${config.title}》。当前你们针对书中的一段文字展开了双人讨论。\n讨论的段落：“${target.quote}”\n你正在和${myName}进行多轮探讨，就像面对面吐槽一样。20-60字以内，符合人设，绝对不要动作描写和Emoji！`;
            
            let threadHistory = target.thread.map(m => `${m.sender === 'me' ? myName : charName}: ${m.text}`).join('\n');
            
            let systemContent = [
                { type: "text", text: stablePrompt, cache_control: { type: "ephemeral" } },
                { type: "text", text: "请针对上下文顺着话题回复用户。" }
            ];

            let messages = [
                { role: "system", content: systemContent },
                { role: "user", content: `以下是你们的讨论历史：\n${threadHistory}\n\n请回复${myName}最后说的话。` }
            ];

            let rawReply = "";
            try {
                rawReply = await PhoneAPI.chatWithAI(messages);
            } catch (err) {
                if (err.message.includes('content must be a string') || err.message.includes('cache_control')) {
                    messages[0].content = stablePrompt + "\n请针对上下文顺着话题回复用户。";
                    rawReply = await PhoneAPI.chatWithAI(messages);
                } else { throw err; }
            }

            const finalReply = rawReply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
            
            target.thread.push({ sender: 'ta', text: finalReply, time: Date.now() });
            localStorage.setItem(`book_comments_${config.id}`, JSON.stringify(comments));
            
            if (window.PhoneAPI && window.PhoneAPI.EchoVault) {
                const threadSummary = `在看《${config.title}》关于“${target.quote.substring(0, 15)}...”这段时，我们多轮讨论：${text} -> 他说：“${finalReply}”`;
                window.PhoneAPI.EchoVault.write(threadSummary, 'daily', 5, '共读段评', target.quote.substring(0, 10));
            }
            
            const tEl = document.getElementById('thread-typing');
            if (tEl) tEl.remove();
            
            PhoneEngine.renderThreadChat(target);
            PhoneEngine.renderCurrentPage(); 
            
        } catch(e) {
            const tEl = document.getElementById('thread-typing');
            if (tEl) tEl.remove();
            PhoneAPI.showToast("回复失败：" + e.message);
        }
    },

    // 11. 智能主动伴读 (5分钟冷却 + 显式 Prompt Caching)
    async _triggerProactiveCompanion() {
        const lastTime = localStorage.getItem('reader_last_proactive') || 0;
        if (Date.now() - lastTime < 5 * 60 * 1000) return; 

        const config = window.Config?.readerConfig;
        if (!config || !config.text) return;

        const startOffset = config.offsets[config.currentIndex];
        const endOffset = config.offsets[config.currentIndex + 1] || config.text.length;
        let pageText = config.text.substring(startOffset, endOffset).trim();
        
        if (pageText.length < 50) return;
        if (pageText.length > 300) pageText = "..." + pageText.substring(pageText.length - 300); 

        try {
            const charName = localStorage.getItem('char_name') || 'TA';
            const persona = localStorage.getItem('char_persona') || '';
            const myName = localStorage.getItem('my_name') || '我';

            const stablePrompt = `你扮演${charName}。以下是你的核心人设：\n${persona}\n\n【系统指令】：你和${myName}正在一起看小说《${config.title}》。就像你正趴在${myName}肩膀上一起看书，在TA耳边轻声说话。`;
            const dynamicPrompt = `用户目前正在阅读这一页的内容：\n“${pageText}”\n\n【重要判定】：如果这一页有明显的剧情冲突、高潮、槽点、或者有趣的细节，请你给出 20 字以内的简短吐槽。如果这一页只是普通的过渡描写，很平淡无聊，没有什么可吐槽的，请你**直接且仅输出四个大写字母：PASS**。绝对不要多说废话！`;

            let systemContent = [
                { type: "text", text: stablePrompt, cache_control: { type: "ephemeral" } },
                { type: "text", text: dynamicPrompt }
            ];

            let messages = [
                { role: "system", content: systemContent },
                { role: "user", content: "请根据上述规则决定是否吐槽。" }
            ];

            let rawReply = "";
            try {
                rawReply = await PhoneAPI.chatWithAI(messages);
            } catch (err) {
                if (err.message.includes('content must be a string') || err.message.includes('cache_control')) {
                    messages[0].content = stablePrompt + "\n" + dynamicPrompt;
                    rawReply = await PhoneAPI.chatWithAI(messages);
                } else { throw err; }
            }

            const finalReply = rawReply.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

            if (finalReply === 'PASS' || finalReply.includes('PASS')) {
                localStorage.setItem('reader_last_proactive', Date.now());
                return;
            }

            localStorage.setItem('reader_last_proactive', Date.now());
            
            const bubble = document.getElementById('companion-bubble');
            const bubbleText = document.getElementById('companion-bubble-text');
            const companionName = document.getElementById('companion-name');
            if (bubble && bubbleText && companionName) {
                companionName.innerText = charName;
                bubbleText.innerText = finalReply;
                
                bubble.style.opacity = '1';
                bubble.style.transform = 'translateY(0)';
                bubble.style.pointerEvents = 'auto'; 
                
                bubble.onclick = () => {
                    const firstPara = pageText.split('\n').filter(p => p.trim())[0];
                    const quote = firstPara.length > 50 ? firstPara.substring(0, 50) + '...' : firstPara;
                    
                    const commentId = 'c_' + Date.now();
                    let comments = JSON.parse(localStorage.getItem(`book_comments_${config.id}`) || '[]');
                    comments.push({
                        id: commentId,
                        quote: quote,
                        comment: finalReply,
                        thread: [{ sender: 'ta', text: finalReply, time: Date.now() }]
                    });
                    localStorage.setItem(`book_comments_${config.id}`, JSON.stringify(comments));
                    
                    PhoneEngine._saveToNotebook(config.title, quote, finalReply, 'comment', [{ sender: 'ta', text: finalReply }]);
                    PhoneEngine.renderCurrentPage();
                    
                    bubble.style.opacity = '0';
                    bubble.style.transform = 'translateY(20px)';
                    bubble.style.pointerEvents = 'none';
                    PhoneAPI.showToast("✅ 已收录为段评，点击段尾 💬 即可对话！");
                };

                setTimeout(() => {
                    bubble.style.opacity = '0';
                    bubble.style.transform = 'translateY(20px)';
                    bubble.style.pointerEvents = 'none';
                    bubble.onclick = null;
                }, 8000);
            }
        } catch(e) {
            console.error("主动伴读请求失败", e);
        }
    },

    escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }
};

if (typeof window !== 'undefined') { window.PhoneEngine = PhoneEngine; }
