import { Config } from '../phone_config.js';
import { PhoneAPI } from '../phone_api.js';
import { PhoneUI } from '../phone_ui.js';
// 🌟 引入 3D 星海引擎
import { MemorySkyRenderer } from '../../lib/memory-sky/renderer.js';

export const MemoryEngine = {
    skyRenderer: null,

    // 🌟 初始化 3D 星海
    async initSky() {
        if (this.skyRenderer) return; // 避免重复加载

        const container = document.getElementById('starry-sea-bg');
        if (!container) return;

        // 1. 获取真实的记忆数据 (从 EchoVault 获取)
        let evData = { daily: {}, permanent: {} };
        if (window.PhoneAPI && window.PhoneAPI.EchoVault) {
            evData = window.PhoneAPI.EchoVault.getData();
        }
        
        // 2. 转换为 3D 星海需要的节点格式
        const starNodes = [];
        let idCounter = 1;
        
        // 处理日常记忆
        Object.keys(evData.daily).forEach(date => {
            starNodes.push({
                id: idCounter++,
                title: evData.daily[date].tags || '日常回忆',
                date: date,
                content: evData.daily[date].content,
                type: 'diary'
            });
        });

        // 处理锚点记忆
        Object.keys(evData.permanent).forEach(key => {
            starNodes.push({
                id: idCounter++,
                title: key,
                date: evData.permanent[key].created ? evData.permanent[key].created.split('T')[0] : '永久',
                content: evData.permanent[key].content,
                type: 'moment'
            });
        });

        // 如果没有数据，给两个默认的星星占位
        if (starNodes.length === 0) {
            starNodes.push({ id: 1, title: '初次相遇', date: '2023-01-01', content: '我们的故事开始了...', type: 'chat' });
            starNodes.push({ id: 2, title: '星海守望', date: '2024-01-01', content: '等待新的回忆降临...', type: 'moment' });
        }

        // 3. 初始化 3D 引擎
        this.skyRenderer = new MemorySkyRenderer({
            container: container,
            data: starNodes,
            layout: 'galaxy', // 星系布局
            onNodeClick: (nodeData) => {
                // 点击星星时，弹出盲盒 UI 显示具体记忆
                const textEl = document.getElementById('blindbox-text');
                const metaEl = document.getElementById('blindbox-meta');
                if (textEl && metaEl) {
                    let content = nodeData.content.replace(/---/g, '').trim();
                    if (content.length > 100) content = content.substring(0, 100) + '...';
                    textEl.innerText = `“${content}”`;
                    metaEl.innerText = `${nodeData.date} · ${nodeData.title}`;
                }
                const bg = document.getElementById('blindbox-bg');
                const modal = document.getElementById('blindbox-modal');
                if (bg) bg.classList.add('show');
                if (modal) modal.classList.add('show');
            }
        });

        this.skyRenderer.render();
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
        if (window.PhoneEngine && window.PhoneEngine.closeMsgMenu) window.PhoneEngine.closeMsgMenu();
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
